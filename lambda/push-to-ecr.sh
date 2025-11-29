#!/bin/bash
set -e

# Configuration
AWS_REGION="eu-central-1"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
PROJECT_NAME="finally"
ENVIRONMENT="dev"
IMAGE_TAG="latest"

# ECR Repository
ECR_REPO="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${PROJECT_NAME}-${ENVIRONMENT}-repo"

echo "🔐 Logging in to ECR..."
aws ecr get-login-password --region ${AWS_REGION} | \
  docker login --username AWS --password-stdin ${ECR_REPO}

echo "🏗️  Building Docker image..."
docker build -t ${PROJECT_NAME}-api:${IMAGE_TAG} .

echo "🏷️  Tagging image for ECR..."
docker tag ${PROJECT_NAME}-api:${IMAGE_TAG} ${ECR_REPO}:${IMAGE_TAG}

echo "⬆️  Pushing to ECR..."
docker push ${ECR_REPO}:${IMAGE_TAG}

echo "✅ Image pushed successfully!"
echo "📝 Image URI: ${ECR_REPO}:${IMAGE_TAG}"