# FinAlly API Reference

> **RESTful API documentation for the FinAlly personal finance platform**

Complete reference for all HTTP API endpoints, authentication, request/response formats, and error handling.

**Base URL:** `https://z7rz9vksp6.execute-api.eu-central-1.amazonaws.com`
**API Version:** 1.0 (Phase 5)
**Region:** eu-central-1 (Frankfurt)

---

## Table of Contents

1. [Authentication](#authentication)
2. [Common Patterns](#common-patterns)
3. [Response Format](#response-format)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Endpoints](#endpoints)
   - [Health](#health)
   - [Users](#users)
   - [Assets](#assets)
   - [Asset Inputs](#asset-inputs)
   - [Income](#income)
   - [Expenses](#expenses)
   - [Subcategories](#subcategories)
   - [Budgets](#budgets)
   - [Allocation](#allocation)
   - [Net Worth](#net-worth)
   - [Export](#export)

---

## Authentication

### JWT Bearer Token

All endpoints except `/health` require authentication via AWS Cognito JWT token.

**Header Format:**

```http
Authorization: Bearer <JWT_TOKEN>
```

**Token Acquisition:**

Tokens are obtained through the AWS Cognito authentication flow (handled by frontend). Tokens include:
- **ID Token** - Used for API authentication
- **Access Token** - Used for Cognito operations
- **Refresh Token** - Used to refresh expired tokens

**Token Structure (JWT Claims):**

```json
{
  "sub": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "cognito:username": "user@example.com",
  "email": "user@example.com",
  "email_verified": true,
  "iss": "https://cognito-idp.eu-central-1.amazonaws.com/eu-central-1_xxxxxxxxx",
  "exp": 1701234567,
  "iat": 1701230967
}
```

**Token Expiration:**
- ID tokens expire after 1 hour
- Frontend automatically refreshes tokens using refresh token
- 401 Unauthorized returned on expired/invalid token

**Auto User Provisioning:**

On first authenticated request, the API automatically creates a user record in the database:

```sql
INSERT INTO users (cognito_id, email, created_at)
VALUES ('cognito-sub', 'user@example.com', NOW());
```

---

## Common Patterns

### Query Parameters

**Date Range Filtering:**

Many endpoints support `from` and `to` query parameters for date range filtering:

```http
GET /expenses?from=2025-01&to=2025-12
```

- **Format:** `YYYY-MM` (year-month)
- **Inclusive:** Both `from` and `to` are inclusive
- **Optional:** If omitted, defaults vary by endpoint

**Category Filtering:**

```http
GET /subcategories?category_id=4
```

### Path Parameters

Resource identifiers in URL path:

```http
PATCH /assets/{id}
DELETE /expenses/{id}
```

- **Format:** Integer (database primary key)
- **Validation:** 404 if resource doesn't exist or doesn't belong to user

### Request Bodies

All `POST` and `PATCH` requests accept JSON bodies:

```http
Content-Type: application/json

{
  "field1": "value1",
  "field2": 123
}
```

---

## Response Format

### Success Response

**Structure:**

```json
{
  "success": true,
  "data": {
    // Response data (varies by endpoint)
  },
  "meta": {
    "timestamp": "2025-12-05T10:00:00.000Z"
  }
}
```

**HTTP Status Codes:**
- `200 OK` - Successful GET, PATCH, DELETE
- `201 Created` - Successful POST

### Error Response

**Structure:**

```json
{
  "success": false,
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE",
    "details": {}
  },
  "meta": {
    "timestamp": "2025-12-05T10:00:00.000Z"
  }
}
```

**HTTP Status Codes:**
- `400 Bad Request` - Invalid request body or parameters
- `401 Unauthorized` - Missing or invalid JWT token
- `403 Forbidden` - Valid token but insufficient permissions
- `404 Not Found` - Resource doesn't exist
- `500 Internal Server Error` - Server error (database, etc.)

---

## Error Handling

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `VALIDATION_ERROR` | Invalid request body or parameters | 400 |
| `UNAUTHORIZED` | Missing or invalid JWT token | 401 |
| `FORBIDDEN` | Insufficient permissions | 403 |
| `NOT_FOUND` | Resource doesn't exist | 404 |
| `DATABASE_ERROR` | Database operation failed | 500 |
| `INTERNAL_ERROR` | Unexpected server error | 500 |

### Example Error Responses

**Validation Error:**

```json
{
  "success": false,
  "error": {
    "message": "Invalid request body: missing required field 'name'",
    "code": "VALIDATION_ERROR",
    "details": {
      "field": "name",
      "type": "required"
    }
  },
  "meta": {
    "timestamp": "2025-12-05T10:00:00.000Z"
  }
}
```

**Unauthorized:**

```json
{
  "success": false,
  "error": {
    "message": "Missing or invalid JWT token",
    "code": "UNAUTHORIZED",
    "details": {}
  },
  "meta": {
    "timestamp": "2025-12-05T10:00:00.000Z"
  }
}
```

**Not Found:**

```json
{
  "success": false,
  "error": {
    "message": "Asset with id 123 not found",
    "code": "NOT_FOUND",
    "details": {
      "resource": "asset",
      "id": 123
    }
  },
  "meta": {
    "timestamp": "2025-12-05T10:00:00.000Z"
  }
}
```

---

## Rate Limiting

**Current Limits (Dev Environment):**
- **Burst Limit:** 5000 requests
- **Rate Limit:** 2000 requests/second

**Throttle Response:**

```http
HTTP/1.1 429 Too Many Requests
```

**Production Recommendations:**
- Implement per-user rate limiting
- Use API keys for external integrations
- Monitor CloudWatch metrics for throttle events

---

## Endpoints

---

## Health

### Check API Health

**`GET /health`**

Public endpoint to verify API availability. No authentication required.

**Request:**

```bash
curl https://z7rz9vksp6.execute-api.eu-central-1.amazonaws.com/health
```

**Response:** `200 OK`

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

---

## Users

### Get Current User

**`GET /users/me`**

Retrieve authenticated user's profile information.

**Authentication:** Required

**Request:**

```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://z7rz9vksp6.execute-api.eu-central-1.amazonaws.com/users/me
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": 1,
    "cognito_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-12-05T10:00:00.000Z"
  },
  "meta": {
    "timestamp": "2025-12-05T10:00:00.000Z"
  }
}
```

### Update Current User

**`PATCH /users/me`**

Update authenticated user's profile.

**Authentication:** Required

**Request:**

```bash
curl -X PATCH \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane Smith"}' \
  https://z7rz9vksp6.execute-api.eu-central-1.amazonaws.com/users/me
```

**Request Body:**

```json
{
  "name": "Jane Smith"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": 1,
    "cognito_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "email": "user@example.com",
    "name": "Jane Smith",
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-12-05T10:05:00.000Z"
  },
  "meta": {
    "timestamp": "2025-12-05T10:05:00.000Z"
  }
}
```

---

## Assets

### List Assets

**`GET /assets`**

Retrieve all assets belonging to the authenticated user.

**Authentication:** Required

**Request:**

```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://z7rz9vksp6.execute-api.eu-central-1.amazonaws.com/assets
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "name": "Apple Stock",
      "ticker_symbol": "AAPL",
      "category_id": 1,
      "category_name": "Stocks",
      "market_cap": "Large Cap",
      "notes": "Tech sector exposure",
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-12-05T10:00:00.000Z"
    },
    {
      "id": 2,
      "user_id": 1,
      "name": "Vanguard S&P 500 ETF",
      "ticker_symbol": "VOO",
      "category_id": 2,
      "category_name": "ETFs",
      "market_cap": null,
      "notes": "Diversified index fund",
      "created_at": "2025-01-15T00:00:00.000Z",
      "updated_at": "2025-12-05T10:00:00.000Z"
    }
  ],
  "meta": {
    "timestamp": "2025-12-05T10:00:00.000Z"
  }
}
```

### Create Asset

**`POST /assets`**

Create a new asset.

**Authentication:** Required

**Request:**

```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bitcoin",
    "ticker_symbol": "BTC",
    "category_id": 3,
    "notes": "Long-term hold"
  }' \
  https://z7rz9vksp6.execute-api.eu-central-1.amazonaws.com/assets
```

**Request Body:**

```json
{
  "name": "Bitcoin",
  "ticker_symbol": "BTC",
  "category_id": 3,
  "market_cap": "Large Cap",
  "notes": "Long-term hold"
}
```

**Fields:**
- `name` (string, required) - Asset name
- `ticker_symbol` (string, optional) - Ticker/symbol
- `category_id` (integer, required) - Asset category (1-9)
- `market_cap` (string, optional) - "Large Cap", "Mid Cap", "Small Cap"
- `notes` (string, optional) - User notes

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "id": 3,
    "user_id": 1,
    "name": "Bitcoin",
    "ticker_symbol": "BTC",
    "category_id": 3,
    "category_name": "Cryptocurrency",
    "market_cap": "Large Cap",
    "notes": "Long-term hold",
    "created_at": "2025-12-05T10:10:00.000Z",
    "updated_at": "2025-12-05T10:10:00.000Z"
  },
  "meta": {
    "timestamp": "2025-12-05T10:10:00.000Z"
  }
}
```

### Update Asset

**`PATCH /assets/{id}`**

Update an existing asset.

**Authentication:** Required

**Request:**

```bash
curl -X PATCH \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"notes": "Updated notes"}' \
  https://z7rz9vksp6.execute-api.eu-central-1.amazonaws.com/assets/3
```

**Request Body:**

```json
{
  "name": "Bitcoin (Updated)",
  "notes": "Updated notes"
}
```

**Fields:** Same as create, all optional

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": 3,
    "user_id": 1,
    "name": "Bitcoin (Updated)",
    "ticker_symbol": "BTC",
    "category_id": 3,
    "category_name": "Cryptocurrency",
    "market_cap": "Large Cap",
    "notes": "Updated notes",
    "created_at": "2025-12-05T10:10:00.000Z",
    "updated_at": "2025-12-05T10:15:00.000Z"
  },
  "meta": {
    "timestamp": "2025-12-05T10:15:00.000Z"
  }
}
```

### Delete Asset

**`DELETE /assets/{id}`**

Delete an asset. Cascades to related asset_inputs.

**Authentication:** Required

**Request:**

```bash
curl -X DELETE \
  -H "Authorization: Bearer $TOKEN" \
  https://z7rz9vksp6.execute-api.eu-central-1.amazonaws.com/assets/3
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "message": "Asset deleted successfully",
    "deleted_id": 3
  },
  "meta": {
    "timestamp": "2025-12-05T10:20:00.000Z"
  }
}
```

---

## Asset Inputs

### List Asset Inputs

**`GET /asset-inputs?from=YYYY-MM&to=YYYY-MM`**

Retrieve monthly asset value snapshots for a date range.

**Authentication:** Required

**Query Parameters:**
- `from` (string, optional) - Start month (YYYY-MM). Default: 12 months ago
- `to` (string, optional) - End month (YYYY-MM). Default: current month

**Request:**

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://z7rz9vksp6.execute-api.eu-central-1.amazonaws.com/asset-inputs?from=2025-01&to=2025-12"
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "asset_id": 1,
      "asset_name": "Apple Stock",
      "user_id": 1,
      "month": "2025-01",
      "value": 15000.00,
      "created_at": "2025-01-31T23:59:59.000Z"
    },
    {
      "id": 2,
      "asset_id": 1,
      "asset_name": "Apple Stock",
      "user_id": 1,
      "month": "2025-02",
      "value": 15500.00,
      "created_at": "2025-02-28T23:59:59.000Z"
    }
  ],
  "meta": {
    "timestamp": "2025-12-05T10:00:00.000Z"
  }
}
```

### Create Asset Input

**`POST /asset-inputs`**

Record monthly asset values (batch operation).

**Authentication:** Required

**Request:**

```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "month": "2025-12",
    "values": [
      {"asset_id": 1, "value": 16000},
      {"asset_id": 2, "value": 25000}
    ]
  }' \
  https://z7rz9vksp6.execute-api.eu-central-1.amazonaws.com/asset-inputs
```

**Request Body:**

```json
{
  "month": "2025-12",
  "values": [
    {"asset_id": 1, "value": 16000},
    {"asset_id": 2, "value": 25000}
  ]
}
```

**Fields:**
- `month` (string, required) - Format: YYYY-MM
- `values` (array, required) - Array of asset values
  - `asset_id` (integer, required)
  - `value` (number, required)

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "message": "Asset inputs recorded successfully",
    "month": "2025-12",
    "count": 2,
    "inputs": [
      {
        "id": 10,
        "asset_id": 1,
        "month": "2025-12",
        "value": 16000.00
      },
      {
        "id": 11,
        "asset_id": 2,
        "month": "2025-12",
        "value": 25000.00
      }
    ]
  },
  "meta": {
    "timestamp": "2025-12-05T10:25:00.000Z"
  }
}
```

---

## Income

### List Income Entries

**`GET /incomings?from=YYYY-MM&to=YYYY-MM`**

Retrieve income entries for a date range.

**Authentication:** Required

**Query Parameters:**
- `from` (string, optional) - Start month (YYYY-MM)
- `to` (string, optional) - End month (YYYY-MM)

**Request:**

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://z7rz9vksp6.execute-api.eu-central-1.amazonaws.com/incomings?from=2025-01&to=2025-12"
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "category_id": 1,
      "category_name": "Salary",
      "amount": 5000.00,
      "description": "Monthly salary",
      "date": "2025-12-01",
      "created_at": "2025-12-01T10:00:00.000Z"
    },
    {
      "id": 2,
      "user_id": 1,
      "category_id": 3,
      "category_name": "Dividend",
      "amount": 150.00,
      "description": "VOO dividend",
      "date": "2025-12-15",
      "created_at": "2025-12-15T10:00:00.000Z"
    }
  ],
  "meta": {
    "timestamp": "2025-12-05T10:00:00.000Z"
  }
}
```

### Create Income Entry

**`POST /incomings`**

Add a new income entry.

**Authentication:** Required

**Request:**

```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category_id": 2,
    "amount": 2000,
    "description": "Freelance project",
    "date": "2025-12-20"
  }' \
  https://z7rz9vksp6.execute-api.eu-central-1.amazonaws.com/incomings
```

**Request Body:**

```json
{
  "category_id": 2,
  "amount": 2000,
  "description": "Freelance project",
  "date": "2025-12-20"
}
```

**Fields:**
- `category_id` (integer, required) - Income category (1-6)
- `amount` (number, required) - Amount (positive)
- `description` (string, optional) - Description
- `date` (string, required) - Date (YYYY-MM-DD)

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "id": 3,
    "user_id": 1,
    "category_id": 2,
    "category_name": "Bonus",
    "amount": 2000.00,
    "description": "Freelance project",
    "date": "2025-12-20",
    "created_at": "2025-12-05T10:30:00.000Z"
  },
  "meta": {
    "timestamp": "2025-12-05T10:30:00.000Z"
  }
}
```

### Delete Income Entry

**`DELETE /incomings/{id}`**

Delete an income entry.

**Authentication:** Required

**Request:**

```bash
curl -X DELETE \
  -H "Authorization: Bearer $TOKEN" \
  https://z7rz9vksp6.execute-api.eu-central-1.amazonaws.com/incomings/3
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "message": "Income entry deleted successfully",
    "deleted_id": 3
  },
  "meta": {
    "timestamp": "2025-12-05T10:35:00.000Z"
  }
}
```

---

## Expenses

### List Expense Entries

**`GET /expenses?from=YYYY-MM&to=YYYY-MM`**

Retrieve expense entries for a date range.

**Authentication:** Required

**Query Parameters:**
- `from` (string, optional) - Start month (YYYY-MM)
- `to` (string, optional) - End month (YYYY-MM)

**Request:**

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://z7rz9vksp6.execute-api.eu-central-1.amazonaws.com/expenses?from=2025-01&to=2025-12"
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "category_id": 1,
      "category_name": "Rent",
      "subcategory_id": 5,
      "subcategory_name": "Apartment",
      "amount": 1200.00,
      "description": "December rent",
      "date": "2025-12-01",
      "created_at": "2025-12-01T10:00:00.000Z"
    },
    {
      "id": 2,
      "user_id": 1,
      "category_id": 4,
      "category_name": "Food",
      "subcategory_id": 12,
      "subcategory_name": "Groceries",
      "amount": 350.00,
      "description": "Weekly shopping",
      "date": "2025-12-03",
      "created_at": "2025-12-03T10:00:00.000Z"
    }
  ],
  "meta": {
    "timestamp": "2025-12-05T10:00:00.000Z"
  }
}
```

### Create Expense Entry

**`POST /expenses`**

Add a new expense entry.

**Authentication:** Required

**Request:**

```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category_id": 5,
    "subcategory_id": 18,
    "amount": 120,
    "description": "Gym membership",
    "date": "2025-12-05"
  }' \
  https://z7rz9vksp6.execute-api.eu-central-1.amazonaws.com/expenses
