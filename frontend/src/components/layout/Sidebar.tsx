'use client';

import {
  Box,
  VStack,
  HStack,
  Text,
  Icon,
  Flex,
  Heading,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MdDashboard,
  MdPieChart,
  MdAddCircle,
  MdSettings,
  MdLogout,
} from 'react-icons/md';
import { FaChartLine } from 'react-icons/fa';

interface NavItem {
  label: string;
  icon: any;
  href: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: MdDashboard, href: '/dashboard' },
  { label: 'Asset Allocation', icon: MdPieChart, href: '/allocation' },
  { label: 'Monthly Input', icon: MdAddCircle, href: '/input' },
  { label: 'Analytics', icon: FaChartLine, href: '/analytics' },
  { label: 'Settings', icon: MdSettings, href: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <Box
      as="nav"
      position="fixed"
      left={0}
      top={0}
      h="100vh"
      w="260px"
      bg="background.secondary"
      borderRight="1px"
      borderColor="whiteAlpha.100"
      p={6}
      display={{ base: 'none', lg: 'flex' }}
      flexDirection="column"
    >
      {/* Logo */}
      <HStack spacing={3} mb={8}>
        <Box
          w="40px"
          h="40px"
          bg="brand.500"
          borderRadius="lg"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Text fontSize="xl" fontWeight="bold" color="white">
            F
          </Text>
        </Box>
        <Heading size="md" color="text.primary">
          FinAlly
        </Heading>
      </HStack>

      <Divider borderColor="whiteAlpha.100" mb={6} />

      {/* Navigation */}
      <VStack spacing={2} align="stretch" flex={1}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <HStack
                spacing={3}
                px={4}
                py={3}
                borderRadius="md"
                bg={isActive ? 'brand.500' : 'transparent'}
                color={isActive ? 'white' : 'text.secondary'}
                _hover={{
                  bg: isActive ? 'brand.600' : 'background.tertiary',
                  color: 'text.primary',
                }}
                transition="all 0.2s"
                cursor="pointer"
              >
                <Icon as={item.icon} boxSize={5} />
                <Text fontWeight={isActive ? 'semibold' : 'medium'}>
                  {item.label}
                </Text>
              </HStack>
            </Link>
          );
        })}
      </VStack>

      {/* User Section */}
      <Divider borderColor="whiteAlpha.100" mb={4} />
      <HStack
        px={4}
        py={3}
        borderRadius="md"
        _hover={{ bg: 'background.tertiary' }}
        cursor="pointer"
      >
        <Icon as={MdLogout} boxSize={5} color="text.secondary" />
        <Text color="text.secondary" fontWeight="medium">
          Logout
        </Text>
      </HStack>
    </Box>
  );
}
