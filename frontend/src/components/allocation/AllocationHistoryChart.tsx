'use client';

import { Box, Heading } from '@chakra-ui/react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
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
    dataKey: string;
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
            tickFormatter={(value) => `${value}%`}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1f2e',
              border: 'none',
              borderRadius: '8px',
              color: '#e8eaed',
            }}
            formatter={(value: number) => `${value}%`}
          />
          <Legend wrapperStyle={{ color: '#9aa0a6', paddingTop: '20px' }} />
          {categories.map((cat) => (
            <Area
              key={cat.category}
              type="monotone"
              dataKey={cat.dataKey}
              stackId="1"
              stroke="none"
              fill={cat.color}
              name={cat.categoryName}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}
