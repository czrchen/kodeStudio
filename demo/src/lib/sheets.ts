import { createSign } from 'node:crypto';
import { GOOGLE_PRIVATE_KEY, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_SHEET_ID } from 'astro:env/server';

// Minimal Google Sheets client using a service account (no googleapis dependency).

const HEADER = ['Claim ID', 'Submitted', 'Staff', 'Department', 'Merchant', 'Receipt date', 'Category', 'Amount (RM)', 'SST (RM)', 'Receipt no.', 'Description', 'Flags', 'Status', 'Approved at'];

let token: { value: string; expires: number } | undefined;

export const sheetsConfigured = () => Boolean(GOOGLE_SERVICE_ACCOUNT_EMAIL && GOOGLE_PRIVATE_KEY && GOOGLE_SHEET_ID);
export const sheetUrl = () => (GOOGLE_SHEET_ID ? `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/edit` : null);

const b64url = (v: string | Buffer) => Buffer.from(v).toString('base64url');

async function accessToken(): Promise<string> {
  if (token && token.expires > Date.now() + 60_000) return token.value;
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };
  const unsigned = `${b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))}.${b64url(JSON.stringify(claim))}`;
  const key = (GOOGLE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n');
  const signature = createSign('RSA-SHA256').update(unsigned).sign(key);
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${b64url(signature)}` }),
  });
  if (!res.ok) throw new Error(`Google auth failed ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  token = { value: data.access_token, expires: Date.now() + data.expires_in * 1000 };
  return token.value;
}

async function api(path: string, init: RequestInit = {}) {
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${await accessToken()}`, 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`Google Sheets error ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

/** Appends one row to the first sheet, adding the header row if the sheet is empty. */
export async function appendRow(row: (string | number)[]) {
  const first = await api(`/values/A1:A1`);
  const values = first.values?.length ? [row] : [HEADER, row];
  await api(`/values/A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`, {
    method: 'POST',
    body: JSON.stringify({ values }),
  });
}
