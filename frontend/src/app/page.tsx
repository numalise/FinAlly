'use client';

import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  SimpleGrid,
  Stack,
  Text,
  VStack,
  useColorModeValue,
  Badge,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import {
  FiDollarSign,
  FiTrendingUp,
  FiPieChart,
  FiShield,
  FiLock,
  FiCloud,
  FiDatabase,
  FiZap,
  FiCheckCircle,
  FiArrowRight,
  FiBarChart2,
  FiTarget,
} from 'react-icons/fi';

interface FeatureProps {
  icon: any;
  title: string;
  description: string;
}

const Feature = ({ icon, title, description }: FeatureProps) => {
  return (
    <Stack
      spacing={4}
      p={6}
      bg="background.secondary"
      borderRadius="xl"
      border="1px solid"
      borderColor="background.tertiary"
      _hover={{
        borderColor: 'brand.500',
        transform: 'translateY(-4px)',
        transition: 'all 0.3s ease',
      }}
      transition="all 0.3s ease"
    >
      <Flex
        w={12}
        h={12}
        align="center"
        justify="center"
        borderRadius="lg"
        bg="brand.500"
        bgGradient="linear(to-br, brand.400, brand.600)"
      >
        <Icon as={icon} boxSize={6} color="white" />
      </Flex>
      <Heading size="md" color="text.primary">
        {title}
      </Heading>
      <Text color="text.secondary" lineHeight="tall">
        {description}
      </Text>
    </Stack>
  );
};

interface TechBadgeProps {
  name: string;
  color?: string;
}

const TechBadge = ({ name, color = 'brand' }: TechBadgeProps) => {
  return (
    <Badge
      px={4}
      py={2}
      borderRadius="full"
      colorScheme={color}
      fontSize="sm"
      fontWeight="medium"
    >
      {name}
    </Badge>
  );
};

