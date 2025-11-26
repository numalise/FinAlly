variable "project_name" {
  description = "Project name"
  type        = string
  default     = "finally"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "eu-central-1"
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones"
  type        = list(string)
  default     = ["eu-central-1a", "eu-central-1b"]
}

variable "enable_nat_gateway" {
  description = "Enable NAT Gateway"
  type        = bool
  default     = true
}

variable "enable_vpc_endpoints" {
  description = "Enable VPC endpoints"
  type        = bool
  default     = false
}

variable "allow_lambda_http_egress" {
  description = "Allow Lambda HTTP egress"
  type        = bool
  default     = false
}

variable "enable_admin_access" {
  description = "Enable admin database access"
  type        = bool
  default     = false
}

variable "admin_cidr_blocks" {
  description = "Admin CIDR blocks"
  type        = list(string)
  default     = []
}

# IAM Variables
variable "ses_from_addresses" {
  description = "Allowed SES sender addresses"
  type        = list(string)
  default     = ["noreply@*", "*@finally.app"]
}

variable "enable_rds_data_api" {
  description = "Enable RDS Data API access"
  type        = bool
  default     = false
}

variable "cognito_user_pool_arn" {
  description = "Cognito User Pool ARN (add after Phase 3)"
  type        = string
  default     = ""
}

variable "database_arn" {
  description = "RDS database ARN (populated after database creation)"
  type        = string
  default     = ""
}

variable "kms_key_arn" {
  description = "KMS key ARN for encryption"
  type        = string
  default     = ""
}

# Database Configuration
variable "database_name" {
  description = "Database name"
  type        = string
  default     = "finally"
}

variable "master_username" {
  description = "Master username"
  type        = string
  default     = "finally_admin"
}

variable "rds_instance_class" {
  description = "RDS instance class (Free Tier: db.t3.micro)"
  type        = string
  default     = "db.t3.micro"
}

variable "rds_allocated_storage" {
  description = "RDS allocated storage in GB (Free Tier: max 20GB)"
  type        = number
  default     = 20
}

variable "backup_retention_days" {
  description = "Backup retention days (Free Tier: 1 minimum)"
  type        = number
  default     = 1
}

variable "skip_final_snapshot" {
  description = "Skip final snapshot on destroy"
  type        = bool
  default     = true # true for dev
}

variable "deletion_protection" {
  description = "Enable deletion protection"
  type        = bool
  default     = false # false for dev
}

variable "bastion_instance_type" {
  description = "SSM bastion instance type"
  type        = string
  default     = "t3.micro"
}

# =====================================================================
# Cognito Variables
# =====================================================================

variable "enable_mfa" {
  description = "Enable optional MFA for Cognito"
  type        = bool
  default     = false
}

variable "enable_google_oauth" {
  description = "Enable Google OAuth"
  type        = bool
  default     = false
}

variable "google_client_id" {
  description = "Google OAuth Client ID"
  type        = string
  default     = ""
}

variable "google_client_secret" {
  description = "Google OAuth Client Secret"
  type        = string
  default     = ""
  sensitive   = true
}

variable "cognito_callback_urls" {
  description = "Cognito callback URLs"
  type        = list(string)
  default     = ["http://localhost:3000/auth/callback"]
}

variable "cognito_logout_urls" {
  description = "Cognito logout URLs"
  type        = list(string)
  default     = ["http://localhost:3000"]
}
