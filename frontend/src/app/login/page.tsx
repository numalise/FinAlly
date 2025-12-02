'use client';

import { Box, Container, VStack, Heading, Button, Text, useToast } from '@chakra-ui/react';
import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

function LoginContent() {
  const router = useRouter();
  const { setTokenFromCognito, token } = useAuth();
  const toast = useToast();

  // Handle OAuth callback with ID token in URL fragment
  useEffect(() => {
    // Check if we have a token in the URL hash (from Cognito redirect)
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const idToken = params.get('id_token');
      
      if (idToken) {
        setTokenFromCognito(idToken);
        toast({
          title: 'Login successful',
          status: 'success',
          duration: 3000,
        });
        router.push('/dashboard');
      }
    }
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (token) {
      router.push('/dashboard');
    }
  }, [token, router]);

  const handleLogin = () => {
    // Redirect to Cognito Hosted UI
    const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
    const region = process.env.NEXT_PUBLIC_COGNITO_REGION || 'eu-central-1';
    const redirectUri = window.location.origin + '/login';
    
    const loginUrl = `https://${cognitoDomain}.auth.${region}.amazoncognito.com/login?client_id=${clientId}&response_type=token&scope=email+openid+profile&redirect_uri=${encodeURIComponent(redirectUri)}`;
    
    console.log('Redirecting to:', loginUrl);
    window.location.href = loginUrl;
  };

  return (
    <Box minH="100vh" bg="background.primary" display="flex" alignItems="center">
      <Container maxW="md">
        <VStack spacing={8} p={8} bg="background.secondary" borderRadius="lg" boxShadow="xl">
          <VStack spacing={2}>
            <Heading size="xl" color="text.primary">
              FinAlly
            </Heading>
            <Text color="text.secondary">
              Personal Finance Management
            </Text>
          </VStack>

          <VStack spacing={4} w="full">
            <Button
              colorScheme="blue"
              size="lg"
              w="full"
              onClick={handleLogin}
            >
              Sign In with Cognito
            </Button>

            <Text fontSize="sm" color="text.secondary" textAlign="center">
              You'll be redirected to AWS Cognito to authenticate
            </Text>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<Box minH="100vh" bg="background.primary" />}>
      <LoginContent />
    </Suspense>
  );
}