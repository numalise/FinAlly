output "lambda_execution_role_arn" {
  description = "Lambda execution role ARN"
  value       = aws_iam_role.lambda_execution.arn
}

output "lambda_execution_role_name" {
  description = "Lambda execution role name"
  value       = aws_iam_role.lambda_execution.name
}

output "eventbridge_lambda_role_arn" {
  description = "EventBridge Lambda invocation role ARN"
  value       = aws_iam_role.eventbridge_lambda.arn
}

output "api_gateway_cloudwatch_role_arn" {
  description = "API Gateway CloudWatch Logs role ARN"
  value       = aws_iam_role.api_gateway_cloudwatch.arn
}

output "secrets_manager_policy_arn" {
  description = "Secrets Manager access policy ARN"
  value       = aws_iam_policy.secrets_manager_access.arn
}

output "ssm_parameter_policy_arn" {
  description = "SSM Parameter Store access policy ARN"
  value       = aws_iam_policy.ssm_parameter_access.arn
}

output "ses_send_email_policy_arn" {
  description = "SES send email policy ARN"
  value       = aws_iam_policy.ses_send_email.arn
}

output "cognito_access_policy_arn" {
  description = "Cognito access policy ARN"
  value       = aws_iam_policy.cognito_access.arn
}
