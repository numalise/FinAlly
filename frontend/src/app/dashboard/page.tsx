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
} from '@chakra-ui/react';
import MainLayout from '@/components/layout/MainLayout';
import { useDashboardData } from '@/hooks/useDashboardData';
import CombinedNetWorthChart from '@/components/dashboard/CombinedNetWorthChart';
import AssetAllocationChart from '@/components/dashboard/AssetAllocationChart';
import BudgetTable from '@/components/dashboard/BudgetTable';
import { formatCurrency } from '@/utils/formatters';

export default function DashboardPage() {
  const {
    currentNetWorth,
    monthlyChange,
    monthlyChangePercent,
    totalIncome,
    totalExpenses,
    netWorthHistory,
    projections,
    assetAllocation,
    budgets,
    totalBudget,
    totalActualExpenses,
    handleUpdateBudget,
  } = useDashboardData();

  const isPositiveChange = monthlyChange >= 0;

  return (
    <MainLayout>
      <VStack spacing={8} align="stretch">
        <Heading size="lg" color="text.primary">
          Dashboard
        </Heading>

        {/* Top Stats - No Borders */}
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
                  {isPositiveChange ? 'Above' : 'Below'} average
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

        {/* Budget Section First */}
        <Card bg="background.secondary" border="none">
          <CardBody>
            <BudgetTable 
              budgets={budgets}
              totalBudget={totalBudget}
              totalActualExpenses={totalActualExpenses}
              onUpdateBudget={handleUpdateBudget}
            />
          </CardBody>
        </Card>

        {/* Net Worth Chart */}
        <Card bg="background.secondary" border="none">
          <CardBody>
            <CombinedNetWorthChart 
              historicalData={netWorthHistory}
              projectionData={projections}
            />
          </CardBody>
        </Card>

        {/* Asset Allocation */}
        <Card bg="background.secondary" border="none">
          <CardBody>
            <AssetAllocationChart data={assetAllocation} />
          </CardBody>
        </Card>
      </VStack>
    </MainLayout>
  );
}
