/**
 * Procedure costs published on the site — from Dr Vybhav Deraje's own cost sheet
 * ("Dr-Vybhav-Deraje-Procedure-Cost-Sheet", returned 15 Nov 2026 via Arun).
 *
 * RULES (from the sheet)
 * - Figures are in INR for a typical, uncomplicated case. Only rows the doctor marked "Publish: Yes" are here.
 *   Labiaplasty, Hymenoplasty and Vaginoplasty were filled in but left unmarked, so they are NOT published
 *   (enquiry replies only).
 * - "Not included" is the doctor's own column, copied as given. The sheet's "Included" and "What makes it
 *   cost more" columns were left blank, so the site does not list inclusions — the written estimate does.
 * - USD figures are an approximate conversion for overseas patients, not a USD price. Bills are in INR.
 *   Update USD_INR (and FX_DATE) when the rate moves materially; every USD figure on the site follows.
 */
import { servicePath, type ServiceSlug } from "./routes";

/** Indicative conversion rate, mid-market around 15 Nov 2026 (about ₹93.7–94.6 to US$1 that week). */
export const USD_INR = 94;
export const FX_DATE = "15 Nov 2026";
/** Date the cost figures went live — used as the content-modified date of every page that shows them. */
export const COSTS_UPDATED = "2026-11-15";

export type CostCategory = "Consultations" | "Craniosynostosis and Head Shape" | "Cleft Lip and Palate" | "Corrective Jaw Surgery" | "Ear Reconstruction" | "Face — Cosmetic" | "Non-Surgical Treatments" | "Breast and Body — Cosmetic";

export interface CostItem {
  name: string;
  category: CostCategory;
  inrFrom: number;
  /** Omitted when the doctor gave a single "starting from" figure. */
  inrTo?: number;
  /** A set fee rather than a "starting from" figure. */
  fixed?: boolean;
  /** Per-unit pricing (e.g. "unit", "ml"). */
  per?: string;
  notIncluded?: string[];
  /** Extra billing note shown with the figure. */
  note?: string;
  /** Pages that show this figure. The first is the procedure's own page (linked from the cost page). */
  paths: string[];
}

const S = (slug: ServiceSlug) => servicePath(slug);
const sub = (parent: ServiceSlug, slug: string) => `${servicePath(parent)}/${slug}`;

const CRANIO = S("craniosynostosis-surgery-bangalore");
const CRANIO_SINGLE = ["sagittal-synostosis", "metopic-synostosis", "unicoronal-synostosis", "bicoronal-synostosis", "lambdoid-synostosis"].map((t) => sub("craniosynostosis-surgery-bangalore", t));
const CRANIO_MULTI = sub("craniosynostosis-surgery-bangalore", "multisuture-syndromic-craniosynostosis");
const CLEFT = S("cleft-lip-and-palate-treatment-bangalore");
const JAW = S("corrective-jaw-surgery-bangalore");
const FACE = S("face-plastic-surgery-bangalore");
const BREAST = S("breast-plastic-surgeon-bangalore");
const BODY = S("body-plastic-surgeon-bangalore");

const STD = ["pre-operative tests", "medicines after discharge"];
const PLANNING = [...STD, "virtual surgical planning", "3D models", "orthodontic braces"];
const GARMENTS = [...STD, "compression garments"];

