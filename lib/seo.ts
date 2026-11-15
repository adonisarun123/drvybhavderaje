import type { Metadata } from "next";
import { AFFILIATIONS, contentModified, CREDENTIALS, DOCTOR, HOSPITALS, hospitalMapUrl, PRACTICES, SERVICE_PAGES, type Photo, type ServicePage, SITE } from "./content";
import { DOCTOR_PHOTO, imageUrl } from "./images";
import { inSchemaHoldout } from "./link-experiment";
import { openingHoursSpecification, type ClinicHours } from "./hours";
import { ROUTES } from "./routes";
import { FX_DATE, priceRangeLabel, toUsd, USD_INR, type CostItem } from "./costs";
import { videosFor, type VideoPage } from "./videos";
import VIDEO_META from "./video-meta.json";

export function siteOrigin(): string {
  return (process.env.SITE_ORIGIN ?? "http://localhost:3000").replace(/\/$/, "");
}

export function absolute(path: string): string {
  return `${siteOrigin()}${path}`;
}

/** Robots: index only on the production origin when PUBLIC_INDEXING=true. Previews stay noindex. */
export function indexingEnabled(): boolean {
  return process.env.PUBLIC_INDEXING === "true" && process.env.VERCEL_ENV !== "preview";
}

/**
 * Relationship structured data (`relatedLink`, `significantLink`) is on unless RELATIONSHIP_SCHEMA="false".
 * The switch exists for staged rollout and rollback; it never removes the visible links. Pages in the
 * holdout group of the running schema test (lib/link-experiment.ts) omit it as well.
 */
export function relationshipSchemaEnabled(): boolean {
  return process.env.RELATIONSHIP_SCHEMA !== "false";
}

export const PHYSICIAN_ID = () => `${siteOrigin()}/#physician`;
export const WEBSITE_ID = () => `${siteOrigin()}/#website`;
export const ORG_ID = () => `${siteOrigin()}/#practice`;
export const DOCTOR_IMAGE = () => imageUrl(DOCTOR_PHOTO);
/** The full published price list (OfferCatalog on the Treatment Costs page). */
export const COST_CATALOG_ID = () => `${siteOrigin()}${ROUTES.costs}#catalog`;
/** Patients come from India and abroad (video consultations; surgery in Bangalore). */
const AREA_SERVED = [{ "@type": "City", name: "Bengaluru", alternateName: "Bangalore" }, { "@type": "Country", name: "India" }, "Worldwide"];

const SAME_AS = () => [SITE.social.facebook, SITE.social.instagram, SITE.social.linkedin, SITE.social.youtube];

