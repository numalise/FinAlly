export interface Asset {
  id: string;
  name: string;
  ticker?: string;
  category: string;
  currentValue: number;
  previousValue: number;
  quantity?: number;
  marketCap?: number;
}

export interface CategoryAllocation {
  category: string;
  categoryName: string;
  currentValue: number;
  previousValue: number;
  currentPercentage: number;
  previousPercentage: number;
  targetPercentage: number;
  assets: Asset[];
  color: string;
}

export interface AllocationHistory {
  month: string;
  [category: string]: number | string;
}
