# FinAlly Development Environment Setup

> **Complete guide to setting up the FinAlly development environment from scratch**

This guide walks through the complete setup process for local development and AWS infrastructure deployment. Assumes familiarity with AWS, Node.js, and Terraform.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [AWS Account Setup](#aws-account-setup)
3. [Repository Cloning](#repository-cloning)
4. [Environment Configuration](#environment-configuration)
5. [Terraform Backend Initialization](#terraform-backend-initialization)
6. [Infrastructure Deployment](#infrastructure-deployment)
7. [Database Setup](#database-setup)
8. [Frontend Setup](#frontend-setup)
9. [Lambda Setup](#lambda-setup)
10. [Verification](#verification)
11. [Common Setup Issues](#common-setup-issues)

---

## Prerequisites

### Required Software

```bash
# Node.js 20.x
node --version  # Should show v20.x.x

# AWS CLI v2
aws --version   # Should show aws-cli/2.x.x

# Terraform 1.5+
terraform version  # Should show Terraform v1.5.x or higher

# PostgreSQL client (psql)
psql --version  # Should show psql (PostgreSQL) 12+

# Docker (for Lambda builds)
docker --version  # Should show Docker version 20+

# Git
git --version
```

### System Requirements

- **OS:** macOS, Linux, or WSL2 on Windows
- **RAM:** Minimum 8GB (16GB recommended)
- **Disk Space:** ~10GB for dependencies and Docker images
- **Network:** Stable internet connection for AWS API calls

### Knowledge Prerequisites

- AWS services (Lambda, RDS, VPC, Cognito)
- Terraform basics (modules, state management)
- Node.js/TypeScript development
- PostgreSQL administration
- Docker containerization

---

## AWS Account Setup

### 1. Create AWS Account

If you don't have an AWS account:
1. Visit https://aws.amazon.com/
2. Create new account
3. Add payment method (required even for Free Tier)
4. Verify email and phone number

### 2. Create IAM User

**Security Best Practice:** Don't use root account credentials

```bash
# Create IAM user with admin access (AWS Console)
# 1. Go to IAM → Users → Add User
# 2. Username: finally_user
# 3. Enable: Programmatic access
# 4. Attach policy: AdministratorAccess (or create custom policy)
# 5. Download credentials CSV
```

### 3. Configure AWS CLI

```bash
# Configure AWS profile
aws configure --profile finally_user

# Inputs:
# AWS Access Key ID: <from CSV>
# AWS Secret Access Key: <from CSV>
# Default region: eu-central-1
# Default output format: json

# Verify configuration
aws sts get-caller-identity --profile finally_user
# Should show your account ID and user ARN

# Set as default profile (optional)
export AWS_PROFILE=finally_user
echo 'export AWS_PROFILE=finally_user' >> ~/.bashrc  # or ~/.zshrc
```

### 4. Install Session Manager Plugin

Required for SSM Bastion access:

**macOS:**
```bash
brew install --cask session-manager-plugin
```

**Linux:**
```bash
curl "https://s3.amazonaws.com/session-manager-downloads/plugin/latest/ubuntu_64bit/session-manager-plugin.deb" -o "session-manager-plugin.deb"
sudo dpkg -i session-manager-plugin.deb
```

**Verify:**
```bash
session-manager-plugin
# Should show: The Session Manager plugin was installed successfully!
```

---

## Repository Cloning

```bash
# Clone repository
git clone <repository-url>
cd FinAlly

# Checkout development branch
git checkout dev

# Verify structure
ls -la
# Should see: frontend/, lambda/, terraform/, database/, scripts/, docs/
```

---

## Environment Configuration

### 1. Frontend Environment Variables

```bash
cd frontend
cp .env.example .env.local
```

**Edit `.env.local`:**
```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://z7rz9vksp6.execute-api.eu-central-1.amazonaws.com

# Cognito Configuration (will be populated after Terraform deployment)
NEXT_PUBLIC_COGNITO_USER_POOL_ID=eu-central-1_xxxxxxxxx
NEXT_PUBLIC_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_COGNITO_DOMAIN=finally-dev-xxxxxx
NEXT_PUBLIC_COGNITO_REGION=eu-central-1

# Optional: Analytics
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

**Note:** Cognito values will be available after step 6 (Infrastructure Deployment)

### 2. Lambda Environment Variables

Lambda environment variables are managed by Terraform and injected at runtime:
- `DATABASE_URL` - From Secrets Manager
- `COGNITO_USER_POOL_ID` - From Terraform output
- `COGNITO_WEB_CLIENT_ID` - From Terraform output
- `NODE_ENV` - Set to "production"

**No manual `.env` file needed for Lambda**

---

## Terraform Backend Initialization

The Terraform backend stores state in S3 with DynamoDB locking.

### 1. Initialize Backend Infrastructure

```bash
cd terraform/backend
terraform init
terraform plan  # Review resources to be created
terraform apply

# Outputs:
# - state_bucket_name: finally-terraform-state-<random>
# - lock_table_name: finally-terraform-locks
# - backend_config_file: Path to backend.tf config
```

### 2. Note the Backend Configuration

The backend outputs will be used in the next step. Example output:
```
state_bucket_name = "finally-terraform-state-abc123"
lock_table_name = "finally-terraform-locks"
```

**Security:** The S3 bucket has:
- Versioning enabled (state file history)
- Encryption at rest (AES-256)
- Public access blocked
- Lifecycle policy (90-day non-current version deletion)

---

## Infrastructure Deployment

### 1. Configure Backend for Dev Environment

```bash
cd ../environments/dev

# Verify backend configuration in backend.tf
cat backend.tf
# Should reference the S3 bucket and DynamoDB table created above
```

### 2. Initialize Terraform

```bash
terraform init

# Expected output:
# Initializing modules...
# Initializing the backend...
# Successfully configured the backend "s3"!
# Terraform has been successfully initialized!
```

### 3. Review Terraform Plan

```bash
terraform plan -out=tfplan

# Review the plan carefully:
# - ~60-70 resources will be created
# - VPC, subnets, NAT gateway, security groups
# - RDS PostgreSQL instance
# - Cognito User Pool
# - Lambda function
# - API Gateway
# - ECR repository
# - SSM Bastion
```

**Cost Estimate from Plan:**
- NAT Gateway: ~€32/month
- RDS t3.micro: €0 (Free Tier for 12 months)
- EC2 Bastion: ~€8/month (can terminate)
- Other services: Within Free Tier limits

### 4. Apply Terraform Configuration

```bash
terraform apply tfplan

# Deployment takes ~10-15 minutes
# Progress indicators:
# - VPC and networking: 2-3 minutes
# - RDS instance: 5-7 minutes
# - Cognito and Lambda: 2-3 minutes
# - Final configuration: 1-2 minutes
```

### 5. Capture Terraform Outputs

```bash
terraform output > ../../outputs.txt

# Important outputs:
terraform output cognito_user_pool_id
terraform output cognito_web_client_id
terraform output cognito_domain
terraform output api_invoke_url
terraform output database_endpoint
terraform output database_secret_arn
terraform output bastion_instance_id
```

**Update Frontend `.env.local`** with Cognito values from outputs.

---

## Database Setup

### 1. Verify Database is Running

```bash
# Check RDS instance status
aws rds describe-db-instances \
  --db-instance-identifier finally-dev-postgres \
  --query 'DBInstances[0].DBInstanceStatus' \
  --output text

# Should output: available
```

### 2. Run Database Migrations

```bash
cd ../../../scripts

# Make migration script executable
chmod +x apply_migration_ssm.sh

# Run initial schema migration
./apply_migration_ssm.sh database/migrations/001_complete_schema.sql

# Expected output:
# 📦 Applying migration: database/migrations/001_complete_schema.sql
# 🔐 Retrieving database credentials...
# 🔌 Starting SSM port forwarding on port 15432...
# 🚀 Applying migration...
# ✅ Migration applied successfully!
```

### 3. Run Subcategories Migration

```bash
./apply_migration_ssm.sh database/migrations/002_add_subcategories.sql

# This adds expense subcategories feature
```

### 4. Verify Database Schema

```bash
# Start SSM session to bastion
BASTION_ID=$(cd ../terraform/environments/dev && terraform output -raw bastion_instance_id)
aws ssm start-session --target "$BASTION_ID"

# On bastion, get database password
SECRET_ARN="arn:aws:secretsmanager:eu-central-1:197423061144:secret:finally/dev/rds-..."
DB_PASSWORD=$(aws secretsmanager get-secret-value \
  --secret-id "$SECRET_ARN" \
  --query 'SecretString' \
  --output text | jq -r '.password')

# Connect to PostgreSQL
export PGPASSWORD="$DB_PASSWORD"
export PGSSLMODE=require
psql -h finally-dev-postgres.cbu68y08s1ev.eu-central-1.rds.amazonaws.com \
     -U finally_admin -d finally

# Verify tables
\dt
# Should show: 14 tables
#  users, assets, asset_inputs, asset_categories, etc.

# Exit psql
\q

# Exit bastion session
exit
```

---

## Frontend Setup

### 1. Install Dependencies

```bash
cd ../frontend
npm install

# Expected: ~500-700 packages installed
# Time: 2-5 minutes depending on network
```

### 2. Verify Environment Configuration

```bash
cat .env.local
# Ensure all Cognito values are populated from Terraform outputs
```

### 3. Start Development Server

```bash
npm run dev

# Output:
#   ▲ Next.js 15.1.4
#   - Local:        http://localhost:3000
#   - Environments: .env.local
#
# ✓ Ready in 2.3s
```

### 4. Test Frontend

Open browser to `http://localhost:3000`

**Expected behavior:**
- Login page loads
- Cognito hosted UI redirects work
- After login, dashboard loads with empty state

**First Time Setup:**
```bash
# Create test user via Cognito admin script
cd ../scripts
./cognito_admin.sh create-user test@example.com TempPassword123!

# Or use Cognito Hosted UI to sign up
```

---

## Lambda Setup

### 1. Install Dependencies

```bash
cd ../lambda
npm install

# Expected: ~150-200 packages installed
```

### 2. Generate Prisma Client

```bash
npx prisma generate

# Output:
# ✔ Generated Prisma Client (v6.0.1) to ./node_modules/.prisma/client
```

### 3. Build Lambda Function

```bash
npm run build

# Output:
# > esbuild src/index.ts --bundle --platform=node --target=node20 ...
# dist/index.js  81.6kb
# ⚡ Done in 33ms
```

### 4. Build and Push Docker Image

```bash
# Login to ECR
chmod +x push-to-ecr.sh
./push-to-ecr.sh

# Process:
# 1. Authenticates with ECR
# 2. Builds Docker image
# 3. Tags image
# 4. Pushes to ECR
# 5. Lambda auto-updates from ECR:latest

# Time: 3-5 minutes (first build, then ~1-2 minutes)
```

### 5. Verify Lambda Deployment

```bash
# Check Lambda function status
aws lambda get-function \
  --function-name finally-dev-api \
  --query 'Configuration.LastUpdateStatus' \
  --output text

# Should output: Successful

# Test health endpoint
curl https://z7rz9vksp6.execute-api.eu-central-1.amazonaws.com/health

# Expected response:
# {
#   "success": true,
#   "data": {
#     "status": "healthy",
#     "timestamp": "2025-12-05T10:00:00.000Z",
#     "service": "FinAlly API"
#   },
#   "meta": {
#     "timestamp": "2025-12-05T10:00:00.000Z"
#   }
# }
```

---

## Verification

### Complete System Test

```bash
# 1. Frontend is running
curl http://localhost:3000
# Should return HTML page

# 2. API health check
curl https://<api-gateway-url>/health
# Should return JSON with status: healthy

# 3. Database connectivity (via Prisma Studio)
cd lambda
npx prisma studio
# Opens http://localhost:5555 with database GUI

# 4. Authentication flow
# - Open http://localhost:3000
# - Click "Login"
# - Should redirect to Cognito hosted UI
# - After login, should return to dashboard

# 5. Test authenticated API call
cd ../scripts
./test_api.sh
# Prompts for username/password
# Tests /users/me endpoint
```

### Infrastructure Verification Checklist

- [ ] VPC created with public/private subnets in 2 AZs
- [ ] NAT Gateway operational
- [ ] RDS PostgreSQL accessible from bastion
- [ ] Lambda function deployed and responding
- [ ] API Gateway endpoints configured
- [ ] Cognito User Pool active
- [ ] ECR repository contains Lambda image
- [ ] SSM Bastion accessible
- [ ] Database migrations applied (14 tables)
- [ ] Frontend connects to API successfully
- [ ] User authentication works end-to-end

---

## Common Setup Issues

### Issue: Terraform Init Fails

**Error:** `Backend configuration changed`

**Solution:**
```bash
terraform init -reconfigure
```

### Issue: AWS CLI Not Configured

**Error:** `Unable to locate credentials`

**Solution:**
```bash
# Verify profile exists
aws configure list --profile finally_user

# If missing, reconfigure
aws configure --profile finally_user

# Set as active profile
export AWS_PROFILE=finally_user
```

### Issue: RDS Instance Creation Times Out

**Symptoms:** Terraform hangs at "Creating RDS instance"

**Cause:** RDS instances take 5-10 minutes to create

**Solution:** Wait patiently. Check AWS Console RDS page for progress.

### Issue: Lambda Deployment Fails

**Error:** `Error: ResourceConflictException: The operation cannot be performed`

**Solution:**
```bash
# Lambda might be updating from previous deployment
# Wait 2-3 minutes and retry

# Or force update
aws lambda update-function-code \
  --function-name finally-dev-api \
  --image-uri <ecr-image-uri>:latest \
  --publish
```

### Issue: Cannot Connect to Database

**Error:** `Connection timeout`

**Troubleshooting:**
```bash
# 1. Verify bastion is running
aws ec2 describe-instances --instance-ids <bastion-id>

# 2. Check security group allows bastion → RDS
aws ec2 describe-security-groups --group-ids <db-security-group-id>

# 3. Verify RDS endpoint is correct
aws rds describe-db-instances \
  --db-instance-identifier finally-dev-postgres \
  --query 'DBInstances[0].Endpoint.Address'

# 4. Test from bastion
aws ssm start-session --target <bastion-id>
# Then: telnet <db-endpoint> 5432
```

### Issue: Frontend Can't Connect to API

**Error:** CORS errors or network failures

**Troubleshooting:**
```bash
# 1. Verify API Gateway URL in .env.local
cat frontend/.env.local | grep API_URL

# 2. Test API directly
curl https://<api-url>/health

# 3. Check browser console for CORS errors

# 4. Verify API Gateway CORS configuration
aws apigatewayv2 get-api --api-id <api-id>
```

### Issue: Cognito Login Redirects Fail

**Error:** `redirect_mismatch` or invalid client

**Solution:**
```bash
# 1. Verify callback URLs in Cognito
aws cognito-idp describe-user-pool-client \
  --user-pool-id <pool-id> \
  --client-id <client-id> \
  --query 'UserPoolClient.CallbackURLs'

# Should include: http://localhost:3000/login

# 2. Update if needed via Terraform
# Edit terraform/environments/dev/main.tf
# Add to cognito module callback_urls

# 3. Apply changes
cd terraform/environments/dev
terraform apply
```

### Issue: Docker Build Fails

**Error:** `Cannot connect to Docker daemon`

**Solution:**
```bash
# Start Docker service
sudo systemctl start docker

# Add user to docker group (Linux)
sudo usermod -aG docker $USER
newgrp docker

# macOS: Start Docker Desktop
```

### Issue: Node Modules Installation Fails

**Error:** `EACCES: permission denied`

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and lock file
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

---

## Next Steps

After successful setup:

1. **Explore the Application**
   - Create your first asset in the dashboard
   - Add income and expense entries
   - Set budget targets

2. **Review Documentation**
   - [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - System design
   - [docs/API.md](docs/API.md) - API reference
   - [frontend/DEVELOPMENT.md](frontend/DEVELOPMENT.md) - Frontend dev guide
   - [lambda/DEVELOPMENT.md](lambda/DEVELOPMENT.md) - Backend dev guide

3. **Start Developing**
   - [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
   - Make your first code change
   - Submit a pull request

4. **Optional: Terminate Bastion**
   ```bash
   # Bastion costs ~€8/month when running
   # Terminate when not performing migrations

   aws ec2 terminate-instances --instance-ids <bastion-id>

   # Recreate when needed via Terraform
   ```

---

## Cost Monitoring

After setup, monitor costs:

```bash
# View current month costs
aws ce get-cost-and-usage \
  --time-period Start=2025-12-01,End=2025-12-31 \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=SERVICE

# Set up billing alert
aws budgets create-budget \
  --account-id <account-id> \
  --budget file://budget-alert.json

# Example budget-alert.json: Set €50/month threshold
```

---

## Getting Help

**Troubleshooting:**
- [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)

**Community:**
- GitHub Issues: Report bugs and request features
- Documentation: Check component-specific READMEs

**AWS Resources:**
- [AWS Free Tier](https://aws.amazon.com/free/)
- [AWS Cost Calculator](https://calculator.aws/)
- [Terraform AWS Provider Docs](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)

---

**Setup Complete!** 🎉

Your FinAlly development environment is ready. Happy coding!
