import type { APIRoute } from 'astro';
import { q } from '../../lib/db';
import { demoSession, isPresenter, json } from '../../lib/session';
import { appendRow, sheetsConfigured } from '../../lib/sheets';

const fmt = (d: Date | string) =>
  new Date(d).toLocaleString('en-MY', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kuala_Lumpur' });

export const POST: APIRoute = async ({ request, cookies }) => {
  const session = demoSession(cookies);
  const b = await request.json().catch(() => null);
  const id = Number(b?.id);
  const decision = b?.decision === 'approved' ? 'approved' : b?.decision === 'rejected' ? 'rejected' : null;
  if (!Number.isInteger(id) || !decision) return json({ error: 'Invalid request' }, 400);

  const [claim] = await q(
    `UPDATE demo_claims SET status = $1, decided_at = now()
     WHERE id = $2 AND session = $3 AND status = 'pending'
     RETURNING *, to_char(receipt_date, 'YYYY-MM-DD') AS receipt_day`,
    [decision, id, session],
  );
  if (!claim) return json({ error: 'Claim not found or already decided.' }, 404);

  let sync: 'synced' | 'skipped' | 'failed' = 'skipped';
  if (decision === 'approved' && isPresenter(cookies) && sheetsConfigured()) {
    try {
      await appendRow([
        `MJ-${String(claim.id).padStart(4, '0')}`,
        fmt(claim.created_at),
        claim.staff,
        claim.department,
        claim.merchant,
        claim.receipt_day ?? '',
        claim.category,
        Number(claim.amount),
        claim.sst === null ? '' : Number(claim.sst),
        claim.receipt_no ?? '',
        claim.description ?? '',
        (claim.flags ?? []).join('; '),
        'Approved',
        fmt(claim.decided_at),
      ]);
      await q(`UPDATE demo_claims SET synced = true WHERE id = $1`, [id]);
      sync = 'synced';
    } catch (err) {
      console.error('[sheets]', err);
      sync = 'failed';
    }
  }
  return json({ ok: true, status: decision, sync });
};
