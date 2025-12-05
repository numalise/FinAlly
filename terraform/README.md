# Terraform Infrastructure

> **Infrastructure as Code for the FinAlly serverless platform**

Complete Terraform configuration for deploying AWS infrastructure across dev, staging, and production environments.

**Last Updated:** December 2025

---

## Overview

FinAlly infrastructure is managed entirely with Terraform, following modular architecture and best practices for maintainability and reusability.

### Infrastructure Components

- **VPC & Networking** - Multi-AZ VPC with public/private subnets, NAT Gateway
- **Database** - RDS PostgreSQL 16 with automated backups
- **Compute** - Lambda function with container image from ECR
- **API Layer** - API Gateway HTTP API with Cognito authorizer
- **Authentication** - Cognito User Pool with OAuth support
- **Storage** - ECR repository for Lambda container images
- **Secrets** - Secrets Manager for database credentials
- **Monitoring** - CloudWatch logs and metrics
- **Management** - SSM Bastion for database access

---

## Structure

```
terraform/
├── backend/                       # Terraform state backend
│   ├── main.tf                    # S3 bucket + DynamoDB table
│   ├── outputs.tf                 # Backend configuration
│   └── README.md                  # Backend setup guide
├── modules/                       # Reusable infrastructure modules
│   ├── networking/                # VPC, subnets, NAT Gateway
│   ├── security-groups/           # Security group rules
│   ├── iam/                       # IAM roles and policies
│   ├── database/                  # RDS PostgreSQL
│   ├── lambda-api/                # Lambda function
│   ├── api-gateway/               # API Gateway HTTP API
│   ├── cognito/                   # User Pool
│   ├── ecr/                       # Container registry
│   └── ssm-bastion/               # Database access bastion
└── environments/                  # Environment-specific configs
    ├── dev/                       # Development environment
    │   ├── main.tf                # Module instantiation
    │   ├── backend.tf             # Remote state config
    │   ├── terraform.tfvars       # Variable values
    │   └── outputs.tf             # Environment outputs
    ├── staging/                   # Staging environment
    └── prod/                      # Production environment
```

---

## Modules

### networking

Creates VPC with public and private subnets across 2 availability zones.

**Resources:**
- VPC (10.0.0.0/16)
- Public subnets (10.0.1.0/24, 10.0.2.0/24)
- Private subnets (10.0.101.0/24, 10.0.102.0/24)
- Internet Gateway
- NAT Gateway (public subnet AZ-a)
- Route tables and associations

**Usage:**
```hcl
module "networking" {
  source = "../../modules/networking"

  project_name = "finally"
  environment  = "dev"
  vpc_cidr     = "10.0.0.0/16"
  common_tags  = var.common_tags
}
```

---

### security-groups

Defines security group rules for Lambda, RDS, and bastion access.

**Security Groups:**
- **Lambda SG:** Egress to RDS (5432) and HTTPS (443)
- **RDS SG:** Ingress from Lambda SG (5432)
- **Bastion SG:** Egress to RDS (5432), SSM managed

**Usage:**
```hcl
module "security_groups" {
  source = "../../modules/security-groups"

  project_name       = "finally"
  environment        = "dev"
  vpc_id             = module.networking.vpc_id
  lambda_sg_id       = module.lambda_api.lambda_sg_id
}
```

---

### iam

Creates IAM roles and policies for Lambda execution.

**Resources:**
- Lambda execution role
- VPC access policy (ENI management)
- Secrets Manager read policy
- CloudWatch Logs write policy

**Usage:**
```hcl
module "iam" {
  source = "../../modules/iam"

  project_name          = "finally"
  environment           = "dev"
  database_secret_arn   = module.database.secret_arn
}
```

---

### database

Deploys RDS PostgreSQL instance with security and backup configuration.

**Resources:**
- RDS PostgreSQL 16.10
- DB subnet group
- Secret in Secrets Manager
- Automated backups (7-day retention)
- Encryption at rest

**Usage:**
```hcl
module "database" {
  source = "../../modules/database"

  project_name         = "finally"
  environment          = "dev"
  db_instance_class    = "db.t3.micro"
  db_allocated_storage = 20
  db_name              = "finally"
  db_username          = "finally_admin"
  private_subnet_ids   = module.networking.private_subnet_ids
  db_security_group_id = module.security_groups.db_sg_id
}
```

---

### lambda-api

Deploys Lambda function with container image from ECR.

**Resources:**
- Lambda function (container image)
- Lambda security group
- Environment variables (DATABASE_URL, COGNITO_*)
- VPC configuration

**Usage:**
```hcl
module "lambda_api" {
  source = "../../modules/lambda-api"

  project_name             = "finally"
  environment              = "dev"
  ecr_image_uri            = "${module.ecr.repository_url}:latest"
  lambda_memory_size       = 512
  lambda_timeout           = 30
  vpc_id                   = module.networking.vpc_id
  private_subnet_ids       = module.networking.private_subnet_ids
  database_url             = module.database.connection_string
  cognito_user_pool_id     = module.cognito.user_pool_id
  cognito_web_client_id    = module.cognito.web_client_id
  lambda_execution_role_arn = module.iam.lambda_execution_role_arn
}
```

---

### api-gateway

Creates API Gateway HTTP API with Cognito authorization and 30+ routes.

**Resources:**
- HTTP API v2
- Cognito JWT authorizer
- Route definitions (GET/POST/PATCH/DELETE)
- Lambda integration
- CloudWatch logs
- CORS configuration

