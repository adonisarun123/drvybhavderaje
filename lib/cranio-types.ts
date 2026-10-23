/**
 * Craniosynostosis type pages — doctor's review, 23 Oct 2026: separate pages for each type of craniosynostosis,
 * reached from the craniosynostosis page (not the main menu).
 *
 * Source: Dr Vybhav Deraje's own patient-information sheets (public/images/pdf/Craniosynthosis/*.pdf), edited for
 * plain language and consistency only. One deliberate change: the sheets name Sakra World Hospital for keyhole
 * surgery; that sentence is replaced with the current position stated elsewhere on the site (Dr Deraje leads the
 * craniosynostosis team at Aster Whitefield Hospital). NEEDS THE DOCTOR'S SIGN-OFF before the site goes live.
 *
 * URLs: /craniosynostosis-surgery-bangalore/<type> — nested under the parent so the hierarchy is in the address.
 */
import { servicePath } from "./routes";

export const CRANIO_PARENT = "craniosynostosis-surgery-bangalore" as const;
const PDF = "/images/pdf/Craniosynthosis";

export interface CranioSection {
  heading: string;
  body?: string[];
  bullets?: string[];
}

export interface CranioType {
  slug: string;
  /** Card / breadcrumb label. */
  shortTitle: string;
  /** Medical name of the head shape, e.g. "Scaphocephaly". */
  shapeName: string;
  title: string;
  metaTitle: string;
  description: string;
  lead: string;
  cardText: string;
  what: string;
  effects: string;
  diagnosis: string;
  treatment: string[];
  sections: CranioSection[];
  faqs: { q: string; a: string }[];
  sheet: string;
}

export function cranioTypePath(slug: string): string {
  return `${servicePath(CRANIO_PARENT)}/${slug}`;
}

/* ---- Shared passages (identical across the doctor's single-suture sheets) ---------------------------- */

const DIAGNOSIS_SINGLE =
  "Your craniofacial surgeon will first examine your child thoroughly. A skull X-ray and a 3D CT scan of the head are usually needed; occasionally an MRI is also done to assess the brain.";

const TEAM_SENTENCE =
  "Treatment is surgical and is carried out by a multidisciplinary team led by the craniofacial surgeon and neurosurgeon. Dr Vybhav Deraje leads the craniosynostosis team at Aster Whitefield Hospital, Bangalore. The type of operation depends on your child's age.";

const KEYHOLE: CranioSection = {
  heading: "Keyhole (Endoscopic) Surgery — What to Expect",
  body: [
    "Before surgery your child is assessed by a paediatric neuro-anaesthetist and has an eye check. Admission is on the day of surgery. The operation takes 1–2 hours under general anaesthesia. Because it needs only a small cut in the scalp, there are no major scars and no major blood loss, although a blood transfusion is occasionally needed.",
    "Your child stays in the ICU overnight, where pain is well controlled by the critical care team, and normal feeding is encouraged. Your child moves to the ward the next day and usually goes home on the third day, after the head dressing is removed. You can give a normal head shower after that.",
  ],
};

const KEYHOLE_AFTER: CranioSection = {
  heading: "After Keyhole Surgery: Helmet Therapy",
  body: [
    "After a check one week after the operation, helmet therapy is started with the orthotic partner. It continues for 1–2 years, until a good head shape is achieved; the helmet may need to be changed once or twice depending on progress. You will see the craniofacial surgeon and neurosurgeon at regular intervals.",
  ],
};

