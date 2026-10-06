import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import type { AstroCookies } from 'astro';
import { PRESENTER_PASSWORD, SESSION_SECRET } from 'astro:env/server';

const secret = SESSION_SECRET || (import.meta.env.DEV ? 'dev-only-secret' : '');
const sign = (v: string) => createHmac('sha256', secret).update(v).digest('hex');
const WEEK = 60 * 60 * 24 * 7;
const cookieOpts = { path: '/', httpOnly: true, secure: import.meta.env.PROD, sameSite: 'lax' as const, maxAge: WEEK };

/** Anonymous per-visitor demo session, so each visitor only sees their own claims. */
export function demoSession(cookies: AstroCookies): string {
  const existing = cookies.get('demo_sid')?.value;
  if (existing && /^[0-9a-f-]{36}$/.test(existing)) return existing;
  const sid = randomUUID();
  cookies.set('demo_sid', sid, cookieOpts);
  return sid;
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export const presenterConfigured = () => Boolean(PRESENTER_PASSWORD && secret);

export function checkPresenterPassword(input: string) {
  return presenterConfigured() && safeEqual(sign(input), sign(PRESENTER_PASSWORD!));
}

export function startPresenter(cookies: AstroCookies) {
  const exp = String(Math.floor(Date.now() / 1000) + WEEK);
  cookies.set('demo_presenter', `${exp}.${sign(`presenter:${exp}`)}`, cookieOpts);
}

export function endPresenter(cookies: AstroCookies) {
  cookies.delete('demo_presenter', { path: '/' });
}

export function isPresenter(cookies: AstroCookies) {
  if (!presenterConfigured()) return false;
  const [exp, sig] = (cookies.get('demo_presenter')?.value ?? '').split('.');
  return Boolean(exp && sig && safeEqual(sig, sign(`presenter:${exp}`)) && Number(exp) > Date.now() / 1000);
}

export const hashKey = (v: string) => createHash('sha256').update(`${secret}|${v}`).digest('hex').slice(0, 24);

export const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
