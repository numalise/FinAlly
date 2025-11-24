# Security Groups Module

## Overview
Implements least-privilege security groups for Aurora and Lambda with minimal blast radius.

## Security Model
```
┌─────────────┐
│   Lambda    │
│   Functions │
└──────┬──────┘
       │ Egress: 5432 (PostgreSQL)
       │ Egress: 443 (HTTPS)
       ▼
┌─────────────┐
│   Aurora    │
│  PostgreSQL │
└─────────────┘
   Ingress: 5432 (from Lambda only)
```

## Rules
### Lambda Security Group
- **Egress**: Port 5432 to Aurora SG (PostgreSQL)
- **Egress**: Port 443 to 0.0.0.0/0 (Prisma Data Proxy, AWS APIs)
- **Egress**: Port 80 to 0.0.0.0/0 (optional, for external APIs)

### Aurora Security Group
- **Ingress**: Port 5432 from Lambda SG only
- **Egress**: None (stateful responses allowed automatically)

### Admin Security Group (optional, emergency use)
- **Ingress**: Port 5432 from specific CIDR blocks

## Usage
```hcl
module "security_groups" {
  source = "../../modules/security-groups"
  
  project_name              = "finally"
  environment               = "dev"
  vpc_id                    = module.networking.vpc_id
  allow_lambda_http_egress  = false
  enable_admin_access       = false  # true only for debugging
  admin_cidr_blocks         = []     # Your IP if admin enabled
}
```

## Security Best Practices
- Aurora accepts connections ONLY from Lambda security group
- No public internet access to Aurora
- Lambda cannot accept inbound connections (egress only)
- Admin access disabled by default
- Use AWS Systems Manager Session Manager for emergency Aurora access instead of bastion hosts