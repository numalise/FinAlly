# FinAlly Lambda API

> **Production-grade serverless API built with Node.js 20, TypeScript, and Prisma ORM**

AWS Lambda function providing RESTful API endpoints for the FinAlly personal finance platform. Containerized deployment via ECR, integrated with API Gateway HTTP API v2, and secured with AWS Cognito JWT authentication.

```
Node.js 20 + TypeScript + Prisma + PostgreSQL 16
├─ 8 API Route Handlers
├─ JWT Authentication Middleware
├─ Docker Multi-Stage Build
└─ AWS Lambda Container Runtime
```

---

## Tech Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Runtime** | Node.js | 20.x | Lambda execution environment |
| **Language** | TypeScript | 5.7.2 | Type-safe development |
| **ORM** | Prisma | 6.0.1 | Database operations & migrations |
| **Database** | PostgreSQL | 16.10 | RDS managed instance |
| **Auth** | aws-jwt-verify | 4.0.1 | Cognito JWT validation |
| **Build** | esbuild | 0.24.2 | Fast TypeScript compilation |
| **Container** | Docker | Multi-stage | Lambda deployment |
| **Registry** | ECR | Latest | Container image storage |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  API Gateway HTTP API v2 (Cognito Authorizer)          │
└────────────────────┬────────────────────────────────────┘
                     │ JWT Token
                     ▼
┌─────────────────────────────────────────────────────────┐
│  AWS Lambda Container (Node.js 20)                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │  index.ts (Main Handler)                         │  │
│  │  ├─ Route matching (/assets, /expenses, etc.)    │  │
│  │  ├─ CORS handling                                │  │
│  │  └─ Error boundary                               │  │
│  └────────────┬─────────────────────────────────────┘  │
│               ▼                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Middleware Layer                                │  │
│  │  └─ auth.ts (JWT verification & user extraction) │  │
│  └────────────┬─────────────────────────────────────┘  │
│               ▼                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Route Handlers (8)                              │  │
│  │  ├─ routes/assets.ts                             │  │
│  │  ├─ routes/assetInputs.ts                        │  │
│  │  ├─ routes/incomings.ts                          │  │
│  │  ├─ routes/expenses.ts                           │  │
│  │  ├─ routes/subcategories.ts                      │  │
│  │  ├─ routes/budgets.ts                            │  │
│  │  ├─ routes/allocation.ts                         │  │
│  │  └─ routes/networth.ts                           │  │
│  └────────────┬─────────────────────────────────────┘  │
│               ▼                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Prisma Client (ORM)                             │  │
│  │  └─ Connection pooling & query optimization      │  │
│  └────────────┬─────────────────────────────────────┘  │
└───────────────┼─────────────────────────────────────────┘
                ▼
