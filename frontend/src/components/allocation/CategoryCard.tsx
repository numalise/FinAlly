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
import { formatCurrency } from '@/utils/formatters';
import { CategoryAllocation } from '@/types/allocation';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

interface CategoryCardProps {
  category: CategoryAllocation;
  onSelect: () => void;
}

export default function CategoryCard({ category, onSelect }: CategoryCardProps) {
  const currentPercentage = category.currentPercentage ?? 0;
  const targetPercentage = category.targetPercentage ?? 0;
  const valueChange = category.currentValue - category.previousValue;
  const isPositive = valueChange >= 0;
  const targetDelta = category.deltaPercentage ?? 0;
  const isOnTarget = Math.abs(targetDelta) < 1;

  const progressValue = targetPercentage > 0
    ? (currentPercentage / targetPercentage) * 100
    : 0;
  const needsAdd = category.delta > 0;
  const needsTrim = category.delta < 0;

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
      borderWidth="1px"
      borderColor="transparent"
    >
      <CardBody>
        <VStack align="stretch" spacing={4}>
          {/* Header with colored indicator */}
          <HStack justify="space-between">
            <HStack spacing={3}>
              <Box w="4px" h="50px" bg={category.color} borderRadius="full" />
              <VStack align="start" spacing={0}>
                <Text fontSize="lg" fontWeight="bold" color="text.primary">
                  {category.categoryName}
                </Text>
                <Text fontSize="xs" color="text.secondary">
                  {category.assets.length} asset{category.assets.length !== 1 ? 's' : ''}
                </Text>
              </VStack>
            </HStack>
            <Badge
              colorScheme={isOnTarget ? 'green' : needsTrim ? 'orange' : 'blue'}
              variant="subtle"
              fontSize="xs"
            >
              {isOnTarget ? 'On Target' : needsTrim ? 'Over' : 'Under'}
            </Badge>
          </HStack>

          {/* Value Display */}
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="text.primary">
              {formatCurrency(category.currentValue)}
            </Text>
            <HStack spacing={2} mt={1}>
              <HStack spacing={1} color={isPositive ? 'success.500' : 'error.500'}>
                {isPositive ? <FiTrendingUp size={14} /> : <FiTrendingDown size={14} />}
                <Text fontSize="sm" fontWeight="medium">
                  {isPositive ? '+' : ''}{formatCurrency(Math.abs(valueChange))}
                </Text>
              </HStack>
              <Text fontSize="sm" color="text.secondary">
                vs last month
              </Text>
            </HStack>
          </Box>

          {/* Allocation Progress */}
          <Box>
            <HStack justify="space-between" mb={2}>
              <VStack align="start" spacing={0}>
                <Text fontSize="xs" color="text.secondary">Current</Text>
                <Text fontSize="sm" fontWeight="medium" color="text.primary">
                  {currentPercentage.toFixed(1)}%
                </Text>
              </VStack>
              <VStack align="center" spacing={0}>
                <Text fontSize="xs" color={isOnTarget ? 'text.secondary' : needsTrim ? 'orange.400' : 'blue.400'}>
                  {targetDelta > 0 ? '+' : ''}{targetDelta.toFixed(1)}%
                </Text>
                <Text fontSize="xs" color={isOnTarget ? 'text.tertiary' : needsTrim ? 'orange.400' : 'blue.400'}>
                  {category.delta >= 0 ? '+' : ''}{formatCurrency(Math.abs(category.delta))}
                </Text>
              </VStack>
              <VStack align="end" spacing={0}>
                <Text fontSize="xs" color="text.secondary">Target</Text>
                <Text fontSize="sm" fontWeight="medium" color="text.secondary">
                  {targetPercentage.toFixed(1)}%
                </Text>
              </VStack>
            </HStack>
            
            <Progress
              value={Math.min(progressValue, 100)}
              max={100}
              colorScheme={isOnTarget ? 'green' : needsAdd ? 'blue' : 'orange'}
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
