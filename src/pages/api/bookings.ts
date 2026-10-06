import type { APIRoute } from 'astro';
import { q } from '../../lib/db';
import { isOfferedSlot } from '../../lib/slots';
import { clean, isEmail, isPhone, json } from '../../lib/validate';

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => null);
  if (!body) return json({ error: 'Invalid request' }, 400);
  if (clean(body.website)) return json({ ok: true }); // honeypot

  const slot = clean(body.slot, 40);
  const data = {
    name: clean(body.name, 100),
    company: clean(body.company, 150),
    email: clean(body.email, 150),
    phone: clean(body.phone, 30),
    industry: clean(body.industry, 100),
    topic: clean(body.topic, 2000),
  };

  if (!isOfferedSlot(slot)) return json({ error: 'That time is no longer available. Please pick another slot.' }, 409);
  if (!data.name || !isEmail(data.email) || !isPhone(data.phone)) {
    return json({ error: 'Please fill in your name, a valid email and phone number.' }, 400);
  }

  try {
    await q(
      `INSERT INTO bookings (slot_start, name, company, email, phone, industry, topic)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [new Date(slot).toISOString(), data.name, data.company, data.email, data.phone, data.industry, data.topic],
    );
  } catch (err: any) {
    if (err?.code === '23505') return json({ error: 'Someone just booked that slot. Please pick another time.' }, 409);
    throw err;
  }
  return json({ ok: true });
};
