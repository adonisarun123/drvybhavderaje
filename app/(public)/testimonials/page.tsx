import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Byline, CtaBand, PageHero, TestimonialCard } from "@/components/site/blocks";
import { JsonLd } from "@/components/site/json-ld";
import { VideoGallery } from "@/components/site/video-gallery";
import { SITE, TESTIMONIALS, VIDEOS } from "@/lib/content";
import { withTitles } from "@/lib/videos";
import { linkTargetFor } from "@/lib/links";
import { ROUTES, servicePath } from "@/lib/routes";
import { breadcrumbJsonLd, medicalWebPageJsonLd, pageMetadata, videoJsonLd } from "@/lib/seo";

const TITLE = "Patient Stories & Testimonials — Dr Vybhav Deraje, Bangalore";
const DESCRIPTION = "Patients and families on their experience with Dr Vybhav Deraje, Bangalore: Craniosynostosis, hand surgery, facial injury, jaw surgery and more. Plus videos.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: ROUTES.testimonials });

export default function TestimonialsPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Patient Stories", path: ROUTES.testimonials }]),
          medicalWebPageJsonLd({ title: TITLE, description: DESCRIPTION, path: ROUTES.testimonials, type: "CollectionPage" }),
          videoJsonLd(withTitles(VIDEOS)),
        ]}
      />
      <PageHero eyebrow="Our Stories" crumb="Patient Stories" title="Patients speak." lead="In their own words — experiences shared by patients and families, as published on the practice’s website." />
      <section className="section container">
        <Byline />
        <div className="testimonial-grid">
          {TESTIMONIALS.map((t) => (
            <TestimonialCard key={t.name + t.topic} {...t} href={linkTargetFor(t.topic)} />
          ))}
        </div>
        <p className="note">Testimonials are individual experiences shared voluntarily and do not predict the outcome of any treatment. Names are as supplied by the patients.</p>
        <p>
          Read about the treatments mentioned here: <Link href={servicePath("craniosynostosis-surgery-bangalore")}>craniosynostosis surgery</Link>, <Link href={servicePath("corrective-jaw-surgery-bangalore")}>corrective jaw surgery</Link>, <Link href={servicePath("facial-injuries-and-fracture-treatments")}>facial injuries and fractures</Link> and <Link href={servicePath("hand-plastic-surgeon-bangalore")}>hand surgery</Link> — or <Link href={ROUTES.about}>meet Dr Vybhav Deraje</Link>.
        </p>
      </section>
      <section className="section container" aria-labelledby="video-heading" style={{ paddingTop: 0 }}>
        <div className="section-heading">
          <div>
            <p className="eyebrow">Video Gallery</p>
            <h2 id="video-heading">Testimonial and Information Videos</h2>
          </div>
          <a href={SITE.social.youtube} target="_blank" rel="noopener noreferrer" className="text-link">
            YouTube Channel <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        </div>
        <VideoGallery videos={withTitles(VIDEOS)} />
      </section>
      <CtaBand />
    </>
  );
}
