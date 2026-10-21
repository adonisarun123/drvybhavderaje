import { AdminCalendar } from "@/components/admin/calendar";
import { can, requireStaff } from "@/lib/auth/guard";
import { listClinics } from "@/lib/clinics";

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ date?: string; view?: string }> }) {
  const user = await requireStaff();
  const sp = await searchParams;
  const clinics = (await listClinics()).filter((c) => c.active);
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Calendar</h1>
          <p>Doctor’s schedule across all clinics. Appointments, holds and unavailable periods are shown together so nothing can be double-booked by eye.</p>
        </div>
      </div>
      <AdminCalendar clinics={clinics.map((c) => ({ id: c.id, name: c.name }))} initialDate={sp.date} initialView={sp.view} canManageAvailability={can(user, "availability:manage")} />
    </>
  );
}
