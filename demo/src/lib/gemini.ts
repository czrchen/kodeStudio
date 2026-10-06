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
  type: 'object',
  properties: {
    is_receipt: { type: 'boolean' },
    merchant: { type: ['string', 'null'] },
    date: { type: ['string', 'null'] },
    total: { type: ['number', 'null'] },
    sst: { type: ['number', 'null'] },
    receipt_no: { type: ['string', 'null'] },
    category: { type: 'string', enum: Object.keys(categories) },
    description: { type: ['string', 'null'] },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
  },
  required: ['is_receipt', 'merchant', 'date', 'total', 'sst', 'receipt_no', 'category', 'description', 'confidence'],
};

export const geminiConfigured = () => Boolean(GEMINI_API_KEY);

export async function readReceipt(mimeType: string, base64: string): Promise<Extracted> {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not set');
  const preferred = GEMINI_MODEL || 'gemini-3.8-flash';
  const models = [preferred, preferred, 'gemini-3.7-flash', 'gemini-3.5-flash'];
  let data: any;
  let lastError = 'Gemini request failed';

  for (const [index, model] of models.entries()) {
    try {
      const res = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY },
        body: JSON.stringify({
          model,
          input: [
            { type: 'image', mime_type: mimeType, data: base64 },
            { type: 'text', text: PROMPT },
          ],
          response_format: { type: 'text', mime_type: 'application/json', schema: SCHEMA },
          generation_config: { thinking_level: 'low' },
        }),
        signal: AbortSignal.timeout(15_000),
      });
      if (res.ok) {
        data = await res.json();
        break;
      }

      lastError = `Gemini error ${res.status}: ${(await res.text()).slice(0, 300)}`;
      if (![404, 429, 503].includes(res.status)) throw new Error(lastError);
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
    if (index < models.length - 1) await new Promise((resolve) => setTimeout(resolve, 500 * (index + 1)));
  }

  if (!data) throw new Error(lastError);
  const output = data?.steps?.findLast((step: any) => step.type === 'model_output');
  const text = output?.content?.find((part: any) => part.type === 'text')?.text;
  if (!text) throw new Error('Gemini returned no result');
  const out = JSON.parse(text) as Extracted;
  if (!(out.category in categories)) out.category = 'Others';
  if (out.date && !/^\d{4}-\d{2}-\d{2}$/.test(out.date)) out.date = null;
  return out;
}
