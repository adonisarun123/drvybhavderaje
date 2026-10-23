import type { Metadata } from "next";
import { Byline, HelpSideCard, PageHero } from "@/components/site/blocks";
import { JsonLd } from "@/components/site/json-ld";
import { SITE } from "@/lib/content";
import { ROUTES } from "@/lib/routes";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

const TITLE = "Terms of Use";
const DESCRIPTION = "Terms of use and medical disclaimer for drvybhavderaje.com: website information is general and does not replace professional medical advice or treatment.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: ROUTES.terms });

const NAME = SITE.legalName;

export default function TermsPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Terms of use", path: ROUTES.terms }])} />
      <PageHero eyebrow="Terms of use" crumb="Terms of use" title="Terms of use and disclaimer." lead="Please read these terms before using this website or acting on any information it contains." />
      <section className="section container content-grid">
        <article className="prose">
          <Byline />
          <h2>Disclaimer</h2>
          <p>Any information, response or advice provided by ‘{NAME}’ in reply to a query posted or emailed through this website is based solely on the information you provide and is meant for general information only. The term ‘{NAME}’ includes its affiliate and associate companies, directors, officers, employees and consulting doctors.</p>
          <p>The content on this website and any advice given by ‘{NAME}’ is not intended to be, and is not, a substitute for professional medical advice, diagnosis or hands-on treatment. This website does not replace a doctor’s judgement or the care that only a qualified healthcare provider can give after clinical examination and correlation with your reports. You agree to provide full and complete information about your condition, including your medical history, and ‘{NAME}’ is entitled to presume that the information you provide is true and correct.</p>
          <p>‘{NAME}’ will make every reasonable effort to provide accurate and useful information in response to any query, but does not guarantee the accuracy, completeness or quality of any information or advice. Tips or recommendations do not assure good health or recovery from any condition; health depends on many factors, and results and duration of treatment vary from person to person. Nothing on this website should be relied upon as a course of treatment or as a substitute for regular medical check-ups.</p>

          <h2>Limitation of liability</h2>
          <p>‘{NAME}’ shall not be liable for any negligence, loss, injury or damage (including direct, indirect, consequential, special, exemplary or punitive loss) suffered by anyone as a result of using the information or advice provided through this website, any action or inaction on your part, or any treatment described here.</p>
          <p>‘{NAME}’ expressly disclaims responsibility for the completeness, accuracy and fitness of responses given through this website (by email or otherwise). No warranty or representation, express or implied, is given that responses will be appropriate, secure, reliable or error-free. Information on this website may become outdated; we will try to correct errors and keep content current, but all information and materials are provided on an “as is” basis.</p>
          <p>‘{NAME}’ reserves the right to change the website, withdraw access to it and revise the services described on it at any time without notice.</p>

          <h2>Indemnity</h2>
          <p>You agree to indemnify and hold harmless ‘{NAME}’ against any claim, demand or damage, including reasonable legal fees, asserted by any third party due to or arising out of your use of or conduct on this website or its services.</p>

          <h2>Third-party websites</h2>
          <p>This website may link to third-party websites maintained by others. These links are provided solely as a convenience. References to any entity, product, service, procedure, opinion or source of information are not an endorsement, direct or implied. ‘{NAME}’ is not responsible for the content of third-party websites, which you access at your own risk. Anything downloaded or obtained through this website is at your own discretion and risk, and we do not warrant that the website or its servers are free of errors, interruptions, viruses or other harmful components.</p>

          <h2>Copyright</h2>
          <p>The information, artwork, text, video, audio and pictures (“Materials”) on this website are protected by copyright and are the property of ‘{NAME}’. You may access and use the Materials for personal purposes only. You may not modify or use the Materials for commercial or any other purpose without express written consent.</p>

          <h2>Personal information</h2>
          <p>
            ‘{NAME}’ does not trade or sell your personal information to any third party or non-affiliated company, and limits access to it to staff who reasonably need it. See our <a href={ROUTES.privacy}>Privacy Policy</a>.
          </p>

          <h2>Acceptance</h2>
          <p>By using this website you agree that these exclusions and limitations of liability are reasonable. If you do not think they are reasonable, you must not use this website. You confirm that you understand and agree to these terms of your own free will. Do not delay or disregard medical advice, or discontinue treatment, because of anything you have read on this website — consult your doctor, clinician or therapist.</p>
        </article>
        <HelpSideCard />
      </section>
    </>
  );
}
