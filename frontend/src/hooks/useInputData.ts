import { useState } from 'react';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/types/input';

interface Asset {
  id: string;
  name: string;
  ticker?: string;
  category: string;
  categoryName: string;
  currentValue?: number;
  notes?: string;
}

interface CashFlowItem {
  id: string;
  categoryId: string;
  categoryName: string;
  amount: number;
  description?: string;
}

// Mock assets from all 8 categories
const mockAssets: Asset[] = [
  // Single Stocks
  { id: '1', name: 'Apple', ticker: 'AAPL', category: 'SINGLE_STOCKS', categoryName: 'Single Stocks', currentValue: 10000 },
  { id: '2', name: 'Microsoft', ticker: 'MSFT', category: 'SINGLE_STOCKS', categoryName: 'Single Stocks', currentValue: 10000 },
  { id: '3', name: 'Google', ticker: 'GOOGL', category: 'SINGLE_STOCKS', categoryName: 'Single Stocks', currentValue: 5000 },
  
  // ETF Stocks
  { id: '4', name: 'VWCE', ticker: 'VWCE', category: 'ETF_STOCKS', categoryName: 'ETF Stocks', currentValue: 20000 },
  { id: '5', name: 'S&P 500 ETF', ticker: 'SPY', category: 'ETF_STOCKS', categoryName: 'ETF Stocks', currentValue: 15000 },
  
  // ETF Bonds
  { id: '6', name: 'Government Bonds ETF', ticker: 'AGG', category: 'ETF_BONDS', categoryName: 'ETF Bonds', currentValue: 7000 },
  { id: '7', name: 'Corporate Bonds ETF', ticker: 'LQD', category: 'ETF_BONDS', categoryName: 'ETF Bonds', currentValue: 3000 },
  
  // Crypto
  { id: '8', name: 'Bitcoin', ticker: 'BTC', category: 'CRYPTO', categoryName: 'Crypto', currentValue: 10000 },
  { id: '9', name: 'Ethereum', ticker: 'ETH', category: 'CRYPTO', categoryName: 'Crypto', currentValue: 5000 },
  
  // Private Equity
  { id: '10', name: 'Startup Investment A', category: 'PRIVATE_EQUITY', categoryName: 'Private Equity', currentValue: 5000 },
  { id: '11', name: 'VC Fund B', category: 'PRIVATE_EQUITY', categoryName: 'Private Equity', currentValue: 3000 },
  
  // Business Profits
  { id: '12', name: 'Consulting Business', category: 'BUSINESS_PROFITS', categoryName: 'Business Profits', currentValue: 5000 },
  
  // Real Estate
  { id: '13', name: 'Primary Residence (Equity)', category: 'REAL_ESTATE', categoryName: 'Real Estate', currentValue: 15000 },
  { id: '14', name: 'REITs', ticker: 'VNQ', category: 'REAL_ESTATE', categoryName: 'Real Estate', currentValue: 5000 },
  
  // Cash
  { id: '15', name: 'Emergency Fund', category: 'CASH', categoryName: 'Cash Liquidity', currentValue: 5000 },
  { id: '16', name: 'Checking Account', category: 'CASH', categoryName: 'Cash Liquidity', currentValue: 2430 },
];

// Mock income items
const mockIncomeItems: CashFlowItem[] = [
  { 
    id: 'inc1', 
    categoryId: 'SALARY', 
    categoryName: 'Salary', 
    amount: 3500, 
    description: 'Monthly salary' 
  },
  { 
    id: 'inc2', 
    categoryId: 'DIVIDEND', 
    categoryName: 'Dividends', 
    amount: 150, 
    description: 'ETF dividends' 
  },
];

// Mock expense items
const mockExpenseItems: CashFlowItem[] = [
  { id: 'exp1', categoryId: 'RENT', categoryName: 'Rents', amount: 1200, description: 'Apartment rent' },
  { id: 'exp2', categoryId: 'FOOD', categoryName: 'Food', amount: 400, description: 'Groceries & dining' },
  { id: 'exp3', categoryId: 'TRANSPORT', categoryName: 'Transport', amount: 150, description: 'Gas & public transit' },
  { id: 'exp4', categoryId: 'UTILITY', categoryName: 'Utility', amount: 120, description: 'Electricity & water' },
  { id: 'exp5', categoryId: 'INSURANCE', categoryName: 'Insurances & Taxes', amount: 200, description: 'Health insurance' },
];

export function useInputData(year: number, month: number) {
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [incomeItems, setIncomeItems] = useState<CashFlowItem[]>(mockIncomeItems);
  const [expenseItems, setExpenseItems] = useState<CashFlowItem[]>(mockExpenseItems);

  const handleSaveAsset = (assetId: string, value: number, notes?: string) => {
    setAssets(prev => prev.map(asset => 
      asset.id === assetId 
        ? { ...asset, currentValue: value, notes }
        : asset
    ));
    console.log('Save asset:', { assetId, value, notes, year, month });
    // TODO: API call to POST /asset-inputs
  };

  const handleSaveIncome = (categoryId: string, amount: number, description?: string) => {
    const categoryName = INCOME_CATEGORIES.find(c => c.code === categoryId)?.name || '';
    const newItem: CashFlowItem = {
      id: `inc-${Date.now()}`,
      categoryId,
      categoryName,
      amount,
      description,
    };
    setIncomeItems(prev => [...prev, newItem]);
    console.log('Save income:', { categoryId, amount, description, year, month });
    // TODO: API call to POST /incomings
  };

  const handleSaveExpense = (categoryId: string, amount: number, description?: string) => {
    const categoryName = EXPENSE_CATEGORIES.find(c => c.code === categoryId)?.name || '';
    const newItem: CashFlowItem = {
      id: `exp-${Date.now()}`,
      categoryId,
      categoryName,
      amount,
      description,
    };
    setExpenseItems(prev => [...prev, newItem]);
    console.log('Save expense:', { categoryId, amount, description, year, month });
    // TODO: API call to POST /expenses
  };

  const handleDeleteIncome = (id: string) => {
    setIncomeItems(prev => prev.filter(item => item.id !== id));
    console.log('Delete income:', { id, year, month });
    // TODO: API call to DELETE /incomings/:id
  };

  const handleDeleteExpense = (id: string) => {
    setExpenseItems(prev => prev.filter(item => item.id !== id));
    console.log('Delete expense:', { id, year, month });
    // TODO: API call to DELETE /expenses/:id
  };

  return {
    assets,
    incomeItems,
    expenseItems,
    handleSaveAsset,
    handleSaveIncome,
    handleSaveExpense,
    handleDeleteIncome,
    handleDeleteExpense,
  };
}
