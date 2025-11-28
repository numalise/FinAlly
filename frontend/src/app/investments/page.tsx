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
} from '@chakra-ui/react';
import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import MonthSelector from '@/components/input/MonthSelector';
import SimplifiedAssetForm from '@/components/input/SimplifiedAssetForm';
import { useInputData } from '@/hooks/useInputData';
import { formatCurrency } from '@/utils/formatters';

const BLUE_PALETTE = [
  '#2196f3', '#1e88e5', '#1976d2', '#1565c0',
  '#0d47a1', '#64b5f6', '#42a5f5', '#90caf9',
];

export default function InvestmentsPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const {
    assets,
    handleSaveAsset,
    handleEditAsset,
    handleAddAsset,
    handleDeleteAsset,
  } = useInputData(year, month);

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
  const assetsWithValues = assets.filter(a => a.currentValue !== undefined).length;

  const categories = [
    { code: 'SINGLE_STOCKS', name: 'Single Stocks', color: BLUE_PALETTE[0], requiresTicker: true, hasMarketCap: true },
    { code: 'ETF_STOCKS', name: 'ETF Stocks', color: BLUE_PALETTE[1], requiresTicker: true, hasMarketCap: true },
    { code: 'ETF_BONDS', name: 'ETF Bonds', color: BLUE_PALETTE[2], requiresTicker: true, hasMarketCap: true },
    { code: 'CRYPTO', name: 'Crypto', color: BLUE_PALETTE[3], requiresTicker: true, hasMarketCap: true },
    { code: 'PRIVATE_EQUITY', name: 'Private Equity', color: BLUE_PALETTE[4], requiresTicker: false, hasMarketCap: false },
    { code: 'BUSINESS_PROFITS', name: 'Business Profits', color: BLUE_PALETTE[5], requiresTicker: false, hasMarketCap: false },
    { code: 'REAL_ESTATE', name: 'Real Estate', color: BLUE_PALETTE[6], requiresTicker: false, hasMarketCap: false },
    { code: 'CASH', name: 'Cash Liquidity', color: BLUE_PALETTE[7], requiresTicker: false, hasMarketCap: false },
  ];

  return (
    <MainLayout>
      <VStack spacing={8} align="stretch">
        <HStack justify="space-between" align="start">
          <Box>
            <Heading size="lg" color="text.primary" mb={2}>
              Monthly Investments
            </Heading>
            <Text color="text.secondary">
              Track and update your investment portfolio values
            </Text>
          </Box>
          <MonthSelector year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); }} />
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <Card bg="background.secondary" border="none">
            <CardBody>
              <Stat>
                <StatLabel color="text.secondary">Total Investment Value</StatLabel>
                <StatNumber color="text.primary" fontSize="2xl">
                  {formatCurrency(totalAssetValue)}
                </StatNumber>
                <StatHelpText color="text.secondary">
                  {assetsWithValues} / {assets.length} assets entered
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg="background.secondary" border="none">
            <CardBody>
              <Stat>
                <StatLabel color="text.secondary">Active Categories</StatLabel>
                <StatNumber color="text.primary" fontSize="2xl">
                  {Object.values(assetsByCategory).filter(arr => arr.length > 0).length}
                </StatNumber>
                <StatHelpText color="text.secondary">
                  8 total categories available
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        <VStack spacing={4} align="stretch">
          {categories.map(({ code, name, color, requiresTicker, hasMarketCap }) => (
            <SimplifiedAssetForm
              key={code}
              categoryCode={code}
              categoryName={name}
              categoryColor={color}
              assets={assetsByCategory[code as keyof typeof assetsByCategory]}
              onSave={handleSaveAsset}
              onEditAsset={handleEditAsset}
              onAdd={handleAddAsset}
              onDelete={handleDeleteAsset}
              requiresTicker={requiresTicker}
              hasMarketCap={hasMarketCap}
            />
          ))}
        </VStack>
      </VStack>
    </MainLayout>
  );
}
