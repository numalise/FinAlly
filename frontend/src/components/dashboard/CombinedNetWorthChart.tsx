'use client';

import { Box, Heading, Badge, HStack } from '@chakra-ui/react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatCurrency } from '@/utils/formatters';

interface NetWorthData {
  month: string;
  value: number;
}

interface ProjectionData {
  month: string;
  actual?: number;
  projected: number;
}

interface CombinedNetWorthChartProps {
  historicalData: NetWorthData[];
  projectionData: ProjectionData[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <Box
        bg="#1a1f2e"
        border="none"
        borderRadius="md"
        p={3}
        shadow="lg"
      >
        {payload.map((entry: any, index: number) => (
          <Box key={index}>
            <Box color={entry.color} fontWeight="bold" fontSize="sm">
              {entry.name}: {formatCurrency(entry.value)}
            </Box>
          </Box>
        ))}
      </Box>
    );
  }
  return null;
};

export default function CombinedNetWorthChart({
  historicalData,
  projectionData,
}: CombinedNetWorthChartProps) {
  const combinedData = [
    ...historicalData.slice(0, -1).map(d => ({ month: d.month, actual: d.value })),
    ...projectionData.map(d => ({ month: d.month, actual: d.actual, projected: d.projected })),
  ];

  return (
    <Box>
      <HStack justify="space-between" mb={4}>
        <Heading size="md" color="text.primary">
          Net Worth Evolution & 6-Month Projection
        </Heading>
        <Badge colorScheme="green" variant="subtle">
          6-month forecast
        </Badge>
      </HStack>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={combinedData}>
          <XAxis
            dataKey="month"
            stroke="#9aa0a6"
            style={{ fontSize: '12px' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            stroke="#9aa0a6"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ color: '#9aa0a6', paddingTop: '20px' }} />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#2196f3"
            strokeWidth={3}
            dot={{ fill: '#2196f3', r: 4 }}
            name="Actual"
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="projected"
            stroke="#4caf50"
            strokeWidth={3}
            strokeDasharray="5 5"
            dot={{ fill: '#4caf50', r: 4 }}
            name="Projected"
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}
