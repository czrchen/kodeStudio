// The fictional company used in the demo. Edit freely.

export const company = {
  name: 'Syarikat Maju Jaya Sdn Bhd',
  short: 'Maju Jaya',
  manager: 'Mr. Tan (Finance Manager)',
};

export const staff = [
  { name: 'Aina Rahman', short: 'Aina', initials: 'AR', department: 'Sales' },
  { name: 'Ravi Kumar', short: 'Ravi', initials: 'RK', department: 'Operations' },
  { name: 'Lim Mei Ling', short: 'Mei Ling', initials: 'ML', department: 'Admin' },
  { name: 'Hafiz Ismail', short: 'Hafiz', initials: 'HI', department: 'Field Service' },
];

/** Claim categories and the per-receipt limit before director approval is needed (RM). */
export const categories: Record<string, number> = {
  Meals: 100,
  'Fuel & Mileage': 300,
  Transport: 200,
  'Parking & Toll': 100,
  Accommodation: 500,
  'Office Supplies': 300,
  'Client Entertainment': 500,
  Others: 200,
};

export const MAX_RECEIPT_AGE_DAYS = 60;

export const rm = (n: number | string | null | undefined) =>
  n === null || n === undefined || n === '' ? '—' : `RM ${Number(n).toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
