import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Normalized shape for asset input items used across the frontend
export interface AssetInputItem {
  id: string;
  asset_id: string;
  total: number;
  notes?: string;
  // Keep the raw record in case we need additional fields later
  raw?: any;
}

export function useAssetInputs(year: number, month: number) {
  return useQuery({
    queryKey: ['asset-inputs', year, month],
    queryFn: async () => {
      const response = await api.getAssetInputs(year, month);
      const rawItems = (response.data?.data || []) as any[];

      const normalized: AssetInputItem[] = rawItems.map((item) => ({
        id: item.id,
        // Backend uses assetId, but the rest of the frontend expects asset_id
        asset_id: item.assetId,
        // total is stored as a string in the DB – coerce to number
        total: parseFloat(String(item.total)),
        notes: item.notes ?? undefined,
        raw: item,
      }));

      return {
        ...response.data,
        data: normalized,
      };
    },
    enabled: !!year && !!month,
  });
}

export function useSaveAssetInput() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.saveAssetInput,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['asset-inputs', variables.year, variables.month] });
      queryClient.invalidateQueries({ queryKey: ['allocation'] });
      queryClient.invalidateQueries({ queryKey: ['networth-history'] });
      queryClient.invalidateQueries({ queryKey: ['networth-projection'] });
    },
  });
}
