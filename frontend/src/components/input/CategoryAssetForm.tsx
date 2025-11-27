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
  Input,
  Textarea,
} from '@chakra-ui/react';
import { FiSave, FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
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

interface CategoryAssetFormProps {
  categoryCode: string;
  categoryName: string;
  assets: Asset[];
  onSave: (assetId: string, value: number, notes?: string) => void;
  onAdd: (category: string, name: string, ticker?: string) => void;
  onDelete: (assetId: string) => void;
  requiresTicker?: boolean;
}

export default function CategoryAssetForm({
  categoryCode,
  categoryName,
  assets,
  onSave,
  onAdd,
  onDelete,
  requiresTicker = false,
}: CategoryAssetFormProps) {
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editNotes, setEditNotes] = useState('');
  
  const [newName, setNewName] = useState('');
  const [newTicker, setNewTicker] = useState('');

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setEditValue(asset.currentValue?.toString() || '');
    setEditNotes(asset.notes || '');
    onEditOpen();
  };

  const handleSaveEdit = () => {
    if (editingAsset && editValue) {
      onSave(editingAsset.id, parseFloat(editValue), editNotes);
      onEditClose();
      setEditingAsset(null);
      setEditValue('');
      setEditNotes('');
    }
  };

  const handleAdd = () => {
    if (newName) {
      onAdd(categoryCode, newName, newTicker || undefined);
      onAddClose();
      setNewName('');
      setNewTicker('');
    }
  };

  const totalValue = assets.reduce((sum, a) => sum + (a.currentValue || 0), 0);

  return (
    <Box>
      <HStack justify="space-between" mb={4}>
        <VStack align="start" spacing={0}>
          <Heading size="sm" color="text.primary">
            {categoryName}
          </Heading>
          <Text fontSize="xs" color="text.secondary">
            {assets.length} asset{assets.length !== 1 ? 's' : ''} • Total: {formatCurrency(totalValue)}
          </Text>
        </VStack>
        <Button
          leftIcon={<FiPlus />}
          size="sm"
          colorScheme="blue"
          variant="ghost"
          onClick={onAddOpen}
        >
          Add Asset
        </Button>
      </HStack>

      <Box overflowX="auto">
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Asset Name</Th>
              {requiresTicker && <Th>Ticker</Th>}
              <Th isNumeric>Value</Th>
              <Th>Notes</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {assets.map((asset) => (
              <Tr key={asset.id}>
                <Td>
                  <Text color="text.primary" fontWeight="medium">
                    {asset.name}
                  </Text>
                </Td>
                {requiresTicker && (
                  <Td>
                    {asset.ticker ? (
                      <Badge colorScheme="blue" variant="subtle">
                        {asset.ticker}
                      </Badge>
                    ) : (
                      <Text color="text.secondary" fontSize="xs">-</Text>
                    )}
                  </Td>
                )}
                <Td isNumeric>
                  <Text 
                    color={asset.currentValue ? "text.primary" : "text.tertiary"} 
                    fontWeight={asset.currentValue ? "medium" : "normal"}
                  >
                    {asset.currentValue ? formatCurrency(asset.currentValue) : 'Not set'}
                  </Text>
                </Td>
                <Td>
                  <Text color="text.secondary" fontSize="xs" noOfLines={1} maxW="200px">
                    {asset.notes || '-'}
                  </Text>
                </Td>
                <Td>
                  <HStack spacing={1}>
                    <IconButton
                      aria-label="Edit"
                      icon={<FiEdit2 />}
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(asset)}
                    />
                    <IconButton
                      aria-label="Delete"
                      icon={<FiTrash2 />}
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => onDelete(asset.id)}
                    />
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Edit Value Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose}>
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
                  color="text.primary"
                  borderColor="whiteAlpha.200"
                  _hover={{ borderColor: 'whiteAlpha.300' }}
                  _focus={{ borderColor: 'brand.500' }}
                />
              </FormControl>

              <FormControl>
                <FormLabel color="text.secondary">Notes (optional)</FormLabel>
                <Textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Add notes"
                  rows={3}
                  bg="background.tertiary"
                  color="text.primary"
                  borderColor="whiteAlpha.200"
                  _hover={{ borderColor: 'whiteAlpha.300' }}
                  _focus={{ borderColor: 'brand.500' }}
                />
              </FormControl>

              <HStack spacing={3} w="full" justify="flex-end">
                <Button variant="ghost" onClick={onEditClose}>
                  Cancel
                </Button>
                <Button
                  colorScheme="blue"
                  leftIcon={<FiSave />}
                  onClick={handleSaveEdit}
                  isDisabled={!editValue}
                >
                  Save
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Add Asset Modal */}
      <Modal isOpen={isAddOpen} onClose={onAddClose}>
        <ModalOverlay />
        <ModalContent bg="background.secondary">
          <ModalHeader color="text.primary">
            Add Asset to {categoryName}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel color="text.secondary">Asset Name</FormLabel>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter asset name"
                  bg="background.tertiary"
                  color="text.primary"
                  borderColor="whiteAlpha.200"
                  _hover={{ borderColor: 'whiteAlpha.300' }}
                  _focus={{ borderColor: 'brand.500' }}
                />
              </FormControl>

              {requiresTicker && (
                <FormControl>
                  <FormLabel color="text.secondary">Ticker (optional)</FormLabel>
                  <Input
                    value={newTicker}
                    onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
                    placeholder="e.g., AAPL"
                    bg="background.tertiary"
                    color="text.primary"
                    borderColor="whiteAlpha.200"
                    _hover={{ borderColor: 'whiteAlpha.300' }}
                    _focus={{ borderColor: 'brand.500' }}
                  />
                </FormControl>
              )}

              <HStack spacing={3} w="full" justify="flex-end">
                <Button variant="ghost" onClick={onAddClose}>
                  Cancel
                </Button>
                <Button
                  colorScheme="blue"
                  leftIcon={<FiPlus />}
                  onClick={handleAdd}
                  isDisabled={!newName}
                >
                  Add
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
