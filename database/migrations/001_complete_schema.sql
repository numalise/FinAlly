-- =====================================================================
-- FinAlly Database Schema - Complete Migration
-- =====================================================================
-- Version: 1.0
-- Date: 2025-11-26
-- Description: Complete database schema with all tables, seed data,
--              triggers, and views for FinAlly platform
-- =====================================================================

-- =====================================================================
-- FinAlly Database Schema
-- PostgreSQL 16.10
-- Initial Migration: 001
-- =====================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================================
-- USERS TABLE
-- =====================================================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  cognito_sub TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_cognito_sub ON users(cognito_sub);

-- =====================================================================
-- ASSET CATEGORIES (Macro Assets - Immutable Seeds)
-- =====================================================================

CREATE TABLE IF NOT EXISTS asset_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT PRIMARY KEY, -- Use code as PK for immutable enums
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Seed asset categories
INSERT INTO asset_categories (code, name) VALUES
  ('SINGLE_STOCKS', 'Single Stocks'),
  ('ETF_BONDS', 'ETF Bonds'),
  ('ETF_STOCKS', 'ETF Stocks'),
  ('CRYPTO', 'Crypto'),
  ('PRIVATE_EQUITY', 'Private Equity'),
  ('BUSINESS_PROFITS', 'Business Profits'),
  ('REAL_ESTATE', 'Real Estate'),
  ('CASH', 'Cash Liquidity')
ON CONFLICT (code) DO NOTHING;

-- =====================================================================
-- ASSETS (Sub-assets / Tickers / Individual Holdings)
-- =====================================================================

CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES asset_categories(code) ON DELETE RESTRICT,
  ticker TEXT,
  asset_name TEXT NOT NULL,
  market_cap NUMERIC(24,4),
  market_cap_source TEXT DEFAULT 'manual',
  last_marketcap_synced_at TIMESTAMP WITH TIME ZONE,
  sub_target_pct NUMERIC(9,6) CHECK (sub_target_pct >= 0 AND sub_target_pct <= 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, asset_name)
);

CREATE INDEX idx_assets_user_category ON assets(user_id, category_id);
CREATE INDEX idx_assets_user_ticker ON assets(user_id, ticker);
CREATE INDEX idx_assets_user_assetname ON assets(user_id, asset_name);

-- =====================================================================
-- MARKET CAP HISTORY (Optional - for tracking market cap over time)
-- =====================================================================

CREATE TABLE IF NOT EXISTS market_cap_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  year INT NOT NULL CHECK (year >= 2000 AND year <= 2100),
  month INT NOT NULL CHECK (month >= 1 AND month <= 12),
  market_cap NUMERIC(24,4) NOT NULL,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (asset_id, year, month)
);

CREATE INDEX idx_mch_asset_year_month ON market_cap_history(asset_id, year, month);

-- =====================================================================
-- ASSET INPUTS (Monthly Snapshots)
-- =====================================================================

CREATE TABLE IF NOT EXISTS asset_inputs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  year INT NOT NULL CHECK (year >= 2000 AND year <= 2100),
  month INT NOT NULL CHECK (month >= 1 AND month <= 12),
  total NUMERIC(24,4) NOT NULL CHECK (total >= 0),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, asset_id, year, month)
);

-- Optimized composite indexes for date-range queries
CREATE INDEX idx_asset_inputs_user_date ON asset_inputs(user_id, year DESC, month DESC);
CREATE INDEX idx_asset_inputs_asset ON asset_inputs(asset_id);

-- =====================================================================
-- INCOME CATEGORIES (Immutable Seeds)
-- =====================================================================

