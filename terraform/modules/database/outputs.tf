# =====================================================================
# Database Outputs
# =====================================================================

output "database_id" {
  description = "RDS instance identifier"
  value       = aws_db_instance.postgresql.id
}

output "database_arn" {
  description = "RDS instance ARN"
  value       = aws_db_instance.postgresql.arn
}

output "database_address" {
  description = "RDS instance hostname"
  value       = aws_db_instance.postgresql.address
}

output "database_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.postgresql.endpoint
}

output "database_port" {
  description = "RDS instance port"
  value       = aws_db_instance.postgresql.port
}

output "database_name" {
  description = "Database name"
  value       = aws_db_instance.postgresql.db_name
}

output "master_username" {
  description = "Database master username"
  value       = var.master_username
}

output "master_password" {
  description = "Database master password"
  value       = random_password.master_password.result
  sensitive   = true
}

output "database_secret_arn" {
  description = "Secrets Manager secret ARN for database credentials"
  value       = aws_secretsmanager_secret.rds_credentials.arn
}

output "database_secret_name" {
  description = "Secrets Manager secret name for database credentials"
  value       = aws_secretsmanager_secret.rds_credentials.name
}

output "parameter_group_name" {
  description = "Database parameter group name"
  value       = aws_db_parameter_group.postgresql.name
}

output "security_group_id" {
  description = "Database security group ID"
  value       = var.rds_security_group_id
}
