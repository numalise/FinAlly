# Middleware Documentation

> **Lambda middleware for authentication, authorization, and request processing**

Middleware layer for the FinAlly Lambda API handling authentication, user provisioning, and request/response processing.

**Last Updated:** December 2025

---

## Overview

The middleware layer provides cross-cutting concerns for all API routes:
- **JWT token verification** with AWS Cognito
- **Automatic user provisioning** on first login
- **Database user ID resolution** (Cognito sub → DB user ID)
- **Request authentication** before route handlers
- **CORS headers** management

---

## Middleware Architecture

```
┌─────────────────────────────────────────────────────────┐
│  API Gateway (HTTP API v2)                              │
└──────────────────┬──────────────────────────────────────┘
                   │ Event + JWT token
                   ▼
┌─────────────────────────────────────────────────────────┐
│  Lambda Handler (index.ts)                              │
│  ┌────────────────────────────────────────────────────┐ │
│  │ 1. CORS Preflight Check                            │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │ 2. Health Check (NO AUTH)                          │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │ 3. Authentication Middleware                       │ │
│  │    ├─ Extract JWT from Authorization header        │ │
│  │    ├─ Verify JWT with Cognito                      │ │
│  │    ├─ Find or create user in database              │ │
│  │    └─ Return database user ID                      │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │ 4. Route Handler (with userId)                     │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## Authentication Middleware

### File: `auth.ts`

**Purpose:** Authenticate users via JWT token verification and auto-provision users in database.

### Core Components

**1. JWT Verifier (aws-jwt-verify):**
```typescript
import { CognitoJwtVerifier } from 'aws-jwt-verify';

const verifier = CognitoJwtVerifier.create({
  userPoolId: USER_POOL_ID,
  tokenUse: 'id',
  clientId: [WEB_CLIENT_ID, BACKEND_CLIENT_ID],
});
```

**Configuration:**
- **User Pool ID:** From environment variable `COGNITO_USER_POOL_ID`
- **Token Use:** ID tokens (not access tokens)
- **Client IDs:** Accepts both web and backend client IDs
- **Caching:** Verifier instance reused across Lambda invocations

**2. Prisma Client:**
```typescript
const prisma = new PrismaClient();
```

**Singleton pattern:**
- Created once at cold start
- Reused across warm invocations
- Connection pooling handled by Prisma

---

### Authentication Flow

#### 1. Extract JWT Token

```typescript
const authHeader = event.headers?.authorization || event.headers?.Authorization;

const token = authHeader.startsWith('Bearer ')
  ? authHeader.substring(7)
  : authHeader;
```

**Handles multiple formats:**
- `Authorization: Bearer <token>` (standard)
- `Authorization: <token>` (fallback)
- Case-insensitive header names (HTTP API v2 uses lowercase)

**Returns `null` if:**
- No `Authorization` header
- Header present but empty
- Token extraction fails

#### 2. Verify JWT Token

```typescript
const payload = await verifier.verify(token);
```

**Verification checks:**
- ✅ Signature valid (RSA public key from Cognito)
- ✅ Token not expired (`exp` claim)
- ✅ Issuer matches User Pool (`iss` claim)
- ✅ Audience matches client ID (`aud` claim)
- ✅ Token use is `id` (`token_use` claim)

**JWT payload structure:**
```typescript
{
  sub: "cognito-user-id",           // Cognito subject (unique user ID)
  email: "user@example.com",        // User email
  name: "John Doe",                 // Display name
  preferred_username: "johndoe",    // Username
  email_verified: true,             // Email verification status
  aud: "client-id",                 // Audience (client ID)
  iss: "https://cognito-idp.region.amazonaws.com/pool-id",
  exp: 1733500000,                  // Expiration timestamp
  iat: 1733496400,                  // Issued at timestamp
}
```

**Throws error if:**
- Token signature invalid
- Token expired
- Issuer/audience mismatch
- Malformed token

#### 3. Find or Create User

```typescript
let user = await prisma.user.findUnique({
  where: { cognitoSub: payload.sub },
});

