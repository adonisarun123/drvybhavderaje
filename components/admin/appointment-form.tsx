"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { ResultAlert } from "./ui";
import type { ActionResult } from "@/lib/errors";

export interface ClinicOption {
  id: string;
  name: string;
}

interface Props {
  doctorId: string;
  clinics: ClinicOption[];
  defaults?: { patientName?: string; phone?: string; email?: string; clinicId?: string; startAt?: string; notes?: string; enquiryId?: string; source?: string };
  defaultDurationMin: number;
  holdMinutes: number;
  action: (formData: FormData) => Promise<ActionResult<{ id: string; reference: string }>>;
  submitLabel?: string;
  showSource?: boolean;
}

export function AppointmentForm({ doctorId, clinics, defaults = {}, defaultDurationMin, holdMinutes, action, submitLabel = "Save appointment", showSource = true }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [result, setResult] = useState<ActionResult<{ id: string; reference: string }> | null>(null);
  // One key per mounted form: repeated submits (double-click, retry after a network error) reuse it.
  const idempotencyKey = useRef<string | null>(null);
  const [status, setStatus] = useState<"requested" | "confirmed">("confirmed");
  const needsAck = result && !result.ok && result.code === "ack_required";

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    idempotencyKey.current ??= crypto.randomUUID();
    fd.set("idempotencyKey", idempotencyKey.current);
    start(async () => {
      const r = await action(fd);
      setResult(r);
      if (r.ok) router.push(`/admin/appointments/${r.data.id}?created=1`);
    });
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <ResultAlert result={result} />
      <input type="hidden" name="doctorId" value={doctorId} />
      <input type="hidden" name="idempotencyKey" value="" />
      {defaults.enquiryId && <input type="hidden" name="enquiryId" value={defaults.enquiryId} />}
      <div className="row">
        <label>
          Patient / contact name
          <input name="patientName" required minLength={2} maxLength={80} defaultValue={defaults.patientName ?? ""} />
        </label>
        <label>
          Phone
          <input name="phone" type="tel" required defaultValue={defaults.phone ?? ""} />
        </label>
      </div>
      <div className="row">
        <label>
          Email (optional)
          <input name="email" type="email" defaultValue={defaults.email ?? ""} />
        </label>
        <label>
          Clinic
          <select name="clinicId" required defaultValue={defaults.clinicId ?? ""}>
            <option value="" disabled>
              Choose a clinic
            </option>
            {clinics.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="row">
        <label>
          Start (IST)
          <input name="startAt" type="datetime-local" required defaultValue={defaults.startAt ?? ""} step={300} />
        </label>
        <label>
          Duration (minutes)
          <input name="durationMin" type="number" min={5} max={480} step={5} required defaultValue={defaultDurationMin} />
        </label>
      </div>
      <div className="row">
        <label>
          Status
          <select name="status" value={status} onChange={(e) => setStatus(e.target.value as "requested" | "confirmed")}>
            <option value="confirmed">Confirmed — reserves the time now</option>
            <option value="requested">Requested — pending confirmation</option>
          </select>
        </label>
        {status === "requested" ? (
          <label>
            Hold the time for (minutes, 0 = no hold)
            <input name="holdMinutes" type="number" min={0} max={1440} defaultValue={holdMinutes} />
            <span className="help">A hold reserves the time until it expires or the request is confirmed.</span>
          </label>
        ) : showSource ? (
          <label>
            Source
            <select name="source" defaultValue={defaults.source ?? "phone"}>
              <option value="phone">Phone</option>
              <option value="walk_in">Walk-in</option>
              <option value="referral">Referral</option>
              <option value="email">Email</option>
              <option value="website">Website</option>
              <option value="other">Other</option>
            </select>
          </label>
        ) : (
          <div />
        )}
      </div>
      {status === "requested" && showSource && (
        <label>
          Source
          <select name="source" defaultValue={defaults.source ?? "phone"}>
            <option value="phone">Phone</option>
            <option value="walk_in">Walk-in</option>
            <option value="referral">Referral</option>
            <option value="email">Email</option>
            <option value="website">Website</option>
            <option value="other">Other</option>
          </select>
        </label>
      )}
      <label>
        Operational notes (private, not a clinical record)
        <textarea name="notes" maxLength={2000} defaultValue={defaults.notes ?? ""} />
      </label>
      {needsAck && (
        <label className="check">
          <input type="checkbox" name="allowOutsideHours" />
          I have confirmed with the doctor that this time outside published hours is acceptable
        </label>
      )}
      <div className="form-actions">
        <button className="btn" type="submit" disabled={pending}>
          {pending ? "Checking availability…" : submitLabel}
        </button>
        <span className="help">Availability is re-checked on the server at the moment of saving.</span>
      </div>
    </form>
  );
}
