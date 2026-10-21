import { desc, eq, and, ilike, type SQL } from "drizzle-orm";
import { Pagination } from "@/components/admin/ui";
import { can, requireStaff } from "@/lib/auth/guard";
import { Forbidden } from "@/components/admin/forbidden";
import { db } from "@/lib/db/client";
import { auditEvents } from "@/lib/db/schema";
import { fmtDateTime } from "@/lib/time";

export default async function AuditPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const me = await requireStaff();
  if (!can(me, "audit:view")) return <Forbidden what="the audit history" />;
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1));
  const pageSize = 50;
  const where: SQL[] = [];
  if (sp.entity) where.push(eq(auditEvents.entityType, sp.entity));
  if (sp.q) where.push(ilike(auditEvents.summary, `%${sp.q}%`));
  const cond = where.length ? and(...where) : undefined;
  const rows = await db.select().from(auditEvents).where(cond).orderBy(desc(auditEvents.createdAt)).limit(pageSize).offset((page - 1) * pageSize);
  const [{ n } = { n: 0 }] = await db.select({ n: db.$count(auditEvents, cond) }).from(auditEvents).limit(1);
  const qs = new URLSearchParams(Object.entries(sp).filter(([k, v]) => v && k !== "page") as [string, string][]).toString();
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Audit history</h1>
          <p>Who created, confirmed, rescheduled, cancelled or blocked what, and when. Operational only — no secrets or clinical detail.</p>
        </div>
      </div>
      <form className="filters" method="get">
        <label>
          Entity
          <select name="entity" defaultValue={sp.entity ?? ""}>
            <option value="">All</option>
            {["appointment", "enquiry", "hold", "block", "recurring_block", "weekly_session", "date_override", "scheduling_settings", "clinic", "user", "invitation"].map((e) => (
              <option key={e} value={e}>
                {e.replace("_", " ")}
              </option>
            ))}
          </select>
        </label>
        <label>
          Search summary
          <input name="q" defaultValue={sp.q ?? ""} />
        </label>
        <button className="btn secondary" type="submit">
          Filter
        </button>
      </form>
      {rows.length === 0 ? (
        <div className="empty">No audit events yet.</div>
      ) : (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>When (IST)</th>
                <th>Who</th>
                <th>Action</th>
                <th>Summary</th>
                <th>Changes</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{fmtDateTime(r.createdAt)}</td>
                  <td>{r.actorLabel}</td>
                  <td className="muted">{r.action}</td>
                  <td>{r.summary}</td>
                  <td className="muted" style={{ maxWidth: 360, wordBreak: "break-word" }}>
                    {r.changes ? JSON.stringify(r.changes) : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={page} pageSize={pageSize} total={Number(n)} base={`/admin/audit${qs ? `?${qs}` : ""}`} />
    </>
  );
}
