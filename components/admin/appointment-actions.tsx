"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { cancelAppointmentAction, confirmAppointmentAction, extendHoldAction, markAppointmentAction, releaseHoldAction, rescheduleAppointmentAction, updateAppointmentDetailsAction } from "@/lib/actions/appointments";
import type { ActionResult } from "@/lib/errors";
import { ResultAlert } from "./ui";

interface Props {
  id: string;
  status: string;
  clinics: { id: string; name: string }[];
  clinicId: string;
  startAtLocal: string;
  durationMin: number;
  patientName: string;
  phone: string;
  email: string;
  notes: string;
  hold: { id: string; expiresAt: string } | null;
}

export function AppointmentActions(p: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [result, setResult] = useState<ActionResult<unknown> | null>(null);
  const [mode, setMode] = useState<"none" | "reschedule" | "cancel" | "edit">("none");
  const [ack, setAck] = useState(false);
  const active = p.status === "requested" || p.status === "confirmed" || p.status === "arrived";

  const act = (fn: () => Promise<ActionResult<unknown>>) =>
    start(async () => {
      const r = await fn();
      setResult(r);
      if (r.ok) {
        setMode("none");
        setAck(false);
        router.refresh();
      }
    });

  const needsAck = result && !result.ok && result.code === "ack_required";

  return (
    <div className="stack">
      <ResultAlert result={result} />
      {needsAck && (
        <label className="check" style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 14 }}>
          <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} style={{ width: 20, height: 20, minHeight: 20 }} />
          I have confirmed with the doctor that this time outside published hours is acceptable
        </label>
      )}
      <div className="inline-actions">
        {p.status === "requested" && (
          <button className="btn" disabled={pending} onClick={() => act(() => confirmAppointmentAction(p.id, ack))}>
            Confirm appointment
          </button>
        )}
        {p.status === "confirmed" && (
          <>
            <button className="btn" disabled={pending} onClick={() => act(() => markAppointmentAction(p.id, "arrived"))}>
              Mark arrived
            </button>
            <button className="btn secondary" disabled={pending} onClick={() => act(() => markAppointmentAction(p.id, "no_show"))}>
              Mark no-show
            </button>
          </>
        )}
        {(p.status === "confirmed" || p.status === "arrived") && (
          <button className="btn secondary" disabled={pending} onClick={() => act(() => markAppointmentAction(p.id, "completed"))}>
            Mark completed
          </button>
        )}
        {active && (
          <>
            <button className="btn secondary" disabled={pending} onClick={() => setMode(mode === "reschedule" ? "none" : "reschedule")}>
              Reschedule
            </button>
            <button className="btn secondary" disabled={pending} onClick={() => setMode(mode === "edit" ? "none" : "edit")}>
              Edit details
            </button>
            <button className="btn danger" disabled={pending} onClick={() => setMode(mode === "cancel" ? "none" : "cancel")}>
              Cancel appointment
            </button>
          </>
        )}
      </div>
      {p.hold && (
        <div className="alert">
          A hold reserves this time until <strong>{new Date(p.hold.expiresAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })} IST</strong>.
          <div className="inline-actions" style={{ marginTop: 8 }}>
            <button className="btn secondary sm" disabled={pending} onClick={() => act(() => extendHoldAction(p.hold!.id, 60))}>
              Extend hold by 1 hour
            </button>
            <button className="btn secondary sm" disabled={pending} onClick={() => act(() => releaseHoldAction(p.hold!.id))}>
              Release hold
            </button>
          </div>
        </div>
      )}
      {mode === "reschedule" && (
        <form
          className="form card"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            if (ack) fd.set("allowOutsideHours", "on");
            act(() => rescheduleAppointmentAction(p.id, fd));
          }}
        >
          <h3>Reschedule</h3>
          <div className="row">
            <label>
              New start (IST)
              <input name="startAt" type="datetime-local" required defaultValue={p.startAtLocal} step={300} />
            </label>
            <label>
              Duration (minutes)
              <input name="durationMin" type="number" min={5} max={480} step={5} required defaultValue={p.durationMin} />
            </label>
          </div>
          <div className="row">
            <label>
              Clinic
              <select name="clinicId" defaultValue={p.clinicId}>
                {p.clinics.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Reason (optional)
              <input name="reason" maxLength={300} />
            </label>
          </div>
          <div className="form-actions">
            <button className="btn" type="submit" disabled={pending}>
              {pending ? "Checking…" : "Save new time"}
            </button>
            <span className="help">The old time is released and the new time reserved in one transaction; if the new time is taken, nothing changes.</span>
          </div>
        </form>
      )}
      {mode === "cancel" && (
        <form
          className="form card"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            act(() => cancelAppointmentAction(p.id, String(fd.get("reason") ?? "")));
          }}
        >
          <h3>Cancel appointment</h3>
          <label>
            Reason (required)
            <input name="reason" required maxLength={300} placeholder="e.g. Patient requested, unwell" />
          </label>
          <div className="form-actions">
            <button className="btn danger" type="submit" disabled={pending}>
              Confirm cancellation
            </button>
            <span className="help">Cancelling releases the time for other bookings.</span>
          </div>
        </form>
      )}
      {mode === "edit" && (
        <form
          className="form card"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            act(() => updateAppointmentDetailsAction(p.id, fd));
          }}
        >
          <h3>Edit contact details &amp; notes</h3>
          <div className="row">
            <label>
              Name
              <input name="patientName" required defaultValue={p.patientName} />
            </label>
            <label>
              Phone
              <input name="phone" required defaultValue={p.phone} />
            </label>
          </div>
          <label>
            Email
            <input name="email" type="email" defaultValue={p.email} />
          </label>
          <label>
            Operational notes
            <textarea name="notes" defaultValue={p.notes} maxLength={2000} />
          </label>
          <div className="form-actions">
            <button className="btn" type="submit" disabled={pending}>
              Save details
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
