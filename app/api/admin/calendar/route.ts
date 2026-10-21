import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth/guard";
import { getPrimaryDoctor } from "@/lib/clinics";
import { calendarEvents } from "@/lib/admin/queries";
import { isAppError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await requireStaff();
    const url = new URL(req.url);
    const start = new Date(url.searchParams.get("start") ?? "");
    const end = new Date(url.searchParams.get("end") ?? "");
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return NextResponse.json({ error: "start and end required" }, { status: 400 });
    if (end.getTime() - start.getTime() > 62 * 86_400_000) return NextResponse.json({ error: "range too large" }, { status: 400 });
    const doctor = await getPrimaryDoctor();
    if (!doctor) return NextResponse.json([]);
    const events = await calendarEvents(doctor.id, start, end, { clinicId: url.searchParams.get("clinic") || undefined, status: url.searchParams.get("status") || undefined });
    return NextResponse.json(events, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    if (isAppError(e)) return NextResponse.json({ error: e.message }, { status: e.status });
    console.error(e);
    return NextResponse.json({ error: "Calendar data unavailable" }, { status: 500 });
  }
}
