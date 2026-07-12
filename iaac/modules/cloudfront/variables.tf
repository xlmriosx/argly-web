variable "project_name" { type = string }
variable "latam_countries" {
  type    = list(string)
  default = ["AR", "BO", "BR", "CL", "CO", "CR", "CU", "DO", "EC", "SV", "GT", "HT", "HN", "MX", "NI", "PA", "PY", "PE", "UY", "VE", "PR"]
}
variable "custom_domain_name" { type = string }

variable "bucket_id" { type = string }
variable "bucket_arn" { type = string }
variable "bucket_regional_domain_name" { type = string }
variable "certificate_arn" { type = string }
