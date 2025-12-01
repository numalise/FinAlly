'use client';

import { useState } from 'react';
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
import MainLayout from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import MonthSelector from '@/components/input/MonthSelector';
import SimplifiedAssetForm from '@/components/input/SimplifiedAssetForm';
import { formatCurrency } from '@/utils/formatters';

// ✅ Use REAL API hooks
import { useAssets, useCreateAsset, useUpdateAsset, useDeleteAsset } from '@/hooks/api/useAssets';
import { useAssetInputs, useSaveAssetInput } from '@/hooks/api/useAssetInputs';

const BLUE_PALETTE = [
  '#2196f3', '#1e88e5', '#1976d2', '#1565c0',
  '#0d47a1', '#64b5f6', '#42a5f5', '#90caf9',
];

export default function InvestmentsPage() {
  const toast = useToast();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  // Fetch data
  const { data: assetsData, isLoading } = useAssets();
  const { data: assetInputsData } = useAssetInputs(year, month);

  // Mutations
  const createAsset = useCreateAsset();
  const updateAsset = useUpdateAsset();
  const deleteAsset = useDeleteAsset();
  const saveAssetInput = useSaveAssetInput();

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

  const assets = assetsData?.data || [];
  const assetInputs = assetInputsData?.data || [];

  // Merge assets with their current values
  const assetsWithValues = assets.map((asset: any) => {
    const input = assetInputs.find((inp: any) => inp.asset_id === asset.id);
    return {
      id: asset.id,
      name: asset.asset_name,
      ticker: asset.ticker,
      category: asset.category_id,
      categoryName: asset.category?.category_name || asset.category_id,
      currentValue: input?.total,
      notes: input?.notes,
      marketCap: asset.market_cap ? parseFloat(asset.market_cap) : undefined,
    };
  });

  const assetsByCategory = {
    SINGLE_STOCKS: assetsWithValues.filter((a: any) => a.category === 'SINGLE_STOCKS'),
    ETF_STOCKS: assetsWithValues.filter((a: any) => a.category === 'ETF_STOCKS'),
    ETF_BONDS: assetsWithValues.filter((a: any) => a.category === 'ETF_BONDS'),
    CRYPTO: assetsWithValues.filter((a: any) => a.category === 'CRYPTO'),
    PRIVATE_EQUITY: assetsWithValues.filter((a: any) => a.category === 'PRIVATE_EQUITY'),
    BUSINESS_PROFITS: assetsWithValues.filter((a: any) => a.category === 'BUSINESS_PROFITS'),
    REAL_ESTATE: assetsWithValues.filter((a: any) => a.category === 'REAL_ESTATE'),
    CASH: assetsWithValues.filter((a: any) => a.category === 'CASH'),
  };

  const totalAssetValue = assetsWithValues.reduce((sum: number, a: any) => sum + (a.currentValue || 0), 0);
  const assetsWithValuesCount = assetsWithValues.filter((a: any) => a.currentValue !== undefined).length;

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

  const handleSaveAsset = async (assetId: string, value: number, notes?: string) => {
    try {
      await saveAssetInput.mutateAsync({ asset_id: assetId, year, month, total: value, notes });
      toast({ title: 'Asset value saved', status: 'success', duration: 2000 });
    } catch (error) {
      toast({ title: 'Failed to save', status: 'error', duration: 3000 });
    }
  };

  const handleEditAsset = async (assetId: string, name: string, ticker?: string, marketCap?: number) => {
    try {
      await updateAsset.mutateAsync({ id: assetId, data: { name, ticker, market_cap: marketCap } });
      toast({ title: 'Asset updated', status: 'success', duration: 2000 });
    } catch (error) {
      toast({ title: 'Failed to update', status: 'error', duration: 3000 });
    }
  };

  const handleAddAsset = async (category: string, name: string, ticker?: string, marketCap?: number) => {
    try {
      await createAsset.mutateAsync({ name, ticker, category_id: category, market_cap: marketCap });
      toast({ title: 'Asset created', status: 'success', duration: 2000 });
    } catch (error) {
      toast({ title: 'Failed to create', status: 'error', duration: 3000 });
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    try {
      await deleteAsset.mutateAsync(assetId);
      toast({ title: 'Asset deleted', status: 'success', duration: 2000 });
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
                    {assetsWithValuesCount} / {assets.length} assets entered
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
    </ProtectedRoute>
  );
}