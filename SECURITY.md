# Security Policy

Therumunai handles citizen-contributed civic data and must stay trustworthy. We take
security and privacy seriously and appreciate responsible disclosure.

## Reporting a vulnerability

**Do not open a public issue for security vulnerabilities.**

Instead, report privately through one of:

- **GitHub Private Vulnerability Reporting** — use the **"Report a vulnerability"** button
  under the repository's **Security** tab (preferred).
- If that is unavailable, contact the maintainers privately via the channel listed on the
  organization profile.

Please include:

- A description of the issue and its impact.
- Steps to reproduce (proof-of-concept if possible).
- Affected component/version and any suggested remediation.

### Our commitment

- We will acknowledge your report within **3 business days**.
- We will provide an assessment and remediation plan within **10 business days**.
- We will credit reporters who wish to be acknowledged, once a fix ships.

Please give us a reasonable window to remediate before any public disclosure.

## Supported versions

The project is in its foundation phase. Until a release is tagged, the `main` branch is
the only supported line and receives all security fixes.

## What must NEVER appear in this public repository

This is both a security control and a hard contribution rule (see
[`CLAUDE.md`](./CLAUDE.md) and [`CONTRIBUTING.md`](./CONTRIBUTING.md)):

- **AWS credentials, access keys, or session tokens.**
- **`.env` files** or any secrets/configuration with real values.
- **Real production infrastructure-as-code or Terraform state** (`*.tfstate`,
  `*.tfvars` with real values). Only the **sanitized** [`deploy/`](./deploy) example —
  placeholders only — may be public. Real prod IaC lives in a **separate private repo**.
- **Personally identifiable information (PII)** of any kind. Reports are anonymous by
  design; we do not collect names, emails, phone numbers, device IDs, or client IPs.

The repository's `.gitignore` is configured to block these patterns, and CI runs secret
scanning. If you believe a secret was committed, **rotate it immediately** and report it
through the channels above so history can be scrubbed.

## Privacy note

Because the report dataset is public, treat every stored field as world-readable. Never
add fields that could deanonymize a reporter, and challenge any change that weakens the
anonymity guarantees in the [PRD](./docs/PRD.md).
