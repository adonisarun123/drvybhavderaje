"use server";

import { z } from "zod";
import { actorOf, requireStaff } from "@/lib/auth/guard";
import { addEnquiryNote, convertEnquiry, createStaffEnquiry, staffEnquirySchema, updateEnquiry } from "@/lib/enquiries/service";
import { ENQUIRY_STATUSES } from "@/lib/db/schema";
import { normalisePhone } from "@/lib/phone";
import { fromLocalInputValue } from "@/lib/time";
import { ValidationError } from "@/lib/errors";
import { formToObject, parseOrThrow, run } from "./util";

export async function createStaffEnquiryAction(formData: FormData) {
  return run(async () => {
    const user = await requireStaff();
    const input = parseOrThrow(staffEnquirySchema, formToObject(formData));
    const row = await createStaffEnquiry(input, actorOf(user));
    return { id: row.id, reference: row.reference };
  });
}

const updateSchema = z.object({
  status: z.enum(ENQUIRY_STATUSES).optional(),
  assignedTo: z.string().optional(),
  followUpAt: z.string().optional(),
});

export async function updateEnquiryAction(id: string, formData: FormData) {
  return run(async () => {
    const user = await requireStaff();
    const input = parseOrThrow(updateSchema, formToObject(formData));
    if (input.status === "converted") throw new ValidationError("Use “Create appointment” to convert an enquiry.");
    const change: Parameters<typeof updateEnquiry>[1] = {};
    if (input.status) change.status = input.status;
    if (input.assignedTo !== undefined) change.assignedTo = input.assignedTo === "" ? null : input.assignedTo;
    if (input.followUpAt !== undefined) change.followUpAt = input.followUpAt === "" ? null : fromLocalInputValue(input.followUpAt);
    await updateEnquiry(id, change, actorOf(user));
    return undefined;
  });
}

export async function addEnquiryNoteAction(id: string, formData: FormData) {
  return run(async () => {
    const user = await requireStaff();
    await addEnquiryNote(id, String(formData.get("body") ?? ""), actorOf(user));
    return undefined;
  });
}

const convertSchema = z.object({
  clinicId: z.string().uuid("Choose a clinic"),
  doctorId: z.string().uuid(),
  startAt: z.string().min(1, "Choose a start time"),
  durationMin: z.coerce.number().int().min(5).max(480),
  status: z.enum(["requested", "confirmed"]),
  patientName: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(8).max(20),
  email: z.union([z.literal(""), z.string().trim().email()]).optional(),
  notes: z.string().trim().max(2000).optional(),
  idempotencyKey: z.string().uuid(),
  allowOutsideHours: z.string().optional(),
  holdMinutes: z.coerce.number().int().min(0).max(1440).optional(),
});

export async function convertEnquiryAction(id: string, formData: FormData) {
  return run(async () => {
    const user = await requireStaff();
    const input = parseOrThrow(convertSchema, formToObject(formData));
    const phoneE164 = normalisePhone(input.phone);
    if (!phoneE164) throw new ValidationError("Check the phone number.", { phone: ["Invalid phone number"] });
    const startAt = fromLocalInputValue(input.startAt);
    const endAt = new Date(startAt.getTime() + input.durationMin * 60_000);
    const appt = await convertEnquiry(
      id,
      {
        doctorId: input.doctorId,
        clinicId: input.clinicId,
        startAt,
        endAt,
        status: input.status,
        source: "website",
        notes: input.notes || null,
        idempotencyKey: input.idempotencyKey,
        allowOutsideHours: input.allowOutsideHours === "on",
        patientName: input.patientName,
        phoneE164,
        email: input.email || null,
        holdMinutes: input.status === "requested" ? input.holdMinutes ?? 0 : 0,
      },
      actorOf(user),
    );
    return { id: appt.id, reference: appt.reference };
  });
}
