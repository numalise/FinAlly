#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TF_DIR="$PROJECT_ROOT/terraform/environments/dev"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

cd "$TF_DIR"

API_URL=$(terraform output -raw api_invoke_url)
USER_POOL_ID=$(terraform output -raw cognito_user_pool_id)
CLIENT_ID=$(terraform output -raw cognito_web_client_id)

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}FinAlly API Test Suite${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "API URL: $API_URL"
echo ""

# Test 1: Health Check
echo -e "${YELLOW}Test 1: Health Check (no auth)${NC}"
curl -s -X GET "$API_URL/health" | jq .
echo ""

# Test 2: Unauthorized Access
echo -e "${YELLOW}Test 2: Unauthorized Access${NC}"
curl -s -X GET "$API_URL/users/me" | jq .
echo ""

# Test 3: Get Access Token
echo -e "${YELLOW}Test 3: Getting Access Token${NC}"
read -p "Username: " username
read -s -p "Password: " password
echo ""

TOKEN_RESPONSE=$(aws cognito-idp admin-initiate-auth \
  --user-pool-id "$USER_POOL_ID" \
  --client-id "$CLIENT_ID" \
  --auth-flow ADMIN_USER_PASSWORD_AUTH \
  --auth-parameters USERNAME="$username",PASSWORD="$password" 2>&1)

if echo "$TOKEN_RESPONSE" | jq -e '.AuthenticationResult.AccessToken' > /dev/null 2>&1; then
  ACCESS_TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.AuthenticationResult.AccessToken')
  echo -e "${GREEN}✓ Access token obtained${NC}"
  echo ""
  
  # Test 4: Get Current User
  echo -e "${YELLOW}Test 4: GET /users/me${NC}"
  curl -s -X GET "$API_URL/users/me" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    | jq .
  echo ""
  
  # Test 5: Update User
  echo -e "${YELLOW}Test 5: PATCH /users/me${NC}"
  curl -s -X PATCH "$API_URL/users/me" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"displayName":"API Test User"}' \
    | jq .
  echo ""
  
  echo -e "${GREEN}========================================${NC}"
  echo -e "${GREEN}All Tests Completed!${NC}"
  echo -e "${GREEN}========================================${NC}"
else
  echo -e "${RED}✗ Failed to get access token${NC}"
  echo "$TOKEN_RESPONSE" | jq .
fi
