"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deactivateUserAction, inviteStaffAction, reactivateUserAction, resetPasswordAction, revokeInvitationAction, setPermissionsAction, setRoleAction } from "@/lib/actions/staff";
import { PERMISSIONS } from "@/lib/db/schema";
import type { ActionResult } from "@/lib/errors";
import { ResultAlert } from "./ui";

const PERMISSION_LABELS: Record<string, string> = {
  "availability:manage": "Change working hours, blocks and scheduling rules",
  "clinics:manage": "Edit clinic details",
  "audit:view": "View audit history",
};

export function InviteForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [result, setResult] = useState<ActionResult<{ link: string; expiresAt: string }> | null>(null);
  const [role, setRole] = useState("coordinator");
  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);
        start(async () => {
          const r = await inviteStaffAction(fd);
          setResult(r);
          if (r.ok) {
            form.reset();
            router.refresh();
          }
        });
      }}
    >
      <ResultAlert result={result} />
      {result?.ok && (
        <div className="alert success">
          Invitation created. No email provider is configured, so share this link with the new staff member directly (it expires {new Date(result.data.expiresAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST and can be used once):
          <span className="mono" style={{ marginTop: 8 }}>
            {result.data.link}
          </span>
        </div>
      )}
      <div className="row">
        <label>
          Name
          <input name="name" required minLength={2} />
        </label>
        <label>
          Email
          <input name="email" type="email" required />
        </label>
      </div>
      <label>
        Role
        <select name="role" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="coordinator">Coordinator / receptionist</option>
          <option value="admin">Administrator</option>
        </select>
      </label>
      {role === "coordinator" && (
        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Extra permissions (optional)</legend>
          {PERMISSIONS.map((p) => (
            <label className="check" key={p}>
              <input type="checkbox" name="permissions" value={p} /> {PERMISSION_LABELS[p]}
            </label>
          ))}
        </fieldset>
      )}
      <div className="form-actions">
        <button className="btn" type="submit" disabled={pending}>
          {pending ? "Creating…" : "Create invitation"}
        </button>
      </div>
    </form>
  );
}

export function StaffRow({ u, isSelf }: { u: { id: string; name: string; email: string; role: string; banned: boolean; banReason: string | null; permissions: string[] }; isSelf: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [result, setResult] = useState<ActionResult<unknown> | null>(null);
  const [editPerms, setEditPerms] = useState(false);
  const act = (fn: () => Promise<ActionResult<unknown>>) =>
    start(async () => {
      const r = await fn();
      setResult(r);
      if (r.ok) {
        setEditPerms(false);
        router.refresh();
      }
    });
  return (
    <div className="card">
      <h3>
        {u.name} <span className={`badge ${u.banned ? "inactive" : "active"}`}>{u.banned ? "deactivated" : "active"}</span> <span className="badge">{u.role}</span>
        {isSelf && <span className="badge">you</span>}
      </h3>
      <p className="help">
        {u.email}
        {u.banned && u.banReason ? ` · ${u.banReason}` : ""}
      </p>
      {u.role === "coordinator" && (
        <p className="help" style={{ marginTop: 6 }}>
          Extra permissions: {u.permissions.length ? u.permissions.join(", ") : "none"}
        </p>
      )}
      <ResultAlert result={result} />
      {!isSelf && (
        <div className="inline-actions" style={{ marginTop: 10 }}>
          {u.role === "coordinator" ? (
            <>
              <button className="btn secondary sm" disabled={pending} onClick={() => window.confirm(`Make ${u.name} an administrator?`) && act(() => setRoleAction(u.id, "admin"))}>
                Make administrator
              </button>
              <button className="btn secondary sm" disabled={pending} onClick={() => setEditPerms((o) => !o)}>
                Permissions
              </button>
            </>
          ) : (
            <button className="btn secondary sm" disabled={pending} onClick={() => window.confirm(`Change ${u.name} to coordinator?`) && act(() => setRoleAction(u.id, "coordinator"))}>
              Make coordinator
            </button>
          )}
          <button
            className="btn secondary sm"
            disabled={pending}
            onClick={() => {
              const pw = window.prompt(`New temporary password for ${u.name} (min 10 characters). Their sessions will be signed out.`);
              if (pw) act(() => resetPasswordAction(u.id, pw));
            }}
          >
            Reset password
          </button>
          {u.banned ? (
            <button className="btn secondary sm" disabled={pending} onClick={() => act(() => reactivateUserAction(u.id))}>
              Reactivate
            </button>
          ) : (
            <button
              className="btn danger sm"
              disabled={pending}
              onClick={() => {
                const reason = window.prompt(`Deactivate ${u.name}? Enter a reason:`);
                if (reason !== null) act(() => deactivateUserAction(u.id, reason));
              }}
            >
              Deactivate
            </button>
          )}
        </div>
      )}
      {editPerms && (
        <form
          className="form"
          style={{ marginTop: 12 }}
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            act(() => setPermissionsAction(u.id, fd));
          }}
        >
          {PERMISSIONS.map((p) => (
            <label className="check" key={p}>
              <input type="checkbox" name="permissions" value={p} defaultChecked={u.permissions.includes(p)} /> {PERMISSION_LABELS[p]}
            </label>
          ))}
          <div className="form-actions">
            <button className="btn sm" type="submit" disabled={pending}>
              Save permissions
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export function RevokeInviteButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      className="btn secondary sm"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await revokeInvitationAction(id);
          router.refresh();
        })
      }
    >
      Revoke
    </button>
  );
}