```

**Request Body:**

```json
{
  "category_id": 5,
  "subcategory_id": 18,
  "amount": 120,
  "description": "Gym membership",
  "date": "2025-12-05"
}
```

**Fields:**
- `category_id` (integer, required) - Expense category (1-11)
- `subcategory_id` (integer, optional) - Expense subcategory
- `amount` (number, required) - Amount (positive)
- `description` (string, optional) - Description
- `date` (string, required) - Date (YYYY-MM-DD)

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "id": 3,
    "user_id": 1,
    "category_id": 5,
    "category_name": "Entertainment",
    "subcategory_id": 18,
    "subcategory_name": "Gym",
    "amount": 120.00,
    "description": "Gym membership",
    "date": "2025-12-05",
    "created_at": "2025-12-05T10:40:00.000Z"
  },
  "meta": {
    "timestamp": "2025-12-05T10:40:00.000Z"
  }
}
```

### Update Expense Entry

**`PATCH /expenses/{id}`**

Update an existing expense entry.

**Authentication:** Required

**Request:**

```bash
curl -X PATCH \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 130, "description": "Gym + personal training"}' \
  https://z7rz9vksp6.execute-api.eu-central-1.amazonaws.com/expenses/3
```

**Request Body:**

```json
{
  "amount": 130,
  "description": "Gym + personal training"
}
```

