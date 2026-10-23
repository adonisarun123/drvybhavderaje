/**
 * Video library — doctor's review, 23 Oct 2026: "more videos on appropriate pages", picked from the three
 * YouTube channels: Dr Vybhav Deraje, The Head Shape Clinic and Aesthetica Veda (listed 23 Oct 2026).
 *
 * Only videos presented by Dr Vybhav Deraje or by The Head Shape Clinic team are used, plus the Aesthetica Veda
 * clinic walkthroughs on the locations page. Other Aesthetica Veda doctors' videos (dentistry, dermatology) and
 * off-topic videos (careers, news, celebrity commentary) are left out. Titles are the YouTube titles, lightly
 * edited for clarity (channel suffix removed, type of craniosynostosis named). Each video is tagged with the pages it belongs on; a page shows its own videos only.
 */
import type { ServiceSlug } from "./routes";

export type VideoChannel = "drvybhavderaje" | "theheadshapeclinic" | "aestheticaveda";
/** Pages that can carry videos: service pages, the craniosynostosis type pages and a few site pages. */
export type VideoPage = ServiceSlug | `cranio:${string}` | "home" | "about" | "locations" | "resources";

export interface Video {
  id: string;
  title: string;
  channel: VideoChannel;
  /** BCP-47 language when not English. */
  lang?: "kn" | "hi";
  pages: VideoPage[];
}

export const CHANNELS: Record<VideoChannel, { name: string; url: string }> = {
  drvybhavderaje: { name: "Dr Vybhav Deraje", url: "https://www.youtube.com/@drvybhavderaje" },
  theheadshapeclinic: { name: "The Head Shape Clinic", url: "https://www.youtube.com/@theheadshapeclinic" },
  aestheticaveda: { name: "Aesthetica Veda", url: "https://www.youtube.com/@aestheticaveda" },
};

const C = "craniosynostosis-surgery-bangalore" as const;
const H = "helmet-therapy-flat-head-bangalore" as const;
const R = "rhinoplasty-surgery-bangalore" as const;
const BA = "breast-augmentation-surgery-bangalore" as const;
const BR = "breast-reduction-surgery-bangalore" as const;
const BREAST = "breast-plastic-surgeon-bangalore" as const;
const LIPO = "liposuction-surgery-bangalore" as const;
const TT = "tummy-tuck-abdominoplasty-bangalore" as const;
const BODY = "body-plastic-surgeon-bangalore" as const;
const FACE = "face-plastic-surgery-bangalore" as const;
const DR: VideoChannel = "drvybhavderaje";
const HSC: VideoChannel = "theheadshapeclinic";
const AV: VideoChannel = "aestheticaveda";

