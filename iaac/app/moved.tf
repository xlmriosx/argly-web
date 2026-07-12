moved {
  from = module.web.aws_s3_bucket.bucket
  to   = module.s3.aws_s3_bucket.bucket
}

moved {
  from = module.web.aws_s3_bucket_public_access_block.block
  to   = module.s3.aws_s3_bucket_public_access_block.block
}

moved {
  from = module.web.aws_cloudfront_origin_access_control.oac
  to   = module.cloudfront.aws_cloudfront_origin_access_control.oac
}

moved {
  from = module.web.aws_cloudfront_distribution.cdn
  to   = module.cloudfront.aws_cloudfront_distribution.cdn
}

moved {
  from = module.web.aws_s3_bucket_policy.frontend_bucket_policy
  to   = module.cloudfront.aws_s3_bucket_policy.frontend_bucket_policy
}

moved {
  from = module.web.aws_acm_certificate.web_cert
  to   = module.acm.aws_acm_certificate.cert
}

moved {
  from = module.web.aws_acm_certificate_validation.web_cert_validation
  to   = module.acm.aws_acm_certificate_validation.cert_validation
}
