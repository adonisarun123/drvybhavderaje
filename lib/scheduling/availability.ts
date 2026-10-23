/**
 * Pure availability computation. No database access — callers load the rules and
 * occupancy for a window and pass them in, which keeps this logic unit-testable and
 * lets the booking engine run exactly the same checks inside a locked transaction.
 *
 * Rule precedence (documented in docs/SCHEDULING.md):
 *  1. Weekly sessions and date-specific overrides establish *potential* availability.
 *     A `replace` override discards the weekly sessions for that date.
 *  2. Breaks (recurring blocks), explicit blocks, active holds, occupying appointments
 *     and their buffers remove availability.
 *  3. Unavailable periods always win over additional hours.
 */
import { DateTime } from "luxon";
import {
  eachLocalDate,
  intervalsOverlap,
  localDate,
  localToUtc,
  weekdayOf,
} from "../time";

export interface SessionRule {
  clinicId: string;
  weekday: number; // 0..6
  startTime: string; // HH:mm[:ss]
  endTime: string;
  timezone: string;
  effectiveFrom?: string | null; // YYYY-MM-DD
  effectiveTo?: string | null;
  active?: boolean;
}

export interface OverrideRule {
  clinicId: string;
  date: string; // YYYY-MM-DD local
  startTime: string;
  endTime: string;
  timezone: string;
  mode: "add" | "replace" | string;
}

export interface RecurringBlockRule {
  id: string;
  weekdays: number[];
  startTime: string;
  endTime: string;
  timezone: string;
  startsOn?: string | null;
  endsOn?: string | null;
  reason: string;
  kind: string;
  active?: boolean;
}

export interface ConcreteBlock {
  id: string;
  startAt: Date;
  endAt: Date;
  reason: string;
  kind: string;
  allDay?: boolean;
}

export interface OccupiedSlot {
  id: string; // appointment or hold id
  kind: "appointment" | "hold";
  clinicId: string | null;
  startAt: Date;
  endAt: Date;
  expiresAt?: Date | null; // holds
  label?: string;
}

export interface SchedulingPolicy {
  defaultDurationMin: number;
  slotStepMin: number;
  bufferMin: number;
  travelBufferMin: number;
  minNoticeHours: number;
  maxHorizonDays: number;
  timezone: string;
}

export interface SessionWindow {
  clinicId: string;
  start: Date;
  end: Date;
  source: "weekly" | "override";
}

export interface UnavailableWindow {
  start: Date;
  end: Date;
  kind: "block" | "recurring" | "appointment" | "hold" | "buffer";
  refId: string;
  clinicId?: string | null;
  label?: string;
}

export interface Conflict {
  kind: "block" | "recurring_block" | "appointment" | "hold" | "travel_buffer" | "buffer";
  refId: string;
  start: Date;
  end: Date;
  label: string;
}

/** Potential session windows for each local date in [fromDate, toDate]. */
export function sessionWindows(
  fromDate: string,
  toDate: string,
  weekly: SessionRule[],
  overrides: OverrideRule[],
  zone: string,
): SessionWindow[] {
  const out: SessionWindow[] = [];
  for (const d of eachLocalDate(fromDate, toDate)) {
    const dayOverrides = overrides.filter((o) => o.date === d);
    const replace = dayOverrides.some((o) => o.mode === "replace");
    if (!replace) {
      const wd = weekdayOf(d, zone);
      for (const s of weekly) {
        if (s.active === false) continue;
        if (s.weekday !== wd) continue;
        if (s.effectiveFrom && d < s.effectiveFrom) continue;
        if (s.effectiveTo && d > s.effectiveTo) continue;
        out.push({
          clinicId: s.clinicId,
          start: localToUtc(d, s.startTime, s.timezone),
          end: localToUtc(d, s.endTime, s.timezone),
          source: "weekly",
        });
      }
    }
    for (const o of dayOverrides) {
      out.push({
        clinicId: o.clinicId,
        start: localToUtc(d, o.startTime, o.timezone),
        end: localToUtc(d, o.endTime, o.timezone),
        source: "override",
      });
    }
  }
  return out.sort((a, b) => a.start.getTime() - b.start.getTime());
}

