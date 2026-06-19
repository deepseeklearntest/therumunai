# Phase 2 — Database (PostGIS) · Implementation Plan

| | |
|---|---|
| **Phase** | 2 — Database |
| **PRD ref** | §7 Geospatial logic, §10 roadmap row "Phase 2" |
| **ADR ref** | [001](../adr/001-infrastructure-choices.md) (RDS PostgreSQL 16.1 + PostGIS, `db.t4g.micro`) |
| **Status** | Built & verified against PostGIS 16-3.4 (12/12 tests green). **BLOCKER-1 open:** placeholder polygons + unreviewed Tamil names before production. |
| **Goal** | Replace the bounding-box / mock-write stubs in `services/submit` with a real PostGIS schema, zone seed data, and `ST_Contains()` zone tagging. |

---

## 1. Integration contract (locked by existing Phase 1 code)

The Lambda handler already exists and dictates the schema. **Do not drift from these.**

| Source | Contract |
|---|---|
| `services/submit/src/validate.ts:13` | Category enum: `garbage`, `road`, `streetlight`, `drainage` |
| `services/submit/src/index.ts:91-92` | Report carries `category, latitude, longitude, photoKey, city, zone, timestamp, id, status` |
| `services/submit/src/index.ts:9` | `determineZone()` is a **stub** → replace with PostGIS `ST_Contains()` |
| `services/submit/src/index.ts:94-96` | POST /reports stubs the DB write → real `INSERT` |
| `services/submit/src/index.ts:126` | GET /reports returns static array → real `SELECT` |
| `deploy/main.tf:327-331` | Lambda env already injects `DB_HOST/PORT/NAME/USER/PASS` |
| PRD §2 fallback (HARD RULE 5) | Point outside all polygons → `city = "Other TN Region"`, must never throw |

## 2. Schema design

### `municipal_zones`
```
id           serial PRIMARY KEY
city         text NOT NULL              -- 'Chennai' | 'Coimbatore'
zone_name    text NOT NULL             -- EN, e.g. 'Zone 5 - Anna Nagar'
zone_name_ta text NOT NULL             -- தமிழ் (HARD RULE 4: bilingual)
geom         geometry(MultiPolygon, 4326) NOT NULL
UNIQUE (city, zone_name)
GIST index on geom
```
- 20 rows: GCC Zones 1–15 + CCMC East/West/North/South/Central.

### `reports`
```
id         uuid PRIMARY KEY DEFAULT gen_random_uuid()
category   text NOT NULL CHECK (category IN ('garbage','road','streetlight','drainage'))
photo_key  text NOT NULL
geom       geometry(Point, 4326) NOT NULL
city       text NOT NULL              -- denormalized snapshot (incl. 'Other TN Region')
zone       text                       -- denormalized snapshot, NULL for fallback
status     text NOT NULL DEFAULT 'submitted'
created_at timestamptz NOT NULL DEFAULT now()
GIST index on geom
btree index on (created_at), (city, category)  -- dashboard filters
```
- **No PII, no IP, no FK to zones** (HARD RULE 1). City/zone are denormalized text snapshots so historical reports survive future boundary edits, and the public dataset reads with no join.

### Zone-tagging query (the "sample `ST_Contains`" PRD deliverable)
```sql
SELECT city, zone_name
FROM municipal_zones
WHERE ST_Contains(geom, ST_SetSRID(ST_MakePoint($1 /*lng*/, $2 /*lat*/), 4326))
LIMIT 1;
-- 0 rows  →  city='Other TN Region', zone=NULL   (fallback, never errors)
```

## 3. Task breakdown

| # | Task | Files | Acceptance |
|---|---|---|---|
| 1 | Migration runner + `0001_init_postgis.sql` (`CREATE EXTENSION postgis;`) | `db/migrations/`, `db/README.md` | Extension + `gen_random_uuid` available on fresh DB |
| 2 | `0002_municipal_zones.sql` + `0003_reports.sql` (DDL above) | `db/migrations/` | Tables + GIST/btree indexes created; CHECK enforces category enum |
| 3 | Zone seed data (GeoJSON polygons, bilingual names) | `db/seeds/zones.sql` or loader | 20 rows; every row has EN + தமிழ் name; geoms valid (`ST_IsValid`) |
| 4 | Documented sample `ST_Contains` query + fallback | `db/queries/zone_tag.sql` | Returns correct zone for in-city point; 0 rows for Madurai point |
| 5 | Wire Lambda: add `pg` client, replace `determineZone` with query, real INSERT/SELECT | `services/submit/src/{db.ts,index.ts}` | POST persists a row; GET reads rows; fallback path returns "Other TN Region" without throwing |
| 6 | Tests (see §5) | `services/submit/src/*.test.ts`, `db/` test harness | All green in CI |

## 4. Key decisions & open items

- **Migrations — DECIDED:** bare numbered SQL files (`db/migrations/NNNN_*.sql`) run via a thin Node runner (`db/run-migrations.mjs`, uses `pg`), not an ORM. Matches "PostGIS migrations + seeds" and keeps the civic schema legible. Runner records applied migrations in a `schema_migrations` table for idempotency.
- **Boundary GeoJSON — DECIDED (with tracked blocker):** seed with **clearly-flagged simplified placeholder polygons** (axis-aligned boxes approximating each zone) so the path works end-to-end without claiming false precision. Each seeded row carries `is_placeholder = true`. **BLOCKER-1:** replace with authoritative GCC/CCMC ward GeoJSON (OpenCity / data.gov.in) before production launch — see DoD.
- **Connection mgmt:** Lambda + RDS → use a module-scoped pooled client (warm reuse) or RDS Proxy later; a `t4g.micro` has limited `max_connections`. Start with a single reused client, `connectionTimeoutMillis` set, and graceful fallback on DB error.
- **Tamil zone names** must be verified by a Tamil reader, not machine-translated blindly.

## 5. Test plan (before ship)

- **Unit:** `determineZone` SQL builder (param binding, SRID order lng/lat); category CHECK rejects bad values.
- **Integration (against PostGIS, e.g. testcontainers/docker):** in-Chennai point → correct zone; in-Coimbatore point → correct zone; **Madurai point → "Other TN Region", no error**; on-boundary point deterministic; INSERT then GET round-trips.
- **Edge:** DB unreachable → handler returns 5xx but never leaks creds; invalid geom rejected; null island (0,0) → fallback.
- **Hard-rule:** scan that no migration/seed contains real coordinates tied to a person, no secrets; every zone row bilingual.

## 6. Definition of Done

- [x] `db/migrations` apply cleanly on a fresh Postgres 16 + PostGIS; idempotent re-run safe (`schema_migrations`).
- [x] 20 zones seeded, all bilingual. *(Placeholder geometries — BLOCKER-1.)*
- [x] Lambda persists & reads real reports; `determineZone` stub deleted.
- [x] Madurai/out-of-boundary submission succeeds as "Other TN Region" (HARD RULE 5) — covered by tests.
- [x] `npm run typecheck && npm run build` and DB tests green; CI runs a postgis service + migrate step.
- [x] No secrets/PII/real-coords committed (HARD RULE 1); disclosure footer untouched.
- [ ] **BLOCKER-1:** replace placeholder polygons with authoritative GCC/CCMC ward GeoJSON; native-review Tamil zone names. *(Required before production launch, not before merge.)*
- [ ] ADR addendum: none needed — all §4 decisions are consistent with ADR 001.

> **Verified with:** `docker run postgis/postgis:16-3.4` → `npm run migrate -w db` → `npm test` (12/12).
