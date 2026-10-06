import { GEMINI_API_KEY, GEMINI_MODEL } from 'astro:env/server';
import { categories } from './company';

export type Extracted = {
  is_receipt: boolean;
  merchant: string | null;
  date: string | null;
  total: number | null;
  sst: number | null;
  receipt_no: string | null;
  category: string;
  description: string | null;
  confidence: 'high' | 'medium' | 'low';
};

const PROMPT = `You read receipts for a Malaysian company's staff expense claims.
Extract the fields from this image. Rules:
- total: the final amount paid (after SST/service charge, rounding), as a number in MYR. Ignore change/cash tendered.
- sst: the SST/service tax amount if printed, else null.
- date: the transaction date as YYYY-MM-DD (Malaysian receipts use DD/MM/YYYY).
- merchant: the shop/company name as printed, in title case.
- category: the best fit from the allowed list (petrol stations → "Fuel & Mileage", Grab/taxi/LRT → "Transport", Touch 'n Go/toll/parking → "Parking & Toll").
- description: a short 3–8 word description of what was bought.
- is_receipt: false if the image is not a receipt or invoice.
- confidence: how sure you are about total and date.`;

const SCHEMA = {
  type: 'OBJECT',
  properties: {
    is_receipt: { type: 'BOOLEAN' },
    merchant: { type: 'STRING', nullable: true },
    date: { type: 'STRING', nullable: true },
    total: { type: 'NUMBER', nullable: true },
    sst: { type: 'NUMBER', nullable: true },
    receipt_no: { type: 'STRING', nullable: true },
    category: { type: 'STRING', enum: Object.keys(categories) },
    description: { type: 'STRING', nullable: true },
    confidence: { type: 'STRING', enum: ['high', 'medium', 'low'] },
  },
  required: ['is_receipt', 'merchant', 'date', 'total', 'sst', 'receipt_no', 'category', 'description', 'confidence'],
};

export const geminiConfigured = () => Boolean(GEMINI_API_KEY);

export async function readReceipt(mimeType: string, base64: string): Promise<Extracted> {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not set');
  const model = GEMINI_MODEL || 'gemini-3.8-flash';
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY },
    body: JSON.stringify({
      contents: [{ parts: [{ inline_data: { mime_type: mimeType, data: base64 } }, { text: PROMPT }] }],
      generationConfig: { temperature: 0, responseMimeType: 'application/json', responseSchema: SCHEMA },
    }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`Gemini error ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.find((p: any) => p.text)?.text;
  if (!text) throw new Error('Gemini returned no result');
  const out = JSON.parse(text) as Extracted;
  if (!(out.category in categories)) out.category = 'Others';
  if (out.date && !/^\d{4}-\d{2}-\d{2}$/.test(out.date)) out.date = null;
  return out;
}
