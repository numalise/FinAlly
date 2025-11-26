# FinAlly — Personal Finance & Investment Tracking Platform

Cloud-native, multi-user personal finance platform built with production-grade serverless architecture on AWS.

## 🎯 Project Status

**Current Phase:** Phase 3 - Authentication (Cognito)

### Completed Phases

✅ **Phase 0 - Development Environment Setup**
- AWS CLI configured (eu-central-1)
- Terraform installed and initialized
- GitHub repository with branching strategy (main/staging/dev)

✅ **Phase 1 - Core Infrastructure**
- VPC with public/private subnets (multi-AZ)
- NAT Gateway for Lambda internet access
- Security groups (Lambda, Database)
- IAM roles (Lambda, EventBridge, API Gateway)

✅ **Phase 2 - Database Infrastructure**
- RDS PostgreSQL 16.10 (Free Tier: t3.micro, 20GB)
- 13 tables with complete schema
- 22 seed categories (assets, income, expenses)
- SSM Bastion for secure access
- Secrets Manager for credentials

### Upcoming Phases

🔄 **Phase 3 - Authentication** (In Progress)
- Cognito User Pool with email/password
- Google OAuth integration
- Hosted UI
- User pool client for Next.js

⏳ **Phase 4 - API Layer**
- Lambda functions with Prisma ORM
- API Gateway HTTP API
- Authentication integration

⏳ **Phase 5 - Frontend**
- Next.js application
- Chakra UI components
- CloudFront deployment

---

## 🏗️ Architecture

### Technology Stack

**Backend:**
- AWS Lambda (Node.js 20.x)
- RDS PostgreSQL 16.10
- Prisma ORM with Accelerate
- API Gateway HTTP API
- Cognito for authentication

**Frontend:**
- Next.js 14+ (App Router)
- React 18+
- TypeScript
- Chakra UI
- Deployed on CloudFront + S3

**Infrastructure:**
- Terraform (Infrastructure as Code)
- GitHub Actions (CI/CD)
- AWS Secrets Manager
- CloudWatch (Logging & Monitoring)

### AWS Services

- **Compute:** Lambda, EC2 (SSM Bastion)
- **Database:** RDS PostgreSQL
- **Networking:** VPC, NAT Gateway, Security Groups
- **Auth:** Cognito User Pool
- **Storage:** S3 (frontend, Terraform state)
- **Security:** Secrets Manager, IAM
- **Monitoring:** CloudWatch

---

## 📊 Database Schema

**13 Tables:**
- `users` - User accounts
- `asset_categories` - Investment categories (8 types)
- `assets` - User investments
- `asset_inputs` - Monthly snapshots
- `market_cap_history` - Asset price tracking
- `income_categories` - Income types (6 types)
- `incoming_items` - Income entries
- `expense_categories` - Expense types (8 types)
- `expense_items` - Expense entries
- `budgets` - Budget management
- `category_allocation_targets` - Asset allocation goals
- `networth_materialized` - Net worth cache
- `audit_events` - Audit logging

**Views:**
- `latest_networth` - Current net worth per user

---

## 🚀 Getting Started

### Prerequisites

- AWS Account with admin access
- AWS CLI configured
- Terraform >= 1.5.0
- Node.js 20.x
- PostgreSQL client (psql)
- Git

### Repository Structure
```
FinAlly/
├── .github/workflows/      # CI/CD pipelines
├── terraform/
│   ├── modules/            # Reusable Terraform modules
│   │   ├── networking/
│   │   ├── security-groups/
│   │   ├── iam/
│   │   ├── database/
│   │   └── ssm-bastion/
│   └── environments/       # Environment configs
│       ├── dev/
│       ├── staging/
│       └── prod/
├── database/
│   ├── migrations/         # SQL migration files
│   └── prisma/            # Prisma schema
├── lambda/                 # Lambda function code
├── frontend/              # Next.js application
├── scripts/               # Utility scripts
└── docs/                  # Documentation
```

### Deployment
```bash
# Clone repository
git clone <repository-url>
cd FinAlly

# Initialize Terraform backend
cd terraform/backend
terraform init
terraform apply

# Deploy dev environment
cd ../environments/dev
terraform init
terraform apply

# Run database migrations
cd ../../../scripts
./apply_migration_ssm.sh
```

---

## 💰 Cost Breakdown

**Monthly Costs (Dev Environment):**
- RDS PostgreSQL: €0 (Free Tier for 12 months)
- NAT Gateway: ~€32/month
- SSM Bastion: ~€8/month (can be terminated when not needed)
- Lambda: ~€0 (within Free Tier limits)
- API Gateway: ~€0 (within Free Tier limits)
- Secrets Manager: ~€0.40/month
- **Total: ~€40/month**

**Cost Optimization:**
- Terminate bastion when not performing migrations
- Use VPC endpoints for AWS services (optional)
- Scale down or terminate dev environment when not in use

---

## 🔒 Security

- Database in private subnets (no public access)
- SSL/TLS encryption enforced for all connections
- Secrets Manager for credential storage
- IAM roles with least-privilege access
- Security groups with restricted ingress/egress
- SSM Session Manager for secure bastion access (no SSH keys)

---

## 📝 Development Workflow

### Branching Strategy

- `main` - Production-ready code
- `staging` - Pre-production validation
- `dev` - Active development (default)
- Feature branches: `feature/`, `fix/`, `infra/`

### Commit Convention
```
feat: Add new feature
fix: Bug fix
infra: Infrastructure changes
docs: Documentation updates
refactor: Code refactoring
test: Test additions/updates
```

### Tags

- `phase-X-complete` - Phase completion markers
- `vX.Y.Z-description` - Version releases

---

## 🧪 Testing

### Database Access
```bash
# Via SSM Bastion
BASTION_ID=$(cd terraform/environments/dev && terraform output -raw bastion_instance_id)
aws ssm start-session --target "$BASTION_ID"

# On bastion
export PGPASSWORD='<password>'
export PGSSLMODE=require
psql -h <db-host> -U finally_admin -d finally
```

### Run Migrations
```bash
cd scripts
./apply_migration_ssm.sh
```

---

## 📚 Documentation

- [Database Schema](database/README.md)
- [Infrastructure Modules](terraform/modules/README.md)
- [API Documentation](docs/api.md) *(Coming in Phase 4)*
- [Frontend Setup](frontend/README.md) *(Coming in Phase 5)*

---

## 🎯 Roadmap

- [x] Phase 0: Environment Setup
- [x] Phase 1: Core Infrastructure
- [x] Phase 2: Database
- [ ] Phase 3: Authentication (Cognito)
- [x] Phase 4.1: Lambda API + API Gateway (Complete)
- [ ] Phase 5: Frontend (Next.js)
- [ ] Phase 6: CI/CD Pipelines
- [ ] Phase 7: Monitoring & Alerting
- [ ] Phase 8: Production Deployment

---

## 👤 Author

**Emanuele**  
Portfolio Project - Cloud-Native Finance Platform

---

## �� License

This is a portfolio project for demonstration purposes.

---

## 🔗 Links

- AWS Region: eu-central-1 (Frankfurt)
- Terraform State: S3 + DynamoDB backend
- Database: PostgreSQL 16.10