export default function LandingPage() {
  const router = useRouter();
  const bgGradient = useColorModeValue(
    'linear(to-br, background.primary, background.secondary)',
    'linear(to-br, background.primary, background.secondary)'
  );

  const features = [
    {
      icon: FiTrendingUp,
      title: 'Asset Tracking',
      description:
        'Track investments across 8 categories including stocks, ETFs, crypto, and real estate with real-time portfolio analysis.',
    },
    {
      icon: FiDollarSign,
      title: 'Cash Flow Management',
      description:
        'Monitor income and expenses with custom categories, automated budget tracking, and monthly financial insights.',
    },
    {
      icon: FiPieChart,
      title: 'Net Worth Dashboard',
      description:
        'Visualize your complete financial picture with automated net worth calculations and historical tracking.',
    },
    {
      icon: FiTarget,
      title: 'Asset Allocation',
      description:
        'Set target allocation percentages and track your progress towards optimal portfolio diversification.',
    },
    {
      icon: FiBarChart2,
      title: 'Budget Planning',
      description:
        'Create monthly budgets by category, track spending patterns, and receive alerts when approaching limits.',
    },
    {
      icon: FiCheckCircle,
      title: 'Data Insights',
      description:
        'Get actionable insights from your financial data with charts, trends, and performance analytics.',
    },
  ];

  const securityFeatures = [
    'JWT Authentication with AWS Cognito',
    'End-to-end SSL/TLS encryption',
    'Private VPC with isolated database',
    'Auto-provisioning on first login',
    'Multi-factor authentication support',
    'Complete data isolation per user',
  ];

  return (
    <Box bg="background.primary" minH="100vh">
      {/* Hero Section */}
      <Box bgGradient={bgGradient} position="relative" overflow="hidden">
        {/* Decorative gradient blur */}
        <Box
          position="absolute"
          top="-20%"
          right="-10%"
          w="600px"
          h="600px"
          borderRadius="full"
          bgGradient="radial(brand.500, transparent)"
          opacity={0.1}
          filter="blur(80px)"
        />
        <Box
          position="absolute"
          bottom="-20%"
          left="-10%"
          w="500px"
          h="500px"
          borderRadius="full"
          bgGradient="radial(brand.600, transparent)"
          opacity={0.1}
          filter="blur(80px)"
        />

        <Container maxW="7xl" pt={{ base: 20, md: 32 }} pb={{ base: 16, md: 24 }} position="relative">
          <VStack spacing={8} textAlign="center" maxW="4xl" mx="auto">
            {/* Badge */}
            <Badge
              px={4}
              py={2}
              borderRadius="full"
              bg="background.tertiary"
              color="brand.400"
              fontSize="sm"
              fontWeight="medium"
            >
              <HStack spacing={2}>
                <Icon as={FiCloud} />
                <Text>Serverless • AWS • Production-Ready</Text>
              </HStack>
            </Badge>

            {/* Main Headline */}
            <Heading
              fontSize={{ base: '4xl', md: '5xl', lg: '6xl' }}
              fontWeight="extrabold"
              lineHeight="shorter"
              color="text.primary"
            >
              Your Complete
              <Text
                as="span"
                bgGradient="linear(to-r, brand.400, brand.600)"
                bgClip="text"
                display="block"
                mt={2}
              >
                Financial Command Center
              </Text>
            </Heading>

            {/* Subheadline */}
            <Text
              fontSize={{ base: 'lg', md: 'xl' }}
              color="text.secondary"
              maxW="2xl"
              lineHeight="tall"
            >
              Track investments, manage budgets, and achieve financial goals with a
              modern, serverless platform built on AWS infrastructure.
            </Text>

            {/* CTA Buttons */}
            <HStack spacing={4} pt={4}>
              <Button
                size="lg"
                colorScheme="brand"
                rightIcon={<FiArrowRight />}
                onClick={() => router.push('/dashboard')}
                px={8}
                py={6}
                fontSize="lg"
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: '0 10px 25px -5px rgba(33, 150, 243, 0.4)',
                }}
                transition="all 0.3s ease"
              >
                Get Started
              </Button>
              <Button
                size="lg"
                variant="outline"
                borderColor="brand.500"
                color="brand.400"
                onClick={() => router.push('/login')}
                px={8}
                py={6}
                fontSize="lg"
                _hover={{
                  bg: 'background.tertiary',
                  transform: 'translateY(-2px)',
                }}
                transition="all 0.3s ease"
              >
                Sign In
              </Button>
            </HStack>

            {/* Stats */}
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={8} pt={8} w="full">
              {[
                { label: 'Asset Categories', value: '8' },
                { label: 'API Endpoints', value: '30+' },
                { label: 'Uptime', value: '99.9%' },
                { label: 'Response Time', value: '<200ms' },
              ].map((stat) => (
                <VStack key={stat.label} spacing={1}>
                  <Text fontSize="3xl" fontWeight="bold" color="brand.400">
                    {stat.value}
                  </Text>
                  <Text fontSize="sm" color="text.tertiary" textTransform="uppercase">
                    {stat.label}
                  </Text>
                </VStack>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxW="7xl" py={{ base: 16, md: 24 }}>
        <VStack spacing={12}>
          <VStack spacing={4} textAlign="center" maxW="3xl">
            <Heading size="2xl" color="text.primary">
              Everything You Need to{' '}
              <Text as="span" color="brand.400">
                Master Your Finances
              </Text>
            </Heading>
            <Text fontSize="lg" color="text.secondary" lineHeight="tall">
              Comprehensive tools for tracking, analyzing, and optimizing your financial
              portfolio.
            </Text>
          </VStack>

          <Grid
            templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
            gap={6}
            w="full"
          >
            {features.map((feature, index) => (
              <Feature key={index} {...feature} />
            ))}
          </Grid>
        </VStack>
      </Container>

      {/* Technology Stack Section */}
      <Box bg="background.secondary" py={{ base: 16, md: 24 }}>
        <Container maxW="7xl">
          <VStack spacing={12}>
            <VStack spacing={4} textAlign="center" maxW="3xl">
              <Heading size="2xl" color="text.primary">
                Built with{' '}
                <Text as="span" color="brand.400">
                  Modern Technology
                </Text>
              </Heading>
              <Text fontSize="lg" color="text.secondary" lineHeight="tall">
                Production-grade serverless architecture on AWS with industry-leading tools
                and frameworks.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={4} w="full">
              <VStack
                p={6}
                bg="background.tertiary"
                borderRadius="lg"
                spacing={3}
                align="start"
              >
                <Icon as={FiCloud} boxSize={8} color="brand.400" />
                <Text fontWeight="bold" color="text.primary">
                  Backend
                </Text>
                <Stack spacing={2}>
                  <TechBadge name="AWS Lambda" />
                  <TechBadge name="Node.js 20" />
                  <TechBadge name="Prisma ORM" />
                  <TechBadge name="TypeScript" />
                </Stack>
              </VStack>

              <VStack
                p={6}
                bg="background.tertiary"
                borderRadius="lg"
                spacing={3}
                align="start"
              >
                <Icon as={FiDatabase} boxSize={8} color="brand.400" />
                <Text fontWeight="bold" color="text.primary">
                  Database
                </Text>
                <Stack spacing={2}>
                  <TechBadge name="PostgreSQL 16" />
                  <TechBadge name="RDS Multi-AZ" />
                  <TechBadge name="Private VPC" />
                  <TechBadge name="SSL/TLS" />
                </Stack>
              </VStack>

              <VStack
                p={6}
                bg="background.tertiary"
                borderRadius="lg"
                spacing={3}
                align="start"
              >
                <Icon as={FiZap} boxSize={8} color="brand.400" />
                <Text fontWeight="bold" color="text.primary">
                  Frontend
                </Text>
                <Stack spacing={2}>
                  <TechBadge name="Next.js 15" />
                  <TechBadge name="React 18" />
                  <TechBadge name="Chakra UI" />
                  <TechBadge name="React Query" />
                </Stack>
              </VStack>

              <VStack
                p={6}
                bg="background.tertiary"
                borderRadius="lg"
                spacing={3}
                align="start"
              >
                <Icon as={FiLock} boxSize={8} color="brand.400" />
                <Text fontWeight="bold" color="text.primary">
                  Infrastructure
                </Text>
                <Stack spacing={2}>
                  <TechBadge name="Terraform" />
                  <TechBadge name="API Gateway" />
                  <TechBadge name="Cognito" />
                  <TechBadge name="CloudWatch" />
                </Stack>
              </VStack>
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Security Section */}
      <Container maxW="7xl" py={{ base: 16, md: 24 }}>
        <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={12} alignItems="center">
          <VStack spacing={6} align="start">
            <Heading size="2xl" color="text.primary">
              Security{' '}
              <Text as="span" color="brand.400">
                First
              </Text>
            </Heading>
            <Text fontSize="lg" color="text.secondary" lineHeight="tall">
              Your financial data is protected with enterprise-grade security measures at
              every layer of the stack.
            </Text>
            <VStack spacing={3} align="start" w="full">
              {securityFeatures.map((feature, index) => (
                <HStack key={index} spacing={3}>
                  <Icon as={FiCheckCircle} color="success.500" boxSize={5} />
                  <Text color="text.primary">{feature}</Text>
                </HStack>
              ))}
            </VStack>
          </VStack>

          <VStack
            spacing={4}
            p={8}
            bg="background.secondary"
            borderRadius="2xl"
            border="1px solid"
            borderColor="background.tertiary"
          >
            <Icon as={FiShield} boxSize={20} color="brand.400" />
            <Heading size="lg" color="text.primary" textAlign="center">
              Private & Secure
            </Heading>
            <Text color="text.secondary" textAlign="center" lineHeight="tall">
              Database in private subnets with no public access. All connections require
              SSL/TLS encryption. Complete user data isolation at the database level.
            </Text>
            <SimpleGrid columns={2} spacing={4} w="full" pt={4}>
              <VStack p={4} bg="background.tertiary" borderRadius="lg">
                <Text fontSize="2xl" fontWeight="bold" color="success.500">
                  100%
                </Text>
                <Text fontSize="sm" color="text.secondary" textAlign="center">
                  Encrypted
                </Text>
              </VStack>
              <VStack p={4} bg="background.tertiary" borderRadius="lg">
                <Text fontSize="2xl" fontWeight="bold" color="success.500">
                  0
                </Text>
                <Text fontSize="sm" color="text.secondary" textAlign="center">
                  Public Access
                </Text>
              </VStack>
            </SimpleGrid>
          </VStack>
        </Grid>
      </Container>

      {/* Architecture Section */}
      <Box bg="background.secondary" py={{ base: 16, md: 24 }}>
        <Container maxW="7xl">
          <VStack spacing={12}>
            <VStack spacing={4} textAlign="center" maxW="3xl">
              <Heading size="2xl" color="text.primary">
                Serverless{' '}
                <Text as="span" color="brand.400">
                  Architecture
                </Text>
              </Heading>
              <Text fontSize="lg" color="text.secondary" lineHeight="tall">
                Auto-scaling, cost-efficient infrastructure that grows with your needs.
              </Text>
            </VStack>

            <Box
              w="full"
              p={8}
              bg="background.tertiary"
              borderRadius="2xl"
              border="1px solid"
              borderColor="brand.500"
              position="relative"
              overflow="hidden"
            >
              {/* Architecture Visualization */}
              <VStack spacing={6}>
                <HStack spacing={4} w="full" justify="center">
                  <Box
                    px={6}
                    py={3}
                    bg="brand.500"
                    borderRadius="lg"
                    fontWeight="bold"
                    color="white"
                  >
                    Next.js Frontend
                  </Box>
                </HStack>
                <Icon as={FiArrowRight} transform="rotate(90deg)" color="brand.400" />
                <HStack spacing={4} w="full" justify="center">
                  <Box
                    px={6}
                    py={3}
                    bg="background.primary"
                    border="2px solid"
                    borderColor="brand.400"
                    borderRadius="lg"
                    fontWeight="bold"
                    color="text.primary"
                  >
                    API Gateway
                  </Box>
                  <Icon as={FiArrowRight} color="brand.400" />
                  <Box
                    px={6}
                    py={3}
                    bg="background.primary"
                    border="2px solid"
                    borderColor="brand.400"
                    borderRadius="lg"
                    fontWeight="bold"
                    color="text.primary"
                  >
                    Cognito Auth
                  </Box>
                </HStack>
                <Icon as={FiArrowRight} transform="rotate(90deg)" color="brand.400" />
                <HStack spacing={4} w="full" justify="center">
                  <Box
                    px={6}
                    py={3}
                    bg="brand.600"
                    borderRadius="lg"
                    fontWeight="bold"
                    color="white"
                  >
                    Lambda (Node.js)
                  </Box>
                </HStack>
                <Icon as={FiArrowRight} transform="rotate(90deg)" color="brand.400" />
                <HStack spacing={4} w="full" justify="center">
                  <Box
                    px={6}
                    py={3}
                    bg="background.primary"
                    border="2px solid"
                    borderColor="success.500"
                    borderRadius="lg"
                    fontWeight="bold"
                    color="text.primary"
                  >
                    RDS PostgreSQL
                  </Box>
                </HStack>
              </VStack>
            </Box>
          </VStack>
        </Container>
      </Box>

      {/* Final CTA Section */}
      <Container maxW="7xl" py={{ base: 16, md: 24 }}>
        <VStack
          spacing={8}
          p={{ base: 8, md: 16 }}
          bg="background.secondary"
          borderRadius="2xl"
          border="2px solid"
          borderColor="brand.500"
          textAlign="center"
          position="relative"
          overflow="hidden"
        >
          {/* Decorative gradient */}
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            w="800px"
            h="800px"
            borderRadius="full"
            bgGradient="radial(brand.500, transparent)"
            opacity={0.05}
            filter="blur(80px)"
          />

          <VStack spacing={4} position="relative" zIndex={1}>
            <Heading size="2xl" color="text.primary">
              Ready to Take Control of Your{' '}
              <Text as="span" color="brand.400">
                Financial Future?
              </Text>
            </Heading>
            <Text fontSize="lg" color="text.secondary" maxW="2xl" lineHeight="tall">
              Join FinAlly today and experience the power of modern financial tracking with
              enterprise-grade security and performance.
            </Text>
          </VStack>

          <HStack spacing={4} position="relative" zIndex={1}>
            <Button
              size="lg"
              colorScheme="brand"
              rightIcon={<FiArrowRight />}
              onClick={() => router.push('/dashboard')}
              px={8}
              py={6}
              fontSize="lg"
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 25px -5px rgba(33, 150, 243, 0.4)',
              }}
              transition="all 0.3s ease"
            >
              Start Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              borderColor="brand.500"
              color="brand.400"
              onClick={() => router.push('/login')}
              px={8}
              py={6}
              fontSize="lg"
              _hover={{
                bg: 'background.tertiary',
                transform: 'translateY(-2px)',
              }}
              transition="all 0.3s ease"
            >
              Sign In
            </Button>
          </HStack>
        </VStack>
      </Container>

      {/* Footer */}
      <Box bg="background.secondary" borderTop="1px solid" borderColor="background.tertiary">
        <Container maxW="7xl" py={8}>
          <Flex
            justify="space-between"
            align="center"
            direction={{ base: 'column', md: 'row' }}
            gap={4}
          >
            <Text color="text.secondary" fontSize="sm">
              © 2025 FinAlly. Built with ❤️ for personal finance enthusiasts.
            </Text>
            <HStack spacing={6}>
              <Text color="text.tertiary" fontSize="sm" cursor="pointer" _hover={{ color: 'brand.400' }}>
                Documentation
              </Text>
              <Text color="text.tertiary" fontSize="sm" cursor="pointer" _hover={{ color: 'brand.400' }}>
                GitHub
              </Text>
              <Text color="text.tertiary" fontSize="sm" cursor="pointer" _hover={{ color: 'brand.400' }}>
                Contact
              </Text>
            </HStack>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}
