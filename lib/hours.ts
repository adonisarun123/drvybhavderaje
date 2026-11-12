/**
 * Clinic consultation hours for display on the public site and in structured data.
 * Pure helpers (no database access) so they can be used from server components, llms.txt and tests.
 * Weekday numbering matches `weekly_sessions.weekday`: 0 = Sunday … 6 = Saturday.
 */

export interface ClinicHours {
  /** Weekdays (0 = Sunday … 6 = Saturday) sharing the same session, ascending. */
  days: number[];
  /** Local start time, "HH:MM". */
  start: string;
  /** Local end time, "HH:MM". */
  end: string;
}

const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const DAY_SCHEMA = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

const hhmm = (t: string) => t.split(":").slice(0, 2).map((p) => p.padStart(2, "0")).join(":");

/** Collapse one-row-per-weekday sessions into groups of weekdays that share the same start and end. */
export function groupSessions(rows: { weekday: number; startTime: string; endTime: string }[]): ClinicHours[] {
  const byTime = new Map<string, Set<number>>();
  for (const r of rows) {
    const key = `${hhmm(r.startTime)}|${hhmm(r.endTime)}`;
    if (!byTime.has(key)) byTime.set(key, new Set());
    byTime.get(key)!.add(r.weekday);
  }
  // Week reads Monday first; Sunday (0) sorts last.
  const order = (d: number) => (d + 6) % 7;
  return [...byTime.entries()]
    .map(([key, set]) => {
      const [start = "", end = ""] = key.split("|");
      return { days: [...set].sort((a, b) => order(a) - order(b)), start, end };
    })
    .sort((a, b) => order(a.days[0]!) - order(b.days[0]!) || a.start.localeCompare(b.start));
}

/** "Mon–Sat", "Mon & Fri", "Tue–Thu & Sat". Runs of three or more consecutive days become a range. */
export function formatDays(days: number[]): string {
  const order = (d: number) => (d + 6) % 7;
  const sorted = [...new Set(days)].sort((a, b) => order(a) - order(b));
  const parts: string[] = [];
  for (let i = 0; i < sorted.length; ) {
    let j = i;
    while (j + 1 < sorted.length && order(sorted[j + 1]!) === order(sorted[j]!) + 1) j++;
    if (j - i >= 2) parts.push(`${DAY_SHORT[sorted[i]!]}–${DAY_SHORT[sorted[j]!]}`);
    else for (let k = i; k <= j; k++) parts.push(DAY_SHORT[sorted[k]!]!);
    i = j + 1;
  }
  if (parts.length <= 1) return parts.join("");
  return `${parts.slice(0, -1).join(", ")} & ${parts[parts.length - 1]}`;
}

/** "11:00 AM", "1:00 PM". */
export function formatClock(t: string): string {
  const [h = "0", m = "00"] = hhmm(t).split(":");
  const hour = Number(h);
  return `${hour % 12 === 0 ? 12 : hour % 12}:${m} ${hour < 12 ? "AM" : "PM"}`;
}

/** "Mon–Sat, 11:00 AM – 1:00 PM". */
export function formatHours(h: ClinicHours): string {
  return `${formatDays(h.days)}, ${formatClock(h.start)} – ${formatClock(h.end)}`;
}

/** schema.org OpeningHoursSpecification nodes for a clinic. */
export function openingHoursSpecification(hours: ClinicHours[]) {
  return hours.map((h) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: h.days.map((d) => `https://schema.org/${DAY_SCHEMA[d]}`),
    opens: hhmm(h.start),
    closes: hhmm(h.end),
  }));
}
