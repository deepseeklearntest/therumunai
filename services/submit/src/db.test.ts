import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import pg from "pg";

// Integration test: requires a live PostGIS (migrated) reachable via env.
// Defaults target the local throwaway container on port 55432 (see handler.test.ts).
process.env.DB_HOST ||= "localhost";
process.env.DB_PORT ||= "55432";
process.env.DB_NAME ||= "therumunai";
process.env.DB_USER ||= "postgres";
process.env.DB_PASS ||= "devpass";

let insertReport: typeof import("./db.js").insertReport;
let listReports: typeof import("./db.js").listReports;
const insertedIds: string[] = [];

before(async () => {
  ({ insertReport, listReports } = await import("./db.js"));
});

after(async () => {
  if (insertedIds.length === 0) return;
  const c = new pg.Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
  });
  await c.connect();
  await c.query("DELETE FROM reports WHERE id = ANY($1)", [insertedIds]);
  await c.end();
});

// Public map precision: HARD RULE 1 (no real coordinates tied to individuals).
// listReports() rounds to ~4 decimals (~10m) so the public dashboard never
// emits the full-precision GPS fix a reporter stood at.
test("listReports rounds latitude/longitude to 4 decimal places", async () => {
  const stored = await insertReport({
    category: "garbage",
    photoKey: "photos/2026/06/precision-test.jpg",
    latitude: 13.0827361234,
    longitude: 80.2707193456,
    city: "Chennai",
    zone: "Zone 1",
  });
  insertedIds.push(stored.id);

  const rows = await listReports();
  const row = rows.find((r) => r.id === stored.id);
  assert.ok(row, "inserted report should be returned by listReports");

  assert.equal(row!.latitude, 13.0827);
  assert.equal(row!.longitude, 80.2707);
});
