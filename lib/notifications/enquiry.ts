import "server-only";
import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { clinics, type Enquiry } from "../db/schema";
import { SITE } from "../content";
import { siteOrigin } from "../seo";
import { emailConfigured, sendNotification } from "./index";
import { buildClinicAlert, buildPatientAck } from "./enquiry-emails";

/** Practice inbox for new-lead alerts; SALES_EMAIL keeps the convention of the other Monk Mantra sites. */
export function salesEmail(): string {
  return process.env.SALES_EMAIL || SITE.email;
}
function bccList(): string[] {
  return (process.env.BCC_EMAIL ?? "").split(",").map((s) => s.trim()).filter(Boolean);
}

/**
 * Emails the practice about a new website enquiry and acknowledges the patient (when they gave an
 * email). Runs after the enquiry is committed and after the HTTP response; it never throws, and every
 * attempt — sent, failed or not_configured — is written to notification_log against the enquiry.
 */
export async function notifyNewEnquiry(enquiry: Enquiry): Promise<void> {
  try {
    if (!emailConfigured()) {
      await sendNotification({ channel: "email", recipient: salesEmail(), template: "enquiry.clinic_alert", body: "", enquiryId: enquiry.id });
      return;
    }
    const [clinic] = enquiry.clinicId ? await db.select({ name: clinics.name, brand: clinics.brand }).from(clinics).where(eq(clinics.id, enquiry.clinicId)) : [];
    const input = {
      reference: enquiry.reference,
      name: enquiry.name,
      phoneRaw: enquiry.phoneRaw,
      phoneE164: enquiry.phoneE164,
      email: enquiry.email,
      clinicName: clinic ? [clinic.brand, clinic.name].filter(Boolean).join(" ") : null,
      clinicPreference: enquiry.clinicPreference,
      preferredStartAt: enquiry.preferredStartAt,
      remarks: enquiry.remarks,
      createdAt: enquiry.createdAt,
      adminUrl: `${siteOrigin()}/admin/enquiries/${enquiry.id}`,
      siteName: SITE.name,
      clinicPhone: SITE.phone,
    };
    const alert = buildClinicAlert(input);
    await sendNotification({ channel: "email", recipient: salesEmail(), bcc: bccList(), replyTo: enquiry.email ?? undefined, template: "enquiry.clinic_alert", subject: alert.subject, body: alert.text, html: alert.html, enquiryId: enquiry.id });
    if (enquiry.email) {
      const ack = buildPatientAck(input);
      await sendNotification({ channel: "email", recipient: enquiry.email, replyTo: SITE.email, template: "enquiry.patient_ack", subject: ack.subject, body: ack.text, html: ack.html, enquiryId: enquiry.id });
    }
  } catch (e) {
    console.error("notifyNewEnquiry", enquiry.reference, e);
  }
}
