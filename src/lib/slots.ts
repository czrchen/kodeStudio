import { booking } from '../config';
import { q } from './db';

export type Day = { date: string; weekday: string; dayMonth: string; slots: { iso: string; time: string }[] };

const pad = (n: number) => String(n).padStart(2, '0');
const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/** Slot start times (ISO, UTC) for a Malaysia-time calendar date, ignoring existing bookings. */
function slotsForDate(date: string): string[] {
  const [y, m, d] = date.split('-').map(Number);
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  if (!booking.weekdays.includes(weekday)) return [];
  const out: string[] = [];
  for (let t = toMinutes(booking.dayStart); t + booking.durationMinutes <= toMinutes(booking.dayEnd); t += booking.durationMinutes) {
    out.push(new Date(`${date}T${pad(Math.floor(t / 60))}:${pad(t % 60)}:00${booking.utcOffset}`).toISOString());
  }
  return out;
}

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-MY', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kuala_Lumpur' });

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-MY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kuala_Lumpur' });

function upcomingDates(): string[] {
  const offsetMs = 8 * 60 * 60 * 1000;
  const todayMY = new Date(Date.now() + offsetMs);
  return Array.from({ length: booking.daysAhead + 1 }, (_, i) => {
    const d = new Date(Date.UTC(todayMY.getUTCFullYear(), todayMY.getUTCMonth(), todayMY.getUTCDate() + i));
    return d.toISOString().slice(0, 10);
  });
}

async function takenSlots(): Promise<Set<string>> {
  const rows = await q(`SELECT slot_start FROM bookings WHERE status <> 'cancelled' AND slot_start > now()`);
  return new Set(rows.map((r) => new Date(r.slot_start).toISOString()));
}

export async function availability(): Promise<Day[]> {
  const taken = await takenSlots();
  const earliest = Date.now() + booking.minNoticeHours * 3600_000;
  return upcomingDates()
    .map((date) => ({
      date,
      weekday: new Date(`${date}T12:00:00Z`).toLocaleDateString('en-MY', { weekday: 'short', timeZone: 'UTC' }),
      dayMonth: new Date(`${date}T12:00:00Z`).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', timeZone: 'UTC' }),
      slots: slotsForDate(date)
        .filter((iso) => Date.parse(iso) >= earliest && !taken.has(iso))
        .map((iso) => ({ iso, time: formatTime(iso) })),
    }))
    .filter((d) => d.slots.length > 0);
}

/** True if `iso` is a slot the schedule offers and it is far enough ahead. Does not check existing bookings. */
export function isOfferedSlot(iso: string): boolean {
  const t = Date.parse(iso);
  if (Number.isNaN(t) || t < Date.now() + booking.minNoticeHours * 3600_000) return false;
  const normalized = new Date(t).toISOString();
  const dateMY = new Date(t + 8 * 3600_000).toISOString().slice(0, 10);
  return upcomingDates().includes(dateMY) && slotsForDate(dateMY).includes(normalized);
}
