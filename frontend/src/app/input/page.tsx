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
import CategoryAssetForm from '@/components/input/CategoryAssetForm';
import CashFlowInputSection from '@/components/input/CashFlowInputSection';
import { useInputData } from '@/hooks/useInputData';
import { formatCurrency } from '@/utils/formatters';

export default function InputPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const {
    assets,
    incomeItems,
    expenseItems,
    handleSaveAsset,
    handleAddAsset,
    handleDeleteAsset,
    handleSaveIncome,
    handleSaveExpense,
    handleDeleteIncome,
    handleDeleteExpense,
  } = useInputData(year, month);

  // Group assets by category
  const assetsByCategory = {
    SINGLE_STOCKS: assets.filter(a => a.category === 'SINGLE_STOCKS'),
    ETF_STOCKS: assets.filter(a => a.category === 'ETF_STOCKS'),
    ETF_BONDS: assets.filter(a => a.category === 'ETF_BONDS'),
    CRYPTO: assets.filter(a => a.category === 'CRYPTO'),
    PRIVATE_EQUITY: assets.filter(a => a.category === 'PRIVATE_EQUITY'),
    BUSINESS_PROFITS: assets.filter(a => a.category === 'BUSINESS_PROFITS'),
    REAL_ESTATE: assets.filter(a => a.category === 'REAL_ESTATE'),
    CASH: assets.filter(a => a.category === 'CASH'),
  };

  const totalAssetValue = assets.reduce((sum, asset) => sum + (asset.currentValue || 0), 0);
  const totalIncome = incomeItems.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenseItems.reduce((sum, item) => sum + item.amount, 0);
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;
  const assetsWithValues = assets.filter(a => a.currentValue !== undefined).length;

  const handleMonthChange = (newYear: number, newMonth: number) => {
    setYear(newYear);
    setMonth(newMonth);
  };

  return (
    <MainLayout>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="start">
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

        {/* Asset Category Forms */}
        <Box>
          <Heading size="md" mb={4} color="text.primary">
            Asset Values
          </Heading>
          <VStack spacing={6} align="stretch">
            <Card>
              <CardBody>
                <CategoryAssetForm
                  categoryCode="SINGLE_STOCKS"
                  categoryName="Single Stocks"
                  assets={assetsByCategory.SINGLE_STOCKS}
                  onSave={handleSaveAsset}
                  onAdd={handleAddAsset}
                  onDelete={handleDeleteAsset}
                  requiresTicker
                />
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <CategoryAssetForm
                  categoryCode="ETF_STOCKS"
                  categoryName="ETF Stocks"
                  assets={assetsByCategory.ETF_STOCKS}
                  onSave={handleSaveAsset}
                  onAdd={handleAddAsset}
                  onDelete={handleDeleteAsset}
                  requiresTicker
                />
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <CategoryAssetForm
                  categoryCode="ETF_BONDS"
                  categoryName="ETF Bonds"
                  assets={assetsByCategory.ETF_BONDS}
                  onSave={handleSaveAsset}
                  onAdd={handleAddAsset}
                  onDelete={handleDeleteAsset}
                  requiresTicker
                />
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <CategoryAssetForm
                  categoryCode="CRYPTO"
                  categoryName="Crypto"
                  assets={assetsByCategory.CRYPTO}
                  onSave={handleSaveAsset}
                  onAdd={handleAddAsset}
                  onDelete={handleDeleteAsset}
                  requiresTicker
                />
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <CategoryAssetForm
                  categoryCode="PRIVATE_EQUITY"
                  categoryName="Private Equity"
                  assets={assetsByCategory.PRIVATE_EQUITY}
                  onSave={handleSaveAsset}
                  onAdd={handleAddAsset}
                  onDelete={handleDeleteAsset}
                />
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <CategoryAssetForm
                  categoryCode="BUSINESS_PROFITS"
                  categoryName="Business Profits"
                  assets={assetsByCategory.BUSINESS_PROFITS}
                  onSave={handleSaveAsset}
                  onAdd={handleAddAsset}
                  onDelete={handleDeleteAsset}
                />
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <CategoryAssetForm
                  categoryCode="REAL_ESTATE"
                  categoryName="Real Estate"
                  assets={assetsByCategory.REAL_ESTATE}
                  onSave={handleSaveAsset}
                  onAdd={handleAddAsset}
                  onDelete={handleDeleteAsset}
                />
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <CategoryAssetForm
                  categoryCode="CASH"
                  categoryName="Cash Liquidity"
                  assets={assetsByCategory.CASH}
                  onSave={handleSaveAsset}
                  onAdd={handleAddAsset}
                  onDelete={handleDeleteAsset}
                />
              </CardBody>
            </Card>
          </VStack>
        </Box>

        <Divider />

        {/* Cash Flow */}
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
