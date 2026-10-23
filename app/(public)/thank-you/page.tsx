import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, ArrowUpRight, CheckCircle2, MessageCircle, Phone } from "lucide-react";
import { Byline, PageHero } from "@/components/site/blocks";
import { getPublicClinics } from "@/lib/clinics";
import { COSMETIC_SERVICES, CRANIOFACIAL_SERVICES, SITE } from "@/lib/content";
import { clinicPreferenceLabel, isClinicPreference } from "@/lib/enquiries/preferences";
import { isDisplayableReference } from "@/lib/enquiries/thank-you";
import { ROUTES } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";
import { ThankYouTracker } from "./thank-you-tracker";

export const dynamic = "force-dynamic";

const TITLE = "Thank You — Your Enquiry Has Been Received";
const DESCRIPTION = "Your consultation request has reached the clinic of Dr Vybhav Deraje, Bangalore. Here is what happens next.";

/** Not a search result: there is nothing to rank, and a direct visit would look like a conversion. */
export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: ROUTES.thankYou, noindex: true });

export default async function ThankYouPage({ searchParams }: { searchParams: Promise<{ ref?: string; clinic?: string; dup?: string }> }) {
  const { ref, clinic, dup } = await searchParams;
  const reference = isDisplayableReference(ref) ? ref : null;
  const duplicate = dup === "1";
  const clinics = await getPublicClinics();
  const chosen = clinic ? clinics.find((c) => c.slug === clinic) : undefined;
  const preference = clinic && isClinicPreference(clinic) ? clinicPreferenceLabel(clinic, "") : "";
  const video = clinic === "video_consultation";
  const where = chosen ? `${chosen.brand} ${chosen.name}` : preference;

  return (
    <>
      <ThankYouTracker reference={reference} clinic={clinic ?? null} duplicate={duplicate} />
      <PageHero
        eyebrow="Thank you"
        crumb={[{ label: "Contact Us", href: ROUTES.contact }, { label: "Thank you" }]}
        title={reference ? "Your request has been received." : "Thank you for getting in touch."}
        lead={reference ? "The clinic has your details and will contact you to arrange the consultation. Nothing more is needed from you right now." : "If you have just sent an enquiry, the clinic has your details and will be in touch. If you reached this page another way, the contact page is the place to start."}
      />

      <section className="section container content-grid">
        <article className="prose">
          <Byline />

          {reference && (
            <aside className="key-facts" aria-label="Your enquiry">
              <p className="eyebrow">Your enquiry</p>
              <h2>
                <CheckCircle2 size={22} aria-hidden="true" style={{ verticalAlign: "-4px", marginRight: 8, color: "var(--ok-border)" }} />
                Reference <span data-enquiry-reference>{reference}</span>
              </h2>
              {duplicate && <p>We already had this request on file — your earlier submission went through and no second request has been created.</p>}
              <ul>
                {where && <li>{video ? "Requested: video consultation" : `Preferred clinic: ${where}`}</li>}
                <li>Quote this reference if you call or message the clinic about your request.</li>
                <li>
                  This is <strong>not</strong> a confirmed appointment yet — the clinic will confirm the location, date and time with you.
                </li>
              </ul>
            </aside>
          )}

          <h2>What happens next</h2>
          <div className="steps" style={{ marginBottom: 40 }}>
            <div>
              <span className="step-number">01</span>
              <h3>The clinic reviews your request</h3>
              <p>Your details go straight to the appointments team at Dr Vybhav Deraje&rsquo;s clinic. Requests are handled in clinic hours, Indian Standard Time (UTC+5:30).</p>
            </div>
            <div>
              <span className="step-number">02</span>
              <h3>You receive a call or WhatsApp message</h3>
              <p>The clinic will contact you on the number you gave to agree a date, time and location — or a video-consultation slot if you asked for one. Please keep your phone reachable.</p>
            </div>
            <div>
              <span className="step-number">03</span>
              <h3>Your appointment is confirmed</h3>
              <p>Once a time is agreed, you&rsquo;ll receive confirmation with the clinic address and anything to bring. Earlier reports, scans and photographs are useful on the day.</p>
            </div>
          </div>

          <h2>Before your consultation</h2>
          <p>
            A little preparation makes the first visit more useful. The <Link href={ROUTES.resources}>patient resources</Link> page covers what to bring, questions worth asking and travelling to Bangalore from another city or country. Each procedure page explains who it suits, what the surgery involves and what recovery looks like:
          </p>
          <nav className="page-links" aria-label="Procedure Pages">
            {[...CRANIOFACIAL_SERVICES, ...COSMETIC_SERVICES].map((s) => (
              <Link key={s.slug} href={s.path}>
                {s.shortTitle}
              </Link>
            ))}
          </nav>
          <p className="note">
            If you did not send an enquiry and landed here by mistake, go to the <Link href={ROUTES.contact}>contact page</Link> to book an appointment. Please do not email medical reports or detailed health information until the clinic asks for them.
          </p>
        </article>

        <div>
          <aside className="side-card" aria-label="Need to reach us sooner?">
            <p className="eyebrow">Need to speak with us sooner?</p>
            <h3>Call or message the clinic.</h3>
            <p>If your concern is urgent, or you want to add something to your request, the quickest way is a call or a WhatsApp message.</p>
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
            <p className="note">For a medical emergency, seek urgent care at the nearest hospital.</p>
          </aside>
          <aside className="side-card" aria-label="Clinic locations" style={{ marginTop: 24 }}>
            <p className="eyebrow">Where you&rsquo;ll be seen</p>
            <h3>Clinics across Bangalore.</h3>
            <p>Dr Deraje consults at {clinics.map((c) => c.name).join(", ")}, and operates at partner hospitals.</p>
            <Link className="text-link" href={ROUTES.locations}>
              Locations and directions <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </aside>
          <aside className="side-card" aria-label="About the surgeon" style={{ marginTop: 24 }}>
            <p className="eyebrow">Meet your surgeon</p>
            <h3>Dr Vybhav Deraje</h3>
            <p>Consultant craniofacial and plastic surgeon with fellowship training in Adelaide, Australia, practising in Bangalore since 2019.</p>
            <Link className="text-link" href={ROUTES.about}>
              About Dr Deraje <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <br />
            <Link className="text-link" href={ROUTES.testimonials}>
              Patient Stories <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </aside>
        </div>
      </section>
    </>
  );
}
