import type { Metadata } from "next";
import { HelpSideCard, PageHero } from "@/components/site/blocks";
import { SITE } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy",
  description: "How the consultation request form on this website uses your name, phone number, optional email and preferred clinic.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <>
      <PageHero eyebrow="Website privacy" crumb="Website privacy" title="Your privacy matters." lead="A simple explanation of how this website handles consultation requests." />
      <section className="section container content-grid">
        <article className="prose">
          <h2>Consultation enquiries</h2>
          <p>The consultation request form collects your name, phone number, optional email address, preferred clinic and, where offered, a preferred appointment time, so the practice can respond to your request. Do not submit medical reports, photographs or detailed health information through this website.</p>
          <h3>How your request is used</h3>
          <p>Your request is stored securely and is visible only to authorised clinic staff, who use it to contact you and arrange a consultation. Staff may record operational notes about your request (for example, that they called you). Submitting a request does not create or confirm an appointment.</p>
          <h3>Your choice</h3>
          <p>Contact consent is required to submit an enquiry. You can instead call the clinic directly. To ask about an enquiry or request its removal, contact {SITE.email}.</p>
          <h3>Technical information</h3>
          <p>To protect the form from abuse, a one-way hash of your network address and your browser type are stored with the request. This website does not use advertising cookies. Staff sign-in uses a secure session cookie that is only set in the private administration area.</p>
          <h3>Retention</h3>
          <p>Enquiries are retained for as long as needed to respond and to keep an accurate record of appointment arrangements. The practice reviews retention periods as part of its data-handling policy.</p>
          <p className="note">This notice describes the website’s intended data use and must be reviewed and approved by the practice before public launch.</p>
        </article>
        <HelpSideCard />
      </section>
    </>
  );
}
