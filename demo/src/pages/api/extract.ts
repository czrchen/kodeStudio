import type { APIRoute } from 'astro';
import { q } from '../../lib/db';
import { geminiConfigured, readReceipt } from '../../lib/gemini';
import { demoSession, hashKey, json } from '../../lib/session';

const PER_IP_HOUR = 20;
const GLOBAL_DAY = 300;
const MAX_BYTES = 1_500_000;

export const POST: APIRoute = async ({ request, cookies, clientAddress }) => {
  demoSession(cookies);
  if (!geminiConfigured()) return json({ error: 'The AI reader is not set up yet (GEMINI_API_KEY missing).' }, 503);

  const body = await request.json().catch(() => null);
  const match = typeof body?.image === 'string' && body.image.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) return json({ error: 'Please upload a JPG or PNG photo of the receipt.' }, 400);
  if (match[2].length * 0.75 > MAX_BYTES) return json({ error: 'That photo is too large. Please try again.' }, 413);

  const ip = hashKey(request.headers.get('x-forwarded-for')?.split(',')[0].trim() || clientAddress || 'unknown');
  const [{ mine, all }] = await q(
    `SELECT count(*) FILTER (WHERE key = $1 AND created_at > now() - interval '1 hour')::int AS mine,
            count(*) FILTER (WHERE created_at > now() - interval '1 day')::int AS all
     FROM demo_events WHERE kind = 'extract' AND created_at > now() - interval '1 day'`,
    [ip],
  );
  if (mine >= PER_IP_HOUR || all >= GLOBAL_DAY) {
    return json({ error: 'The demo is busy right now. Please try again in a little while.' }, 429);
  }
  await q(`INSERT INTO demo_events (kind, key) VALUES ('extract', $1)`, [ip]);

  try {
    const result = await readReceipt(match[1], match[2]);
    if (!result.is_receipt) return json({ error: "That doesn't look like a receipt. Try another photo." }, 422);
    return json({ result });
  } catch (err) {
    console.error('[extract]', err);
    return json({ error: 'The AI could not read this receipt. Please try a clearer photo.' }, 502);
  }
};
