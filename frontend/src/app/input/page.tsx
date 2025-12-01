'use client';

import { useState } from 'react';
import {
  Box,
  Heading,
  VStack,
  Card,
  CardBody,
  Text,
  HStack,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  useToast,
  Spinner,
  Center,
} from '@chakra-ui/react';
import MainLayout from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import MonthSelector from '@/components/input/MonthSelector';
import CategoryAssetForm from '@/components/input/CategoryAssetForm';
import CashFlowInputSection from '@/components/input/CashFlowInputSection';
import { formatCurrency } from '@/utils/formatters';

// ✅ Use REAL API hooks
import { useAssets, useCreateAsset, useUpdateAsset, useDeleteAsset } from '@/hooks/api/useAssets';
import { useAssetInputs, useSaveAssetInput } from '@/hooks/api/useAssetInputs';
import { useIncomings, useExpenses, useCreateIncoming, useCreateExpense, useDeleteIncoming, useDeleteExpense } from '@/hooks/api/useCashFlow';

export default function InputPage() {
  const toast = useToast();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  // Fetch data
  const { data: assetsData, isLoading: assetsLoading } = useAssets();
  const { data: assetInputsData } = useAssetInputs(year, month);
  const { data: incomingsData } = useIncomings(year, month);
  const { data: expensesData } = useExpenses(year, month);

  // Mutations
  const createAsset = useCreateAsset();
  const updateAsset = useUpdateAsset();
  const deleteAsset = useDeleteAsset();
  const saveAssetInput = useSaveAssetInput();
  const createIncoming = useCreateIncoming();
  const createExpense = useCreateExpense();
  const deleteIncoming = useDeleteIncoming();
  const deleteExpense = useDeleteExpense();

  if (assetsLoading) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <Center h="400px">
            <Spinner size="xl" color="brand.500" />
          </Center>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  // Parse API responses
  const assets = assetsData?.data || [];
  const assetInputs = assetInputsData?.data || [];
  const incomings = incomingsData?.data || [];
  const expenses = expensesData?.data || [];

  // Merge assets with their current values from assetInputs
  const assetsWithValues = assets.map((asset: any) => {
    const input = assetInputs.find((inp: any) => inp.asset_id === asset.id);
    return {
      id: asset.id,
      name: asset.asset_name,
      ticker: asset.ticker,
      category: asset.category_id,
      categoryName: asset.category?.category_name || asset.category_id,
      currentValue: input?.total,
      notes: input?.notes,
      marketCap: asset.market_cap ? parseFloat(asset.market_cap) : undefined,
    };
  });

  const assetsByCategory = {
    SINGLE_STOCKS: assetsWithValues.filter((a: any) => a.category === 'SINGLE_STOCKS'),
    ETF_STOCKS: assetsWithValues.filter((a: any) => a.category === 'ETF_STOCKS'),
    ETF_BONDS: assetsWithValues.filter((a: any) => a.category === 'ETF_BONDS'),
    CRYPTO: assetsWithValues.filter((a: any) => a.category === 'CRYPTO'),
    PRIVATE_EQUITY: assetsWithValues.filter((a: any) => a.category === 'PRIVATE_EQUITY'),
    BUSINESS_PROFITS: assetsWithValues.filter((a: any) => a.category === 'BUSINESS_PROFITS'),
    REAL_ESTATE: assetsWithValues.filter((a: any) => a.category === 'REAL_ESTATE'),
    CASH: assetsWithValues.filter((a: any) => a.category === 'CASH'),
  };

  const totalAssetValue = assetsWithValues.reduce((sum: number, a: any) => sum + (a.currentValue || 0), 0);
  const totalIncome = incomings.reduce((sum: number, item: any) => sum + item.amount, 0);
  const totalExpenses = expenses.reduce((sum: number, item: any) => sum + item.amount, 0);
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;
  const assetsWithValuesCount = assetsWithValues.filter((a: any) => a.currentValue !== undefined).length;

  // Handlers
  const handleSaveAsset = async (assetId: string, value: number, notes?: string) => {
    try {
      await saveAssetInput.mutateAsync({ asset_id: assetId, year, month, total: value, notes });
      toast({ title: 'Asset value saved', status: 'success', duration: 2000 });
    } catch (error) {
      toast({ title: 'Failed to save', status: 'error', duration: 3000 });
    }
  };

  const handleEditAsset = async (assetId: string, name: string, ticker?: string, marketCap?: number) => {
    try {
      await updateAsset.mutateAsync({ id: assetId, data: { name, ticker, market_cap: marketCap } });
      toast({ title: 'Asset updated', status: 'success', duration: 2000 });
    } catch (error) {
      toast({ title: 'Failed to update', status: 'error', duration: 3000 });
    }
  };

  const handleAddAsset = async (category: string, name: string, ticker?: string, marketCap?: number) => {
    try {
      await createAsset.mutateAsync({ name, ticker, category_id: category, market_cap: marketCap });
      toast({ title: 'Asset created', status: 'success', duration: 2000 });
    } catch (error) {
      toast({ title: 'Failed to create', status: 'error', duration: 3000 });
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    try {
      await deleteAsset.mutateAsync(assetId);
      toast({ title: 'Asset deleted', status: 'success', duration: 2000 });
    } catch (error) {
      toast({ title: 'Failed to delete', status: 'error', duration: 3000 });
    }
  };

  const handleSaveIncome = async (categoryId: string, amount: number, description?: string) => {
    try {
      await createIncoming.mutateAsync({ category_id: categoryId, year, month, amount, description });
      toast({ title: 'Income added', status: 'success', duration: 2000 });
    } catch (error) {
      toast({ title: 'Failed to add income', status: 'error', duration: 3000 });
    }
  };

  const handleSaveExpense = async (categoryId: string, amount: number, description?: string) => {
    try {
      await createExpense.mutateAsync({ category_id: categoryId, year, month, amount, description });
      toast({ title: 'Expense added', status: 'success', duration: 2000 });
    } catch (error) {
      toast({ title: 'Failed to add expense', status: 'error', duration: 3000 });
    }
  };

  const handleDeleteIncome = async (id: string) => {
    try {
      await deleteIncoming.mutateAsync(id);
      toast({ title: 'Income deleted', status: 'success', duration: 2000 });
    } catch (error) {
      toast({ title: 'Failed to delete', status: 'error', duration: 3000 });
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteExpense.mutateAsync(id);
      toast({ title: 'Expense deleted', status: 'success', duration: 2000 });
    } catch (error) {
      toast({ title: 'Failed to delete', status: 'error', duration: 3000 });
    }
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <VStack spacing={8} align="stretch">
          <HStack justify="space-between" align="start">
            <Box>
              <Heading size="lg" color="text.primary" mb={2}>Monthly Input</Heading>
              <Text color="text.secondary">Enter asset values, income, and expenses for the selected month</Text>
            </Box>
            <MonthSelector year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); }} />
          </HStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            <Card><CardBody><Stat><StatLabel color="text.secondary">Total Assets Value</StatLabel><StatNumber color="text.primary" fontSize="xl">{formatCurrency(totalAssetValue)}</StatNumber><StatHelpText color="text.secondary">{assetsWithValuesCount} / {assets.length} entered</StatHelpText></Stat></CardBody></Card>
            <Card><CardBody><Stat><StatLabel color="text.secondary">Total Income</StatLabel><StatNumber color="success.500" fontSize="xl">{formatCurrency(totalIncome)}</StatNumber><StatHelpText color="text.secondary">{incomings.length} entries</StatHelpText></Stat></CardBody></Card>
            <Card><CardBody><Stat><StatLabel color="text.secondary">Total Expenses</StatLabel><StatNumber color="error.500" fontSize="xl">{formatCurrency(totalExpenses)}</StatNumber><StatHelpText color="text.secondary">{expenses.length} entries</StatHelpText></Stat></CardBody></Card>
            <Card><CardBody><Stat><StatLabel color="text.secondary">Savings Rate</StatLabel><StatNumber color="brand.500" fontSize="xl">{savingsRate.toFixed(1)}%</StatNumber><StatHelpText color="text.secondary">Net: {formatCurrency(netSavings)}</StatHelpText></Stat></CardBody></Card>
          </SimpleGrid>

          <Box>
            <Heading size="md" mb={4} color="text.primary">Asset Values</Heading>
            <VStack spacing={6} align="stretch">
              {[
                { code: 'SINGLE_STOCKS', name: 'Single Stocks', requiresTicker: true },
                { code: 'ETF_STOCKS', name: 'ETF Stocks', requiresTicker: true },
                { code: 'ETF_BONDS', name: 'ETF Bonds', requiresTicker: true },
                { code: 'CRYPTO', name: 'Crypto', requiresTicker: true },
                { code: 'PRIVATE_EQUITY', name: 'Private Equity', requiresTicker: false },
                { code: 'BUSINESS_PROFITS', name: 'Business Profits', requiresTicker: false },
                { code: 'REAL_ESTATE', name: 'Real Estate', requiresTicker: false },
                { code: 'CASH', name: 'Cash Liquidity', requiresTicker: false },
              ].map(({ code, name, requiresTicker }) => (
                <Card key={code}><CardBody><CategoryAssetForm categoryCode={code} categoryName={name} assets={assetsByCategory[code as keyof typeof assetsByCategory]} onSave={handleSaveAsset} onEditAsset={handleEditAsset} onAdd={handleAddAsset} onDelete={handleDeleteAsset} requiresTicker={requiresTicker} /></CardBody></Card>
              ))}
            </VStack>
          </Box>

          <Divider />

          <Card><CardBody><CashFlowInputSection year={year} month={month} incomeItems={incomings} expenseItems={expenses} onSaveIncome={handleSaveIncome} onSaveExpense={handleSaveExpense} onDeleteIncome={handleDeleteIncome} onDeleteExpense={handleDeleteExpense} /></CardBody></Card>
        </VStack>
      </MainLayout>
    </ProtectedRoute>
  );
}