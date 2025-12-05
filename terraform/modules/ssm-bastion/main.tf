# =====================================================================
# SSM Bastion Instance for Secure Database Access
# =====================================================================

data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]
  
  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }
  
  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_security_group" "bastion" {
  name_prefix = "${var.project_name}-${var.environment}-bastion-"
  description = "Security group for SSM bastion instance"
  vpc_id      = var.vpc_id
  
  egress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [var.database_security_group_id]
    description     = "Allow connections to RDS PostgreSQL"
  }
  
  egress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow HTTPS for SSM and package updates"
  }
  
  egress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow HTTP for package repositories"
  }
  
  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-bastion-sg"
    }
  )
  
  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_security_group_rule" "database_from_bastion" {
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  security_group_id        = var.database_security_group_id
  source_security_group_id = aws_security_group.bastion.id
  description              = "Allow PostgreSQL from SSM bastion"
}

resource "aws_iam_role" "bastion" {
  name_prefix = "${var.project_name}-${var.environment}-bastion-"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })
  
  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-bastion-role"
    }
  )
}

resource "aws_iam_role_policy_attachment" "bastion_ssm" {
  role       = aws_iam_role.bastion.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "bastion" {
  name_prefix = "${var.project_name}-${var.environment}-bastion-"
  role        = aws_iam_role.bastion.name
  
  tags = var.common_tags
}

resource "aws_instance" "bastion" {
  ami           = data.aws_ami.amazon_linux_2023.id
  instance_type = var.instance_type
  
  subnet_id                   = var.private_subnet_ids[0]
  vpc_security_group_ids      = [aws_security_group.bastion.id]
  iam_instance_profile        = aws_iam_instance_profile.bastion.name
  associate_public_ip_address = false
  
  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 1
    instance_metadata_tags      = "enabled"
  }
  
  user_data = <<-USERDATA
    #!/bin/bash
    set -e
    
    # Log all output
    exec > >(tee /var/log/user-data.log)
    exec 2>&1
    
    echo "Starting bastion setup at $$(date)"
    
    # Update system
    dnf update -y
    
    # Install PostgreSQL 16 client (matches RDS version)
    dnf install -y postgresql16
    
    # Install diagnostic tools
    dnf install -y bind-utils
    dnf install -y nc
    dnf install -y telnet
    dnf install -y tcpdump
    
    # Verify SSM agent is running
    systemctl enable amazon-ssm-agent
    systemctl restart amazon-ssm-agent
    
    # Create test script
    cat > /usr/local/bin/test-db-connection.sh << 'TESTSCRIPT'
#!/bin/bash
DB_HOST=$$1
DB_PORT=$${2:-5432}

if [ -z "$$DB_HOST" ]; then
  echo "Usage: test-db-connection.sh <db-host> [port]"
  exit 1
fi

echo "Testing connection to $$DB_HOST:$$DB_PORT"

# Test 1: DNS resolution
echo -n "DNS Resolution: "
if host $$DB_HOST > /dev/null 2>&1; then
  echo "OK"
else
  echo "FAILED"
  exit 1
fi

# Test 2: TCP connectivity
echo -n "TCP Connectivity: "
if timeout 5 bash -c "cat < /dev/null > /dev/tcp/$$DB_HOST/$$DB_PORT" 2>/dev/null; then
  echo "OK"
else
  echo "FAILED"
  exit 1
fi

echo "All tests passed!"
TESTSCRIPT
    
    chmod +x /usr/local/bin/test-db-connection.sh
    
    echo "Bastion setup complete at $$(date)"
    echo "PostgreSQL client version: $$(psql --version)"
    echo "SSM agent status: $$(systemctl is-active amazon-ssm-agent)"
  USERDATA
  
  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-bastion"
      Type = "SSM-Bastion"
    }
  )
  
  lifecycle {
    ignore_changes = [ami]
  }
}

# IAM Policy per S3 (migrations)
resource "aws_iam_policy" "bastion_s3_migrations" {
  name_prefix = "${var.project_name}-${var.environment}-bastion-s3-"
  description = "Allow bastion to read migration files from S3"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:ListBucket"
        ]
        Resource = [
          "arn:aws:s3:::finally-terraform-state",
          "arn:aws:s3:::finally-terraform-state/migrations/*"
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "bastion_s3" {
  role       = aws_iam_role.bastion.name
  policy_arn = aws_iam_policy.bastion_s3_migrations.arn
}
