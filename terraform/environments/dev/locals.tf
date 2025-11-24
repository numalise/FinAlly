locals {
  common_tags = {
    Project     = "FinAlly"
    Environment = var.environment
    ManagedBy   = "Terraform"
    Region      = var.aws_region
  }
}