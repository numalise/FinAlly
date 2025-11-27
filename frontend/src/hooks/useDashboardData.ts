import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Mock data with targets
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
  { 
    category: 'Stocks', 
    value: 65000, 
    percentage: 51.8,
    target: 62500,
    targetPercentage: 50.0
  },
  { 
    category: 'Real Estate', 
    value: 35000, 
    percentage: 27.9,
    target: 37500,
    targetPercentage: 30.0
  },
  { 
    category: 'Crypto', 
    value: 15000, 
    percentage: 12.0,
    target: 12500,
    targetPercentage: 10.0
  },
  { 
    category: 'Cash', 
    value: 8430, 
    percentage: 6.7,
    target: 7500,
    targetPercentage: 6.0
  },
  { 
    category: 'Bonds', 
    value: 2000, 
    percentage: 1.6,
    target: 5000,
    targetPercentage: 4.0
  },
];

export function useDashboardData() {
  const currentNetWorth = 125430;
  const previousNetWorth = 120200;
  const monthlyChange = currentNetWorth - previousNetWorth;
  const monthlyChangePercent = ((monthlyChange / previousNetWorth) * 100).toFixed(1);

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
