'use client';

import { Box, Heading, HStack, Badge } from '@chakra-ui/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from '@/utils/formatters';

interface ProjectionChartProps {
  data: Array<{ month: string; actual?: number; projected: number }>;
}

export default function ProjectionChart({ data }: ProjectionChartProps) {
  return (
    <Box>
      <HStack justify="space-between" mb={4}>
        <Heading size="md" color="text.primary">
          6-Month Projection
        </Heading>
        <Badge colorScheme="blue" variant="subtle">
          Based on 3-month average
        </Badge>
      </HStack>
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
            formatter={(value: number) => formatCurrency(value)}
          />
          <Legend 
            wrapperStyle={{ color: '#9aa0a6' }}
          />
          <Line 
            type="monotone" 
            dataKey="actual" 
            stroke="#2196f3" 
            strokeWidth={2}
            dot={{ fill: '#2196f3', r: 4 }}
            name="Actual"
          />
          <Line 
            type="monotone" 
            dataKey="projected" 
            stroke="#10b981" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: '#10b981', r: 4 }}
            name="Projected"
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}
