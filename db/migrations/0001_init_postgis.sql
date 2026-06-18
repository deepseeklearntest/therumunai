-- 0001_init_postgis.sql
-- Enable the PostGIS spatial extension and pgcrypto (for gen_random_uuid).
-- Idempotent: safe to run on a fresh or already-initialized database.

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
