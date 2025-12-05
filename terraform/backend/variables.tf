variable "aws_region" {
  description = "AWS region for backend resources"
  type        = string
  default     = "eu-central-1"
}

variable "state_bucket_name" {
  description = "Name of S3 bucket for Terraform state"
  type        = string
  default     = "finally-terraform-state"
}

variable "dynamodb_table_name" {
  description = "Name of DynamoDB table for state locking"
  type        = string
  default     = "finally-terraform-locks"
}

variable "project_name" {
  description = "Project name for tagging"
  type        = string
  default     = "FinAlly"
}
