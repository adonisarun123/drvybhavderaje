import "server-only";
import { and, asc, desc, eq, gte, inArray, isNull, lt, lte, or, sql, type SQL } from "drizzle-orm";
import { DateTime } from "luxon";
import { db } from "../db/client";
import { appointments, auditEvents, blocks, clinics, enquiries, holds, recurringBlocks, user as userTable } from "../db/schema";
import { endOfLocalDay, localDate, startOfLocalDay, PRACTICE_TZ } from "../time";
import { expandRecurringBlocks } from "../scheduling/availability";

export async function dashboardStats(doctorId: string | null, now = new Date()) {
  const today = localDate(now);
  const dayStart = startOfLocalDay(today);
  const dayEnd = endOfLocalDay(today);
  const weekEnd = DateTime.fromJSDate(now).plus({ days: 7 }).toJSDate();
  const monthAgo = DateTime.fromJSDate(now).minus({ days: 30 }).toJSDate();
  const count = (cond: SQL) => db.select({ n: sql<number>`count(*)::int` }).from(enquiries).where(cond).then((r) => r[0]?.n ?? 0);
  const countA = (cond: SQL) => db.select({ n: sql<number>`count(*)::int` }).from(appointments).where(cond).then((r) => r[0]?.n ?? 0);
  const [newEnquiries, awaitingFollowUp, todayAppts, upcoming, pendingRequests, cancelledRecent, noShowRecent] = await Promise.all([
    count(eq(enquiries.status, "new")),
    count(and(inArray(enquiries.status, ["contacted", "awaiting_response", "appointment_requested"]), or(isNull(enquiries.followUpAt), lte(enquiries.followUpAt, now))!)!),
    countA(and(gte(appointments.startAt, dayStart), lt(appointments.startAt, dayEnd), inArray(appointments.status, ["confirmed", "arrived", "completed", "requested"]))!),
    countA(and(gte(appointments.startAt, dayEnd), lt(appointments.startAt, weekEnd), inArray(appointments.status, ["confirmed", "arrived"]))!),
    countA(and(eq(appointments.status, "requested"), gte(appointments.endAt, now))!),
    countA(and(eq(appointments.status, "cancelled"), gte(appointments.cancelledAt, monthAgo))!),
    countA(and(eq(appointments.status, "no_show"), gte(appointments.startAt, monthAgo))!),
  ]);
  const upcomingBlocks = doctorId
    ? await db
        .select()
        .from(blocks)
        .where(and(eq(blocks.doctorId, doctorId), isNull(blocks.deletedAt), gte(blocks.endAt, now), lt(blocks.startAt, DateTime.fromJSDate(now).plus({ days: 60 }).toJSDate())))
        .orderBy(asc(blocks.startAt))
        .limit(8)
    : [];
  return { newEnquiries, awaitingFollowUp, todayAppts, upcoming, pendingRequests, cancelledRecent, noShowRecent, upcomingBlocks, today };
}

export async function todaysAgenda(now = new Date()) {
  const today = localDate(now);
  return db
    .select({ a: appointments, clinicName: clinics.name })
    .from(appointments)
    .leftJoin(clinics, eq(clinics.id, appointments.clinicId))
    .where(and(gte(appointments.startAt, startOfLocalDay(today)), lt(appointments.startAt, endOfLocalDay(today)), inArray(appointments.status, ["requested", "confirmed", "arrived", "completed", "no_show"])))
    .orderBy(asc(appointments.startAt));
}

