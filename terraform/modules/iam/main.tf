# ========================================
# Lambda Execution Role
# ========================================

resource "aws_iam_role" "lambda_execution" {
  name_prefix = "${var.project_name}-${var.environment}-lambda-"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
  
  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-lambda-execution-role"
    }
  )
}

# ========================================
# Lambda Basic Execution (CloudWatch Logs)
# ========================================

resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# ========================================
# Lambda VPC Execution (ENI Management)
# ========================================

resource "aws_iam_role_policy_attachment" "lambda_vpc_execution" {
  role       = aws_iam_role.lambda_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

# ========================================
# Secrets Manager Access
# ========================================

resource "aws_iam_policy" "secrets_manager_access" {
  name_prefix = "${var.project_name}-${var.environment}-secrets-"
  description = "Allow Lambda to read Secrets Manager secrets"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = [
          "arn:aws:secretsmanager:${var.aws_region}:*:secret:${var.project_name}/${var.environment}/*"
        ]
      }
    ]
  })
  
  tags = var.common_tags
}

resource "aws_iam_role_policy_attachment" "lambda_secrets_manager" {
  role       = aws_iam_role.lambda_execution.name
  policy_arn = aws_iam_policy.secrets_manager_access.arn
}

# ========================================
# SSM Parameter Store Access
# ========================================

resource "aws_iam_policy" "ssm_parameter_access" {
  name_prefix = "${var.project_name}-${var.environment}-ssm-"
  description = "Allow Lambda to read SSM Parameter Store parameters"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ssm:GetParameter",
          "ssm:GetParameters",
          "ssm:GetParametersByPath"
        ]
        Resource = [
          "arn:aws:ssm:${var.aws_region}:*:parameter/${var.project_name}/${var.environment}/*"
        ]
      }
    ]
  })
  
  tags = var.common_tags
}

resource "aws_iam_role_policy_attachment" "lambda_ssm_parameter" {
  role       = aws_iam_role.lambda_execution.name
  policy_arn = aws_iam_policy.ssm_parameter_access.arn
}

# ========================================
# KMS Access (for encrypted secrets/parameters)
# ========================================

resource "aws_iam_policy" "kms_decrypt" {
  name_prefix = "${var.project_name}-${var.environment}-kms-"
  description = "Allow Lambda to decrypt KMS-encrypted secrets"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "kms:Decrypt",
          "kms:DescribeKey"
        ]
        Resource = var.kms_key_arn != "" ? [var.kms_key_arn] : ["*"]
        Condition = {
          StringEquals = {
            "kms:ViaService" = [
              "secretsmanager.${var.aws_region}.amazonaws.com",
              "ssm.${var.aws_region}.amazonaws.com"
            ]
          }
        }
      }
    ]
  })
  
  tags = var.common_tags
}

resource "aws_iam_role_policy_attachment" "lambda_kms_decrypt" {
  role       = aws_iam_role.lambda_execution.name
  policy_arn = aws_iam_policy.kms_decrypt.arn
}

# ========================================
# SES Email Sending
# ========================================

resource "aws_iam_policy" "ses_send_email" {
  name_prefix = "${var.project_name}-${var.environment}-ses-"
  description = "Allow Lambda to send emails via SES"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ses:SendEmail",
          "ses:SendRawEmail"
        ]
        Resource = "*"
        Condition = {
          StringLike = {
            "ses:FromAddress" = var.ses_from_addresses
          }
        }
      }
    ]
  })
  
  tags = var.common_tags
}

resource "aws_iam_role_policy_attachment" "lambda_ses_send" {
  role       = aws_iam_role.lambda_execution.name
  policy_arn = aws_iam_policy.ses_send_email.arn
}

# ========================================
# Cognito User Pool Access
# ========================================

resource "aws_iam_policy" "cognito_access" {
  name_prefix = "${var.project_name}-${var.environment}-cognito-"
  description = "Allow Lambda to interact with Cognito User Pool"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "cognito-idp:GetUser",
          "cognito-idp:AdminGetUser",
          "cognito-idp:ListUsers",
          "cognito-idp:AdminUpdateUserAttributes"
        ]
        Resource = var.cognito_user_pool_arn != "" ? [var.cognito_user_pool_arn] : ["*"]
      }
    ]
  })
  
  tags = var.common_tags
}

resource "aws_iam_role_policy_attachment" "lambda_cognito" {
  role       = aws_iam_role.lambda_execution.name
  policy_arn = aws_iam_policy.cognito_access.arn
}

# ========================================
# RDS Data API Access (Aurora Serverless)
# Note: If using Prisma with direct connection, this is optional
# ========================================

resource "aws_iam_policy" "rds_data_access" {
  count       = var.enable_rds_data_api ? 1 : 0
  name_prefix = "${var.project_name}-${var.environment}-rds-data-"
  description = "Allow Lambda to use RDS Data API"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "rds-data:ExecuteStatement",
          "rds-data:BatchExecuteStatement",
          "rds-data:BeginTransaction",
          "rds-data:CommitTransaction",
          "rds-data:RollbackTransaction"
        ]
        Resource = var.aurora_cluster_arn != "" ? [var.aurora_cluster_arn] : ["*"]
      }
    ]
  })
  
  tags = var.common_tags
}

resource "aws_iam_role_policy_attachment" "lambda_rds_data" {
  count      = var.enable_rds_data_api ? 1 : 0
  role       = aws_iam_role.lambda_execution.name
  policy_arn = aws_iam_policy.rds_data_access[0].arn
}

# ========================================
# EventBridge Role (for scheduled Lambda triggers)
# ========================================

resource "aws_iam_role" "eventbridge_lambda" {
  name_prefix = "${var.project_name}-${var.environment}-eventbridge-"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "events.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
  
  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-eventbridge-lambda-role"
    }
  )
}

resource "aws_iam_policy" "eventbridge_invoke_lambda" {
  name_prefix = "${var.project_name}-${var.environment}-eventbridge-invoke-"
  description = "Allow EventBridge to invoke Lambda functions"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "lambda:InvokeFunction"
        ]
        Resource = [
          "arn:aws:lambda:${var.aws_region}:*:function:${var.project_name}-${var.environment}-*"
        ]
      }
    ]
  })
  
  tags = var.common_tags
}

resource "aws_iam_role_policy_attachment" "eventbridge_invoke" {
  role       = aws_iam_role.eventbridge_lambda.name
  policy_arn = aws_iam_policy.eventbridge_invoke_lambda.arn
}

# ========================================
# API Gateway CloudWatch Logs Role
# ========================================

resource "aws_iam_role" "api_gateway_cloudwatch" {
  name_prefix = "${var.project_name}-${var.environment}-apigw-logs-"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "apigateway.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
  
  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-apigw-cloudwatch-role"
    }
  )
}

resource "aws_iam_role_policy_attachment" "api_gateway_cloudwatch" {
  role       = aws_iam_role.api_gateway_cloudwatch.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs"
}
