output "lambda_security_group_id" {
  description = "Security group ID for Lambda functions"
  value       = aws_security_group.lambda.id
}

output "aurora_security_group_id" {
  description = "Security group ID for Aurora cluster"
  value       = aws_security_group.aurora.id
}

output "admin_security_group_id" {
  description = "Security group ID for admin access (if enabled)"
  value       = var.enable_admin_access ? aws_security_group.admin[0].id : null
}