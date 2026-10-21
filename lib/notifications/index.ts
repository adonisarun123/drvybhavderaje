import "server-only";
import { db } from "../db/client";
import { notificationLog } from "../db/schema";

/**
 * Notification delivery is explicit and separate from appointment state.
 * Without a configured provider nothing is sent and the log records
 * `not_configured`, so the dashboard never claims a message went out.
 *
 * Email provider: Resend (set RESEND_API_KEY and NOTIFY_FROM_EMAIL).
 * SMS: not wired; the log entry is recorded as not_configured.
 */
export interface Notification {
  channel: "email" | "sms";
  recipient: string;
  template: string;
  subject?: string;
  body: string;
  appointmentId?: string | null;
  enquiryId?: string | null;
}

export function emailConfigured(): boolean {
  return !!(process.env.RESEND_API_KEY && process.env.NOTIFY_FROM_EMAIL);
}

export async function sendNotification(n: Notification): Promise<{ status: string; id: string }> {
  const [log] = await db
    .insert(notificationLog)
    .values({ channel: n.channel, recipient: n.recipient, template: n.template, appointmentId: n.appointmentId ?? null, enquiryId: n.enquiryId ?? null, status: "queued" })
    .returning();
  const id = log!.id;
  try {
    if (n.channel === "email" && emailConfigured()) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: process.env.NOTIFY_FROM_EMAIL, to: [n.recipient], subject: n.subject ?? "Message from the clinic", text: n.body }),
      });
      if (!res.ok) throw new Error(`Resend responded ${res.status}: ${(await res.text()).slice(0, 300)}`);
      const data = (await res.json()) as { id?: string };
      await db.update(notificationLog).set({ status: "sent", provider: "resend", providerMessageId: data.id ?? null, sentAt: new Date() }).where(eqId(id));
      return { status: "sent", id };
    }
    await db.update(notificationLog).set({ status: "not_configured", provider: null }).where(eqId(id));
    return { status: "not_configured", id };
  } catch (e) {
    // A delivery failure must never undo the saved appointment — it is only logged.
    await db.update(notificationLog).set({ status: "failed", error: e instanceof Error ? e.message.slice(0, 500) : String(e) }).where(eqId(id));
    return { status: "failed", id };
  }
}

import { eq } from "drizzle-orm";
function eqId(id: string) {
  return eq(notificationLog.id, id);
}
