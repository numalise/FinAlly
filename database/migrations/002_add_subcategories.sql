-- Migration: Add Subcategories and LOAN Category
-- Description: Adds ExpenseSubcategory table, LOAN category, and updates ExpenseItem table

-- Step 1: Add LOAN category to expense_categories
INSERT INTO expense_categories (code, name, created_at, updated_at)
VALUES ('LOAN', 'Loans', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Step 2: Create expense_subcategories table
CREATE TABLE IF NOT EXISTS expense_subcategories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(255) UNIQUE NOT NULL,
    parent_category_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    is_default BOOLEAN DEFAULT TRUE NOT NULL,
    sort_order INT NOT NULL,
    user_id UUID,
    created_at TIMESTAMPTZ(6) DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ(6) DEFAULT NOW() NOT NULL,

    -- Foreign keys
    CONSTRAINT fk_subcategory_parent_category
        FOREIGN KEY (parent_category_id)
        REFERENCES expense_categories(code)
        ON DELETE RESTRICT,
    CONSTRAINT fk_subcategory_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- Step 3: Create indexes for expense_subcategories
CREATE INDEX IF NOT EXISTS idx_subcategories_parent_category ON expense_subcategories(parent_category_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_user ON expense_subcategories(user_id);

-- Step 4: Insert predefined subcategories
-- RENT subcategories
INSERT INTO expense_subcategories (code, parent_category_id, name, is_default, sort_order, user_id, created_at, updated_at)
VALUES
    ('RENT_GENERAL', 'RENT', 'General', TRUE, 0, NULL, NOW(), NOW()),
    ('RENT_ADDRESS_1', 'RENT', 'Address 1', TRUE, 1, NULL, NOW(), NOW()),
    ('RENT_ADDRESS_2', 'RENT', 'Address 2', TRUE, 2, NULL, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- UTILITY subcategories
INSERT INTO expense_subcategories (code, parent_category_id, name, is_default, sort_order, user_id, created_at, updated_at)
VALUES
    ('UTILITY_ELECTRICITY_GAS', 'UTILITY', 'Electricity & Gas', TRUE, 0, NULL, NOW(), NOW()),
    ('UTILITY_WATER', 'UTILITY', 'Water', TRUE, 1, NULL, NOW(), NOW()),
    ('UTILITY_INTERNET', 'UTILITY', 'Internet', TRUE, 2, NULL, NOW(), NOW()),
    ('UTILITY_PHONE', 'UTILITY', 'Phone', TRUE, 3, NULL, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- FOOD subcategories
INSERT INTO expense_subcategories (code, parent_category_id, name, is_default, sort_order, user_id, created_at, updated_at)
VALUES
    ('FOOD_GROCERIES', 'FOOD', 'Groceries', TRUE, 0, NULL, NOW(), NOW()),
    ('FOOD_OUT_DELIVERY', 'FOOD', 'Out/Delivery meals', TRUE, 1, NULL, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- TRANSPORT subcategories
INSERT INTO expense_subcategories (code, parent_category_id, name, is_default, sort_order, user_id, created_at, updated_at)
VALUES
    ('TRANSPORT_FUELS', 'TRANSPORT', 'Fuels', TRUE, 0, NULL, NOW(), NOW()),
    ('TRANSPORT_PUBLIC', 'TRANSPORT', 'Public Transport', TRUE, 1, NULL, NOW(), NOW()),
    ('TRANSPORT_MAINTENANCE', 'TRANSPORT', 'Vehicle Maintenance', TRUE, 2, NULL, NOW(), NOW()),
    ('TRANSPORT_TAXI_UBER', 'TRANSPORT', 'Taxi/Uber', TRUE, 3, NULL, NOW(), NOW()),
    ('TRANSPORT_PARKINGS', 'TRANSPORT', 'Parkings', TRUE, 4, NULL, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- FEES subcategories
INSERT INTO expense_subcategories (code, parent_category_id, name, is_default, sort_order, user_id, created_at, updated_at)
VALUES
    ('FEES_STREAMING', 'FEES', 'Streaming', TRUE, 0, NULL, NOW(), NOW()),
    ('FEES_AI', 'FEES', 'AI', TRUE, 1, NULL, NOW(), NOW()),
    ('FEES_OTHER', 'FEES', 'Other fees', TRUE, 2, NULL, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- INSURANCE subcategories
INSERT INTO expense_subcategories (code, parent_category_id, name, is_default, sort_order, user_id, created_at, updated_at)
VALUES
    ('INSURANCE_WASTE_TAX', 'INSURANCE', 'Waste tax', TRUE, 0, NULL, NOW(), NOW()),
    ('INSURANCE_HEALTH', 'INSURANCE', 'Health insurance', TRUE, 1, NULL, NOW(), NOW()),
    ('INSURANCE_OTHER_TAXES', 'INSURANCE', 'Other taxes', TRUE, 2, NULL, NOW(), NOW()),
    ('INSURANCE_OTHER', 'INSURANCE', 'Other insurances', TRUE, 3, NULL, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- WELLNESS subcategories
INSERT INTO expense_subcategories (code, parent_category_id, name, is_default, sort_order, user_id, created_at, updated_at)
VALUES
    ('WELLNESS_LEISURE', 'WELLNESS', 'Leisure', TRUE, 0, NULL, NOW(), NOW()),
    ('WELLNESS_TRAVELS', 'WELLNESS', 'Travels', TRUE, 1, NULL, NOW(), NOW()),
    ('WELLNESS_SHOPPING', 'WELLNESS', 'Shopping', TRUE, 2, NULL, NOW(), NOW()),
    ('WELLNESS_GIFTS', 'WELLNESS', 'Gifts', TRUE, 3, NULL, NOW(), NOW()),
    ('WELLNESS_OTHERS', 'WELLNESS', 'Others', TRUE, 4, NULL, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- LOAN subcategories
INSERT INTO expense_subcategories (code, parent_category_id, name, is_default, sort_order, user_id, created_at, updated_at)
VALUES
    ('LOAN_LOAN_1', 'LOAN', 'Loan 1', TRUE, 0, NULL, NOW(), NOW()),
    ('LOAN_LOAN_2', 'LOAN', 'Loan 2', TRUE, 1, NULL, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- OTHER subcategories
INSERT INTO expense_subcategories (code, parent_category_id, name, is_default, sort_order, user_id, created_at, updated_at)
VALUES
    ('OTHER_GENERAL', 'OTHER', 'General', TRUE, 0, NULL, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Step 5: Add subcategory_id column to expense_items
ALTER TABLE expense_items
ADD COLUMN IF NOT EXISTS subcategory_id UUID;

-- Step 6: Add foreign key constraint for subcategory_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'fk_expense_item_subcategory'
    ) THEN
        ALTER TABLE expense_items
        ADD CONSTRAINT fk_expense_item_subcategory
            FOREIGN KEY (subcategory_id)
            REFERENCES expense_subcategories(id)
            ON DELETE RESTRICT;
    END IF;
END $$;

-- Step 7: Create index for subcategory_id in expense_items
CREATE INDEX IF NOT EXISTS idx_expenses_user_subcategory_date
ON expense_items(user_id, subcategory_id, year, month);

-- Step 8: Optional - Update updated_at trigger for expense_subcategories
-- (Assuming you have a similar trigger as other tables)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_expense_subcategories_updated_at ON expense_subcategories;
CREATE TRIGGER update_expense_subcategories_updated_at
    BEFORE UPDATE ON expense_subcategories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Migration Complete!
