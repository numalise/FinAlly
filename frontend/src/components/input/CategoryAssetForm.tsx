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
  marketCap?: number;
}

interface CategoryAssetFormProps {
  categoryCode: string;
  categoryName: string;
  assets: Asset[];
  onSave: (assetId: string, value: number, notes?: string) => Promise<void>;
  onAdd: (category: string, name: string, ticker?: string, marketCap?: number) => Promise<any>;
  onDelete: (assetId: string) => Promise<void>;
  onEditAsset: (assetId: string, name: string, ticker?: string, marketCap?: number) => Promise<void>;
  requiresTicker?: boolean;
}

export default function CategoryAssetForm({
  categoryCode,
  categoryName,
  assets,
  onSave,
  onAdd,
  onDelete,
  onEditAsset,
  requiresTicker = false,
}: CategoryAssetFormProps) {
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();

  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [editMode, setEditMode] = useState<'add' | 'edit'>('add');

  // Form fields for both add and edit
  const [formName, setFormName] = useState('');
  const [formTicker, setFormTicker] = useState('');
  const [formMarketCap, setFormMarketCap] = useState('');
  const [formValue, setFormValue] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const handleOpenAdd = () => {
    setEditMode('add');
    setEditingAsset(null);
    setFormName('');
    setFormTicker('');
    setFormMarketCap('');
    setFormValue('');
    setFormNotes('');
    onEditOpen();
  };

  const handleOpenEdit = (asset: Asset) => {
    setEditMode('edit');
    setEditingAsset(asset);
    setFormName(asset.name);
    setFormTicker(asset.ticker || '');
    setFormMarketCap(asset.marketCap?.toString() || '');
    setFormValue(asset.currentValue?.toString() || '');
    setFormNotes(asset.notes || '');
    onEditOpen();
  };

  const handleSave = async () => {
    if (editMode === 'add') {
      // Create new asset with all required fields
      const marketCap = formMarketCap ? parseFloat(formMarketCap) : undefined;
      console.log('[CategoryAssetForm] Creating asset:', { categoryCode, formName, formTicker, marketCap });
      const result = await onAdd(categoryCode, formName, formTicker || undefined, marketCap);
      console.log('[CategoryAssetForm] Asset created, result:', result);

      // Save initial value if provided
      if (result && formValue) {
        console.log('[CategoryAssetForm] Checking for created asset ID in result.data:', result.data);
        // The result should contain the created asset's data
        const createdAsset = result.data?.data;
        console.log('[CategoryAssetForm] Created asset:', createdAsset);
        if (createdAsset?.id) {
          console.log('[CategoryAssetForm] Saving initial value:', parseFloat(formValue), 'for asset:', createdAsset.id);
          await onSave(createdAsset.id, parseFloat(formValue), formNotes);
        } else {
          console.warn('[CategoryAssetForm] No asset ID found in result, cannot save initial value');
        }
      } else {
        console.log('[CategoryAssetForm] No initial value to save or no result:', { result, formValue });
      }
    } else if (editMode === 'edit' && editingAsset) {
      // Update asset details
      const marketCap = formMarketCap ? parseFloat(formMarketCap) : undefined;
      await onEditAsset(editingAsset.id, formName, formTicker || undefined, marketCap);

      // Update value if changed
      if (formValue) {
        await onSave(editingAsset.id, parseFloat(formValue), formNotes);
      }
    }

    onEditClose();
    setFormName('');
    setFormTicker('');
    setFormMarketCap('');
    setFormValue('');
    setFormNotes('');
  };

  const handleDelete = async () => {
    if (editingAsset) {
      await onDelete(editingAsset.id);
      onEditClose();
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
          onClick={handleOpenAdd}
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
              {requiresTicker && <Th isNumeric>Market Cap</Th>}
              <Th isNumeric>Current Value</Th>
              <Th>Notes</Th>
              <Th width="80px">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {assets.map((asset) => (
              <Tr key={asset.id} _hover={{ bg: 'whiteAlpha.50' }}>
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
                {requiresTicker && (
                  <Td isNumeric>
                    <Text color="text.secondary" fontSize="sm">
                      {asset.marketCap ? formatCurrency(asset.marketCap) : '-'}
                    </Text>
                  </Td>
                )}
                <Td isNumeric>
                  <Text
                    color={asset.currentValue ? "brand.500" : "text.tertiary"}
                    fontWeight={asset.currentValue ? "semibold" : "normal"}
                    fontSize="md"
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
                  <IconButton
                    aria-label="Edit asset"
                    icon={<FiEdit2 />}
                    size="sm"
                    variant="ghost"
                    colorScheme="blue"
                    onClick={() => handleOpenEdit(asset)}
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Unified Add/Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg">
        <ModalOverlay />
        <ModalContent bg="background.secondary">
          <ModalHeader color="text.primary">
            {editMode === 'add' ? `Add Asset to ${categoryName}` : `Edit ${editingAsset?.name}`}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel color="text.secondary">Asset Name</FormLabel>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Enter asset name"
                  bg="background.tertiary"
                  color="text.primary"
                  autoFocus
                />
              </FormControl>

              {requiresTicker && (
                <FormControl isRequired={requiresTicker}>
                  <FormLabel color="text.secondary">Ticker</FormLabel>
                  <Input
                    value={formTicker}
                    onChange={(e) => setFormTicker(e.target.value.toUpperCase())}
                    placeholder="e.g., AAPL"
                    bg="background.tertiary"
                    color="text.primary"
                  />
                </FormControl>
              )}

              {requiresTicker && (
                <FormControl isRequired={requiresTicker}>
                  <FormLabel color="text.secondary">Market Cap (€)</FormLabel>
                  <Input
                    type="number"
                    value={formMarketCap}
                    onChange={(e) => setFormMarketCap(e.target.value)}
                    placeholder="Enter market cap"
                    step="0.01"
                    bg="background.tertiary"
                    color="text.primary"
                  />
                </FormControl>
              )}

              <FormControl isRequired={editMode === 'add'}>
                <FormLabel color="text.secondary">Current Value (€)</FormLabel>
                <Input
                  type="number"
                  value={formValue}
                  onChange={(e) => setFormValue(e.target.value)}
                  placeholder="Enter current value"
                  step="0.01"
                  bg="background.tertiary"
                  color="text.primary"
                />
              </FormControl>

              <FormControl>
                <FormLabel color="text.secondary">Notes (optional)</FormLabel>
                <Textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Add notes about this asset"
                  rows={3}
                  bg="background.tertiary"
                  color="text.primary"
                />
              </FormControl>

              <HStack spacing={3} w="full" justify="space-between">
                <HStack spacing={3}>
                  {editMode === 'edit' && (
                    <Button
                      leftIcon={<FiTrash2 />}
                      colorScheme="red"
                      variant="ghost"
                      onClick={handleDelete}
                    >
                      Delete
                    </Button>
                  )}
                </HStack>
                <HStack spacing={3}>
                  <Button variant="ghost" onClick={onEditClose}>
                    Cancel
                  </Button>
                  <Button
                    colorScheme="blue"
                    leftIcon={editMode === 'add' ? <FiPlus /> : <FiSave />}
                    onClick={handleSave}
                    isDisabled={
                      !formName ||
                      (requiresTicker && !formTicker) ||
                      (requiresTicker && !formMarketCap) ||
                      (editMode === 'add' && !formValue)
                    }
                  >
                    {editMode === 'add' ? 'Add Asset' : 'Save Changes'}
                  </Button>
                </HStack>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
