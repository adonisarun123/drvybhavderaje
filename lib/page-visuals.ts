/**
 * Presentation layer for long service pages (15 Nov 2026): hero facts and video, an "On This Page" menu,
 * diagrams, comparison tables, day-by-day timelines, step strips and videos placed beside the section they
 * explain. Every service page gets the menu and two-across cards (resolveVisuals); the rest comes from
 * its PAGE_VISUALS entry.
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

  "cleft-lip-and-palate-treatment-bangalore": {
    hero: {
      facts: [
        { value: "3–6 Months", label: "Lip repair, with a one-day hospital stay" },
        { value: "9–12 Months", label: "Palate repair, with 1–2 days in hospital" },
        { value: "Six Stages", label: "Of care, from the first lip repair to adulthood" },
      ],
    },
    layouts: { "Treatment Protocol by Age": "age-path" },
    items: {
      "3–6 Months — Lip Repair": { tag: "3–6 Months" },
      "9–12 Months — Palate Repair": { tag: "9–12 Months" },
      "1–12 Years — Speech Therapy and Speech Surgery": { tag: "1–12 Years" },
      "7–11 Years — Alveolar Bone Grafting with Orthodontics": { tag: "7–11 Years" },
      "16–18 Years — Jaw Surgery with Orthodontics": { tag: "16–18 Years" },
      "Above 18 Years — Rhinoplasty, with Lip Revision If Needed": { tag: "Above 18 Years" },
    },
  },
  "corrective-jaw-surgery-bangalore": {
    hero: {
      facts: [
        { value: "3–4 Days", label: "In hospital, including one day in ICU" },
        { value: "No Skin Scars", label: "All incisions are inside the mouth" },
        { value: "3 Weeks", label: "Soft diet after surgery" },
      ],
    },
    timelines: {
      "Recovery After Jaw Surgery": [
        { when: "First Night", text: "Intensive care, then the ward" },
        { when: "Day 3–4", text: "Home, with rubber bands fitted to the braces" },
        { when: "Week 1", text: "Wound check; stitches are absorbable" },
        { when: "First 3 Weeks", text: "Soft diet and regular mouthwashes" },
        { when: "3–6 Months", text: "Orthodontic treatment continues once healed" },
      ],
    },
  },
  "facial-injuries-and-fracture-treatments": {
    hero: {
      facts: [
        { value: "One-Day Admission", label: "Usual for fracture surgery" },
        { value: "About a Week", label: "Most patients are back to normal" },
        { value: "Plates and Screws", label: "Titanium fixation for displaced fractures" },
      ],
    },
  },
  "head-and-neck-cancer-treatment": {
    hero: {
      facts: [
        { value: "Same Operation", label: "Reconstruction ideally at the time of the cancer surgery" },
        { value: "Skin, Bone, Muscle", label: "Rebuilt with tissue borrowed from elsewhere in the body" },
        { value: "Microsurgery", label: "Using an advanced Leica operating microscope" },
      ],
    },
  },
  "other-craniofacial-conditions-treatments": {
    hero: {
      facts: [
        { value: "Facial Palsy", label: "Best treated early, within one year" },
        { value: "Parry-Romberg", label: "Fat Grafting, usually a day procedure" },
        { value: "Vascular Malformations", label: "Medication, injections, radiology or surgery" },
      ],
    },
  },
  "hand-plastic-surgeon-bangalore": {
    hero: {
      facts: [
        { value: "Day-Care", label: "Carpal tunnel and Trigger Finger release" },
        { value: "Wide Awake", label: "Local anaesthesia, no tourniquet (WALANT)" },
        { value: "Before Age One", label: "Usual timing for Syndactyly release" },
      ],
    },
  },
  "ear-reconstruction-surgery-bangalore": {
    hero: {
      facts: [
        { value: "8–10 Years", label: "Usual age for reconstruction with the child’s own rib cartilage" },
        { value: "Two Stages", label: "The second some months after the first" },
        { value: "Short Stay", label: "Each stage under general anaesthesia" },
      ],
    },
  },
  "helmet-therapy-flat-head-bangalore": {
    hero: {
      facts: [
        { value: "23 Hours a Day", label: "Helmet wear; off for bathing and cleaning" },
        { value: "3–4 Months", label: "Typical wear for positional flattening" },
        { value: "Every 3 Weeks", label: "Orthotist review for adjustments" },
      ],
      videoId: "Jg-2b9CBptM",
      videoCaption: "Does baby Helmet Therapy really work?",
    },
    videos: {
      intro: "1_c2vHCyooM",
      "Who Helmet Therapy Is For": "nVKLtTfg6l4",
      "What Treatment Involves": "LWBK6NGw1cE",
      "Side Effects": "i7GCwB8_txg",
      "Timing Matters": "gNXTng1NyUo",
    },
  },
  "earwell-infant-ear-correction-bangalore": {
    hero: {
      facts: [
        { value: "First 14 Days", label: "When treatment should start" },
        { value: "4–6 Weeks", label: "Worn continuously" },
        { value: "No Surgery", label: "No anaesthesia and no cuts" },
      ],
      videoId: "fkNjDXnABec",
      videoCaption: "The EarWell system for newborns",
    },
  },
  "face-plastic-surgery-bangalore": {
    hero: {
      facts: [
        { value: "Day-Care", label: "Eyelid, chin, ear and Facelift surgery" },
        { value: "One-Day Admission", label: "Rhinoplasty" },
        { value: "Non-Surgical", label: "Botox and fillers, as clinic procedures" },
      ],
    },
  },
  "breast-plastic-surgeon-bangalore": {
    hero: {
      facts: [
        { value: "Day-Care", label: "Augmentation, lift and reduction" },
        { value: "4–5 Days", label: "In hospital for reconstruction after cancer" },
        { value: "Immediate or Delayed", label: "Timing of reconstruction after mastectomy" },
      ],
      videoId: "TQsHf1yvmhA",
      videoCaption: "Dr Vybhav Deraje on the types of breast enhancement",
    },
  },
  "body-plastic-surgeon-bangalore": {
    hero: {
      facts: [
        { value: "3–4 Days", label: "Hospital stay for a Tummy Tuck" },
        { value: "Day-Care", label: "Liposuction, Arm Lift and Thigh Lift" },
        { value: "6 Weeks", label: "Before strenuous exercise after a Tummy Tuck" },
      ],
    },
  },
  "rhinoplasty-surgery-bangalore": {
    hero: {
      facts: [
        { value: "One-Day Admission", label: "Under general anaesthesia" },
        { value: "2–3 Days", label: "Back to normal activities, for most people" },
        { value: "About 1 Week", label: "Nasal splint on the bridge" },
      ],
      videoId: "-y8L5iJrYA4",
      videoCaption: "Dr Vybhav Deraje’s step-by-step guide to Rhinoplasty",
    },
    timelines: {
      Recovery: [
        { when: "Day 2–3", text: "Back to normal activities, for most people" },
        { when: "Week 1", text: "Splint removed" },
        { when: "Week 2", text: "Bruising and swelling settled" },
        { when: "First 6 Weeks", text: "Contact sports avoided" },
        { when: "Up to 1 Year", text: "Nasal tip continues to refine" },
      ],
    },
    videos: {
      "What Rhinoplasty Can Address": "S8sS7iIw2Ww",
      "How the Surgery Is Done": "XJUjJmw7VFg",
      "Risks and Limitations": "Vo-O2uD3L9w",
    },
  },
  "blepharoplasty-eyelid-surgery-bangalore": {
    hero: {
      facts: [
        { value: "Day-Care", label: "Under local anaesthesia" },
        { value: "5–7 Days", label: "Stitches removed, where used" },
        { value: "Within a Week", label: "Back at desk work, for most people" },
      ],
    },
    timelines: {
      "Anaesthesia and Recovery": [
        { when: "Day of Surgery", text: "Day-care, under local anaesthesia" },
        { when: "Day 5–7", text: "Stitches removed, where used" },
        { when: "Within 1 Week", text: "Desk work, for most people" },
        { when: "1–2 Weeks", text: "Bruising and swelling" },
      ],
    },
  },
  "otoplasty-ear-correction-bangalore": {
    hero: {
      facts: [
        { value: "Day-Care", label: "For children and for adults" },
        { value: "From 5–6 Years", label: "When the ear is almost adult size" },
        { value: "Within a Week", label: "Children back at school" },
      ],
    },
    timelines: {
      Recovery: [
        { when: "First Few Days", text: "Padded head bandage" },
        { when: "Within 1 Week", text: "Children back at school" },
        { when: "Several Weeks", text: "Soft headband at night" },
        { when: "First 6 Weeks", text: "Contact sports and swimming avoided" },
      ],
    },
  },
  "chin-augmentation-surgery-bangalore": {
    hero: {
      facts: [
        { value: "Day-Care", label: "Under general anaesthesia" },
        { value: "Within a Week", label: "Back to normal activities" },
        { value: "6–8 Weeks", label: "For the final contour to show" },
      ],
    },
  },
  "facelift-surgery-bangalore": {
    hero: {
      facts: [
        { value: "Day-Care", label: "Under general anaesthesia" },
        { value: "2 Weeks", label: "Most people are comfortable returning to work" },
        { value: "About 4 Weeks", label: "Before strenuous exercise" },
      ],
    },
    timelines: {
      Recovery: [
        { when: "Day 1–2", text: "Light dressing" },
        { when: "Day 2–3", text: "Bruising and swelling at their peak" },
        { when: "2 Weeks", text: "Largely settled; work and social life" },
        { when: "About 4 Weeks", text: "Strenuous exercise" },
        { when: "6–12 Months", text: "Scars fade" },
      ],
    },
  },
  "tummy-tuck-abdominoplasty-bangalore": {
    hero: {
      facts: [
        { value: "3–4 Days", label: "Hospital stay, under general anaesthesia" },
        { value: "About a Week", label: "Back to normal daily activities" },
        { value: "6 Weeks", label: "Compression garment; no strenuous exercise" },
      ],
      videoId: "UnYO_Ovgsgw",
      videoCaption: "What is a Tummy Tuck, and do I need one?",
    },
    timelines: {
      Recovery: [
        { when: "Day 3–4", text: "Home; drains, if used, are out" },
        { when: "About 1 Week", text: "Normal daily activities" },
        { when: "2 Weeks", text: "Desk work" },
        { when: "First 6 Weeks", text: "Compression garment; no strenuous exercise or heavy lifting" },
        { when: "1 Year or More", text: "Scar fades" },
      ],
    },
    videos: {
      "How the Surgery Is Done": "qF1HS2v-rDI",
      Recovery: "RW4msHglIxc",
      "Risks and Limitations": "fdlsFZEABvk",
    },
  },
  "breast-augmentation-surgery-bangalore": {
    hero: {
      facts: [
        { value: "Day-Care", label: "Under general anaesthesia" },
        { value: "Within a Week", label: "Back at desk work, for most women" },
        { value: "4–6 Weeks", label: "Before returning to exercise" },
      ],
      videoId: "TQsHf1yvmhA",
      videoCaption: "Dr Vybhav Deraje on the types of breast enhancement",
    },
    timelines: {
      "Anaesthesia and Recovery": [
        { when: "First Few Days", text: "Discomfort is greatest" },
        { when: "Within 1 Week", text: "Desk work, for most women" },
        { when: "4–6 Weeks", text: "Exercise" },
        { when: "First 6 Weeks", text: "Supportive bra" },
        { when: "About 3 Months", text: "Implants settle into their final position" },
      ],
    },
    videos: {
      "Implant or Fat Transfer?": "_u8mqbhcVmk",
      "Anaesthesia and Recovery": "u2qSJM7CUMo",
      "Combining with a Lift": "dJBV-np6Zvw",
      "Risks and Limitations": "YkQl2c7yWyY",
    },
  },
  "breast-reduction-surgery-bangalore": {
    hero: {
      facts: [
        { value: "Day-Care", label: "Under general anaesthesia" },
        { value: "1–2 Weeks", label: "Back at desk work, for most women" },
        { value: "About 6 Weeks", label: "Supportive bra, day and night" },
      ],
      videoId: "FuGDONriGQY",
      videoCaption: "Common reasons for Breast Reduction",
    },
    timelines: {
      Recovery: [
        { when: "First Few Days", text: "Moderate pain" },
        { when: "1–2 Weeks", text: "Desk work, for most women" },
        { when: "4–6 Weeks", text: "Exercise" },
        { when: "First 6 Weeks", text: "Supportive bra" },
        { when: "1 Year or More", text: "Scars continue to fade" },
      ],
    },
  },
  "gynecomastia-surgery-bangalore": {
    hero: {
      facts: [
        { value: "Day-Care", label: "Under general anaesthesia" },
        { value: "A Few Days", label: "Before desk work is possible" },
        { value: "4–6 Weeks", label: "Compression vest" },
      ],
    },
    timelines: {
      Recovery: [
        { when: "Within a Few Days", text: "Desk work" },
        { when: "2–3 Weeks", text: "Bruising and swelling subside" },
        { when: "About 4 Weeks", text: "Upper-body exercise and chest workouts" },
        { when: "First 4–6 Weeks", text: "Compression vest" },
        { when: "About 3 Months", text: "Final contour" },
      ],
    },
  },
  "liposuction-surgery-bangalore": {
    hero: {
      facts: [
        { value: "Day-Care", label: "Under general anaesthesia" },
        { value: "A Few Days", label: "Before returning to desk work, for most people" },
        { value: "About 3 Months", label: "For the final contour to show" },
      ],
      videoId: "SobEVPMHhx4",
      videoCaption: "The different types of Liposuction explained",
    },
    timelines: {
      Recovery: [
        { when: "Day 1–2", text: "Some fluid may leak from the incisions" },
        { when: "Within a Few Days", text: "Desk work, for most people" },
        { when: "2–4 Weeks", text: "Exercise" },
        { when: "First 4–6 Weeks", text: "Compression garment" },
        { when: "About 3 Months", text: "Final contour" },
      ],
    },
    videos: {
      Recovery: "X_YYg1PX2L0",
      "Risks and Limitations": "hBNKAqF_xwc",
    },
  },
};

/**
 * Visuals for a page: its PAGE_VISUALS entry plus defaults every service page gets — an "On This Page"
 * menu built from its section headings, and item cards two across.
 */
export function resolveVisuals(page: { slug: ServiceSlug; sections: { heading: string; id?: string; items?: unknown[] }[] }, hasVideoGallery: boolean): PageVisuals {
  const v = PAGE_VISUALS[page.slug] ?? {};
  const layouts: Record<string, SectionLayout> = {};
  for (const s of page.sections) if (s.items && s.items.length >= 2 && s.items.length !== 3) layouts[s.heading] = "cards-2";
  const toc = v.toc ?? [
    ...page.sections.map((s) => ({ label: s.heading === "Costs and Estimates" ? "Costs" : s.heading.replace(/\?$/, ""), id: s.id ?? sectionAnchor(s.heading) })),
    ...(hasVideoGallery ? [{ label: "Videos", id: "videos" }] : []),
    { label: "Questions", id: "faqs" },
  ];
  return { ...v, toc, layouts: { ...layouts, ...v.layouts } };
}

/** Ids of every video a page already shows in its hero or beside a section, so the bottom gallery can skip them. */
export function placedVideoIds(v: PageVisuals | undefined): string[] {
  if (!v) return [];
  return [...(v.hero?.videoId ? [v.hero.videoId] : []), ...Object.values(v.videos ?? {})];
}
