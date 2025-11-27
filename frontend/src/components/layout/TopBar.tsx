'use client';

import {
  Box,
  Flex,
  HStack,
  IconButton,
  Text,
  Heading,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerBody,
  VStack,
  Icon,
} from '@chakra-ui/react';
import { MdMenu, MdDashboard, MdPieChart, MdAddCircle, MdSettings } from 'react-icons/md';
import { FaChartLine } from 'react-icons/fa';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Dashboard', icon: MdDashboard, href: '/dashboard' },
  { label: 'Asset Allocation', icon: MdPieChart, href: '/allocation' },
  { label: 'Monthly Input', icon: MdAddCircle, href: '/input' },
  { label: 'Analytics', icon: FaChartLine, href: '/analytics' },
  { label: 'Settings', icon: MdSettings, href: '/settings' },
];

export default function TopBar() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const pathname = usePathname();

  return (
    <>
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        h="64px"
        bg="background.secondary"
        borderBottom="1px"
        borderColor="whiteAlpha.100"
        px={4}
        display={{ base: 'flex', lg: 'none' }}
        alignItems="center"
        zIndex={10}
      >
        <Flex justify="space-between" align="center" w="full">
          <HStack spacing={3}>
            <Box
              w="32px"
              h="32px"
              bg="brand.500"
              borderRadius="md"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text fontSize="lg" fontWeight="bold" color="white">
                F
              </Text>
            </Box>
            <Heading size="sm">FinAlly</Heading>
          </HStack>

          <IconButton
            aria-label="Open menu"
            icon={<MdMenu />}
            onClick={onOpen}
            variant="ghost"
          />
        </Flex>
      </Box>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg="background.secondary">
          <DrawerCloseButton />
          <DrawerBody pt={8}>
            <VStack spacing={2} align="stretch">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} onClick={onClose}>
                    <HStack
                      spacing={3}
                      px={4}
                      py={3}
                      borderRadius="md"
                      bg={isActive ? 'brand.500' : 'transparent'}
                      color={isActive ? 'white' : 'text.secondary'}
                      _hover={{ bg: isActive ? 'brand.600' : 'background.tertiary' }}
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
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
