-- zone_tag.sql — the canonical zone-tagging lookup (PRD §7).
-- Given a report's coordinates, find the municipal zone whose polygon contains it.
-- $1 = longitude (X), $2 = latitude (Y).  ST_MakePoint takes X,Y in that order.
--
-- 0 rows  →  the point is outside every zone; the application tags the report
--            'Other TN Region' (HARD RULE 5) and still accepts it.

SELECT city, zone_name, zone_name_ta
FROM municipal_zones
WHERE ST_Contains(geom, ST_SetSRID(ST_MakePoint($1, $2), 4326))
LIMIT 1;
