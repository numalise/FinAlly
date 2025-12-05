import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useNetworthHistory() {
  return useQuery({
    queryKey: ['networth-history'],
    queryFn: async () => {
      const response = await api.getNetworthHistory();
      return response.data;
    },
  });
}

export function useNetworthProjection() {
  return useQuery({
    queryKey: ['networth-projection'],
    queryFn: async () => {
      const response = await api.getNetworthProjection();
      return response.data;
    },
  });
}
