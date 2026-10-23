import Link from "next/link";
import type { ReactNode } from "react";
import { Image } from "@imagekit/next";
import NextImage from "next/image";
import { ArrowRight, ArrowUpRight, Baby, BadgeCheck, Check, Droplets, Ear, Eye, Hand, Heart, HeartHandshake, PersonStanding, Phone, Quote, Ribbon, ScanFace, Shirt, Smile, Sparkles, Stethoscope, Waves } from "lucide-react";
import { AFFILIATIONS, COSMETIC_SERVICES, CRANIOFACIAL_SERVICES, DOCTOR, GROUP_LABEL, OTHER_SERVICES, PRACTICES, SITE, type Photo, type ServicePage } from "@/lib/content";
import { ROUTES, SECTION } from "@/lib/routes";

export type Crumb = { label: string; href?: string };

export function reviewedOn(): string {
  return new Date(SITE.contentUpdated).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export function CtaBand() {
  return (
    <section className="cta container" aria-labelledby="cta-heading">
      <div className="cta-symbol">
        <HeartHandshake size={48} strokeWidth={1} aria-hidden="true" />
      </div>
      <div>
        <p className="eyebrow">Let’s Take the Next Step, Together</p>
        <h2 id="cta-heading">Your questions are a good place to start.</h2>
        <p>
          Call <a href={`tel:${SITE.phoneTel}`}>{SITE.phone}</a>, email <a href={`mailto:${SITE.email}`}>{SITE.email}</a> or send an enquiry.
        </p>
      </div>
      <Link className="button light" href={ROUTES.contact} data-analytics-cta="cta_band_book">
        Book an Appointment <ArrowUpRight size={18} aria-hidden="true" />
      </Link>
    </section>
  );
}

export function HelpSideCard() {
  return (
    <aside className="side-card" aria-label="Contact the clinic">
      <p className="eyebrow">Here to Help</p>
      <h3>Let’s talk about your care.</h3>
      <p>The clinic can help you choose a location and arrange your consultation with Dr Vybhav Deraje.</p>
      <Link href={ROUTES.contact} className="button" data-analytics-cta="side_card_book">
        Book an Appointment <ArrowUpRight size={18} aria-hidden="true" />
      </Link>
      <br />
      <a className="text-link" href={`tel:${SITE.phoneTel}`}>
        <Phone size={16} aria-hidden="true" /> {SITE.phone}
      </a>
      <br />
      <a className="text-link" href={`mailto:${SITE.email}`}>
        {SITE.email}
      </a>
      <p className="note">Appointments are subject to confirmation by the clinic.</p>
    </aside>
  );
}

export function PageHero({ eyebrow, title, lead, crumb }: { eyebrow: string; title: string; lead: string; crumb: string | Crumb[] }) {
  const trail: Crumb[] = typeof crumb === "string" ? [{ label: crumb }] : crumb;
  return (
    <section className="page-hero">
      <div className="container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <ol>
            <li>
              <Link href="/">Home</Link>
            </li>
            {trail.map((c, i) => (
              <li key={c.label} aria-current={i === trail.length - 1 ? "page" : undefined}>
                {c.href && i < trail.length - 1 ? <Link href={c.href}>{c.label.toUpperCase()}</Link> : c.label.toUpperCase()}
              </li>
            ))}
          </ol>
        </nav>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="lead">{lead}</p>
      </div>
    </section>
  );
}

/** Visible author / reviewer line — the E-E-A-T signal answer engines look for, and a contextual link to the surgeon's profile. */
export function Byline() {
  return (
    <p className="byline">
      <BadgeCheck size={16} aria-hidden="true" />
      <span>
        Written and medically reviewed by <Link href={ROUTES.about}>{DOCTOR.name}</Link>, {DOCTOR.honorificSuffix} · Consultant Craniofacial &amp; Plastic Surgeon, Bangalore · KMC Reg. No. {DOCTOR.kmcRegistration} · Last reviewed {reviewedOn()}
      </span>
    </p>
  );
}

/** Answer-first summary block: the 40–60 words an assistant can quote as the direct answer. */
export function KeyFacts({ title, children }: { title: string; children: ReactNode }) {
  return (
    <aside className="key-facts" id="summary" aria-label="At a Glance">
      <p className="eyebrow">At a Glance</p>
      <h2>{title}</h2>
      {children}
    </aside>
  );
}

export function Faq({ items }: { items: { q: string; a: ReactNode }[] }) {
  return (
    <div className="faq">
      {items.map((f) => (
        <details key={f.q}>
          <summary>
            {f.q}
            <span aria-hidden="true">+</span>
          </summary>
          <p>{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function TopicList({ topics }: { topics: string[] }) {
  return (
    <div className="topic-list">
      {topics.map((t) => (
        <div key={t}>
          <Check size={18} aria-hidden="true" />
          {t}
        </div>
      ))}
    </div>
  );
}

const SERVICE_ICONS: Record<string, typeof Baby> = {
  "craniosynostosis-surgery-bangalore": Baby,
  "cleft-lip-and-palate-treatment-bangalore": Smile,
  "corrective-jaw-surgery-bangalore": ScanFace,
  "facial-injuries-and-fracture-treatments": Stethoscope,
  "head-and-neck-cancer-treatment": Ribbon,
  "other-craniofacial-conditions-treatments": Waves,
  "face-plastic-surgery-bangalore": Sparkles,
  "breast-plastic-surgeon-bangalore": HeartHandshake,
  "body-plastic-surgeon-bangalore": PersonStanding,
  "hand-plastic-surgeon-bangalore": Hand,
  "ear-reconstruction-surgery-bangalore": Ear,
  "rhinoplasty-surgery-bangalore": ScanFace,
  "blepharoplasty-eyelid-surgery-bangalore": Eye,
  "otoplasty-ear-correction-bangalore": Ear,
  "helmet-therapy-flat-head-bangalore": Baby,
  "earwell-infant-ear-correction-bangalore": Ear,
  "chin-augmentation-surgery-bangalore": Smile,
  "facelift-surgery-bangalore": Sparkles,
  "tummy-tuck-abdominoplasty-bangalore": PersonStanding,
  "breast-augmentation-surgery-bangalore": HeartHandshake,
  "breast-reduction-surgery-bangalore": Heart,
  "gynecomastia-surgery-bangalore": Shirt,
  "liposuction-surgery-bangalore": Droplets,
};

export function ServiceGrid({ services, compact = false, columns }: { services: ServicePage[]; compact?: boolean; columns?: 3 | 4 }) {
  return (
    <div className={`care-grid${compact ? " compact" : ""}${columns === 3 ? " cols-3" : ""}`}>
      {services.map((s, i) => {
        const Icon = SERVICE_ICONS[s.slug] ?? Sparkles;
        return (
          <Link key={s.slug} href={s.path} className={`care-card care-${i % 4}`}>
            <Icon className="care-icon" size={compact ? 28 : 37} strokeWidth={1.3} aria-hidden="true" />
            <h3>{s.shortTitle}</h3>
            <p>{s.cardText}</p>
            <span className="card-link">
              Read more <ArrowUpRight size={19} aria-hidden="true" />
            </span>
          </Link>
        );
      })}
    </div>
  );
}

export function RelatedServices({ services }: { services: ServicePage[] }) {
  if (!services.length) return null;
  return (
    <section className="section container" aria-labelledby="related-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">You May Also Be Looking For</p>
          <h2 id="related-heading">Related Care</h2>
        </div>
        <Link href={ROUTES.procedures} className="text-link">
          All Conditions and Procedures <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </div>
      <ServiceGrid services={services} compact columns={services.length % 3 === 0 ? 3 : undefined} />
    </section>
  );
}

/** Every public service page, grouped — used wherever a page should act as a hub (About, Resources, Locations, 404). */
export function ServiceIndex({ heading = "Conditions and Procedures", intro }: { heading?: string; intro?: ReactNode }) {
  const groups: { label: string; href: string; pages: ServicePage[] }[] = [
    { label: GROUP_LABEL.craniofacial, href: SECTION.craniofacial, pages: CRANIOFACIAL_SERVICES },
    { label: GROUP_LABEL.cosmetic, href: SECTION.cosmetic, pages: COSMETIC_SERVICES },
    { label: "Also Treated", href: SECTION.other, pages: OTHER_SERVICES },
  ];
  return (
    <section className="service-index" aria-labelledby="service-index-heading">
      <h2 id="service-index-heading">{heading}</h2>
      {intro}
      <p>
        <Link href={ROUTES.procedures} className="text-link">
          Full A–Z Index of Conditions and Procedures <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </p>
      <div className="service-index-grid">
        {groups.map((g) => (
          <div key={g.label}>
            <h3>
              <Link href={g.href}>{g.label}</Link>
            </h3>
            <ul>
              {g.pages.map((p) => (
                <li key={p.slug}>
                  <Link href={p.path}>{p.shortTitle}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export function TestimonialCard({ name, topic, text, href }: { name: string; topic: string; text: string; href?: string }) {
  return (
    <figure className="testimonial-card">
      <Quote size={22} aria-hidden="true" />
      <blockquote>
        <p>{text}</p>
      </blockquote>
      <figcaption>
        <b>{name}</b>
        <span>{href ? <Link href={href}>{topic}</Link> : topic}</span>
      </figcaption>
    </figure>
  );
}

export function PhotoGallery({ photos, columns = 3 }: { photos: Photo[]; columns?: 2 | 3 | 4 }) {
  return (
    <div className={`photo-grid cols-${columns}`}>
      {photos.map((p) => (
        <figure key={p.src} className="photo">
          <Image src={p.src} alt={p.caption} width={p.width} height={p.height} sizes="(max-width: 580px) 90vw, (max-width: 900px) 45vw, 370px" />
          <figcaption>{p.caption}</figcaption>
        </figure>
      ))}
    </div>
  );
}

/** Membership logo: local files under /logos/ go through next/image, older ones through ImageKit. */
export function AffiliationLogo({ a, alt, sizes }: { a: (typeof AFFILIATIONS)[number]; alt: string; sizes: string }) {
  return a.logo.startsWith("/logos/") ? (
    <NextImage src={a.logo} alt={alt} width={a.logoWidth} height={a.logoHeight} sizes={sizes} />
  ) : (
    <Image src={a.logo} alt={alt} width={a.logoWidth} height={a.logoHeight} sizes={sizes} />
  );
}

export function AffiliationLogos() {
  return (
    <ul className="logo-row" aria-label="Memberships and registrations">
      {AFFILIATIONS.map((a) => (
        <li key={a.org}>
          <a href={a.url} target="_blank" rel="noopener noreferrer">
            <AffiliationLogo a={a} alt={a.org} sizes="120px" />
            <span>{a.org}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/** The two practices Dr Vybhav founded, each linking out to its own website. */
export function PracticeCards({ heading = "Dr Vybhav's Practices", eyebrow = "Two Practices, One Surgeon", intro, id = "practices" }: { heading?: string; eyebrow?: string; intro?: ReactNode; id?: string }) {
  return (
    <section className="section container" aria-labelledby={`${id}-heading`} id={id}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 id={`${id}-heading`}>{heading}</h2>
        </div>
        {intro ?? <p>Children with head-shape concerns are seen at The Head Shape Clinic; cosmetic consultations take place at Aesthetica Veda. Both are founded and led by Dr Vybhav Deraje.</p>}
      </div>
      <div className="location-grid practice-grid">
        {PRACTICES.map((p) => (
          <article className="location-card" key={p.slug} id={p.slug} aria-labelledby={`practice-${p.slug}`}>
            {p.slug === "head-shape-clinic" ? <Baby size={28} strokeWidth={1.5} aria-hidden="true" /> : <Sparkles size={28} strokeWidth={1.5} aria-hidden="true" />}
            <p className="eyebrow">{p.tagline}</p>
            <h3 id={`practice-${p.slug}`}>{p.name}</h3>
            <p>
              {p.description}
              <br />
              <small>{p.where}</small>
            </p>
            <a href={p.url} target="_blank" rel="noopener noreferrer">
              Visit {p.name.replace(/^The /, "the ")} <ArrowUpRight size={16} aria-hidden="true" />
              <span className="visually-hidden">(opens in a new tab)</span>
            </a>
            <Link href={ROUTES.contact}>
              Book an Appointment <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
