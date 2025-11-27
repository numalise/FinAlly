// Match database schema exactly

export interface AssetInput {
  id: string;
  userId: string;
  assetId: string;
  year: number;
  month: number;
  total: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IncomingItem {
  id: string;
  userId: string;
  categoryId: string; // References income_categories.code
  year: number;
  month: number;
  amount: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseItem {
  id: string;
  userId: string;
  categoryId: string; // References expense_categories.code
  year: number;
  month: number;
  amount: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string; // References expense_categories.code
  year: number;
  month: number;
  budgetAmount: number;
  calculated: boolean;
  createdAt: string;
  updatedAt: string;
}

// Category codes from database
export const INCOME_CATEGORIES = [
  { code: 'SALARY', name: 'Salary' },
  { code: 'BONUS', name: 'Bonus' },
  { code: 'DIVIDEND', name: 'Dividends' },
  { code: 'RENTAL', name: 'Rental Fees' },
  { code: 'DONATION', name: 'Donations' },
  { code: 'OTHER', name: 'Other' },
] as const;

export const EXPENSE_CATEGORIES = [
  { code: 'RENT', name: 'Rents' },
  { code: 'UTILITY', name: 'Utility' },
  { code: 'FOOD', name: 'Food' },
  { code: 'TRANSPORT', name: 'Transport' },
  { code: 'FEES', name: 'Fees & Plans' },
  { code: 'INSURANCE', name: 'Insurances & Taxes' },
  { code: 'WELLNESS', name: 'Wellness' },
  { code: 'OTHER', name: 'Other' },
] as const;

export type IncomeCategoryCode = typeof INCOME_CATEGORIES[number]['code'];
export type ExpenseCategoryCode = typeof EXPENSE_CATEGORIES[number]['code'];
