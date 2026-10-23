import type { Metadata } from "next";
import { Byline, CtaBand, Faq, HelpSideCard, PageHero, ServiceIndex } from "@/components/site/blocks";
import { InfoSheet, sheetExists } from "@/components/site/info-sheet";
import { JsonLd } from "@/components/site/json-ld";
import { HOME_FAQS, RESOURCES, SERVICE_PAGES } from "@/lib/content";
import { autolink, createLinkBudget } from "@/lib/links";
import { ROUTES } from "@/lib/routes";
import { breadcrumbJsonLd, faqJsonLd, medicalWebPageJsonLd, pageMetadata } from "@/lib/seo";

const TITLE = "Patient Resources — Preparing for Your Consultation";
const DESCRIPTION = "Before you see Dr Vybhav Deraje in Bangalore: what to bring, travelling from another city, questions worth asking and patient information sheets.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: ROUTES.resources });

export default function PatientResourcesPage() {
  const faqs = HOME_FAQS.map((f) => ({ q: f.q, a: autolink(f.a, createLinkBudget(ROUTES.resources)) }));
  const sheets = SERVICE_PAGES.flatMap((p) => p.sections.flatMap((s) => (s.items ?? []).filter((it) => it.sheet && sheetExists(it.sheet)).map((it) => ({ page: p.shortTitle, title: it.title, href: it.sheet! }))));
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Patient resources", path: ROUTES.resources }]),
          medicalWebPageJsonLd({ title: TITLE, description: DESCRIPTION, path: ROUTES.resources }),
          faqJsonLd(HOME_FAQS),
        ]}
      />
      <PageHero eyebrow="Patient resources" crumb="Patient resources" title="A little preparation. A clearer conversation." lead="Practical information to help you feel ready for your first consultation." />
      <section className="section container content-grid">
        <article className="prose">
          <Byline />
          <div className="resource-list">
            {RESOURCES.map((r) => (
              <div className="resource-item" key={r.title}>
                <h3 style={{ marginTop: 0 }}>{r.title}</h3>
                <p>{r.text}</p>
              </div>
            ))}
          </div>
          {sheets.length > 0 && (
            <>
              <h2 style={{ marginTop: 40 }}>Patient information sheets</h2>
              <p>Written by Dr Vybhav Deraje for patients and families. Download the sheet for your procedure and bring your questions to the consultation.</p>
              <ul className="sheet-list">
                {sheets.map((s) => (
                  <li key={s.href}>
                    <InfoSheet href={s.href} label={`${s.title} (${s.page})`} />
                  </li>
                ))}
              </ul>
            </>
          )}
          <ServiceIndex heading="Procedure guides" intro={<p>Every condition and procedure Dr Vybhav Deraje treats has its own page: who it suits, how it is done, recovery, limitations and the questions patients ask most.</p>} />
          <h2 style={{ marginTop: 40 }}>Frequently asked questions</h2>
          <Faq items={faqs} />
        </article>
        <HelpSideCard />
      </section>
      <CtaBand />
    </>
  );
}
