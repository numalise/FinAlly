'use client';

import { useState } from 'react';
import {
  Box,
  Heading,
  VStack,
  Card,
  CardBody,
  Text,
  HStack,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useToast,
  Spinner,
  Center,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import { FiTrash2 } from 'react-icons/fi';
import { useRef } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import MonthSelector from '@/components/input/MonthSelector';
import CategoryAssetForm from '@/components/input/CategoryAssetForm';
import { formatCurrency } from '@/utils/formatters';
import { useAssetManagement } from '@/hooks/useAssetManagement';
import { useDeleteAllAssets } from '@/hooks/api/useAssets';

export default function InputPage() {
  const toast = useToast();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const { isOpen: isDeleteAllOpen, onOpen: onDeleteAllOpen, onClose: onDeleteAllClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Use centralized asset management hook
  const assetManagement = useAssetManagement(year, month);

  // Delete all assets mutation
  const deleteAllAssets = useDeleteAllAssets();

  if (assetManagement.isLoading) {
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

  // Asset handlers with toast notifications
  const handleSaveAsset = async (assetId: string, value: number, notes?: string) => {
    try {
      await assetManagement.handleSaveAsset(assetId, value, notes);
      toast({ title: 'Asset value saved', status: 'success', duration: 2000 });
    } catch (error) {
      toast({ title: 'Failed to save', status: 'error', duration: 3000 });
    }
  };

  const handleEditAsset = async (assetId: string, name: string, ticker?: string, marketCap?: number) => {
    try {
      await assetManagement.handleEditAsset(assetId, name, ticker, marketCap);
      toast({ title: 'Asset updated', status: 'success', duration: 2000 });
    } catch (error) {
      toast({ title: 'Failed to update', status: 'error', duration: 3000 });
    }
  };

  const handleAddAsset = async (category: string, name: string, ticker?: string, marketCap?: number) => {
    try {
      await assetManagement.handleAddAsset(category, name, ticker, marketCap);
      toast({ title: 'Asset created', status: 'success', duration: 2000 });
    } catch (error) {
      toast({ title: 'Failed to create', status: 'error', duration: 3000 });
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    try {
      await assetManagement.handleDeleteAsset(assetId);
      toast({ title: 'Asset deleted', status: 'success', duration: 2000 });
    } catch (error) {
      toast({ title: 'Failed to delete', status: 'error', duration: 3000 });
    }
  };

  const handleDeleteAll = async () => {
    try {
      await deleteAllAssets.mutateAsync();
      toast({
        title: 'All assets deleted',
        description: 'All your assets and related data have been removed',
        status: 'success',
        duration: 3000
      });
      onDeleteAllClose();
    } catch (error) {
      toast({
        title: 'Failed to delete all assets',
        description: 'Please try again',
        status: 'error',
        duration: 3000
      });
    }
  };


  return (
    <ProtectedRoute>
      <MainLayout>
        <VStack spacing={8} align="stretch">
          <HStack justify="space-between" align="start">
            <Box>
              <Heading size="lg" color="text.primary" mb={2}>Monthly Input</Heading>
              <Text color="text.secondary">Enter your asset values for the selected month</Text>
            </Box>
            <HStack spacing={3}>
              {assetManagement.totalAssets > 0 && (
                <Button
                  leftIcon={<FiTrash2 />}
                  colorScheme="red"
                  variant="outline"
                  size="sm"
                  onClick={onDeleteAllOpen}
                >
                  Delete All Assets
                </Button>
              )}
              <MonthSelector year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); }} />
            </HStack>
          </HStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel color="text.secondary">Total Assets Value</StatLabel>
                  <StatNumber color="text.primary" fontSize="xl">
                    {formatCurrency(assetManagement.totalValue)}
                  </StatNumber>
                  <StatHelpText color="text.secondary">
                    {assetManagement.countWithValues} / {assetManagement.totalAssets} entered
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel color="text.secondary">Completion Rate</StatLabel>
                  <StatNumber color="brand.500" fontSize="xl">
                    {assetManagement.completionRate.toFixed(0)}%
                  </StatNumber>
                  <StatHelpText color="text.secondary">
                    Assets with values
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel color="text.secondary">Categories</StatLabel>
                  <StatNumber color="text.primary" fontSize="xl">
                    {assetManagement.categoryMetadata.length}
                  </StatNumber>
                  <StatHelpText color="text.secondary">
                    Asset categories
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          <Box>
            <Heading size="md" mb={4} color="text.primary">Asset Categories</Heading>
            <Text fontSize="sm" color="text.secondary" mb={4}>
              Click on a category to expand and manage your assets
            </Text>

            <Accordion allowMultiple>
              {assetManagement.categoryMetadata.map(({ code, name, requiresTicker }) => {
                const categoryAssets = assetManagement.assetsByCategory[code];
                const categoryTotal = categoryAssets.reduce((sum, a) => sum + (a.currentValue || 0), 0);
                const hasAssets = categoryAssets.length > 0;

                return (
                  <AccordionItem key={code} border="none" mb={2}>
                    <Card>
                      <AccordionButton
                        _hover={{ bg: 'background.tertiary' }}
                        borderRadius="lg"
                        py={4}
                      >
                        <Box flex="1" textAlign="left">
                          <HStack justify="space-between">
                            <VStack align="start" spacing={0}>
                              <Text fontSize="lg" fontWeight="bold" color="text.primary">
                                {name}
                              </Text>
                              <Text fontSize="sm" color="text.secondary">
                                {categoryAssets.length} asset{categoryAssets.length !== 1 ? 's' : ''}
                              </Text>
                            </VStack>
                            <VStack align="end" spacing={0}>
                              <Text fontSize="md" fontWeight="bold" color={hasAssets ? 'brand.500' : 'text.secondary'}>
                                {formatCurrency(categoryTotal)}
                              </Text>
                              <Text fontSize="xs" color="text.tertiary">
                                Total value
                              </Text>
                            </VStack>
                          </HStack>
                        </Box>
                        <AccordionIcon color="text.secondary" ml={4} />
                      </AccordionButton>

                      <AccordionPanel pb={4}>
                        <CategoryAssetForm
                          categoryCode={code}
                          categoryName={name}
                          assets={categoryAssets}
                          onSave={handleSaveAsset}
                          onEditAsset={handleEditAsset}
                          onAdd={handleAddAsset}
                          onDelete={handleDeleteAsset}
                          requiresTicker={requiresTicker}
                        />
                      </AccordionPanel>
                    </Card>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </Box>

          {/* Delete All Confirmation Dialog */}
          <AlertDialog
            isOpen={isDeleteAllOpen}
            leastDestructiveRef={cancelRef}
            onClose={onDeleteAllClose}
          >
            <AlertDialogOverlay>
              <AlertDialogContent bg="background.secondary">
                <AlertDialogHeader fontSize="lg" fontWeight="bold" color="text.primary">
                  Delete All Assets
                </AlertDialogHeader>

                <AlertDialogBody color="text.secondary">
                  Are you sure you want to delete all {assetManagement.totalAssets} assets?
                  This will permanently remove all assets and their historical input data.
                  This action cannot be undone.
                </AlertDialogBody>

                <AlertDialogFooter>
                  <Button ref={cancelRef} onClick={onDeleteAllClose}>
                    Cancel
                  </Button>
                  <Button
                    colorScheme="red"
                    onClick={handleDeleteAll}
                    ml={3}
                    isLoading={deleteAllAssets.isPending}
                  >
                    Delete All
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogOverlay>
          </AlertDialog>
        </VStack>
      </MainLayout>
    </ProtectedRoute>
  );
}