CREATE TABLE IF NOT EXISTS income_categories (
  code TEXT PRIMARY KEY, -- Use code as PK for immutable enums
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Seed income categories
INSERT INTO income_categories (code, name) VALUES
  ('SALARY', 'Salary'),
  ('BONUS', 'Bonus'),
  ('DIVIDEND', 'Dividends'),
  ('RENTAL', 'Rental Fees'),
  ('DONATION', 'Donations'),
  ('OTHER', 'Other')
ON CONFLICT (code) DO NOTHING;

-- =====================================================================
-- INCOMING ITEMS
-- =====================================================================

CREATE TABLE IF NOT EXISTS incoming_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES income_categories(code) ON DELETE RESTRICT,
  year INT NOT NULL CHECK (year >= 2000 AND year <= 2100),
  month INT NOT NULL CHECK (month >= 1 AND month <= 12),
  amount NUMERIC(24,4) NOT NULL CHECK (amount >= 0),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_incomings_user_date ON incoming_items(user_id, year DESC, month DESC);
CREATE INDEX idx_incomings_user_cat_ym ON incoming_items(user_id, category_id, year, month);

-- =====================================================================
-- EXPENSE CATEGORIES (Immutable Seeds)
-- =====================================================================

CREATE TABLE IF NOT EXISTS expense_categories (
  code TEXT PRIMARY KEY, -- Use code as PK for immutable enums
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Seed expense categories
INSERT INTO expense_categories (code, name) VALUES
  ('RENT', 'Rents'),
  ('UTILITY', 'Utility'),
  ('FOOD', 'Food'),
  ('TRANSPORT', 'Transport'),
  ('FEES', 'Fees & Plans'),
  ('INSURANCE', 'Insurances & Taxes'),
  ('WELLNESS', 'Wellness'),
  ('OTHER', 'Other')
ON CONFLICT (code) DO NOTHING;

-- =====================================================================
-- EXPENSE ITEMS
-- =====================================================================

CREATE TABLE IF NOT EXISTS expense_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES expense_categories(code) ON DELETE RESTRICT,
  year INT NOT NULL CHECK (year >= 2000 AND year <= 2100),
  month INT NOT NULL CHECK (month >= 1 AND month <= 12),
  amount NUMERIC(24,4) NOT NULL CHECK (amount >= 0),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_expenses_user_date ON expense_items(user_id, year DESC, month DESC);
CREATE INDEX idx_expenses_user_cat_ym ON expense_items(user_id, category_id, year, month);

-- =====================================================================
-- BUDGETS
-- =====================================================================

CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES expense_categories(code) ON DELETE RESTRICT,
  year INT NOT NULL CHECK (year >= 2000 AND year <= 2100),
  month INT NOT NULL CHECK (month >= 1 AND month <= 12),
  budget_amount NUMERIC(24,4) NOT NULL CHECK (budget_amount >= 0),
  calculated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, category_id, year, month)
);

CREATE INDEX idx_budgets_user_date ON budgets(user_id, year DESC, month DESC);
CREATE INDEX idx_budgets_user_cat_ym ON budgets(user_id, category_id, year, month);

-- =====================================================================
-- CATEGORY ALLOCATION TARGETS (Macro Allocation)
-- =====================================================================

CREATE TABLE IF NOT EXISTS category_allocation_targets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES asset_categories(code) ON DELETE RESTRICT,
  target_pct NUMERIC(9,6) NOT NULL CHECK (target_pct >= 0 AND target_pct <= 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, category_id)
);

CREATE INDEX idx_cat_targets_user ON category_allocation_targets(user_id);
CREATE INDEX idx_cat_targets_user_cat ON category_allocation_targets(user_id, category_id);

-- =====================================================================
-- NETWORTH MATERIALIZED (Optional Cache)
-- =====================================================================

CREATE TABLE IF NOT EXISTS networth_materialized (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  year INT NOT NULL CHECK (year >= 2000 AND year <= 2100),
  month INT NOT NULL CHECK (month >= 1 AND month <= 12),
  net_worth NUMERIC(28,4) NOT NULL,
  computed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (user_id, year, month)
);

CREATE INDEX idx_networth_user_date ON networth_materialized(user_id, year DESC, month DESC);

-- =====================================================================
-- AUDIT EVENTS (Optional - for tracking changes)
-- =====================================================================

CREATE TABLE IF NOT EXISTS audit_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_audit_user ON audit_events(user_id);
CREATE INDEX idx_audit_event_type ON audit_events(event_type);
CREATE INDEX idx_audit_created_at ON audit_events(created_at DESC);

-- =====================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =====================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asset_categories_updated_at BEFORE UPDATE ON asset_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asset_inputs_updated_at BEFORE UPDATE ON asset_inputs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_income_categories_updated_at BEFORE UPDATE ON income_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_incoming_items_updated_at BEFORE UPDATE ON incoming_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expense_categories_updated_at BEFORE UPDATE ON expense_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expense_items_updated_at BEFORE UPDATE ON expense_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_category_allocation_targets_updated_at BEFORE UPDATE ON category_allocation_targets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================================
-- VIEWS FOR COMMON QUERIES (Optional)
-- =====================================================================

-- View: Latest Net Worth per User
CREATE OR REPLACE VIEW latest_networth AS
SELECT DISTINCT ON (user_id)
  user_id,
  year,
  month,
  net_worth,
  computed_at
FROM networth_materialized
ORDER BY user_id, year DESC, month DESC;

-- =====================================================================
-- MIGRATION COMPLETE
-- =====================================================================

