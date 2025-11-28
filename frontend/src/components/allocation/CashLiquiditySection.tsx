'use client';

import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  HStack,
  VStack,
  Badge,
} from '@chakra-ui/react';
import { formatCurrency } from '@/utils/formatters';
import { CategoryAllocation } from '@/types/allocation';

interface CashLiquiditySectionProps {
  category: CategoryAllocation;
}

export default function CashLiquiditySection({ category }: CashLiquiditySectionProps) {
  const isOver = category.delta > 0;
  const isUnder = category.delta < 0;
  const isOnTarget = Math.abs(category.deltaPercentage) < 1;

  return (
    <Box>
      <Heading size="md" mb={4} color="text.primary">
        Cash Liquidity
      </Heading>

      <VStack spacing={6} align="stretch">
        {/* Summary Stats */}
        <HStack spacing={8} justify="space-between">
          <VStack align="start" spacing={1}>
            <Text fontSize="xs" color="text.secondary">Current Value</Text>
            <Text fontSize="2xl" fontWeight="bold" color="text.primary">
              {formatCurrency(category.currentValue)}
            </Text>
            <Text fontSize="sm" color="text.secondary">
              {category.currentPercentage.toFixed(1)}% of portfolio
            </Text>
          </VStack>

          <VStack align="start" spacing={1}>
            <Text fontSize="xs" color="text.secondary">Target</Text>
            <Text fontSize="xl" fontWeight="bold" color="text.secondary">
              {formatCurrency(category.targetValue)}
            </Text>
            <Text fontSize="sm" color="text.secondary">
              {category.targetPercentage.toFixed(1)}% target
            </Text>
          </VStack>

          <VStack align="start" spacing={1}>
            <Text fontSize="xs" color="text.secondary">Delta vs Target</Text>
            <Text fontSize="xl" fontWeight="bold" color={isOnTarget ? 'text.secondary' : isOver ? 'orange.500' : 'blue.500'}>
              {formatCurrency(Math.abs(category.delta))}
            </Text>
            <Text fontSize="sm" color="text.secondary">
              {isOver ? 'Remove' : isUnder ? 'Add' : 'On Target'}
            </Text>
          </VStack>

          <VStack align="start" spacing={1}>
            <Text fontSize="xs" color="text.secondary">Assets</Text>
            <Text fontSize="xl" fontWeight="bold" color="text.primary">
              {category.assets.length}
            </Text>
            <Badge colorScheme={isOnTarget ? 'green' : isOver ? 'orange' : 'blue'} variant="subtle">
              {isOnTarget ? 'On Target' : isOver ? 'Over' : 'Under'}
            </Badge>
          </VStack>
        </HStack>

        {/* Asset Details Table */}
        <Box>
          <Text fontSize="sm" fontWeight="bold" color="text.primary" mb={3}>
            Cash Holdings
          </Text>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th border="none">Account</Th>
                <Th border="none" isNumeric>Value</Th>
                <Th border="none" isNumeric>% of Cash</Th>
              </Tr>
            </Thead>
            <Tbody>
              {category.assets.map((asset) => {
                const percentOfCategory = (asset.currentValue / category.currentValue) * 100;
                return (
                  <Tr key={asset.id}>
                    <Td border="none">
                      <Text color="text.primary" fontWeight="medium">
                        {asset.name}
                      </Text>
                    </Td>
                    <Td border="none" isNumeric>
                      <Text color="text.primary" fontWeight="medium">
                        {formatCurrency(asset.currentValue)}
                      </Text>
                    </Td>
                    <Td border="none" isNumeric>
                      <Text color="text.secondary">
                        {percentOfCategory.toFixed(1)}%
                      </Text>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      </VStack>
    </Box>
  );
}
