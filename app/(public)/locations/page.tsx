import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, ArrowUpRight, MapPin, Phone } from "lucide-react";
import { CtaBand, PageHero } from "@/components/site/blocks";
import { JsonLd } from "@/components/site/json-ld";
import { getPublicClinics } from "@/lib/clinics";
import { formatPhone } from "@/lib/phone";
import { breadcrumbJsonLd, pageMetadata, physicianJsonLd } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  title: "Clinic locations in Bengaluru",
  description: "Find Dr Vybhav Deraje’s consultation locations at Aesthetica Veda clinics in Whitefield, HRBR Layout and Koramangala, Bengaluru, with directions and phone numbers.",
  path: "/locations",
});

export default async function LocationsPage() {
  const clinics = await getPublicClinics();
  return (
    <>
      <JsonLd data={[breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Locations", path: "/locations" }]), physicianJsonLd(clinics)]} />
      <PageHero eyebrow="Practice locations" crumb="Practice locations" title="Find your clinic in Bengaluru." lead="Consultations at Aesthetica Veda. Contact the clinic to confirm availability before you travel." />
      <section className="section container">
        <div className="location-grid">
          {clinics.map((c) => (
            <article className="location-card" key={c.slug} aria-labelledby={`clinic-${c.slug}`}>
              <MapPin size={28} strokeWidth={1.5} aria-hidden="true" />
              <p className="eyebrow">{c.brand}</p>
              <h2 id={`clinic-${c.slug}`}>{c.name}</h2>
              <p>{c.addressLines}</p>
              {c.phone && (
                <a href={`tel:${c.phone}`}>
                  <Phone size={16} aria-hidden="true" />
                  {formatPhone(c.phone)}
                </a>
              )}
              <a href={c.mapsUrl} target="_blank" rel="noopener noreferrer">
                Get directions <ArrowUpRight size={16} aria-hidden="true" />
                <span className="visually-hidden">(opens Google Maps in a new tab)</span>
              </a>
              <Link href={`/appointment?clinic=${c.slug}`}>
                Request a consultation <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
        <p className="note">Locations and contact numbers are listed on the current practice website. Appointment timings must be confirmed with the clinic.</p>
      </section>
      <CtaBand />
    </>
  );
}
