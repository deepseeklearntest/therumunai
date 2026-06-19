-- 0002_municipal_zones.sql
-- Municipal zone boundary polygons for spatial zone-tagging (PRD §7).
-- One row per GCC zone (Chennai) and CCMC zone (Coimbatore).
-- HARD RULE 4: every zone carries an English AND a Tamil (தமிழ்) name.

CREATE TABLE IF NOT EXISTS municipal_zones (
  id             serial PRIMARY KEY,
  city           text NOT NULL,                          -- 'Chennai' | 'Coimbatore'
  zone_name      text NOT NULL,                          -- English label
  zone_name_ta   text NOT NULL,                          -- தமிழ் label
  is_placeholder boolean NOT NULL DEFAULT false,         -- true until real ward GeoJSON lands (BLOCKER-1)
  geom           geometry(MultiPolygon, 4326) NOT NULL,
  CONSTRAINT municipal_zones_city_zone_uniq UNIQUE (city, zone_name)
);

-- GIST index powers ST_Contains() point-in-polygon lookups.
CREATE INDEX IF NOT EXISTS municipal_zones_geom_gix
  ON municipal_zones USING GIST (geom);
