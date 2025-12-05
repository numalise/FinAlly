# IAM Module

## Overview
Provisions IAM roles and policies with least-privilege permissions for Lambda functions and AWS service integrations.

## Roles Created

### 1. Lambda Execution Role
**Purpose**: Execute Lambda functions with necessary AWS service access

**Managed Policies Attached**:
- `AWSLambdaBasicExecutionRole` - CloudWatch Logs
- `AWSLambdaVPCAccessExecutionRole` - VPC ENI management

**Custom Policies Attached**:
- Secrets Manager read access
- SSM Parameter Store read access
- KMS decrypt (for encrypted secrets)
- SES send email
- Cognito User Pool access
- Optional: RDS Data API access

### 2. EventBridge Lambda Role
**Purpose**: Allow EventBridge to invoke Lambda functions for scheduled tasks

**Permissions**:
- `lambda:InvokeFunction` on project Lambda functions

### 3. API Gateway CloudWatch Role
**Purpose**: Enable API Gateway to write logs to CloudWatch

**Managed Policies Attached**:
- `AmazonAPIGatewayPushToCloudWatchLogs`

## Resource Naming Patterns

All IAM resources follow project naming conventions:
```
{project_name}-{environment}-{resource_type}-{suffix}
```

Examples:
- `finally-dev-lambda-execution-role`
- `finally-prod-secrets-manager-policy`

## Security Features

1. **Least Privilege**: Each policy grants only necessary permissions
2. **Resource Scoping**: Permissions limited to project resources where possible
3. **Condition Keys**: Additional constraints (e.g., SES sender addresses)
4. **Encryption**: KMS integration for secrets decryption
5. **Service-to-Service**: Proper trust relationships between AWS services

## Usage
```hcl
module "iam" {
  source = "../../modules/iam"
  
  project_name           = "finally"
  environment            = "dev"
  aws_region             = "eu-central-1"
  ses_from_addresses     = ["noreply@finally.app", "alerts@finally.app"]
  enable_rds_data_api    = false  # true if using RDS Data API
  cognito_user_pool_arn  = ""     # Add after Cognito created
  aurora_cluster_arn     = ""     # Add after Aurora created
  
  common_tags = local.common_tags
}
```

## IAM Policy Details

### Secrets Manager Policy
```json
{
  "Effect": "Allow",
  "Action": [
    "secretsmanager:GetSecretValue",
    "secretsmanager:DescribeSecret"
  ],
  "Resource": "arn:aws:secretsmanager:eu-central-1:*:secret:finally/dev/*"
}
```

### SSM Parameter Store Policy
```json
{
  "Effect": "Allow",
  "Action": [
    "ssm:GetParameter",
    "ssm:GetParameters",
    "ssm:GetParametersByPath"
  ],
  "Resource": "arn:aws:ssm:eu-central-1:*:parameter/finally/dev/*"
}
```

### SES Send Email Policy
```json
{
  "Effect": "Allow",
  "Action": [
    "ses:SendEmail",
    "ses:SendRawEmail"
  ],
  "Resource": "*",
  "Condition": {
    "StringLike": {
      "ses:FromAddress": ["noreply@*", "*@finally.app"]
    }
  }
}
```

## Cost
IAM roles and policies are **free**. No charges for creation or usage.

## Updating Policies

To add new permissions, update the relevant policy resource and apply:
```bash
terraform plan -target=module.iam
terraform apply -target=module.iam
```

Lambda functions automatically pick up new permissions without redeployment.
