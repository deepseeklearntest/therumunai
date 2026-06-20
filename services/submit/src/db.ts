import pg from "pg";
import { buildZoneTagQuery, resolveZone, type ResolvedZone } from "./zone.js";

// Module-scoped pool so warm Lambda invocations reuse connections. A t4g.micro
// has a small max_connections budget, so keep the pool tiny.
let pool: pg.Pool | undefined;

function getPool(): pg.Pool {
  if (!pool) {
    pool = new pg.Pool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 5432),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      max: 2,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 10000,
    });
  }
  return pool;
}

// PostGIS point-in-polygon zone lookup. HARD RULE 5: a point outside every zone
// resolves to "Other TN Region" rather than throwing.
export async function tagZone(latitude: number, longitude: number): Promise<ResolvedZone> {
  const { text, values } = buildZoneTagQuery(latitude, longitude);
  const { rows } = await getPool().query(text, values);
  return resolveZone(rows);
}

export interface StoredReport {
  id: string;
  created_at: string;
}

export async function insertReport(input: {
  category: string;
  photoKey: string;
  latitude: number;
  longitude: number;
  city: string;
  zone: string | null;
}): Promise<StoredReport> {
  const { rows } = await getPool().query(
    `INSERT INTO reports (category, photo_key, geom, city, zone)
     VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326), $5, $6)
     RETURNING id, created_at`,
    [input.category, input.photoKey, input.longitude, input.latitude, input.city, input.zone]
  );
  return rows[0];
}

export interface ReportListItem {
  id: string;
  category: string;
  latitude: number;
  longitude: number;
  photoKey: string;
  city: string;
  zone: string | null;
  timestamp: string;
  status: string;
}

// Public read path. Coordinates are rounded to 4 decimal places (~10m) so the
// public map never exposes the full-precision GPS fix a reporter stood at
// (HARD RULE 1: no real coordinates tied to individuals). Stored geometry
// keeps full precision — only this public projection rounds.
export async function listReports(limit = 200): Promise<ReportListItem[]> {
  const { rows } = await getPool().query(
    `SELECT id, category, photo_key,
            ROUND(ST_Y(geom)::numeric, 4) AS latitude,
            ROUND(ST_X(geom)::numeric, 4) AS longitude,
            city, zone, status, created_at
     FROM reports
     ORDER BY created_at DESC
     LIMIT $1`,
    [limit]
  );
  return rows.map((r) => ({
    id: r.id,
    category: r.category,
    latitude: Number(r.latitude),
    longitude: Number(r.longitude),
    photoKey: r.photo_key,
    city: r.city,
    zone: r.zone,
    timestamp: new Date(r.created_at).toISOString(),
    status: r.status,
  }));
}
