output "cloudfront_domain_name" {
  description = "El valor CNAME que debes poner en tu DNS para www.argly.com.ar"
  value       = module.cloudfront.cloudfront_domain_name
}

output "cert_validation_name" {
  description = "DNS Nombre para validar el certificado ACM de la web"
  value       = module.acm.certificate_validation_name
}

output "cert_validation_value" {
  description = "DNS Valor para validar el certificado ACM de la web"
  value       = module.acm.certificate_validation_value
}
