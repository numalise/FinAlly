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
  description = "Enable admin Aurora access"
  type        = bool
  default     = false
}

variable "admin_cidr_blocks" {
  description = "Admin CIDR blocks"
  type        = list(string)
  default     = []
}
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

variable "aurora_cluster_arn" {
  description = "Aurora cluster ARN (add after Phase 2)"
  type        = string
  default     = ""
}

variable "kms_key_arn" {
  description = "KMS key ARN for encryption"
  type        = string
  default     = ""
}
