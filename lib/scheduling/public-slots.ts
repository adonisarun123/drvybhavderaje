import "server-only";
import { db } from "../db/client";
import { getPrimaryDoctor } from "../clinics";
import { loadPolicy, loadWindow } from "./engine";
import { computeSlots } from "./availability";
import { endOfLocalDay, startOfLocalDay, localDate } from "../time";
import { DateTime } from "luxon";

export interface PublicSlotsResult {
  enabled: boolean;
  date: string;
  slots: { start: string; end: string }[];
  reason?: string;
}

/** Public, privacy-safe slot listing: only start/end instants, never reasons for unavailability. */
export async function publicSlotsForDate(clinicId: string, dateIso: string, now = new Date()): Promise<PublicSlotsResult> {
  const doctor = await getPrimaryDoctor();
  if (!doctor) return { enabled: false, date: dateIso, slots: [], reason: "not_configured" };
  return db.transaction(async (tx) => {
    const policy = await loadPolicy(tx, doctor.id);
    if (!policy.publicSlotsEnabled) return { enabled: false, date: dateIso, slots: [], reason: "disabled" };
    const from = startOfLocalDay(dateIso, policy.timezone);
    const to = endOfLocalDay(dateIso, policy.timezone);
    const data = await loadWindow(tx, doctor.id, from, to);
    if (!data.weekly.length && !data.overrides.length) return { enabled: false, date: dateIso, slots: [], reason: "no_hours" };
    const slots = computeSlots({ fromDate: dateIso, toDate: dateIso, ...data, now, clinicId });
    return { enabled: true, date: dateIso, slots: slots.map((s) => ({ start: s.start.toISOString(), end: s.end.toISOString() })) };
  });
}

export async function publicSlotsEnabled(): Promise<boolean> {
  try {
    const doctor = await getPrimaryDoctor();
    if (!doctor) return false;
    return db.transaction(async (tx) => {
      const policy = await loadPolicy(tx, doctor.id);
      if (!policy.publicSlotsEnabled) return false;
      const now = new Date();
      const to = DateTime.fromJSDate(now).plus({ days: policy.maxHorizonDays }).toJSDate();
      const data = await loadWindow(tx, doctor.id, now, to);
      return data.weekly.length > 0 || data.overrides.length > 0;
    });
  } catch {
    return false;
  }
}

export function publicDateBounds(maxHorizonDays: number, zone: string, now = new Date()) {
  return { min: localDate(now, zone), max: DateTime.fromJSDate(now, { zone }).plus({ days: maxHorizonDays }).toISODate() ?? "" };
}
