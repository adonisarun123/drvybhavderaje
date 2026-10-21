import { AcceptInviteForm } from "@/components/admin/auth-forms";
import { findOpenInvitation } from "@/lib/staff/service";

export const dynamic = "force-dynamic";

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const inv = await findOpenInvitation(token);
  if (!inv) {
    return (
      <div className="auth-card">
        <h1>Invitation not valid</h1>
        <p>This invitation link is invalid, has expired or was already used. Ask an administrator to send a new one.</p>
      </div>
    );
  }
  return (
    <div className="auth-card">
      <h1>Join the clinic team</h1>
      <p>
        You have been invited as <strong>{inv.role === "admin" ? "an administrator" : "a coordinator"}</strong> using <strong>{inv.email}</strong>. Set a password to activate your account.
      </p>
      <AcceptInviteForm token={token} name={inv.name} />
    </div>
  );
}
