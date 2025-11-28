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
  Switch,
  Select,
  Divider,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
} from '@chakra-ui/react';
import { FiSave, FiEdit2, FiDownload } from 'react-icons/fi';
import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';

export default function SettingsPage() {
  const toast = useToast();
  
  // User Profile
  const [fullName, setFullName] = useState('Emanuele');
  const [email, setEmail] = useState('emanuele@example.com');
  
  // Preferences
  const [currency, setCurrency] = useState('EUR');
  const [language, setLanguage] = useState('en');
  const [darkMode, setDarkMode] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  
  // Category Targets
  const [targets, setTargets] = useState([
    { category: 'SINGLE_STOCKS', name: 'Single Stocks', target: 20 },
    { category: 'ETF_STOCKS', name: 'ETF Stocks', target: 25 },
    { category: 'ETF_BONDS', name: 'ETF Bonds', target: 10 },
    { category: 'CRYPTO', name: 'Crypto', target: 10 },
    { category: 'PRIVATE_EQUITY', name: 'Private Equity', target: 5 },
    { category: 'BUSINESS_PROFITS', name: 'Business Profits', target: 5 },
    { category: 'REAL_ESTATE', name: 'Real Estate', target: 20 },
    { category: 'CASH', name: 'Cash Liquidity', target: 5 },
  ]);

  const handleSaveProfile = () => {
    console.log('Save profile:', { fullName, email });
    toast({
      title: 'Profile updated',
      description: 'Your profile information has been saved.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    // TODO: API call to PATCH /users/me
  };

  const handleSavePreferences = () => {
    console.log('Save preferences:', { currency, language, darkMode, emailNotifications });
    toast({
      title: 'Preferences updated',
      description: 'Your preferences have been saved.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    // TODO: API call to PATCH /users/me/preferences
  };

  const handleUpdateTarget = (category: string, value: number) => {
    setTargets(prev => prev.map(t => 
      t.category === category ? { ...t, target: value } : t
    ));
  };

  const handleSaveTargets = () => {
    console.log('Save targets:', targets);
    toast({
      title: 'Allocation targets updated',
      description: 'Your category targets have been saved.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    // TODO: API call to PATCH /category-allocation-targets
  };

  const handleExportData = () => {
    console.log('Export data requested');
    toast({
      title: 'Export started',
      description: 'Your data export will download shortly.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
    // TODO: API call to GET /export/data
  };

  const totalTarget = targets.reduce((sum, t) => sum + t.target, 0);
  const isValidTargets = totalTarget === 100;

  return (
    <MainLayout>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg" mb={2} color="text.primary">
            Settings
          </Heading>
          <Text color="text.secondary">
            Manage your account, preferences, and allocation targets
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
                  <FormLabel color="text.secondary">Email</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                >
                  Save Profile
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Preferences */}
        <Card bg="background.secondary" border="none">
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Heading size="md" color="text.primary">
                Preferences
              </Heading>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <FormControl>
                  <FormLabel color="text.secondary">Currency</FormLabel>
                  <Select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    bg="background.tertiary"
                    color="text.primary"
                    border="none"
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel color="text.secondary">Language</FormLabel>
                  <Select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    bg="background.tertiary"
                    color="text.primary"
                    border="none"
                  >
                    <option value="en">English</option>
                    <option value="it">Italiano</option>
                  </Select>
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel color="text.secondary" mb="0">
                    Dark Mode
                  </FormLabel>
                  <Switch
                    isChecked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                    colorScheme="blue"
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel color="text.secondary" mb="0">
                    Email Notifications
                  </FormLabel>
                  <Switch
                    isChecked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    colorScheme="blue"
                  />
                </FormControl>
              </SimpleGrid>

              <HStack justify="flex-end">
                <Button
                  leftIcon={<FiSave />}
                  colorScheme="blue"
                  onClick={handleSavePreferences}
                >
                  Save Preferences
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
                  Total: {totalTarget}% {isValidTargets ? '✓' : '(must equal 100%)'}
                </Text>
              </HStack>

              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th border="none">Category</Th>
                    <Th border="none" isNumeric>Target %</Th>
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
                            onChange={(e) => handleUpdateTarget(target.category, parseFloat(e.target.value))}
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
                <HStack justify="space-between" p={4} bg="background.tertiary" borderRadius="md">
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

                <HStack justify="space-between" p={4} bg="background.tertiary" borderRadius="md">
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
  );
}
