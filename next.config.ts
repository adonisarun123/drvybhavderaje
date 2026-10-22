import type { NextConfig } from "next";
import { RETIRED_PATHS, SERVICE_SLUGS, STATIC_LEGACY_STEMS } from "./lib/routes";

/**
 * URL strategy (see lib/routes.ts and docs/SEO-MIGRATION.md).
 *
 * Every URL of the legacy site https://drvybhavderaje.com/ keeps serving a 200 at the SAME address:
 *   /aboutus.html, /craniosynostosis-surgery-bangalore.html, /practice-location.html, …
 * These `.html` URLs are the canonical URLs. Internally the pages live at the suffix-less path, so
 *   rewrite  /aboutus.html  →  /aboutus      (URL in the browser is unchanged)
 *   redirect /aboutus       →  /aboutus.html (301, so only one URL per page is ever indexed)
 * The clean paths used by the earlier redesign build (/about, /craniosynostosis …) also 301 to the
 * canonical legacy URL. Nothing redirects to the homepage except the old /index.html.
 */
const LEGACY_STEMS: string[] = [...STATIC_LEGACY_STEMS, ...SERVICE_SLUGS];

const legacyRewrites = LEGACY_STEMS.map((stem) => ({ source: `/${stem}.html`, destination: `/${stem}` }));

const canonicalRedirects = [
  ...LEGACY_STEMS.map((stem) => ({ source: `/${stem}`, destination: `/${stem}.html`, permanent: true })),
  ...Object.entries(RETIRED_PATHS).map(([source, destination]) => ({ source, destination, permanent: true })),
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
  images: { remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com" }] },
  async redirects() {
    return canonicalRedirects;
  },
  async rewrites() {
    return { beforeFiles: legacyRewrites, afterFiles: [], fallback: [] };
  },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      { source: "/admin/(.*)", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }, { key: "Cache-Control", value: "no-store" }] },
      { source: "/admin", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }, { key: "Cache-Control", value: "no-store" }] },
      { source: "/api/(.*)", headers: [{ key: "X-Robots-Tag", value: "noindex" }] },
      { source: "/images/pdf/(.*)", headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }] },
    ];
  },
};

export default nextConfig;
