import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Byline, CtaBand, Faq, HelpSideCard, KeyFacts, PageHero } from "@/components/site/blocks";
import { JsonLd } from "@/components/site/json-ld";
import { SubProcedureView } from "@/components/site/sub-procedure-page";
import { VideoSection } from "@/components/site/video-section";
import { CRANIO_PARENT, CRANIO_TYPES, cranioTypePath, cranioVideoKey, getCranioType } from "@/lib/cranio-types";
import { DOCTOR, getService, HEAD_SHAPE_CLINIC, SITE } from "@/lib/content";
import { titleCase } from "@/lib/title-case";
import { autolink, createLinkBudget } from "@/lib/links";
import { ROUTES, SECTION } from "@/lib/routes";
import { getSubProcedure, SUB_PROCEDURES, subProcedurePath } from "@/lib/sub-procedures";
import { breadcrumbJsonLd, faqJsonLd, medicalWebPageJsonLd, pageMetadata, siteOrigin } from "@/lib/seo";

/**
 * Child pages under a service page: the craniosynostosis types (/craniosynostosis-surgery-bangalore/<type>, lib/cranio-types.ts)
 * and the procedure pages built from the patient-information sheets (/<parent>/<procedure>, lib/sub-procedures.ts).
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return [...CRANIO_TYPES.map((t) => ({ slug: CRANIO_PARENT, type: t.slug })), ...SUB_PROCEDURES.map((p) => ({ slug: p.parent, type: p.slug }))];
}

type Params = Promise<{ slug: string; type: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug, type } = await params;
  const sub = getSubProcedure(slug, type);
  if (sub) return pageMetadata({ title: sub.metaTitle, description: sub.description, path: subProcedurePath(sub), ogType: "article" });
  const t = slug === CRANIO_PARENT ? getCranioType(type) : undefined;
  if (!t) return {};
  return pageMetadata({ title: t.metaTitle, description: t.description, path: cranioTypePath(t.slug), ogType: "article" });
}

export default async function CranioTypePage({ params }: { params: Params }) {
  const { slug, type } = await params;
  const sub = getSubProcedure(slug, type);
  if (sub) return <SubProcedureView p={sub} />;
  const t = slug === CRANIO_PARENT ? getCranioType(type) : undefined;
  const parent = getService(CRANIO_PARENT);
  if (!t || !parent) notFound();
  const path = cranioTypePath(t.slug);
  const siblings = CRANIO_TYPES.filter((x) => x.slug !== t.slug);
  const multi = t.slug.startsWith("multi");
  const openName = t.sections.find((s) => s.heading.startsWith("Open "))?.heading.replace(/^Open | — What to Expect$/g, "");

  const budget = createLinkBudget(path, [ROUTES.about, ROUTES.locations, ROUTES.contact, parent.path]);
  const what = autolink(t.what, budget);
  const effects = autolink(t.effects, budget);
  const treatment = t.treatment.map((p) => autolink(p, budget));
  const sections = t.sections.map((s) => ({ heading: s.heading, body: s.body?.map((p) => autolink(p, budget)), bullets: s.bullets }));
  const faqs = t.faqs.map((f) => ({ q: f.q, a: autolink(f.a, budget) }));
  const conditionId = `${siteOrigin()}${path}#condition`;

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Craniofacial Surgery", path: SECTION.craniofacial },
            { name: parent.shortTitle, path: parent.path },
            { name: t.shortTitle, path },
          ]),
          medicalWebPageJsonLd({ title: t.metaTitle, description: t.description, path, speakable: ["#summary", ".service-prose .intro"], mainEntityId: conditionId, relatedPaths: [parent.path, ...siblings.map((s) => cranioTypePath(s.slug))] }),
          {
            "@context": "https://schema.org",
            "@type": "MedicalCondition",
            "@id": conditionId,
            name: t.title.replace(/ in Bangalore$/, ""),
            alternateName: t.shapeName,
            description: t.what,
            possibleTreatment: multi
              ? ["Posterior cranial vault expansion", "Fronto-orbital advancement", "Cranial vault remodelling", "Le Fort III advancement"].map((name) => ({ "@type": "MedicalProcedure", name }))
              : [
                  { "@type": "MedicalProcedure", name: "Endoscope-Assisted Strip Craniectomy with Helmet Therapy" },
                  { "@type": "MedicalProcedure", name: openName ?? "Cranial vault remodelling" },
                ],
          },
          faqJsonLd(t.faqs),
        ]}
      />
      <PageHero
        eyebrow="Craniofacial Surgery · Types of Craniosynostosis"
        crumb={[{ label: "Craniofacial Surgery", href: SECTION.craniofacial }, { label: parent.shortTitle, href: parent.path }, { label: t.shortTitle }]}
        title={t.title}
        lead={t.lead}
      />
      <section className="section container content-grid">
        <article className="prose service-prose">
          <Byline />
          <KeyFacts title={`${t.shortTitle} at a Glance`}>
            <ul>
              <li>
                <b>Head Shape:</b> {titleCase(t.shapeName)}.
              </li>
              <li>
                <b>Diagnosis:</b> Clinical examination, skull X-ray and 3D CT scan{multi ? ", MRI and genetic testing" : "; MRI occasionally"}.
              </li>
              <li>
                <b>Treatment:</b> {multi ? "Staged surgery through childhood with a multidisciplinary team." : `Under 6 months, keyhole surgery and Orthotic Helmet Therapy; above 6 months, open ${openName ?? "Remodelling"}.`}
              </li>
              <li>
                <b>Surgeon:</b> <Link href={ROUTES.about}>{DOCTOR.name}</Link>, {DOCTOR.fellowship}.
              </li>
              <li>
                <b>Where:</b> Consultations at{" "}
                <a href={HEAD_SHAPE_CLINIC.url} target="_blank" rel="noopener noreferrer">
                  The Head Shape Clinic
                </a>{" "}
                ({HEAD_SHAPE_CLINIC.where.split(" — ")[0]}); surgery at Aster Whitefield Hospital.
              </li>
              <li>
                <b>Contact:</b> <a href={`tel:${SITE.phoneTel}`}>{SITE.phone}</a> · <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
              </li>
            </ul>
          </KeyFacts>

          <section>
            <h2>What Is {t.shortTitle}?</h2>
            <p className="intro">{what}</p>
          </section>
          <section>
            <h2>How It Affects Your Child</h2>
            <p>{effects}</p>
          </section>
          <section>
            <h2>How It Is Diagnosed</h2>
            <p>{t.diagnosis}</p>
          </section>
          <section>
            <h2>How It Is Treated</h2>
            {treatment.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </section>
          {sections.map((s) => (
            <section key={s.heading}>
              <h2>{s.heading}</h2>
              {s.body?.map((p, i) => <p key={i}>{p}</p>)}
              {s.bullets && (
                <ul>
                  {s.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <section className="travel-callout" aria-labelledby="travel-heading">
            <h2 id="travel-heading">Travelling from Another State or Country?</h2>
            <p>
              Families come to Dr Vybhav Deraje from across India and abroad. Send your child’s photographs and CT scan to the clinic first — Dr Vybhav can review them on a video consultation, and the clinic confirms the dates before you book travel. Keyhole surgery is possible only before 6 months of age, so contact the clinic early.
            </p>
            <Link className="text-link" href={`${parent.path}#travelling-for-treatment`}>
              Planning Your Visit from Outside Bangalore <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </section>

          <VideoSection page={cranioVideoKey(t)} heading={`Videos on ${t.shortTitle}`} />

          <section>
            <h2>Frequently Asked Questions</h2>
            <Faq items={faqs} />
          </section>

          <section>
            <h2>Other Types of Craniosynostosis</h2>
            <ul className="child-list">
              {siblings.map((s) => (
                <li key={s.slug}>
                  <Link href={cranioTypePath(s.slug)}>{s.shortTitle}</Link> — {s.cardText}
                </li>
              ))}
            </ul>
            <p>
              <Link className="text-link" href={parent.path}>
                Craniosynostosis Surgery in Bangalore — Full Overview <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </p>
          </section>
          <p className="note">This page is general information written by {DOCTOR.name} for families. It does not replace an individual consultation; treatment depends on clinical assessment.</p>
        </article>
        <HelpSideCard />
      </section>
      <CtaBand />
    </>
  );
}
