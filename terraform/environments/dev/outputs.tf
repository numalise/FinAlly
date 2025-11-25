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
