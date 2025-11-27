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
  Grid,
  GridItem,
} from '@chakra-ui/react';
import MainLayout from '@/components/layout/MainLayout';
import { useDashboardData } from '@/hooks/useDashboardData';
import NetWorthChart from '@/components/dashboard/NetWorthChart';
import ProjectionChart from '@/components/dashboard/ProjectionChart';
import AssetAllocationChart from '@/components/dashboard/AssetAllocationChart';
import { formatCurrency, formatNumber } from '@/utils/formatters';

export default function DashboardPage() {
  const {
    currentNetWorth,
    monthlyChange,
    monthlyChangePercent,
    savingsRate,
    targetSavingsRate,
    netWorthHistory,
    projections,
    assetAllocation,
    totalAssets,
    totalCategories,
  } = useDashboardData();

  const isPositiveChange = monthlyChange >= 0;

  return (
    <MainLayout>
      <Box>
        <Heading size="lg" mb={6} color="text.primary">
          Dashboard
        </Heading>

        {/* Top Stats */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
          <Card>
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

          <Card>
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

          <Card>
            <CardBody>
              <Stat>
                <StatLabel color="text.secondary">Savings Rate</StatLabel>
                <StatNumber color="text.primary" fontSize="2xl">
                  {savingsRate}%
                </StatNumber>
                <StatHelpText color="text.secondary">
                  Target: {targetSavingsRate}%
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel color="text.secondary">Assets</StatLabel>
                <StatNumber color="text.primary" fontSize="2xl">
                  {totalAssets}
                </StatNumber>
                <StatHelpText color="text.secondary">
                  Across {totalCategories} categories
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Charts Grid */}
        <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6} mb={8}>
          <GridItem>
            <Card>
              <CardBody>
                <NetWorthChart data={netWorthHistory} />
              </CardBody>
            </Card>
          </GridItem>

          <GridItem>
            <Card>
              <CardBody>
                <ProjectionChart data={projections} />
              </CardBody>
            </Card>
          </GridItem>
        </Grid>

        {/* Asset Allocation */}
        <Card>
          <CardBody>
            <AssetAllocationChart data={assetAllocation} />
          </CardBody>
        </Card>
      </Box>
    </MainLayout>
  );
}
