# Therumunai (தெருமுனை) — "Street Corner"

> An open-source, fully anonymous civic-issue reporting platform for Tamil Nadu.
> Launching in **Chennai** and **Coimbatore**. Inspired by the
> [nammakasa.in](https://nammakasa.in) initiative.

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](./LICENSE)
[![Status: Infrastructure](https://img.shields.io/badge/status-infrastructure--phase--1-blue.svg)](./docs/PRD.md)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://www.conventionalcommits.org)
[![PRs: CLA required](https://img.shields.io/badge/PRs-CLA%20required-red.svg)](./docs/CLA.md)

Therumunai lets any citizen report a local civic problem — a garbage blackspot, a
broken road, a dead streetlight, or waterlogging — in under a minute, with **no login,
no sign-up, and no personal data**. Each report is auto-tagged to the correct municipal
zone using geospatial boundaries, so the data is useful to the people who can act on it.

> ⚠️ **Project status: Phase 1 (Infrastructure) complete.** The directory layout,
> npm workspaces, and core AWS infrastructure definitions are in place. The Next.js
> frontend application is currently represented as a stub workspace under `apps/web`
> and will land in Phase 3. See [`docs/PRD.md`](./docs/PRD.md).

---

## Why this exists

Civic issues in Indian cities are reported through fragmented, friction-heavy channels
that demand logins, app installs, or phone numbers. Most people give up. Therumunai
removes every barrier: open the page, snap a photo, share location, pick a category,
submit. Anonymously. The result is a clean, mapped, public dataset of street-level
civic issues that citizens, journalists, and researchers can all see.

## What it does

1. **Report an Issue / குறையைப் பதிவிடு** — the single primary action.
2. Capture or upload a street-level photo.
3. Grab high-accuracy browser geolocation (latitude/longitude).
4. Pick a category — Garbage, Road Damage, Streetlight, or Drainage/Waterlogging.
5. Submit anonymously.

A public **Map Dashboard** then plots every report as a colored pin by category.

## Planned architecture

Documented in full in [`docs/PRD.md`](./docs/PRD.md). At a glance:

```text
                 ┌─────────────────────────┐
   Citizen ───►  │ Next.js (App Router)     │  Tailwind CSS · EN/தமிழ் toggle
   (mobile)      │ Amplify or S3+CloudFront │
                 └───────────┬─────────────┘
                             │  presigned-URL photo upload ──► Amazon S3
                             ▼
                 ┌─────────────────────────┐
                 │ API Gateway → AWS Lambda │  anonymous JSON, zone-tagging logic
                 └───────────┬─────────────┘
                             ▼
                 ┌─────────────────────────┐
                 │ Aurora Serverless v2     │  PostgreSQL + PostGIS
                 │ (MVP: t4g.micro RDS)     │  ST_Contains() → municipal zone
                 └─────────────────────────┘
```

### Repository layout

```text
apps/web/   Next.js frontend                 services/  Lambda handlers (app logic)
db/         PostGIS migrations + seeds        deploy/    sanitized example Terraform
docs/       PRD, governance, ADRs             .github/   workflows, templates, CODEOWNERS
```

> **Infrastructure boundary:** This public repo contains application code plus a
> **sanitized** [`deploy/`](./deploy) reference (example Terraform, placeholders only).
> Real production infrastructure, Terraform state, `.env` files, and AWS credentials
> live in a **separate private repository** and must never be committed here. See
> [`SECURITY.md`](./SECURITY.md).

## Getting started

This repository uses npm workspaces to manage its packages.

### Prerequisites

- Node.js >= 20.x (enforced via `.nvmrc`)
- npm >= 10.x

### Setup

```bash
# Install dependencies across all workspaces
npm install

# Run type checking for all packages
npm run typecheck

# Build the Lambda submit service
npm run build
```

See the [sanitized Terraform deployment guide](./deploy/README.md) for provisioning instructions.

## Contributing

We welcome contributors — and we protect the codebase with strict gates so good
intentions don't accidentally break things. Before you open a PR, read:

- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — setup, branch naming, Conventional Commits, PR flow
- [`docs/CLA.md`](./docs/CLA.md) — **every contributor must sign the CLA** (required check)
- [`GOVERNANCE.md`](./GOVERNANCE.md) — who decides what, how things get merged
- [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md) — be decent
- [`SECURITY.md`](./SECURITY.md) — report vulnerabilities privately

All changes land via pull request against `main`, require green CI plus a CODEOWNER
approval, and are squash-merged with a linear history. Direct pushes to `main` are
blocked. See [`docs/BRANCH_PROTECTION.md`](./docs/BRANCH_PROTECTION.md).

## License

Therumunai is licensed under the **GNU Affero General Public License v3.0** — see
[`LICENSE`](./LICENSE). The AGPL ensures that anyone who runs a modified version as a
network service must also share their source. Contributions are accepted under a
[Contributor License Agreement](./docs/CLA.md) that lets the project steward relicense
the codebase if needed (e.g., to sustain or transfer the project), while keeping the
public version open.

---

> **Therumunai is an independent citizen-led civic initiative. We are not affiliated
> with the Greater Chennai Corporation (GCC), Coimbatore City Municipal Corporation
> (CCMC), or the Government of Tamil Nadu.**
