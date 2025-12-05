#!/bin/bash

# =====================================================================
# Cognito Administration Helper Script
# =====================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TF_DIR="$PROJECT_ROOT/terraform/environments/dev"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Get Cognito configuration
cd "$TF_DIR"
USER_POOL_ID=$(terraform output -raw cognito_user_pool_id)
CLIENT_ID=$(terraform output -raw cognito_web_client_id)

function show_menu() {
  echo -e "${GREEN}========================================${NC}"
  echo -e "${GREEN}Cognito User Management${NC}"
  echo -e "${GREEN}========================================${NC}"
  echo ""
  echo "1. Create new user"
  echo "2. List all users"
  echo "3. Delete user"
  echo "4. Reset user password"
  echo "5. Confirm user signup"
  echo "6. Enable/disable user"
  echo "7. Get user details"
  echo "8. Exit"
  echo ""
  read -p "Select option: " choice
  echo ""
}

function create_user() {
  read -p "Email: " email
  read -p "Name: " name
  read -s -p "Temporary Password: " temp_pass
  echo ""
  
  aws cognito-idp admin-create-user \
    --user-pool-id "$USER_POOL_ID" \
    --username "$email" \
    --user-attributes \
      Name=email,Value="$email" \
      Name=email_verified,Value=true \
      Name=name,Value="$name" \
    --temporary-password "$temp_pass" \
    --message-action SUPPRESS
  
  echo -e "${GREEN}✓ User created: $email${NC}"
}

function list_users() {
  aws cognito-idp list-users \
    --user-pool-id "$USER_POOL_ID" \
    --query 'Users[*].[Username,UserStatus,Enabled,UserCreateDate]' \
    --output table
}

function delete_user() {
  read -p "Username/Email: " username
  
  aws cognito-idp admin-delete-user \
    --user-pool-id "$USER_POOL_ID" \
    --username "$username"
  
  echo -e "${GREEN}✓ User deleted: $username${NC}"
}

function reset_password() {
  read -p "Username/Email: " username
  read -s -p "New temporary password: " new_pass
  echo ""
  
  aws cognito-idp admin-set-user-password \
    --user-pool-id "$USER_POOL_ID" \
    --username "$username" \
    --password "$new_pass" \
    --permanent
  
  echo -e "${GREEN}✓ Password reset for: $username${NC}"
}

function confirm_user() {
  read -p "Username/Email: " username
  
  aws cognito-idp admin-confirm-sign-up \
    --user-pool-id "$USER_POOL_ID" \
    --username "$username"
  
  echo -e "${GREEN}✓ User confirmed: $username${NC}"
}

function toggle_user() {
  read -p "Username/Email: " username
  read -p "Enable (y/n): " enable
  
  if [[ "$enable" == "y" ]]; then
    aws cognito-idp admin-enable-user \
      --user-pool-id "$USER_POOL_ID" \
      --username "$username"
    echo -e "${GREEN}✓ User enabled: $username${NC}"
  else
    aws cognito-idp admin-disable-user \
      --user-pool-id "$USER_POOL_ID" \
      --username "$username"
    echo -e "${GREEN}✓ User disabled: $username${NC}"
  fi
}

function get_user() {
  read -p "Username/Email: " username
  
  aws cognito-idp admin-get-user \
    --user-pool-id "$USER_POOL_ID" \
    --username "$username"
}

while true; do
  show_menu
  
  case $choice in
    1) create_user ;;
    2) list_users ;;
    3) delete_user ;;
    4) reset_password ;;
    5) confirm_user ;;
    6) toggle_user ;;
    7) get_user ;;
    8) exit 0 ;;
    *) echo -e "${RED}Invalid option${NC}" ;;
  esac
  
  echo ""
  read -p "Press Enter to continue..."
done
