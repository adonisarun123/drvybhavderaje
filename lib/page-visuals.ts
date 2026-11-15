/**
 * Presentation layer for long service pages (15 Nov 2026): hero facts and video, an "On This Page" menu,
 * diagrams, comparison tables, day-by-day timelines, step strips and videos placed beside the section they
 * explain. A page opts in by having an entry in PAGE_VISUALS; pages without one render exactly as before.
 *
 * RULE: nothing here adds a clinical claim. Every value restates a sentence already on the same page
 * (lib/content.ts, lib/cranio-types.ts), which the doctor has approved. If the page copy changes, change
 * the matching entry here.
 *
 * Review gate: the head-shape diagrams are schematic medical illustrations drawn for this site. They stay
 * hidden until DIAGRAMS_APPROVED is true (docs/CONTENT-APPROVAL.md); preview them with
 * NEXT_PUBLIC_SHOW_DRAFT_SECTIONS=true.
 */
import { COSTS_SECTION_ID, SHOW_DRAFT_SECTIONS } from "./content";
import type { ServiceSlug } from "./routes";

export const DIAGRAMS_APPROVED = false;
export const SHOW_DIAGRAMS = DIAGRAMS_APPROVED || SHOW_DRAFT_SECTIONS;

/** Anchor id for a section heading that has no explicit id. */
export function sectionAnchor(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export type SkullKind = "sagittal" | "metopic" | "unicoronal" | "bicoronal" | "lambdoid" | "multisuture";
export type SectionLayout = "type-grid" | "age-path" | "cards-2";

export interface ItemVisual {
  /** Short label shown above the item title, e.g. the age band or the head shape in plain words. */
  tag?: string;
  /** For age paths: the operation the row leads to. */
  route?: string;
  diagram?: SkullKind;
}

export interface CompareTable {
  /** The table is placed immediately before the section with this heading. */
  before: string;
  id: string;
  heading: string;
  intro?: string;
  columns: [string, string];
  rows: { label: string; a: string; b: string }[];
}

export interface PageVisuals {
  hero?: { facts: { value: string; label: string }[]; videoId?: string; videoCaption?: string };
  toc?: { label: string; id: string }[];
  /** Section heading → layout for its items. */
  layouts?: Record<string, SectionLayout>;
  /** Item title → extra labels / diagram. */
  items?: Record<string, ItemVisual>;
  compare?: CompareTable;
  /** Section heading → day-by-day strip shown above the section's paragraphs. */
  timelines?: Record<string, { when: string; text: string }[]>;
  /** Section heading → numbered steps shown above the section's items. */
  steps?: Record<string, { title: string; text: string }[]>;
  /** Section heading (or "intro") → YouTube id from lib/videos.ts, shown at the end of that section. */
  videos?: Record<string, string>;
}

const KEYHOLE_H = "Keyhole (Endoscopic) Surgery — What to Expect";
const OPEN_H = "Open Remodelling Surgery — What to Expect";
const TRAVEL_H = "Families from Other States and Abroad";

export const PAGE_VISUALS: Partial<Record<ServiceSlug, PageVisuals>> = {
  "craniosynostosis-surgery-bangalore": {
    hero: {
      facts: [
        { value: "Before 6 Months", label: "Age window for keyhole (endoscopic) surgery" },
        { value: "1–2 Hours", label: "Length of the keyhole operation" },
        { value: "Day 3", label: "When most children go home after keyhole surgery" },
      ],
      videoId: "ZLyT5Beiv1Y",
      videoCaption: "Dr Vybhav Deraje gives an overview of Craniosynostosis",
    },
    toc: [
      { label: "Types", id: sectionAnchor("Common Types Explained") },
      { label: "Signs and Symptoms", id: sectionAnchor("Signs and Symptoms") },
      { label: "Diagnosis", id: sectionAnchor("How Craniosynostosis Is Diagnosed") },
      { label: "Treatment by Age", id: sectionAnchor("How Craniosynostosis Is Treated") },
      { label: "Keyhole vs Open Surgery", id: "keyhole-vs-open" },
      { label: "Possible Complications", id: sectionAnchor("Possible Complications") },
      { label: "Costs", id: COSTS_SECTION_ID },
      { label: "Travelling for Treatment", id: "travelling-for-treatment" },
      { label: "Videos", id: "videos" },
      { label: "Questions", id: "faqs" },
    ],
    layouts: {
      "Common Types Explained": "type-grid",
      "How Craniosynostosis Is Treated": "age-path",
      [TRAVEL_H]: "cards-2",
    },
    items: {
      "Unicoronal Synostosis": { tag: "Forehead Flattened on One Side", diagram: "unicoronal" },
      "Metopic Synostosis": { tag: "Triangular Forehead", diagram: "metopic" },
      "Sagittal Synostosis": { tag: "Long, Narrow Head", diagram: "sagittal" },
      "Lambdoid Synostosis": { tag: "Back of the Head Flattened", diagram: "lambdoid" },
      "Bicoronal Synostosis": { tag: "Wide Head, Short Front to Back", diagram: "bicoronal" },
      "Multisuture Synostosis": { tag: "Several Sutures Closed", diagram: "multisuture" },
      "Non-Syndromic Single-Suture Craniosynostosis — Under 6 Months": { tag: "Under 6 Months", route: "Keyhole Surgery, Then Orthotic Helmet Therapy" },
      "Non-Syndromic Single-Suture Craniosynostosis — Over 6 Months": { tag: "Over 6 Months", route: "Open Remodelling Surgery" },
      "Syndromic Craniosynostosis": { tag: "Syndromic", route: "Open Surgery, Often in Stages" },
    },
    compare: {
      before: KEYHOLE_H,
      id: "keyhole-vs-open",
      heading: "Keyhole vs Open Surgery at a Glance",
      intro: "The two operations side by side. The sections below describe each in full.",
      columns: ["Keyhole (Endoscopic) Surgery", "Open Remodelling Surgery"],
      rows: [
        { label: "Age", a: "Under 6 months", b: "Over 6 months" },
        { label: "Operation Time", a: "1–2 hours", b: "Usually 4–5 hours" },
        { label: "Incision", a: "A small cut in the scalp", b: "Across the top of the head, from one ear to the other" },
        { label: "Blood Transfusion", a: "Occasionally needed", b: "Needed by almost all children" },
        { label: "Intensive Care", a: "Overnight", b: "The first night" },
        { label: "Going Home", a: "Usually on the third day", b: "Usually on the sixth or seventh day" },
        { label: "Helmet Afterwards", a: "Yes — Orthotic Helmet Therapy starts after the one-week check", b: "Not needed" },
        { label: "Scar", a: "No major scars", b: "Usually well hidden in the hair" },
      ],
    },
    timelines: {
      [KEYHOLE_H]: [
        { when: "Before", text: "Anaesthetist assessment and eye check" },
        { when: "Day 1", text: "Admission, 1–2 hour operation, ICU overnight" },
        { when: "Day 2", text: "Move to the ward" },
        { when: "Day 3", text: "Dressing removed; home" },
        { when: "Week 1", text: "Check-up; Orthotic Helmet Therapy starts" },
      ],
      [OPEN_H]: [
        { when: "Before", text: "Anaesthetist and eye assessment" },
        { when: "Day 1", text: "Admission, 4–5 hour operation, ICU for the night" },
        { when: "Day 2", text: "Move to the ward" },
        { when: "First Week", text: "Swelling settles; eyes may close for 3–4 days" },
        { when: "Day 6–7", text: "Bandage removed; home" },
      ],
    },
    steps: {
      [TRAVEL_H]: [
        { title: "Send Scans and Photos", text: "WhatsApp or email your child’s photographs, CT images and reports." },
        { title: "Video Consultation", text: "Dr Vybhav explains the diagnosis and the options." },
        { title: "Surgery in Bangalore", text: "Keyhole: home on the third day. Open: 6–7 days in hospital." },
        { title: "Follow-Up from Home", text: "Reviews combine visits to Bangalore with video consultations." },
      ],
    },
    videos: {
      intro: "wlmNfJnAsF0",
      "Common Types Explained": "lc9simqUNOc",
      "How Craniosynostosis Is Diagnosed": "XJAyiI6gsqE",
      "How Craniosynostosis Is Treated": "weHZrxjsNXQ",
      "After Keyhole Surgery: Orthotic Helmet Therapy": "LWBK6NGw1cE",
      "After Open Surgery": "XGRccBW_a08",
      "Possible Complications": "VMJfktkR7-E",
      [TRAVEL_H]: "FO56pD5WxdY",
    },
  },
};

export function visualsFor(slug: ServiceSlug): PageVisuals | undefined {
  return PAGE_VISUALS[slug];
}

/** Ids of every video a page already shows in its hero or beside a section, so the bottom gallery can skip them. */
export function placedVideoIds(v: PageVisuals | undefined): string[] {
  if (!v) return [];
  return [...(v.hero?.videoId ? [v.hero.videoId] : []), ...Object.values(v.videos ?? {})];
}
