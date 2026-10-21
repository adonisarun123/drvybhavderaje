import { InviteForm, RevokeInviteButton, StaffRow } from "@/components/admin/staff-forms";
import { requireStaff } from "@/lib/auth/guard";
import { Forbidden } from "@/components/admin/forbidden";
import { listInvitations, listStaff } from "@/lib/staff/service";
import { fmtDateTime } from "@/lib/time";

export default async function UsersPage() {
  const me = await requireStaff();
  if (me.role !== "admin") return <Forbidden what="staff management" />;
  const [staff, invites] = await Promise.all([listStaff(), listInvitations()]);
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Staff &amp; permissions</h1>
          <p>Administrators manage everything. Coordinators handle enquiries and appointments; grant extra permissions individually when needed.</p>
        </div>
      </div>
      <div className="grid-2">
        <div className="stack">
          {staff.map((u) => (
            <StaffRow key={u.id} u={{ id: u.id, name: u.name, email: u.email, role: u.role, banned: u.banned, banReason: u.banReason, permissions: u.permissions }} isSelf={u.id === me.id} />
          ))}
        </div>
        <div className="stack">
          <section className="card">
            <h2>Invite a staff member</h2>
            <InviteForm />
          </section>
          <section className="card">
            <h2>Open invitations</h2>
            {invites.length === 0 ? (
              <div className="empty">No open invitations.</div>
            ) : (
              <ul className="timeline">
                {invites.map((i) => (
                  <li key={i.id}>
                    {i.name} &lt;{i.email}&gt; as {i.role} · expires {fmtDateTime(i.expiresAt)} <RevokeInviteButton id={i.id} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
