'use client';

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
} from '@chakra-ui/react';
import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import MonthSelector from '@/components/input/MonthSelector';
import CashFlowInputSection from '@/components/input/CashFlowInputSection';
import { useInputData } from '@/hooks/useInputData';
import { formatCurrency } from '@/utils/formatters';

export default function CashFlowPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const {
    incomeItems,
    expenseItems,
    handleSaveIncome,
    handleSaveExpense,
    handleDeleteIncome,
    handleDeleteExpense,
  } = useInputData(year, month);

  const totalIncome = incomeItems.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenseItems.reduce((sum, item) => sum + item.amount, 0);
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  return (
    <MainLayout>
      <VStack spacing={8} align="stretch">
        <HStack justify="space-between" align="start">
          <Box>
            <Heading size="lg" color="text.primary" mb={2}>
              Cash Flow
            </Heading>
            <Text color="text.secondary">
              Track your monthly income and expenses
            </Text>
          </Box>
          <MonthSelector year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); }} />
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <Card bg="background.secondary" border="none">
            <CardBody>
              <Stat>
                <StatLabel color="text.secondary">Total Income</StatLabel>
                <StatNumber color="success.500" fontSize="2xl">
                  {formatCurrency(totalIncome)}
                </StatNumber>
                <StatHelpText color="text.secondary">
                  {incomeItems.length} entries
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg="background.secondary" border="none">
            <CardBody>
              <Stat>
                <StatLabel color="text.secondary">Total Expenses</StatLabel>
                <StatNumber color="error.500" fontSize="2xl">
                  {formatCurrency(totalExpenses)}
                </StatNumber>
                <StatHelpText color="text.secondary">
                  {expenseItems.length} entries
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg="background.secondary" border="none">
            <CardBody>
              <Stat>
                <StatLabel color="text.secondary">Net Savings</StatLabel>
                <StatNumber color={netSavings >= 0 ? 'success.500' : 'error.500'} fontSize="2xl">
                  {formatCurrency(netSavings)}
                </StatNumber>
                <StatHelpText color="text.secondary">
                  This month
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg="background.secondary" border="none">
            <CardBody>
              <Stat>
                <StatLabel color="text.secondary">Savings Rate</StatLabel>
                <StatNumber color="brand.500" fontSize="2xl">
                  {savingsRate.toFixed(1)}%
                </StatNumber>
                <StatHelpText color="text.secondary">
                  Income saved
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        <Card bg="background.secondary" border="none">
          <CardBody>
            <CashFlowInputSection
              year={year}
              month={month}
              incomeItems={incomeItems}
              expenseItems={expenseItems}
              onSaveIncome={handleSaveIncome}
              onSaveExpense={handleSaveExpense}
              onDeleteIncome={handleDeleteIncome}
              onDeleteExpense={handleDeleteExpense}
            />
          </CardBody>
        </Card>
      </VStack>
    </MainLayout>
  );
}