┌─────────────────────────────────────────────────────────┐
│  RDS PostgreSQL 16.10 (Private Subnet)                  │
│  └─ 14 tables with full relational schema                │
└─────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
lambda/
├── src/
│   ├── index.ts                    # Main Lambda handler (routing)
│   ├── handlers/                   # Specialized handlers
│   │   ├── health.ts               # Health check endpoint
│   │   └── users.ts                # User management
│   ├── routes/                     # API route handlers (8)
│   │   ├── assets.ts               # Asset CRUD operations
│   │   ├── assetInputs.ts          # Monthly asset snapshots
│   │   ├── incomings.ts            # Income tracking
│   │   ├── expenses.ts             # Expense tracking
│   │   ├── subcategories.ts        # Expense subcategories
│   │   ├── budgets.ts              # Budget management
│   │   ├── allocation.ts           # Asset allocation analysis
│   │   └── networth.ts             # Net worth calculations
│   ├── middleware/                 # Request middleware
│   │   └── auth.ts                 # JWT authentication
│   ├── lib/                        # Core libraries
│   │   └── prisma.ts               # Prisma client singleton
│   └── utils/                      # Utilities
│       ├── response.ts             # Response formatting
│       └── eventHelpers.ts         # API Gateway event parsing
├── prisma/
│   └── schema.prisma               # Database schema definition
├── dist/                           # Build output (gitignored)
├── Dockerfile                      # Multi-stage container build
├── push-to-ecr.sh                  # Deployment script
├── package.json                    # Dependencies & scripts
├── tsconfig.json                   # TypeScript configuration
└── README.md                       # This file
```

---

## Key Features

### API Capabilities

**Asset Management**
- Create, read, update, delete investment assets
- Support for 9 asset categories (stocks, ETFs, crypto, real estate, etc.)
- Monthly asset value snapshots with historical tracking
- Asset allocation analysis with target comparison

**Cash Flow Tracking**
- Income and expense recording with categorization
- Custom expense subcategories (user-defined + system defaults)
- Budget management with variance analysis
- Monthly summaries and historical trends

**Analytics & Reporting**
- Net worth calculation and historical tracking
- Net worth projection based on trends
- Asset allocation recommendations
- Budget performance analysis
- Complete data export functionality

### Technical Features

- **JWT Authentication**: AWS Cognito token validation on all protected routes
- **Auto User Provisioning**: Creates user record on first authenticated request
- **Type Safety**: Full TypeScript coverage with Prisma-generated types
- **Connection Pooling**: Prisma connection management prevents exhaustion
- **Standardized Responses**: Consistent API response format across all endpoints
- **CORS Support**: Configurable CORS headers for frontend integration
- **Error Handling**: Centralized error responses with proper HTTP status codes
- **Lambda Optimization**: ESM format, minimal bundle size, cold start optimization

---

## Prerequisites

- Node.js 20.x
- npm 10.x or higher
- AWS CLI configured with `finally_user` profile
- Docker for container builds
- PostgreSQL client (for local testing)
- Access to RDS database via VPC

---

## Installation

```bash
cd lambda
npm install
```

**Dependencies installed:** ~30-40 packages (production + dev)

---

## Environment Variables

Lambda environment variables are managed by Terraform and injected at deployment time. No manual `.env` file is required.

**Runtime Environment Variables (via Terraform):**

```bash
# Database connection (from Secrets Manager)
DATABASE_URL=postgresql://finally_admin:password@host:5432/finally?schema=public&connection_limit=5

# Cognito configuration (from Terraform outputs)
COGNITO_USER_POOL_ID=eu-central-1_xxxxxxxxx
COGNITO_WEB_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx

