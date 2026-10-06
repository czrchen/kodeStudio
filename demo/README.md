# KodeSME — Expense claims demo

A live demo to show prospects: staff snap a receipt → Gemini AI reads it → policy rules flag problems → the manager approves in one tap → the claim lands in Google Sheets.

| Page | What it is |
|---|---|
| `/` | Intro + choose a role |
| `/submit` | Staff view (use on a phone) |
| `/manager` | Manager approval view |
| `/presenter` | Turn on presenter mode (enables Google Sheet sync) — for you only |

Each visitor only sees their own demo claims. Claims are deleted after 7 days. AI reads are rate-limited (20/hour per visitor, 300/day total).

## Run locally

```bash
npm install
npm run dev        # http://localhost:4322
```

Needs `.env.local` — see `.env.example`.

## Setup

### 1. Gemini (AI receipt reader)
Create a key at https://aistudio.google.com/apikey → set `GEMINI_API_KEY`.

### 2. Google Sheet sync
1. Google Cloud Console → create a project → enable **Google Sheets API**.
2. IAM & Admin → Service Accounts → create one → Keys → Add key → JSON.
3. From the JSON, set `GOOGLE_SERVICE_ACCOUNT_EMAIL` (`client_email`) and `GOOGLE_PRIVATE_KEY` (`private_key`, in double quotes, keep the `\n`).
4. Create a Google Sheet, **Share** it with the service account email as **Editor**, and set `GOOGLE_SHEET_ID` from its URL.

### 3. Presenter mode
Set `PRESENTER_PASSWORD` and `SESSION_SECRET`, open `/presenter` on your phone and sign in. Approvals you make then appear in the sheet live.

## Customise
Company name, staff, categories and per-category limits: `src/lib/company.ts`.
