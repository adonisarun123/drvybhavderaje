/**
 * Procedure pages built from the doctor's patient-information sheets (requested 23 Oct 2026): one page per
 * sheet that had no page of its own, nested under its parent service page —
 * /<parent-slug>/<procedure-slug>, the same pattern as the craniosynostosis type pages (lib/cranio-types.ts).
 *
 * Source: Dr Vybhav Deraje's own sheets in public/images/pdf/, edited for plain language and consistency only.
 * Nothing clinical is added beyond the sheets. The doctor approved (23 Oct 2026) the three flagged points: cleft jaw
 * discharge 3–4 days (sheet typo "34"), phyllodes as a breast tumour not a cancer, and day-care for arm/thigh/breast lift.
 * Full-page sign-off status: see docs/CONTENT-APPROVAL.md.
 */
import { servicePath, type ServiceSlug } from "./routes";

const PDF = "/images/pdf";

export interface SubProcedureSection {
  heading: string;
  body?: string[];
  bullets?: string[];
}

export interface SubProcedure {
  slug: string;
  parent: ServiceSlug;
  /** Card / breadcrumb label. */
  shortTitle: string;
  /** H1. */
  title: string;
  metaTitle: string;
  description: string;
  lead: string;
  cardText: string;
  /** Name of the procedure for MedicalProcedure schema. */
  procedureName: string;
  /** "At a glance" rows. */
  facts: { label: string; value: string }[];
  sections: SubProcedureSection[];
  faqs: { q: string; a: string }[];
  sheet: string;
  /** A closely related standalone page, linked as "see also" (avoids two pages competing for one search). */
  seeAlso?: ServiceSlug;
}

const PAIN = "Pain in hospital is managed by the acute pain service team";

const CLEFT: ServiceSlug = "cleft-lip-and-palate-treatment-bangalore";
const HAND: ServiceSlug = "hand-plastic-surgeon-bangalore";
const FACE: ServiceSlug = "face-plastic-surgery-bangalore";
const BREAST: ServiceSlug = "breast-plastic-surgeon-bangalore";
const BODY: ServiceSlug = "body-plastic-surgeon-bangalore";

