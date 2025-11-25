# SSM Bastion Module

## Overview
Lightweight EC2 instance in private subnet for secure database access via AWS Systems Manager Session Manager.

## Features
- ✅ No SSH keys required
- ✅ No public IP address
- ✅ No inbound security group rules
- ✅ Automatic SSM agent configuration
- ✅ PostgreSQL client pre-installed
- ✅ Secure port forwarding to RDS

## Cost
- **Instance**: t3.micro ~€8/month (730 hours)
- **Data Transfer**: SSM is free
- **Total**: ~€8/month

## Usage

### Connect to Instance
```bash
aws ssm start-session --target <instance-id>
```

### Port Forward to Database
```bash
# Get database endpoint from Terraform
DB_HOST=$(cd terraform/environments/dev && terraform output -raw database_address)

# Start port forwarding
aws ssm start-session \
  --target <instance-id> \
  --document-name AWS-StartPortForwardingSessionToRemoteHost \
  --parameters "{\"host\":[\"$DB_HOST\"],\"portNumber\":[\"5432\"],\"localPortNumber\":[\"5432\"]}"

# In another terminal, connect to database
psql -h localhost -p 5432 -U finally_admin -d finally
```

### Verify SSM Agent
```bash
# Connect to instance
aws ssm start-session --target <instance-id>

# Check SSM agent status
sudo systemctl status amazon-ssm-agent
```

## Security
- Instance has no public IP
- No SSH key pairs
- Connects only via SSM (IAM-authenticated)
- Security group allows egress to database only
- IMDSv2 enforced

## Maintenance
- Amazon Linux 2023 (5 years support)
- Auto-updates via dnf
- SSM agent auto-updates
- No manual patching required
