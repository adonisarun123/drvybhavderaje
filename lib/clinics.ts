import { asc, eq } from "drizzle-orm";
import { db } from "./db/client";
import { clinics, doctors, weeklySessions, type Clinic } from "./db/schema";
import { CLINIC_HOURS_SEED, CLINICS_SEED, mapsUrl } from "./content";
import { groupSessions, type ClinicHours } from "./hours";
import { localDate } from "./time";

export interface PublicClinic {
  slug: string;
  name: string;
  brand: string;
  addressLines: string;
  city: string;
  postcode: string | null;
  phone: string | null;
  mapsUrl: string;
  /** Consultation hours at this clinic; empty when none are published. */
  hours: ClinicHours[];
  id?: string;
}

const FALLBACK: PublicClinic[] = CLINICS_SEED.map((c) => ({ ...c, city: "Bengaluru", mapsUrl: mapsUrl(c.brand, c.addressLines), hours: CLINIC_HOURS_SEED[c.slug] ?? [] }));

/** Active clinics for the public site. Falls back to the verified seed list if the database is unreachable so public pages always render. */
export async function getPublicClinics(): Promise<PublicClinic[]> {
  if (!process.env.DATABASE_URL) return FALLBACK;
  try {
    const rows = await db.select().from(clinics).where(eq(clinics.active, true)).orderBy(asc(clinics.sortOrder));
    if (!rows.length) return FALLBACK;
    // Hours come from the same weekly sessions that drive the booking calendar, so the two cannot disagree.
    const today = localDate(new Date());
    const sessions = (await db.select().from(weeklySessions).where(eq(weeklySessions.active, true))).filter((s) => (!s.effectiveFrom || s.effectiveFrom <= today) && (!s.effectiveTo || s.effectiveTo >= today));
    return rows.map((c) => toPublic(c, groupSessions(sessions.filter((s) => s.clinicId === c.id))));
  } catch (e) {
    console.error("getPublicClinics: database unavailable, using seed list", e);
    return FALLBACK;
  }
}

export function toPublic(c: Clinic, hours: ClinicHours[] = []): PublicClinic {
  return { hours, id: c.id, slug: c.slug, name: c.name, brand: c.brand, addressLines: c.addressLines, city: c.city, postcode: c.postcode, phone: c.phone, mapsUrl: c.mapsUrl ?? mapsUrl(c.brand, c.addressLines) };
}

export async function getPrimaryDoctor() {
  const [d] = await db.select().from(doctors).where(eq(doctors.active, true)).orderBy(asc(doctors.createdAt)).limit(1);
  return d ?? null;
}

export async function listClinics() {
  return db.select().from(clinics).orderBy(asc(clinics.sortOrder), asc(clinics.name));
}
