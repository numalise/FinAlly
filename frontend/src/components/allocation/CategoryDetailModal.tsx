'use client';

import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Button,
} from '@chakra-ui/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { FiEdit2, FiPlus, FiMinus } from 'react-icons/fi';
import { CategoryAllocation } from '@/types/allocation';
import { formatCurrency } from '@/utils/formatters';
import { useState } from 'react';

interface CategoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: CategoryAllocation | null;
  onUpdateTarget?: (category: string, targetPct: number) => void;
}

const generateShades = (baseColor: string, count: number): string[] => {
  const shades: string[] = [];
  const baseHex = baseColor.replace('#', '');
  const r = parseInt(baseHex.substr(0, 2), 16);
  const g = parseInt(baseHex.substr(2, 2), 16);
  const b = parseInt(baseHex.substr(4, 2), 16);

  for (let i = 0; i < count; i++) {
    const factor = 1 - (i * 0.15);
    const newR = Math.round(r * factor);
    const newG = Math.round(g * factor);
    const newB = Math.round(b * factor);
    shades.push(`rgb(${newR}, ${newG}, ${newB})`);
  }
  return shades;
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <Box bg="#1a1f2e" border="none" borderRadius="md" p={3} shadow="lg">
        <Text fontWeight="bold" fontSize="md" color="white">
          {data.name}
        </Text>
        <Text fontSize="sm" color="white">
          {formatCurrency(data.currentValue)}
        </Text>
        <Text fontSize="xs" color="text.secondary">
          {data.totalCategoryValue > 0
            ? (((data.currentValue || 0) / data.totalCategoryValue) * 100).toFixed(1)
            : '0.0'}% of category
        </Text>
      </Box>
    );
  }
  return null;
};

