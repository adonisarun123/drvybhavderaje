import type { Metadata } from "next";
import { SITE } from "./content";

export function siteOrigin(): string {
  return (process.env.SITE_ORIGIN ?? "http://localhost:3000").replace(/\/$/, "");
}

/** Robots: index only on the production origin when PUBLIC_INDEXING=true. Previews stay noindex. */
export function indexingEnabled(): boolean {
  return process.env.PUBLIC_INDEXING === "true" && process.env.VERCEL_ENV !== "preview";
}

export function pageMetadata(args: { title: string; description: string; path: string; noindex?: boolean }): Metadata {
  const url = `${siteOrigin()}${args.path}`;
  const fullTitle = args.path === "/" ? `${SITE.name} | Craniofacial & Plastic Surgeon, Bengaluru` : `${args.title} | ${SITE.name}`;
  return {
    title: fullTitle,
    description: args.description,
    alternates: { canonical: url },
    robots: args.noindex || !indexingEnabled() ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title: fullTitle,
      description: args.description,
      url,
      siteName: SITE.name,
      type: "website",
      locale: "en_IN",
      images: [{ url: `${siteOrigin()}/images/doctor.png`, width: 466, height: 588, alt: "Dr Vybhav Deraje" }],
    },
    twitter: { card: "summary", title: fullTitle, description: args.description },
  };
}

export function physicianJsonLd(clinics: { name: string; brand: string; addressLines: string; phone: string | null; postcode: string | null; city: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Physician",
    "@id": `${siteOrigin()}/#physician`,
    name: "Dr Vybhav Deraje",
    url: siteOrigin(),
    image: `${siteOrigin()}/images/doctor.png`,
    telephone: SITE.phoneTel,
    email: SITE.email,
    medicalSpecialty: ["PlasticSurgery"],
    description: SITE.defaultDescription,
    areaServed: { "@type": "City", name: "Bengaluru" },
    location: clinics.map((c) => ({
      "@type": "MedicalClinic",
      name: `${c.brand} ${c.name}`.trim(),
      telephone: c.phone ?? undefined,
      address: { "@type": "PostalAddress", streetAddress: c.addressLines, addressLocality: c.city, postalCode: c.postcode ?? undefined, addressCountry: "IN" },
    })),
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
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: `${siteOrigin()}${it.path}` })),
  };
}

export function medicalWebPageJsonLd(args: { title: string; description: string; path: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: args.title,
    description: args.description,
    url: `${siteOrigin()}${args.path}`,
    about: { "@id": `${siteOrigin()}/#physician` },
    inLanguage: "en-IN",
  };
}
