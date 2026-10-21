import type { Metadata } from "next";
import "../../admin.css";

export const metadata: Metadata = { title: "Staff sign in | Dr Vybhav Deraje", robots: { index: false, follow: false } };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="auth-wrap">{children}</div>;
}
