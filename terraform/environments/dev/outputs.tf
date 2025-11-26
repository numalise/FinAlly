# =====================================================================
# Networking Outputs
# =====================================================================

output "vpc_id" {
  description = "VPC ID"
  value       = module.networking.vpc_id
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = module.networking.private_subnet_ids
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = module.networking.public_subnet_ids
}

output "nat_gateway_id" {
  description = "NAT Gateway ID"
  value       = module.networking.nat_gateway_id
}

# =====================================================================
# Security Groups Outputs
# =====================================================================

output "lambda_security_group_id" {
  description = "Lambda security group ID"
  value       = module.security_groups.lambda_security_group_id
}

output "database_security_group_id" {
  description = "Database security group ID"
  value       = module.security_groups.database_security_group_id
}

# =====================================================================
# Database Outputs
# =====================================================================

output "database_endpoint" {
  description = "RDS instance endpoint"
  value       = module.database.database_endpoint
}

output "database_address" {
  description = "RDS instance hostname"
  value       = module.database.database_address
}

output "database_port" {
  description = "RDS instance port"
  value       = module.database.database_port
}

output "database_name" {
  description = "Database name"
  value       = module.database.database_name
}

output "database_arn" {
  description = "RDS instance ARN"
  value       = module.database.database_arn
}

output "database_secret_arn" {
  description = "Secrets Manager secret ARN for database credentials"
  value       = module.database.database_secret_arn
}

# =====================================================================
# Cognito Outputs
# =====================================================================

output "cognito_user_pool_id" {
  description = "Cognito User Pool ID"
  value       = module.cognito.user_pool_id
}

output "cognito_user_pool_arn" {
  description = "Cognito User Pool ARN"
  value       = module.cognito.user_pool_arn
}

output "cognito_web_client_id" {
  description = "Cognito Web Client ID"
  value       = module.cognito.web_client_id
}

output "cognito_domain" {
  description = "Cognito Hosted UI Domain"
  value       = module.cognito.cognito_domain
}

output "cognito_hosted_ui_url" {
  description = "Cognito Hosted UI URL"
  value       = module.cognito.cognito_hosted_ui_url
}

output "cognito_login_url" {
  description = "Cognito Login URL"
  value       = module.cognito.login_url
}

# =====================================================================
# SSM Bastion Outputs
# =====================================================================

output "bastion_instance_id" {
  description = "Bastion instance ID"
  value       = module.ssm_bastion.instance_id
}

output "bastion_security_group_id" {
  description = "Bastion security group ID"
  value       = module.ssm_bastion.security_group_id
}

# =====================================================================
# Lambda API Outputs
# =====================================================================

output "lambda_function_name" {
  description = "Lambda function name"
  value       = module.lambda_api.lambda_function_name
}

output "lambda_function_arn" {
  description = "Lambda function ARN"
  value       = module.lambda_api.lambda_function_arn
}

output "lambda_log_group" {
  description = "Lambda CloudWatch Log Group"
  value       = module.lambda_api.log_group_name
}

# =====================================================================
# API Gateway Outputs
# =====================================================================

output "api_id" {
  description = "API Gateway ID"
  value       = module.api_gateway.api_id
}

output "api_endpoint" {
  description = "API Gateway endpoint URL"
  value       = module.api_gateway.api_endpoint
}

output "api_invoke_url" {
  description = "API Gateway invoke URL"
  value       = module.api_gateway.stage_invoke_url
}

output "api_execution_arn" {
  description = "API Gateway execution ARN"
  value       = module.api_gateway.api_execution_arn
}

output "cognito_backend_client_id" {
  description = "Cognito Backend Client ID"
  value       = module.cognito.backend_client_id
}
