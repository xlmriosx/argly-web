terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "argly-tofu-state-iaac"
    key            = "bootstrap/terraform.tfstate"
    region         = "sa-east-1"
    dynamodb_table = "argly-tofu-locks-iaac"
    encrypt        = true
    profile        = "argly"
  }
}

provider "aws" {
  region  = "sa-east-1"
  profile = "argly"
  default_tags {
    tags = {
      Project   = "argly"
      ManagedBy = "OpenTofu-Bootstrap"
    }
  }
}
