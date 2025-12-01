'use client';

import {
  Box,
  HStack,
  IconButton,
  Text,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  VStack,
  Icon,
  Button,
} from '@chakra-ui/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FiMenu, FiLogOut } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { mainNavigation } from '@/config/navigation';

export default function TopBar() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      h="64px"
      bg="background.secondary"
      borderBottom="1px solid"
      borderColor="whiteAlpha.100"
      display={{ base: 'block', lg: 'none' }}
      zIndex="sticky"
    >
      <HStack h="full" px={4} justify="space-between">
        <IconButton
          aria-label="Open menu"
          icon={<FiMenu />}
          variant="ghost"
          onClick={onOpen}
        />
        <Text fontSize="xl" fontWeight="bold" color="text.primary">
          FinAlly
        </Text>
        <Box w="40px" />
      </HStack>

      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg="background.secondary">
          <DrawerCloseButton />
          <DrawerHeader color="text.primary">Menu</DrawerHeader>

          <DrawerBody>
            <VStack spacing={1} align="stretch">
              {mainNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.name} href={item.href} onClick={onClose}>
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
                    >
                      <Icon as={item.icon} boxSize={5} />
                      <Text fontSize="sm" fontWeight="medium">
                        {item.name}
                      </Text>
                    </HStack>
                  </Link>
                );
              })}

              <Box pt={6}>
                <Button
                  leftIcon={<Icon as={FiLogOut} />}
                  variant="ghost"
                  justifyContent="flex-start"
                  w="full"
                  color="text.secondary"
                  _hover={{ bg: 'background.tertiary', color: 'text.primary' }}
                  onClick={() => {
                    onClose();
                    logout();
                  }}
                >
                  Logout
                </Button>
              </Box>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}
