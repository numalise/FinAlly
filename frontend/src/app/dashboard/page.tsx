'use client';

import {
  Box,
  Heading,
  SimpleGrid,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  VStack,
  Spinner,
  Center,
  Text,
} from '@chakra-ui/react';
import MainLayout from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import CombinedNetWorthChart from '@/components/dashboard/CombinedNetWorthChart';
import AssetAllocationChart from '@/components/dashboard/AssetAllocationChart';
import BudgetTable from '@/components/dashboard/BudgetTable';
import { formatCurrency } from '@/utils/formatters';

// ✅ Use REAL API hooks
import { useNetworthHistory, useNetworthProjection } from '@/hooks/api/useNetworth';
import { useAllocation } from '@/hooks/api/useAllocation';
import { useBudgets, useUpdateBudget } from '@/hooks/api/useBudgets';
import { useIncomings, useExpenses } from '@/hooks/api/useCashFlow';

export default function DashboardPage() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  // Fetch data from API
  const { data: networthData, isLoading: networthLoading } = useNetworthHistory();
  const { data: projectionData, isLoading: projectionLoading } = useNetworthProjection();
  const { data: allocationData, isLoading: allocationLoading } = useAllocation();
  const { data: budgetsData } = useBudgets(currentYear, currentMonth);
  const { data: incomingsData } = useIncomings(currentYear, currentMonth);
  const { data: expensesData } = useExpenses(currentYear, currentMonth);
  
  const updateBudget = useUpdateBudget();

  const isLoading = networthLoading || projectionLoading || allocationLoading;

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

  // Parse data
  const networthHistory = networthData?.data || [];
  const projections = projectionData?.data || [];
  const allocation = allocationData?.data || {};
  const budgets = budgetsData?.data || [];
  const incomings = incomingsData?.data || [];
  const expenses = expensesData?.data || [];

  // Calculate stats
  const currentNetWorth = networthHistory.length > 0 
    ? networthHistory[networthHistory.length - 1]?.net_worth || 0
    : 0;
  
  const previousNetWorth = networthHistory.length > 1
    ? networthHistory[networthHistory.length - 2]?.net_worth || 0
    : 0;

  const monthlyChange = currentNetWorth - previousNetWorth;
  const monthlyChangePercent = previousNetWorth > 0 
    ? ((monthlyChange / previousNetWorth) * 100).toFixed(1)
    : '0.0';
  const isPositiveChange = monthlyChange >= 0;

  const totalIncome = incomings.reduce((sum: number, item: any) => sum + item.amount, 0);
  const totalExpenses = expenses.reduce((sum: number, item: any) => sum + item.amount, 0);

  const totalBudget = budgets.reduce((sum: number, b: any) => sum + b.budget_amount, 0);
  const totalActualExpenses = budgets.reduce((sum: number, b: any) => sum + b.actual_amount, 0);

  // Format allocation data for chart
  const assetAllocation = allocation.categories?.map((cat: any) => ({
    category: cat.category_name,
    value: cat.current_value,
    percentage: cat.current_percentage,
    target: cat.target_value,
    targetPercentage: cat.target_percentage,
  })) || [];

  // Format networth history for chart
  const netWorthHistory = networthHistory.map((item: any) => ({
    month: new Date(item.year, item.month - 1).toLocaleDateString('en-US', { month: 'short' }),
    value: item.net_worth,
  }));

  // Format projections for chart
  const projectionChart = projections.map((item: any) => ({
    month: new Date(item.year, item.month - 1).toLocaleDateString('en-US', { month: 'short' }),
    actual: item.actual_value,
    projected: item.projected_value,
  }));

  const handleUpdateBudget = async (category: string, amount: number) => {
    try {
      await updateBudget.mutateAsync({
        category,
        data: { amount, year: currentYear, month: currentMonth },
      });
    } catch (error) {
      console.error('Failed to update budget:', error);
    }
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <VStack spacing={8} align="stretch">
          <Heading size="lg" color="text.primary">
            Dashboard
          </Heading>

          {/* Top Stats */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            <Card bg="background.secondary" border="none">
              <CardBody>
                <Stat>
                  <StatLabel color="text.secondary">Net Worth</StatLabel>
                  <StatNumber color="text.primary" fontSize="2xl">
                    {formatCurrency(currentNetWorth)}
                  </StatNumber>
                  <StatHelpText color={isPositiveChange ? 'success.500' : 'error.500'}>
                    <StatArrow type={isPositiveChange ? 'increase' : 'decrease'} />
                    {monthlyChangePercent}% this month
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg="background.secondary" border="none">
              <CardBody>
                <Stat>
                  <StatLabel color="text.secondary">Monthly Change</StatLabel>
                  <StatNumber color="text.primary" fontSize="2xl">
                    {isPositiveChange ? '+' : ''}{formatCurrency(monthlyChange)}
                  </StatNumber>
                  <StatHelpText color="text.secondary">
                    {isPositiveChange ? 'Growth' : 'Decline'} vs last month
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg="background.secondary" border="none">
              <CardBody>
                <Stat>
                  <StatLabel color="text.secondary">Total Income</StatLabel>
                  <StatNumber color="success.500" fontSize="2xl">
                    {formatCurrency(totalIncome)}
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
                  <StatLabel color="text.secondary">Total Expenses</StatLabel>
                  <StatNumber color="error.500" fontSize="2xl">
                    {formatCurrency(totalExpenses)}
                  </StatNumber>
                  <StatHelpText color="text.secondary">
                    This month
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Budget Section */}
          {budgets.length > 0 && (
            <Card bg="background.secondary" border="none">
              <CardBody>
                <BudgetTable 
                  budgets={budgets}
                  totalBudget={totalBudget}
                  totalActual={totalActualExpenses}
                  onUpdateBudget={handleUpdateBudget}
                />
              </CardBody>
            </Card>
          )}

          {/* Net Worth Chart */}
          {netWorthHistory.length > 0 && projectionChart.length > 0 && (
            <Card bg="background.secondary" border="none">
              <CardBody>
                <CombinedNetWorthChart 
                  historicalData={netWorthHistory}
                  projectionData={projectionChart}
                />
              </CardBody>
            </Card>
          )}

          {/* Asset Allocation */}
          {assetAllocation.length > 0 && (
            <Card bg="background.secondary" border="none">
              <CardBody>
                <AssetAllocationChart data={assetAllocation} />
              </CardBody>
            </Card>
          )}

          {/* Empty state */}
          {networthHistory.length === 0 && (
            <Card bg="background.secondary" border="none">
              <CardBody>
                <Center py={10}>
                  <VStack spacing={3}>
                    <Text color="text.secondary" fontSize="lg">
                      No data available yet
                    </Text>
                    <Text color="text.tertiary" fontSize="sm">
                      Start by entering your monthly investments and cash flow
                    </Text>
                  </VStack>
                </Center>
              </CardBody>
            </Card>
          )}
        </VStack>
      </MainLayout>
    </ProtectedRoute>
  );
}