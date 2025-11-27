'use client';

import { Box, Heading, HStack, Badge } from '@chakra-ui/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from '@/utils/formatters';

interface CombinedChartData {
  month: string;
  actual?: number;
  projected?: number;
}

interface CombinedNetWorthChartProps {
  historicalData: Array<{ month: string; value: number }>;
  projectionData: Array<{ month: string; actual?: number; projected: number }>;
}

export default function CombinedNetWorthChart({ historicalData, projectionData }: CombinedNetWorthChartProps) {
  // Combine historical and projection data
  const combinedData: CombinedChartData[] = [
    ...historicalData.map(item => ({
      month: item.month,
      actual: item.value,
      projected: undefined,
    })),
    ...projectionData.slice(1).map(item => ({
      month: item.month,
      actual: undefined,
      projected: item.projected,
    })),
  ];

  return (
    <Box>
      <HStack justify="space-between" mb={4}>
        <Heading size="md" color="text.primary">
          Net Worth Evolution & Projection
        </Heading>
        <Badge colorScheme="blue" variant="subtle">
          6-month forecast
        </Badge>
      </HStack>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={combinedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#252d3d" />
          <XAxis 
            dataKey="month" 
            stroke="#9aa0a6"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#9aa0a6"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1f2e',
              border: '1px solid #252d3d',
              borderRadius: '8px',
              color: '#e8eaed',
            }}
            formatter={(value: number) => formatCurrency(value)}
          />
          <Legend 
            wrapperStyle={{ color: '#9aa0a6' }}
          />
          <Line 
            type="monotone" 
            dataKey="actual" 
            stroke="#2196f3" 
            strokeWidth={3}
            dot={{ fill: '#2196f3', r: 5 }}
            activeDot={{ r: 7 }}
            name="Actual"
            connectNulls={false}
          />
          <Line 
            type="monotone" 
            dataKey="projected" 
            stroke="#10b981" 
            strokeWidth={3}
            strokeDasharray="5 5"
            dot={{ fill: '#10b981', r: 5 }}
            activeDot={{ r: 7 }}
            name="Projected"
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}