DO $$
DECLARE
  table_count INT;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    AND table_name NOT LIKE 'pg_%'
    AND table_name NOT LIKE 'sql_%';
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Migration 001_initial_schema.sql completed';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Database: finally';
  RAISE NOTICE 'PostgreSQL Version: 16.10';
  RAISE NOTICE 'Schema Version: 001';
  RAISE NOTICE 'Tables Created: %', table_count;
  RAISE NOTICE 'Seed Data: Asset categories (8), Income categories (6), Expense categories (8)';
  RAISE NOTICE 'Timestamp: %', now();
  RAISE NOTICE '========================================';
END $$;
-- =====================================================================
-- Add Missing Tables (Asset Management)
-- =====================================================================

-- =====================================================================
-- ASSET CATEGORIES (Fixed - single PRIMARY KEY)
-- =====================================================================

CREATE TABLE IF NOT EXISTS asset_categories (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Seed asset categories
INSERT INTO asset_categories (code, name) VALUES
  ('SINGLE_STOCKS', 'Single Stocks'),
  ('ETF_BONDS', 'ETF Bonds'),
  ('ETF_STOCKS', 'ETF Stocks'),
  ('CRYPTO', 'Crypto'),
  ('PRIVATE_EQUITY', 'Private Equity'),
  ('BUSINESS_PROFITS', 'Business Profits'),
  ('REAL_ESTATE', 'Real Estate'),
  ('CASH', 'Cash Liquidity')
ON CONFLICT (code) DO NOTHING;

-- =====================================================================
-- ASSETS
-- =====================================================================

CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES asset_categories(code) ON DELETE RESTRICT,
  ticker TEXT,
  asset_name TEXT NOT NULL,
  market_cap NUMERIC(24,4),
  market_cap_source TEXT DEFAULT 'manual',
  last_marketcap_synced_at TIMESTAMP WITH TIME ZONE,
  sub_target_pct NUMERIC(9,6) CHECK (sub_target_pct >= 0 AND sub_target_pct <= 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, asset_name)
);

CREATE INDEX IF NOT EXISTS idx_assets_user_category ON assets(user_id, category_id);
CREATE INDEX IF NOT EXISTS idx_assets_user_ticker ON assets(user_id, ticker);
CREATE INDEX IF NOT EXISTS idx_assets_user_assetname ON assets(user_id, asset_name);

-- =====================================================================
-- MARKET CAP HISTORY
-- =====================================================================

CREATE TABLE IF NOT EXISTS market_cap_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  year INT NOT NULL CHECK (year >= 2000 AND year <= 2100),
  month INT NOT NULL CHECK (month >= 1 AND month <= 12),
  market_cap NUMERIC(24,4) NOT NULL,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (asset_id, year, month)
);

CREATE INDEX IF NOT EXISTS idx_mch_asset_year_month ON market_cap_history(asset_id, year, month);

-- =====================================================================
-- ASSET INPUTS (Monthly Snapshots)
-- =====================================================================

CREATE TABLE IF NOT EXISTS asset_inputs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  year INT NOT NULL CHECK (year >= 2000 AND year <= 2100),
  month INT NOT NULL CHECK (month >= 1 AND month <= 12),
  total NUMERIC(24,4) NOT NULL CHECK (total >= 0),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, asset_id, year, month)
);

CREATE INDEX IF NOT EXISTS idx_asset_inputs_user_date ON asset_inputs(user_id, year DESC, month DESC);
CREATE INDEX IF NOT EXISTS idx_asset_inputs_asset ON asset_inputs(asset_id);

-- =====================================================================
-- CATEGORY ALLOCATION TARGETS
-- =====================================================================

CREATE TABLE IF NOT EXISTS category_allocation_targets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES asset_categories(code) ON DELETE RESTRICT,
  target_pct NUMERIC(9,6) NOT NULL CHECK (target_pct >= 0 AND target_pct <= 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_cat_targets_user ON category_allocation_targets(user_id);
CREATE INDEX IF NOT EXISTS idx_cat_targets_user_cat ON category_allocation_targets(user_id, category_id);

-- =====================================================================
-- Add updated_at triggers for new tables
-- =====================================================================

CREATE TRIGGER update_asset_categories_updated_at BEFORE UPDATE ON asset_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asset_inputs_updated_at BEFORE UPDATE ON asset_inputs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_category_allocation_targets_updated_at BEFORE UPDATE ON category_allocation_targets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================================
-- Verification
-- =====================================================================

DO $$
DECLARE
  table_count INT;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    AND table_name NOT LIKE 'pg_%'
    AND table_name NOT LIKE 'sql_%';
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Migration 002_missing_tables.sql completed';
  RAISE NOTICE 'Total tables: %', table_count;
  RAISE NOTICE '========================================';
END $$;
