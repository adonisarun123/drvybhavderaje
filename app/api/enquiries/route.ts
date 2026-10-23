import { NextResponse, after } from "next/server";
import { createPublicEnquiry, publicEnquirySchema } from "@/lib/enquiries/service";
import { enquiriesEnabled } from "@/lib/enquiries/public-config";
import { allowRequest } from "@/lib/security/rate-limit";
import { hashIp } from "@/lib/security/tokens";
import { siteOrigin } from "@/lib/seo";
import { isAppError, ValidationError } from "@/lib/errors";
import { notifyNewEnquiry } from "@/lib/notifications/enquiry";

export const dynamic = "force-dynamic";
const MAX_BODY_BYTES = 8 * 1024;
const UNAVAILABLE = { ok: false, code: "unavailable", message: "We could not save your request just now. Nothing has been sent — please try again in a moment or call the clinic." };

function originAllowed(req: Request): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (!origin) return false;
  try {
    const o = new URL(origin);
    if (host && o.host === host) return true;
    return o.origin === siteOrigin();
  } catch {
    return false;
  }
}

async function verifyTurnstile(token: string | undefined, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // not configured → honeypot + timing + rate limits only
  if (!token) return false;
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret, response: token, remoteip: ip }),
  });
  const data = (await res.json()) as { success?: boolean };
  return !!data.success;
}

export async function POST(req: Request) {
  if (!enquiriesEnabled()) {
    return NextResponse.json({ ok: false, code: "disabled", message: "Online requests are not available right now. Please call the clinic." }, { status: 503 });
  }
  if (!originAllowed(req)) return NextResponse.json({ ok: false, code: "origin", message: "Request blocked." }, { status: 403 });
  const len = Number(req.headers.get("content-length") ?? "0");
  if (len > MAX_BODY_BYTES) return NextResponse.json({ ok: false, code: "too_large", message: "Request too large." }, { status: 413 });
  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return NextResponse.json({ ok: false, code: "too_large", message: "Request too large." }, { status: 413 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ipHash = hashIp(ip);
  try {
    if (!(await allowRequest(`enq:${ipHash}`, 5, 600)) || !(await allowRequest("enq:global", 120, 60))) {
      return NextResponse.json({ ok: false, code: "rate_limited", message: "Too many requests. Please try again later or call the clinic." }, { status: 429 });
    }
  } catch (e) {
    console.error("enquiry rate limiter: database unavailable", e);
    return NextResponse.json(UNAVAILABLE, { status: 503 });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, code: "bad_json", message: "Invalid request." }, { status: 400 });
  }
  const parsed = publicEnquirySchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      (fieldErrors[key] ??= []).push(issue.message);
    }
    return NextResponse.json({ ok: false, code: "validation", message: "Please check the highlighted fields.", fieldErrors }, { status: 422 });
  }
  const input = parsed.data;
  // Honeypot: silently accept without storing.
  if (input.website) return NextResponse.json({ ok: true, data: { reference: "received" } });
  // Bots submit instantly; humans take a few seconds.
  if (input.startedAt && Date.now() - input.startedAt < 2500) {
    return NextResponse.json({ ok: false, code: "too_fast", message: "Please review the form and try again." }, { status: 400 });
  }
  const turnstile = (body as { turnstileToken?: string }).turnstileToken;
  if (!(await verifyTurnstile(turnstile, ip))) {
    return NextResponse.json({ ok: false, code: "captcha", message: "Verification failed. Please try again." }, { status: 400 });
  }

  try {
    const { enquiry, duplicate } = await createPublicEnquiry(input, { ipHash, userAgent: req.headers.get("user-agent") });
    // Emails go out after the response; a mail failure can never turn a saved enquiry into an error for the visitor.
    if (!duplicate) after(() => notifyNewEnquiry(enquiry));
    return NextResponse.json({ ok: true, data: { reference: enquiry.reference, duplicate } });
  } catch (e) {
    if (e instanceof ValidationError) return NextResponse.json({ ok: false, code: e.code, message: e.message, fieldErrors: e.fieldErrors }, { status: 422 });
    if (isAppError(e)) return NextResponse.json({ ok: false, code: e.code, message: e.message }, { status: e.status });
    console.error("enquiry route failed", e);
    return NextResponse.json(UNAVAILABLE, { status: 503 });
  }
}
