import Link from "next/link";
import { Pagination, StatusBadge } from "@/components/admin/ui";
import { requireStaff } from "@/lib/auth/guard";
import { listClinics } from "@/lib/clinics";
import { listAppointments } from "@/lib/admin/queries";
import { APPOINTMENT_STATUSES } from "@/lib/db/schema";
import { formatPhone } from "@/lib/phone";
import { fmtDateTime, fmtTime } from "@/lib/time";

export default async function AppointmentsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireStaff();
  const sp = await searchParams;
  const filters = { q: sp.q, status: sp.status ?? "active", clinicId: sp.clinic, from: sp.from, to: sp.to, page: Number(sp.page ?? 1) };
  const [{ rows, total, page, pageSize }, clinics] = await Promise.all([listAppointments(filters), listClinics()]);
  const qs = new URLSearchParams(Object.entries(sp).filter(([k, v]) => v && k !== "page") as [string, string][]).toString();
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Appointments</h1>
          <p>All times IST. Confirmed, arrived and completed appointments occupy the doctor’s time; requested ones do not until confirmed.</p>
        </div>
        <div className="page-actions">
          <Link className="btn" href="/admin/appointments/new">
            Add appointment
          </Link>
          <Link className="btn secondary" href="/admin/calendar">
            Calendar
          </Link>
        </div>
      </div>
      <form className="filters" method="get">
        <label>
          Search
          <input name="q" defaultValue={sp.q ?? ""} placeholder="Name, phone, reference" />
        </label>
        <label>
          Status
          <select name="status" defaultValue={filters.status}>
            <option value="active">Active (requested/confirmed/arrived)</option>
            <option value="all">All</option>
            {APPOINTMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
        </label>
        <label>
          Clinic
          <select name="clinic" defaultValue={sp.clinic ?? ""}>
            <option value="">Any</option>
            {clinics.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          From
          <input type="date" name="from" defaultValue={sp.from ?? ""} />
        </label>
        <label>
          To
          <input type="date" name="to" defaultValue={sp.to ?? ""} />
        </label>
        <button className="btn secondary" type="submit">
          Filter
        </button>
      </form>
      {rows.length === 0 ? (
        <div className="empty">No appointments match these filters.</div>
      ) : (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Reference</th>
                <th>When (IST)</th>
                <th>Patient</th>
                <th>Clinic</th>
                <th>Status</th>
                <th>Source</th>
                <th>Enquiry</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ a, clinicName, enquiryRef }) => (
                <tr key={a.id}>
                  <td>
                    <Link href={`/admin/appointments/${a.id}`}>{a.reference}</Link>
                  </td>
                  <td>
                    {fmtDateTime(a.startAt)} – {fmtTime(a.endAt)}
                  </td>
                  <td>
                    {a.patientName}
                    <br />
                    <span className="muted">{formatPhone(a.phoneE164)}</span>
                  </td>
                  <td>{clinicName}</td>
                  <td>
                    <StatusBadge status={a.status} />
                  </td>
                  <td>{a.source.replace("_", " ")}</td>
                  <td>{a.enquiryId ? <Link href={`/admin/enquiries/${a.enquiryId}`}>{enquiryRef}</Link> : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={page} pageSize={pageSize} total={total} base={`/admin/appointments${qs ? `?${qs}` : ""}`} />
    </>
  );
}
