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
