import type { APIRoute } from 'astro';
import { categories, MAX_RECEIPT_AGE_DAYS, rm, staff } from '../../lib/company';
import { q } from '../../lib/db';
import { demoSession, json } from '../../lib/session';

const str = (v: unknown, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const num = (v: unknown) => {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? '').replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : null;
};

export const POST: APIRoute = async ({ request, cookies }) => {
  const session = demoSession(cookies);
  const b = await request.json().catch(() => null);
  if (!b) return json({ error: 'Invalid request' }, 400);

  const person = staff.find((s) => s.name === b.staff);
  const category = str(b.category, 50);
  const amount = num(b.amount);
  const aiAmount = num(b.ai_amount);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(str(b.date)) ? str(b.date) : null;
  const merchant = str(b.merchant, 120);
  const image = typeof b.image === 'string' && b.image.startsWith('data:image/') && b.image.length < 2_100_000 ? b.image : null;

  if (!person) return json({ error: 'Please choose who is claiming.' }, 400);
  if (!merchant || !amount || amount <= 0) return json({ error: 'Please check the merchant and amount.' }, 400);
  if (!(category in categories)) return json({ error: 'Please choose a category.' }, 400);

  // Policy checks a real workflow would run automatically.
  const flags: string[] = [];
  const limit = categories[category];
  if (amount > limit) flags.push(`Over ${rm(limit)} ${category} limit — needs director approval`);
  if (date) {
    const age = (Date.now() - Date.parse(`${date}T00:00:00+08:00`)) / 86_400_000;
    if (age > MAX_RECEIPT_AGE_DAYS) flags.push(`Receipt older than ${MAX_RECEIPT_AGE_DAYS} days`);
    if (age < -1) flags.push('Receipt date is in the future');
  } else {
    flags.push('No receipt date');
  }
  if (aiAmount !== null && aiAmount !== amount) flags.push(`Amount edited by staff (AI read ${rm(aiAmount)})`);
  if (b.confidence === 'low') flags.push('AI was unsure — check receipt');
  const [dup] = await q(
    `SELECT id FROM demo_claims WHERE session = $1 AND status <> 'rejected'
       AND lower(merchant) = lower($2) AND amount = $3 AND receipt_date IS NOT DISTINCT FROM $4::date LIMIT 1`,
    [session, merchant, amount, date],
  );
  if (dup) flags.push(`Possible duplicate of claim #${dup.id}`);

  await q(`DELETE FROM demo_claims WHERE created_at < now() - interval '7 days'`);
  await q(`DELETE FROM demo_events WHERE created_at < now() - interval '2 days'`);
  const [row] = await q(
    `INSERT INTO demo_claims (session, staff, department, merchant, receipt_date, amount, sst, category, receipt_no, description, ai_amount, image, flags)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id`,
    [session, person.name, person.department, merchant, date, amount, num(b.sst), category, str(b.receipt_no, 60) || null, str(b.description, 200) || null, aiAmount, image, flags],
  );
  return json({ ok: true, id: row.id, flags });
};
