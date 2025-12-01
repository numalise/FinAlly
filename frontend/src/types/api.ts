export interface ApiEnvelope<T> {
  data: T;
}

export interface UserResponse {
  id: string;
  email: string;
  displayName?: string;
  full_name?: string;
}

export interface NetworthPoint {
  month: string;
  value: number;
  net_worth?: number;
}

export interface NetworthProjectionPoint {
  month: string;
  actual?: number;
  actual_value?: number;
  projected: number;
  projected_value?: number;
}

export interface BudgetItem {
  category: string;
  budget_amount: number;
  actual_amount: number;
}

export interface CashFlowItem {
  id: string;
  category_id: string;
  year: number;
  month: number;
  amount: number;
  description?: string;
}

export interface Asset {
  id: string;
  assetName: string;
  ticker?: string;
  categoryId: string;
  category?: { name: string };
  marketCap?: string | number;
}

export interface AssetInput {
  id: string;
  asset_id: string;
  year: number;
  month: number;
  total: number;
  notes?: string;
}


