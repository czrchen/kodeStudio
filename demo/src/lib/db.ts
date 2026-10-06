import { neon } from '@neondatabase/serverless';
import { DATABASE_URL } from 'astro:env/server';

type Row = Record<string, any>;

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS demo_claims (
     id           SERIAL PRIMARY KEY,
     created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
     session      TEXT NOT NULL,
     staff        TEXT NOT NULL,
     department   TEXT NOT NULL,
     merchant     TEXT NOT NULL,
     receipt_date DATE,
     amount       NUMERIC(10,2) NOT NULL,
     sst          NUMERIC(10,2),
     category     TEXT NOT NULL,
     receipt_no   TEXT,
     description  TEXT,
     ai_amount    NUMERIC(10,2),
     image        TEXT,
     flags        TEXT[] NOT NULL DEFAULT '{}',
     status       TEXT NOT NULL DEFAULT 'pending',
     decided_at   TIMESTAMPTZ,
     synced       BOOLEAN NOT NULL DEFAULT false
   )`,
  `CREATE INDEX IF NOT EXISTS demo_claims_session ON demo_claims (session, created_at DESC)`,
  `CREATE TABLE IF NOT EXISTS demo_events (
     id          BIGSERIAL PRIMARY KEY,
     created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
     kind        TEXT NOT NULL,
     key         TEXT NOT NULL
   )`,
  `CREATE INDEX IF NOT EXISTS demo_events_lookup ON demo_events (kind, key, created_at)`,
];

type Sql = { query: (text: string, params?: unknown[]) => Promise<unknown> };
let ready: Promise<Sql> | undefined;

async function connect(): Promise<Sql> {
  if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');
  const sql = neon(DATABASE_URL);
  for (const stmt of SCHEMA) await sql.query(stmt);
  return sql;
}

export async function q(text: string, params: unknown[] = []): Promise<Row[]> {
  const pending = (ready ??= connect().catch((err) => {
    ready = undefined;
    throw err;
  }));
  return (await (await pending).query(text, params)) as Row[];
}
