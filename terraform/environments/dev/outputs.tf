# Networking Outputs
output "vpc_id" {
  description = "VPC ID"
  value       = module.networking.vpc_id
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = module.networking.private_subnet_ids
}

output "db_subnet_group_name" {
  description = "DB subnet group name"
  value       = module.networking.db_subnet_group_name
}

# Security Group Outputs
output "lambda_security_group_id" {
  description = "Lambda security group ID"
  value       = module.security_groups.lambda_security_group_id
}

output "database_security_group_id" {
  description = "Database security group ID"
  value       = module.security_groups.database_security_group_id
}

# IAM Outputs
output "lambda_execution_role_arn" {
  description = "Lambda execution role ARN"
  value       = module.iam.lambda_execution_role_arn
}

output "lambda_execution_role_name" {
  description = "Lambda execution role name"
  value       = module.iam.lambda_execution_role_name
}

output "eventbridge_lambda_role_arn" {
  description = "EventBridge Lambda role ARN"
  value       = module.iam.eventbridge_lambda_role_arn
}

output "api_gateway_cloudwatch_role_arn" {
  description = "API Gateway CloudWatch role ARN"
  value       = module.iam.api_gateway_cloudwatch_role_arn
}

# Database Outputs
output "database_endpoint" {
  description = "Database endpoint (host:port)"
  value       = module.database.endpoint
}

output "database_address" {
  description = "Database address (hostname only)"
  value       = module.database.address
}

output "database_port" {
  description = "Database port"
  value       = module.database.port
}

output "database_arn" {
  description = "Database ARN"
  value       = module.database.instance_arn
}

output "database_secret_arn" {
  description = "Database credentials secret ARN"
  value       = module.database.secret_arn
  sensitive   = true
}

output "database_name" {
  description = "Database name"
  value       = module.database.database_name
}

# SSM Bastion Outputs
output "bastion_instance_id" {
  description = "SSM bastion instance ID"
  value       = module.ssm_bastion.instance_id
}

output "bastion_private_ip" {
  description = "Bastion private IP"
  value       = module.ssm_bastion.instance_private_ip
}

output "ssm_connect_command" {
  description = "SSM connection command"
  value       = module.ssm_bastion.ssm_connect_command
}

output "bastion_security_group_id" {
  description = "Bastion security group ID"
  value       = module.ssm_bastion.security_group_id
}

# =====================================================================
# Cognito Outputs
# =====================================================================

output "cognito_user_pool_id" {
  description = "Cognito User Pool ID"
  value       = module.cognito.user_pool_id
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
