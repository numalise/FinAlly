variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID where security groups will be created"
  type        = string
}

variable "allow_lambda_http_egress" {
  description = "Allow Lambda HTTP (port 80) egress for external APIs"
  type        = bool
  default     = false
}

variable "enable_admin_access" {
  description = "Enable admin security group for direct Aurora access (emergency only)"
  type        = bool
  default     = false
}

variable "admin_cidr_blocks" {
  description = "CIDR blocks allowed for admin access to Aurora"
  type        = list(string)
  default     = []
}

variable "common_tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default     = {}
}