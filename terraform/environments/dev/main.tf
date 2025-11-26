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

  project_name          = var.project_name
  environment           = var.environment
  db_subnet_group_name  = module.networking.db_subnet_group_name
  rds_security_group_id = module.security_groups.database_security_group_id

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

# SSM Bastion Module (for secure database access)
module "ssm_bastion" {
  source = "../../modules/ssm-bastion"

  project_name               = var.project_name
  environment                = var.environment
  vpc_id                     = module.networking.vpc_id
  private_subnet_ids         = module.networking.private_subnet_ids
  database_security_group_id = module.security_groups.database_security_group_id
  instance_type              = var.bastion_instance_type

  common_tags = local.common_tags
}

# =====================================================================
# Cognito Module (Authentication)
# =====================================================================

module "cognito" {
  source = "../../modules/cognito"

  project_name = var.project_name
  environment  = var.environment

  # OAuth Configuration
  callback_urls = var.cognito_callback_urls
  logout_urls   = var.cognito_logout_urls

  # Security Features
  enable_mfa               = var.enable_mfa
  enable_advanced_security = false # Disable for dev to save costs

  # Google OAuth (optional)
  enable_google_oauth  = var.enable_google_oauth
  google_client_id     = var.google_client_id
  google_client_secret = var.google_client_secret

  # Lambda Triggers (will add in Phase 4)
  post_confirmation_lambda_arn = ""

  # Deletion Protection (disable for dev)
  deletion_protection = false

  common_tags = local.common_tags
}

# =====================================================================
# Lambda API Module
# =====================================================================

module "lambda_api" {
  source = "../../modules/lambda-api"

  project_name = var.project_name
  environment  = var.environment

  # Lambda Configuration
  lambda_zip_path           = "${path.module}/function.zip"
  lambda_execution_role_arn = module.iam.lambda_execution_role_arn
  private_subnet_ids        = module.networking.private_subnet_ids
  lambda_security_group_id  = module.security_groups.lambda_security_group_id

  # Database Connection
  database_url = "postgresql://${module.database.master_username}:${module.database.master_password}@${module.database.database_address}:${module.database.database_port}/${module.database.database_name}?schema=public&sslmode=require"

  # Cognito Configuration
  cognito_user_pool_id      = module.cognito.user_pool_id
  cognito_web_client_id     = module.cognito.web_client_id
  cognito_backend_client_id = module.cognito.backend_client_id

  # Performance
  reserved_concurrency = -1

  # Logging
  log_retention_days = 7

  # Alarms
  alarm_actions = []

  common_tags = local.common_tags

  depends_on = [module.database, module.cognito]
}

# =====================================================================
# API Gateway Module
# =====================================================================

module "api_gateway" {
  source = "../../modules/api-gateway"

  project_name = var.project_name
  environment  = var.environment

  # Lambda Integration
  lambda_function_name = module.lambda_api.lambda_function_name
  lambda_invoke_arn    = module.lambda_api.lambda_invoke_arn

  # Cognito Configuration
  cognito_user_pool_id      = module.cognito.user_pool_id
  cognito_client_id         = module.cognito.web_client_id
  cognito_backend_client_id = module.cognito.backend_client_id

  # CORS
  cors_allow_origins = ["http://localhost:3000", "https://numalistest.com"]

  # Throttling
  throttle_burst_limit = 5000
  throttle_rate_limit  = 2000

  # Logging
  log_retention_days = 7

  # Alarms
  alarm_actions = []

  common_tags = local.common_tags

  depends_on = [module.lambda_api]
}
