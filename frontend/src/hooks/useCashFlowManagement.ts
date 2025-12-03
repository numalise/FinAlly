/**
 * Centralized cash flow management hook
 * Handles all cash flow data fetching, calculations, and mutations
 */

import { useMemo } from 'react';
import {
  useIncomings,
  useExpenses,
  useCreateIncoming,
  useCreateExpense,
  useUpdateIncoming,
  useUpdateExpense,
  useDeleteIncoming,
  useDeleteExpense,
} from '@/hooks/api/useCashFlow';
import { calculateCashFlowMetrics } from '@/utils/financialCalculations';

interface CashFlowItem {
  id: string;
  categoryId: string;
  categoryName: string;
  amount: number;
  description?: string;
}

export function useCashFlowManagement(year: number, month: number) {
  // Fetch data
  const { data: incomingsData, isLoading: incomingsLoading } = useIncomings(year, month);
  const { data: expensesData, isLoading: expensesLoading } = useExpenses(year, month);

  // Mutations
  const createIncoming = useCreateIncoming();
  const createExpense = useCreateExpense();
  const updateIncoming = useUpdateIncoming();
  const updateExpense = useUpdateExpense();
  const deleteIncoming = useDeleteIncoming();
  const deleteExpense = useDeleteExpense();

  // Parse raw data and ensure amounts are numbers
  const incomings: CashFlowItem[] = useMemo(
    () => (incomingsData?.data || []).map((item: any) => ({
      id: item.id,
      categoryId: item.categoryId,
      categoryName: item.category?.name || 'Unknown',
      amount: typeof item.amount === 'string' ? parseFloat(item.amount) : item.amount,
      description: item.description,
    })),
    [incomingsData]
  );
  const expenses: CashFlowItem[] = useMemo(
    () => (expensesData?.data || []).map((item: any) => ({
      id: item.id,
      categoryId: item.categoryId,
      categoryName: item.category?.name || 'Unknown',
      amount: typeof item.amount === 'string' ? parseFloat(item.amount) : item.amount,
      description: item.description,
    })),
    [expensesData]
  );

  // Calculate metrics
  const metrics = useMemo(
    () => calculateCashFlowMetrics(incomings, expenses),
    [incomings, expenses]
  );

  // Handler functions
  const handleSaveIncome = async (
    categoryId: string,
    amount: number,
    description?: string
  ) => {
    return createIncoming.mutateAsync({
      category_id: categoryId,
      year,
      month,
      amount,
      description,
    });
  };

  const handleSaveExpense = async (
    categoryId: string,
    amount: number,
    description?: string
  ) => {
    return createExpense.mutateAsync({
      category_id: categoryId,
      year,
      month,
      amount,
      description,
    });
  };

  const handleUpdateIncome = async (
    id: string,
    categoryId: string,
    amount: number,
    description?: string
  ) => {
    return updateIncoming.mutateAsync({
      id,
      data: {
        category_id: categoryId,
        amount,
        description,
      },
    });
  };

  const handleUpdateExpense = async (
    id: string,
    categoryId: string,
    amount: number,
    description?: string
  ) => {
    return updateExpense.mutateAsync({
      id,
      data: {
        category_id: categoryId,
        amount,
        description,
      },
    });
  };

  const handleDeleteIncome = async (id: string) => {
    return deleteIncoming.mutateAsync(id);
  };

  const handleDeleteExpense = async (id: string) => {
    return deleteExpense.mutateAsync(id);
  };

  return {
    // Data
    incomings,
    expenses,

    // Metrics
    totalIncome: metrics.totalIncome,
    totalExpenses: metrics.totalExpenses,
    netSavings: metrics.netSavings,
    savingsRate: metrics.savingsRate,

    // Loading states
    isLoading: incomingsLoading || expensesLoading,

    // Mutation states
    isCreatingIncome: createIncoming.isPending,
    isCreatingExpense: createExpense.isPending,
    isUpdatingIncome: updateIncoming.isPending,
    isUpdatingExpense: updateExpense.isPending,
    isDeletingIncome: deleteIncoming.isPending,
    isDeletingExpense: deleteExpense.isPending,

    // Handlers
    handleSaveIncome,
    handleSaveExpense,
    handleUpdateIncome,
    handleUpdateExpense,
    handleDeleteIncome,
    handleDeleteExpense,
  };
}
