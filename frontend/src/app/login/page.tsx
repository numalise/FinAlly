'use client';

import {
  Box,
  Container,
  VStack,
  Heading,
  Button,
  Text,
  useToast,
  Alert,
  AlertIcon,
  AlertDescription,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  Divider,
  HStack,
} from '@chakra-ui/react';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { signIn } from 'aws-amplify/auth';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setTokenFromCognito, token } = useAuth();
  const toast = useToast();
  const isExpired = searchParams.get('expired') === 'true';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [useHostedUI, setUseHostedUI] = useState(false);

  // Handle expired session and sign out from Amplify
  useEffect(() => {
    const handleExpiredSession = async () => {
      if (isExpired) {
        try {
          // Sign out from Amplify to clear stale session
          const { signOut } = await import('aws-amplify/auth');
          await signOut();

          // Clear all storage
          localStorage.removeItem('accessToken');
          localStorage.removeItem('idToken');
          localStorage.removeItem('refreshToken');

          console.log('Cleared expired session');
        } catch (error) {
          console.error('Error clearing expired session:', error);
        }
      }
    };

    handleExpiredSession();
  }, [isExpired]);

  // Redirect if already logged in
  useEffect(() => {
    if (token && !isExpired) {
      router.push('/dashboard');
    }
  }, [token, router, isExpired]);

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { isSignedIn, nextStep } = await signIn({
        username: email,
        password: password,
      });

      if (isSignedIn) {
        // Get tokens from Amplify
        const { fetchAuthSession } = await import('aws-amplify/auth');
        const session = await fetchAuthSession();
        const idToken = session.tokens?.idToken?.toString();

        if (idToken) {
          setTokenFromCognito(idToken);
          toast({
            title: 'Login successful',
            status: 'success',
            duration: 2000,
          });
          router.push('/dashboard');
        }
      } else {
        // Handle MFA or other required steps
        toast({
          title: 'Additional step required',
          description: nextStep?.signInStep || 'Please complete the authentication',
          status: 'info',
          duration: 4000,
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: 'Login failed',
        description: error.message || 'Invalid email or password',
        status: 'error',
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleHostedUILogin = () => {
    const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
    const region = process.env.NEXT_PUBLIC_COGNITO_REGION || 'eu-central-1';
    const redirectUri = window.location.origin + '/login';

    const loginUrl = `https://${cognitoDomain}.auth.${region}.amazoncognito.com/login?client_id=${clientId}&response_type=token&scope=email+openid+profile&redirect_uri=${encodeURIComponent(redirectUri)}`;

    window.location.href = loginUrl;
  };

  // Handle OAuth callback
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const idToken = params.get('id_token');

      if (idToken) {
        setTokenFromCognito(idToken);
        toast({
          title: 'Login successful',
          status: 'success',
          duration: 2000,
        });
        router.push('/dashboard');
      }
    }
  }, []);

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

          {isExpired && (
            <Alert status="warning" borderRadius="md">
              <AlertIcon />
              <AlertDescription>
                Your session has expired. Please sign in again.
              </AlertDescription>
            </Alert>
          )}

          {!useHostedUI ? (
            <VStack spacing={6} w="full" as="form" onSubmit={handleCustomLogin}>
              <FormControl isRequired>
                <FormLabel color="text.secondary">Email</FormLabel>
                <Input
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  bg="background.tertiary"
                  color="text.primary"
                  size="lg"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel color="text.secondary">Password</FormLabel>
                <InputGroup size="lg">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    bg="background.tertiary"
                    color="text.primary"
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      icon={showPassword ? <FiEyeOff /> : <FiEye />}
                      onClick={() => setShowPassword(!showPassword)}
                      variant="ghost"
                      size="sm"
                      color="text.secondary"
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                w="full"
                isLoading={isLoading}
                loadingText="Signing in..."
              >
                Sign In
              </Button>

              <HStack w="full">
                <Divider />
                <Text fontSize="sm" color="text.secondary" whiteSpace="nowrap">
                  or
                </Text>
                <Divider />
              </HStack>

              <Button
                variant="outline"
                size="md"
                w="full"
                onClick={() => setUseHostedUI(true)}
                color="text.secondary"
                borderColor="whiteAlpha.200"
                _hover={{ borderColor: 'whiteAlpha.300' }}
              >
                Use Cognito Hosted UI
              </Button>
            </VStack>
          ) : (
            <VStack spacing={4} w="full">
              <Button
                colorScheme="blue"
                size="lg"
                w="full"
                onClick={handleHostedUILogin}
              >
                Sign In with Cognito
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUseHostedUI(false)}
                color="text.secondary"
              >
                ← Back to custom login
              </Button>

              <Text fontSize="sm" color="text.secondary" textAlign="center">
                You'll be redirected to AWS Cognito to authenticate
              </Text>
            </VStack>
          )}
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
