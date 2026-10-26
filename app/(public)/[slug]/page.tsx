import type { Metadata } from "next";
import { titleCase } from "@/lib/title-case";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { Byline, CtaBand, Faq, HelpSideCard, KeyFacts, PageHero, PhotoGallery, RelatedServices } from "@/components/site/blocks";
import { VideoSection } from "@/components/site/video-section";
import { JsonLd } from "@/components/site/json-ld";
import { childServices, DOCTOR, HEAD_SHAPE_CLINIC, HEAD_SHAPE_SLUGS, getService, GROUP_HREF, GROUP_LABEL, HOSPITALS, isFeatured, PRACTICES, SERVICE_PAGES, SITE, type ServiceSection } from "@/lib/content";
import { autolink, createLinkBudget, relatedServices } from "@/lib/links";
import { ROUTES, SECTION } from "@/lib/routes";
import { breadcrumbJsonLd, faqJsonLd, medicalWebPageJsonLd, pageMetadata, PROCEDURE_ID, CONDITION_ID, serviceEntitiesJsonLd } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return SERVICE_PAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = getService(slug);
  if (!page) return {};
  return pageMetadata({ title: page.metaTitle, description: page.description, path: page.path, ogType: "article" });
}

/** A section with its copy already run through the autolinker (in document order, so the first mention on the page gets the link). */
interface LinkedSection {
  heading: string;
  id?: string;
  body?: ReactNode[];
  bullets?: ReactNode[];
  items?: { title: string; text: ReactNode; href?: string }[];
  note?: ReactNode;
}

