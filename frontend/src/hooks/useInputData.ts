import { useState, useEffect } from 'react';
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

// Different data for different months
const getMonthData = (year: number, month: number) => {
  // Simulate different values per month
  const baseValue = 100000 + (month * 2000) + ((year - 2024) * 25000);
  const variation = Math.sin(month) * 5000;
  
  return {
    assets: [
      { id: '1', name: 'Apple', ticker: 'AAPL', category: 'SINGLE_STOCKS', categoryName: 'Single Stocks', currentValue: 10000 + variation },
      { id: '2', name: 'Microsoft', ticker: 'MSFT', category: 'SINGLE_STOCKS', categoryName: 'Single Stocks', currentValue: 10000 + variation * 0.8 },
      { id: '3', name: 'Google', ticker: 'GOOGL', category: 'SINGLE_STOCKS', categoryName: 'Single Stocks', currentValue: 5000 + variation * 0.5 },
      { id: '4', name: 'VWCE', ticker: 'VWCE', category: 'ETF_STOCKS', categoryName: 'ETF Stocks', currentValue: 20000 + variation * 2 },
      { id: '5', name: 'S&P 500 ETF', ticker: 'SPY', category: 'ETF_STOCKS', categoryName: 'ETF Stocks', currentValue: 15000 + variation * 1.5 },
      { id: '6', name: 'Government Bonds ETF', ticker: 'AGG', category: 'ETF_BONDS', categoryName: 'ETF Bonds', currentValue: 7000 },
      { id: '7', name: 'Corporate Bonds ETF', ticker: 'LQD', category: 'ETF_BONDS', categoryName: 'ETF Bonds', currentValue: 3000 },
      { id: '8', name: 'Bitcoin', ticker: 'BTC', category: 'CRYPTO', categoryName: 'Crypto', currentValue: 10000 + variation * 3 },
      { id: '9', name: 'Ethereum', ticker: 'ETH', category: 'CRYPTO', categoryName: 'Crypto', currentValue: 5000 + variation * 2 },
      { id: '10', name: 'Startup Investment A', category: 'PRIVATE_EQUITY', categoryName: 'Private Equity', currentValue: 5000 },
      { id: '11', name: 'VC Fund B', category: 'PRIVATE_EQUITY', categoryName: 'Private Equity', currentValue: 3000 },
      { id: '12', name: 'Consulting Business', category: 'BUSINESS_PROFITS', categoryName: 'Business Profits', currentValue: 5000 },
      { id: '13', name: 'Primary Residence (Equity)', category: 'REAL_ESTATE', categoryName: 'Real Estate', currentValue: 15000 },
      { id: '14', name: 'REITs', ticker: 'VNQ', category: 'REAL_ESTATE', categoryName: 'Real Estate', currentValue: 5000 },
      { id: '15', name: 'Emergency Fund', category: 'CASH', categoryName: 'Cash Liquidity', currentValue: 5000 },
      { id: '16', name: 'Checking Account', category: 'CASH', categoryName: 'Cash Liquidity', currentValue: 2430 + (month * 100) },
    ],
    income: [
      { id: 'inc1', categoryId: 'SALARY', categoryName: 'Salary', amount: 3500, description: 'Monthly salary' },
      { id: 'inc2', categoryId: 'DIVIDEND', categoryName: 'Dividends', amount: 150 + (month * 10), description: 'ETF dividends' },
    ],
    expenses: [
      { id: 'exp1', categoryId: 'RENT', categoryName: 'Rents', amount: 1200, description: 'Apartment rent' },
      { id: 'exp2', categoryId: 'FOOD', categoryName: 'Food', amount: 400 + (month * 20), description: 'Groceries & dining' },
      { id: 'exp3', categoryId: 'TRANSPORT', categoryName: 'Transport', amount: 150, description: 'Gas & public transit' },
      { id: 'exp4', categoryId: 'UTILITY', categoryName: 'Utility', amount: 120, description: 'Electricity & water' },
      { id: 'exp5', categoryId: 'INSURANCE', categoryName: 'Insurances & Taxes', amount: 200, description: 'Health insurance' },
    ],
  };
};

export function useInputData(year: number, month: number) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [incomeItems, setIncomeItems] = useState<CashFlowItem[]>([]);
  const [expenseItems, setExpenseItems] = useState<CashFlowItem[]>([]);

  // Load data when month/year changes
  useEffect(() => {
    console.log('Loading data for:', { year, month });
    const data = getMonthData(year, month);
    setAssets(data.assets);
    setIncomeItems(data.income);
    setExpenseItems(data.expenses);
    // TODO: API call to fetch data for this month
  }, [year, month]);

  const handleSaveAsset = (assetId: string, value: number, notes?: string) => {
    setAssets(prev => prev.map(asset => 
      asset.id === assetId 
        ? { ...asset, currentValue: value, notes }
        : asset
    ));
    console.log('Save asset:', { assetId, value, notes, year, month });
    // TODO: POST /asset-inputs
  };

  const handleAddAsset = (category: string, name: string, ticker?: string) => {
    const categoryName = assets.find(a => a.category === category)?.categoryName || '';
    const newAsset: Asset = {
      id: `new-${Date.now()}`,
      name,
      ticker,
      category,
      categoryName,
      currentValue: undefined,
      notes: undefined,
    };
    setAssets(prev => [...prev, newAsset]);
    console.log('Add asset:', { category, name, ticker, year, month });
    // TODO: POST /assets
  };

  const handleDeleteAsset = (assetId: string) => {
    setAssets(prev => prev.filter(a => a.id !== assetId));
    console.log('Delete asset:', { assetId, year, month });
    // TODO: DELETE /assets/:id
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
    // TODO: POST /incomings
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
    // TODO: POST /expenses
  };

  const handleDeleteIncome = (id: string) => {
    setIncomeItems(prev => prev.filter(item => item.id !== id));
    console.log('Delete income:', { id, year, month });
    // TODO: DELETE /incomings/:id
  };

  const handleDeleteExpense = (id: string) => {
    setExpenseItems(prev => prev.filter(item => item.id !== id));
    console.log('Delete expense:', { id, year, month });
    // TODO: DELETE /expenses/:id
  };

  return {
    assets,
    incomeItems,
    expenseItems,
    handleSaveAsset,
    handleAddAsset,
    handleDeleteAsset,
    handleSaveIncome,
    handleSaveExpense,
    handleDeleteIncome,
    handleDeleteExpense,
  };
}
