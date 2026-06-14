/**
 * Conventional Commits configuration for Therumunai.
 * Enforced by .github/workflows/commitlint.yml.
 */
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "chore",
        "ci",
        "refactor",
        "test",
        "perf",
        "build",
        "style",
        "revert",
      ],
    ],
    "subject-case": [0],
    "body-max-line-length": [0],
  },
};
