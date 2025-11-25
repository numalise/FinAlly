output "instance_id" {
  description = "RDS instance identifier"
  value       = aws_db_instance.postgresql.id
}

output "instance_arn" {
  description = "RDS instance ARN"
  value       = aws_db_instance.postgresql.arn
}

output "endpoint" {
  description = "RDS instance endpoint (host:port)"
  value       = aws_db_instance.postgresql.endpoint
}

output "address" {
  description = "RDS instance address (hostname only)"
  value       = aws_db_instance.postgresql.address
}

output "port" {
  description = "RDS instance port"
  value       = aws_db_instance.postgresql.port
}

output "database_name" {
  description = "Database name"
  value       = aws_db_instance.postgresql.db_name
}

output "master_username" {
  description = "Master username"
  value       = aws_db_instance.postgresql.username
  sensitive   = true
}

output "secret_arn" {
  description = "Secrets Manager secret ARN containing database credentials"
  value       = aws_secretsmanager_secret.rds_credentials.arn
}

output "secret_name" {
  description = "Secrets Manager secret name"
  value       = aws_secretsmanager_secret.rds_credentials.name
}

output "parameter_group_name" {
  description = "Parameter group name"
  value       = aws_db_parameter_group.postgresql.name
}

output "connection_string" {
  description = "PostgreSQL connection string (password not included)"
  value       = "postgresql://${aws_db_instance.postgresql.username}:PASSWORD@${aws_db_instance.postgresql.address}:${aws_db_instance.postgresql.port}/${aws_db_instance.postgresql.db_name}"
  sensitive   = true
}
