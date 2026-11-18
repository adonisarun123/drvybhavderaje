import type { Metadata } from "next";
import { titleCase } from "@/lib/title-case";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Fragment, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { Byline, CtaBand, Faq, KeyFacts, PageHero, PhotoGallery, RelatedServices } from "@/components/site/blocks";
import { VideoSection } from "@/components/site/video-section";
import { AgePath, CompareSection, DayLine, HeroFacts, HeroVideo, InlineToc, SectionVideo, ServiceSide, StepStrip, TypeGrid } from "@/components/site/page-visuals";
import { PAGE_VISUALS, placedVideoIds, resolveVisuals, sectionAnchor, SHOW_DIAGRAMS, type PageVisuals } from "@/lib/page-visuals";
import { videoById, videosFor } from "@/lib/videos";
import { AllCostsLink, CostTable } from "@/components/site/cost-table";
import { bothRanges, costsForPath, formatInr, formatUsd, toUsd, type CostItem } from "@/lib/costs";
import { JsonLd } from "@/components/site/json-ld";
import { PostList } from "@/components/site/blog";
import { blogPath, postsForService } from "@/lib/blog";
import { childServices, CLINICS_SEED, COSTS_SECTION_ID, DOCTOR, isPendingReview, HEAD_SHAPE_CLINIC, HEAD_SHAPE_SLUGS, getService, GROUP_HREF, GROUP_LABEL, HOSPITALS, isFeatured, PRACTICES, SERVICE_PAGES, SITE, type ServiceSection } from "@/lib/content";
import { autolink, createLinkBudget, relatedServices, serviceRelatedPaths } from "@/lib/links";
import { ROUTES, SECTION } from "@/lib/routes";
import { breadcrumbJsonLd, costCatalogJsonLd, faqJsonLd, medicalWebPageJsonLd, pageMetadata, PROCEDURE_ID, CONDITION_ID, serviceEntitiesJsonLd, imageObjectsJsonLd, videoObjectsJsonLd } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return SERVICE_PAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = getService(slug);
  if (!page) return {};
  return pageMetadata({ title: page.metaTitle, description: page.description, path: page.path, ogType: "article", bare: !page.metaTitle.includes(SITE.name), noindex: isPendingReview(page.slug) });
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

