# KodeStudio

| Folder | What it is | Local dev |
|---|---|---|
| [`mainwebsite/`](mainwebsite) | Company website — landing page, booking, admin portal | `npm run dev` → http://localhost:4321 |
| [`demo/`](demo) | Expense claims demo app (AI receipt reading + Google Sheets) | `npm run dev` → http://localhost:4322 |

Each folder is a separate Astro app with its own `package.json`, `.env.local` and deployment. Both use the same Neon project, with separate databases (`neondb` for the website, `demo` for the demo).
