import { CategoryAllocation, AllocationHistory, AssetCategoryCode } from '@/types/allocation';

const BLUE_PALETTE = [
  '#2196f3', // Single Stocks
  '#1e88e5', // ETF Stocks
  '#1976d2', // ETF Bonds
  '#1565c0', // Crypto
  '#0d47a1', // Private Equity
  '#64b5f6', // Business Profits
  '#42a5f5', // Real Estate
  '#90caf9', // Cash
];

const TOTAL_NET_WORTH = 125430;
const PREVIOUS_NET_WORTH = 120200;

// Mock detailed allocation data matching database schema
const mockCategoryData: CategoryAllocation[] = [
  {
    category: 'SINGLE_STOCKS',
    categoryName: 'Single Stocks',
    currentValue: 25000,
    previousValue: 23000,
    currentPercentage: 19.9,
    previousPercentage: 19.1,
    targetPercentage: 20.0,
    targetValue: 25086, // 20% of 125430
    delta: -86, // 25000 - 25086
    deltaPercentage: -0.1, // 19.9 - 20.0
    hasMarketCapTargets: true,
    color: BLUE_PALETTE[0],
    assets: [
      {
        id: '1',
        name: 'Apple',
        ticker: 'AAPL',
        category: 'SINGLE_STOCKS',
        currentValue: 10000,
        previousValue: 9500,
        marketCap: 3000000000000, // $3T
        subTargetPct: 0.60, // 60% of category based on market cap
        quantity: 25,
      },
      {
        id: '2',
        name: 'Microsoft',
        ticker: 'MSFT',
        category: 'SINGLE_STOCKS',
        currentValue: 10000,
        previousValue: 9000,
        marketCap: 2500000000000, // $2.5T
        subTargetPct: 0.30, // 30% of category
        quantity: 28,
      },
      {
        id: '3',
        name: 'Google',
        ticker: 'GOOGL',
        category: 'SINGLE_STOCKS',
        currentValue: 5000,
        previousValue: 4500,
        marketCap: 1700000000000, // $1.7T
        subTargetPct: 0.10, // 10% of category
        quantity: 35,
      },
    ],
  },
  {
    category: 'ETF_STOCKS',
    categoryName: 'ETF Stocks',
    currentValue: 35000,
    previousValue: 33000,
    currentPercentage: 27.9,
    previousPercentage: 27.5,
    targetPercentage: 25.0,
    targetValue: 31357.5,
    delta: 3642.5, // Over target
    deltaPercentage: 2.9,
    hasMarketCapTargets: true,
    color: BLUE_PALETTE[1],
    assets: [
      {
        id: '4',
        name: 'VWCE',
        ticker: 'VWCE',
        category: 'ETF_STOCKS',
        currentValue: 20000,
        previousValue: 19000,
        marketCap: 15000000000, // $15B AUM
        subTargetPct: 0.60,
        quantity: 350,
      },
      {
        id: '5',
        name: 'S&P 500 ETF',
        ticker: 'SPY',
        category: 'ETF_STOCKS',
        currentValue: 15000,
        previousValue: 14000,
        marketCap: 10000000000, // $10B AUM
        subTargetPct: 0.40,
        quantity: 35,
      },
    ],
  },
  {
    category: 'ETF_BONDS',
    categoryName: 'ETF Bonds',
    currentValue: 10000,
    previousValue: 10000,
    currentPercentage: 8.0,
    previousPercentage: 8.3,
    targetPercentage: 10.0,
    targetValue: 12543,
    delta: -2543, // Under target
    deltaPercentage: -2.0,
    hasMarketCapTargets: true,
    color: BLUE_PALETTE[2],
    assets: [
      {
        id: '6',
        name: 'Government Bonds ETF',
        ticker: 'AGG',
        category: 'ETF_BONDS',
        currentValue: 7000,
        previousValue: 7000,
        marketCap: 90000000000,
        subTargetPct: 0.70,
        quantity: 65,
      },
      {
        id: '7',
        name: 'Corporate Bonds ETF',
        ticker: 'LQD',
        category: 'ETF_BONDS',
        currentValue: 3000,
        previousValue: 3000,
        marketCap: 40000000000,
        subTargetPct: 0.30,
        quantity: 28,
      },
    ],
  },
  {
    category: 'CRYPTO',
    categoryName: 'Crypto',
    currentValue: 15000,
    previousValue: 13000,
    currentPercentage: 12.0,
    previousPercentage: 10.8,
    targetPercentage: 10.0,
    targetValue: 12543,
    delta: 2457, // Over target
    deltaPercentage: 2.0,
    hasMarketCapTargets: true,
    color: BLUE_PALETTE[3],
    assets: [
      {
        id: '8',
        name: 'Bitcoin',
        ticker: 'BTC',
        category: 'CRYPTO',
        currentValue: 10000,
        previousValue: 8500,
        marketCap: 1800000000000, // Market cap
        subTargetPct: 0.70,
        quantity: 0.15,
      },
      {
        id: '9',
        name: 'Ethereum',
        ticker: 'ETH',
        category: 'CRYPTO',
        currentValue: 5000,
        previousValue: 4500,
        marketCap: 400000000000,
        subTargetPct: 0.30,
        quantity: 2.5,
      },
    ],
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
    delta: 1728.5, // Over target
    deltaPercentage: 1.4,
    hasMarketCapTargets: false, // No market cap targets
    color: BLUE_PALETTE[4],
    assets: [
      {
        id: '10',
        name: 'Startup Investment A',
        category: 'PRIVATE_EQUITY',
        currentValue: 5000,
        previousValue: 5000,
      },
      {
        id: '11',
        name: 'VC Fund B',
        category: 'PRIVATE_EQUITY',
        currentValue: 3000,
        previousValue: 3000,
      },
    ],
  },
  {
    category: 'BUSINESS_PROFITS',
    categoryName: 'Business Profits',
    currentValue: 5000,
    previousValue: 5000,
    currentPercentage: 4.0,
    previousPercentage: 4.2,
    targetPercentage: 5.0,
    targetValue: 6271.5,
    delta: -1271.5, // Under target
    deltaPercentage: -1.0,
    hasMarketCapTargets: false,
    color: BLUE_PALETTE[5],
    assets: [
      {
        id: '12',
        name: 'Consulting Business',
        category: 'BUSINESS_PROFITS',
        currentValue: 5000,
        previousValue: 5000,
      },
    ],
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
    delta: -5086, // Under target
    deltaPercentage: -4.1,
    hasMarketCapTargets: false, // No market cap targets
    color: BLUE_PALETTE[6],
    assets: [
      {
        id: '13',
        name: 'Primary Residence (Equity)',
        category: 'REAL_ESTATE',
        currentValue: 15000,
        previousValue: 15000,
      },
      {
        id: '14',
        name: 'REITs',
        category: 'REAL_ESTATE',
        currentValue: 5000,
        previousValue: 5000,
        ticker: 'VNQ',
        quantity: 50,
      },
    ],
  },
  {
    category: 'CASH',
    categoryName: 'Cash Liquidity',
    currentValue: 7430,
    previousValue: 8200,
    currentPercentage: 5.9,
    previousPercentage: 6.8,
    targetPercentage: 5.0,
    targetValue: 6271.5,
    delta: 1158.5, // Over target
    deltaPercentage: 0.9,
    hasMarketCapTargets: true, // Cash has targets but no market cap
    color: BLUE_PALETTE[7],
    assets: [
      {
        id: '15',
        name: 'Emergency Fund',
        category: 'CASH',
        currentValue: 5000,
        previousValue: 6000,
      },
      {
        id: '16',
        name: 'Checking Account',
        category: 'CASH',
        currentValue: 2430,
        previousValue: 2200,
      },
    ],
  },
];

