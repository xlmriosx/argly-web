resource "aws_cloudfront_origin_access_control" "oac" {
  name                              = "${var.project_name}-oac"
  description                       = "OAC for web estatica"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "cdn" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  origin {
    domain_name              = var.bucket_regional_domain_name
    origin_id                = "S3-${var.bucket_id}"
    origin_access_control_id = aws_cloudfront_origin_access_control.oac.id
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${var.bucket_id}"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  restrictions {
    geo_restriction {
      restriction_type = "whitelist"
      locations        = var.latam_countries
    }
  }

  aliases = [var.custom_domain_name]

  viewer_certificate {
    acm_certificate_arn      = var.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}

resource "aws_s3_bucket_policy" "frontend_bucket_policy" {
  bucket = var.bucket_id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = ["s3:GetObject"]
      Effect    = "Allow"
      Resource  = "${var.bucket_arn}/*"
      Principal = { Service = "cloudfront.amazonaws.com" }
      Condition = {
        StringEquals = { "AWS:SourceArn" = aws_cloudfront_distribution.cdn.arn }
      }
    }]
  })
}
