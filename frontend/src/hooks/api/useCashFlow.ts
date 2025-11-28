import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useIncomings(year: number, month: number) {
  return useQuery({
    queryKey: ['incomings', year, month],
    queryFn: async () => {
      const response = await api.getIncomings(year, month);
      return response.data;
    },
    enabled: !!year && !!month,
  });
}

export function useExpenses(year: number, month: number) {
  return useQuery({
    queryKey: ['expenses', year, month],
    queryFn: async () => {
      const response = await api.getExpenses(year, month);
      return response.data;
    },
    enabled: !!year && !!month,
  });
}

export function useCreateIncoming() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.createIncoming,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['incomings', variables.year, variables.month] });
      queryClient.invalidateQueries({ queryKey: ['budgets', variables.year, variables.month] });
    },
  });
}

export function useDeleteIncoming() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.deleteIncoming,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomings'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.createExpense,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['expenses', variables.year, variables.month] });
      queryClient.invalidateQueries({ queryKey: ['budgets', variables.year, variables.month] });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}
