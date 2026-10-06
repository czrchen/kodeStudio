import type { APIRoute } from 'astro';
import { createHash } from 'node:crypto';
import { SESSION_SECRET } from 'astro:env/server';
import { isAdmin } from '../../lib/auth';
import { q } from '../../lib/db';
import { clean } from '../../lib/validate';

const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|headless|lighthouse|pingdom|monitor/i;

// Cookie-free page view counter. Unique visitors are counted with a daily-rotating
// one-way hash of IP + user agent, so no personal data is stored.
export const POST: APIRoute = async ({ request, cookies, clientAddress, url }) => {
  const ua = request.headers.get('user-agent') ?? '';
  if (BOT.test(ua) || isAdmin(cookies)) return new Response(null, { status: 204 });

  let body: any;
  try {
    body = JSON.parse(await request.text());
  } catch {
    return new Response(null, { status: 400 });
  }

  const path = clean(body.path, 200).split(/[?#]/)[0];
  if (!path.startsWith('/') || path.startsWith('/admin') || path.startsWith('/api')) return new Response(null, { status: 204 });

  let source = clean(body.utm, 60).toLowerCase() || null;
  if (!source && body.referrer) {
    try {
      const host = new URL(clean(body.referrer, 500)).hostname.replace(/^www\./, '');
      if (host && host !== url.hostname) source = host;
    } catch {}
  }

  const width = Number(body.width) || 0;
  const device = width === 0 ? null : width < 768 ? 'mobile' : width < 1100 ? 'tablet' : 'desktop';
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || clientAddress || '';
  const day = new Date().toISOString().slice(0, 10);
  const visitor = createHash('sha256').update(`${SESSION_SECRET ?? 'dev'}|${day}|${ip}|${ua}`).digest('hex').slice(0, 16);

  await q(`INSERT INTO page_views (path, source, visitor, device) VALUES ($1, $2, $3, $4)`, [path, source, visitor, device]);
  return new Response(null, { status: 204 });
};
