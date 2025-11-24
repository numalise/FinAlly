# Networking Module

## Overview
Provisions VPC infrastructure with multi-AZ private subnets for secure database and Lambda deployment.

## Features
- Multi-AZ deployment (2 availability zones)
- Private subnets for Aurora and Lambda
- Optional NAT Gateway for Lambda internet access
- Optional VPC endpoints for S3/DynamoDB (cost optimization)
- DB subnet group for Aurora cluster

## Architecture
```
VPC (10.0.0.0/16)
├── Public Subnets (if NAT enabled)
│   ├── 10.0.0.0/20 (eu-central-1a)
│   └── 10.0.1.0/20 (eu-central-1b)
├── Private Subnets
│   ├── 10.0.10.0/20 (eu-central-1a) - Aurora, Lambda
│   └── 10.0.11.0/20 (eu-central-1b) - Aurora, Lambda
└── NAT Gateway (optional, single AZ for cost)
```

## Usage
```hcl
module "networking" {
  source = "../../modules/networking"
  
  project_name         = "finally"
  environment          = "dev"
  aws_region           = "eu-central-1"
  enable_nat_gateway   = true  # false for prod to save costs
  enable_vpc_endpoints = false # true for high-traffic workloads
}
```

## Cost Considerations
- **NAT Gateway**: ~$32/month + data transfer costs
- **VPC Endpoints**: Free (S3/DynamoDB gateway endpoints)
- Recommendation: Enable NAT only in dev, disable in staging/prod if Lambda doesn't need internet