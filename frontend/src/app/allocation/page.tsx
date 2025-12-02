'use client';

import {
  Box,
  Heading,
  SimpleGrid,
  Card,
  CardBody,
  VStack,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useDisclosure,
  Divider,
  Spinner,
  Center,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import CategoryCard from '@/components/allocation/CategoryCard';
import CategoryDetailModal from '@/components/allocation/CategoryDetailModal';
import CashLiquiditySection from '@/components/allocation/CashLiquiditySection';
import AllocationHistoryChart from '@/components/allocation/AllocationHistoryChart';
import { formatCurrency } from '@/utils/formatters';
import { CategoryAllocation } from '@/types/allocation';

// ✅ Use REAL API hooks
import { useAllocation, useUpdateCategoryTarget } from '@/hooks/api/useAllocation';

const BLUE_PALETTE = [
  '#2196f3', '#1e88e5', '#1976d2', '#1565c0',
  '#0d47a1', '#64b5f6', '#42a5f5', '#90caf9',
];

export default function AllocationPage() {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedCategory, setSelectedCategory] = useState<CategoryAllocation | null>(null);

  // Fetch allocation data
  const { data: allocationData, isLoading } = useAllocation();
  const updateTarget = useUpdateCategoryTarget();

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

  const allocation = allocationData?.data || {};
  const categoriesData = allocation.categories || [];
  const allocationHistory = allocation.history || [];
  const totalValue = allocation.total_value || 0;
  const previousTotalValue = allocation.previous_total_value || 0;
  const totalChange = totalValue - previousTotalValue;
  const totalChangePercent = previousTotalValue > 0 
    ? ((totalChange / previousTotalValue) * 100).toFixed(1)
    : '0.0';

  // Map API data to CategoryAllocation format
  const categories: CategoryAllocation[] = categoriesData.map((cat: any, index: number) => ({
    category: cat.category,
    categoryName: cat.category_name,
    currentValue: cat.current_value,
    previousValue: cat.previous_value,
    currentPercentage: cat.current_percentage,
    previousPercentage: cat.previous_percentage,
    targetPercentage: cat.target_percentage,
    targetValue: cat.target_value,
    delta: cat.delta,
    deltaPercentage: cat.delta_percentage,
    assets: cat.assets || [],
    color: BLUE_PALETTE[index % BLUE_PALETTE.length],
    hasMarketCapTargets: ['SINGLE_STOCKS', 'ETF_STOCKS', 'ETF_BONDS', 'CRYPTO'].includes(cat.category),
  }));

  const handleCategoryClick = (category: CategoryAllocation) => {
    setSelectedCategory(category);
    onOpen();
  };

  const handleUpdateTarget = async (categoryCode: string, targetPct: number) => {
    try {
      await updateTarget.mutateAsync({
        category: categoryCode,
        targetPct,
      });
      toast({
        title: 'Target updated',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Failed to update target',
        description: error.message || 'An error occurred',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const isPositiveChange = parseFloat(totalChangePercent) >= 0;

  const cashCategory = categories.find(c => c.category === 'CASH');
  const otherCategories = categories.filter(c => c.category !== 'CASH');

  const categoryChartData = categories.map((cat) => ({
    category: cat.category,
    categoryName: cat.categoryName,
    color: cat.color,
    dataKey: cat.category.toLowerCase().replace(/_/g, '_'),
  }));

  return (
    <ProtectedRoute>
      <MainLayout>
        <VStack spacing={8} align="stretch">
          <Box>
            <Heading size="lg" mb={2} color="text.primary">
              Asset Allocation
            </Heading>
            <Text color="text.secondary">
              Manage and monitor your portfolio allocation across 8 asset categories
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <Card bg="background.secondary" border="none">
              <CardBody>
                <Stat>
                  <StatLabel color="text.secondary">Total Portfolio Value</StatLabel>
                  <StatNumber color="text.primary" fontSize="2xl">
                    {formatCurrency(totalValue)}
                  </StatNumber>
                  <StatHelpText color={isPositiveChange ? 'success.500' : 'error.500'}>
                    <StatArrow type={isPositiveChange ? 'increase' : 'decrease'} />
                    {isPositiveChange ? '+' : ''}{formatCurrency(Math.abs(totalChange))} this month
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg="background.secondary" border="none">
              <CardBody>
                <Stat>
                  <StatLabel color="text.secondary">Monthly Change</StatLabel>
                  <StatNumber color="text.primary" fontSize="2xl">
                    {totalChangePercent}%
                  </StatNumber>
                  <StatHelpText color="text.secondary">
                    {isPositiveChange ? 'Growth' : 'Decline'} vs previous month
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg="background.secondary" border="none">
              <CardBody>
                <Stat>
                  <StatLabel color="text.secondary">Asset Categories</StatLabel>
                  <StatNumber color="text.primary" fontSize="2xl">
                    {categories.length}
                  </StatNumber>
                  <StatHelpText color="text.secondary">
                    {categories.reduce((sum, cat) => sum + cat.assets.length, 0)} total assets
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          {cashCategory && (
            <Card bg="background.secondary" border="none">
              <CardBody>
                <CashLiquiditySection category={cashCategory} />
              </CardBody>
            </Card>
          )}

          <Divider borderColor="background.tertiary" />

          <Box>
            <Heading size="md" mb={4} color="text.primary">
              Investment Categories
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {otherCategories.map((category) => (
                <CategoryCard
                  key={category.category}
                  category={category}
                  onSelect={() => handleCategoryClick(category)}
                />
              ))}
            </SimpleGrid>
          </Box>

          {allocationHistory.length > 0 && (
            <Card bg="background.secondary" border="none">
              <CardBody>
                <AllocationHistoryChart
                  data={allocationHistory}
                  categories={categoryChartData}
                />
              </CardBody>
            </Card>
          )}
        </VStack>

        <CategoryDetailModal
          isOpen={isOpen}
          onClose={onClose}
          category={selectedCategory}
          onUpdateTarget={handleUpdateTarget}
        />
      </MainLayout>
    </ProtectedRoute>
  );
}