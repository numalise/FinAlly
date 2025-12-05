# Scripts Documentation

> **Utility scripts for FinAlly development and operations**

Collection of bash scripts for common administrative, testing, and operational tasks.

**Last Updated:** December 2025

---

## Overview

The `/scripts` directory contains operational utilities for:
- **Cognito user management** - Creating, listing, and managing users
- **API testing** - Testing authenticated endpoints
- **Database migrations** - Applying schema changes (referenced in docs)

---

## Available Scripts

### 1. cognito_admin.sh

**Purpose:** Interactive Cognito User Pool administration tool

**Features:**
- Create new users with email verification
- List all users with status
- Delete users
- Reset user passwords
- Confirm user signups
- Enable/disable user accounts
- View detailed user information

**Usage:**

```bash
cd scripts
./cognito_admin.sh

# Interactive menu:
# ========================================
# Cognito User Management
# ========================================
#
# 1. Create new user
# 2. List all users
# 3. Delete user
# 4. Reset user password
# 5. Confirm user signup
# 6. Enable/disable user
# 7. Get user details
# 8. Exit
```

**Prerequisites:**
- AWS CLI configured with valid credentials
- Terraform outputs available in `terraform/environments/dev`
- Permissions to manage Cognito User Pool

**How It Works:**

1. **Retrieves Cognito configuration from Terraform:**
```bash
USER_POOL_ID=$(terraform output -raw cognito_user_pool_id)
CLIENT_ID=$(terraform output -raw cognito_web_client_id)
```

2. **Creates users with email verification:**
```bash
aws cognito-idp admin-create-user \
  --user-pool-id "$USER_POOL_ID" \
  --username "$email" \
  --user-attributes \
    Name=email,Value="$email" \
    Name=email_verified,Value=true \
    Name=name,Value="$name" \
  --temporary-password "$temp_pass" \
  --message-action SUPPRESS
```

3. **Manages user lifecycle operations** via AWS Cognito Identity Provider API

**Common Use Cases:**

**Create test user for development:**
```bash
./cognito_admin.sh
# Select: 1
# Email: testuser@example.com
# Name: Test User
# Temporary Password: TempPass123!
```

**List all users to check status:**
```bash
./cognito_admin.sh
# Select: 2
# Output shows: Username, Status, Enabled, CreateDate
```

**Reset forgotten password:**
```bash
./cognito_admin.sh
# Select: 4
# Username: user@example.com
# New password: NewPass456!
```

---

### 2. test_api.sh

**Purpose:** API endpoint testing with Cognito authentication

**Features:**
- Tests health check endpoint (no auth)
- Tests unauthorized access behavior
- Authenticates user via Cognito
- Tests authenticated endpoints
- Uses JWT bearer tokens

**Usage:**

```bash
cd scripts
./test_api.sh

# Follow prompts:
# Username: your-email@example.com
# Password: ********
```

**Prerequisites:**
- AWS CLI configured
- Valid Cognito user account
- Terraform outputs available
- `jq` installed for JSON parsing

**Test Flow:**

**1. Health Check (No Auth Required):**
```bash
GET /health

# Expected:
{
  "success": true,
  "message": "FinAlly API is running",
  "timestamp": "2025-12-05T10:00:00.000Z"
}
```

**2. Unauthorized Access Test:**
```bash
GET /users/me
# (without Authorization header)

# Expected:
{
  "message": "Unauthorized"
}
```

**3. Get Access Token:**
```bash
aws cognito-idp admin-initiate-auth \
  --user-pool-id "$USER_POOL_ID" \
  --client-id "$CLIENT_ID" \
  --auth-flow ADMIN_USER_PASSWORD_AUTH \
  --auth-parameters USERNAME="$username",PASSWORD="$password"

# Returns JWT access token
```

**4. Authenticated Request:**
```bash
GET /users/me
Authorization: Bearer <access-token>

# Expected:
{
  "success": true,
  "data": {
    "id": 1,
    "cognito_id": "xxx-xxx-xxx",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

**5. Update User:**
```bash
PATCH /users/me
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "displayName": "API Test User"
}
```

**Debugging Failed Tests:**

**Authentication fails:**
```bash
# Check user exists:
aws cognito-idp admin-get-user \
  --user-pool-id "$USER_POOL_ID" \
  --username "user@example.com"

# Check user status (must be CONFIRMED)
```

**API returns 401:**
```bash
# Check token is valid JWT:
echo "$ACCESS_TOKEN" | cut -d. -f2 | base64 -d | jq .

# Check token not expired (exp claim)
```

**API returns 502:**
```bash
# Check Lambda logs:
aws logs tail /aws/lambda/finally-dev-api --follow
```

---

## Database Migration Scripts

**Note:** The `apply_migration_ssm.sh` script referenced in documentation (`database/MIGRATIONS.md`) provides database migration functionality via SSM Session Manager.

**Typical implementation would include:**

**Purpose:**
- Apply SQL migrations to RDS PostgreSQL
- Use SSM Session Manager for secure database access
- Port forwarding for temporary connectivity

**Expected usage pattern:**
```bash
./apply_migration_ssm.sh database/migrations/003_new_migration.sql

