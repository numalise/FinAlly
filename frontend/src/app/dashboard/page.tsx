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
import { useMemo } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import CombinedNetWorthChart from '@/components/dashboard/CombinedNetWorthChart';
import AssetAllocationChart from '@/components/dashboard/AssetAllocationChart';
import BudgetTable from '@/components/dashboard/BudgetTable';
import { formatCurrency } from '@/utils/formatters';
import {
  calculateNetWorthChange,
  getLatestNetWorth,
  getPreviousNetWorth,
} from '@/utils/financialCalculations';

// API hooks
import { useNetworthHistory, useNetworthProjection } from '@/hooks/api/useNetworth';
import { useAllocation } from '@/hooks/api/useAllocation';
import { useBudgets, useUpdateBudget } from '@/hooks/api/useBudgets';
import { useCashFlowManagement } from '@/hooks/useCashFlowManagement';

export default function DashboardPage() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  // Fetch data from API
  const { data: networthData, isLoading: networthLoading } = useNetworthHistory();
  const { data: projectionData, isLoading: projectionLoading } = useNetworthProjection();
  const { data: allocationData, isLoading: allocationLoading } = useAllocation();
  const { data: budgetsData } = useBudgets(currentYear, currentMonth);

  // Use centralized cash flow hook
  const { totalIncome, totalExpenses, isLoading: cashFlowLoading } = useCashFlowManagement(
    currentYear,
    currentMonth
  );

  const updateBudget = useUpdateBudget();

  const isLoading = networthLoading || projectionLoading || allocationLoading || cashFlowLoading;

  // Parse and memoize data
  const networthHistory = useMemo(() => networthData?.data || [], [networthData]);
  const projections = useMemo(() => projectionData?.data || [], [projectionData]);
  const allocation = useMemo(() => allocationData?.data || {}, [allocationData]);
  const budgets = useMemo(() => budgetsData?.data || [], [budgetsData]);

  // Calculate net worth metrics
  const currentNetWorth = useMemo(
    () => getLatestNetWorth(networthHistory),
    [networthHistory]
  );
  const previousNetWorth = useMemo(
    () => getPreviousNetWorth(networthHistory),
    [networthHistory]
  );
  const { monthlyChange, monthlyChangePercent, isPositiveChange } = useMemo(
    () => calculateNetWorthChange(currentNetWorth, previousNetWorth),
    [currentNetWorth, previousNetWorth]
  );

  // Calculate budget totals
  const totalBudget = useMemo(
    () => budgets.reduce((sum: number, b: any) => sum + b.budget_amount, 0),
    [budgets]
  );
  const totalActualExpenses = useMemo(
    () => budgets.reduce((sum: number, b: any) => sum + b.actual_amount, 0),
    [budgets]
  );

  // Format allocation data for chart
  const assetAllocation = useMemo(
    () =>
      allocation.categories?.map((cat: any) => ({
        category: cat.category_name,
        value: cat.current_value,
        percentage: cat.current_percentage,
        target: cat.target_value,
        targetPercentage: cat.target_percentage,
      })) || [],
    [allocation]
  );

  // Format networth history for chart
  const netWorthHistory = useMemo(
    () =>
      networthHistory.map((item: any) => ({
        month: new Date(item.year, item.month - 1).toLocaleDateString('en-US', {
          month: 'short',
        }),
        value: item.net_worth,
      })),
    [networthHistory]
  );

  // Format projections for chart
  const projectionChart = useMemo(
    () =>
      projections.map((item: any) => ({
        month: new Date(item.year, item.month - 1).toLocaleDateString('en-US', {
          month: 'short',
        }),
        actual: item.actual_value,
        projected: item.projected_value,
      })),
    [projections]
  );

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
                    {isPositiveChange ? '+' : ''}
                    {formatCurrency(monthlyChange)}
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
                  <StatHelpText color="text.secondary">This month</StatHelpText>
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
                  <StatHelpText color="text.secondary">This month</StatHelpText>
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