export function pageMetadata(args: { title: string; description: string; path: string; noindex?: boolean; ogType?: "website" | "article" | "profile"; /** Use the title as given, without the " | Dr Vybhav Deraje" suffix. The suffix is also skipped automatically when it would push the title past 60 characters. */ bare?: boolean }): Metadata {
  const url = absolute(args.path);
  const fullTitle = args.bare ? args.title : args.path === "/" ? `${SITE.name} | Craniofacial & Plastic Surgeon, Bangalore` : args.title.includes(SITE.name) || `${args.title} | ${SITE.name}`.length > 60 ? args.title : `${args.title} | ${SITE.name}`;
  return {
    title: fullTitle,
    description: args.description,
    // Single-language site serving visitors worldwide: `en` + `x-default` tell search engines the English
    // page is the right result in every market, not an India-only page.
    alternates: { canonical: url, languages: { en: url, "x-default": url } },
    robots: args.noindex || !indexingEnabled() ? { index: false, follow: false } : { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    openGraph: {
      title: fullTitle,
      description: args.description,
      url,
      siteName: SITE.name,
      type: args.ogType ?? "website",
      locale: "en_IN",
      alternateLocale: ["en_US", "en_GB", "en_AE", "en_AU"],
      images: [{ url: DOCTOR_IMAGE(), width: 466, height: 588, alt: "Dr Vybhav Deraje, craniofacial and plastic surgeon, Bangalore" }],
    },
    twitter: { card: "summary", title: fullTitle, description: args.description, images: [DOCTOR_IMAGE()] },
  };
}

type ClinicLike = { name: string; brand: string; addressLines: string; phone: string | null; postcode: string | null; city: string; slug?: string; hours?: ClinicHours[] };

function clinicNode(c: ClinicLike) {
  return {
    "@type": "MedicalClinic",
    "@id": c.slug ? `${siteOrigin()}${ROUTES.locations}#${c.slug}` : undefined,
    name: `${c.brand} ${c.name}`.trim(),
    telephone: c.phone ?? undefined,
    address: { "@type": "PostalAddress", streetAddress: c.addressLines, addressLocality: c.city, addressRegion: "Karnataka", postalCode: c.postcode ?? undefined, addressCountry: "IN" },
    openingHoursSpecification: c.hours?.length ? openingHoursSpecification(c.hours) : undefined,
    priceRange: priceRangeLabel(),
    currenciesAccepted: "INR",
    paymentAccepted: "Online payment, Credit card",
  };
}

/** Physician entity — the site's primary entity. Everything stated here is visible on the site. */
export function physicianJsonLd(clinics: ClinicLike[]) {
  return {
    "@context": "https://schema.org",
    "@type": ["Physician", "Person"],
    "@id": PHYSICIAN_ID(),
    name: DOCTOR.name,
    givenName: "Vybhav",
    familyName: "Deraje",
    honorificPrefix: "Dr",
    honorificSuffix: DOCTOR.honorificSuffix,
    jobTitle: "Consultant Craniofacial & Plastic Surgeon",
    url: siteOrigin(),
    image: { "@type": "ImageObject", url: DOCTOR_IMAGE(), contentUrl: DOCTOR_IMAGE(), width: 466, height: 588, caption: "Dr Vybhav Deraje, craniofacial and plastic surgeon, Bangalore" },
    telephone: SITE.phoneTel,
    email: SITE.email,
    description: SITE.defaultDescription,
    medicalSpecialty: ["PlasticSurgery", "Surgical"],
    identifier: [
      { "@type": "PropertyValue", propertyID: "Karnataka Medical Council registration", value: DOCTOR.kmcRegistration },
      { "@type": "PropertyValue", propertyID: "Association of Plastic Surgeons of India membership", value: "D089FL2019" },
    ],
    knowsAbout: SERVICE_PAGES.flatMap((p) => [...p.conditions, ...p.procedures]).filter((v, i, a) => a.indexOf(v) === i),
    sameAs: SAME_AS(),
    areaServed: AREA_SERVED,
    knowsLanguage: ["en", "kn", "hi"],
    hasOfferCatalog: { "@id": COST_CATALOG_ID() },
    alumniOf: CREDENTIALS.map((c) => ({ "@type": "EducationalOrganization", name: (c.detail.split(" — ")[0] ?? c.detail).split(",")[0] ?? c.detail })),
    hasCredential: CREDENTIALS.map((c) => ({ "@type": "EducationalOccupationalCredential", name: c.title, recognizedBy: { "@type": "Organization", name: c.detail } })),
    memberOf: AFFILIATIONS.map((a) => ({ "@type": "Organization", name: a.org, url: a.url })),
    affiliation: PRACTICES.map((p) => ({ "@type": "MedicalBusiness", name: p.name, url: p.url, founder: { "@id": PHYSICIAN_ID() } })),
    hospitalAffiliation: HOSPITALS.map((h) => ({ "@type": "Hospital", name: h.name, hasMap: hospitalMapUrl(h), address: { "@type": "PostalAddress", streetAddress: h.address, addressLocality: "Bengaluru", addressRegion: "Karnataka", addressCountry: "IN" } })),
    worksFor: { "@id": ORG_ID() },
    availableService: SERVICE_PAGES.map((p) => ({ "@type": "MedicalTherapy", name: p.shortTitle, url: absolute(p.path) })),
    location: clinics.map(clinicNode),
  };
}

/** The practice as an organisation (founder of Aesthetica Veda), with the clinics as departments. */
export function practiceJsonLd(clinics: ClinicLike[]) {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "@id": ORG_ID(),
    name: SITE.legalName,
    alternateName: "Aesthetica Veda",
    url: siteOrigin(),
    logo: `${siteOrigin()}/icon.svg`,
    image: { "@type": "ImageObject", url: DOCTOR_IMAGE(), contentUrl: DOCTOR_IMAGE(), width: 466, height: 588, caption: "Dr Vybhav Deraje, craniofacial and plastic surgeon, Bangalore" },
    telephone: SITE.phoneTel,
    email: SITE.email,
    founder: { "@id": PHYSICIAN_ID() },
    sameAs: SAME_AS(),
    department: clinics.map(clinicNode),
    subOrganization: PRACTICES.map((p) => ({ "@type": "MedicalBusiness", name: p.name, url: p.url, description: p.description })),
    contactPoint: [{ "@type": "ContactPoint", telephone: SITE.phoneTel, email: SITE.email, contactType: "appointments", areaServed: ["IN", "Worldwide"], availableLanguage: ["en", "kn", "hi"], url: SITE.whatsappUrl }],
    areaServed: AREA_SERVED,
    priceRange: priceRangeLabel(),
    currenciesAccepted: "INR",
    paymentAccepted: "Online payment, Credit card",
    hasOfferCatalog: { "@id": COST_CATALOG_ID() },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID(),
    name: SITE.name,
    url: siteOrigin(),
    inLanguage: "en-IN",
    publisher: { "@id": PHYSICIAN_ID() },
    about: { "@id": PHYSICIAN_ID() },
  };
}

