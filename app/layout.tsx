import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE } from "@/lib/content";
import { siteOrigin } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin()),
  title: `${SITE.name} | Craniofacial & Plastic Surgeon, Bengaluru`,
  description: SITE.defaultDescription,
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#08294a" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <body>{children}</body>
    </html>
  );
}
