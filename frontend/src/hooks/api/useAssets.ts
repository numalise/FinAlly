import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useAssets() {
  return useQuery({
    queryKey: ['assets'],
    queryFn: async () => {
      const response = await api.getAssets();
      return response.data;
    },
  });
}

export function useCreateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createAsset,
    onSuccess: () => {
      // Invalidate and refetch assets to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.refetchQueries({ queryKey: ['assets'] });
    },
  });
}

export function useUpdateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.updateAsset(id, data),
    onSuccess: () => {
      // Invalidate and refetch assets to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.refetchQueries({ queryKey: ['assets'] });
    },
  });
}

export function useDeleteAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.deleteAsset,
    onSuccess: () => {
      // Invalidate and refetch assets to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.refetchQueries({ queryKey: ['assets'] });
    },
  });
}

export function useDeleteAllAssets() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.deleteAllAssets,
    onSuccess: () => {
      // Invalidate and refetch assets to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.refetchQueries({ queryKey: ['assets'] });
    },
  });
}
