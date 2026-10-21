import type { NextConfig } from "next";

/**
 * Legacy URL map from https://drvybhavderaje.com/ (inventoried 21 Oct 2026).
 * Only genuinely equivalent pages are redirected permanently. Old service pages
 * map to the new service page that covers the same topic — never to the homepage.
 */
const legacyRedirects: { source: string; destination: string }[] = [
  { source: "/index.html", destination: "/" },
  { source: "/aboutus.html", destination: "/about" },
  { source: "/contact-us.html", destination: "/appointment" },
  { source: "/practice-location.html", destination: "/locations" },
  { source: "/craniosynostosis-surgery-bangalore.html", destination: "/craniosynostosis" },
  { source: "/cleft-lip-and-palate-treatment-bangalore.html", destination: "/cleft-care" },
  { source: "/corrective-jaw-surgery-bangalore.html", destination: "/cleft-care" },
  { source: "/other-craniofacial-conditions-treatments.html", destination: "/cleft-care" },
  { source: "/facial-injuries-and-fracture-treatments.html", destination: "/reconstructive-surgery" },
  { source: "/head-and-neck-cancer-treatment.html", destination: "/reconstructive-surgery" },
  { source: "/hand-plastic-surgeon-bangalore.html", destination: "/reconstructive-surgery" },
  { source: "/face-plastic-surgery-bangalore.html", destination: "/cosmetic-surgery" },
  { source: "/breast-plastic-surgeon-bangalore.html", destination: "/cosmetic-surgery" },
  { source: "/body-plastic-surgeon-bangalore.html", destination: "/cosmetic-surgery" },
  { source: "/privacy-policy.html", destination: "/privacy" },
  // /testimonials.html and /terms-of-use.html have no equivalent page in the redesign (testimonials
  // intentionally excluded pending consent review). They return 404 rather than a misleading redirect.
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
  async redirects() {
    return legacyRedirects.map((r) => ({ ...r, permanent: true }));
  },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      { source: "/admin/(.*)", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }, { key: "Cache-Control", value: "no-store" }] },
      { source: "/admin", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }, { key: "Cache-Control", value: "no-store" }] },
      { source: "/api/(.*)", headers: [{ key: "X-Robots-Tag", value: "noindex" }] },
    ];
  },
};

export default nextConfig;
