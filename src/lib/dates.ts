// Calendar helpers. Calendar dates are local `YYYY-MM-DD` strings and times are `HH:mm`.
// Never use `toISOString()` for a calendar date: it converts to UTC, and in Brazil (UTC-3)
// that turns 21:00 on the 23rd into the 24th.

export type ISODate = string; // YYYY-MM-DD
export type YearMonth = string; // YYYY-MM
export type WeekStart = 'mon' | 'sun';

const pad = (n: number, width = 2) => String(n).padStart(width, '0');

/** Local calendar date of a Date object. */
export function toISODate(d: Date): ISODate {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayISO(now: Date = new Date()): ISODate {
  return toISODate(now);
}

/** Local time `HH:mm` of a Date object. */
export function toHHmm(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Parses `YYYY-MM-DD` as local noon, which is safe against DST edges. */
export function fromISODate(iso: ISODate): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

export function isISODate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = fromISODate(s);
  return toISODate(d) === s;
}

export function addDays(iso: ISODate, days: number): ISODate {
  const d = fromISODate(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function monthOf(iso: ISODate): YearMonth {
  return iso.slice(0, 7);
}

export function addMonths(ym: YearMonth, months: number): YearMonth {
  const [y, m] = ym.split('-').map(Number);
  const total = y * 12 + (m - 1) + months;
  return `${Math.floor(total / 12)}-${pad((total % 12) + 1)}`;
}

export function daysInMonth(ym: YearMonth): number {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m, 0).getDate();
}

/** 0 = Sunday … 6 = Saturday. */
export function weekday(iso: ISODate): number {
  return fromISODate(iso).getDay();
}

export function startOfWeek(iso: ISODate, weekStart: WeekStart = 'mon'): ISODate {
  const wd = weekday(iso);
  const offset = weekStart === 'mon' ? (wd + 6) % 7 : wd;
  return addDays(iso, -offset);
}

/** The 7 dates of the week containing `iso`, in display order. */
export function weekDates(iso: ISODate, weekStart: WeekStart = 'mon'): ISODate[] {
  const first = startOfWeek(iso, weekStart);
  return Array.from({ length: 7 }, (_, i) => addDays(first, i));
}

/** Whole days from `from` to `to` (positive when `to` is later). */
export function diffDays(from: ISODate, to: ISODate): number {
  return Math.round((fromISODate(to).getTime() - fromISODate(from).getTime()) / 86_400_000);
}

/** Timestamps (createdAt/updatedAt) are full ISO strings in UTC; that's fine for ordering. */
export function nowTimestamp(now: Date = new Date()): string {
  return now.toISOString();
}

// ---- Display (pt-BR) ----

const WEEKDAYS_SHORT = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const WEEKDAYS_LONG = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const MONTHS_LONG = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

/** 23/11/2026 */
export function formatDateBR(iso: ISODate): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

/** 23/11 */
export function formatDayMonthBR(iso: ISODate): string {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

export function weekdayShortBR(iso: ISODate): string {
  return WEEKDAYS_SHORT[weekday(iso)];
}

export function weekdayLongBR(iso: ISODate): string {
  return WEEKDAYS_LONG[weekday(iso)];
}

/** novembro de 2026 */
export function formatMonthBR(ym: YearMonth): string {
  const [y, m] = ym.split('-').map(Number);
  return `${MONTHS_LONG[m - 1]} de ${y}`;
}

/** segunda, 23 de novembro */
export function formatLongDateBR(iso: ISODate): string {
  const d = fromISODate(iso);
  return `${WEEKDAYS_LONG[d.getDay()]}, ${d.getDate()} de ${MONTHS_LONG[d.getMonth()]}`;
}

/** 14:30 → 14h30, 14:00 → 14h */
export function formatTimeBR(hhmm: string): string {
  const [h, m] = hhmm.split(':');
  return m === '00' ? `${Number(h)}h` : `${Number(h)}h${m}`;
}
