import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { CtaBand, Faq, HelpSideCard, PageHero, PhotoGallery, RelatedServices } from "@/components/site/blocks";
import { InfoSheet } from "@/components/site/info-sheet";
import { JsonLd } from "@/components/site/json-ld";
import { childServices, getService, GROUP_HREF, GROUP_LABEL, isFeatured, SERVICE_PAGES, SITE, type ServiceSection } from "@/lib/content";
import { ROUTES, SECTION } from "@/lib/routes";
import { breadcrumbJsonLd, faqJsonLd, medicalWebPageJsonLd, pageMetadata, serviceEntitiesJsonLd } from "@/lib/seo";

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

function Section({ s }: { s: ServiceSection }) {
  return (
    <section>
      <h2>{s.heading}</h2>
      {s.body?.map((p) => <p key={p.slice(0, 40)}>{p}</p>)}
      {s.bullets && (
        <ul>
          {s.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      )}
      {s.items && (
        <div className="procedure-list">
          {s.items.map((it) => (
            <article className="procedure" key={it.title}>
              <h3>{it.title}</h3>
              <p>{it.text}</p>
              {it.sheet && <InfoSheet href={it.sheet} />}
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
  const groupLabel = featured ? GROUP_LABEL[page.group] : "Also treated";
  const groupHref = featured ? GROUP_HREF[page.group] : SECTION.other;
  const parent = page.parent ? getService(page.parent) : undefined;
  const children = childServices(page.slug);
  const related = page.related.map(getService).filter((p): p is NonNullable<typeof p> => Boolean(p));
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: groupLabel, path: groupHref },
            { name: page.shortTitle, path: page.path },
          ]),
          medicalWebPageJsonLd({ title: page.metaTitle, description: page.description, path: page.path }),
          faqJsonLd(page.faqs),
          ...serviceEntitiesJsonLd(page),
        ]}
      />
      <PageHero eyebrow={page.eyebrow} crumb={`${groupLabel} / ${page.shortTitle}`} title={page.title} lead={page.lead} />
      <section className="section container content-grid">
        <article className="prose service-prose">
          {page.intro.map((p) => (
            <p key={p.slice(0, 40)} className="intro">
              {p}
            </p>
          ))}
          {page.infoSheet && <InfoSheet href={page.infoSheet} />}
          {children.length > 0 && (
            <section>
              <h2>Procedure pages</h2>
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
          {page.sections.map((s) => (
            <Section key={s.heading} s={s} />
          ))}
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
                {parent.title.toLowerCase()} <ArrowRight size={14} aria-hidden="true" />
              </Link>{" "}
              — see the overview for the full range of procedures, including those without a dedicated page.
            </p>
          )}
          <section className="contact-inline">
            <h2>Need more information?</h2>
            <p>
              Call <a href={`tel:${SITE.phoneTel}`}>{SITE.phone}</a>, email <a href={`mailto:${SITE.email}`}>{SITE.email}</a> or{" "}
              <Link href={ROUTES.contact}>
                book an appointment online <ArrowRight size={14} aria-hidden="true" />
              </Link>
              .
            </p>
          </section>
          <section>
            <h2>Frequently asked questions</h2>
            <Faq items={page.faqs} />
          </section>
          <p className="note">
            This page is general information written by Dr Vybhav Deraje for patients and families. It does not replace an individual consultation; treatment plans depend on clinical assessment. Last reviewed {new Date(SITE.contentUpdated).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}.
          </p>
        </article>
        <HelpSideCard />
      </section>
      <RelatedServices services={related} />
      <CtaBand />
    </>
  );
}