export interface AppointmentFilters {
  q?: string;
  status?: string;
  clinicId?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export async function listAppointments(f: AppointmentFilters) {
  const where: SQL[] = [];
  if (f.q) {
    const like = `%${f.q.trim()}%`;
    where.push(or(sql`${appointments.patientName} ILIKE ${like}`, sql`${appointments.reference} ILIKE ${like}`, sql`${appointments.phoneE164} ILIKE ${like}`)!);
  }
  if (f.status && f.status !== "all") {
    if (f.status === "active") where.push(inArray(appointments.status, ["requested", "confirmed", "arrived"]));
    else where.push(eq(appointments.status, f.status));
  }
  if (f.clinicId) where.push(eq(appointments.clinicId, f.clinicId));
  if (f.from) where.push(gte(appointments.startAt, startOfLocalDay(f.from)));
  if (f.to) where.push(lt(appointments.startAt, endOfLocalDay(f.to)));
  const pageSize = Math.min(100, f.pageSize ?? 25);
  const page = Math.max(1, f.page ?? 1);
  const cond = where.length ? and(...where) : undefined;
  const rows = await db
    .select({ a: appointments, clinicName: clinics.name, enquiryRef: enquiries.reference })
    .from(appointments)
    .leftJoin(clinics, eq(clinics.id, appointments.clinicId))
    .leftJoin(enquiries, eq(enquiries.id, appointments.enquiryId))
    .where(cond)
    .orderBy(f.from || f.to ? asc(appointments.startAt) : desc(appointments.startAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);
  const [c] = await db.select({ n: sql<number>`count(*)::int` }).from(appointments).where(cond);
  return { rows, total: c?.n ?? 0, page, pageSize };
}

export async function getAppointment(id: string) {
  const [row] = await db
    .select({ a: appointments, clinicName: clinics.name, enquiryRef: enquiries.reference, createdByName: userTable.name })
    .from(appointments)
    .leftJoin(clinics, eq(clinics.id, appointments.clinicId))
    .leftJoin(enquiries, eq(enquiries.id, appointments.enquiryId))
    .leftJoin(userTable, eq(userTable.id, appointments.createdBy))
    .where(eq(appointments.id, id));
  if (!row) return null;
  const history = await db.select().from(auditEvents).where(and(eq(auditEvents.entityType, "appointment"), eq(auditEvents.entityId, id))).orderBy(desc(auditEvents.createdAt));
  const [hold] = await db.select().from(holds).where(and(eq(holds.appointmentId, id), isNull(holds.releasedAt)));
  return { ...row, history, hold: hold ?? null };
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  kind: "appointment" | "hold" | "block" | "recurring" | "session";
  status?: string;
  clinicId?: string | null;
  clinicName?: string | null;
  editable?: boolean;
  allDay?: boolean;
  meta?: Record<string, unknown>;
}

export async function calendarEvents(doctorId: string, from: Date, to: Date, filters: { clinicId?: string; status?: string }, now = new Date()): Promise<CalendarEvent[]> {
  const where: SQL[] = [eq(appointments.doctorId, doctorId), lt(appointments.startAt, to), gte(appointments.endAt, from)];
  if (filters.clinicId) where.push(eq(appointments.clinicId, filters.clinicId));
  if (filters.status && filters.status !== "all") where.push(eq(appointments.status, filters.status));
  else if (!filters.status) where.push(inArray(appointments.status, ["requested", "confirmed", "arrived", "completed", "no_show"]));
  const appts = await db
    .select({ a: appointments, clinicName: clinics.name })
    .from(appointments)
    .leftJoin(clinics, eq(clinics.id, appointments.clinicId))
    .where(and(...where));
  const holdRows = await db
    .select({ h: holds, clinicName: clinics.name })
    .from(holds)
    .leftJoin(clinics, eq(clinics.id, holds.clinicId))
    .where(and(eq(holds.doctorId, doctorId), isNull(holds.releasedAt), sql`${holds.expiresAt} > ${now}`, lt(holds.startAt, to), gte(holds.endAt, from)));
  const blockRows = await db.select().from(blocks).where(and(eq(blocks.doctorId, doctorId), isNull(blocks.deletedAt), lt(blocks.startAt, to), gte(blocks.endAt, from)));
  const recurring = await db.select().from(recurringBlocks).where(and(eq(recurringBlocks.doctorId, doctorId), eq(recurringBlocks.active, true)));
  const recWindows = expandRecurringBlocks(recurring, from, to, PRACTICE_TZ);

  const events: CalendarEvent[] = [];
  for (const { a, clinicName } of appts) {
    events.push({
      id: `appt:${a.id}`,
      title: `${a.patientName} · ${clinicName ?? ""}`.trim(),
      start: a.startAt.toISOString(),
      end: a.endAt.toISOString(),
      kind: "appointment",
      status: a.status,
      clinicId: a.clinicId,
      clinicName,
      editable: a.status === "requested" || a.status === "confirmed",
      meta: { reference: a.reference, phone: a.phoneE164, appointmentId: a.id },
    });
  }
  for (const { h, clinicName } of holdRows) {
    if (filters.clinicId && h.clinicId !== filters.clinicId) continue;
    events.push({ id: `hold:${h.id}`, title: `Hold: ${h.label}`, start: h.startAt.toISOString(), end: h.endAt.toISOString(), kind: "hold", clinicId: h.clinicId, clinicName, editable: false, meta: { expiresAt: h.expiresAt.toISOString(), holdId: h.id } });
  }
  for (const b of blockRows) {
    events.push({ id: `block:${b.id}`, title: `${b.kind === "leave" ? "Leave" : b.kind === "holiday" ? "Holiday" : "Blocked"}: ${b.reason}`, start: b.startAt.toISOString(), end: b.endAt.toISOString(), kind: "block", allDay: b.allDay, editable: false, meta: { blockId: b.id, kind: b.kind } });
  }
  for (const r of recWindows) {
    events.push({ id: `rec:${r.refId}:${r.start.toISOString()}`, title: `Recurring: ${r.label ?? ""}`, start: r.start.toISOString(), end: r.end.toISOString(), kind: "recurring", editable: false, meta: { recurringId: r.refId } });
  }
  return events;
}
