# Sanitized example — Therumunai infrastructure reference (STUB).
#
# This is a deliberately incomplete skeleton for the foundation phase. Concrete resource
# definitions (S3, API Gateway, Lambda, RDS/Aurora PostGIS, CloudFront) are filled in
# during Phase 1 of the roadmap (see ../docs/PRD.md). The PUBLIC version always stays
# sanitized: placeholders only, no real account IDs, ARNs, state, or secrets.

terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.50"
    }
  }

  # Replicators: configure your OWN remote state backend (e.g. an S3 bucket + DynamoDB
  # lock table that you control). NEVER commit *.tfstate to any repo. Example only:
  #
  # backend "s3" {
  #   bucket         = "REPLACE_ME-terraform-state"
  #   key            = "therumunai/terraform.tfstate"
  #   region         = "ap-south-1"
  #   dynamodb_table = "REPLACE_ME-terraform-locks"
  #   encrypt        = true
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
      Repo        = "public-sanitized-example"
    }
  }
}

locals {
  name_prefix = "${var.project_name}-${var.environment}"
}

# ---------------------------------------------------------------------------
# Placeholder resources — to be implemented in Phase 1.
# ---------------------------------------------------------------------------
#
# - aws_s3_bucket.photos            # citizen photo uploads (presigned-URL upload)
# - aws_apigatewayv2_api.reports    # anonymous JSON submission endpoint
# - aws_lambda_function.submit      # presign + ST_Contains() zone-tagging handler
# - aws_db_instance.postgis         # RDS PostgreSQL+PostGIS (MVP: db.t4g.micro)
# - aws_cloudfront_distribution.web # frontend delivery (or AWS Amplify)
#
# Each will be added with sanitized placeholder values only.
