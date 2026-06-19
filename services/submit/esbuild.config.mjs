import esbuild from "esbuild";
import { writeFileSync, mkdirSync } from "node:fs";

await esbuild
  .build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    platform: "node",
    target: "node20",
    format: "cjs",
    outfile: "dist/index.js",
    sourcemap: true,
    minify: true,
    external: ["@aws-sdk/*"], // SDK v3 is built into the Lambda runtime
  })
  .catch(() => process.exit(1));

// This workspace is "type": "module", which would make Node/Lambda treat the
// CommonJS bundle (dist/index.js) as ESM and silently export nothing. Marking
// the dist/ folder as commonjs keeps the ADR-001 CJS Lambda decision working.
mkdirSync("dist", { recursive: true });
writeFileSync("dist/package.json", JSON.stringify({ type: "commonjs" }) + "\n");
