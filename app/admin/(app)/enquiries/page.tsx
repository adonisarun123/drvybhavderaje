import Link from "next/link";
import { Pagination, StatusBadge } from "@/components/admin/ui";
import { requireStaff } from "@/lib/auth/guard";
import { listClinics } from "@/lib/clinics";
import { listEnquiries } from "@/lib/enquiries/service";
import { listStaff } from "@/lib/staff/service";
import { ENQUIRY_STATUSES } from "@/lib/db/schema";
import { formatPhone } from "@/lib/phone";
import { fmtDateTime } from "@/lib/time";

export default async function EnquiriesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireStaff();
  const sp = await searchParams;
  const filters = { q: sp.q, status: sp.status ?? "open", clinicId: sp.clinic, assignedTo: sp.assigned, source: sp.source, page: Number(sp.page ?? 1) };
  const [{ rows, total, page, pageSize }, clinics, staff] = await Promise.all([listEnquiries(filters), listClinics(), listStaff()]);
  const qs = new URLSearchParams(Object.entries(sp).filter(([k, v]) => v && k !== "page") as [string, string][]).toString();
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Enquiries</h1>
          <p>Consultation requests from the website and enquiries logged by staff.</p>
        </div>
        <div className="page-actions">
          <Link className="btn" href="/admin/enquiries/new">
            Log phone enquiry
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
            <option value="open">Open (not converted/closed)</option>
            <option value="all">All</option>
            {ENQUIRY_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
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
          Assigned
          <select name="assigned" defaultValue={sp.assigned ?? ""}>
            <option value="">Anyone</option>
            <option value="unassigned">Unassigned</option>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Source
          <select name="source" defaultValue={sp.source ?? ""}>
            <option value="">Any</option>
            {["website", "phone", "walk_in", "referral", "email", "other"].map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
        </label>
        <button className="btn secondary" type="submit">
          Filter
        </button>
      </form>
      {rows.length === 0 ? (
        <div className="empty">No enquiries match these filters. New website requests will appear here as soon as they are received.</div>
      ) : (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Name &amp; contact</th>
                <th>Preferred clinic</th>
                <th>Preferred time</th>
                <th>Source</th>
                <th>Received</th>
                <th>Assigned</th>
                <th>Status</th>
                <th>Follow-up</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ e, clinicName, assigneeName }) => (
                <tr key={e.id}>
                  <td>
                    <Link href={`/admin/enquiries/${e.id}`}>{e.reference}</Link>
                  </td>
                  <td>
                    {e.name}
                    <br />
                    <span className="muted">
                      {formatPhone(e.phoneE164)}
                      {e.email ? ` · ${e.email}` : ""}
                    </span>
                  </td>
                  <td>{clinicName ?? (e.clinicPreference === "help_me_choose" ? "Help me choose" : "—")}</td>
                  <td>{e.preferredStartAt ? fmtDateTime(e.preferredStartAt) : e.preferredNote ?? "—"}</td>
                  <td>{e.source.replace("_", " ")}</td>
                  <td>{fmtDateTime(e.receivedAt)}</td>
                  <td>{assigneeName ?? <span className="muted">Unassigned</span>}</td>
                  <td>
                    <StatusBadge status={e.status} />
                  </td>
                  <td>{e.followUpAt ? fmtDateTime(e.followUpAt) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={page} pageSize={pageSize} total={total} base={`/admin/enquiries${qs ? `?${qs}` : ""}`} />
    </>
  );
}
