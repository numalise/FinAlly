/**
 * Asset transformation utilities
 * Transform and group asset data for display
 */

import { AssetCategoryCode } from '@/types/allocation';

interface RawAsset {
  id: string;
  asset_name: string;
  ticker?: string;
  category_id: string;
  market_cap?: string | number;
  category?: {
    category_name: string;
  };
}

interface AssetInput {
  asset_id: string;
  total: number;
  notes?: string;
}

export interface TransformedAsset {
  id: string;
  name: string;
  ticker?: string;
  category: string;
  categoryName: string;
  currentValue?: number;
  notes?: string;
  marketCap?: number;
}

/**
 * Merge assets with their input values for a given period
 */
export function mergeAssetsWithInputs(
  assets: RawAsset[] = [],
  inputs: AssetInput[] = []
): TransformedAsset[] {
  return assets.map((asset) => {
    const input = inputs.find((inp) => inp.asset_id === asset.id);
    return {
      id: asset.id,
      name: asset.asset_name,
      ticker: asset.ticker,
      category: asset.category_id,
      categoryName: asset.category?.category_name || asset.category_id,
      currentValue: input?.total,
      notes: input?.notes,
      marketCap: asset.market_cap ? parseFloat(String(asset.market_cap)) : undefined,
    };
  });
}

/**
 * Group assets by their category code
 */
export function groupAssetsByCategory(assets: TransformedAsset[]) {
  const categories: Record<string, TransformedAsset[]> = {
    SINGLE_STOCKS: [],
    ETF_STOCKS: [],
    ETF_BONDS: [],
    CRYPTO: [],
    PRIVATE_EQUITY: [],
    BUSINESS_PROFITS: [],
    REAL_ESTATE: [],
    CASH: [],
  };

  assets.forEach((asset) => {
    if (categories[asset.category]) {
      categories[asset.category].push(asset);
    }
  });

  return categories;
}

/**
 * Get category metadata for display
 */
export function getCategoryMetadata() {
  return [
    {
      code: 'SINGLE_STOCKS' as AssetCategoryCode,
      name: 'Single Stocks',
      requiresTicker: true,
      hasMarketCap: true,
    },
    {
      code: 'ETF_STOCKS' as AssetCategoryCode,
      name: 'ETF Stocks',
      requiresTicker: true,
      hasMarketCap: true,
    },
    {
      code: 'ETF_BONDS' as AssetCategoryCode,
      name: 'ETF Bonds',
      requiresTicker: true,
      hasMarketCap: true,
    },
    {
      code: 'CRYPTO' as AssetCategoryCode,
      name: 'Crypto',
      requiresTicker: true,
      hasMarketCap: true,
    },
    {
      code: 'PRIVATE_EQUITY' as AssetCategoryCode,
      name: 'Private Equity',
      requiresTicker: false,
      hasMarketCap: false,
    },
    {
      code: 'BUSINESS_PROFITS' as AssetCategoryCode,
      name: 'Business Profits',
      requiresTicker: false,
      hasMarketCap: false,
    },
    {
      code: 'REAL_ESTATE' as AssetCategoryCode,
      name: 'Real Estate',
      requiresTicker: false,
      hasMarketCap: false,
    },
    {
      code: 'CASH' as AssetCategoryCode,
      name: 'Cash Liquidity',
      requiresTicker: false,
      hasMarketCap: false,
    },
  ];
}

/**
 * Format asset data for chart display
 */
export function formatAssetsForChart(assets: TransformedAsset[]) {
  return assets
    .filter((asset) => asset.currentValue && asset.currentValue > 0)
    .map((asset) => ({
      name: asset.name,
      value: asset.currentValue || 0,
      category: asset.categoryName,
    }));
}