**Fields:** Same as create, all optional

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": 3,
    "user_id": 1,
    "category_id": 5,
    "category_name": "Entertainment",
    "subcategory_id": 18,
    "subcategory_name": "Gym",
    "amount": 130.00,
    "description": "Gym + personal training",
    "date": "2025-12-05",
    "created_at": "2025-12-05T10:40:00.000Z",
    "updated_at": "2025-12-05T10:45:00.000Z"
  },
  "meta": {
    "timestamp": "2025-12-05T10:45:00.000Z"
  }
}
```

### Delete Expense Entry

**`DELETE /expenses/{id}`**

Delete an expense entry.

**Authentication:** Required

**Request:**

```bash
curl -X DELETE \
  -H "Authorization: Bearer $TOKEN" \
  https://z7rz9vksp6.execute-api.eu-central-1.amazonaws.com/expenses/3
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "message": "Expense entry deleted successfully",
    "deleted_id": 3
  },
  "meta": {
    "timestamp": "2025-12-05T10:50:00.000Z"
  }
}
```

---

## Subcategories

### List Subcategories

**`GET /subcategories?category_id=X`**

Retrieve expense subcategories for a category.

**Authentication:** Required

**Query Parameters:**
- `category_id` (integer, optional) - Filter by expense category

**Request:**

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://z7rz9vksp6.execute-api.eu-central-1.amazonaws.com/subcategories?category_id=4"
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": 12,
      "category_id": 4,
      "category_name": "Food",
      "name": "Groceries",
      "is_custom": false,
      "user_id": null
    },
    {
      "id": 13,
      "category_id": 4,
      "category_name": "Food",
      "name": "Restaurants",
      "is_custom": false,
      "user_id": null
    },
    {
      "id": 45,
      "category_id": 4,
      "category_name": "Food",
      "name": "Meal Prep Service",
      "is_custom": true,
      "user_id": 1
    }
  ],
  "meta": {
    "timestamp": "2025-12-05T10:00:00.000Z"
  }
}
```

