export interface ZoneRow {
  city: string;
  zone_name: string;
}

export interface ResolvedZone {
  city: string;
  zone: string | null;
}

export interface ZoneQuery {
  text: string;
  values: number[];
}

// Builds the PostGIS point-in-polygon lookup. ST_MakePoint expects (x=lng, y=lat);
// the SQL below binds $1=lng, $2=lat to match.
export function buildZoneTagQuery(latitude: number, longitude: number): ZoneQuery {
  return {
    text: `SELECT city, zone_name
FROM municipal_zones
WHERE ST_Contains(geom, ST_SetSRID(ST_MakePoint($1, $2), 4326))
LIMIT 1`,
    values: [longitude, latitude],
  };
}

// HARD RULE 5: a point outside every zone polygon must resolve to "Other TN Region",
// never throw and never drop the report.
export function resolveZone(rows: ZoneRow[]): ResolvedZone {
  const match = rows[0];
  if (!match) {
    return { city: "Other TN Region", zone: null };
  }
  return { city: match.city, zone: match.zone_name };
}
