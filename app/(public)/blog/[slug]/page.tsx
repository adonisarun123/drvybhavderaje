import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { PostBlock, PostCards, RichText, formatPostDate } from "@/components/site/blog";
import { Byline, CtaBand, Faq, KeyFacts, PageHero, RelatedServices } from "@/components/site/blocks";
import { JsonLd } from "@/components/site/json-ld";
import { InlineToc, ServiceSide } from "@/components/site/page-visuals";
import { BLOG_POSTS, blogPath, getPost, headingText, postInternalLinks, postShortTitle, relatedPosts, sectionId, tocLabel } from "@/lib/blog";
import { DOCTOR, getService, SITE, type ServicePage } from "@/lib/content";
import { bothRanges, COST_ITEMS } from "@/lib/costs";
import { createLinkBudget } from "@/lib/links";
import { ROUTES } from "@/lib/routes";
import { ARTICLE_ID, blogPostingJsonLd, breadcrumbJsonLd, CONDITION_ID, faqJsonLd, medicalWebPageJsonLd, pageMetadata, PROCEDURE_ID } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return pageMetadata({ title: post.metaTitle, description: post.description, path: blogPath(post.slug), ogType: "article", bare: true, published: post.published, modified: post.modified });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const path = blogPath(post.slug);
  const service = getService(post.service);
  const services = post.services.flatMap((s) => getService(s) ?? []) as ServicePage[];
  const more = relatedPosts(post);
  const costs = COST_ITEMS.filter((c) => post.costs.includes(c.name));
  const toc = [{ label: "Key Takeaways", id: "summary" }, ...post.sections.map((s) => ({ label: tocLabel(s.heading), id: sectionId(s.heading) })), { label: "Questions", id: "faqs" }, { label: "References", id: "references" }];

  // Contextual links in reading order. The byline already links the surgeon's profile.
  const budget = createLinkBudget(path, [ROUTES.about]);
  const aboutIds = service ? [...service.procedures.map((_, i) => PROCEDURE_ID(service, i)), ...service.conditions.map((_, i) => CONDITION_ID(service, i))] : [];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: ROUTES.blog },
            { name: postShortTitle(post), path },
          ]),
          medicalWebPageJsonLd({
            title: post.metaTitle,
            description: post.description,
            path,
            speakable: ["#summary", ".service-prose .intro", ".faq"],
            mainEntityId: ARTICLE_ID(post),
            aboutIds,
            // Exactly the pages this template renders as links: the copy's own links, the procedure grid, the other guides and the index.
            relatedPaths: [...postInternalLinks(post), ...services.map((s) => s.path), ...more.map((p) => blogPath(p.slug)), ROUTES.blog],
            lastReviewed: post.modified,
            dateModified: post.modified,
          }),
          blogPostingJsonLd(post, aboutIds),
          faqJsonLd(post.faqs),
        ]}
      />
      <PageHero eyebrow={`Blog · ${post.category}`} crumb={[{ label: "Blog", href: ROUTES.blog }, { label: postShortTitle(post) }]} title={post.title} lead={post.card} />
      <section className="section container content-grid">
        <article className="prose service-prose post">
          <Byline published={formatPostDate(post.published)} />
          <InlineToc toc={toc} />
          {post.intro.map((p, i) => (
            <p key={i} className="intro">
              <RichText text={p} budget={budget} />
            </p>
          ))}
          <KeyFacts title="Key Takeaways">
            <ul>
              {post.takeaways.map((t, i) => (
                <li key={i}>
                  <RichText text={t} budget={budget} />
                </li>
              ))}
              {service && (
                <li>
                  <b>At This Practice:</b> <Link href={service.path}>{service.title}</Link> with <Link href={ROUTES.about}>{DOCTOR.name}</Link>
                  {costs.length > 0 && (
                    <>
                      {" "}
                      — {costs.map((c) => `${c.name}, ${bothRanges(c)}`).join("; ")} for an uncomplicated case (<Link href={ROUTES.costs}>all costs</Link>)
                    </>
                  )}
                  .
                </li>
              )}
            </ul>
          </KeyFacts>
          {post.sections.map((s) => (
            <section key={s.heading} id={sectionId(s.heading)}>
              <h2>{headingText(s.heading)}</h2>
              {s.blocks.map((b, i) => (
                <PostBlock key={i} block={b} budget={budget} />
              ))}
            </section>
          ))}
          <section id="faqs">
            <h2>Frequently Asked Questions</h2>
            <Faq items={post.faqs.map((f) => ({ q: f.q, a: <RichText text={f.a} budget={budget} /> }))} />
          </section>
          <section className="contact-inline">
            <h2>Talk It Through with the Surgeon</h2>
            <p>
              Call <a href={`tel:${SITE.phoneTel}`}>{SITE.phone}</a>, email <a href={`mailto:${SITE.email}`}>{SITE.email}</a> or{" "}
              <Link href={ROUTES.contact}>
                book an appointment online <ArrowRight size={14} aria-hidden="true" />
              </Link>
              . Video consultations are available for patients outside Bangalore.
            </p>
            <nav className="page-links" aria-label="More about the practice">
              {service && (
                <Link href={service.path}>
                  {service.shortTitle} in Bangalore <ArrowRight size={14} aria-hidden="true" />
                </Link>
              )}
              <Link href={ROUTES.costs}>
                Treatment Costs <ArrowRight size={14} aria-hidden="true" />
              </Link>
              <Link href={ROUTES.locations}>
                Clinics and Hospitals <ArrowRight size={14} aria-hidden="true" />
              </Link>
              <Link href={ROUTES.resources}>
                Preparing for Your Consultation <ArrowRight size={14} aria-hidden="true" />
              </Link>
              <Link href={ROUTES.blog}>
                All Patient Guides <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </nav>
          </section>
          <section id="references" className="post-references">
            <h2>Resources and References</h2>
            <ul>
              {post.references.map((r) => (
                <li key={r.url}>
                  <a href={r.url} target="_blank" rel="noopener noreferrer">
                    {r.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
          <p className="note">
            <b>Medical Disclaimer:</b> {post.disclaimer}
          </p>
        </article>
        <ServiceSide toc={toc} />
      </section>
      {more.length > 0 && (
        <section className="section container" aria-labelledby="more-guides-heading" data-link-group="related">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Keep Reading</p>
              <h2 id="more-guides-heading">More Patient Guides</h2>
            </div>
            <Link href={ROUTES.blog} className="text-link">
              All Patient Guides <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
          <PostCards posts={more} columns={more.length % 3 === 0 ? 3 : undefined} />
        </section>
      )}
      <RelatedServices services={services} />
      <CtaBand />
    </>
  );
}
