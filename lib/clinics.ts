import { asc, eq } from "drizzle-orm";
import { db } from "./db/client";
import { clinics, doctors, type Clinic } from "./db/schema";
import { CLINICS_SEED, mapsUrl } from "./content";

export interface PublicClinic {
  slug: string;
  name: string;
  brand: string;
  addressLines: string;
  city: string;
  postcode: string | null;
  phone: string | null;
  mapsUrl: string;
  id?: string;
}

const FALLBACK: PublicClinic[] = CLINICS_SEED.map((c) => ({ ...c, city: "Bengaluru", mapsUrl: mapsUrl(c.brand, c.addressLines) }));

/** Active clinics for the public site. Falls back to the verified seed list if the database is unreachable so public pages always render. */
export async function getPublicClinics(): Promise<PublicClinic[]> {
  if (!process.env.DATABASE_URL) return FALLBACK;
  try {
    const rows = await db.select().from(clinics).where(eq(clinics.active, true)).orderBy(asc(clinics.sortOrder));
    if (!rows.length) return FALLBACK;
    return rows.map(toPublic);
  } catch (e) {
    console.error("getPublicClinics: database unavailable, using seed list", e);
    return FALLBACK;
  }
}

export function toPublic(c: Clinic): PublicClinic {
  return { id: c.id, slug: c.slug, name: c.name, brand: c.brand, addressLines: c.addressLines, city: c.city, postcode: c.postcode, phone: c.phone, mapsUrl: c.mapsUrl ?? mapsUrl(c.brand, c.addressLines) };
}

export async function getPrimaryDoctor() {
  const [d] = await db.select().from(doctors).where(eq(doctors.active, true)).orderBy(asc(doctors.createdAt)).limit(1);
  return d ?? null;
}

export async function listClinics() {
  return db.select().from(clinics).orderBy(asc(clinics.sortOrder), asc(clinics.name));
}
