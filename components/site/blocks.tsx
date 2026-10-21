import Link from "next/link";
import { ArrowUpRight, Check, HeartHandshake, Phone } from "lucide-react";
import { SITE } from "@/lib/content";

export function CtaBand() {
  return (
    <section className="cta container" aria-labelledby="cta-heading">
      <div className="cta-symbol">
        <HeartHandshake size={48} strokeWidth={1} aria-hidden="true" />
      </div>
      <div>
        <p className="eyebrow">Let’s take the next step, together</p>
        <h2 id="cta-heading">Your questions are a good place to start.</h2>
        <p>Speak with the clinic to arrange a consultation.</p>
      </div>
      <Link className="button light" href="/appointment">
        Book a consultation <ArrowUpRight size={18} aria-hidden="true" />
      </Link>
    </section>
  );
}

export function HelpSideCard() {
  return (
    <aside className="side-card" aria-label="Contact the clinic">
      <p className="eyebrow">Here to help</p>
      <h3>Let’s talk about your care.</h3>
      <p>The clinic can help you choose a location and arrange your consultation.</p>
      <Link href="/appointment" className="button">
        Request a consultation <ArrowUpRight size={18} aria-hidden="true" />
      </Link>
      <br />
      <a className="text-link" href={`tel:${SITE.phoneTel}`}>
        <Phone size={16} aria-hidden="true" /> {SITE.phone}
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
