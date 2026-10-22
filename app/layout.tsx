import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE } from "@/lib/content";
import { ROUTES } from "@/lib/routes";
import { absolute, siteOrigin } from "@/lib/seo";
import { imageKitEndpoint } from "@/lib/image-config";

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin()),
  title: `${SITE.name} | Craniofacial & Plastic Surgeon, Bengaluru`,
  description: SITE.defaultDescription,
  authors: [{ name: SITE.name, url: absolute(ROUTES.about) }],
  creator: SITE.name,
  publisher: SITE.legalName,
  category: "Health",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#08294a" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <head>
        {/* Every image (including the LCP hero) is served from ImageKit — open the connection before the preload is discovered. */}
        <link rel="preconnect" href={new URL(imageKitEndpoint()).origin} />
      </head>
      <body>{children}</body>
    </html>
  );
}
