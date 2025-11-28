import { useState } from 'react';
import { CategoryAllocation, AllocationHistory } from '@/types/allocation';

const BLUE_PALETTE = [
  '#2196f3', '#1e88e5', '#1976d2', '#1565c0',
  '#0d47a1', '#64b5f6', '#42a5f5', '#90caf9',
];

const totalValue = 125430;
const previousTotalValue = 120200;
const totalChange = totalValue - previousTotalValue;

const initialCategories: CategoryAllocation[] = [
  {
    category: 'SINGLE_STOCKS',
    categoryName: 'Single Stocks',
    currentValue: 25000,
    previousValue: 24000,
    currentPercentage: 19.9,
    previousPercentage: 20.0,
    targetPercentage: 20.0,
    targetValue: 25086,
    delta: -86,
    deltaPercentage: -0.1,
    assets: [
      { id: '1', name: 'Apple', ticker: 'AAPL', category: 'SINGLE_STOCKS', categoryName: 'Single Stocks', currentValue: 10000, previousValue: 9500, marketCap: 3000000000000 },
      { id: '2', name: 'Microsoft', ticker: 'MSFT', category: 'SINGLE_STOCKS', categoryName: 'Single Stocks', currentValue: 10000, previousValue: 9800, marketCap: 2500000000000 },
      { id: '3', name: 'Google', ticker: 'GOOGL', category: 'SINGLE_STOCKS', categoryName: 'Single Stocks', currentValue: 5000, previousValue: 4700, marketCap: 1700000000000 },
    ],
    color: BLUE_PALETTE[0],
    hasMarketCapTargets: true,
  },
  {
    category: 'ETF_STOCKS',
    categoryName: 'ETF Stocks',
    currentValue: 35000,
    previousValue: 32000,
    currentPercentage: 27.9,
    previousPercentage: 26.6,
    targetPercentage: 25.0,
    targetValue: 31357.5,
    delta: 3642.5,
    deltaPercentage: 2.9,
    assets: [
      { id: '4', name: 'VWCE', ticker: 'VWCE', category: 'ETF_STOCKS', categoryName: 'ETF Stocks', currentValue: 20000, previousValue: 18000, marketCap: 15000000000 },
      { id: '5', name: 'S&P 500 ETF', ticker: 'SPY', category: 'ETF_STOCKS', categoryName: 'ETF Stocks', currentValue: 15000, previousValue: 14000, marketCap: 10000000000 },
    ],
    color: BLUE_PALETTE[1],
    hasMarketCapTargets: true,
  },
  {
    category: 'ETF_BONDS',
    categoryName: 'ETF Bonds',
    currentValue: 10000,
    previousValue: 10200,
    currentPercentage: 8.0,
    previousPercentage: 8.5,
    targetPercentage: 10.0,
    targetValue: 12543,
    delta: -2543,
    deltaPercentage: -2.0,
    assets: [
      { id: '6', name: 'Government Bonds ETF', ticker: 'AGG', category: 'ETF_BONDS', categoryName: 'ETF Bonds', currentValue: 7000, previousValue: 7100, marketCap: 90000000000 },
      { id: '7', name: 'Corporate Bonds ETF', ticker: 'LQD', category: 'ETF_BONDS', categoryName: 'ETF Bonds', currentValue: 3000, previousValue: 3100, marketCap: 40000000000 },
    ],
    color: BLUE_PALETTE[2],
    hasMarketCapTargets: true,
  },
  {
    category: 'CRYPTO',
    categoryName: 'Crypto',
    currentValue: 15000,
    previousValue: 12000,
    currentPercentage: 12.0,
    previousPercentage: 10.0,
    targetPercentage: 10.0,
    targetValue: 12543,
    delta: 2457,
    deltaPercentage: 2.0,
    assets: [
      { id: '8', name: 'Bitcoin', ticker: 'BTC', category: 'CRYPTO', categoryName: 'Crypto', currentValue: 10000, previousValue: 8000, marketCap: 1800000000000 },
      { id: '9', name: 'Ethereum', ticker: 'ETH', category: 'CRYPTO', categoryName: 'Crypto', currentValue: 5000, previousValue: 4000, marketCap: 400000000000 },
    ],
    color: BLUE_PALETTE[3],
    hasMarketCapTargets: true,
  },
  {
    category: 'PRIVATE_EQUITY',
    categoryName: 'Private Equity',
    currentValue: 8000,
    previousValue: 8000,
    currentPercentage: 6.4,
    previousPercentage: 6.7,
    targetPercentage: 5.0,
    targetValue: 6271.5,
    delta: 1728.5,
    deltaPercentage: 1.4,
    assets: [
      { id: '10', name: 'Startup Investment A', category: 'PRIVATE_EQUITY', categoryName: 'Private Equity', currentValue: 5000, previousValue: 5000 },
      { id: '11', name: 'VC Fund B', category: 'PRIVATE_EQUITY', categoryName: 'Private Equity', currentValue: 3000, previousValue: 3000 },
    ],
    color: BLUE_PALETTE[4],
    hasMarketCapTargets: false,
  },
  {
    category: 'BUSINESS_PROFITS',
    categoryName: 'Business Profits',
    currentValue: 5000,
    previousValue: 4800,
    currentPercentage: 4.0,
    previousPercentage: 4.0,
    targetPercentage: 5.0,
    targetValue: 6271.5,
    delta: -1271.5,
    deltaPercentage: -1.0,
    assets: [
      { id: '12', name: 'Consulting Business', category: 'BUSINESS_PROFITS', categoryName: 'Business Profits', currentValue: 5000, previousValue: 4800 },
    ],
    color: BLUE_PALETTE[5],
    hasMarketCapTargets: false,
  },
  {
    category: 'REAL_ESTATE',
    categoryName: 'Real Estate',
    currentValue: 20000,
    previousValue: 20000,
    currentPercentage: 15.9,
    previousPercentage: 16.6,
    targetPercentage: 20.0,
    targetValue: 25086,
    delta: -5086,
    deltaPercentage: -4.1,
    assets: [
      { id: '13', name: 'Primary Residence (Equity)', category: 'REAL_ESTATE', categoryName: 'Real Estate', currentValue: 15000, previousValue: 15000 },
      { id: '14', name: 'REITs', ticker: 'VNQ', category: 'REAL_ESTATE', categoryName: 'Real Estate', currentValue: 5000, previousValue: 5000 },
    ],
    color: BLUE_PALETTE[6],
    hasMarketCapTargets: false,
  },
  {
    category: 'CASH',
    categoryName: 'Cash Liquidity',
    currentValue: 7430,
    previousValue: 9200,
    currentPercentage: 5.9,
    previousPercentage: 7.7,
    targetPercentage: 5.0,
    targetValue: 6271.5,
    delta: 1158.5,
    deltaPercentage: 0.9,
    assets: [
      { id: '15', name: 'Emergency Fund', category: 'CASH', categoryName: 'Cash Liquidity', currentValue: 5000, previousValue: 6000 },
      { id: '16', name: 'Checking Account', category: 'CASH', categoryName: 'Cash Liquidity', currentValue: 2430, previousValue: 3200 },
    ],
    color: BLUE_PALETTE[7],
    hasMarketCapTargets: false,
  },
];

