import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/auth-forms";
import { getStaffUser } from "@/lib/auth/guard";
import { countUsers } from "@/lib/staff/service";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const user = await getStaffUser();
  if (user) redirect("/admin");
  let needsSetup = false;
  try {
    needsSetup = (await countUsers()) === 0;
  } catch {
    needsSetup = false;
  }
  if (needsSetup) redirect("/admin/setup");
  return (
    <div className="auth-card">
      <h1>Staff sign in</h1>
      <p>Dr Vybhav Deraje — clinic administration. Authorised staff only.</p>
      <LoginForm next={next} />
      <p className="help" style={{ marginTop: 16 }}>
        <Link href="/">← Back to the public website</Link>
      </p>
    </div>
  );
}
