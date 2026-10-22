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

/**
 * Service page slugs.
 *
 * LEGACY slugs are the ten service pages of the old site; their canonical URL keeps the `.html`
 * suffix (see above). NEW slugs were added on 22 Oct 2026 when the practice narrowed its public
 * focus to 14 named procedures; they have no legacy URL to preserve, so they use clean paths.
 */
export const LEGACY_SERVICE_SLUGS = [
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

export const NEW_SERVICE_SLUGS = [
  "ear-reconstruction-surgery-bangalore",
  "rhinoplasty-surgery-bangalore",
  "blepharoplasty-eyelid-surgery-bangalore",
  "otoplasty-ear-correction-bangalore",
  "chin-augmentation-surgery-bangalore",
  "facelift-surgery-bangalore",
  "tummy-tuck-abdominoplasty-bangalore",
  "breast-augmentation-surgery-bangalore",
  "breast-reduction-surgery-bangalore",
  "gynecomastia-surgery-bangalore",
  "liposuction-surgery-bangalore",
] as const;

export const SERVICE_SLUGS = [...LEGACY_SERVICE_SLUGS, ...NEW_SERVICE_SLUGS] as const;

export type LegacyServiceSlug = (typeof LEGACY_SERVICE_SLUGS)[number];
export type ServiceSlug = (typeof SERVICE_SLUGS)[number];

const LEGACY_SET: ReadonlySet<string> = new Set(LEGACY_SERVICE_SLUGS);

/** Public canonical path for a service page slug: legacy slugs keep `.html`, new slugs are clean. */
export function servicePath(slug: ServiceSlug): string {
  return LEGACY_SET.has(slug) ? `/${slug}.html` : `/${slug}`;
}

/**
 * Display order of the 14 procedures the practice leads with (header, homepage, footer), as
 * specified by the doctor on 22 Oct 2026. Everything else in SERVICE_SLUGS stays live at its legacy
 * URL and is listed under "Also treated".
 */
export const FEATURED_CRANIOFACIAL: readonly ServiceSlug[] = [
  "craniosynostosis-surgery-bangalore",
  "cleft-lip-and-palate-treatment-bangalore",
  "corrective-jaw-surgery-bangalore",
  "ear-reconstruction-surgery-bangalore",
];

export const FEATURED_COSMETIC: readonly ServiceSlug[] = [
  "rhinoplasty-surgery-bangalore",
  "blepharoplasty-eyelid-surgery-bangalore",
  "otoplasty-ear-correction-bangalore",
  "chin-augmentation-surgery-bangalore",
  "facelift-surgery-bangalore",
  "tummy-tuck-abdominoplasty-bangalore",
  "breast-augmentation-surgery-bangalore",
  "breast-reduction-surgery-bangalore",
  "gynecomastia-surgery-bangalore",
  "liposuction-surgery-bangalore",
];

export const OTHER_SERVICES_ORDER: readonly ServiceSlug[] = [
  "facial-injuries-and-fracture-treatments",
  "head-and-neck-cancer-treatment",
  "other-craniofacial-conditions-treatments",
  "hand-plastic-surgeon-bangalore",
  "face-plastic-surgery-bangalore",
  "breast-plastic-surgeon-bangalore",
  "body-plastic-surgeon-bangalore",
];

/** Section anchors on the homepage. */
export const SECTION = { craniofacial: "/#craniofacial", cosmetic: "/#cosmetic-surgery", other: "/#also-treated" } as const;

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
