# API Route Handlers

> **Documentation for all Lambda API route handlers**

Complete reference for the 8 route handler modules that power the FinAlly API.

**Location:** `lambda/src/routes/`
**Last Updated:** December 2025

---

## Overview

Each route handler module exports a main function that handles all HTTP methods for a specific resource. The main handler delegates to specific CRUD operations based on the HTTP method and path.

**Pattern:**
```typescript
export async function handleResource(
  event: APIGatewayProxyEventV2,
  userId: number
): Promise<APIGatewayProxyResultV2>
```

**Common responsibilities:**
- Route matching (method + path)
- Request validation
- Database operations via Prisma
- Response formatting
- Error handling

---

## Route Handlers

### 1. assets.ts

**Resource:** Investment assets (stocks, ETFs, crypto, real estate, etc.)

**Routes:**
- `GET /assets` - List all user's assets
- `POST /assets` - Create new asset
- `PATCH /assets/{id}` - Update asset
- `DELETE /assets/{id}` - Delete asset (cascades to asset_inputs)

**Key Functions:**

```typescript
async function getAssets(userId: number): Promise<APIGatewayProxyResultV2>
```
- Fetches all assets for authenticated user
- Includes category information via join
- Orders by creation date (newest first)

```typescript
async function createAsset(
  event: APIGatewayProxyEventV2,
  userId: number
): Promise<APIGatewayProxyResultV2>
```
- Validates required fields: `name`, `category_id`
- Optional fields: `ticker_symbol`, `market_cap`, `notes`
- Returns 201 Created with asset data

```typescript
async function updateAsset(
  event: APIGatewayProxyEventV2,
  userId: number,
  assetId: number
): Promise<APIGatewayProxyResultV2>
```
- Verifies asset ownership before update
- Allows partial updates (any field optional)
- Returns updated asset

```typescript
async function deleteAsset(
  userId: number,
  assetId: number
): Promise<APIGatewayProxyResultV2>
```
- Verifies asset ownership before deletion
- Cascades to related `asset_inputs` (via DB foreign key)
- Returns success message

**Database Tables:**
- `assets` (main table)
- `asset_categories` (join for category names)

**Business Logic:**
- Assets belong to users (user_id foreign key)
- Assets can have monthly value snapshots (asset_inputs)
- Deleting asset removes all historical snapshots

---

### 2. assetInputs.ts

**Resource:** Monthly asset value snapshots

**Routes:**
- `GET /asset-inputs?from=YYYY-MM&to=YYYY-MM` - Historical snapshots
- `POST /asset-inputs` - Record monthly values (batch operation)

**Key Functions:**

```typescript
async function getAssetInputs(
  event: APIGatewayProxyEventV2,
  userId: number
): Promise<APIGatewayProxyResultV2>
```
- Fetches asset values for date range
- Query params: `from` and `to` (YYYY-MM format)
- Includes asset names via join
- Orders by month (newest first)

```typescript
async function createAssetInputs(
  event: APIGatewayProxyEventV2,
  userId: number
): Promise<APIGatewayProxyResultV2>
```
- **Batch operation**: Creates multiple asset values for same month
- Request body format:
  ```json
  {
    "month": "2025-12",
    "values": [
      { "asset_id": 1, "value": 15000 },
      { "asset_id": 2, "value": 25000 }
    ]
  }
  ```
- Upserts: Updates if entry already exists for month
- Returns count and created entries

**Database Tables:**
- `asset_inputs` (main table)
- `assets` (join for asset names)

**Business Logic:**
- One snapshot per asset per month (unique constraint)
- Used for net worth calculation
- Historical tracking for portfolio performance

---

### 3. incomings.ts

**Resource:** Income entries (salary, bonus, dividend, etc.)

**Routes:**
- `GET /incomings?from=YYYY-MM&to=YYYY-MM` - Income history
- `POST /incomings` - Add income entry
- `DELETE /incomings/{id}` - Remove income

**Key Functions:**

```typescript
async function getIncomings(
  event: APIGatewayProxyEventV2,
  userId: number
): Promise<APIGatewayProxyResultV2>
```
- Fetches income entries for date range
- Includes category names via join
- Orders by date (newest first)

```typescript
async function createIncoming(
  event: APIGatewayProxyEventV2,
  userId: number
): Promise<APIGatewayProxyResultV2>
```
- Required fields: `category_id`, `amount`, `date`
- Optional: `description`
- Validates amount > 0
- Returns created entry with category name

