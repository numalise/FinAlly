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
import { FiTrendingUp, FiTrendingDown, FiAlertCircle } from 'react-icons/fi';

interface CategoryCardProps {
  category: CategoryAllocation;
  onSelect: () => void;
}

export default function CategoryCard({ category, onSelect }: CategoryCardProps) {
  const valueChange = category.currentValue - category.previousValue;
  const isPositive = valueChange >= 0;
  const targetDelta = category.deltaPercentage;
  const isOnTarget = Math.abs(targetDelta) < 1;

  // Progress bar logic:
  // - If current < target: show as incomplete (current/target * 100)
  // - If current > target: show as over 100% (current/target * 100)
  const progressValue = (category.currentPercentage / category.targetPercentage) * 100;
  const isOver = category.currentPercentage > category.targetPercentage;
  const isUnder = category.currentPercentage < category.targetPercentage;

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
                colorScheme={isOnTarget ? 'green' : isOver ? 'orange' : 'blue'}
                variant="subtle"
              >
                {isOnTarget ? 'On Target' : isOver ? 'Over' : 'Under'}
              </Badge>
              <Text 
                fontSize="xs" 
                color={isOnTarget ? 'text.secondary' : isOver ? 'orange.400' : 'blue.400'}
                fontWeight="medium"
                mt={1}
              >
                {targetDelta > 0 ? '+' : ''}{targetDelta.toFixed(1)}%
              </Text>
              <Text fontSize="xs" color={isOnTarget ? 'text.tertiary' : isOver ? 'orange.400' : 'blue.400'}>
                {category.delta >= 0 ? '+' : ''}{formatCurrency(Math.abs(category.delta))}
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

          {/* Current vs Target with Fixed Progress Bar */}
          <Box>
            <HStack justify="space-between" mb={2}>
              <Text fontSize="sm" color="text.secondary">
                Current: {formatPercent(category.currentPercentage)}
              </Text>
              <Text fontSize="sm" color="text.secondary">
                Target: {formatPercent(category.targetPercentage)}
              </Text>
            </HStack>
            
            {/* Progress bar: fills to 100% when on target, shows excess/deficit */}
            <Box position="relative">
              <Progress
                value={Math.min(progressValue, 100)}
                max={100}
                colorScheme={isOnTarget ? 'green' : isUnder ? 'blue' : 'orange'}
                bg="background.tertiary"
                borderRadius="full"
                h="6px"
              />
              {isOver && (
                <Box
                  position="absolute"
                  top="0"
                  left="0"
                  right="0"
                  bottom="0"
                  borderRadius="full"
                  bg={`linear-gradient(to right, orange.500 0%, orange.500 ${Math.min((progressValue - 100), 50)}%, transparent ${Math.min((progressValue - 100), 50)}%)`}
                  opacity="0.3"
                />
              )}
            </Box>
            
            {isOver && (
              <HStack spacing={1} mt={1} color="orange.400">
                <FiAlertCircle size={12} />
                <Text fontSize="xs">
                  {(progressValue - 100).toFixed(0)}% over target
                </Text>
              </HStack>
            )}
            {isUnder && (
              <Text fontSize="xs" mt={1} color="blue.400">
                {(100 - progressValue).toFixed(0)}% below target
              </Text>
            )}
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
}
