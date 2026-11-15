import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, ArrowUpRight, MessageCircle, Phone } from "lucide-react";
import { Video } from "@/components/site/video-gallery";
import { PageToc } from "@/components/site/page-toc";
import { SITE } from "@/lib/content";
import type { CompareTable as CompareData, ItemVisual, SkullKind } from "@/lib/page-visuals";
import { ROUTES } from "@/lib/routes";
import { videoById } from "@/lib/videos";

/* ---- Hero -------------------------------------------------------------------------------------------- */

export function HeroFacts({ facts }: { facts: { value: string; label: string }[] }) {
  return (
    <dl className="hero-facts">
      {facts.map((f) => (
        <div key={f.value}>
          <dt>{f.value}</dt>
          <dd>{f.label}</dd>
        </div>
      ))}
    </dl>
  );
}

export function HeroVideo({ id, caption }: { id: string; caption?: string }) {
  const title = videoById(id)?.title;
  return (
    <figure className="hero-video">
      <Video id={id} index={1} title={title} eager />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

/* ---- Side column: "On This Page" + a compact contact card ------------------------------------------------ */

export function ServiceSide({ toc }: { toc: { label: string; id: string }[] }) {
  return (
    <aside className="service-side" aria-label="Page menu and contact">
      <PageToc items={toc} />
      <div className="side-card side-cta">
        <p className="eyebrow">Here to Help</p>
        <Link href={ROUTES.contact} className="button" data-analytics-cta="side_card_book">
          Book an Appointment <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
        <a className="text-link" href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer">
          <MessageCircle size={16} aria-hidden="true" /> WhatsApp the Clinic
        </a>
        <a className="text-link" href={`tel:${SITE.phoneTel}`}>
          <Phone size={16} aria-hidden="true" /> {SITE.phone}
        </a>
      </div>
    </aside>
  );
}

/** The same menu, collapsed, at the top of the article on phones (where the side column stacks below). */
export function InlineToc({ toc }: { toc: { label: string; id: string }[] }) {
  return (
    <details className="toc-inline">
      <summary>
        On This Page <span aria-hidden="true">+</span>
      </summary>
      <nav aria-label="On This Page">
        {toc.map((t) => (
          <a key={t.id} href={`#${t.id}`}>
            {t.label}
          </a>
        ))}
      </nav>
    </details>
  );
}

/* ---- Head-shape diagrams ------------------------------------------------------------------------------- */

type Suture = "metopic" | "coronalL" | "coronalR" | "sagittal" | "lambdoidL" | "lambdoidR";

/** Schematic skull seen from above (forehead at the top). `b` and `l` are where the sutures meet at the front and back. */
const SKULLS: Record<SkullKind, { outline: string; top: number; b: number; l: number; fused: Suture[]; label: string }> = {
  sagittal: {
    outline: "M60 12C78 12 90 38 90 70C90 104 78 130 60 130C42 130 30 104 30 70C30 38 42 12 60 12Z",
    top: 12, b: 46, l: 108, fused: ["sagittal"],
    label: "the suture along the top of the head has closed; the head is long and narrow",
  },
  metopic: {
    outline: "M60 12C74 26 104 60 101 92C98 118 79 130 60 130C41 130 22 118 19 92C16 60 46 26 60 12Z",
    top: 12, b: 54, l: 108, fused: ["metopic"],
    label: "the suture down the middle of the forehead has closed; the forehead is triangular",
  },
  unicoronal: {
    outline: "M48 16C64 15 86 38 98 62C108 90 90 130 60 130C30 130 14 102 16 76C14 48 26 18 48 16Z",
    top: 17, b: 52, l: 106, fused: ["coronalR"],
    label: "one ear-to-crown suture has closed; the forehead is flattened on that side",
  },
  bicoronal: {
    outline: "M60 30C90 30 112 46 112 72C112 98 90 114 60 114C30 114 8 98 8 72C8 46 30 30 60 30Z",
    top: 30, b: 58, l: 96, fused: ["coronalL", "coronalR"],
    label: "both ear-to-crown sutures have closed; the head is wide and short from front to back",
  },
  lambdoid: {
    outline: "M60 14C86 14 104 40 104 70C104 80 102 88 98 94C88 110 74 124 56 130C30 132 14 104 16 70C16 40 34 14 60 14Z",
    top: 14, b: 48, l: 100, fused: ["lambdoidR"],
    label: "a suture at the back of the head has closed; the back of the head is flattened on that side",
  },
  multisuture: {
    outline: "M60 30C82 30 96 48 96 72C96 96 82 114 60 114C38 114 24 96 24 72C24 48 38 30 60 30Z",
    top: 30, b: 58, l: 94, fused: ["coronalL", "coronalR", "sagittal", "lambdoidL", "lambdoidR"],
    label: "several sutures have closed",
  },
};

function suturePath(s: Suture, b: number, l: number): string {
  switch (s) {
    case "metopic":
      return `M60 0L60 ${b}`;
    case "sagittal":
      return `M60 ${b}L60 ${l}`;
    case "coronalL":
      return `M60 ${b}Q30 ${b - 2} -6 ${b + 16}`;
    case "coronalR":
      return `M60 ${b}Q90 ${b - 2} 126 ${b + 16}`;
    case "lambdoidL":
      return `M60 ${l}L0 ${l + 40}`;
    case "lambdoidR":
      return `M60 ${l}L120 ${l + 40}`;
  }
}

const ALL_SUTURES: Suture[] = ["metopic", "coronalL", "coronalR", "sagittal", "lambdoidL", "lambdoidR"];

export function SkullDiagram({ kind }: { kind: SkullKind }) {
  const k = SKULLS[kind];
  const clip = `skull-${kind}`;
  return (
    <svg className="skull" viewBox="0 0 120 140" role="img" aria-label={`Diagram of a baby’s head seen from above: ${k.label}.`}>
      <defs>
        <clipPath id={clip}>
          <path d={k.outline} />
        </clipPath>
      </defs>
      {/* nose marker: shows which way the head faces */}
      <path className="skull-nose" d={`M54 ${k.top + 2}L60 ${k.top - 8}L66 ${k.top + 2}Z`} />
      <path className="skull-outline" d={k.outline} />
      <g clipPath={`url(#${clip})`}>
        {ALL_SUTURES.filter((s) => !k.fused.includes(s)).map((s) => (
          <path key={s} className="suture-open" d={suturePath(s, k.b, k.l)} />
        ))}
        {k.fused.map((s) => (
          <path key={s} className="suture-fused" d={suturePath(s, k.b, k.l)} />
        ))}
      </g>
    </svg>
  );
}

export function DiagramLegend() {
  return (
    <p className="diagram-legend">
      <span className="legend-fused" aria-hidden="true" /> Suture closed early
      <span className="legend-open" aria-hidden="true" /> Normal, open suture
      <span className="legend-note">Seen from above, forehead at the top. Simplified diagrams, not to scale.</span>
    </p>
  );
}

/* ---- Section layouts ---------------------------------------------------------------------------------- */

export interface VisualItem {
  title: string;
  text: ReactNode;
  href?: string;
}

/** Condition types as a grid of cards, each with its diagram (when approved) and the head shape in plain words. */
export function TypeGrid({ items, visuals, showDiagrams }: { items: VisualItem[]; visuals: Record<string, ItemVisual>; showDiagrams: boolean }) {
  return (
    <>
      <div className="type-grid">
        {items.map((it) => {
          const v = visuals[it.title];
          return (
            <article className="type-card" key={it.title}>
              {showDiagrams && v?.diagram && <SkullDiagram kind={v.diagram} />}
              {v?.tag && <p className="type-tag">{v.tag}</p>}
              <h3>{it.href ? <Link href={it.href}>{it.title}</Link> : it.title}</h3>
              <p>{it.text}</p>
              {it.href && (
                <Link className="text-link" href={it.href}>
                  Read More About {it.title} <ArrowRight size={14} aria-hidden="true" />
                </Link>
              )}
            </article>
          );
        })}
      </div>
      {showDiagrams && <DiagramLegend />}
    </>
  );
}

/** Treatment options as rows keyed by age band: who it is for on the left, the operation on the right. */
export function AgePath({ items, visuals }: { items: VisualItem[]; visuals: Record<string, ItemVisual> }) {
  return (
    <ol className="age-path">
      {items.map((it) => {
        const v = visuals[it.title];
        return (
          <li key={it.title}>
            <div className="age-when">{v?.tag}</div>
            <div className="age-what">
              {v?.route && (
                <p className="age-route">
                  <ArrowRight size={16} aria-hidden="true" /> {v.route}
                </p>
              )}
              <h3>{it.title}</h3>
              <p>{it.text}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function StepStrip({ steps }: { steps: { title: string; text: string }[] }) {
  return (
    <ol className="step-strip">
      {steps.map((s, i) => (
        <li key={s.title}>
          <span className="step-num" aria-hidden="true">
            {i + 1}
          </span>
          <b>{s.title}</b>
          <span>{s.text}</span>
        </li>
      ))}
    </ol>
  );
}

export function DayLine({ days }: { days: { when: string; text: string }[] }) {
  return (
    <ol className="day-line">
      {days.map((d) => (
        <li key={d.when}>
          <b>{d.when}</b>
          <span>{d.text}</span>
        </li>
      ))}
    </ol>
  );
}

export function CompareSection({ data }: { data: CompareData }) {
  return (
    <section id={data.id}>
      <h2>{data.heading}</h2>
      {data.intro && <p>{data.intro}</p>}
      <div className="compare-wrap">
        <table className="compare-table">
          <thead>
            <tr>
              <td />
              <th scope="col">{data.columns[0]}</th>
              <th scope="col">{data.columns[1]}</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((r) => (
              <tr key={r.label}>
                <th scope="row">{r.label}</th>
                <td>{r.a}</td>
                <td>{r.b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/** One video placed at the end of the section it explains. */
export function SectionVideo({ id }: { id: string }) {
  const v = videoById(id);
  if (!v) return null;
  return (
    <figure className="section-video">
      <Video id={v.id} index={1} title={v.title} />
      <figcaption lang={v.lang}>
        <span className="eyebrow">Watch Dr Vybhav Explain</span>
        {v.title}
      </figcaption>
    </figure>
  );
}
