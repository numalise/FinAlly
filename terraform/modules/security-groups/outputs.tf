output "lambda_security_group_id" {
  description = "Security group ID for Lambda functions"
  value       = aws_security_group.lambda.id
}

output "database_security_group_id" {
  description = "Security group ID for RDS database"
  value       = aws_security_group.database.id
}

output "admin_security_group_id" {
  description = "Security group ID for admin access (if enabled)"
  value       = var.enable_admin_access ? aws_security_group.admin[0].id : null
}
