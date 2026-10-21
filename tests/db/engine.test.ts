/**
 * Integration tests against the real Neon database (DATABASE_URL). They create an
 * isolated test doctor + clinics and remove everything they created afterwards.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { and, eq, sql } from "drizzle-orm";
import { db, getPool } from "@/lib/db/client";
import { appointments, blocks, clinics, doctors, holds, occupancy, recurringBlocks, schedulingSettings, weeklySessions, auditEvents } from "@/lib/db/schema";
import {
  cancelAppointment,
  confirmAppointment,
  createAppointment,
  createBlock,
  createHold,
  createRecurringBlock,
  markAppointment,
  rescheduleAppointment,
} from "@/lib/scheduling/engine";
import { AcknowledgementRequired, ConflictError } from "@/lib/errors";
import { localToUtc } from "@/lib/time";

const actor = { id: null, label: "test-suite" };
const run = Date.now().toString(36);
let doctorId = "";
let wf = "";
let km = "";

// A Monday well in the future so min-notice never interferes.
const DAY = "2027-03-01"; // Monday
const at = (t: string) => localToUtc(DAY, t);

beforeAll(async () => {
  const [d] = await db.insert(doctors).values({ slug: `test-doc-${run}`, name: "Test Doctor", title: "Test" }).returning();
  doctorId = d!.id;
  const [c1] = await db.insert(clinics).values({ slug: `test-wf-${run}`, name: "Test Whitefield", addressLines: "x" }).returning();
  const [c2] = await db.insert(clinics).values({ slug: `test-km-${run}`, name: "Test Koramangala", addressLines: "y" }).returning();
  wf = c1!.id;
  km = c2!.id;
  await db.insert(schedulingSettings).values({ doctorId, defaultDurationMin: 30, slotStepMin: 30, bufferMin: 10, travelBufferMin: 60, minNoticeHours: 0, maxHorizonDays: 400 });
  await db.insert(weeklySessions).values([
    { doctorId, clinicId: wf, weekday: 1, startTime: "10:00", endTime: "13:00" },
    { doctorId, clinicId: km, weekday: 1, startTime: "16:00", endTime: "19:00" },
  ]);
});

afterAll(async () => {
  await db.delete(occupancy).where(eq(occupancy.doctorId, doctorId));
  await db.delete(holds).where(eq(holds.doctorId, doctorId));
  await db.delete(appointments).where(eq(appointments.doctorId, doctorId));
  await db.delete(blocks).where(eq(blocks.doctorId, doctorId));
  await db.delete(recurringBlocks).where(eq(recurringBlocks.doctorId, doctorId));
  await db.delete(weeklySessions).where(eq(weeklySessions.doctorId, doctorId));
  await db.delete(schedulingSettings).where(eq(schedulingSettings.doctorId, doctorId));
  await db.delete(auditEvents).where(eq(auditEvents.actorLabel, "test-suite"));
  await db.delete(doctors).where(eq(doctors.id, doctorId));
  await db.delete(clinics).where(eq(clinics.id, wf));
  await db.delete(clinics).where(eq(clinics.id, km));
  await getPool().end();
});

const base = (over: Partial<Parameters<typeof createAppointment>[0]> = {}) => ({
  doctorId,
  clinicId: wf,
  patientName: "Test Patient",
  phoneE164: "+919999999999",
  startAt: at("10:00"),
  endAt: at("10:30"),
  status: "confirmed" as const,
  source: "phone",
  ...over,
});

describe("booking engine (Neon)", () => {
  it("confirmed appointment occupies time; overlapping confirmed booking is rejected", async () => {
    const a = await createAppointment(base(), actor);
    const [occ] = await db.select().from(occupancy).where(eq(occupancy.appointmentId, a.id));
    expect(occ?.kind).toBe("appointment");
    await expect(createAppointment(base({ startAt: at("10:15"), endAt: at("10:45") }), actor)).rejects.toBeInstanceOf(ConflictError);
    // same-clinic 10 min buffer: 10:35 start is too close
    await expect(createAppointment(base({ startAt: at("10:35"), endAt: at("11:05") }), actor)).rejects.toBeInstanceOf(ConflictError);
    // 10:40 is fine
    const b = await createAppointment(base({ startAt: at("10:40"), endAt: at("11:10") }), actor);
    expect(b.status).toBe("confirmed");
  });

  it("requested appointments do not occupy time until confirmed", async () => {
    const r = await createAppointment(base({ startAt: at("11:30"), endAt: at("12:00"), status: "requested" }), actor);
    const occ = await db.select().from(occupancy).where(eq(occupancy.appointmentId, r.id));
    expect(occ).toHaveLength(0);
    const confirmed = await confirmAppointment(r.id, actor);
    expect(confirmed.status).toBe("confirmed");
    const occ2 = await db.select().from(occupancy).where(eq(occupancy.appointmentId, r.id));
    expect(occ2).toHaveLength(1);
    // A second request on the same time can be created but not confirmed
    const r2 = await createAppointment(base({ startAt: at("11:30"), endAt: at("12:00"), status: "requested" }), actor);
    await expect(confirmAppointment(r2.id, actor)).rejects.toBeInstanceOf(ConflictError);
  });

  it("cross-clinic overlap and travel buffer are rejected", async () => {
    // Existing WF appointment 10:40–11:10; a KM booking at 11:30 is within the 60 min travel buffer
    await expect(createAppointment(base({ clinicId: km, startAt: at("16:00"), endAt: at("16:30"), allowOutsideHours: true, status: "confirmed" }), actor)).resolves.toBeTruthy();
    await expect(createAppointment(base({ clinicId: wf, startAt: at("15:30"), endAt: at("16:00"), allowOutsideHours: true }), actor)).rejects.toMatchObject({ code: "conflict" });
    try {
      await createAppointment(base({ clinicId: wf, startAt: at("15:30"), endAt: at("16:00"), allowOutsideHours: true }), actor);
    } catch (e) {
      expect((e as ConflictError).conflicts[0]?.kind).toBe("travel_buffer");
    }
  });

  it("two concurrent attempts cannot both succeed", async () => {
    const attempt = () => createAppointment(base({ startAt: at("12:20"), endAt: at("12:50") }), actor);
    const results = await Promise.allSettled([attempt(), attempt(), attempt()]);
    const ok = results.filter((r) => r.status === "fulfilled");
    const failed = results.filter((r) => r.status === "rejected");
    expect(ok).toHaveLength(1);
    expect(failed).toHaveLength(2);
    for (const f of failed) expect((f as PromiseRejectedResult).reason).toBeInstanceOf(ConflictError);
  });

  it("the exclusion constraint rejects overlapping occupancy rows even without the engine", async () => {
    // Use an appointment that has no occupancy row yet (a pending request) so only the overlap constraint can fire.
    const [a] = await db.select().from(appointments).where(and(eq(appointments.doctorId, doctorId), eq(appointments.status, "requested")));
    let caught: unknown;
    try {
      await db.execute(sql`INSERT INTO occupancy (doctor_id, kind, span, appointment_id) VALUES (${doctorId}, 'appointment', tstzrange(${at("12:30")}, ${at("12:40")}, '[)'), ${a!.id})`);
    } catch (e) {
      caught = e;
    }
    const err = caught as { cause?: { code?: string; constraint?: string }; message?: string };
    expect(err).toBeTruthy();
    const code = err.cause?.code ?? (err as { code?: string }).code;
    expect(`${code} ${err.cause?.constraint ?? ""} ${err.message ?? ""}`).toMatch(/23P01|occupancy_no_double_booking/);
  });

  it("reschedule releases the old slot and occupies the new one atomically", async () => {
    const [a] = await db.select().from(appointments).where(and(eq(appointments.doctorId, doctorId), eq(appointments.startAt, at("12:20"))));
    const moved = await rescheduleAppointment(a!.id, { startAt: at("12:30"), endAt: at("13:00") }, actor);
    expect(moved.startAt.toISOString()).toBe(at("12:30").toISOString());
    const [occ] = await db.select({ lo: sql<string>`lower(span)` }).from(occupancy).where(eq(occupancy.appointmentId, a!.id));
    expect(new Date(occ!.lo).toISOString()).toBe(at("12:30").toISOString());
    // moving onto another booking fails and leaves the original untouched
    await expect(rescheduleAppointment(a!.id, { startAt: at("10:00"), endAt: at("10:30") }, actor)).rejects.toBeInstanceOf(ConflictError);
    const [still] = await db.select().from(appointments).where(eq(appointments.id, a!.id));
    expect(still!.startAt.toISOString()).toBe(at("12:30").toISOString());
  });

  it("cancellation releases availability; no-show releases too", async () => {
    const [a] = await db.select().from(appointments).where(and(eq(appointments.doctorId, doctorId), eq(appointments.startAt, at("12:30"))));
    await cancelAppointment(a!.id, "Patient asked to cancel", actor);
    expect(await db.select().from(occupancy).where(eq(occupancy.appointmentId, a!.id))).toHaveLength(0);
    const again = await createAppointment(base({ startAt: at("12:30"), endAt: at("13:00") }), actor);
    expect(again.status).toBe("confirmed");
    await markAppointment(again.id, "no_show", actor);
    expect(await db.select().from(occupancy).where(eq(occupancy.appointmentId, again.id))).toHaveLength(0);
  });

  it("outside working hours needs acknowledgement; public-style bookings never get it", async () => {
    await expect(createAppointment(base({ startAt: at("08:00"), endAt: at("08:30") }), actor)).rejects.toBeInstanceOf(AcknowledgementRequired);
    const ok = await createAppointment(base({ startAt: at("08:00"), endAt: at("08:30"), allowOutsideHours: true }), actor);
    expect(ok.outsideHoursAck).toBe(true);
  });

  it("blocks cannot silently displace appointments; once clear they prevent booking", async () => {
    // 10:00–10:30 is occupied → block over the morning must fail and list it
    await expect(createBlock({ doctorId, startAt: at("09:00"), endAt: at("11:00"), allDay: false, kind: "leave", reason: "Conference" }, actor)).rejects.toMatchObject({ code: "conflict" });
    try {
      await createBlock({ doctorId, startAt: at("09:00"), endAt: at("11:00"), allDay: false, kind: "leave", reason: "Conference" }, actor);
    } catch (e) {
      const c = e as ConflictError;
      expect(c.affected.length).toBeGreaterThanOrEqual(2);
      expect(c.affected.map((a) => a.patientName)).toContain("Test Patient");
    }
    expect(await db.select().from(blocks).where(eq(blocks.doctorId, doctorId))).toHaveLength(0);
    // afternoon partial-day block on a free period
    const blk = await createBlock({ doctorId, startAt: at("17:00"), endAt: at("18:00"), allDay: false, kind: "block", reason: "Hospital round" }, actor);
    expect(blk.id).toBeTruthy();
    await expect(createAppointment(base({ clinicId: km, startAt: at("17:00"), endAt: at("17:30") }), actor)).rejects.toBeInstanceOf(ConflictError);
    const after = await createAppointment(base({ clinicId: km, startAt: at("18:00"), endAt: at("18:30") }), actor);
    expect(after.status).toBe("confirmed");
  });

  it("recurring blocks prevent booking and refuse to be created over existing bookings", async () => {
    await expect(
      createRecurringBlock({ doctorId, weekdays: [1], startTime: "18:00", endTime: "18:30", kind: "break", reason: "Tea" }, actor),
    ).rejects.toMatchObject({ code: "conflict" });
    await createRecurringBlock({ doctorId, weekdays: [1], startTime: "18:30", endTime: "19:00", kind: "break", reason: "Admin" }, actor);
    await expect(createAppointment(base({ clinicId: km, startAt: at("18:30"), endAt: at("19:00") }), actor)).rejects.toBeInstanceOf(ConflictError);
  });

  it("holds block time until they expire; expiry is enforced inside the booking transaction", async () => {
    const soon = new Date(Date.now() + 1500);
    const h = await createHold({ doctorId, clinicId: wf, startAt: at("12:30"), endAt: at("12:40"), expiresAt: soon, label: "Phone caller" }, actor);
    await expect(createAppointment(base({ startAt: at("12:30"), endAt: at("12:40") }), actor)).rejects.toBeInstanceOf(ConflictError);
    await new Promise((r) => setTimeout(r, 1700));
    // No background job ran; the booking itself purges the expired hold.
    const booked = await createAppointment(base({ startAt: at("12:30"), endAt: at("12:40") }), actor);
    expect(booked.status).toBe("confirmed");
    const [hold] = await db.select().from(holds).where(eq(holds.id, h.id));
    expect(hold!.releaseReason).toBe("expired");
  });

  it("idempotency key prevents duplicate appointments from repeated clicks", async () => {
    const key = `test-${run}-idem`;
    const a = await createAppointment(base({ startAt: at("10:00"), endAt: at("10:30"), clinicId: km, status: "requested", idempotencyKey: key }), actor);
    const b = await createAppointment(base({ startAt: at("10:00"), endAt: at("10:30"), clinicId: km, status: "requested", idempotencyKey: key }), actor);
    expect(b.id).toBe(a.id);
  });
});