# Runtime environment
NODE_ENV=production
```

**Prisma Connection String Parameters:**
- `connection_limit=5` - Prevents Lambda connection exhaustion
- `schema=public` - PostgreSQL schema
- `?sslmode=require` - Enforces SSL (RDS requirement)

---

## Development

### Generate Prisma Client

Required after any schema changes:

```bash
npx prisma generate
```

**Output:** Prisma Client generated in `node_modules/.prisma/client`

### Build TypeScript

Compiles TypeScript to JavaScript using esbuild:

```bash
npm run build
```

**Output:**
- `dist/index.js` - Bundled Lambda handler (~80-100KB)
- External dependencies: `@prisma/client`, `@aws-sdk/*`
- ESM format for Lambda Node.js 20 runtime

**Build characteristics:**
- Tree-shaking enabled
- Source maps omitted (production)
- Platform: node
- Target: node20

### Prisma Studio (Database GUI)

Interactive database browser:

```bash
npm run prisma:studio
```

**Access:** http://localhost:5555

**Features:**
- View and edit database records
- Filter and sort data
- Relationship navigation
- Query builder

**Note:** Requires VPC connectivity or SSM tunnel to RDS

---

## Deployment

### Docker Build & Push to ECR

Automated deployment script:

```bash
./push-to-ecr.sh
```

**Process:**
1. Authenticates with ECR (197423061144.dkr.ecr.eu-central-1.amazonaws.com)
2. Builds multi-stage Docker image
3. Tags image as `latest`
4. Pushes to ECR repository
5. Updates Lambda function code

**Multi-Stage Build:**
- **Stage 1 (base)**: Install all dependencies, generate Prisma client, build TypeScript
- **Stage 2 (prod)**: Copy runtime artifacts, omit dev dependencies, optimize image size

**Image size:** ~250-300MB (Node.js 20 runtime + dependencies + Prisma)

### Lambda Function Update

Lambda automatically updates when ECR image is pushed with `latest` tag:

```bash
# Verify function configuration
aws lambda get-function-configuration \
  --function-name finally-dev-api \
  --query 'LastUpdateStatus' \
  --output text

# Should output: Successful
```

**Update triggers:**
- New ECR image pushed with `latest` tag
- Lambda polls ECR for changes
- Automatic deployment (no manual trigger needed)

**Cold start time:** ~2-3 seconds (with Prisma client initialization)

---

## API Integration

### Request Format

**Protected Endpoints (require JWT):**

```bash
curl -H "Authorization: Bearer <jwt-token>" \
  https://z7rz9vksp6.execute-api.eu-central-1.amazonaws.com/assets
```

**Public Endpoints:**

```bash
curl https://z7rz9vksp6.execute-api.eu-central-1.amazonaws.com/health
```

### Response Format

**Success Response:**

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "meta": {
    "timestamp": "2025-12-05T10:00:00.000Z"
  }
}
```

**Error Response:**

```json
{
  "success": false,
  "error": {
    "message": "Resource not found",
    "code": "NOT_FOUND",
    "details": {}
  },
  "meta": {
    "timestamp": "2025-12-05T10:00:00.000Z"
  }
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad request (validation error)
- `401` - Unauthorized (invalid/missing JWT)
- `403` - Forbidden (valid JWT, insufficient permissions)
- `404` - Not found
- `500` - Internal server error

---

## Database Integration (Prisma)

### Prisma Client Usage

**Singleton pattern for Lambda:**

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      log: ['warn', 'error'],
    });
  }
  return prisma;
}
```

**Route handler example:**

```typescript
import { getPrismaClient } from '../lib/prisma.js';

const prisma = getPrismaClient();

// Query with type safety
const assets = await prisma.assets.findMany({
  where: { user_id: userId },
  orderBy: { created_at: 'desc' },
});
```

### Connection Pooling

Prisma manages connection pooling automatically with `connection_limit=5` in DATABASE_URL.

**Why 5 connections?**
- Lambda concurrent executions may spike
- RDS t3.micro max connections: ~100
- Prevents connection exhaustion under load
- Balance between concurrency and resource limits

---

## Authentication Flow

### JWT Validation (middleware/auth.ts)

```typescript
import { CognitoJwtVerifier } from 'aws-jwt-verify';

// Verifier is cached across Lambda invocations
const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID!,
  tokenUse: 'id',
  clientId: process.env.COGNITO_WEB_CLIENT_ID!,
});

// Verify JWT and extract user
const payload = await verifier.verify(token);
const cognitoId = payload.sub;
```

**Flow:**
1. Frontend sends `Authorization: Bearer <jwt>` header
2. API Gateway validates JWT signature (Cognito authorizer)
3. Lambda receives validated JWT in `event.requestContext.authorizer.jwt`
4. Middleware extracts `sub` (Cognito user ID)
5. Middleware queries `users` table to get internal user ID
6. If user doesn't exist, auto-create record
7. Attach `userId` to request context
8. Route handler uses `userId` for database queries

**Auto User Provisioning:**

```typescript
let user = await prisma.users.findUnique({
  where: { cognito_id: cognitoId },
});

if (!user) {
  user = await prisma.users.create({
    data: {
      cognito_id: cognitoId,
      email: payload.email || '',
    },
  });
}
```

---

## Route Handlers Overview

### 1. Assets (`routes/assets.ts`)

**Endpoints:**
- `GET /assets` - List user's assets
- `POST /assets` - Create new asset
- `PATCH /assets/{id}` - Update asset
- `DELETE /assets/{id}` - Delete asset

**Database Tables:** `assets`, `asset_categories`

### 2. Asset Inputs (`routes/assetInputs.ts`)

**Endpoints:**
- `GET /asset-inputs?from=YYYY-MM&to=YYYY-MM` - Historical snapshots
- `POST /asset-inputs` - Record monthly values

**Database Tables:** `asset_inputs`, `assets`

### 3. Income (`routes/incomings.ts`)

**Endpoints:**
- `GET /incomings?from=YYYY-MM&to=YYYY-MM` - Income history
- `POST /incomings` - Add income entry
- `DELETE /incomings/{id}` - Remove income

**Database Tables:** `incoming_items`, `income_categories`

### 4. Expenses (`routes/expenses.ts`)

**Endpoints:**
- `GET /expenses?from=YYYY-MM&to=YYYY-MM` - Expense history
- `POST /expenses` - Add expense
- `PATCH /expenses/{id}` - Update expense
- `DELETE /expenses/{id}` - Remove expense

**Database Tables:** `expense_items`, `expense_categories`, `expense_subcategories`

### 5. Subcategories (`routes/subcategories.ts`)

**Endpoints:**
- `GET /subcategories?category_id=X` - List subcategories
- `POST /subcategories` - Create custom subcategory
- `PATCH /subcategories/{id}` - Update subcategory
- `DELETE /subcategories/{id}` - Delete subcategory

**Database Tables:** `expense_subcategories`

### 6. Budgets (`routes/budgets.ts`)

**Endpoints:**
- `GET /budgets` - Fetch budget limits
- `PATCH /budgets/{category}` - Update category budget

**Database Tables:** `budgets`, `expense_categories`

### 7. Allocation (`routes/allocation.ts`)

**Endpoints:**
- `GET /allocation` - Current vs. target allocation analysis
- `GET /category-allocation-targets` - Allocation targets
- `PATCH /category-allocation-targets/{category}` - Update target

**Database Tables:** `category_allocation_targets`, `assets`, `asset_inputs`

### 8. Net Worth (`routes/networth.ts`)

**Endpoints:**
- `GET /networth/history` - Historical net worth data
- `GET /networth/projection?months=12` - Future projection

**Database Tables:** `networth_materialized`, `asset_inputs`

---

## Error Handling

### Centralized Error Responses

**Response utility (`utils/response.ts`):**

```typescript
export const errorResponse = (
  statusCode: number,
  message: string,
  code?: string,
  details?: any
) => ({
  statusCode,
  headers: corsHeaders,
  body: JSON.stringify({
    success: false,
    error: {
      message,
      code: code || 'INTERNAL_ERROR',
      details: details || {},
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  }),
});
```

**Common error patterns:**

```typescript
// Validation error
return errorResponse(400, 'Invalid request body', 'VALIDATION_ERROR');

// Unauthorized
return errorResponse(401, 'Missing or invalid JWT token', 'UNAUTHORIZED');

// Not found
return errorResponse(404, 'Asset not found', 'NOT_FOUND');

// Internal error
return errorResponse(500, 'Database query failed', 'DATABASE_ERROR', {
  error: error.message,
});
```

---

## Logging

### CloudWatch Logs

**Log group:** `/aws/lambda/finally-dev-api`

**Retention:** 7 days (configurable via Terraform)

**Log format:**

```typescript
console.log('[INFO]', 'Processing request:', {
  method: event.requestContext.http.method,
  path: event.requestContext.http.path,
  userId: userId,
});

console.error('[ERROR]', 'Database error:', {
  error: error.message,
  stack: error.stack,
});
```

**Viewing logs:**

```bash
# Tail logs in real-time
aws logs tail /aws/lambda/finally-dev-api --follow

# Filter by error level
aws logs filter-log-events \
  --log-group-name /aws/lambda/finally-dev-api \
  --filter-pattern "[ERROR]"
```

---

## Testing

### Health Check

```bash
curl https://z7rz9vksp6.execute-api.eu-central-1.amazonaws.com/health
```

**Expected response:**

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-12-05T10:00:00.000Z",
    "service": "FinAlly API"
  },
  "meta": {
    "timestamp": "2025-12-05T10:00:00.000Z"
  }
}
```

### Authenticated Endpoint Test

```bash
# Get JWT token from Cognito
TOKEN="<your-jwt-token>"

# Test protected endpoint
curl -H "Authorization: Bearer $TOKEN" \
  https://z7rz9vksp6.execute-api.eu-central-1.amazonaws.com/users/me
```

### Automated Testing

```bash
npm test
```

**Note:** Tests are planned for Phase 6 (CI/CD Pipelines)

---

## Performance Considerations

### Current Metrics (Dev Environment)

- **Cold Start:** ~2-3 seconds (Prisma client initialization)
- **Warm Execution:** ~200-500ms
- **Database Query:** <100ms (indexed queries)
- **Bundle Size:** ~80-100KB (excluding node_modules)
- **Image Size:** ~250-300MB (Docker)

### Optimization Strategies

**Lambda Configuration:**
- Memory: 512MB (balance between cost and performance)
- Timeout: 30 seconds (API Gateway HTTP API max)
- Ephemeral storage: 512MB (default)

**Prisma Connection Pooling:**
- Connection limit: 5 (prevents exhaustion)
- Lazy connection (only connect on first query)
- Connection reuse across invocations

**Code Optimization:**
- ESM format (faster startup)
- Tree-shaking via esbuild
- External dependencies (@prisma/client stays in node_modules)
- Minimal bundle size

**Future Optimizations (Production):**
- Provisioned concurrency (eliminate cold starts)
- RDS Proxy (connection pooling at database level)
- Read replicas for analytics queries
- Caching layer (Redis/ElastiCache) for frequently accessed data

---

## Security

### JWT Validation

- Token signature verification via aws-jwt-verify
- Cognito issuer validation
- Token expiration checking
- User ID extraction from `sub` claim

### Database Security

- Parameterized queries (Prisma prevents SQL injection)
- SSL/TLS enforced for RDS connections
- Credentials stored in AWS Secrets Manager
- Least-privilege IAM roles

### Input Validation

- Request body validation in route handlers
- Type checking via TypeScript
- Prisma schema constraints enforce data integrity

### CORS Configuration

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};
```

**Note:** Wildcard origin (`*`) is acceptable for public API. Restrict in production if needed.

---

## Common Issues

### Issue: Prisma Client Not Found

**Error:** `Cannot find module '@prisma/client'`

**Solution:**

```bash
npx prisma generate
npm run build
```

### Issue: Database Connection Timeout

**Error:** `Can't reach database server`

**Troubleshooting:**
1. Verify Lambda has VPC configuration
2. Check security group allows Lambda → RDS (port 5432)
3. Verify DATABASE_URL environment variable
4. Check RDS instance is running

```bash
aws rds describe-db-instances \
  --db-instance-identifier finally-dev-postgres \
  --query 'DBInstances[0].DBInstanceStatus'
```

### Issue: Lambda Deployment Fails

**Error:** `ResourceConflictException: The operation cannot be performed`

**Cause:** Lambda is updating from previous deployment

**Solution:** Wait 2-3 minutes and retry

```bash
# Check function status
aws lambda get-function-configuration \
  --function-name finally-dev-api \
  --query 'LastUpdateStatus'
```

### Issue: Unauthorized Errors

**Error:** `401 Unauthorized`

**Troubleshooting:**
1. Verify JWT token is valid (not expired)
2. Check Cognito User Pool ID matches environment variable
3. Verify API Gateway authorizer is configured
4. Check token is sent in `Authorization: Bearer <token>` header

---

## Further Reading

- [DEVELOPMENT.md](DEVELOPMENT.md) - Backend development workflow and patterns
- [prisma/schema.prisma](prisma/schema.prisma) - Database schema definition
- [src/routes/README.md](src/routes/README.md) - API route handlers documentation
- [src/middleware/README.md](src/middleware/README.md) - Middleware documentation
- [Prisma Documentation](https://www.prisma.io/docs)
- [AWS Lambda Container Images](https://docs.aws.amazon.com/lambda/latest/dg/images-create.html)
- [aws-jwt-verify](https://github.com/awslabs/aws-jwt-verify)

---

**Lambda API Version:** 1.0.0 (Phase 5)
**Last Updated:** December 2025
