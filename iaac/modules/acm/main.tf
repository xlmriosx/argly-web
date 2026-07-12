resource "aws_acm_certificate" "cert" {
  provider          = aws.useast1
  domain_name       = var.domain_name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_acm_certificate_validation" "cert_validation" {
  provider        = aws.useast1
  certificate_arn = aws_acm_certificate.cert.arn
}
