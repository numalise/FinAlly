'use client';

import {
  Box,
  Heading,
  VStack,
  Text,
  Card,
  CardBody,
  SimpleGrid,
  FormControl,
  FormLabel,
  Input,
  Button,
  HStack,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { FiSave, FiDownload } from 'react-icons/fi';
import { useState, useEffect, useMemo } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { useUser, useUpdateUser } from '@/hooks/api/useUser';
import { useCategoryTargets, useUpdateCategoryTarget } from '@/hooks/api/useAllocation';
import { api } from '@/lib/api';

export default function SettingsPage() {
  const toast = useToast();

  // Fetch user data
  const { data: userData, isLoading: userLoading } = useUser();
  const updateUserMutation = useUpdateUser();

  // Fetch category targets
  const { data: targetsData, isLoading: targetsLoading } = useCategoryTargets();
  const updateTarget = useUpdateCategoryTarget();

  // User Profile State
  const [fullName, setFullName] = useState('');
  const [displayName, setDisplayName] = useState('');

  // Category Targets State
  const [targets, setTargets] = useState<
    Array<{ category: string; name: string; target: number }>
  >([]);

  // Populate form when data loads
  useEffect(() => {
    if (userData?.data) {
      setFullName(userData.data.full_name || '');
      setDisplayName(userData.data.displayName || '');
    }
  }, [userData]);

  useEffect(() => {
    if (targetsData?.data) {
      const categoryNames: Record<string, string> = {
        SINGLE_STOCKS: 'Single Stocks',
        ETF_STOCKS: 'ETF Stocks',
        ETF_BONDS: 'ETF Bonds',
        CRYPTO: 'Crypto',
        PRIVATE_EQUITY: 'Private Equity',
        BUSINESS_PROFITS: 'Business Profits',
        REAL_ESTATE: 'Real Estate',
        CASH: 'Cash Liquidity',
      };

      const formattedTargets = targetsData.data.map((t: any) => ({
        category: t.category,
        name: categoryNames[t.category] || t.category,
        target: t.target_pct,
      }));
      setTargets(formattedTargets);
    }
  }, [targetsData]);

  const handleSaveProfile = async () => {
    try {
      await updateUserMutation.mutateAsync({
        full_name: fullName,
        displayName: displayName,
      });
      toast({
        title: 'Profile updated',
        description: 'Your profile information has been saved.',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Failed to update profile',
        description: error.message || 'An error occurred',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const handleUpdateTarget = (category: string, value: number) => {
    setTargets((prev) =>
      prev.map((t) => (t.category === category ? { ...t, target: value } : t))
    );
  };

  const handleSaveTargets = async () => {
    try {
      // Update all targets
      await Promise.all(
        targets.map((t) =>
          updateTarget.mutateAsync({
            category: t.category,
            targetPct: t.target,
          })
        )
      );
      toast({
        title: 'Allocation targets updated',
        description: 'Your category targets have been saved.',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Failed to update targets',
        description: error.message || 'An error occurred',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const handleExportData = async () => {
    try {
      const response = await api.exportData();
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: 'application/json',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `finally-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Export complete',
        description: 'Your data has been downloaded.',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Export failed',
        description: error.message || 'An error occurred',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const totalTarget = useMemo(
    () => targets.reduce((sum, t) => sum + t.target, 0),
    [targets]
  );
  const isValidTargets = Math.abs(totalTarget - 100) < 0.01; // Allow small floating point differences

  if (userLoading || targetsLoading) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <Center h="400px">
            <Spinner size="xl" color="brand.500" />
          </Center>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <VStack spacing={8} align="stretch">
          <Box>
            <Heading size="lg" mb={2} color="text.primary">
              Settings
            </Heading>
            <Text color="text.secondary">
              Manage your account and allocation targets
            </Text>
          </Box>

          {/* User Profile */}
          <Card bg="background.secondary" border="none">
            <CardBody>
              <VStack spacing={6} align="stretch">
                <Heading size="md" color="text.primary">
                  User Profile
                </Heading>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl>
                    <FormLabel color="text.secondary">Full Name</FormLabel>
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      bg="background.tertiary"
                      color="text.primary"
                      border="none"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel color="text.secondary">Display Name</FormLabel>
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      bg="background.tertiary"
                      color="text.primary"
                      border="none"
                    />
                  </FormControl>
                </SimpleGrid>

                <HStack justify="flex-end">
                  <Button
                    leftIcon={<FiSave />}
                    colorScheme="blue"
                    onClick={handleSaveProfile}
                    isLoading={updateUserMutation.isPending}
                  >
                    Save Profile
                  </Button>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Allocation Targets */}
          <Card bg="background.secondary" border="none">
            <CardBody>
              <VStack spacing={6} align="stretch">
                <HStack justify="space-between">
                  <Heading size="md" color="text.primary">
                    Category Allocation Targets
                  </Heading>
                  <Text
                    fontSize="sm"
                    color={isValidTargets ? 'success.500' : 'error.500'}
                    fontWeight="bold"
                  >
                    Total: {totalTarget.toFixed(1)}%{' '}
                    {isValidTargets ? '✓' : '(must equal 100%)'}
                  </Text>
                </HStack>

                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th border="none">Category</Th>
                      <Th border="none" isNumeric>
                        Target %
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {targets.map((target) => (
                      <Tr key={target.category}>
                        <Td border="none">
                          <Text color="text.primary" fontWeight="medium">
                            {target.name}
                          </Text>
                        </Td>
                        <Td border="none" isNumeric>
                          <HStack justify="flex-end" spacing={2}>
                            <Input
                              type="number"
                              value={target.target}
                              onChange={(e) =>
                                handleUpdateTarget(
                                  target.category,
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              step="0.1"
                              min="0"
                              max="100"
                              w="80px"
                              size="sm"
                              bg="background.tertiary"
                              color="text.primary"
                              border="none"
                              textAlign="right"
                            />
                            <Text color="text.secondary">%</Text>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>

                <HStack justify="flex-end">
                  <Button
                    leftIcon={<FiSave />}
                    colorScheme="blue"
                    onClick={handleSaveTargets}
                    isDisabled={!isValidTargets}
                    isLoading={updateTarget.isPending}
                  >
                    Save Targets
                  </Button>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Data Management */}
          <Card bg="background.secondary" border="none">
            <CardBody>
              <VStack spacing={6} align="stretch">
                <Heading size="md" color="text.primary">
                  Data Management
                </Heading>

                <VStack spacing={4} align="stretch">
                  <HStack
                    justify="space-between"
                    p={4}
                    bg="background.tertiary"
                    borderRadius="md"
                  >
                    <Box>
                      <Text color="text.primary" fontWeight="medium">
                        Export Your Data
                      </Text>
                      <Text fontSize="sm" color="text.secondary">
                        Download all your financial data as JSON
                      </Text>
                    </Box>
                    <Button
                      leftIcon={<FiDownload />}
                      colorScheme="blue"
                      variant="ghost"
                      onClick={handleExportData}
                    >
                      Export
                    </Button>
                  </HStack>

                  <HStack
                    justify="space-between"
                    p={4}
                    bg="background.tertiary"
                    borderRadius="md"
                  >
                    <Box>
                      <Text color="text.primary" fontWeight="medium">
                        API Access
                      </Text>
                      <Text fontSize="sm" color="text.secondary">
                        Status: Connected to Lambda API
                      </Text>
                    </Box>
                    <Text fontSize="sm" color="success.500" fontWeight="medium">
                      Active
                    </Text>
                  </HStack>
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </MainLayout>
    </ProtectedRoute>
  );
}
