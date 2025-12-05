import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useSubcategories(categoryId: string) {
  return useQuery({
    queryKey: ['subcategories', categoryId],
    queryFn: async () => {
      const response = await api.getSubcategories(categoryId);
      return response.data;
    },
    enabled: !!categoryId,
  });
}

export function useCreateSubcategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createSubcategory,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['subcategories', variables.parent_category_id],
      });
    },
  });
}

export function useUpdateSubcategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string } }) =>
      api.updateSubcategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['subcategories'],
      });
    },
  });
}

export function useDeleteSubcategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.deleteSubcategory,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['subcategories'],
      });
    },
  });
}

export function useAutoAdjustBudgets() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ year, month }: { year: number; month: number }) =>
      api.autoAdjustBudgets(year, month),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['budgets', variables.year, variables.month],
      });
    },
  });
}
