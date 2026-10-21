"use server";

import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { actorOf, requirePermission } from "@/lib/auth/guard";
import { db } from "@/lib/db/client";
import { dateOverrides, schedulingSettings, weeklySessions } from "@/lib/db/schema";
import { createBlock, createRecurringBlock, deleteBlock, futureAppointmentsOutsideHours, updateBlock, updateRecurringBlock } from "@/lib/scheduling/engine";
import { recordAudit, diff } from "@/lib/audit";
import { fromLocalInputValue, normaliseTime, PRACTICE_TZ, startOfLocalDay, endOfLocalDay } from "@/lib/time";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { formToObject, parseOrThrow, run } from "./util";

const time = z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Use HH:MM");
const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");

const settingsSchema = z.object({
  doctorId: z.string().uuid(),
  defaultDurationMin: z.coerce.number().int().min(5).max(480),
  slotStepMin: z.coerce.number().int().min(5).max(240),
  bufferMin: z.coerce.number().int().min(0).max(240),
  travelBufferMin: z.coerce.number().int().min(0).max(480),
  minNoticeHours: z.coerce.number().int().min(0).max(720),
  maxHorizonDays: z.coerce.number().int().min(1).max(365),
  holdMinutes: z.coerce.number().int().min(5).max(1440),
  publicSlotsEnabled: z.string().optional(),
});

export async function updateSettingsAction(formData: FormData) {
  return run(async () => {
    const user = await requirePermission("availability:manage");
    const input = parseOrThrow(settingsSchema, formToObject(formData));
    const [before] = await db.select().from(schedulingSettings).where(eq(schedulingSettings.doctorId, input.doctorId));
    const values = { ...input, publicSlotsEnabled: input.publicSlotsEnabled === "on", updatedAt: new Date(), updatedBy: user.id };
    await db.insert(schedulingSettings).values(values).onConflictDoUpdate({ target: schedulingSettings.doctorId, set: values });
    await recordAudit(db, { actor: actorOf(user), action: "settings.update", entityType: "scheduling_settings", entityId: input.doctorId, summary: "Updated scheduling settings", changes: before ? diff(before as unknown as Record<string, unknown>, values) : values });
    const outside = await futureAppointmentsOutsideHours(input.doctorId);
    return { outsideHours: outside.map((a) => ({ ...a, startAt: a.startAt.toISOString(), endAt: a.endAt.toISOString() })) };
  });
}

const weeklySchema = z.object({
  doctorId: z.string().uuid(),
  clinicId: z.string().uuid("Choose a clinic"),
  weekday: z.coerce.number().int().min(0).max(6),
  startTime: time,
  endTime: time,
  effectiveFrom: z.union([z.literal(""), dateStr]).optional(),
  effectiveTo: z.union([z.literal(""), dateStr]).optional(),
});

export async function addWeeklySessionAction(formData: FormData) {
  return run(async () => {
    const user = await requirePermission("availability:manage");
    const input = parseOrThrow(weeklySchema, formToObject(formData));
    if (normaliseTime(input.endTime) <= normaliseTime(input.startTime)) throw new ValidationError("End time must be after start time.", { endTime: ["Must be after start"] });
    const [row] = await db
      .insert(weeklySessions)
      .values({ doctorId: input.doctorId, clinicId: input.clinicId, weekday: input.weekday, startTime: normaliseTime(input.startTime), endTime: normaliseTime(input.endTime), timezone: PRACTICE_TZ, effectiveFrom: input.effectiveFrom || null, effectiveTo: input.effectiveTo || null, createdBy: user.id })
      .returning();
    await recordAudit(db, { actor: actorOf(user), action: "weekly_session.create", entityType: "weekly_session", entityId: row!.id, summary: `Added weekly session (weekday ${input.weekday}, ${input.startTime}–${input.endTime})`, changes: { ...input } });
    const outside = await futureAppointmentsOutsideHours(input.doctorId);
    return { id: row!.id, outsideHours: outside.map((a) => ({ ...a, startAt: a.startAt.toISOString(), endAt: a.endAt.toISOString() })) };
  });
}

export async function removeWeeklySessionAction(id: string) {
  return run(async () => {
    const user = await requirePermission("availability:manage");
    const [row] = await db.update(weeklySessions).set({ active: false, updatedAt: new Date() }).where(eq(weeklySessions.id, id)).returning();
    if (!row) throw new NotFoundError("Session not found");
    await recordAudit(db, { actor: actorOf(user), action: "weekly_session.remove", entityType: "weekly_session", entityId: id, summary: `Removed weekly session (weekday ${row.weekday}, ${row.startTime}–${row.endTime}). Existing bookings were not changed.` });
    const outside = await futureAppointmentsOutsideHours(row.doctorId);
    return { outsideHours: outside.map((a) => ({ ...a, startAt: a.startAt.toISOString(), endAt: a.endAt.toISOString() })) };
  });
}

const overrideSchema = z.object({
  doctorId: z.string().uuid(),
  clinicId: z.string().uuid("Choose a clinic"),
  date: dateStr,
  startTime: time,
  endTime: time,
  mode: z.enum(["add", "replace"]),
  note: z.string().trim().max(200).optional(),
});

