# Troubleshooting Guide

> **Solutions to common issues in the FinAlly platform**

Comprehensive troubleshooting guide covering database, Lambda, frontend, authentication, and infrastructure issues.

**Last Updated:** December 2025

---

## Table of Contents

1. [Database Issues](#database-issues)
2. [Lambda Issues](#lambda-issues)
3. [Frontend Issues](#frontend-issues)
4. [Authentication Issues](#authentication-issues)
5. [API Gateway Issues](#api-gateway-issues)
6. [Terraform Issues](#terraform-issues)
7. [Deployment Issues](#deployment-issues)
8. [Performance Issues](#performance-issues)
9. [Debugging Tools](#debugging-tools)

---

## Database Issues

### Cannot Connect to Database

**Symptoms:**
- `Connection timeout`
- `ECONNREFUSED`
- `no pg_hba.conf entry`

**Causes & Solutions:**

**1. RDS not accessible from Lambda:**

```bash
# Check Lambda VPC configuration
aws lambda get-function-configuration \
  --function-name finally-dev-api \
  --query 'VpcConfig'

# Should show: SubnetIds and SecurityGroupIds
```

**Solution:** Ensure Lambda is in same VPC as RDS with proper security groups.

**2. Security group rules missing:**

```bash
# Check RDS security group
aws ec2 describe-security-groups \
  --group-ids <rds-security-group-id> \
  --query 'SecurityGroups[0].IpPermissions'

# Should allow: Lambda SG on port 5432
```

**Solution:** Add inbound rule allowing Lambda security group.

**3. Wrong DATABASE_URL:**

```bash
# Check Lambda environment variables
aws lambda get-function-configuration \
  --function-name finally-dev-api \
  --query 'Environment.Variables.DATABASE_URL'
```

**Solution:** Update DATABASE_URL with correct host/credentials.

**4. SSL/TLS not enforced:**

```bash
# DATABASE_URL must include sslmode
postgresql://user:pass@host:5432/db?sslmode=require
```

---

### Too Many Connections

**Symptoms:**
- `sorry, too many clients already`
- `remaining connection slots are reserved`

**Cause:** Lambda instances exceed RDS max_connections.

**Check current connections:**

```sql
SELECT count(*) FROM pg_stat_activity;
SELECT * FROM pg_stat_activity WHERE state = 'active';
```

**Solutions:**

**1. Reduce connection limit in DATABASE_URL:**

```
?connection_limit=5&pool_timeout=10
```

**2. Upgrade RDS instance class:**

```bash
# t3.micro: ~100 connections
# t3.small: ~200 connections
# t3.medium: ~400 connections
```

**3. Use RDS Proxy (Production):**

```hcl
resource "aws_db_proxy" "main" {
  name                   = "finally-prod-proxy"
  engine_family          = "POSTGRESQL"
  # Pools connections at AWS level
}
```

**4. Identify connection leaks:**

```sql
-- Long-running queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query
FROM pg_stat_activity
WHERE state = 'active'
ORDER BY duration DESC;

-- Kill stuck connection
SELECT pg_terminate_backend(pid);
```

---

### Migration Fails

**Symptoms:**
- `relation already exists`
- `column does not exist`
- `deadlock detected`

**Solution 1: Check migration order**

```bash
# List applied migrations
SELECT * FROM _prisma_migrations ORDER BY applied_at;
```

**Solution 2: Lock timeout during migration**

Add to migration SQL:
```sql
SET lock_timeout = '10s';
SET statement_timeout = '30s';
```

**Solution 3: Migration stuck (table lock)**

```sql
-- Check locks
SELECT * FROM pg_locks WHERE NOT granted;

-- Kill blocking query
SELECT pg_terminate_backend(pid) FROM pg_stat_activity
WHERE pid IN (SELECT pid FROM pg_locks WHERE NOT granted);
```

---

## Lambda Issues

### Cold Start Timeout

**Symptoms:**
- First request takes 5-10 seconds
- `Task timed out after 30 seconds`

**Cause:** Prisma client initialization + VPC ENI creation

**Solutions:**

**1. Increase timeout:**

```hcl
resource "aws_lambda_function" "api" {
  timeout = 30  # Increase from 10
}
```

**2. Provisioned Concurrency (Production):**

```hcl
resource "aws_lambda_provisioned_concurrency_config" "api" {
  function_name                     = aws_lambda_function.api.function_name
  provisioned_concurrent_executions = 5
}
```

**3. Optimize bundle size:**

```bash
# Check bundle size
ls -lh lambda/dist/index.js

# Should be <100KB
# If larger, check for unnecessary dependencies
```

---

### Lambda Function Errors

**Symptoms:**
- `errorMessage: "Internal server error"`
- 500 responses
- No detailed error in response

**Debugging:**

```bash
# View Lambda logs
aws logs tail /aws/lambda/finally-dev-api --follow

# Filter errors
aws logs filter-log-events \
  --log-group-name /aws/lambda/finally-dev-api \
  --filter-pattern "[ERROR]"

# Get specific invocation logs
aws logs get-log-events \
  --log-group-name /aws/lambda/finally-dev-api \
  --log-stream-name '<stream-name>'
```

**Common errors:**

**1. Prisma client not found:**

```
Error: @prisma/client did not initialize yet
```

**Solution:** Run `npx prisma generate` before deployment.

**2. Module not found:**

```
Error: Cannot find module './routes/assets.js'
```

**Solution:** Check import paths use `.js` extension (ESM requirement).

**3. DATABASE_URL not set:**

```
Error: Prisma Client could not locate the Query Engine
```

**Solution:** Verify environment variables in Lambda configuration.

---

### Memory Issues

**Symptoms:**
- `JavaScript heap out of memory`
- Lambda duration spikes

**Check memory usage:**

```bash
aws lambda get-function-configuration \
  --function-name finally-dev-api \
  --query 'MemorySize'

# View CloudWatch metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name MemoryUtilization \
  --dimensions Name=FunctionName,Value=finally-dev-api \
  --start-time 2025-12-05T00:00:00Z \
  --end-time 2025-12-05T23:59:59Z \
  --period 300 \
  --statistics Average,Maximum
```

**Solution:** Increase memory allocation:

```hcl
resource "aws_lambda_function" "api" {
  memory_size = 1024  # Increase from 512
}
```

---

## Frontend Issues

### Build Errors

**Symptoms:**
- `Module not found`
- `Type error`
- `Cannot find module '@/components/...'`

**Solutions:**

**1. Clear Next.js cache:**

```bash
rm -rf .next node_modules
npm install
npm run build
```

**2. Check tsconfig paths:**

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**3. Verify imports use correct paths:**

```typescript
// Good
import { AssetCard } from '@/components/dashboard/AssetCard';

// Bad
import { AssetCard } from '../components/dashboard/AssetCard';
```

---

### Environment Variables Not Loaded

**Symptoms:**
- `process.env.NEXT_PUBLIC_API_URL is undefined`
- API calls fail with wrong URL

**Solution:**

```bash
# Check .env.local exists
ls -la frontend/.env.local

# Verify variables prefixed with NEXT_PUBLIC_
cat frontend/.env.local

# Restart dev server
npm run dev
```

---

### CORS Errors

**Symptoms:**
- `Access-Control-Allow-Origin header missing`
- `CORS policy blocked request`

**Check API response headers:**

```bash
curl -I https://z7rz9vksp6.execute-api.eu-central-1.amazonaws.com/health

# Should include:
# Access-Control-Allow-Origin: *
# Access-Control-Allow-Methods: GET, POST, ...
```

**Solution 1: API Gateway CORS configuration**

Check `terraform/modules/api-gateway/main.tf`:

```hcl
resource "aws_apigatewayv2_api" "main" {
  cors_configuration {
    allow_origins     = ["*"]
    allow_methods     = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    allow_headers     = ["Content-Type", "Authorization"]
    max_age           = 86400
    allow_credentials = false
  }
}
```

**Solution 2: Lambda response headers**

Check `lambda/src/utils/response.ts` includes CORS headers.

---

### React Hydration Errors

**Symptoms:**
- `Hydration failed`
- `There was an error while hydrating`
- Content flickers on page load

**Causes:**
- Server-rendered HTML doesn't match client render
- Using browser-only APIs during SSR
- Date/time formatting differences

**Solutions:**

**1. Use dynamic imports for client-only components:**

```typescript
import dynamic from 'next/dynamic';

const ClientOnlyComponent = dynamic(
  () => import('./ClientOnlyComponent'),
  { ssr: false }
);
```

**2. Suppress hydration warnings (use sparingly):**

```typescript
<div suppressHydrationWarning>
  {new Date().toLocaleString()}
</div>
```

---

## Authentication Issues

### JWT Token Expired

**Symptoms:**
- `401 Unauthorized`
- `Token expired`
- Redirected to login unexpectedly

**Solution:**

**1. Implement token refresh:**

```typescript
import { Auth } from 'aws-amplify';

async function refreshToken() {
  try {
    const session = await Auth.currentSession();
    return session.getIdToken().getJwtToken();
  } catch (error) {
    // Token expired, redirect to login
    window.location.href = '/login';
  }
}
```

**2. Check token expiration:**

```typescript
import { jwtDecode } from 'jwt-decode';

const decoded = jwtDecode(token);
const isExpired = decoded.exp * 1000 < Date.now();

if (isExpired) {
  await refreshToken();
}
```

---

### Cognito Redirect Loop

**Symptoms:**
- Login redirects back to login
- `redirect_mismatch error`
- Infinite redirect loop

**Check callback URLs:**

```bash
aws cognito-idp describe-user-pool-client \
  --user-pool-id eu-central-1_xxxxxxxxx \
  --client-id xxxxxxxxxxxxxxxxxxxxxxxxxx \
  --query 'UserPoolClient.CallbackURLs'

# Should include: http://localhost:3000/login
```

**Solution:** Update Cognito callback URLs in Terraform:

```hcl
module "cognito" {
  callback_urls = [
    "http://localhost:3000/login",
    "https://dev.finally.com/login",
    "https://finally.com/login"
  ]
}
```

---

### User Not Found After Login

**Symptoms:**
- Login succeeds but API calls fail
- `User not found in database`

**Cause:** Auto-provisioning failed

**Check Lambda logs:**

```bash
aws logs filter-log-events \
  --log-group-name /aws/lambda/finally-dev-api \
  --filter-pattern "Auto-provisioned user"
```

**Manual user creation:**

```sql
INSERT INTO users (cognito_id, email, name, created_at)
VALUES ('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', 'user@example.com', 'User Name', NOW());
```

---

## API Gateway Issues

### 404 Not Found

**Symptoms:**
- Endpoint returns 404
- Route exists in Lambda but not accessible

**Check API Gateway routes:**

```bash
aws apigatewayv2 get-routes \
  --api-id z7rz9vksp6 \
  --query 'Items[*].[RouteKey,Target]'
```

**Solution:** Add missing route in Terraform:

```hcl
resource "aws_apigatewayv2_route" "get_assets" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "GET /assets"
  target             = "integrations/${aws_apigatewayv2_integration.lambda.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}
```

---

### 502 Bad Gateway

**Symptoms:**
- `{"message":"Internal server error"}`
- No Lambda logs

**Cause:** Lambda function error prevents response

**Check Lambda errors:**

```bash
aws lambda get-function-configuration \
  --function-name finally-dev-api \
  --query 'LastUpdateStatus'

# If "Failed", check error:
aws lambda get-function \
  --function-name finally-dev-api \
  --query 'Configuration.LastUpdateStatusReasonCode'
```

**Common causes:**
- Lambda handler doesn't exist
- Lambda role lacks permissions
- Lambda in VPC but no internet access

---

### 429 Too Many Requests

**Symptoms:**
- `TooManyRequestsException`
- Requests throttled

**Check throttle limits:**

```bash
aws apigatewayv2 get-stage \
  --api-id z7rz9vksp6 \
  --stage-name '$default' \
  --query 'DefaultRouteSettings'

# Current limits:
# Burst: 5000 requests
# Rate: 2000 requests/second
```

**Solution:** Increase limits in Terraform:

```hcl
resource "aws_apigatewayv2_stage" "default" {
  default_route_settings {
    throttling_burst_limit = 10000
    throttling_rate_limit  = 5000
  }
}
```

---

## Terraform Issues

### State Lock

**Symptoms:**
- `Error acquiring the state lock`
- `LockID: ...`

**Solution 1: Wait for other operation to finish**

Another Terraform operation is running. Wait or check with team.

**Solution 2: Force unlock (if stuck)**

```bash
terraform force-unlock <LOCK_ID>

# WARNING: Only if you're certain no other operation is running
```

**Solution 3: Check DynamoDB lock table**

```bash
aws dynamodb scan --table-name finally-terraform-locks

# If stuck, delete lock item
aws dynamodb delete-item \
  --table-name finally-terraform-locks \
  --key '{"LockID": {"S": "<lock-id>"}}'
```

---

### Resource Already Exists

**Symptoms:**
- `Error: resource already exists`
- `AlreadyExistsException`

**Solution: Import existing resource**

```bash
# Import existing resource
terraform import aws_lambda_function.api finally-dev-api

# Then apply
terraform apply
```

---

### Plan Shows Unexpected Changes

**Symptoms:**
- Terraform wants to recreate resources
- Changes not in your code

**Causes:**
- Drift (manual changes in AWS console)
- Terraform version mismatch
- Provider version change

**Solution 1: Refresh state**

```bash
terraform refresh
terraform plan
```

**Solution 2: Fix drift**

Manually revert changes in AWS console or accept Terraform's changes.

---

## Deployment Issues

### ECR Push Fails

**Symptoms:**
- `no basic auth credentials`
- `authentication token has expired`

**Solution:**

```bash
# Re-authenticate
aws ecr get-login-password --region eu-central-1 | \
  docker login --username AWS --password-stdin \
  197423061144.dkr.ecr.eu-central-1.amazonaws.com

# Retry push
docker push <image-url>:latest
```

---

### Lambda Doesn't Update

**Symptoms:**
- Pushed new image but Lambda still runs old code
- `LastUpdateStatus: InProgress` stuck

**Solution 1: Force update**

```bash
aws lambda update-function-code \
  --function-name finally-dev-api \
  --image-uri <ecr-image-uri>:latest \
  --publish
```

**Solution 2: Wait for update to complete**

```bash
# Check status
aws lambda get-function-configuration \
  --function-name finally-dev-api \
  --query 'LastUpdateStatus'

# Can take 2-3 minutes for large images
```

---

## Performance Issues

### Slow API Responses

**Check CloudWatch metrics:**

```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Duration \
  --dimensions Name=FunctionName,Value=finally-dev-api \
  --start-time 2025-12-05T00:00:00Z \
  --end-time 2025-12-05T23:59:59Z \
  --period 300 \
  --statistics Average,Maximum
```

**Solutions:**

**1. Database query optimization:**

```sql
-- Add indexes
CREATE INDEX CONCURRENTLY idx_expense_items_user_date
ON expense_items(user_id, date);

-- Analyze query plan
EXPLAIN ANALYZE SELECT * FROM expense_items WHERE user_id = 1;
```

**2. Reduce data fetching:**

```typescript
// Bad: Fetch all, filter in JS
const expenses = await prisma.expense_items.findMany();
const filtered = expenses.filter(e => e.user_id === userId);

// Good: Filter in database
const expenses = await prisma.expense_items.findMany({
  where: { user_id: userId }
});
```

**3. Enable React Query caching:**

```typescript
const { data } = useAssets({
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});
```

---

## Debugging Tools

### CloudWatch Logs Insights

```sql
-- Top error messages
fields @timestamp, @message
| filter @message like /ERROR/
| stats count() by @message
| sort count desc
| limit 10

-- Slow Lambda invocations
fields @timestamp, @duration
| filter @duration > 1000
| sort @duration desc
| limit 20

-- Failed authentication attempts
fields @timestamp, @message
| filter @message like /Unauthorized/
| stats count() by bin(5m)
```

### AWS X-Ray (Phase 7)

Enable X-Ray tracing to visualize request flow:

```hcl
resource "aws_lambda_function" "api" {
  tracing_config {
    mode = "Active"
  }
}
```

View traces in AWS Console → X-Ray → Service Map

---

## Getting Help

**Check logs first:**
- CloudWatch Logs (Lambda, API Gateway)
- Browser console (Frontend)
- Network tab (API calls)

**Search existing issues:**
- GitHub Issues
- Closed PRs with similar errors

**Ask for help:**
- Open GitHub Issue with:
  - Error message
  - Steps to reproduce
  - Logs (sanitize sensitive data)
  - Environment (dev/staging/prod)

---

**Troubleshooting Guide Version:** 1.0 (Phase 5)
**Last Updated:** December 2025
