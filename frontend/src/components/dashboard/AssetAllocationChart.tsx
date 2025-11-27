'use client';

import { Box, Heading, VStack, HStack, Text, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '@/utils/formatters';

interface AssetData {
  category: string;
  value: number;
  percentage: number;
  target: number;
  targetPercentage: number;
}

interface AssetAllocationProps {
  data: AssetData[];
}

const BLUE_PALETTE = [
  '#2196f3',
  '#1e88e5',
  '#1976d2',
  '#1565c0',
  '#0d47a1',
];

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
          {data.category}: {formatCurrency(data.value)}
        </Text>
      </Box>
    );
  }
  return null;
};

export default function AssetAllocationChart({ data }: AssetAllocationProps) {
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Box>
      <Heading size="md" mb={6} color="text.primary">
        Asset Allocation
      </Heading>
      
      <VStack spacing={8}>
        {/* Centered Pie Chart */}
        <Box w="full" display="flex" justifyContent="center">
          <Box w={{ base: '100%', md: '500px' }} h="400px">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={140}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ percentage }) => `${percentage}%`}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={BLUE_PALETTE[index % BLUE_PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Box>

        {/* Detailed Table with Value Deltas */}
        <Box w="full" overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Category</Th>
                <Th isNumeric>Current Value</Th>
                <Th isNumeric>Current %</Th>
                <Th isNumeric>Target Value</Th>
                <Th isNumeric>Target %</Th>
                <Th isNumeric>Delta</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.map((item, index) => {
                const deltaPercent = item.percentage - item.targetPercentage;
                const deltaValue = item.value - item.target;
                const deltaColor = Math.abs(deltaPercent) < 1 
                  ? 'text.secondary' 
                  : deltaPercent > 0 
                    ? 'success.500' 
                    : 'warning.500';

                return (
                  <Tr key={item.category}>
                    <Td>
                      <HStack spacing={2}>
                        <Box w="12px" h="12px" borderRadius="sm" bg={BLUE_PALETTE[index]} />
                        <Text color="text.primary" fontWeight="medium">
                          {item.category}
                        </Text>
                      </HStack>
                    </Td>
                    <Td isNumeric>
                      <Text color="text.primary" fontWeight="medium">
                        {formatCurrency(item.value)}
                      </Text>
                    </Td>
                    <Td isNumeric>
                      <Text color="text.primary">
                        {item.percentage}%
                      </Text>
                    </Td>
                    <Td isNumeric>
                      <Text color="text.secondary">
                        {formatCurrency(item.target)}
                      </Text>
                    </Td>
                    <Td isNumeric>
                      <Text color="text.secondary">
                        {item.targetPercentage}%
                      </Text>
                    </Td>
                    <Td isNumeric>
                      <VStack spacing={0} align="end">
                        <Text color={deltaColor} fontWeight="medium" fontSize="sm">
                          {deltaPercent > 0 ? '+' : ''}{deltaPercent.toFixed(1)}%
                        </Text>
                        <Text color={deltaColor} fontSize="xs">
                          {deltaValue > 0 ? '+' : ''}{formatCurrency(Math.abs(deltaValue))}
                        </Text>
                      </VStack>
                    </Td>
                  </Tr>
                );
              })}
              <Tr fontWeight="bold" borderTop="2px solid" borderColor="whiteAlpha.200">
                <Td>
                  <Text color="text.primary">Total</Text>
                </Td>
                <Td isNumeric>
                  <Text color="text.primary">
                    {formatCurrency(totalValue)}
                  </Text>
                </Td>
                <Td isNumeric>
                  <Text color="text.primary">100%</Text>
                </Td>
                <Td isNumeric>
                  <Text color="text.secondary">
                    {formatCurrency(totalValue)}
                  </Text>
                </Td>
                <Td isNumeric>
                  <Text color="text.secondary">100%</Text>
                </Td>
                <Td isNumeric>
                  <Text color="text.secondary">-</Text>
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </Box>
      </VStack>
    </Box>
  );
}