export async function addOverrideAction(formData: FormData) {
  return run(async () => {
    const user = await requirePermission("availability:manage");
    const input = parseOrThrow(overrideSchema, formToObject(formData));
    if (normaliseTime(input.endTime) <= normaliseTime(input.startTime)) throw new ValidationError("End time must be after start time.", { endTime: ["Must be after start"] });
    const [row] = await db
      .insert(dateOverrides)
      .values({ doctorId: input.doctorId, clinicId: input.clinicId, date: input.date, startTime: normaliseTime(input.startTime), endTime: normaliseTime(input.endTime), timezone: PRACTICE_TZ, mode: input.mode, note: input.note || null, createdBy: user.id })
      .returning();
    await recordAudit(db, { actor: actorOf(user), action: "date_override.create", entityType: "date_override", entityId: row!.id, summary: `${input.mode === "replace" ? "Replaced" : "Added"} hours on ${input.date} (${input.startTime}–${input.endTime})`, changes: { ...input } });
    return { id: row!.id };
  });
}

export async function removeOverrideAction(id: string) {
  return run(async () => {
    const user = await requirePermission("availability:manage");
    const [row] = await db.delete(dateOverrides).where(eq(dateOverrides.id, id)).returning();
    if (!row) throw new NotFoundError("Override not found");
    await recordAudit(db, { actor: actorOf(user), action: "date_override.remove", entityType: "date_override", entityId: id, summary: `Removed date-specific hours on ${row.date}` });
    return undefined;
  });
}

const blockSchema = z.object({
  doctorId: z.string().uuid(),
  clinicId: z.union([z.literal(""), z.string().uuid()]).optional(),
  kind: z.enum(["leave", "holiday", "block"]),
  reason: z.string().trim().min(2, "Give a reason (private)").max(200),
  allDay: z.string().optional(),
  startDate: z.union([z.literal(""), dateStr]).optional(),
  endDate: z.union([z.literal(""), dateStr]).optional(),
  startAt: z.string().optional(),
  endAt: z.string().optional(),
});

function blockRange(input: z.infer<typeof blockSchema>): { startAt: Date; endAt: Date; allDay: boolean } {
  if (input.allDay === "on") {
    if (!input.startDate) throw new ValidationError("Choose a start date.", { startDate: ["Required"] });
    const endDate = input.endDate || input.startDate;
    return { startAt: startOfLocalDay(input.startDate), endAt: endOfLocalDay(endDate), allDay: true };
  }
  if (!input.startAt || !input.endAt) throw new ValidationError("Choose start and end times.", { startAt: ["Required"], endAt: ["Required"] });
  return { startAt: fromLocalInputValue(input.startAt), endAt: fromLocalInputValue(input.endAt), allDay: false };
}

export async function addBlockAction(formData: FormData) {
  return run(async () => {
    const user = await requirePermission("availability:manage");
    const input = parseOrThrow(blockSchema, formToObject(formData));
    const range = blockRange(input);
    const b = await createBlock({ doctorId: input.doctorId, clinicId: input.clinicId || null, kind: input.kind, reason: input.reason, ...range }, actorOf(user));
    return { id: b.id };
  });
}

export async function updateBlockAction(id: string, formData: FormData) {
  return run(async () => {
    const user = await requirePermission("availability:manage");
    const input = parseOrThrow(blockSchema, formToObject(formData));
    const range = blockRange(input);
    await updateBlock(id, { clinicId: input.clinicId || null, kind: input.kind, reason: input.reason, ...range }, actorOf(user));
    return undefined;
  });
}

export async function removeBlockAction(id: string) {
  return run(async () => {
    const user = await requirePermission("availability:manage");
    await deleteBlock(id, actorOf(user));
    return undefined;
  });
}

const recurringSchema = z.object({
  doctorId: z.string().uuid(),
  weekdays: z.union([z.string(), z.array(z.string())]).optional(),
  startTime: time,
  endTime: time,
  startsOn: z.union([z.literal(""), dateStr]).optional(),
  endsOn: z.union([z.literal(""), dateStr]).optional(),
  kind: z.enum(["break", "block"]),
  reason: z.string().trim().min(2, "Give a reason (private)").max(200),
});

export async function addRecurringBlockAction(formData: FormData) {
  return run(async () => {
    const user = await requirePermission("availability:manage");
    const input = parseOrThrow(recurringSchema, formToObject(formData));
    const weekdays = (Array.isArray(input.weekdays) ? input.weekdays : input.weekdays ? [input.weekdays] : []).map(Number).filter((n) => n >= 0 && n <= 6);
    if (!weekdays.length) throw new ValidationError("Choose at least one weekday.", { weekdays: ["Required"] });
    if (normaliseTime(input.endTime) <= normaliseTime(input.startTime)) throw new ValidationError("End time must be after start time.", { endTime: ["Must be after start"] });
    const r = await createRecurringBlock({ doctorId: input.doctorId, weekdays, startTime: normaliseTime(input.startTime), endTime: normaliseTime(input.endTime), startsOn: input.startsOn || null, endsOn: input.endsOn || null, kind: input.kind, reason: input.reason }, actorOf(user));
    return { id: r.id };
  });
}

export async function deactivateRecurringBlockAction(id: string) {
  return run(async () => {
    const user = await requirePermission("availability:manage");
    await updateRecurringBlock(id, { active: false }, actorOf(user));
    return undefined;
  });
}

export async function endRecurringBlockAction(id: string, endsOn: string) {
  return run(async () => {
    const user = await requirePermission("availability:manage");
    parseOrThrow(dateStr, endsOn);
    await updateRecurringBlock(id, { endsOn }, actorOf(user));
    return undefined;
  });
}

export async function findSessionsForDay(doctorId: string, weekday: number) {
  return db.select().from(weeklySessions).where(and(eq(weeklySessions.doctorId, doctorId), eq(weeklySessions.weekday, weekday), eq(weeklySessions.active, true)));
}
