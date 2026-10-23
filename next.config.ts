import type { NextConfig } from "next";
import { imageKitEndpoint } from "./lib/image-config";
import { LEGACY_PDF_REDIRECTS } from "./lib/pdf-redirects";
import { LEGACY_HTML_REDIRECTS, RETIRED_PATHS } from "./lib/routes";

/**
 * URL strategy (see lib/routes.ts and docs/SEO-MIGRATION.md).
 *
 * Canonical URLs are clean, suffix-less paths: /aboutus, /craniosynostosis-surgery-bangalore, …
 * Every URL of the legacy site https://drvybhavderaje.com/ (the `.html` paths) is kept alive as a
 * permanent 308 redirect to its clean path, one hop, query string preserved:
 *   /aboutus.html  →  /aboutus   (308)
 * The clean paths of the earlier redesign build (/about, /craniosynostosis …) also 308 straight to the
 * canonical URL. Nothing redirects to the homepage except /index.html, /index and /home.
 * There are no rewrites: the URL in the address bar is the canonical URL.
 */
/** Images moved to ImageKit; the legacy /images/… URLs redirect there. The PDFs redirect to their HTML pages (lib/pdf-redirects.ts). */
const IK = imageKitEndpoint();
const imageRedirects = [
  { source: "/images/custom/:path*", destination: `${IK}/custom/:path*`, permanent: true },
  { source: "/images/slider2/:path*", destination: `${IK}/slider2/:path*`, permanent: true },
  { source: "/images/landing-page/:path*", destination: `${IK}/custom/:path*`, permanent: true },
  { source: "/images/dRlogo.png", destination: `${IK}/dRlogo.png`, permanent: true },
  { source: "/images/dRlogo_footer.png", destination: `${IK}/dRlogo_footer.png`, permanent: true },
  { source: "/images/doctor.png", destination: `${IK}/doctor.png`, permanent: true },
  // ImageKit replaces square brackets in file names with underscores.
  { source: "/images/3518679_16443-[Converte.png", destination: `${IK}/3518679_16443-_Converte.png`, permanent: true },
  { source: "/images/3518679_16443-[Converted].png", destination: `${IK}/3518679_16443-_Converted_.png`, permanent: true },
];

const canonicalRedirects = [
  ...imageRedirects,
  ...LEGACY_HTML_REDIRECTS.map(({ source, destination }) => ({ source, destination, permanent: true })),
  ...Object.entries(RETIRED_PATHS).map(([source, destination]) => ({ source, destination, permanent: true })),
  ...Object.entries(LEGACY_PDF_REDIRECTS).map(([source, destination]) => ({ source, destination, permanent: true })),
];

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  typescript: { ignoreBuildErrors: false },
  images: { remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com" }, { protocol: "https", hostname: "ik.imagekit.io" }] },
  async redirects() {
    return canonicalRedirects;
  },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      { source: "/admin/(.*)", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }, { key: "Cache-Control", value: "no-store" }] },
      { source: "/admin", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }, { key: "Cache-Control", value: "no-store" }] },
      { source: "/api/(.*)", headers: [{ key: "X-Robots-Tag", value: "noindex" }] },
      // Post-enquiry page: reachable, but never a search result.
      { source: "/thank-you", headers: [{ key: "X-Robots-Tag", value: "noindex, follow" }, { key: "Cache-Control", value: "no-store" }] },
      { source: "/images/pdf/(.*)", headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }] },
    ];
  },
};

export default nextConfig;
