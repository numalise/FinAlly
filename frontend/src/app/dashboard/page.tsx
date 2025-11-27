'use client';

import { Box, Heading, SimpleGrid, Card, CardBody, Stat, StatLabel, StatNumber, StatHelpText } from '@chakra-ui/react';
import MainLayout from '@/components/layout/MainLayout';

export default function DashboardPage() {
  return (
    <MainLayout>
      <Box>
        <Heading size="lg" mb={6}>Dashboard</Heading>
        
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel color="text.secondary">Net Worth</StatLabel>
                <StatNumber color="text.primary">€125,430</StatNumber>
                <StatHelpText color="success.500">+4.2% this month</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel color="text.secondary">Monthly Change</StatLabel>
                <StatNumber color="text.primary">+€5,240</StatNumber>
                <StatHelpText color="success.500">Above average</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel color="text.secondary">Savings Rate</StatLabel>
                <StatNumber color="text.primary">32%</StatNumber>
                <StatHelpText color="text.secondary">Target: 30%</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel color="text.secondary">Assets</StatLabel>
                <StatNumber color="text.primary">12</StatNumber>
                <StatHelpText color="text.secondary">Across 5 categories</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>
      </Box>
    </MainLayout>
  );
}
