import { CategoryAllocation, AllocationHistory } from '@/types/allocation';

const BLUE_PALETTE = ['#2196f3', '#1e88e5', '#1976d2', '#1565c0', '#0d47a1'];

// Mock detailed allocation data
const mockCategoryData: CategoryAllocation[] = [
  {
    category: 'stocks',
    categoryName: 'Stocks',
    currentValue: 65000,
    previousValue: 62000,
    currentPercentage: 51.8,
    previousPercentage: 51.6,
    targetPercentage: 50.0,
    color: BLUE_PALETTE[0],
    assets: [
      {
        id: '1',
        name: 'VWCE ETF',
        ticker: 'VWCE',
        category: 'stocks',
        currentValue: 35000,
        previousValue: 33000,
        quantity: 350,
      },
      {
        id: '2',
        name: 'S&P 500 ETF',
        ticker: 'SPY',
        category: 'stocks',
        currentValue: 20000,
        previousValue: 19500,
        quantity: 45,
      },
      {
        id: '3',
        name: 'Tech Stocks',
        category: 'stocks',
        currentValue: 10000,
        previousValue: 9500,
      },
    ],
  },
  {
    category: 'real_estate',
    categoryName: 'Real Estate',
    currentValue: 35000,
    previousValue: 35000,
    currentPercentage: 27.9,
    previousPercentage: 29.1,
    targetPercentage: 30.0,
    color: BLUE_PALETTE[1],
    assets: [
      {
        id: '4',
        name: 'Primary Residence (Equity)',
        category: 'real_estate',
        currentValue: 25000,
        previousValue: 25000,
      },
      {
        id: '5',
        name: 'REITs',
        category: 'real_estate',
        currentValue: 10000,
        previousValue: 10000,
        quantity: 100,
      },
    ],
  },
  {
    category: 'crypto',
    categoryName: 'Crypto',
    currentValue: 15000,
    previousValue: 13000,
    currentPercentage: 12.0,
    previousPercentage: 10.8,
    targetPercentage: 10.0,
    color: BLUE_PALETTE[2],
    assets: [
      {
        id: '6',
        name: 'Bitcoin',
        ticker: 'BTC',
        category: 'crypto',
        currentValue: 10000,
        previousValue: 8500,
        quantity: 0.15,
      },
      {
        id: '7',
        name: 'Ethereum',
        ticker: 'ETH',
        category: 'crypto',
        currentValue: 5000,
        previousValue: 4500,
        quantity: 2.5,
      },
    ],
  },
  {
    category: 'cash',
    categoryName: 'Cash',
    currentValue: 8430,
    previousValue: 8200,
    currentPercentage: 6.7,
    previousPercentage: 6.8,
    targetPercentage: 6.0,
    color: BLUE_PALETTE[3],
    assets: [
      {
        id: '8',
        name: 'Emergency Fund',
        category: 'cash',
        currentValue: 6000,
        previousValue: 6000,
      },
      {
        id: '9',
        name: 'Checking Account',
        category: 'cash',
        currentValue: 2430,
        previousValue: 2200,
      },
    ],
  },
  {
    category: 'bonds',
    categoryName: 'Bonds',
    currentValue: 2000,
    previousValue: 2000,
    currentPercentage: 1.6,
    previousPercentage: 1.7,
    targetPercentage: 4.0,
    color: BLUE_PALETTE[4],
    assets: [
      {
        id: '10',
        name: 'Government Bonds',
        category: 'bonds',
        currentValue: 2000,
        previousValue: 2000,
      },
    ],
  },
];

// Mock historical allocation data (6 months)
const mockAllocationHistory: AllocationHistory[] = [
  { month: 'Jun', stocks: 48, real_estate: 30, crypto: 10, cash: 8, bonds: 4 },
  { month: 'Jul', stocks: 49, real_estate: 30, crypto: 9, cash: 8, bonds: 4 },
  { month: 'Aug', stocks: 50, real_estate: 29, crypto: 10, cash: 7, bonds: 4 },
  { month: 'Sep', stocks: 51, real_estate: 29, crypto: 10, cash: 7, bonds: 3 },
  { month: 'Oct', stocks: 51, real_estate: 29, crypto: 11, cash: 7, bonds: 2 },
  { month: 'Nov', stocks: 52, real_estate: 28, crypto: 12, cash: 7, bonds: 1 },
];

export function useAllocationData() {
  const totalValue = mockCategoryData.reduce((sum, cat) => sum + cat.currentValue, 0);
  const previousTotalValue = mockCategoryData.reduce((sum, cat) => sum + cat.previousValue, 0);

  return {
    categories: mockCategoryData,
    allocationHistory: mockAllocationHistory,
    totalValue,
    previousTotalValue,
    totalChange: totalValue - previousTotalValue,
    totalChangePercent: ((totalValue - previousTotalValue) / previousTotalValue * 100).toFixed(1),
  };
}
