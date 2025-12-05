import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useAssetInputs(year: number, month: number) {
  return useQuery({
    queryKey: ['asset-inputs', year, month],
    queryFn: async () => {
      const response = await api.getAssetInputs(year, month);
      console.log('[useAssetInputs] API Response:', response.data);
      return response.data;
    },
    enabled: !!year && !!month,
    staleTime: 0, // Always consider data stale to ensure refetch
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });
}

export function useSaveAssetInput() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.saveAssetInput,
    onSuccess: (_, variables) => {
      console.log('[useSaveAssetInput] Invalidating and refetching all related queries');
      // Invalidate and refetch to ensure UI updates immediately
      queryClient.invalidateQueries({ queryKey: ['asset-inputs', variables.year, variables.month] });
      queryClient.refetchQueries({ queryKey: ['asset-inputs', variables.year, variables.month] });

      // Refetch allocation and networth data for Dashboard and Allocation pages
      queryClient.invalidateQueries({ queryKey: ['allocation'] });
      queryClient.refetchQueries({ queryKey: ['allocation'] });

      queryClient.invalidateQueries({ queryKey: ['networth-history'] });
      queryClient.refetchQueries({ queryKey: ['networth-history'] });

      queryClient.invalidateQueries({ queryKey: ['networth-projection'] });
      queryClient.refetchQueries({ queryKey: ['networth-projection'] });
    },
  });
}
