# =====================================================================
# Cognito User Pool for Authentication
# =====================================================================

resource "aws_cognito_user_pool" "main" {
  name = "${var.project_name}-${var.environment}-users"

  # Email Configuration
  alias_attributes         = ["email", "preferred_username"]
  auto_verified_attributes = ["email"]

  # Username Configuration
  username_configuration {
    case_sensitive = false
  }

  # Password Policy
  password_policy {
    minimum_length                   = 12
    require_lowercase                = true
    require_uppercase                = true
    require_numbers                  = true
    require_symbols                  = true
    temporary_password_validity_days = 7
  }

  # Account Recovery
  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  # Email Configuration (SES or Cognito default)
  email_configuration {
    email_sending_account = "COGNITO_DEFAULT"
    # For production, use SES:
    # email_sending_account = "DEVELOPER"
    # source_arn           = var.ses_source_arn
  }

  # User Attributes Schema
  schema {
    name                     = "email"
    attribute_data_type      = "String"
    required                 = true
    mutable                  = true
    developer_only_attribute = false

    string_attribute_constraints {
      min_length = 5
      max_length = 255
    }
  }

  schema {
    name                     = "name"
    attribute_data_type      = "String"
    required                 = false
    mutable                  = true
    developer_only_attribute = false

    string_attribute_constraints {
      min_length = 1
      max_length = 255
    }
  }

  # MFA Configuration (Optional)
  mfa_configuration = var.enable_mfa ? "OPTIONAL" : "OFF"

  dynamic "software_token_mfa_configuration" {
    for_each = var.enable_mfa ? [1] : []
    content {
      enabled = true
    }
  }

  # Admin Create User Configuration
  admin_create_user_config {
    allow_admin_create_user_only = false

    invite_message_template {
      email_subject = "Welcome to ${var.project_name}!"
      email_message = "Your username is {username} and temporary password is {####}. Please change it on first login."
      sms_message   = "Your username is {username} and temporary password is {####}"
    }
  }

  # User Pool Add-ons
  user_pool_add_ons {
    advanced_security_mode = var.enable_advanced_security ? "ENFORCED" : "OFF"
  }

  # Verification Message Template
  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
    email_subject        = "Verify your email for ${var.project_name}"
    email_message        = "Your verification code is {####}"
  }

  # Device Configuration
  device_configuration {
    challenge_required_on_new_device      = true
    device_only_remembered_on_user_prompt = true
  }

  # Lambda Triggers (for post-confirmation)
  dynamic "lambda_config" {
    for_each = var.post_confirmation_lambda_arn != "" ? [1] : []
    content {
      post_confirmation = var.post_confirmation_lambda_arn
    }
  }

  # Deletion Protection (disable for dev)
  deletion_protection = var.deletion_protection ? "ACTIVE" : "INACTIVE"

  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-user-pool"
    }
  )
}

# =====================================================================
# User Pool Domain (for Hosted UI)
# =====================================================================

resource "aws_cognito_user_pool_domain" "main" {
  domain       = "${var.project_name}-${var.environment}-${random_string.domain_suffix.result}"
  user_pool_id = aws_cognito_user_pool.main.id
}

resource "random_string" "domain_suffix" {
  length  = 8
  special = false
  upper   = false
}

# =====================================================================
# User Pool Client (for Next.js Frontend)
# =====================================================================

resource "aws_cognito_user_pool_client" "web_client" {
  name         = "${var.project_name}-${var.environment}-web-client"
  user_pool_id = aws_cognito_user_pool.main.id

  # OAuth Configuration
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code", "implicit"]
  allowed_oauth_scopes                 = ["email", "openid", "profile", "aws.cognito.signin.user.admin"]

  # Callback URLs (adjust for your frontend)
  callback_urls = var.callback_urls
  logout_urls   = var.logout_urls

  # Supported Identity Providers
  supported_identity_providers = concat(
    ["COGNITO"],
    var.enable_google_oauth ? ["Google"] : []
  )

  # Token Validity
  access_token_validity  = 1  # 1 hour
  id_token_validity      = 1  # 1 hour
  refresh_token_validity = 30 # 30 days

  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "days"
  }

  # Security
  prevent_user_existence_errors = "ENABLED"
  enable_token_revocation       = true

  # Read/Write Attributes
  read_attributes = [
    "email",
    "email_verified",
    "name",
    "preferred_username",
    "sub"
  ]

  write_attributes = [
    "email",
    "name",
    "preferred_username"
  ]

  # Explicit auth flows
  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_PASSWORD_AUTH"
  ]
}

# =====================================================================
# Google Identity Provider (Optional)
# =====================================================================

resource "aws_cognito_identity_provider" "google" {
  count         = var.enable_google_oauth ? 1 : 0
  user_pool_id  = aws_cognito_user_pool.main.id
  provider_name = "Google"
  provider_type = "Google"

  provider_details = {
    authorize_scopes = "email openid profile"
    client_id        = var.google_client_id
    client_secret    = var.google_client_secret
  }

  attribute_mapping = {
    email             = "email"
    name              = "name"
    username          = "sub"
    preferred_username = "email"
  }
}

# =====================================================================
# User Pool Client (for Lambda/Backend)
# =====================================================================

resource "aws_cognito_user_pool_client" "backend_client" {
  name         = "${var.project_name}-${var.environment}-backend-client"
  user_pool_id = aws_cognito_user_pool.main.id

  # No OAuth flows for backend
  generate_secret = true

  # Explicit auth flows
  explicit_auth_flows = [
    "ALLOW_ADMIN_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH"
  ]

  # Token Validity
  access_token_validity  = 1
  id_token_validity      = 1
  refresh_token_validity = 30

  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "days"
  }

  prevent_user_existence_errors = "ENABLED"
  enable_token_revocation       = true
}

# =====================================================================
# Store Cognito Configuration in SSM Parameter Store
# =====================================================================

resource "aws_ssm_parameter" "cognito_user_pool_id" {
  name        = "/${var.project_name}/${var.environment}/cognito/user-pool-id"
  description = "Cognito User Pool ID"
  type        = "String"
  value       = aws_cognito_user_pool.main.id

  tags = var.common_tags
}

resource "aws_ssm_parameter" "cognito_client_id" {
  name        = "/${var.project_name}/${var.environment}/cognito/web-client-id"
  description = "Cognito Web Client ID"
  type        = "String"
  value       = aws_cognito_user_pool_client.web_client.id

  tags = var.common_tags
}

resource "aws_ssm_parameter" "cognito_domain" {
  name        = "/${var.project_name}/${var.environment}/cognito/domain"
  description = "Cognito Hosted UI Domain"
  type        = "String"
  value       = aws_cognito_user_pool_domain.main.domain

  tags = var.common_tags
}

resource "aws_ssm_parameter" "cognito_backend_client_secret" {
  name        = "/${var.project_name}/${var.environment}/cognito/backend-client-secret"
  description = "Cognito Backend Client Secret"
  type        = "SecureString"
  value       = aws_cognito_user_pool_client.backend_client.client_secret

  tags = var.common_tags
}
