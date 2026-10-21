import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/site/blocks";
import { JsonLd } from "@/components/site/json-ld";
import { AppointmentForm } from "@/components/site/appointment-form";
import { getPublicClinics } from "@/lib/clinics";
import { SITE } from "@/lib/content";
import { enquiriesEnabled } from "@/lib/enquiries/public-config";
import { publicDateBounds, publicSlotsEnabled } from "@/lib/scheduling/public-slots";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { PRACTICE_TZ } from "@/lib/time";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Request a consultation",
  description: "Request a consultation with Dr Vybhav Deraje at Aesthetica Veda clinics in Whitefield, HRBR Layout or Koramangala, Bengaluru. The clinic confirms every appointment.",
  path: "/appointment",
});

export default async function AppointmentPage({ searchParams }: { searchParams: Promise<{ clinic?: string }> }) {
  const { clinic } = await searchParams;
  const clinics = await getPublicClinics();
  const enabled = enquiriesEnabled();
  const slotsEnabled = enabled ? await publicSlotsEnabled() : false;
  const bounds = publicDateBounds(60, PRACTICE_TZ);
  const initialClinic = clinics.some((c) => c.slug === clinic) ? clinic : undefined;
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Request a consultation", path: "/appointment" }])} />
      <PageHero eyebrow="The first step is a conversation" crumb="Consultation" title="Let’s talk about your care." lead="Contact the clinic to arrange a consultation with Dr Vybhav Deraje." />
      <section className="section container content-grid">
        <div className="form-card">
          <h2>Request a consultation</h2>
          <p>Share your contact details and preferred clinic. Please do not include medical information — bring reports to your appointment instead.</p>
          <AppointmentForm clinics={clinics} enabled={enabled} slotsEnabled={slotsEnabled} dateMin={bounds.min} dateMax={bounds.max} initialClinic={initialClinic} />
        </div>
        <aside className="side-card" aria-label="Other ways to contact the clinic">
          <p className="eyebrow">Prefer to speak with us?</p>
          <h3>We’re here to help.</h3>
          <p>Call to discuss appointment availability and the most convenient clinic for you.</p>
          <a className="text-link" href={`tel:${SITE.phoneTel}`}>
            {SITE.phone}
          </a>
          <br />
          <a className="text-link" href={`mailto:${SITE.email}`}>
            Email the clinic <ArrowUpRight size={16} aria-hidden="true" />
          </a>
          <br />
          <Link className="text-link" href="/locations">
            Explore clinic locations <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <p className="note">{clinics.map((c) => c.name).join(" · ")}</p>
        </aside>
      </section>
    </>
  );
}
