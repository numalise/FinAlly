'use client';

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
} from '@chakra-ui/react';
import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import MonthSelector from '@/components/input/MonthSelector';
import AssetInputSection from '@/components/input/AssetInputSection';
import CashFlowInputSection from '@/components/input/CashFlowInputSection';
import { useInputData } from '@/hooks/useInputData';
import { formatCurrency } from '@/utils/formatters';

export default function InputPage() {
  // Default to current month
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const {
    assets,
    incomeItems,
    expenseItems,
    handleSaveAsset,
    handleSaveIncome,
    handleSaveExpense,
    handleDeleteIncome,
    handleDeleteExpense,
  } = useInputData(year, month);

  // Calculate summary stats
  const totalAssetValue = assets.reduce((sum, asset) => sum + (asset.currentValue || 0), 0);
  const totalIncome = incomeItems.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenseItems.reduce((sum, item) => sum + item.amount, 0);
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;
  const assetsWithValues = assets.filter(a => a.currentValue !== undefined).length;

  const handleMonthChange = (newYear: number, newMonth: number) => {
    setYear(newYear);
    setMonth(newMonth);
    // TODO: Trigger data fetch for new month
    console.log('Month changed:', { newYear, newMonth });
  };

  return (
    <MainLayout>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <HStack justify="space-between" align="start" mb={2}>
            <Box>
              <Heading size="lg" color="text.primary" mb={2}>
                Monthly Input
              </Heading>
              <Text color="text.secondary">
                Enter asset values, income, and expenses for the selected month
              </Text>
            </Box>
            <MonthSelector year={year} month={month} onChange={handleMonthChange} />
          </HStack>
        </Box>

        {/* Summary Stats */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel color="text.secondary">Total Assets Value</StatLabel>
                <StatNumber color="text.primary" fontSize="xl">
                  {formatCurrency(totalAssetValue)}
                </StatNumber>
                <StatHelpText color="text.secondary">
                  {assetsWithValues} / {assets.length} entered
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel color="text.secondary">Total Income</StatLabel>
                <StatNumber color="success.500" fontSize="xl">
                  {formatCurrency(totalIncome)}
                </StatNumber>
                <StatHelpText color="text.secondary">
                  {incomeItems.length} entries
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel color="text.secondary">Total Expenses</StatLabel>
                <StatNumber color="error.500" fontSize="xl">
                  {formatCurrency(totalExpenses)}
                </StatNumber>
                <StatHelpText color="text.secondary">
                  {expenseItems.length} entries
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel color="text.secondary">Savings Rate</StatLabel>
                <StatNumber color="brand.500" fontSize="xl">
                  {savingsRate.toFixed(1)}%
                </StatNumber>
                <StatHelpText color="text.secondary">
                  Net: {formatCurrency(netSavings)}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Asset Inputs */}
        <Card>
          <CardBody>
            <AssetInputSection
              year={year}
              month={month}
              assets={assets}
              onSave={handleSaveAsset}
            />
          </CardBody>
        </Card>

        <Divider />

        {/* Cash Flow Inputs */}
        <Card>
          <CardBody>
            <CashFlowInputSection
              year={year}
              month={month}
              incomeItems={incomeItems}
              expenseItems={expenseItems}
              onSaveIncome={handleSaveIncome}
              onSaveExpense={handleSaveExpense}
              onDeleteIncome={handleDeleteIncome}
              onDeleteExpense={handleDeleteExpense}
            />
          </CardBody>
        </Card>
      </VStack>
    </MainLayout>
  );
}
