locals {
  # Naming convention: {project}-{resource}-{environment}
  name_prefix = "${var.project_name}-${var.environment}"
  
  # Merge common tags with environment-specific tags
  common_tags = merge(
    var.common_tags,
    {
      Project     = "FinAlly"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Region      = var.aws_region
    }
  )
  
  # Resource naming
  vpc_name               = "${local.name_prefix}-vpc"
  lambda_api_name        = "${local.name_prefix}-api"
  lambda_reminder_name   = "${local.name_prefix}-reminder"
  lambda_integrity_name  = "${local.name_prefix}-integrity"
  api_gateway_name       = "${local.name_prefix}-apigw"
  aurora_cluster_name    = "${local.name_prefix}-aurora"
  cognito_pool_name      = "${local.name_prefix}-users"
}