### Create Subcategory

**`POST /subcategories`**

Create a custom expense subcategory.

**Authentication:** Required

**Request:**

```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category_id": 5,
    "name": "Concert Tickets"
  }' \
  https://z7rz9vksp6.execute-api.eu-central-1.amazonaws.com/subcategories
```

**Request Body:**

```json
{
  "category_id": 5,
  "name": "Concert Tickets"
}
```

**Fields:**
- `category_id` (integer, required) - Parent expense category
- `name` (string, required) - Subcategory name

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "id": 46,
    "category_id": 5,
    "category_name": "Entertainment",
    "name": "Concert Tickets",
    "is_custom": true,
    "user_id": 1,
    "created_at": "2025-12-05T10:55:00.000Z"
  },
  "meta": {
    "timestamp": "2025-12-05T10:55:00.000Z"
  }
}
```

### Update Subcategory

**`PATCH /subcategories/{id}`**

Update a custom subcategory (only user-created subcategories can be updated).

**Authentication:** Required

**Request:**

```bash
curl -X PATCH \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Live Events"}' \
  https://z7rz9vksp6.execute-api.eu-central-1.amazonaws.com/subcategories/46
```

**Request Body:**

```json
{
  "name": "Live Events"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": 46,
    "category_id": 5,
    "category_name": "Entertainment",
    "name": "Live Events",
    "is_custom": true,
    "user_id": 1,
    "created_at": "2025-12-05T10:55:00.000Z",
    "updated_at": "2025-12-05T11:00:00.000Z"
  },
  "meta": {
    "timestamp": "2025-12-05T11:00:00.000Z"
  }
}
```

### Delete Subcategory

**`DELETE /subcategories/{id}`**

Delete a custom subcategory (only user-created subcategories can be deleted).

**Authentication:** Required

**Request:**

```bash
curl -X DELETE \
  -H "Authorization: Bearer $TOKEN" \
  https://z7rz9vksp6.execute-api.eu-central-1.amazonaws.com/subcategories/46
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "message": "Subcategory deleted successfully",
    "deleted_id": 46
  },
  "meta": {
    "timestamp": "2025-12-05T11:05:00.000Z"
  }
}
```

---

## Budgets

### List Budgets

**`GET /budgets`**

Retrieve budget limits for all expense categories.

**Authentication:** Required

**Request:**

```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://z7rz9vksp6.execute-api.eu-central-1.amazonaws.com/budgets
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "category_id": 1,
      "category_name": "Rent",
      "limit": 1200.00,
      "user_id": 1
    },
    {
      "category_id": 4,
      "category_name": "Food",
      "limit": 600.00,
      "user_id": 1
    },
    {
      "category_id": 5,
      "category_name": "Entertainment",
      "limit": 200.00,
      "user_id": 1
    }
  ],
  "meta": {
    "timestamp": "2025-12-05T10:00:00.000Z"
  }
}
```

### Update Budget

**`PATCH /budgets/{category}`**

Update budget limit for an expense category.

**Authentication:** Required

**Path Parameters:**
- `category` (integer) - Expense category ID (1-11)

**Request:**

```bash
curl -X PATCH \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"limit": 250}' \
  https://z7rz9vksp6.execute-api.eu-central-1.amazonaws.com/budgets/5
