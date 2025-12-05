# =====================================================================
# IAM Outputs
# =====================================================================

output "lambda_execution_role_arn" {
  description = "Lambda execution role ARN"
  value       = aws_iam_role.lambda_execution.arn
}

output "lambda_execution_role_name" {
  description = "Lambda execution role name"
  value       = aws_iam_role.lambda_execution.name
}

output "eventbridge_lambda_role_arn" {
  description = "EventBridge Lambda trigger role ARN"
  value       = aws_iam_role.eventbridge_lambda.arn
}

output "eventbridge_lambda_role_name" {
  description = "EventBridge Lambda trigger role name"
  value       = aws_iam_role.eventbridge_lambda.name
}

output "api_gateway_cloudwatch_role_arn" {
  description = "API Gateway CloudWatch role ARN"
  value       = aws_iam_role.api_gateway_cloudwatch.arn
}

output "api_gateway_cloudwatch_role_name" {
  description = "API Gateway CloudWatch role name"
  value       = aws_iam_role.api_gateway_cloudwatch.name
}