export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: absolute(it.path) })),
  };
}

export function medicalWebPageJsonLd(args: {
  title: string;
  description: string;
  path: string;
  type?: "MedicalWebPage" | "AboutPage" | "ContactPage" | "WebPage" | "CollectionPage";
  /** CSS selectors of the answer-first blocks assistants and voice search may read aloud / quote. */
  speakable?: string[];
  /** `@id` of the page's primary entity (the procedure or the physician). */
  mainEntityId?: string;
  /** Canonical paths of pages this one visibly links to as related reading (becomes `relatedLink`). Only pass paths the template renders as links. */
  relatedPaths?: string[];
  /** Paths with evidence of significance (page-level click data). Omit when there is none; nothing is assumed. */
  significantPaths?: string[];
  /** Additional `@id`s the page is about (conditions, procedures). */
  aboutIds?: string[];
}) {
  const url = absolute(args.path);
  const links = (paths?: string[]) => {
    if (!relationshipSchemaEnabled() || inSchemaHoldout(args.path)) return undefined;
    const unique = [...new Set(paths ?? [])].filter((p) => p !== args.path);
    return unique.length ? unique.map(absolute) : undefined;
  };
  return {
    "@context": "https://schema.org",
    "@type": args.type ?? "MedicalWebPage",
    "@id": `${url}#webpage`,
    name: args.title,
    headline: args.title,
    description: args.description,
    url,
    isPartOf: { "@id": WEBSITE_ID() },
    about: args.aboutIds?.length ? [{ "@id": PHYSICIAN_ID() }, ...args.aboutIds.map((id) => ({ "@id": id }))] : { "@id": PHYSICIAN_ID() },
    mainEntity: args.mainEntityId ? { "@id": args.mainEntityId } : undefined,
    author: { "@id": PHYSICIAN_ID() },
    publisher: { "@id": ORG_ID() },
    reviewedBy: { "@id": PHYSICIAN_ID() },
    lastReviewed: SITE.contentUpdated,
    dateModified: contentModified(args.path, SERVICE_PAGES.some((p) => p.path === args.path)),
    inLanguage: "en-IN",
    audience: { "@type": "MedicalAudience", audienceType: "Patient" },
    speakable: args.speakable?.length ? { "@type": "SpeakableSpecification", cssSelector: args.speakable } : undefined,
    relatedLink: links(args.relatedPaths),
    significantLink: links(args.significantPaths),
  };
}

/** Stable `@id`s for a service page's entities (used by the page node's mainEntity/about and by other pages' `mentions`). */
export const PROCEDURE_ID = (page: ServicePage, i = 0) => `${absolute(page.path)}#procedure-${i + 1}`;
export const CONDITION_ID = (page: ServicePage, i = 0) => `${absolute(page.path)}#condition-${i + 1}`;

/** Condition + procedure entities for a service page, so answer engines can connect the page to the medical topics it covers. */
export function serviceEntitiesJsonLd(page: ServicePage) {
  const url = absolute(page.path);
  return [
    ...page.conditions.map((name, i) => ({ "@context": "https://schema.org", "@type": "MedicalCondition", "@id": CONDITION_ID(page, i), name, url, relevantSpecialty: "PlasticSurgery", possibleTreatment: page.procedures.map((_, j) => ({ "@id": PROCEDURE_ID(page, j) })) })),
    ...page.procedures.map((name, i) => ({ "@context": "https://schema.org", "@type": "MedicalProcedure", "@id": PROCEDURE_ID(page, i), name, url, procedureType: "Surgical", relevantSpecialty: "PlasticSurgery", provider: { "@id": PHYSICIAN_ID() }, mainEntityOfPage: `${url}#webpage` })),
  ];
}

/**
 * The doctor's peer-reviewed papers as ScholarlyArticle nodes authored by the Physician entity.
 * Citation strings are kept verbatim; the title is the second sentence of the citation (Vancouver style).
 */
export function scholarlyArticlesJsonLd(citations: string[]) {
  return citations.map((citation) => {
    const parts = citation.split(/\.\s+/);
    const name = (parts[1] ?? citation).replace(/\.$/, "");
    return {
      "@context": "https://schema.org",
      "@type": "ScholarlyArticle",
      name,
      headline: name,
      citation,
      author: { "@id": PHYSICIAN_ID() },
      mainEntityOfPage: `${absolute(ROUTES.about)}#publications`,
    };
  });
}

