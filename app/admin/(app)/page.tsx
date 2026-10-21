import Link from "next/link";
import { CalendarDays, Inbox, PlusCircle, Clock, Ban } from "lucide-react";
import { StatusBadge } from "@/components/admin/ui";
import { getPrimaryDoctor } from "@/lib/clinics";
import { dashboardStats, todaysAgenda } from "@/lib/admin/queries";
import { requireStaff, can } from "@/lib/auth/guard";
import { fmtDate, fmtDateTime, fmtTime } from "@/lib/time";

export default async function DashboardPage() {
  const user = await requireStaff();
  const doctor = await getPrimaryDoctor();
  const stats = await dashboardStats(doctor?.id ?? null);
  const agenda = await todaysAgenda();
  const canAvail = can(user, "availability:manage");
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p>
            {fmtDate(new Date())} · all times IST. Signed in as {user.name}.
          </p>
        </div>
        <div className="page-actions">
          <Link className="btn" href="/admin/appointments/new">
            <PlusCircle size={16} aria-hidden="true" /> Add appointment
          </Link>
          <Link className="btn secondary" href="/admin/enquiries?status=open">
            <Inbox size={16} aria-hidden="true" /> Review enquiries
          </Link>
          <Link className="btn secondary" href="/admin/calendar">
            <CalendarDays size={16} aria-hidden="true" /> Open calendar
          </Link>
          {canAvail && (
            <>
              <Link className="btn secondary" href="/admin/availability#blocks">
                <Ban size={16} aria-hidden="true" /> Block time
              </Link>
              <Link className="btn secondary" href="/admin/availability">
                <Clock size={16} aria-hidden="true" /> Edit availability
              </Link>
            </>
          )}
        </div>
      </div>
      {!doctor && (
        <div className="alert warn" style={{ marginBottom: 18 }}>
          No doctor record found. Run <code>npm run db:seed</code> to create the doctor and clinic records.
        </div>
      )}
      <div className="stats">
        <Link className="stat" href="/admin/enquiries?status=new">
          <span className="label">New enquiries</span>
          <span className="value">{stats.newEnquiries}</span>
        </Link>
        <Link className="stat" href="/admin/enquiries?status=open">
          <span className="label">Awaiting follow-up</span>
          <span className="value">{stats.awaitingFollowUp}</span>
          <span className="sub">open, follow-up due or unset</span>
        </Link>
        <Link className="stat" href={`/admin/appointments?from=${stats.today}&to=${stats.today}`}>
          <span className="label">Appointments today</span>
          <span className="value">{stats.todayAppts}</span>
        </Link>
        <Link className="stat" href="/admin/appointments?status=active">
          <span className="label">Upcoming (7 days)</span>
          <span className="value">{stats.upcoming}</span>
          <span className="sub">confirmed</span>
        </Link>
        <Link className="stat" href="/admin/appointments?status=requested">
          <span className="label">Pending requests</span>
          <span className="value">{stats.pendingRequests}</span>
          <span className="sub">need confirmation</span>
        </Link>
        <Link className="stat" href="/admin/appointments?status=cancelled">
          <span className="label">Cancelled · no-shows</span>
          <span className="value">
            {stats.cancelledRecent} · {stats.noShowRecent}
          </span>
          <span className="sub">last 30 days</span>
        </Link>
      </div>
      <div className="grid-2">
        <section className="card" aria-labelledby="today-h">
          <h2 id="today-h">Today’s schedule</h2>
          {agenda.length === 0 ? (
            <div className="empty">No appointments scheduled for today.</div>
          ) : (
            <div className="agenda">
              {agenda.map(({ a, clinicName }) => (
                <div className="agenda-item" key={a.id}>
                  <span className="time">
                    {fmtTime(a.startAt)}–{fmtTime(a.endAt)}
                  </span>
                  <span>
                    <Link href={`/admin/appointments/${a.id}`}>{a.patientName}</Link>
                    <br />
                    <span className="muted">
                      {a.reference} · {clinicName}
                    </span>
                  </span>
                  <StatusBadge status={a.status} />
                </div>
              ))}
            </div>
          )}
        </section>
        <section className="card" aria-labelledby="leave-h">
          <h2 id="leave-h">Upcoming leave &amp; blocked time</h2>
          {stats.upcomingBlocks.length === 0 ? (
            <div className="empty">No leave or blocked periods in the next 60 days.</div>
          ) : (
            <ul className="timeline">
              {stats.upcomingBlocks.map((b) => (
                <li key={b.id}>
                  <strong>{b.kind === "leave" ? "Leave" : b.kind === "holiday" ? "Holiday" : "Blocked"}</strong> — {b.reason}
                  <br />
                  <span className="when">
                    {b.allDay ? `${fmtDate(b.startAt)} → ${fmtDate(new Date(b.endAt.getTime() - 1))}` : `${fmtDateTime(b.startAt)} → ${fmtDateTime(b.endAt)}`}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {canAvail && (
            <p style={{ marginTop: 12 }}>
              <Link className="btn secondary sm" href="/admin/availability#blocks">
                Manage blocks
              </Link>
            </p>
          )}
        </section>
      </div>
    </>
  );
}
