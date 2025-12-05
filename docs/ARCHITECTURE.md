# FinAlly Architecture

> **Comprehensive technical architecture documentation for the FinAlly serverless personal finance platform**

Deep-dive into system design, component interactions, technology choices, and architectural trade-offs.

**Last Updated:** December 2025
**Architecture Version:** Phase 5 (Production-Ready)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture Overview](#system-architecture-overview)
3. [Component Architecture](#component-architecture)
4. [Data Flow](#data-flow)
5. [Technology Stack](#technology-stack)
6. [Design Decisions](#design-decisions)
7. [Security Architecture](#security-architecture)
8. [Performance & Scalability](#performance--scalability)
9. [Monitoring & Observability](#monitoring--observability)
10. [Cost Optimization](#cost-optimization)
11. [Future Considerations](#future-considerations)

---

## Executive Summary

FinAlly is a cloud-native, serverless personal finance platform built on AWS infrastructure. The architecture emphasizes:

- **Serverless-first**: Zero server management, auto-scaling, pay-per-use
- **Security**: Private networking, JWT authentication, encrypted data
- **Type safety**: Full TypeScript coverage across frontend and backend
- **Infrastructure as Code**: Terraform-managed, version-controlled infrastructure
- **Developer experience**: Hot reload, type checking, automated deployments

**Key Metrics (Dev Environment):**
- Cold start: 2-3 seconds (Prisma initialization)
- Warm execution: 200-500ms
- Database queries: <100ms (indexed)
- Frontend load: 1-2 seconds (SSR)
- Monthly cost: ~€40 (NAT Gateway primary expense)

---

## System Architecture Overview

### High-Level Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                               │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  Next.js 15 Frontend (React 18 + Chakra UI)                  │ │
│  │  ├─ Pages: Dashboard, Allocation, Cash Flow, Analytics       │ │
│  │  ├─ State: React Query (server state) + Context (auth)       │ │
│  │  ├─ Auth: AWS Amplify (Cognito integration)                  │ │
│  │  └─ Build: Vercel/SSR with hot reload                        │ │
│  └──────────────────────────────────────────────────────────────┘ │
└────────────────────────┬───────────────────────────────────────────┘
                         │ HTTPS / JWT Bearer Token
                         ▼
┌────────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                             │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  API Gateway HTTP API v2                                     │ │
│  │  ├─ Cognito JWT Authorizer (validates tokens)               │ │
│  │  ├─ CORS configuration (allow origins/headers)              │ │
│  │  ├─ Route definitions (explicit, 30+ routes)                │ │
│  │  ├─ Throttling (5000 burst, 2000/sec rate)                  │ │
│  │  └─ CloudWatch logs (request/response/errors)               │ │
│  └──────────────────────────────────────────────────────────────┘ │
└────────────────────────┬───────────────────────────────────────────┘
                         │ AWS_PROXY integration
                         ▼
┌────────────────────────────────────────────────────────────────────┐
│                      COMPUTE LAYER                                 │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  AWS Lambda (Container Image from ECR)                       │ │
│  │  ┌────────────────────────────────────────────────────────┐  │ │
│  │  │  Node.js 20 Runtime                                     │  │ │
│  │  │  ├─ index.ts: Main handler (routing logic)             │  │ │
│  │  │  ├─ middleware/auth.ts: JWT verification + user lookup │  │ │
│  │  │  ├─ routes/*: 8 route handlers (assets, expenses, etc.)│  │ │
│  │  │  ├─ lib/prisma.ts: Singleton Prisma client             │  │ │
│  │  │  └─ utils/*: Response formatting, helpers              │  │ │
│  │  └────────────────────────────────────────────────────────┘  │ │
│  │  Configuration:                                              │ │
│  │  - Memory: 512MB                                             │ │
│  │  - Timeout: 30s                                              │ │
│  │  - VPC: Private subnets (2 AZs)                              │ │
│  │  - Environment: DATABASE_URL, COGNITO_* from Terraform      │ │
│  └──────────────────────────────────────────────────────────────┘ │
└────────────────────────┬───────────────────────────────────────────┘
                         │ Prisma (connection pooling, limit=5)
                         ▼
┌────────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                                │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  RDS PostgreSQL 16.10 (t3.micro, 20GB)                       │ │
│  │  ├─ Location: Private subnets (no public access)            │ │
│  │  ├─ Multi-AZ: Standby in separate AZ                        │ │
│  │  ├─ Tables: 14 (users, assets, expenses, etc.)              │ │
│  │  ├─ Backups: Automated (7-day retention)                    │ │
│  │  ├─ Encryption: At rest (AES-256) + in transit (SSL/TLS)   │ │
│  │  └─ Credentials: AWS Secrets Manager                        │ │
│  └──────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│                      MANAGEMENT LAYER                              │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐      │
│  │  SSM Bastion   │  │  Secrets Mgr   │  │  CloudWatch    │      │
│  │  (DB access)   │  │  (credentials) │  │  (logs/metrics)│      │
│  └────────────────┘  └────────────────┘  └────────────────┘      │
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│                   INFRASTRUCTURE LAYER (Terraform)                 │
│  VPC · Subnets · NAT Gateway · Security Groups · IAM · ECR        │
└────────────────────────────────────────────────────────────────────┘
```

### Network Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      AWS VPC (10.0.0.0/16)                       │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Availability Zone: eu-central-1a                          │  │
│  │  ┌─────────────────────┐  ┌────────────────────────────┐  │  │
│  │  │ Public Subnet       │  │ Private Subnet             │  │  │
│  │  │ 10.0.1.0/24         │  │ 10.0.101.0/24              │  │  │
│  │  │                     │  │                            │  │  │
│  │  │ ┌─────────────────┐ │  │ ┌──────────────────────┐   │  │  │
│  │  │ │ NAT Gateway     │ │  │ │ Lambda Function      │   │  │  │
│  │  │ │ (Elastic IP)    │ │  │ │ (VPC ENI)            │   │  │  │
│  │  │ └─────────────────┘ │  │ └──────────────────────┘   │  │  │
│  │  │                     │  │                            │  │  │
│  │  │ ┌─────────────────┐ │  │ ┌──────────────────────┐   │  │  │
│  │  │ │ Internet GW     │ │  │ │ RDS Primary          │   │  │  │
│  │  │ │ (IGW)           │ │  │ │ (Multi-AZ)           │   │  │  │
│  │  │ └─────────────────┘ │  │ └──────────────────────┘   │  │  │
│  │  └─────────────────────┘  └────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Availability Zone: eu-central-1b                          │  │
│  │  ┌─────────────────────┐  ┌────────────────────────────┐  │  │
│  │  │ Public Subnet       │  │ Private Subnet             │  │  │
│  │  │ 10.0.2.0/24         │  │ 10.0.102.0/24              │  │  │
│  │  │                     │  │                            │  │  │
│  │  │ (Reserved for HA)   │  │ ┌──────────────────────┐   │  │  │
│  │  │                     │  │ │ Lambda Function      │   │  │  │
│  │  │                     │  │ │ (VPC ENI)            │   │  │  │
│  │  │                     │  │ └──────────────────────┘   │  │  │
│  │  │                     │  │                            │  │  │
│  │  │                     │  │ ┌──────────────────────┐   │  │  │
│  │  │                     │  │ │ RDS Standby          │   │  │  │
│  │  │                     │  │ │ (Multi-AZ failover)  │   │  │  │
│  │  │                     │  │ └──────────────────────┘   │  │  │
│  │  └─────────────────────┘  └────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

Internet ←→ IGW ←→ Public Subnet ←→ NAT Gateway ←→ Private Subnet
                                                      │
                                                      ├─→ Lambda
                                                      └─→ RDS
```

**Key Network Design Decisions:**

1. **Private Subnets for Lambda & RDS**: No direct internet exposure
2. **NAT Gateway**: Enables Lambda outbound internet (Prisma packages, AWS SDK)
3. **Multi-AZ**: High availability for database (automatic failover)
4. **No Bastion in Production**: Use SSM Session Manager (no SSH keys)
5. **Security Groups**: Least-privilege rules (Lambda → RDS on port 5432 only)

---

## Component Architecture

### Frontend Component Hierarchy

```
app/layout.tsx (Root Layout)
├─ Providers (Chakra UI, React Query, Auth)
├─ Navbar (persistent across routes)
└─ Main Content Area
    ├─ app/page.tsx (Landing/Redirect)
    ├─ app/login/page.tsx (Auth flow)
    ├─ app/dashboard/page.tsx (Protected)
    │   ├─ AssetValueCard
    │   ├─ NetWorthChart
    │   └─ BudgetTable
    ├─ app/allocation/page.tsx (Protected)
    │   ├─ AllocationChart
    │   ├─ AllocationTable
    │   └─ RebalancingView
    ├─ app/cashflow/page.tsx (Protected)
    │   ├─ CashFlowSummary
    │   ├─ IncomeList
    │   └─ ExpenseList
    └─ app/input/page.tsx (Protected)
        ├─ AssetInputForm
        └─ CashFlowInputSection
```

**Component Communication Patterns:**

1. **Server State**: React Query hooks (useAssets, useExpenses, etc.)
2. **Local State**: useState, useReducer for UI-only state
3. **Global State**: Auth context (user info, token)
4. **Form State**: React Hook Form for complex forms

**Data Fetching Strategy:**

```typescript
// Server state with React Query
const { data: assets, isLoading } = useAssets();

// Mutations with optimistic updates
const mutation = useCreateAsset();
mutation.mutate(data, {
  onSuccess: () => queryClient.invalidateQueries(['assets']),
});
```

### Backend Request Flow

```
API Gateway Request
       │
       ▼
┌──────────────────────┐
│ Lambda Handler       │
│ (index.ts)           │
│                      │
│ 1. Parse event       │
│ 2. Extract path      │
│ 3. CORS preflight?   │
│    ├─ Yes → Return   │
│    └─ No → Continue  │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Auth Middleware      │
│ (middleware/auth.ts) │
│                      │
│ 1. Extract JWT       │
│ 2. Verify signature  │
│ 3. Get cognito_id    │
│ 4. Lookup/create user│
│ 5. Attach userId     │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Route Handler        │
│ (routes/*.ts)        │
│                      │
│ 1. Validate request  │
│ 2. Query database    │
│ 3. Transform data    │
│ 4. Return response   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Response Formatter   │
│ (utils/response.ts)  │
│                      │
│ 1. Success/error     │
│ 2. Add CORS headers  │
│ 3. JSON stringify    │
│ 4. Return to Gateway │
└──────────────────────┘
```

**Error Handling Flow:**

```
try {
  // Route handler logic
} catch (error) {
  if (error instanceof PrismaClientKnownRequestError) {
    return errorResponse(400, 'Database validation error', 'DATABASE_ERROR');
  } else if (error instanceof UnauthorizedError) {
    return errorResponse(401, 'Invalid token', 'UNAUTHORIZED');
  } else {
    return errorResponse(500, 'Internal server error', 'INTERNAL_ERROR');
  }
}
```

---

## Data Flow

### Authentication Flow

```
┌──────────┐                                                    ┌──────────┐
│ Frontend │                                                    │ Cognito  │
└────┬─────┘                                                    └────┬─────┘
     │                                                                │
     │  1. User clicks "Login"                                       │
     ├────────────────────────────────────────────────────────────>  │
     │                                                                │
     │  2. Redirect to Cognito Hosted UI                             │
     │ <────────────────────────────────────────────────────────────┤
     │                                                                │
     │  3. User enters credentials                                   │
     ├────────────────────────────────────────────────────────────>  │
     │                                                                │
     │  4. Authorization code (callback)                             │
     │ <────────────────────────────────────────────────────────────┤
     │                                                                │
     │  5. Exchange code for tokens (Amplify SDK)                    │
     ├────────────────────────────────────────────────────────────>  │
     │                                                                │
     │  6. ID Token + Access Token + Refresh Token                   │
     │ <────────────────────────────────────────────────────────────┤
     │                                                                │
     │  7. Store tokens in localStorage                              │
     │                                                                │
     │  8. API request with Bearer token                             │
     ├────────────────────────────────────────────────────────────>  │
     │                                                     ┌──────────┴─────────┐
     │                                                     │ API Gateway        │
     │                                                     │ (JWT Authorizer)   │
     │                                                     │ - Validates token  │
     │                                                     │ - Checks signature │
     │                                                     │ - Verifies expiry  │
     │                                                     └──────────┬─────────┘
     │                                                                │
     │  9. Forward to Lambda with validated claims                   │
     │                                                     ┌──────────▼─────────┐
     │                                                     │ Lambda             │
     │                                                     │ - Extract sub      │
     │                                                     │ - Get/create user  │
     │                                                     │ - Execute request  │
     │                                                     └──────────┬─────────┘
     │                                                                │
     │ 10. Response                                                   │
     │ <──────────────────────────────────────────────────────────────┤
     │                                                                │
```

### Data Write Flow (Create Expense)

```
Frontend
   │
   │ 1. User fills form (category, amount, date, subcategory)
   │ 2. Form validation (React Hook Form)
   │ 3. Mutation triggered
   │
   ▼
React Query Mutation
   │
   │ 4. Optimistic update (UI shows expense immediately)
   │ 5. POST /expenses with JWT token
   │
   ▼
API Gateway
   │
   │ 6. JWT validation (Cognito authorizer)
   │ 7. Route to Lambda
   │
   ▼
Lambda (expenses.ts)
   │
   │ 8. Extract userId from auth middleware
   │ 9. Validate request body
   │    - category_id exists?
   │    - subcategory_id valid for category?
   │    - amount > 0?
   │    - date format valid?
   │
   ▼
Prisma Client
   │
   │ 10. BEGIN TRANSACTION
   │ 11. INSERT INTO expense_items (...)
   │ 12. COMMIT
   │
   ▼
PostgreSQL
   │
   │ 13. Write to disk
   │ 14. Update indexes
   │ 15. Return inserted row
   │
   ▼
Lambda Response
   │
   │ 16. Transform data (add category names, etc.)
   │ 17. Format response with CORS headers
   │
   ▼
Frontend
   │
   │ 18. React Query receives response
   │ 19. Invalidate ['expenses'] query
   │ 20. Refetch expenses list
   │ 21. UI updates with server data
```

### Data Read Flow (Dashboard Load)

```
Frontend (dashboard/page.tsx)
   │
   │ Parallel data fetching (React Query)
   │
   ├───────────────┬───────────────┬──────────────┐
   │               │               │              │
   ▼               ▼               ▼              ▼
useAssets()   useNetworth()   useBudgets()   useCashFlow()
   │               │               │              │
   │               │               │              │
   └───────────────┴───────────────┴──────────────┘
                   │
                   │ Multiple parallel requests with JWT
                   ▼
              API Gateway
                   │
                   ├─→ Lambda (assets route)
                   ├─→ Lambda (networth route)
                   ├─→ Lambda (budgets route)
                   └─→ Lambda (expenses route)
                   │
                   │ Each route queries Prisma
                   ▼
              PostgreSQL
                   │
                   │ Indexed queries (<100ms)
                   │
                   ▼
              Lambda (parallel responses)
                   │
                   ▼
              Frontend
                   │
                   │ React Query caches for 5 minutes
                   │ Components render with data
```

**Cache Invalidation Strategy:**

```typescript
// After mutation, invalidate related queries
onSuccess: () => {
  queryClient.invalidateQueries(['assets']);
  queryClient.invalidateQueries(['allocation']); // Related data
  queryClient.invalidateQueries(['networth']);   // Related data
}
```

---

## Technology Stack

### Frontend Technologies

| Technology | Version | Purpose | Justification |
|------------|---------|---------|---------------|
| **Next.js** | 15.1.4 | React meta-framework | SSR, file-based routing, optimized builds, excellent DX |
| **React** | 18.x | UI library | Industry standard, large ecosystem, hooks API |
| **TypeScript** | 5.7.2 | Type safety | Catch errors at compile time, better IDE support |
| **Chakra UI** | 2.8.2 | Component library | Accessibility, theming, rapid development |
| **React Query** | 5.90.11 | Server state | Caching, deduplication, optimistic updates |
| **AWS Amplify** | 6.11.1 | Cognito client | Official AWS SDK, handles token refresh |
| **Axios** | 1.7.9 | HTTP client | Interceptors for JWT injection, better than fetch |
| **Recharts** | 2.15.0 | Charts | Declarative, responsive, composable |
| **React Hook Form** | 7.x | Form management | Uncontrolled inputs, better performance |
| **date-fns** | 4.1.0 | Date utilities | Lightweight, tree-shakeable, TypeScript support |

### Backend Technologies

| Technology | Version | Purpose | Justification |
|------------|---------|---------|---------------|
| **Node.js** | 20.x | Runtime | Lambda native support, large package ecosystem |
| **TypeScript** | 5.7.2 | Type safety | Shared types with frontend, better tooling |
| **Prisma** | 6.0.1 | ORM | Type-safe queries, migrations, excellent DX |
| **PostgreSQL** | 16.10 | Database | ACID compliance, JSON support, mature |
| **aws-jwt-verify** | 4.0.1 | JWT validation | Official AWS library, caches public keys |
| **esbuild** | 0.24.2 | Bundler | 100x faster than webpack, ESM output |
| **Docker** | Multi-stage | Container | Lambda container runtime, reproducible builds |

### Infrastructure Technologies

| Technology | Purpose | Justification |
|------------|---------|---------------|
| **Terraform** | IaC | Declarative, state management, provider ecosystem |
| **AWS Lambda** | Compute | Serverless, auto-scaling, pay-per-use |
| **API Gateway HTTP API** | API layer | Low-cost, HTTP/2, JWT authorizer |
| **RDS PostgreSQL** | Database | Managed, automated backups, Multi-AZ |
| **AWS Cognito** | Auth | Managed, OAuth support, JWT tokens |
| **ECR** | Registry | Private, integrated with Lambda, encrypted |
| **Secrets Manager** | Secrets | Automatic rotation, encrypted, versioned |
| **CloudWatch** | Monitoring | Integrated with AWS, logs + metrics |
| **VPC** | Networking | Isolation, security groups, private subnets |

---

## Design Decisions

### 1. Serverless vs. Traditional Server

**Decision: Serverless (AWS Lambda)**

**Rationale:**
- **Cost**: Pay-per-invocation vs. always-on EC2
- **Scaling**: Automatic, no capacity planning
- **Maintenance**: No OS patches, security updates
- **Development**: Focus on code, not infrastructure

**Trade-offs:**
- Cold starts (mitigated with provisioned concurrency in prod)
- VPC ENI initialization adds latency
- 15-minute execution limit (not an issue for API)
- State must be external (database, not in-memory)

**Production Optimization:**
- Provisioned concurrency to eliminate cold starts
- Keep Lambda warm with periodic pings
- Optimize bundle size to reduce cold start time

---

### 2. Container Image vs. Zip Deployment

**Decision: Container Image (Docker + ECR)**

**Rationale:**
- **Prisma Binary**: Requires native binaries, easier in Docker
- **Build Reproducibility**: Dockerfile ensures consistency
- **Local Testing**: Can run exact Lambda environment locally
- **Layer Limits**: No 250MB uncompressed limit (up to 10GB)

**Trade-offs:**
- Larger image size (250-300MB vs. 50MB zip)
- Slightly longer deployment time (push to ECR)
- More complex build process

**Implementation:**
```dockerfile
# Multi-stage build: install deps, generate Prisma, build TS
FROM public.ecr.aws/lambda/nodejs:20 AS base
# ... build steps ...

# Production: only runtime deps + artifacts
FROM public.ecr.aws/lambda/nodejs:20 AS prod
COPY --from=base /var/task/dist ./dist
COPY --from=base /var/task/node_modules/.prisma ./node_modules/.prisma
```

---

### 3. Prisma vs. Raw SQL

**Decision: Prisma ORM**

**Rationale:**
- **Type Safety**: Generated TypeScript types for all models
- **Migrations**: Schema versioning, up/down migrations
- **Query Builder**: Composable, readable, less SQL injection risk
- **Developer Experience**: Auto-completion, compile-time errors

**Trade-offs:**
- Connection overhead (mitigated with singleton + pooling)
- Less control over complex queries
- Bundle size increase (~2MB)

**Connection Pooling Strategy:**
```typescript
// Singleton pattern prevents connection exhaustion
let prisma: PrismaClient;
export function getPrismaClient() {
  if (!prisma) {
    prisma = new PrismaClient({
      log: ['warn', 'error'],
    });
  }
  return prisma;
}
```

**DATABASE_URL parameters:**
```
postgresql://user:pass@host:5432/db?connection_limit=5&pool_timeout=10
```
- `connection_limit=5`: Max 5 connections per Lambda instance
- Lambda max concurrency: ~1000, so max 5000 connections (RDS can handle)

---

### 4. API Gateway HTTP API vs. REST API

**Decision: HTTP API v2**

**Rationale:**
- **Cost**: 70% cheaper than REST API
- **Performance**: Lower latency (optimized routing)
- **JWT Authorizer**: Native Cognito integration
- **Simpler**: Less features, but we don't need them

**Trade-offs:**
- No API key support (not needed with Cognito)
- No usage plans (not needed for B2C)
- No request validation (done in Lambda)

**When to use REST API:**
- Need API keys for third-party integrations
- Need request/response transformations
- Need usage plans and quotas

---

### 5. Multi-Table vs. Materialized Views

**Decision: Hybrid (tables + networth_materialized)**

**Rationale:**
- **Frequent Queries**: Net worth calculation is expensive (joins + aggregates)
- **Read-Heavy**: Dashboard loads net worth every page load
- **Acceptable Staleness**: Net worth updated monthly, not real-time

**Implementation:**
```sql
CREATE MATERIALIZED VIEW networth_materialized AS
SELECT
  user_id,
  month,
  SUM(value) as total_assets,
  SUM(value) as net_worth  -- Future: subtract liabilities
FROM asset_inputs
GROUP BY user_id, month;

-- Refresh after asset input
REFRESH MATERIALIZED VIEW CONCURRENTLY networth_materialized;
```

**Trade-offs:**
- Staleness (mitigated with refresh on write)
- Storage overhead (minimal, pre-computed data)
- Maintenance (must remember to refresh)

---

### 6. Next.js App Router vs. Pages Router

**Decision: App Router**

**Rationale:**
- **React Server Components**: Reduce client bundle size
- **Layouts**: Shared UI (navbar, sidebar) without re-renders
- **Streaming**: Progressive rendering for slow queries
- **Future-proof**: New standard, Pages Router legacy

**Trade-offs:**
- Steeper learning curve (new paradigms)
- Some libraries not compatible yet
- Less documentation/examples

**When to use Pages Router:**
- Need getServerSideProps/getStaticProps patterns
- Team not ready for new paradigm
- Critical libraries incompatible with App Router

---

### 7. React Query vs. Redux

**Decision: React Query (TanStack Query)**

**Rationale:**
- **Server State Specialization**: Built for async data fetching
- **Automatic Caching**: No manual cache management
- **Optimistic Updates**: Built-in patterns
- **Less Boilerplate**: No actions, reducers, selectors

**When to use Redux:**
- Complex client-side state (multi-step forms, undo/redo)
- Need centralized event log (time-travel debugging)
- Team already familiar with Redux patterns

**React Query patterns used:**
```typescript
// Queries (read data)
const { data, isLoading } = useQuery({
  queryKey: ['assets'],
  queryFn: fetchAssets,
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// Mutations (write data)
const mutation = useMutation({
  mutationFn: createAsset,
  onSuccess: () => queryClient.invalidateQueries(['assets']),
});
```

---

## Security Architecture

### Network Security

```
Internet
   │
   │ HTTPS only (TLS 1.2+)
   ▼
CloudFront (future) / API Gateway
   │
   │ WAF rules (future)
   ▼
API Gateway
   │
   │ Cognito JWT validation
   │ Rate limiting (5000 burst)
   ▼
Lambda (Private Subnet)
   │
   │ Security Group: Egress only
   │ - RDS: port 5432
   │ - HTTPS: port 443 (via NAT)
   ▼
RDS (Private Subnet)
   │
   │ Security Group: Ingress only
   │ - Lambda SG: port 5432
   │ SSL/TLS enforced
```

**Security Group Rules:**

Lambda Security Group:
- **Ingress**: None (API Gateway invokes via AWS internal)
- **Egress**:
  - RDS SG on port 5432 (TCP)
  - 0.0.0.0/0 on port 443 (HTTPS for AWS SDK, Prisma packages)

RDS Security Group:
- **Ingress**: Lambda SG on port 5432 (TCP)
- **Egress**: None

Bastion Security Group (dev only):
- **Ingress**: SSM Session Manager (no SSH port 22!)
- **Egress**: RDS SG on port 5432

### Authentication Security

**JWT Verification Flow:**

1. **API Gateway Level** (Cognito Authorizer):
   - Validates JWT signature using Cognito public keys
   - Checks token expiration (`exp` claim)
   - Verifies issuer matches User Pool
   - Checks audience matches Client ID

2. **Lambda Level** (middleware/auth.ts):
   - Extracts `sub` claim (Cognito user ID)
   - Queries database for user record
   - Auto-provisions user if first login
   - Attaches internal `userId` to request context

**Token Expiration Handling:**

Frontend (Amplify SDK):
```typescript
// Auto-refresh before expiration
Auth.currentSession()
  .then(session => {
    const accessToken = session.getAccessToken().getJwtToken();
    // Use token for API calls
  })
  .catch(error => {
    // Token expired, redirect to login
    Router.push('/login');
  });
```

### Data Security

**Encryption at Rest:**
- **RDS**: AES-256 encryption (AWS KMS)
- **Secrets Manager**: Encrypted with KMS
- **EBS volumes**: Encrypted (Lambda ephemeral storage)

**Encryption in Transit:**
- **HTTPS**: TLS 1.2+ enforced
- **RDS Connection**: SSL/TLS enforced (`sslmode=require`)
- **AWS Service Calls**: HTTPS by default

**Secrets Management:**

```
Terraform provisions secret:
  arn:aws:secretsmanager:eu-central-1:*:secret:finally/dev/rds-*
    {
      "username": "finally_admin",
      "password": "<generated>",
      "engine": "postgres",
      "host": "<rds-endpoint>",
      "port": 5432,
      "dbname": "finally"
    }

Lambda retrieves via:
  - Environment variable: DATABASE_SECRET_ARN
  - IAM role permission: secretsmanager:GetSecretValue
  - Prisma reads secret, constructs DATABASE_URL
```

### IAM Security (Least Privilege)

**Lambda Execution Role:**
```hcl
{
  "Effect": "Allow",
  "Action": [
    "ec2:CreateNetworkInterface",
    "ec2:DescribeNetworkInterfaces",
    "ec2:DeleteNetworkInterface"
  ],
  "Resource": "*"
}

{
  "Effect": "Allow",
  "Action": [
    "secretsmanager:GetSecretValue"
  ],
  "Resource": "arn:aws:secretsmanager:*:*:secret:finally/dev/rds-*"
}

{
  "Effect": "Allow",
  "Action": [
    "logs:CreateLogGroup",
    "logs:CreateLogStream",
    "logs:PutLogEvents"
  ],
  "Resource": "arn:aws:logs:*:*:log-group:/aws/lambda/finally-dev-api*"
}
```

**No overly permissive policies** (no `*:*`)

---

## Performance & Scalability

### Current Performance Metrics (Dev)

| Metric | Current | Target (Prod) |
|--------|---------|---------------|
| Lambda cold start | 2-3s | <500ms (provisioned concurrency) |
| Lambda warm execution | 200-500ms | <200ms |
| Database query | <100ms | <50ms (RDS proxy, read replicas) |
| Frontend TTFB | 500-800ms | <300ms (CDN) |
| Frontend FCP | 1-2s | <1s |
| API Gateway latency | <50ms | <30ms |

### Scaling Characteristics

**Lambda Auto-Scaling:**
- Default: 1000 concurrent executions
- Burst: 3000 concurrent executions (first minute)
- Scales automatically based on incoming requests
- No configuration needed

**RDS Scaling:**
- Vertical: Upgrade instance class (t3.micro → t3.medium)
- Horizontal: Read replicas for read-heavy workloads
- Storage: Auto-scales up to 1TB (current: 20GB)

**Prisma Connection Pooling:**
```
Single Lambda instance: 5 connections max
1000 concurrent Lambdas: 5000 connections
RDS t3.micro max_connections: ~100 (NOT ENOUGH!)

Solution for production:
1. RDS Proxy (connection pooling at AWS level)
2. Larger RDS instance (more connections)
3. Read replicas for read-heavy queries
```

### Optimization Strategies

**1. Provisioned Concurrency (Production)**

```hcl
resource "aws_lambda_provisioned_concurrency_config" "api" {
  function_name                     = aws_lambda_function.api.function_name
  provisioned_concurrent_executions = 5
  qualifier                         = aws_lambda_alias.prod.name
}
```

Cost: ~€20/month for 5 instances
Benefit: Eliminates cold starts for 95% of requests

**2. RDS Proxy (Production)**

```hcl
resource "aws_db_proxy" "main" {
  name                   = "finally-prod-proxy"
  engine_family          = "POSTGRESQL"
  auth {
    secret_arn = aws_secretsmanager_secret.rds_credentials.arn
  }
  role_arn               = aws_iam_role.proxy.arn
  vpc_subnet_ids         = var.private_subnet_ids
  require_tls            = true
}
```

Benefit:
- Pools connections across Lambda instances
- Supports 100x more connections than RDS directly
- Reduces database CPU usage
- Automatic failover for Multi-AZ

**3. Caching Strategy**

Frontend (React Query):
- Cache TTL: 5 minutes
- Stale-while-revalidate
- Optimistic updates

Backend (future: ElastiCache Redis):
```typescript
// Cache expensive queries
const cacheKey = `allocation:${userId}`;
let allocation = await redis.get(cacheKey);
if (!allocation) {
  allocation = await calculateAllocation(userId);
  await redis.setex(cacheKey, 300, JSON.stringify(allocation)); // 5 min TTL
}
```

**4. Database Indexing**

```sql
-- Current indexes
CREATE INDEX idx_assets_user_id ON assets(user_id);
CREATE INDEX idx_asset_inputs_user_month ON asset_inputs(user_id, month);
CREATE INDEX idx_expense_items_user_date ON expense_items(user_id, date);
CREATE INDEX idx_expense_items_category ON expense_items(category_id);
```

Query performance:
```sql
EXPLAIN ANALYZE SELECT * FROM asset_inputs WHERE user_id = 1 AND month BETWEEN '2025-01' AND '2025-12';

-- Before index: Seq Scan (15ms)
-- After index: Index Scan (2ms)
```

---

## Monitoring & Observability

### CloudWatch Metrics

**Lambda Metrics:**
- Invocations
- Duration (p50, p90, p99)
- Errors
- Throttles
- Concurrent Executions
- Cold Starts (custom metric)

**API Gateway Metrics:**
- Count (requests)
- Latency (p50, p90, p99)
- 4XXError
- 5XXError
- IntegrationLatency

**RDS Metrics:**
- CPUUtilization
- DatabaseConnections
- FreeableMemory
- ReadLatency / WriteLatency
- DiskQueueDepth

### Logging Strategy

**Lambda Logs:**
```typescript
console.log('[INFO]', 'Request received:', {
  method: event.requestContext.http.method,
  path: event.requestContext.http.path,
  userId: userId,
});

console.error('[ERROR]', 'Database query failed:', {
  error: error.message,
  stack: error.stack,
  query: 'SELECT * FROM assets WHERE user_id = ?',
});
```

**Log Retention:**
- Dev: 7 days
- Prod: 30 days
- Archived to S3 for long-term storage (future)

**Structured Logging (future: CloudWatch Insights queries):**
```sql
fields @timestamp, message, userId, error
| filter message like /ERROR/
| stats count() by userId
| sort count desc
```

### Alerting (Phase 7)

**CloudWatch Alarms:**
1. Lambda errors > 10 in 5 minutes → SNS topic
2. API Gateway 5XX > 5% of requests → SNS topic
3. RDS CPU > 80% for 10 minutes → SNS topic
4. RDS connections > 80% of max → SNS topic

**SNS Topic → Email/Slack/PagerDuty**

---

## Cost Optimization

### Current Costs (Dev Environment)

| Service | Configuration | Monthly Cost | Annual Cost |
|---------|---------------|--------------|-------------|
| NAT Gateway | Single AZ | €32.00 | €384 |
| RDS t3.micro | 20GB storage | €0 (Free Tier) | €180 (after) |
| EC2 Bastion | t3.micro on-demand | €8.00 (if running) | €96 |
| Lambda | 512MB, <1M invocations | €0 (Free Tier) | €10 |
| API Gateway | <1M requests | €0 (Free Tier) | €5 |
| Secrets Manager | 1 secret | €0.40 | €5 |
| CloudWatch Logs | 7-day retention | €1.00 | €12 |
| ECR | <500MB images | €0.05 | €0.60 |
| **Total** | | **~€40/mo** | **€692/yr** |

### Cost Optimization Strategies

**1. Terminate Bastion When Not Needed**
- Bastion only needed for database migrations
- Terminate after migration: `aws ec2 terminate-instances --instance-ids <bastion-id>`
- Savings: €8/month

**2. NAT Gateway Alternatives**

Option A: VPC Endpoints (€7/month each)
- com.amazonaws.eu-central-1.secretsmanager (€7)
- com.amazonaws.eu-central-1.ecr.api (€7)
- com.amazonaws.eu-central-1.ecr.dkr (€7)
- Total: €21/month (€11 savings)

Option B: NAT Instance (t4g.nano, €3/month)
- DIY NAT routing on cheap instance
- Savings: €29/month
- Trade-off: Manual management, single point of failure

**3. RDS Optimization**

- Use Aurora Serverless v2 (scales to zero)
- Cost: €0 when idle, €0.12/ACU-hour when active
- Typical usage: ~€15-20/month (vs. €15 for t3.micro)

**4. CloudWatch Log Optimization**

- Reduce retention: 7 days → 3 days (€0.50 savings)
- Export to S3 after 7 days (€0.02/GB vs. €0.50/GB in CloudWatch)

**Production Cost Estimate:**

| Service | Configuration | Monthly Cost |
|---------|---------------|--------------|
| NAT Gateway | Single AZ | €32 |
| RDS t3.small | 50GB storage, Multi-AZ | €70 |
| Lambda | Provisioned concurrency (5), 1M requests | €35 |
| API Gateway | 1M requests | €1 |
| RDS Proxy | 2 connections | €15 |
| CloudWatch | 30-day retention, alarms | €5 |
| **Total** | | **€158/mo** |

---

## Future Considerations

### Phase 6: CI/CD (In Progress)

**GitHub Actions Workflows:**
```yaml
.github/workflows/
├── frontend-ci.yml       # Lint, type-check, build
├── lambda-ci.yml         # Lint, type-check, test
├── terraform-plan.yml    # Terraform plan on PR
└── deploy-prod.yml       # Deploy to production (manual trigger)
```

**Deployment Pipeline:**
1. PR created → Run tests, lint, type-check
2. PR merged → Deploy to staging
3. Staging verified → Manual deploy to prod
4. Blue-green deployment (zero downtime)

### Phase 7: Advanced Monitoring

- **Distributed Tracing**: AWS X-Ray (trace requests across services)
- **Custom Metrics**: Business metrics (DAU, assets created, etc.)
- **Real User Monitoring**: Frontend performance metrics
- **Log Aggregation**: CloudWatch Insights queries

### Phase 8: Scalability Enhancements

**Database:**
- Read replicas for analytics queries
- Partitioning (by user_id or date)
- Caching layer (ElastiCache Redis)

**API:**
- GraphQL (reduce over-fetching)
- WebSockets (real-time updates)
- API versioning (/v1, /v2)

**Frontend:**
- Server-side rendering (SSR) for better SEO
- Static generation for marketing pages
- Edge caching (CloudFront + Lambda@Edge)

### Long-Term Roadmap

**Multi-Currency Support:**
- Add `currency` column to assets, expenses
- Exchange rate API integration
- Currency conversion for net worth

**Real-Time Market Data:**
- Integrate with market data APIs (Alpha Vantage, IEX Cloud)
- Automatic asset value updates
- Portfolio performance tracking

**Mobile Application:**
- React Native app (shared business logic)
- Push notifications (bill reminders, budget alerts)
- Offline support with local database

**AI-Powered Insights:**
- Spending pattern analysis
- Budget recommendations
- Investment diversification advice

---

## Conclusion

The FinAlly architecture prioritizes serverless patterns, security, and developer experience. Key strengths:

- **Serverless-first**: Auto-scaling, pay-per-use, no server management
- **Type-safe**: Full TypeScript coverage reduces runtime errors
- **Secure by default**: Private networking, JWT auth, encrypted data
- **Infrastructure as Code**: Version-controlled, reproducible deployments
- **Cost-effective**: Free Tier eligible, ~€40/month for dev

Trade-offs made for current phase:
- Cold starts (acceptable for dev, will use provisioned concurrency in prod)
- NAT Gateway cost (€32/month, exploring VPC endpoints)
- Single Lambda function (monolithic, may split into microservices later)

The architecture is designed to evolve from dev → staging → production with minimal refactoring. Terraform modules are reusable, and the serverless foundation scales automatically to production workloads.

---

**Architecture Version:** Phase 5 Complete
**Last Reviewed:** December 2025
**Next Review:** Phase 6 (CI/CD implementation)