/** Expand recurring blocks into concrete windows overlapping [from, to). */
export function expandRecurringBlocks(
  rules: RecurringBlockRule[],
  from: Date,
  to: Date,
  zone: string,
): UnavailableWindow[] {
  const out: UnavailableWindow[] = [];
  // Expand one day either side to catch windows that cross midnight boundaries.
  const fromDate = localDate(new Date(from.getTime() - 86_400_000), zone);
  const toDate = localDate(new Date(to.getTime() + 86_400_000), zone);
  for (const d of eachLocalDate(fromDate, toDate)) {
    for (const r of rules) {
      if (r.active === false) continue;
      if (!r.weekdays.includes(weekdayOf(d, r.timezone))) continue;
      if (r.startsOn && d < r.startsOn) continue;
      if (r.endsOn && d > r.endsOn) continue;
      const s = localToUtc(d, r.startTime, r.timezone);
      const e = localToUtc(d, r.endTime, r.timezone);
      if (intervalsOverlap(s, e, from, to)) {
        out.push({ start: s, end: e, kind: "recurring", refId: r.id, label: r.reason });
      }
    }
  }
  return out;
}

/**
 * All conflicts for a proposed span, applying buffers. `exclude` removes the
 * appointment/hold being modified from consideration.
 */
export function findConflicts(
  proposed: { clinicId: string; start: Date; end: Date },
  data: {
    blocks: ConcreteBlock[];
    recurring: RecurringBlockRule[];
    occupied: OccupiedSlot[];
    policy: SchedulingPolicy;
    now: Date;
  },
  exclude: { appointmentId?: string | null; holdId?: string | null } = {},
): Conflict[] {
  const conflicts: Conflict[] = [];
  const { start, end } = proposed;
  if (!(end > start)) throw new Error("Proposed end must be after start");

  for (const b of data.blocks) {
    if (intervalsOverlap(start, end, b.startAt, b.endAt)) {
      conflicts.push({ kind: "block", refId: b.id, start: b.startAt, end: b.endAt, label: b.reason });
    }
  }
  const maxGap = Math.max(data.policy.bufferMin, data.policy.travelBufferMin) * 60_000;
  for (const r of expandRecurringBlocks(data.recurring, new Date(start.getTime() - maxGap), new Date(end.getTime() + maxGap), data.policy.timezone)) {
    if (intervalsOverlap(start, end, r.start, r.end)) {
      conflicts.push({ kind: "recurring_block", refId: r.refId, start: r.start, end: r.end, label: r.label ?? "Recurring block" });
    }
  }
  for (const o of data.occupied) {
    if (o.kind === "appointment" && exclude.appointmentId && o.id === exclude.appointmentId) continue;
    if (o.kind === "hold" && exclude.holdId && o.id === exclude.holdId) continue;
    if (o.kind === "hold" && o.expiresAt && o.expiresAt <= data.now) continue; // expired holds never block
    const sameClinic = o.clinicId === proposed.clinicId;
    const gapMin = sameClinic ? data.policy.bufferMin : data.policy.travelBufferMin;
    const gap = gapMin * 60_000;
    const direct = intervalsOverlap(start, end, o.startAt, o.endAt);
    const withGap = intervalsOverlap(new Date(start.getTime() - gap), new Date(end.getTime() + gap), o.startAt, o.endAt);
    if (direct) {
      conflicts.push({ kind: o.kind, refId: o.id, start: o.startAt, end: o.endAt, label: o.label ?? o.kind });
    } else if (withGap) {
      conflicts.push({
        kind: sameClinic ? "buffer" : "travel_buffer",
        refId: o.id,
        start: o.startAt,
        end: o.endAt,
        label: sameClinic
          ? `${gapMin} min buffer around ${o.label ?? o.kind}`
          : `${gapMin} min travel buffer (different clinic) around ${o.label ?? o.kind}`,
      });
    }
  }
  return conflicts;
}

/** True if the span sits fully inside a session window for that clinic. */
export function isWithinSessions(
  proposed: { clinicId: string; start: Date; end: Date },
  windows: SessionWindow[],
): boolean {
  return windows.some(
    (w) => w.clinicId === proposed.clinicId && w.start <= proposed.start && proposed.end <= w.end,
  );
}

