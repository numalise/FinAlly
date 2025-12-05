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
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Button,
} from '@chakra-ui/react';
import { FiEdit2, FiTrendingUp } from 'react-icons/fi';
import { useState } from 'react';
import { formatCurrency } from '@/utils/formatters';

interface BudgetItem {
  category: string;
  categoryName: string;
  budgetAmount: number;
  actualAmount: number;
  calculated: boolean;
}

interface BudgetTableProps {
  budgets: BudgetItem[];
  totalBudget: number;
  totalActual: number;
  onUpdateBudget: (category: string, amount: number) => void;
  onAutoAdjust?: () => void;
  isAutoAdjusting?: boolean;
}

export default function BudgetTable({ budgets, totalBudget, totalActual, onUpdateBudget, onAutoAdjust, isAutoAdjusting }: BudgetTableProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingBudget, setEditingBudget] = useState<BudgetItem | null>(null);
  const [editAmount, setEditAmount] = useState('');

  const handleEdit = (budget: BudgetItem) => {
    setEditingBudget(budget);
    setEditAmount(budget.budgetAmount.toString());
    onOpen();
  };

  const handleSave = () => {
    if (editingBudget && editAmount) {
      onUpdateBudget(editingBudget.category, parseFloat(editAmount));
      onClose();
      setEditingBudget(null);
      setEditAmount('');
    }
  };

  return (
    <Box>
      <HStack justify="space-between" mb={4}>
        <Heading size="md" color="text.primary">
          Monthly Budget
        </Heading>
        <HStack spacing={4}>
          {onAutoAdjust && (
            <Button
              leftIcon={<FiTrendingUp />}
              size="sm"
              colorScheme="purple"
              onClick={onAutoAdjust}
              isLoading={isAutoAdjusting}
              loadingText="Adjusting..."
            >
              Auto-Adjust Next Month
            </Button>
          )}
          <VStack spacing={0} align="end">
            <Text fontSize="xs" color="text.secondary">
              {formatCurrency(totalActual)} / {formatCurrency(totalBudget)}
            </Text>
            <Text fontSize="xs" color={totalActual > totalBudget ? 'error.500' : 'success.500'}>
              {totalActual > totalBudget ? 'Over' : 'Under'} budget
            </Text>
          </VStack>
        </HStack>
      </HStack>

      <Box overflowX="auto">
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th border="none">Category</Th>
              <Th border="none" isNumeric>Budget</Th>
              <Th border="none" isNumeric>Actual</Th>
              <Th border="none" isNumeric>Remaining</Th>
              <Th border="none"></Th>
            </Tr>
          </Thead>
          <Tbody>
            {budgets.map((budget) => {
              const remaining = budget.budgetAmount - budget.actualAmount;
              const percentage = (budget.actualAmount / budget.budgetAmount) * 100;
              const isOver = budget.actualAmount > budget.budgetAmount;

              return (
                <Tr key={budget.category}>
                  <Td border="none">
                    <HStack spacing={2}>
                      <Text color="text.primary" fontWeight="medium">
                        {budget.categoryName}
                      </Text>
                      {budget.calculated && (
                        <Badge colorScheme="purple" variant="subtle" fontSize="xs">
                          Auto
                        </Badge>
                      )}
                    </HStack>
                  </Td>
                  <Td border="none" isNumeric>
                    <Text color="text.secondary">
                      {formatCurrency(budget.budgetAmount)}
                    </Text>
                  </Td>
                  <Td border="none" isNumeric>
                    <Text color={isOver ? 'error.500' : 'text.primary'} fontWeight="medium">
                      {formatCurrency(budget.actualAmount)}
                    </Text>
                  </Td>
                  <Td border="none" isNumeric>
                    <Text color={remaining >= 0 ? 'success.500' : 'error.500'} fontWeight="medium">
                      {formatCurrency(Math.abs(remaining))}
                    </Text>
                  </Td>
                  <Td border="none">
                    <IconButton
                      aria-label="Edit budget"
                      icon={<FiEdit2 />}
                      size="xs"
                      variant="ghost"
                      color="blue.400"
                      onClick={() => handleEdit(budget)}
                    />
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Box>

      {/* Edit Budget Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg="background.secondary" border="none">
          <ModalHeader color="text.primary">
            Edit Budget: {editingBudget?.categoryName}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel color="text.secondary">Budget Amount (€)</FormLabel>
                <Input
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  step="0.01"
                  bg="background.tertiary"
                  color="text.primary"
                  border="none"
                />
              </FormControl>

              <HStack spacing={3} w="full" justify="flex-end">
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button colorScheme="blue" onClick={handleSave} isDisabled={!editAmount}>
                  Save
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
