"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { actorOf, requirePermission } from "@/lib/auth/guard";
import { db } from "@/lib/db/client";
import { clinics } from "@/lib/db/schema";
import { recordAudit, diff } from "@/lib/audit";
import { normalisePhone } from "@/lib/phone";
import { mapsUrl } from "@/lib/content";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { formToObject, parseOrThrow, run } from "./util";

const clinicSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().regex(/^[a-z0-9-]{2,40}$/, "Lowercase letters, numbers and hyphens only"),
  brand: z.string().trim().max(80).optional(),
  addressLines: z.string().trim().min(5).max(400),
  city: z.string().trim().min(2).max(80),
  postcode: z.string().trim().max(12).optional(),
  phone: z.string().trim().max(20).optional(),
  email: z.union([z.literal(""), z.string().trim().email()]).optional(),
  mapsUrl: z.union([z.literal(""), z.string().trim().url()]).optional(),
  publicNotes: z.string().trim().max(400).optional(),
  sortOrder: z.coerce.number().int().min(0).max(999),
  active: z.string().optional(),
});

function toValues(input: z.infer<typeof clinicSchema>) {
  const phone = input.phone ? normalisePhone(input.phone) : null;
  if (input.phone && !phone) throw new ValidationError("Check the phone number.", { phone: ["Invalid phone number"] });
  return {
    name: input.name,
    slug: input.slug,
    brand: input.brand ?? "",
    addressLines: input.addressLines,
    city: input.city,
    postcode: input.postcode || null,
    phone,
    email: input.email || null,
    mapsUrl: input.mapsUrl || mapsUrl(input.brand ?? "", input.addressLines),
    publicNotes: input.publicNotes || null,
    sortOrder: input.sortOrder,
    active: input.active === "on",
    updatedAt: new Date(),
  };
}

export async function createClinicAction(formData: FormData) {
  return run(async () => {
    const user = await requirePermission("clinics:manage");
    const values = toValues(parseOrThrow(clinicSchema, formToObject(formData)));
    const [row] = await db.insert(clinics).values(values).returning();
    await recordAudit(db, { actor: actorOf(user), action: "clinic.create", entityType: "clinic", entityId: row!.id, summary: `Created clinic ${values.name}`, changes: values });
    return { id: row!.id };
  }, ["/admin", "/practice-location", "/contact-us", "/aboutus", "/"]);
}

export async function updateClinicAction(id: string, formData: FormData) {
  return run(async () => {
    const user = await requirePermission("clinics:manage");
    const values = toValues(parseOrThrow(clinicSchema, formToObject(formData)));
    const [before] = await db.select().from(clinics).where(eq(clinics.id, id));
    if (!before) throw new NotFoundError("Clinic not found");
    await db.update(clinics).set(values).where(eq(clinics.id, id));
    await recordAudit(db, { actor: actorOf(user), action: "clinic.update", entityType: "clinic", entityId: id, summary: `Updated clinic ${values.name}`, changes: diff(before as unknown as Record<string, unknown>, values) });
    return undefined;
  }, ["/admin", "/practice-location", "/contact-us", "/aboutus", "/"]);
}
