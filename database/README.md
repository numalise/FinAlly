# FinAlly Database

## Overview
PostgreSQL 16.4 database schema for personal finance and investment tracking.

## Schema Structure

### Core Tables
- **users** - User accounts (Cognito-mapped)
- **asset_categories** - Macro asset classifications
- **assets** - Individual holdings/tickers
- **asset_inputs** - Monthly snapshot values

### Cash Flow Tables
- **income_categories** - Income classification
- **incoming_items** - Income transactions
- **expense_categories** - Expense classification
- **expense_items** - Expense transactions
- **budgets** - Monthly budget tracking

### Allocation Tables
- **category_allocation_targets** - Target allocation percentages
- **market_cap_history** - Historical market cap tracking (optional)

### Derived/Cache Tables
- **networth_materialized** - Cached net worth calculations
- **audit_events** - Activity audit log

## Schema Version
**Current**: 001  
**PostgreSQL**: 16.4  
**Total Tables**: 15

## Migrations

### Apply Initial Schema
```bash
cd scripts
./apply_migration.sh
```

### Manual Migration
```bash
# Get credentials
cd terraform/environments/dev
SECRET_ARN=$(terraform output -raw database_secret_arn)
SECRET_JSON=$(aws secretsmanager get-secret-value --secret-id "$SECRET_ARN" --query SecretString --output text)

# Extract connection details
DB_HOST=$(echo "$SECRET_JSON" | jq -r '.host')
DB_USER=$(echo "$SECRET_JSON" | jq -r '.username')
DB_PASS=$(echo "$SECRET_JSON" | jq -r '.password')
DB_NAME=$(echo "$SECRET_JSON" | jq -r '.dbname')

# Connect
PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME"

# Apply migration
\i database/migrations/001_initial_schema.sql
```

## Prisma Integration

### Generate Prisma Client
```bash
cd database/prisma
npx prisma generate
```

### Introspect Database
```bash
npx prisma db pull
```

### Create Migration (after schema changes)
```bash
npx prisma migrate dev --name description_of_changes
```

## Seed Data

The initial migration includes seed data for:
- **Asset Categories**: 8 categories (Stocks, Bonds, Crypto, etc.)
- **Income Categories**: 6 categories (Salary, Bonus, Dividends, etc.)
- **Expense Categories**: 8 categories (Rent, Food, Transport, etc.)

## Key Features

### Automatic Timestamp Updates
All tables with `updated_at` fields use triggers to automatically update timestamps on modifications.

### Data Integrity
- Foreign key constraints ensure referential integrity
- Check constraints validate data ranges (years, months, percentages)
- Unique constraints prevent duplicate entries

### Performance Optimization
- Indexes on frequently queried columns
- Composite indexes for multi-column queries
- Materialized view for net worth calculations

### Audit Trail
The `audit_events` table logs important user actions for compliance and debugging.

## Query Examples

### Get User's Net Worth for Month
```sql
SELECT COALESCE(SUM(total), 0) AS net_worth
FROM asset_inputs
WHERE user_id = :user_id
  AND year = :year
  AND month = :month;
```

### Get Asset Allocation by Category
```sql
SELECT ac.name, SUM(ai.total) AS total_value
FROM asset_categories ac
LEFT JOIN assets a ON a.category_id = ac.id AND a.user_id = :user_id
LEFT JOIN asset_inputs ai ON ai.asset_id = a.id
  AND ai.year = :year AND ai.month = :month
GROUP BY ac.id, ac.name;
```

### Budget Roll-Forward
```sql
-- Calculate next month's budget from previous month
INSERT INTO budgets (user_id, category_id, year, month, budget_amount, calculated)
SELECT 
  :user_id,
  :category_id,
  :year,
  :month,
  COALESCE(prev_budget.budget_amount, 0) + 
    (COALESCE(prev_budget.budget_amount, 0) - COALESCE(prev_expenses.total_expenses, 0)),
  true
FROM (
  SELECT budget_amount FROM budgets 
  WHERE user_id = :user_id AND category_id = :category_id 
    AND year = :prev_year AND month = :prev_month
) prev_budget
CROSS JOIN (
  SELECT COALESCE(SUM(amount), 0) AS total_expenses
  FROM expense_items
  WHERE user_id = :user_id AND category_id = :category_id
    AND year = :prev_year AND month = :prev_month
) prev_expenses
ON CONFLICT (user_id, category_id, year, month) DO NOTHING;
```

## Backup & Recovery

### Create Backup
```bash
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME -F c -f backup_$(date +%Y%m%d).dump
```

### Restore Backup
```bash
pg_restore -h $DB_HOST -U $DB_USER -d $DB_NAME backup_20250125.dump
```

## Monitoring

### Check Table Sizes
```sql
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Check Index Usage
```sql
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```
