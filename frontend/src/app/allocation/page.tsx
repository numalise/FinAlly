'use client';

import {
  Box,
  Heading,
  SimpleGrid,
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useDisclosure,
  Divider,
} from '@chakra-ui/react';
import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAllocationData } from '@/hooks/useAllocationData';
import CategoryCard from '@/components/allocation/CategoryCard';
import CategoryDetailModal from '@/components/allocation/CategoryDetailModal';
import AllocationHistoryChart from '@/components/allocation/AllocationHistoryChart';
import { formatCurrency } from '@/utils/formatters';
import { CategoryAllocation } from '@/types/allocation';

export default function AllocationPage() {
  const {
    categories,
    allocationHistory,
    totalValue,
    previousTotalValue,
    totalChange,
    totalChangePercent,
  } = useAllocationData();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedCategory, setSelectedCategory] = useState<CategoryAllocation | null>(null);

  const handleCategoryClick = (category: CategoryAllocation) => {
    setSelectedCategory(category);
    onOpen();
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
          <Card>
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

          <Card>
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

          <Card>
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

        {/* Cash Liquidity - No Card Wrapper */}
        {cashCategory && (
          <Box>
            <Heading size="md" mb={4} color="text.primary">
              Cash Liquidity
            </Heading>
            <CategoryCard
              category={cashCategory}
              onSelect={() => handleCategoryClick(cashCategory)}
            />
          </Box>
        )}

        <Divider />

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

        <Card>
          <CardBody>
            <AllocationHistoryChart
              data={allocationHistory}
              categories={categoryChartData}
            />
          </CardBody>
        </Card>
      </VStack>

      <CategoryDetailModal
        isOpen={isOpen}
        onClose={onClose}
        category={selectedCategory}
      />
    </MainLayout>
  );
}
