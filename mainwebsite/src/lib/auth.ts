import { createHmac, timingSafeEqual } from 'node:crypto';
import type { AstroCookies } from 'astro';
import { ADMIN_PASSWORD, SESSION_SECRET } from 'astro:env/server';

const COOKIE = 'ks_admin';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// In local dev, fall back to an easy password so the portal works out of the box.
const password = ADMIN_PASSWORD || (import.meta.env.DEV ? 'admin' : '');
const secret = SESSION_SECRET || (import.meta.env.DEV ? 'dev-only-secret' : '');

const sign = (value: string) => createHmac('sha256', secret).update(value).digest('hex');

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export const authConfigured = () => Boolean(password && secret);

export function checkPassword(input: string) {
  return authConfigured() && safeEqual(sign(input), sign(password));
}

export function startSession(cookies: AstroCookies) {
  const exp = String(Math.floor(Date.now() / 1000) + MAX_AGE);
  cookies.set(COOKIE, `${exp}.${sign(exp)}`, {
    path: '/',
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    maxAge: MAX_AGE,
  });
}

export function endSession(cookies: AstroCookies) {
  cookies.delete(COOKIE, { path: '/' });
}

export function isAdmin(cookies: AstroCookies) {
  if (!authConfigured()) return false;
  const [exp, sig] = (cookies.get(COOKIE)?.value ?? '').split('.');
  if (!exp || !sig || !safeEqual(sig, sign(exp))) return false;
  return Number(exp) > Date.now() / 1000;
}
