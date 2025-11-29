# =====================================================================
# Lambda Function for API
# =====================================================================
resource "aws_lambda_function" "api" {
  function_name = "${var.project_name}-${var.environment}-api"
  role          = var.lambda_execution_role_arn

  # Container Image Configuration
  package_type = "Image"
  image_uri    = var.lambda_image_uri

  # VPC Configuration
  vpc_config {
    subnet_ids         = var.private_subnet_ids
    security_group_ids = [var.lambda_security_group_id]
  }

  # Performance Configuration
  memory_size                    = var.memory_size
  timeout                        = var.timeout
  reserved_concurrent_executions = var.reserved_concurrency

  # Environment Variables
  environment {
    variables = {
      NODE_ENV                  = var.environment
      DATABASE_URL              = var.database_url
      COGNITO_USER_POOL_ID      = var.cognito_user_pool_id
      COGNITO_WEB_CLIENT_ID     = var.cognito_web_client_id
      COGNITO_BACKEND_CLIENT_ID = var.cognito_backend_client_id
      AWS_NODEJS_CONNECTION_REUSE_ENABLED = "1"
    }
  }

  # Ephemeral Storage (if needed for /tmp)
  ephemeral_storage {
    size = 512 # MB
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

  # Ignore image changes in Terraform (we'll update via AWS CLI or CI/CD)
  lifecycle {
    ignore_changes = [image_uri]
  }
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${var.project_name}-${var.environment}-api"
  retention_in_days = var.log_retention_days

  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-api-logs"
    }
  )
}

# CloudWatch Alarms
resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  alarm_name          = "${var.project_name}-${var.environment}-lambda-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = "60"
  statistic           = "Sum"
  threshold           = "5"
  alarm_description   = "Lambda function error rate is too high"
  alarm_actions       = var.alarm_actions

  dimensions = {
    FunctionName = aws_lambda_function.api.function_name
  }

  tags = var.common_tags
}

resource "aws_cloudwatch_metric_alarm" "lambda_duration" {
  alarm_name          = "${var.project_name}-${var.environment}-lambda-duration"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "Duration"
  namespace           = "AWS/Lambda"
  period              = "60"
  statistic           = "Average"
  threshold           = var.timeout * 1000 * 0.8 # 80% of timeout
  alarm_description   = "Lambda function duration is approaching timeout"
  alarm_actions       = var.alarm_actions

  dimensions = {
    FunctionName = aws_lambda_function.api.function_name
  }

  tags = var.common_tags
}

resource "aws_cloudwatch_metric_alarm" "lambda_throttles" {
  alarm_name          = "${var.project_name}-${var.environment}-lambda-throttles"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "Throttles"
  namespace           = "AWS/Lambda"
  period              = "60"
  statistic           = "Sum"
  threshold           = "5"
  alarm_description   = "Lambda function is being throttled"
  alarm_actions       = var.alarm_actions

  dimensions = {
    FunctionName = aws_lambda_function.api.function_name
  }

  tags = var.common_tags
}

# Note: Lambda permission for API Gateway is handled in the api-gateway module
# to avoid circular dependencies