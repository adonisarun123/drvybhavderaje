"use client";

import { useEffect, useId, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Practice timezone; every date in this component is a local (IST) calendar date, never the browser's. */
const CLINIC_TZ = "Asia/Kolkata";
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

type MonthState = { kind: "loading" } | { kind: "ready"; dates: Set<string> } | { kind: "error" };

interface Props {
  clinic: string;
  /** Inclusive local-date bounds the server will accept (today … today + horizon). */
  dateMin: string;
  dateMax: string;
  value: string;
  onChange: (date: string) => void;
  disabled?: boolean;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}
function ym(year: number, month: number) {
  return `${year}-${pad(month)}`;
}
function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate(); // month is 1-based; day 0 of next month
}
function firstWeekday(year: number, month: number) {
  return new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
}
function parseYm(iso: string): [number, number] {
  return [Number(iso.slice(0, 4)), Number(iso.slice(5, 7))];
}
function fmtLong(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("en-IN", { timeZone: CLINIC_TZ, weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(Date.UTC(y!, m! - 1, d!, 12)));
}

/**
 * Month calendar that only offers dates the clinic has published availability for.
 * Available dates come from /api/availability/dates (one request per month, kept for the life of the clinic selection);
 * everything else is rendered but disabled, so a visitor cannot pick a day the backend would reject.
 */
export function AvailabilityCalendar({ clinic, dateMin, dateMax, value, onChange, disabled }: Props) {
  const [minY, minM] = parseYm(dateMin);
  const [maxY, maxM] = parseYm(dateMax);
  const [view, setView] = useState<[number, number]>(value ? parseYm(value) : [minY, minM]);
  const [months, setMonths] = useState<Record<string, MonthState>>({});
  const id = useId();
  const [year, month] = view;
  const key = `${clinic}|${ym(year, month)}`;
  const state = months[key] ?? { kind: "loading" };

  // The parent remounts this component (key={clinic}) when the clinic changes, which resets the view and cache.
  useEffect(() => {
    if (months[key]) return;
    let cancelled = false;
    fetch(`/api/availability/dates?clinic=${encodeURIComponent(clinic)}&month=${ym(year, month)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: { enabled: boolean; dates: string[] }) => {
        if (cancelled) return;
        const dates = new Set(data.enabled ? data.dates : []);
        setMonths((m) => ({ ...m, [key]: { kind: "ready", dates } }));
      })
      .catch(() => !cancelled && setMonths((m) => ({ ...m, [key]: { kind: "error" } })));
    return () => {
      cancelled = true;
    };
  }, [clinic, key, year, month, months]);

  const canPrev = ym(year, month) > ym(minY, minM);
  const canNext = ym(year, month) < ym(maxY, maxM);
  const total = daysInMonth(year, month);
  const lead = firstWeekday(year, month);
  const cells: (string | null)[] = [...Array<null>(lead).fill(null), ...Array.from({ length: total }, (_, i) => `${ym(year, month)}-${pad(i + 1)}`)];
  while (cells.length % 7) cells.push(null);
  const available = state.kind === "ready" ? state.dates : new Set<string>();
  const noneThisMonth = state.kind === "ready" && available.size === 0;

  return (
    <div className="avail-cal" role="group" aria-labelledby={`${id}-title`}>
      <div className="avail-cal-head">
        <button type="button" className="avail-cal-nav" onClick={() => setView(month === 1 ? [year - 1, 12] : [year, month - 1])} disabled={disabled || !canPrev} aria-label="Previous month">
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <strong id={`${id}-title`} aria-live="polite">
          {MONTHS[month - 1]} {year}
        </strong>
        <button type="button" className="avail-cal-nav" onClick={() => setView(month === 12 ? [year + 1, 1] : [year, month + 1])} disabled={disabled || !canNext} aria-label="Next month">
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>
      <div className="avail-cal-grid" role="grid" aria-busy={state.kind === "loading"}>
        {WEEKDAYS.map((w) => (
          <span key={w} className="avail-cal-dow" role="columnheader" aria-label={w}>
            {w}
          </span>
        ))}
        {cells.map((iso, i) =>
          iso ? (
            <button
              key={iso}
              type="button"
              role="gridcell"
              className={`avail-cal-day${available.has(iso) ? " is-available" : ""}${value === iso ? " is-selected" : ""}`}
              disabled={disabled || state.kind !== "ready" || !available.has(iso)}
              aria-selected={value === iso}
              aria-label={`${fmtLong(iso)}${available.has(iso) ? ", times available" : ", no published times"}`}
              onClick={() => onChange(iso)}
            >
              {Number(iso.slice(8, 10))}
            </button>
          ) : (
            <span key={`pad-${i}`} role="gridcell" aria-hidden="true" />
          ),
        )}
      </div>
      <p className="note avail-cal-status" role="status">
        {state.kind === "loading" && "Checking published availability…"}
        {state.kind === "error" && "We couldn’t load availability for this month. You can still send the request without a time."}
        {noneThisMonth && (canNext ? "No published times this month — try the next month, or send the request and the clinic will suggest a time." : "No published times in this month. Send the request and the clinic will suggest a time.")}
        {state.kind === "ready" && available.size > 0 && (value ? `Selected: ${fmtLong(value)} (clinic time, IST)` : "Dates in bold have times available. Pick one to see the times (IST).")}
      </p>
    </div>
  );
}
