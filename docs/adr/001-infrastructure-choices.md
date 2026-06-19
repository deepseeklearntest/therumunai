# ADR 001: Core Infrastructure Choices for Phase 1

## Status

Accepted

## Context

Therumunai is an open-source civic reporting platform launching in Chennai and Coimbatore. Since it is a community-funded, greenfield civic initiative, the infrastructure must align with strict **privacy, anonymity, and cost constraints** outlined in the [PRD](../PRD.md).

Specifically:

1. Maximize the number of useful, anonymous reports with zero friction.
2. Maintain absolute citizen anonymity (no PII, no IP logging).
3. Start small and cheap (MVP cost guardrails), scaling dynamically only when traffic demands it.

## Decisions

### 1. HTTP API (v2) over REST API (v1)

* **Decision**: Use AWS API Gateway HTTP APIs for exposing backend Lambdas.
* **Rationale**: HTTP APIs are significantly cheaper (approx. $1.00 per million requests vs. $3.50 for REST APIs) and offer lower latency. They support CORS, OIDC/OAuth2 integrations, and AWS WAFv2 association, which are sufficient for our endpoints.

### 2. RDS PostgreSQL + PostGIS (`db.t4g.micro`) over Aurora Serverless v2

* **Decision**: Deploy a single, bursted `db.t4g.micro` RDS PostgreSQL instance instead of Aurora Serverless v2 for the MVP launch.
* **Rationale**: Aurora Serverless v2 has a minimum capacity floor of 0.5 ACU (approx. $40–$50/month standing baseline cost). An RDS `db.t4g.micro` instance (approx. $15/month baseline cost) conforms to our cost guardrail. We will graduate to Aurora Serverless v2 when sustained traffic justifies it.

### 3. S3 Direct Upload via Presigned PUT URLs

* **Decision**: Generate presigned URLs in the Lambda handler, allowing frontend clients to upload files directly to S3.
* **Rationale**: Bypassing the API Gateway and Lambda for image data transfer eliminates API payload limitations (API Gateway has a 10MB limit; Lambda has payload constraints) and reduces execution times/costs. S3 handles scalability and concurrent uploads natively.

### 4. Single Bundled JS File (CommonJS) via esbuild

* **Decision**: Compile typescript source code to CommonJS target format and package as a single self-contained file `dist/index.js` using esbuild for Lambda deployment.
* **Rationale**: CommonJS is supported out-of-the-box by AWS Lambda without requiring type: module package configurations or custom runtime scripts inside the deployment package. Tree-shaking and minification by esbuild reduce code package size, leading to faster cold start times.

### 5. Private/Public Repository Infrastructure Boundaries

* **Decision**: Place sanitized Terraform configuration templates in the public repository and keep production state files, secrets, and real parameter variables in a separate private repository.
* **Rationale**: Secures the platform against secrets leaks while remaining replicable by other municipalities or developer groups interested in launching similar civic platforms.

## Consequences

* **Cost**: The baseline cost is reduced to around $15–$20/month (RDS instance, S3 storage, API/CloudFront usage) in inactive periods.
* **Security**: No AWS credentials or credentials are exposed in the public codebase.
* **Deployability**: Replicators can run `terraform init && terraform apply` out-of-the-box after modifying variable files.