if (!user) {
  user = await prisma.user.create({
    data: {
      cognitoSub: payload.sub,
      email: payload.email || `user-${payload.sub}@example.com`,
      displayName: payload.name || payload.preferred_username || null,
    },
  });
}
```

**Auto-provisioning:**
- First login automatically creates database user
- Maps Cognito `sub` to `users.cognitoSub`
- Extracts email and displayName from JWT claims
- Fallback email if none provided: `user-{sub}@example.com`
- Logs creation for audit trail

**User record:**
```typescript
{
  id: "uuid",                       // Database user ID (primary key)
  cognitoSub: "cognito-user-id",    // Cognito subject (unique)
  email: "user@example.com",        // User email
  displayName: "John Doe",          // Display name (nullable)
  createdAt: Date,                  // Account creation timestamp
  updatedAt: Date,                  // Last update timestamp
}
```

#### 4. Return Database User ID

```typescript
return user.id;  // UUID string
```

**Returns:**
- Database user ID (`users.id`) as string
- Used by route handlers to filter user-owned data
- `null` if authentication fails

---

### Error Handling

```typescript
try {
  // Authentication logic
} catch (error) {
  console.error('❌ Authentication error:', error);
  if (error instanceof Error) {
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
  }
  return null;
}
```

**Error scenarios:**

**1. JWT Verification Fails:**
```
JwtExpiredError: Token expired
JwtInvalidSignatureError: Invalid signature
JwtParseError: Malformed token
```
**Result:** Returns `null`, route handler receives 401 Unauthorized

**2. Database Error:**
```
PrismaClientKnownRequestError: Unique constraint violation
PrismaClientUnknownRequestError: Connection timeout
```
**Result:** Returns `null`, error logged to CloudWatch

**3. Missing Environment Variables:**
```
Error: COGNITO_USER_POOL_ID is not defined
```
**Result:** Lambda fails at cold start

---

## Using Authentication Middleware

### In Main Handler (index.ts)

**1. Import middleware:**
```typescript
import { authenticate } from './middleware/auth';
```

**2. Call before protected routes:**
```typescript
// Health check - NO AUTH REQUIRED
if (path === '/health' && method === 'GET') {
  return await handleHealth(event);
}

// All other routes require authentication
const userId = await authenticate(event);

if (!userId) {
  return {
    statusCode: 401,
    headers: corsHeaders,
    body: JSON.stringify({ error: 'Unauthorized' }),
  };
}

// Route to appropriate handler with userId
if (path.startsWith('/assets')) {
  return await handleAssets(event, prisma, userId);
}
```

**Authentication pattern:**
```typescript
// 1. Authenticate
const userId = await authenticate(event);

// 2. Check result
if (!userId) {
  return unauthorizedResponse();
}

// 3. Pass userId to route handler
return await routeHandler(event, prisma, userId);
```

---

### In Route Handlers

Route handlers receive authenticated `userId`:

```typescript
export async function handleAssets(
  event: APIGatewayProxyEvent,
  prisma: PrismaClient,
  userId: string  // Database user ID from middleware
): Promise<APIGatewayProxyResult> {

  // Fetch user-owned assets
  const assets = await prisma.asset.findMany({
    where: { userId },  // Filter by authenticated user
  });

  return successResponse(assets);
}
```

**Key points:**
- Route handlers ALWAYS receive authenticated `userId`
- No need to re-authenticate in route handlers
- Use `userId` to filter all database queries
- Never trust client-provided user IDs

---

## Security Considerations

### 1. JWT Token Security

**Token storage:**
- Frontend stores tokens in memory (React Query cache)
- Never stored in localStorage (XSS vulnerability)
- Cookies with httpOnly flag for refresh tokens

**Token expiration:**
- ID tokens expire after 1 hour
- Frontend refreshes tokens before expiration
- Expired tokens rejected by verifier

**Token validation:**
- Signature verification with Cognito public keys
- Issuer, audience, and expiration checks
- Token use must be `id` (not access token)

### 2. Authorization

**User isolation:**
```typescript
// Good: Filter by authenticated userId
const expenses = await prisma.expense.findMany({
  where: { userId },
});

// Bad: Fetch all expenses
const expenses = await prisma.expense.findMany();
```

**Resource ownership:**
```typescript
// Verify user owns resource before update
const asset = await prisma.asset.findFirst({
  where: { id: assetId, userId },
});

if (!asset) {
  return errorResponse('Asset not found', 404);
}
```

### 3. CORS Configuration

**Headers set by Lambda:**
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',  // Dev: allow all origins
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'Content-Type': 'application/json',
};
```

**Production considerations:**
- Replace `*` with specific origins
- Enable credentials for cookie-based auth
- Restrict methods to required only

### 4. Error Information Leakage

```typescript
// Good: Generic error message
return {
  statusCode: 401,
  body: JSON.stringify({ error: 'Unauthorized' }),
};

// Bad: Exposes internal details
return {
  statusCode: 401,
  body: JSON.stringify({ error: error.message }),
};
```

**Error handling:**
- Return generic messages to client
- Log detailed errors to CloudWatch
- Never expose JWT verification failures
- Don't reveal user existence

---

## Testing Authentication

### Manual Testing with curl

**1. Get JWT token:**
```bash
TOKEN=$(aws cognito-idp admin-initiate-auth \
  --user-pool-id eu-central-1_XXXXXXXXX \
  --client-id XXXXXXXXXXXXXXXXXXXXXXXXXX \
  --auth-flow ADMIN_USER_PASSWORD_AUTH \
  --auth-parameters USERNAME="user@example.com",PASSWORD="password" \
  --query 'AuthenticationResult.IdToken' \
  --output text)
```

**2. Test authenticated endpoint:**
```bash
curl -X GET https://api.finally.com/assets \
  -H "Authorization: Bearer $TOKEN" \
  | jq .
```