```typescript
async function deleteIncoming(
  userId: number,
  incomingId: number
): Promise<APIGatewayProxyResultV2>
```
- Verifies ownership before deletion
- Returns success message

**Database Tables:**
- `incoming_items` (main table)
- `income_categories` (join for category names)

**Income Categories:**
1. Salary
2. Bonus
3. Dividend
4. Interest
5. Gift
6. Other

---

### 4. expenses.ts

**Resource:** Expense entries with category and optional subcategory

**Routes:**
- `GET /expenses?from=YYYY-MM&to=YYYY-MM` - Expense history
- `POST /expenses` - Add expense entry
- `PATCH /expenses/{id}` - Update expense
- `DELETE /expenses/{id}` - Remove expense

**Key Functions:**

```typescript
async function getExpenses(
  event: APIGatewayProxyEventV2,
  userId: number
): Promise<APIGatewayProxyResultV2>
```
- Fetches expense entries for date range
- Includes category and subcategory names via joins
- Orders by date (newest first)

```typescript
async function createExpense(
  event: APIGatewayProxyEventV2,
  userId: number
): Promise<APIGatewayProxyResultV2>
```
- Required fields: `category_id`, `amount`, `date`
- Optional: `subcategory_id`, `description`
- Validates amount > 0
- Validates subcategory belongs to category (if provided)
- Returns created entry

```typescript
async function updateExpense(
  event: APIGatewayProxyEventV2,
  userId: number,
  expenseId: number
): Promise<APIGatewayProxyResultV2>
```
- Verifies ownership before update
- Allows partial updates
- Returns updated expense

```typescript
async function deleteExpense(
  userId: number,
  expenseId: number
): Promise<APIGatewayProxyResultV2>
```
- Verifies ownership before deletion
- Returns success message

**Database Tables:**
- `expense_items` (main table)
- `expense_categories` (join for category names)
- `expense_subcategories` (optional join for subcategory names)

**Expense Categories:**
1. Rent
2. Utilities
3. Transportation
4. Food
5. Entertainment
6. Healthcare
7. Insurance
8. Education
9. Shopping
10. Personal Care
11. Other

---

### 5. subcategories.ts

**Resource:** Expense subcategories (user-defined + system defaults)

**Routes:**
- `GET /subcategories?category_id=X` - List subcategories
- `POST /subcategories` - Create custom subcategory
- `PATCH /subcategories/{id}` - Update custom subcategory
- `DELETE /subcategories/{id}` - Delete custom subcategory

**Key Functions:**

```typescript
async function getSubcategories(
  event: APIGatewayProxyEventV2,
  userId: number
): Promise<APIGatewayProxyResultV2>
```
- Fetches subcategories for category (if `category_id` provided)
- Returns both system defaults and user-defined subcategories
- System defaults: `is_custom = false`, `user_id = null`
- User-defined: `is_custom = true`, `user_id = userId`

```typescript
async function createSubcategory(
  event: APIGatewayProxyEventV2,
  userId: number
): Promise<APIGatewayProxyResultV2>
```
- Required fields: `category_id`, `name`
- Creates user-defined subcategory (`is_custom = true`)
- Returns created subcategory

```typescript
async function updateSubcategory(
  event: APIGatewayProxyEventV2,
  userId: number,
  subcategoryId: number
): Promise<APIGatewayProxyResultV2>
```
- Only allows updating user-defined subcategories
- Verifies ownership (`user_id = userId` and `is_custom = true`)
- Returns 403 if trying to update system subcategory

```typescript
async function deleteSubcategory(
  userId: number,
  subcategoryId: number
): Promise<APIGatewayProxyResultV2>
```
- Only allows deleting user-defined subcategories
- Verifies ownership
- Returns 403 if trying to delete system subcategory

**Database Tables:**
- `expense_subcategories`
- `expense_categories` (join for category names)

**Business Logic:**
- System subcategories are seeded on database initialization
- Users can create custom subcategories for any expense category
- Users cannot modify/delete system subcategories
- Subcategories are optional when creating expenses

---

### 6. budgets.ts

**Resource:** Monthly budget limits per expense category

**Routes:**
- `GET /budgets` - Fetch all budget limits
- `PATCH /budgets/{category}` - Update category budget limit

**Key Functions:**

```typescript
async function getBudgets(userId: number): Promise<APIGatewayProxyResultV2>
```
- Fetches budget limits for all expense categories
- Returns category names via join
- Only returns categories with budget set (not all 11 categories)

