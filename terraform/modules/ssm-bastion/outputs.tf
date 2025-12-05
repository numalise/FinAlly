output "instance_id" {
  description = "EC2 instance ID for SSM connections"
  value       = aws_instance.bastion.id
}

output "instance_private_ip" {
  description = "Private IP address of bastion instance"
  value       = aws_instance.bastion.private_ip
}

output "security_group_id" {
  description = "Bastion security group ID"
  value       = aws_security_group.bastion.id
}

output "ssm_connect_command" {
  description = "Command to connect via SSM"
  value       = "aws ssm start-session --target ${aws_instance.bastion.id}"
}

output "ssm_port_forward_command" {
  description = "Command to forward PostgreSQL port"
  value       = "aws ssm start-session --target ${aws_instance.bastion.id} --document-name AWS-StartPortForwardingSessionToRemoteHost --parameters '{\"host\":[\"DB_HOST\"],\"portNumber\":[\"5432\"],\"localPortNumber\":[\"5432\"]}'"
}
