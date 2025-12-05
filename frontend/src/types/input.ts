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

export interface ExpenseSubcategory {
  id: string;
  code: string;
  parentCategoryId: string;
  name: string;
  isDefault: boolean;
  sortOrder: number;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseItem {
  id: string;
  userId: string;
  categoryId: string; // References expense_categories.code
  subcategoryId?: string; // References expense_subcategories.id
  year: number;
  month: number;
  amount: number;
  description?: string;
  subcategory?: ExpenseSubcategory;
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
  { code: 'LOAN', name: 'Loans' },
  { code: 'OTHER', name: 'Other' },
] as const;

// Predefined subcategories for display
export const PREDEFINED_SUBCATEGORIES: Record<string, string[]> = {
  RENT: ['General', 'Address 1', 'Address 2'],
  UTILITY: ['Electricity & Gas', 'Water', 'Internet', 'Phone'],
  FOOD: ['Groceries', 'Out/Delivery meals'],
  TRANSPORT: ['Fuels', 'Public Transport', 'Vehicle Maintenance', 'Taxi/Uber', 'Parkings'],
  FEES: ['Streaming', 'AI', 'Other fees'],
  INSURANCE: ['Waste tax', 'Health insurance', 'Other taxes', 'Other insurances'],
  WELLNESS: ['Leisure', 'Travels', 'Shopping', 'Gifts', 'Others'],
  LOAN: ['Loan 1', 'Loan 2'],
  OTHER: ['General'],
};

export type IncomeCategoryCode = typeof INCOME_CATEGORIES[number]['code'];
export type ExpenseCategoryCode = typeof EXPENSE_CATEGORIES[number]['code'];
