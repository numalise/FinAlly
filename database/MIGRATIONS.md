# Database Migrations Guide

> **Procedures for creating, testing, and applying database schema migrations**

Complete guide to managing database schema changes in the FinAlly platform using SQL migrations and Prisma.

**Last Updated:** December 2025

---

## Migration Strategy

### SQL-First Approach

FinAlly uses **SQL-first migrations** rather than Prisma Migrate:

**Workflow:**
1. Write SQL migration file in `database/migrations/`
2. Apply via SSM bastion script
3. Update `prisma/schema.prisma` to match
4. Regenerate Prisma client

**Rationale:**
- Full control over schema changes
- Optimize for zero-downtime deployments
- Create custom indexes (CONCURRENTLY)
- Better for production environments

---

## Migration Files

### Current Migrations

| File | Description | Applied | Date |
|------|-------------|---------|------|
| `001_complete_schema.sql` | Initial schema (14 tables) | ✅ | 2025-01 |
| `002_add_subcategories.sql` | Expense subcategories feature | ✅ | 2025-12 |

### File Naming Convention

```
<number>_<description>.sql
003_add_transaction_status.sql
004_add_user_preferences.sql
005_create_notifications_table.sql
```

**Rules:**
- Sequential numbering (no gaps)
- Descriptive but concise names
- Use snake_case
- `.sql` extension

---

## Creating Migrations

### Step 1: Write Migration SQL

**database/migrations/003_add_transaction_status.sql:**

```sql
-- =====================================================================
-- Migration: Add transaction status tracking
-- Author: Your Name
-- Date: 2025-12-10
-- Description: Adds status column to expense_items for tracking
--              payment status (pending, paid, cancelled)
-- =====================================================================

BEGIN;

-- Add status column (nullable first for backfill)
ALTER TABLE expense_items
ADD COLUMN status VARCHAR(20);

-- Add default for new rows
ALTER TABLE expense_items
ALTER COLUMN status SET DEFAULT 'pending';

-- Backfill existing rows (in batches if large table)
UPDATE expense_items
SET status = 'paid'
WHERE status IS NULL;

-- Now make NOT NULL
ALTER TABLE expense_items
ALTER COLUMN status SET NOT NULL;

-- Add check constraint
ALTER TABLE expense_items
ADD CONSTRAINT expense_items_status_check
CHECK (status IN ('pending', 'paid', 'cancelled'));

-- Add index for status queries
CREATE INDEX idx_expense_items_status
ON expense_items(status);

COMMIT;
```

### Step 2: Write Rollback Migration

**database/migrations/003_add_transaction_status_down.sql:**

```sql
-- Rollback migration for 003_add_transaction_status.sql
BEGIN;

DROP INDEX IF EXISTS idx_expense_items_status;
ALTER TABLE expense_items DROP CONSTRAINT IF EXISTS expense_items_status_check;
ALTER TABLE expense_items DROP COLUMN IF EXISTS status;

COMMIT;
```

### Step 3: Update Prisma Schema

**lambda/prisma/schema.prisma:**

```prisma
model expense_items {
  id              Int      @id @default(autoincrement())
  user_id         Int
  category_id     Int
  subcategory_id  Int?
  amount          Decimal  @db.Decimal(10, 2)
  date            DateTime @db.Date
  description     String?  @db.VarChar(500)
  status          String   @default("pending") @db.VarChar(20)  // NEW
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt

  users               users              @relation(fields: [user_id], references: [id], onDelete: Cascade)
  expense_categories  expense_categories @relation(fields: [category_id], references: [id])
  expense_subcategories expense_subcategories? @relation(fields: [subcategory_id], references: [id])

  @@index([user_id, date])
  @@index([category_id])
  @@index([status])  // NEW
}
```

---

## Applying Migrations

### Dev Environment

```bash
cd scripts

# Apply migration
./apply_migration_ssm.sh database/migrations/003_add_transaction_status.sql

# Output:
# 📦 Applying migration: database/migrations/003_add_transaction_status.sql
# 🔐 Retrieving database credentials...
# 🔌 Starting SSM port forwarding on port 15432...
# 🚀 Applying migration...
# ✅ Migration applied successfully!
```

### Staging/Production

```bash
# Backup database first
aws rds create-db-snapshot \
  --db-instance-identifier finally-prod-postgres \
  --db-snapshot-identifier finally-prod-$(date +%Y%m%d-%H%M%S)

# Apply migration during maintenance window
./apply_migration_ssm.sh database/migrations/003_add_transaction_status.sql --environment=production

# Verify schema
psql -h <db-host> -U finally_admin -d finally
\d expense_items
```

### Regenerate Prisma Client

```bash
cd lambda
npx prisma generate
npm run build
```

---

## Migration Best Practices

### Safe Migrations (No Downtime)

✅ **Safe operations:**
- `ADD COLUMN` (with default or nullable)
- `CREATE INDEX CONCURRENTLY`
- `CREATE TABLE`
- `ADD CONSTRAINT NOT VALID` (then VALIDATE later)

❌ **Unsafe operations (require downtime):**
- `DROP COLUMN`
- `RENAME COLUMN`
- `ALTER COLUMN TYPE` (most types)
- `ADD CONSTRAINT` (without NOT VALID)
- `CREATE INDEX` (without CONCURRENTLY)

### Multi-Step Migrations

**Adding NOT NULL column (zero downtime):**

