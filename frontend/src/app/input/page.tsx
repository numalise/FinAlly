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
import { useAssetManagement } from '@/hooks/useAssetManagement';
import { useCashFlowManagement } from '@/hooks/useCashFlowManagement';

export default function InputPage() {
  const toast = useToast();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  // Use centralized hooks
  const assetManagement = useAssetManagement(year, month);
  const cashFlowManagement = useCashFlowManagement(year, month);

  if (assetManagement.isLoading) {
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

  // Asset handlers with toast notifications
  const handleSaveAsset = async (assetId: string, value: number, notes?: string) => {
    try {
      await assetManagement.handleSaveAsset(assetId, value, notes);
      toast({ title: 'Asset value saved', status: 'success', duration: 2000 });
    } catch (error) {
      toast({ title: 'Failed to save', status: 'error', duration: 3000 });
    }
  };

  const handleEditAsset = async (assetId: string, name: string, ticker?: string, marketCap?: number) => {
    try {
      await assetManagement.handleEditAsset(assetId, name, ticker, marketCap);
      toast({ title: 'Asset updated', status: 'success', duration: 2000 });
    } catch (error) {
      toast({ title: 'Failed to update', status: 'error', duration: 3000 });
    }
  };

  const handleAddAsset = async (category: string, name: string, ticker?: string, marketCap?: number) => {
    try {
      await assetManagement.handleAddAsset(category, name, ticker, marketCap);
      toast({ title: 'Asset created', status: 'success', duration: 2000 });
    } catch (error) {
      toast({ title: 'Failed to create', status: 'error', duration: 3000 });
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    try {
      await assetManagement.handleDeleteAsset(assetId);
      toast({ title: 'Asset deleted', status: 'success', duration: 2000 });
    } catch (error) {
      toast({ title: 'Failed to delete', status: 'error', duration: 3000 });
    }
  };

  // Cash flow handlers with toast notifications
  const handleSaveIncome = async (categoryId: string, amount: number, description?: string) => {
    try {
      await cashFlowManagement.handleSaveIncome(categoryId, amount, description);
      toast({ title: 'Income added', status: 'success', duration: 2000 });
    } catch (error) {
      toast({ title: 'Failed to add income', status: 'error', duration: 3000 });
    }
  };

  const handleSaveExpense = async (categoryId: string, amount: number, description?: string) => {
    try {
      await cashFlowManagement.handleSaveExpense(categoryId, amount, description);
      toast({ title: 'Expense added', status: 'success', duration: 2000 });
    } catch (error) {
      toast({ title: 'Failed to add expense', status: 'error', duration: 3000 });
    }
  };

  const handleDeleteIncome = async (id: string) => {
    try {
      await cashFlowManagement.handleDeleteIncome(id);
      toast({ title: 'Income deleted', status: 'success', duration: 2000 });
    } catch (error) {
      toast({ title: 'Failed to delete', status: 'error', duration: 3000 });
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await cashFlowManagement.handleDeleteExpense(id);
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
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel color="text.secondary">Total Assets Value</StatLabel>
                  <StatNumber color="text.primary" fontSize="xl">
                    {formatCurrency(assetManagement.totalValue)}
                  </StatNumber>
                  <StatHelpText color="text.secondary">
                    {assetManagement.countWithValues} / {assetManagement.totalAssets} entered
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel color="text.secondary">Total Income</StatLabel>
                  <StatNumber color="success.500" fontSize="xl">
                    {formatCurrency(cashFlowManagement.totalIncome)}
                  </StatNumber>
                  <StatHelpText color="text.secondary">
                    {cashFlowManagement.incomings.length} entries
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel color="text.secondary">Total Expenses</StatLabel>
                  <StatNumber color="error.500" fontSize="xl">
                    {formatCurrency(cashFlowManagement.totalExpenses)}
                  </StatNumber>
                  <StatHelpText color="text.secondary">
                    {cashFlowManagement.expenses.length} entries
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel color="text.secondary">Savings Rate</StatLabel>
                  <StatNumber color="brand.500" fontSize="xl">
                    {cashFlowManagement.savingsRate.toFixed(1)}%
                  </StatNumber>
                  <StatHelpText color="text.secondary">
                    Net: {formatCurrency(cashFlowManagement.netSavings)}
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          <Box>
            <Heading size="md" mb={4} color="text.primary">Asset Values</Heading>
            <VStack spacing={6} align="stretch">
              {assetManagement.categoryMetadata.map(({ code, name, requiresTicker }) => (
                <Card key={code}>
                  <CardBody>
                    <CategoryAssetForm
                      categoryCode={code}
                      categoryName={name}
                      assets={assetManagement.assetsByCategory[code]}
                      onSave={handleSaveAsset}
                      onEditAsset={handleEditAsset}
                      onAdd={handleAddAsset}
                      onDelete={handleDeleteAsset}
                      requiresTicker={requiresTicker}
                    />
                  </CardBody>
                </Card>
              ))}
            </VStack>
          </Box>

          <Divider />

          <Card>
            <CardBody>
              <CashFlowInputSection
                year={year}
                month={month}
                incomeItems={cashFlowManagement.incomings}
                expenseItems={cashFlowManagement.expenses}
                onSaveIncome={handleSaveIncome}
                onSaveExpense={handleSaveExpense}
                onDeleteIncome={handleDeleteIncome}
                onDeleteExpense={handleDeleteExpense}
              />
            </CardBody>
          </Card>
        </VStack>
      </MainLayout>
    </ProtectedRoute>
  );
}
