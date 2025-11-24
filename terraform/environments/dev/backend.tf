terraform {
  backend "s3" {
    bucket         = "finally-terraform-state"
    key            = "environments/dev/terraform.tfstate"
    region         = "eu-central-1"
    dynamodb_table = "finally-terraform-locks"
    encrypt        = true
  }
}