export const VIDEO_LIBRARY: Video[] = [
  // ---- Craniosynostosis: overview, diagnosis, timing, team ----
  { id: "wlmNfJnAsF0", title: "What is craniosynostosis? Cause and features", channel: DR, pages: [C, "home"] },
  { id: "ZLyT5Beiv1Y", title: "Craniosynostosis — an overview", channel: DR, pages: [C] },
  { id: "lc9simqUNOc", title: "What are the different types of craniosynostosis?", channel: DR, pages: [C] },
  { id: "XJAyiI6gsqE", title: "Craniosynostosis diagnosis: the key tests explained", channel: DR, pages: [C] },
  { id: "weHZrxjsNXQ", title: "The right age for craniosynostosis surgery", channel: DR, pages: [C, "home"] },
  { id: "Clr3b0qk5pM", title: "When is it too late to treat craniosynostosis?", channel: DR, pages: [C] },
  { id: "5TqV-bJpf40", title: "Benefits of craniosynostosis surgery", channel: DR, pages: [C] },
  { id: "WEoOOLJGKso", title: "Can kids with craniosynostosis live a normal life?", channel: DR, pages: [C, "home"] },
  { id: "R4rfVnytJ_g", title: "How do we know if the pressure in the brain is high in craniosynostosis?", channel: DR, pages: [C] },
  { id: "m_xrsoc2d1k", title: "My child's head circumference is low — what to do?", channel: DR, pages: [C] },
  { id: "nVKLtTfg6l4", title: "Flat head due to position vs craniosynostosis", channel: DR, pages: [C, H] },
  { id: "gNXTng1NyUo", title: "Baby head shape problems? Here's when to seek help", channel: HSC, pages: [C, H] },
  { id: "wqEpTi3QQc4", title: "Craniosynostosis surgery in India: what a hospital needs", channel: DR, pages: [C] },
  { id: "--UJyvmZ2OA", title: "The role of a neurosurgeon in craniosynostosis surgery", channel: DR, pages: [C] },
  { id: "SHIuWsaQoSU", title: "Role of the neurosurgeon in craniosynostosis treatment", channel: DR, pages: [C] },
  { id: "rZ_yUb9yCLg", title: "Role of the anaesthetist in craniosynostosis surgery", channel: DR, pages: [C] },
  { id: "VMJfktkR7-E", title: "Understanding the risks: complications in craniosynostosis surgery", channel: DR, pages: [C] },
  { id: "XGRccBW_a08", title: "Craniosynostosis: follow-up and healing after surgery", channel: DR, pages: [C] },
  { id: "sHD-1ZxBEC4", title: "Is helmet therapy needed after every craniosynostosis surgery?", channel: DR, pages: [C, H] },
  { id: "NTgIbaV4noM", title: "What is the role of springs in craniosynostosis?", channel: HSC, pages: [C, "cranio:sagittal"] },
  { id: "FO56pD5WxdY", title: "Travelling to India for your child's treatment? How The Head Shape Clinic supports you", channel: HSC, pages: [C, H] },
  // ---- Craniosynostosis types ----
  { id: "7qvNuxDlZuU", title: "Treatment for a long and narrow head in babies (sagittal synostosis) — endoscopic strip craniectomy", channel: DR, pages: [C, "cranio:sagittal"] },
  { id: "loJteO1FYYg", title: "Sagittal synostosis — symptoms, diagnosis and treatment (Kannada)", channel: HSC, lang: "kn", pages: ["cranio:sagittal"] },
  { id: "QB3tGbFfCKI", title: "Treatment for a triangular forehead in babies (metopic synostosis) — endoscopic strip craniectomy", channel: DR, pages: [C, "cranio:metopic"] },
  { id: "UTr1nQQjBWs", title: "What is metopic craniosynostosis? How is it diagnosed and treated?", channel: DR, pages: ["cranio:metopic"] },
  { id: "VI8RFHZSmTY", title: "Metopic synostosis vs metopic ridge — what is the difference?", channel: DR, pages: ["cranio:metopic"] },
  { id: "1ml6oaG7QJs", title: "Metopic synostosis explained — causes, risks and treatment (Kannada)", channel: HSC, lang: "kn", pages: ["cranio:metopic"] },
  { id: "yhiwXMttkYI", title: "Treatment for a twisted or slanted head in babies (unicoronal synostosis) — endoscopic strip craniectomy", channel: DR, pages: [C, "cranio:unicoronal"] },
  { id: "R2l7XodKksM", title: "What is unicoronal synostosis? Signs every parent should know (Kannada)", channel: HSC, lang: "kn", pages: ["cranio:unicoronal"] },
  { id: "Z8ptN8va1Qs", title: "What is Mercedes Benz craniosynostosis?", channel: DR, pages: ["cranio:multi-suture", "cranio:lambdoid"] },
  { id: "yaVtfK26oDQ", title: "Syndromic craniosynostosis: why several operations are needed", channel: DR, pages: [C, "cranio:multi-suture"] },
  { id: "iTyq8cdtfDg", title: "What is frontosphenoidal craniosynostosis? Causes and treatment", channel: DR, pages: ["cranio:unicoronal"] },
  { id: "aXQAFB4vM98", title: "Frontosphenoidal craniosynostosis explained — diagnosis and treatment", channel: HSC, pages: ["cranio:unicoronal"] },
  // ---- Helmet therapy and flat head ----
  { id: "1_c2vHCyooM", title: "Understanding flat head syndrome in babies", channel: DR, pages: [H] },
  { id: "yh34uiZAZSg", title: "Positional (deformational) plagiocephaly", channel: DR, pages: [H] },
  { id: "vpleZNYfT_I", title: "Plagiocephaly vs asymmetric brachycephaly — what's the difference?", channel: HSC, pages: [H] },
  { id: "Jg-2b9CBptM", title: "Does baby helmet therapy really work?", channel: HSC, pages: [H, "home"] },
  { id: "LWBK6NGw1cE", title: "The baby helmet therapy process for craniosynostosis", channel: DR, pages: [H, C] },
  { id: "i7GCwB8_txg", title: "Are there any side effects of helmet therapy?", channel: DR, pages: [H] },
  { id: "9P7jPSsMHGU", title: "Do head-shaping pillows really work? A craniofacial surgeon explains", channel: HSC, pages: [H] },
  { id: "WiibNlIhdnU", title: "4 natural ways to fix a baby's flat head (Kannada)", channel: HSC, lang: "kn", pages: [H] },
  { id: "AFqg_mEygFY", title: "Can a mustard pillow be used for a flat head? (Kannada)", channel: DR, lang: "kn", pages: [H] },
  { id: "urYvGlYsK2I", title: "What is the cephalic index? Understanding your baby's head shape (Kannada)", channel: HSC, lang: "kn", pages: [H] },
  { id: "ijwpdm8d0fU", title: "Who is the right candidate for helmet therapy? (Hindi)", channel: DR, lang: "hi", pages: [H] },
  { id: "MNIIZ1jjnKE", title: "What is a STARband helmet and how does it work in craniosynostosis? (Hindi)", channel: HSC, lang: "hi", pages: [H] },
  { id: "rNREU63CZ9I", title: "Baby sweating in the helmet? Here's what to do (Hindi)", channel: HSC, lang: "hi", pages: [H] },
  // ---- EarWell ----
  { id: "fkNjDXnABec", title: "Baby born with an abnormal ear shape? The EarWell system for newborns", channel: HSC, pages: ["earwell-infant-ear-correction-bangalore", "otoplasty-ear-correction-bangalore"] },
  // ---- Rhinoplasty ----
  { id: "-y8L5iJrYA4", title: "Step-by-step guide to rhinoplasty surgery", channel: DR, pages: [R, FACE] },
  { id: "S8sS7iIw2Ww", title: "Do you need a rhinoplasty? Here's the truth", channel: DR, pages: [R] },
  { id: "qIcAB9dBbmY", title: "Difference between septoplasty and rhinoplasty", channel: DR, pages: [R] },
  { id: "XJUjJmw7VFg", title: "Types of rhinoplasty — which is the safest?", channel: DR, pages: [R] },
  { id: "t8ZaCeV9zyc", title: "What is preservation rhinoplasty?", channel: DR, pages: [R] },
  { id: "5oTlr3Y7QeI", title: "Bulbous nose job: refining the nasal tip", channel: DR, pages: [R] },
  { id: "tGm4QwQbom0", title: "Revision rhinoplasty: everything you need to know", channel: DR, pages: [R] },
  { id: "Vo-O2uD3L9w", title: "Side effects of a nose job (rhinoplasty)", channel: DR, pages: [R] },
  { id: "Bx41LdYKcNg", title: "See your rhinoplasty and breast augmentation results before surgery with 3D simulation", channel: DR, pages: [R, BA] },
  // ---- Face ----
  { id: "Mf9iTGXd5LU", title: "Are you a candidate for Asian blepharoplasty?", channel: DR, pages: ["blepharoplasty-eyelid-surgery-bangalore", FACE] },
  { id: "92fKOEejRok", title: "How to treat under-eye hollowing and grooves", channel: DR, pages: ["blepharoplasty-eyelid-surgery-bangalore", FACE] },
  { id: "6GGEU4nyaUA", title: "Fat grafting vs fillers for under-eye hollowness", channel: DR, pages: [FACE, "blepharoplasty-eyelid-surgery-bangalore"] },
  { id: "pbExPQYLiCU", title: "Under-eye filler vs fat transfer — pros, cons and what to choose", channel: DR, pages: [FACE] },
  { id: "UPodGnEmq4A", title: "Uses of fat grafting for scars", channel: DR, pages: [FACE] },
  { id: "NdO_r7wjx-E", title: "Benefits of a thread lift", channel: DR, pages: [FACE, "facelift-surgery-bangalore"] },
  { id: "3s4_oBZIugA", title: "Does Botox really work for slimming the face?", channel: DR, pages: [FACE] },
  { id: "CmPDyp2FZpY", title: "Treating a stretched or split ear lobe from heavy earrings", channel: DR, pages: [FACE, "otoplasty-ear-correction-bangalore"] },
  // ---- Breast ----
  { id: "TQsHf1yvmhA", title: "Types of breast enhancement", channel: DR, pages: [BA, BREAST] },
  { id: "uxSldE18g_M", title: "Does breast augmentation improve cleavage?", channel: DR, pages: [BA] },
  { id: "_u8mqbhcVmk", title: "How effective is fat grafting for breast augmentation?", channel: DR, pages: [BA] },
  { id: "cCyU4Pzht7A", title: "Breast augmentation myths", channel: DR, pages: [BA] },
  { id: "u2qSJM7CUMo", title: "Important aftercare instructions after breast augmentation", channel: DR, pages: [BA] },
  { id: "YkQl2c7yWyY", title: "Complications of breast implants", channel: DR, pages: [BA] },
  { id: "UfpxGwpoRjo", title: "Do breast implants cause cancer?", channel: DR, pages: [BA, BREAST] },
  { id: "dJBV-np6Zvw", title: "Breast lift vs breast augmentation — understanding the difference", channel: DR, pages: [BREAST, BA] },
  { id: "FuGDONriGQY", title: "Common reasons for breast reduction", channel: DR, pages: [BR, BREAST] },
  { id: "6T2XM0F3TH4", title: "Breast reduction vs breast lift — which is better? (Kannada)", channel: DR, lang: "kn", pages: [BR] },
  // ---- Body ----
  { id: "SobEVPMHhx4", title: "Different types of liposuction explained", channel: DR, pages: [LIPO, BODY] },
  { id: "-4H0ShXmaGY", title: "Ultrasound-assisted liposuction and its advantages", channel: DR, pages: [LIPO] },
  { id: "3Bc0Xwdrr9c", title: "HD liposuction for a toned, athletic body", channel: DR, pages: [LIPO] },
  { id: "kIfoJU32cqw", title: "High-definition liposuction for abdominal etching", channel: DR, pages: [LIPO] },
  { id: "XCLw5J3r_Dg", title: "Can liposuction help with weight loss?", channel: DR, pages: [LIPO] },
  { id: "hBNKAqF_xwc", title: "Can fat return after liposuction?", channel: DR, pages: [LIPO] },
  { id: "YMT05uqJyfI", title: "Diet and exercise before and after liposuction", channel: DR, pages: [LIPO] },
  { id: "X_YYg1PX2L0", title: "Liposuction recovery: real talk and advice", channel: DR, pages: [LIPO] },
  { id: "DT_A5GemuiY", title: "The role of lymphatic massage after liposuction", channel: DR, pages: [LIPO] },
  { id: "RW4msHglIxc", title: "Why compression garments matter after liposuction and tummy tuck", channel: DR, pages: [LIPO, TT] },
  { id: "NbkqoLcohh8", title: "Fat-dissolving injections for stubborn fat", channel: DR, pages: [BODY] },
  { id: "UnYO_Ovgsgw", title: "What is a tummy tuck? Do I need one?", channel: DR, pages: [TT, BODY] },
  { id: "qF1HS2v-rDI", title: "Step-by-step guide to tummy tuck surgery", channel: DR, pages: [TT] },
  { id: "hm0DH9Ma4k4", title: "Is liposuction needed with a tummy tuck?", channel: DR, pages: [TT] },
  { id: "fdlsFZEABvk", title: "Tummy tuck complications — and who should avoid it", channel: DR, pages: [TT] },
  { id: "6f-w4romGgs", title: "What happens if you gain weight after a tummy tuck?", channel: DR, pages: [TT] },
  // ---- Site pages ----
  { id: "47-jyw3b0Zw", title: "Why it's called plastic surgery: debunking the myth", channel: DR, pages: ["about"] },
  { id: "7VPxqGSsAvw", title: "How to become a plastic surgeon in India", channel: DR, pages: ["about"] },
  { id: "M1jhzDitniQ", title: "Essential steps to prepare for plastic surgery", channel: DR, pages: ["resources"] },
  { id: "fyLiGJu_mdc", title: "Skincare after surgery", channel: DR, pages: ["resources"] },
  { id: "25ijlpqunzQ", title: "Aesthetica Veda Whitefield — clinic walkthrough", channel: AV, pages: ["locations"] },
  { id: "gd9cDO0_Q4M", title: "Aesthetica Veda Koramangala — clinic walkthrough", channel: AV, pages: ["locations"] },
  { id: "vXMd00rIhJE", title: "Aesthetica Veda HRBR Layout — clinic walkthrough", channel: AV, pages: ["locations"] },
];

export function videosFor(page: VideoPage, limit = 9): Video[] {
  return VIDEO_LIBRARY.filter((v) => v.pages.includes(page)).slice(0, limit);
}

/** Attach library titles to a plain list of YouTube ids (legacy gallery on the testimonials page). */
export function withTitles(ids: string[]): Pick<Video, "id" | "title" | "lang">[] {
  return ids.map((id) => {
    const v = VIDEO_LIBRARY.find((x) => x.id === id);
    return { id, title: v?.title ?? "", lang: v?.lang };
  });
}
