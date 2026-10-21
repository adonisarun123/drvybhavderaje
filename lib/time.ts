import { DateTime, Interval } from "luxon";

/** Practice default timezone. Never derive the clinic schedule from the browser. */
export const PRACTICE_TZ = "Asia/Kolkata";
export const TZ_LABEL = "IST";

export type Instant = Date;

export function nowUtc(): Date {
  return new Date();
}

/** Parse a local date (YYYY-MM-DD) + time (HH:mm[:ss]) in a zone into a UTC Date. */
export function localToUtc(dateIso: string, time: string, zone: string = PRACTICE_TZ): Date {
  const dt = DateTime.fromISO(`${dateIso}T${normaliseTime(time)}`, { zone });
  if (!dt.isValid) throw new Error(`Invalid local datetime ${dateIso} ${time} (${zone}): ${dt.invalidExplanation}`);
  return dt.toUTC().toJSDate();
}

/** Start of a local day (00:00 in zone) as UTC Date. */
export function startOfLocalDay(dateIso: string, zone: string = PRACTICE_TZ): Date {
  const dt = DateTime.fromISO(dateIso, { zone }).startOf("day");
  if (!dt.isValid) throw new Error(`Invalid date ${dateIso}`);
  return dt.toUTC().toJSDate();
}

/** Exclusive end of a local day (00:00 next day) as UTC Date. */
export function endOfLocalDay(dateIso: string, zone: string = PRACTICE_TZ): Date {
  const dt = DateTime.fromISO(dateIso, { zone }).startOf("day").plus({ days: 1 });
  return dt.toUTC().toJSDate();
}

/** Local ISO date (YYYY-MM-DD) of an instant in a zone. */
export function localDate(instant: Date, zone: string = PRACTICE_TZ): string {
  return DateTime.fromJSDate(instant, { zone }).toISODate() ?? "";
}

/** 0 = Sunday … 6 = Saturday for a local ISO date. */
export function weekdayOf(dateIso: string, zone: string = PRACTICE_TZ): number {
  const dt = DateTime.fromISO(dateIso, { zone });
  return dt.weekday % 7; // luxon: 1 = Monday … 7 = Sunday
}

export function addDays(dateIso: string, days: number): string {
  return DateTime.fromISO(dateIso).plus({ days }).toISODate() ?? dateIso;
}

export function* eachLocalDate(fromIso: string, toIsoInclusive: string): Generator<string> {
  let cur = DateTime.fromISO(fromIso);
  const end = DateTime.fromISO(toIsoInclusive);
  while (cur <= end) {
    yield cur.toISODate() ?? "";
    cur = cur.plus({ days: 1 });
  }
}

export function normaliseTime(t: string): string {
  // Accept "9:00", "09:00", "09:00:00"
  const parts = t.split(":").map((p) => p.padStart(2, "0"));
  const [h = "00", m = "00", s = "00"] = parts;
  return `${h}:${m}:${s}`;
}

export function timeToMinutes(t: string): number {
  const [h = "0", m = "0"] = t.split(":");
  return Number(h) * 60 + Number(m);
}

/* ---------- Display helpers (always labelled IST) ---------- */

export function fmtDateTime(instant: Date | string | null | undefined, zone: string = PRACTICE_TZ): string {
  if (!instant) return "—";
  const dt = DateTime.fromJSDate(new Date(instant), { zone });
  return `${dt.toFormat("ccc d LLL yyyy, h:mm a")} ${TZ_LABEL}`;
}

export function fmtDate(instant: Date | string | null | undefined, zone: string = PRACTICE_TZ): string {
  if (!instant) return "—";
  return DateTime.fromJSDate(new Date(instant), { zone }).toFormat("ccc d LLL yyyy");
}

export function fmtTime(instant: Date | string | null | undefined, zone: string = PRACTICE_TZ): string {
  if (!instant) return "—";
  return `${DateTime.fromJSDate(new Date(instant), { zone }).toFormat("h:mm a")}`;
}

export function fmtTimeRange(start: Date | string, end: Date | string, zone: string = PRACTICE_TZ): string {
  const s = DateTime.fromJSDate(new Date(start), { zone });
  const e = DateTime.fromJSDate(new Date(end), { zone });
  return `${s.toFormat("h:mm a")} – ${e.toFormat("h:mm a")} ${TZ_LABEL}`;
}

export function fmtLocalTime(t: string): string {
  const dt = DateTime.fromISO(`2000-01-01T${normaliseTime(t)}`);
  return dt.toFormat("h:mm a");
}

/** Value for <input type="datetime-local"> expressed in the practice zone. */
export function toLocalInputValue(instant: Date | string | null | undefined, zone: string = PRACTICE_TZ): string {
  if (!instant) return "";
  return DateTime.fromJSDate(new Date(instant), { zone }).toFormat("yyyy-LL-dd'T'HH:mm");
}

/** Parse a datetime-local string (yyyy-LL-ddTHH:mm) as practice-zone local time. */
export function fromLocalInputValue(value: string, zone: string = PRACTICE_TZ): Date {
  const dt = DateTime.fromISO(value, { zone });
  if (!dt.isValid) throw new Error(`Invalid datetime ${value}`);
  return dt.toUTC().toJSDate();
}

export function relativeFromNow(instant: Date | string | null | undefined): string {
  if (!instant) return "";
  return DateTime.fromJSDate(new Date(instant)).toRelative() ?? "";
}

export const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

export function intervalsOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function toInterval(start: Date, end: Date): Interval {
  return Interval.fromDateTimes(DateTime.fromJSDate(start), DateTime.fromJSDate(end));
}
