#!/bin/bash

set -e

# =====================================================================
# FinAlly Database Migration Script
# Applies initial schema with proper error handling and validation
# =====================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Resolve absolute paths
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TF_DIR="$PROJECT_ROOT/terraform/environments/dev"
MIGRATION_FILE="$PROJECT_ROOT/database/migrations/001_initial_schema.sql"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}FinAlly Database Migration${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${BLUE}Project Root: $PROJECT_ROOT${NC}"

# =====================================================================
# Dependency Checks
# =====================================================================

echo -e "${YELLOW}Checking dependencies...${NC}"

if ! command -v aws &> /dev/null; then
  echo -e "${RED}Error: AWS CLI is not installed${NC}"
  echo -e "Install: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
  exit 1
fi

if ! command -v jq &> /dev/null; then
  echo -e "${RED}Error: jq is not installed${NC}"
  echo -e "Install: sudo apt install jq"
  exit 1
fi

if ! command -v psql &> /dev/null; then
  echo -e "${RED}Error: psql (PostgreSQL client) is not installed${NC}"
  echo -e "Install: sudo apt install postgresql-client"
  exit 1
fi

if ! command -v terraform &> /dev/null; then
  echo -e "${RED}Error: Terraform is not installed${NC}"
  exit 1
fi

echo -e "${GREEN}✓ All dependencies installed${NC}"

# =====================================================================
# Retrieve Database Credentials
# =====================================================================

if [ ! -d "$TF_DIR" ]; then
  echo -e "${RED}Error: Terraform directory not found: $TF_DIR${NC}"
  exit 1
fi

cd "$TF_DIR"

echo -e "${YELLOW}Retrieving database credentials from Terraform...${NC}"
SECRET_ARN=$(terraform output -raw database_secret_arn 2>/dev/null)

if [ -z "$SECRET_ARN" ] || [ "$SECRET_ARN" == "null" ]; then
  echo -e "${RED}Error: Could not retrieve database secret ARN from Terraform${NC}"
  echo -e "Ensure database module is deployed: terraform apply"
  exit 1
fi

echo -e "${GREEN}✓ Secret ARN: $SECRET_ARN${NC}"

# Get secret from AWS Secrets Manager
echo -e "${YELLOW}Fetching secret from AWS Secrets Manager...${NC}"
SECRET_JSON=$(aws secretsmanager get-secret-value \
  --secret-id "$SECRET_ARN" \
  --query SecretString \
  --output text 2>/dev/null)

if [ $? -ne 0 ] || [ -z "$SECRET_JSON" ]; then
  echo -e "${RED}Error: Could not retrieve secret from Secrets Manager${NC}"
  exit 1
fi

# Extract and validate connection details
DB_HOST=$(echo "$SECRET_JSON" | jq -r '.host')
DB_PORT=$(echo "$SECRET_JSON" | jq -r '.port')
DB_NAME=$(echo "$SECRET_JSON" | jq -r '.dbname')
DB_USER=$(echo "$SECRET_JSON" | jq -r '.username')
DB_PASS=$(echo "$SECRET_JSON" | jq -r '.password')

# Validate all fields are present
if [[ -z "$DB_HOST" || "$DB_HOST" == "null" ]]; then
  echo -e "${RED}Error: Database host missing in secret${NC}"
  exit 1
fi

if [[ -z "$DB_PORT" || "$DB_PORT" == "null" ]]; then
  echo -e "${RED}Error: Database port missing in secret${NC}"
  exit 1
fi

if [[ -z "$DB_NAME" || "$DB_NAME" == "null" ]]; then
  echo -e "${RED}Error: Database name missing in secret${NC}"
  exit 1
fi

if [[ -z "$DB_USER" || "$DB_USER" == "null" ]]; then
  echo -e "${RED}Error: Database username missing in secret${NC}"
  exit 1
fi

if [[ -z "$DB_PASS" || "$DB_PASS" == "null" ]]; then
  echo -e "${RED}Error: Database password missing in secret${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Retrieved database credentials${NC}"
echo -e "  Host: $DB_HOST"
echo -e "  Port: $DB_PORT"
echo -e "  Database: $DB_NAME"
echo -e "  User: $DB_USER"

# =====================================================================
# Test Database Connection
# =====================================================================

export PGPASSWORD="$DB_PASS"

echo -e "${YELLOW}Testing database connection...${NC}"
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT version();" > /dev/null 2>&1; then
  PG_VERSION=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT version();" | head -1 | xargs)
  echo -e "${GREEN}✓ Database connection successful${NC}"
  echo -e "  PostgreSQL: $PG_VERSION"
else
  echo -e "${RED}Error: Could not connect to database${NC}"
  echo -e "Check security group rules and network connectivity"
  unset PGPASSWORD
  exit 1
fi

# =====================================================================
# Verify Migration File Exists
# =====================================================================

if [ ! -f "$MIGRATION_FILE" ]; then
  echo -e "${RED}Error: Migration file not found: $MIGRATION_FILE${NC}"
  unset PGPASSWORD
  exit 1
fi

echo -e "${GREEN}✓ Migration file found: $(basename "$MIGRATION_FILE")${NC}"

# =====================================================================
# Apply Migration
# =====================================================================

echo -e "${YELLOW}Applying migration...${NC}"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$MIGRATION_FILE"

echo -e "${GREEN}✓ Migration applied successfully${NC}"

# =====================================================================
# Verify Schema
# =====================================================================

echo -e "${YELLOW}Verifying schema...${NC}"

# Count user tables (excluding PostgreSQL system tables)
TABLE_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c \
  "SELECT COUNT(*) FROM information_schema.tables 
   WHERE table_schema = 'public' 
     AND table_type = 'BASE TABLE' 
     AND table_name NOT LIKE 'pg_%' 
     AND table_name NOT LIKE 'sql_%';")

echo -e "${GREEN}✓ Schema verified${NC}"
echo -e "  Tables created: ${TABLE_COUNT// /}"

# List all tables
echo -e "${YELLOW}Tables in database:${NC}"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\dt" | grep -v "^$"

# Verify seed data
echo -e "${YELLOW}Verifying seed data...${NC}"

ASSET_CAT_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM asset_categories;")
INCOME_CAT_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM income_categories;")
EXPENSE_CAT_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM expense_categories;")

echo -e "${GREEN}✓ Seed data verified${NC}"
echo -e "  Asset categories: ${ASSET_CAT_COUNT// /}"
echo -e "  Income categories: ${INCOME_CAT_COUNT// /}"
echo -e "  Expense categories: ${EXPENSE_CAT_COUNT// /}"

# =====================================================================
# Cleanup and Summary
# =====================================================================

unset PGPASSWORD

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Migration Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Database: $DB_NAME"
echo -e "Host: $DB_HOST"
echo -e "Tables: ${TABLE_COUNT// /}"
echo -e "Timestamp: $TIMESTAMP"
echo -e "${GREEN}========================================${NC}"
