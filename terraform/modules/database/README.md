# RDS PostgreSQL Module (AWS Free Tier)

## Overview
Provisions RDS PostgreSQL instance optimized for AWS Free Tier during development phase.

## Free Tier Limits (12 months)
- **Instance Hours**: 750 hours/month of db.t3.micro or db.t4g.micro
- **Storage**: 20 GB General Purpose (SSD) storage
- **Backups**: 20 GB backup storage
- **Data Transfer**: 15 GB outbound per month

## Architecture
```
RDS PostgreSQL 16
├── Instance: db.t3.micro (1 vCPU, 1 GiB RAM)
├── Storage: 20 GB gp3 (encrypted)
├── Backups: 1-day retention
├── Secrets Manager: Credentials
└── CloudWatch Alarms: CPU, Connections, Storage
```

## Configuration
- **Engine**: PostgreSQL 16.4 (latest stable 2025)
- **Instance**: db.t3.micro (Free Tier eligible)
- **Storage**: 20 GB gp3 (Free Tier maximum)
- **Multi-AZ**: Disabled (not free tier)
- **Performance Insights**: Disabled (not free tier)
- **Enhanced Monitoring**: Disabled (not free tier)
- **Encryption**: Enabled at rest

## Cost
- **Free Tier (first 12 months)**: $0/month
- **After Free Tier**: ~$15-20/month
- **NAT Gateway**: ~$32/month (if enabled)
- **Total estimated**: ~$32-52/month after free tier

## Features

### PostgreSQL 16 Improvements
- Enhanced performance with parallel query execution
- Improved JSON support
- Better indexing strategies
- Logical replication improvements
- SQL/JSON standard support

### Security
- ✅ Encryption at rest (AES-256)
- ✅ Encryption in transit (SSL/TLS required)
- ✅ Secrets Manager credential management
- ✅ VPC isolation (private subnets only)
- ✅ Security group ingress (Lambda only)

### Monitoring
- ✅ CloudWatch Logs (PostgreSQL, upgrade logs)
- ✅ CloudWatch Alarms (CPU, connections, storage)
- ✅ Automated backup monitoring

### Backup & Recovery
- ✅ Automated daily backups (1-day retention for free tier)
- ✅ Point-in-time recovery available
- ✅ Optional final snapshot on deletion

## Usage
```hcl
module "database" {
  source = "../../modules/database"
  
  project_name          = "finally"
  environment           = "dev"
  db_subnet_group_name  = module.networking.db_subnet_group_name
  rds_security_group_id = module.security_groups.database_security_group_id
  
  # Database Configuration
  database_name   = "finally"
  master_username = "finally_admin"
  engine_version  = "16.4" # PostgreSQL 16.4
  
  # Free Tier Configuration
  instance_class        = "db.t3.micro"
  allocated_storage     = 20
  backup_retention_days = 1
  
  # Dev Settings
  skip_final_snapshot = true
  deletion_protection = false
  apply_immediately   = true
  
  common_tags = local.common_tags
}
```

## Accessing the Database

### From Lambda (Prisma)
```javascript
// Lambda reads credentials from Secrets Manager
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({ region: "eu-central-1" });
const response = await client.send(
  new GetSecretValueCommand({ SecretId: process.env.DB_SECRET_ARN })
);
const credentials = JSON.parse(response.SecretString);

// Prisma connection string
const DATABASE_URL = `postgresql://${credentials.username}:${credentials.password}@${credentials.host}:${credentials.port}/${credentials.dbname}?sslmode=require`;
```

### Connection String Format
```
postgresql://finally_admin:PASSWORD@finally-dev-postgres.xxxxx.eu-central-1.rds.amazonaws.com:5432/finally?sslmode=require
```

**Important**: Always use `sslmode=require` for encrypted connections.

## Migration Path

### To Aurora Serverless v2 (Production)
When ready for production or free tier expires:
```bash
# 1. Create snapshot
aws rds create-db-snapshot \
  --db-instance-identifier finally-dev-postgres \
  --db-snapshot-identifier finally-migration-snapshot

# 2. Restore to Aurora (via Terraform)
# Update module source to aurora module
# Apply terraform changes

# 3. Update Lambda environment variables
# 4. Test thoroughly
# 5. Decommission RDS instance
```

## Monitoring Free Tier Usage
```bash
# Check RDS free tier usage
aws ce get-cost-and-usage \
  --time-period Start=2025-01-01,End=2025-02-01 \
  --granularity MONTHLY \
  --metrics UsageQuantity \
  --filter file://<(echo '{"Dimensions":{"Key":"SERVICE","Values":["Amazon Relational Database Service"]}}')

# Monitor storage usage
aws cloudwatch get-metric-statistics \
  --namespace AWS/RDS \
  --metric-name FreeStorageSpace \
  --dimensions Name=DBInstanceIdentifier,Value=finally-dev-postgres \
  --start-time $(date -u -d '7 days ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 86400 \
  --statistics Average
```

## Troubleshooting

### Connection Issues
```bash
# Test connectivity from Lambda security group
# Verify security group rules allow 5432 from Lambda SG

# Check RDS instance status
aws rds describe-db-instances \
  --db-instance-identifier finally-dev-postgres \
  --query 'DBInstances[0].[DBInstanceStatus,Endpoint.Address]'

# Retrieve credentials
SECRET_ARN=$(terraform output -raw database_secret_arn)
aws secretsmanager get-secret-value --secret-id $SECRET_ARN
```

### Performance Tuning
For free tier instances, optimize queries:
- Use appropriate indexes
- Limit result sets
- Use connection pooling (Prisma Accelerate)
- Avoid N+1 queries

## Important Notes

1. **Free Tier Countdown**: Starts from AWS account creation date
2. **Storage Limit**: 20GB hard limit, monitor usage regularly
3. **Backup Retention**: 1 day minimum for free tier
4. **No Multi-AZ**: Single instance only in free tier
5. **No Performance Insights**: Not included in free tier
