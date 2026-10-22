/**
 * Public URL map.
 *
 * The legacy URLs of https://drvybhavderaje.com/ (the `.html` paths) are the CANONICAL public URLs
 * of this site so that every existing backlink, bookmark and search result keeps resolving with a
 * 200 — no redirect hop, no equity loss. Internally each page lives at the same path without the
 * `.html` suffix (`app/(public)/aboutus/page.tsx`, `app/(public)/[slug]/page.tsx` …) and
 * `next.config.ts` rewrites the public `.html` URL onto it. The suffix-less paths, and the clean
 * paths used by the earlier redesign, 301 to the canonical `.html` URL so only one URL per page is
 * ever indexed.
 *
 * Always link with these constants (or `servicePath()`); never hard-code a path in JSX.
 */
export const ROUTES = {
  home: "/",
  about: "/aboutus.html",
  locations: "/practice-location.html",
  testimonials: "/testimonials.html",
  contact: "/contact-us.html",
  privacy: "/privacy-policy.html",
  terms: "/terms-of-use.html",
  /** New page without a legacy equivalent. */
  resources: "/patient-resources",
} as const;

/** Public canonical path for a service page slug (legacy stem, e.g. "craniosynostosis-surgery-bangalore"). */
export function servicePath(slug: string): string {
  return `/${slug}.html`;
}

/** Legacy service page slugs (the part before `.html`). Order = display order. */
export const SERVICE_SLUGS = [
  "craniosynostosis-surgery-bangalore",
  "cleft-lip-and-palate-treatment-bangalore",
  "corrective-jaw-surgery-bangalore",
  "facial-injuries-and-fracture-treatments",
  "head-and-neck-cancer-treatment",
  "other-craniofacial-conditions-treatments",
  "face-plastic-surgery-bangalore",
  "breast-plastic-surgeon-bangalore",
  "body-plastic-surgeon-bangalore",
  "hand-plastic-surgeon-bangalore",
] as const;

export type ServiceSlug = (typeof SERVICE_SLUGS)[number];

/** Internal (suffix-less) stems of the non-service legacy pages, used by next.config.ts. */
export const STATIC_LEGACY_STEMS = ["aboutus", "practice-location", "testimonials", "contact-us", "privacy-policy", "terms-of-use"] as const;

/** Paths used by the previous redesign build; each 301s to its canonical legacy URL. */
export const RETIRED_PATHS: Record<string, string> = {
  "/about": ROUTES.about,
  "/locations": ROUTES.locations,
  "/appointment": ROUTES.contact,
  "/contact": ROUTES.contact,
  "/privacy": ROUTES.privacy,
  "/terms": ROUTES.terms,
  "/craniosynostosis": servicePath("craniosynostosis-surgery-bangalore"),
  "/cleft-care": servicePath("cleft-lip-and-palate-treatment-bangalore"),
  "/cosmetic-surgery": servicePath("face-plastic-surgery-bangalore"),
  "/reconstructive-surgery": servicePath("facial-injuries-and-fracture-treatments"),
  "/index.html": ROUTES.home,
  "/index": ROUTES.home,
  "/home": ROUTES.home,
};
