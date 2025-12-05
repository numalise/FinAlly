'use client';

import { useState, useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Alert,
  AlertIcon,
  AlertDescription,
} from '@chakra-ui/react';
import { CategoryAllocation } from '@/types/allocation';

interface CategoryTargetEditorProps {
  categories: CategoryAllocation[];
  onUpdateTarget: (categoryCode: string, targetPct: number) => Promise<void>;
}

export default function CategoryTargetEditor({
  categories,
  onUpdateTarget,
}: CategoryTargetEditorProps) {
  const [editingValues, setEditingValues] = useState<Record<string, string>>({});

  // Calculate total target percentage
  const totalTarget = useMemo(() => {
    return categories.reduce((sum, cat) => {
      const categoryCode = cat.category;
      const editValue = editingValues[categoryCode];
      const value = editValue !== undefined && editValue !== ''
        ? parseFloat(editValue) || 0
        : cat.targetPercentage || 0;
      return sum + value;
    }, 0);
  }, [categories, editingValues]);

  const isOverAllocated = totalTarget > 100;

  const handleInputChange = (categoryCode: string, value: string) => {
    setEditingValues(prev => ({
      ...prev,
      [categoryCode]: value,
    }));
  };

  const handleBlur = async (categoryCode: string) => {
    const value = editingValues[categoryCode];
    if (value !== undefined && value !== '') {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
        await onUpdateTarget(categoryCode, numValue);
        // Clear editing state after successful update
        setEditingValues(prev => {
          const newState = { ...prev };
          delete newState[categoryCode];
          return newState;
        });
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, categoryCode: string) => {
    if (e.key === 'Enter') {
      handleBlur(categoryCode);
    } else if (e.key === 'Escape') {
      setEditingValues(prev => {
        const newState = { ...prev };
        delete newState[categoryCode];
        return newState;
      });
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      {isOverAllocated && (
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          <AlertDescription>
            Total target allocation is {totalTarget.toFixed(1)}%. Consider adjusting to reach 100% or below.
          </AlertDescription>
        </Alert>
      )}

      {categories.map((category) => {
        const categoryCode = category.category;
        const editValue = editingValues[categoryCode];
        const displayValue = editValue !== undefined && editValue !== ''
          ? editValue
          : (category.targetPercentage || 0).toFixed(1);

        return (
          <HStack
            key={categoryCode}
            bg="background.secondary"
            p={4}
            borderRadius="md"
            spacing={4}
            justify="space-between"
          >
            {/* Color Bar */}
            <Box w="4px" h="40px" bg={category.color} borderRadius="full" flexShrink={0} />

            {/* Category Name */}
            <VStack align="start" spacing={0} flex={1} minW="150px">
              <Text fontWeight="bold" color="text.primary">
                {category.categoryName}
              </Text>
              <Text fontSize="xs" color="text.secondary">
                {category.assets.length} asset{category.assets.length !== 1 ? 's' : ''}
              </Text>
            </VStack>

            {/* Current % */}
            <VStack align="center" spacing={0} minW="80px">
              <Text fontSize="xs" color="text.secondary">Current</Text>
              <Text fontWeight="medium" color="text.primary">
                {(category.currentPercentage || 0).toFixed(1)}%
              </Text>
            </VStack>

            {/* Arrow/Separator */}
            <Text color="text.secondary" fontSize="lg" flexShrink={0}>→</Text>

            {/* Target % Input */}
            <VStack align="center" spacing={0} minW="100px">
              <Text fontSize="xs" color="text.secondary" mb={1}>Target</Text>
              <Input
                value={displayValue}
                onChange={(e) => handleInputChange(categoryCode, e.target.value)}
                onBlur={() => handleBlur(categoryCode)}
                onKeyDown={(e) => handleKeyDown(e, categoryCode)}
                type="number"
                min={0}
                max={100}
                step={0.1}
                size="sm"
                width="80px"
                textAlign="center"
                bg="background.tertiary"
                borderColor="border.primary"
                color="text.primary"
                _focus={{ borderColor: 'blue.400' }}
                _hover={{ borderColor: 'blue.300' }}
              />
            </VStack>
          </HStack>
        );
      })}

      {/* Total Allocation Summary */}
      <Box
        bg="background.secondary"
        p={4}
        borderRadius="md"
        borderWidth="1px"
        borderColor={isOverAllocated ? 'orange.400' : 'border.primary'}
      >
        <HStack justify="space-between">
          <Text fontSize="md" fontWeight="bold" color="text.primary">
            Total Target Allocation:
          </Text>
          <Text
            fontSize="xl"
            fontWeight="bold"
            color={isOverAllocated ? 'orange.400' : totalTarget === 100 ? 'green.400' : 'text.primary'}
          >
            {totalTarget.toFixed(1)}%
          </Text>
        </HStack>
      </Box>
    </VStack>
  );
}