/** Subtract unavailable windows from a window, returning free sub-windows. */
export function subtract(window: { start: Date; end: Date }, unavailable: { start: Date; end: Date }[]): { start: Date; end: Date }[] {
  let free: { start: Date; end: Date }[] = [{ start: window.start, end: window.end }];
  for (const u of unavailable) {
    const next: { start: Date; end: Date }[] = [];
    for (const f of free) {
      if (!intervalsOverlap(f.start, f.end, u.start, u.end)) {
        next.push(f);
        continue;
      }
      if (u.start > f.start) next.push({ start: f.start, end: u.start });
      if (u.end < f.end) next.push({ start: u.end, end: f.end });
    }
    free = next;
  }
  return free;
}

export interface Slot {
  clinicId: string;
  start: Date;
  end: Date;
}

/** Distinct local dates (YYYY-MM-DD in `zone`) that have at least one slot, ascending. */
export function slotDates(slots: Pick<Slot, "start">[], zone: string): string[] {
  const seen = new Set<string>();
  for (const s of slots) seen.add(DateTime.fromJSDate(s.start, { zone }).toISODate() ?? "");
  seen.delete("");
  return [...seen].sort();
}

/** Bookable slot start times for a window of dates, given full rule + occupancy data. */
export function computeSlots(
  args: {
    fromDate: string;
    toDate: string;
    weekly: SessionRule[];
    overrides: OverrideRule[];
    recurring: RecurringBlockRule[];
    blocks: ConcreteBlock[];
    occupied: OccupiedSlot[];
    policy: SchedulingPolicy;
    now: Date;
    clinicId?: string | null;
    durationMin?: number;
  },
): Slot[] {
  const zone = args.policy.timezone;
  const duration = (args.durationMin ?? args.policy.defaultDurationMin) * 60_000;
  const step = Math.max(5, args.policy.slotStepMin) * 60_000;
  const earliest = new Date(args.now.getTime() + args.policy.minNoticeHours * 3_600_000);
  const horizonEnd = DateTime.fromJSDate(args.now, { zone }).plus({ days: args.policy.maxHorizonDays }).endOf("day").toJSDate();

  const windows = sessionWindows(args.fromDate, args.toDate, args.weekly, args.overrides, zone).filter(
    (w) => !args.clinicId || w.clinicId === args.clinicId,
  );
  const slots: Slot[] = [];
  for (const w of windows) {
    const unavailable = unavailableWithin(w, args);
    for (const free of subtract(w, unavailable)) {
      for (let t = alignUp(free.start.getTime(), step, w.start.getTime()); t + duration <= free.end.getTime(); t += step) {
        const s = new Date(t);
        const e = new Date(t + duration);
        if (s < earliest || e > horizonEnd) continue;
        // Re-validate with buffers (subtract() only removed direct overlaps).
        if (findConflicts({ clinicId: w.clinicId, start: s, end: e }, { ...args, blocks: args.blocks, recurring: args.recurring }).length) continue;
        slots.push({ clinicId: w.clinicId, start: s, end: e });
      }
    }
  }
  return slots.sort((a, b) => a.start.getTime() - b.start.getTime());
}

function alignUp(t: number, step: number, origin: number): number {
  const offset = (t - origin) % step;
  return offset === 0 ? t : t + (step - offset);
}

function unavailableWithin(
  w: SessionWindow,
  args: { recurring: RecurringBlockRule[]; blocks: ConcreteBlock[]; occupied: OccupiedSlot[]; policy: SchedulingPolicy; now: Date },
): { start: Date; end: Date }[] {
  const zone = args.policy.timezone;
  const out: { start: Date; end: Date }[] = [];
  for (const b of args.blocks) if (intervalsOverlap(w.start, w.end, b.startAt, b.endAt)) out.push({ start: b.startAt, end: b.endAt });
  for (const r of expandRecurringBlocks(args.recurring, w.start, w.end, zone)) out.push({ start: r.start, end: r.end });
  for (const o of args.occupied) {
    if (o.kind === "hold" && o.expiresAt && o.expiresAt <= args.now) continue;
    if (intervalsOverlap(w.start, w.end, o.startAt, o.endAt)) out.push({ start: o.startAt, end: o.endAt });
  }
  return out;
}

/** Public-facing "unavailable" windows for a day — no private reasons exposed. */
export function publicUnavailable(windows: UnavailableWindow[]): { start: Date; end: Date }[] {
  return windows.map((w) => ({ start: w.start, end: w.end }));
}
