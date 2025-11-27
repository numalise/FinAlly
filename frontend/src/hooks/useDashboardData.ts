import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Use same categories as allocation page (8 categories from DB)
const mockAssetAllocation = [
  { 
    category: 'Single Stocks', 
    value: 25000, 
    percentage: 19.9,
    target: 25086,
    targetPercentage: 20.0
  },
  { 
    category: 'ETF Stocks', 
    value: 35000, 
    percentage: 27.9,
    target: 31357.5,
    targetPercentage: 25.0
  },
  { 
    category: 'ETF Bonds', 
    value: 10000, 
    percentage: 8.0,
    target: 12543,
    targetPercentage: 10.0
  },
  { 
    category: 'Crypto', 
    value: 15000, 
    percentage: 12.0,
    target: 12543,
    targetPercentage: 10.0
  },
  { 
    category: 'Private Equity', 
    value: 8000, 
    percentage: 6.4,
    target: 6271.5,
    targetPercentage: 5.0
  },
  { 
    category: 'Business Profits', 
    value: 5000, 
    percentage: 4.0,
    target: 6271.5,
    targetPercentage: 5.0
  },
  { 
    category: 'Real Estate', 
    value: 20000, 
    percentage: 15.9,
    target: 25086,
    targetPercentage: 20.0
  },
  { 
    category: 'Cash Liquidity', 
    value: 7430, 
    percentage: 5.9,
    target: 6271.5,
    targetPercentage: 5.0
  },
];

// Mock net worth data
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
    totalAssets: 16, // Updated count
    totalCategories: 8, // Updated to 8
  };
}

export function useHealthCheck() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => api.health(),
  });
}
