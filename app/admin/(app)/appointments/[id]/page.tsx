import Link from "next/link";
import { notFound } from "next/navigation";
import { AppointmentActions } from "@/components/admin/appointment-actions";
import { StatusBadge } from "@/components/admin/ui";
import { requireStaff } from "@/lib/auth/guard";
import { listClinics } from "@/lib/clinics";
import { getAppointment } from "@/lib/admin/queries";
import { db } from "@/lib/db/client";
import { notificationLog } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { formatPhone } from "@/lib/phone";
import { fmtDateTime, fmtTimeRange, toLocalInputValue } from "@/lib/time";
import { emailConfigured } from "@/lib/notifications";

export default async function AppointmentDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  await requireStaff();
  const { id } = await params;
  const { created } = await searchParams;
  const data = await getAppointment(id);
  if (!data) notFound();
  const { a, clinicName, enquiryRef, createdByName, history, hold } = data;
  const clinics = (await listClinics()).filter((c) => c.active);
  const notifications = await db.select().from(notificationLog).where(eq(notificationLog.appointmentId, id)).orderBy(desc(notificationLog.createdAt));
  const durationMin = Math.round((a.endAt.getTime() - a.startAt.getTime()) / 60_000);
  return (
    <>
      <div className="page-head">
        <div>
          <h1>
            {a.reference} · {a.patientName}
          </h1>
          <p>
            {fmtDateTime(a.startAt)} · {fmtTimeRange(a.startAt, a.endAt)} · {clinicName} · <StatusBadge status={a.status} />
          </p>
        </div>
        <div className="page-actions">
          <Link className="btn secondary" href="/admin/appointments">
            ← All appointments
          </Link>
          <Link className="btn secondary" href={`/admin/calendar?date=${a.startAt.toISOString().slice(0, 10)}`}>
            View in calendar
          </Link>
        </div>
      </div>
      {created && (
        <div className="alert success" style={{ marginBottom: 16 }}>
          Appointment saved{a.status === "confirmed" ? " and the time has been reserved" : " as a request — confirm it to reserve the time"}.
          {!emailConfigured() && " No notification was sent: no email provider is configured, so please contact the patient directly."}
        </div>
      )}
      <div className="grid-2">
        <div className="stack">
          <section className="card">
            <h2>Details</h2>
            <dl className="kv">
              <dt>Patient / contact</dt>
              <dd>{a.patientName}</dd>
              <dt>Phone</dt>
              <dd>
                <a href={`tel:${a.phoneE164}`}>{formatPhone(a.phoneE164)}</a>
              </dd>
              <dt>Email</dt>
              <dd>{a.email ? <a href={`mailto:${a.email}`}>{a.email}</a> : "—"}</dd>
              <dt>Clinic</dt>
              <dd>{clinicName}</dd>
              <dt>Time</dt>
              <dd>
                {fmtDateTime(a.startAt)} → {fmtDateTime(a.endAt)} ({durationMin} min)
              </dd>
              <dt>Source</dt>
              <dd>{a.source.replace("_", " ")}</dd>
              <dt>Linked enquiry</dt>
              <dd>{a.enquiryId ? <Link href={`/admin/enquiries/${a.enquiryId}`}>{enquiryRef}</Link> : "—"}</dd>
              <dt>Created</dt>
              <dd>
                {fmtDateTime(a.createdAt)} by {createdByName ?? "—"}
              </dd>
              {a.outsideHoursAck && (
                <>
                  <dt>Note</dt>
                  <dd>Booked outside published working hours (acknowledged by staff).</dd>
                </>
              )}
              {a.cancellationReason && (
                <>
                  <dt>Cancellation</dt>
                  <dd>
                    {a.cancellationReason} ({fmtDateTime(a.cancelledAt)})
                  </dd>
                </>
              )}
              <dt>Operational notes</dt>
              <dd style={{ whiteSpace: "pre-wrap" }}>{a.notes || "—"}</dd>
            </dl>
          </section>
          <section className="card">
            <h2>Actions</h2>
            <AppointmentActions
              id={a.id}
              status={a.status}
              clinics={clinics.map((c) => ({ id: c.id, name: c.name }))}
              clinicId={a.clinicId}
              startAtLocal={toLocalInputValue(a.startAt)}
              durationMin={durationMin}
              patientName={a.patientName}
              phone={a.phoneE164}
              email={a.email ?? ""}
              notes={a.notes ?? ""}
              hold={hold ? { id: hold.id, expiresAt: hold.expiresAt.toISOString() } : null}
            />
          </section>
        </div>
        <div className="stack">
          <section className="card">
            <h2>History</h2>
            {history.length === 0 ? (
              <div className="empty">No history.</div>
            ) : (
              <ul className="timeline">
                {history.map((ev) => (
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
          <section className="card">
            <h2>Notifications</h2>
            {notifications.length === 0 ? (
              <div className="empty">{emailConfigured() ? "No notifications sent for this appointment." : "No notification provider configured — contact the patient by phone."}</div>
            ) : (
              <ul className="timeline">
                {notifications.map((n) => (
                  <li key={n.id}>
                    {n.channel} to {n.recipient}: <StatusBadge status={n.status === "sent" ? "confirmed" : n.status === "failed" ? "cancelled" : "requested"} /> {n.status.replace("_", " ")}
                    {n.error ? ` — ${n.error}` : ""}
                    <br />
                    <span className="when">{fmtDateTime(n.createdAt)}</span>
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
