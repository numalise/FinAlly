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
  Collapse,
} from '@chakra-ui/react';
import { FiEdit2, FiChevronDown, FiChevronUp, FiPlus, FiTrash2 } from 'react-icons/fi';
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

interface SimplifiedAssetFormProps {
  categoryCode: string;
  categoryName: string;
  categoryColor: string;
  assets: Asset[];
  onSave: (assetId: string, value: number, notes?: string) => void;
  onAdd: (category: string, name: string, ticker?: string, marketCap?: number) => void;
  onDelete: (assetId: string) => void;
  onEditAsset: (assetId: string, name: string, ticker?: string, marketCap?: number) => void;
  requiresTicker?: boolean;
  hasMarketCap?: boolean;
}

export default function SimplifiedAssetForm({
  categoryCode,
  categoryName,
  categoryColor,
  assets,
  onSave,
  onAdd,
  onDelete,
  onEditAsset,
  requiresTicker = false,
  hasMarketCap = false,
}: SimplifiedAssetFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editName, setEditName] = useState('');
  const [editTicker, setEditTicker] = useState('');
  const [editMarketCap, setEditMarketCap] = useState('');
  
  const [newName, setNewName] = useState('');
  const [newTicker, setNewTicker] = useState('');
  const [newMarketCap, setNewMarketCap] = useState('');

  const totalValue = assets.reduce((sum, a) => sum + (a.currentValue || 0), 0);
  const assetsWithValues = assets.filter(a => a.currentValue !== undefined).length;

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setEditValue(asset.currentValue?.toString() || '');
    setEditNotes(asset.notes || '');
    setEditName(asset.name);
    setEditTicker(asset.ticker || '');
    setEditMarketCap(asset.marketCap ? (asset.marketCap / 1000000000).toString() : '');
    onEditOpen();
  };

  const handleSaveEdit = () => {
    if (editingAsset) {
      const marketCapValue = editMarketCap ? parseFloat(editMarketCap) * 1000000000 : undefined;
      if (editName !== editingAsset.name || editTicker !== editingAsset.ticker || marketCapValue !== editingAsset.marketCap) {
        onEditAsset(editingAsset.id, editName, editTicker || undefined, marketCapValue);
      }
      if (editValue) {
        onSave(editingAsset.id, parseFloat(editValue), editNotes);
      }
      onEditClose();
      setEditingAsset(null);
    }
  };

  const handleAdd = () => {
    if (newName) {
      const marketCapValue = newMarketCap ? parseFloat(newMarketCap) * 1000000000 : undefined;
      onAdd(categoryCode, newName, newTicker || undefined, marketCapValue);
      onAddClose();
      setNewName('');
      setNewTicker('');
      setNewMarketCap('');
    }
  };

  return (
    <Box
      borderWidth="1px"
      borderColor="background.tertiary"
      borderRadius="lg"
      overflow="hidden"
    >
      <HStack
        justify="space-between"
        p={4}
        bg="background.tertiary"
        cursor="pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        _hover={{ bg: 'whiteAlpha.50' }}
      >
        <HStack spacing={3}>
          <Box w="4px" h="40px" bg={categoryColor} borderRadius="full" />
          <VStack align="start" spacing={0}>
            <Text fontSize="md" fontWeight="bold" color="text.primary">
              {categoryName}
            </Text>
            <Text fontSize="xs" color="text.secondary">
              {assetsWithValues}/{assets.length} entered • {formatCurrency(totalValue)}
            </Text>
          </VStack>
        </HStack>

        <HStack spacing={2}>
          <Button
            size="sm"
            leftIcon={<FiPlus />}
            colorScheme="blue"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onAddOpen();
            }}
          >
            Add
          </Button>
          <IconButton
            aria-label="Toggle"
            icon={isExpanded ? <FiChevronUp /> : <FiChevronDown />}
            variant="ghost"
            size="sm"
          />
        </HStack>
      </HStack>

      <Collapse in={isExpanded}>
        <Box p={4}>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th border="none" width="25%">Asset</Th>
                {requiresTicker && <Th border="none" width="12%">Ticker</Th>}
                {hasMarketCap && <Th border="none" width="13%" isNumeric>Market Cap</Th>}
                <Th border="none" width="15%" isNumeric>Value</Th>
                <Th border="none" width="30%">Notes</Th>
                <Th border="none" width="5%"></Th>
              </Tr>
            </Thead>
            <Tbody>
              {assets.map((asset) => (
                <Tr key={asset.id} _hover={{ bg: 'background.tertiary' }}>
                  <Td border="none">
                    <Text color="text.primary" fontWeight="medium">
                      {asset.name}
                    </Text>
                  </Td>
                  {requiresTicker && (
                    <Td border="none">
                      {asset.ticker ? (
                        <Badge colorScheme="blue" variant="subtle">
                          {asset.ticker}
                        </Badge>
                      ) : (
                        <Text color="text.tertiary" fontSize="xs">-</Text>
                      )}
                    </Td>
                  )}
                  {hasMarketCap && (
                    <Td border="none" isNumeric>
                      <Text color="text.secondary" fontSize="xs">
                        {asset.marketCap ? `$${(asset.marketCap / 1000000000).toFixed(1)}B` : '-'}
                      </Text>
                    </Td>
                  )}
                  <Td border="none" isNumeric>
                    <Text
                      color={asset.currentValue ? "text.primary" : "text.tertiary"}
                      fontWeight={asset.currentValue ? "medium" : "normal"}
                    >
                      {asset.currentValue ? formatCurrency(asset.currentValue) : 'Not set'}
                    </Text>
                  </Td>
                  <Td border="none">
                    <Text color="text.secondary" fontSize="xs" noOfLines={1}>
                      {asset.notes || '-'}
                    </Text>
                  </Td>
                  <Td border="none">
                    <HStack spacing={1}>
                      <IconButton
                        aria-label="Edit"
                        icon={<FiEdit2 />}
                        size="xs"
                        variant="ghost"
                        color="blue.400"
                        onClick={() => handleEdit(asset)}
                      />
                      <IconButton
                        aria-label="Delete"
                        icon={<FiTrash2 />}
                        size="xs"
                        variant="ghost"
                        color="red.400"
                        onClick={() => onDelete(asset.id)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Collapse>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg">
        <ModalOverlay />
        <ModalContent bg="background.secondary" border="none">
          <ModalHeader color="text.primary">Edit Asset</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel color="text.secondary">Asset Name</FormLabel>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} bg="background.tertiary" color="text.primary" border="none" />
              </FormControl>

              {requiresTicker && (
                <FormControl>
                  <FormLabel color="text.secondary">Ticker (optional)</FormLabel>
                  <Input value={editTicker} onChange={(e) => setEditTicker(e.target.value.toUpperCase())} bg="background.tertiary" color="text.primary" border="none" />
                </FormControl>
              )}

              {hasMarketCap && (
                <FormControl>
                  <FormLabel color="text.secondary">Market Cap (Billions $)</FormLabel>
                  <Input 
                    type="number" 
                    value={editMarketCap} 
                    onChange={(e) => setEditMarketCap(e.target.value)} 
                    placeholder="e.g., 3000 for $3T"
                    step="0.1"
                    bg="background.tertiary" 
                    color="text.primary" 
                    border="none" 
                  />
                </FormControl>
              )}

              <FormControl>
                <FormLabel color="text.secondary">Value (€)</FormLabel>
                <Input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} step="0.01" bg="background.tertiary" color="text.primary" border="none" />
              </FormControl>

              <FormControl>
                <FormLabel color="text.secondary">Notes (optional)</FormLabel>
                <Textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={3} bg="background.tertiary" color="text.primary" border="none" />
              </FormControl>

              <HStack spacing={3} w="full" justify="flex-end">
                <Button variant="ghost" onClick={onEditClose}>Cancel</Button>
                <Button colorScheme="blue" onClick={handleSaveEdit}>Save Changes</Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Add Modal */}
      <Modal isOpen={isAddOpen} onClose={onAddClose}>
        <ModalOverlay />
        <ModalContent bg="background.secondary" border="none">
          <ModalHeader color="text.primary">Add Asset to {categoryName}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel color="text.secondary">Asset Name</FormLabel>
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Enter asset name" bg="background.tertiary" color="text.primary" border="none" />
              </FormControl>

              {requiresTicker && (
                <FormControl>
                  <FormLabel color="text.secondary">Ticker (optional)</FormLabel>
                  <Input value={newTicker} onChange={(e) => setNewTicker(e.target.value.toUpperCase())} placeholder="e.g., AAPL" bg="background.tertiary" color="text.primary" border="none" />
                </FormControl>
              )}

              {hasMarketCap && (
                <FormControl>
                  <FormLabel color="text.secondary">Market Cap (Billions $)</FormLabel>
                  <Input 
                    type="number" 
                    value={newMarketCap} 
                    onChange={(e) => setNewMarketCap(e.target.value)} 
                    placeholder="e.g., 3000 for $3T"
                    step="0.1"
                    bg="background.tertiary" 
                    color="text.primary" 
                    border="none" 
                  />
                </FormControl>
              )}

              <HStack spacing={3} w="full" justify="flex-end">
                <Button variant="ghost" onClick={onAddClose}>Cancel</Button>
                <Button colorScheme="blue" onClick={handleAdd} isDisabled={!newName}>Add Asset</Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
