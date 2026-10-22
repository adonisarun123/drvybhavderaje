import "server-only";
import { and, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/client";
import { appointments, clinics, enquiries, enquiryNotes, user as userTable, auditEvents, ENQUIRY_STATUSES, type EnquiryStatus } from "../db/schema";
import { AppError, NotFoundError, ValidationError } from "../errors";
import { recordAudit, diff, PUBLIC_ACTOR, type Actor } from "../audit";
import { nextEnquiryReference } from "../references";
import { normalisePhone } from "../phone";
import { dialCodeFor } from "../dial-codes";
import { isClinicPreference } from "./preferences";
import { createAppointment, type CreateAppointmentInput } from "../scheduling/engine";

export const CONSENT_VERSION = "2026-10-privacy-v1";

export const publicEnquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  phone: z.string().trim().min(8, "Please enter a phone number").max(20),
  /** ISO country of the phone number (see lib/dial-codes.ts); "OTHER" means the number carries its own "+". */
  phoneCountry: z.string().trim().max(8).optional(),
  email: z.union([z.literal(""), z.string().trim().email("Please enter a valid email address").max(254)]).optional(),
  clinic: z.string().trim().min(1, "Please choose a clinic").max(64),
  preferredStart: z.string().trim().max(40).optional().or(z.literal("")),
  consent: z.literal(true, { error: "Please confirm you agree to be contacted" }),
  submissionId: z.string().uuid(),
  website: z.string().max(0).optional(), // honeypot
  startedAt: z.number().int().optional(),
});
export type PublicEnquiryInput = z.infer<typeof publicEnquirySchema>;

export async function createPublicEnquiry(
  input: PublicEnquiryInput,
  meta: { ipHash: string | null; userAgent: string | null },
) {
  const dialCode = dialCodeFor(input.phoneCountry);
  const phoneE164 = normalisePhone(input.phone, dialCode ?? "91");
  if (!phoneE164 || (!dialCode && input.phoneCountry === "OTHER" && !input.phone.trim().startsWith("+"))) {
    throw new ValidationError("Please check the phone number.", { phone: [input.phoneCountry === "OTHER" ? "Please include your country code, starting with +" : "Please enter a valid phone number"] });
  }
  let clinicId: string | null = null;
  let clinicPreference: string | null = null;
  if (isClinicPreference(input.clinic)) {
    clinicPreference = input.clinic;
  } else {
    const [c] = await db.select().from(clinics).where(and(eq(clinics.slug, input.clinic), eq(clinics.active, true)));
    if (!c) throw new ValidationError("Please choose a clinic.", { clinic: ["Please choose a clinic from the list"] });
    clinicId = c.id;
  }
  let preferredStartAt: Date | null = null;
  if (input.preferredStart) {
    const d = new Date(input.preferredStart);
    if (Number.isNaN(d.getTime()) || d < new Date()) throw new ValidationError("Please choose a valid preferred time.", { preferredStart: ["Please choose an upcoming time"] });
    preferredStartAt = d;
  }
  return db.transaction(async (tx) => {
    const [existing] = await tx.select().from(enquiries).where(eq(enquiries.idempotencyKey, input.submissionId));
    if (existing) return { enquiry: existing, duplicate: true };
    const reference = await nextEnquiryReference(tx);
    const [row] = await tx
      .insert(enquiries)
      .values({
        reference,
        name: input.name,
        phoneRaw: input.phoneCountry && input.phoneCountry !== "IN" ? `${input.phone} (${input.phoneCountry})` : input.phone,
        phoneE164,
        email: input.email || null,
        clinicId,
        clinicPreference,
        preferredStartAt,
        source: "website",
        status: "new",
        consentAt: new Date(),
        consentVersion: CONSENT_VERSION,
        idempotencyKey: input.submissionId,
        ipHash: meta.ipHash,
        userAgent: meta.userAgent?.slice(0, 300) ?? null,
      })
      .returning();
    await recordAudit(tx, { actor: PUBLIC_ACTOR, action: "enquiry.create", entityType: "enquiry", entityId: row!.id, summary: `Website enquiry ${reference} received` });
    return { enquiry: row!, duplicate: false };
  });
}

