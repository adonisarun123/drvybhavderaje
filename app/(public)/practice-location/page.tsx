import Link from "next/link";
import { Image } from "@imagekit/next";
import type { Metadata } from "next";
import { ArrowRight, ArrowUpRight, Building2, MapPin, Phone } from "lucide-react";
import { VideoSection } from "@/components/site/video-section";
import { Byline, CtaBand, HospitalPhoto, PageHero, PracticeCards, ServiceIndex } from "@/components/site/blocks";
import { JsonLd } from "@/components/site/json-ld";
import { getPublicClinics } from "@/lib/clinics";
import { CLINICS_SEED, HOSPITALS, hospitalMapUrl } from "@/lib/content";
import { formatPhone } from "@/lib/phone";
import { ROUTES } from "@/lib/routes";
import { breadcrumbJsonLd, medicalWebPageJsonLd, pageMetadata, physicianJsonLd, practiceJsonLd } from "@/lib/seo";

export const revalidate = 3600;

const TITLE = "Practice Locations in Bangalore — Clinics & Hospitals";
const DESCRIPTION = "Consult Dr Vybhav Deraje at Aesthetica Veda clinics in Whitefield, HRBR Layout and Koramangala, or The Head Shape Clinic in Koramangala, Bangalore. Surgery at Aster Whitefield, Gifted Hands, Aarogya Hastha, Medicover and Apollo Spectra.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: ROUTES.locations });

export default async function LocationsPage() {
  const clinics = await getPublicClinics();
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Practice Locations", path: ROUTES.locations }]),
          medicalWebPageJsonLd({ title: TITLE, description: DESCRIPTION, path: ROUTES.locations, type: "WebPage" }),
          physicianJsonLd(clinics),
          practiceJsonLd(clinics),
        ]}
      />
      <PageHero eyebrow="Practice Locations" crumb="Practice Locations" title="Clinics and hospitals in Bangalore." lead="Consultations at Aesthetica Veda clinics and The Head Shape Clinic; surgeries at partner hospitals across the city. Please confirm availability with the clinic before you travel." />
      <section className="section container" aria-labelledby="consult-heading">
        <Byline />
        <div className="section-heading">
          <div>
            <p className="eyebrow">Consultations</p>
            <h2 id="consult-heading">Aesthetica Veda Clinics</h2>
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
                Book an Appointment <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
        <VideoSection page="locations" heading="Walk Through the Clinics" />
      </section>
      <PracticeCards intro={<p>Babies and children with head-shape concerns are seen through The Head Shape Clinic (at Docube Clinic, Koramangala); all other consultations are at the Aesthetica Veda clinics above.</p>} />
      <section className="section container" aria-labelledby="surgery-heading" style={{ paddingTop: 0 }}>
        <div className="section-heading">
          <div>
            <p className="eyebrow">Surgeries</p>
            <h2 id="surgery-heading">Partner Hospitals</h2>
          </div>
          <p>Operations are performed at the hospital best suited to your procedure; the clinic will guide you.</p>
        </div>
        <div className="location-grid hospital-grid">
          {HOSPITALS.map((h) => (
            <article className="location-card has-photo" key={h.name}>
              {h.image ? (
                <HospitalPhoto className="location-photo" src={h.image} alt={h.name} sizes="(max-width: 580px) 90vw, 370px" />
              ) : (
                <span className="location-photo hospital-noimg" aria-hidden="true">
                  <Building2 size={40} />
                </span>
              )}
              <h3>{h.name}</h3>
              <p>{h.address}</p>
              <a href={hospitalMapUrl(h)} target="_blank" rel="noopener noreferrer">
                <MapPin size={16} aria-hidden="true" />
                View on Google Maps
                <span className="visually-hidden">(opens in a new tab)</span>
              </a>
            </article>
          ))}
        </div>
        <p className="note">Appointment timings must be confirmed with the clinic. For appointments, contact Dr Vybhav’s clinic rather than the hospital.</p>
        <ServiceIndex heading="What Is Treated at These Locations" intro={<p>Consultations for every condition and procedure take place at the Aesthetica Veda clinics; surgery is scheduled at the partner hospital best suited to it.</p>} />
      </section>
      <CtaBand />
    </>
  );
}
