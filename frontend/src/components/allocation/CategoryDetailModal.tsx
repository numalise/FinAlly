'use client';

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
} from '@chakra-ui/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CategoryAllocation } from '@/types/allocation';
import { formatCurrency } from '@/utils/formatters';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

interface CategoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: CategoryAllocation | null;
}

// Generate color shades for assets within a category
const generateShades = (baseColor: string, count: number): string[] => {
  const shades: string[] = [];
  const baseHex = baseColor.replace('#', '');
  const r = parseInt(baseHex.substr(0, 2), 16);
  const g = parseInt(baseHex.substr(2, 2), 16);
  const b = parseInt(baseHex.substr(4, 2), 16);

  for (let i = 0; i < count; i++) {
    const factor = 1 - (i * 0.15);
    const newR = Math.round(r * factor);
    const newG = Math.round(g * factor);
    const newB = Math.round(b * factor);
    shades.push(`rgb(${newR}, ${newG}, ${newB})`);
  }
  return shades;
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <Box
        bg="#1a1f2e"
        border="1px solid #252d3d"
        borderRadius="md"
        p={3}
        color="white"
      >
        <Text fontWeight="bold" fontSize="md">
          {data.name}: {formatCurrency(data.currentValue)}
        </Text>
        <Text fontSize="sm" color="text.secondary">
          {((data.currentValue / data.totalCategoryValue) * 100).toFixed(1)}% of category
        </Text>
      </Box>
    );
  }
  return null;
};

export default function CategoryDetailModal({ isOpen, onClose, category }: CategoryDetailModalProps) {
  if (!category) return null;

  const colors = generateShades(category.color, category.assets.length);
  const totalCategoryValue = category.currentValue;

  // Prepare data for pie chart
  const pieData = category.assets.map((asset) => ({
    ...asset,
    totalCategoryValue,
  }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalOverlay bg="blackAlpha.800" />
      <ModalContent bg="background.secondary" maxW="900px">
        <ModalHeader color="text.primary">
          <HStack spacing={3}>
            <Box w="4px" h="30px" bg={category.color} borderRadius="full" />
            <Text>{category.categoryName} Details</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={6} align="stretch">
            {/* Summary Stats */}
            <HStack spacing={6}>
              <Box>
                <Text fontSize="sm" color="text.secondary" mb={1}>
                  Total Value
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="text.primary">
                  {formatCurrency(category.currentValue)}
                </Text>
              </Box>
              <Box>
                <Text fontSize="sm" color="text.secondary" mb={1}>
                  % of Portfolio
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="text.primary">
                  {category.currentPercentage}%
                </Text>
              </Box>
              <Box>
                <Text fontSize="sm" color="text.secondary" mb={1}>
                  Target
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="text.secondary">
                  {category.targetPercentage}%
                </Text>
              </Box>
              <Box>
                <Text fontSize="sm" color="text.secondary" mb={1}>
                  Monthly Change
                </Text>
                <HStack spacing={1} color={category.currentValue >= category.previousValue ? 'success.500' : 'error.500'}>
                  {category.currentValue >= category.previousValue ? <FiTrendingUp /> : <FiTrendingDown />}
                  <Text fontSize="xl" fontWeight="bold">
                    {formatCurrency(Math.abs(category.currentValue - category.previousValue))}
                  </Text>
                </HStack>
              </Box>
            </HStack>

            {/* Composition Pie Chart */}
            <Box>
              <Text fontSize="md" fontWeight="bold" color="text.primary" mb={4}>
                Category Composition
              </Text>
              <Box display="flex" justifyContent="center">
                <Box w="400px" h="300px">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="currentValue"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={colors[index]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            </Box>

            {/* Assets Table */}
            <Box>
              <Text fontSize="md" fontWeight="bold" color="text.primary" mb={4}>
                Assets in {category.categoryName}
              </Text>
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Asset Name</Th>
                      <Th>Ticker</Th>
                      <Th isNumeric>Quantity</Th>
                      <Th isNumeric>Current Value</Th>
                      <Th isNumeric>Monthly Δ</Th>
                      <Th isNumeric>% of Category</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {category.assets.map((asset, index) => {
                      const valueChange = asset.currentValue - asset.previousValue;
                      const percentOfCategory = (asset.currentValue / totalCategoryValue) * 100;
                      const isPositive = valueChange >= 0;

                      return (
                        <Tr key={asset.id}>
                          <Td>
                            <HStack spacing={2}>
                              <Box w="8px" h="8px" borderRadius="sm" bg={colors[index]} />
                              <Text color="text.primary" fontWeight="medium">
                                {asset.name}
                              </Text>
                            </HStack>
                          </Td>
                          <Td>
                            {asset.ticker ? (
                              <Badge colorScheme="blue" variant="subtle">
                                {asset.ticker}
                              </Badge>
                            ) : (
                              <Text color="text.secondary" fontSize="xs">-</Text>
                            )}
                          </Td>
                          <Td isNumeric>
                            <Text color="text.secondary" fontSize="sm">
                              {asset.quantity ? asset.quantity.toLocaleString() : '-'}
                            </Text>
                          </Td>
                          <Td isNumeric>
                            <Text color="text.primary" fontWeight="medium">
                              {formatCurrency(asset.currentValue)}
                            </Text>
                          </Td>
                          <Td isNumeric>
                            <HStack justify="flex-end" spacing={1} color={isPositive ? 'success.500' : 'error.500'}>
                              {isPositive ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
                              <Text fontSize="sm" fontWeight="medium">
                                {isPositive ? '+' : ''}{formatCurrency(Math.abs(valueChange))}
                              </Text>
                            </HStack>
                          </Td>
                          <Td isNumeric>
                            <Text color="text.primary" fontSize="sm">
                              {percentOfCategory.toFixed(1)}%
                            </Text>
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </Box>
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