# Process:
# 1. Retrieves database credentials from Secrets Manager
# 2. Starts SSM port forwarding to bastion host
# 3. Establishes PostgreSQL connection via forwarded port
# 4. Applies migration SQL file
# 5. Verifies success
# 6. Cleans up port forwarding
```

**Security considerations:**
- No direct database exposure (private subnets)
- Credentials never stored locally
- Temporary port forwarding only
- Audit trail via CloudTrail

---

## Creating New Scripts

### Script Template

```bash
#!/bin/bash

# =====================================================================
# Script Name
# Description of what this script does
# =====================================================================

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TF_DIR="$PROJECT_ROOT/terraform/environments/dev"

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'  # No color

# Get Terraform outputs
cd "$TF_DIR"
RESOURCE=$(terraform output -raw resource_name)

# Main script logic
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Script Name${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# ... your logic here ...

echo -e "${GREEN}✓ Completed successfully${NC}"
```

### Script Guidelines

**1. Error Handling:**
```bash
set -e  # Exit immediately on error
set -u  # Exit on undefined variable
set -o pipefail  # Exit if any command in pipeline fails
```

**2. Color Output:**
```bash
echo -e "${GREEN}✓ Success message${NC}"
echo -e "${YELLOW}⚠ Warning message${NC}"
echo -e "${RED}✗ Error message${NC}"
echo -e "${BLUE}ℹ Info message${NC}"
```

**3. Terraform Integration:**
```bash
cd "$PROJECT_ROOT/terraform/environments/dev"
OUTPUT=$(terraform output -raw output_name)
```

**4. AWS CLI Commands:**
```bash
# Check AWS credentials first
aws sts get-caller-identity > /dev/null 2>&1 || {
  echo -e "${RED}✗ AWS credentials not configured${NC}"
  exit 1
}
```

**5. User Input:**
```bash
# Regular input
read -p "Enter value: " user_input

# Password input (hidden)
read -s -p "Enter password: " password
echo ""  # New line after hidden input

# Confirmation prompts
read -p "Continue? (y/n): " confirm
if [[ "$confirm" != "y" ]]; then
  echo "Aborted"
  exit 0
fi
```

---

## Common Patterns

### Getting Terraform Outputs

```bash
TF_DIR="$PROJECT_ROOT/terraform/environments/dev"
cd "$TF_DIR"

API_URL=$(terraform output -raw api_invoke_url)
DB_SECRET_ARN=$(terraform output -raw database_secret_arn)
BASTION_ID=$(terraform output -raw bastion_instance_id)
```

### Retrieving Secrets

```bash
SECRET_VALUE=$(aws secretsmanager get-secret-value \
  --secret-id "$SECRET_ARN" \
  --query 'SecretString' \
  --output text)

DB_HOST=$(echo "$SECRET_VALUE" | jq -r '.host')
DB_PASSWORD=$(echo "$SECRET_VALUE" | jq -r '.password')
```

### SSM Session Manager

```bash
# Start interactive session
aws ssm start-session --target "$BASTION_INSTANCE_ID"

# Port forwarding
aws ssm start-session \
  --target "$BASTION_INSTANCE_ID" \
  --document-name AWS-StartPortForwardingSession \
  --parameters "portNumber=5432,localPortNumber=15432"
```

### CloudWatch Logs

```bash
# Tail logs
aws logs tail /aws/lambda/finally-dev-api --follow

# Filter logs
aws logs filter-log-events \
  --log-group-name /aws/lambda/finally-dev-api \
  --filter-pattern "[ERROR]" \
  --start-time $(($(date +%s) - 3600))000  # Last hour
```

---

## Troubleshooting

### Script Permission Denied

```bash
# Make script executable
chmod +x scripts/cognito_admin.sh
```

### Terraform Output Not Found

```bash
# Ensure infrastructure deployed
cd terraform/environments/dev
terraform apply

# Check available outputs
terraform output
```

### AWS CLI Errors

```bash
# Check AWS credentials
aws sts get-caller-identity

# Configure if needed
aws configure

# Check region
aws configure get region
# Should be: eu-central-1
```

### jq Not Installed

```bash
# macOS
brew install jq

# Ubuntu/Debian
sudo apt-get install jq

# Amazon Linux
sudo yum install jq
```

---

## Security Best Practices

**1. Never commit credentials:**
```bash
# Bad
PASSWORD="hardcoded-password"

# Good
read -s -p "Password: " PASSWORD
echo ""
```

**2. Use Secrets Manager:**
```bash
# Retrieve secrets at runtime
SECRET=$(aws secretsmanager get-secret-value --secret-id "$SECRET_ARN")
```

**3. Limit AWS permissions:**
```bash
# Scripts should use IAM roles/profiles with least privilege
# For Cognito: cognito-idp:Admin*
# For Secrets: secretsmanager:GetSecretValue
# For SSM: ssm:StartSession
```

**4. Clean up resources:**
```bash
# Use trap for cleanup
cleanup() {
  echo "Cleaning up..."
  kill $PORT_FORWARD_PID 2>/dev/null || true
}
trap cleanup EXIT
```

---

## Further Reading

- [AWS CLI Reference](https://awscli.amazonaws.com/v2/documentation/api/latest/index.html)
- [Bash Scripting Guide](https://www.gnu.org/software/bash/manual/bash.html)
- [jq Manual](https://stedolan.github.io/jq/manual/)
- [database/MIGRATIONS.md](../database/MIGRATIONS.md) - Migration procedures

---

**Scripts Documentation Version:** 1.0 (Phase 5)
**Last Updated:** December 2025
