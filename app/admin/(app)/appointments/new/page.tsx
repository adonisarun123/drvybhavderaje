import { AppointmentForm } from "@/components/admin/appointment-form";
import { createAppointmentAction } from "@/lib/actions/appointments";
import { requireStaff } from "@/lib/auth/guard";
import { getPrimaryDoctor, listClinics } from "@/lib/clinics";
import { db } from "@/lib/db/client";
import { loadPolicy } from "@/lib/scheduling/engine";
import { toLocalInputValue } from "@/lib/time";

export default async function NewAppointmentPage({ searchParams }: { searchParams: Promise<{ start?: string; clinic?: string }> }) {
  await requireStaff();
  const sp = await searchParams;
  const doctor = await getPrimaryDoctor();
  if (!doctor) return <div className="alert warn">No doctor record. Run the seed script first.</div>;
  const clinics = (await listClinics()).filter((c) => c.active);
  const policy = await db.transaction((tx) => loadPolicy(tx, doctor.id));
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Add appointment</h1>
          <p>For bookings received by phone or in person. The server re-checks the doctor’s availability across all clinics before saving.</p>
        </div>
      </div>
      <div className="card" style={{ maxWidth: 820 }}>
        <AppointmentForm
          doctorId={doctor.id}
          clinics={clinics.map((c) => ({ id: c.id, name: c.name }))}
          defaults={{ startAt: sp.start ? toLocalInputValue(new Date(sp.start)) : "", clinicId: sp.clinic ?? "" }}
          defaultDurationMin={policy.defaultDurationMin}
          holdMinutes={policy.holdMinutes}
          action={createAppointmentAction}
        />
      </div>
    </>
  );
}
