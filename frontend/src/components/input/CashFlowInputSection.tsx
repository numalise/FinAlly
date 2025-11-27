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
  Input,
  IconButton,
  HStack,
  Text,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  FormControl,
  FormLabel,
  Select,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import { FiPlus, FiEdit2, FiTrash2, FiSave } from 'react-icons/fi';
import { useState } from 'react';
import { formatCurrency } from '@/utils/formatters';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/types/input';

interface CashFlowItem {
  id: string;
  categoryId: string;
  categoryName: string;
  amount: number;
  description?: string;
}

interface CashFlowInputSectionProps {
  year: number;
  month: number;
  incomeItems: CashFlowItem[];
  expenseItems: CashFlowItem[];
  onSaveIncome: (categoryId: string, amount: number, description?: string) => void;
  onSaveExpense: (categoryId: string, amount: number, description?: string) => void;
  onDeleteIncome: (id: string) => void;
  onDeleteExpense: (id: string) => void;
}

export default function CashFlowInputSection({
  year,
  month,
  incomeItems,
  expenseItems,
  onSaveIncome,
  onSaveExpense,
  onDeleteIncome,
  onDeleteExpense,
}: CashFlowInputSectionProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeTab, setActiveTab] = useState(0);
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const handleAddIncome = () => {
    setActiveTab(0);
    setEditCategoryId(INCOME_CATEGORIES[0].code);
    setEditAmount('');
    setEditDescription('');
    onOpen();
  };

  const handleAddExpense = () => {
    setActiveTab(1);
    setEditCategoryId(EXPENSE_CATEGORIES[0].code);
    setEditAmount('');
    setEditDescription('');
    onOpen();
  };

  const handleSave = () => {
    if (editCategoryId && editAmount) {
      if (activeTab === 0) {
        onSaveIncome(editCategoryId, parseFloat(editAmount), editDescription);
      } else {
        onSaveExpense(editCategoryId, parseFloat(editAmount), editDescription);
      }
      onClose();
      setEditCategoryId('');
      setEditAmount('');
      setEditDescription('');
    }
  };

  const totalIncome = incomeItems.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenseItems.reduce((sum, item) => sum + item.amount, 0);
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  return (
    <Box>
      <HStack justify="space-between" mb={4}>
        <Heading size="md" color="text.primary">
          Cash Flow
        </Heading>
        <HStack spacing={4}>
          <VStack spacing={0} align="end">
            <Text fontSize="xs" color="text.secondary">Savings Rate</Text>
            <Text fontSize="lg" fontWeight="bold" color="brand.500">
              {savingsRate.toFixed(1)}%
            </Text>
          </VStack>
          <VStack spacing={0} align="end">
            <Text fontSize="xs" color="text.secondary">Net Savings</Text>
            <Text fontSize="lg" fontWeight="bold" color={netSavings >= 0 ? 'success.500' : 'error.500'}>
              {formatCurrency(netSavings)}
            </Text>
          </VStack>
        </HStack>
      </HStack>

      <Tabs colorScheme="blue">
        <TabList>
          <Tab>Income ({incomeItems.length})</Tab>
          <Tab>Expenses ({expenseItems.length})</Tab>
        </TabList>

        <TabPanels>
          {/* Income Tab */}
          <TabPanel>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Text fontSize="sm" color="text.secondary">
                  Total Income: {formatCurrency(totalIncome)}
                </Text>
                <Button
                  leftIcon={<FiPlus />}
                  size="sm"
                  colorScheme="blue"
                  onClick={handleAddIncome}
                >
                  Add Income
                </Button>
              </HStack>

              {incomeItems.length > 0 ? (
                <Box overflowX="auto">
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Category</Th>
                        <Th isNumeric>Amount</Th>
                        <Th>Description</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {incomeItems.map((item) => (
                        <Tr key={item.id}>
                          <Td>
                            <Text color="text.primary" fontWeight="medium">
                              {item.categoryName}
                            </Text>
                          </Td>
                          <Td isNumeric>
                            <Text color="success.500" fontWeight="medium">
                              {formatCurrency(item.amount)}
                            </Text>
                          </Td>
                          <Td>
                            <Text color="text.secondary" fontSize="sm" noOfLines={1}>
                              {item.description || '-'}
                            </Text>
                          </Td>
                          <Td>
                            <IconButton
                              aria-label="Delete"
                              icon={<FiTrash2 />}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => onDeleteIncome(item.id)}
                            />
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              ) : (
                <Text color="text.secondary" textAlign="center" py={8}>
                  No income entries for this month
                </Text>
              )}
            </VStack>
          </TabPanel>

          {/* Expenses Tab */}
          <TabPanel>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Text fontSize="sm" color="text.secondary">
                  Total Expenses: {formatCurrency(totalExpenses)}
                </Text>
                <Button
                  leftIcon={<FiPlus />}
                  size="sm"
                  colorScheme="blue"
                  onClick={handleAddExpense}
                >
                  Add Expense
                </Button>
              </HStack>

              {expenseItems.length > 0 ? (
                <Box overflowX="auto">
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Category</Th>
                        <Th isNumeric>Amount</Th>
                        <Th>Description</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {expenseItems.map((item) => (
                        <Tr key={item.id}>
                          <Td>
                            <Text color="text.primary" fontWeight="medium">
                              {item.categoryName}
                            </Text>
                          </Td>
                          <Td isNumeric>
                            <Text color="error.500" fontWeight="medium">
                              {formatCurrency(item.amount)}
                            </Text>
                          </Td>
                          <Td>
                            <Text color="text.secondary" fontSize="sm" noOfLines={1}>
                              {item.description || '-'}
                            </Text>
                          </Td>
                          <Td>
                            <IconButton
                              aria-label="Delete"
                              icon={<FiTrash2 />}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => onDeleteExpense(item.id)}
                            />
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              ) : (
                <Text color="text.secondary" textAlign="center" py={8}>
                  No expense entries for this month
                </Text>
              )}
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg="background.secondary">
          <ModalHeader color="text.primary">
            {activeTab === 0 ? 'Add Income' : 'Add Expense'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel color="text.secondary">Category</FormLabel>
                <Select
                  value={editCategoryId}
                  onChange={(e) => setEditCategoryId(e.target.value)}
                  bg="background.tertiary"
                >
                  {(activeTab === 0 ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((cat) => (
                    <option key={cat.code} value={cat.code}>
                      {cat.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel color="text.secondary">Amount (€)</FormLabel>
                <Input
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  placeholder="Enter amount"
                  step="0.01"
                  bg="background.tertiary"
                />
              </FormControl>

              <FormControl>
                <FormLabel color="text.secondary">Description (optional)</FormLabel>
                <Input
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Add description"
                  bg="background.tertiary"
                />
              </FormControl>

              <HStack spacing={3} w="full" justify="flex-end">
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  colorScheme="blue"
                  leftIcon={<FiSave />}
                  onClick={handleSave}
                  isDisabled={!editCategoryId || !editAmount}
                >
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