**3. Test unauthorized access:**
```bash
curl -X GET https://api.finally.com/assets \
  | jq .

# Expected: {"error": "Unauthorized"}
```

### Automated Testing

**Unit test (Jest):**
```typescript
import { authenticate } from '../middleware/auth';
import { mockEvent } from '../test/helpers';

describe('Authentication Middleware', () => {
  it('should return null for missing Authorization header', async () => {
    const event = mockEvent({ headers: {} });
    const userId = await authenticate(event);
    expect(userId).toBeNull();
  });

  it('should verify valid JWT token', async () => {
    const event = mockEvent({
      headers: { Authorization: `Bearer ${validToken}` },
    });
    const userId = await authenticate(event);
    expect(userId).toBeTruthy();
  });

  it('should auto-provision new user', async () => {
    const event = mockEvent({
      headers: { Authorization: `Bearer ${newUserToken}` },
    });
    const userId = await authenticate(event);

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    expect(user).toBeTruthy();
    expect(user.email).toBe('newuser@example.com');
  });
});
```

---

## Performance Optimization

### 1. Connection Pooling

**Prisma singleton pattern:**
```typescript
// Bad: Create new client per invocation (connection overhead)
export async function authenticate(event: any) {
  const prisma = new PrismaClient();
  // ...
}

// Good: Reuse client across invocations
const prisma = new PrismaClient();

export async function authenticate(event: any) {
  // Reuses existing connection pool
}
```

**Connection pool configuration:**
```env
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=5&pool_timeout=10"
```

### 2. JWT Verifier Caching

**aws-jwt-verify caching:**
- Verifier caches Cognito public keys
- JWKs (JSON Web Keys) fetched once at cold start
- Cached for 6 hours (Cognito default)
- Reduces latency for warm invocations

### 3. Cold Start Optimization

**Minimize initialization:**
- Import only necessary dependencies
- Create verifier and Prisma client at module level
- Lazy-load heavy dependencies

**Typical cold start:**
- First invocation: ~3-5 seconds (VPC ENI + Prisma init)
- Warm invocations: ~50-200ms

---

## Common Issues

### Issue 1: Token Verification Fails

**Symptoms:**
```
JwtExpiredError: Token expired
```

**Causes:**
- Token expired (>1 hour old)
- Client clock skew
- Token from wrong User Pool

**Solutions:**
```typescript
// Frontend: Refresh token before expiration
if (tokenExpiresSoon()) {
  await Auth.currentSession();  // Refreshes token
}
```

### Issue 2: User Not Auto-Provisioned

**Symptoms:**
```
Error: User not found in database
```

**Causes:**
- Database connection failed
- Unique constraint violation (email)
- Insufficient Lambda permissions

**Debug:**
```bash
# Check Lambda logs
aws logs tail /aws/lambda/finally-dev-api --follow

# Look for:
# "User not found in database, creating new user..."
# "✅ Created new user: {id, email, cognitoSub}"
```

### Issue 3: Authorization Header Missing

**Symptoms:**
```
Authentication failed (no header)
```

**Causes:**
- Frontend not sending token
- CORS preflight stripping headers
- API Gateway not forwarding headers

**Debug:**
```typescript
// Add logging to middleware
console.log('Event headers:', event.headers);
console.log('Auth header:', event.headers?.authorization);
```

---

## Future Enhancements

### 1. Role-Based Access Control (RBAC)

**Add roles to users:**
```typescript
enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  PREMIUM = 'PREMIUM',
}

// Check role in middleware
if (requiresAdmin && user.role !== Role.ADMIN) {
  return forbiddenResponse();
}
```

### 2. Rate Limiting Middleware

**Per-user rate limiting:**
```typescript
const rateLimiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 60 * 1000,  // 1 minute
});

if (!rateLimiter.check(userId)) {
  return tooManyRequestsResponse();
}
```

### 3. Request Logging Middleware

**Structured logging:**
```typescript
export async function logRequest(event: any, userId: string) {
  console.log({
    timestamp: new Date().toISOString(),
    userId,
    method: event.requestContext.http.method,
    path: event.rawPath,
    ip: event.requestContext.http.sourceIp,
    userAgent: event.headers['user-agent'],
  });
}
```

### 4. Caching Middleware

**Cache frequent reads:**
```typescript
const cache = new Map<string, any>();

export async function withCache<T>(
  key: string,
  ttl: number,
  fn: () => Promise<T>
): Promise<T> {
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) {
    return cached.value;
  }

  const value = await fn();
  cache.set(key, { value, expires: Date.now() + ttl });
  return value;
}
```

---

## Further Reading

- [aws-jwt-verify Documentation](https://github.com/awslabs/aws-jwt-verify)
- [Cognito JWT Tokens](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-with-identity-providers.html)
- [Prisma Connection Management](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
- [../routes/README.md](../routes/README.md) - Route handlers documentation

---

**Middleware Documentation Version:** 1.0 (Phase 5)
**Last Updated:** December 2025
