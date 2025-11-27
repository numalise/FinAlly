'use client';

import { Box, Heading } from '@chakra-ui/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/utils/formatters';

interface NetWorthChartProps {
  data: Array<{ month: string; value: number }>;
}

export default function NetWorthChart({ data }: NetWorthChartProps) {
  return (
    <Box>
      <Heading size="md" mb={4} color="text.primary">
        Net Worth Evolution
      </Heading>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
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
            formatter={(value: number) => [formatCurrency(value), 'Net Worth']}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#2196f3" 
            strokeWidth={2}
            dot={{ fill: '#2196f3', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}
