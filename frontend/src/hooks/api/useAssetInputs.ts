import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useAssetInputs(year: number, month: number) {
  return useQuery({
    queryKey: ['asset-inputs', year, month],
    queryFn: async () => {
      const response = await api.getAssetInputs(year, month);
      return response.data;
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
