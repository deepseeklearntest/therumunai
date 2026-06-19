import { test, before } from "node:test";
import assert from "node:assert/strict";

// Integration test: requires a live PostGIS (migrated) reachable via env.
// Defaults target the local throwaway container on port 55432.
process.env.DB_HOST ||= "localhost";
process.env.DB_PORT ||= "55432";
process.env.DB_NAME ||= "therumunai";
process.env.DB_USER ||= "postgres";
process.env.DB_PASS ||= "devpass";

let handler: typeof import("./index.js").handler;

before(async () => {
  ({ handler } = await import("./index.js"));
});

function postReport(body: object) {
  return {
    requestContext: { http: { method: "POST", path: "/reports" } },
    body: JSON.stringify(body),
    isBase64Encoded: false,
  } as any;
}

test("POST /reports persists a Chennai report and tags the zone", async () => {
  const res: any = await handler(
    postReport({
      category: "garbage",
      latitude: 13.08,
      longitude: 80.21,
      photoKey: "photos/2026/06/123e4567-e89b-12d3-a456-426614174000.jpg",
    })
  );
  assert.equal(res.statusCode, 201);
  const data = JSON.parse(res.body);
  assert.equal(data.city, "Chennai");
  assert.match(data.id, /^[0-9a-f-]{36}$/); // real DB uuid, not the old mock id
});

test("POST /reports outside both cities falls back to Other TN Region (HARD RULE 5)", async () => {
  const res: any = await handler(
    postReport({
      category: "road",
      latitude: 9.9252, // Madurai
      longitude: 78.1198,
      photoKey: "photos/2026/06/223e4567-e89b-12d3-a456-426614174000.jpg",
    })
  );
  assert.equal(res.statusCode, 201);
  const data = JSON.parse(res.body);
  assert.equal(data.city, "Other TN Region");
});

test("GET /reports reads persisted rows from the database", async () => {
  const res: any = await handler({
    requestContext: { http: { method: "GET", path: "/reports" } },
  } as any);
  assert.equal(res.statusCode, 200);
  const rows = JSON.parse(res.body);
  assert.ok(Array.isArray(rows));
  assert.ok(rows.length >= 1, "should include reports inserted by earlier tests");
  assert.ok("id" in rows[0] && "city" in rows[0]);
});
