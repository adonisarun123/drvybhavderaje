import { clinicPreferenceLabel } from "@/lib/enquiries/preferences";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EnquiryNoteForm, EnquiryStatusForm } from "@/components/admin/enquiry-panels";
import { AppointmentForm } from "@/components/admin/appointment-form";
import { StatusBadge } from "@/components/admin/ui";
import { convertEnquiryAction } from "@/lib/actions/enquiries";
import { requireStaff } from "@/lib/auth/guard";
import { getPrimaryDoctor, listClinics } from "@/lib/clinics";
import { getEnquiry } from "@/lib/enquiries/service";
import { listStaff } from "@/lib/staff/service";
import { db } from "@/lib/db/client";
import { loadPolicy } from "@/lib/scheduling/engine";
import { formatPhone } from "@/lib/phone";
import { fmtDateTime, toLocalInputValue } from "@/lib/time";
import { NotFoundError } from "@/lib/errors";

export default async function EnquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const { id } = await params;
  let data: Awaited<ReturnType<typeof getEnquiry>>;
  try {
    data = await getEnquiry(id);
  } catch (e) {
    if (e instanceof NotFoundError) notFound();
    throw e;
  }
  const { e, clinicName, assigneeName, notes, activity, linked } = data;
  const [staff, clinics, doctor] = await Promise.all([listStaff(), listClinics(), getPrimaryDoctor()]);
  const policy = doctor ? await db.transaction((tx) => loadPolicy(tx, doctor.id)) : null;
  const convert = convertEnquiryAction.bind(null, e.id);
  return (
    <>
      <div className="page-head">
        <div>
          <h1>
            {e.reference} · {e.name}
          </h1>
          <p>
            Received {fmtDateTime(e.receivedAt)} via {e.source.replace("_", " ")} · <StatusBadge status={e.status} />
          </p>
        </div>
        <div className="page-actions">
          <Link className="btn secondary" href="/admin/enquiries">
            ← All enquiries
          </Link>
        </div>
      </div>
      <div className="grid-2">
        <div className="stack">
          <section className="card">
            <h2>Submission</h2>
            <dl className="kv">
              <dt>Name</dt>
              <dd>{e.name}</dd>
              <dt>Phone</dt>
              <dd>
                <a href={`tel:${e.phoneE164}`}>{formatPhone(e.phoneE164)}</a> <span className="muted">(entered as “{e.phoneRaw}”)</span>
              </dd>
              <dt>Email</dt>
              <dd>{e.email ? <a href={`mailto:${e.email}`}>{e.email}</a> : "—"}</dd>
              <dt>Preferred clinic</dt>
              <dd>{clinicName ?? clinicPreferenceLabel(e.clinicPreference, "Not specified")}</dd>
              <dt>Preferred time</dt>
              <dd>{e.preferredStartAt ? fmtDateTime(e.preferredStartAt) : e.preferredNote ?? "—"}</dd>
              <dt>Consent</dt>
              <dd>{e.consentAt ? `Contact consent given ${fmtDateTime(e.consentAt)} (${e.consentVersion})` : "Logged by staff"}</dd>
              <dt>Assigned</dt>
              <dd>{assigneeName ?? "Unassigned"}</dd>
            </dl>
          </section>
          <section className="card">
            <h2>Status, assignment &amp; follow-up</h2>
            <EnquiryStatusForm id={e.id} status={e.status} assignedTo={e.assignedTo} followUpAt={toLocalInputValue(e.followUpAt)} staff={staff.filter((s) => !s.banned).map((s) => ({ id: s.id, name: s.name }))} />
          </section>
          <section className="card">
            <h2>Private notes</h2>
            <p className="help" style={{ marginBottom: 12 }}>
              Operational notes only — not a clinical record. Visible to staff, never to the patient.
            </p>
            <EnquiryNoteForm id={e.id} />
            <div className="stack" style={{ marginTop: 14 }}>
              {notes.length === 0 ? <div className="empty">No notes yet.</div> : notes.map(({ n, authorName }) => (
                <div className="note-item" key={n.id}>
                  <div className="meta">
                    {authorName ?? "Staff"} · {fmtDateTime(n.createdAt)}
                  </div>
                  {n.body}
                </div>
              ))}
            </div>
          </section>
        </div>
        <div className="stack">
          <section className="card">
            <h2>Linked appointments</h2>
            {linked.length === 0 ? (
              <div className="empty">No appointment yet.</div>
            ) : (
              <ul className="timeline">
                {linked.map(({ a, clinicName: cn }) => (
                  <li key={a.id}>
                    <Link href={`/admin/appointments/${a.id}`}>{a.reference}</Link> — {fmtDateTime(a.startAt)}, {cn} <StatusBadge status={a.status} />
                  </li>
                ))}
              </ul>
            )}
          </section>
          {doctor && policy && e.status !== "spam" && (
            <section className="card">
              <h2>Create appointment from this enquiry</h2>
              <p className="help" style={{ marginBottom: 12 }}>
                The enquiry stays on record and is linked to the appointment. Repeated clicks will not create duplicates.
              </p>
              <AppointmentForm
                doctorId={doctor.id}
                clinics={clinics.filter((c) => c.active).map((c) => ({ id: c.id, name: c.name }))}
                defaults={{ patientName: e.name, phone: e.phoneE164, email: e.email ?? "", clinicId: e.clinicId ?? "", startAt: toLocalInputValue(e.preferredStartAt), enquiryId: e.id, source: "website" }}
                defaultDurationMin={policy.defaultDurationMin}
                holdMinutes={policy.holdMinutes}
                action={convert}
                submitLabel="Create appointment"
                showSource={false}
              />
            </section>
          )}
          <section className="card">
            <h2>Activity history</h2>
            {activity.length === 0 ? (
              <div className="empty">No activity recorded.</div>
            ) : (
              <ul className="timeline">
                {activity.map((ev) => (
                  <li key={ev.id}>
                    {ev.summary}
                    <br />
                    <span className="when">
                      {ev.actorLabel} · {fmtDateTime(ev.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
