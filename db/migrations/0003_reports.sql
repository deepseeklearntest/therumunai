-- 0003_reports.sql
-- Anonymous civic-issue reports (PRD §3, §7).
-- HARD RULE 1: no PII, no IP, no reporter identity fields — ever.
-- city/zone are denormalized text snapshots so a report keeps the label it was
-- tagged with even if zone boundaries are later redrawn, and the public dataset
-- reads with no join. 'Other TN Region' (HARD RULE 5) is stored verbatim.

CREATE TABLE IF NOT EXISTS reports (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category   text NOT NULL
             CHECK (category IN ('garbage', 'road', 'streetlight', 'drainage')),
  photo_key  text NOT NULL,
  geom       geometry(Point, 4326) NOT NULL,
  city       text NOT NULL,                       -- incl. 'Other TN Region'
  zone       text,                                -- NULL for the fallback region
  status     text NOT NULL DEFAULT 'submitted',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reports_geom_gix ON reports USING GIST (geom);
CREATE INDEX IF NOT EXISTS reports_created_at_idx ON reports (created_at DESC);
CREATE INDEX IF NOT EXISTS reports_city_category_idx ON reports (city, category);