```

**Request Body:**

```json
{
  "limit": 250
}
```

**Fields:**
- `limit` (number, required) - Budget limit (positive)

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "category_id": 5,
    "category_name": "Entertainment",
    "limit": 250.00,
    "user_id": 1,
    "updated_at": "2025-12-05T11:10:00.000Z"
  },
  "meta": {
    "timestamp": "2025-12-05T11:10:00.000Z"
  }
}
```

---

## Allocation

### Get Asset Allocation

**`GET /allocation`**

Retrieve current asset allocation analysis with target comparison.

**Authentication:** Required

**Request:**

```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://z7rz9vksp6.execute-api.eu-central-1.amazonaws.com/allocation
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "total_value": 45000.00,
    "categories": [
      {
        "category_id": 1,
        "category_name": "Stocks",
        "current_value": 18000.00,
        "current_percentage": 40.00,
        "target_percentage": 35.00,
        "difference": 5.00,
        "rebalance_amount": -2250.00,
        "rebalance_action": "Reduce by $2,250"
      },
      {
        "category_id": 2,
        "category_name": "ETFs",
        "current_value": 22500.00,
        "current_percentage": 50.00,
        "target_percentage": 50.00,
        "difference": 0.00,
        "rebalance_amount": 0.00,
        "rebalance_action": "On target"
      },
      {
        "category_id": 3,
        "category_name": "Cryptocurrency",
        "current_value": 4500.00,
        "current_percentage": 10.00,
        "target_percentage": 15.00,
        "difference": -5.00,
        "rebalance_amount": 2250.00,
        "rebalance_action": "Increase by $2,250"
      }
    ]
  },
  "meta": {
    "timestamp": "2025-12-05T11:15:00.000Z"
  }
}
```

