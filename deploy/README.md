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

- **S3 bucket** for citizen-uploaded photos (public-read images; direct upload via
  backend-issued presigned URLs).
- **API Gateway + AWS Lambda** for anonymous JSON submission and zone-tagging logic.
- **PostgreSQL + PostGIS** database — start on a small `t4g.micro` RDS instance for the
  MVP (cost guardrail), graduate to Aurora Serverless v2 later.
- **Frontend hosting** via Amplify or S3 + CloudFront.

> The concrete resource definitions are intentionally **stubs** during the foundation
> phase (see the `.tf` files here). They are filled in during Phase 1 of the roadmap,
> and the **public** version always stays sanitized.

## How a replicator uses this

1. Copy `terraform.tfvars.example` to `terraform.tfvars` and fill in **your own** values.
   (`*.tfvars` is git-ignored so your real values never get committed.)
2. Configure a **remote state backend you control** (e.g. your own S3 bucket + DynamoDB
   lock table). Never commit `*.tfstate`.
3. Provide AWS credentials through your environment or a secrets manager — **never** in
   a file in any repo.
4. Review, `terraform plan`, then apply in your own AWS account.

## Hard rules for this directory

- ❌ No real account IDs, ARNs, domain names, KMS keys, or endpoints.
- ❌ No `*.tfstate`, `*.tfvars` (only `*.tfvars.example`), `.env`, or credentials.
- ✅ Placeholders like `123456789012`, `example.com`, `ap-south-1`, `REPLACE_ME`.

If you need to reference real values while developing, do it in the private infra repo —
not here.
