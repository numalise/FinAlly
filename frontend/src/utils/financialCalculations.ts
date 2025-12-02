/**
 * Financial calculation utilities
 * Centralized business logic for financial metrics
 */

interface CashFlowItem {
  amount: number;
}

interface Asset {
  currentValue?: number;
}

interface NetWorthDataPoint {
  net_worth: number;
}

/**
 * Calculate cash flow metrics from income and expense data
 */
export function calculateCashFlowMetrics(
  incomings: CashFlowItem[] = [],
  expenses: CashFlowItem[] = []
) {
  const totalIncome = incomings.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  return {
    totalIncome,
    totalExpenses,
    netSavings,
    savingsRate,
  };
}

/**
 * Calculate asset portfolio metrics
 */
export function calculateAssetMetrics(assets: Asset[] = []) {
  const totalValue = assets.reduce((sum, a) => sum + (a.currentValue || 0), 0);
  const countWithValues = assets.filter((a) => a.currentValue !== undefined).length;
  const totalAssets = assets.length;
  const completionRate = totalAssets > 0 ? (countWithValues / totalAssets) * 100 : 0;

  return {
    totalValue,
    countWithValues,
    totalAssets,
    completionRate,
  };
}

/**
 * Calculate net worth change between periods
 */
export function calculateNetWorthChange(
  currentNetWorth: number,
  previousNetWorth: number
) {
  const monthlyChange = currentNetWorth - previousNetWorth;
  const monthlyChangePercent =
    previousNetWorth > 0
      ? ((monthlyChange / previousNetWorth) * 100).toFixed(1)
      : '0.0';
  const isPositiveChange = monthlyChange >= 0;

  return {
    monthlyChange,
    monthlyChangePercent,
    isPositiveChange,
  };
}

/**
 * Calculate budget metrics
 */
export function calculateBudgetMetrics(budgets: any[] = []) {
  const totalBudget = budgets.reduce((sum, b) => sum + b.budget_amount, 0);
  const totalActual = budgets.reduce((sum, b) => sum + b.actual_amount, 0);
  const utilizationRate = totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0;
  const remaining = totalBudget - totalActual;

  return {
    totalBudget,
    totalActual,
    utilizationRate,
    remaining,
  };
}

/**
 * Get the latest net worth value from history
 */
export function getLatestNetWorth(history: NetWorthDataPoint[] = []): number {
  if (history.length === 0) return 0;
  return history[history.length - 1]?.net_worth || 0;
}

/**
 * Get the previous net worth value from history
 */
export function getPreviousNetWorth(history: NetWorthDataPoint[] = []): number {
  if (history.length < 2) return 0;
  return history[history.length - 2]?.net_worth || 0;
}
