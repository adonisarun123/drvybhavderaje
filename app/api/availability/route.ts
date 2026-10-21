import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { clinics } from "@/lib/db/schema";
import { publicSlotsForDate } from "@/lib/scheduling/public-slots";
import { allowRequest } from "@/lib/security/rate-limit";
import { hashIp } from "@/lib/security/tokens";
import { enquiriesEnabled } from "@/lib/enquiries/public-config";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!enquiriesEnabled()) return NextResponse.json({ enabled: false, slots: [], reason: "disabled" }, { status: 200 });
  const url = new URL(req.url);
  const clinicSlug = url.searchParams.get("clinic") ?? "";
  const date = url.searchParams.get("date") ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !clinicSlug) return NextResponse.json({ error: "clinic and date (YYYY-MM-DD) are required" }, { status: 400 });
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  try {
    if (!(await allowRequest(`avail:${hashIp(ip)}`, 60, 60))) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    const [clinic] = await db.select().from(clinics).where(and(eq(clinics.slug, clinicSlug), eq(clinics.active, true)));
    if (!clinic) return NextResponse.json({ error: "Unknown clinic" }, { status: 404 });
    const result = await publicSlotsForDate(clinic.id, date);
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("availability route", e);
    return NextResponse.json({ enabled: false, slots: [], reason: "error" }, { status: 503 });
  }
}
