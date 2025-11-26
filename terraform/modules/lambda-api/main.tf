# =====================================================================
# Lambda Function for API
# =====================================================================

data "aws_region" "current" {}
data "aws_caller_identity" "current" {}

# Lambda Function
resource "aws_lambda_function" "api" {
  function_name = "${var.project_name}-${var.environment}-api"
  description   = "FinAlly API - Serverless backend"
  
  # Deployment package
  filename         = var.lambda_zip_path
  source_code_hash = filebase64sha256(var.lambda_zip_path)
  
  # Runtime configuration
  runtime       = "nodejs20.x"
  handler       = "index.handler"
  architectures = ["arm64"]
  
  # IAM Role
  role = var.lambda_execution_role_arn
  
  # Timeout and Memory
  timeout     = 30
  memory_size = 512
  
  # VPC Configuration (for database access)
  vpc_config {
    subnet_ids         = var.private_subnet_ids
    security_group_ids = [var.lambda_security_group_id]
  }
  
  # Environment Variables
  environment {
    variables = {
      NODE_ENV                            = var.environment
      ENVIRONMENT                         = var.environment
      DATABASE_URL                        = var.database_url
      COGNITO_USER_POOL_ID                = var.cognito_user_pool_id
      COGNITO_WEB_CLIENT_ID               = var.cognito_web_client_id
      COGNITO_BACKEND_CLIENT_ID           = var.cognito_backend_client_id
      AWS_NODEJS_CONNECTION_REUSE_ENABLED = "1"
    }
  }
  
  # Reserved Concurrent Executions (optional, for cost control)
  reserved_concurrent_executions = var.reserved_concurrency
  
  # Tracing
  tracing_config {
    mode = "PassThrough"
  }
  
  # Logging
  logging_config {
    log_format = "JSON"
    log_group  = aws_cloudwatch_log_group.lambda.name
  }
  
  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-api"
    }
  )
  
  depends_on = [
    aws_cloudwatch_log_group.lambda
  ]
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${var.project_name}-${var.environment}-api"
  retention_in_days = var.log_retention_days
  
  tags = var.common_tags
}

# Lambda Function URL (alternative to API Gateway, optional)
resource "aws_lambda_function_url" "api" {
  count              = var.enable_function_url ? 1 : 0
  function_name      = aws_lambda_function.api.function_name
  authorization_type = "NONE"
  
  cors {
    allow_origins     = ["*"]
    allow_methods     = ["*"]
    allow_headers     = ["*"]
    expose_headers    = ["*"]
    max_age           = 86400
  }
}

# =====================================================================
# CloudWatch Alarms
# =====================================================================

resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  alarm_name          = "${var.project_name}-${var.environment}-lambda-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = 300
  statistic           = "Sum"
  threshold           = 10
  alarm_description   = "Lambda function errors"
  alarm_actions       = var.alarm_actions
  
  dimensions = {
    FunctionName = aws_lambda_function.api.function_name
  }
  
  tags = var.common_tags
}

resource "aws_cloudwatch_metric_alarm" "lambda_throttles" {
  alarm_name          = "${var.project_name}-${var.environment}-lambda-throttles"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "Throttles"
  namespace           = "AWS/Lambda"
  period              = 300
  statistic           = "Sum"
  threshold           = 5
  alarm_description   = "Lambda function throttles"
  alarm_actions       = var.alarm_actions
  
  dimensions = {
    FunctionName = aws_lambda_function.api.function_name
  }
  
  tags = var.common_tags
}

resource "aws_cloudwatch_metric_alarm" "lambda_duration" {
  alarm_name          = "${var.project_name}-${var.environment}-lambda-duration"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "Duration"
  namespace           = "AWS/Lambda"
  period              = 300
  statistic           = "Average"
  threshold           = 25000 # 25 seconds (timeout is 30s)
  alarm_description   = "Lambda function duration approaching timeout"
  alarm_actions       = var.alarm_actions
  
  dimensions = {
    FunctionName = aws_lambda_function.api.function_name
  }
  
  tags = var.common_tags
}
