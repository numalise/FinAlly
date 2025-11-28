import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useAllocation(year?: number, month?: number) {
  return useQuery({
    queryKey: ['allocation', year, month],
    queryFn: async () => {
      const response = await api.getAllocation(year, month);
      return response.data;
    },
  });
}

export function useCategoryTargets() {
  return useQuery({
    queryKey: ['category-targets'],
    queryFn: async () => {
      const response = await api.getCategoryTargets();
      return response.data;
    },
  });
}

export function useUpdateCategoryTarget() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ category, targetPct }: { category: string; targetPct: number }) =>
      api.updateCategoryTarget(category, targetPct),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['category-targets'] });
      queryClient.invalidateQueries({ queryKey: ['allocation'] });
    },
  });
}
