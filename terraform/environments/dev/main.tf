terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "FinAlly"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# Networking Module
module "networking" {
  source = "../../modules/networking"
  
  project_name         = var.project_name
  environment          = var.environment
  aws_region           = var.aws_region
  vpc_cidr             = var.vpc_cidr
  availability_zones   = var.availability_zones
  enable_nat_gateway   = var.enable_nat_gateway
  enable_vpc_endpoints = var.enable_vpc_endpoints
  
  common_tags = local.common_tags
}

# Security Groups Module
module "security_groups" {
  source = "../../modules/security-groups"
  
  project_name             = var.project_name
  environment              = var.environment
  vpc_id                   = module.networking.vpc_id
  allow_lambda_http_egress = var.allow_lambda_http_egress
  enable_admin_access      = var.enable_admin_access
  admin_cidr_blocks        = var.admin_cidr_blocks
  
  common_tags = local.common_tags
}
# IAM Module
module "iam" {
  source = "../../modules/iam"
  
  project_name          = var.project_name
  environment           = var.environment
  aws_region            = var.aws_region
  ses_from_addresses    = var.ses_from_addresses
  enable_rds_data_api   = var.enable_rds_data_api
  cognito_user_pool_arn = var.cognito_user_pool_arn
  aurora_cluster_arn    = var.aurora_cluster_arn
  kms_key_arn           = var.kms_key_arn
  
  common_tags = local.common_tags
}
