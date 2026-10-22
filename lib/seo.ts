import type { Metadata } from "next";
import { AFFILIATIONS, CREDENTIALS, DOCTOR, HOSPITALS, SERVICE_PAGES, SITE, type ServicePage } from "./content";
import { DOCTOR_PHOTO, imageUrl } from "./images";
import { ROUTES } from "./routes";

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

export const PHYSICIAN_ID = () => `${siteOrigin()}/#physician`;
export const WEBSITE_ID = () => `${siteOrigin()}/#website`;
export const ORG_ID = () => `${siteOrigin()}/#practice`;
export const DOCTOR_IMAGE = () => imageUrl(DOCTOR_PHOTO);

const SAME_AS = () => [SITE.social.facebook, SITE.social.instagram, SITE.social.linkedin, SITE.social.youtube];

export function pageMetadata(args: { title: string; description: string; path: string; noindex?: boolean; ogType?: "website" | "article" | "profile" }): Metadata {
  const url = absolute(args.path);
  const fullTitle = args.path === "/" ? `${SITE.name} | Craniofacial & Plastic Surgeon, Bangalore` : args.title.includes(SITE.name) ? args.title : `${args.title} | ${SITE.name}`;
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

type ClinicLike = { name: string; brand: string; addressLines: string; phone: string | null; postcode: string | null; city: string; slug?: string };

function clinicNode(c: ClinicLike) {
  return {
    "@type": "MedicalClinic",
    "@id": c.slug ? `${siteOrigin()}${ROUTES.locations}#${c.slug}` : undefined,
    name: `${c.brand} ${c.name}`.trim(),
    telephone: c.phone ?? undefined,
    address: { "@type": "PostalAddress", streetAddress: c.addressLines, addressLocality: c.city, addressRegion: "Karnataka", postalCode: c.postcode ?? undefined, addressCountry: "IN" },
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
    image: DOCTOR_IMAGE(),
    telephone: SITE.phoneTel,
    email: SITE.email,
    description: SITE.defaultDescription,
    medicalSpecialty: ["PlasticSurgery", "Surgical"],
    knowsAbout: SERVICE_PAGES.flatMap((p) => [...p.conditions, ...p.procedures]).filter((v, i, a) => a.indexOf(v) === i),
    sameAs: SAME_AS(),
    areaServed: [{ "@type": "City", name: "Bengaluru", alternateName: "Bangalore" }, { "@type": "Country", name: "India" }],
    alumniOf: CREDENTIALS.map((c) => ({ "@type": "EducationalOrganization", name: (c.detail.split(" — ")[0] ?? c.detail).split(",")[0] ?? c.detail })),
    hasCredential: CREDENTIALS.map((c) => ({ "@type": "EducationalOccupationalCredential", name: c.title, recognizedBy: { "@type": "Organization", name: c.detail } })),
    memberOf: AFFILIATIONS.map((a) => ({ "@type": "Organization", name: a.org, url: a.url })),
    hospitalAffiliation: HOSPITALS.map((h) => ({ "@type": "Hospital", name: h.name, telephone: h.phone, address: { "@type": "PostalAddress", streetAddress: h.address, addressLocality: "Bengaluru", addressRegion: "Karnataka", addressCountry: "IN" } })),
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
    image: DOCTOR_IMAGE(),
    telephone: SITE.phoneTel,
    email: SITE.email,
    founder: { "@id": PHYSICIAN_ID() },
    sameAs: SAME_AS(),
    department: clinics.map(clinicNode),
    contactPoint: [{ "@type": "ContactPoint", telephone: SITE.phoneTel, email: SITE.email, contactType: "appointments", areaServed: ["IN", "Worldwide"], availableLanguage: ["en", "kn", "hi"], url: SITE.whatsappUrl }],
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

export function medicalWebPageJsonLd(args: { title: string; description: string; path: string; type?: "MedicalWebPage" | "AboutPage" | "ContactPage" | "WebPage" | "CollectionPage" }) {
  return {
    "@context": "https://schema.org",
    "@type": args.type ?? "MedicalWebPage",
    "@id": `${absolute(args.path)}#webpage`,
    name: args.title,
    description: args.description,
    url: absolute(args.path),
    isPartOf: { "@id": WEBSITE_ID() },
    about: { "@id": PHYSICIAN_ID() },
    author: { "@id": PHYSICIAN_ID() },
    reviewedBy: { "@id": PHYSICIAN_ID() },
    dateModified: SITE.contentUpdated,
    inLanguage: "en-IN",
    audience: { "@type": "MedicalAudience", audienceType: "Patient" },
  };
}

/** Condition + procedure entities for a service page, so answer engines can connect the page to the medical topics it covers. */
export function serviceEntitiesJsonLd(page: ServicePage) {
  const url = absolute(page.path);
  return [
    ...page.conditions.map((name) => ({ "@context": "https://schema.org", "@type": "MedicalCondition", name, url, relevantSpecialty: "PlasticSurgery" })),
    ...page.procedures.map((name) => ({ "@context": "https://schema.org", "@type": "MedicalProcedure", name, url, procedureType: "Surgical", provider: { "@id": PHYSICIAN_ID() } })),
  ];
}

export function videoJsonLd(ids: string[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Dr Vybhav Deraje — video gallery",
    itemListElement: ids.map((id, i) => ({ "@type": "ListItem", position: i + 1, url: `https://www.youtube.com/watch?v=${id}` })),
  };
}