function openSurgery(name: string, what: string): CranioSection[] {
  return [
    {
      heading: `Open ${name} — What to Expect`,
      body: [
        "Before surgery your child is assessed by a paediatric neuro-anaesthetist and an ophthalmologist. Admission is on the day of surgery. The operation is done under general anaesthesia and usually takes 4–5 hours. Several monitoring lines (such as a central line and an arterial line) are placed, and almost all children need a blood transfusion during and after surgery.",
        `The cut runs across the top of the head from one ear to the other. The neurosurgeon protects the brain while the craniofacial surgeon ${what}. The bones are usually fixed with stainless-steel wires or stitches; absorbable plates and screws are used occasionally. The wound is closed with absorbable stitches and a head bandage is applied.`,
        "Your child spends the first night in the ICU and then moves to the ward. Expect marked swelling of the head and face — the eyes may close for 3–4 days — which settles over the week. Children usually go home on the sixth or seventh day, after the bandage is removed, and can have a head shower after that.",
      ],
    },
    {
      heading: "After Open Surgery",
      body: [
        "You will have periodic follow-up with the craniofacial surgeon and neurosurgeon. This is usually a one-time operation: if there is no associated syndrome, it is all your child will need. Helmet therapy is not needed after open remodelling. Small gaps in the skull close over within 2–3 years, and the scar is usually well hidden in the hair.",
      ],
    },
  ];
}

const COMPLICATIONS: CranioSection = {
  heading: "Possible Complications",
  body: [
    "This is major surgery and families should be fully informed. Infection, bleeding, scarring, swelling and pain are the common complications, and the team manages them routinely. A small tear in the covering of the brain is sometimes seen and is usually repaired during the operation. Injury to the eye or brain is very rare. Death is a remote theoretical possibility; Dr Deraje's team has not seen it in their practice.",
  ],
};

function singleSuture(open: { name: string; what: string }): CranioSection[] {
  return [KEYHOLE, KEYHOLE_AFTER, ...openSurgery(open.name, open.what), COMPLICATIONS];
}

function commonFaqs(typeName: string, openName: string) {
  return [
    { q: `How is ${typeName} diagnosed?`, a: DIAGNOSIS_SINGLE },
    { q: `What is the best age for ${typeName} surgery?`, a: `Under 6 months of age, minimally invasive endoscope-assisted keyhole surgery is possible, followed by helmet therapy for 1–2 years. Above 6 months, an open ${openName.toLowerCase()} is done.` },
    { q: "How long is the hospital stay?", a: "Usually about 3 days after keyhole surgery (one night in the ICU) and 6–7 days after open surgery." },
    { q: "Is a helmet needed after surgery?", a: "Yes after keyhole surgery — helmet therapy continues for 1–2 years. No after open remodelling surgery." },
  ];
}

/* ---- The six types ------------------------------------------------------------------------------- */

