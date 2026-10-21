import { redirect } from "next/navigation";
import { SetupForm } from "@/components/admin/auth-forms";
import { countUsers } from "@/lib/staff/service";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  let count = 0;
  let dbError: string | null = null;
  try {
    count = await countUsers();
  } catch (e) {
    dbError = e instanceof Error ? e.message : "Database unavailable";
  }
  if (count > 0) redirect("/admin/login");
  return (
    <div className="auth-card">
      <h1>First-time setup</h1>
      <p>Create the first administrator account. This page only works while no staff accounts exist and requires the server’s setup token.</p>
      {dbError ? (
        <div className="alert error" role="alert">
          The database is not reachable ({dbError}). Configure DATABASE_URL and run the migrations first.
        </div>
      ) : !process.env.ADMIN_SETUP_TOKEN ? (
        <div className="alert warn">ADMIN_SETUP_TOKEN is not set on the server. Add it to the environment, restart, then reload this page.</div>
      ) : (
        <SetupForm />
      )}
    </div>
  );
}
