module "s3" {
  source      = "../modules/s3"
  bucket_name = "argly-web-static"
}

module "acm" {
  source      = "../modules/acm"
  domain_name = "www.argly.com.ar"

  providers = {
    aws.useast1 = aws.useast1
  }
}

module "cloudfront" {
  source             = "../modules/cloudfront"
  project_name       = var.project_name
  custom_domain_name = "www.argly.com.ar"
  
  bucket_id                   = module.s3.bucket_id
  bucket_arn                  = module.s3.bucket_arn
  bucket_regional_domain_name = module.s3.bucket_regional_domain_name
  certificate_arn             = module.acm.certificate_arn
}
