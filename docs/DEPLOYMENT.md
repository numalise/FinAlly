# Deployment Guide

> **Production-ready deployment procedures for the FinAlly platform**

Comprehensive guide covering infrastructure deployment, Lambda updates, database migrations, and rollback procedures across dev, staging, and production environments.

**Last Updated:** December 2025

---

## Table of Contents

1. [Deployment Overview](#deployment-overview)
2. [Environment Strategy](#environment-strategy)
3. [Pre-Deployment Checklist](#pre-deployment-checklist)
4. [Infrastructure Deployment](#infrastructure-deployment)
5. [Database Migrations](#database-migrations)
6. [Lambda Deployment](#lambda-deployment)
7. [Frontend Deployment](#frontend-deployment)
8. [Post-Deployment Verification](#post-deployment-verification)
9. [Rollback Procedures](#rollback-procedures)
10. [Production Deployment](#production-deployment)
11. [CI/CD Pipeline](#cicd-pipeline)
12. [Monitoring](#monitoring)

---

## Deployment Overview

### Deployment Architecture

```
Developer Local → Git Push → GitHub
                              │
                              ▼
                         GitHub Actions (Phase 6)
                              │
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
         Dev Environment              Staging Environment
         (Auto-deploy)                (Manual trigger)
              │                               │
              │                               ▼
              │                        Production Environment
              │                        (Manual trigger + approval)
              │
              └─── Manual deployment (Phase 5) ───┘
```

### Components

**Infrastructure (Terraform):**
- VPC, subnets, security groups
- RDS PostgreSQL database
- Lambda function
- API Gateway
- Cognito User Pool
- ECR repository

**Application (Lambda):**
- Node.js 20 runtime
- Docker container image
- Prisma ORM
- API route handlers

**Frontend (Next.js):**
- React 18 application
- Server-side rendering
- Static asset optimization

---

## Environment Strategy

### Environments

| Environment | Purpose | Branch | Auto-Deploy | URL |
|-------------|---------|--------|-------------|-----|
| **Dev** | Active development | `dev` | Yes (Phase 6) | `finally-dev.example.com` |
| **Staging** | Pre-production testing | `staging` | No | `finally-staging.example.com` |
| **Production** | Live user-facing | `main` | No | `finally.com` |

### Environment Differences

**Dev:**
- Single NAT Gateway (one AZ)
- t3.micro RDS instance
- No provisioned concurrency
- 7-day log retention
- Debug logging enabled

**Staging:**
- Multi-AZ NAT Gateway
- t3.small RDS instance
- Provisioned concurrency (2 instances)
- 14-day log retention
- Info-level logging

**Production:**
- Multi-AZ NAT Gateway + failover
- t3.medium RDS instance (Multi-AZ)
- Provisioned concurrency (5 instances)
- 30-day log retention
- Error-only logging
- RDS Proxy for connection pooling
- CloudFront CDN
- WAF enabled

---

## Pre-Deployment Checklist

### Code Quality

- [ ] All tests pass (Phase 6+)
- [ ] TypeScript compiles without errors
- [ ] ESLint passes without warnings
- [ ] Code reviewed and approved
- [ ] Branch up-to-date with target branch

### Documentation

- [ ] API documentation updated (if endpoints changed)
- [ ] Architecture docs updated (if design changed)
- [ ] Migration guide written (if breaking changes)
- [ ] CHANGELOG.md updated

### Infrastructure

- [ ] Terraform plan reviewed
- [ ] No unexpected resource deletions
- [ ] Cost impact estimated
- [ ] Backup created (if major change)

### Database

- [ ] Migration tested on dev database
- [ ] Migration has rollback script
- [ ] Indexes created for new columns
- [ ] No blocking operations (large table locks)

### Communication

- [ ] Stakeholders notified (if production)
- [ ] Maintenance window scheduled (if downtime)
- [ ] Rollback plan documented
- [ ] On-call engineer available

---

## Infrastructure Deployment

### Initial Deployment (Dev Environment)

**Step 1: Deploy Terraform Backend**

```bash
cd terraform/backend
terraform init
terraform plan
terraform apply

# Note the outputs
terraform output state_bucket_name
terraform output lock_table_name
```

**Step 2: Configure Dev Environment**

```bash
cd ../environments/dev

# Edit backend.tf with bucket name from previous step
vim backend.tf

# Edit terraform.tfvars with environment-specific values
vim terraform.tfvars
```

**terraform.tfvars:**
```hcl
project_name = "finally"
environment  = "dev"
aws_region   = "eu-central-1"

# VPC Configuration
vpc_cidr = "10.0.0.0/16"

# RDS Configuration
db_instance_class    = "db.t3.micro"
db_allocated_storage = 20
db_name              = "finally"
db_username          = "finally_admin"

# Lambda Configuration
lambda_memory_size = 512
lambda_timeout     = 30

# Tags
common_tags = {
  Project     = "FinAlly"
  Environment = "dev"
  ManagedBy   = "Terraform"
}
```

**Step 3: Initialize and Deploy**

```bash
terraform init
terraform plan -out=tfplan
terraform apply tfplan
```

**Step 4: Capture Outputs**

```bash
# Save outputs for later use
terraform output > ../../outputs-dev.txt

# Key outputs needed:
terraform output cognito_user_pool_id
terraform output cognito_web_client_id
terraform output cognito_domain
terraform output api_invoke_url
terraform output database_endpoint
terraform output database_secret_arn
terraform output bastion_instance_id
terraform output ecr_repository_url
```

### Infrastructure Updates

**Step 1: Review Changes**

```bash
cd terraform/environments/dev
git pull origin dev
terraform plan
```

**Step 2: Estimate Cost Impact**

Use Terraform plan output to estimate cost changes:
- New resources: Calculate monthly cost
- Deleted resources: Calculate savings
- Modified resources: Calculate difference

**Step 3: Apply Changes**

```bash
terraform apply

# For production, require approval:
terraform apply -auto-approve=false
```

**Step 4: Verify Changes**

```bash
# Check resource status
aws lambda get-function --function-name finally-dev-api
aws rds describe-db-instances --db-instance-identifier finally-dev-postgres
aws apigatewayv2 get-api --api-id <api-id>
```

---

## Database Migrations

### Migration Workflow

```
1. Write migration SQL → 2. Test on dev → 3. Apply to dev
                                             │
                                             ▼
                        4. Test application → 5. Deploy to staging
                                             │
                                             ▼
                        6. Test on staging → 7. Deploy to production
```

### Applying Migrations

**Dev Environment:**

```bash
cd scripts

# Apply migration via SSM bastion
./apply_migration_ssm.sh database/migrations/003_add_feature.sql

# Output:
# 📦 Applying migration: database/migrations/003_add_feature.sql
# 🔐 Retrieving database credentials...
# 🔌 Starting SSM port forwarding on port 15432...
# 🚀 Applying migration...
# ✅ Migration applied successfully!
```

**Staging/Production:**

```bash
# Set environment
export ENV=staging  # or production

# Review migration first
cat database/migrations/003_add_feature.sql

# Apply with extra caution
./apply_migration_ssm.sh database/migrations/003_add_feature.sql --environment=$ENV

# Verify schema
aws ssm start-session --target <bastion-id>
psql -h <db-host> -U finally_admin -d finally
\dt  # List tables
\d table_name  # Describe table
```

### Migration Best Practices

**Safe migrations:**
- Add columns (with defaults)
- Create indexes CONCURRENTLY
- Add constraints as NOT VALID, then VALIDATE later

**Unsafe migrations (require downtime):**
- Drop columns
- Rename columns
- Add NOT NULL constraints without defaults
- Change column types

**Rollback migrations:**

Always write down migration:

```sql
-- Up migration (003_add_status.sql)
BEGIN;
ALTER TABLE expense_items ADD COLUMN status VARCHAR(20) DEFAULT 'pending';
COMMIT;

-- Down migration (003_add_status_down.sql)
BEGIN;
ALTER TABLE expense_items DROP COLUMN status;
COMMIT;
```

### Zero-Downtime Migrations

**Strategy for adding NOT NULL column:**

```sql
-- Step 1: Add column as nullable
ALTER TABLE expense_items ADD COLUMN status VARCHAR(20);

-- Step 2: Backfill existing rows (in batches)
UPDATE expense_items SET status = 'pending' WHERE status IS NULL LIMIT 1000;
-- Repeat until all rows updated

-- Step 3: Add NOT NULL constraint
ALTER TABLE expense_items ALTER COLUMN status SET NOT NULL;

-- Step 4: Add default for new rows
ALTER TABLE expense_items ALTER COLUMN status SET DEFAULT 'pending';
```

**Strategy for creating large indexes:**

```sql
-- Use CONCURRENTLY to avoid blocking writes
CREATE INDEX CONCURRENTLY idx_expense_items_date ON expense_items(date);
```

---

## Lambda Deployment

### Build and Deploy

**Step 1: Build Docker Image**

```bash
cd lambda

# Ensure dependencies installed
npm install

# Generate Prisma client
npx prisma generate

# Build TypeScript
npm run build

# Verify build output
ls -lh dist/index.js
```

**Step 2: Push to ECR**

```bash
# Run deployment script
./push-to-ecr.sh

# Script performs:
# 1. AWS ECR login
# 2. Docker build (multi-stage)
# 3. Tag image as :latest
# 4. Push to ECR
# 5. Lambda auto-updates
```

**Manual ECR push (if script fails):**

```bash
# Get ECR repository URL
ECR_REPO=$(cd ../terraform/environments/dev && terraform output -raw ecr_repository_url)

# Login to ECR
aws ecr get-login-password --region eu-central-1 | \
  docker login --username AWS --password-stdin $ECR_REPO

# Build image
docker build --platform linux/amd64 -t finally-api:latest .

# Tag image
docker tag finally-api:latest $ECR_REPO:latest

# Push image
docker push $ECR_REPO:latest
```

**Step 3: Verify Lambda Update**

```bash
# Check update status
aws lambda get-function-configuration \
  --function-name finally-dev-api \
  --query 'LastUpdateStatus' \
  --output text

# Should output: Successful

# Check image digest
aws lambda get-function \
  --function-name finally-dev-api \
  --query 'Code.ImageUri'
```

**Step 4: Test Lambda**

```bash
# Test health endpoint
curl https://z7rz9vksp6.execute-api.eu-central-1.amazonaws.com/health

# Test authenticated endpoint
TOKEN="<jwt-token>"
curl -H "Authorization: Bearer $TOKEN" \
  https://z7rz9vksp6.execute-api.eu-central-1.amazonaws.com/users/me
```

### Lambda Version Management

**Create version alias:**

```bash
# Publish new version
VERSION=$(aws lambda publish-version \
  --function-name finally-dev-api \
  --query 'Version' \
  --output text)

echo "Published version: $VERSION"

# Create/update alias
aws lambda update-alias \
  --function-name finally-dev-api \
  --name production \
  --function-version $VERSION
```

**Blue-Green Deployment (Production):**

```bash
# Deploy new version to staging alias
aws lambda update-alias \
  --function-name finally-prod-api \
  --name staging \
  --function-version $NEW_VERSION

# Test staging alias
curl https://staging.api.finally.com/health

# If successful, shift production traffic
aws lambda update-alias \
  --function-name finally-prod-api \
  --name production \
  --function-version $NEW_VERSION \
  --routing-config AdditionalVersionWeights={"$OLD_VERSION"=0.1}

# Gradually shift traffic: 90/10, 50/50, 0/100
# Monitor metrics between shifts
```

---

## Frontend Deployment

### Development Build

```bash
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Output in .next/ directory
```

### Deployment Options

**Option 1: Vercel (Recommended for Phase 5)**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

**Option 2: AWS S3 + CloudFront (Production)**

```bash
# Build static export
npm run build
npm run export  # Generates out/ directory

# Upload to S3
aws s3 sync out/ s3://finally-frontend-bucket/ \
  --delete \
  --cache-control "public,max-age=31536000,immutable"

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id E1234ABCD5678 \
  --paths "/*"
```

**Option 3: Docker Container (Alternative)**

```bash
# Build Docker image
docker build -t finally-frontend:latest .

# Push to ECR
docker tag finally-frontend:latest $ECR_REPO:latest
docker push $ECR_REPO:latest

# Deploy to ECS Fargate or Lambda
```

### Environment Variables

**Production frontend:**

```bash
# .env.production
NEXT_PUBLIC_API_URL=https://api.finally.com
NEXT_PUBLIC_COGNITO_USER_POOL_ID=eu-central-1_PRODPOOL
NEXT_PUBLIC_COGNITO_CLIENT_ID=prodclientid123
NEXT_PUBLIC_COGNITO_DOMAIN=finally-prod
NEXT_PUBLIC_COGNITO_REGION=eu-central-1
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

---

## Post-Deployment Verification

### Automated Checks

**Health check:**

```bash
# API health
curl https://api.finally.com/health | jq .

# Expected: {"success": true, "data": {"status": "healthy"}}
```

**Smoke tests:**

```bash
# Test critical endpoints
./scripts/smoke_tests.sh

# Tests:
# - /health (no auth)
# - /users/me (with auth)
# - /assets (CRUD operations)
# - /expenses (CRUD operations)
```

### Manual Verification

**Frontend:**
- [ ] Login page loads
- [ ] Authentication flow works
- [ ] Dashboard displays data
- [ ] CRUD operations work
- [ ] No console errors

**API:**
- [ ] All endpoints respond
- [ ] Authentication works
- [ ] Database queries succeed
- [ ] No 500 errors in logs

**Infrastructure:**
- [ ] Lambda executions successful
- [ ] Database connections stable
- [ ] No CloudWatch alarms triggered
- [ ] Cost metrics within budget

### Monitoring Dashboards

**CloudWatch Dashboard:**

```bash
# View Lambda metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --dimensions Name=FunctionName,Value=finally-prod-api \
  --start-time 2025-12-05T00:00:00Z \
  --end-time 2025-12-05T23:59:59Z \
  --period 3600 \
  --statistics Sum

# View API Gateway metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApiGateway \
  --metric-name Count \
  --dimensions Name=ApiId,Value=<api-id> \
  --start-time 2025-12-05T00:00:00Z \
  --end-time 2025-12-05T23:59:59Z \
  --period 3600 \
  --statistics Sum
```

---

## Rollback Procedures

### Lambda Rollback

**Rollback to previous version:**

```bash
# List recent versions
aws lambda list-versions-by-function \
  --function-name finally-prod-api \
  --max-items 5

# Rollback to previous version
aws lambda update-alias \
  --function-name finally-prod-api \
  --name production \
  --function-version $PREVIOUS_VERSION

# Verify rollback
curl https://api.finally.com/health
```

**Rollback via ECR:**

```bash
# List recent images
aws ecr list-images \
  --repository-name finally-prod-api \
  --filter tagStatus=TAGGED

# Retag previous image as :latest
aws ecr batch-get-image \
  --repository-name finally-prod-api \
  --image-ids imageTag=$PREVIOUS_TAG \
  --output text \
  --query 'images[].imageManifest' | \
aws ecr put-image \
  --repository-name finally-prod-api \
  --image-tag latest \
  --image-manifest -

# Lambda auto-updates
```

### Database Rollback

**Rollback migration:**

```bash
# Apply down migration
./apply_migration_ssm.sh database/migrations/003_add_feature_down.sql

# Verify schema reverted
psql -h <db-host> -U finally_admin -d finally
\d table_name
```

**Restore from backup (if migration destructive):**

```bash
# List recent snapshots
aws rds describe-db-snapshots \
  --db-instance-identifier finally-prod-postgres \
  --query 'DBSnapshots[*].[DBSnapshotIdentifier,SnapshotCreateTime]'

# Restore from snapshot (CREATES NEW INSTANCE)
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier finally-prod-postgres-restored \
  --db-snapshot-identifier finally-prod-postgres-snapshot-2025-12-05

# Update Lambda DATABASE_URL to point to restored instance
# Update DNS/endpoint in Terraform
```

### Infrastructure Rollback

**Rollback Terraform changes:**

```bash
cd terraform/environments/prod

# View Terraform state history
terraform state list

# Revert to previous commit
git log --oneline terraform/
git checkout <previous-commit> terraform/

# Apply previous state
terraform plan
terraform apply
```

---

## Production Deployment

### Production Checklist

**Pre-Deployment (24h before):**
- [ ] Staging environment fully tested
- [ ] Load testing completed
- [ ] Security scan passed
- [ ] Backup created
- [ ] Rollback plan documented
- [ ] Stakeholders notified
- [ ] Maintenance window scheduled
- [ ] On-call engineer assigned

**During Deployment:**
- [ ] Monitor CloudWatch metrics
- [ ] Watch error rates
- [ ] Check database connections
- [ ] Verify API response times
- [ ] Test critical user flows

**Post-Deployment:**
- [ ] Smoke tests passed
- [ ] No alarms triggered
- [ ] User feedback monitored
- [ ] Metrics returned to baseline
- [ ] Documentation updated
- [ ] Deployment notes logged

### Production Deployment Steps

**1. Final Staging Verification:**

```bash
# Run comprehensive tests on staging
./scripts/integration_tests.sh staging
./scripts/load_tests.sh staging
```

**2. Create Database Backup:**

```bash
aws rds create-db-snapshot \
  --db-instance-identifier finally-prod-postgres \
  --db-snapshot-identifier finally-prod-postgres-$(date +%Y%m%d-%H%M%S)
```

**3. Apply Database Migration (if needed):**

```bash
# During maintenance window
./apply_migration_ssm.sh database/migrations/003_add_feature.sql --environment=production
```

**4. Deploy Lambda:**

```bash
cd lambda
./push-to-ecr.sh --environment=production

# Verify update
aws lambda get-function-configuration \
  --function-name finally-prod-api \
  --query 'LastUpdateStatus'
```

**5. Deploy Frontend:**

```bash
cd frontend
npm run build
vercel --prod  # or S3 sync
```

**6. Smoke Tests:**

```bash
./scripts/smoke_tests.sh production
```

**7. Monitor for 30 minutes:**

Watch CloudWatch metrics, error logs, and user activity.

**8. All-Clear or Rollback:**

If issues detected, execute rollback procedures immediately.

---

## CI/CD Pipeline

### GitHub Actions Workflow (Phase 6)

**.github/workflows/deploy-dev.yml:**

```yaml
name: Deploy to Dev

on:
  push:
    branches: [dev]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Install dependencies
        run: |
          cd lambda && npm install
          cd ../frontend && npm install
      - name: Run tests
        run: |
          cd lambda && npm test
          cd ../frontend && npm test
      - name: Type check
        run: |
          cd lambda && npm run type-check
          cd ../frontend && npm run type-check

  deploy-lambda:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: eu-central-1
      - name: Build and push to ECR
        run: |
          cd lambda
          ./push-to-ecr.sh

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Build frontend
        run: |
          cd frontend
          npm install
          npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## Monitoring

### Key Metrics

**Lambda:**
- Invocations per minute
- Duration (p50, p90, p99)
- Error rate
- Throttles
- Concurrent executions

**API Gateway:**
- Request count
- Latency (p50, p90, p99)
- 4XX error rate
- 5XX error rate

**RDS:**
- CPU utilization
- Database connections
- Read/write latency
- Storage usage

### Alerts

**Critical alerts (PagerDuty):**
- API 5XX error rate > 1%
- Lambda error rate > 5%
- Database CPU > 90%
- Database connections > 90% of max

**Warning alerts (Email):**
- API latency p99 > 2s
- Lambda cold starts > 10/min
- Database storage > 80%

---

## Further Reading

- [SETUP.md](../SETUP.md) - Initial environment setup
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues
- [database/MIGRATIONS.md](../database/MIGRATIONS.md) - Migration guide
- [AWS Lambda Deployment](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-package.html)
- [Terraform Best Practices](https://www.terraform.io/docs/cloud/guides/recommended-practices/index.html)

---

**Deployment Guide Version:** 1.0 (Phase 5)
**Last Updated:** December 2025
