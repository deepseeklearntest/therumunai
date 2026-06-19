# db — PostGIS schema, seeds & migrations

PostGIS schema and zone data for Therumunai's spatial zone-tagging (PRD §7).

## Layout

```text
migrations/   Numbered, idempotent DDL (applied in lexical order)
seeds/        Zone data (generated — see below)
queries/      Canonical reusable queries (zone_tag.sql)
test/         Integration tests against a live PostGIS
run-migrations.mjs           Applies migrations + seeds, tracks schema_migrations
generate-placeholder-zones.mjs   Regenerates seeds/0001_zones.sql
```

## Hard rules in play

- **No PII / no IP** in `reports` (HARD RULE 1) — anonymous by design.
- **Bilingual** zone names: every `municipal_zones` row has `zone_name` + `zone_name_ta` (HARD RULE 4).
- **Out-of-boundary fallback**: a point outside every polygon yields 0 rows from
  `queries/zone_tag.sql`; the application tags it `Other TN Region` (HARD RULE 5).

## ⚠️ BLOCKER-1 — placeholder data

`seeds/0001_zones.sql` contains **placeholder** axis-aligned boxes
(`is_placeholder = true`), not real ward boundaries, and **best-effort Tamil
names**. Before production launch:

1. Replace with authoritative GCC/CCMC ward GeoJSON (OpenCity / data.gov.in).
2. Have a native Tamil reader verify every `zone_name_ta`.
3. Delete `generate-placeholder-zones.mjs`.

## Local usage

```bash
# 1. Start a throwaway PostGIS (Colima/Docker)
docker run -d --name therumunai-postgis \
  -e POSTGRES_PASSWORD=devpass -e POSTGRES_DB=therumunai \
  -p 55432:5432 postgis/postgis:16-3.4

# 2. Apply schema + seeds (idempotent)
DB_PORT=55432 DB_PASS=devpass npm run migrate -w db

# 3. Run integration tests
DB_PORT=55432 DB_PASS=devpass npm test -w db
```

Connection comes from env: `DATABASE_URL`, or `DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASS`.
No credentials are committed.
