# KodeSME website

Landing page, call booking and admin portal for KodeSME — built with Astro, deployed at [kodesme.klyihao.com](https://kodesme.klyihao.com), with data in Neon Postgres.

| Page | What it does |
|---|---|
| `/` | Landing page: services, industries, process, pricing, FAQ, contact form |
| `/book` | Book a free 30-minute consultation (slots from `src/config.ts`) |
| `/admin` | Private portal: view enquiries & bookings, change status, add notes |

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:4321. Without `DATABASE_URL`, a local database is created in `.data/` automatically, and the admin password is `admin`.

## Edit content

Most things live in **`src/config.ts`**: contact details, prices, industries and example workflows, and booking hours (days, start/end time, slot length, how far ahead people can book).
Page copy (headlines, services, FAQ) is in `src/pages/index.astro`.

## Deploy (Node + Neon)

1. Create a Neon project → **Connect** → copy the connection string.
2. Add these environment variables on the server:
   - `DATABASE_URL` — the Neon connection string
   - `ADMIN_PASSWORD` — a strong password for `/admin`
   - `SESSION_SECRET` — a long random string (`openssl rand -hex 32`)
3. Run `npm ci && npm run build`, then start the server with `npm start`.
4. Proxy `kodesme.klyihao.com` to the Node process through Nginx. Tables are created automatically on first request.

## WhatsApp alerts

New enquiries and bookings send a WhatsApp message to you via [CallMeBot](https://www.callmebot.com/blog/free-api-whatsapp-messages/).

1. Save **+34 694 25 79 72** in your phone contacts.
2. WhatsApp that number: `I allow callmebot to send me messages` — it replies with your API key.
3. Set `CALLMEBOT_APIKEY` (and optionally `CALLMEBOT_PHONE`, defaults to the site's WhatsApp number) in your server environment and restart.

If alerts don't arrive, check the server logs for lines starting with `[notify]`. Leaving `CALLMEBOT_APIKEY` empty turns alerts off.
