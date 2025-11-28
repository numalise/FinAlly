import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

const mockAssetAllocation = [
  { category: 'Single Stocks', value: 25000, percentage: 19.9, target: 25086, targetPercentage: 20.0 },
  { category: 'ETF Stocks', value: 35000, percentage: 27.9, target: 31357.5, targetPercentage: 25.0 },
  { category: 'ETF Bonds', value: 10000, percentage: 8.0, target: 12543, targetPercentage: 10.0 },
  { category: 'Crypto', value: 15000, percentage: 12.0, target: 12543, targetPercentage: 10.0 },
  { category: 'Private Equity', value: 8000, percentage: 6.4, target: 6271.5, targetPercentage: 5.0 },
  { category: 'Business Profits', value: 5000, percentage: 4.0, target: 6271.5, targetPercentage: 5.0 },
  { category: 'Real Estate', value: 20000, percentage: 15.9, target: 25086, targetPercentage: 20.0 },
  { category: 'Cash Liquidity', value: 7430, percentage: 5.9, target: 6271.5, targetPercentage: 5.0 },
];

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

const initialBudgets = [
  { category: 'RENT', categoryName: 'Rents', budgetAmount: 1200, actualAmount: 1200, calculated: false },
  { category: 'FOOD', categoryName: 'Food', budgetAmount: 500, actualAmount: 420, calculated: false },
  { category: 'TRANSPORT', categoryName: 'Transport', budgetAmount: 200, actualAmount: 150, calculated: false },
  { category: 'UTILITY', categoryName: 'Utility', budgetAmount: 150, actualAmount: 120, calculated: false },
  { category: 'INSURANCE', categoryName: 'Insurances & Taxes', budgetAmount: 200, actualAmount: 200, calculated: false },
  { category: 'WELLNESS', categoryName: 'Wellness', budgetAmount: 100, actualAmount: 80, calculated: true },
  { category: 'OTHER', categoryName: 'Other', budgetAmount: 150, actualAmount: 100, calculated: true },
];

export function useDashboardData() {
  const [budgets, setBudgets] = useState(initialBudgets);

  const currentNetWorth = 125430;
  const previousNetWorth = 120200;
  const monthlyChange = currentNetWorth - previousNetWorth;
  const monthlyChangePercent = ((monthlyChange / previousNetWorth) * 100).toFixed(1);

  const totalIncome = 3650;
  const totalExpenses = 2070;

  const totalBudget = budgets.reduce((sum, b) => sum + b.budgetAmount, 0);
  const totalActualExpenses = budgets.reduce((sum, b) => sum + b.actualAmount, 0);

  const handleUpdateBudget = (category: string, amount: number) => {
    setBudgets(prev => prev.map(b => 
      b.category === category ? { ...b, budgetAmount: amount } : b
    ));
    console.log('Update budget:', { category, amount });
    // TODO: API call to PATCH /budgets/:category
  };

  return {
    currentNetWorth,
    monthlyChange,
    monthlyChangePercent,
    totalIncome,
    totalExpenses,
    netWorthHistory: mockNetWorthData,
    projections: mockProjectionData,
    assetAllocation: mockAssetAllocation,
    budgets,
    totalBudget,
    totalActualExpenses,
    totalAssets: 16,
    totalCategories: 8,
    handleUpdateBudget,
  };
}

export function useHealthCheck() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => api.health(),
  });
}
