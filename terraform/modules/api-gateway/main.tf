# =====================================================================
# API Gateway HTTP API
# =====================================================================

resource "aws_apigatewayv2_api" "main" {
  name          = "${var.project_name}-${var.environment}-api"
  protocol_type = "HTTP"
  description   = "FinAlly HTTP API"
  
  cors_configuration {
    allow_origins     = var.cors_allow_origins
    allow_methods     = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    allow_headers     = ["Content-Type", "Authorization", "X-Amz-Date", "X-Api-Key", "X-Amz-Security-Token"]
    expose_headers    = ["Content-Type", "X-Amz-Request-Id"]
    max_age           = 86400
    allow_credentials = true
  }
  
  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-api"
    }
  )
}

# =====================================================================
# Cognito Authorizer
# =====================================================================

resource "aws_apigatewayv2_authorizer" "cognito" {
  api_id           = aws_apigatewayv2_api.main.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "${var.project_name}-${var.environment}-cognito-authorizer"
  
  jwt_configuration {
    audience = [var.cognito_client_id, var.cognito_backend_client_id]
    issuer   = "https://cognito-idp.${data.aws_region.current.name}.amazonaws.com/${var.cognito_user_pool_id}"
  }
}

data "aws_region" "current" {}

# =====================================================================
# Lambda Integration
# =====================================================================

resource "aws_apigatewayv2_integration" "lambda" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  
  integration_uri        = var.lambda_invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
  timeout_milliseconds   = 30000
}

# =====================================================================
# Routes - Health (No Auth)
# =====================================================================

resource "aws_apigatewayv2_route" "health" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /health"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

# =====================================================================
# Routes - Users (With Auth)
# =====================================================================

resource "aws_apigatewayv2_route" "get_me" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "GET /users/me"
  target             = "integrations/${aws_apigatewayv2_integration.lambda.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_apigatewayv2_route" "update_me" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "PATCH /users/me"
  target             = "integrations/${aws_apigatewayv2_integration.lambda.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_apigatewayv2_route" "export_data" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "GET /export/data"
  target             = "integrations/${aws_apigatewayv2_integration.lambda.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

# =====================================================================
# Routes - Assets (With Auth)
# =====================================================================

resource "aws_apigatewayv2_route" "get_assets" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "GET /assets"
  target             = "integrations/${aws_apigatewayv2_integration.lambda.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_apigatewayv2_route" "create_asset" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "POST /assets"
  target             = "integrations/${aws_apigatewayv2_integration.lambda.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_apigatewayv2_route" "update_asset" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "PATCH /assets/{id}"
  target             = "integrations/${aws_apigatewayv2_integration.lambda.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_apigatewayv2_route" "delete_asset" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "DELETE /assets/{id}"
  target             = "integrations/${aws_apigatewayv2_integration.lambda.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

# =====================================================================
# Routes - Asset Inputs (With Auth)
# =====================================================================

resource "aws_apigatewayv2_route" "get_asset_inputs" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "GET /asset-inputs"
  target             = "integrations/${aws_apigatewayv2_integration.lambda.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_apigatewayv2_route" "create_asset_input" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "POST /asset-inputs"
  target             = "integrations/${aws_apigatewayv2_integration.lambda.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

# =====================================================================
# Routes - Incomings (With Auth)
# =====================================================================

resource "aws_apigatewayv2_route" "get_incomings" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "GET /incomings"
  target             = "integrations/${aws_apigatewayv2_integration.lambda.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_apigatewayv2_route" "create_incoming" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "POST /incomings"
  target             = "integrations/${aws_apigatewayv2_integration.lambda.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_apigatewayv2_route" "delete_incoming" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "DELETE /incomings/{id}"
  target             = "integrations/${aws_apigatewayv2_integration.lambda.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

# =====================================================================
# Routes - Expenses (With Auth)
# =====================================================================

