# Frontend Development Guide

> **Practical guide for developing and extending the FinAlly Next.js frontend**

Comprehensive workflows, patterns, and best practices for building features in the FinAlly frontend application.

**Stack:** Next.js 15 + React 18 + TypeScript + Chakra UI + React Query
**Last Updated:** December 2025

---

## Table of Contents

1. [Development Workflow](#development-workflow)
2. [Project Structure](#project-structure)
3. [Adding New Pages](#adding-new-pages)
4. [Creating Components](#creating-components)
5. [Custom Hooks](#custom-hooks)
6. [API Integration](#api-integration)
7. [Form Handling](#form-handling)
8. [State Management](#state-management)
9. [Routing](#routing)
10. [Authentication](#authentication)
11. [Styling](#styling)
12. [Testing](#testing)
13. [Debugging](#debugging)
14. [Performance](#performance)
15. [Common Patterns](#common-patterns)
16. [Anti-Patterns](#anti-patterns)

---

## Development Workflow

### Starting Development Server

```bash
cd frontend
npm install              # Install dependencies (first time)
npm run dev              # Start development server

# Output:
#   ▲ Next.js 15.1.4
#   - Local:        http://localhost:3000
#   - Environments: .env.local
# ✓ Ready in 2.3s
```

**Development Features:**
- Hot Module Replacement (HMR) - changes reflect instantly
- Fast Refresh - preserves React state across file edits
- TypeScript type checking - errors shown in console
- ESLint linting - code quality warnings

### Making Changes

**1. Create Feature Branch**

```bash
git checkout dev
git pull origin dev
git checkout -b feature/add-investment-analytics
```

**2. Make Code Changes**

Edit files in `src/` directory. Changes trigger automatic reload.

**3. Type Check**

```bash
npm run type-check
```

Runs TypeScript compiler without emitting files. Fix all errors before committing.

**4. Lint Code**

```bash
npm run lint
```

Runs ESLint with Next.js configuration. Auto-fix with `npm run lint --fix`.

**5. Build for Production**

```bash
npm run build
```

Tests production build. Catches issues that dev mode might miss.

**6. Commit & Push**

```bash
git add .
git commit -m "feat: add investment analytics dashboard"
git push origin feature/add-investment-analytics
```

---

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout (providers, navbar)
│   ├── page.tsx                 # Home page (/) - redirects to dashboard
│   ├── login/
│   │   └── page.tsx             # Login page (/login)
│   ├── dashboard/
│   │   └── page.tsx             # Dashboard (/dashboard)
│   ├── allocation/
│   │   └── page.tsx             # Asset allocation (/allocation)
│   ├── cashflow/
│   │   └── page.tsx             # Cash flow (/cashflow)
│   └── input/
│       └── page.tsx             # Monthly input (/input)
├── components/                   # Reusable React components
│   ├── layout/                  # Layout components
│   │   ├── Layout.tsx           # Main layout wrapper
│   │   ├── Navbar.tsx           # Top navigation
│   │   ├── Sidebar.tsx          # Side navigation
│   │   └── ProtectedRoute.tsx  # Auth guard
│   ├── dashboard/               # Dashboard-specific components
│   │   ├── AssetValueCard.tsx
│   │   ├── BudgetTable.tsx
│   │   └── NetWorthChart.tsx
│   ├── allocation/              # Allocation-specific components
│   └── input/                   # Input form components
├── hooks/                        # Custom React hooks
│   ├── api/                     # API integration hooks
│   │   ├── useAssets.ts         # Asset CRUD operations
│   │   ├── useCashFlow.ts       # Cash flow operations
│   │   ├── useBudgets.ts        # Budget operations
│   │   └── useSubcategories.ts  # Subcategory operations
│   ├── useCashFlowManagement.ts # Cash flow business logic
│   ├── useAssetManagement.ts    # Asset business logic
│   └── useOptimisticMutation.ts # Optimistic update pattern
├── lib/                          # Core libraries & utilities
│   ├── api.ts                   # Axios client (JWT interceptors)
│   └── amplify-config.ts        # AWS Amplify configuration
├── types/                        # TypeScript type definitions
│   ├── input.ts                 # Input-related types
│   └── allocation.ts            # Allocation types
├── utils/                        # Utility functions
│   ├── financialCalculations.ts # Business logic
│   ├── formatters.ts            # Number/currency formatting
│   └── assetTransformers.ts    # Data transformation
├── contexts/                     # React Context providers
│   └── AuthContext.tsx          # Authentication state
└── theme/                        # Chakra UI theme
    └── index.ts                 # Custom theme configuration
```

---

## Adding New Pages

### Step 1: Create Page File

Next.js App Router uses file-system routing. Create `page.tsx` in `app/` directory.

**Example: Add `/analytics` page**

```bash
mkdir src/app/analytics
touch src/app/analytics/page.tsx
```

**src/app/analytics/page.tsx:**

```typescript
'use client';

import { Box, Heading, Text } from '@chakra-ui/react';
import { useUser } from '@/hooks/api/useUser';

export default function AnalyticsPage() {
  const { data: user, isLoading } = useUser();

  if (isLoading) {
    return <Box>Loading...</Box>;
  }

  return (
    <Box p={8}>
      <Heading mb={4}>Analytics</Heading>
      <Text>Welcome, {user?.name}!</Text>
    </Box>
  );
}
```

**Key Points:**
- `'use client'` directive for client components (interactive, use hooks)
- Server components by default (no `'use client'`)
- Import Chakra UI components for UI
- Use custom hooks for data fetching

### Step 2: Add Navigation Link

**src/components/layout/Sidebar.tsx:**

```typescript
<VStack spacing={2} align="stretch">
  <NavItem href="/dashboard" icon={FiHome}>Dashboard</NavItem>
  <NavItem href="/allocation" icon={FiPieChart}>Allocation</NavItem>
  <NavItem href="/cashflow" icon={FiTrendingUp}>Cash Flow</NavItem>
  <NavItem href="/analytics" icon={FiBarChart2}>Analytics</NavItem>
  {/* Add new link */}
</VStack>
```

### Step 3: Protect Route (if needed)

**src/app/analytics/page.tsx:**

```typescript
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';

export default function AnalyticsPage() {
  return (
    <ProtectedRoute>
      {/* Page content */}
    </ProtectedRoute>
  );
}
```

**ProtectedRoute automatically:**
- Checks if user is authenticated
- Redirects to `/login` if not
- Shows loading state while checking

### Step 4: Add Page-Specific Layout (optional)

**src/app/analytics/layout.tsx:**

```typescript
export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <nav>{/* Analytics-specific navigation */}</nav>
      {children}
    </div>
  );
}
```

---

## Creating Components

### Component Structure

**Anatomy of a typical component:**

```typescript
// 1. Imports
import { useState } from 'react';
import { Box, Button, Text } from '@chakra-ui/react';
import { useAssets } from '@/hooks/api/useAssets';

// 2. TypeScript interfaces
interface AssetCardProps {
  assetId: number;
  onDelete?: (id: number) => void;
}

// 3. Component function
export function AssetCard({ assetId, onDelete }: AssetCardProps) {
  // 4. Hooks (must be at top level)
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: asset, isLoading } = useAsset(assetId);

  // 5. Event handlers
  const handleDelete = () => {
    onDelete?.(assetId);
  };

  // 6. Conditional rendering
  if (isLoading) {
    return <Box>Loading...</Box>;
  }

  if (!asset) {
    return <Box>Asset not found</Box>;
  }

  // 7. Main render
  return (
    <Box p={4} borderWidth={1} borderRadius="md">
      <Text fontSize="lg" fontWeight="bold">{asset.name}</Text>
      <Text color="gray.600">{asset.ticker_symbol}</Text>
      <Button onClick={handleDelete} colorScheme="red" size="sm">
        Delete
      </Button>
    </Box>
  );
}
```

### Component Naming Conventions

**File names:** PascalCase with `.tsx` extension
- `AssetCard.tsx`
- `NetWorthChart.tsx`
- `CashFlowInputSection.tsx`

**Component names:** Match file name
```typescript
// AssetCard.tsx
export function AssetCard() { ... }

// NetWorthChart.tsx
export function NetWorthChart() { ... }
```

**Export pattern:**
- Named export for component: `export function AssetCard() { ... }`
- Default export for pages: `export default function DashboardPage() { ... }`

### Component Organization

**Group by feature, not by type:**

```
✅ Good:
components/
├── dashboard/
│   ├── AssetValueCard.tsx
│   ├── BudgetTable.tsx
│   └── NetWorthChart.tsx
├── allocation/
│   ├── AllocationChart.tsx
│   └── AllocationTable.tsx

❌ Bad:
components/
├── cards/
│   └── AssetValueCard.tsx
├── tables/
│   ├── BudgetTable.tsx
│   └── AllocationTable.tsx
├── charts/
│   ├── NetWorthChart.tsx
│   └── AllocationChart.tsx
```

### Reusable vs. Feature-Specific

**Reusable components** (shared across features):
- Location: `components/common/` (if needed)
- Example: `<Card>`, `<Modal>`, `<Spinner>`

**Feature-specific components** (used in one area):
- Location: `components/<feature>/`
- Example: `<BudgetTable>`, `<AllocationChart>`

**Use Chakra UI built-ins when possible:**
- Instead of custom `<Card>`, use Chakra's `<Box>` with styling
- Instead of custom `<Button>`, use Chakra's `<Button>` with variants

---

## Custom Hooks

### API Hooks

**Pattern: Create one hook per API resource**

**src/hooks/api/useAssets.ts:**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Asset } from '@/types/input';

// Fetch all assets
export function useAssets() {
  return useQuery<Asset[]>({
    queryKey: ['assets'],
    queryFn: async () => {
      const response = await api.get('/assets');
      return response.data.data;
    },
  });
}

// Fetch single asset
export function useAsset(id: number) {
  return useQuery<Asset>({
    queryKey: ['assets', id],
    queryFn: async () => {
      const response = await api.get(`/assets/${id}`);
      return response.data.data;
    },
    enabled: !!id, // Only fetch if id is provided
  });
}

// Create asset
export function useCreateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Asset>) => {
      const response = await api.post('/assets', data);
      return response.data.data;
    },
    onSuccess: () => {
      // Invalidate assets list to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
}

// Update asset
export function useUpdateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Asset> }) => {
      const response = await api.patch(`/assets/${id}`, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['assets', variables.id] });
    },
  });
}

// Delete asset
export function useDeleteAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/assets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
}
```

### Business Logic Hooks

**Pattern: Encapsulate complex logic in custom hooks**

**src/hooks/useCashFlowManagement.ts:**

```typescript
import { useState, useMemo } from 'react';
import { useExpenses, useIncomings } from './api/useCashFlow';
import { useBudgets } from './api/useBudgets';

export function useCashFlowManagement(month: string) {
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses({
    from: month,
    to: month
  });
  const { data: incomings = [], isLoading: incomingsLoading } = useIncomings({
    from: month,
    to: month
  });
  const { data: budgets = [] } = useBudgets();

  // Calculate totals
  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  const totalIncome = useMemo(() => {
    return incomings.reduce((sum, incoming) => sum + incoming.amount, 0);
  }, [incomings]);

  const netCashFlow = totalIncome - totalExpenses;

  // Calculate budget variance
  const budgetVariance = useMemo(() => {
    const expensesByCategory = expenses.reduce((acc, expense) => {
      acc[expense.category_id] = (acc[expense.category_id] || 0) + expense.amount;
      return acc;
    }, {} as Record<number, number>);

    return budgets.map(budget => {
      const spent = expensesByCategory[budget.category_id] || 0;
      const remaining = budget.limit - spent;
      const percentUsed = (spent / budget.limit) * 100;

      return {
        ...budget,
        spent,
        remaining,
        percentUsed,
        isOverBudget: spent > budget.limit,
      };
    });
  }, [expenses, budgets]);

  return {
    expenses,
    incomings,
    totalExpenses,
    totalIncome,
    netCashFlow,
    budgetVariance,
    isLoading: expensesLoading || incomingsLoading,
  };
}
```

**Usage in component:**

```typescript
export function CashFlowPage() {
  const [selectedMonth, setSelectedMonth] = useState('2025-12');
  const {
    totalExpenses,
    totalIncome,
    netCashFlow,
    budgetVariance,
    isLoading,
  } = useCashFlowManagement(selectedMonth);

  if (isLoading) return <Spinner />;

  return (
    <Box>
      <Stat>
        <StatLabel>Net Cash Flow</StatLabel>
        <StatNumber color={netCashFlow >= 0 ? 'green.500' : 'red.500'}>
          {formatCurrency(netCashFlow)}
        </StatNumber>
      </Stat>
      {/* ... */}
    </Box>
  );
}
```

---

## API Integration

### Axios Client Setup

**src/lib/api.ts:**

```typescript
import axios from 'axios';
import { Auth } from 'aws-amplify';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Add JWT token
api.interceptors.request.use(
  async (config) => {
    try {
      const session = await Auth.currentSession();
      const token = session.getIdToken().getJwtToken();
      config.headers.Authorization = `Bearer ${token}`;
    } catch (error) {
      // User not authenticated, redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

### React Query Configuration

**src/app/layout.tsx:**

```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### Optimistic Updates

**Pattern: Update UI before server response**

```typescript
export function useOptimisticCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Expense>) => {
      const response = await api.post('/expenses', data);
      return response.data.data;
    },
    onMutate: async (newExpense) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['expenses'] });

      // Snapshot previous value
      const previousExpenses = queryClient.getQueryData<Expense[]>(['expenses']);

      // Optimistically update cache
      if (previousExpenses) {
        queryClient.setQueryData<Expense[]>(['expenses'], [
          ...previousExpenses,
          {
            ...newExpense,
            id: Date.now(), // Temporary ID
          } as Expense,
        ]);
      }

      // Return context for rollback
      return { previousExpenses };
    },
    onError: (err, newExpense, context) => {
      // Rollback on error
      if (context?.previousExpenses) {
        queryClient.setQueryData(['expenses'], context.previousExpenses);
      }
    },
    onSettled: () => {
      // Refetch to get server state
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}
```

---

## Form Handling

### React Hook Form Setup

**Installation:**

```bash
npm install react-hook-form
```

**Basic form example:**

```typescript
import { useForm } from 'react-hook-form';
import { Box, Button, FormControl, FormLabel, Input, FormErrorMessage } from '@chakra-ui/react';
import { useCreateAsset } from '@/hooks/api/useAssets';

interface AssetFormData {
  name: string;
  ticker_symbol: string;
  category_id: number;
  notes?: string;
}

export function AssetForm({ onSuccess }: { onSuccess?: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AssetFormData>();

  const createMutation = useCreateAsset();

  const onSubmit = async (data: AssetFormData) => {
    try {
      await createMutation.mutateAsync(data);
      reset(); // Clear form
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create asset:', error);
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit(onSubmit)}>
      <FormControl isInvalid={!!errors.name} mb={4}>
        <FormLabel>Asset Name</FormLabel>
        <Input
          {...register('name', {
            required: 'Asset name is required',
            minLength: { value: 2, message: 'Name must be at least 2 characters' },
          })}
          placeholder="e.g., Apple Stock"
        />
        <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.ticker_symbol} mb={4}>
        <FormLabel>Ticker Symbol</FormLabel>
        <Input
          {...register('ticker_symbol')}
          placeholder="e.g., AAPL"
        />
        <FormErrorMessage>{errors.ticker_symbol?.message}</FormErrorMessage>
      </FormControl>

      <Button
        type="submit"
        colorScheme="blue"
        isLoading={isSubmitting || createMutation.isPending}
      >
        Create Asset
      </Button>
    </Box>
  );
}
```

### Form Validation

**Built-in validation:**

```typescript
register('email', {
  required: 'Email is required',
  pattern: {
    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    message: 'Invalid email address',
  },
});

register('amount', {
  required: 'Amount is required',
  min: { value: 0.01, message: 'Amount must be positive' },
  max: { value: 1000000, message: 'Amount too large' },
});
```

**Custom validation:**

```typescript
register('password_confirm', {
  validate: (value) => {
    const password = watch('password');
    return value === password || 'Passwords do not match';
  },
});
```

---

## State Management

### Local State (useState)

**For UI-only state:**

```typescript
const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedMonth, setSelectedMonth] = useState('2025-12');
const [expandedRows, setExpandedRows] = useState<number[]>([]);
```

### Server State (React Query)

**For data from API:**

```typescript
const { data, isLoading, error } = useAssets();
```

**Never use useState for server data!**

❌ Bad:
```typescript
const [assets, setAssets] = useState([]);

useEffect(() => {
  fetch('/api/assets')
    .then(res => res.json())
    .then(data => setAssets(data));
}, []);
```

✅ Good:
```typescript
const { data: assets } = useAssets();
```

### Global State (Context)

**For auth and theme:**

**src/contexts/AuthContext.tsx:**

```typescript
import { createContext, useContext, useState, useEffect } from 'react';
import { Auth } from 'aws-amplify';

interface AuthContextType {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await Auth.currentAuthenticatedUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    await Auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

**Usage:**

```typescript
const { user, isAuthenticated, signOut } = useAuth();
```

---

## Routing

### Navigation

**Link component:**

```typescript
import Link from 'next/link';

<Link href="/dashboard">Go to Dashboard</Link>
```

**Programmatic navigation:**

```typescript
import { useRouter } from 'next/navigation';

const router = useRouter();

const handleSuccess = () => {
  router.push('/dashboard');
};
```

### Route Parameters

**Dynamic routes:**

Create `app/assets/[id]/page.tsx`:

```typescript
export default function AssetDetailPage({ params }: { params: { id: string } }) {
  const assetId = parseInt(params.id);
  const { data: asset, isLoading } = useAsset(assetId);

  if (isLoading) return <Spinner />;
  if (!asset) return <Box>Asset not found</Box>;

  return (
    <Box>
      <Heading>{asset.name}</Heading>
      <Text>{asset.ticker_symbol}</Text>
    </Box>
  );
}
```

**Query parameters:**

```typescript
import { useSearchParams } from 'next/navigation';

const searchParams = useSearchParams();
const month = searchParams.get('month'); // ?month=2025-12
```

---

## Authentication

### Protected Routes

**src/components/layout/ProtectedRoute.tsx:**

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Spinner, Center } from '@chakra-ui/react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
```

**Usage:**

```typescript
export default function DashboardPage() {
  return (
    <ProtectedRoute>
      {/* Protected content */}
    </ProtectedRoute>
  );
}
```

---

## Styling

### Chakra UI Patterns

**Responsive design:**

```typescript
<Box
  width={{ base: '100%', md: '50%', lg: '33%' }}
  p={{ base: 4, md: 6, lg: 8 }}
>
  {/* Content */}
</Box>
```

**Color mode:**

```typescript
import { useColorMode } from '@chakra-ui/react';

const { colorMode, toggleColorMode } = useColorMode();

<Box bg={colorMode === 'light' ? 'white' : 'gray.800'}>
  {/* Content */}
</Box>
```

**Custom theme:**

**src/theme/index.ts:**

```typescript
import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      50: '#e3f2fd',
      100: '#bbdefb',
      500: '#2196f3',
      900: '#0d47a1',
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
      },
    },
  },
});

export default theme;
```

---

## Testing

**Coming in Phase 6 (CI/CD)**

Planned testing strategy:
- Jest for unit tests
- React Testing Library for component tests
- Playwright for E2E tests

---

## Debugging

### React Query Devtools

**Enabled in development:**

```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  {children}
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

**View cached queries, refetch, invalidate from UI**

### Browser DevTools

**React DevTools extension:**
- Inspect component tree
- View props and state
- Profile performance

**Network tab:**
- Monitor API requests
- Check request/response headers
- Verify JWT token sent

**Console errors:**
- Check for TypeScript errors
- React warnings
- API errors

---

## Performance

### Code Splitting

**Lazy load components:**

```typescript
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <Spinner />,
  ssr: false, // Don't server-render
});
```

### Memoization

**useMemo for expensive calculations:**

```typescript
const sortedAssets = useMemo(() => {
  return assets.sort((a, b) => b.value - a.value);
}, [assets]);
```

**React.memo for expensive components:**

```typescript
export const ExpensiveComponent = React.memo(({ data }) => {
  // Heavy rendering logic
});
```

---

## Common Patterns

### Loading States

```typescript
const { data, isLoading, error } = useAssets();

if (isLoading) return <Spinner />;
if (error) return <Box>Error loading assets</Box>;
if (!data) return <Box>No assets found</Box>;

return <AssetList assets={data} />;
```

### Error Handling

```typescript
const mutation = useCreateAsset();

const handleSubmit = async (data) => {
  try {
    await mutation.mutateAsync(data);
    toast({ title: 'Asset created', status: 'success' });
  } catch (error) {
    toast({
      title: 'Failed to create asset',
      description: error.message,
      status: 'error',
    });
  }
};
```

---

## Anti-Patterns

❌ **Don't fetch data in useEffect:**
```typescript
// Bad
useEffect(() => {
  fetch('/api/assets').then(res => res.json()).then(setAssets);
}, []);
```

✅ **Use React Query:**
```typescript
// Good
const { data: assets } = useAssets();
```

❌ **Don't mutate state directly:**
```typescript
// Bad
assets.push(newAsset);
setAssets(assets);
```

✅ **Create new array:**
```typescript
// Good
setAssets([...assets, newAsset]);
```

❌ **Don't use index as key:**
```typescript
// Bad
{assets.map((asset, index) => <AssetCard key={index} />)}
```

✅ **Use unique ID:**
```typescript
// Good
{assets.map((asset) => <AssetCard key={asset.id} />)}
```

---

## Further Reading

- [Next.js Documentation](https://nextjs.org/docs)
- [React Query Documentation](https://tanstack.com/query/latest/docs/react/overview)
- [Chakra UI Documentation](https://chakra-ui.com/docs/getting-started)
- [React Hook Form Documentation](https://react-hook-form.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

---

**Development Guide Version:** 1.0 (Phase 5)
**Last Updated:** December 2025
