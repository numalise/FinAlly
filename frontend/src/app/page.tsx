'use client';

import { Box, Button, Heading, Text, VStack } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <Box
      minH="100vh"
      bg="background.primary"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <VStack spacing={6} textAlign="center">
        <Heading size="2xl" color="brand.500">
          FinAlly
        </Heading>
        <Text fontSize="xl" color="text.secondary" maxW="md">
          Track your net worth, manage investments, and achieve your financial goals
        </Text>
        <Button
          size="lg"
          colorScheme="brand"
          onClick={() => router.push('/dashboard')}
        >
          Get Started
        </Button>
      </VStack>
    </Box>
  );
}
