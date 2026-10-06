import { DATABASE_URL } from 'astro:env/server';

type Row = Record<string, any>;
type QueryFn = (text: string, params?: unknown[]) => Promise<Row[]>;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS enquiries (
  id          SERIAL PRIMARY KEY,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  name        TEXT NOT NULL,
  company     TEXT,
  email       TEXT NOT NULL,
  phone       TEXT,
  industry    TEXT,
  team_size   TEXT,
  message     TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'new',
  notes       TEXT
);
CREATE TABLE IF NOT EXISTS bookings (
  id          SERIAL PRIMARY KEY,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  slot_start  TIMESTAMPTZ NOT NULL,
  name        TEXT NOT NULL,
  company     TEXT,
  email       TEXT NOT NULL,
  phone       TEXT NOT NULL,
  industry    TEXT,
  topic       TEXT,
  status      TEXT NOT NULL DEFAULT 'confirmed',
  notes       TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS bookings_active_slot
  ON bookings (slot_start) WHERE status <> 'cancelled';
CREATE TABLE IF NOT EXISTS page_views (
  id          BIGSERIAL PRIMARY KEY,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  path        TEXT NOT NULL,
  source      TEXT,
  visitor     TEXT,
  device      TEXT
);
CREATE INDEX IF NOT EXISTS page_views_created ON page_views (created_at);
`;

let ready: Promise<QueryFn> | undefined;

async function connect(): Promise<QueryFn> {
  let query: QueryFn;
  let exec: (sql: string) => Promise<unknown>;

  if (DATABASE_URL) {
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(DATABASE_URL);
    query = (text, params = []) => sql.query(text, params) as Promise<Row[]>;
    exec = async (script) => {
      for (const stmt of script.split(';').map((s) => s.trim()).filter(Boolean)) await sql.query(stmt);
    };
  } else if (import.meta.env.DEV) {
    // Local development without Neon: an embedded Postgres stored in .data/
    const { PGlite } = await import('@electric-sql/pglite');
    const { mkdirSync } = await import('node:fs');
    mkdirSync('./.data', { recursive: true });
    const db = new PGlite('./.data/pglite');
    console.warn('[db] DATABASE_URL not set — using local dev database in .data/pglite');
    query = async (text, params = []) => (await db.query<Row>(text, params)).rows;
    exec = (script) => db.exec(script);
  } else {
    throw new Error('DATABASE_URL is not set');
  }

  await exec(SCHEMA);
  return query;
}

export async function q(text: string, params: unknown[] = []): Promise<Row[]> {
  ready ??= connect().catch((err) => {
    ready = undefined;
    throw err;
  });
  return (await ready)(text, params);
}
