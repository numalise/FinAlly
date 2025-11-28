import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useBudgets(year: number, month: number) {
  return useQuery({
    queryKey: ['budgets', year, month],
    queryFn: async () => {
      const response = await api.getBudgets(year, month);
      return response.data;
    },
    enabled: !!year && !!month,
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ category, data }: { category: string; data: any }) => 
      api.updateBudget(category, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['budgets', variables.data.year, variables.data.month] });
    },
  });
}
