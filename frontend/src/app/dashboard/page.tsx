'use client';

import { Box, Heading, Text, SimpleGrid, Card, CardBody, Stat, StatLabel, StatNumber, StatHelpText } from '@chakra-ui/react';
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
                <StatNumber>€125,430</StatNumber>
                <StatHelpText color="success.500">+4.2% this month</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel color="text.secondary">Monthly Change</StatLabel>
                <StatNumber>+€5,240</StatNumber>
                <StatHelpText color="success.500">Above average</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel color="text.secondary">Savings Rate</StatLabel>
                <StatNumber>32%</StatNumber>
                <StatHelpText>Target: 30%</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel color="text.secondary">Assets</StatLabel>
                <StatNumber>12</StatNumber>
                <StatHelpText>Across 5 categories</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        <Text color="text.secondary">
          More dashboard components coming in Step 5.2...
        </Text>
      </Box>
    </MainLayout>
  );
}
