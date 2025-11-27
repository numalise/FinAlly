'use client';

import { Box, Heading } from '@chakra-ui/react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { AllocationHistory } from '@/types/allocation';

interface AllocationHistoryChartProps {
  data: AllocationHistory[];
  categories: Array<{ 
    category: string; 
    categoryName: string; 
    color: string;
    dataKey: string; // Add explicit data key for chart
  }>;
}

export default function AllocationHistoryChart({ data, categories }: AllocationHistoryChartProps) {
  return (
    <Box>
      <Heading size="md" mb={4} color="text.primary">
        6-Month Allocation Trend
      </Heading>
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#252d3d" />
          <XAxis
            dataKey="month"
            stroke="#9aa0a6"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#9aa0a6"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1f2e',
              border: '1px solid #252d3d',
              borderRadius: '8px',
              color: '#e8eaed',
            }}
            formatter={(value: number) => `${value}%`}
          />
          <Legend wrapperStyle={{ color: '#9aa0a6' }} />
          {categories.map((cat) => (
            <Area
              key={cat.category}
              type="monotone"
              dataKey={cat.dataKey}
              stackId="1"
              stroke={cat.color}
              fill={cat.color}
              name={cat.categoryName}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}
