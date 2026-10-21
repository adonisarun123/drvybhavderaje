import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import "../../admin.css";
import { AdminShell } from "@/components/admin/shell";
import { getStaffUser } from "@/lib/auth/guard";

export const metadata: Metadata = { title: "Clinic administration | Dr Vybhav Deraje", robots: { index: false, follow: false, noarchive: true } };
export const dynamic = "force-dynamic";

export default async function AdminAppLayout({ children }: { children: React.ReactNode }) {
  const user = await getStaffUser();
  if (!user) {
    const h = await headers();
    const path = h.get("x-pathname") ?? "/admin";
    redirect(`/admin/login?next=${encodeURIComponent(path)}`);
  }
  return (
    <AdminShell user={{ name: user.name, email: user.email, role: user.role, permissions: user.permissions, sessionExpiresAt: user.sessionExpiresAt.toISOString() }}>
      {children}
    </AdminShell>
  );
}
