'use client';

import { Box, VStack, HStack, Text, Icon, Button } from '@chakra-ui/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FiLogOut } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { mainNavigation } from '@/config/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <Box
      position="fixed"
      left="0"
      top="0"
      h="100vh"
      w="260px"
      bg="background.secondary"
      borderRight="1px solid"
      borderColor="whiteAlpha.100"
      display={{ base: 'none', lg: 'block' }}
    >
      <VStack h="full" justify="space-between" align="stretch" py={6} px={4}>
        <Box>
          <HStack spacing={3} px={3} mb={8}>
            <Box
              w="32px"
              h="32px"
              bg="brand.500"
              borderRadius="md"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontWeight="bold"
              color="white"
            >
              F
            </Box>
            <Text fontSize="xl" fontWeight="bold" color="text.primary">
              FinAlly
            </Text>
          </HStack>

          <VStack spacing={1} align="stretch">
            {mainNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <HStack
                    spacing={3}
                    px={3}
                    py={3}
                    borderRadius="md"
                    bg={isActive ? 'brand.500' : 'transparent'}
                    color={isActive ? 'white' : 'text.secondary'}
                    _hover={{
                      bg: isActive ? 'brand.600' : 'background.tertiary',
                      color: isActive ? 'white' : 'text.primary',
                    }}
                    cursor="pointer"
                    transition="all 0.2s"
                  >
                    <Icon as={item.icon} boxSize={5} />
                    <Text fontSize="sm" fontWeight="medium">
                      {item.name}
                    </Text>
                  </HStack>
                </Link>
              );
            })}
          </VStack>
        </Box>

        <Button
          leftIcon={<Icon as={FiLogOut} />}
          variant="ghost"
          justifyContent="flex-start"
          color="text.secondary"
          _hover={{ bg: 'background.tertiary', color: 'text.primary' }}
          onClick={logout}
        >
          Logout
        </Button>
      </VStack>
    </Box>
  );
}
