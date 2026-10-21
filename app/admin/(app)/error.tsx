"use client";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="card" role="alert" style={{ maxWidth: 680 }}>
      <h2>Something went wrong</h2>
      <p className="help">
        The page could not be loaded. Nothing has been changed. If the database is unreachable this will keep happening until the connection is restored.
        {error.digest ? ` (ref ${error.digest})` : ""}
      </p>
      <p style={{ marginTop: 12 }}>
        <button className="btn secondary" onClick={() => reset()}>
          Try again
        </button>
      </p>
    </div>
  );
}
