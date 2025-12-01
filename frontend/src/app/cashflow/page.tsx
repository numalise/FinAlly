'use client';

import {
  Box,
  Heading,
  VStack,
  Text,
  HStack,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardBody,
  useToast,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import MonthSelector from '@/components/input/MonthSelector';
import CashFlowInputSection from '@/components/input/CashFlowInputSection';
import { formatCurrency } from '@/utils/formatters';

// ✅ Use REAL API hooks
import { useIncomings, useExpenses, useCreateIncoming, useCreateExpense, useDeleteIncoming, useDeleteExpense } from '@/hooks/api/useCashFlow';
import type { CashFlowItem } from '@/types/api';

export default function CashFlowPage() {
  const toast = useToast();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  // Fetch data
  const { data: incomingsData, isLoading: incomingsLoading } = useIncomings(year, month);
  const { data: expensesData, isLoading: expensesLoading } = useExpenses(year, month);

  // Mutations
  const createIncoming = useCreateIncoming();
  const createExpense = useCreateExpense();
  const deleteIncoming = useDeleteIncoming();
  const deleteExpense = useDeleteExpense();

  const isLoading = incomingsLoading || expensesLoading;

  if (isLoading) {
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

  const incomings: CashFlowItem[] = incomingsData?.data || [];
  const expenses: CashFlowItem[] = expensesData?.data || [];

  const totalIncome = incomings.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

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
              <Heading size="lg" color="text.primary" mb={2}>
                Cash Flow
              </Heading>
              <Text color="text.secondary">
                Track your monthly income and expenses
              </Text>
            </Box>
            <MonthSelector year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); }} />
          </HStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            <Card bg="background.secondary" border="none">
              <CardBody>
                <Stat>
                  <StatLabel color="text.secondary">Total Income</StatLabel>
                  <StatNumber color="success.500" fontSize="2xl">
                    {formatCurrency(totalIncome)}
                  </StatNumber>
                  <StatHelpText color="text.secondary">
                    {incomings.length} entries
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg="background.secondary" border="none">
              <CardBody>
                <Stat>
                  <StatLabel color="text.secondary">Total Expenses</StatLabel>
                  <StatNumber color="error.500" fontSize="2xl">
                    {formatCurrency(totalExpenses)}
                  </StatNumber>
                  <StatHelpText color="text.secondary">
                    {expenses.length} entries
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg="background.secondary" border="none">
              <CardBody>
                <Stat>
                  <StatLabel color="text.secondary">Net Savings</StatLabel>
                  <StatNumber color={netSavings >= 0 ? 'success.500' : 'error.500'} fontSize="2xl">
                    {formatCurrency(netSavings)}
                  </StatNumber>
                  <StatHelpText color="text.secondary">
                    This month
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg="background.secondary" border="none">
              <CardBody>
                <Stat>
                  <StatLabel color="text.secondary">Savings Rate</StatLabel>
                  <StatNumber color="brand.500" fontSize="2xl">
                    {savingsRate.toFixed(1)}%
                  </StatNumber>
                  <StatHelpText color="text.secondary">
                    Income saved
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          <Card bg="background.secondary" border="none">
            <CardBody>
              <CashFlowInputSection
                year={year}
                month={month}
                incomeItems={incomings}
                expenseItems={expenses}
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