export const SUB_PROCEDURES: SubProcedure[] = [
  /* ---- Cleft lip and palate ---------------------------------------------------------------------------- */
  {
    slug: "cleft-lip-repair",
    parent: CLEFT,
    shortTitle: "Cleft Lip Repair",
    title: "Cleft Lip Repair Surgery in Bangalore",
    metaTitle: "Cleft Lip Repair Surgery in Bangalore | Dr Vybhav Deraje",
    description: "Cleft lip repair at 3–6 months by Dr Vybhav Deraje, Bangalore: diagnosis, how the lip and its muscle are rebuilt, feeding, recovery and scar care.",
    lead: "A cleft lip is a gap in the upper lip present from birth. It is repaired in one operation, usually when the baby is 3–6 months old.",
    cardText: "Lip repair at 3–6 months: the operation, feeding and scar care.",
    procedureName: "Cleft lip repair (cheiloplasty)",
    facts: [
      { label: "Usual Age", value: "3–6 months" },
      { label: "Anaesthesia", value: "general, about 60–90 minutes" },
      { label: "Hospital Stay", value: "home the next day or the day after, once feeding is normal" },
      { label: "Stitches", value: "removed after about 1 week" },
    ],
    sections: [
      { heading: "What Is a Cleft Lip?", body: ["A cleft lip is one of the most common facial differences present at birth: a gap (cleft) in the upper lip. Depending on its severity it can be microform, partial or complete, and it may occur together with a cleft in the gum (alveolus) and a cleft palate."] },
      { heading: "How It Is Diagnosed", body: ["A cleft lip can often be seen on a high-quality 3D or 4D ultrasound during pregnancy, and the anomaly scan in early pregnancy usually detects it. It is sometimes missed and found only after the baby is born."] },
      { heading: "When Is the Repair Done?", body: ["The repair is usually done when the baby is 3–6 months old. Your baby must be physiologically stable enough to have a general anaesthetic safely."] },
      {
        heading: "What the Surgery Involves",
        body: [
          "Your baby is seen by the paediatric anaesthetist before surgery and admitted on the day of the operation, which takes about 60–90 minutes under general anaesthesia.",
          "The gap in the upper lip is reconstructed by rearranging the skin and the lining (mucosa) and by repairing the lip muscle. Manoeuvres to improve the shape of the nose may be done at the same time. The wound is closed with stitches.",
        ],
      },
      {
        heading: "After Surgery",
        bullets: [
          "Steri-Strip tape covers the repair, and splints on both arms stop your baby from touching the wound.",
          "Feeding can start 2 hours after surgery; the speech pathologist will advise you on feeding technique.",
          "Once feeding is back to normal, your baby goes home the next day or the day after.",
          "Stitches are removed after about a week, and you will be shown how to massage the scar for 3–6 months to improve it.",
        ],
      },
      { heading: "Possible Complications", body: [`Infection, bleeding, scarring, swelling and pain are the common complications. ${PAIN}, and usually only a simple painkiller is needed at home. Very rarely the wound can come apart (wound dehiscence) and the repair may have to be repeated later.`] },
    ],
    faqs: [
      { q: "At what age is cleft lip surgery done?", a: "Usually between 3 and 6 months of age, once the baby is stable enough for a general anaesthetic." },
      { q: "Can a cleft lip be detected before birth?", a: "Often, yes — on a high-quality 3D or 4D ultrasound or the anomaly scan in early pregnancy. Some clefts are found only after birth." },
      { q: "When can my baby feed after the operation?", a: "Two hours after surgery. The speech pathologist will guide you on feeding technique." },
      { q: "How long is the hospital stay?", a: "Usually one or two nights; your baby goes home once feeding has returned to normal." },
    ],
    sheet: `${PDF}/cleft/Patient-information-sheet-Cleft-lip.pdf`,
  },
  {
    slug: "cleft-palate-repair",
    parent: CLEFT,
    shortTitle: "Cleft Palate Repair",
    title: "Cleft Palate Repair Surgery in Bangalore",
    metaTitle: "Cleft Palate Repair Surgery in Bangalore | Dr Vybhav Deraje",
    description: "Cleft palate repair at 9–12 months, before speech develops: how the palate is rebuilt, ear tubes, feeding, recovery and speech follow-up, Bangalore.",
    lead: "A cleft palate is a gap in the roof of the mouth present from birth. It is repaired at 9–12 months, just before speech develops.",
    cardText: "Palate repair at 9–12 months, with speech and hearing follow-up.",
    procedureName: "Cleft palate repair (palatoplasty)",
    facts: [
      { label: "Usual Age", value: "9–12 months, just before speech develops" },
      { label: "Anaesthesia", value: "general, about 60–90 minutes" },
      { label: "Hospital Stay", value: "2–3 days, until feeding is normal" },
      { label: "Often Combined With", value: "ear ventilation tubes, placed by the ENT surgeons in the same sitting" },
    ],
    sections: [
      {
        heading: "What Is a Cleft Palate?",
        body: [
          "A cleft palate is one of the most common facial differences present at birth: a gap in the palate, the roof of the mouth. It can be complete, incomplete or submucous, and may occur with a cleft in the gum (alveolus) and a cleft lip.",
          "Because the muscles of the palate are abnormal, a cleft palate can affect swallowing and speech. In some children it also affects the Eustachian tube, letting fluid collect in the middle ear and causing hearing problems.",
        ],
      },
      { heading: "How It Is Diagnosed", body: ["A cleft palate can often be seen on a high-quality 3D or 4D ultrasound during pregnancy, and the anomaly scan in early pregnancy usually detects it. It is sometimes missed and found only after the baby is born."] },
      { heading: "When Is the Repair Done?", body: ["Repair is usually done at 9–12 months of age, just before speech develops, once your baby is stable enough for a general anaesthetic."] },
      {
        heading: "What the Surgery Involves",
        body: [
          "Your baby is seen by the paediatric anaesthetist before surgery and admitted on the day of the operation, which takes about 60–90 minutes under general anaesthesia.",
          "The gap is closed by rearranging the lining (mucosa) and repairing the palate muscle. To close the gap in the middle, tissue is moved in from the sides of the palate, which leaves small wounds there. In the same sitting the ENT surgeons usually insert ventilation tubes to clear fluid from the middle ear.",
        ],
      },
      {
        heading: "After Surgery",
        bullets: [
          "Absorbable packs may be placed in the mouth, and a little oozing of blood from the mouth is normal.",
          "Splints on both arms stop your baby from touching the repair.",
          "Clear liquids from 2 hours after surgery and soft food from the next day; the speech pathologist advises on feeding technique.",
          "Home after 2–3 days once feeding is normal, with a wound check after 1 week. The stitches are absorbable and dissolve or fall out over the following weeks.",
        ],
      },
      { heading: "Speech After the Repair", body: ["Speech problems can persist despite surgery. Your child may need speech therapy through the growing years and, very rarely, speech surgery."] },
      { heading: "Possible Complications", body: [`Infection, bleeding, swelling and pain are the common complications. ${PAIN}, and usually only a simple painkiller is needed at home. Very rarely the wound can come apart (wound dehiscence) and the repair may have to be repeated later.`] },
    ],
    faqs: [
      { q: "When is cleft palate surgery done?", a: "Usually at 9–12 months of age, just before speech develops." },
      { q: "Why are ear tubes put in at the same time?", a: "A cleft palate can stop the Eustachian tube working properly, so fluid collects in the middle ear and affects hearing. The ENT surgeons usually insert ventilation tubes during the palate repair to drain it." },
      { q: "Will my child need speech therapy?", a: "Possibly. Speech problems can persist after the repair, so speech is followed through childhood; speech therapy is common and speech surgery is very rarely needed." },
      { q: "How long is the hospital stay?", a: "Usually 2–3 days, until feeding is back to normal." },
    ],
    sheet: `${PDF}/cleft/Patient-information-sheet-Cleft-palate.pdf`,
  },
  {
    slug: "speech-surgery",
    parent: CLEFT,
    shortTitle: "Speech Surgery",
    title: "Speech Surgery for Cleft Palate in Bangalore",
    metaTitle: "Speech Surgery for Cleft Palate in Bangalore | Dr Vybhav Deraje",
    description: "Speech surgery for children with a cleft palate and nasal speech, from age 5–6 when therapy is not enough: assessment, surgery and recovery, Bangalore.",
    lead: "Some children with a cleft palate keep a nasal quality to their speech despite therapy. Speech surgery reshapes the back of the throat and the palate to help.",
    cardText: "For nasal speech that persists after therapy, usually from age 5–6.",
    procedureName: "Speech surgery for cleft palate",
    facts: [
      { label: "Usual Age", value: "after 5–6 years, when speech therapy has not given the result hoped for" },
      { label: "Assessment", value: "speech assessments, nasal endoscopy and fluoroscopy" },
      { label: "Anaesthesia", value: "general, about 60–90 minutes" },
      { label: "Hospital Stay", value: "1–2 days" },
    ],
    sections: [
      { heading: "Why Is Speech Surgery Needed?", body: ["Children with a cleft often have speech difficulties. A cleft lip and alveolus can cause articulation problems, and a cleft palate can cause a nasal twang (hypernasal speech) because the palate muscles do not work normally. These need continuous speech therapy, and occasionally surgery."] },
      { heading: "When Is It Done?", body: ["Usually after 5–6 years of age, when speech therapy has not given the result hoped for. Your surgeon and speech pathologist decide on the need and timing of surgery after a detailed discussion with you."] },
      { heading: "Tests Before Surgery", body: ["Your child has periodic speech assessments and, depending on progress, a nasal endoscopy and fluoroscopy. In nasal endoscopy a thin tube is passed through the nose to look at the back of the throat and the palate and find the cause of the speech problem; fluoroscopy is a real-time X-ray that shows how the speech structures move. If a specific problem is found, surgery is planned."] },
      {
        heading: "What the Surgery Involves",
        body: [
          "Your child is seen by the paediatric anaesthetist before surgery and admitted on the day of the operation, which takes about 60–90 minutes under general anaesthesia.",
          "Tissues in the throat and palate are rearranged to change the shape and size of the opening at the back of the throat, depending on the speech problem. The palate may be lengthened in the same operation, and a remaining hole in the palate (palatal fistula) can be repaired. All wounds are closed with absorbable stitches.",
        ],
      },
      {
        heading: "After Surgery",
        bullets: [
          "A little oozing of blood from the mouth is normal; regular mouthwashes keep the mouth clean.",
          "Home after 1–2 days, with a wound check after 1 week. The stitches are absorbable.",
          "Speech is assessed again 6 weeks after the wound has healed.",
        ],
      },
      { heading: "Possible Complications", body: [`Infection, bleeding, swelling and pain are the common complications. ${PAIN}. How much speech improves is hard to predict, and in some children the improvement may be small.`] },
    ],
    faqs: [
      { q: "At what age is speech surgery done?", a: "Usually after 5–6 years, when speech therapy alone has not given the result hoped for." },
      { q: "What tests are needed first?", a: "Regular speech assessments and, depending on progress, a nasal endoscopy and fluoroscopy to see how the palate and throat move during speech." },
      { q: "Will surgery fix my child's speech completely?", a: "Not always. The degree of improvement is hard to predict, and speech is reassessed 6 weeks after healing." },
    ],
    sheet: `${PDF}/cleft/Patient-information-sheet-Speech-surgery.pdf`,
  },
  {
    slug: "alveolar-bone-grafting",
    parent: CLEFT,
    shortTitle: "Alveolar Bone Grafting",
    title: "Alveolar Bone Grafting for Cleft in Bangalore",
    metaTitle: "Alveolar Bone Grafting for Cleft in Bangalore | Dr Vybhav Deraje",
    description: "Alveolar bone grafting for children with cleft lip and palate, timed to the canine tooth (age 7–11): hip bone graft, recovery and orthodontics, Bangalore.",
    lead: "Most children with a cleft lip and palate have a gap in the upper jaw bone where the canine tooth will come through. A bone graft fills it, timed to that tooth.",
    cardText: "Bone graft to the gum gap at 7–11 years, timed to the canine tooth.",
    procedureName: "Alveolar bone grafting",
    facts: [
      { label: "Usual Age", value: "7–11 years, as the canine tooth starts to erupt" },
      { label: "Graft", value: "bone from the hip (iliac crest)" },
      { label: "Anaesthesia", value: "general, about 60–90 minutes" },
      { label: "Hospital Stay", value: "about 2 days; soft diet for 3 weeks" },
    ],
    sections: [
      { heading: "Why Is It Done?", body: ["Children born with a cleft lip and palate usually have a defect in the upper jaw bone (maxilla) in the area that will later hold the canine tooth. Alveolar bone grafting fills this gap and gives the canine tooth bone to grow into."] },
      { heading: "When Is It Done?", body: ["Usually between 7 and 11 years of age — more precisely, when the canine tooth starts to erupt. Done too early, the graft is absorbed before the tooth arrives; done too late, the tooth has no support and can be lost. Your surgeon and orthodontist decide the timing by monitoring jaw growth. Some orthodontic treatment (braces) is needed before and after the operation."] },
      { heading: "Tests Before Surgery", body: ["A cone beam CT scan may be done to measure the size of the defect."] },
      {
        heading: "What the Surgery Involves",
        body: [
          "Your child is seen by the paediatric anaesthetist before surgery and admitted on the day of the operation, which takes about 60–90 minutes under general anaesthesia.",
          "The gap is filled with cancellous and cortical bone taken from the hip (iliac crest), and the wound is closed with absorbable stitches. A small drain may be placed in the hip and removed after a couple of days. Children usually go home after about 2 days.",
        ],
      },
      {
        heading: "After Surgery",
        bullets: [
          "Mild oozing of blood from the mouth is normal.",
          "Soft diet for 3 weeks, with regular mouthwashes to keep the mouth clean.",
          "Wound check after 1 week; the stitches are absorbable.",
          "Once healed, orthodontic treatment continues to shape the upper dental arch.",
        ],
      },
      { heading: "Possible Complications", body: [`Infection, bleeding, swelling and pain are the common complications. ${PAIN}; the hip is usually more sore than the mouth, and a simple painkiller is generally enough at home. Very rarely the wound can come apart and the graft may have to be repeated later.`] },
    ],
    faqs: [
      { q: "At what age is alveolar bone grafting done?", a: "Usually between 7 and 11 years, when the canine tooth starts to erupt. Your surgeon and orthodontist time it by monitoring jaw growth." },
      { q: "Will my child need braces?", a: "Yes — some orthodontic treatment before and after the operation, and more once healed to shape the upper dental arch." },
      { q: "Which hurts more, the hip or the mouth?", a: "Usually the hip. A simple painkiller is generally enough after discharge." },
    ],
    sheet: `${PDF}/cleft/Patient-information-sheet-Alveolar-bone-grafting.pdf`,
  },
  {
    slug: "cleft-jaw-surgery",
    parent: CLEFT,
    shortTitle: "Jaw Surgery After Cleft",
    title: "Corrective Jaw Surgery for Cleft Patients in Bangalore",
    metaTitle: "Cleft Jaw Surgery (Orthognathic) in Bangalore | Dr Vybhav Deraje",
    description: "Jaw surgery for cleft patients with a flat midface and underbite: Le Fort I advancement or double-jaw surgery after 16: planning and recovery, Bangalore.",
    lead: "Many people born with a cleft lip and palate develop an underdeveloped upper jaw, giving a flat ‘dish face’ and an underbite. Corrective jaw surgery brings the upper jaw forward once growth is complete.",
    cardText: "Le Fort I or double-jaw surgery after 16 for a flat midface and underbite.",
    procedureName: "Orthognathic surgery for cleft (Le Fort I maxillary advancement)",
    facts: [
      { label: "Usual Age", value: "after 16 years, when the facial bones have finished growing" },
      { label: "Planning", value: "OPG, lateral cephalogram, CT scan and virtual surgical planning" },
      { label: "Anaesthesia", value: "general, about 2–3 hours" },
      { label: "Hospital Stay", value: "one night in the ICU; home after 3–4 days" },
      { label: "Braces", value: "6 months to 1 year before surgery and 3–6 months after" },
    ],
    sections: [
      { heading: "Why Is Jaw Surgery Needed After a Cleft?", body: ["People born with a cleft lip and palate often have an underdeveloped upper jaw (midface hypoplasia), which gives a flat or ‘dish face’ profile. It also causes an abnormal bite: an underbite, or Class III malocclusion. Jaw (orthognathic) surgery corrects both the bite and the appearance of the face."] },
      { heading: "When Is It Done?", body: ["After 16 years of age, when the facial bones have finished growing. Your surgeon and orthodontist decide the timing by monitoring jaw growth. Orthodontic treatment (braces) is needed for 6 months to 1 year before surgery, and for 3–6 months after."] },
      { heading: "Tests and Planning", body: ["An OPG (a specialised X-ray of the jaws), a lateral cephalogram and a CT scan are taken. The operation is planned on specialised software using virtual surgical planning, which is also used to prepare the models and splints needed in theatre. Most patients need all wisdom teeth removed beforehand."] },
      {
        heading: "Types of Surgery",
        bullets: [
          "Le Fort I maxillary advancement — the upper jaw is cut and moved forward to correct the bite and improve the facial profile.",
          "Double-jaw surgery — depending on the deformity, the lower jaw may also be moved back, combined with the Le Fort I advancement, to achieve the same correction.",
        ],
      },
      {
        heading: "What the Surgery Involves",
        body: [
          "You are seen by the anaesthetist before surgery and admitted on the day of the operation, which takes about 2–3 hours under general anaesthesia.",
          "The jaws are cut, moved into the correct position and fixed with titanium plates and screws. All incisions are inside the mouth, so there are no scars on the face. The wounds are closed with absorbable stitches.",
        ],
      },
      {
        heading: "After Surgery",
        bullets: [
          "One night in the ICU, then the ward.",
          "Mild oozing of blood from the mouth is normal; soft diet for 3 weeks, with regular mouthwashes.",
          "Home after 3–4 days, with rubber bands fitted to the braces.",
          "Wound check after 1 week; the stitches are absorbable. Orthodontic treatment continues for 3–6 months once healed.",
        ],
      },
      { heading: "Possible Complications", body: [`Infection, bleeding, swelling and pain are the common complications; ${PAIN.toLowerCase()}. Numbness of the upper and lower lip from stretching of the nerves is common and temporary, though full recovery can take 6 months to 1 year. Speech can worsen after surgery and speech therapy may be needed; very rarely, speech surgery is required. Loss of teeth is a rare complication that may need dental rehabilitation.`] },
    ],
    faqs: [
      { q: "At what age is jaw surgery done for cleft patients?", a: "After 16 years of age, once the facial bones have finished growing." },
      { q: "Will there be scars on the face?", a: "No. All incisions are inside the mouth." },
      { q: "Is the lip numbness permanent?", a: "It is usually temporary, but full recovery can take 6 months to a year." },
      { q: "How long will braces be needed?", a: "Usually 6 months to 1 year before surgery and 3–6 months after." },
    ],
    sheet: `${PDF}/cleft/Patient-information-sheet-Corrective-Jaw-surgery.pdf`,
    seeAlso: "corrective-jaw-surgery-bangalore",
  },
  {
    slug: "cleft-rhinoplasty",
    parent: CLEFT,
    shortTitle: "Cleft Rhinoplasty",
    title: "Cleft Rhinoplasty in Bangalore",
    metaTitle: "Cleft Rhinoplasty Surgery in Bangalore | Dr Vybhav Deraje",
    description: "Cleft rhinoplasty after age 18 corrects the crooked nose, wide tip and deviated septum of cleft lip and palate: surgery, cartilage grafts and recovery.",
    lead: "People born with a cleft lip and palate usually have a nose difference too. Cleft rhinoplasty, normally the last operation in cleft care, corrects its shape and breathing once growth is complete.",
    cardText: "Nose and septum correction after 18 — usually the last cleft operation.",
    procedureName: "Cleft rhinoplasty with septoplasty",
    facts: [
      { label: "Usual Age", value: "after 18 years, once growth is complete" },
      { label: "Anaesthesia", value: "general, about 2–3 hours" },
      { label: "Hospital Stay", value: "home the next day" },
      { label: "Nasal Packs and Splint", value: "packs out after 1 day; splint off after 1 week" },
    ],
    sections: [
      { heading: "Why Is Rhinoplasty Done After a Cleft?", body: ["Most people with a cleft lip and palate also have a nose deformity: a crooked nose and a wide tip, often with a deviated septum that makes breathing difficult. Cleft rhinoplasty corrects the outer shape of the nose and, with a septoplasty, the breathing problem caused by the septum."] },
      { heading: "When Is It Done?", body: ["Usually after 18 years of age, once growth is complete. It is normally the last operation in the planned course of cleft treatment."] },
      {
        heading: "What the Surgery Involves",
        body: [
          "You are seen by the anaesthetist before surgery and admitted on the day of the operation, which takes about 2–3 hours under general anaesthesia.",
          "A small, hidden cut is made on the underside and inside of the nose, and the septum and nose are corrected. Sometimes cartilage is taken from a rib or the ear to rebuild the nose. You wake up with a nasal pack inside the nose and a splint on it, and usually go home the next day.",
        ],
      },
      {
        heading: "After Surgery",
        bullets: ["Mild oozing of blood from the nose and mouth is normal.", "The nasal packs come out after 1 day and the splint after 1 week.", "Wound check and stitch removal at 1 week."],
      },
      { heading: "Possible Complications", body: [`Infection, bleeding, swelling and pain are the common complications; ${PAIN.toLowerCase()}. If rib or ear cartilage is used, there is also a scar where it was taken. Cleft rhinoplasty is a very challenging operation, and in rare cases further surgery is needed to correct minor asymmetry.`] },
    ],
    faqs: [
      { q: "At what age is cleft rhinoplasty done?", a: "Usually after 18 years, once growth is complete. It is normally the last operation in cleft care." },
      { q: "Will it help my breathing?", a: "Yes, when a deviated septum is the cause — it is corrected in the same operation with a septoplasty." },
      { q: "Why might cartilage be taken from my rib or ear?", a: "Extra cartilage is sometimes needed to rebuild the nose. It leaves a scar where it was taken." },
    ],
    sheet: `${PDF}/cleft/Patient-information-sheet-Cleft-Rhinoplasty.pdf`,
    seeAlso: "rhinoplasty-surgery-bangalore",
  },

  /* ---- Hand ------------------------------------------------------------------------------------------------ */
  {
    slug: "carpal-tunnel-release",
    parent: HAND,
    shortTitle: "Carpal Tunnel Release",
    title: "Carpal Tunnel Release Surgery in Bangalore",
    metaTitle: "Carpal Tunnel Release Surgery in Bangalore | Dr Vybhav Deraje",
    description: "Carpal tunnel release under WALANT — wide awake, local anaesthesia, no tourniquet — as a 30-minute day-care procedure in Bangalore. Tests and recovery.",
    lead: "Carpal tunnel syndrome causes numbness, tingling, pain and weakness in the hand when the median nerve is squeezed at the wrist. Releasing the tunnel takes the pressure off the nerve.",
    cardText: "Day-care WALANT release for numbness and tingling from a compressed nerve.",
    procedureName: "Carpal tunnel release",
    facts: [
      { label: "Anaesthesia", value: "local, wide awake (WALANT), about 30 minutes" },
      { label: "Hospital Stay", value: "day care — home the same evening" },
      { label: "Back to Normal Activities", value: "the next day; jogging, gym and sport after 6 weeks" },
      { label: "Recovery", value: "stitches out at 2 weeks; hand physiotherapy for 3–6 months" },
    ],
    sections: [
      { heading: "What Is Carpal Tunnel Syndrome?", body: ["The median nerve runs through a tunnel at the wrist called the carpal tunnel. When it is compressed there, it causes numbness, pain, tingling and weakness in the part of the hand the nerve supplies. It is most common in people with diabetes or an underactive thyroid, in women during pregnancy, in people who use a computer for long hours and in people who are overweight."] },
      { heading: "How It Is Diagnosed", body: ["After a thorough examination by your hand surgeon, you may need an electromyogram (EMG) of the hand muscles, a nerve conduction study (NCS) and an ultrasound of the wrist."] },
      { heading: "WALANT: Wide-Awake Hand Surgery", body: ["Dr Vybhav Deraje performs carpal tunnel release with WALANT — Wide Awake, Local Anaesthesia, No Tourniquet. You stay awake, the hand is numbed with local anaesthetic and no tourniquet is needed, so you remain comfortable throughout."] },
      { heading: "What the Surgery Involves", body: ["You are admitted on the day of surgery. Through a small cut at the wrist the tunnel is released, which takes about 30 minutes. The wound is stitched and covered with a waterproof dressing, and a splint supports the hand and reduces pain and swelling. You go home the same evening with painkillers and antibiotics."] },
      {
        heading: "Recovery",
        bullets: [
          "Wound check after 1 week; stitches removed after 2 weeks.",
          "Most swelling settles within a week, but symptoms usually begin to improve from about 6 weeks, once swelling and bruising have gone.",
          "Full recovery of the nerve can take 6 months to 1 year, with hand physiotherapy for 3–6 months.",
          "Normal activities from the next day; jogging, gym and sport after 6 weeks.",
        ],
      },
      { heading: "Possible Complications", body: [`Infection, bleeding, swelling, bruising and pain are the common complications. There will be a scar on the wrist, which usually settles well with scar treatment. If surgery is delayed until the nerve has been permanently damaged, recovery may be incomplete.`] },
    ],
    faqs: [
      { q: "Will I be awake during carpal tunnel surgery?", a: "Yes. With WALANT the hand is numbed with local anaesthetic and no tourniquet is used, so you are awake and comfortable throughout the 30-minute procedure." },
      { q: "When will the numbness and tingling improve?", a: "Improvement usually starts from about 6 weeks, once swelling has settled; full nerve recovery can take 6 months to a year." },
      { q: "When can I go back to work?", a: "Normal activities can resume the next day; strenuous activity such as gym and sport after 6 weeks." },
      { q: "Why should I not delay surgery?", a: "If the nerve becomes permanently damaged before it is released, recovery may be incomplete." },
    ],
    sheet: `${PDF}/Plastic-Surgery-of-Hand/Patient-information-sheet-Carpal-tunnel-release.pdf`,
  },
  {
    slug: "trigger-finger-release",
    parent: HAND,
    shortTitle: "Trigger Finger Release",
    title: "Trigger Finger Release Surgery in Bangalore",
    metaTitle: "Trigger Finger Release Surgery in Bangalore | Dr Vybhav Deraje",
    description: "Trigger finger release under WALANT in Bangalore: a 30-minute day-care procedure with immediate relief of locking. Tests, the procedure and recovery.",
    lead: "In trigger finger, a finger catches or locks as it bends, often with pain and a snap. Releasing the A1 pulley at the base of the finger frees it, and relief is usually immediate.",
    cardText: "Day-care WALANT release for a finger that catches or locks.",
    procedureName: "Trigger finger release (A1 pulley release)",
    facts: [
      { label: "Anaesthesia", value: "local, wide awake (WALANT), about 30 minutes" },
      { label: "Hospital Stay", value: "day care — home the same evening" },
      { label: "Relief", value: "immediate" },
      { label: "Back to Normal Activities", value: "the next day; jogging, gym and sport after 6 weeks" },
    ],
    sections: [
      { heading: "What Is Trigger Finger?", body: ["Trigger finger is when a finger gets locked in one position as you move it. It can be present from birth (congenital) or develop later (acquired). It can cause pain and an unsettling snap when you bend and straighten the finger, and you may feel a nodule at the base of the finger. The nodule catches on a band of tissue called the A1 pulley, causing the triggering."] },
      { heading: "How It Is Diagnosed", body: ["After a thorough examination by your hand surgeon, an ultrasound or MRI of the hand may be needed."] },
      { heading: "WALANT: Wide-Awake Hand Surgery", body: ["Dr Vybhav Deraje performs trigger finger release with WALANT — Wide Awake, Local Anaesthesia, No Tourniquet. You stay awake, the hand is numbed with local anaesthetic and no tourniquet is needed, so you remain comfortable throughout."] },
      { heading: "What the Surgery Involves", body: ["You are admitted on the day of surgery. Through a small cut at the base of the affected finger, the A1 pulley is released in about 30 minutes, and you feel the improvement straight away when you move the finger. A splint supports the hand and reduces pain and swelling, and you go home the same evening with painkillers and antibiotics."] },
      {
        heading: "Recovery",
        bullets: ["Wound check after 1 week; stitches removed after 2 weeks.", "Relief is immediate, though hand physiotherapy may be needed for 3–6 months.", "Normal activities from the next day; jogging, gym and sport after 6 weeks."],
      },
      { heading: "Possible Complications", body: ["Infection, bleeding, swelling, bruising and pain are the common complications. There will be a scar on the hand, which usually settles well with scar treatment. Recurrence is possible but rare."] },
    ],
    faqs: [
      { q: "Will the finger stop locking straight away?", a: "Yes. The improvement is felt immediately when you move the finger after the pulley is released." },
      { q: "Can trigger finger come back after surgery?", a: "Recurrence is possible but rare." },
      { q: "Will I be awake?", a: "Yes. The procedure is done wide awake under local anaesthesia, without a tourniquet." },
    ],
    sheet: `${PDF}/Plastic-Surgery-of-Hand/Patient-information-sheet-Trigger-finger-release.pdf`,
  },
  {
    slug: "syndactyly-release",
    parent: HAND,
    shortTitle: "Syndactyly Release",
    title: "Syndactyly Release Surgery in Bangalore",
    metaTitle: "Syndactyly Release Surgery in Bangalore | Dr Vybhav Deraje",
    description: "Syndactyly release for fused or webbed fingers, usually before age 1: day-care surgery with skin grafts, recovery and physiotherapy, in Bangalore.",
    lead: "Syndactyly is a condition present from birth in which two or more fingers are joined. Separating them before the first birthday lets the hand grow and work normally.",
    cardText: "Separating fused fingers before age one, with skin grafts.",
    procedureName: "Syndactyly release with skin grafting",
    facts: [
      { label: "Usual Age", value: "before 1 year" },
      { label: "Anaesthesia", value: "general, about 2–3 hours" },
      { label: "Hospital Stay", value: "day care — home the same evening" },
      { label: "Skin Graft", value: "usually from the groin" },
    ],
    sections: [
      { heading: "What Is Syndactyly?", body: ["Syndactyly is an abnormal fusion of two or more fingers, present from birth. It is sometimes associated with differences of the face, skull or other organs and can be part of a syndrome. It can significantly limit hand function and restrict the normal growth of the hand as your child grows."] },
      { heading: "Tests Before Surgery", body: ["A thorough examination by a paediatrician is needed to rule out other congenital problems."] },
      { heading: "When Is It Done?", body: ["Usually before 1 year of age, so the hand can function normally as your child develops."] },
      {
        heading: "What the Surgery Involves",
        body: [
          "Your child is seen by the paediatric anaesthetist before surgery and admitted on the day of the operation, which takes about 2–3 hours under general anaesthesia.",
          "The fingers are separated and the resulting wounds are resurfaced with skin grafts, usually taken from the groin and fixed with absorbable stitches. A dressing and a splint support the hand. Your child goes home the same evening with painkillers and antibiotics.",
        ],
      },
      { heading: "Recovery", bullets: ["Wound check after 1 week.", "Hand physiotherapy may be needed for 3–6 months."] },
      { heading: "Possible Complications", body: ["Infection, bleeding, swelling, bruising and pain are the common complications. There will be a scar on the hand, which usually settles well with scar treatment. Loss of the skin graft is rare; if it happens, grafting may have to be repeated."] },
    ],
    faqs: [
      { q: "At what age is syndactyly surgery done?", a: "Usually before 1 year of age, so the hand can develop and function normally." },
      { q: "Where does the skin graft come from?", a: "Usually from the groin." },
      { q: "Will my child stay in hospital overnight?", a: "No. It is a day-care procedure, and your child goes home the same evening." },
    ],
    sheet: `${PDF}/Plastic-Surgery-of-Hand/Patient-information-sheet-Syndactyly-release.pdf`,
  },

  /* ---- Face ------------------------------------------------------------------------------------------------ */
  {
    slug: "endoscopic-scarless-forehead-surgery",
    parent: FACE,
    shortTitle: "Endoscopic Scarless Forehead Surgery",
    title: "Endoscopic Scarless Forehead Surgery in Bangalore",
    metaTitle: "Endoscopic Forehead Lump Removal in Bangalore | Dr Vybhav Deraje",
    description: "Forehead lumps such as osteomas, lipomas and dermoid cysts removed endoscopically through the hairline, leaving no forehead scar. Day care in Bangalore.",
    lead: "Lumps on the forehead — osteomas, lipomas, dermoid cysts — can be removed through a small cut hidden in the hairline, using an endoscope, so no scar is left on the forehead.",
    cardText: "Forehead lumps removed through the hairline, with no forehead scar.",
    procedureName: "Endoscopic removal of forehead lesions",
    facts: [
      { label: "Treats", value: "osteomas, lipomas, dermoid cysts and similar forehead lumps" },
      { label: "Anaesthesia", value: "general, about 1 hour" },
      { label: "Hospital Stay", value: "day care — home the same evening" },
      { label: "Back to Normal Activities", value: "the next day; jogging, gym and sport after 3 weeks" },
    ],
    sections: [
      { heading: "What Is It For?", body: ["Endoscopic scarless forehead surgery removes lumps on the forehead — such as osteomas, lipomas and dermoid cysts — without leaving a scar on the forehead."] },
      { heading: "What the Surgery Involves", body: ["You are seen by the anaesthetist before surgery and admitted on the day of the operation, which takes about 1 hour under general anaesthesia. A small cut is made inside the hairline and the lump is removed with endoscopic instruments, so there is no visible scar. The wound is stitched and you go home the same evening with painkillers and antibiotics."] },
      {
        heading: "Recovery",
        bullets: [
          "Swelling and bruising of the forehead and around the eyes is normal.",
          "Wound check and stitch removal after 1 week.",
          "Most swelling settles in a week; the final result shows at about 6 weeks.",
          "Normal activities from the next day; jogging, gym and sport after 3 weeks.",
        ],
      },
      { heading: "Possible Complications", body: [`Infection, bleeding, swelling, bruising and pain are the common complications; ${PAIN.toLowerCase()}. Recurrence of the lump is a remote possibility whichever surgical method is used.`] },
    ],
    faqs: [
      { q: "Which forehead lumps can be removed this way?", a: "Osteomas, lipomas, dermoid cysts and similar lesions of the forehead." },
      { q: "Will there be a scar?", a: "Only a small one inside the hairline. There is no scar on the forehead itself." },
      { q: "When can I return to normal activities?", a: "The next day. Jogging, gym and sport can resume after 3 weeks." },
    ],
    sheet: `${PDF}/Plastic-Surgery-of-Face/Patient-information-sheet-Endoscopic-scarless-forehead-surgery.pdf`,
  },
  {
    slug: "fat-grafting",
    parent: FACE,
    shortTitle: "Fat Grafting",
    title: "Fat Grafting to the Face in Bangalore",
    metaTitle: "Fat Grafting to the Face in Bangalore | Dr Vybhav Deraje",
    description: "Facial fat grafting with your own microfat or nanofat to restore volume and improve skin and scars. Day care in Bangalore: how it works and results.",
    lead: "Fat grafting moves your own fat, from the tummy or thigh, to the face. Microfat restores lost volume; nanofat improves the texture of skin and scars.",
    cardText: "Your own microfat or nanofat for facial volume, skin and scars.",
    procedureName: "Facial fat grafting (microfat and nanofat)",
    facts: [
      { label: "Anaesthesia", value: "general or local, about 1 hour" },
      { label: "Hospital Stay", value: "day care — home the same evening" },
      { label: "Fat Retained", value: "about 60 percent; more than one session may be needed" },
      { label: "Back to Normal Activities", value: "the next day; jogging, gym and sport after 3 weeks" },
    ],
    sections: [
      { heading: "What Is Fat Grafting?", body: ["Fat is taken from your tummy or thigh, processed and transferred to your face, either to correct contour deformities by restoring volume or to improve the texture of the skin and scars."] },
      {
        heading: "Microfat and Nanofat",
        bullets: ["Microfat — used to correct contour deformities and fill volume in the face.", "Nanofat — used to improve the texture of the skin and scars and to rejuvenate the skin."],
      },
      { heading: "What the Procedure Involves", body: ["You are seen by the anaesthetist beforehand and admitted on the day, and the procedure takes about 1 hour under general or local anaesthesia. Fat is taken from your tummy or thighs with liposuction equipment, processed into microfat or nanofat, and transferred to the face with a special needle and syringe. There are no surgical scars. You go home the same evening."] },
      {
        heading: "Recovery",
        bullets: [
          "Swelling and bruising are normal.",
          "Check-up after 1 week.",
          "Most swelling settles in a week; the final result shows at about 6 weeks.",
          "Normal activities from the next day; jogging, gym and sport after 3 weeks.",
        ],
      },
      { heading: "Results and Possible Complications", body: [`Infection, bleeding, swelling, bruising and pain are the common complications; ${PAIN.toLowerCase()}. Some of the injected fat is absorbed by the body — about 60 percent stays in place — so even with deliberate overfilling, more than one session may be needed for the best result.`] },
    ],
    faqs: [
      { q: "How much of the grafted fat stays?", a: "About 60 percent is retained; the rest is absorbed by the body." },
      { q: "Will I need more than one session?", a: "Sometimes. Even with overfilling, a further session may be needed for the best result." },
      { q: "What is the difference between microfat and nanofat?", a: "Microfat restores volume and corrects contour; nanofat improves the texture of the skin and scars." },
    ],
    sheet: `${PDF}/Plastic-Surgery-of-Face/Patient-information-sheet-Fat-grafting.pdf`,
  },

  /* ---- Breast ---------------------------------------------------------------------------------------------- */
  {
    slug: "breast-lift-mastopexy",
    parent: BREAST,
    shortTitle: "Breast Lift (Mastopexy)",
    title: "Breast Lift (Mastopexy) in Bangalore",
    metaTitle: "Breast Lift Surgery (Mastopexy) in Bangalore | Dr Vybhav Deraje",
    description: "Breast lift (mastopexy) for deflated, sagging breasts, alone or with an implant: incision types, day-care surgery, recovery and breastfeeding, Bangalore.",
    lead: "A breast lift reshapes deflated or sagging breasts so they sit higher and look perkier. Combined with an implant, it can also increase breast size.",
    cardText: "Lifts and reshapes sagging breasts; can be combined with an implant.",
    procedureName: "Mastopexy (breast lift)",
    facts: [
      { label: "Anaesthesia", value: "general, about 1 hour" },
      { label: "Hospital Stay", value: "day care — home the same evening" },
      { label: "Back to Normal Activities", value: "the next day; jogging, gym and sport after 3 weeks" },
      { label: "Final Result", value: "at about 6 weeks" },
    ],
    sections: [
      { heading: "Why Is a Breast Lift Done?", body: ["A breast lift (mastopexy) gives more projection to deflated, sagging breasts and makes them perkier. Combined with an implant, it can also increase the size of the breasts."] },
      {
        heading: "Types of Breast Lift",
        body: ["A lift can be done on its own or with augmentation, where an implant is inserted too. Depending on how much lift is needed, the incision is:"],
        bullets: ["around the nipple (circumareolar)", "a vertical scar", "an inverted T shape"],
      },
      { heading: "What the Surgery Involves", body: ["You are seen by the anaesthetist before surgery and admitted on the day of the operation, which takes about 1 hour under general anaesthesia. The breast is reshaped through the chosen incision, sometimes with an implant inserted, and the wounds are closed with absorbable stitches. You go home the same evening with painkillers and antibiotics, wearing a comfortable sports bra."] },
      {
        heading: "Recovery",
        bullets: ["Check-up after 1 week.", "Most swelling settles in a week; the final result shows at about 6 weeks.", "Normal activities from the next day; jogging, gym and sport after 3 weeks."],
      },
      { heading: "Possible Complications", body: [`Infection, bleeding, swelling, bruising and pain are the common complications; ${PAIN.toLowerCase()}.`] },
      { heading: "Breastfeeding After a Breast Lift", body: ["Many women have breastfed after this surgery, but feeding difficulties can occur. It is best to have a breast lift after you have completed your family."] },
    ],
    faqs: [
      { q: "Can I breastfeed after a breast lift?", a: "Many women have, but feeding difficulties can occur, so the surgery is best done after you have completed your family." },
      { q: "Can a breast lift be combined with implants?", a: "Yes. Adding an implant increases breast size as well as lifting the breast." },
      { q: "When can I exercise again?", a: "Normal activities from the next day; jogging, gym and sport after 3 weeks." },
    ],
    sheet: `${PDF}/Plastic-surgery-of-Breast/Patient-information-sheet-Breast-lift.pdf`,
    seeAlso: "breast-augmentation-surgery-bangalore",
  },
  {
    slug: "breast-reconstruction-after-cancer",
    parent: BREAST,
    shortTitle: "Breast Reconstruction After Cancer",
    title: "Breast Reconstruction After Cancer in Bangalore",
    metaTitle: "Breast Reconstruction After Cancer in Bangalore | Dr Vybhav Deraje",
    description: "Breast reconstruction after cancer surgery using DIEP, MS-TRAM, TUG or LD flaps with microsurgery, sometimes with implants: surgery, recovery, next steps.",
    lead: "After the cancer surgeon removes a breast cancer, a plastic surgeon rebuilds the breast — usually with your own tissue, joined by microsurgery.",
    cardText: "Rebuilding the breast with your own tissue (DIEP, TUG, LD flaps) after cancer.",
    procedureName: "Breast reconstruction (autologous free flap)",
    facts: [
      { label: "Planning", value: "multidisciplinary — cancer surgeon, plastic surgeon and medical oncologist" },
      { label: "Anaesthesia", value: "general, about 5–6 hours" },
      { label: "Hospital Stay", value: "first night in the ICU; home after 5–6 days" },
      { label: "Further Procedures", value: "symmetry and fat grafting from 3 months; nipple reconstruction later" },
    ],
    sections: [
      {
        heading: "Breast Cancer and Its Treatment",
        body: [
          "The most common breast cancer is ductal carcinoma; other breast tumours include lobular carcinoma, giant phyllodes tumour, angiosarcoma and lymphoma. Breast cancer can spread to the lymph nodes in the armpit, neck and chest, and to distant organs such as the lungs, liver, brain and spine.",
          "Diagnosis starts with a thorough examination by your onco-surgeon or breast surgeon, followed by a mammogram, ultrasound and tissue biopsy. Further scans — such as an abdominal ultrasound, spine and chest X-rays or a CT scan of the head — may be done to check whether it has spread.",
          "Treatment is planned at a multidisciplinary meeting of the cancer surgeon, plastic surgeon and medical oncologist, and may combine surgery, radiotherapy and chemotherapy.",
        ],
      },
      {
        heading: "Reconstruction Options",
        body: [
          "The onco-surgeon or breast surgeon removes the cancer with a generous margin of normal tissue. The plastic surgeon then rebuilds the breast using your own tissue, sometimes with an implant as well:",
        ],
        bullets: [
          "Tummy tissue (DIEP or MS-TRAM flap) — the most common method; it also gives you the effect of a tummy tuck.",
          "Upper thigh tissue (TUG flap) — used if there is not enough tummy tissue or the other breast is very small.",
          "Back tissue with an implant (LD flap) — used in some cases.",
        ],
      },
      { heading: "Microsurgery", body: ["These reconstructions use microsurgical techniques: under an advanced operating microscope, the blood vessels of the transferred tissue are joined to blood vessels at the chest so the tissue survives in its new place."] },
      { heading: "What the Surgery Involves", body: ["You are seen by the anaesthetist beforehand. The operation takes about 5–6 hours under general anaesthesia, depending on the plan. After the cancer is removed, the plastic surgeon reconstructs the defect according to the tissue lost and your condition; silicone implants are sometimes needed. Drains are placed in the breast, armpit and tummy, a blood transfusion is occasionally needed, and blood-thinning medicines keep the joined vessels open. The first night is spent in the ICU."] },
      {
        heading: "After Surgery",
        bullets: [
          "Doctors and nurses monitor the flap closely and continuously, with regular blood tests and IV fluids.",
          "A comfortable sports bra is worn after surgery, and the drains are removed gradually.",
          "Home usually after 5–6 days; wound check and stitch removal at 1 week, then regular follow-up with your cancer surgeon and plastic surgeon until healing is complete.",
        ],
      },
      { heading: "Possible Complications", body: [`Infection, bleeding, swelling, bruising and pain are the common complications; ${PAIN.toLowerCase()}. The main specific risk is flap failure from blockage of the joined blood vessels; this may mean a return to theatre to restore blood flow, and very rarely the whole flap is lost and a further operation is needed. Recurrence of the cancer must also be kept in mind.`] },
      { heading: "Further Procedures", body: ["Some asymmetry between the breasts may remain. A lift or reduction of the other breast, and fat grafting to smooth the reconstructed breast, can be done together about 3 months after the first operation. Later, the nipple can be reconstructed in a minor procedure under local anaesthesia, and the areola recreated with tattooing."] },
    ],
    faqs: [
      { q: "Which tissue is used to rebuild the breast?", a: "Most often tissue from the tummy (DIEP or MS-TRAM flap). Upper thigh tissue (TUG flap) or back tissue with an implant (LD flap) are used in some cases." },
      { q: "How long is the hospital stay?", a: "Usually 5–6 days, starting with a night in the ICU." },
      { q: "Will both breasts match?", a: "Some asymmetry may remain. A lift or reduction of the other breast and fat grafting can be done together about 3 months later." },
      { q: "Can the nipple be reconstructed?", a: "Yes, later, in a minor procedure under local anaesthesia; the areola can be recreated with tattooing." },
    ],
    sheet: `${PDF}/Plastic-surgery-of-Breast/Patient-information-sheet-Breast-cancer-reconstruction.pdf`,
  },

  /* ---- Body ------------------------------------------------------------------------------------------------ */
  {
    slug: "arm-lift-brachioplasty",
    parent: BODY,
    shortTitle: "Arm Lift (Brachioplasty)",
    title: "Arm Lift (Brachioplasty) in Bangalore",
    metaTitle: "Arm Lift Surgery (Brachioplasty) in Bangalore | Dr Vybhav Deraje",
    description: "Arm lift (brachioplasty) removes loose skin and fat from the upper arms, often after weight loss: day-care surgery, hidden scar and recovery, Bangalore.",
    lead: "Loose skin and stubborn fat on the upper arms often persist despite diet and exercise, especially after major weight loss. An arm lift removes the excess and hides the scar on the inner arm.",
    cardText: "Removes loose skin and fat from the upper arms; scar on the inner arm.",
    procedureName: "Brachioplasty (arm lift)",
    facts: [
      { label: "Anaesthesia", value: "general, about 1–2 hours" },
      { label: "Hospital Stay", value: "day care — home the same evening" },
      { label: "Back to Normal Activities", value: "the next day; jogging, gym and sport after 6 weeks" },
      { label: "Aftercare", value: "compression garments; scar treatment for 3–6 months if advised" },
    ],
    sections: [
      { heading: "Who Is It For?", body: ["An arm lift (brachioplasty) removes excess fat and loose skin from the upper arms and is sometimes combined with liposuction. This area is particularly frustrating because the fat and loose skin persist despite diet and lifestyle changes. People who have had weight-loss surgery often have loose skin here too."] },
      { heading: "What the Surgery Involves", body: ["You are seen by the anaesthetist before surgery and admitted on the day of the operation, which takes about 1–2 hours under general anaesthesia. An elliptical piece of excess skin is removed and the wound is closed lengthwise along the inner arm, where the scar is hidden, with absorbable stitches. Any liposuction is done through tiny stab incisions that are not noticeable. Waterproof dressings are applied and you go home the same evening, wearing compression garments."] },
      {
        heading: "Recovery",
        bullets: ["Check-up after 1 week.", "Most swelling settles in a week; the final result shows at about 6 weeks.", "Normal activities from the next day; jogging, gym and sport after 6 weeks."],
      },
      { heading: "Possible Complications", body: [`Infection, bleeding, swelling, bruising and pain are the common complications; ${PAIN.toLowerCase()}. Some asymmetry can remain and occasionally needs more than one sitting to correct. The scar is usually well hidden, but scar treatment for 3–6 months may be advised.`] },
    ],
    faqs: [
      { q: "Where is the scar after an arm lift?", a: "Along the inner side of the upper arm, where it is usually well hidden." },
      { q: "Is an arm lift suitable after weight-loss surgery?", a: "Yes. Loose skin on the arms after weight-loss surgery is one of the common reasons for it." },
      { q: "When can I go back to the gym?", a: "After 6 weeks. Normal daily activities can resume the next day." },
    ],
    sheet: `${PDF}/Plastic-Surgery-of-Body/Patient-information-sheet-Brachiaplasty.pdf`,
    seeAlso: "liposuction-surgery-bangalore",
  },
  {
    slug: "thigh-lift-thighplasty",
    parent: BODY,
    shortTitle: "Thigh Lift (Thighplasty)",
    title: "Thigh Lift (Thighplasty) in Bangalore",
    metaTitle: "Thigh Lift Surgery (Thighplasty) in Bangalore | Dr Vybhav Deraje",
    description: "Thigh lift (thighplasty) removes loose skin and fat from the inner thighs, often after weight loss: day-care surgery, hidden scar and recovery, Bangalore.",
    lead: "Loose skin and stubborn fat on the inner thighs can persist despite diet and exercise, especially after major weight loss. A thigh lift removes the excess, with the scar placed along the inner thigh.",
    cardText: "Removes loose skin and fat from the thighs; scar on the inner thigh.",
    procedureName: "Thighplasty (thigh lift)",
    facts: [
      { label: "Anaesthesia", value: "general, about 1–2 hours" },
      { label: "Hospital Stay", value: "day care — home the same evening" },
      { label: "Back to Normal Activities", value: "the next day; jogging, gym and sport after 6 weeks" },
      { label: "Aftercare", value: "compression garments; scar treatment for 3–6 months if advised" },
    ],
    sections: [
      { heading: "Who Is It For?", body: ["A thigh lift (thighplasty) removes excess fat and loose skin from the thighs and is sometimes combined with liposuction. This area is particularly frustrating because the fat and loose skin persist despite diet and lifestyle changes. People who have had weight-loss surgery often have loose skin here too."] },
      { heading: "What the Surgery Involves", body: ["You are seen by the anaesthetist before surgery and admitted on the day of the operation, which takes about 1–2 hours under general anaesthesia. An elliptical piece of excess skin is removed and the wound is closed lengthwise along the inner thigh, where the scar is hidden, with absorbable stitches. Any liposuction is done through tiny stab incisions that are not noticeable. Waterproof dressings are applied and you go home the same evening, wearing compression garments."] },
      {
        heading: "Recovery",
        bullets: ["Check-up after 1 week.", "Most swelling settles in a week; the final result shows at about 6 weeks.", "Normal activities from the next day; jogging, gym and sport after 6 weeks."],
      },
      { heading: "Possible Complications", body: [`Infection, bleeding, swelling, bruising and pain are the common complications; ${PAIN.toLowerCase()}. Some asymmetry can remain and occasionally needs more than one sitting to correct. The scar is usually well hidden, but scar treatment for 3–6 months may be advised.`] },
    ],
    faqs: [
      { q: "Where is the scar after a thigh lift?", a: "Along the inner side of the thigh, where it is usually well hidden." },
      { q: "Can a thigh lift be combined with liposuction?", a: "Yes. Liposuction is often done in the same operation through tiny incisions." },
      { q: "When can I go back to the gym?", a: "After 6 weeks. Normal daily activities can resume the next day." },
    ],
    sheet: `${PDF}/Plastic-Surgery-of-Body/Patient-information-sheet-Thighplasty.pdf`,
    seeAlso: "liposuction-surgery-bangalore",
  },
];

export function subProcedurePath(p: Pick<SubProcedure, "parent" | "slug">): string {
  return `${servicePath(p.parent)}/${p.slug}`;
}

export function getSubProcedure(parent: string, slug: string): SubProcedure | undefined {
  return SUB_PROCEDURES.find((p) => p.parent === parent && p.slug === slug);
}

export function subProceduresOf(parent: string): SubProcedure[] {
  return SUB_PROCEDURES.filter((p) => p.parent === parent);
}

/** Page for a patient-information sheet, if one exists — used to link the sheet lists on the parent pages. */
export function subProcedureForSheet(sheet: string): SubProcedure | undefined {
  return SUB_PROCEDURES.find((p) => p.sheet === sheet);
}