function Section({ s }: { s: LinkedSection }) {
  return (
    <section id={s.id}>
      <h2>{s.heading}</h2>
      {s.body?.map((p, i) => <p key={i}>{p}</p>)}
      {s.bullets && (
        <ul>
          {s.bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      )}
      {s.items && (
        <div className="procedure-list">
          {s.items.map((it) => (
            <article className="procedure" key={it.title}>
              <h3>{it.href ? <Link href={it.href}>{it.title}</Link> : it.title}</h3>
              <p>{it.text}</p>
              {it.href && (
                <Link className="text-link" href={it.href}>
                  Read More About {it.title} <ArrowRight size={14} aria-hidden="true" />
                </Link>
              )}
            </article>
          ))}
        </div>
      )}
      {s.note && <p className="callout">{s.note}</p>}
    </section>
  );
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getService(slug);
  if (!page) notFound();
  const featured = isFeatured(page);
  const groupLabel = featured ? GROUP_LABEL[page.group] : "Also Treated";
  const groupHref = featured ? GROUP_HREF[page.group] : SECTION.other;
  const parent = page.parent ? getService(page.parent) : undefined;
  const children = childServices(page.slug);
  const related = relatedServices(page);
  const headShape = HEAD_SHAPE_SLUGS.has(page.slug);

  // Contextual links, resolved in reading order: at-a-glance → intro → sections → FAQs.
  const budget = createLinkBudget(page.path, [ROUTES.about, ROUTES.locations, ROUTES.contact]);
  const intro = page.intro.map((p) => autolink(p, budget));
  const sections: LinkedSection[] = page.sections.map((s: ServiceSection) => ({
    heading: s.heading,
    id: s.id,
    body: s.body?.map((p) => autolink(p, budget)),
    bullets: s.bullets?.map((b) => autolink(b, budget)),
    items: s.items?.map((it) => ({ title: it.title, text: autolink(it.text, budget), href: it.href })),
    note: s.note ? autolink(s.note, budget) : undefined,
  }));
  const faqs = page.faqs.map((f) => ({ q: f.q, a: autolink(f.a, budget) }));

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: groupLabel, path: groupHref },
            { name: page.shortTitle, path: page.path },
          ]),
          medicalWebPageJsonLd({
            title: page.metaTitle,
            description: page.description,
            path: page.path,
            speakable: ["#summary", ".service-prose .intro", ".faq"],
            mainEntityId: page.procedures.length ? PROCEDURE_ID(page, 0) : page.conditions.length ? CONDITION_ID(page, 0) : undefined,
            aboutIds: [...page.conditions.map((_, i) => CONDITION_ID(page, i)), ...page.procedures.map((_, i) => PROCEDURE_ID(page, i))],
            relatedPaths: [...(parent ? [parent.path] : []), ...children.map((c) => c.path), ...related.map((r) => r.path)],
          }),
          faqJsonLd(page.faqs),
          ...serviceEntitiesJsonLd(page),
        ]}
      />
      <PageHero
        eyebrow={page.eyebrow}
        crumb={[
          { label: groupLabel, href: groupHref },
          ...(parent ? [{ label: parent.shortTitle, href: parent.path }] : []),
          { label: page.shortTitle },
        ]}
        title={page.title}
        lead={page.lead}
      />
      <section className="section container content-grid">
        <article className="prose service-prose">
          <Byline />
          <KeyFacts title={titleCase(`${page.shortTitle} in Bangalore`)}>
            <p>{page.description}</p>
            <ul>
              <li>
                <b>Surgeon:</b> <Link href={ROUTES.about}>{DOCTOR.name}</Link>, {DOCTOR.honorificSuffix}; {DOCTOR.fellowship}.
              </li>
              {headShape ? (
                <li>
                  <b>Where:</b> Consultations at{" "}
                  <a href={HEAD_SHAPE_CLINIC.url} target="_blank" rel="noopener noreferrer">
                    The Head Shape Clinic
                  </a>{" "}
                  ({HEAD_SHAPE_CLINIC.where.split(" — ")[0]}); surgery, when needed, at Aster Whitefield Hospital.
                </li>
              ) : (
                <li>
                  <b>Where:</b> Consultations at <Link href={ROUTES.locations}>Aesthetica Veda Clinics</Link> in Bangalore; surgery at {HOSPITALS.filter((h) => page.group !== "cosmetic" || !h.name.startsWith("Aster")).map((h) => h.name.replace(" Hospital", "")).slice(0, 3).join(", ")} and other partner hospitals.
                </li>
              )}
              <li>
                <b>Practice:</b>{" "}
                {PRACTICES.filter((p) => (headShape ? p.slug === HEAD_SHAPE_CLINIC.slug : p.groups.includes(page.group))).map((p, i) => (
                  <span key={p.slug}>
                    {i > 0 && " · "}
                    <a href={p.url} target="_blank" rel="noopener noreferrer">
                      {p.name}
                    </a>{" "}
                    ({p.tagline})
                  </span>
                ))}
                {page.group === "craniofacial" && !headShape && (
                  <>
                    {" "}· <a href={PRACTICES[1]!.url} target="_blank" rel="noopener noreferrer">Aesthetica Veda</a> for all other consultations
                  </>
                )}
                {headShape ? " — founded by Dr Vybhav Deraje." : page.group === "craniofacial" ? " — both founded by Dr Vybhav Deraje." : " — Dr Vybhav Deraje's cosmetic clinics in Bangalore."}
              </li>
              <li>
                <b>Patients from Outside Bangalore:</b> <Link href={ROUTES.contact}>Video consultations</Link> for an initial opinion; surgery needs an in-person assessment.
              </li>
              <li>
                <b>Contact:</b> <a href={`tel:${SITE.phoneTel}`}>{SITE.phone}</a> · <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
              </li>
            </ul>
          </KeyFacts>
          {intro.map((p, i) => (
            <p key={i} className="intro">
              {p}
            </p>
          ))}
          {children.length > 0 && (
            <section>
              <h2>Procedure Pages</h2>
              <p>Each of these procedures has its own page with candidacy, technique, recovery and limitations explained in full.</p>
              <ul className="child-list">
                {children.map((c) => (
                  <li key={c.slug}>
                    <Link href={c.path}>{c.shortTitle}</Link> — {c.cardText}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {sections.map((s) => (
            <Section key={s.heading} s={s} />
          ))}
          <VideoSection page={page.slug} />
          {page.gallery && (
            <section>
              <h2>Gallery</h2>
              <PhotoGallery photos={page.gallery} columns={2} />
            </section>
          )}
          {parent && (
            <p className="note">
              Part of{" "}
              <Link href={parent.path}>
                {parent.title} <ArrowRight size={14} aria-hidden="true" />
              </Link>{" "}
              — see the overview for the full range of procedures, including those without a dedicated page.
            </p>
          )}
          <section className="contact-inline">
            <h2>Need More Information?</h2>
            <p>
              Call <a href={`tel:${SITE.phoneTel}`}>{SITE.phone}</a>, email <a href={`mailto:${SITE.email}`}>{SITE.email}</a> or{" "}
              <Link href={ROUTES.contact}>
                book an appointment online <ArrowRight size={14} aria-hidden="true" />
              </Link>
              .
            </p>
            <nav className="page-links" aria-label="More about the practice">
              <Link href={ROUTES.about}>
                About {DOCTOR.name} <ArrowRight size={14} aria-hidden="true" />
              </Link>
              <Link href={ROUTES.locations}>
                Clinics and Hospitals <ArrowRight size={14} aria-hidden="true" />
              </Link>
              <Link href={ROUTES.resources}>
                Preparing for Your Consultation <ArrowRight size={14} aria-hidden="true" />
              </Link>
              <Link href={ROUTES.testimonials}>
                Patient Stories <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </nav>
          </section>
          <section>
            <h2>Frequently Asked Questions</h2>
            <Faq items={faqs} />
          </section>
          <p className="note">This page is general information written by {DOCTOR.name} for patients and families. It does not replace an individual consultation; treatment plans depend on clinical assessment.</p>
        </article>
        <HelpSideCard />
      </section>
      <RelatedServices services={related} />
      <CtaBand />
    </>
  );
}
