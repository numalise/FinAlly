variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "kms_key_arn" {
  description = "KMS key ARN for encrypting secrets (optional)"
  type        = string
  default     = ""
}

variable "database_arn" {
  description = "RDS database ARN (optional, for RDS Data API)"
  type        = string
  default     = ""
}

variable "enable_rds_data_api" {
  description = "Enable RDS Data API access (optional)"
  type        = bool
  default     = false
}

variable "ses_from_addresses" {
  description = "List of allowed SES sender addresses"
  type        = list(string)
  default     = ["noreply@*", "*@finally.app"]
}

variable "common_tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default     = {}
}

variable "cognito_user_pool_arn" {
  description = "Cognito User Pool ARN"
  type        = string
  default     = ""
}
