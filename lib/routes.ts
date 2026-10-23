/**
 * Public URL map.
 *
 * Every public page lives at a clean, suffix-less path (`/aboutus`, `/rhinoplasty-surgery-bangalore` …).
 * The legacy URLs of https://drvybhavderaje.com/ (the `.html` paths: `/aboutus.html`,
 * `/craniosynostosis-surgery-bangalore.html` …) are preserved as PERMANENT 308 redirects to the clean
 * path (see `next.config.ts`), so every existing backlink, bookmark and search result still resolves
 * and passes its equity to the canonical clean URL. Redirects are always one hop: the paths of the
 * earlier redesign (`/about`, `/cleft-care` …) go straight to the clean URL, never via `.html`.
 *
 * Always link with these constants (or `servicePath()`); never hard-code a path in JSX.
 */
export const ROUTES = {
  home: "/",
  about: "/aboutus",
  locations: "/practice-location",
  testimonials: "/testimonials",
  contact: "/contact-us",
  privacy: "/privacy-policy",
  terms: "/terms-of-use",
  /** New pages without a legacy equivalent. */
  resources: "/patient-resources",
  /** A–Z index of every condition and procedure page — the site's hub for internal links and backlinks. */
  procedures: "/procedures",
  /** Shown after a successful enquiry (noindex; the GA4 conversion destination). Never in the sitemap. */
  thankYou: "/thank-you",
} as const;

/**
 * Service page slugs.
 *
 * LEGACY slugs are the ten service pages of the old site; their old `.html` URL 308s to the clean
 * path (see above). NEW slugs were added on 22 Oct 2026 when the practice narrowed its public
 * focus to 14 named procedures; they never had a `.html` URL.
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
  // Added 23 Oct 2026 — The Head Shape Clinic's two non-surgical infant services.
  "helmet-therapy-flat-head-bangalore",
  "earwell-infant-ear-correction-bangalore",
] as const;

export const SERVICE_SLUGS = [...LEGACY_SERVICE_SLUGS, ...NEW_SERVICE_SLUGS] as const;

export type LegacyServiceSlug = (typeof LEGACY_SERVICE_SLUGS)[number];
export type ServiceSlug = (typeof SERVICE_SLUGS)[number];

/** Public canonical path for a service page slug — always the clean, suffix-less path. */
export function servicePath(slug: ServiceSlug): string {
  return `/${slug}`;
}

/**
 * Display order of the 14 procedures the practice leads with (header, homepage, footer), as
 * specified by the doctor on 22 Oct 2026. Everything else in SERVICE_SLUGS stays live at its clean
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
  "helmet-therapy-flat-head-bangalore",
  "earwell-infant-ear-correction-bangalore",
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

/** Stems of the non-service legacy pages whose `.html` URL redirects to the clean path (next.config.ts). */
export const STATIC_LEGACY_STEMS = ["aboutus", "practice-location", "testimonials", "contact-us", "privacy-policy", "terms-of-use"] as const;

/** Every legacy `.html` URL of the old site (17 pages) and the clean URL it permanently redirects to. */
export const LEGACY_HTML_REDIRECTS: ReadonlyArray<{ source: string; destination: string }> = [...STATIC_LEGACY_STEMS, ...LEGACY_SERVICE_SLUGS].map((stem) => ({ source: `/${stem}.html`, destination: `/${stem}` }));

/** Paths used by the previous redesign build; each 308s straight to the clean canonical URL (one hop). */
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
