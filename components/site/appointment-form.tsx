"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { ArrowUpRight } from "lucide-react";
import { SITE } from "@/lib/content";
import { ROUTES } from "@/lib/routes";
import type { PublicClinic } from "@/lib/clinics";
import { DIAL_CODES, OTHER_COUNTRY } from "@/lib/dial-codes";
import { CLINIC_PREFERENCES, isClinicPreference } from "@/lib/enquiries/preferences";
import { AvailabilityCalendar } from "./availability-calendar";

type FieldErrors = Record<string, string[]>;
type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "error"; message: string; fieldErrors?: FieldErrors }
  | { kind: "success"; reference: string; duplicate?: boolean };

interface Props {
  clinics: PublicClinic[];
  enabled: boolean;
  slotsEnabled: boolean;
  dateMin: string;
  dateMax: string;
  initialClinic?: string;
}

const CLINIC_TZ = "Asia/Kolkata";

function fmtIst(iso: string) {
  return new Intl.DateTimeFormat("en-IN", { timeZone: CLINIC_TZ, hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(iso)) + " IST";
}

/** The visitor's own time zone, or null when it is the clinic's (so we don't print the same time twice). */
function visitorTimeZone(): string | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return tz && tz !== CLINIC_TZ && tz !== "Asia/Calcutta" ? tz : null;
  } catch {
    return null;
  }
}

const noopSubscribe = () => () => {};

/** Slot label: clinic time, plus the visitor's local time when they are outside India. */
function fmtSlot(iso: string, tz: string | null) {
  const ist = fmtIst(iso);
  if (!tz) return ist;
  const local = new Intl.DateTimeFormat("en-GB", { timeZone: tz, weekday: "short", hour: "numeric", minute: "2-digit", hour12: true, timeZoneName: "short" }).format(new Date(iso));
  return `${ist} (${local} your time)`;
}

