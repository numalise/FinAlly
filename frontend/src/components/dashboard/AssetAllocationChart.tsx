'use client';

import { Box, Heading, VStack, HStack, Text } from '@chakra-ui/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '@/utils/formatters';

interface AssetAllocationProps {
  data: Array<{ category: string; value: number; percentage: number }>;
}

// Blue gradient palette - professional single-color scheme
const BLUE_PALETTE = [
  '#2196f3', // Bright blue
  '#1e88e5', // Medium blue
  '#1976d2', // Deep blue
  '#1565c0', // Darker blue
  '#0d47a1', // Darkest blue
];

export default function AssetAllocationChart({ data }: AssetAllocationProps) {
  return (
    <Box>
      <Heading size="md" mb={4} color="text.primary">
        Asset Allocation
      </Heading>
      
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ percentage }) => `${percentage}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={BLUE_PALETTE[index % BLUE_PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1f2e',
              border: '1px solid #252d3d',
              borderRadius: '8px',
              color: '#e8eaed',
            }}
            formatter={(value: number) => formatCurrency(value)}
          />
        </PieChart>
      </ResponsiveContainer>

      <VStack align="stretch" spacing={2} mt={4}>
        {data.map((item, index) => (
          <HStack key={item.category} justify="space-between">
            <HStack spacing={2}>
              <Box w="12px" h="12px" borderRadius="sm" bg={BLUE_PALETTE[index]} />
              <Text fontSize="sm" color="text.secondary">
                {item.category}
              </Text>
            </HStack>
            <HStack spacing={4}>
              <Text fontSize="sm" color="text.primary" fontWeight="medium">
                {formatCurrency(item.value)}
              </Text>
              <Text fontSize="sm" color="text.secondary">
                {item.percentage}%
              </Text>
            </HStack>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
}
