# Lambda Backend Development Guide

> **Practical guide for developing and extending the FinAlly serverless API**

Comprehensive workflows, patterns, and best practices for building API endpoints, integrating with Prisma, and deploying Lambda functions.

**Stack:** Node.js 20 + TypeScript + Prisma + PostgreSQL + Docker
**Last Updated:** December 2025

---

## Table of Contents

1. [Development Workflow](#development-workflow)
2. [Project Structure](#project-structure)
3. [Adding New API Routes](#adding-new-api-routes)
4. [Prisma Usage](#prisma-usage)
5. [Database Migrations](#database-migrations)
6. [Authentication](#authentication)
7. [Error Handling](#error-handling)
8. [Request Validation](#request-validation)
9. [Response Formatting](#response-formatting)
10. [Testing Endpoints](#testing-endpoints)
11. [Docker Build](#docker-build)
12. [Deployment](#deployment)
13. [Debugging](#debugging)
14. [Performance](#performance)
15. [Common Patterns](#common-patterns)
16. [Anti-Patterns](#anti-patterns)

---

## Development Workflow

### Local Setup

```bash
cd lambda
npm install              # Install dependencies
npx prisma generate      # Generate Prisma client
npm run build            # Compile TypeScript
```

### Development Cycle

**1. Make code changes** in `src/` directory

**2. Regenerate Prisma client** (if schema changed):

```bash
npx prisma generate
```

**3. Build TypeScript:**

```bash
npm run build

# Output: dist/index.js
```

**4. Test locally** (if VPC access configured):

```bash
# Set environment variables
export DATABASE_URL="postgresql://..."
export COGNITO_USER_POOL_ID="eu-central-1_xxxxxxxxx"
export COGNITO_WEB_CLIENT_ID="xxxxxxxxxxxxxxxxxxxxxxxxxx"

# Run handler
node dist/index.js
```

**5. Deploy to Lambda:**

```bash
./push-to-ecr.sh
```

This script:
- Builds Docker image
- Pushes to ECR
- Lambda auto-updates from ECR:latest

---

## Project Structure

```
lambda/
├── src/
│   ├── index.ts                    # Main Lambda handler (routing)
│   ├── handlers/                   # Specialized handlers
│   │   ├── health.ts               # Health check (no auth)
│   │   └── users.ts                # User management
│   ├── routes/                     # API route handlers (8 files)
│   │   ├── assets.ts               # Asset CRUD
│   │   ├── assetInputs.ts          # Monthly asset snapshots
│   │   ├── incomings.ts            # Income tracking
│   │   ├── expenses.ts             # Expense tracking
│   │   ├── subcategories.ts        # Expense subcategories
│   │   ├── budgets.ts              # Budget management
│   │   ├── allocation.ts           # Asset allocation analysis
│   │   └── networth.ts             # Net worth calculations
│   ├── middleware/                 # Request middleware
│   │   └── auth.ts                 # JWT verification + user lookup
│   ├── lib/                        # Core libraries
│   │   └── prisma.ts               # Prisma client singleton
│   └── utils/                      # Utility functions
│       ├── response.ts             # Response formatting (success/error)
│       └── eventHelpers.ts         # API Gateway event parsing
├── prisma/
│   └── schema.prisma               # Database schema (single source of truth)
├── dist/                           # Build output (gitignored)
│   └── index.js                    # Bundled Lambda handler
├── Dockerfile                      # Multi-stage container build
├── push-to-ecr.sh                  # Deployment script
├── package.json                    # Dependencies & scripts
├── tsconfig.json                   # TypeScript configuration
└── README.md                       # Architecture overview
```

---

## Adding New API Routes

### Step 1: Create Route Handler

**Example: Add `/transactions` endpoint (combines income + expenses)**

**src/routes/transactions.ts:**

```typescript
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getPrismaClient } from '../lib/prisma.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { parseQueryParams } from '../utils/eventHelpers.js';

const prisma = getPrismaClient();

export async function handleTransactions(
  event: APIGatewayProxyEventV2,
  userId: number
): Promise<APIGatewayProxyResultV2> {
  const method = event.requestContext.http.method;
  const path = event.requestContext.http.path;

  try {
    if (method === 'GET' && path === '/transactions') {
      return await getTransactions(event, userId);
    }

    return errorResponse(404, 'Route not found', 'NOT_FOUND');
  } catch (error: any) {
    console.error('[ERROR] Transactions route error:', error);
    return errorResponse(500, 'Internal server error', 'INTERNAL_ERROR', {
      error: error.message,
    });
  }
}

async function getTransactions(
  event: APIGatewayProxyEventV2,
  userId: number
): Promise<APIGatewayProxyResultV2> {
  const { from, to } = parseQueryParams(event, ['from', 'to']);

  // Fetch income and expenses in parallel
  const [incomings, expenses] = await Promise.all([
    prisma.incoming_items.findMany({
      where: {
        user_id: userId,
        ...(from && to ? {
          date: {
            gte: new Date(from + '-01'),
            lte: new Date(to + '-31'),
          },
        } : {}),
      },
      include: {
        income_categories: true,
      },
      orderBy: { date: 'desc' },
    }),
    prisma.expense_items.findMany({
      where: {
        user_id: userId,
        ...(from && to ? {
          date: {
            gte: new Date(from + '-01'),
            lte: new Date(to + '-31'),
          },
        } : {}),
      },
      include: {
        expense_categories: true,
        expense_subcategories: true,
      },
      orderBy: { date: 'desc' },
    }),
  ]);

  // Transform and combine
  const transactions = [
    ...incomings.map(item => ({
      id: `income_${item.id}`,
      type: 'income' as const,
      date: item.date,
      amount: item.amount,
      category: item.income_categories.name,
      description: item.description,
    })),
    ...expenses.map(item => ({
      id: `expense_${item.id}`,
      type: 'expense' as const,
      date: item.date,
      amount: -item.amount, // Negative for expenses
      category: item.expense_categories.name,
      subcategory: item.expense_subcategories?.name,
      description: item.description,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return successResponse({ transactions });
}
```

### Step 2: Register Route in Main Handler

**src/index.ts:**

```typescript
import { handleTransactions } from './routes/transactions.js';

export const handler = async (event: APIGatewayProxyEventV2) => {
  const path = event.requestContext.http.path;
  const method = event.requestContext.http.method;

  // ... existing routes ...

  // Add new route
  if (path.startsWith('/transactions')) {
    const { userId } = await authenticateRequest(event);
    return handleTransactions(event, userId);
  }

  return errorResponse(404, 'Route not found', 'NOT_FOUND');
};
```

### Step 3: Add API Gateway Route (Terraform)

**terraform/modules/api-gateway/main.tf:**

```hcl
resource "aws_apigatewayv2_route" "get_transactions" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "GET /transactions"
  target             = "integrations/${aws_apigatewayv2_integration.lambda.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}
```

### Step 4: Deploy

```bash
# 1. Build and push Docker image
./push-to-ecr.sh

# 2. Apply Terraform changes
cd ../../terraform/environments/dev
terraform apply
```

---

## Prisma Usage

### Prisma Client Singleton

**src/lib/prisma.ts:**

```typescript
import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      log: ['warn', 'error'],
      // Connection pooling handled by DATABASE_URL query params
    });
  }
  return prisma;
}
```

**Why singleton?**
- Lambda reuses container instances (warm starts)
- Prisma client connects on first query
- Reuse connection across invocations in same container
- Prevents connection exhaustion

### CRUD Operations

**Create:**

```typescript
const asset = await prisma.assets.create({
  data: {
    user_id: userId,
    name: 'Bitcoin',
    ticker_symbol: 'BTC',
    category_id: 3,
    notes: 'Long-term hold',
  },
});
```

**Read (single):**

```typescript
const asset = await prisma.assets.findUnique({
  where: { id: assetId },
  include: {
    asset_categories: true, // Join with categories table
  },
});

if (!asset || asset.user_id !== userId) {
  return errorResponse(404, 'Asset not found', 'NOT_FOUND');
}
```

**Read (many with filters):**

```typescript
const expenses = await prisma.expense_items.findMany({
  where: {
    user_id: userId,
    category_id: 4, // Food category
    date: {
      gte: new Date('2025-01-01'),
      lte: new Date('2025-12-31'),
    },
  },
  include: {
    expense_categories: true,
    expense_subcategories: true,
  },
  orderBy: { date: 'desc' },
  take: 100, // Limit results
});
```

**Update:**

```typescript
const asset = await prisma.assets.update({
  where: { id: assetId },
  data: {
    name: 'Bitcoin (Updated)',
    notes: 'Updated notes',
  },
});
```

**Delete:**

```typescript
await prisma.assets.delete({
  where: { id: assetId },
});
```

**Transactions (atomic operations):**

```typescript
await prisma.$transaction(async (tx) => {
  // Create expense
  const expense = await tx.expense_items.create({
    data: { /* ... */ },
  });

  // Update budget
  await tx.budgets.update({
    where: { category_id: expense.category_id },
    data: {
      spent: { increment: expense.amount },
    },
  });
});
```

### Aggregations

**Sum:**

```typescript
const result = await prisma.asset_inputs.aggregate({
  where: { user_id: userId, month: '2025-12' },
  _sum: { value: true },
});

const totalAssets = result._sum.value || 0;
```

**Count:**

```typescript
const count = await prisma.expense_items.count({
  where: { user_id: userId, category_id: 4 },
});
```

**Group by:**

```typescript
const expensesByCategory = await prisma.expense_items.groupBy({
  by: ['category_id'],
  where: { user_id: userId },
  _sum: { amount: true },
  _count: true,
});
```

---

## Database Migrations

### Creating Migrations

**Option 1: Schema-first (Recommended)**

1. Edit `prisma/schema.prisma`
2. Generate SQL migration:

```bash
npx prisma migrate dev --name add_transaction_status
```

3. Review generated SQL in `prisma/migrations/`
4. Apply migration:

```bash
npx prisma migrate deploy
```

**Option 2: SQL-first (Used in FinAlly)**

1. Write SQL migration in `database/migrations/`
2. Apply via SSM bastion:

```bash
cd ../../scripts
./apply_migration_ssm.sh database/migrations/003_add_transaction_status.sql
```

3. Update `prisma/schema.prisma` to match
4. Regenerate Prisma client:

```bash
npx prisma generate
```

### Migration Best Practices

**Do:**
- ✅ Test migrations on dev first
- ✅ Backup database before production migration
- ✅ Make migrations reversible (write down migration)
- ✅ Use transactions for multi-statement migrations
- ✅ Add indexes for foreign keys

**Don't:**
- ❌ Edit existing migrations (create new ones)
- ❌ Delete migration files
- ❌ Skip migrations (apply in order)
- ❌ Modify production schema directly

**Example migration with rollback:**

```sql
-- Up migration (003_add_status.sql)
BEGIN;

ALTER TABLE expense_items ADD COLUMN status VARCHAR(20) DEFAULT 'pending';
CREATE INDEX idx_expense_items_status ON expense_items(status);

COMMIT;

-- Down migration (003_add_status_down.sql)
BEGIN;

DROP INDEX idx_expense_items_status;
ALTER TABLE expense_items DROP COLUMN status;

COMMIT;
```

---

## Authentication

### JWT Verification Flow

**src/middleware/auth.ts:**

```typescript
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { getPrismaClient } from '../lib/prisma.js';

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID!,
  tokenUse: 'id',
  clientId: process.env.COGNITO_WEB_CLIENT_ID!,
});

const prisma = getPrismaClient();

export async function authenticateRequest(
  event: APIGatewayProxyEventV2
): Promise<{ userId: number; cognitoId: string }> {
  // Extract JWT from Authorization header
  const authHeader = event.headers.authorization || event.headers.Authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }

  const token = authHeader.substring(7); // Remove "Bearer "

  // Verify JWT with Cognito
  const payload = await verifier.verify(token);
  const cognitoId = payload.sub;

  // Get or create user in database
  let user = await prisma.users.findUnique({
    where: { cognito_id: cognitoId },
  });

  if (!user) {
    // Auto-provision user on first login
    user = await prisma.users.create({
      data: {
        cognito_id: cognitoId,
        email: payload.email || '',
        name: payload.name || payload.email || 'User',
      },
    });
    console.log('[INFO] Auto-provisioned user:', user.id);
  }

  return { userId: user.id, cognitoId };
}
```

**Usage in route handler:**

```typescript
export async function handleAssets(
  event: APIGatewayProxyEventV2,
  userId: number // Provided by auth middleware
): Promise<APIGatewayProxyResultV2> {
  // userId is guaranteed to be valid here
  const assets = await prisma.assets.findMany({
    where: { user_id: userId },
  });

  return successResponse({ assets });
}
```

### Testing Authentication Locally

**Get JWT token:**

```bash
# Option 1: Frontend (copy from browser dev tools)
# Option 2: AWS CLI
aws cognito-idp admin-initiate-auth \
  --user-pool-id eu-central-1_xxxxxxxxx \
  --client-id xxxxxxxxxxxxxxxxxxxxxxxxxx \
  --auth-flow ADMIN_NO_SRP_AUTH \
  --auth-parameters USERNAME=user@example.com,PASSWORD=password \
  --query 'AuthenticationResult.IdToken' \
  --output text
```

**Test endpoint with token:**

```bash
TOKEN="eyJraWQ..."

curl -H "Authorization: Bearer $TOKEN" \
  https://z7rz9vksp6.execute-api.eu-central-1.amazonaws.com/assets
```

---

## Error Handling

### Standard Error Response

**src/utils/response.ts:**

```typescript
import { APIGatewayProxyResultV2 } from 'aws-lambda';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

export function errorResponse(
  statusCode: number,
  message: string,
  code?: string,
  details?: any
): APIGatewayProxyResultV2 {
  return {
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
  };
}
```

### Error Handling Patterns

**Validation errors:**

```typescript
if (!name || name.length < 2) {
  return errorResponse(400, 'Name must be at least 2 characters', 'VALIDATION_ERROR');
}
```

**Resource not found:**

```typescript
const asset = await prisma.assets.findUnique({ where: { id: assetId } });

if (!asset || asset.user_id !== userId) {
  return errorResponse(404, `Asset with id ${assetId} not found`, 'NOT_FOUND');
}
```

**Database errors:**

```typescript
try {
  await prisma.assets.create({ data: { /* ... */ } });
} catch (error) {
  if (error instanceof PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return errorResponse(400, 'Asset already exists', 'DUPLICATE_ERROR');
    }
    if (error.code === 'P2003') {
      return errorResponse(400, 'Invalid foreign key', 'VALIDATION_ERROR');
    }
  }
  throw error; // Re-throw unknown errors
}
```

**Authentication errors:**

```typescript
try {
  const { userId } = await authenticateRequest(event);
} catch (error) {
  return errorResponse(401, 'Invalid or expired token', 'UNAUTHORIZED');
}
```

### Prisma Error Codes

| Code | Meaning | HTTP Status |
|------|---------|-------------|
| P2002 | Unique constraint violation | 400 |
| P2003 | Foreign key constraint violation | 400 |
| P2025 | Record not found | 404 |
| P2028 | Transaction failed | 500 |

---

## Request Validation

### Query Parameters

**src/utils/eventHelpers.ts:**

```typescript
export function parseQueryParams(
  event: APIGatewayProxyEventV2,
  params: string[]
): Record<string, string | undefined> {
  const queryParams = event.queryStringParameters || {};

  const result: Record<string, string | undefined> = {};
  for (const param of params) {
    result[param] = queryParams[param];
  }

  return result;
}
```

**Usage:**

```typescript
const { from, to, category_id } = parseQueryParams(event, ['from', 'to', 'category_id']);

if (from && !/^\d{4}-\d{2}$/.test(from)) {
  return errorResponse(400, 'Invalid date format (expected YYYY-MM)', 'VALIDATION_ERROR');
}
```

### Request Body

**Parse JSON body:**

```typescript
let body: any;
try {
  body = JSON.parse(event.body || '{}');
} catch (error) {
  return errorResponse(400, 'Invalid JSON body', 'VALIDATION_ERROR');
}

const { name, ticker_symbol, category_id, notes } = body;
```

**Validate required fields:**

```typescript
if (!name || typeof name !== 'string') {
  return errorResponse(400, 'Missing required field: name', 'VALIDATION_ERROR');
}

if (!category_id || typeof category_id !== 'number') {
  return errorResponse(400, 'Missing required field: category_id', 'VALIDATION_ERROR');
}
```

**Advanced validation with Zod (optional):**

```bash
npm install zod
```

```typescript
import { z } from 'zod';

const AssetSchema = z.object({
  name: z.string().min(2).max(100),
  ticker_symbol: z.string().max(10).optional(),
  category_id: z.number().int().min(1).max(9),
  notes: z.string().max(500).optional(),
});

try {
  const data = AssetSchema.parse(body);
  // data is now type-safe and validated
} catch (error) {
  if (error instanceof z.ZodError) {
    return errorResponse(400, 'Validation error', 'VALIDATION_ERROR', {
      errors: error.errors,
    });
  }
}
```

---

## Response Formatting

### Success Response

**src/utils/response.ts:**

```typescript
export function successResponse(
  data: any,
  statusCode: number = 200
): APIGatewayProxyResultV2 {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify({
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
      },
    }),
  };
}
```

**Usage:**

```typescript
// Single resource
return successResponse({ asset });

// List of resources
return successResponse({ assets });

// Created resource (201 status)
return successResponse({ asset }, 201);

// No content (204 status)
return { statusCode: 204, headers: corsHeaders, body: '' };
```

### Data Transformation

**Transform database records before response:**

```typescript
const assets = await prisma.assets.findMany({
  where: { user_id: userId },
  include: {
    asset_categories: true,
  },
});

// Transform to API format
const transformed = assets.map(asset => ({
  id: asset.id,
  name: asset.name,
  ticker_symbol: asset.ticker_symbol,
  category_id: asset.category_id,
  category_name: asset.asset_categories.name, // Flatten join
  market_cap: asset.market_cap,
  notes: asset.notes,
  created_at: asset.created_at.toISOString(),
  updated_at: asset.updated_at.toISOString(),
}));

return successResponse({ assets: transformed });
```

---

## Testing Endpoints

### Manual Testing with curl

**Health check (no auth):**

```bash
curl https://z7rz9vksp6.execute-api.eu-central-1.amazonaws.com/health
```

**Authenticated endpoint:**

```bash
TOKEN="eyJraWQ..."

# GET request
curl -H "Authorization: Bearer $TOKEN" \
  "https://z7rz9vksp6.execute-api.eu-central-1.amazonaws.com/assets"

# POST request
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bitcoin",
    "ticker_symbol": "BTC",
    "category_id": 3
  }' \
  "https://z7rz9vksp6.execute-api.eu-central-1.amazonaws.com/assets"

# PATCH request
curl -X PATCH \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"notes": "Updated notes"}' \
  "https://z7rz9vksp6.execute-api.eu-central-1.amazonaws.com/assets/1"

# DELETE request
curl -X DELETE \
  -H "Authorization: Bearer $TOKEN" \
  "https://z7rz9vksp6.execute-api.eu-central-1.amazonaws.com/assets/1"
```

### Automated Testing Script

**scripts/test_api.sh:**

```bash
#!/bin/bash

API_URL="https://z7rz9vksp6.execute-api.eu-central-1.amazonaws.com"

# Get JWT token (interactive)
echo "Enter email:"
read EMAIL
echo "Enter password:"
read -s PASSWORD

TOKEN=$(aws cognito-idp admin-initiate-auth \
  --user-pool-id eu-central-1_xxxxxxxxx \
  --client-id xxxxxxxxxxxxxxxxxxxxxxxxxx \
  --auth-flow ADMIN_NO_SRP_AUTH \
  --auth-parameters USERNAME=$EMAIL,PASSWORD=$PASSWORD \
  --query 'AuthenticationResult.IdToken' \
  --output text)

# Test endpoints
echo "Testing /health..."
curl -s "$API_URL/health" | jq .

echo "Testing /users/me..."
curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/users/me" | jq .

echo "Testing /assets..."
curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/assets" | jq .
```

### Unit Testing (Phase 6)

**Coming soon: Jest + Prisma mocking**

```typescript
import { handleAssets } from './routes/assets';
import { getPrismaClient } from './lib/prisma';

jest.mock('./lib/prisma');

describe('Assets API', () => {
  it('should return assets for authenticated user', async () => {
    const mockPrisma = getPrismaClient() as jest.Mocked<PrismaClient>;
    mockPrisma.assets.findMany.mockResolvedValue([
      { id: 1, name: 'Bitcoin', /* ... */ },
    ]);

    const event = createMockEvent({ userId: 1 });
    const result = await handleAssets(event, 1);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).data.assets).toHaveLength(1);
  });
});
```

---

## Docker Build

### Multi-Stage Dockerfile

**Dockerfile:**

```dockerfile
# Stage 1: Build
FROM public.ecr.aws/lambda/nodejs:20 AS base

COPY package*.json ./
COPY prisma ./prisma
COPY src ./src

RUN npm install
RUN npx prisma generate
RUN npm run build

# Stage 2: Production
FROM public.ecr.aws/lambda/nodejs:20 AS prod

COPY package*.json ./
RUN npm install --omit=dev

COPY prisma ./prisma
COPY --from=base /var/task/node_modules/.prisma ./node_modules/.prisma
COPY --from=base /var/task/dist ./dist
COPY --from=base /var/task/node_modules ./node_modules

CMD ["dist/index.handler"]
```

**Build locally:**

```bash
docker build -t finally-api .
```

**Run locally:**

```bash
docker run -p 9000:8080 \
  -e DATABASE_URL="postgresql://..." \
  -e COGNITO_USER_POOL_ID="..." \
  -e COGNITO_WEB_CLIENT_ID="..." \
  finally-api
```

**Test local Lambda:**

```bash
curl -X POST "http://localhost:9000/2015-03-31/functions/function/invocations" \
  -d '{
    "requestContext": {
      "http": {
        "method": "GET",
        "path": "/health"
      }
    }
  }'
```

---

## Deployment

### Build and Push to ECR

**push-to-ecr.sh:**

```bash
#!/bin/bash

set -e

AWS_REGION="eu-central-1"
AWS_ACCOUNT_ID="197423061144"
ECR_REPO="finally-dev-api"
IMAGE_TAG="latest"

# Login to ECR
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin \
  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Build image
docker build --platform linux/amd64 -t $ECR_REPO:$IMAGE_TAG .

# Tag image
docker tag $ECR_REPO:$IMAGE_TAG \
  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:$IMAGE_TAG

# Push image
docker push \
  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:$IMAGE_TAG

echo "Image pushed successfully!"
echo "Lambda will auto-update from ECR:latest"
```

**Run deployment:**

```bash
chmod +x push-to-ecr.sh
./push-to-ecr.sh
```

**Verify Lambda update:**

```bash
aws lambda get-function-configuration \
  --function-name finally-dev-api \
  --query 'LastUpdateStatus' \
  --output text

# Should output: Successful
```

---

## Debugging

### CloudWatch Logs

**Tail logs in real-time:**

```bash
aws logs tail /aws/lambda/finally-dev-api --follow
```

**Filter by error level:**

```bash
aws logs filter-log-events \
  --log-group-name /aws/lambda/finally-dev-api \
  --filter-pattern "[ERROR]"
```

**Query logs (CloudWatch Insights):**

```sql
fields @timestamp, @message
| filter @message like /ERROR/
| sort @timestamp desc
| limit 20
```

### Console Logging

**Best practices:**

```typescript
// Info logs
console.log('[INFO]', 'Processing request:', {
  method: event.requestContext.http.method,
  path: event.requestContext.http.path,
  userId: userId,
});

// Error logs
console.error('[ERROR]', 'Database query failed:', {
  error: error.message,
  stack: error.stack,
  userId: userId,
  query: 'SELECT * FROM assets WHERE user_id = ?',
});

// Warning logs
console.warn('[WARN]', 'Rate limit approaching:', {
  userId: userId,
  requestCount: requestCount,
});
```

### Local Debugging

**VS Code launch.json:**

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Lambda",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/dist/index.js",
      "preLaunchTask": "npm: build",
      "env": {
        "DATABASE_URL": "postgresql://...",
        "COGNITO_USER_POOL_ID": "...",
        "COGNITO_WEB_CLIENT_ID": "..."
      }
    }
  ]
}
```

---

## Performance

### Cold Start Optimization

**Current cold start: 2-3 seconds**

**Factors:**
- Lambda container initialization (~500ms)
- Node.js runtime startup (~300ms)
- Prisma client generation (~1-2s) ← Biggest factor
- VPC ENI creation (~500ms)

**Optimization strategies:**

1. **Provisioned Concurrency** (Production):
   - Keeps Lambda instances warm
   - Eliminates cold starts for most requests
   - Cost: ~€20/month for 5 instances

2. **Optimize Bundle Size**:
   ```bash
   npm run build
   ls -lh dist/index.js
   # Target: <100KB
   ```

3. **Lazy Load Heavy Dependencies**:
   ```typescript
   // Bad: Import at top level
   import { someHeavyLibrary } from 'heavy-lib';

   // Good: Dynamic import when needed
   const { someHeavyLibrary } = await import('heavy-lib');
   ```

### Database Query Optimization

**Use indexes:**

```sql
CREATE INDEX idx_asset_inputs_user_month ON asset_inputs(user_id, month);
```

**Explain query plan:**

```bash
npx prisma studio
# Run query and check EXPLAIN output
```

**Limit results:**

```typescript
const assets = await prisma.assets.findMany({
  where: { user_id: userId },
  take: 100, // Limit to 100 results
});
```

**Parallel queries:**

```typescript
// Bad: Sequential
const assets = await prisma.assets.findMany({ /* ... */ });
const expenses = await prisma.expense_items.findMany({ /* ... */ });

// Good: Parallel
const [assets, expenses] = await Promise.all([
  prisma.assets.findMany({ /* ... */ }),
  prisma.expense_items.findMany({ /* ... */ }),
]);
```

---

## Common Patterns

### Route Handler Template

```typescript
export async function handleResource(
  event: APIGatewayProxyEventV2,
  userId: number
): Promise<APIGatewayProxyResultV2> {
  const method = event.requestContext.http.method;
  const path = event.requestContext.http.path;

  try {
    if (method === 'GET' && path === '/resource') {
      return await getResources(event, userId);
    }
    if (method === 'POST' && path === '/resource') {
      return await createResource(event, userId);
    }
    if (method === 'PATCH' && path.startsWith('/resource/')) {
      const id = parseInt(path.split('/')[2]);
      return await updateResource(event, userId, id);
    }
    if (method === 'DELETE' && path.startsWith('/resource/')) {
      const id = parseInt(path.split('/')[2]);
      return await deleteResource(event, userId, id);
    }

    return errorResponse(404, 'Route not found', 'NOT_FOUND');
  } catch (error: any) {
    console.error('[ERROR] Resource route error:', error);
    return errorResponse(500, 'Internal server error', 'INTERNAL_ERROR', {
      error: error.message,
    });
  }
}
```

### User Ownership Check

```typescript
const asset = await prisma.assets.findUnique({
  where: { id: assetId },
});

if (!asset) {
  return errorResponse(404, 'Asset not found', 'NOT_FOUND');
}

if (asset.user_id !== userId) {
  return errorResponse(403, 'You do not have access to this asset', 'FORBIDDEN');
}
```

---

## Anti-Patterns

❌ **Don't create new Prisma client on every request:**
```typescript
// Bad
const prisma = new PrismaClient();
```

✅ **Use singleton:**
```typescript
// Good
const prisma = getPrismaClient();
```

❌ **Don't expose database errors to client:**
```typescript
// Bad
return errorResponse(500, error.message, 'DATABASE_ERROR');
```

✅ **Generic error message:**
```typescript
// Good
console.error('[ERROR]', error);
return errorResponse(500, 'Internal server error', 'INTERNAL_ERROR');
```

❌ **Don't skip user ownership check:**
```typescript
// Bad
const asset = await prisma.assets.findUnique({ where: { id: assetId } });
await prisma.assets.delete({ where: { id: assetId } });
```

✅ **Always verify ownership:**
```typescript
// Good
const asset = await prisma.assets.findUnique({ where: { id: assetId } });
if (!asset || asset.user_id !== userId) {
  return errorResponse(404, 'Asset not found', 'NOT_FOUND');
}
await prisma.assets.delete({ where: { id: assetId } });
```

---

## Further Reading

- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [aws-jwt-verify GitHub](https://github.com/awslabs/aws-jwt-verify)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [API Gateway HTTP API](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api.html)

---

**Development Guide Version:** 1.0 (Phase 5)
**Last Updated:** December 2025