### List Allocation Targets

**`GET /category-allocation-targets`**

Retrieve target allocation percentages for all asset categories.

**Authentication:** Required

**Request:**

```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://z7rz9vksp6.execute-api.eu-central-1.amazonaws.com/category-allocation-targets
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "category_id": 1,
      "category_name": "Stocks",
      "target_percentage": 35.00,
      "user_id": 1
    },
    {
      "category_id": 2,
      "category_name": "ETFs",
      "target_percentage": 50.00,
      "user_id": 1
    },
    {
      "category_id": 3,
      "category_name": "Cryptocurrency",
      "target_percentage": 15.00,
      "user_id": 1
    }
  ],
  "meta": {
    "timestamp": "2025-12-05T11:20:00.000Z"
  }
}
```

### Update Allocation Target

**`PATCH /category-allocation-targets/{category}`**

Update target allocation percentage for an asset category.

**Authentication:** Required

**Path Parameters:**
- `category` (integer) - Asset category ID (1-9)

**Request:**

```bash
curl -X PATCH \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"target_percentage": 20}' \
  https://z7rz9vksp6.execute-api.eu-central-1.amazonaws.com/category-allocation-targets/3
```

**Request Body:**

```json
{
  "target_percentage": 20
}
```

**Fields:**
- `target_percentage` (number, required) - Target percentage (0-100)

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "category_id": 3,
    "category_name": "Cryptocurrency",
    "target_percentage": 20.00,
    "user_id": 1,
    "updated_at": "2025-12-05T11:25:00.000Z"
  },
  "meta": {
    "timestamp": "2025-12-05T11:25:00.000Z"
  }
}
```

---

## Net Worth

### Get Net Worth History

**`GET /networth/history?from=YYYY-MM&to=YYYY-MM`**

Retrieve historical net worth data.

**Authentication:** Required

**Query Parameters:**
- `from` (string, optional) - Start month (YYYY-MM)
- `to` (string, optional) - End month (YYYY-MM)

**Request:**

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://z7rz9vksp6.execute-api.eu-central-1.amazonaws.com/networth/history?from=2025-01&to=2025-12"
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "month": "2025-01",
      "total_assets": 40000.00,
      "net_worth": 40000.00,
      "created_at": "2025-01-31T23:59:59.000Z"
    },
    {
      "month": "2025-02",
      "total_assets": 41500.00,
      "net_worth": 41500.00,
      "created_at": "2025-02-28T23:59:59.000Z"
    },
    {
      "month": "2025-12",
      "total_assets": 45000.00,
      "net_worth": 45000.00,
      "created_at": "2025-12-05T11:30:00.000Z"
    }
  ],
  "meta": {
    "timestamp": "2025-12-05T11:30:00.000Z"
  }
}
```