export function videoJsonLd(videos: { id: string; title?: string }[], name = "Dr Vybhav Deraje — video gallery") {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: videos.map((v, i) => ({ "@type": "ListItem", position: i + 1, url: `https://www.youtube.com/watch?v=${v.id}`, ...(v.title ? { name: v.title } : {}) })),
  };
}

/**
 * One VideoObject per embedded YouTube video. Upload date and duration come from YouTube (lib/video-meta.json,
 * fetched 15 Nov 2026 — add an entry when a video is added to lib/videos.ts). A video with no title or no
 * metadata is left out rather than published with required fields missing.
 */
export function videoObjectsJsonLd(videos: { id: string; title?: string; lang?: string }[]) {
  const meta = VIDEO_META as Record<string, { uploadDate: string; duration: string; description?: string }>;
  const seen = new Set<string>();
  return videos.flatMap((v) => {
    const m = meta[v.id];
    if (!m || !v.title || seen.has(v.id)) return [];
    seen.add(v.id);
    return [
      {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name: v.title,
        description: m.description ?? `${v.title} — a video from ${DOCTOR.name}, craniofacial and plastic surgeon, Bangalore.`,
        thumbnailUrl: [`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`],
        uploadDate: m.uploadDate,
        duration: m.duration,
        embedUrl: `https://www.youtube.com/embed/${v.id}`,
        url: `https://www.youtube.com/watch?v=${v.id}`,
        inLanguage: v.lang ?? "en",
      },
    ];
  });
}

/** VideoObjects for the videos a page's "Watch" block shows (same selection as components/site/video-section.tsx). */
export function pageVideosJsonLd(page: VideoPage, limit = 6) {
  return videoObjectsJsonLd(videosFor(page, limit));
}

/** Gallery photos as ImageObjects. Files under /talks/ are served by the site; the rest by ImageKit. */
export function imageObjectsJsonLd(photos: Photo[]) {
  return photos.map((p) => {
    const url = p.src.startsWith("/talks/") ? absolute(p.src) : imageUrl(p.src);
    return { "@context": "https://schema.org", "@type": "ImageObject", contentUrl: url, url, name: p.caption, caption: p.caption, width: p.width, height: p.height };
  });
}

/**
 * Published costs as Offers (lib/costs.ts). The INR figure is the price; the USD figure is a second
 * price specification marked as an approximate conversion, so assistants answering overseas patients can
 * quote both without implying a dollar price. `itemOffered` is a Service (MedicalProcedure is not a valid
 * `itemOffered` type) that points at the procedure's own page.
 */
function costOffer(c: CostItem) {
  const spec = (currency: "INR" | "USD") => {
    const v = (n: number) => (currency === "INR" ? n : toUsd(n));
    return {
      "@type": c.per ? "UnitPriceSpecification" : "PriceSpecification",
      priceCurrency: currency,
      ...(c.inrTo ? { minPrice: v(c.inrFrom), maxPrice: v(c.inrTo) } : c.fixed || c.per ? { price: v(c.inrFrom) } : { minPrice: v(c.inrFrom) }),
      ...(c.per ? { unitText: c.per } : {}),
      ...(c.gst ? { valueAddedTaxIncluded: false } : {}),
      description: currency === "USD" ? `Approximate conversion at ₹${USD_INR} = US$1 (${FX_DATE}); billed in INR.` : undefined,
    };
  };
  const url = c.paths[0] ? absolute(c.paths[0]) : absolute(ROUTES.costs);
  return {
    "@type": "Offer",
    name: c.name,
    url,
    priceCurrency: "INR",
    ...(c.inrTo ? {} : { price: c.inrFrom }),
    priceSpecification: [spec("INR"), spec("USD")],
    availability: "https://schema.org/InStock",
    eligibleRegion: AREA_SERVED,
    offeredBy: { "@id": PHYSICIAN_ID() },
    description: [c.notIncluded?.length ? `Typical cost for an uncomplicated case. Not included: ${c.notIncluded.join(", ")}.` : "Typical cost for an uncomplicated case.", c.note].filter(Boolean).join(" "),
    itemOffered: { "@type": "Service", name: c.name, serviceType: c.category, url, provider: { "@id": PHYSICIAN_ID() }, areaServed: AREA_SERVED },
  };
}

/** OfferCatalog for a set of published costs — the full list (Treatment Costs page) or one page's figures. */
export function costCatalogJsonLd(items: CostItem[], args: { path: string; name: string; full?: boolean }) {
  return {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    "@id": args.full ? COST_CATALOG_ID() : `${absolute(args.path)}#costs`,
    name: args.name,
    url: absolute(args.path),
    provider: { "@id": PHYSICIAN_ID() },
    isPartOf: args.full ? undefined : { "@id": COST_CATALOG_ID() },
    numberOfItems: items.length,
    itemListElement: items.map((c) => costOffer(c)),
  };
}
