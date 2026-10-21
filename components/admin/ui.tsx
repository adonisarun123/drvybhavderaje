import Link from "next/link";
import type { ActionResult } from "@/lib/errors";
import { fmtDateTime } from "@/lib/time";

export function StatusBadge({ status }: { status: string }) {
  return <span className={`badge ${status}`}>{status.replace(/_/g, " ")}</span>;
}

/** Renders any failed ActionResult, including booking conflicts and affected appointments. */
export function ResultAlert({ result }: { result: ActionResult<unknown> | null | undefined }) {
  if (!result) return null;
  if (result.ok) return null;
  return (
    <div className={`alert ${result.code === "ack_required" ? "warn" : "error"}`} role="alert">
      <strong>{result.message}</strong>
      {result.fieldErrors && (
        <ul>
          {Object.entries(result.fieldErrors).map(([k, v]) => (
            <li key={k}>
              {k}: {v.join(", ")}
            </li>
          ))}
        </ul>
      )}
      {result.conflicts && result.conflicts.length > 0 && (
        <ul>
          {result.conflicts.map((c) => (
            <li key={`${c.kind}-${c.refId}-${c.start}`}>
              {c.kind.replace(/_/g, " ")}: {c.label} ({fmtDateTime(c.start)} → {fmtDateTime(c.end)})
            </li>
          ))}
        </ul>
      )}
      {result.affected && result.affected.length > 0 && (
        <>
          <p style={{ marginTop: 8 }}>Affected appointments (reschedule or cancel each one, then try again):</p>
          <ul>
            {result.affected.map((a) => (
              <li key={a.id}>
                <Link href={`/admin/appointments/${a.id}`}>{a.reference}</Link> — {a.patientName}, {fmtDateTime(a.startAt)} ({a.status}
                {a.clinicName ? `, ${a.clinicName}` : ""})
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export function Pagination({ page, pageSize, total, base }: { page: number; pageSize: number; total: number; base: string }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  const sep = base.includes("?") ? "&" : "?";
  return (
    <nav className="inline-actions" aria-label="Pagination" style={{ marginTop: 12, alignItems: "center" }}>
      {page > 1 && (
        <Link className="btn secondary sm" href={`${base}${sep}page=${page - 1}`}>
          ← Previous
        </Link>
      )}
      <span className="help">
        Page {page} of {pages} · {total} total
      </span>
      {page < pages && (
        <Link className="btn secondary sm" href={`${base}${sep}page=${page + 1}`}>
          Next →
        </Link>
      )}
    </nav>
  );
}
