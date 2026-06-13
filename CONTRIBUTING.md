# Contributing to Therumunai

Thank you for helping build Therumunai (தெருமுனை). This is a civic platform that handles
citizen-contributed data, so we keep **strict, deliberate gates** around the codebase.
These rules exist to make sure well-meaning contributions never destabilize the platform.
Please read this fully before opening your first pull request.

## TL;DR

1. **Sign the [CLA](./docs/CLA.md)** — required on every PR (automated check).
2. **Fork → branch → PR.** Never push directly to `main` (it's protected anyway).
3. **Name branches** `feat/...`, `fix/...`, `docs/...`, `chore/...`.
4. **Write [Conventional Commits](https://www.conventionalcommits.org).**
5. **Green CI + 1 CODEOWNER approval** are required to merge. We **squash-merge** with a
   linear history.

## Before you start

- Read the [PRD](./docs/PRD.md), [`CLAUDE.md`](./CLAUDE.md), and [`GOVERNANCE.md`](./GOVERNANCE.md).
- Open or comment on an **issue** before large work, so a maintainer can confirm direction.
- By contributing you agree to the [Code of Conduct](./CODE_OF_CONDUCT.md) and the
  [CLA](./docs/CLA.md).

## Contributor License Agreement (required)

Every contributor **must sign the [CLA](./docs/CLA.md)** before their PR can merge. The
CLA grants the project steward the right to relicense the contribution (so the project can
be sustained or transferred) while keeping the public version AGPL-3.0. Signing is
handled automatically: a bot will comment on your first PR with a one-time signing link,
and the **CLA check** must be green to merge.

## Development workflow

### 1. Fork and branch

```bash
# Fork via GitHub UI, then:
git clone https://github.com/<you>/therumunai.git
cd therumunai
git remote add upstream https://github.com/deepseeklearntest/therumunai.git
git checkout -b feat/short-description
```

**Branch naming** (the prefix matters for our automation):

| Prefix | Use for |
|---|---|
| `feat/` | new features |
| `fix/` | bug fixes |
| `docs/` | documentation only |
| `chore/` | tooling, deps, config, CI |
| `refactor/` | non-behavioral code changes |
| `test/` | tests only |

### 2. Commit using Conventional Commits

Format: `type(optional-scope): description`

```text
feat(report-form): add Tamil labels to the category picker
fix(geo): fall back to "Other TN Region" for out-of-boundary points
docs(prd): clarify Aurora cost guardrail
chore(ci): add markdown link checker
```

Allowed types: `feat`, `fix`, `docs`, `chore`, `ci`, `refactor`, `test`, `perf`,
`build`, `style`, `revert`. **Commit messages are linted in CI** — non-conforming
messages fail the check.

### 3. Keep the project's invariants

These are enforced in review (see [`CLAUDE.md`](./CLAUDE.md) for the full list):

- **No secrets / PII / real infrastructure** in commits. Only the sanitized
  [`deploy/`](./deploy) example is allowed in this public repo; real prod IaC, Terraform
  state, and `.env` files live in a separate private repo.
- **Disclosure footer** present on every user-facing view.
- **Every user-facing string in English *and* Tamil (தமிழ்).**
- **Out-of-boundary coordinates** must fall back to "Other TN Region", never error.

### 4. Open a pull request

- Target `main`. Fill in the [PR template](./.github/pull_request_template.md) completely.
- Use a **Conventional-Commit-style PR title** (we squash-merge using the PR title — it's
  linted).
- Link the issue it closes (`Closes #123`).
- Keep PRs focused and reasonably small; large/architectural changes need maintainer
  sign-off first (see [`GOVERNANCE.md`](./GOVERNANCE.md)).

## Merge requirements (the gates)

A PR can only merge when **all** of these are true:

- ✅ All required CI checks pass (lint, commitlint, PR-title, CodeQL once code lands).
- ✅ The **CLA check** is green.
- ✅ At least **one CODEOWNER approval** (two recommended for `db/`, `deploy/`, `.github/`,
  `LICENSE`, and the PRD — see [`.github/CODEOWNERS`](./.github/CODEOWNERS)).
- ✅ No unresolved review threads.
- ✅ Branch is up to date with `main`; history stays **linear** (rebase, don't merge-commit).

Maintainers merge via **squash** to keep `main` clean. Direct pushes and force-pushes to
`main` are blocked — see [`docs/BRANCH_PROTECTION.md`](./docs/BRANCH_PROTECTION.md).

## Reporting bugs & requesting features

Use the issue templates under **New issue**. For **security vulnerabilities**, do **not**
open a public issue — follow [`SECURITY.md`](./SECURITY.md).

## Code review etiquette

- Be kind and specific; review the code, not the person.
- Explain the "why" behind requested changes.
- Prefer small, actionable suggestions. Approve when it's good enough, not perfect.

Thank you for keeping Therumunai useful, anonymous, and trustworthy. 🙏
