# FinAlly

**Cloud-native personal finance and investment tracking platform**

## Overview
FinAlly is a production-grade, serverless wealth management application built on AWS, featuring monthly financial snapshots, dynamic net worth calculations, asset allocation management, and intelligent budget tracking.

## Tech Stack
- **Infrastructure**: Terraform, AWS (Lambda, API Gateway, Aurora Serverless v2, Cognito, SES, EventBridge)
- **Backend**: Node.js, Prisma Accelerate
- **Frontend**: Next.js, TypeScript, Chakra UI
- **CI/CD**: GitHub Actions
- **Region**: eu-central-1 (Frankfurt)

## Architecture
- Serverless API with JWT authentication (Cognito)
- PostgreSQL data layer (Aurora Serverless v2)
- Multi-user support with role-based access
- Automated monthly reminders and anomaly detection

## Project Status
🚧 **In Development** — Phase 0 Complete

## Documentation
See `/docs` for detailed architecture, API specs, and deployment guides.

---
**Author**: Emanuele  
**License**: MIT
