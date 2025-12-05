// Match database schema exactly
export type AssetCategoryCode = 
  | 'SINGLE_STOCKS'
  | 'ETF_STOCKS'
  | 'ETF_BONDS'
  | 'CRYPTO'
  | 'PRIVATE_EQUITY'
  | 'BUSINESS_PROFITS'
  | 'REAL_ESTATE'
  | 'CASH';

export interface Asset {
  id: string;
  name: string;
  ticker?: string;
  category: AssetCategoryCode;
  currentValue: number;
  previousValue: number;
  marketCap?: number; // Only for stocks/bonds/crypto
  subTargetPct?: number; // User override or calculated from market cap
  quantity?: number;
}

export interface CategoryAllocation {
  category: AssetCategoryCode;
  categoryName: string;
  currentValue: number;
  previousValue: number;
  currentPercentage: number;
  previousPercentage: number;
  targetPercentage: number;
  targetValue: number;
  delta: number; // Current - Target (in euros)
  deltaPercentage: number; // Current % - Target %
  assets: Asset[];
  color: string;
  hasMarketCapTargets: boolean; // True for stocks/bonds/crypto, false for real estate/PE/business
}

export interface AllocationHistory {
  month: string;
  [category: string]: number | string;
}
