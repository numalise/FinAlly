variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "db_subnet_group_name" {
  description = "DB subnet group name from networking module"
  type        = string
}

variable "rds_security_group_id" {
  description = "Security group ID for RDS instance"
  type        = string
}

# Database Configuration
variable "database_name" {
  description = "Name of the initial database"
  type        = string
  default     = "finally"
}

variable "master_username" {
  description = "Master username for the database"
  type        = string
  default     = "finally_admin"
}

variable "port" {
  description = "Database port"
  type        = number
  default     = 5432
}

# Engine Configuration
variable "engine_version" {
  description = "PostgreSQL engine version (latest stable for 2025)"
  type        = string
  default     = "16" # Latest stable PostgreSQL version as of 2025
}

variable "instance_class" {
  description = "RDS instance class (Free Tier: db.t3.micro or db.t4g.micro)"
  type        = string
  default     = "db.t3.micro"
}

# Storage Configuration (Free Tier: 20GB)
variable "allocated_storage" {
  description = "Allocated storage in GB (Free Tier: up to 20GB)"
  type        = number
  default     = 20
}

variable "max_allocated_storage" {
  description = "Maximum storage for autoscaling (0 to disable)"
  type        = number
  default     = 0
}

# Backup Configuration (Free Tier: minimum 1 day)
variable "backup_retention_days" {
  description = "Backup retention days (Free Tier: 1-7)"
  type        = number
  default     = 1
}

variable "backup_window" {
  description = "Preferred backup window (UTC)"
  type        = string
  default     = "03:00-04:00"
}

variable "maintenance_window" {
  description = "Preferred maintenance window (UTC)"
  type        = string
  default     = "sun:04:00-sun:05:00"
}

variable "skip_final_snapshot" {
  description = "Skip final snapshot when destroying instance"
  type        = bool
  default     = false
}

# Security
variable "kms_key_arn" {
  description = "KMS key ARN for encryption (optional)"
  type        = string
  default     = ""
}

variable "secret_recovery_window_days" {
  description = "Secrets Manager recovery window in days"
  type        = number
  default     = 7
}

variable "deletion_protection" {
  description = "Enable deletion protection"
  type        = bool
  default     = false
}

# Monitoring
variable "alarm_actions" {
  description = "List of ARNs for CloudWatch alarm actions"
  type        = list(string)
  default     = []
}

# Operational
variable "apply_immediately" {
  description = "Apply changes immediately"
  type        = bool
  default     = true
}

variable "auto_minor_version_upgrade" {
  description = "Enable automatic minor version upgrades"
  type        = bool
  default     = true
}

variable "timezone" {
  description = "Database timezone"
  type        = string
  default     = "UTC"
}

variable "common_tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default     = {}
}
