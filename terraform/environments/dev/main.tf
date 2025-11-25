terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
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
  database_arn          = var.database_arn
  kms_key_arn           = var.kms_key_arn
  
  common_tags = local.common_tags
}

# Database Module (RDS PostgreSQL - Free Tier)
module "database" {
  source = "../../modules/database"
  
  project_name             = var.project_name
  environment              = var.environment
  db_subnet_group_name     = module.networking.db_subnet_group_name
  rds_security_group_id    = module.security_groups.database_security_group_id
  
  # Database Configuration
  database_name   = var.database_name
  master_username = var.master_username
  
  # Free Tier Configuration
  instance_class        = var.rds_instance_class
  allocated_storage     = var.rds_allocated_storage
  backup_retention_days = var.backup_retention_days
  
  # Dev Settings (disable for cost savings)
  skip_final_snapshot = var.skip_final_snapshot
  deletion_protection = var.deletion_protection
  apply_immediately   = true
  
  common_tags = local.common_tags
}
