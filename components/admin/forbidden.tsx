import Link from "next/link";

export function Forbidden({ what = "this page" }: { what?: string }) {
  return (
    <div className="card" role="alert" style={{ maxWidth: 620 }}>
      <h2>Not permitted</h2>
      <p className="help">Your account does not have permission to view {what}. Ask an administrator if you need access.</p>
      <p style={{ marginTop: 12 }}>
        <Link className="btn secondary" href="/admin">
          Back to dashboard
        </Link>
      </p>
    </div>
  );
}
