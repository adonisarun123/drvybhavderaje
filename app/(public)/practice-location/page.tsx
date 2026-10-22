import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, ArrowUpRight, MapPin, Phone } from "lucide-react";
import { CtaBand, PageHero } from "@/components/site/blocks";
import { JsonLd } from "@/components/site/json-ld";
import { getPublicClinics } from "@/lib/clinics";
import { CLINICS_SEED, HOSPITALS } from "@/lib/content";
import { formatPhone } from "@/lib/phone";
import { ROUTES } from "@/lib/routes";
import { breadcrumbJsonLd, medicalWebPageJsonLd, pageMetadata, physicianJsonLd, practiceJsonLd } from "@/lib/seo";

export const revalidate = 3600;

const TITLE = "Practice Locations in Bangalore — Clinics & Hospitals";
const DESCRIPTION = "Consult Dr Vybhav Deraje at Aesthetica Veda clinics in Whitefield, HRBR Layout and Koramangala, Bangalore. Surgeries at Aster, Sakra, Gleneagles, Apollo Spectra and more.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: ROUTES.locations });

export default async function LocationsPage() {
  const clinics = await getPublicClinics();
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Practice locations", path: ROUTES.locations }]),
          medicalWebPageJsonLd({ title: TITLE, description: DESCRIPTION, path: ROUTES.locations, type: "WebPage" }),
          physicianJsonLd(clinics),
          practiceJsonLd(clinics),
        ]}
      />
      <PageHero eyebrow="Practice locations" crumb="Practice locations" title="Clinics and hospitals in Bangalore." lead="Consultations at Aesthetica Veda clinics; surgeries at partner hospitals across the city. Please confirm availability with the clinic before you travel." />
      <section className="section container" aria-labelledby="consult-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Consultations</p>
            <h2 id="consult-heading">Aesthetica Veda clinics</h2>
          </div>
          <p>Founded by Dr Vybhav Deraje. He consults at all three branches.</p>
        </div>
        <div className="location-grid">
          {clinics.map((c) => (
            <article className="location-card has-photo" key={c.slug} id={c.slug} aria-labelledby={`clinic-${c.slug}`}>
              {CLINICS_SEED.find((seed) => seed.slug === c.slug)?.photo ? (
                <Image className="location-photo" src={CLINICS_SEED.find((seed) => seed.slug === c.slug)!.photo} alt={`${c.brand} ${c.name} clinic`} width={370} height={260} sizes="(max-width: 580px) 90vw, 370px" />
              ) : (
                <MapPin size={28} strokeWidth={1.5} aria-hidden="true" />
              )}
              <p className="eyebrow">{c.brand}</p>
              <h3 id={`clinic-${c.slug}`}>{c.name}</h3>
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
              <Link href={`${ROUTES.contact}?clinic=${c.slug}`}>
                Book an appointment <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </section>
      <section className="section container" aria-labelledby="surgery-heading" style={{ paddingTop: 0 }}>
        <div className="section-heading">
          <div>
            <p className="eyebrow">Surgeries</p>
            <h2 id="surgery-heading">Partner hospitals</h2>
          </div>
          <p>Operations are performed at the hospital best suited to your procedure; the clinic will guide you.</p>
        </div>
        <div className="location-grid hospital-grid">
          {HOSPITALS.map((h) => (
            <article className="location-card has-photo" key={h.name}>
              <Image className="location-photo" src={h.image} alt={h.name} width={370} height={260} sizes="(max-width: 580px) 90vw, 370px" />
              <h3>{h.name}</h3>
              <p>{h.address}</p>
              <a href={`tel:${h.phone}`}>
                <Phone size={16} aria-hidden="true" />
                {h.phoneDisplay}
              </a>
            </article>
          ))}
        </div>
        <p className="note">Appointment timings must be confirmed with the clinic. Hospital phone numbers connect to the hospital’s own front desk.</p>
      </section>
      <CtaBand />
    </>
  );
}
