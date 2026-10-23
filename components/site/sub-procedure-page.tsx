import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Byline, CtaBand, Faq, HelpSideCard, KeyFacts, PageHero } from "@/components/site/blocks";
import { InfoSheet } from "@/components/site/info-sheet";
import { JsonLd } from "@/components/site/json-ld";
import { DOCTOR, getService, GROUP_HREF, GROUP_LABEL, isFeatured, SITE } from "@/lib/content";
import { autolink, createLinkBudget } from "@/lib/links";
import { ROUTES, SECTION } from "@/lib/routes";
import { breadcrumbJsonLd, faqJsonLd, medicalWebPageJsonLd, PHYSICIAN_ID, siteOrigin } from "@/lib/seo";
import { subProcedurePath, subProceduresOf, type SubProcedure } from "@/lib/sub-procedures";

/** Procedure page nested under its parent service: /<parent>/<procedure> (see lib/sub-procedures.ts). */
export function SubProcedureView({ p }: { p: SubProcedure }) {
  const parent = getService(p.parent);
  if (!parent) return null;
  const path = subProcedurePath(p);
  const featured = isFeatured(parent);
  const groupLabel = featured ? GROUP_LABEL[parent.group] : "Also Treated";
  const groupHref = featured ? GROUP_HREF[parent.group] : SECTION.other;
  const siblings = subProceduresOf(p.parent).filter((s) => s.slug !== p.slug);
  const seeAlso = p.seeAlso ? getService(p.seeAlso) : undefined;

  const budget = createLinkBudget(path, [ROUTES.about, ROUTES.locations, ROUTES.contact, parent.path, ...(seeAlso ? [seeAlso.path] : [])]);
  const sections = p.sections.map((s) => ({ heading: s.heading, body: s.body?.map((b) => autolink(b, budget)), bullets: s.bullets }));
  const faqs = p.faqs.map((f) => ({ q: f.q, a: autolink(f.a, budget) }));
  const procedureId = `${siteOrigin()}${path}#procedure`;

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: groupLabel, path: groupHref },
            { name: parent.shortTitle, path: parent.path },
            { name: p.shortTitle, path },
          ]),
          medicalWebPageJsonLd({
            title: p.metaTitle,
            description: p.description,
            path,
            speakable: ["#summary", ".service-prose .intro", ".faq"],
            mainEntityId: procedureId,
            relatedPaths: [parent.path, ...siblings.map((s) => subProcedurePath(s)), ...(seeAlso ? [seeAlso.path] : [])],
          }),
          {
            "@context": "https://schema.org",
            "@type": "MedicalProcedure",
            "@id": procedureId,
            name: p.procedureName,
            alternateName: p.shortTitle,
            description: p.lead,
            procedureType: "https://schema.org/SurgicalProcedure",
            url: `${siteOrigin()}${path}`,
            performer: { "@id": PHYSICIAN_ID() },
          },
          faqJsonLd(p.faqs),
        ]}
      />
      <PageHero
        eyebrow={`${groupLabel} · ${parent.shortTitle}`}
        crumb={[{ label: groupLabel, href: groupHref }, { label: parent.shortTitle, href: parent.path }, { label: p.shortTitle }]}
        title={p.title}
        lead={p.lead}
      />
      <section className="section container content-grid">
        <article className="prose service-prose">
          <Byline />
          <KeyFacts title={`${p.shortTitle} at a Glance`}>
            <ul>
              {p.facts.map((f) => (
                <li key={f.label}>
                  <b>{f.label}:</b> {f.value}.
                </li>
              ))}
              <li>
                <b>Surgeon:</b> <Link href={ROUTES.about}>{DOCTOR.name}</Link>, {DOCTOR.fellowship}.
              </li>
              <li>
                <b>Contact:</b> <a href={`tel:${SITE.phoneTel}`}>{SITE.phone}</a> · <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
              </li>
            </ul>
          </KeyFacts>

          {sections.map((s, i) => (
            <section key={s.heading}>
              <h2>{s.heading}</h2>
              {s.body?.map((b, j) => (
                <p key={j} className={i === 0 && j === 0 ? "intro" : undefined}>
                  {b}
                </p>
              ))}
              {s.bullets && (
                <ul>
                  {s.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
          <InfoSheet href={p.sheet} />

          {seeAlso && (
            <p className="callout">
              See also: <Link href={seeAlso.path}>{seeAlso.shortTitle}</Link> — {seeAlso.cardText}
            </p>
          )}

          <section>
            <h2>Frequently Asked Questions</h2>
            <Faq items={faqs} />
          </section>

          <section>
            <h2>{siblings.length > 0 ? `Related ${parent.shortTitle} Procedures` : "Related"}</h2>
            {siblings.length > 0 && (
              <ul className="child-list">
                {siblings.map((s) => (
                  <li key={s.slug}>
                    <Link href={subProcedurePath(s)}>{s.shortTitle}</Link> — {s.cardText}
                  </li>
                ))}
              </ul>
            )}
            <p>
              <Link className="text-link" href={parent.path}>
                {parent.title} — Full Overview <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </p>
          </section>
          <p className="note">This page is general information written by {DOCTOR.name} for patients and families. It does not replace an individual consultation; treatment depends on clinical assessment.</p>
        </article>
        <HelpSideCard />
      </section>
      <CtaBand />
    </>
  );
}
