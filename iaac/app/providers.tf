terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "argly-tofu-state-iaac"
    key            = "web/terraform.tfstate"
    region         = "sa-east-1"
    dynamodb_table = "argly-tofu-locks-iaac"
    encrypt        = true
    profile        = "argly"
  }
}

provider "aws" {
  region  = var.aws_region
  profile = "argly"
  default_tags {
    tags = {
      Project   = var.project_name
      ManagedBy = "OpenTofu"
    }
  }
}

provider "aws" {
  alias   = "useast1"
  region  = "us-east-1"
  profile = "argly"
  default_tags {
    tags = {
      Project   = var.project_name
      ManagedBy = "OpenTofu"
    }
  }
}
