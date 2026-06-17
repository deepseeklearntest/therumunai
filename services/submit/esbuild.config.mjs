import esbuild from "esbuild";

esbuild
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
