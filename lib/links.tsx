/**
 * Internal link graph.
 *
 * 1. TERM_LINKS — phrases in body copy that point at a page. `autolink()` turns the first mention of
 *    each target on a page into a contextual <Link>, which is the strongest internal-link signal
 *    Google has (anchor text inside a paragraph, surrounded by relevant copy) and the clearest
 *    entity signal for answer engines. Rules keep it from looking spammy: one link per target per
 *    page, at most MAX_PER_BLOCK links in any one paragraph, never the page you are on, never
 *    inside headings.
 * 2. relatedServices() — the "Related Care" grid: the editor's picks plus parent, siblings and the
 *    rest of the group, so every service page reaches every other page of its group within one
 *    click and every hub page reaches its children.
 *
 * All targets are ROUTES / servicePath() constants — never hard-coded paths.
 */
import Link from "next/link";
import type { ReactNode } from "react";
import { FEATURED_SERVICES, getService, SERVICE_PAGES, type ServicePage } from "./content";
import { ROUTES, servicePath, type ServiceSlug } from "./routes";

interface TermLink {
  href: string;
  phrases: string[];
}

const svc = (slug: ServiceSlug, ...phrases: string[]): TermLink => ({ href: servicePath(slug), phrases });

/** Longer phrases always win over shorter ones that they contain (sorted at build time). */
export const TERM_LINKS: TermLink[] = [
  // Craniofacial
  svc("craniosynostosis-surgery-bangalore", "craniosynostosis", "endoscopic strip craniectomy", "strip craniectomy", "helmet therapy", "fronto-orbital advancement", "cranial vault remodelling"),
  svc("cleft-lip-and-palate-treatment-bangalore", "cleft lip and palate", "cleft lip and/or palate", "cleft lip", "cleft palate", "alveolar bone graft", "cleft rhinoplasty"),
  svc("corrective-jaw-surgery-bangalore", "orthognathic surgery", "orthognathic (jaw) surgery", "corrective jaw surgery", "jaw surgery", "jaw deformities", "jaw correction", "jaw deformity"),
  svc("ear-reconstruction-surgery-bangalore", "ear reconstruction", "microtia"),
  // Cosmetic
  svc("rhinoplasty-surgery-bangalore", "rhinoplasty", "septorhinoplasty", "nose surgery", "nose job", "nose reshaping"),
  svc("blepharoplasty-eyelid-surgery-bangalore", "blepharoplasty", "eyelid surgery", "eyelid lift"),
  svc("otoplasty-ear-correction-bangalore", "otoplasty", "prominent ears", "ear correction", "ear pinning", "bat ears"),
  svc("chin-augmentation-surgery-bangalore", "chin augmentation", "genioplasty", "chin implant", "chin surgery"),
  svc("facelift-surgery-bangalore", "facelift", "face lift", "neck lift", "rhytidectomy"),
  svc("tummy-tuck-abdominoplasty-bangalore", "tummy tuck", "abdominoplasty"),
  svc("breast-augmentation-surgery-bangalore", "breast augmentation", "breast implants", "breast enlargement"),
  svc("breast-reduction-surgery-bangalore", "breast reduction", "reduction mammoplasty"),
  svc("gynecomastia-surgery-bangalore", "gynecomastia", "gynaecomastia", "male breast reduction"),
  svc("liposuction-surgery-bangalore", "liposuction"),
  svc("helmet-therapy-flat-head-bangalore", "helmet therapy", "cranial helmet", "flat head syndrome", "positional plagiocephaly", "positional brachycephaly", "deformational plagiocephaly"),
  svc("earwell-infant-ear-correction-bangalore", "EarWell", "Ear Well", "ear moulding", "infant ear moulding", "newborn ear moulding"),
  // Reconstructive and overview pages
  svc("facial-injuries-and-fracture-treatments", "facial fractures", "facial fracture", "facial injuries", "facial injury", "facial trauma", "craniofacial trauma", "maxillofacial trauma"),
  svc("head-and-neck-cancer-treatment", "head and neck cancer", "head and neck tumours", "head and neck tumour", "head and neck tumors", "oral cancer"),
  svc("other-craniofacial-conditions-treatments", "facial palsy", "vascular anomalies", "vascular anomaly", "craniofacial anomalies", "craniofacial conditions", "craniofacial anomaly"),
  svc("hand-plastic-surgeon-bangalore", "hand surgery", "hand injuries", "hand injury"),
  svc("face-plastic-surgery-bangalore", "facial plastic surgery", "facial cosmetic surgery", "cosmetic surgery of the face"),
  svc("breast-plastic-surgeon-bangalore", "breast reconstruction", "breast cancer reconstruction", "breast plastic surgery"),
  svc("body-plastic-surgeon-bangalore", "body contouring", "body plastic surgery"),
  // Practice pages
  { href: ROUTES.about, phrases: ["Dr Vybhav Deraje"] },
  { href: ROUTES.locations, phrases: ["Aesthetica Veda", "Aster Whitefield Hospital", "Aster Hospital Whitefield", "Aster Hospital, Whitefield", "Gifted Hands Hospital", "Aarogya Hastha Hospital", "Medicover Hospital", "Apollo Spectra Hospital"] },
  { href: ROUTES.contact, phrases: ["video consultation", "video consultations", "book an appointment", "enquiry form"] },
  { href: ROUTES.procedures, phrases: ["all procedures", "conditions and procedures", "full range of procedures"] },
  { href: ROUTES.resources, phrases: ["first consultation", "first appointment", "patient information sheet", "patient information sheets"] },
];

