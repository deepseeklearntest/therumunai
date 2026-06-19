import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";

// Integration tests: require a live PostGIS with migrations + seeds applied.
// Run `npm run migrate` (workspace db) first. Connection from env, defaults to
// the local throwaway container (port 55432).
const here = dirname(fileURLToPath(import.meta.url));
const ZONE_TAG_SQL = readFileSync(join(here, "..", "queries", "zone_tag.sql"), "utf-8");

const config = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT || 55432),
      database: process.env.DB_NAME || "therumunai",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASS || "devpass",
    };

let client: pg.Client;

before(async () => {
  client = new pg.Client(config);
  await client.connect();
});

after(async () => {
  await client?.end();
});

test("a Chennai point resolves to a Chennai zone", async () => {
  // Anna Nagar-ish coordinates, inside the Chennai placeholder grid.
  const { rows } = await client.query(ZONE_TAG_SQL, [80.21, 13.08]); // lng, lat
  assert.equal(rows.length, 1);
  assert.equal(rows[0].city, "Chennai");
  assert.ok(rows[0].zone_name_ta, "zone must carry a Tamil name (HARD RULE 4)");
});

test("a Coimbatore point resolves to a Coimbatore zone", async () => {
  const { rows } = await client.query(ZONE_TAG_SQL, [76.97, 11.0]); // lng, lat (interior, off tile seam)
  assert.equal(rows.length, 1);
  assert.equal(rows[0].city, "Coimbatore");
});

test("a Madurai point matches no zone (→ Other TN Region fallback)", async () => {
  const { rows } = await client.query(ZONE_TAG_SQL, [78.1198, 9.9252]); // Madurai lng, lat
  assert.equal(rows.length, 0);
});

test("reports.category CHECK rejects an unknown category", async () => {
  await assert.rejects(
    client.query(
      `INSERT INTO reports (category, photo_key, geom, city)
       VALUES ('not-a-category', 'photos/2026/06/x.jpg',
               ST_SetSRID(ST_MakePoint(80.21, 13.08), 4326), 'Chennai')`
    ),
    /violates check constraint/
  );
});

test("a report round-trips: insert then read back with its geometry", async () => {
  const insert = await client.query(
    `INSERT INTO reports (category, photo_key, geom, city, zone)
     VALUES ('garbage', 'photos/2026/06/abc.jpg',
             ST_SetSRID(ST_MakePoint(80.21, 13.08), 4326), 'Chennai', 'Zone 8 - Anna Nagar')
     RETURNING id`
  );
  const id = insert.rows[0].id;
  const { rows } = await client.query(
    `SELECT category, city, zone, ST_Y(geom) AS lat, ST_X(geom) AS lng
     FROM reports WHERE id = $1`,
    [id]
  );
  assert.equal(rows[0].category, "garbage");
  assert.equal(rows[0].city, "Chennai");
  assert.equal(Number(rows[0].lat).toFixed(2), "13.08");
  // cleanup so reruns stay clean
  await client.query("DELETE FROM reports WHERE id = $1", [id]);
});
