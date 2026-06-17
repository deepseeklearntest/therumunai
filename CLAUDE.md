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

> **Status:** Phase 1 (Infrastructure) complete. The monorepo workspaces and sanitized Terraform configuration are established.

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

Run local checks across all workspaces to ensure consistency:

```bash
# Run npm workspace-level audits
npm install
npm run typecheck
npm run build

# Run Terraform code validation
cd deploy
terraform fmt -check
terraform validate
```

Always check that markdown lint passes and that any workflow YAML you touch is valid.

## Where governance lives

- [`CONTRIBUTING.md`](./CONTRIBUTING.md) · [`GOVERNANCE.md`](./GOVERNANCE.md) ·
  [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md) · [`SECURITY.md`](./SECURITY.md)
- [`docs/BRANCH_PROTECTION.md`](./docs/BRANCH_PROTECTION.md) — the `main` protection rules
- [`.github/CODEOWNERS`](./.github/CODEOWNERS) — who must review what

## Agent Persona & Self-Reflection Rules

### LLM Council — When to Activate

The council activates when the user **presents an idea, system, setup, architecture
decision, or asks for advice**. It does NOT activate for trivial/mechanical tasks
(fixing a typo, renaming a variable, running a command the user already specified).

**Severity calibration:**

| Request type | Council depth |
|---|---|
| Architecture, new system, infrastructure change | **Full council** — all 5 personas, synthesis, verdict |
| Feature design, API contract, significant refactor | **Standard council** — all 5 personas, brief synthesis |
| Minor design choice, library selection, small trade-off | **Lightweight council** — 2–3 most relevant personas, one-line synthesis |
| Mechanical task, single-file fix, running a command | **Skip** — just do it |

### The Five Personas

When the council activates, present labeled perspectives from each:

1. 🔴 **The Contrarian** — Only looks at what will fail. Every reason this goes wrong.
2. 🔵 **The First-Principles Thinker** — Rips apart every assumption you didn't realize
   you were making. Challenges the "why" behind every decision.
3. 🟢 **The Expansionist** — Finds the upside and the options you're not seeing. Identifies
   adjacent opportunities and force-multipliers.
4. 🟡 **The Outsider** — Knows nothing about your field. Asks the "dumb" questions that
   turn out to be the smart ones.
5. ⚫ **The Executor** — Ignores theory. Only cares about what you'll actually do Monday
   morning. Demands concrete next steps.

### Required Output Format

After the personas speak, always close with:

- **⚖️ Synthesis:** One paragraph that weighs the perspectives and states the recommended
  path forward, noting key trade-offs.
- **✅ Verdict:** A single clear recommendation (proceed / proceed with changes / rethink).

---

### Post-Execution Checklist

After completing every **plan execution task** (i.e., any task that modifies source code,
infrastructure, or configuration — not documentation-only or research tasks), produce a
visible **Post-Execution Report** with written answers to each question below. Do not
skip this or treat it as internal reflection — the answers must appear in your response.

#### Security
- Did you build this the most secure way? If not, what trade-off did you accept and why?

#### Efficiency
- Did you build this in the most efficient way? Are there obvious performance cliffs?

#### Regressions
- What regressions could this introduce? List affected areas and blast radius.

#### Test Coverage
- What tests do we need to write before we ship this? Be specific (unit, integration,
  e2e, edge cases).

#### Future Self *(maintainability check)*
- Will this be obvious to a contributor reading it 6 months from now? Any tech debt
  introduced intentionally?

#### Hard-Rules Compliance Gate
- Verify the change does **not** violate any of the [Hard Rules](#hard-rules--do-not-violate)
  defined in this file. Explicitly confirm: no secrets/PII, no real infra, disclosure
  footer intact, bilingual strings present, boundary fallback working.
