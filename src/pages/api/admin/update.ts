import type { APIRoute } from 'astro';
import { q } from '../../../lib/db';
import { clean, json } from '../../../lib/validate';

const STATUSES = {
  enquiries: ['new', 'contacted', 'proposal', 'won', 'lost'],
  bookings: ['confirmed', 'completed', 'no-show', 'cancelled'],
} as const;

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => null);
  const table = body?.table as keyof typeof STATUSES;
  const id = Number(body?.id);
  if (!(table in STATUSES) || !Number.isInteger(id)) return json({ error: 'Invalid request' }, 400);

  if ('status' in body) {
    const status = clean(body.status, 20);
    if (!(STATUSES[table] as readonly string[]).includes(status)) return json({ error: 'Invalid status' }, 400);
    try {
      await q(`UPDATE ${table} SET status = $1 WHERE id = $2`, [status, id]);
    } catch (err: any) {
      if (err?.code === '23505') return json({ error: 'Another active booking already uses this slot.' }, 409);
      throw err;
    }
  }
  if ('notes' in body) {
    await q(`UPDATE ${table} SET notes = $1 WHERE id = $2`, [clean(body.notes, 5000), id]);
  }
  return json({ ok: true });
};