```typescript
async function updateBudget(
  event: APIGatewayProxyEventV2,
  userId: number,
  categoryId: number
): Promise<APIGatewayProxyResultV2>
```
- Required field: `limit` (numeric, positive)
- Upserts: Creates if doesn't exist, updates if exists
- Returns updated budget with category name

**Database Tables:**
- `budgets` (main table)
- `expense_categories` (join for category names)

**Business Logic:**
- One budget per category per user (unique constraint)
- Frontend calculates variance (actual spending vs. budget)
- Budget is monthly (not annual)

---

### 7. allocation.ts

**Resource:** Asset allocation analysis and target management

**Routes:**
- `GET /allocation` - Current vs. target allocation analysis
- `GET /category-allocation-targets` - Fetch allocation targets
- `PATCH /category-allocation-targets/{category}` - Update target allocation

**Key Functions:**

```typescript
async function getAllocation(userId: number): Promise<APIGatewayProxyResultV2>
```
- Calculates current allocation based on latest asset values
- Compares with target allocation percentages
- Returns:
  - Total portfolio value
  - Per-category breakdown:
    - Current value
    - Current percentage
    - Target percentage
    - Difference (current - target)
    - Rebalancing recommendation (amount to buy/sell)

**Complex calculation:**
```typescript
const currentPercentage = (categoryValue / totalValue) * 100;
const difference = currentPercentage - targetPercentage;
const rebalanceAmount = (targetPercentage / 100) * totalValue - categoryValue;
```

```typescript
async function getCategoryTargets(userId: number): Promise<APIGatewayProxyResultV2>
```
- Fetches target allocation percentages for all asset categories
- Returns category names via join

```typescript
async function updateCategoryTarget(
  event: APIGatewayProxyEventV2,
  userId: number,
  categoryId: number
): Promise<APIGatewayProxyResultV2>
```
- Required field: `target_percentage` (0-100)
- Upserts target allocation
- **Note:** No validation that all targets sum to 100% (frontend responsibility)

**Database Tables:**
- `category_allocation_targets`
- `asset_categories` (join for category names)
- `assets` (for current values)
- `asset_inputs` (for latest snapshot values)

**Business Logic:**
- Target percentages are user-defined (default: null)
- Rebalancing recommendations help maintain portfolio diversification
- Uses most recent asset snapshot for current values

---

### 8. networth.ts

**Resource:** Net worth calculation and projection

**Routes:**
- `GET /networth/history?from=YYYY-MM&to=YYYY-MM` - Historical net worth
- `GET /networth/projection?months=N` - Future projection

**Key Functions:**

```typescript
async function getNetworthHistory(
  event: APIGatewayProxyEventV2,
  userId: number
): Promise<APIGatewayProxyResultV2>
```
- Fetches historical net worth data from materialized view
- Query params: `from` and `to` (YYYY-MM format)
- Returns monthly aggregates:
  - Total assets (sum of all asset values)
  - Net worth (currently same as total assets, future: subtract liabilities)

```typescript
async function getNetworthProjection(
  event: APIGatewayProxyEventV2,
  userId: number
): Promise<APIGatewayProxyResultV2>
```
- Calculates future net worth projection based on historical trends
- Query param: `months` (default: 12)
- Algorithm:
  1. Fetch last 12 months of net worth data
  2. Calculate average monthly growth rate
  3. Project forward N months using linear regression
- Returns:
  - Current net worth
  - Projected values for each future month
  - Growth metrics (average monthly growth, rate)

**Database Tables:**
- `networth_materialized` (materialized view for performance)
- `asset_inputs` (underlying data)

**Business Logic:**
- Materialized view refreshed after asset input creation
- Net worth = Total Assets (liabilities not yet implemented)
- Projection uses simple linear regression (can be improved with ML models)

---

## Common Patterns

### Request Validation

All route handlers follow similar validation patterns:

```typescript
// Parse JSON body
let body: any;
try {
  body = JSON.parse(event.body || '{}');
} catch {
  return errorResponse(400, 'Invalid JSON body', 'VALIDATION_ERROR');
}

// Validate required fields
if (!field || typeof field !== 'expectedType') {
  return errorResponse(400, 'Missing or invalid field: fieldName', 'VALIDATION_ERROR');
}

// Validate numeric constraints
if (amount <= 0) {
  return errorResponse(400, 'Amount must be positive', 'VALIDATION_ERROR');
}
```

