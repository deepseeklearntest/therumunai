import { test } from "node:test";
import assert from "node:assert/strict";
import { buildZoneTagQuery, resolveZone } from "./zone.ts";

test("buildZoneTagQuery binds longitude before latitude (PostGIS X,Y order)", () => {
  const { values } = buildZoneTagQuery(13.0827, 80.2707); // lat, lng
  // ST_MakePoint takes (x=lng, y=lat) — getting this backwards is the classic
  // PostGIS bug that silently mis-tags every report.
  assert.deepEqual(values, [80.2707, 13.0827]);
});

test("buildZoneTagQuery uses ST_Contains against SRID 4326", () => {
  const { text } = buildZoneTagQuery(13.0827, 80.2707);
  assert.match(text, /ST_Contains/i);
  assert.match(text, /4326/);
});

test("resolveZone returns the matched city and zone from the first row", () => {
  const zone = resolveZone([{ city: "Chennai", zone_name: "Zone 5 - Anna Nagar" }]);
  assert.deepEqual(zone, { city: "Chennai", zone: "Zone 5 - Anna Nagar" });
});

test("resolveZone falls back to 'Other TN Region' for no match (HARD RULE 5)", () => {
  const zone = resolveZone([]);
  assert.deepEqual(zone, { city: "Other TN Region", zone: null });
});