export default function CategoryDetailModal({ isOpen, onClose, category, onUpdateTarget }: CategoryDetailModalProps) {
  const { isOpen: isEditTargetOpen, onOpen: onEditTargetOpen, onClose: onEditTargetClose } = useDisclosure();
  const [editTargetPct, setEditTargetPct] = useState('');

  if (!category) return null;

  const colors = generateShades(category.color, category.assets.length);
  const totalCategoryValue = category.currentValue;
  const totalMarketCap = category.assets
    .filter(a => a.marketCap)
    .reduce((sum, a) => sum + (a.marketCap || 0), 0);

  const pieData = category.assets.map((asset) => ({
    ...asset,
    totalCategoryValue,
  }));

  const isOverAllocated = category.delta > 0;
  const isUnderAllocated = category.delta < 0;
  const deltaColor = isOverAllocated ? 'orange.500' : isUnderAllocated ? 'blue.500' : 'text.secondary';
  const DeltaIcon = isOverAllocated ? FiMinus : FiPlus;

  const handleEditTarget = () => {
    setEditTargetPct((category?.targetPercentage || 0).toString());
    onEditTargetOpen();
  };

  const handleSaveTarget = () => {
    if (editTargetPct && onUpdateTarget) {
      onUpdateTarget(category.category, parseFloat(editTargetPct));
      onEditTargetClose();
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="4xl">
        <ModalOverlay bg="blackAlpha.800" />
        <ModalContent bg="background.secondary" maxW="1000px" border="none">
          <ModalHeader color="text.primary">
            <HStack spacing={3}>
              <Box w="4px" h="30px" bg={category.color} borderRadius="full" />
              <Text>{category.categoryName} Details</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={6} align="stretch">
              {/* Summary Stats */}
              <HStack spacing={6}>
                <Box>
                  <Text fontSize="sm" color="text.secondary" mb={1}>
                    Current Value
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color="text.primary">
                    {formatCurrency(category.currentValue || 0)}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="text.secondary" mb={1}>
                    Current %
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color="text.primary">
                    {(category.currentPercentage || 0).toFixed(1)}%
                  </Text>
                </Box>
                <Box>
                  <HStack>
                    <Text fontSize="sm" color="text.secondary" mb={1}>
                      Target
                    </Text>
                    <IconButton
                      aria-label="Edit target"
                      icon={<FiEdit2 />}
                      size="xs"
                      variant="ghost"
                      color="blue.400"
                      onClick={handleEditTarget}
                    />
                  </HStack>
                  <VStack align="start" spacing={0}>
                    <Text fontSize="2xl" fontWeight="bold" color="text.secondary">
                      {(category.targetPercentage || 0).toFixed(1)}%
                    </Text>
                    <Text fontSize="sm" color="text.secondary">
                      {formatCurrency(category.targetValue || 0)}
                    </Text>
                  </VStack>
                </Box>
                <Box>
                  <Text fontSize="sm" color="text.secondary" mb={1}>
                    Delta vs Target
                  </Text>
                  <HStack spacing={1} color={deltaColor}>
                    <DeltaIcon />
                    <VStack align="start" spacing={0}>
                      <Text fontSize="xl" fontWeight="bold">
                        {formatCurrency(Math.abs(category.delta))}
                      </Text>
                      <Text fontSize="xs">
                        {isOverAllocated ? 'Remove' : isUnderAllocated ? 'Add' : 'On Target'}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              </HStack>

              {/* Composition Pie Chart - NO LABELS */}
              <Box>
                <Text fontSize="md" fontWeight="bold" color="text.primary" mb={4}>
                  Category Composition
                </Text>
                <Box display="flex" justifyContent="center">
                  <Box w="400px" h="300px">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="currentValue"
                          stroke="none"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Box>
              </Box>

              {/* Assets Table */}
              <Box>
                <Text fontSize="md" fontWeight="bold" color="text.primary" mb={4}>
                  Assets in {category.categoryName}
                </Text>
                <Box overflowX="auto">
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th border="none">Asset Name</Th>
                        <Th border="none">Ticker</Th>
                        {category.hasMarketCapTargets && <Th border="none" isNumeric>Market Cap</Th>}
                        <Th border="none" isNumeric>Current Value</Th>
                        <Th border="none" isNumeric>% of Category</Th>
                        {category.hasMarketCapTargets && <Th border="none" isNumeric>Target %</Th>}
                        {category.hasMarketCapTargets && <Th border="none" isNumeric>Target Value</Th>}
                        {category.hasMarketCapTargets && <Th border="none" isNumeric>Delta</Th>}
                      </Tr>
                    </Thead>
                    <Tbody>
                      {category.assets.map((asset, index) => {
                        const percentOfCategory = totalCategoryValue > 0
                          ? ((asset.currentValue || 0) / totalCategoryValue) * 100
                          : 0;

                        let targetPct = 0;
                        let targetValue = 0;
                        let delta = 0;

                        if (category.hasMarketCapTargets && asset.marketCap && totalMarketCap > 0) {
                          targetPct = (asset.marketCap / totalMarketCap) * 100;
                          targetValue = (targetPct / 100) * totalCategoryValue;
                          delta = (asset.currentValue || 0) - targetValue;
                        }

                        const assetIsOver = delta > 0;
                        const assetIsUnder = delta < 0;
                        const assetDeltaColor = assetIsOver ? 'orange.500' : assetIsUnder ? 'blue.500' : 'text.secondary';

                        return (
                          <Tr key={asset.id}>
                            <Td border="none">
                              <HStack spacing={2}>
                                <Box w="8px" h="8px" borderRadius="sm" bg={colors[index]} />
                                <Text color="text.primary" fontWeight="medium">
                                  {asset.name}
                                </Text>
                              </HStack>
                            </Td>
                            <Td border="none">
                              {asset.ticker ? (
                                <Badge colorScheme="blue" variant="subtle">
                                  {asset.ticker}
                                </Badge>
                              ) : (
                                <Text color="text.secondary" fontSize="xs">-</Text>
                              )}
                            </Td>
                            {category.hasMarketCapTargets && (
                              <Td border="none" isNumeric>
                                <Text color="text.secondary" fontSize="xs">
                                  {asset.marketCap ? `$${((asset.marketCap || 0) / 1000000000).toFixed(1)}B` : '-'}
                                </Text>
                              </Td>
                            )}
                            <Td border="none" isNumeric>
                              <Text color="text.primary" fontWeight="medium">
                                {formatCurrency(asset.currentValue || 0)}
                              </Text>
                            </Td>
                            <Td border="none" isNumeric>
                              <Text color="text.primary" fontSize="sm">
                                {(percentOfCategory || 0).toFixed(1)}%
                              </Text>
                            </Td>
                            {category.hasMarketCapTargets && (
                              <>
                                <Td border="none" isNumeric>
                                  <Text color="text.secondary" fontSize="sm">
                                    {targetPct > 0 ? `${(targetPct || 0).toFixed(1)}%` : '-'}
                                  </Text>
                                </Td>
                                <Td border="none" isNumeric>
                                  <Text color="text.secondary" fontSize="sm">
                                    {targetValue > 0 ? formatCurrency(targetValue) : '-'}
                                  </Text>
                                </Td>
                                <Td border="none" isNumeric>
                                  {targetValue > 0 ? (
                                    <VStack spacing={0} align="end">
                                      <HStack spacing={1} color={assetDeltaColor}>
                                        {assetIsOver ? <FiMinus size={10} /> : assetIsUnder ? <FiPlus size={10} /> : null}
                                        <Text fontSize="sm" fontWeight="medium">
                                          {formatCurrency(Math.abs(delta))}
                                        </Text>
                                      </HStack>
                                      <Text fontSize="xs" color="text.tertiary">
                                        {assetIsOver ? 'Remove' : assetIsUnder ? 'Add' : 'OK'}
                                      </Text>
                                    </VStack>
                                  ) : (
                                    <Text color="text.secondary" fontSize="xs">-</Text>
                                  )}
                                </Td>
                              </>
                            )}
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                </Box>
              </Box>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Edit Target Modal */}
      <Modal isOpen={isEditTargetOpen} onClose={onEditTargetClose}>
        <ModalOverlay />
        <ModalContent bg="background.secondary" border="none">
          <ModalHeader color="text.primary">
            Edit Target: {category.categoryName}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel color="text.secondary">Target Percentage (%)</FormLabel>
                <Input
                  type="number"
                  value={editTargetPct}
                  onChange={(e) => setEditTargetPct(e.target.value)}
                  step="0.1"
                  min="0"
                  max="100"
                  bg="background.tertiary"
                  color="text.primary"
                  border="none"
                />
              </FormControl>

              <HStack spacing={3} w="full" justify="flex-end">
                <Button variant="ghost" onClick={onEditTargetClose}>
                  Cancel
                </Button>
                <Button colorScheme="blue" onClick={handleSaveTarget} isDisabled={!editTargetPct}>
                  Save
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
