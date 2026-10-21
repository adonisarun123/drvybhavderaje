"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  addBlockAction,
  addOverrideAction,
  addRecurringBlockAction,
  addWeeklySessionAction,
  deactivateRecurringBlockAction,
  removeBlockAction,
  removeOverrideAction,
  removeWeeklySessionAction,
  updateSettingsAction,
} from "@/lib/actions/availability";
import type { ActionResult, SerialisedAffected } from "@/lib/errors";
import { WEEKDAY_NAMES } from "@/lib/time";
import { ResultAlert } from "./ui";

type Clinic = { id: string; name: string };

function useAction() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [result, setResult] = useState<ActionResult<unknown> | null>(null);
  const [outside, setOutside] = useState<SerialisedAffected[]>([]);
  const act = (fn: () => Promise<ActionResult<unknown>>, after?: () => void) =>
    start(async () => {
      const r = await fn();
      setResult(r);
      if (r.ok) {
        const data = r.data as { outsideHours?: SerialisedAffected[] } | undefined;
        setOutside(data?.outsideHours ?? []);
        after?.();
        router.refresh();
      }
    });
  return { pending, result, act, outside };
}

function OutsideHoursNotice({ items }: { items: SerialisedAffected[] }) {
  if (!items.length) return null;
  return (
    <div className="alert warn">
      Saved. {items.length} future appointment(s) now fall outside the published hours. They have <strong>not</strong> been changed — review them:
      <ul>
        {items.map((a) => (
          <li key={a.id}>
            <a href={`/admin/appointments/${a.id}`}>{a.reference}</a> — {a.patientName}, {new Date(a.startAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SettingsForm({ doctorId, s }: { doctorId: string; s: { defaultDurationMin: number; slotStepMin: number; bufferMin: number; travelBufferMin: number; minNoticeHours: number; maxHorizonDays: number; holdMinutes: number; publicSlotsEnabled: boolean } }) {
  const { pending, result, act, outside } = useAction();
  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        act(() => updateSettingsAction(fd));
      }}
    >
      <ResultAlert result={result} />
      {result?.ok && outside.length === 0 && <div className="alert success">Settings saved.</div>}
      <OutsideHoursNotice items={outside} />
      <input type="hidden" name="doctorId" value={doctorId} />
      <div className="row">
        <label>
          Appointment duration (min)
          <input name="defaultDurationMin" type="number" min={5} max={480} defaultValue={s.defaultDurationMin} required />
        </label>
        <label>
          Slot step (min)
          <input name="slotStepMin" type="number" min={5} max={240} defaultValue={s.slotStepMin} required />
        </label>
      </div>
      <div className="row">
        <label>
          Buffer between appointments (min)
          <input name="bufferMin" type="number" min={0} max={240} defaultValue={s.bufferMin} required />
        </label>
        <label>
          Travel buffer between clinics (min)
          <input name="travelBufferMin" type="number" min={0} max={480} defaultValue={s.travelBufferMin} required />
        </label>
      </div>
      <div className="row">
        <label>
          Minimum notice for public requests (hours)
          <input name="minNoticeHours" type="number" min={0} max={720} defaultValue={s.minNoticeHours} required />
        </label>
        <label>
          Booking horizon (days)
          <input name="maxHorizonDays" type="number" min={1} max={365} defaultValue={s.maxHorizonDays} required />
        </label>
      </div>
      <div className="row">
        <label>
          Default hold length (min)
          <input name="holdMinutes" type="number" min={5} max={1440} defaultValue={s.holdMinutes} required />
        </label>
        <label className="check" style={{ alignSelf: "end" }}>
          <input type="checkbox" name="publicSlotsEnabled" defaultChecked={s.publicSlotsEnabled} />
          Show available times on the public appointment page
        </label>
      </div>
      <p className="help">Public visitors only ever see times as available/unavailable. Their request never reserves a slot — staff confirm it.</p>
      <div className="form-actions">
        <button className="btn" type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save settings"}
        </button>
      </div>
    </form>
  );
}

export function WeeklySessionForm({ doctorId, clinics }: { doctorId: string; clinics: Clinic[] }) {
  const { pending, result, act, outside } = useAction();
  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);
        act(() => addWeeklySessionAction(fd), () => form.reset());
      }}
    >
      <ResultAlert result={result} />
      <OutsideHoursNotice items={outside} />
      <input type="hidden" name="doctorId" value={doctorId} />
      <div className="row">
        <label>
          Weekday
          <select name="weekday" required defaultValue="1">
            {WEEKDAY_NAMES.map((n, i) => (
              <option key={n} value={i}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label>
          Clinic
          <select name="clinicId" required defaultValue="">
            <option value="" disabled>
              Choose
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
          <input name="startTime" type="time" required step={300} />
        </label>
        <label>
          End (IST)
          <input name="endTime" type="time" required step={300} />
        </label>
      </div>
      <div className="row">
        <label>
          Effective from (optional)
          <input name="effectiveFrom" type="date" />
        </label>
        <label>
          Effective to (optional)
          <input name="effectiveTo" type="date" />
        </label>
      </div>
      <div className="form-actions">
        <button className="btn" type="submit" disabled={pending}>
          {pending ? "Saving…" : "Add session"}
        </button>
        <span className="help">Add several sessions per day for morning/evening clinics. Gaps between sessions are breaks.</span>
      </div>
    </form>
  );
}

export function RemoveButton({ id, kind, label = "Remove" }: { id: string; kind: "weekly" | "override" | "block" | "recurring"; label?: string }) {
  const { pending, result, act } = useAction();
  const fn = { weekly: removeWeeklySessionAction, override: removeOverrideAction, block: removeBlockAction, recurring: deactivateRecurringBlockAction }[kind];
  return (
    <span>
      <button className="btn secondary sm" disabled={pending} onClick={() => window.confirm("Remove this item? Existing appointments are never changed.") && act(() => fn(id))}>
        {label}
      </button>
      {result && !result.ok && <span className="field-error"> {result.message}</span>}
    </span>
  );
}

export function OverrideForm({ doctorId, clinics }: { doctorId: string; clinics: Clinic[] }) {
  const { pending, result, act } = useAction();
  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        act(() => addOverrideAction(new FormData(form)), () => form.reset());
      }}
    >
      <ResultAlert result={result} />
      <input type="hidden" name="doctorId" value={doctorId} />
      <div className="row">
        <label>
          Date
          <input name="date" type="date" required />
        </label>
        <label>
          Clinic
          <select name="clinicId" required defaultValue="">
            <option value="" disabled>
              Choose
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
          <input name="startTime" type="time" required step={300} />
        </label>
        <label>
          End (IST)
          <input name="endTime" type="time" required step={300} />
        </label>
      </div>
      <div className="row">
        <label>
          Mode
          <select name="mode" defaultValue="add">
            <option value="add">Add to the usual weekly hours</option>
            <option value="replace">Replace the weekly hours for this date</option>
          </select>
        </label>
        <label>
          Note (optional)
          <input name="note" maxLength={200} />
        </label>
      </div>
      <div className="form-actions">
        <button className="btn" type="submit" disabled={pending}>
          {pending ? "Saving…" : "Add date-specific hours"}
        </button>
      </div>
    </form>
  );
}

