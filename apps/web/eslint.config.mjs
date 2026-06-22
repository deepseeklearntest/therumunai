import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  {
    ignores: [
      "out/**",
      ".next/**",
      "node_modules/**",
      "vitest.config.ts",
      "**/*.test.ts",
      "**/*.test.tsx",
    ],
  },
  ...nextCoreWebVitals,
];

export default eslintConfig;
