import type { Metadata } from "next";
import { CtaBand, Faq, HelpSideCard, PageHero } from "@/components/site/blocks";
import { JsonLd } from "@/components/site/json-ld";
import { HOME_FAQS, RESOURCES } from "@/lib/content";
import { breadcrumbJsonLd, faqJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Patient resources: preparing for your consultation",
  description: "Practical information to help you prepare for a consultation with Dr Vybhav Deraje in Bengaluru: what to bring, travelling from another city, and questions worth asking.",
  path: "/patient-resources",
});

export default function PatientResourcesPage() {
  return (
    <>
      <JsonLd data={[breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Patient resources", path: "/patient-resources" }]), faqJsonLd(HOME_FAQS)]} />
      <PageHero eyebrow="Patient resources" crumb="Patient resources" title="A little preparation. A clearer conversation." lead="Practical information to help you feel ready for your first consultation." />
      <section className="section container content-grid">
        <article className="prose">
          <div className="resource-list">
            {RESOURCES.map((r) => (
              <div className="resource-item" key={r.title}>
                <h3 style={{ marginTop: 0 }}>{r.title}</h3>
                <p>{r.text}</p>
              </div>
            ))}
          </div>
          <h2 style={{ marginTop: 40 }}>Frequently asked questions</h2>
          <Faq items={HOME_FAQS} />
        </article>
        <HelpSideCard />
      </section>
      <CtaBand />
    </>
  );
}
