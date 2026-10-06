import type { APIRoute } from 'astro';
import { site } from '../../config';
import { q } from '../../lib/db';
import { lines, notifyOwner } from '../../lib/notify';
import { clean, isEmail, json } from '../../lib/validate';

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => null);
  if (!body) return json({ error: 'Invalid request' }, 400);
  if (clean(body.website)) return json({ ok: true }); // honeypot: bots fill hidden field

  const data = {
    name: clean(body.name, 100),
    company: clean(body.company, 150),
    email: clean(body.email, 150),
    phone: clean(body.phone, 30),
    industry: clean(body.industry, 100),
    team_size: clean(body.team_size, 30),
    message: clean(body.message, 3000),
  };
  if (!data.name || !isEmail(data.email) || data.message.length < 5) {
    return json({ error: 'Please fill in your name, a valid email and a short message.' }, 400);
  }

  await q(
    `INSERT INTO enquiries (name, company, email, phone, industry, team_size, message)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [data.name, data.company, data.email, data.phone, data.industry, data.team_size, data.message],
  );
  void notifyOwner(
    lines(
      '📩 *New enquiry* — KodeSME',
      `*${data.name}*${data.company ? ` · ${data.company}` : ''}`,
      (data.industry || data.team_size) && [data.industry, data.team_size && `${data.team_size} staff`].filter(Boolean).join(' · '),
      `✉️ ${data.email}`,
      data.phone && `📞 ${data.phone}`,
      '',
      data.message.slice(0, 600),
      '',
      `${site.url}/admin`,
    ),
  );
  return json({ ok: true });
};