const MAX_PER_BLOCK = 3;

const PHRASE_TO_HREF = new Map<string, string>();
for (const t of TERM_LINKS) for (const p of t.phrases) PHRASE_TO_HREF.set(p.toLowerCase(), t.href);

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
const PHRASES = [...PHRASE_TO_HREF.keys()].sort((a, b) => b.length - a.length);
// Word-bounded, case-insensitive, optional plural "s". Built once; `g` flag → always re-created via lastIndex=0.
const PATTERN = new RegExp(`\\b(${PHRASES.map(escape).join("|")})(s?)\\b`, "gi");

/** Per-page state: which targets have already been linked, and the page itself (never self-link). */
export interface LinkBudget {
  self: string;
  used: Set<string>;
}

export function createLinkBudget(selfPath: string, preUsed: string[] = []): LinkBudget {
  return { self: selfPath, used: new Set(preUsed) };
}

/** Link the first mention of each target in `text`. Returns the text unchanged (as a string) when nothing links. */
export function autolink(text: string, budget: LinkBudget): ReactNode {
  const out: ReactNode[] = [];
  let last = 0;
  let count = 0;
  PATTERN.lastIndex = 0;
  for (let m = PATTERN.exec(text); m && count < MAX_PER_BLOCK; m = PATTERN.exec(text)) {
    const href = PHRASE_TO_HREF.get((m[1] ?? "").toLowerCase());
    if (!href || href === budget.self || budget.used.has(href)) continue;
    budget.used.add(href);
    count += 1;
    out.push(text.slice(last, m.index));
    out.push(
      <Link key={`${href}-${m.index}`} href={href}>
        {m[0]}
      </Link>,
    );
    last = m.index + m[0].length;
  }
  if (out.length === 0) return text;
  out.push(text.slice(last));
  return out;
}

/** The page a short label (e.g. a testimonial topic) is about, if any. */
export function linkTargetFor(label: string): string | undefined {
  PATTERN.lastIndex = 0;
  const m = PATTERN.exec(label);
  return m ? PHRASE_TO_HREF.get((m[1] ?? "").toLowerCase()) : undefined;
}

/**
 * Related pages for the "Related Care" grid: editor's picks → parent hub → sibling procedures of the
 * same hub → other pages of the same group → the rest. Never the page itself; capped at `max`.
 */
export function relatedServices(page: ServicePage, max = 6): ServicePage[] {
  const seen = new Set<string>([page.slug]);
  const out: ServicePage[] = [];
  const add = (p: ServicePage | undefined) => {
    if (p && !seen.has(p.slug) && out.length < max) {
      seen.add(p.slug);
      out.push(p);
    }
  };
  for (const slug of page.related) add(getService(slug));
  if (page.parent) add(getService(page.parent));
  for (const p of FEATURED_SERVICES) if (page.parent && p.parent === page.parent) add(p);
  for (const p of SERVICE_PAGES) if (p.parent === page.slug) add(p);
  for (const p of FEATURED_SERVICES) if (p.group === page.group) add(p);
  for (const p of SERVICE_PAGES) if (p.group === page.group) add(p);
  return out;
}