function Section({ s, costs, path, visuals }: { s: LinkedSection; costs?: CostItem[]; path?: string; visuals?: PageVisuals }) {
  const showCosts = s.id === COSTS_SECTION_ID && costs && costs.length > 0;
  const layout = visuals?.layouts?.[s.heading];
  const days = visuals?.timelines?.[s.heading];
  const steps = visuals?.steps?.[s.heading];
  const video = visuals?.videos?.[s.heading];
  return (
    <section id={s.id ?? sectionAnchor(s.heading)}>
      <h2>{s.heading}</h2>
      {days && <DayLine days={days} />}
      {showCosts && <CostTable items={costs} currentPath={path} />}
      {s.body?.map((p, i) => <p key={i}>{p}</p>)}
      {showCosts && <AllCostsLink />}
      {s.bullets && (
        <ul>
          {s.bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      )}
      {steps && <StepStrip steps={steps} />}
      {s.items && layout === "type-grid" && <TypeGrid items={s.items} visuals={visuals?.items ?? {}} showDiagrams={SHOW_DIAGRAMS} />}
      {s.items && layout === "age-path" && <AgePath items={s.items} visuals={visuals?.items ?? {}} />}
      {s.items && layout !== "type-grid" && layout !== "age-path" && (
        <div className={`procedure-list${layout === "cards-2" ? " cols-2" : ""}`}>
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
      {video && <SectionVideo id={video} />}
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
  const guides = postsForService(page.slug);

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
  const costs = costsForPath(page.path);
  const placed = placedVideoIds(PAGE_VISUALS[page.slug]);
  const visuals = resolveVisuals(page, videosFor(page.slug, 6, placed).length > 0);
  // The page's own procedure (first listed for this page) leads; hub pages show the lowest figure instead.
  const isHub = page.slug === "face-plastic-surgery-bangalore" || page.slug === "breast-plastic-surgeon-bangalore" || page.slug === "body-plastic-surgeon-bangalore";
  const primary = isHub ? undefined : costs.find((c) => c.paths[0] === page.path);
  const lowest = costs.length ? Math.min(...costs.filter((c) => !c.per).map((c) => c.inrFrom)) : 0;

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
            relatedPaths: [...serviceRelatedPaths(page), ...guides.map((g) => blogPath(g.slug))],
          }),
          faqJsonLd(page.faqs),
          ...serviceEntitiesJsonLd(page),
          ...(costs.length ? [costCatalogJsonLd(costs, { path: page.path, name: `${page.shortTitle} — typical costs` })] : []),
          ...videoObjectsJsonLd([...placed.flatMap((id) => videoById(id) ?? []), ...videosFor(page.slug, 6, placed)]),
          ...(page.gallery ? imageObjectsJsonLd(page.gallery) : []),
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
        after={visuals?.hero && <HeroFacts facts={visuals.hero.facts} />}
        media={visuals?.hero?.videoId && <HeroVideo id={visuals.hero.videoId} caption={visuals.hero.videoCaption} />}
      />
      <section className="section container content-grid">
        <article className="prose service-prose">
          <Byline />
          <InlineToc toc={visuals.toc ?? []} />
          <KeyFacts title={titleCase(`${page.shortTitle} in Bangalore${page.slug === "craniosynostosis-surgery-bangalore" ? ", India" : ""}`)}>
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
                  <b>Where:</b> Consultations at <Link href={ROUTES.locations}>Aesthetica Veda Clinics</Link> in {CLINICS_SEED.map((c) => c.name).join(", ").replace(/, ([^,]*)$/, " and $1")}, Bangalore (Bengaluru); surgery at {HOSPITALS.filter((h) => page.group !== "cosmetic" || !h.name.startsWith("Aster")).map((h) => h.name.replace(" Hospital", "")).slice(0, 3).join(", ")} and other partner hospitals.
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
              {costs.length > 0 && (
                <li>
                  <b>Typical Cost:</b> {primary ? `${primary.name}, ${bothRanges(primary)}` : `From ${formatInr(lowest)} (about ${formatUsd(toUsd(lowest))})`} for an uncomplicated case — <a href={`#${COSTS_SECTION_ID}`}>all costs</a>.
                </li>
              )}
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
          {visuals?.videos?.intro && <SectionVideo id={visuals.videos.intro} />}
          {children.length > 0 && (
            <section data-link-group="related">
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
            <Fragment key={s.heading}>
              {visuals?.compare?.before === s.heading && <CompareSection data={visuals.compare} />}
              <Section s={s} costs={costs} path={page.path} visuals={visuals} />
            </Fragment>
          ))}
          <VideoSection page={page.slug} exclude={placed} id="videos" />
          {page.gallery && (
            <section>
              <h2>Gallery</h2>
              <PhotoGallery photos={page.gallery} columns={2} />
            </section>
          )}
          {guides.length > 0 && (
            <section id="guides" data-link-group="related">
              <h2>Patient Guides</h2>
              <p>
                Longer reads from the <Link href={ROUTES.blog}>blog</Link> that go deeper into the questions patients ask before deciding.
              </p>
              <PostList posts={guides} />
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
          <section id="faqs">
            <h2>Frequently Asked Questions</h2>
            <Faq items={faqs} />
          </section>
          <p className="note">This page is general information written by {DOCTOR.name} for patients and families. It does not replace an individual consultation; treatment plans depend on clinical assessment.</p>
        </article>
        <ServiceSide toc={visuals.toc ?? []} />
      </section>
      <RelatedServices services={related} />
      <CtaBand />
    </>
  );
}