**Step 1: Add nullable column**
```sql
ALTER TABLE expense_items ADD COLUMN status VARCHAR(20);
ALTER TABLE expense_items ALTER COLUMN status SET DEFAULT 'pending';
```

**Step 2: Backfill (can take time)**
```sql
-- Batch update to avoid locks
DO $$
DECLARE
  batch_size INT := 1000;
  affected INT;
BEGIN
  LOOP
    UPDATE expense_items
    SET status = 'paid'
    WHERE status IS NULL
    LIMIT batch_size;

    GET DIAGNOSTICS affected = ROW_COUNT;
    EXIT WHEN affected = 0;

    PERFORM pg_sleep(0.1);  -- Throttle
  END LOOP;
END $$;
```

**Step 3: Add NOT NULL constraint**
```sql
-- First add as NOT VALID (doesn't check existing rows)
ALTER TABLE expense_items
ADD CONSTRAINT expense_items_status_not_null
CHECK (status IS NOT NULL) NOT VALID;

-- Then validate (scans table but doesn't block writes)
ALTER TABLE expense_items
VALIDATE CONSTRAINT expense_items_status_not_null;

-- Finally, convert to NOT NULL
ALTER TABLE expense_items ALTER COLUMN status SET NOT NULL;
ALTER TABLE expense_items DROP CONSTRAINT expense_items_status_not_null;
```

### Concurrent Indexes

```sql
-- Bad: Blocks writes
CREATE INDEX idx_expense_items_status ON expense_items(status);

-- Good: Doesn't block writes
CREATE INDEX CONCURRENTLY idx_expense_items_status ON expense_items(status);
```

**Note:** CONCURRENTLY cannot be used inside a transaction block.

---

## Testing Migrations

### Local Testing

```bash
# 1. Restore production backup to dev
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier finally-dev-postgres-test \
  --db-snapshot-identifier finally-prod-snapshot-latest

# 2. Apply migration to test database
./apply_migration_ssm.sh database/migrations/003_add_transaction_status.sql

# 3. Run application tests
cd lambda && npm test

# 4. Verify data integrity
psql -h <test-db-host> -U finally_admin -d finally
SELECT count(*) FROM expense_items WHERE status IS NULL;  -- Should be 0
```

### Performance Testing

```sql
-- Check index usage
EXPLAIN ANALYZE
SELECT * FROM expense_items
WHERE status = 'pending';

-- Should show: Index Scan using idx_expense_items_status

-- Check query performance
\timing on
SELECT count(*) FROM expense_items WHERE status = 'pending';
-- Should be <10ms
```

---

## Rollback Procedures

### Immediate Rollback

```bash
# Apply down migration
./apply_migration_ssm.sh database/migrations/003_add_transaction_status_down.sql

# Revert Prisma schema
git checkout HEAD~1 lambda/prisma/schema.prisma

# Regenerate Prisma client
cd lambda && npx prisma generate

# Redeploy Lambda
./push-to-ecr.sh
```

### Restore from Backup

```bash
# If down migration fails, restore from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier finally-prod-postgres-restored \
  --db-snapshot-identifier finally-prod-snapshot-pre-migration

# Update Lambda DATABASE_URL to point to restored instance
# Via Terraform or AWS Console
```

---

## Common Migration Patterns

### Adding Enum Column

```sql
-- Create enum type
CREATE TYPE transaction_status AS ENUM ('pending', 'paid', 'cancelled');

-- Add column with enum type
ALTER TABLE expense_items
ADD COLUMN status transaction_status DEFAULT 'pending';
```

### Renaming Column (Zero Downtime)

```sql
-- Step 1: Add new column
ALTER TABLE expense_items ADD COLUMN new_name VARCHAR(255);

-- Step 2: Copy data
UPDATE expense_items SET new_name = old_name;

-- Step 3: Update application to use new_name (deploy)

-- Step 4: Drop old column (in next migration)
ALTER TABLE expense_items DROP COLUMN old_name;
```

### Changing Column Type

```sql
-- Bad: Rewrites entire table
ALTER TABLE expense_items ALTER COLUMN amount TYPE NUMERIC(12,2);

-- Good: Create new column, copy data, swap
ALTER TABLE expense_items ADD COLUMN amount_new NUMERIC(12,2);
UPDATE expense_items SET amount_new = amount::NUMERIC(12,2);
-- (After deployment using new column)
ALTER TABLE expense_items DROP COLUMN amount;
ALTER TABLE expense_items RENAME COLUMN amount_new TO amount;
```

---

## Migration History Tracking

### Recording Migrations

Create migration log table:

```sql
CREATE TABLE _migration_history (
  id SERIAL PRIMARY KEY,
  migration_name VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMP DEFAULT NOW(),
  applied_by VARCHAR(100),
  checksum VARCHAR(64)
);

-- Record migration
INSERT INTO _migration_history (migration_name, applied_by, checksum)
VALUES ('003_add_transaction_status', 'admin', 'sha256_hash');
```

### Check Applied Migrations

```sql
SELECT migration_name, applied_at
FROM _migration_history
ORDER BY applied_at DESC;
```

---

## Further Reading

- [PostgreSQL ALTER TABLE](https://www.postgresql.org/docs/current/sql-altertable.html)
- [Zero-Downtime Migrations](https://github.com/braintree/pg-ha-migrations)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [SETUP.md](../SETUP.md) - Database setup procedures

---

**Migrations Guide Version:** 1.0 (Phase 5)
**Last Updated:** December 2025
