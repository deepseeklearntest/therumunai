# Branch Protection — `main`

These settings cannot live in repository files — they must be configured in **GitHub →
Settings → Branches → Branch protection rules** (or via the API/`gh`) by a repository
admin. This document is the source of truth for what that configuration must be. Apply it
once now, and re-check it whenever CI checks are renamed or added.

> Goal: outside contributors (and well-meaning maintainers) cannot destabilize `main`.
> Everything lands through reviewed, gated pull requests with a linear history.

## Rule: protect `main`

Create a branch protection rule (or ruleset) targeting **`main`** with the following:

### Pull request requirements

- ☑️ **Require a pull request before merging.**
  - ☑️ **Require approvals:** minimum **1** (set **2** for higher-risk paths — see CODEOWNERS).
  - ☑️ **Dismiss stale pull request approvals when new commits are pushed.**
  - ☑️ **Require review from Code Owners.**
  - ☑️ **Require approval of the most recent reviewable push.**

### Status check requirements

- ☑️ **Require status checks to pass before merging.**
- ☑️ **Require branches to be up to date before merging.**
- Required checks (add each as it comes online):
  - `ci` (markdown lint / link check now; lint, typecheck, test, build as code lands)
  - `commitlint`
  - `pr-title`
  - `CodeQL` (once application code exists)
  - `CLA` (CLA Assistant signature check)

### History & integrity

- ☑️ **Require linear history.** (We squash-merge; no merge commits.)
- ☑️ **Require signed commits.**
- ☑️ **Require conversation resolution before merging.**
- ☑️ **Do not allow bypassing the above settings** — **include administrators.**
- ⛔ **Block force pushes.**
- ⛔ **Block deletions.**

### Merge strategy (Settings → General → Pull Requests)

- ☑️ Allow **squash merging** only (disable merge commits and rebase merging).
- ☑️ Default squash commit message = **PR title** (which is Conventional-Commit linted).
- ☑️ **Automatically delete head branches** after merge.

## One-time integrations to install

These provide the status checks referenced above:

| Integration | Purpose | Result |
|---|---|---|
| [CLA Assistant](https://github.com/cla-assistant/cla-assistant) | Enforce [`docs/CLA.md`](./CLA.md) signing | adds the `CLA` check |
| **CodeQL** (`.github/workflows/codeql.yml`) | Security scanning | adds the `CodeQL` check once code lands |
| **Dependabot** (`.github/dependabot.yml`) | Dependency updates | opens update PRs |
| **Secret scanning + push protection** (Settings → Code security) | Block committed secrets | rejects pushes containing secrets |

## Verifying the configuration

After applying, confirm:

- A direct `git push` to `main` is rejected — even for admins.
- A PR cannot merge with a failing check, an unsigned CLA, or zero CODEOWNER approvals.
- Force-push and branch deletion on `main` are blocked.