export const staffEnquirySchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(8).max(20),
  email: z.union([z.literal(""), z.string().trim().email().max(254)]).optional(),
  clinicId: z.string().uuid().optional().or(z.literal("")),
  source: z.enum(["phone", "walk_in", "referral", "email", "other"]),
  preferredNote: z.string().trim().max(300).optional(),
  note: z.string().trim().max(2000).optional(),
});

export async function createStaffEnquiry(input: z.infer<typeof staffEnquirySchema>, actor: Actor) {
  const phoneE164 = normalisePhone(input.phone);
  if (!phoneE164) throw new ValidationError("Please check the phone number.", { phone: ["Invalid phone number"] });
  return db.transaction(async (tx) => {
    const reference = await nextEnquiryReference(tx);
    const [row] = await tx
      .insert(enquiries)
      .values({
        reference,
        name: input.name,
        phoneRaw: input.phone,
        phoneE164,
        email: input.email || null,
        clinicId: input.clinicId || null,
        preferredNote: input.preferredNote || null,
        source: input.source,
        status: "new",
        assignedTo: actor.id,
        createdBy: actor.id,
      })
      .returning();
    if (input.note) await tx.insert(enquiryNotes).values({ enquiryId: row!.id, authorId: actor.id, body: input.note });
    await recordAudit(tx, { actor, action: "enquiry.create", entityType: "enquiry", entityId: row!.id, summary: `Logged ${input.source.replace("_", " ")} enquiry ${reference}` });
    return row!;
  });
}

export interface EnquiryFilters {
  q?: string;
  status?: string;
  clinicId?: string;
  assignedTo?: string;
  source?: string;
  page?: number;
  pageSize?: number;
}

