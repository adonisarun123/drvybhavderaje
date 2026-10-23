import type { Metadata } from "next";
import { Byline, HelpSideCard, PageHero } from "@/components/site/blocks";
import { JsonLd } from "@/components/site/json-ld";
import { SITE } from "@/lib/content";
import { ROUTES } from "@/lib/routes";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

const TITLE = "Privacy Policy";
const DESCRIPTION = "How drvybhavderaje.com collects and uses personal data: enquiry form details, usage data, cookies, analytics, where data is stored (India and Singapore), international transfers, children’s privacy and contact.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: ROUTES.privacy });

export default function PrivacyPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Privacy policy", path: ROUTES.privacy }])} />
      <PageHero eyebrow="Website privacy" crumb="Privacy policy" title="Privacy policy." lead="How this website handles the information you share with the practice." />
      <section className="section container content-grid">
        <article className="prose">
          <Byline />
          <p>
            {SITE.legalName} (“we”, “us”, “our”) operates the website www.drvybhavderaje.com (the “Service”). This page explains what personal data we collect when you use the Service, how we use it and the choices you have. By using the Service you agree to the collection and use of information in accordance with this policy. Terms used here have the same meaning as in our{" "}
            <a href={ROUTES.terms}>Terms of Use</a>.
          </p>

          <h2>Information we collect</h2>
          <h3>Enquiry form</h3>
          <p>When you send an enquiry we ask for your name, phone number, optional email address, the reason for your enquiry, your preferred clinic and, where offered, a preferred appointment time, so that the practice can respond. Please do not submit medical reports, photographs or detailed health information through this website; bring them to your appointment instead.</p>
          <h3>Usage data</h3>
          <p>We may collect information about how the Service is accessed and used, such as your device’s Internet Protocol (IP) address, browser type and version, the pages you visit, the date, time and duration of your visit, and other diagnostic data.</p>
          <h3>Cookies</h3>
          <p>This public website sets no advertising cookies. Until you accept analytics in the cookie banner, the only cookie set is <code>dvd_consent</code>, which remembers your choice for six months. If you accept, Google Analytics sets its own cookies (described below). Staff sign-in to the private administration area uses a secure session cookie that is set only there. You can change your choice at any time with the “Cookie settings” link in the footer, or instruct your browser to refuse cookies.</p>

          <h2>How we use your data</h2>
          <ul>
            <li>To respond to your enquiry and arrange a consultation</li>
            <li>To provide, maintain and improve the Service</li>
            <li>To provide customer care and support</li>
            <li>To monitor usage and detect, prevent and address technical issues</li>
          </ul>
          <p>Enquiries are stored securely and are visible only to authorised clinic staff, who may record operational notes (for example, that they called you). Submitting an enquiry does not create or confirm an appointment. To protect the form from abuse, a one-way hash of your network address and your browser type are stored with the request.</p>

          <h2>Analytics</h2>
          <p>We use Google Analytics 4 (Google LLC, United States) to understand how the Service is used — pages visited, approximate location, device and browser type, and how visitors arrive. <strong>It runs only after you choose “Accept analytics” in the cookie banner</strong>; nothing is loaded from Google and no analytics cookies are set before that, and IP addresses are anonymised. Declining, or later choosing “Decline” under “Cookie settings”, stops analytics for the next six months. Google may share this data with other Google services; see Google’s privacy policy, or use the Google Analytics opt-out browser add-on.</p>

          <h2>Where your data is stored and international transfers</h2>
          <p>The practice is located in Bengaluru, India, and clinic staff access your enquiry from India. The website and its database are hosted by service providers outside India:</p>
          <ul>
            <li><strong>Enquiry and appointment records</strong> are stored in a database operated by Neon, Inc. in the Singapore region of Amazon Web Services.</li>
            <li><strong>The website application</strong> runs on Vercel, Inc. Form submissions are processed in Vercel’s Singapore region; public pages are cached on Vercel’s global content-delivery network, so a copy of a public page (never your enquiry) may be served from a location near you.</li>
            <li><strong>Images</strong> are delivered by ImageKit’s content-delivery network; <strong>analytics</strong> are provided by Google (Google LLC, United States) as described above.</li>
          </ul>
          <p>If you contact us from the European Economic Area, the United Kingdom, Switzerland or the Gulf states, your enquiry is therefore transferred to India and Singapore, countries that may not provide the same level of data protection as your own. We rely on your consent, given when you tick the box on the enquiry form, as the basis for that transfer and for contacting you about your request; our hosting providers are bound by data-processing agreements and standard contractual clauses. You may withdraw consent at any time by writing to {SITE.email}, after which we will stop contacting you and remove your enquiry, except where we must keep a record of care already provided. You also have the right to ask what data we hold about you, to have it corrected or deleted, and to complain to your local data-protection authority.</p>
          <p>We take reasonable steps to ensure your data is treated securely, but no method of transmission over the internet or of electronic storage is completely secure and we cannot guarantee absolute security.</p>

          <h2>Disclosure</h2>
          <p>We may disclose personal data in the good-faith belief that it is necessary to comply with a legal obligation, to protect our rights or property, to prevent or investigate possible wrongdoing in connection with the Service, to protect the personal safety of users or the public, or to protect against legal liability. We do not sell or trade your personal information.</p>

          <h2>Service providers</h2>
          <p>We may use third-party companies to facilitate the Service, provide it on our behalf or analyse how it is used. They have access to your personal data only to perform these tasks and are obliged not to disclose or use it for any other purpose.</p>

          <h2>Links to other sites</h2>
          <p>The Service may contain links to sites we do not operate. We have no control over, and accept no responsibility for, their content or privacy practices; please review the privacy policy of every site you visit.</p>

          <h2>Children’s privacy</h2>
          <p>The Service does not address anyone under 18. We do not knowingly collect personally identifiable information from children; enquiries about a child’s care should be made by a parent or guardian. If you believe a child has provided us with personal data, please contact us and we will remove it.</p>

          <h2>Retention and your choices</h2>
          <p>Enquiries are retained for as long as needed to respond and to keep an accurate record of appointment arrangements. You can ask about an enquiry or request its removal by writing to {SITE.email}. You may always contact the clinic by phone instead of using the form.</p>

          <h2>Changes to this policy</h2>
          <p>We may update this policy from time to time and will post the new version on this page. Changes are effective when posted.</p>

          <h2>Contact</h2>
          <p>
            Questions about this policy: <a href={`mailto:${SITE.email}`}>{SITE.email}</a> or <a href={`tel:${SITE.phoneTel}`}>{SITE.phone}</a>.
          </p>
        </article>
        <HelpSideCard />
      </section>
    </>
  );
}