### Ownership Verification

Before update/delete operations:

```typescript
const resource = await prisma.resource.findUnique({
  where: { id: resourceId },
});

if (!resource) {
  return errorResponse(404, 'Resource not found', 'NOT_FOUND');
}

if (resource.user_id !== userId) {
  return errorResponse(403, 'You do not have access to this resource', 'FORBIDDEN');
}
```

### Response Transformation

Include related data via joins and flatten:

```typescript
const assets = await prisma.assets.findMany({
  where: { user_id: userId },
  include: {
    asset_categories: true, // Join
  },
});

// Transform to API format
const transformed = assets.map(asset => ({
  ...asset,
  category_name: asset.asset_categories.name, // Flatten join
  category_id: asset.category_id,
  // Remove join object from response
  asset_categories: undefined,
}));
```

---

## Error Handling

All route handlers wrap logic in try-catch:

```typescript
try {
  // Route logic
} catch (error: any) {
  console.error('[ERROR] Route error:', error);
  return errorResponse(500, 'Internal server error', 'INTERNAL_ERROR', {
    error: error.message,
  });
}
```

**Prisma-specific errors:**

```typescript
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

if (error instanceof PrismaClientKnownRequestError) {
  if (error.code === 'P2002') {
    return errorResponse(400, 'Resource already exists', 'DUPLICATE_ERROR');
  }
  if (error.code === 'P2025') {
    return errorResponse(404, 'Resource not found', 'NOT_FOUND');
  }
}
```

---

## Adding New Routes

### Step-by-Step Guide

**1. Create new route handler file** in `src/routes/`:

```typescript
// src/routes/newResource.ts
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getPrismaClient } from '../lib/prisma.js';
import { successResponse, errorResponse } from '../utils/response.js';

const prisma = getPrismaClient();

export async function handleNewResource(
  event: APIGatewayProxyEventV2,
  userId: number
): Promise<APIGatewayProxyResultV2> {
  const method = event.requestContext.http.method;
  const path = event.requestContext.http.path;

  try {
    if (method === 'GET' && path === '/new-resource') {
      return await getNewResources(userId);
    }

    // Add more routes...

    return errorResponse(404, 'Route not found', 'NOT_FOUND');
  } catch (error: any) {
    console.error('[ERROR] NewResource route error:', error);
    return errorResponse(500, 'Internal server error', 'INTERNAL_ERROR', {
      error: error.message,
    });
  }
}

async function getNewResources(userId: number): Promise<APIGatewayProxyResultV2> {
  const resources = await prisma.new_resource.findMany({
    where: { user_id: userId },
  });

  return successResponse({ resources });
}
```

**2. Register in main handler** (`src/index.ts`):

```typescript
import { handleNewResource } from './routes/newResource.js';

// In handler function:
if (path.startsWith('/new-resource')) {
  const { userId } = await authenticateRequest(event);
  return handleNewResource(event, userId);
}
```

**3. Add API Gateway routes** (Terraform):

```hcl
resource "aws_apigatewayv2_route" "get_new_resource" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "GET /new-resource"
  target             = "integrations/${aws_apigatewayv2_integration.lambda.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}
```

**4. Deploy:**

```bash
npm run build
./push-to-ecr.sh
cd ../../terraform/environments/dev && terraform apply
```

---

## Testing Routes

**Manual testing with curl:**

```bash
TOKEN="eyJraWQ..."

# GET
curl -H "Authorization: Bearer $TOKEN" \
  "https://z7rz9vksp6.execute-api.eu-central-1.amazonaws.com/assets"

# POST
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "category_id": 1}' \
  "https://z7rz9vksp6.execute-api.eu-central-1.amazonaws.com/assets"

# PATCH
curl -X PATCH \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"notes": "Updated"}' \
  "https://z7rz9vksp6.execute-api.eu-central-1.amazonaws.com/assets/1"

# DELETE
curl -X DELETE \
  -H "Authorization: Bearer $TOKEN" \
  "https://z7rz9vksp6.execute-api.eu-central-1.amazonaws.com/assets/1"
```

---

## Further Reading

- [Lambda Development Guide](../DEVELOPMENT.md)
- [API Reference](../../docs/API.md)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [API Gateway Event Format](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html)

---

**Routes Documentation Version:** 1.0 (Phase 5)
**Last Updated:** December 2025
