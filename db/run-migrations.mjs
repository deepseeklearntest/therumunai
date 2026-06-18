// run-migrations.mjs
// Applies db/migrations/*.sql then db/seeds/*.sql in lexical order, recording
// applied files in a schema_migrations table so re-runs are idempotent.
//
// Connection comes from env (no secrets committed — HARD RULE 1):
//   DATABASE_URL, or DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASS
//
// Usage: node db/run-migrations.mjs

import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";

const here = dirname(fileURLToPath(import.meta.url));

function connectionConfig() {
  if (process.env.DATABASE_URL) return { connectionString: process.env.DATABASE_URL };
  return {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME || "therumunai",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASS || "postgres",
  };
}

// Ordered list of {name, path} for every .sql file under a directory.
export function sqlFilesIn(dir) {
  return readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .map((name) => ({ name, path: join(dir, name) }));
}

async function run() {
  const client = new pg.Client(connectionConfig());
  await client.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name text PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
      )`);

    const files = [
      ...sqlFilesIn(join(here, "migrations")),
      ...sqlFilesIn(join(here, "seeds")),
    ];

    for (const { name, path } of files) {
      const { rowCount } = await client.query(
        "SELECT 1 FROM schema_migrations WHERE name = $1",
        [name]
      );
      if (rowCount > 0) {
        console.log(`skip  ${name} (already applied)`);
        continue;
      }
      const sql = readFileSync(path, "utf-8");
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [name]);
        await client.query("COMMIT");
        console.log(`apply ${name}`);
      } catch (err) {
        await client.query("ROLLBACK");
        throw new Error(`Migration ${name} failed: ${err.message}`);
      }
    }
    console.log("migrations complete");
  } finally {
    await client.end();
  }
}

// Only run when invoked directly, so tests can import sqlFilesIn without connecting.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