export function AppointmentForm({ clinics, enabled, slotsEnabled, dateMin, dateMax, initialClinic }: Props) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  // Generated once per mounted form (in the submit handler) so retries reuse the same key.
  const submissionId = useRef<string | null>(null);
  const startedAt = useRef<number | null>(null);
  const [clinic, setClinic] = useState(initialClinic ?? "");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<{ start: string; end: string }[] | null>(null);
  const [slotState, setSlotState] = useState<"idle" | "loading" | "none" | "error">("idle");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [phoneCountry, setPhoneCountry] = useState("IN");
  // Browser-only (null on the server and during hydration, so markup matches).
  const visitorTz = useSyncExternalStore(noopSubscribe, visitorTimeZone, () => null);
  const alertRef = useRef<HTMLDivElement>(null);
  const id = useId();

  const fetchSeq = useRef(0);
  function loadSlots(nextClinic: string, nextDate: string) {
    setSelectedSlot("");
    if (!slotsEnabled || !nextClinic || isClinicPreference(nextClinic) || !nextDate) {
      setSlots(null);
      setSlotState("idle");
      return;
    }
    const seq = ++fetchSeq.current;
    setSlotState("loading");
    fetch(`/api/availability?clinic=${encodeURIComponent(nextClinic)}&date=${nextDate}`)
      .then((r) => r.json())
      .then((data: { enabled: boolean; slots: { start: string; end: string }[] }) => {
        if (seq !== fetchSeq.current) return;
        if (!data.enabled || !data.slots.length) {
          setSlots([]);
          setSlotState("none");
        } else {
          setSlots(data.slots);
          setSlotState("idle");
        }
      })
      .catch(() => seq === fetchSeq.current && setSlotState("error"));
  }

  useEffect(() => {
    if (status.kind === "error" || status.kind === "success") alertRef.current?.focus();
  }, [status]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status.kind === "sending") return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    submissionId.current ??= crypto.randomUUID();
    const payload = {
      name: String(fd.get("name") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      phoneCountry,
      email: String(fd.get("email") ?? ""),
      clinic: String(fd.get("clinic") ?? ""),
      preferredStart: selectedSlot,
      consent: fd.get("consent") === "on",
      submissionId: submissionId.current,
      website: String(fd.get("website") ?? ""),
      startedAt: startedAt.current ?? Date.now(),
    };
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/enquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = (await res.json()) as { ok: boolean; data?: { reference: string; duplicate?: boolean }; message?: string; fieldErrors?: FieldErrors };
      if (data.ok && data.data) {
        setStatus({ kind: "success", reference: data.data.reference, duplicate: data.data.duplicate });
      } else {
        setStatus({ kind: "error", message: data.message ?? "Something went wrong. Your details are still in the form.", fieldErrors: data.fieldErrors });
      }
    } catch {
      setStatus({ kind: "error", message: "We could not reach the server. Nothing has been sent — your details are still in the form. Please try again or call the clinic." });
    }
  }

  const errs = status.kind === "error" ? status.fieldErrors ?? {} : {};
  const err = (f: string) => errs[f]?.[0];

  if (status.kind === "success") {
    return (
      <div className="status success" role="status" tabIndex={-1} ref={alertRef}>
        <strong>Thank you — your request has been received.</strong>
        <br />
        Reference <strong>{status.reference}</strong>. {status.duplicate ? "We already had this request on file. " : ""}
        This is <em>not</em> a confirmed appointment: the clinic will contact you to confirm the location, date and time. If you need to speak to someone sooner, call{" "}
        <a className="text-link" href={`tel:${SITE.phoneTel}`}>
          {SITE.phone}
        </a>
        .
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-describedby={`${id}-explain`} onFocusCapture={() => { startedAt.current ??= Date.now(); }}>
      {!enabled && (
        <div className="status" role="status">
          Online requests are not available at the moment. Please call{" "}
          <a className="text-link" href={`tel:${SITE.phoneTel}`}>
            {SITE.phone}
          </a>{" "}
          or email{" "}
          <a className="text-link" href={`mailto:${SITE.email}`}>
            {SITE.email}
          </a>{" "}
          to arrange a visit.
        </div>
      )}
      {status.kind === "error" && (
        <div className="status error" role="alert" tabIndex={-1} ref={alertRef}>
          {status.message}
        </div>
      )}
      <div className="fields">
        <label className="field" htmlFor={`${id}-name`}>
          Your name *
          <input id={`${id}-name`} name="name" autoComplete="name" placeholder="Full name" required minLength={2} maxLength={80} aria-invalid={!!err("name")} aria-describedby={err("name") ? `${id}-name-err` : undefined} disabled={!enabled} />
          {err("name") && (
            <span className="field-error" id={`${id}-name-err`}>
              {err("name")}
            </span>
          )}
        </label>
        <label className="field" htmlFor={`${id}-phone-country`}>
          Country of your phone number *
          <select id={`${id}-phone-country`} name="phoneCountry" autoComplete="tel-country-code" value={phoneCountry} onChange={(e) => setPhoneCountry(e.target.value)} disabled={!enabled}>
            {DIAL_CODES.map((d) => (
              <option key={d.iso} value={d.iso}>
                {d.name} (+{d.code})
              </option>
            ))}
            <option value={OTHER_COUNTRY}>Other country (type the full number with +)</option>
          </select>
        </label>
        <label className="field" htmlFor={`${id}-phone`}>
          Phone number *
          <input id={`${id}-phone`} name="phone" type="tel" autoComplete={phoneCountry === OTHER_COUNTRY ? "tel" : "tel-national"} placeholder={phoneCountry === OTHER_COUNTRY ? "+ country code and number" : phoneCountry === "IN" ? "10-digit mobile number" : "Number without the country code"} required maxLength={20} aria-invalid={!!err("phone")} aria-describedby={err("phone") ? `${id}-phone-err` : `${id}-phone-help`} disabled={!enabled} />
          {err("phone") ? (
            <span className="field-error" id={`${id}-phone-err`}>
              {err("phone")}
            </span>
          ) : (
            <span className="note" id={`${id}-phone-help`}>
              {phoneCountry === "IN" ? "The clinic will call or message you on this number." : "The clinic will call or message you on this number; WhatsApp-enabled numbers are easiest to reach from India."}
            </span>
          )}
        </label>
        <label className="field full" htmlFor={`${id}-email`}>
          Email address (optional)
          <input id={`${id}-email`} name="email" type="email" autoComplete="email" placeholder="Optional" maxLength={254} aria-invalid={!!err("email")} aria-describedby={err("email") ? `${id}-email-err` : undefined} disabled={!enabled} />
          {err("email") && (
            <span className="field-error" id={`${id}-email-err`}>
              {err("email")}
            </span>
          )}
        </label>
        <label className="field full" htmlFor={`${id}-clinic`}>
          Preferred clinic, or video consultation *
          <select id={`${id}-clinic`} name="clinic" required value={clinic} onChange={(e) => {
              // Availability is per clinic, so a date chosen for one clinic is meaningless for another.
              setClinic(e.target.value);
              setDate("");
              loadSlots(e.target.value, "");
            }} aria-invalid={!!err("clinic")} aria-describedby={err("clinic") ? `${id}-clinic-err` : undefined} disabled={!enabled}>
            <option value="" disabled>
              Select a clinic
            </option>
            {clinics.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
            <option value="help_me_choose">{CLINIC_PREFERENCES.help_me_choose}</option>
            <option value="video_consultation">{CLINIC_PREFERENCES.video_consultation}</option>
          </select>
          {err("clinic") && (
            <span className="field-error" id={`${id}-clinic-err`}>
              {err("clinic")}
            </span>
          )}
        </label>
        {slotsEnabled && clinic && !isClinicPreference(clinic) && (
          <div className="field full">
            <span className="field-label">Preferred date and time (optional)</span>
            <AvailabilityCalendar
              key={clinic}
              clinic={clinic}
              dateMin={dateMin}
              dateMax={dateMax}
              value={date}
              disabled={!enabled}
              onChange={(next) => {
                setDate(next);
                loadSlots(clinic, next);
              }}
            />
            <input type="hidden" name="date" value={date} />
            {slotState === "loading" && <span className="note">Loading times…</span>}
            {slotState === "none" && <span className="note">No published times for this date. You can still send the request and the clinic will suggest a time.</span>}
            {slotState === "error" && <span className="note">We couldn’t load availability. You can still send the request without a time.</span>}
            {slots && slots.length > 0 && (
              <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
                <legend className="note" style={{ marginTop: 8 }}>
                  Available times on {new Intl.DateTimeFormat("en-IN", { timeZone: CLINIC_TZ, weekday: "short", day: "numeric", month: "short" }).format(new Date(slots[0]!.start))} (clinic time, IST / UTC+5:30{visitorTz ? ", with your local time" : ""}) — a preference, not a booking
                </legend>
                <div className="slot-grid">
                  {slots.map((s) => (
                    <label key={s.start}>
                      <input type="radio" name="slot" value={s.start} checked={selectedSlot === s.start} onChange={() => setSelectedSlot(s.start)} />
                      {fmtSlot(s.start, visitorTz)}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
          </div>
        )}
      </div>
      <div className="hp" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className="consent" htmlFor={`${id}-consent`}>
        <input id={`${id}-consent`} type="checkbox" name="consent" required aria-invalid={!!err("consent")} disabled={!enabled} />
        <span>
          I agree to be contacted by the clinic about this request and have read the{" "}
          <Link href={ROUTES.privacy} style={{ textDecoration: "underline" }}>
            privacy notice
          </Link>
          .{err("consent") && <span className="field-error"> {err("consent")}</span>}
        </span>
      </label>
      <button className="button" type="submit" disabled={!enabled || status.kind === "sending"}>
        {status.kind === "sending" ? "Sending…" : "Send consultation request"} <ArrowUpRight size={18} aria-hidden="true" />
      </button>
      <p id={`${id}-explain`} className="note">
        Sending a request does not confirm an appointment. The clinic will contact you to confirm availability. For an emergency, seek urgent medical care.
      </p>
    </form>
  );
}
