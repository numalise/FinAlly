/**
 * Centralized asset management hook
 * Handles all asset data fetching, transformations, and mutations
 */

import { useMemo } from 'react';
import {
  useAssets,
  useCreateAsset,
  useUpdateAsset,
  useDeleteAsset,
} from '@/hooks/api/useAssets';
import { useAssetInputs, useSaveAssetInput } from '@/hooks/api/useAssetInputs';
import {
  mergeAssetsWithInputs,
  groupAssetsByCategory,
  getCategoryMetadata,
  TransformedAsset,
} from '@/utils/assetTransformers';
import { calculateAssetMetrics } from '@/utils/financialCalculations';

export function useAssetManagement(year: number, month: number) {
  // Fetch data
  const { data: assetsData, isLoading: assetsLoading } = useAssets();
  const { data: assetInputsData, isLoading: inputsLoading } = useAssetInputs(year, month);

  // Mutations
  const createAsset = useCreateAsset();
  const updateAsset = useUpdateAsset();
  const deleteAsset = useDeleteAsset();
  const saveAssetInput = useSaveAssetInput();

  // Transform data
  const assets = useMemo(
    () => assetsData?.data || [],
    [assetsData]
  );

  const assetInputs = useMemo(
    () => assetInputsData?.data || [],
    [assetInputsData]
  );

  const assetsWithValues: TransformedAsset[] = useMemo(
    () => mergeAssetsWithInputs(assets, assetInputs),
    [assets, assetInputs]
  );

  const assetsByCategory = useMemo(
    () => groupAssetsByCategory(assetsWithValues),
    [assetsWithValues]
  );

  const categoryMetadata = useMemo(() => getCategoryMetadata(), []);

  // Calculate metrics
  const metrics = useMemo(
    () => calculateAssetMetrics(assetsWithValues),
    [assetsWithValues]
  );

  // Handler functions
  const handleSaveAsset = async (
    assetId: string,
    value: number,
    notes?: string
  ) => {
    return saveAssetInput.mutateAsync({
      asset_id: assetId,
      year,
      month,
      total: value,
      notes,
    });
  };

  const handleEditAsset = async (
    assetId: string,
    name: string,
    ticker?: string,
    marketCap?: number
  ) => {
    return updateAsset.mutateAsync({
      id: assetId,
      data: { name, ticker, market_cap: marketCap },
    });
  };

  const handleAddAsset = async (
    category: string,
    name: string,
    ticker?: string,
    marketCap?: number
  ) => {
    return createAsset.mutateAsync({
      name,
      ticker,
      category_id: category,
      market_cap: marketCap,
    });
  };

  const handleDeleteAsset = async (assetId: string) => {
    return deleteAsset.mutateAsync(assetId);
  };

  return {
    // Data
    assets: assetsWithValues,
    assetsByCategory,
    categoryMetadata,

    // Metrics
    totalValue: metrics.totalValue,
    countWithValues: metrics.countWithValues,
    totalAssets: metrics.totalAssets,
    completionRate: metrics.completionRate,

    // Loading states
    isLoading: assetsLoading || inputsLoading,

    // Mutation states
    isSavingInput: saveAssetInput.isPending,
    isCreating: createAsset.isPending,
    isUpdating: updateAsset.isPending,
    isDeleting: deleteAsset.isPending,

    // Handlers
    handleSaveAsset,
    handleEditAsset,
    handleAddAsset,
    handleDeleteAsset,
  };
}
