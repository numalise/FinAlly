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

output "aurora_security_group_id" {
  description = "Aurora security group ID"
  value       = module.security_groups.aurora_security_group_id
}