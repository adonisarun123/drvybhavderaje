/**
 * Pure builders for the two emails a new website enquiry produces. Kept free of
 * server imports so they can be unit-tested; sending lives in ./enquiry.ts.
 */
import { CLINIC_PREFERENCES, isClinicPreference } from "../enquiries/preferences";

export interface EnquiryEmailInput {
  reference: string;
  name: string;
  phoneRaw: string;
  phoneE164: string;
  email: string | null;
  clinicName: string | null;
  clinicPreference: string | null;
  preferredStartAt: Date | null;
  createdAt: Date;
  adminUrl: string;
  siteName: string;
  clinicPhone: string;
}

const TZ = "Asia/Kolkata";
export function fmtIst(d: Date): string {
  return new Intl.DateTimeFormat("en-IN", { timeZone: TZ, weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true }).format(d) + " IST";
}

export function clinicLabel(i: Pick<EnquiryEmailInput, "clinicName" | "clinicPreference">): string {
  if (i.clinicName) return i.clinicName;
  if (i.clinicPreference && isClinicPreference(i.clinicPreference)) return CLINIC_PREFERENCES[i.clinicPreference];
  return "Not specified";
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** Internal alert to the practice. Contains contact details; sent only to the configured practice inbox. */
export function buildClinicAlert(i: EnquiryEmailInput): { subject: string; text: string; html: string } {
  const rows: [string, string][] = [
    ["Reference", i.reference],
    ["Name", i.name],
    ["Phone", `${i.phoneE164}${i.phoneRaw && i.phoneRaw !== i.phoneE164 ? ` (entered: ${i.phoneRaw})` : ""}`],
    ["Email", i.email ?? "—"],
    ["Clinic", clinicLabel(i)],
    ["Preferred time", i.preferredStartAt ? fmtIst(i.preferredStartAt) : "No preference given"],
    ["Received", fmtIst(i.createdAt)],
  ];
  const subject = `New consultation request ${i.reference} — ${i.name} (${clinicLabel(i)})`;
  const text = [
    `A new consultation request has arrived on ${i.siteName}.`,
    "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    "",
    `Open in admin: ${i.adminUrl}`,
    "",
    "The patient has been told this is a request, not a confirmed appointment, and that the clinic will contact them.",
  ].join("\n");
  const html = `<p>A new consultation request has arrived on ${esc(i.siteName)}.</p>
<table cellpadding="6" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">
${rows.map(([k, v]) => `<tr><td style="color:#555;border-bottom:1px solid #eee"><b>${esc(k)}</b></td><td style="border-bottom:1px solid #eee">${esc(v)}</td></tr>`).join("\n")}
</table>
<p><a href="${esc(i.adminUrl)}">Open in admin</a></p>
<p style="color:#555;font-size:13px">The patient has been told this is a request, not a confirmed appointment, and that the clinic will contact them.</p>`;
  return { subject, text, html };
}

/** Acknowledgement to the patient. Deliberately contains no medical content and no times beyond what they entered. */
export function buildPatientAck(i: EnquiryEmailInput): { subject: string; text: string; html: string } {
  const subject = `We have received your request (${i.reference}) — ${i.siteName}`;
  const pref = i.preferredStartAt ? `Your preferred time: ${fmtIst(i.preferredStartAt)}.` : "";
  const text = [
    `Dear ${i.name},`,
    "",
    `Thank you — your consultation request has been received. Your reference is ${i.reference}.`,
    `Clinic: ${clinicLabel(i)}. ${pref}`.trim(),
    "",
    "This is not a confirmed appointment. The clinic will contact you on the phone number you gave to confirm the location, date and time.",
    `If you need to speak to someone sooner, call ${i.clinicPhone}.`,
    "",
    "Please do not reply to this email with medical reports or photographs; the clinic will ask for anything it needs.",
    "",
    i.siteName,
  ].join("\n");
  const html = `<p>Dear ${esc(i.name)},</p>
<p>Thank you — your consultation request has been received. Your reference is <b>${esc(i.reference)}</b>.<br>Clinic: ${esc(clinicLabel(i))}. ${esc(pref)}</p>
<p><b>This is not a confirmed appointment.</b> The clinic will contact you on the phone number you gave to confirm the location, date and time. If you need to speak to someone sooner, call ${esc(i.clinicPhone)}.</p>
<p style="color:#555;font-size:13px">Please do not reply to this email with medical reports or photographs; the clinic will ask for anything it needs.</p>
<p>${esc(i.siteName)}</p>`;
  return { subject, text, html };
}
