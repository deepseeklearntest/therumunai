# CLAUDE.md

Operational guidance for Claude / AI agents (and humans) working in this repository.
Keep changes consistent with the rules below — they exist to protect a civic platform
that handles citizen-contributed data.

## What this project is

**Therumunai** (தெருமுனை, "Street Corner") is an open-source, fully anonymous civic-issue
reporting platform for Tamil Nadu, launching in Chennai and Coimbatore. Citizens report
garbage, road damage, streetlight faults, and waterlogging with no login and no personal
data; each report is auto-tagged to a municipal zone via PostGIS. See [`docs/PRD.md`](./docs/PRD.md)
for the full product spec and roadmap.

> **Status:** Foundation phase. This repo currently holds the PRD, governance, and
> contribution gates — not application code yet.

## Target stack (for when code lands)

- **Frontend:** Next.js (App Router), Tailwind CSS, EN/தமிழ் i18n, MapLibre GL dashboard.
  Hosted on AWS Amplify or S3 + CloudFront.
- **Backend:** AWS Lambda (Node/TypeScript) behind API Gateway. Anonymous JSON payloads.
- **Storage:** Amazon S3 with backend-generated presigned URLs for direct photo upload.
- **Database / GIS:** Aurora Serverless v2 PostgreSQL + PostGIS (MVP may start on a small
  `t4g.micro` RDS PostGIS instance for cost — see the PRD cost guardrail). Spatial zone
  tagging via `ST_Contains()`.

## Planned monorepo layout

```text
apps/web/   Next.js frontend                 services/  Lambda handlers (app logic only)
db/         PostGIS migrations + seeds        deploy/    SANITIZED example Terraform
docs/       PRD, governance, ADRs             .github/   workflows, templates, CODEOWNERS
```

## Hard rules — do not violate

1. **Never commit secrets or PII.** No AWS keys, no `.env`, no citizen personal data,
   no real coordinates tied to individuals. Reports are anonymous by design.
2. **Never commit real production infrastructure.** Only the **sanitized** `deploy/`
   example (placeholder Terraform, no real account IDs/state) may be public. Real prod
   IaC, Terraform state (`*.tfstate`), and secrets live in a **separate private repo**.
3. **The Disclosure Footer must appear on every user-facing view** (and in README/PRD),
   verbatim:
   > Therumunai is an independent citizen-led civic initiative. We are not affiliated
   > with the Greater Chennai Corporation (GCC), Coimbatore City Municipal Corporation
   > (CCMC), or the Government of Tamil Nadu.
4. **Every user-facing string must have both English and Tamil (தமிழ்).** Do not ship
   English-only UI copy.
5. **Out-of-boundary coordinates must fall back to "Other TN Region"** — never let a
   coordinate outside the Chennai/Coimbatore polygons break the submission path.

## Working conventions

- **Branches:** `feat/*`, `fix/*`, `docs/*`, `chore/*`. No direct pushes to `main`.
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org) (`feat:`,
  `fix:`, `docs:`, `chore:`, `ci:`, `refactor:`, `test:`). Enforced by CI.
- **PRs:** require green CI + at least one CODEOWNER approval; squash-merge; linear
  history; CLA must be signed. See [`CONTRIBUTING.md`](./CONTRIBUTING.md).
- **Licensing:** AGPL-3.0 + CLA. See [`docs/CLA.md`](./docs/CLA.md).

## Before opening a PR

> Tooling lands with the application code. Until then these are placeholders — run
> whatever exists and keep this list current as the stack fills in.

```bash
# (placeholder — no package.json yet)
# npm run lint
# npm run typecheck
# npm test
# npm run build
```

Always check that markdown lint passes and that any workflow YAML you touch is valid.

## Where governance lives

- [`CONTRIBUTING.md`](./CONTRIBUTING.md) · [`GOVERNANCE.md`](./GOVERNANCE.md) ·
  [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md) · [`SECURITY.md`](./SECURITY.md)
- [`docs/BRANCH_PROTECTION.md`](./docs/BRANCH_PROTECTION.md) — the `main` protection rules
- [`.github/CODEOWNERS`](./.github/CODEOWNERS) — who must review what
