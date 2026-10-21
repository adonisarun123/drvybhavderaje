/**
 * Booking engine. Every mutation that touches the doctor's time runs inside a
 * transaction that first takes a per-doctor advisory lock, purges expired holds,
 * re-checks availability against the authoritative `occupancy` table, and only
 * then writes. The GiST exclusion constraint on `occupancy` is the final backstop:
 * even if application logic were bypassed, Postgres refuses overlapping
 * appointment/hold rows for the same doctor.
 */
import { and, asc, eq, gt, inArray, isNull, sql } from "drizzle-orm";
import { DateTime } from "luxon";
import { db, type Tx } from "../db/client";
import {
  appointments,
  blocks,
  clinics,
  dateOverrides,
  holds,
  occupancy,
  OCCUPYING_STATUSES,
  recurringBlocks,
  schedulingSettings,
  weeklySessions,
  type Appointment,
  type AppointmentStatus,
  type Block,
  type Hold,
  type RecurringBlock,
} from "../db/schema";
import { AcknowledgementRequired, AppError, ConflictError, NotFoundError, ValidationError, type AffectedAppointment } from "../errors";
import { recordAudit, diff, type Actor } from "../audit";
import { nextAppointmentReference } from "../references";
import { PRACTICE_TZ, localDate } from "../time";
import {
  findConflicts,
  isWithinSessions,
  sessionWindows,
  expandRecurringBlocks,
  type Conflict,
  type OccupiedSlot,
  type SchedulingPolicy,
} from "./availability";

/* ------------------------------------------------------------------ */
/* Shared helpers                                                      */
/* ------------------------------------------------------------------ */

