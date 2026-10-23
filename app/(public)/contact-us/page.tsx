import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, ArrowUpRight, MapPin, MessageCircle, Phone } from "lucide-react";
import { PageHero } from "@/components/site/blocks";
import { JsonLd } from "@/components/site/json-ld";
import { AppointmentForm } from "@/components/site/appointment-form";
import { getPublicClinics } from "@/lib/clinics";
import { COSMETIC_SERVICES, CRANIOFACIAL_SERVICES, SITE } from "@/lib/content";
import { enquiriesEnabled } from "@/lib/enquiries/public-config";
import { formatPhone } from "@/lib/phone";
import { ROUTES } from "@/lib/routes";
import { publicDateBounds, publicSlotsEnabled } from "@/lib/scheduling/public-slots";
import { breadcrumbJsonLd, medicalWebPageJsonLd, pageMetadata } from "@/lib/seo";
import { PRACTICE_TZ } from "@/lib/time";

export const dynamic = "force-dynamic";

const TITLE = "Contact Us & Book an Appointment — Dr Vybhav Deraje, Bangalore";
const DESCRIPTION = `Book an appointment with Dr Vybhav Deraje, craniofacial & plastic surgeon, Bangalore. Call or WhatsApp ${SITE.phone} or send an enquiry. Whitefield, HRBR Layout, Koramangala.`;

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: ROUTES.contact });

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ clinic?: string }> }) {
  const { clinic } = await searchParams;
  const clinics = await getPublicClinics();
  const enabled = enquiriesEnabled();
  const slotsEnabled = enabled ? await publicSlotsEnabled() : false;
  const bounds = publicDateBounds(60, PRACTICE_TZ);
  const initialClinic = clinics.some((c) => c.slug === clinic) ? clinic : undefined;
  return (
    <>
      <JsonLd data={[breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Contact Us", path: ROUTES.contact }]), medicalWebPageJsonLd({ title: TITLE, description: DESCRIPTION, path: ROUTES.contact, type: "ContactPage" })]} />
      <PageHero eyebrow="Contact Us" crumb="Contact Us" title="Book an appointment." lead="Use the enquiry form, or call or email the clinic, to arrange a consultation with Dr Vybhav Deraje." />
      <section className="section container content-grid">
        <div className="form-card">
          <h2>Online Enquiry</h2>
          <p>Share your contact details, the reason for your enquiry and your preferred clinic. Please do not include medical reports or detailed health information — bring those to your appointment.</p>
          <AppointmentForm clinics={clinics} enabled={enabled} slotsEnabled={slotsEnabled} dateMin={bounds.min} dateMax={bounds.max} initialClinic={initialClinic} />
        </div>
        <div>
          <aside className="side-card" aria-label="Phone and email">
            <p className="eyebrow">Prefer to speak with us?</p>
            <h3>We’re here to help.</h3>
            <p>Call or message on WhatsApp to discuss appointment availability and the most convenient clinic for you.</p>
            <a className="text-link" href={`tel:${SITE.phoneTel}`}>
              <Phone size={16} aria-hidden="true" /> {SITE.phone}
            </a>
            <br />
            <a className="text-link" href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={16} aria-hidden="true" /> WhatsApp {SITE.phone}
            </a>
            <br />
            <a className="text-link" href={`mailto:${SITE.email}`}>
              {SITE.email} <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </aside>
          <aside className="side-card" aria-label="Contacting us from outside India" style={{ marginTop: 24 }}>
            <p className="eyebrow">Outside India?</p>
            <h3>Patients from abroad are welcome.</h3>
            <p>
              Dr Deraje sees patients travelling from outside India and offers video consultations for an initial opinion or follow-up. Choose <em>Video consultation</em> in the form above and select the country of your phone number, message the clinic on{" "}
              <a className="text-link" href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
              , or email{" "}
              <a className="text-link" href={`mailto:${SITE.email}`}>
                {SITE.email}
              </a>
              . The clinic replies in Indian Standard Time (UTC+5:30); preferred times are shown in IST and in your local time. Please wait for the clinic to ask before sending medical reports or photographs.
            </p>
          </aside>
          <aside className="side-card" aria-label="Clinic addresses" style={{ marginTop: 24 }}>
            <p className="eyebrow">Consultation Clinics</p>
            {clinics.map((c) => (
              <address key={c.slug} className="mini-address">
                <b>
                  <MapPin size={14} aria-hidden="true" /> {c.brand} {c.name}
                </b>
                <span>{c.addressLines}</span>
                {c.phone && <a href={`tel:${c.phone}`}>{formatPhone(c.phone)}</a>}
              </address>
            ))}
            <Link className="text-link" href={ROUTES.locations}>
              All Locations and Hospitals <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </aside>
          <aside className="side-card" aria-label="Not sure which procedure?" style={{ marginTop: 24 }}>
            <p className="eyebrow">Before You Write</p>
            <h3>Read about the procedure first.</h3>
            <p>Each page explains who it suits, what the surgery involves and what recovery looks like, so your enquiry can be specific.</p>
            <nav className="page-links" aria-label="Procedure Pages">
              {[...CRANIOFACIAL_SERVICES, ...COSMETIC_SERVICES].map((s) => (
                <Link key={s.slug} href={s.path}>
                  {s.shortTitle}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      </section>
    </>
  );
}
