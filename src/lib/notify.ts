import { CALLMEBOT_APIKEY, CALLMEBOT_PHONE } from 'astro:env/server';
import { site } from '../config';

/**
 * Sends a WhatsApp message to the business owner via CallMeBot.
 * Never throws — a failed alert must not fail the visitor's submission.
 */
export async function notifyOwner(text: string): Promise<void> {
  if (!CALLMEBOT_APIKEY) return;
  const phone = CALLMEBOT_PHONE || site.whatsapp;
  const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&apikey=${encodeURIComponent(CALLMEBOT_APIKEY)}&text=${encodeURIComponent(text.slice(0, 1500))}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    // CallMeBot reports failures (e.g. a bad API key) in the body with a 2xx status.
    const body = (await res.text()).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!res.ok || /error/i.test(body)) console.error(`[notify] CallMeBot failed (${res.status}): ${body.slice(0, 200)}`);
  } catch (err) {
    console.error('[notify] CallMeBot request failed:', err);
  }
}

export const lines = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join('\n');