export const COST_ITEMS: CostItem[] = [
  // Consultations
  { name: "In-Clinic Consultation", category: "Consultations", inrFrom: 1200, fixed: true, paths: [] },
  { name: "Video Consultation — Patients in India", category: "Consultations", inrFrom: 1200, fixed: true, paths: [] },
  { name: "Video Consultation — Overseas Patients", category: "Consultations", inrFrom: 1200, fixed: true, paths: [] },

  // Craniosynostosis and head shape
  { name: "Endoscope-Assisted (Keyhole) Craniosynostosis Surgery", category: "Craniosynostosis and Head Shape", inrFrom: 450000, inrTo: 700000, notIncluded: STD, paths: [CRANIO, ...CRANIO_SINGLE] },
  { name: "Orthotic Helmet Therapy After Keyhole Surgery", category: "Craniosynostosis and Head Shape", inrFrom: 147000, notIncluded: STD, paths: [CRANIO, ...CRANIO_SINGLE] },
  { name: "Open Surgery — Cranial Vault Remodelling", category: "Craniosynostosis and Head Shape", inrFrom: 600000, inrTo: 1200000, notIncluded: STD, paths: [CRANIO, ...CRANIO_SINGLE] },
  { name: "Open Surgery — Fronto-Orbital Advancement and Remodelling", category: "Craniosynostosis and Head Shape", inrFrom: 600000, inrTo: 1200000, notIncluded: STD, paths: [CRANIO, ...CRANIO_SINGLE] },
  { name: "Syndromic / Multisuture Craniosynostosis (Per Stage)", category: "Craniosynostosis and Head Shape", inrFrom: 600000, inrTo: 1200000, notIncluded: STD, paths: [CRANIO_MULTI, CRANIO] },
  { name: "Helmet Therapy for Flat Head Syndrome", category: "Craniosynostosis and Head Shape", inrFrom: 136500, inrTo: 147000, note: `Follow-up visits and helmet adjustments are charged at ₹2,500 per visit (about ${formatUsd(toUsd(2500))})`, paths: [S("helmet-therapy-flat-head-bangalore")] },
  { name: "EarWell Infant Ear Correction", category: "Craniosynostosis and Head Shape", inrFrom: 60000, paths: [S("earwell-infant-ear-correction-bangalore")] },

  // Cleft
  { name: "Cleft Lip Repair", category: "Cleft Lip and Palate", inrFrom: 150000, inrTo: 200000, notIncluded: STD, paths: [sub("cleft-lip-and-palate-treatment-bangalore", "cleft-lip-repair"), CLEFT] },
  { name: "Cleft Palate Repair", category: "Cleft Lip and Palate", inrFrom: 175000, inrTo: 250000, notIncluded: STD, paths: [sub("cleft-lip-and-palate-treatment-bangalore", "cleft-palate-repair"), CLEFT] },
  { name: "Speech Surgery", category: "Cleft Lip and Palate", inrFrom: 150000, inrTo: 250000, notIncluded: STD, paths: [sub("cleft-lip-and-palate-treatment-bangalore", "speech-surgery"), CLEFT] },
  { name: "Alveolar Bone Grafting", category: "Cleft Lip and Palate", inrFrom: 150000, inrTo: 250000, notIncluded: STD, paths: [sub("cleft-lip-and-palate-treatment-bangalore", "alveolar-bone-grafting"), CLEFT] },
  { name: "Cleft Rhinoplasty", category: "Cleft Lip and Palate", inrFrom: 175000, inrTo: 250000, notIncluded: STD, paths: [sub("cleft-lip-and-palate-treatment-bangalore", "cleft-rhinoplasty"), CLEFT] },
  { name: "Jaw Surgery After Cleft", category: "Cleft Lip and Palate", inrFrom: 300000, inrTo: 400000, notIncluded: PLANNING, paths: [sub("cleft-lip-and-palate-treatment-bangalore", "cleft-jaw-surgery"), CLEFT] },

  // Jaw
  { name: "Single-Jaw Surgery", category: "Corrective Jaw Surgery", inrFrom: 250000, inrTo: 350000, notIncluded: PLANNING, paths: [JAW] },
  { name: "Double-Jaw Surgery", category: "Corrective Jaw Surgery", inrFrom: 300000, inrTo: 400000, notIncluded: PLANNING, paths: [JAW] },
  { name: "Genioplasty With Jaw Surgery (Add-On)", category: "Corrective Jaw Surgery", inrFrom: 125000, inrTo: 175000, notIncluded: PLANNING, paths: [JAW] },

  // Ear
  { name: "Ear Reconstruction for Microtia — Stage 1", category: "Ear Reconstruction", inrFrom: 400000, inrTo: 500000, notIncluded: STD, paths: [S("ear-reconstruction-surgery-bangalore")] },
  { name: "Ear Reconstruction for Microtia — Stage 2", category: "Ear Reconstruction", inrFrom: 100000, inrTo: 150000, notIncluded: STD, paths: [S("ear-reconstruction-surgery-bangalore")] },

  // Face — cosmetic
  { name: "Rhinoplasty", category: "Face — Cosmetic", inrFrom: 150000, inrTo: 200000, notIncluded: STD, paths: [S("rhinoplasty-surgery-bangalore"), FACE] },
  { name: "Revision Rhinoplasty", category: "Face — Cosmetic", inrFrom: 175000, inrTo: 250000, notIncluded: STD, paths: [S("rhinoplasty-surgery-bangalore"), FACE] },
  { name: "Upper Blepharoplasty", category: "Face — Cosmetic", inrFrom: 50000, inrTo: 70000, notIncluded: STD, paths: [S("blepharoplasty-eyelid-surgery-bangalore"), FACE] },
  { name: "Lower Blepharoplasty", category: "Face — Cosmetic", inrFrom: 70000, inrTo: 90000, notIncluded: STD, paths: [S("blepharoplasty-eyelid-surgery-bangalore"), FACE] },
  { name: "Asian Blepharoplasty", category: "Face — Cosmetic", inrFrom: 45000, inrTo: 60000, notIncluded: STD, paths: [S("blepharoplasty-eyelid-surgery-bangalore"), FACE] },
  { name: "Otoplasty (Prominent Ear Correction)", category: "Face — Cosmetic", inrFrom: 50000, inrTo: 100000, notIncluded: STD, paths: [S("otoplasty-ear-correction-bangalore"), FACE] },
  { name: "Chin Implant", category: "Face — Cosmetic", inrFrom: 125000, inrTo: 150000, notIncluded: STD, paths: [S("chin-augmentation-surgery-bangalore"), FACE] },
  { name: "Sliding Genioplasty", category: "Face — Cosmetic", inrFrom: 125000, inrTo: 175000, notIncluded: PLANNING, paths: [S("chin-augmentation-surgery-bangalore"), FACE] },
  { name: "Facelift and Neck Lift", category: "Face — Cosmetic", inrFrom: 400000, inrTo: 500000, notIncluded: GARMENTS, paths: [S("facelift-surgery-bangalore"), FACE] },
  { name: "Fat Grafting to the Face", category: "Face — Cosmetic", inrFrom: 60000, inrTo: 125000, notIncluded: STD, paths: [sub("face-plastic-surgery-bangalore", "fat-grafting"), FACE] },
  { name: "Lip Reduction — One Lip", category: "Face — Cosmetic", inrFrom: 25000, inrTo: 35000, notIncluded: STD, paths: [FACE] },
  { name: "Lip Reduction — Both Lips", category: "Face — Cosmetic", inrFrom: 35000, inrTo: 45000, notIncluded: STD, paths: [FACE] },
  { name: "Dimple Creation", category: "Face — Cosmetic", inrFrom: 30000, inrTo: 40000, notIncluded: STD, paths: [FACE] },
  { name: "Ear Lobe Repair — One Side", category: "Face — Cosmetic", inrFrom: 15000, inrTo: 20000, notIncluded: STD, paths: [FACE] },
  { name: "Ear Lobe Repair — Both Sides", category: "Face — Cosmetic", inrFrom: 25000, inrTo: 30000, notIncluded: STD, paths: [FACE] },

  // Non-surgical
  { name: "Botox", category: "Non-Surgical Treatments", inrFrom: 500, per: "unit", paths: [FACE] },
  { name: "Fillers", category: "Non-Surgical Treatments", inrFrom: 30000, per: "ml", paths: [FACE] },
  { name: "Liquid Rhinoplasty", category: "Non-Surgical Treatments", inrFrom: 30000, per: "ml", paths: [FACE] },
  { name: "Skin Boosters", category: "Non-Surgical Treatments", inrFrom: 20000, per: "ml", paths: [FACE] },
  { name: "Thread Lift", category: "Non-Surgical Treatments", inrFrom: 60000, inrTo: 80000, paths: [FACE] },

  // Breast and body
  { name: "Breast Augmentation — Silicone Implants", category: "Breast and Body — Cosmetic", inrFrom: 175000, inrTo: 200000, notIncluded: GARMENTS, paths: [S("breast-augmentation-surgery-bangalore"), BREAST] },
  { name: "Breast Augmentation — Fat Transfer", category: "Breast and Body — Cosmetic", inrFrom: 150000, inrTo: 175000, notIncluded: GARMENTS, paths: [S("breast-augmentation-surgery-bangalore"), BREAST] },
  { name: "Breast Reduction", category: "Breast and Body — Cosmetic", inrFrom: 150000, inrTo: 250000, notIncluded: GARMENTS, paths: [S("breast-reduction-surgery-bangalore"), BREAST] },
  { name: "Breast Lift (Mastopexy)", category: "Breast and Body — Cosmetic", inrFrom: 150000, inrTo: 250000, notIncluded: GARMENTS, paths: [sub("breast-plastic-surgeon-bangalore", "breast-lift-mastopexy"), BREAST] },
  { name: "Gynaecomastia Surgery", category: "Breast and Body — Cosmetic", inrFrom: 60000, inrTo: 100000, notIncluded: GARMENTS, paths: [S("gynecomastia-surgery-bangalore"), BREAST] },
  { name: "Tummy Tuck (Abdominoplasty)", category: "Breast and Body — Cosmetic", inrFrom: 350000, inrTo: 450000, notIncluded: GARMENTS, paths: [S("tummy-tuck-abdominoplasty-bangalore"), BODY] },
  { name: "Liposuction — One Area", category: "Breast and Body — Cosmetic", inrFrom: 80000, inrTo: 150000, notIncluded: GARMENTS, paths: [S("liposuction-surgery-bangalore"), BODY] },
  { name: "Liposuction — Each Additional Area", category: "Breast and Body — Cosmetic", inrFrom: 60000, inrTo: 100000, notIncluded: GARMENTS, paths: [S("liposuction-surgery-bangalore"), BODY] },
  { name: "Arm Lift (Brachioplasty)", category: "Breast and Body — Cosmetic", inrFrom: 125000, inrTo: 175000, notIncluded: GARMENTS, paths: [sub("body-plastic-surgeon-bangalore", "arm-lift-brachioplasty"), BODY] },
  { name: "Thigh Lift (Thighplasty)", category: "Breast and Body — Cosmetic", inrFrom: 150000, inrTo: 200000, notIncluded: GARMENTS, paths: [sub("body-plastic-surgeon-bangalore", "thigh-lift-thighplasty"), BODY] },
];

