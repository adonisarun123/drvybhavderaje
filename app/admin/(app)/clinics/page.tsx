import { ClinicForm } from "@/components/admin/clinic-form";
import { StatusBadge } from "@/components/admin/ui";
import { can, requireStaff } from "@/lib/auth/guard";
import { getPrimaryDoctor, listClinics } from "@/lib/clinics";
import { formatPhone } from "@/lib/phone";

export default async function ClinicsPage() {
  const user = await requireStaff();
  const canEdit = can(user, "clinics:manage");
  const [clinics, doctor] = await Promise.all([listClinics(), getPrimaryDoctor()]);
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Clinic settings</h1>
          <p>Clinic details shown on the public website and used for bookings. Doctor: {doctor?.name ?? "not seeded"} · timezone {doctor?.timezone ?? "Asia/Kolkata"}.</p>
        </div>
      </div>
      {!canEdit && <div className="alert warn" style={{ marginBottom: 18 }}>Only administrators (or staff granted “clinics:manage”) can change clinic details.</div>}
      <div className="stack">
        {clinics.map((c) => (
          <section className="card" key={c.id}>
            <h2>
              {c.brand ? `${c.brand} · ` : ""}
              {c.name} <StatusBadge status={c.active ? "active" : "inactive"} />
            </h2>
            <dl className="kv">
              <dt>Address</dt>
              <dd>{c.addressLines}</dd>
              <dt>Phone</dt>
              <dd>{c.phone ? formatPhone(c.phone) : "—"}</dd>
              <dt>Maps</dt>
              <dd>{c.mapsUrl ? <a href={c.mapsUrl} target="_blank" rel="noopener noreferrer">Directions link</a> : "—"}</dd>
              <dt>Slug</dt>
              <dd className="muted">{c.slug}</dd>
            </dl>
            <ClinicForm canEdit={canEdit} initial={{ id: c.id, name: c.name, slug: c.slug, brand: c.brand, addressLines: c.addressLines, city: c.city, postcode: c.postcode ?? "", phone: c.phone ?? "", email: c.email ?? "", mapsUrl: c.mapsUrl ?? "", publicNotes: c.publicNotes ?? "", sortOrder: c.sortOrder, active: c.active }} />
          </section>
        ))}
        {canEdit && (
          <section className="card">
            <h2>Add a clinic</h2>
            <ClinicForm canEdit={canEdit} />
          </section>
        )}
      </div>
    </>
  );
}
