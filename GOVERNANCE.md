# Governance

This document describes how decisions are made in Therumunai and who is responsible for
what. It is intentionally lightweight but explicit, so contributors know how the project
is run and how to escalate.

## Roles

### Steward (project lead)

The **Steward** is the individual or small core group that ultimately owns the direction
of Therumunai. The Steward:

- Sets product direction and approves the [PRD](./docs/PRD.md) and roadmap.
- Holds final say on architectural and licensing decisions.
- Is the default owner in [`.github/CODEOWNERS`](./.github/CODEOWNERS).
- Administers the private infrastructure repository, AWS accounts, and secrets.
- Is the recipient of rights under the [CLA](./docs/CLA.md) and the only party permitted
  to relicense the codebase.

### Maintainers

**Maintainers** are trusted contributors granted merge rights. They:

- Review and approve pull requests within their area.
- Triage issues and apply labels.
- Enforce the contribution gates in [`CONTRIBUTING.md`](./CONTRIBUTING.md).
- Are listed as code owners for specific paths in `CODEOWNERS`.

Maintainers are nominated by the Steward (or existing maintainers) based on a track record
of quality contributions and good judgment, and confirmed by the Steward.

### Contributors

Anyone who opens an issue or PR. Contributors must sign the [CLA](./docs/CLA.md) and
follow the [Code of Conduct](./CODE_OF_CONDUCT.md).

## Decision making

- **Day-to-day changes** (bug fixes, docs, small features): decided through normal PR
  review. One CODEOWNER approval + green CI merges it.
- **Significant changes** (architecture, new dependencies of note, data-model changes,
  anything touching privacy/anonymity, IaC, or licensing): require an **issue or design
  discussion first** and explicit **Steward approval** before implementation.
- **Disagreement:** seek consensus among maintainers; if unresolved, the **Steward
  decides**. Decisions and their rationale should be recorded in the issue/PR (or an ADR
  under `docs/` for big ones).

## What requires extra scrutiny

These areas carry two-reviewer expectations and Steward awareness (see `CODEOWNERS`):

- `db/` — schema and spatial data.
- `deploy/` — the sanitized infrastructure example (must never leak real values).
- `.github/` — CI, gates, and automation.
- `LICENSE`, `docs/CLA.md` — licensing.
- `docs/PRD.md` — product direction.

## Merge rights & branch protection

Only maintainers and the Steward can merge, and only through the gates described in
[`CONTRIBUTING.md`](./CONTRIBUTING.md) and [`docs/BRANCH_PROTECTION.md`](./docs/BRANCH_PROTECTION.md).
No one — including administrators — pushes directly to `main`.

## Changing this document

Governance changes are made via PR, require Steward approval, and should explain the
motivation. Material changes will be announced in the repository.
