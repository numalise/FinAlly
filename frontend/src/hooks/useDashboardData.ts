import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Mock data for now (until we implement the API endpoints)
const mockNetWorthData = [
  { month: 'Jul', value: 115000 },
  { month: 'Aug', value: 118000 },
  { month: 'Sep', value: 120000 },
  { month: 'Oct', value: 122000 },
  { month: 'Nov', value: 125430 },
];

const mockProjectionData = [
  { month: 'Nov', actual: 125430, projected: 125430 },
  { month: 'Dec', projected: 128000 },
  { month: 'Jan', projected: 131000 },
  { month: 'Feb', projected: 134000 },
  { month: 'Mar', projected: 137000 },
  { month: 'Apr', projected: 140000 },
];

const mockAssetAllocation = [
  { category: 'Stocks', value: 65000, percentage: 51.8 },
  { category: 'Real Estate', value: 35000, percentage: 27.9 },
  { category: 'Crypto', value: 15000, percentage: 12.0 },
  { category: 'Cash', value: 8430, percentage: 6.7 },
  { category: 'Bonds', value: 2000, percentage: 1.6 },
];

export function useDashboardData() {
  // Current net worth
  const currentNetWorth = 125430;
  const previousNetWorth = 120200;
  const monthlyChange = currentNetWorth - previousNetWorth;
  const monthlyChangePercent = ((monthlyChange / previousNetWorth) * 100).toFixed(1);

  // Savings rate
  const savingsRate = 32;
  const targetSavingsRate = 30;

  return {
    currentNetWorth,
    monthlyChange,
    monthlyChangePercent,
    savingsRate,
    targetSavingsRate,
    netWorthHistory: mockNetWorthData,
    projections: mockProjectionData,
    assetAllocation: mockAssetAllocation,
    totalAssets: 12,
    totalCategories: 5,
  };
}

export function useHealthCheck() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => api.health(),
  });
}
