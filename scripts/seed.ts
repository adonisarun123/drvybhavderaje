/**
 * Seeds verified practice data only: the doctor record, the three clinics
 * published on the existing website, and default scheduling settings
 * (public slots OFF, no working hours — those are configured by staff).
 * Never seeds patients, enquiries or appointments. Safe to re-run.
 */
import "./load-env";
import { eq } from "drizzle-orm";
import { db, getPool } from "../lib/db/client";
import { clinics, doctors, schedulingSettings } from "../lib/db/schema";
import { CLINICS_SEED, mapsUrl } from "../lib/content";

async function main() {
  const [existingDoctor] = await db.select().from(doctors).where(eq(doctors.slug, "dr-vybhav-deraje"));
  const doctor =
    existingDoctor ??
    (await db.insert(doctors).values({ slug: "dr-vybhav-deraje", name: "Dr Vybhav Deraje", title: "Craniofacial & Plastic Surgeon", timezone: "Asia/Kolkata" }).returning())[0]!;
  console.log(`Doctor: ${doctor.name} (${doctor.id})`);

  for (const c of CLINICS_SEED) {
    const [existing] = await db.select().from(clinics).where(eq(clinics.slug, c.slug));
    if (existing) {
      console.log(`Clinic exists: ${c.name}`);
      continue;
    }
    await db.insert(clinics).values({ ...c, city: "Bengaluru", mapsUrl: mapsUrl(c.brand, c.addressLines), active: true });
    console.log(`Clinic created: ${c.name}`);
  }

  const [settings] = await db.select().from(schedulingSettings).where(eq(schedulingSettings.doctorId, doctor.id));
  if (!settings) {
    await db.insert(schedulingSettings).values({ doctorId: doctor.id });
    console.log("Scheduling settings created (public slots disabled, no working hours yet).");
  }
  await getPool().end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
