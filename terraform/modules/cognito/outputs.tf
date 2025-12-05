output "user_pool_id" {
  description = "Cognito User Pool ID"
  value       = aws_cognito_user_pool.main.id
}

output "user_pool_arn" {
  description = "Cognito User Pool ARN"
  value       = aws_cognito_user_pool.main.arn
}

output "user_pool_endpoint" {
  description = "Cognito User Pool Endpoint"
  value       = aws_cognito_user_pool.main.endpoint
}

output "web_client_id" {
  description = "Cognito Web Client ID"
  value       = aws_cognito_user_pool_client.web_client.id
}

output "web_client_secret" {
  description = "Cognito Web Client Secret (if generated)"
  value       = aws_cognito_user_pool_client.web_client.client_secret
  sensitive   = true
}

output "backend_client_id" {
  description = "Cognito Backend Client ID"
  value       = aws_cognito_user_pool_client.backend_client.id
}

output "cognito_domain" {
  description = "Cognito Hosted UI Domain"
  value       = aws_cognito_user_pool_domain.main.domain
}

output "cognito_hosted_ui_url" {
  description = "Cognito Hosted UI URL"
  value       = "https://${aws_cognito_user_pool_domain.main.domain}.auth.${data.aws_region.current.name}.amazoncognito.com"
}

output "login_url" {
  description = "Cognito Hosted UI Login URL"
  value       = "https://${aws_cognito_user_pool_domain.main.domain}.auth.${data.aws_region.current.name}.amazoncognito.com/login?client_id=${aws_cognito_user_pool_client.web_client.id}&response_type=code&redirect_uri=${var.callback_urls[0]}"
}

data "aws_region" "current" {}