export async function withDoctorLock<T>(doctorId: string, fn: (tx: Tx) => Promise<T>): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${"doctor:" + doctorId}))`);
    return fn(tx);
  });
}

export async function loadPolicy(tx: Tx, doctorId: string): Promise<SchedulingPolicy & { holdMinutes: number; publicSlotsEnabled: boolean }> {
  const [row] = await tx.select().from(schedulingSettings).where(eq(schedulingSettings.doctorId, doctorId));
  if (!row) {
    return {
      defaultDurationMin: 30,
      slotStepMin: 30,
      bufferMin: 0,
      travelBufferMin: 60,
      minNoticeHours: 24,
      maxHorizonDays: 60,
      timezone: PRACTICE_TZ,
      holdMinutes: 30,
      publicSlotsEnabled: false,
    };
  }
  return {
    defaultDurationMin: row.defaultDurationMin,
    slotStepMin: row.slotStepMin,
    bufferMin: row.bufferMin,
    travelBufferMin: row.travelBufferMin,
    minNoticeHours: row.minNoticeHours,
    maxHorizonDays: row.maxHorizonDays,
    timezone: PRACTICE_TZ,
    holdMinutes: row.holdMinutes,
    publicSlotsEnabled: row.publicSlotsEnabled,
  };
}

/** Delete occupancy for expired holds and mark the hold released. Called inside every booking transaction. */
export async function purgeExpiredHolds(tx: Tx, doctorId: string, now: Date): Promise<number> {
  const expired = await tx
    .delete(occupancy)
    .where(and(eq(occupancy.doctorId, doctorId), eq(occupancy.kind, "hold"), sql`${occupancy.expiresAt} <= ${now}`))
    .returning({ holdId: occupancy.holdId });
  const ids = expired.map((e) => e.holdId).filter((x): x is string => !!x);
  if (ids.length) {
    await tx
      .update(holds)
      .set({ releasedAt: now, releaseReason: "expired" })
      .where(and(inArray(holds.id, ids), isNull(holds.releasedAt)));
  }
  return ids.length;
}

export interface WindowData {
  weekly: Awaited<ReturnType<typeof loadWeekly>>;
  overrides: Awaited<ReturnType<typeof loadOverrides>>;
  recurring: RecurringBlock[];
  blocks: Block[];
  occupied: OccupiedSlot[];
  policy: SchedulingPolicy;
}

async function loadWeekly(tx: Tx, doctorId: string) {
  return tx.select().from(weeklySessions).where(and(eq(weeklySessions.doctorId, doctorId), eq(weeklySessions.active, true)));
}
async function loadOverrides(tx: Tx, doctorId: string, fromDate: string, toDate: string) {
  return tx
    .select()
    .from(dateOverrides)
    .where(and(eq(dateOverrides.doctorId, doctorId), sql`${dateOverrides.date} BETWEEN ${fromDate} AND ${toDate}`));
}

/** Load every rule and occupied slot relevant to [from, to) (+ buffer margins). */
export async function loadWindow(tx: Tx, doctorId: string, from: Date, to: Date): Promise<WindowData> {
  const policy = await loadPolicy(tx, doctorId);
  const margin = Math.max(policy.bufferMin, policy.travelBufferMin, 0) * 60_000 + 86_400_000;
  const qFrom = new Date(from.getTime() - margin);
  const qTo = new Date(to.getTime() + margin);
  const fromDate = localDate(qFrom, policy.timezone);
  const toDate = localDate(qTo, policy.timezone);

  const [weekly, overrides, recurring, blockRows, occ] = await Promise.all([
    loadWeekly(tx, doctorId),
    loadOverrides(tx, doctorId, fromDate, toDate),
    tx.select().from(recurringBlocks).where(and(eq(recurringBlocks.doctorId, doctorId), eq(recurringBlocks.active, true))),
    tx
      .select()
      .from(blocks)
      .where(and(eq(blocks.doctorId, doctorId), isNull(blocks.deletedAt), sql`${blocks.startAt} < ${qTo}`, sql`${blocks.endAt} > ${qFrom}`)),
    tx
      .select({
        id: occupancy.id,
        kind: occupancy.kind,
        clinicId: occupancy.clinicId,
        appointmentId: occupancy.appointmentId,
        holdId: occupancy.holdId,
        expiresAt: occupancy.expiresAt,
        start: sql<string>`lower(${occupancy.span})`,
        end: sql<string>`upper(${occupancy.span})`,
        patientName: appointments.patientName,
        reference: appointments.reference,
        holdLabel: holds.label,
      })
      .from(occupancy)
      .leftJoin(appointments, eq(appointments.id, occupancy.appointmentId))
      .leftJoin(holds, eq(holds.id, occupancy.holdId))
      .where(
        and(
          eq(occupancy.doctorId, doctorId),
          inArray(occupancy.kind, ["appointment", "hold"]),
          sql`${occupancy.span} && tstzrange(${qFrom}, ${qTo}, '[)')`,
        ),
      ),
  ]);

  const occupied: OccupiedSlot[] = occ.map((o) => ({
    id: (o.kind === "appointment" ? o.appointmentId : o.holdId) ?? o.id,
    kind: o.kind as "appointment" | "hold",
    clinicId: o.clinicId,
    startAt: new Date(o.start),
    endAt: new Date(o.end),
    expiresAt: o.expiresAt,
    label: o.kind === "appointment" ? `${o.reference} ${o.patientName}` : `Hold: ${o.holdLabel}`,
  }));

  return { weekly, overrides, recurring, blocks: blockRows, occupied, policy };
}

export interface BookabilityCheck {
  conflicts: Conflict[];
  withinHours: boolean;
}

/** Pure check against loaded window data. */
export function checkBookable(
  data: WindowData,
  proposed: { clinicId: string; start: Date; end: Date },
  now: Date,
  exclude: { appointmentId?: string | null; holdId?: string | null } = {},
): BookabilityCheck {
  const zone = data.policy.timezone;
  const windows = sessionWindows(
    localDate(new Date(proposed.start.getTime() - 86_400_000), zone),
    localDate(new Date(proposed.end.getTime() + 86_400_000), zone),
    data.weekly,
    data.overrides,
    zone,
  );
  const conflicts = findConflicts(proposed, { blocks: data.blocks, recurring: data.recurring, occupied: data.occupied, policy: data.policy, now }, exclude);
  return { conflicts, withinHours: isWithinSessions(proposed, windows) };
}

/**
 * Throws ConflictError when the span is occupied, or AcknowledgementRequired when
 * it falls outside working hours and the caller has not acknowledged that.
 */
async function assertBookable(
  tx: Tx,
  args: {
    doctorId: string;
    clinicId: string;
    start: Date;
    end: Date;
    now: Date;
    exclude?: { appointmentId?: string | null; holdId?: string | null };
    allowOutsideHours?: boolean;
  },
): Promise<void> {
  if (!(args.end > args.start)) throw new ValidationError("End time must be after start time.", { endAt: ["End time must be after start time."] });
  await purgeExpiredHolds(tx, args.doctorId, args.now);
  const data = await loadWindow(tx, args.doctorId, args.start, args.end);
  const check = checkBookable(data, { clinicId: args.clinicId, start: args.start, end: args.end }, args.now, args.exclude ?? {});
  if (check.conflicts.length) {
    throw new ConflictError("That time is not available for the doctor.", check.conflicts);
  }
  if (!check.withinHours && !args.allowOutsideHours) {
    throw new AcknowledgementRequired([
      "This time is outside the doctor's published working hours for this clinic. Confirm with the doctor before booking, then tick the acknowledgement to proceed.",
    ]);
  }
}

function spanSql(start: Date, end: Date) {
  return sql`tstzrange(${start}, ${end}, '[)')`;
}

function translateDbError(e: unknown): never {
  const code = (e as { code?: string; cause?: { code?: string } })?.code ?? (e as { cause?: { code?: string } })?.cause?.code;
  if (code === "23P01") {
    throw new ConflictError("That time was taken by another booking a moment ago. Please choose a different time.");
  }
  if (code === "23505") {
    throw new AppError("duplicate", "This change was already saved (duplicate submission).", 409);
  }
  throw e;
}

/* ------------------------------------------------------------------ */
/* Appointments                                                        */
/* ------------------------------------------------------------------ */

export interface CreateAppointmentInput {
  doctorId: string;
  clinicId: string;
  patientName: string;
  phoneE164: string;
  email?: string | null;
  startAt: Date;
  endAt: Date;
  status: "requested" | "confirmed";
  source: string;
  notes?: string | null;
  enquiryId?: string | null;
  idempotencyKey?: string | null;
  allowOutsideHours?: boolean;
  /** For a `requested` appointment, optionally hold the time for N minutes. */
  holdMinutes?: number | null;
}

export async function createAppointment(input: CreateAppointmentInput, actor: Actor, now = new Date()): Promise<Appointment> {
  return withDoctorLock(input.doctorId, async (tx) => {
    if (input.idempotencyKey) {
      const [existing] = await tx.select().from(appointments).where(eq(appointments.idempotencyKey, input.idempotencyKey));
      if (existing) return existing;
    }
    const occupies = input.status === "confirmed" || (input.holdMinutes ?? 0) > 0;
    if (occupies) {
      await assertBookable(tx, {
        doctorId: input.doctorId,
        clinicId: input.clinicId,
        start: input.startAt,
        end: input.endAt,
        now,
        allowOutsideHours: input.allowOutsideHours,
      });
    }
    const reference = await nextAppointmentReference(tx);
    try {
      const [appt] = await tx
        .insert(appointments)
        .values({
          reference,
          doctorId: input.doctorId,
          clinicId: input.clinicId,
          enquiryId: input.enquiryId ?? null,
          patientName: input.patientName,
          phoneE164: input.phoneE164,
          email: input.email ?? null,
          startAt: input.startAt,
          endAt: input.endAt,
          status: input.status,
          source: input.source,
          notes: input.notes ?? null,
          outsideHoursAck: !!input.allowOutsideHours,
          confirmedAt: input.status === "confirmed" ? now : null,
          confirmedBy: input.status === "confirmed" ? actor.id : null,
          idempotencyKey: input.idempotencyKey ?? null,
          createdBy: actor.id,
        })
        .returning();
      if (!appt) throw new Error("Insert returned no row");
      if (input.status === "confirmed") {
        await tx.insert(occupancy).values({
          doctorId: input.doctorId,
          clinicId: input.clinicId,
          kind: "appointment",
          span: spanSql(input.startAt, input.endAt),
          appointmentId: appt.id,
        });
      } else if ((input.holdMinutes ?? 0) > 0) {
        const expiresAt = new Date(now.getTime() + (input.holdMinutes ?? 0) * 60_000);
        const [hold] = await tx
          .insert(holds)
          .values({
            doctorId: input.doctorId,
            clinicId: input.clinicId,
            appointmentId: appt.id,
            enquiryId: input.enquiryId ?? null,
            label: `Pending ${reference} – ${input.patientName}`,
            startAt: input.startAt,
            endAt: input.endAt,
            expiresAt,
            createdBy: actor.id,
          })
          .returning();
        await tx.insert(occupancy).values({
          doctorId: input.doctorId,
          clinicId: input.clinicId,
          kind: "hold",
          span: spanSql(input.startAt, input.endAt),
          holdId: hold!.id,
          expiresAt,
        });
      }
      await recordAudit(tx, {
        actor,
        action: "appointment.create",
        entityType: "appointment",
        entityId: appt.id,
        summary: `Created ${reference} (${input.status}) for ${input.patientName}`,
        changes: { status: input.status, startAt: input.startAt, endAt: input.endAt, clinicId: input.clinicId, source: input.source, enquiryId: input.enquiryId ?? null },
      });
      return appt;
    } catch (e) {
      translateDbError(e);
    }
  });
}

async function getAppointmentForUpdate(tx: Tx, id: string): Promise<Appointment> {
  const [appt] = await tx.select().from(appointments).where(eq(appointments.id, id)).for("update");
  if (!appt) throw new NotFoundError("Appointment not found");
  return appt;
}

export async function confirmAppointment(id: string, actor: Actor, opts: { allowOutsideHours?: boolean } = {}, now = new Date()): Promise<Appointment> {
  const [row] = await db.select({ doctorId: appointments.doctorId }).from(appointments).where(eq(appointments.id, id));
  if (!row) throw new NotFoundError("Appointment not found");
  return withDoctorLock(row.doctorId, async (tx) => {
    const appt = await getAppointmentForUpdate(tx, id);
    if (appt.status === "confirmed") return appt;
    if (appt.status !== "requested") throw new AppError("invalid_state", `Only requested appointments can be confirmed (current status: ${appt.status}).`);
    if (appt.endAt <= now) throw new AppError("invalid_state", "This appointment time is already in the past. Reschedule it before confirming.");
    const [linkedHold] = await tx.select().from(holds).where(and(eq(holds.appointmentId, appt.id), isNull(holds.releasedAt)));
    await assertBookable(tx, {
      doctorId: appt.doctorId,
      clinicId: appt.clinicId,
      start: appt.startAt,
      end: appt.endAt,
      now,
      exclude: { holdId: linkedHold?.id ?? null },
      allowOutsideHours: opts.allowOutsideHours || appt.outsideHoursAck,
    });
    try {
      if (linkedHold) {
        await tx.delete(occupancy).where(eq(occupancy.holdId, linkedHold.id));
        await tx.update(holds).set({ releasedAt: now, releaseReason: "converted" }).where(eq(holds.id, linkedHold.id));
      }
      await tx.insert(occupancy).values({
        doctorId: appt.doctorId,
        clinicId: appt.clinicId,
        kind: "appointment",
        span: spanSql(appt.startAt, appt.endAt),
        appointmentId: appt.id,
      });
      const [updated] = await tx
        .update(appointments)
        .set({ status: "confirmed", confirmedAt: now, confirmedBy: actor.id, outsideHoursAck: appt.outsideHoursAck || !!opts.allowOutsideHours, updatedAt: now })
        .where(eq(appointments.id, id))
        .returning();
      await recordAudit(tx, { actor, action: "appointment.confirm", entityType: "appointment", entityId: id, summary: `Confirmed ${appt.reference}`, changes: { status: { from: "requested", to: "confirmed" } } });
      return updated!;
    } catch (e) {
      translateDbError(e);
    }
  });
}

export async function rescheduleAppointment(
  id: string,
  change: { startAt: Date; endAt: Date; clinicId?: string; allowOutsideHours?: boolean; reason?: string | null },
  actor: Actor,
  now = new Date(),
): Promise<Appointment> {
  const [row] = await db.select({ doctorId: appointments.doctorId }).from(appointments).where(eq(appointments.id, id));
  if (!row) throw new NotFoundError("Appointment not found");
  return withDoctorLock(row.doctorId, async (tx) => {
    const appt = await getAppointmentForUpdate(tx, id);
    if (appt.status === "cancelled" || appt.status === "completed" || appt.status === "no_show") {
      throw new AppError("invalid_state", `A ${appt.status} appointment cannot be rescheduled. Create a new appointment instead.`);
    }
    const clinicId = change.clinicId ?? appt.clinicId;
    const occupies = OCCUPYING_STATUSES.includes(appt.status as AppointmentStatus);
    const [linkedHold] = await tx.select().from(holds).where(and(eq(holds.appointmentId, appt.id), isNull(holds.releasedAt)));
    if (occupies || linkedHold) {
      await assertBookable(tx, {
        doctorId: appt.doctorId,
        clinicId,
        start: change.startAt,
        end: change.endAt,
        now,
        exclude: { appointmentId: appt.id, holdId: linkedHold?.id ?? null },
        allowOutsideHours: change.allowOutsideHours,
      });
    }
    try {
      if (occupies) {
        // One statement: the old span is released and the new one claimed atomically.
        await tx
          .update(occupancy)
          .set({ span: spanSql(change.startAt, change.endAt), clinicId })
          .where(eq(occupancy.appointmentId, appt.id));
      }
      if (linkedHold) {
        await tx.update(occupancy).set({ span: spanSql(change.startAt, change.endAt), clinicId }).where(eq(occupancy.holdId, linkedHold.id));
        await tx.update(holds).set({ startAt: change.startAt, endAt: change.endAt, clinicId }).where(eq(holds.id, linkedHold.id));
      }
      const changes = diff(appt as unknown as Record<string, unknown>, { startAt: change.startAt, endAt: change.endAt, clinicId });
      const [updated] = await tx
        .update(appointments)
        .set({ startAt: change.startAt, endAt: change.endAt, clinicId, outsideHoursAck: appt.outsideHoursAck || !!change.allowOutsideHours, updatedAt: now })
        .where(eq(appointments.id, id))
        .returning();
      await recordAudit(tx, {
        actor,
        action: "appointment.reschedule",
        entityType: "appointment",
        entityId: id,
        summary: `Rescheduled ${appt.reference}${change.reason ? ` – ${change.reason}` : ""}`,
        changes: { ...changes, reason: change.reason ?? null },
      });
      return updated!;
    } catch (e) {
      translateDbError(e);
    }
  });
}

export async function cancelAppointment(id: string, reason: string, actor: Actor, now = new Date()): Promise<Appointment> {
  if (!reason.trim()) throw new ValidationError("A cancellation reason is required.", { reason: ["Required"] });
  const [row] = await db.select({ doctorId: appointments.doctorId }).from(appointments).where(eq(appointments.id, id));
  if (!row) throw new NotFoundError("Appointment not found");
  return withDoctorLock(row.doctorId, async (tx) => {
    const appt = await getAppointmentForUpdate(tx, id);
    if (appt.status === "cancelled") return appt;
    if (appt.status === "completed") throw new AppError("invalid_state", "A completed appointment cannot be cancelled.");
    await tx.delete(occupancy).where(eq(occupancy.appointmentId, appt.id)); // releases the time
    const linked = await tx.select().from(holds).where(and(eq(holds.appointmentId, appt.id), isNull(holds.releasedAt)));
    for (const h of linked) {
      await tx.delete(occupancy).where(eq(occupancy.holdId, h.id));
      await tx.update(holds).set({ releasedAt: now, releaseReason: "appointment cancelled" }).where(eq(holds.id, h.id));
    }
    const [updated] = await tx
      .update(appointments)
      .set({ status: "cancelled", cancellationReason: reason.trim(), cancelledAt: now, cancelledBy: actor.id, updatedAt: now })
      .where(eq(appointments.id, id))
      .returning();
    await recordAudit(tx, { actor, action: "appointment.cancel", entityType: "appointment", entityId: id, summary: `Cancelled ${appt.reference}: ${reason.trim()}`, changes: { status: { from: appt.status, to: "cancelled" }, reason: reason.trim() } });
    return updated!;
  });
}

export async function markAppointment(id: string, status: "arrived" | "completed" | "no_show", actor: Actor, now = new Date()): Promise<Appointment> {
  const [row] = await db.select({ doctorId: appointments.doctorId }).from(appointments).where(eq(appointments.id, id));
  if (!row) throw new NotFoundError("Appointment not found");
  return withDoctorLock(row.doctorId, async (tx) => {
    const appt = await getAppointmentForUpdate(tx, id);
    const allowed: Record<string, AppointmentStatus[]> = {
      arrived: ["confirmed"],
      completed: ["confirmed", "arrived"],
      no_show: ["confirmed"],
    };
    if (!allowed[status]!.includes(appt.status as AppointmentStatus)) {
      throw new AppError("invalid_state", `Cannot mark a ${appt.status} appointment as ${status.replace("_", " ")}.`);
    }
    if (status === "no_show") {
      await tx.delete(occupancy).where(eq(occupancy.appointmentId, appt.id));
    }
    const [updated] = await tx
      .update(appointments)
      .set({
        status,
        arrivedAt: status === "arrived" ? now : appt.arrivedAt,
        completedAt: status === "completed" ? now : appt.completedAt,
        updatedAt: now,
      })
      .where(eq(appointments.id, id))
      .returning();
    await recordAudit(tx, { actor, action: `appointment.${status}`, entityType: "appointment", entityId: id, summary: `${appt.reference} marked ${status.replace("_", " ")}`, changes: { status: { from: appt.status, to: status } } });
    return updated!;
  });
}

export async function updateAppointmentDetails(
  id: string,
  change: { patientName?: string; phoneE164?: string; email?: string | null; notes?: string | null },
  actor: Actor,
  now = new Date(),
): Promise<Appointment> {
  return db.transaction(async (tx) => {
    const appt = await getAppointmentForUpdate(tx, id);
    const [updated] = await tx.update(appointments).set({ ...change, updatedAt: now }).where(eq(appointments.id, id)).returning();
    await recordAudit(tx, {
      actor,
      action: "appointment.update",
      entityType: "appointment",
      entityId: id,
      summary: `Updated details for ${appt.reference}`,
      changes: diff(appt as unknown as Record<string, unknown>, change),
    });
    return updated!;
  });
}

/* ------------------------------------------------------------------ */
/* Holds                                                               */
/* ------------------------------------------------------------------ */

export async function createHold(
  input: { doctorId: string; clinicId: string; startAt: Date; endAt: Date; expiresAt: Date; label: string; enquiryId?: string | null; appointmentId?: string | null; allowOutsideHours?: boolean },
  actor: Actor,
  now = new Date(),
): Promise<Hold> {
  if (input.expiresAt <= now) throw new ValidationError("Hold expiry must be in the future.", { expiresAt: ["Must be in the future"] });
  return withDoctorLock(input.doctorId, async (tx) => {
    await assertBookable(tx, { doctorId: input.doctorId, clinicId: input.clinicId, start: input.startAt, end: input.endAt, now, allowOutsideHours: input.allowOutsideHours });
    try {
      const [hold] = await tx
        .insert(holds)
        .values({
          doctorId: input.doctorId,
          clinicId: input.clinicId,
          startAt: input.startAt,
          endAt: input.endAt,
          expiresAt: input.expiresAt,
          label: input.label,
          enquiryId: input.enquiryId ?? null,
          appointmentId: input.appointmentId ?? null,
          createdBy: actor.id,
        })
        .returning();
      await tx.insert(occupancy).values({
        doctorId: input.doctorId,
        clinicId: input.clinicId,
        kind: "hold",
        span: spanSql(input.startAt, input.endAt),
        holdId: hold!.id,
        expiresAt: input.expiresAt,
      });
      await recordAudit(tx, { actor, action: "hold.create", entityType: "hold", entityId: hold!.id, summary: `Held time: ${input.label}`, changes: { startAt: input.startAt, endAt: input.endAt, expiresAt: input.expiresAt } });
      return hold!;
    } catch (e) {
      translateDbError(e);
    }
  });
}

export async function extendHold(id: string, newExpiry: Date, actor: Actor, now = new Date()): Promise<Hold> {
  if (newExpiry <= now) throw new ValidationError("Expiry must be in the future.", { expiresAt: ["Must be in the future"] });
  const [row] = await db.select().from(holds).where(eq(holds.id, id));
  if (!row) throw new NotFoundError("Hold not found");
  return withDoctorLock(row.doctorId, async (tx) => {
    await purgeExpiredHolds(tx, row.doctorId, now);
    const [hold] = await tx.select().from(holds).where(eq(holds.id, id)).for("update");
    if (!hold) throw new NotFoundError("Hold not found");
    if (hold.releasedAt && hold.releaseReason !== "expired") throw new AppError("invalid_state", "This hold has been released.");
    const [occ] = await tx.select().from(occupancy).where(eq(occupancy.holdId, id));
    try {
      if (occ) {
        await tx.update(occupancy).set({ expiresAt: newExpiry }).where(eq(occupancy.holdId, id));
      } else {
        // Expired and purged: re-claim the time, which must still be free.
        await assertBookable(tx, { doctorId: hold.doctorId, clinicId: hold.clinicId, start: hold.startAt, end: hold.endAt, now, allowOutsideHours: true });
        await tx.insert(occupancy).values({ doctorId: hold.doctorId, clinicId: hold.clinicId, kind: "hold", span: spanSql(hold.startAt, hold.endAt), holdId: hold.id, expiresAt: newExpiry });
      }
      const [updated] = await tx.update(holds).set({ expiresAt: newExpiry, releasedAt: null, releaseReason: null }).where(eq(holds.id, id)).returning();
      await recordAudit(tx, { actor, action: "hold.extend", entityType: "hold", entityId: id, summary: `Extended hold ${hold.label}`, changes: { expiresAt: { from: hold.expiresAt, to: newExpiry } } });
      return updated!;
    } catch (e) {
      translateDbError(e);
    }
  });
}

export async function releaseHold(id: string, actor: Actor, reason = "released by staff", now = new Date()): Promise<void> {
  const [row] = await db.select().from(holds).where(eq(holds.id, id));
  if (!row) throw new NotFoundError("Hold not found");
  await withDoctorLock(row.doctorId, async (tx) => {
    await tx.delete(occupancy).where(eq(occupancy.holdId, id));
    await tx.update(holds).set({ releasedAt: now, releaseReason: reason }).where(and(eq(holds.id, id), isNull(holds.releasedAt)));
    await recordAudit(tx, { actor, action: "hold.release", entityType: "hold", entityId: id, summary: `Released hold ${row.label}` });
  });
}

/* ------------------------------------------------------------------ */
/* Blocks                                                              */
/* ------------------------------------------------------------------ */

async function affectedAppointments(tx: Tx, doctorId: string, spans: { start: Date; end: Date }[]): Promise<AffectedAppointment[]> {
  if (!spans.length) return [];
  const rows = await tx
    .select({
      id: appointments.id,
      reference: appointments.reference,
      patientName: appointments.patientName,
      startAt: appointments.startAt,
      endAt: appointments.endAt,
      status: appointments.status,
      clinicName: clinics.name,
    })
    .from(appointments)
    .leftJoin(clinics, eq(clinics.id, appointments.clinicId))
    .where(and(eq(appointments.doctorId, doctorId), inArray(appointments.status, [...OCCUPYING_STATUSES, "requested"])))
    .orderBy(asc(appointments.startAt));
  const hits = rows.filter((r) => spans.some((s) => r.startAt < s.end && s.start < r.endAt));
  return hits.map((r) => ({ ...r, clinicName: r.clinicName ?? undefined }));
}

async function activeHoldsIn(tx: Tx, doctorId: string, spans: { start: Date; end: Date }[], now: Date): Promise<Conflict[]> {
  const rows = await tx.select().from(holds).where(and(eq(holds.doctorId, doctorId), isNull(holds.releasedAt), gt(holds.expiresAt, now)));
  return rows
    .filter((h) => spans.some((s) => h.startAt < s.end && s.start < h.endAt))
    .map((h) => ({ kind: "hold" as const, refId: h.id, start: h.startAt, end: h.endAt, label: `Hold: ${h.label} (expires ${h.expiresAt.toISOString()})` }));
}

export interface BlockInput {
  doctorId: string;
  clinicId?: string | null;
  startAt: Date;
  endAt: Date;
  allDay: boolean;
  kind: string;
  reason: string;
}

/**
 * Creates a block. If confirmed/requested appointments or active holds fall inside it,
 * nothing is written and a ConflictError lists them so staff can resolve each one.
 */
export async function createBlock(input: BlockInput, actor: Actor, now = new Date()): Promise<Block> {
  if (!(input.endAt > input.startAt)) throw new ValidationError("End must be after start.", { endAt: ["End must be after start."] });
  if (!input.reason.trim()) throw new ValidationError("A reason is required.", { reason: ["Required"] });
  return withDoctorLock(input.doctorId, async (tx) => {
    await purgeExpiredHolds(tx, input.doctorId, now);
    const span = { start: input.startAt, end: input.endAt };
    const affected = await affectedAppointments(tx, input.doctorId, [span]);
    const holdConflicts = await activeHoldsIn(tx, input.doctorId, [span], now);
    if (affected.length || holdConflicts.length) {
      throw new ConflictError(
        `${affected.length} appointment(s) and ${holdConflicts.length} hold(s) fall inside this block. Reschedule, cancel or release them first — nothing has been changed.`,
        holdConflicts,
        affected,
      );
    }
    const [block] = await tx
      .insert(blocks)
      .values({ ...input, clinicId: input.clinicId ?? null, reason: input.reason.trim(), createdBy: actor.id })
      .returning();
    await tx.insert(occupancy).values({ doctorId: input.doctorId, clinicId: input.clinicId ?? null, kind: "block", span: spanSql(input.startAt, input.endAt), blockId: block!.id });
    await recordAudit(tx, { actor, action: "block.create", entityType: "block", entityId: block!.id, summary: `Blocked time (${input.kind}): ${input.reason.trim()}`, changes: { startAt: input.startAt, endAt: input.endAt, allDay: input.allDay, recurring: false } });
    return block!;
  });
}

export async function updateBlock(id: string, change: Partial<BlockInput>, actor: Actor, now = new Date()): Promise<Block> {
  const [existing] = await db.select().from(blocks).where(and(eq(blocks.id, id), isNull(blocks.deletedAt)));
  if (!existing) throw new NotFoundError("Block not found");
  return withDoctorLock(existing.doctorId, async (tx) => {
    const startAt = change.startAt ?? existing.startAt;
    const endAt = change.endAt ?? existing.endAt;
    if (!(endAt > startAt)) throw new ValidationError("End must be after start.", { endAt: ["End must be after start."] });
    await purgeExpiredHolds(tx, existing.doctorId, now);
    const span = { start: startAt, end: endAt };
    const affected = await affectedAppointments(tx, existing.doctorId, [span]);
    const holdConflicts = await activeHoldsIn(tx, existing.doctorId, [span], now);
    if (affected.length || holdConflicts.length) {
      throw new ConflictError(`${affected.length} appointment(s) and ${holdConflicts.length} hold(s) fall inside the new block time. Resolve them first — nothing has been changed.`, holdConflicts, affected);
    }
    const [updated] = await tx
      .update(blocks)
      .set({ startAt, endAt, allDay: change.allDay ?? existing.allDay, kind: change.kind ?? existing.kind, reason: (change.reason ?? existing.reason).trim(), clinicId: change.clinicId === undefined ? existing.clinicId : change.clinicId, updatedAt: now })
      .where(eq(blocks.id, id))
      .returning();
    await tx.update(occupancy).set({ span: spanSql(startAt, endAt) }).where(eq(occupancy.blockId, id));
    await recordAudit(tx, { actor, action: "block.update", entityType: "block", entityId: id, summary: `Updated block: ${updated!.reason}`, changes: diff(existing as unknown as Record<string, unknown>, { startAt, endAt, reason: updated!.reason, kind: updated!.kind }) });
    return updated!;
  });
}

export async function deleteBlock(id: string, actor: Actor, now = new Date()): Promise<void> {
  const [existing] = await db.select().from(blocks).where(and(eq(blocks.id, id), isNull(blocks.deletedAt)));
  if (!existing) throw new NotFoundError("Block not found");
  await withDoctorLock(existing.doctorId, async (tx) => {
    await tx.delete(occupancy).where(eq(occupancy.blockId, id));
    await tx.update(blocks).set({ deletedAt: now, updatedAt: now }).where(eq(blocks.id, id));
    await recordAudit(tx, { actor, action: "block.delete", entityType: "block", entityId: id, summary: `Removed block: ${existing.reason}` });
  });
}

/* ------------------------------------------------------------------ */
/* Recurring blocks                                                    */
/* ------------------------------------------------------------------ */

export interface RecurringBlockInput {
  doctorId: string;
  weekdays: number[];
  startTime: string;
  endTime: string;
  startsOn?: string | null;
  endsOn?: string | null;
  kind: string;
  reason: string;
}

const RECURRING_CHECK_DAYS = 400;

async function assertRecurringClear(tx: Tx, doctorId: string, rule: RecurringBlockInput, now: Date, excludeId?: string) {
  const from = now;
  const to = DateTime.fromJSDate(now).plus({ days: RECURRING_CHECK_DAYS }).toJSDate();
  const windows = expandRecurringBlocks(
    [{ id: excludeId ?? "new", weekdays: rule.weekdays, startTime: rule.startTime, endTime: rule.endTime, timezone: PRACTICE_TZ, startsOn: rule.startsOn, endsOn: rule.endsOn, reason: rule.reason, kind: rule.kind }],
    from,
    to,
    PRACTICE_TZ,
  );
  const affected = await affectedAppointments(tx, doctorId, windows);
  const holdConflicts = await activeHoldsIn(tx, doctorId, windows, now);
  if (affected.length || holdConflicts.length) {
    throw new ConflictError(
      `${affected.length} existing appointment(s) and ${holdConflicts.length} hold(s) fall inside this recurring block over the next ${RECURRING_CHECK_DAYS} days. Resolve them first — nothing has been changed.`,
      holdConflicts,
      affected,
    );
  }
}

export async function createRecurringBlock(input: RecurringBlockInput, actor: Actor, now = new Date()): Promise<RecurringBlock> {
  if (!input.weekdays.length) throw new ValidationError("Choose at least one weekday.", { weekdays: ["Required"] });
  if (!input.reason.trim()) throw new ValidationError("A reason is required.", { reason: ["Required"] });
  return withDoctorLock(input.doctorId, async (tx) => {
    await purgeExpiredHolds(tx, input.doctorId, now);
    await assertRecurringClear(tx, input.doctorId, input, now);
    const [row] = await tx
      .insert(recurringBlocks)
      .values({ ...input, reason: input.reason.trim(), timezone: PRACTICE_TZ, createdBy: actor.id })
      .returning();
    await recordAudit(tx, { actor, action: "recurring_block.create", entityType: "recurring_block", entityId: row!.id, summary: `Recurring ${input.kind}: ${input.reason.trim()}`, changes: { weekdays: input.weekdays, startTime: input.startTime, endTime: input.endTime, startsOn: input.startsOn ?? null, endsOn: input.endsOn ?? null, recurring: true } });
    return row!;
  });
}

export async function updateRecurringBlock(id: string, change: Partial<RecurringBlockInput> & { active?: boolean }, actor: Actor, now = new Date()): Promise<RecurringBlock> {
  const [existing] = await db.select().from(recurringBlocks).where(eq(recurringBlocks.id, id));
  if (!existing) throw new NotFoundError("Recurring block not found");
  return withDoctorLock(existing.doctorId, async (tx) => {
    const merged: RecurringBlockInput = {
      doctorId: existing.doctorId,
      weekdays: change.weekdays ?? existing.weekdays,
      startTime: change.startTime ?? existing.startTime,
      endTime: change.endTime ?? existing.endTime,
      startsOn: change.startsOn === undefined ? existing.startsOn : change.startsOn,
      endsOn: change.endsOn === undefined ? existing.endsOn : change.endsOn,
      kind: change.kind ?? existing.kind,
      reason: change.reason ?? existing.reason,
    };
    const active = change.active ?? existing.active;
    if (active) {
      await purgeExpiredHolds(tx, existing.doctorId, now);
      await assertRecurringClear(tx, existing.doctorId, merged, now, id);
    }
    const [updated] = await tx
      .update(recurringBlocks)
      .set({ ...merged, reason: merged.reason.trim(), active, updatedAt: now })
      .where(eq(recurringBlocks.id, id))
      .returning();
    await recordAudit(tx, { actor, action: "recurring_block.update", entityType: "recurring_block", entityId: id, summary: `Updated recurring block: ${updated!.reason}`, changes: diff(existing as unknown as Record<string, unknown>, { ...merged, active }) });
    return updated!;
  });
}

/* ------------------------------------------------------------------ */
/* Working hours (never touches bookings; reports what falls outside)  */
/* ------------------------------------------------------------------ */

export async function futureAppointmentsOutsideHours(doctorId: string, now = new Date()): Promise<AffectedAppointment[]> {
  return db.transaction(async (tx) => {
    const to = DateTime.fromJSDate(now).plus({ days: RECURRING_CHECK_DAYS }).toJSDate();
    const data = await loadWindow(tx, doctorId, now, to);
    const windows = sessionWindows(localDate(now), localDate(to), data.weekly, data.overrides, data.policy.timezone);
    const rows = await tx
      .select({ id: appointments.id, reference: appointments.reference, patientName: appointments.patientName, startAt: appointments.startAt, endAt: appointments.endAt, status: appointments.status, clinicId: appointments.clinicId, clinicName: clinics.name })
      .from(appointments)
      .leftJoin(clinics, eq(clinics.id, appointments.clinicId))
      .where(and(eq(appointments.doctorId, doctorId), inArray(appointments.status, ["requested", "confirmed"]), gt(appointments.startAt, now)))
      .orderBy(asc(appointments.startAt));
    return rows
      .filter((r) => !isWithinSessions({ clinicId: r.clinicId, start: r.startAt, end: r.endAt }, windows))
      .map((r) => ({ id: r.id, reference: r.reference, patientName: r.patientName, startAt: r.startAt, endAt: r.endAt, status: r.status, clinicName: r.clinicName ?? undefined }));
  });
}
