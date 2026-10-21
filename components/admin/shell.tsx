"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CalendarDays, ClipboardList, Clock, History, Inbox, LayoutDashboard, MapPin, Users } from "lucide-react";
import { signOutAction } from "@/lib/actions/auth";

export interface ShellUser {
  name: string;
  email: string;
  role: "admin" | "coordinator";
  permissions: string[];
  sessionExpiresAt: string;
}

const ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/enquiries", label: "Enquiries", icon: Inbox },
  { href: "/admin/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/admin/appointments", label: "Appointments", icon: ClipboardList },
  { href: "/admin/availability", label: "Availability", icon: Clock },
  { href: "/admin/clinics", label: "Clinics", icon: MapPin },
  { href: "/admin/users", label: "Staff", icon: Users, adminOnly: true },
  { href: "/admin/audit", label: "Audit history", icon: History, permission: "audit:view" },
];

export function AdminShell({ user, children }: { user: ShellUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  const visible = ITEMS.filter((i) => (i.adminOnly ? user.role === "admin" : i.permission ? user.role === "admin" || user.permissions.includes(i.permission) : true));
  const expiry = new Date(user.sessionExpiresAt);
  return (
    <div className="admin-shell">
      <div className="admin-topbar">
        <strong>Dr Vybhav Deraje · Admin</strong>
        <button type="button" aria-expanded={open} aria-controls="admin-side" onClick={() => setOpen((o) => !o)}>
          {open ? "Close menu" : "Menu"}
        </button>
      </div>
      <aside id="admin-side" className={`admin-side${open ? " open" : ""}`} aria-label="Admin navigation">
        <Link href="/admin" className="brand">
          Dr Vybhav Deraje
          <small>Clinic administration</small>
        </Link>
        {visible.map((item) => {
          const Icon = item.icon;
          const current = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className="nav-item" aria-current={current ? "page" : undefined}>
              <Icon size={18} aria-hidden="true" /> {item.label}
            </Link>
          );
        })}
        <div className="side-footer">
          <strong style={{ color: "#fff" }}>{user.name}</strong>
          <br />
          {user.role === "admin" ? "Administrator" : "Coordinator"}
          <br />
          <span className="session-expiry" style={{ color: "#a8c4e0" }}>
            Session ends {expiry.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" })} IST
          </span>
          <form action={signOutAction}>
            <button type="submit">Sign out</button>
          </form>
          <Link href="/" style={{ display: "block", marginTop: 10, color: "#a8c4e0" }}>
            View public site →
          </Link>
        </div>
      </aside>
      <main className="admin-main" id="main">
        {children}
      </main>
    </div>
  );
}
