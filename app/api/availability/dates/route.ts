import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { DateTime } from "luxon";
import { db } from "@/lib/db/client";
import { clinics } from "@/lib/db/schema";
import { publicAvailableDates } from "@/lib/scheduling/public-slots";
import { allowRequest } from "@/lib/security/rate-limit";
import { hashIp } from "@/lib/security/tokens";
import { enquiriesEnabled } from "@/lib/enquiries/public-config";
import { PRACTICE_TZ } from "@/lib/time";

export const dynamic = "force-dynamic";

/**
 * GET /api/availability/dates?clinic=<slug>&month=YYYY-MM
 * Dates in that calendar month (practice timezone) with at least one bookable slot.
 * The server clamps the month to today … today + horizon; the response says which range it evaluated.
 */
export async function GET(req: Request) {
  if (!enquiriesEnabled()) return NextResponse.json({ enabled: false, dates: [], reason: "disabled" }, { status: 200 });
  const url = new URL(req.url);
  const clinicSlug = url.searchParams.get("clinic") ?? "";
  const month = url.searchParams.get("month") ?? "";
  if (!/^\d{4}-\d{2}$/.test(month) || !clinicSlug) return NextResponse.json({ error: "clinic and month (YYYY-MM) are required" }, { status: 400 });
  const start = DateTime.fromISO(`${month}-01`, { zone: PRACTICE_TZ });
  if (!start.isValid) return NextResponse.json({ error: "Invalid month" }, { status: 400 });
  const from = start.toISODate()!;
  const to = start.endOf("month").toISODate()!;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  try {
    // Shares the per-IP budget of /api/availability: a month view costs one request, same as a day.
    if (!(await allowRequest(`avail:${hashIp(ip)}`, 60, 60))) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    const [clinic] = await db.select().from(clinics).where(and(eq(clinics.slug, clinicSlug), eq(clinics.active, true)));
    if (!clinic) return NextResponse.json({ error: "Unknown clinic" }, { status: 404 });
    const result = await publicAvailableDates(clinic.id, from, to);
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("availability dates route", e);
    return NextResponse.json({ enabled: false, dates: [], reason: "error" }, { status: 503 });
  }
}