export const COST_CATEGORIES: CostCategory[] = [...new Set(COST_ITEMS.map((c) => c.category))];

/* ---- Formatting ---------------------------------------------------------------------------------- */

/** ₹ with Indian digit grouping (₹4,50,000). */
export function formatInr(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

/** Approximate USD, rounded so the figure never looks more precise than a conversion can be. */
export function toUsd(inr: number): number {
  const usd = inr / USD_INR;
  const step = usd < 100 ? 1 : usd < 1000 ? 10 : usd < 10000 ? 50 : 100;
  return Math.max(1, Math.round(usd / step) * step);
}

export function formatUsd(n: number): string {
  return `US$${n.toLocaleString("en-US")}`;
}

function range(from: string, to: string | undefined, per?: string, fixed = false): string {
  const base = to ? `${from} – ${to}` : fixed || per ? from : `from ${from}`;
  return per ? `${base} per ${per}` : base;
}

export const inrRange = (c: CostItem) => range(formatInr(c.inrFrom), c.inrTo ? formatInr(c.inrTo) : undefined, c.per, c.fixed);
export const usdRange = (c: CostItem) => range(formatUsd(toUsd(c.inrFrom)), c.inrTo ? formatUsd(toUsd(c.inrTo)) : undefined, c.per, c.fixed);
/** "₹1,50,000 – ₹2,00,000 (about US$1,600 – US$2,150)" */
export const bothRanges = (c: CostItem) => {
  const inr = inrRange(c);
  const usd = usdRange(c);
  return inr.startsWith("from ") ? `${inr} (about ${usd.replace(/^from /, "")})` : `${inr} (about ${usd})`;
};

/** "pre-operative tests, medicines after discharge and compression garments" */
export function joinList(items: string[]): string {
  return items.length < 2 ? (items[0] ?? "") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}

export const FX_NOTE = `US dollar figures are approximate, converted at ₹${USD_INR} to US$1 (${FX_DATE}). Bills are raised in Indian rupees, so the amount in your own currency depends on the exchange rate on the day you pay.`;
export const TYPICAL_NOTE = "Typical costs for an uncomplicated case, as set by Dr Vybhav Deraje. Your individual estimate is confirmed after assessment and depends on the hospital, the length of stay and the complexity of the case.";

/* ---- Lookup -------------------------------------------------------------------------------------- */

export function costsForPath(path: string): CostItem[] {
  return COST_ITEMS.filter((c) => c.paths.includes(path));
}

export const COST_PATHS: ReadonlySet<string> = new Set(COST_ITEMS.flatMap((c) => c.paths));

/** The "Not included" items shared by every figure in the list (deduplicated, in first-seen order). */
export function notIncludedFor(items: CostItem[]): string[] {
  return [...new Set(items.flatMap((c) => c.notIncluded ?? []))];
}

/** Plain-text cost section body — used for the page copy, the FAQ answer and llms-full.txt. */
export function costSentences(items: CostItem[]): string[] {
  const excluded = notIncludedFor(items);
  const notes = items.filter((c) => c.note).map((c) => `${c.name}: ${c.note!.charAt(0).toLowerCase()}${c.note!.slice(1)}.`);
  const varies = items.some((c) => (c.notIncluded ?? []).join() !== (items[0]?.notIncluded ?? []).join());
  return [TYPICAL_NOTE, ...(excluded.length ? [`Not included${varies ? ", depending on the procedure" : ""}: ${joinList(excluded)}.`] : []), ...notes, FX_NOTE];
}

export function costFaqAnswer(items: CostItem[]): string {
  const list = items.map((c) => `${c.name} ${bothRanges(c)}`).join("; ");
  const excluded = notIncludedFor(items);
  const varies = items.some((c) => (c.notIncluded ?? []).join() !== (items[0]?.notIncluded ?? []).join());
  return `Typical cost for an uncomplicated case: ${list}.${excluded.length ? ` Not included${varies ? ", depending on the procedure" : ""}: ${joinList(excluded)}.` : ""} The clinic confirms an individual estimate after assessment; overseas patients can start with a video consultation (${formatInr(1200)}, about ${formatUsd(toUsd(1200))}). Bills are in Indian rupees.`;
}

/** Lowest and highest published figure, for `priceRange` on the practice and clinics. */
export function priceRangeLabel(): string {
  const all = COST_ITEMS.filter((c) => !c.per).flatMap((c) => [c.inrFrom, c.inrTo ?? c.inrFrom]);
  const lo = Math.min(...all);
  const hi = Math.max(...all);
  return `${formatInr(lo)} – ${formatInr(hi)} (about ${formatUsd(toUsd(lo))} – ${formatUsd(toUsd(hi))})`;
}
