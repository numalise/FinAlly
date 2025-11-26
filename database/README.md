# FinAlly Database Documentation

PostgreSQL 16.10 database schema for personal finance tracking.

## 📊 Schema Overview

**13 Core Tables:**

### Users & Authentication
- `users` - User accounts with Cognito integration

### Asset Management
- `asset_categories` - Investment categories (stocks, ETFs, crypto, etc.)
- `assets` - User's investment holdings
- `asset_inputs` - Monthly snapshots of asset values
- `market_cap_history` - Historical market cap tracking
- `category_allocation_targets` - Target allocation percentages

### Cash Flow
- `income_categories` - Income source types
- `incoming_items` - Individual income entries
- `expense_categories` - Expense category types
- `expense_items` - Individual expense entries
- `budgets` - Monthly budget tracking

### Analytics
- `networth_materialized` - Cached net worth calculations
- `audit_events` - System audit log

### Views
- `latest_networth` - Most recent net worth per user

---

## 🗂️ Seed Data

### Asset Categories (8)
- SINGLE_STOCKS - Individual stock holdings
- ETF_BONDS - Bond ETFs
- ETF_STOCKS - Stock ETFs
- CRYPTO - Cryptocurrency
- PRIVATE_EQUITY - Private equity investments
- BUSINESS_PROFITS - Business ownership
- REAL_ESTATE - Real estate holdings
- CASH - Cash and equivalents

### Income Categories (6)
- SALARY - Regular salary
- BONUS - Bonuses and commissions
- DIVIDEND - Investment dividends
- RENTAL - Rental income
- DONATION - Gifts and donations
- OTHER - Miscellaneous income

### Expense Categories (8)
- RENT - Rent and housing
- UTILITY - Utilities and services
- FOOD - Food and groceries
- TRANSPORT - Transportation
- FEES - Fees and subscriptions
- INSURANCE - Insurance premiums
- WELLNESS - Health and wellness
- OTHER - Miscellaneous expenses

---

## 🔐 Access

Database is in private subnets with no public access.

### Via SSM Bastion
```bash
# Get bastion instance ID
cd terraform/environments/dev
BASTION_ID=$(terraform output -raw bastion_instance_id)

# Connect
aws ssm start-session --target "$BASTION_ID"

# Get credentials from Secrets Manager
SECRET_ARN=$(terraform output -raw database_secret_arn)
aws secretsmanager get-secret-value --secret-id "$SECRET_ARN"

# Connect to database
export PGPASSWORD='<password>'
export PGSSLMODE=require
psql -h <db-host> -U finally_admin -d finally
```

---

## 📝 Migrations

Migrations are stored in `database/migrations/` and applied via SSM:
```bash
cd scripts
./apply_migration_ssm.sh
```

### Migration Files
- `001_initial_schema.sql` - Initial schema (partial)
- `002_missing_tables.sql` - Asset management tables

---

## 🔍 Useful Queries

### Check Table Counts
```sql
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM assets;
SELECT COUNT(*) FROM asset_inputs;
```

### View All Categories
```sql
SELECT * FROM asset_categories ORDER BY code;
SELECT * FROM income_categories ORDER BY code;
SELECT * FROM expense_categories ORDER BY code;
```

### Latest Net Worth
```sql
SELECT * FROM latest_networth;
```

### Audit Log
```sql
SELECT * FROM audit_events ORDER BY created_at DESC LIMIT 10;
```

---

## 🛠️ Maintenance

### Backup
RDS automated backups enabled:
- Retention: 1 day (dev), 7 days (prod)
- Backup window: 03:00-04:00 UTC

### Monitoring
CloudWatch alarms configured for:
- CPU > 80%
- Connections > 50
- Free storage < 2GB

---

## 📈 Performance

### Indexes
- Composite indexes on (user_id, year DESC, month DESC) for time-series queries
- B-tree indexes on foreign keys
- Unique constraints create implicit indexes

### Triggers
- `updated_at` auto-update triggers on all tables with timestamps

---

## 🔒 Security

- SSL/TLS required for all connections (`PGSSLMODE=require`)
- Passwords stored in AWS Secrets Manager
- Cascade delete for user-owned data
- Restrict delete on category tables
- Audit logging for sensitive operations
