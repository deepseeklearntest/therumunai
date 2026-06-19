# `deploy/` — Sanitized Deployment Reference

This directory is a **sanitized, public example** of how Therumunai's AWS infrastructure
is shaped. It exists so that other cities and contributors can understand and replicate
the platform.

> ⚠️ **This is a reference, not the real infrastructure.**
>
> - It contains **placeholder values only** — no real AWS account IDs, ARNs, domains, or
>   secrets.
> - There is **no Terraform state** here and there never should be.
> - The **real production infrastructure** (actual variables, remote state backend,
>   secrets) lives in a **separate private repository**, by design. See
>   [`../SECURITY.md`](../SECURITY.md) and [`../CLAUDE.md`](../CLAUDE.md).

## What it models

The target architecture from the [PRD](../docs/PRD.md):

- **S3 Bucket (`aws_s3_bucket.photos`)**: Stores citizen-uploaded photos securely, utilizing CORS configuration to allow direct uploads from allowed frontend domains. Block public access is fully enabled to prevent direct S3 leaks; objects are instead delivered via CloudFront.
- **CloudFront CDN (`aws_cloudfront_distribution.cdn`)**: Serving cached photos directly from the S3 bucket using Origin Access Control (OAC), ensuring S3 remains private.
- **API Gateway (`aws_apigatewayv2_api.reports`)**: Serverless HTTP API exposing routes `/presign`, `POST /reports`, and `GET /reports` mapped to our Lambda function.
- **AWS Lambda (`aws_lambda_function.submit`)**: Runs inside the default VPC subnets, connects securely to RDS, holds environment configuration, and signs S3 upload requests.
- **PostgreSQL + PostGIS (`aws_db_instance.postgis`)**: Managed RDS database instance using a burstable arm64 `db.t4g.micro` class to respect the cost guardrail. Contains dynamic rules for dev vs. prod access controls.
- **WAFv2 (`aws_wafv2_web_acl.api`)**: Standard rate-limiting rule configuration (e.g., 100 requests per 5 minutes per client IP) directly associated with API Gateway.
- **Budget Alarm (`aws_budgets_budget.monthly`)**: Configurable spending budget in USD with active email notification triggers at 80% and 100% actual budget usage.

## Setup & Deployment

1. Copy `terraform.tfvars.example` to `terraform.tfvars` and fill in **your own** values.
   (`*.tfvars` is git-ignored so your real values never get committed.)
2. Configure a **remote state backend you control** (e.g. your own S3 bucket + DynamoDB
   lock table). Never commit `*.tfstate`.
3. Provide AWS credentials through your environment or a secrets manager — **never** in
   a file in any repo.
4. Review, `terraform plan`, then apply in your own AWS account.

## Hard Rules

- ❌ No real account IDs, ARNs, domain names, KMS keys, or endpoints.
- ❌ No `*.tfstate`, `*.tfvars` (only `*.tfvars.example`), `.env`, or credentials.
- ✅ Placeholders like `123456789012`, `example.com`, `ap-south-1`, `REPLACE_ME`.

If you need to reference real values while developing, do it in the private infra repo —
not here.