const mockAllocationHistory: AllocationHistory[] = [
  { month: 'Jun', single_stocks: 18, etf_stocks: 26, etf_bonds: 9, crypto: 9, private_equity: 7, business_profits: 4, real_estate: 17, cash: 10 },
  { month: 'Jul', single_stocks: 19, etf_stocks: 27, etf_bonds: 9, crypto: 10, private_equity: 6, business_profits: 4, real_estate: 16, cash: 9 },
  { month: 'Aug', single_stocks: 19, etf_stocks: 27, etf_bonds: 8, crypto: 11, private_equity: 7, business_profits: 4, real_estate: 16, cash: 8 },
  { month: 'Sep', single_stocks: 20, etf_stocks: 28, etf_bonds: 8, crypto: 11, private_equity: 6, business_profits: 4, real_estate: 16, cash: 7 },
  { month: 'Oct', single_stocks: 20, etf_stocks: 28, etf_bonds: 8, crypto: 12, private_equity: 6, business_profits: 4, real_estate: 16, cash: 6 },
  { month: 'Nov', single_stocks: 20, etf_stocks: 28, etf_bonds: 8, crypto: 12, private_equity: 6, business_profits: 4, real_estate: 16, cash: 6 },
];

export function useAllocationData() {
  const [categories, setCategories] = useState(initialCategories);

  const handleUpdateTarget = (categoryCode: string, targetPct: number) => {
    setCategories(prev => prev.map(cat => {
      if (cat.category === categoryCode) {
        const newTargetValue = (targetPct / 100) * totalValue;
        const newDelta = cat.currentValue - newTargetValue;
        const newDeltaPercentage = cat.currentPercentage - targetPct;
        return {
          ...cat,
          targetPercentage: targetPct,
          targetValue: newTargetValue,
          delta: newDelta,
          deltaPercentage: newDeltaPercentage,
        };
      }
      return cat;
    }));
    console.log('Update target:', { categoryCode, targetPct });
    // TODO: API call to PATCH /category-allocation-targets/:category
  };

  return {
    categories,
    allocationHistory: mockAllocationHistory,
    totalValue,
    previousTotalValue,
    totalChange,
    totalChangePercent: '+4.4',
    handleUpdateTarget,
  };
}
