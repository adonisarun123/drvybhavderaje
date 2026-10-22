import Link from "next/link";
import { ArrowRight, ArrowUpRight, Baby, Check, Ear, Hand, HeartHandshake, Phone, Quote, Ribbon, ScanFace, Smile, Sparkles, Stethoscope, Waves } from "lucide-react";
import { SITE, type ServicePage } from "@/lib/content";
import { ROUTES } from "@/lib/routes";

export function CtaBand() {
  return (
    <section className="cta container" aria-labelledby="cta-heading">
      <div className="cta-symbol">
        <HeartHandshake size={48} strokeWidth={1} aria-hidden="true" />
      </div>
      <div>
        <p className="eyebrow">Let’s take the next step, together</p>
        <h2 id="cta-heading">Your questions are a good place to start.</h2>
        <p>
          Call <a href={`tel:${SITE.phoneTel}`}>{SITE.phone}</a>, email <a href={`mailto:${SITE.email}`}>{SITE.email}</a> or send an enquiry.
        </p>
      </div>
      <Link className="button light" href={ROUTES.contact}>
        Book an appointment <ArrowUpRight size={18} aria-hidden="true" />
      </Link>
    </section>
  );
}

export function HelpSideCard() {
  return (
    <aside className="side-card" aria-label="Contact the clinic">
      <p className="eyebrow">Here to help</p>
      <h3>Let’s talk about your care.</h3>
      <p>The clinic can help you choose a location and arrange your consultation with Dr Vybhav Deraje.</p>
      <Link href={ROUTES.contact} className="button">
        Book an appointment <ArrowUpRight size={18} aria-hidden="true" />
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

export function PageHero({ eyebrow, title, lead, crumb }: { eyebrow: string; title: string; lead: string; crumb: string }) {
  return (
    <section className="page-hero">
      <div className="container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link> / {crumb.toUpperCase()}
        </nav>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="lead">{lead}</p>
      </div>
    </section>
  );
}

export function Faq({ items }: { items: { q: string; a: string }[] }) {
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
  "body-plastic-surgeon-bangalore": Ear,
  "hand-plastic-surgeon-bangalore": Hand,
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
          <p className="eyebrow">You may also be looking for</p>
          <h2 id="related-heading">Related care</h2>
        </div>
        <Link href="/#craniofacial" className="text-link">
          All services <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </div>
      <ServiceGrid services={services} compact />
    </section>
  );
}

export function TestimonialCard({ name, topic, text }: { name: string; topic: string; text: string }) {
  return (
    <figure className="testimonial-card">
      <Quote size={22} aria-hidden="true" />
      <blockquote>
        <p>{text}</p>
      </blockquote>
      <figcaption>
        <b>{name}</b>
        <span>{topic}</span>
      </figcaption>
    </figure>
  );
}
