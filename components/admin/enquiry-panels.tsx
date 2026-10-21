"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { addEnquiryNoteAction, createStaffEnquiryAction, updateEnquiryAction } from "@/lib/actions/enquiries";
import { ENQUIRY_STATUSES } from "@/lib/db/schema";
import type { ActionResult } from "@/lib/errors";
import { ResultAlert } from "./ui";

export function EnquiryStatusForm({ id, status, assignedTo, followUpAt, staff }: { id: string; status: string; assignedTo: string | null; followUpAt: string; staff: { id: string; name: string }[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);
  const [saved, setSaved] = useState(false);
  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        start(async () => {
          const r = await updateEnquiryAction(id, fd);
          setResult(r);
          setSaved(r.ok);
          if (r.ok) router.refresh();
        });
      }}
    >
      <ResultAlert result={result} />
      {saved && <div className="alert success">Saved.</div>}
      <label>
        Status
        <select name="status" defaultValue={status}>
          {ENQUIRY_STATUSES.filter((s) => s !== "converted" || status === "converted").map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </label>
      <label>
        Assigned to
        <select name="assignedTo" defaultValue={assignedTo ?? ""}>
          <option value="">Unassigned</option>
          {staff.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Follow-up (IST)
        <input name="followUpAt" type="datetime-local" defaultValue={followUpAt} />
      </label>
      <div className="form-actions">
        <button className="btn" type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}

export function EnquiryNoteForm({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);
  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);
        start(async () => {
          const r = await addEnquiryNoteAction(id, fd);
          setResult(r);
          if (r.ok) {
            form.reset();
            router.refresh();
          }
        });
      }}
    >
      <ResultAlert result={result} />
      <label>
        Add a private note
        <textarea name="body" required maxLength={4000} placeholder="e.g. Called at 11:20, no answer. Will try again tomorrow." />
      </label>
      <div className="form-actions">
        <button className="btn secondary" type="submit" disabled={pending}>
          {pending ? "Saving…" : "Add note"}
        </button>
      </div>
    </form>
  );
}

export function NewEnquiryForm({ clinics }: { clinics: { id: string; name: string }[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [result, setResult] = useState<ActionResult<{ id: string; reference: string }> | null>(null);
  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        start(async () => {
          const r = await createStaffEnquiryAction(fd);
          setResult(r);
          if (r.ok) router.push(`/admin/enquiries/${r.data.id}`);
        });
      }}
    >
      <ResultAlert result={result} />
      <div className="row">
        <label>
          Name
          <input name="name" required minLength={2} maxLength={80} />
        </label>
        <label>
          Phone
          <input name="phone" type="tel" required />
        </label>
      </div>
      <div className="row">
        <label>
          Email (optional)
          <input name="email" type="email" />
        </label>
        <label>
          Preferred clinic
          <select name="clinicId" defaultValue="">
            <option value="">Not specified</option>
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
          Source
          <select name="source" defaultValue="phone">
            <option value="phone">Phone</option>
            <option value="walk_in">Walk-in</option>
            <option value="referral">Referral</option>
            <option value="email">Email</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label>
          Preferred timing (free text)
          <input name="preferredNote" maxLength={300} placeholder="e.g. weekday mornings" />
        </label>
      </div>
      <label>
        First note (private)
        <textarea name="note" maxLength={2000} />
      </label>
      <div className="form-actions">
        <button className="btn" type="submit" disabled={pending}>
          {pending ? "Saving…" : "Log enquiry"}
        </button>
      </div>
    </form>
  );
}
