# KodeStudio website

Landing page, call booking and admin portal for KodeStudio — built with Astro, deployed on Vercel, data in Neon Postgres.

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

## Deploy (Vercel + Neon)

1. Create a Neon project → **Connect** → copy the connection string.
2. Push this folder to a GitHub repo and import it in Vercel (framework is auto-detected).
3. In Vercel → Project → Settings → Environment Variables, add:
   - `DATABASE_URL` — the Neon connection string
   - `ADMIN_PASSWORD` — a strong password for `/admin`
   - `SESSION_SECRET` — a long random string (`openssl rand -hex 32`)
4. Deploy. Tables are created automatically on first request.
5. Add your domain in Vercel and update `site` in `astro.config.mjs`.
