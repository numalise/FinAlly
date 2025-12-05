'use client';

import { Box, Container } from '@chakra-ui/react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box minH="100vh" bg="background.primary">
      <Sidebar />
      <TopBar />
      
      {/* Main Content */}
      <Box
        ml={{ base: 0, lg: '260px' }}
        pt={{ base: '64px', lg: 0 }}
        minH="100vh"
      >
        <Container maxW="container.xl" py={8}>
          {children}
        </Container>
      </Box>
    </Box>
  );
}
