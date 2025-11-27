'use client';

import {
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Progress,
  Badge,
  Box,
} from '@chakra-ui/react';
import { formatCurrency, formatPercent } from '@/utils/formatters';
import { CategoryAllocation } from '@/types/allocation';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

interface CategoryCardProps {
  category: CategoryAllocation;
  onSelect: () => void;
}

export default function CategoryCard({ category, onSelect }: CategoryCardProps) {
  const valueChange = category.currentValue - category.previousValue;
  const percentChange = category.currentPercentage - category.previousPercentage;
  const isPositive = valueChange >= 0;
  const targetDelta = category.currentPercentage - category.targetPercentage;
  const isOnTarget = Math.abs(targetDelta) < 1;

  return (
    <Card
      cursor="pointer"
      onClick={onSelect}
      _hover={{
        transform: 'translateY(-2px)',
        shadow: 'lg',
        borderColor: category.color,
      }}
      transition="all 0.2s"
    >
      <CardBody>
        <VStack align="stretch" spacing={4}>
          {/* Header */}
          <HStack justify="space-between">
            <HStack spacing={2}>
              <Box w="4px" h="40px" bg={category.color} borderRadius="full" />
              <VStack align="start" spacing={0}>
                <Text fontSize="lg" fontWeight="bold" color="text.primary">
                  {category.categoryName}
                </Text>
                <Text fontSize="xs" color="text.secondary">
                  {category.assets.length} asset{category.assets.length !== 1 ? 's' : ''}
                </Text>
              </VStack>
            </HStack>
            <VStack align="end" spacing={0}>
              <Badge
                colorScheme={isOnTarget ? 'green' : targetDelta > 0 ? 'blue' : 'orange'}
                variant="subtle"
              >
                {isOnTarget ? 'On Target' : targetDelta > 0 ? 'Over' : 'Under'}
              </Badge>
              <Text 
                fontSize="xs" 
                color={isOnTarget ? 'text.secondary' : targetDelta > 0 ? 'blue.400' : 'orange.400'}
                fontWeight="medium"
                mt={1}
              >
                {targetDelta > 0 ? '+' : ''}{targetDelta.toFixed(1)}%
              </Text>
            </VStack>
          </HStack>

          {/* Value */}
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="text.primary">
              {formatCurrency(category.currentValue)}
            </Text>
            <HStack spacing={2} mt={1}>
              <HStack spacing={1} color={isPositive ? 'success.500' : 'error.500'}>
                {isPositive ? <FiTrendingUp /> : <FiTrendingDown />}
                <Text fontSize="sm" fontWeight="medium">
                  {isPositive ? '+' : ''}{formatCurrency(Math.abs(valueChange))}
                </Text>
              </HStack>
              <Text fontSize="sm" color="text.secondary">
                vs last month
              </Text>
            </HStack>
          </Box>

          {/* Current vs Target */}
          <Box>
            <HStack justify="space-between" mb={2}>
              <Text fontSize="sm" color="text.secondary">
                Current: {formatPercent(category.currentPercentage)}
              </Text>
              <Text fontSize="sm" color="text.secondary">
                Target: {formatPercent(category.targetPercentage)}
              </Text>
            </HStack>
            <Progress
              value={category.currentPercentage}
              max={Math.max(category.currentPercentage, category.targetPercentage) + 5}
              colorScheme="blue"
              bg="background.tertiary"
              borderRadius="full"
              h="6px"
            />
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
}
