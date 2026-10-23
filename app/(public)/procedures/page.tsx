import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Byline, CtaBand, Faq, HelpSideCard, PageHero } from "@/components/site/blocks";
import { JsonLd } from "@/components/site/json-ld";
import { COSMETIC_SERVICES, CRANIOFACIAL_SERVICES, DOCTOR, GROUP_LABEL, HOME_FAQS, OTHER_SERVICES, SERVICE_PAGES, type ServicePage } from "@/lib/content";
import { autolink, createLinkBudget } from "@/lib/links";
import { ROUTES, SECTION } from "@/lib/routes";
import { CRANIO_PARENT, CRANIO_TYPES, cranioTypePath } from "@/lib/cranio-types";
import { SUB_PROCEDURES, subProcedurePath } from "@/lib/sub-procedures";
import { absolute, breadcrumbJsonLd, faqJsonLd, medicalWebPageJsonLd, pageMetadata, PHYSICIAN_ID } from "@/lib/seo";

const TITLE = "All Conditions & Procedures — Dr Vybhav Deraje, Bangalore";
const DESCRIPTION = `A–Z index of every condition and procedure treated by Dr Vybhav Deraje, craniofacial & plastic surgeon, Bangalore: ${SERVICE_PAGES.length} pages on craniofacial, cosmetic and reconstructive surgery.`;

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: ROUTES.procedures });

function itemListJsonLd(pages: ServicePage[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${absolute(ROUTES.procedures)}#list`,
    name: "Conditions and procedures treated by Dr Vybhav Deraje",
    numberOfItems: pages.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: pages.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p.shortTitle, description: p.description, url: absolute(p.path) })),
  };
}

function Group({ id, label, href, pages, intro }: { id: string; label: string; href: string; pages: ServicePage[]; intro: string }) {
  return (
    <section id={id}>
      <h2>
        <Link href={href}>{label}</Link>
      </h2>
      <p>{intro}</p>
      <ul className="az-index">
        {pages.map((p) => (
          <li key={p.slug}>
            <Link href={p.path}>{p.shortTitle}</Link>
            <p>{p.cardText}</p>
            {p.conditions.length > 0 && <small>Conditions: {p.conditions.slice(0, 6).join(", ")}</small>}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function ProceduresIndexPage() {
  const az = [...SERVICE_PAGES].sort((a, b) => a.shortTitle.localeCompare(b.shortTitle));
  // A–Z list also carries the nested pages: craniosynostosis types and the procedure pages built from the patient-information sheets.
  const azAll = [
    ...SERVICE_PAGES.map((p) => ({ key: p.slug, href: p.path, label: p.shortTitle, description: p.description })),
    ...SUB_PROCEDURES.map((p) => ({ key: `${p.parent}/${p.slug}`, href: subProcedurePath(p), label: p.shortTitle, description: p.description })),
    ...CRANIO_TYPES.map((t) => ({ key: `${CRANIO_PARENT}/${t.slug}`, href: cranioTypePath(t.slug), label: t.shortTitle, description: t.description })),
  ].sort((a, b) => a.label.localeCompare(b.label));
  const faqs = HOME_FAQS.slice(0, 4).map((f) => ({ q: f.q, a: autolink(f.a, createLinkBudget(ROUTES.procedures)) }));
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "All Conditions and Procedures", path: ROUTES.procedures }]),
          medicalWebPageJsonLd({ title: TITLE, description: DESCRIPTION, path: ROUTES.procedures, type: "CollectionPage", mainEntityId: `${absolute(ROUTES.procedures)}#list`, speakable: [".page-hero .lead", ".faq"], relatedPaths: SERVICE_PAGES.map((p) => p.path), aboutIds: [PHYSICIAN_ID()] }),
          itemListJsonLd(az),
          faqJsonLd(HOME_FAQS.slice(0, 4)),
        ]}
      />
      <PageHero eyebrow="Conditions and Procedures" crumb="All Conditions and Procedures" title="Every condition and procedure, in one place." lead={`${SERVICE_PAGES.length} pages written by ${DOCTOR.name}: what each condition is, who the procedure suits, how it is done in Bangalore, recovery and limitations.`} />
      <section className="section container content-grid">
        <article className="prose service-prose">
          <Byline />
          <nav className="page-links" aria-label="Sections on this page">
            <a href="#craniofacial">{GROUP_LABEL.craniofacial}</a>
            <a href="#cosmetic">{GROUP_LABEL.cosmetic}</a>
            <a href="#other">Also Treated</a>
            <a href="#az">A–Z List</a>
          </nav>
          <Group id="craniofacial" label={GROUP_LABEL.craniofacial} href={SECTION.craniofacial} pages={CRANIOFACIAL_SERVICES} intro="Conditions of the skull, face, jaws and ears in children and adults, managed with a multidisciplinary team." />
          <Group id="cosmetic" label={GROUP_LABEL.cosmetic} href={SECTION.cosmetic} pages={COSMETIC_SERVICES} intro="Face, breast and body procedures by a National Board certified plastic surgeon." />
          <Group id="other" label="Also Treated" href={SECTION.other} pages={OTHER_SERVICES} intro="Reconstructive surgery and overview pages for the full range of face, breast, body and hand procedures." />
          <section id="az">
            <h2>A–Z List</h2>
            <ul>
              {azAll.map((p) => (
                <li key={p.key}>
                  <Link href={p.href}>{p.label}</Link> — {p.description}
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2>Not sure which page applies to you?</h2>
            <p>
              Describe your concern in the <Link href={ROUTES.contact}>enquiry form</Link> or call the clinic; the team will suggest the right consultation. Read about <Link href={ROUTES.about}>Dr Vybhav Deraje’s training</Link>, see the <Link href={ROUTES.locations}>clinic and hospital locations</Link>, or <Link href={ROUTES.resources}>prepare for your first visit</Link>.
            </p>
            <p>
              <Link href={ROUTES.contact} className="text-link">
                Book an Appointment <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </p>
          </section>
          <section>
            <h2>Frequently Asked Questions</h2>
            <Faq items={faqs} />
          </section>
        </article>
        <HelpSideCard />
      </section>
      <CtaBand />
    </>
  );
}
