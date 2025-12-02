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
import { useCashFlowManagement } from '@/hooks/useCashFlowManagement';
import { useOptimisticMutation } from '@/hooks/useOptimisticMutation';

export default function CashFlowPage() {
  const toast = useToast();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  // Use centralized cash flow management hook
  const {
    incomings,
    expenses,
    totalIncome,
    totalExpenses,
    netSavings,
    savingsRate,
    isLoading,
    handleSaveIncome,
    handleSaveExpense,
    handleDeleteIncome,
    handleDeleteExpense,
  } = useCashFlowManagement(year, month);

  // Wrap handlers with toast notifications
  const onSaveIncome = async (categoryId: string, amount: number, description?: string) => {
    try {
      await handleSaveIncome(categoryId, amount, description);
      toast({ title: 'Income added', status: 'success', duration: 2000 });
    } catch (error) {
      toast({ title: 'Failed to add income', status: 'error', duration: 3000 });
    }
  };

  const onSaveExpense = async (categoryId: string, amount: number, description?: string) => {
    try {
      await handleSaveExpense(categoryId, amount, description);
      toast({ title: 'Expense added', status: 'success', duration: 2000 });
    } catch (error) {
      toast({ title: 'Failed to add expense', status: 'error', duration: 3000 });
    }
  };

  const onDeleteIncome = async (id: string) => {
    try {
      await handleDeleteIncome(id);
      toast({ title: 'Income deleted', status: 'success', duration: 2000 });
    } catch (error) {
      toast({ title: 'Failed to delete', status: 'error', duration: 3000 });
    }
  };

  const onDeleteExpense = async (id: string) => {
    try {
      await handleDeleteExpense(id);
      toast({ title: 'Expense deleted', status: 'success', duration: 2000 });
    } catch (error) {
      toast({ title: 'Failed to delete', status: 'error', duration: 3000 });
    }
  };

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
                onSaveIncome={onSaveIncome}
                onSaveExpense={onSaveExpense}
                onDeleteIncome={onDeleteIncome}
                onDeleteExpense={onDeleteExpense}
              />
            </CardBody>
          </Card>
        </VStack>
      </MainLayout>
    </ProtectedRoute>
  );
}
