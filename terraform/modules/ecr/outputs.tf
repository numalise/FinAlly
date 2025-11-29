output "repository_url" {
  value       = aws_ecr_repository.this.repository_url
  description = "ECR repo URL"
}

output "repository_arn" {
  value       = aws_ecr_repository.this.arn
  description = "ECR repo ARN"
}