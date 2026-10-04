import { toEdition } from '@/lib/utils';

export interface EditionWindow {
  value: string;
  label: string;
  start: string | null;
  end: string | null;
}

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

const iso = (d: Date) => d.toISOString().slice(0, 10);

function shiftDays(isoDate: string, days: number): string {
  const d = new Date(isoDate + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return iso(d);
}

// "October 12-13, 2023" / "October 7–8, 2026" / "October 17, 2019" -> padded by a day on each side
// to cover practice rounds and travel.
function parseDateRange(text: string | null | undefined): { start: string; end: string } | null {
  if (!text) return null;
  const m = text.match(/([A-Za-z]+)\s+(\d{1,2})(?:\s*[–-]\s*(\d{1,2}))?,\s*(\d{4})/);
  if (!m) return null;
  const month = MONTHS.indexOf(m[1].toLowerCase());
  if (month < 0) return null;
  const year = Number(m[4]);
  const mk = (day: number) => iso(new Date(Date.UTC(year, month, day)));
  const start = mk(Number(m[2]));
  const end = mk(Number(m[3] ?? m[2]));
  return { start: shiftDays(start, -1), end: shiftDays(end, 1) };
}

interface EventLike {
  year: string;
  edition?: number;
  displayYear?: string;
  date?: string | null;
}

export function getEditionWindows(events: EventLike[]): EditionWindow[] {
  return events.map((e) => {
    const range = parseDateRange(e.date);
    return {
      value: e.year,
      label: e.edition ? `${toEdition(e.edition)} — ${e.displayYear}` : String(e.displayYear ?? e.year),
      start: range?.start ?? null,
      end: range?.end ?? null,
    };
  });
}