// Historical allocation (8 categories, 6 months)
const mockAllocationHistory: AllocationHistory[] = [
  { month: 'Jun', single_stocks: 18, etf_stocks: 26, etf_bonds: 9, crypto: 9, private_equity: 7, business_profits: 4, real_estate: 17, cash: 10 },
  { month: 'Jul', single_stocks: 19, etf_stocks: 26, etf_bonds: 9, crypto: 9, private_equity: 7, business_profits: 4, real_estate: 17, cash: 9 },
  { month: 'Aug', single_stocks: 19, etf_stocks: 27, etf_bonds: 8, crypto: 10, private_equity: 7, business_profits: 4, real_estate: 16, cash: 9 },
  { month: 'Sep', single_stocks: 19, etf_stocks: 27, etf_bonds: 8, crypto: 11, private_equity: 7, business_profits: 4, real_estate: 16, cash: 8 },
  { month: 'Oct', single_stocks: 19, etf_stocks: 28, etf_bonds: 8, crypto: 11, private_equity: 6, business_profits: 4, real_estate: 16, cash: 8 },
  { month: 'Nov', single_stocks: 20, etf_stocks: 28, etf_bonds: 8, crypto: 12, private_equity: 6, business_profits: 4, real_estate: 16, cash: 6 },
];

export function useAllocationData() {
  return {
    categories: mockCategoryData,
    allocationHistory: mockAllocationHistory,
    totalValue: TOTAL_NET_WORTH,
    previousTotalValue: PREVIOUS_NET_WORTH,
    totalChange: TOTAL_NET_WORTH - PREVIOUS_NET_WORTH,
    totalChangePercent: (((TOTAL_NET_WORTH - PREVIOUS_NET_WORTH) / PREVIOUS_NET_WORTH) * 100).toFixed(1),
  };
}