export async function listEnquiries(f: EnquiryFilters) {
  const where: SQL[] = [];
  if (f.q) {
    const like = `%${f.q.trim()}%`;
    where.push(or(ilike(enquiries.name, like), ilike(enquiries.reference, like), ilike(enquiries.phoneE164, like), ilike(enquiries.phoneRaw, like), ilike(enquiries.email, like))!);
  }
  if (f.status && f.status !== "all") {
    if (f.status === "open") where.push(sql`${enquiries.status} NOT IN ('converted','closed','spam')`);
    else where.push(eq(enquiries.status, f.status));
  }
  if (f.clinicId) where.push(eq(enquiries.clinicId, f.clinicId));
  if (f.assignedTo === "unassigned") where.push(sql`${enquiries.assignedTo} IS NULL`);
  else if (f.assignedTo) where.push(eq(enquiries.assignedTo, f.assignedTo));
  if (f.source) where.push(eq(enquiries.source, f.source));
  const pageSize = Math.min(100, f.pageSize ?? 25);
  const page = Math.max(1, f.page ?? 1);
  const cond = where.length ? and(...where) : undefined;
  const rows = await db
    .select({
      e: enquiries,
      clinicName: clinics.name,
      assigneeName: userTable.name,
    })
    .from(enquiries)
    .leftJoin(clinics, eq(clinics.id, enquiries.clinicId))
    .leftJoin(userTable, eq(userTable.id, enquiries.assignedTo))
    .where(cond)
    .orderBy(desc(enquiries.receivedAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);
  const [count] = await db.select({ n: sql<number>`count(*)::int` }).from(enquiries).where(cond);
  return { rows, total: count?.n ?? 0, page, pageSize };
}

export async function getEnquiry(id: string) {
  const [row] = await db
    .select({ e: enquiries, clinicName: clinics.name, assigneeName: userTable.name })
    .from(enquiries)
    .leftJoin(clinics, eq(clinics.id, enquiries.clinicId))
    .leftJoin(userTable, eq(userTable.id, enquiries.assignedTo))
    .where(eq(enquiries.id, id));
  if (!row) throw new NotFoundError("Enquiry not found");
  const notes = await db
    .select({ n: enquiryNotes, authorName: userTable.name })
    .from(enquiryNotes)
    .leftJoin(userTable, eq(userTable.id, enquiryNotes.authorId))
    .where(eq(enquiryNotes.enquiryId, id))
    .orderBy(desc(enquiryNotes.createdAt));
  const activity = await db.select().from(auditEvents).where(and(eq(auditEvents.entityType, "enquiry"), eq(auditEvents.entityId, id))).orderBy(desc(auditEvents.createdAt));
  const linked = await db
    .select({ a: appointments, clinicName: clinics.name })
    .from(appointments)
    .leftJoin(clinics, eq(clinics.id, appointments.clinicId))
    .where(eq(appointments.enquiryId, id))
    .orderBy(desc(appointments.startAt));
  return { ...row, notes, activity, linked };
}

export async function addEnquiryNote(id: string, body: string, actor: Actor) {
  const text = body.trim();
  if (!text) throw new ValidationError("Note cannot be empty.", { body: ["Required"] });
  if (text.length > 4000) throw new ValidationError("Note is too long.", { body: ["Max 4000 characters"] });
  await db.transaction(async (tx) => {
    await tx.insert(enquiryNotes).values({ enquiryId: id, authorId: actor.id, body: text });
    await tx.update(enquiries).set({ updatedAt: new Date() }).where(eq(enquiries.id, id));
    await recordAudit(tx, { actor, action: "enquiry.note", entityType: "enquiry", entityId: id, summary: "Added a private note" });
  });
}

export async function updateEnquiry(
  id: string,
  change: { status?: EnquiryStatus; assignedTo?: string | null; followUpAt?: Date | null },
  actor: Actor,
) {
  if (change.status && !ENQUIRY_STATUSES.includes(change.status)) throw new ValidationError("Unknown status");
  return db.transaction(async (tx) => {
    const [before] = await tx.select().from(enquiries).where(eq(enquiries.id, id)).for("update");
    if (!before) throw new NotFoundError("Enquiry not found");
    if (change.status === "converted" && !before.id) throw new AppError("invalid", "Use “Create appointment” to convert an enquiry.");
    const set: Partial<typeof before> = { updatedAt: new Date() };
    if (change.status !== undefined) {
      set.status = change.status;
      set.closedAt = change.status === "closed" || change.status === "spam" ? new Date() : null;
    }
    if (change.assignedTo !== undefined) set.assignedTo = change.assignedTo;
    if (change.followUpAt !== undefined) set.followUpAt = change.followUpAt;
    const [after] = await tx.update(enquiries).set(set).where(eq(enquiries.id, id)).returning();
    const changes = diff(before as unknown as Record<string, unknown>, set as Record<string, unknown>);
    delete changes.updatedAt;
    if (Object.keys(changes).length) {
      await recordAudit(tx, { actor, action: "enquiry.update", entityType: "enquiry", entityId: id, summary: summariseChange(changes), changes });
    }
    return after!;
  });
}

function summariseChange(changes: Record<string, { from: unknown; to: unknown }>): string {
  const parts: string[] = [];
  if (changes.status) parts.push(`status → ${String(changes.status.to).replace(/_/g, " ")}`);
  if (changes.assignedTo) parts.push(changes.assignedTo.to ? "reassigned" : "unassigned");
  if (changes.followUpAt) parts.push(changes.followUpAt.to ? "follow-up date set" : "follow-up cleared");
  return parts.join(", ") || "updated";
}

/**
 * Convert an enquiry into an appointment. The enquiry record is retained and
 * linked; the appointment idempotency key prevents duplicates from repeated clicks.
 */
export async function convertEnquiry(id: string, input: Omit<CreateAppointmentInput, "enquiryId" | "patientName" | "phoneE164" | "email"> & { patientName?: string; phoneE164?: string; email?: string | null }, actor: Actor) {
  const [enq] = await db.select().from(enquiries).where(eq(enquiries.id, id));
  if (!enq) throw new NotFoundError("Enquiry not found");
  const appt = await createAppointment(
    {
      ...input,
      enquiryId: enq.id,
      patientName: input.patientName ?? enq.name,
      phoneE164: input.phoneE164 ?? enq.phoneE164,
      email: input.email === undefined ? enq.email : input.email,
      idempotencyKey: input.idempotencyKey ?? null,
    },
    actor,
  );
  await db.transaction(async (tx) => {
    const [cur] = await tx.select().from(enquiries).where(eq(enquiries.id, id)).for("update");
    if (cur && cur.status !== "converted") {
      await tx.update(enquiries).set({ status: "converted", updatedAt: new Date() }).where(eq(enquiries.id, id));
      await recordAudit(tx, { actor, action: "enquiry.convert", entityType: "enquiry", entityId: id, summary: `Converted to appointment ${appt.reference}`, changes: { appointmentId: appt.id, status: { from: cur.status, to: "converted" } } });
    }
  });
  return appt;
}
