import { AssetCategoryCode, CategoryAllocation } from '@/types/allocation';

const MARKET_CAP_CATEGORIES: AssetCategoryCode[] = [
  'SINGLE_STOCKS',
  'ETF_STOCKS',
  'ETF_BONDS',
  'CRYPTO',
];

export interface NormalizedAllocationSummary {
  netWorth: number;
  previousNetWorth: number;
  totalChange: number;
  categories: Omit<CategoryAllocation, 'color'>[];
}

const toNumber = (value: unknown): number => {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export function normalizeAllocationData(payload?: any): NormalizedAllocationSummary {
  const netWorth = toNumber(payload?.totalValue ?? payload?.total_value);
  const previousNetWorth = toNumber(payload?.previousTotalValue ?? payload?.previous_total_value);
  const totalChange = toNumber(
    payload?.totalChange ?? payload?.total_change ?? netWorth - previousNetWorth,
  );

  const categoriesRaw: any[] = payload?.categories ?? [];

  const categories: Omit<CategoryAllocation, 'color'>[] = categoriesRaw.map((cat) => {
    const categoryCode = (cat?.category || 'UNKNOWN') as AssetCategoryCode;
    const categoryName = cat?.categoryName ?? cat?.category_name ?? categoryCode;

    const currentValue = toNumber(cat?.currentValue ?? cat?.current_value);
    const previousValue = toNumber(cat?.previousValue ?? cat?.previous_value);

    const targetPercentage = toNumber(cat?.targetPercentage ?? cat?.target_percentage);
    const targetValue = (targetPercentage / 100) * netWorth;

    const currentPercentage = netWorth > 0 ? (currentValue / netWorth) * 100 : 0;
    const previousPercentage = previousNetWorth > 0 ? (previousValue / previousNetWorth) * 100 : 0;
    const delta = targetValue - currentValue;
    const deltaPercentage = targetPercentage - currentPercentage;

    const assetsRaw: any[] = cat?.assets ?? [];
    const assets = assetsRaw.map((asset) => ({
      id: asset?.id,
      name: asset?.name ?? asset?.assetName ?? asset?.asset_name ?? 'Unnamed Asset',
      ticker: asset?.ticker ?? undefined,
      category: (asset?.category ?? asset?.categoryId ?? asset?.category_id ?? categoryCode) as AssetCategoryCode,
      categoryName: asset?.categoryName ?? asset?.category_name ?? categoryName,
      currentValue: toNumber(asset?.currentValue ?? asset?.current_value ?? asset?.total),
      previousValue: toNumber(asset?.previousValue ?? asset?.previous_value),
      marketCap: asset?.marketCap !== undefined && asset?.marketCap !== null
        ? toNumber(asset.marketCap)
        : undefined,
    }));

    return {
      category: categoryCode,
      categoryName,
      currentValue,
      previousValue,
      currentPercentage,
      previousPercentage,
      targetPercentage,
      targetValue,
      delta,
      deltaPercentage,
      assets,
      hasMarketCapTargets: MARKET_CAP_CATEGORIES.includes(categoryCode),
    };
  });

  return {
    netWorth,
    previousNetWorth,
    totalChange,
    categories,
  };
}

