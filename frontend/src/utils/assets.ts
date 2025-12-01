import type { Asset } from '@/types/api';
import type { AssetInputItem } from '@/hooks/api/useAssetInputs';

export interface UiAsset {
  id: string;
  name: string;
  ticker?: string;
  category: string;
  categoryName: string;
  currentValue?: number;
  notes?: string;
  marketCap?: number;
}

export function mergeAssetsWithInputs(
  assets: Asset[],
  assetInputs: AssetInputItem[],
): UiAsset[] {
  return assets.map((asset) => {
    const input = assetInputs.find((inp) => inp.asset_id === asset.id);

    return {
      id: asset.id,
      name: asset.assetName,
      ticker: asset.ticker,
      category: asset.categoryId,
      categoryName: asset.category?.name || asset.categoryId,
      currentValue: input?.total,
      notes: input?.notes,
      marketCap:
        asset.marketCap !== undefined && asset.marketCap !== null
          ? parseFloat(String(asset.marketCap))
          : undefined,
    };
  });
}