**Usage:**
```hcl
module "api_gateway" {
  source = "../../modules/api-gateway"

  project_name          = "finally"
  environment           = "dev"
  lambda_invoke_arn     = module.lambda_api.lambda_invoke_arn
  lambda_function_name  = module.lambda_api.lambda_function_name
  cognito_user_pool_id  = module.cognito.user_pool_id
  cognito_client_id     = module.cognito.web_client_id
  cors_allow_origins    = ["http://localhost:3000"]
}
```

---

### cognito

Creates Cognito User Pool for authentication.

**Resources:**
- User Pool
- User Pool Client (web app)
- User Pool Client (backend)
- User Pool Domain
- Google OAuth integration (optional)

**Usage:**
```hcl
module "cognito" {
  source = "../../modules/cognito"

  project_name    = "finally"
  environment     = "dev"
  callback_urls   = ["http://localhost:3000/login"]
  logout_urls     = ["http://localhost:3000"]
}
```

---

### ecr

Creates ECR repository for Lambda container images.

**Resources:**
- ECR repository
- Lifecycle policy (keep 10 recent images)
- Image scanning on push

**Usage:**
```hcl
module "ecr" {
  source = "../../modules/ecr"

  project_name = "finally"
  environment  = "dev"
}
```

---

### ssm-bastion

Deploys EC2 instance for database access via SSM Session Manager.

**Resources:**
- EC2 t3.micro instance
- IAM role for SSM
- Security group (egress to RDS)
- PostgreSQL client pre-installed

**Usage:**
```hcl
module "ssm_bastion" {
  source = "../../modules/ssm-bastion"

  project_name         = "finally"
  environment          = "dev"
  vpc_id               = module.networking.vpc_id
  public_subnet_id     = module.networking.public_subnet_ids[0]
  bastion_sg_id        = module.security_groups.bastion_sg_id
}
```

---

## Environments

### Dev Environment

**Purpose:** Active development and testing

**Configuration:**
- Single NAT Gateway (cost savings)
- t3.micro RDS instance
- 512MB Lambda memory
- 7-day log retention
- Bastion always running

**Deploy:**
```bash
cd terraform/environments/dev
terraform init
terraform plan
terraform apply
```

---

### Staging Environment (Future)

**Purpose:** Pre-production validation

**Configuration:**
- Multi-AZ NAT Gateway
- t3.small RDS instance
- 1024MB Lambda memory
- Provisioned concurrency (2)
- 14-day log retention

---

### Production Environment (Future)

**Purpose:** Live user-facing application

**Configuration:**
- Multi-AZ everything
- t3.medium RDS (Multi-AZ)
- 1024MB Lambda memory
- Provisioned concurrency (5)
- RDS Proxy
- 30-day log retention
- CloudFront CDN
- WAF enabled

---

## Workflow

### Initial Deployment

```bash
# 1. Deploy backend (S3 + DynamoDB)
cd terraform/backend
terraform init
terraform apply

# 2. Deploy dev environment
cd ../environments/dev
terraform init
terraform plan -out=tfplan
terraform apply tfplan

# 3. Capture outputs
terraform output > ../../outputs-dev.txt
```

### Making Changes

```bash
# 1. Edit Terraform files
vim modules/lambda-api/main.tf

# 2. Plan changes
terraform plan

# 3. Review plan carefully
# Check for unexpected deletions or recreations

# 4. Apply changes
terraform apply

# 5. Verify resources
aws lambda get-function --function-name finally-dev-api
```

### Destroying Resources

```bash
# WARNING: This will delete ALL infrastructure
terraform destroy

# Safer: Destroy specific resources
terraform destroy -target=module.ssm_bastion
```

---

## Best Practices

### Variable Management

**Never commit secrets:**
- Use `.gitignore` for `terraform.tfvars`
- Use Secrets Manager for sensitive data
- Reference secrets in Lambda environment variables

**Use workspace variables:**
```hcl
variable "db_instance_class" {
  type = string
  description = "RDS instance class"
}

variable "common_tags" {
  type = map(string)
  description = "Common tags for all resources"
}
```

### State Management

**Remote state (S3):**
- Versioned bucket
- DynamoDB locking
- Encrypted at rest

**State commands:**
```bash
# List resources
terraform state list

# Show resource details
terraform state show aws_lambda_function.api

# Move resource
terraform state mv aws_lambda_function.old aws_lambda_function.new

# Import existing resource
terraform import aws_lambda_function.api finally-dev-api
```

### Module Versioning

**Pin module versions (future):**
```hcl
module "networking" {
  source  = "git::https://github.com/org/terraform-modules.git//networking?ref=v1.0.0"
  # ...
}
```

### Cost Optimization

**Review cost before apply:**
```bash
# Use Infracost (optional)
infracost breakdown --path .

# Estimate based on plan
terraform plan | grep "will be created"
```

**Monitor costs:**
```bash
aws ce get-cost-and-usage \
  --time-period Start=2025-12-01,End=2025-12-31 \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=DIMENSION,Key=SERVICE
```

---

## Troubleshooting

### State Lock

```bash
# Force unlock (if stuck)
terraform force-unlock <LOCK_ID>

# Check DynamoDB lock table
aws dynamodb scan --table-name finally-terraform-locks
```

### Resource Already Exists

```bash
# Import existing resource
terraform import module.database.aws_db_instance.main finally-dev-postgres
```

### Plan Shows Unexpected Changes

```bash
# Refresh state
terraform refresh

# Compare state with reality
terraform plan -refresh-only
```

---

## Further Reading

- [SETUP.md](../SETUP.md) - Initial setup procedures
- [DEPLOYMENT.md](../docs/DEPLOYMENT.md) - Deployment guide
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Terraform Best Practices](https://www.terraform.io/docs/cloud/guides/recommended-practices/index.html)

---

**Terraform Guide Version:** 1.0 (Phase 5)
**Last Updated:** December 2025
