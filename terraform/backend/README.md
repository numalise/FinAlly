# Terraform Backend Infrastructure

## Overview
This module provisions the foundational infrastructure for Terraform state management:
- **S3 Bucket**: Encrypted, versioned storage for `.tfstate` files
- **DynamoDB Table**: State locking to prevent concurrent modifications

## Prerequisites
- AWS CLI configured with `finally_user` profile
- Terraform >= 1.5.0

## Initial Setup
```bash
cd terraform/backend
terraform init
terraform plan
terraform apply
```

## Backend Configuration
After applying, backend configurations are automatically generated for each environment:
- `environments/dev/backend.tf`
- `environments/staging/backend.tf`
- `environments/prod/backend.tf`

## State File Locations
- Dev: `s3://finally-terraform-state/environments/dev/terraform.tfstate`
- Staging: `s3://finally-terraform-state/environments/staging/terraform.tfstate`
- Prod: `s3://finally-terraform-state/environments/prod/terraform.tfstate`

## Security Features
- Server-side encryption (AES256)
- Versioning enabled (90-day retention for old versions)
- Public access blocked
- State locking via DynamoDB

## Disaster Recovery
To restore from a previous state version:
```bash
aws s3api list-object-versions \
  --bucket finally-terraform-state \
  --prefix environments/dev/terraform.tfstate

aws s3api get-object \
  --bucket finally-terraform-state \
  --key environments/dev/terraform.tfstate \
  --version-id <VERSION_ID> \
  terraform.tfstate.restored
```

## Cleanup
⚠️ **Warning**: Deleting backend resources will make existing state files inaccessible.
```bash
terraform destroy
```