### Get Net Worth Projection

**`GET /networth/projection?months=N`**

Calculate future net worth projection based on historical trends.

**Authentication:** Required

**Query Parameters:**
- `months` (integer, optional) - Number of months to project. Default: 12

**Request:**

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://z7rz9vksp6.execute-api.eu-central-1.amazonaws.com/networth/projection?months=12"
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "current": {
      "month": "2025-12",
      "net_worth": 45000.00
    },
    "projection": [
      {
        "month": "2026-01",
        "projected_net_worth": 46125.00,
        "growth_rate": 2.5
      },
      {
        "month": "2026-02",
        "projected_net_worth": 47278.00,
        "growth_rate": 2.5
      },
      {
        "month": "2026-12",
        "projected_net_worth": 60345.00,
        "growth_rate": 2.5
      }
    ],
    "growth_metrics": {
      "average_monthly_growth": 1125.00,
      "average_growth_rate": 2.5,
      "total_projected_growth": 15345.00
    }
  },
  "meta": {
    "timestamp": "2025-12-05T11:35:00.000Z"
  }
}
```

---

## Export

### Export User Data

**`GET /export/data`**

Export complete user financial data in JSON format.

**Authentication:** Required

**Request:**

```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://z7rz9vksp6.execute-api.eu-central-1.amazonaws.com/export/data \
  -o financial_data.json
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe"
    },
    "assets": [...],
    "asset_inputs": [...],
    "income": [...],
    "expenses": [...],
    "budgets": [...],
    "allocation_targets": [...],
    "networth_history": [...],
    "export_date": "2025-12-05T11:40:00.000Z"
  },
  "meta": {
    "timestamp": "2025-12-05T11:40:00.000Z"
  }
}
```

**Use Cases:**
- Data backup
- Migration to another system
- Compliance (GDPR data portability)
- Analysis in external tools

---

## Asset Categories Reference

| ID | Name | Description |
|----|------|-------------|
| 1 | Stocks | Individual company stocks |
| 2 | ETFs | Exchange-traded funds |
| 3 | Cryptocurrency | Digital currencies |
| 4 | Real Estate | Property investments |
| 5 | Cash | Cash holdings (savings, checking) |
| 6 | Bonds | Government/corporate bonds |
| 7 | Commodities | Gold, silver, oil, etc. |
| 8 | Mutual Funds | Actively managed funds |
| 9 | Other | Other investment types |

---

## Income Categories Reference

| ID | Name | Description |
|----|------|-------------|
| 1 | Salary | Regular employment income |
| 2 | Bonus | One-time bonuses |
| 3 | Dividend | Investment dividends |
| 4 | Interest | Bank/investment interest |
| 5 | Gift | Monetary gifts |
| 6 | Other | Other income sources |

---

## Expense Categories Reference

| ID | Name | Description |
|----|------|-------------|
| 1 | Rent | Housing rent/mortgage |
| 2 | Utilities | Gas, electric, water, internet |
| 3 | Transportation | Car, gas, public transit |
| 4 | Food | Groceries, restaurants |
| 5 | Entertainment | Leisure activities |
| 6 | Healthcare | Medical expenses |
| 7 | Insurance | All insurance types |
| 8 | Education | Tuition, courses, books |
| 9 | Shopping | Clothing, electronics, etc. |
| 10 | Personal Care | Grooming, hygiene |
| 11 | Other | Miscellaneous expenses |

---

## Development and Testing

### Using curl

**Set token as environment variable:**

```bash
export TOKEN="your-jwt-token-here"
```

**Test authenticated endpoint:**

```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://z7rz9vksp6.execute-api.eu-central-1.amazonaws.com/users/me
```

### Using Postman

1. Import collection from docs/postman_collection.json
2. Set `{{token}}` variable with JWT token
3. Set `{{baseUrl}}` variable with API Gateway URL

### API Testing Script

See [scripts/test_api.sh](../scripts/test_api.sh) for automated API testing.

---

## Additional Resources

- [Lambda Backend Documentation](../lambda/README.md)
- [Frontend Integration Guide](../frontend/README.md)
- [Database Schema](../database/README.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Troubleshooting](TROUBLESHOOTING.md)

---

**API Reference Version:** 1.0.0 (Phase 5)
**Last Updated:** December 2025
**API Gateway URL:** https://z7rz9vksp6.execute-api.eu-central-1.amazonaws.com
