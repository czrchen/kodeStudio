export const clean = (v: unknown, max = 500) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
export const isPhone = (v: string) => /^[+\d][\d\s-]{6,19}$/.test(v);

export const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
