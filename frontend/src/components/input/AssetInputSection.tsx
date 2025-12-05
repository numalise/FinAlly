'use client';

import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  IconButton,
  HStack,
  Text,
  Badge,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  FormControl,
  FormLabel,
  Textarea,
} from '@chakra-ui/react';
import { FiSave, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useState } from 'react';
import { formatCurrency } from '@/utils/formatters';

interface Asset {
  id: string;
  name: string;
  ticker?: string;
  category: string;
  categoryName: string;
  currentValue?: number;
  notes?: string;
}

interface AssetInputSectionProps {
  year: number;
  month: number;
  assets: Asset[];
  onSave: (assetId: string, value: number, notes?: string) => void;
}

export default function AssetInputSection({ year, month, assets, onSave }: AssetInputSectionProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setEditValue(asset.currentValue?.toString() || '');
    setEditNotes(asset.notes || '');
    onOpen();
  };

  const handleSave = () => {
    if (editingAsset && editValue) {
      onSave(editingAsset.id, parseFloat(editValue), editNotes);
      onClose();
      setEditingAsset(null);
      setEditValue('');
      setEditNotes('');
    }
  };

  // Group assets by category
  const groupedAssets = assets.reduce((acc, asset) => {
    if (!acc[asset.category]) {
      acc[asset.category] = {
        categoryName: asset.categoryName,
        assets: [],
      };
    }
    acc[asset.category].assets.push(asset);
    return acc;
  }, {} as Record<string, { categoryName: string; assets: Asset[] }>);

  return (
    <Box>
      <HStack justify="space-between" mb={4}>
        <Heading size="md" color="text.primary">
          Asset Values
        </Heading>
        <Text fontSize="sm" color="text.secondary">
          Enter snapshot values for {new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </Text>
      </HStack>

      <VStack spacing={6} align="stretch">
        {Object.entries(groupedAssets).map(([category, { categoryName, assets: categoryAssets }]) => (
          <Box key={category}>
            <Heading size="sm" mb={3} color="text.primary">
              {categoryName}
            </Heading>
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Asset Name</Th>
                    <Th>Ticker</Th>
                    <Th isNumeric>Current Value</Th>
                    <Th>Notes</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {categoryAssets.map((asset) => (
                    <Tr key={asset.id}>
                      <Td>
                        <Text color="text.primary" fontWeight="medium">
                          {asset.name}
                        </Text>
                      </Td>
                      <Td>
                        {asset.ticker ? (
                          <Badge colorScheme="blue" variant="subtle">
                            {asset.ticker}
                          </Badge>
                        ) : (
                          <Text color="text.secondary" fontSize="xs">-</Text>
                        )}
                      </Td>
                      <Td isNumeric>
                        <Text color="text.primary" fontWeight="medium">
                          {asset.currentValue ? formatCurrency(asset.currentValue) : '-'}
                        </Text>
                      </Td>
                      <Td>
                        <Text color="text.secondary" fontSize="xs" noOfLines={1}>
                          {asset.notes || '-'}
                        </Text>
                      </Td>
                      <Td>
                        <IconButton
                          aria-label="Edit value"
                          icon={<FiEdit2 />}
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(asset)}
                        />
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </Box>
        ))}
      </VStack>

      {/* Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg="background.secondary">
          <ModalHeader color="text.primary">
            Edit {editingAsset?.name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel color="text.secondary">Value (€)</FormLabel>
                <Input
                  type="number"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder="Enter value"
                  step="0.01"
                  bg="background.tertiary"
                />
              </FormControl>

              <FormControl>
                <FormLabel color="text.secondary">Notes (optional)</FormLabel>
                <Textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Add notes about this entry"
                  rows={3}
                  bg="background.tertiary"
                />
              </FormControl>

              <HStack spacing={3} w="full" justify="flex-end">
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  colorScheme="blue"
                  leftIcon={<FiSave />}
                  onClick={handleSave}
                  isDisabled={!editValue}
                >
                  Save
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
