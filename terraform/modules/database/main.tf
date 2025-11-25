# ========================================
# Random Password Generation
# ========================================

resource "random_password" "master_password" {
  length  = 32
  special = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

# ========================================
# Secrets Manager Secret for RDS Credentials
# ========================================

resource "aws_secretsmanager_secret" "rds_credentials" {
  name_prefix             = "${var.project_name}/${var.environment}/rds-"
  description             = "RDS PostgreSQL credentials for ${var.project_name}-${var.environment}"
  recovery_window_in_days = var.secret_recovery_window_days
  
  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-rds-credentials"
    }
  )
}

resource "aws_secretsmanager_secret_version" "rds_credentials" {
  secret_id = aws_secretsmanager_secret.rds_credentials.id
  
  secret_string = jsonencode({
    username     = var.master_username
    password     = random_password.master_password.result
    engine       = "postgres"
    host         = aws_db_instance.postgresql.address
    port         = aws_db_instance.postgresql.port
    dbname       = var.database_name
    dbInstanceIdentifier = aws_db_instance.postgresql.identifier
  })
}

# ========================================
# DB Parameter Group (PostgreSQL 16)
# ========================================

resource "aws_db_parameter_group" "postgresql" {
  name_prefix = "${var.project_name}-${var.environment}-postgres-"
  family      = "postgres16"
  description = "Parameter group for ${var.project_name}-${var.environment} PostgreSQL"
  
  # Dynamic parameter - can be changed without reboot
  parameter {
    name         = "shared_preload_libraries"
    value        = "pg_stat_statements"
    apply_method = "pending-reboot" # Requires restart
  }
  
  # Static parameter - requires reboot
  parameter {
    name         = "log_statement"
    value        = "all"
    apply_method = "pending-reboot"
  }
  
  # Dynamic parameter
  parameter {
    name         = "log_min_duration_statement"
    value        = "1000"
    apply_method = "immediate"
  }
  
  # Dynamic parameter
  parameter {
    name         = "timezone"
    value        = var.timezone
    apply_method = "immediate"
  }
  
  # Recommended for production monitoring
  parameter {
    name         = "log_connections"
    value        = "1"
    apply_method = "immediate"
  }
  
  parameter {
    name         = "log_disconnections"
    value        = "1"
    apply_method = "immediate"
  }
  
  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-postgres-pg"
    }
  )
  
  lifecycle {
    create_before_destroy = true
  }
}

# ========================================
# RDS PostgreSQL Instance (Free Tier)
# ========================================

resource "aws_db_instance" "postgresql" {
  identifier     = "${var.project_name}-${var.environment}-postgres"
  engine         = "postgres"
  engine_version = var.engine_version
  instance_class = var.instance_class
  
  # Database Configuration
  db_name  = var.database_name
  username = var.master_username
  password = random_password.master_password.result
  port     = var.port
  
  # Storage Configuration (Free Tier: 20GB)
  allocated_storage     = var.allocated_storage
  max_allocated_storage = var.max_allocated_storage
  storage_type          = "gp3"
  storage_encrypted     = true
  kms_key_id            = var.kms_key_arn != "" ? var.kms_key_arn : null
  
  # Networking
  db_subnet_group_name   = var.db_subnet_group_name
  vpc_security_group_ids = [var.rds_security_group_id]
  publicly_accessible    = false
  
  # Backup Configuration (Free Tier: 1 day minimum)
  backup_retention_period  = var.backup_retention_days
  backup_window            = var.backup_window
  maintenance_window       = var.maintenance_window
  delete_automated_backups = true
  
  # Parameter Group
  parameter_group_name = aws_db_parameter_group.postgresql.name
  
  # Monitoring
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
  performance_insights_enabled    = false # Not free tier
  monitoring_interval             = 0     # Enhanced monitoring not free
  
  # High Availability (Disabled for free tier)
  multi_az = false
  
  # Deletion Protection
  deletion_protection       = var.deletion_protection
  skip_final_snapshot       = var.skip_final_snapshot
  final_snapshot_identifier = var.skip_final_snapshot ? null : "${var.project_name}-${var.environment}-postgres-final-${formatdate("YYYY-MM-DD-hhmm", timestamp())}"
  
  # Maintenance
  auto_minor_version_upgrade = var.auto_minor_version_upgrade
  apply_immediately          = var.apply_immediately
  
  # Free Tier Specific
  copy_tags_to_snapshot = true
  
  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-postgres"
      Tier = "FreeTier"
    }
  )
  
  lifecycle {
    ignore_changes = [
      password,
      final_snapshot_identifier
    ]
  }
}

# ========================================
# CloudWatch Alarms
# ========================================

resource "aws_cloudwatch_metric_alarm" "rds_cpu" {
  alarm_name          = "${var.project_name}-${var.environment}-rds-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "RDS CPU utilization is too high"
  alarm_actions       = var.alarm_actions
  
  dimensions = {
    DBInstanceIdentifier = aws_db_instance.postgresql.identifier
  }
  
  tags = var.common_tags
}

resource "aws_cloudwatch_metric_alarm" "rds_connections" {
  alarm_name          = "${var.project_name}-${var.environment}-rds-high-connections"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "DatabaseConnections"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 50
  alarm_description   = "RDS connection count is too high"
  alarm_actions       = var.alarm_actions
  
  dimensions = {
    DBInstanceIdentifier = aws_db_instance.postgresql.identifier
  }
  
  tags = var.common_tags
}

resource "aws_cloudwatch_metric_alarm" "rds_storage" {
  alarm_name          = "${var.project_name}-${var.environment}-rds-low-storage"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 1
  metric_name         = "FreeStorageSpace"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 2147483648 # 2GB in bytes
  alarm_description   = "RDS free storage is running low"
  alarm_actions       = var.alarm_actions
  
  dimensions = {
    DBInstanceIdentifier = aws_db_instance.postgresql.identifier
  }
  
  tags = var.common_tags
}
