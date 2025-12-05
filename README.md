# FinAlly — Personal Finance & Investment Tracking Platform 💰📈

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![AWS](https://img.shields.io/badge/AWS-Lambda%20%7C%20RDS%20%7C%20API%20Gateway-orange)](https://aws.amazon.com)
[![Terraform](https://img.shields.io/badge/Terraform-1.5+-purple)](https://www.terraform.io)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green)](https://nodejs.org)

A production-ready, serverless personal finance platform built on AWS with full infrastructure automation. Track investments, manage budgets, analyze cash flow, and monitor net worth with real-time data visualization and secure multi-user authentication.

![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![Next.js](https://img.shields.io/badge/Next.js-15.1-black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.10-blue)
![Prisma](https://img.shields.io/badge/Prisma-6.0-teal)

---

## 🏗️ Complete Architecture

This project implements a modern, serverless architecture with complete infrastructure automation via Terraform. Every component is provisioned as code, deployed on AWS, and secured with industry best practices.

- **Backend**: AWS Lambda with containerized Node.js (Prisma ORM)
- **Frontend**: Next.js 15 with React Server Components and Chakra UI
- **Database**: RDS PostgreSQL 16.10 in private subnets (Multi-AZ ready)
- **Infrastructure**: 100% Terraform with modular components
- **Authentication**: AWS Cognito with Google OAuth support
- **Security**: Private VPC, SSL/TLS, Secrets Manager, IAM roles

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        User Browser                                 │
│                    (CloudFront CDN - Future)                        │
└──────────────────────────────┬──────────────────────────────────────┘
                                │ HTTPS
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     Next.js Frontend                                │
│              (Chakra UI + React Query + TypeScript)                 │
└──────────────────────────────┬──────────────────────────────────────┘
                                │ JWT Bearer Token
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│          API Gateway HTTP API v2 (30+ Routes)                       │
│                  Cognito JWT Authorizer                             │
└──────────────────────────────┬──────────────────────────────────────┘
                                │
                                ▼
         ┌──────────────────────────────────────────────┐
         │  AWS Lambda (Node.js 20 Container)           │
         │  - Prisma ORM with connection pooling        │
         │  - JWT verification middleware                │
         │  - Auto user provisioning                    │
         │  - 8 route handler modules                   │
         └──────────────────────┬───────────────────────┘
                                │ VPC Private Subnet
                                ▼
         ┌──────────────────────────────────────────────┐
         │  RDS PostgreSQL 16.10 (Private Subnet)       │
         │  - 14 tables with complete schema            │
         │  - Materialized views for performance        │
         │  - Automated backups (7-day retention)       │
         │  - SSL/TLS required                          │
         └──────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    Supporting Services                              │
├─────────────────────────────────────────────────────────────────────┤
│  Cognito User Pool  │  User authentication + Google OAuth           │
│  Secrets Manager    │  Database credentials (no hardcoded secrets)  │
│  ECR                │  Lambda container image registry              │
│  CloudWatch         │  Logs, metrics, and monitoring                │
│  SSM Bastion (EC2)  │  Secure database access for migrations        │
│  NAT Gateway        │  Lambda internet access (VPC egress)          │
└─────────────────────────────────────────────────────────────────────┘
```

### Network Architecture

**VPC Design (10.0.0.0/16):**
- **Public Subnets** (2 AZs): 10.0.1.0/24, 10.0.2.0/24
  - Internet Gateway attached
  - NAT Gateway for Lambda egress
  - SSM Bastion instance
- **Private Subnets** (2 AZs): 10.0.101.0/24, 10.0.102.0/24
  - Lambda ENIs (VPC integration)
  - RDS PostgreSQL instance
  - No direct internet access

**Security Groups:**
- Lambda SG: Egress to RDS (5432), HTTPS (443)
- RDS SG: Ingress from Lambda SG only (5432)
- Bastion SG: Egress to RDS (5432), SSM managed

---

## ✨ Complete Feature Set

### Financial Tracking
- 📊 **Asset Management** - Track investments across 8 categories (stocks, ETFs, crypto, real estate, etc.)
- 💵 **Income Tracking** - Record income from 6 categories (salary, bonuses, dividends, rental, etc.)
- 🧾 **Expense Management** - Track expenses with 8 main categories and custom subcategories
- 📅 **Budget Planning** - Set monthly budgets by category and track spending
- 🎯 **Allocation Targets** - Define target asset allocation percentages
- 📈 **Net Worth Calculation** - Automated net worth tracking with historical data
- 📊 **Cash Flow Analysis** - Monthly income vs expenses with visual charts

### Technical Features
- 🔐 **Secure Authentication** - AWS Cognito with JWT tokens and auto-provisioning
- 🌐 **Multi-User Support** - Complete user isolation at database level
- 🚀 **Serverless Architecture** - Auto-scaling Lambda with connection pooling
- 💾 **Type-Safe ORM** - Prisma with full TypeScript support
- 🎨 **Modern UI** - Chakra UI with responsive design and dark mode
- 📱 **Real-Time Updates** - React Query for optimistic updates and caching
- 🔄 **RESTful API** - 30+ endpoints with comprehensive validation
- 🗄️ **Database Migrations** - SQL-first migration strategy with zero-downtime

---

## 🛠️ Technology Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Cloud Provider** | AWS | Complete infrastructure |
| **Region** | eu-central-1 (Frankfurt) | Primary deployment region |
| **Infrastructure as Code** | Terraform 1.5+ | Declarative infrastructure provisioning |
| **Backend Runtime** | AWS Lambda (Node.js 20.x) | Serverless API execution |
| **Backend Language** | TypeScript 5.7 | Type-safe backend development |
| **ORM** | Prisma 6.0 | Database abstraction and type safety |
| **API Gateway** | HTTP API v2 | RESTful API endpoint management |
| **Authentication** | AWS Cognito | User management and JWT tokens |
| **Database** | PostgreSQL 16.10 (RDS) | Relational data storage |
| **Container Registry** | Amazon ECR | Lambda Docker image storage |
| **Secrets Management** | AWS Secrets Manager | Secure credential storage |
| **Frontend Framework** | Next.js 15.1 (App Router) | Server-side rendering and static generation |
| **Frontend Language** | TypeScript 5.7 | Type-safe frontend development |
| **UI Library** | Chakra UI 2.8 | Component library and theming |
| **State Management** | React Query 5.90 | Server state synchronization |
| **Frontend Runtime** | React 18 | Component-based UI |
| **Database Access** | SSM Session Manager | Secure bastion access (no SSH keys) |
| **Monitoring** | CloudWatch | Logs, metrics, and alarms |

---

## 📁 Project Structure

The repository is organized into logical components with clear separation of concerns, following industry best practices for infrastructure as code and microservices architecture.

```
FinAlly/
├── README.md                           # Project overview and setup guide
├── SETUP.md                            # Complete setup instructions (prerequisites → deployment)
├── CONTRIBUTING.md                     # Contribution guidelines and PR process
├── .env.example                        # Environment variable template
│
├── docs/
│   ├── API.md                          # Complete API reference (30+ endpoints)
│   ├── ARCHITECTURE.md                 # System architecture and design decisions
│   ├── DEPLOYMENT.md                   # Production deployment procedures
│   └── TROUBLESHOOTING.md              # Common issues and solutions
│
├── frontend/                           # Next.js application
│   ├── README.md                       # Frontend overview and tech stack
│   ├── DEVELOPMENT.md                  # Development workflow and patterns
│   ├── src/
│   │   ├── app/                       # Next.js App Router pages
│   │   ├── components/                # React components (dashboard, input, charts)
│   │   ├── hooks/                     # Custom React hooks (API integration)
│   │   ├── lib/                       # Utilities (API client, Amplify config)
│   │   └── types/                     # TypeScript type definitions
│   ├── public/                        # Static assets
│   ├── package.json                   # Frontend dependencies
│   └── next.config.js                 # Next.js configuration
│
├── lambda/                            # Lambda backend API
│   ├── README.md                      # Backend overview and architecture
│   ├── DEVELOPMENT.md                 # Backend development guide
│   ├── src/
│   │   ├── routes/                   # API route handlers (8 modules)
│   │   │   ├── README.md             # Routes documentation
│   │   │   ├── assets.ts             # Asset management endpoints
│   │   │   ├── assetInputs.ts        # Monthly asset snapshots
│   │   │   ├── incomings.ts          # Income tracking
│   │   │   ├── expenses.ts           # Expense management
│   │   │   ├── subcategories.ts      # Custom expense subcategories
│   │   │   ├── budgets.ts            # Budget planning
│   │   │   ├── allocation.ts         # Asset allocation targets
│   │   │   └── networth.ts           # Net worth calculation
│   │   ├── middleware/               # Authentication and request processing
│   │   │   ├── README.md             # Middleware documentation
│   │   │   └── auth.ts               # JWT verification and user provisioning
│   │   ├── utils/                    # Helper functions
│   │   └── index.ts                  # Main Lambda handler
│   ├── prisma/
│   │   └── schema.prisma             # Database schema definition
│   ├── Dockerfile                    # Multi-stage Docker build
│   ├── package.json                  # Backend dependencies
│   └── tsconfig.json                 # TypeScript configuration
│
├── database/                         # Database schema and migrations
│   ├── README.md                     # Database documentation
│   ├── MIGRATIONS.md                 # Migration procedures and best practices
│   └── migrations/
│       ├── 001_complete_schema.sql   # Initial schema (14 tables)
│       └── 002_add_subcategories.sql # Expense subcategories feature
│
├── terraform/                        # Infrastructure as Code
│   ├── README.md                     # Terraform guide and module overview
│   ├── backend/                      # Remote state backend (S3 + DynamoDB)
│   ├── modules/                      # Reusable infrastructure modules
│   │   ├── networking/              # VPC, subnets, NAT Gateway, routing
│   │   ├── security-groups/         # Security group rules (Lambda, RDS, Bastion)
│   │   ├── iam/                     # IAM roles and policies (Lambda execution)
│   │   ├── database/                # RDS PostgreSQL with Secrets Manager
│   │   ├── lambda-api/              # Lambda function with VPC integration
│   │   ├── api-gateway/             # HTTP API v2 with Cognito authorizer
│   │   ├── cognito/                 # User Pool with OAuth support
│   │   ├── ecr/                     # Container registry
│   │   └── ssm-bastion/             # EC2 instance for database access
│   └── environments/                # Environment-specific configurations
│       ├── dev/                     # Development environment
│       ├── staging/                 # Staging environment (future)
│       └── prod/                    # Production environment (future)
│
└── scripts/                         # Operational utilities
    ├── README.md                    # Scripts documentation
    ├── cognito_admin.sh             # Cognito user management (create, list, delete)
    └── test_api.sh                  # API endpoint testing with authentication
```

---

## 🚀 Complete Deployment Guide

### Prerequisites

- **AWS Account** with admin access
- **AWS CLI** v2 configured (`aws configure`)
- **Terraform** >= 1.5.0
- **Node.js** 20.x (frontend and Lambda development)
- **Docker** (for Lambda container builds)
- **PostgreSQL client** (psql) for database access
- **Git** for version control

### Deploy Infrastructure

```bash
# 1. Clone repository
git clone <repository-url>
cd FinAlly

# 2. Initialize Terraform backend (S3 + DynamoDB)
cd terraform/backend
terraform init
terraform apply

# 3. Deploy dev environment infrastructure
cd ../environments/dev
terraform init
terraform apply

# 4. Capture infrastructure outputs
terraform output > ../../terraform-outputs.txt

# 5. Apply database migrations
cd ../../../scripts
./apply_migration_ssm.sh database/migrations/001_complete_schema.sql
./apply_migration_ssm.sh database/migrations/002_add_subcategories.sql
```

### Build and Deploy Lambda

```bash
# 1. Build Lambda container image
cd lambda
npm install
npx prisma generate
docker build -t finally-lambda:latest .

# 2. Authenticate with ECR
aws ecr get-login-password --region eu-central-1 | \
  docker login --username AWS --password-stdin \
  <account-id>.dkr.ecr.eu-central-1.amazonaws.com

# 3. Tag and push image
ECR_REPO=$(cd ../terraform/environments/dev && terraform output -raw ecr_repository_url)
docker tag finally-lambda:latest $ECR_REPO:latest
docker push $ECR_REPO:latest

# 4. Update Lambda function
aws lambda update-function-code \
  --function-name finally-dev-api \
  --image-uri $ECR_REPO:latest
```

### Deploy Frontend

```bash
# 1. Configure environment variables
cd frontend
cp ../.env.example .env.local

# Get Terraform outputs and populate .env.local
cd ../terraform/environments/dev
echo "NEXT_PUBLIC_API_URL=$(terraform output -raw api_invoke_url)" >> ../../frontend/.env.local
echo "NEXT_PUBLIC_COGNITO_USER_POOL_ID=$(terraform output -raw cognito_user_pool_id)" >> ../../frontend/.env.local
echo "NEXT_PUBLIC_COGNITO_CLIENT_ID=$(terraform output -raw cognito_web_client_id)" >> ../../frontend/.env.local
echo "NEXT_PUBLIC_COGNITO_DOMAIN=$(terraform output -raw cognito_domain)" >> ../../frontend/.env.local
echo "NEXT_PUBLIC_COGNITO_REGION=eu-central-1" >> ../../frontend/.env.local

# 2. Install dependencies
cd ../../frontend
npm install

# 3. Run development server
npm run dev

# Access at: http://localhost:3000
```

### Create Test User

```bash
cd scripts
./cognito_admin.sh

# Select: 1. Create new user
# Email: test@example.com
# Name: Test User
# Temporary Password: TestPass123!
```

---

## 💰 Cost Analysis

Understanding the cost structure is essential for budgeting and optimization. The following breakdown represents typical monthly costs for a development environment running continuously in the eu-central-1 region.

### Monthly Costs (Development - 24/7)

| Service | Configuration | Cost (EUR) | Notes |
|---------|--------------|------------|-------|
| RDS PostgreSQL | db.t3.micro (20GB) | €0.00 | Free Tier (12 months) |
| NAT Gateway | Single AZ | €32.00 | Data transfer: ~€5 |
| Lambda | 512MB, 30s timeout | €0.00 | Free Tier (1M requests) |
| API Gateway | HTTP API v2 | €0.00 | Free Tier (1M requests) |
| Cognito | User Pool | €0.00 | Free (50k MAUs) |
| ECR | Docker images (~500MB) | €0.05 | Storage only |
| Secrets Manager | 1 secret | €0.40 | Per secret/month |
| CloudWatch | Logs + metrics | €3.00 | Log retention 7 days |
| SSM Bastion | t3.micro (running) | €8.00 | Terminate when not needed |
| Data Transfer | Outbound | €2.00 | Varies by usage |
| **Total (Bastion Running)** | | **€45/month** | |
| **Total (Bastion Stopped)** | | **€37/month** | |

### Cost After Free Tier Expiration (Year 2+)

| Service | Cost (EUR) |
|---------|------------|
| RDS PostgreSQL | €15.00 |
| NAT Gateway | €37.00 |
| Lambda | €2.00 |
| Other Services | €5.00 |
| **Total** | **€59/month** |

### Cost Optimization Strategies

**Reduce to ~€10/month:**
- ⏰ **Schedule infrastructure**: Monday-Friday, 8am-6pm only (70% savings)
- 🛑 **Terminate bastion** when not performing migrations: Save €8/month
- 🔄 **Use VPC endpoints** for AWS services instead of NAT Gateway: Save €32/month
- 📦 **Implement lifecycle policies** on ECR and CloudWatch logs
- 🌐 **Use shared NAT Gateway** across multiple projects

**Production Optimizations:**
- Use **RDS Proxy** for connection pooling: Reduce connection overhead
- Implement **Lambda provisioned concurrency**: Eliminate cold starts
- Add **CloudFront CDN**: Reduce API Gateway and Lambda costs
- Enable **S3 Intelligent Tiering**: Automatic cost optimization for logs

---

## 📊 Database Schema

The database implements a complete schema for personal finance tracking with proper indexing, constraints, and relationships.

### Core Tables (14 total)

**User Management:**
- `users` - User accounts linked to Cognito (auto-provisioned on first login)

**Asset Tracking:**
- `asset_categories` - 8 investment types (stocks, ETFs, crypto, real estate, etc.)
- `assets` - User's investment holdings with ticker symbols
- `asset_inputs` - Monthly snapshots of asset values (time-series data)
- `market_cap_history` - Historical market cap tracking for assets
- `category_allocation_targets` - Target allocation percentages by category

**Income & Expenses:**
- `income_categories` - 6 income types (salary, bonus, dividend, rental, etc.)
- `incoming_items` - Individual income entries with amounts and dates
- `expense_categories` - 8 expense types (rent, utility, food, transport, etc.)
- `expense_subcategories` - Custom subcategories for detailed expense tracking
- `expense_items` - Individual expense entries with category/subcategory links

**Budget & Analytics:**
- `budgets` - Monthly budget limits by category
- `networth_materialized` - Cached net worth calculations for performance
- `audit_events` - System audit log for sensitive operations

**Views:**
- `latest_networth` - Most recent net worth per user (optimized query)

**Key Features:**
- Composite indexes on `(user_id, year DESC, month DESC)` for time-series queries
- Cascade delete for user-owned data (GDPR compliance)
- Restrict delete on category tables (data integrity)
- Auto-updated `updated_at` timestamps via triggers
- SSL/TLS required for all connections

---

## 🔒 Security

Security is implemented throughout the entire stack using defense-in-depth principles, with multiple layers of protection.

- ✅ **Private Database** - RDS in private subnets with no public access
- ✅ **SSL/TLS Encryption** - Required for all database connections (`sslmode=require`)
- ✅ **Secrets Manager** - Database credentials never stored in code or environment
- ✅ **JWT Authentication** - Cognito-issued tokens with signature verification
- ✅ **IRSA-like Permissions** - Lambda execution role with least-privilege IAM policies
- ✅ **User Isolation** - All queries filtered by authenticated `userId`
- ✅ **Auto-provisioning** - Users created on first login from JWT claims
- ✅ **Security Groups** - Restricted ingress/egress rules (Lambda → RDS only)
- ✅ **VPC Integration** - Lambda in private subnets for database access
- ✅ **SSM Session Manager** - Secure bastion access without SSH keys or public IPs
- ✅ **Container Scanning** - ECR scans Docker images on push (Trivy integration possible)
- ✅ **CloudWatch Logs** - Complete audit trail of all API requests
- ✅ **MFA Support** - Cognito supports multi-factor authentication
- ✅ **OAuth Integration** - Google OAuth for federated authentication

---

## 🧪 Testing and Quality Assurance

Comprehensive testing ensures the reliability and correctness of the infrastructure, application, and deployment processes.

### Health Checks

```bash
# API health check (no authentication required)
curl https://YOUR_API_URL/health

# Expected response:
{
  "success": true,
  "message": "FinAlly API is running",
  "timestamp": "2025-12-05T10:00:00.000Z"
}
```

### API Testing

```bash
# Run comprehensive API test suite
cd scripts
./test_api.sh

# Tests performed:
# 1. Health check (no auth)
# 2. Unauthorized access (expects 401)
# 3. Cognito authentication (get JWT token)
# 4. GET /users/me (authenticated)
# 5. PATCH /users/me (update user)
```

### Database Testing

```bash
# Access database via SSM bastion
BASTION_ID=$(cd terraform/environments/dev && terraform output -raw bastion_instance_id)
aws ssm start-session --target "$BASTION_ID"

# On bastion, connect to database
export PGPASSWORD='<from-secrets-manager>'
export PGSSLMODE=require
psql -h <db-host> -U finally_admin -d finally

# Run validation queries
SELECT COUNT(*) FROM users;
SELECT * FROM asset_categories ORDER BY code;
SELECT * FROM latest_networth;
```

### Infrastructure Validation

```bash
# Validate Terraform configuration
cd terraform/environments/dev
terraform validate
terraform plan

# Check Lambda function status
aws lambda get-function --function-name finally-dev-api

# Check API Gateway routes
aws apigatewayv2 get-routes --api-id <api-id>

# Monitor CloudWatch logs
aws logs tail /aws/lambda/finally-dev-api --follow
```

---

## 📚 Comprehensive Documentation

This project includes extensive documentation covering every aspect of development, deployment, and operations.

### Setup and Deployment
- **[SETUP.md](SETUP.md)** - Complete setup guide from prerequisites to first deployment
- **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Production deployment procedures and rollback

### Development Guides
- **[frontend/DEVELOPMENT.md](frontend/DEVELOPMENT.md)** - Frontend development workflow and patterns
- **[lambda/DEVELOPMENT.md](lambda/DEVELOPMENT.md)** - Backend development guide and testing
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guidelines and PR process

### Architecture and API
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System architecture and design decisions
- **[docs/API.md](docs/API.md)** - Complete API reference (30+ endpoints with examples)

### Infrastructure and Database
- **[terraform/README.md](terraform/README.md)** - Infrastructure modules and Terraform guide
- **[database/README.md](database/README.md)** - Database schema and seed data
- **[database/MIGRATIONS.md](database/MIGRATIONS.md)** - Migration procedures and best practices

### Operations and Troubleshooting
- **[scripts/README.md](scripts/README.md)** - Operational scripts and utilities
- **[docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** - Common issues and solutions

---

## 🤝 Contributing

This is a portfolio project demonstrating modern cloud architecture and serverless development. Contributions, feedback, and suggestions are welcome!

### For Major Changes:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Make your changes with clear, descriptive commits
4. Push to your fork (`git push origin feature/improvement`)
5. Open a Pull Request with detailed description

### For Bug Reports:
Open an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details (Terraform/Node.js versions)
- Relevant logs or error messages

See **[CONTRIBUTING.md](CONTRIBUTING.md)** for detailed guidelines.

---

## 📝 License

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

This project is created for **portfolio and educational purposes**. The code and configuration are provided as-is for learning and reference. Feel free to use it as inspiration for your own projects.

---

## 👨‍💻 Author

**Emanuele Lisetti**

Cloud Engineer | AWS & Serverless Enthusiast | Full-Stack Developer

Building production-grade serverless applications with modern DevOps practices.

### Connect With Me

- 💼 **LinkedIn:** [linkedin.com/in/emanuelelisetti](https://linkedin.com/in/emanuelelisetti)
- 🐙 **GitHub:** [@numalise](https://github.com/numalise)
- 📧 **Email:** contact@numalistest.com

---

## 📞 Support and Feedback

If you find this project helpful or have questions about the implementation:

- ⭐ **Star this repository** to show support
- 🐛 **Open an issue** for bugs or questions
- 💬 **Start a discussion** for architecture questions
- 🔀 **Submit a pull request** for improvements

---

## 🗺️ Project Roadmap

### Completed ✅
- [x] Complete infrastructure automation with Terraform
- [x] Serverless Lambda API with containerized deployment
- [x] RDS PostgreSQL with secure private subnet deployment
- [x] AWS Cognito authentication with JWT verification
- [x] Next.js frontend with Chakra UI
- [x] Asset tracking (8 categories)
- [x] Income and expense management
- [x] Custom expense subcategories
- [x] Budget planning and tracking
- [x] Asset allocation targets
- [x] Net worth calculation
- [x] Comprehensive documentation (18 files, 15,000+ lines)

### In Progress 🔄
- [ ] CloudWatch dashboards and alarms
- [ ] Automated integration tests
- [ ] Frontend deployment to CloudFront

### Planned 📋
- [ ] Staging and production environments
- [ ] CI/CD pipeline with GitHub Actions
- [ ] Mobile-responsive optimizations
- [ ] Advanced analytics and reporting
- [ ] Data export functionality (CSV, PDF)
- [ ] Multi-currency support
- [ ] Recurring transactions
- [ ] Transaction categorization with ML

---

*Built with ❤️ for personal finance enthusiasts and cloud developers*