export const CRANIO_TYPES: CranioType[] = [
  {
    slug: "sagittal-synostosis",
    shortTitle: "Sagittal Synostosis",
    shapeName: "Scaphocephaly",
    title: "Sagittal Craniosynostosis (Scaphocephaly) in Bangalore",
    metaTitle: "Sagittal Craniosynostosis (Long, Narrow Head) Treatment in Bangalore | Dr Vybhav Deraje",
    description: "Sagittal craniosynostosis (scaphocephaly) — a long, narrow head in babies. Diagnosis, keyhole surgery with helmet therapy under 6 months and cranial vault remodelling, Bangalore.",
    lead: "When the suture along the top of the head fuses early, the head grows long and narrow. Keyhole surgery before 6 months, or open remodelling later, restores a normal shape.",
    cardText: "Long, narrow head (scaphocephaly) — the most common single-suture type.",
    what: "Sagittal craniosynostosis is a condition in which the soft joint running along the top of the skull (the sagittal suture) fuses earlier than usual. The head becomes narrower and longer from front to back than usual — a shape called scaphocephaly.",
    effects: "Besides the long, narrow head, it causes bossing (bulging) of the forehead and a bullet-shaped back of the skull (occiput). In very rare circumstances it can compress the brain and raise the pressure inside the skull.",
    diagnosis: DIAGNOSIS_SINGLE,
    treatment: [TEAM_SENTENCE, "Under 6 months of age: minimally invasive, endoscope-assisted keyhole surgery to remove the fused suture, followed by helmet therapy for 1–2 years. Above 6 months: an open operation called cranial vault remodelling to reshape the skull."],
    sections: singleSuture({ name: "Cranial Vault Remodelling", what: "reshapes the skull bones" }),
    faqs: [
      { q: "What does sagittal craniosynostosis look like?", a: "The head is long from front to back and narrow from side to side (scaphocephaly), often with a bulging forehead and a pointed, bullet-shaped back of the head." },
      ...commonFaqs("sagittal craniosynostosis", "Cranial vault remodelling"),
    ],
    sheet: `${PDF}/Patient-information-sheet-Sagittal-craniosynostosis.pdf`,
  },
  {
    slug: "metopic-synostosis",
    shortTitle: "Metopic Synostosis",
    shapeName: "Trigonocephaly",
    title: "Metopic Craniosynostosis (Trigonocephaly) in Bangalore",
    metaTitle: "Metopic Craniosynostosis (Triangular Forehead) Treatment in Bangalore | Dr Vybhav Deraje",
    description: "Metopic craniosynostosis (trigonocephaly) — a triangular forehead in babies. Diagnosis, keyhole surgery with helmet therapy under 6 months and fronto-orbital advancement, Bangalore.",
    lead: "Early fusion of the suture down the middle of the forehead gives a triangular forehead. Keyhole surgery before 6 months, or fronto-orbital advancement later, corrects it.",
    cardText: "Triangular, keel-shaped forehead (trigonocephaly).",
    what: "Metopic craniosynostosis is a condition in which the soft joint running down the middle of the forehead (the metopic suture) fuses earlier than usual, giving a triangular-shaped head — trigonocephaly.",
    effects: "The forehead is triangular. Metopic craniosynostosis is also known to be associated with speech and language difficulties. In very rare circumstances it can compress the brain and raise the pressure inside the skull.",
    diagnosis: DIAGNOSIS_SINGLE,
    treatment: [TEAM_SENTENCE, "Under 6 months of age: minimally invasive, endoscope-assisted keyhole surgery to remove the fused suture, followed by helmet therapy for 1–2 years. Above 6 months: an open operation called fronto-orbital advancement and remodelling to reshape the forehead."],
    sections: singleSuture({ name: "Fronto-Orbital Advancement", what: "reshapes the forehead bones" }),
    faqs: [
      { q: "Is a metopic ridge the same as metopic craniosynostosis?", a: "Not necessarily. A ridge down the forehead can be a normal finding; metopic craniosynostosis produces a triangular forehead (trigonocephaly). A craniofacial surgeon's examination, with a skull X-ray and 3D CT scan where needed, tells them apart." },
      ...commonFaqs("metopic craniosynostosis", "Fronto-orbital advancement and remodelling"),
    ],
    sheet: `${PDF}/Patient-information-sheet-Metopic-craniosynostosis.pdf`,
  },
  {
    slug: "unicoronal-synostosis",
    shortTitle: "Unicoronal Synostosis",
    shapeName: "Anterior plagiocephaly",
    title: "Unicoronal Craniosynostosis (Anterior Plagiocephaly) in Bangalore",
    metaTitle: "Unicoronal Craniosynostosis (Flat Forehead on One Side) Treatment in Bangalore | Dr Vybhav Deraje",
    description: "Unicoronal craniosynostosis (anterior plagiocephaly) — one side of the forehead flattened, nose deviated, eye socket raised. Keyhole surgery under 6 months or fronto-orbital advancement, Bangalore.",
    lead: "When one coronal suture fuses early, one side of the forehead flattens and the face looks slanted. Keyhole surgery before 6 months, or fronto-orbital advancement later, corrects it.",
    cardText: "One side of the forehead flattened, with a slanted skull (anterior plagiocephaly).",
    what: "Unicoronal craniosynostosis is a condition in which one of the soft joints on the side of the forehead (a coronal suture) fuses earlier than usual. The forehead flattens on the affected side — anterior plagiocephaly.",
    effects: "Along with the flattened forehead on the affected side, your child may have a deviated nose, a raised eye socket and a slanted skull. In very rare circumstances it can compress the brain and raise the pressure inside the skull.",
    diagnosis: DIAGNOSIS_SINGLE,
    treatment: [TEAM_SENTENCE, "Under 6 months of age: minimally invasive, endoscope-assisted keyhole surgery to remove the fused suture, followed by helmet therapy for 1–2 years. Above 6 months: an open operation called fronto-orbital advancement and remodelling to reshape the forehead."],
    sections: singleSuture({ name: "Fronto-Orbital Advancement", what: "reshapes the forehead bones" }),
    faqs: [
      { q: "What are the signs of unicoronal craniosynostosis?", a: "A forehead that is flattened on one side, a nose that deviates, an eye socket that sits higher on the affected side and a skull that looks slanted." },
      ...commonFaqs("unicoronal craniosynostosis", "Fronto-orbital advancement and remodelling"),
    ],
    sheet: `${PDF}/Patient-information-sheet-Unicoronal-craniosynostosis.pdf`,
  },
  {
    slug: "bicoronal-synostosis",
    shortTitle: "Bicoronal Synostosis",
    shapeName: "Brachycephaly",
    title: "Bicoronal Craniosynostosis (Brachycephaly) in Bangalore",
    metaTitle: "Bicoronal Craniosynostosis (Flat, Wide Head) Treatment in Bangalore | Dr Vybhav Deraje",
    description: "Bicoronal craniosynostosis (brachycephaly) — both coronal sutures fused, giving a flat, wide head. Keyhole surgery with helmet therapy under 6 months or fronto-orbital advancement, Bangalore.",
    lead: "When both coronal sutures fuse early, the head becomes flat and wide. Keyhole surgery before 6 months, or fronto-orbital advancement later, reshapes it.",
    cardText: "Both coronal sutures fused — a flat, wide head (brachycephaly).",
    what: "Bicoronal craniosynostosis is a condition in which both soft joints on the sides of the forehead (the right and left coronal sutures) fuse earlier than usual, resulting in a flat head — brachycephaly.",
    effects: "It produces an abnormally shaped, flat head. In very rare circumstances it can compress the brain and raise the pressure inside the skull.",
    diagnosis: DIAGNOSIS_SINGLE,
    treatment: [TEAM_SENTENCE, "Under 6 months of age: minimally invasive, endoscope-assisted keyhole surgery to remove the fused sutures, followed by helmet therapy for 1–2 years. Above 6 months: an open operation called fronto-orbital advancement and remodelling to reshape the forehead."],
    sections: singleSuture({ name: "Fronto-Orbital Advancement", what: "reshapes the forehead bones" }),
    faqs: [
      { q: "Is bicoronal craniosynostosis the same as a flat head from sleeping position?", a: "No. Positional flat head comes from pressure on a soft skull and the sutures stay open; bicoronal craniosynostosis is early fusion of both coronal sutures and needs surgery. Examination and imaging tell them apart." },
      ...commonFaqs("bicoronal craniosynostosis", "Fronto-orbital advancement and remodelling"),
    ],
    sheet: `${PDF}/Patient-information-sheet-Bicoronal-craniosynostosis.pdf`,
  },
  {
    slug: "lambdoid-synostosis",
    shortTitle: "Lambdoid Synostosis",
    shapeName: "Posterior plagiocephaly",
    title: "Lambdoid Craniosynostosis (Posterior Plagiocephaly) in Bangalore",
    metaTitle: "Lambdoid Craniosynostosis (Slanted Back of Head) Treatment in Bangalore | Dr Vybhav Deraje",
    description: "Lambdoid craniosynostosis (posterior plagiocephaly) — the back of the head slanted or twisted to one side. Keyhole surgery with helmet therapy under 6 months or cranial vault remodelling, Bangalore.",
    lead: "The rarest single-suture type: early fusion at the back of the head slants or twists the skull to one side. It is often mistaken for positional flat head.",
    cardText: "Back of the head slanted or twisted to one side — the rarest type.",
    what: "Lambdoid craniosynostosis is a condition in which one of the soft joints at the back of the head (a lambdoid suture) fuses earlier than usual, so the back of the skull becomes slanted or twisted to one side — posterior plagiocephaly.",
    effects: "It produces an abnormally shaped head, slanted or twisted at the back. In very rare circumstances it can compress the brain and raise the pressure inside the skull. Because it is rare, it is sometimes confused with positional (deformational) plagiocephaly.",
    diagnosis: DIAGNOSIS_SINGLE,
    treatment: [TEAM_SENTENCE, "Under 6 months of age: minimally invasive, endoscope-assisted keyhole surgery to remove the fused suture, followed by helmet therapy for 1–2 years. Above 6 months: an open operation called cranial vault remodelling to reshape the skull."],
    sections: singleSuture({ name: "Cranial Vault Remodelling", what: "reshapes the skull bones" }),
    faqs: [
      { q: "How is lambdoid craniosynostosis different from positional plagiocephaly?", a: "Both flatten the back of the head, but in lambdoid craniosynostosis a suture has fused and the skull is slanted or twisted; in positional plagiocephaly the sutures are open. A craniofacial surgeon's examination with a skull X-ray and 3D CT scan confirms which it is." },
      ...commonFaqs("lambdoid craniosynostosis", "Cranial vault remodelling"),
    ],
    sheet: `${PDF}/Patient-information-sheet-Lambdoid-craniosynostosis.pdf`,
  },
  {
    slug: "multisuture-syndromic-craniosynostosis",
    shortTitle: "Multisuture & Syndromic Craniosynostosis",
    shapeName: "Brachycephaly, turricephaly, microcephaly",
    title: "Multisuture and Syndromic Craniosynostosis in Bangalore",
    metaTitle: "Multisuture & Syndromic Craniosynostosis (Apert, Crouzon) Treatment in Bangalore | Dr Vybhav Deraje",
    description: "Multisuture and syndromic craniosynostosis — Crouzon, Apert, Pfeiffer, Muenke, Saethre-Chotzen. Staged surgery: posterior vault expansion, fronto-orbital advancement and Le Fort III advancement, Bangalore.",
    lead: "When several sutures fuse early — often as part of a craniofacial syndrome — children need staged surgery through childhood and a full multidisciplinary team.",
    cardText: "Several sutures fused, often with a syndrome such as Crouzon or Apert.",
    what: "Multisuture craniosynostosis is a condition in which more than one of the soft joints of the skull fuses earlier than usual. It is usually associated with an abnormal gene causing one of the craniofacial syndromes.",
    effects:
      "The head may be flat (brachycephaly), tall (turricephaly), flat and tall (turribrachycephaly) or small (microcephaly). It can come with anomalies of the hands, ears, brain or internal organs. Very often it compresses the brain and raises the pressure inside the skull, which can lead to blindness and brain damage. Many children have an underdeveloped midface (midface hypoplasia), causing airway problems and obstructive sleep apnoea, and shallow eye sockets (exorbitism) that can let the eyeballs dislocate and be damaged. A significant proportion of children have some degree of learning disability.",
    diagnosis: "Your craniofacial surgeon will examine your child thoroughly. A skull X-ray, a 3D CT scan and an MRI scan of the head are usually needed, and intracranial pressure monitoring is occasionally required. Genetic testing is usually done to identify the gene involved.",
    treatment: [
      "Treatment needs a multidisciplinary team: craniofacial surgeon, neurosurgeon, orthodontist, respiratory physician, ENT surgeon, ophthalmologist, speech pathologist, paediatrician and clinical psychologist. Dr Vybhav Deraje organises regular multidisciplinary meetings to decide the right course for each child.",
      "Many children need surgery to relieve raised intracranial pressure and improve the head shape, often more than one operation at different stages of childhood.",
    ],
    sections: [
      {
        heading: "Common Syndromes",
        bullets: ["Crouzon syndrome", "Apert syndrome", "Pfeiffer syndrome", "Muenke syndrome", "Saethre-Chotzen syndrome"],
      },
      {
        heading: "Stages of Treatment",
        bullets: [
          "First year of life — posterior cranial vault expansion to release the pressure inside the skull and improve intracranial anomalies such as Chiari malformation.",
          "Late first or second year — fronto-orbital advancement and cranial vault remodelling to bring the forehead forward and reshape the skull, delayed as long as possible to allow for growth.",
          "After the age of 3 — Le Fort III midface advancement if breathing problems and sleep apnoea need it.",
          "Other procedures as your child's condition requires.",
        ],
      },
      {
        heading: "Posterior Cranial Vault Expansion — What to Expect",
        body: [
          "After assessment by a paediatric neuro-anaesthetist and ophthalmologist, your child is admitted on the day of surgery. The operation takes 3–4 hours under general anaesthesia, with monitoring lines placed, and almost all children need a blood transfusion. Through an ear-to-ear cut, the neurosurgeon protects the brain while the craniofacial surgeon expands the bones at the back of the head to make more room for the brain.",
          "Your child spends the first night in the ICU. Swelling of the head and face (the eyes may close for 3–4 days) settles over the week, and children usually go home on the sixth or seventh day. Follow-up is with the craniofacial surgeon, neurosurgeon and ophthalmologist, with CT and MRI scans to monitor progress. Gaps in the skull close over 2–3 years and the scar is usually hidden in the hair.",
        ],
      },
      {
        heading: "Fronto-Orbital Advancement and Cranial Vault Remodelling",
        body: [
          "A 4–5 hour operation under general anaesthesia, with a blood transfusion in almost every case. The craniofacial surgeon brings the forehead forward and reshapes the forehead and skull bones while the neurosurgeon protects the brain. Recovery is as above: a night in the ICU, swelling for about a week and discharge on the sixth or seventh day, with follow-up scans and regular multidisciplinary review.",
        ],
      },
      {
        heading: "Le Fort III Midface Advancement",
        body: [
          "The middle part of the face — the upper jaw and cheekbones — is brought forward to support the eyeballs and improve the airway and sleep apnoea. Your child first sees the orthodontist, and a CT scan is used for virtual surgical planning. The operation takes 6–7 hours and always needs a blood transfusion; cuts are made from ear to ear and inside the mouth, and the bones are fixed in their new position with titanium plates and screws.",
          "After a night in the ICU and about a week of swelling, children usually go home on the sixth or seventh day and eat a soft diet for the first few weeks. A sleep study is usually repeated a few months later to measure the improvement.",
        ],
      },
      {
        ...COMPLICATIONS,
        body: [...COMPLICATIONS.body!, "In syndromic craniosynostosis, raised intracranial pressure can return at any time, and repeat surgery may then be needed."],
      },
    ],
    faqs: [
      { q: "Which syndromes cause multisuture craniosynostosis?", a: "Common ones are Crouzon, Apert, Pfeiffer, Muenke and Saethre-Chotzen syndromes. Genetic testing is usually done to identify the gene involved." },
      { q: "How many operations will my child need?", a: "Often more than one, at different stages: posterior vault expansion in the first year, forehead and skull reshaping in the late first or second year, and Le Fort III midface advancement after age 3 if breathing needs it." },
      { q: "Why is a midface advancement needed?", a: "Many children with syndromic craniosynostosis have an underdeveloped midface, which narrows the airway and causes sleep apnoea and leaves the eyes poorly protected. Le Fort III advancement brings the midface forward to improve breathing and support the eyes." },
      { q: "Who is involved in my child's care?", a: "A multidisciplinary team: craniofacial surgeon, neurosurgeon, orthodontist, respiratory physician, ENT surgeon, ophthalmologist, speech pathologist, paediatrician and clinical psychologist, meeting regularly to plan each step." },
    ],
    sheet: `${PDF}/Patient-information-sheet-Multi-suture-craniosynostosis.pdf`,
  },
];

export function getCranioType(slug: string): CranioType | undefined {
  return CRANIO_TYPES.find((t) => t.slug === slug);
}

/** lib/videos.ts tags type-page videos as "cranio:<key>"; key = first word of the slug. */
export function cranioVideoKey(t: CranioType): `cranio:${string}` {
  const k = t.slug.startsWith("multisuture") ? "multi-suture" : t.slug.split("-")[0]!;
  return `cranio:${k}`;
}
