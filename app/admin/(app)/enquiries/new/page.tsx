import { NewEnquiryForm } from "@/components/admin/enquiry-panels";
import { requireStaff } from "@/lib/auth/guard";
import { listClinics } from "@/lib/clinics";

export default async function NewEnquiryPage() {
  await requireStaff();
  const clinics = (await listClinics()).filter((c) => c.active);
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Log an enquiry</h1>
          <p>Record a phone, walk-in or referral enquiry so it can be followed up and converted into an appointment.</p>
        </div>
      </div>
      <div className="card" style={{ maxWidth: 760 }}>
        <NewEnquiryForm clinics={clinics.map((c) => ({ id: c.id, name: c.name }))} />
      </div>
    </>
  );
}