resource "aws_apigatewayv2_route" "get_expenses" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "GET /expenses"
  target             = "integrations/${aws_apigatewayv2_integration.lambda.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_apigatewayv2_route" "create_expense" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "POST /expenses"
  target             = "integrations/${aws_apigatewayv2_integration.lambda.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_apigatewayv2_route" "delete_expense" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "DELETE /expenses/{id}"
  target             = "integrations/${aws_apigatewayv2_integration.lambda.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

# =====================================================================
# Routes - Budgets (With Auth)
# =====================================================================

resource "aws_apigatewayv2_route" "get_budgets" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "GET /budgets"
  target             = "integrations/${aws_apigatewayv2_integration.lambda.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_apigatewayv2_route" "update_budget" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "PATCH /budgets/{category}"
  target             = "integrations/${aws_apigatewayv2_integration.lambda.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

# =====================================================================
# Routes - Allocation (With Auth)
# =====================================================================

resource "aws_apigatewayv2_route" "get_allocation" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "GET /allocation"
  target             = "integrations/${aws_apigatewayv2_integration.lambda.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_apigatewayv2_route" "get_category_targets" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "GET /category-allocation-targets"
  target             = "integrations/${aws_apigatewayv2_integration.lambda.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_apigatewayv2_route" "update_category_target" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "PATCH /category-allocation-targets/{category}"
  target             = "integrations/${aws_apigatewayv2_integration.lambda.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

# =====================================================================
# Routes - Net Worth (With Auth)
# =====================================================================

resource "aws_apigatewayv2_route" "get_networth_history" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "GET /networth/history"
  target             = "integrations/${aws_apigatewayv2_integration.lambda.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_apigatewayv2_route" "get_networth_projection" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "GET /networth/projection"
  target             = "integrations/${aws_apigatewayv2_integration.lambda.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

# =====================================================================
# CORS Options Route
# =====================================================================

resource "aws_apigatewayv2_route" "options" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "OPTIONS /{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

# =====================================================================
# Stage (Deployment)
# =====================================================================

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = "$default"
  auto_deploy = true
  
  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gateway.arn
    format = jsonencode({
      requestId        = "$context.requestId"
      ip               = "$context.identity.sourceIp"
      requestTime      = "$context.requestTime"
      httpMethod       = "$context.httpMethod"
      routeKey         = "$context.routeKey"
      status           = "$context.status"
      protocol         = "$context.protocol"
      responseLength   = "$context.responseLength"
      errorMessage     = "$context.error.message"
      integrationError = "$context.integrationErrorMessage"
      authorizerError  = "$context.authorizer.error"
    })
  }
  
  default_route_settings {
    throttling_burst_limit = var.throttle_burst_limit
    throttling_rate_limit  = var.throttle_rate_limit
  }
  
  tags = var.common_tags
}

resource "aws_cloudwatch_log_group" "api_gateway" {
  name              = "/aws/apigateway/${var.project_name}-${var.environment}"
  retention_in_days = var.log_retention_days
  tags              = var.common_tags
}

# =====================================================================
# Lambda Permission
# =====================================================================

resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

# =====================================================================
# CloudWatch Alarms
# =====================================================================

resource "aws_cloudwatch_metric_alarm" "api_5xx_errors" {
  alarm_name          = "${var.project_name}-${var.environment}-api-5xx-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "5XXError"
  namespace           = "AWS/ApiGateway"
  period              = 300
  statistic           = "Sum"
  threshold           = 10
  alarm_description   = "API Gateway 5XX errors"
  alarm_actions       = var.alarm_actions
  
  dimensions = {
    ApiId = aws_apigatewayv2_api.main.id
  }
  
  tags = var.common_tags
}

resource "aws_cloudwatch_metric_alarm" "api_4xx_errors" {
  alarm_name          = "${var.project_name}-${var.environment}-api-4xx-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "4XXError"
  namespace           = "AWS/ApiGateway"
  period              = 300
  statistic           = "Sum"
  threshold           = 50
  alarm_description   = "API Gateway 4XX errors"
  alarm_actions       = var.alarm_actions
  
  dimensions = {
    ApiId = aws_apigatewayv2_api.main.id
  }
  
  tags = var.common_tags
}
