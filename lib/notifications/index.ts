import "server-only";
import { eq } from "drizzle-orm";
import nodemailer, { type Transporter } from "nodemailer";
import { db } from "../db/client";
import { notificationLog } from "../db/schema";

/**
 * Notification delivery is explicit and separate from appointment state.
 * Without a configured provider nothing is sent and the log records
 * `not_configured`, so the dashboard never claims a message went out.
 *
 * Email providers, in order of preference:
 *   1. SMTP  — SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL
 *              (the same variables the other Monk Mantra sites use).
 *   2. Resend — RESEND_API_KEY and NOTIFY_FROM_EMAIL.
 * SMS: not wired; the log entry is recorded as not_configured.
 */
export interface Notification {
  channel: "email" | "sms";
  recipient: string;
  template: string;
  subject?: string;
  body: string;
  html?: string;
  bcc?: string[];
  replyTo?: string;
  appointmentId?: string | null;
  enquiryId?: string | null;
}

export function smtpConfigured(): boolean {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && fromAddress());
}

export function resendConfigured(): boolean {
  return !!(process.env.RESEND_API_KEY && fromAddress());
}

export function emailConfigured(): boolean {
  return smtpConfigured() || resendConfigured();
}

/** Sender for every outgoing email. FROM_EMAIL (shared convention) wins over the older NOTIFY_FROM_EMAIL. */
export function fromAddress(): string | undefined {
  return process.env.FROM_EMAIL || process.env.NOTIFY_FROM_EMAIL || undefined;
}

let transporter: Transporter | null = null;
function smtpTransport(): Transporter {
  if (transporter) return transporter;
  const port = Number(process.env.SMTP_PORT ?? 587);
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  return transporter;
}

async function deliverEmail(n: Notification): Promise<{ provider: string; messageId: string | null }> {
  const from = fromAddress()!;
  if (smtpConfigured()) {
    const info = await smtpTransport().sendMail({
      from,
      to: n.recipient,
      bcc: n.bcc?.length ? n.bcc : undefined,
      replyTo: n.replyTo,
      subject: n.subject ?? "Message from the clinic",
      text: n.body,
      html: n.html,
    });
    return { provider: "smtp", messageId: info.messageId ?? null };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [n.recipient], bcc: n.bcc, reply_to: n.replyTo, subject: n.subject ?? "Message from the clinic", text: n.body, html: n.html }),
  });
  if (!res.ok) throw new Error(`Resend responded ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = (await res.json()) as { id?: string };
  return { provider: "resend", messageId: data.id ?? null };
}

export async function sendNotification(n: Notification): Promise<{ status: string; id: string }> {
  const [log] = await db
    .insert(notificationLog)
    .values({ channel: n.channel, recipient: n.recipient, template: n.template, appointmentId: n.appointmentId ?? null, enquiryId: n.enquiryId ?? null, status: "queued" })
    .returning();
  const id = log!.id;
  try {
    if (n.channel === "email" && emailConfigured()) {
      const { provider, messageId } = await deliverEmail(n);
      await db.update(notificationLog).set({ status: "sent", provider, providerMessageId: messageId, sentAt: new Date() }).where(eq(notificationLog.id, id));
      return { status: "sent", id };
    }
    await db.update(notificationLog).set({ status: "not_configured", provider: null }).where(eq(notificationLog.id, id));
    return { status: "not_configured", id };
  } catch (e) {
    // A delivery failure must never undo the saved record — it is only logged.
    await db.update(notificationLog).set({ status: "failed", error: e instanceof Error ? e.message.slice(0, 500) : String(e) }).where(eq(notificationLog.id, id));
    return { status: "failed", id };
  }
}
