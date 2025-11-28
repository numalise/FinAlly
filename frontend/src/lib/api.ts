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
  // Health & Users
  health: () => apiClient.get('/health'),
  getCurrentUser: () => apiClient.get('/users/me'),
  updateUser: (data: { displayName?: string; full_name?: string }) => 
    apiClient.patch('/users/me', data),
  exportData: () => apiClient.get('/export/data'),

  // Assets
  getAssets: () => apiClient.get('/assets'),
  createAsset: (data: { name: string; ticker?: string; category_id: string; market_cap?: number }) =>
    apiClient.post('/assets', data),
  updateAsset: (id: string, data: { name?: string; ticker?: string; market_cap?: number }) =>
    apiClient.patch(`/assets/${id}`, data),
  deleteAsset: (id: string) => apiClient.delete(`/assets/${id}`),

  // Asset Inputs
  getAssetInputs: (year: number, month: number) =>
    apiClient.get(`/asset-inputs?year=${year}&month=${month}`),
  saveAssetInput: (data: { asset_id: string; year: number; month: number; total: number; notes?: string }) =>
    apiClient.post('/asset-inputs', data),

  // Incomings
  getIncomings: (year: number, month: number) =>
    apiClient.get(`/incomings?year=${year}&month=${month}`),
  createIncoming: (data: { category_id: string; year: number; month: number; amount: number; description?: string }) =>
    apiClient.post('/incomings', data),
  deleteIncoming: (id: string) => apiClient.delete(`/incomings/${id}`),

  // Expenses
  getExpenses: (year: number, month: number) =>
    apiClient.get(`/expenses?year=${year}&month=${month}`),
  createExpense: (data: { category_id: string; year: number; month: number; amount: number; description?: string }) =>
    apiClient.post('/expenses', data),
  deleteExpense: (id: string) => apiClient.delete(`/expenses/${id}`),

  // Budgets
  getBudgets: (year: number, month: number) =>
    apiClient.get(`/budgets?year=${year}&month=${month}`),
  updateBudget: (category: string, data: { amount: number; year: number; month: number }) =>
    apiClient.patch(`/budgets/${category}`, data),

  // Allocation
  getAllocation: (year?: number, month?: number) => {
    const params = year && month ? `?year=${year}&month=${month}` : '';
    return apiClient.get(`/allocation${params}`);
  },
  getCategoryTargets: () => apiClient.get('/category-allocation-targets'),
  updateCategoryTarget: (category: string, targetPct: number) =>
    apiClient.patch(`/category-allocation-targets/${category}`, { target_pct: targetPct }),

  // Net Worth
  getNetworthHistory: () => apiClient.get('/networth/history'),
  getNetworthProjection: () => apiClient.get('/networth/projection'),
};
