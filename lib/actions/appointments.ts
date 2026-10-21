"use server";

import { z } from "zod";
import { actorOf, requireStaff } from "@/lib/auth/guard";
import {
  cancelAppointment,
  confirmAppointment,
  createAppointment,
  createHold,
  extendHold,
  markAppointment,
  releaseHold,
  rescheduleAppointment,
  updateAppointmentDetails,
} from "@/lib/scheduling/engine";
import { normalisePhone } from "@/lib/phone";
import { fromLocalInputValue } from "@/lib/time";
import { ValidationError } from "@/lib/errors";
import { formToObject, parseOrThrow, run } from "./util";

const createSchema = z.object({
  doctorId: z.string().uuid(),
  clinicId: z.string().uuid("Choose a clinic"),
  patientName: z.string().trim().min(2, "Enter the patient’s name").max(80),
  phone: z.string().trim().min(8, "Enter a phone number").max(20),
  email: z.union([z.literal(""), z.string().trim().email("Invalid email")]).optional(),
  startAt: z.string().min(1, "Choose a start time"),
  durationMin: z.coerce.number().int().min(5).max(480),
  status: z.enum(["requested", "confirmed"]),
  source: z.enum(["phone", "walk_in", "referral", "email", "website", "other"]),
  notes: z.string().trim().max(2000).optional(),
  enquiryId: z.union([z.literal(""), z.string().uuid()]).optional(),
  idempotencyKey: z.string().uuid(),
  allowOutsideHours: z.string().optional(),
  holdMinutes: z.coerce.number().int().min(0).max(1440).optional(),
});

export async function createAppointmentAction(formData: FormData) {
  return run(async () => {
    const user = await requireStaff();
    const input = parseOrThrow(createSchema, formToObject(formData));
    const phoneE164 = normalisePhone(input.phone);
    if (!phoneE164) throw new ValidationError("Check the phone number.", { phone: ["Invalid phone number"] });
    const startAt = fromLocalInputValue(input.startAt);
    const endAt = new Date(startAt.getTime() + input.durationMin * 60_000);
    const appt = await createAppointment(
      {
        doctorId: input.doctorId,
        clinicId: input.clinicId,
        patientName: input.patientName,
        phoneE164,
        email: input.email || null,
        startAt,
        endAt,
        status: input.status,
        source: input.source,
        notes: input.notes || null,
        enquiryId: input.enquiryId || null,
        idempotencyKey: input.idempotencyKey,
        allowOutsideHours: input.allowOutsideHours === "on",
        holdMinutes: input.status === "requested" ? input.holdMinutes ?? 0 : 0,
      },
      actorOf(user),
    );
    return { id: appt.id, reference: appt.reference };
  });
}

export async function confirmAppointmentAction(id: string, allowOutsideHours = false) {
  return run(async () => {
    const user = await requireStaff();
    const a = await confirmAppointment(id, actorOf(user), { allowOutsideHours });
    return { id: a.id, status: a.status };
  });
}

const rescheduleSchema = z.object({
  startAt: z.string().min(1),
  durationMin: z.coerce.number().int().min(5).max(480),
  clinicId: z.string().uuid().optional(),
  reason: z.string().trim().max(300).optional(),
  allowOutsideHours: z.string().optional(),
});

export async function rescheduleAppointmentAction(id: string, formData: FormData) {
  return run(async () => {
    const user = await requireStaff();
    const input = parseOrThrow(rescheduleSchema, formToObject(formData));
    const startAt = fromLocalInputValue(input.startAt);
    const endAt = new Date(startAt.getTime() + input.durationMin * 60_000);
    const a = await rescheduleAppointment(id, { startAt, endAt, clinicId: input.clinicId, reason: input.reason, allowOutsideHours: input.allowOutsideHours === "on" }, actorOf(user));
    return { id: a.id, startAt: a.startAt.toISOString(), endAt: a.endAt.toISOString() };
  });
}

/** Used by calendar drag/drop after the user confirms the proposed change. */
export async function rescheduleByInstantAction(id: string, startIso: string, endIso: string, allowOutsideHours = false) {
  return run(async () => {
    const user = await requireStaff();
    const startAt = new Date(startIso);
    const endAt = new Date(endIso);
    if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) throw new ValidationError("Invalid time");
    const a = await rescheduleAppointment(id, { startAt, endAt, reason: "Moved on calendar", allowOutsideHours }, actorOf(user));
    return { id: a.id, startAt: a.startAt.toISOString(), endAt: a.endAt.toISOString() };
  });
}

export async function cancelAppointmentAction(id: string, reason: string) {
  return run(async () => {
    const user = await requireStaff();
    await cancelAppointment(id, reason, actorOf(user));
    return undefined;
  });
}

export async function markAppointmentAction(id: string, status: "arrived" | "completed" | "no_show") {
  return run(async () => {
    const user = await requireStaff();
    await markAppointment(id, status, actorOf(user));
    return undefined;
  });
}

const detailsSchema = z.object({
  patientName: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(8).max(20),
  email: z.union([z.literal(""), z.string().trim().email()]).optional(),
  notes: z.string().trim().max(2000).optional(),
});

export async function updateAppointmentDetailsAction(id: string, formData: FormData) {
  return run(async () => {
    const user = await requireStaff();
    const input = parseOrThrow(detailsSchema, formToObject(formData));
    const phoneE164 = normalisePhone(input.phone);
    if (!phoneE164) throw new ValidationError("Check the phone number.", { phone: ["Invalid phone number"] });
    await updateAppointmentDetails(id, { patientName: input.patientName, phoneE164, email: input.email || null, notes: input.notes || null }, actorOf(user));
    return undefined;
  });
}

const holdSchema = z.object({
  doctorId: z.string().uuid(),
  clinicId: z.string().uuid("Choose a clinic"),
  startAt: z.string().min(1),
  durationMin: z.coerce.number().int().min(5).max(480),
  expiresInMin: z.coerce.number().int().min(5).max(10080),
  label: z.string().trim().min(2, "Describe who the hold is for").max(120),
  enquiryId: z.union([z.literal(""), z.string().uuid()]).optional(),
  allowOutsideHours: z.string().optional(),
});

export async function createHoldAction(formData: FormData) {
  return run(async () => {
    const user = await requireStaff();
    const input = parseOrThrow(holdSchema, formToObject(formData));
    const startAt = fromLocalInputValue(input.startAt);
    const endAt = new Date(startAt.getTime() + input.durationMin * 60_000);
    const h = await createHold(
      { doctorId: input.doctorId, clinicId: input.clinicId, startAt, endAt, expiresAt: new Date(Date.now() + input.expiresInMin * 60_000), label: input.label, enquiryId: input.enquiryId || null, allowOutsideHours: input.allowOutsideHours === "on" },
      actorOf(user),
    );
    return { id: h.id };
  });
}

export async function releaseHoldAction(id: string) {
  return run(async () => {
    const user = await requireStaff();
    await releaseHold(id, actorOf(user));
    return undefined;
  });
}

export async function extendHoldAction(id: string, minutes: number) {
  return run(async () => {
    const user = await requireStaff();
    const h = await extendHold(id, new Date(Date.now() + Math.max(5, minutes) * 60_000), actorOf(user));
    return { expiresAt: h.expiresAt.toISOString() };
  });
}
