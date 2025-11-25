# Security Group for Lambda Functions
resource "aws_security_group" "lambda" {
  name_prefix = "${var.project_name}-${var.environment}-lambda-"
  description = "Security group for Lambda functions"
  vpc_id      = var.vpc_id
  
  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-lambda-sg"
    }
  )
  
  lifecycle {
    create_before_destroy = true
  }
}

# Lambda Egress: Allow outbound to Database PostgreSQL
resource "aws_security_group_rule" "lambda_to_database" {
  type                     = "egress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  security_group_id        = aws_security_group.lambda.id
  source_security_group_id = aws_security_group.database.id
  description              = "Allow Lambda to connect to RDS PostgreSQL"
}

# Lambda Egress: Allow outbound HTTPS for Prisma Data Proxy and AWS services
resource "aws_security_group_rule" "lambda_to_internet" {
  type              = "egress"
  from_port         = 443
  to_port           = 443
  protocol          = "tcp"
  security_group_id = aws_security_group.lambda.id
  cidr_blocks       = ["0.0.0.0/0"]
  description       = "Allow Lambda HTTPS egress for Prisma Data Proxy and AWS services"
}

# Lambda Egress: Allow outbound HTTP (for potential API calls)
resource "aws_security_group_rule" "lambda_to_internet_http" {
  count             = var.allow_lambda_http_egress ? 1 : 0
  type              = "egress"
  from_port         = 80
  to_port           = 80
  protocol          = "tcp"
  security_group_id = aws_security_group.lambda.id
  cidr_blocks       = ["0.0.0.0/0"]
  description       = "Allow Lambda HTTP egress for external APIs"
}

# Security Group for Database (RDS PostgreSQL)
resource "aws_security_group" "database" {
  name_prefix = "${var.project_name}-${var.environment}-database-"
  description = "Security group for RDS PostgreSQL database"
  vpc_id      = var.vpc_id
  
  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-database-sg"
    }
  )
  
  lifecycle {
    create_before_destroy = true
  }
}

# Database Ingress: Allow PostgreSQL connections only from Lambda
resource "aws_security_group_rule" "database_from_lambda" {
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  security_group_id        = aws_security_group.database.id
  source_security_group_id = aws_security_group.lambda.id
  description              = "Allow PostgreSQL connections from Lambda functions"
}

# Optional: Security Group for Admin Access (emergency only)
resource "aws_security_group" "admin" {
  count       = var.enable_admin_access ? 1 : 0
  name_prefix = "${var.project_name}-${var.environment}-admin-"
  description = "Security group for administrative access to database"
  vpc_id      = var.vpc_id
  
  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-admin-sg"
    }
  )
  
  lifecycle {
    create_before_destroy = true
  }
}

# Admin Ingress: Allow PostgreSQL from specific IP (configurable)
resource "aws_security_group_rule" "admin_to_database" {
  count             = var.enable_admin_access ? 1 : 0
  type              = "ingress"
  from_port         = 5432
  to_port           = 5432
  protocol          = "tcp"
  security_group_id = aws_security_group.database.id
  cidr_blocks       = var.admin_cidr_blocks
  description       = "Allow PostgreSQL from admin IP addresses"
}