export function BlockForm({ doctorId, clinics }: { doctorId: string; clinics: Clinic[] }) {
  const { pending, result, act } = useAction();
  const [allDay, setAllDay] = useState(true);
  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        act(() => addBlockAction(new FormData(form)), () => form.reset());
      }}
    >
      <ResultAlert result={result} />
      {result?.ok && <div className="alert success">Block saved. No appointments were affected.</div>}
      <input type="hidden" name="doctorId" value={doctorId} />
      <div className="row">
        <label>
          Type
          <select name="kind" defaultValue="leave">
            <option value="leave">Leave</option>
            <option value="holiday">Holiday</option>
            <option value="block">Other unavailable time</option>
          </select>
        </label>
        <label>
          Reason (private — never shown publicly)
          <input name="reason" required maxLength={200} />
        </label>
      </div>
      <label className="check">
        <input type="checkbox" name="allDay" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} />
        Full day(s)
      </label>
      {allDay ? (
        <div className="row">
          <label>
            From date
            <input name="startDate" type="date" required />
          </label>
          <label>
            To date (inclusive, optional)
            <input name="endDate" type="date" />
          </label>
        </div>
      ) : (
        <div className="row">
          <label>
            Start (IST)
            <input name="startAt" type="datetime-local" required step={300} />
          </label>
          <label>
            End (IST)
            <input name="endAt" type="datetime-local" required step={300} />
          </label>
        </div>
      )}
      <label>
        Clinic (optional — informational; a block always removes the doctor’s availability everywhere)
        <select name="clinicId" defaultValue="">
          <option value="">All clinics</option>
          {clinics.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <div className="form-actions">
        <button className="btn" type="submit" disabled={pending}>
          {pending ? "Checking appointments…" : "Block this time"}
        </button>
        <span className="help">If any appointment or hold falls inside the block, nothing is saved and the conflicts are listed for you to resolve.</span>
      </div>
    </form>
  );
}

export function RecurringBlockForm({ doctorId }: { doctorId: string }) {
  const { pending, result, act } = useAction();
  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        act(() => addRecurringBlockAction(new FormData(form)), () => form.reset());
      }}
    >
      <ResultAlert result={result} />
      {result?.ok && <div className="alert success">Recurring block saved.</div>}
      <input type="hidden" name="doctorId" value={doctorId} />
      <div className="row">
        <label>
          Type
          <select name="kind" defaultValue="break">
            <option value="break">Break</option>
            <option value="block">Recurring commitment</option>
          </select>
        </label>
        <label>
          Reason (private)
          <input name="reason" required maxLength={200} placeholder="e.g. Hospital rounds" />
        </label>
      </div>
      <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
        <legend style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Weekdays</legend>
        <div className="weekday-picker">
          {WEEKDAY_NAMES.map((n, i) => (
            <label key={n}>
              <input type="checkbox" name="weekdays" value={i} /> {n.slice(0, 3)}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="row">
        <label>
          Start (IST)
          <input name="startTime" type="time" required step={300} />
        </label>
        <label>
          End (IST)
          <input name="endTime" type="time" required step={300} />
        </label>
      </div>
      <div className="row">
        <label>
          Starts on (optional)
          <input name="startsOn" type="date" />
        </label>
        <label>
          Ends on (optional)
          <input name="endsOn" type="date" />
        </label>
      </div>
      <div className="form-actions">
        <button className="btn" type="submit" disabled={pending}>
          {pending ? "Checking appointments…" : "Add recurring block"}
        </button>
      </div>
    </form>
  );
}
