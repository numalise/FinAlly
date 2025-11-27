import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://z7rz9vksp6.execute-api.eu-central-1.amazonaws.com';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  health: () => apiClient.get('/health'),
  getCurrentUser: () => apiClient.get('/users/me'),
  updateUser: (data: { displayName: string }) => apiClient.patch('/users/me', data),
  getNetWorth: (year: number, month: number) => apiClient.get(`/networth/${year}/${month}`),
  getNetWorthHistory: (startYear: number, startMonth: number, endYear: number, endMonth: number) =>
    apiClient.get(`/networth/history?start=${startYear}-${startMonth}&end=${endYear}-${endMonth}`),
};
