/**
 * Procedure pages added on 22 Oct 2026, when the practice narrowed its public focus to 14 named
 * procedures (4 craniofacial, 10 cosmetic). The three legacy hub pages (face / breast / body) keep
 * their one-paragraph summaries and link here for the full page.
 *
 * SOURCE AND REVIEW STATUS
 * - The cosmetic pages expand the doctor's own paragraphs from the live site (anaesthesia, admission,
 *   recovery times, techniques) and the legacy patient-information sheets; no new clinical claims
 *   are intended. Where a page adds general patient-education material that was not on the live
 *   site (who is a candidate, limitations, what to ask) it is written in general, non-promissory
 *   language. The doctor must still review every page before launch — see docs/CONTENT-APPROVAL.md.
 * - Ear reconstruction had NO content on the live site. That page is a draft written from standard
 *   craniofacial practice and MUST be confirmed by the doctor (techniques he offers, ages, staging,
 *   hearing pathway) before it is published.
 */
import { servicePath, type ServiceSlug } from "./routes";
import type { ServicePage } from "./content";

const PDF = "/images/pdf";

function page(p: Omit<ServicePage, "path">): ServicePage {
  return { ...p, path: servicePath(p.slug) };
}

const FACE: ServiceSlug = "face-plastic-surgery-bangalore";
const BREAST: ServiceSlug = "breast-plastic-surgeon-bangalore";
const BODY: ServiceSlug = "body-plastic-surgeon-bangalore";

const CONSULT_FAQ = { q: "Is a consultation a commitment to surgery?", a: "No. Use the consultation to understand your options, alternatives, limitations and recovery, then take the time you need to decide." };
const COST_FAQ = { q: "Can I get a cost estimate?", a: "Yes — after assessment the clinic gives an individual estimate. Ask what it includes: hospital charges, anaesthesia, implants and follow-up." };

export const PROCEDURE_PAGES: ServicePage[] = [
  /* ---------------------------------------------------------------------------------------------
   * Craniofacial
   * ------------------------------------------------------------------------------------------- */
  page({
    slug: "ear-reconstruction-surgery-bangalore",
    group: "craniofacial",
    shortTitle: "Ear Reconstruction",
    title: "Ear Reconstruction for Microtia and Ear Loss in Bangalore",
    metaTitle: "Ear Reconstruction in Bangalore — Microtia Surgery | Dr Vybhav Deraje",
    description: "Ear Reconstruction in Bangalore by Dr Vybhav Deraje: staged rib-cartilage reconstruction for Microtia, options after injury or cancer, and the hearing pathway.",
    eyebrow: "Craniofacial Surgery · Ear Reconstruction",
    lead: "Rebuilding an ear that is small or absent from birth (Microtia), or lost through injury or cancer surgery — planned together with the hearing team.",
    cardText: "Staged reconstruction for Microtia and for ears lost to injury or cancer surgery.",
    intro: [
      "Microtia is a condition present at birth in which the outer ear is small, misshapen or absent. It is usually on one side and is often accompanied by a narrow or closed ear canal, so hearing on that side is affected. The ear can also be lost or badly damaged later in life through trauma, burns or cancer surgery.",
      "Ear Reconstruction recreates the shape of the outer ear. Hearing is assessed and managed separately with an ENT surgeon and audiologist, so the overall plan covers both appearance and hearing.",
    ],
    sections: [
      {
        heading: "Who Ear Reconstruction Is For",
        bullets: [
          "Children born with Microtia (grade II–III) or anotia, once they are old enough for reconstruction.",
          "Adults with untreated Microtia.",
          "Adults and children who have lost part or all of the ear through injury, burns, animal bite or removal of a skin cancer.",
          "Patients with an unsatisfactory earlier reconstruction who want a revision opinion.",
        ],
      },
      {
        heading: "How the Ear Is Reconstructed",
        body: [
          "The standard technique uses the patient's own rib cartilage. Cartilage is taken from the chest, carved into a framework that mirrors the other ear, and placed under the skin where the ear should be. In a second stage some months later, the framework is lifted away from the head and a skin graft is used to create the groove behind the ear so it projects like the normal side.",
          "Reconstruction with the patient's own cartilage is usually done from about 8–10 years of age, when the chest is large enough to provide the cartilage and the child can take part in the decision. An alternative using a porous polyethylene implant covered by a tissue flap can be considered in selected cases; the choice depends on age, the other ear, the available skin and the family's preferences, and is discussed in detail at consultation.",
          "For ears lost to injury or cancer, the same principles apply, but the plan depends on how much of the ear and surrounding skin remains. Partial losses can sometimes be repaired in a single operation.",
        ],
      },
      {
        heading: "Hearing and the Wider Team",
        body: [
          "Children with Microtia should have a hearing assessment early in life, and a bone-conduction hearing aid may be recommended long before Ear Reconstruction is possible. Where the ear canal is closed, the decision about canal surgery is made with the ENT surgeon and is sequenced around the reconstruction so that neither compromises the other.",
          "Dr Vybhav Deraje plans Ear Reconstruction with the ENT and audiology team, drawing on his craniofacial fellowship training at the Australian Craniofacial Unit, Adelaide.",
        ],
      },
      {
        heading: "Anaesthesia, Hospital Stay and Recovery",
        body: [
          "Each stage is done under general anaesthesia with a short hospital stay. The chest wound from cartilage harvest is the most uncomfortable part of the first stage and settles over one to two weeks. A dressing protects the new ear for the first weeks, and contact sports and pressure on the ear are avoided for several months.",
          "The reconstructed ear continues to settle for a year or more. Minor refinements are sometimes offered once it has matured.",
        ],
      },
      {
        heading: "Limitations to Understand",
        body: [
          "A reconstructed ear is made from cartilage and skin graft and will not be identical to the normal ear; the aim is a natural-looking ear of similar size and position. It does not itself improve hearing. The chest leaves a scar, and there is a small risk of infection, skin breakdown over the framework or cartilage absorption, any of which can need further surgery. These points are discussed openly before any decision is made.",
        ],
      },
    ],
    faqs: [
      { q: "At what age can Microtia be corrected?", a: "Reconstruction with the child's own rib cartilage is usually planned from about 8–10 years of age, when enough cartilage is available and the child can take part in the decision. Hearing assessment and a bone-conduction aid, where needed, start much earlier." },
      { q: "How many operations does Ear Reconstruction need?", a: "Rib-cartilage reconstruction is usually done in two stages a few months apart: the first creates and places the cartilage framework, the second lifts the ear away from the head with a skin graft. Occasional refinements may follow." },
      { q: "Will Ear Reconstruction improve my child's hearing?", a: "No. Reconstruction recreates the outer ear only. Hearing is managed separately with the ENT surgeon and audiologist, usually with a hearing aid and sometimes with ear canal surgery sequenced around the reconstruction." },
      { q: "Can an ear lost in an accident or after cancer surgery be rebuilt?", a: "Yes. The same cartilage-framework principles apply, adapted to how much of the ear and surrounding skin remains. Partial losses can sometimes be repaired in one operation." },
      CONSULT_FAQ,
    ],
    conditions: ["Microtia", "Anotia", "Traumatic ear loss", "Post-cancer ear defect"],
    procedures: ["Autologous rib cartilage Ear Reconstruction", "Alloplastic (porous polyethylene) Ear Reconstruction", "Ear elevation with skin graft"],
    related: ["otoplasty-ear-correction-bangalore", "craniosynostosis-surgery-bangalore", "other-craniofacial-conditions-treatments"],
  }),

  /* ---------------------------------------------------------------------------------------------
   * Cosmetic — face
   * ------------------------------------------------------------------------------------------- */
  page({
    slug: "rhinoplasty-surgery-bangalore",
    infoSheet: `${PDF}/Plastic-Surgery-of-Face/Patient-information-sheet-Rhinoplasty.pdf`,
    group: "cosmetic",
    parent: FACE,
    shortTitle: "Rhinoplasty",
    title: "Rhinoplasty (Nose Reshaping Surgery) in Bangalore",
    metaTitle: "Rhinoplasty in Bangalore — Nose Reshaping Surgery | Dr Vybhav Deraje",
    description: "Rhinoplasty in Bangalore by Dr Vybhav Deraje, plastic & craniofacial surgeon: reshaping the nose, Septoplasty for breathing, anaesthesia, splint and recovery explained.",
    eyebrow: "Cosmetic Surgery · Face",
    lead: "Surgery to correct the shape of the nose or refine its appearance — often combined with Septoplasty when breathing is also a problem.",
    cardText: "Reshaping the nose, with Septoplasty when breathing is affected. One-day admission.",
    intro: [
      "Rhinoplasty changes the shape of the nose: a hump on the bridge, a wide or drooping tip, a crooked nose after injury, or a nose that feels out of proportion with the rest of the face. When a deviated septum blocks breathing, Septoplasty is done at the same time.",
      "Dr Vybhav Deraje presented award-category work on Rhinoplasty outcome evaluation at APSICON 2015 and treats both cosmetic and post-traumatic noses, as well as cleft noses as part of cleft care.",
    ],
    sections: [
      {
        heading: "What Rhinoplasty Can Address",
        bullets: ["A hump or bump on the bridge of the nose", "A bulbous, wide or drooping nasal tip", "A nose that is crooked or deviated, often after an injury", "A nose that is too large or too long for the face", "Nasal blockage from a deviated septum (combined Septorhinoplasty)", "Deformity after a previous nose operation (revision Rhinoplasty)"],
      },
      {
        heading: "How the Surgery Is Done",
        body: [
          "Rhinoplasty reshapes the bone and cartilage framework of the nose. Depending on what needs changing, the incisions are placed inside the nostrils (closed approach) or with a small additional incision across the strip of skin between the nostrils (open approach), which heals as a fine line. Cartilage grafts, usually from the septum, are used to support and define the tip where needed.",
          "The operation is done under general anaesthesia with a one-day admission. You may have a nasal pack for one day and a nasal splint on the bridge for about a week.",
        ],
      },
      {
        heading: "Recovery",
        body: [
          "Most people are back to normal activities in 2–3 days. Bruising around the eyes and swelling settle over two weeks; the splint is removed at about one week. Glasses should not rest on the bridge for several weeks, and contact sports are avoided for about six weeks. The nasal tip continues to refine for up to a year as swelling resolves.",
        ],
      },
      {
        heading: "Risks and Limitations",
        body: [
          "Rhinoplasty is a precise operation on a small structure, and the final shape depends on how your tissues heal. Minor asymmetry can persist, and a small proportion of patients need a touch-up procedure. Bleeding, infection, breathing changes and numbness of the tip are uncommon but discussed before surgery. Realistic expectations — a nose that suits your face rather than a particular 'look' — are the basis of a good result.",
        ],
      },
    ],
    faqs: [
      { q: "How long is recovery after Rhinoplasty?", a: "Rhinoplasty is done under general anaesthesia with a one-day admission. Most people return to normal activities in 2–3 days, with a nasal pack for one day and a splint for about a week; swelling continues to settle for months." },
      { q: "Can Rhinoplasty fix a blocked nose?", a: "Yes, when the blockage is caused by a deviated septum. Septoplasty is combined with Rhinoplasty (Septorhinoplasty) so that breathing and appearance are addressed in one operation." },
      { q: "Will there be a visible scar after Rhinoplasty?", a: "With the closed approach the incisions are inside the nostrils. The open approach adds a small incision across the skin between the nostrils, which usually heals as a fine, barely visible line." },
      { q: "When can I see the final result?", a: "The shape is visible once the splint comes off at about a week, but swelling — especially at the tip — continues to refine for up to a year." },
      CONSULT_FAQ,
      COST_FAQ,
    ],
    conditions: ["Nasal deformity", "Dorsal hump", "Deviated nasal septum", "Post-traumatic nasal deformity"],
    procedures: ["Rhinoplasty", "Septorhinoplasty", "Septoplasty", "Revision Rhinoplasty"],
    related: ["chin-augmentation-surgery-bangalore", "blepharoplasty-eyelid-surgery-bangalore", "corrective-jaw-surgery-bangalore"],
  }),

  page({
    slug: "blepharoplasty-eyelid-surgery-bangalore",
    infoSheet: `${PDF}/Plastic-Surgery-of-Face/Patient-information-sheet-Blepharoplasty.pdf`,
    group: "cosmetic",
    parent: FACE,
    shortTitle: "Blepharoplasty",
    title: "Blepharoplasty (Eyelid Surgery) in Bangalore",
    metaTitle: "Blepharoplasty in Bangalore — Eyelid Surgery for Eye Bags & Hooded Lids | Dr Vybhav Deraje",
    description: "Blepharoplasty in Bangalore by Dr Vybhav Deraje: upper and lower eyelid surgery for hooded lids and eye bags, done as a day-care procedure under local anaesthesia.",
    eyebrow: "Cosmetic Surgery · Face",
    lead: "A day-care procedure that removes excess skin and fat from the upper and/or lower eyelids to correct hooded lids, puffy eye bags and a tired look.",
    cardText: "Upper and lower eyelid surgery for hooded lids and eye bags. Day-care, local anaesthesia.",
    intro: [
      "With age the eyelid skin stretches, the muscles weaken and the fat that cushions the eye bulges forward. The result is hooded upper lids that can feel heavy or even narrow the field of vision, and bags and hollows under the eyes that make the face look tired.",
      "Blepharoplasty — eyelid surgery — corrects this by removing or repositioning the excess skin, muscle and fat through incisions hidden in the natural lines of the lid.",
    ],
    sections: [
      {
        heading: "Upper and Lower Eyelid Surgery",
        items: [
          { title: "Upper Blepharoplasty", text: "Excess skin and a small amount of fat are removed through an incision in the natural crease of the upper lid, so the scar sits in the fold and is hidden when the eye is open. It addresses hooded, heavy lids and can improve the upper field of vision when the skin hangs over the lashes." },
          { title: "Lower Blepharoplasty", text: "Bulging fat under the eye is removed or redistributed, and loose skin is tightened. The incision is placed just below the lash line or on the inside of the lid (transconjunctival approach) when only fat needs treating, leaving no external scar." },
        ],
      },
      {
        heading: "Anaesthesia and Recovery",
        body: [
          "Blepharoplasty is a day-care procedure under local anaesthesia, with light sedation if preferred. Stitches, where used, are removed at about 5–7 days. Expect bruising and swelling for one to two weeks; cold compresses and keeping the head raised help. Most people return to desk work within a week and resume contact lenses and eye make-up after the surgeon's review.",
        ],
      },
      {
        heading: "Who It Suits — And Who Should Wait",
        body: [
          "Blepharoplasty suits healthy adults bothered by excess eyelid skin or under-eye bags. Dry eyes, thyroid eye disease, uncontrolled blood pressure or diabetes, and certain blood thinners need assessment first. Dark circles caused by pigmentation rather than bulging fat are not corrected by surgery; Fat Grafting or non-surgical treatment may be more appropriate, and the consultation is where that distinction is made.",
        ],
      },
      {
        heading: "Risks and Limitations",
        body: ["Temporary dryness or watering of the eyes, bruising, small asymmetries and, rarely, a lower lid that sits slightly low after surgery are the main risks. Blepharoplasty does not remove crow's feet or lift the brow; those are addressed with Botox or a brow lift if needed."],
      },
    ],
    faqs: [
      { q: "Is Blepharoplasty done under general anaesthesia?", a: "No. Eyelid surgery is a day-care procedure under local anaesthesia, on the upper eyelid, lower eyelid or both." },
      { q: "Will eyelid surgery leave a visible scar?", a: "Upper-lid incisions sit in the natural crease and are hidden when the eye is open. Lower-lid incisions are placed just under the lashes or inside the lid, where there is no external scar." },
      { q: "How long does it take to recover from Blepharoplasty?", a: "Bruising and swelling settle over one to two weeks. Stitches come out at about 5–7 days, and most people are back at desk work within a week." },
      { q: "Does Blepharoplasty remove dark circles?", a: "Only when the darkness is a shadow cast by bulging fat. Pigmentation or hollowing under the eye needs a different approach, such as Fat Grafting or non-surgical treatment." },
      CONSULT_FAQ,
      COST_FAQ,
    ],
    conditions: ["Dermatochalasis", "Lower eyelid fat prolapse (eye bags)", "Hooded eyelids"],
    procedures: ["Upper Blepharoplasty", "Lower Blepharoplasty", "Transconjunctival Blepharoplasty"],
    related: ["facelift-surgery-bangalore", "rhinoplasty-surgery-bangalore", "chin-augmentation-surgery-bangalore"],
  }),

  page({
    slug: "otoplasty-ear-correction-bangalore",
    infoSheet: `${PDF}/Plastic-Surgery-of-Face/Patient-information-sheet-Otoplasty.pdf`,
    group: "cosmetic",
    parent: FACE,
    shortTitle: "Otoplasty",
    title: "Otoplasty (Prominent Ear Correction) in Bangalore",
    metaTitle: "Otoplasty in Bangalore — Prominent & Bat Ear Correction | Dr Vybhav Deraje",
    description: "Otoplasty in Bangalore by Dr Vybhav Deraje: correction of prominent (bat) ears, Stahl ear and split ear lobes for children and adults as a day-care procedure.",
    eyebrow: "Cosmetic Surgery · Face",
    lead: "Day-care surgery to set back Prominent Ears and correct ear shape deformities — for children once the ear is fully grown, and for adults at any age.",
    cardText: "Setting back prominent (bat) ears and correcting ear shape. Day-care for children and adults.",
    intro: [
      "Prominent Ears — sometimes called bat ears — stick out from the head because the fold of the ear (the antihelix) did not form fully or the bowl of the ear is deep. The ears usually hear perfectly well, but children can be teased and adults may avoid short hair or tying their hair back.",
      "Otoplasty reshapes the cartilage to create the missing fold and set the ear closer to the head. The same approach corrects Stahl ear and other shape deformities, and split or stretched ear lobes can be repaired as a small separate procedure.",
    ],
    sections: [
      {
        heading: "What Otoplasty Corrects",
        bullets: ["Prominent or 'bat' ears on one or both sides", "A missing or weak antihelical fold", "A deep conchal bowl pushing the ear outward", "Stahl ear and other cartilage shape deformities", "Split, torn or stretched ear lobes (lobe repair)"],
      },
      {
        heading: "How the Surgery Is Done",
        body: [
          "Through an incision hidden in the groove behind the ear, the cartilage is scored and shaped with permanent stitches to recreate the fold and, where needed, to set the bowl of the ear back toward the head. The two ears are matched so they sit symmetrically. The scar lies behind the ear and is not visible from the front.",
          "Otoplasty is a day-care procedure. Children are treated under general anaesthesia; adults can usually have the procedure under local anaesthesia with sedation.",
        ],
      },
      {
        heading: "Recovery",
        body: ["A padded head bandage protects the ears for a few days, after which a soft headband is worn at night for several weeks to keep the ears in position while they heal. Discomfort is mild and controlled with simple painkillers. Children can return to school within a week; contact sports and swimming are avoided for about six weeks."],
      },
      {
        heading: "Timing for Children",
        body: ["The ear reaches almost adult size by about 5–6 years, so Otoplasty is commonly offered from that age — before the start of school, when teasing tends to begin — provided the child is also keen on the surgery. There is no upper age limit; adults are treated in the same way."],
      },
      {
        heading: "Risks and Limitations",
        body: ["Bleeding under the skin, infection, a stitch working its way to the surface, minor asymmetry and, rarely, partial recurrence of the prominence are the main risks. Otoplasty changes the position and fold of the ear; it does not change ear size, and it is a different operation from Ear Reconstruction for Microtia."],
      },
    ],
    faqs: [
      { q: "At what age can Prominent Ears be corrected?", a: "From about 5–6 years, once the ear is close to adult size and the child wants the surgery — often before starting school. Adults can have Otoplasty at any age." },
      { q: "Is Otoplasty a day-care procedure?", a: "Yes. Children are treated under general anaesthesia and adults usually under local anaesthesia with sedation, going home the same day." },
      { q: "Where is the scar after Otoplasty?", a: "In the groove behind the ear, so it is not visible from the front." },
      { q: "How long is the bandage worn after ear surgery?", a: "A padded head bandage for the first few days, then a soft headband at night for several weeks while the cartilage sets in its new position." },
      { q: "Can a split ear lobe be repaired?", a: "Yes. Split, torn or stretched ear lobes are repaired as a small procedure under local anaesthesia; the lobe can usually be re-pierced after it has healed." },
      CONSULT_FAQ,
    ],
    conditions: ["Prominent ears", "Stahl ear", "Split ear lobe"],
    procedures: ["Otoplasty", "Ear lobe repair"],
    related: ["earwell-infant-ear-correction-bangalore", "ear-reconstruction-surgery-bangalore", "rhinoplasty-surgery-bangalore"],
  }),

  page({
    slug: "chin-augmentation-surgery-bangalore",
    infoSheet: `${PDF}/Plastic-Surgery-of-Face/Patient-information-sheet-Chin-Augmentation.pdf`,
    group: "cosmetic",
    parent: FACE,
    shortTitle: "Chin Augmentation",
    title: "Chin Augmentation and Genioplasty in Bangalore",
    metaTitle: "Chin Augmentation in Bangalore — Chin Implant & Genioplasty | Dr Vybhav Deraje",
    description: "Chin Augmentation in Bangalore by Dr Vybhav Deraje: correction of a weak, strong or deviated chin with an implant or by repositioning your own bone (Genioplasty).",
    eyebrow: "Cosmetic Surgery · Face",
    lead: "Correcting a weak, over-strong or deviated chin — with an implant or by moving your own bone — to bring the lower face into balance with the nose and lips.",
    cardText: "Correcting a weak or deviated chin with an implant or Genioplasty. Day-care.",
    intro: [
      "The chin anchors the profile. A small or receding chin can make the nose look larger and the neck less defined; a chin that is too strong, too long or off-centre unbalances the face in the other direction.",
      "Chin Augmentation is a day-care procedure under general anaesthesia, done either with an implant or by repositioning your own chin bone (Genioplasty). Dr Vybhav Deraje's craniofacial training means the whole jaw is assessed first — a receding chin is sometimes a sign that the lower jaw itself is set back, in which case Orthognathic Surgery is the better answer.",
    ],
    sections: [
      {
        heading: "Two Ways to Correct the Chin",
        items: [
          { title: "Chin Implant", text: "A shaped silicone or porous polyethylene (Medpor) implant is placed over the bone through a small incision inside the lower lip or under the chin. It adds forward projection and width and suits a chin that is only mildly to moderately weak." },
          { title: "Sliding Genioplasty", text: "The lower edge of the chin bone is cut and moved — forward, back, up, down or sideways — and fixed with small titanium plates. Because it uses your own bone, it can correct deviation and vertical length as well as projection, and there is no implant to shift or wear." },
        ],
      },
      {
        heading: "Anaesthesia and Recovery",
        body: ["Both procedures are done as day-care surgery under general anaesthesia. Expect swelling and some numbness of the lower lip for a few weeks, a soft diet for the first days after an intra-oral incision, and a return to normal activities within a week. The final contour is visible once swelling settles over 6–8 weeks."],
      },
      {
        heading: "Combining Chin Surgery with Other Procedures",
        body: ["Chin Augmentation is often planned together with Rhinoplasty, because the nose and chin are judged against each other in profile, or with Liposuction under the chin to define the jawline. When the bite is also affected, correction of the chin forms part of orthognathic (jaw) surgery rather than a stand-alone procedure."],
      },
      {
        heading: "Risks and Limitations",
        body: ["Infection, temporary or (rarely) lasting numbness of the lower lip, asymmetry and, with implants, movement or bony change under the implant are the main risks. A chin procedure changes the chin only; if the whole lower jaw is retruded, Orthognathic Surgery is needed to correct both appearance and bite."],
      },
    ],
    faqs: [
      { q: "Is Chin Augmentation done with an implant or my own bone?", a: "Either. A silicone or Medpor implant adds projection for a mildly weak chin; sliding Genioplasty moves your own chin bone and can also correct deviation and length. Both are day-care procedures under general anaesthesia." },
      { q: "Where is the incision for chin surgery?", a: "Usually inside the lower lip, leaving no visible scar; an implant can also be placed through a small incision under the chin." },
      { q: "How long does recovery take after Genioplasty?", a: "Normal activities within about a week, a soft diet for the first days, and swelling and lip numbness that settle over several weeks. The final shape is seen at 6–8 weeks." },
      { q: "How do I know whether I need Chin Augmentation or jaw surgery?", a: "If the teeth meet normally and only the chin is small, Chin Augmentation is appropriate. If the lower jaw itself is set back and the bite is affected, Orthognathic Surgery corrects both. This is assessed at consultation." },
      CONSULT_FAQ,
      COST_FAQ,
    ],
    conditions: ["Microgenia (weak chin)", "Chin deviation", "Macrogenia (prominent chin)"],
    procedures: ["Chin implant augmentation", "Sliding Genioplasty"],
    related: ["rhinoplasty-surgery-bangalore", "corrective-jaw-surgery-bangalore", "liposuction-surgery-bangalore"],
  }),

  page({
    slug: "facelift-surgery-bangalore",
    infoSheet: `${PDF}/Plastic-Surgery-of-Face/Patient-information-sheet-Facelift-and-Necklift.pdf`,
    group: "cosmetic",
    parent: FACE,
    shortTitle: "Facelift",
    title: "Facelift and Neck Lift in Bangalore",
    metaTitle: "Facelift in Bangalore — Face & Neck Lift Surgery | Dr Vybhav Deraje",
    description: "Facelift and Neck Lift in Bangalore by Dr Vybhav Deraje: lifting jowls, loose neck skin and deep folds with incisions hidden around the ear. Day-care, general anaesthesia.",
    eyebrow: "Cosmetic Surgery · Face",
    lead: "Reversing the skin and soft-tissue signs of ageing on the lower face and neck — jowls, deep folds and loose neck skin — with incisions placed to hide the eventual scars.",
    cardText: "Lifting jowls, deep folds and loose neck skin; scars hidden around the ear. Day-care.",
    intro: [
      "With time the deeper layer of the face (the SMAS) and the skin lose their support: the cheeks descend, jowls form along the jawline, the fold from nose to mouth deepens and the neck skin loosens. Creams, Botox and fillers soften the surface but cannot lift tissue that has dropped.",
      "A Facelift repositions the deeper tissue and removes the excess skin; a Neck Lift does the same for the neck and jawline, and the two are usually combined. The aim is a rested, natural version of your own face, not a different one.",
    ],
    sections: [
      {
        heading: "What a Facelift Addresses",
        bullets: ["Jowls and loss of a clean jawline", "Deep nose-to-mouth and marionette folds", "Loose, hanging skin and bands in the neck", "Descended cheeks and a hollow look under the cheekbones", "Early wrinkles and crow's feet, as part of the overall rejuvenation"],
      },
      {
        heading: "How the Surgery Is Done",
        body: [
          "Incisions start in the hairline at the temple, follow the natural crease in front of the ear, pass behind the ear lobe and end in the hair behind the ear, so the scars sit at the edges of the face. Through these the deeper SMAS layer is tightened and repositioned and the skin is re-draped without tension. For the neck, a small incision under the chin allows the muscle bands to be tightened and excess fat removed.",
          "Facelift and Neck Lift are done under general anaesthesia as a day-care procedure. Fat Grafting to the cheeks and temples is often added to restore lost volume.",
        ],
      },
      {
        heading: "Recovery",
        body: ["A light dressing is worn for the first day or two. Bruising and swelling are at their peak at 2–3 days and largely settle by two weeks, when most people are comfortable returning to work and social life; strenuous exercise waits for about four weeks. Numbness around the ears is normal for a few weeks. Scars fade over 6–12 months and are hidden by hair and the natural creases."],
      },
      {
        heading: "Facelift or Non-Surgical Treatment?",
        body: ["In the early stages of ageing, Botox, fillers, nanofat and skin treatments can be enough. Once tissue has descended, a Facelift is the only treatment that lifts it. A mini-lift with shorter scars suits early jowling; a full face and Neck Lift suits more advanced change. The consultation is about matching the procedure to the degree of ageing and to the recovery time you can afford."],
      },
      {
        heading: "Risks and Limitations",
        body: ["Bleeding under the skin, infection, delayed healing behind the ear (especially in smokers), temporary weakness of a facial nerve branch, numbness and visible scarring are the recognised risks and are discussed before surgery. A Facelift does not stop ageing; it resets the clock, and the face continues to age naturally from the new starting point."],
      },
    ],
    faqs: [
      { q: "Is a Facelift done as a day-care procedure?", a: "Yes. Facelift and Neck Lift are done under general anaesthesia and most patients go home the same day." },
      { q: "Where are the scars after a Facelift?", a: "In the hairline at the temple, in the crease in front of the ear, behind the ear lobe and in the hair behind the ear — placed to hide the eventual scars. A small incision under the chin is used for the neck." },
      { q: "How long is recovery after a Facelift?", a: "Bruising and swelling largely settle by two weeks, when most people return to work. Strenuous activity is avoided for about four weeks and scars continue to fade for 6–12 months." },
      { q: "How long does a Facelift last?", a: "The face keeps ageing from the new starting point, but the improvement is long-lasting — commonly many years. Sun protection, not smoking and a stable weight help preserve it." },
      { q: "Can I have Botox or fillers instead of a Facelift?", a: "In early ageing, yes — they soften lines and restore volume. Once the cheeks have descended and jowls have formed, only a Facelift lifts the tissue; non-surgical treatments can still complement it." },
      CONSULT_FAQ,
    ],
    conditions: ["Facial ageing", "Jowls", "Platysmal bands", "Skin laxity of the neck"],
    procedures: ["Facelift (rhytidectomy)", "Neck lift", "SMAS plication", "Fat Grafting"],
    related: ["blepharoplasty-eyelid-surgery-bangalore", "liposuction-surgery-bangalore", "chin-augmentation-surgery-bangalore"],
  }),

  /* ---------------------------------------------------------------------------------------------
   * Cosmetic — body and breast
   * ------------------------------------------------------------------------------------------- */
  page({
    slug: "tummy-tuck-abdominoplasty-bangalore",
    infoSheet: `${PDF}/Plastic-Surgery-of-Body/Patient-information-sheet-Abdominoplasty.pdf`,
    group: "cosmetic",
    parent: BODY,
    shortTitle: "Tummy Tuck",
    title: "Tummy Tuck (Abdominoplasty) in Bangalore",
    metaTitle: "Tummy Tuck in Bangalore — Abdominoplasty Surgery | Dr Vybhav Deraje",
    description: "Tummy Tuck (Abdominoplasty) in Bangalore by Dr Vybhav Deraje: removing loose skin, tightening separated muscles and repairing hernia, with a scar hidden below the underwear line.",
    eyebrow: "Cosmetic Surgery · Body",
    lead: "Removing excess, sagging skin from the abdomen, tightening the muscles that have separated after pregnancy or weight loss, and repairing any hernia at the same time.",
    cardText: "Loose skin removed, abdominal muscles tightened, scar below the underwear line. 3–4 day stay.",
    intro: [
      "After pregnancy or major weight loss the abdominal skin can remain loose and overhanging, and the two long muscles of the abdomen may stay separated (diastasis), so the tummy bulges however much you exercise. Diet and exercise cannot remove excess skin or close a muscle gap.",
      "Abdominoplasty — a Tummy Tuck — removes the excess tissue, tightens the muscle wall and repairs any hernia, for a flat, firm abdomen. It is often combined with Liposuction or a Breast Lift as a 'mummy makeover' once a woman has completed her family.",
    ],
    sections: [
      {
        heading: "Who a Tummy Tuck Is For",
        bullets: ["Loose, overhanging abdominal skin after pregnancy or weight loss", "Separated abdominal muscles (diastasis recti) causing a persistent bulge", "Stretch marks on the lower abdomen (those below the navel are removed with the skin)", "An umbilical or incisional hernia that can be repaired at the same time", "A stable weight, no plans for further pregnancy, and a non-smoker (or willing to stop)"],
      },
      {
        heading: "How the Surgery Is Done",
        body: [
          "Through an incision placed low on the abdomen, below the line of underwear, the skin and fat are lifted off the muscle wall up to the ribs. The separated muscles are stitched back together along their full length, any hernia is repaired, the excess skin is removed and the remaining skin is re-draped; the navel is brought out through a new opening. A mini-abdominoplasty with a shorter scar and no navel repositioning suits patients whose laxity is confined to below the navel.",
          "The operation is done under general anaesthesia with a 3–4 day hospital stay.",
        ],
      },
      {
        heading: "Recovery",
        body: ["Drains, if used, come out before discharge. A compression garment is worn for about six weeks. Most people return to normal daily activities in about a week and to desk work in two; strenuous exercise and heavy lifting wait for six weeks. The scar is red for some months and fades over a year or more; it sits low enough to be hidden by underwear and most swimwear."],
      },
      {
        heading: "Risks and Limitations",
        body: ["Wound-healing problems (higher in smokers and diabetics), fluid collection (seroma), infection, numbness of the lower abdomen and the risk of blood clots are the main concerns, and preventive measures are routine. A Tummy Tuck is not a weight-loss operation and does not remove fat from the flanks or back unless Liposuction is added; weight gain or a later pregnancy can stretch the result."],
      },
    ],
    faqs: [
      { q: "How long is the hospital stay after a Tummy Tuck?", a: "Abdominoplasty is done under general anaesthesia with a 3–4 day hospital stay. Most people return to normal activities in about a week and strenuous exercise after 6 weeks." },
      { q: "Where is the scar after Abdominoplasty?", a: "Low on the abdomen so that it is hidden under the line of underwear. There is also a small scar around the navel when it is repositioned." },
      { q: "Does a Tummy Tuck fix separated abdominal muscles?", a: "Yes. The separated muscles (diastasis recti) are stitched back together along their length, and any hernia is repaired at the same time." },
      { q: "Can a Tummy Tuck be combined with other procedures?", a: "Yes. It is often combined with Liposuction, a Breast Lift or other procedures as a 'mummy makeover' once a woman has completed her family." },
      { q: "Is a Tummy Tuck a weight-loss operation?", a: "No. It removes loose skin and tightens muscle. The best results are in patients already at a stable weight; fat elsewhere is treated with Liposuction." },
      CONSULT_FAQ,
    ],
    conditions: ["Abdominal skin laxity", "Diastasis recti", "Umbilical hernia", "Post-pregnancy abdominal changes"],
    procedures: ["Abdominoplasty", "Mini-abdominoplasty", "Rectus plication", "Hernia repair"],
    related: ["liposuction-surgery-bangalore", "breast-augmentation-surgery-bangalore", "breast-reduction-surgery-bangalore"],
  }),

  page({
    slug: "breast-augmentation-surgery-bangalore",
    infoSheet: `${PDF}/Plastic-surgery-of-Breast/Patient-information-sheet-Breast-augmentation.pdf`,
    group: "cosmetic",
    parent: BREAST,
    shortTitle: "Breast Augmentation",
    title: "Breast Augmentation in Bangalore",
    metaTitle: "Breast Augmentation in Bangalore — Implants or Fat Transfer | Dr Vybhav Deraje",
    description: "Breast Augmentation in Bangalore by Dr Vybhav Deraje: increasing breast size and projection with a silicone implant or your own fat. Day-care, general anaesthesia.",
    eyebrow: "Cosmetic Surgery · Breast",
    lead: "Increasing the size, volume and projection of the breasts — with a silicone implant or fat from your own body — as a day-care procedure under general anaesthesia.",
    cardText: "Increasing breast size with a silicone implant or your own fat. Day-care.",
    intro: [
      "Breast Augmentation is chosen by women whose breasts are naturally small, have lost volume after pregnancy, breastfeeding or weight loss, or are uneven in size. The aim is a fuller, proportionate breast that suits your frame.",
      "Two approaches are offered — a silicone implant, or fat transferred from your own body — and the consultation is where the right one for you is worked out.",
    ],
    sections: [
      {
        heading: "Implant or Fat Transfer?",
        items: [
          { title: "Silicone Implants", text: "Give a predictable increase of one or more cup sizes in a single operation. Implant size and shape (round or anatomical), placement in front of or behind the chest muscle, and the incision — usually in the fold under the breast — are planned to your measurements. Modern cohesive-gel implants hold their shape and are expected to last many years, though they are not lifetime devices." },
          { title: "Fat Transfer (Autologous Fat Grafting)", text: "Fat is removed by Liposuction from the tummy, flanks or thighs, prepared and injected into the breasts. It gives a modest, natural increase with no implant and slims the donor area, but needs enough spare fat, and a proportion of the graft is absorbed, so more than one session may be needed for a larger change." },
        ],
      },
      {
        heading: "Anaesthesia and Recovery",
        body: ["Breast Augmentation is a day-care procedure under general anaesthesia. A supportive bra is worn for about six weeks. Discomfort is greatest in the first few days, especially when the implant sits behind the muscle; most women return to desk work within a week and to exercise at four to six weeks. Implants settle into their final position over about three months."],
      },
      {
        heading: "Combining with a Lift",
        body: ["When the breasts have dropped as well as deflated, an implant alone can leave the nipple sitting low. A Breast Lift (Mastopexy) can be combined with augmentation to reposition the nipple and remove loose skin; this adds scars around the areola and sometimes vertically beneath it."],
      },
      {
        heading: "Risks and Limitations",
        body: ["With implants: capsular contracture (firm scar tissue around the implant), rippling, changes in nipple sensation, implant rotation or rupture, and the need for replacement surgery at some point in the future; regular follow-up is advised. With Fat Transfer: partial absorption, oil cysts and the need for repeat sessions. Mammography remains possible after both; inform the radiographer. Future pregnancy and breastfeeding are usually unaffected."],
      },
    ],
    faqs: [
      { q: "Can Breast Augmentation be done without implants?", a: "Yes. Augmentation can use a silicone implant or fat transferred from your own body. Both are day-care procedures under general anaesthesia; your surgeon helps you choose." },
      { q: "Where is the scar for a breast implant?", a: "Usually in the fold under the breast, where it is hidden; the areola edge is an alternative in selected cases." },
      { q: "How long do breast implants last?", a: "Modern cohesive-gel implants last many years but are not lifetime devices. Regular follow-up is advised and replacement may be needed at some point." },
      { q: "Can I breastfeed after Breast Augmentation?", a: "Usually yes. The implant is placed beneath the breast tissue or muscle and the milk ducts are not divided with the standard incision in the breast fold." },
      { q: "How soon can I exercise after Breast Augmentation?", a: "Light activity within days, desk work within a week and full exercise at four to six weeks, with a supportive bra worn throughout." },
      CONSULT_FAQ,
      COST_FAQ,
    ],
    conditions: ["Breast hypoplasia", "Post-pregnancy breast volume loss", "Breast asymmetry"],
    procedures: ["Breast Augmentation with implants", "Autologous Fat Transfer to the breast", "Augmentation Mastopexy"],
    related: ["breast-reduction-surgery-bangalore", "liposuction-surgery-bangalore", "tummy-tuck-abdominoplasty-bangalore"],
  }),

  page({
    slug: "breast-reduction-surgery-bangalore",
    infoSheet: `${PDF}/Plastic-surgery-of-Breast/Patient-information-sheet-Breast-reduction.pdf`,
    group: "cosmetic",
    parent: BREAST,
    shortTitle: "Breast Reduction",
    title: "Breast Reduction Surgery in Bangalore",
    metaTitle: "Breast Reduction in Bangalore — Surgery for Large, Heavy Breasts | Dr Vybhav Deraje",
    description: "Breast Reduction in Bangalore by Dr Vybhav Deraje: reducing very large breasts to relieve back and neck pain, rashes and dermatitis. Day-care, general anaesthesia.",
    eyebrow: "Cosmetic Surgery · Breast",
    lead: "Reducing the size and weight of very large breasts to relieve back, neck and shoulder pain, rashes under the breast and the limits they place on exercise and clothing.",
    cardText: "Reducing very large breasts to relieve back pain, rashes and dermatitis. Day-care.",
    intro: [
      "Very large breasts (gigantomastia or macromastia) are a physical burden: neck, shoulder and back pain, grooves from bra straps, rashes and dermatitis in the fold under the breast, difficulty exercising and finding clothes that fit. Breast Reduction removes excess breast tissue, fat and skin, lifts the breast and repositions the nipple to a natural height.",
      "It is one of the most consistently rewarding operations in plastic surgery because it treats symptoms as well as appearance.",
    ],
    sections: [
      {
        heading: "Who Breast Reduction Is For",
        bullets: ["Back, neck or shoulder pain attributable to breast weight", "Recurrent rashes or dermatitis under the breasts", "Bra-strap grooving on the shoulders", "Difficulty exercising or finding clothes because of breast size", "Marked asymmetry, where one breast is reduced to match the other", "A stable weight; family complete if breastfeeding is important to you"],
      },
      {
        heading: "How the Surgery Is Done",
        body: [
          "The excess tissue is removed and the breast reshaped around a pedicle that carries the nipple and areola to their new position, preserving their blood supply and, in most cases, sensation. The scars run around the areola and vertically down to the fold under the breast; for larger reductions a scar along the fold is added (the 'anchor' pattern). They are placed strategically and fade over time. Liposuction of the side of the chest is often added to blend the contour.",
          "Breast Reduction is done under general anaesthesia as a day-care procedure.",
        ],
      },
      {
        heading: "Recovery",
        body: ["A supportive bra is worn day and night for about six weeks. Pain is moderate for the first few days and relief from back and shoulder strain is often noticed almost immediately. Most women return to desk work in one to two weeks and to exercise at four to six weeks. Scars are red and raised for a few months and continue to fade for a year or more."],
      },
      {
        heading: "Risks and Limitations",
        body: ["Changes in nipple sensation, wound-healing delay at the junction of the scars, asymmetry, inability to breastfeed and, rarely, loss of part of the nipple are the recognised risks and are discussed before surgery. The breasts remain subject to the effects of weight change, pregnancy and ageing."],
      },
    ],
    faqs: [
      { q: "Does Breast Reduction help back pain?", a: "Breast Reduction treats very large breasts (gigantomastia) and relieves symptoms such as back pain, rashes and dermatitis caused by their weight — often noticeably within days of surgery." },
      { q: "Is Breast Reduction a day-care procedure?", a: "Yes. It is done under general anaesthesia and most women go home the same day with a supportive bra." },
      { q: "What do the scars look like after Breast Reduction?", a: "Around the areola and vertically down to the breast fold, with a scar along the fold for larger reductions. They are placed strategically and fade over time." },
      { q: "Can I breastfeed after Breast Reduction?", a: "Many women can, because the nipple stays attached to breast tissue on a pedicle, but it cannot be guaranteed. If breastfeeding is important, discuss timing at consultation." },
      { q: "How much smaller will my breasts be?", a: "That is decided with you at consultation. The aim is a size in proportion with your frame that removes the weight causing symptoms; cup-size changes are an approximation, and the surgeon works to shape rather than a bra size." },
      CONSULT_FAQ,
    ],
    conditions: ["Gigantomastia", "Macromastia", "Breast asymmetry", "Symptomatic breast hypertrophy"],
    procedures: ["Breast Reduction (reduction mammaplasty)", "Mastopexy", "Liposuction of the chest wall"],
    related: ["breast-augmentation-surgery-bangalore", "gynecomastia-surgery-bangalore", "tummy-tuck-abdominoplasty-bangalore"],
  }),

  page({
    slug: "gynecomastia-surgery-bangalore",
    infoSheet: `${PDF}/Plastic-surgery-of-Breast/Patient-information-sheet-Gynaecomastia-correction.pdf`,
    group: "cosmetic",
    parent: BREAST,
    shortTitle: "Gynaecomastia Surgery",
    title: "Gynaecomastia (Male Breast Reduction) Surgery in Bangalore",
    metaTitle: "Gynecomastia Surgery in Bangalore — Male Breast Reduction | Dr Vybhav Deraje",
    description: "Gynecomastia (male breast) surgery in Bangalore by Dr Vybhav Deraje: Liposuction and gland excision for a natural masculine chest, usually with no visible scar. Day-care.",
    eyebrow: "Cosmetic Surgery · Chest",
    lead: "Day-care surgery for enlarged male breasts — Liposuction, gland removal or both — aiming for a flat, natural masculine chest, usually with no visible scar.",
    cardText: "Male Breast Reduction by Liposuction and gland excision; usually no visible scar. Day-care.",
    intro: [
      "Gynaecomastia — enlargement of the breast tissue in men and boys — is common. It often appears in adolescence and can persist into adulthood; it is also seen with weight gain, certain medicines, hormonal conditions and some supplements. Whatever the cause, a prominent chest makes many men self-conscious about swimming, fitted clothing and the gym.",
      "Where there is an underlying cause, a hormonal work-up is sometimes arranged first. Surgery then removes the excess gland and fat so the chest sits flat and contoured.",
    ],
    sections: [
      {
        heading: "What Is Removed, and How",
        body: [
          "Gynaecomastia is a mix of firm glandular tissue beneath the nipple and softer fat around it; the proportion differs from person to person. Fat is removed with Liposuction through tiny incisions at the side of the chest. Gland is removed through a small incision at the edge of the areola, which heals to be almost invisible. Most men need a combination of the two. Where the skin is very loose after major weight loss, skin removal with a longer scar may be needed, and this is discussed beforehand.",
          "The procedure is done as day-care surgery under general anaesthesia.",
        ],
      },
      {
        heading: "Recovery",
        body: ["A compression vest is worn for about four to six weeks to help the skin settle flat. Bruising and swelling subside over two to three weeks. Desk work is possible within a few days; upper-body exercise and chest workouts resume at about four weeks. The final contour is visible once swelling has gone, at around three months."],
      },
      {
        heading: "Timing in Adolescence",
        body: ["Gynaecomastia that appears in puberty resolves on its own in the majority of boys within a year or two, so surgery is usually deferred until it has clearly persisted and growth is complete, unless it is causing significant distress. A hormonal assessment is arranged when the history or examination suggests a cause."],
      },
      {
        heading: "Risks and Limitations",
        body: ["Fluid collection, bruising, a slight dip under the nipple if too much gland is removed, asymmetry, changes in nipple sensation and recurrence with weight gain or continued use of a causative drug are the main concerns. Surgery treats the chest; it does not correct an underlying hormonal condition, which is managed separately."],
      },
    ],
    faqs: [
      { q: "Does Gynaecomastia Surgery leave scars?", a: "Usually there is no visible scar on the chest. Liposuction uses tiny incisions at the side of the chest and any gland is removed through a small incision at the edge of the areola that heals almost invisibly." },
      { q: "Is Gynaecomastia Surgery a day-care procedure?", a: "Yes. It is done under general anaesthesia and you go home the same day with a compression vest." },
      { q: "Do I need blood tests before Gynaecomastia Surgery?", a: "Sometimes. A hormonal work-up is arranged when the history or examination suggests an underlying cause, so that it can be treated alongside surgery." },
      { q: "When can I go back to the gym after Gynaecomastia Surgery?", a: "Light activity within days, desk work within a few days, and chest and upper-body workouts at about four weeks." },
      { q: "Can Gynaecomastia come back after surgery?", a: "The removed gland does not regrow, but significant weight gain, anabolic steroid use or continued use of a causative medicine can cause the chest to enlarge again." },
      CONSULT_FAQ,
    ],
    conditions: ["Gynaecomastia", "Pseudogynaecomastia", "Adolescent Gynaecomastia"],
    procedures: ["Gynaecomastia Surgery", "Liposuction of the chest", "Subcutaneous mastectomy (gland excision)"],
    related: ["liposuction-surgery-bangalore", "breast-reduction-surgery-bangalore", "tummy-tuck-abdominoplasty-bangalore"],
  }),

  page({
    slug: "liposuction-surgery-bangalore",
    infoSheet: `${PDF}/Plastic-Surgery-of-Body/Patient-information-sheet-Liposuction.pdf`,
    group: "cosmetic",
    parent: BODY,
    shortTitle: "Liposuction",
    title: "Liposuction in Bangalore",
    metaTitle: "Liposuction in Bangalore — Power-Assisted Fat Removal | Dr Vybhav Deraje",
    description: "Liposuction in Bangalore by Dr Vybhav Deraje using the MicroAire power-assisted system: removing stubborn fat from the abdomen, flanks, thighs, arms and chin as a day-care procedure.",
    eyebrow: "Cosmetic Surgery · Body",
    lead: "Day-care removal of stubborn pockets of fat that diet and exercise have not shifted — abdomen, flanks, thighs, arms, back, chin — for a smoother, more defined contour.",
    cardText: "Removing stubborn fat for a smoother contour with power-assisted Liposuction. Day-care.",
    intro: [
      "Liposuction removes localised fat deposits that persist despite a healthy weight: the lower abdomen and 'love handles', outer and inner thighs, upper arms, the bra line and back, and under the chin. It is a contouring procedure for people near their ideal weight, not a treatment for obesity.",
      "Dr Vybhav Deraje uses the MicroAire power-assisted Liposuction (PAL) system, in which a vibrating cannula loosens fat with less force, allowing precise removal with less bruising.",
    ],
    sections: [
      {
        heading: "Areas Commonly Treated",
        bullets: ["Abdomen and flanks (love handles)", "Inner and outer thighs and knees", "Upper arms", "Back and bra rolls", "Chin and neck (submental Liposuction)", "Male chest, as part of Gynaecomastia Surgery", "Fat harvest for grafting to the face or breast"],
      },
      {
        heading: "How the Procedure Is Done",
        body: [
          "A dilute local anaesthetic solution is first infiltrated into the fat to reduce bleeding and discomfort. Through incisions a few millimetres long, hidden in skin creases, the power-assisted cannula loosens and removes the fat in a controlled, even pattern. Several areas can be treated in one session; the total volume removed is kept within safe limits.",
          "Liposuction is a day-care procedure under general anaesthesia.",
        ],
      },
      {
        heading: "Recovery",
        body: ["A compression garment is worn for about four to six weeks. Bruising and swelling peak in the first week and settle over three to four weeks; some fluid may leak from the small incisions for the first day or two. Most people return to desk work within a few days and to exercise at two to four weeks. The final contour shows at about three months as swelling resolves and the skin retracts."],
      },
      {
        heading: "Liposuction or a Lift?",
        body: ["Liposuction removes fat but relies on the skin to shrink back. Where the skin is already loose — after pregnancy or major weight loss — removing fat alone can leave it looser still. In those cases a Tummy Tuck, Arm Lift or Thigh Lift, with or without Liposuction, gives a better result; the consultation is where skin quality is assessed."],
      },
      {
        heading: "Risks and Limitations",
        body: ["Contour irregularities, lumpiness, prolonged swelling, numbness, fluid collection and infection are the main risks; they are minimised by careful technique and compression. Liposuction permanently removes fat cells from the treated area, but remaining cells can enlarge with weight gain, so a stable weight protects the result."],
      },
    ],
    faqs: [
      { q: "Is Liposuction a day-care procedure?", a: "Yes. Liposuction is done as a day-care procedure under general anaesthesia using the MicroAire power-assisted system." },
      { q: "What is power-assisted Liposuction?", a: "A system in which the cannula vibrates rapidly to loosen fat with less force, so it can be removed more evenly and with less bruising than traditional Liposuction." },
      { q: "Can Liposuction help me lose weight?", a: "No. It removes localised fat pockets for contour and is intended for people near a stable, healthy weight. It is not a treatment for obesity." },
      { q: "How long before I see the result of Liposuction?", a: "Swelling peaks in the first week and settles over three to four weeks; the final contour is visible at about three months as the skin retracts." },
      { q: "Will my skin be loose after Liposuction?", a: "Skin with good elasticity retracts well. If the skin is already loose, a lift procedure such as a Tummy Tuck is usually recommended instead of, or alongside, Liposuction." },
      CONSULT_FAQ,
      COST_FAQ,
    ],
    conditions: ["Localised fat deposits", "Lipodystrophy", "Submental fullness (double chin)"],
    procedures: ["Power-assisted Liposuction (PAL)", "Submental Liposuction", "Fat harvest for grafting"],
    related: ["tummy-tuck-abdominoplasty-bangalore", "gynecomastia-surgery-bangalore", "facelift-surgery-bangalore"],
  }),

  /* ---------------------------------------------------------------------------------------------
   * The Head Shape Clinic — non-surgical infant services (added 23 Oct 2026)
   * Source: theheadshapeclinic.com/helmet-therapy and /ear-well-system (Dr Vybhav's own clinic
   * site). Figures (wear time, durations, age windows, review intervals) are as published there;
   * nothing was added. Doctor to confirm — see docs/CONTENT-APPROVAL.md.
   * ------------------------------------------------------------------------------------------- */
  page({
    slug: "helmet-therapy-flat-head-bangalore",
    group: "craniofacial",
    shortTitle: "Helmet Therapy",
    title: "Helmet Therapy for Flat Head Syndrome in Bangalore",
    metaTitle: "Helmet Therapy for Flat Head Syndrome in Bangalore | The Head Shape Clinic · Dr Vybhav Deraje",
    description: "Cranial Helmet Therapy in Bangalore through The Head Shape Clinic (Dr Vybhav Deraje): for moderate-to-severe Positional Plagiocephaly and Brachycephaly, and after endoscopic Craniosynostosis surgery. 3D-scanned, custom-made helmets.",
    eyebrow: "Craniofacial · The Head Shape Clinic",
    lead: "Custom cranial helmets that guide a baby's skull growth — for moderate-to-severe Flat Head Syndrome and after keyhole Craniosynostosis surgery. Prescribed and reviewed by Dr Vybhav Deraje through The Head Shape Clinic.",
    cardText: "Custom cranial helmets for Flat Head Syndrome and after endoscopic Craniosynostosis surgery, via The Head Shape Clinic.",
    intro: [
      "Helmet Therapy is passive moulding of the skull. A custom-made helmet holds gently against the parts of the head that are already full and leaves room over the flat areas, so that as the brain grows it directs the skull outward where it is needed. Nothing pushes on the head; growth does the work.",
      "Dr Vybhav Deraje assesses every baby first and advises Helmet Therapy only when it is the right treatment. Most babies with mild positional flattening improve with repositioning and tummy time alone. The helmet programme in Bangalore runs through The Head Shape Clinic, Dr Vybhav's dedicated clinic for infant head-shape problems.",
    ],
    sections: [
      {
        heading: "Who Helmet Therapy Is For",
        bullets: [
          "Moderate to severe positional (deformational) Plagiocephaly — flattening on one side of the back of the head, often with the ear and forehead pushed forward on that side",
          "Moderate to severe positional Brachycephaly — symmetrical flattening of the whole back of the head",
          "Babies with single-suture Craniosynostosis after Endoscopic Strip Craniectomy, where the helmet completes the correction — usually starting about 10 days after surgery",
        ],
        note: "Positional flattening is a shape problem, not a brain or developmental problem, and it is not the same as Craniosynostosis. Telling the two apart is the first job of the consultation.",
      },
      {
        heading: "How the Helmet Is Made and Fitted",
        body: [
          "An orthotist assesses the baby and captures the head shape with a handheld 3D scanner — no plaster casting and nothing uncomfortable for the baby. The scan goes to the manufacturing partner, Orthomerica (USA), which fabricates the helmet to that scan, and American Board certified orthotists at KARE Orthotics & Prosthetics complete the fitting in Bangalore.",
          "As the baby grows, the helmet is adjusted at each orthotist visit; most babies need two or three helmets over the course of treatment.",
        ],
      },
      {
        heading: "What Treatment Involves",
        bullets: [
          "The helmet is worn 23 hours a day; it comes off for bathing and cleaning",
          "Positional Plagiocephaly or Brachycephaly: typically 3 to 4 months of wear",
          "After endoscopic Craniosynostosis surgery: longer — continued until a good head shape is achieved, depending on severity and response",
          "Orthotist review every 3 weeks for adjustments",
          "Dr Vybhav reviews the baby and the scans every 3 months",
        ],
      },
      {
        heading: "Side Effects",
        body: ["Redness, rashes and, occasionally, pressure sores on the scalp are the common side effects; they are managed by adjusting the helmet and keeping it clean and dry. A temporary slowing of head-circumference growth and temporary thinning of hair under the helmet have been reported but are not proven effects."],
      },
      {
        heading: "Timing Matters",
        body: ["Helmets work by directing growth, so they are most effective while the skull is growing fastest — in the first year of life. For Craniosynostosis, the keyhole operation followed by a helmet is only possible in babies who present before about 6 months of age; after that, open cranial remodelling is the usual operation. If you are worried about your baby's head shape, an early assessment keeps every option open."],
      },
    ],
    faqs: [
      { q: "Does my baby need a helmet for a flat head?", a: "Usually not. Mild positional flattening improves with repositioning, supervised tummy time and time. Helmet Therapy is advised for moderate to severe Positional Plagiocephaly or Brachycephaly, and after endoscopic Craniosynostosis surgery — always after assessment by a craniofacial surgeon." },
      { q: "How many hours a day is the helmet worn?", a: "23 hours a day. It is removed for bathing and for cleaning the helmet." },
      { q: "How long does Helmet Therapy take?", a: "About 3 to 4 months for Positional Plagiocephaly or Brachycephaly. After endoscopic Craniosynostosis surgery it is longer — from around 6 months and in some cases up to 1 to 2 years, depending on severity and how the skull responds. Most babies go through two or three helmets." },
      { q: "How is the helmet made?", a: "From a handheld 3D scan of the baby's head, taken by an orthotist. The helmet is fabricated to that scan by Orthomerica (USA) and fitted by certified orthotists at KARE Orthotics & Prosthetics in Bangalore." },
      { q: "Is Helmet Therapy painful?", a: "No. The helmet holds gently where the head is already full and leaves space over the flat areas; the baby's own growth does the correcting. Redness or a rash under the helmet is the common issue and is managed with adjustments." },
      { q: "Where is Helmet Therapy available in Bangalore?", a: "Through The Head Shape Clinic, Dr Vybhav Deraje's clinic for infant head-shape problems at Docube Clinic, Koramangala, with orthotist fitting by KARE Orthotics & Prosthetics. KARE also fits in Delhi, Mumbai, Kochi, Chennai, Hyderabad and Kolkata." },
      CONSULT_FAQ,
    ],
    conditions: ["Positional plagiocephaly", "Positional Brachycephaly", "Flat head syndrome", "Craniosynostosis"],
    procedures: ["Cranial helmet therapy", "Cranial remoulding orthosis"],
    related: ["craniosynostosis-surgery-bangalore", "earwell-infant-ear-correction-bangalore", "other-craniofacial-conditions-treatments"],
  }),

  page({
    slug: "earwell-infant-ear-correction-bangalore",
    group: "craniofacial",
    shortTitle: "EarWell Infant Ear Moulding",
    title: "EarWell Infant Ear Correction in Bangalore",
    metaTitle: "EarWell Infant Ear Moulding in Bangalore — Non-Surgical Ear Correction | Dr Vybhav Deraje",
    description: "EarWell non-surgical ear moulding for newborns in Bangalore through The Head Shape Clinic (Dr Vybhav Deraje): corrects prominent, cup, Stahl and folded ears in 4–6 weeks when started within the first 14 days of life.",
    eyebrow: "Craniofacial · The Head Shape Clinic",
    lead: "A painless moulding device that reshapes a newborn's ear cartilage in 4 to 6 weeks — no surgery, no anaesthesia — when applied within the first two weeks of life. Offered in Bangalore through The Head Shape Clinic.",
    cardText: "Non-surgical moulding for newborn ear deformities, started in the first 14 days of life. Via The Head Shape Clinic.",
    intro: [
      "In the first weeks after birth a baby's ear cartilage is still soft, under the influence of the mother's hormones, and can be reshaped without surgery. EarWell is a small moulding system that fits over the ear and holds it in the corrected position while the cartilage firms up — which is why it has to be started early, ideally within the first 14 days.",
      "EarWell was developed in the USA in 2011 by craniofacial plastic surgeon Dr H. Steven Byrd with Becon Medical; the system used in India is manufactured by MediTEC Devices. Dr Vybhav Deraje offers it in Bangalore through The Head Shape Clinic. Started in time, it avoids a later operation for most babies; once the window has passed, the same deformities are corrected surgically by Otoplasty from about 5–6 years of age.",
    ],
    sections: [
      {
        heading: "Ear Deformities EarWell Can Correct",
        bullets: ["Prominent or 'bat' ears", "Cup ear and cryptotia (an upper ear partly buried under the scalp skin)", "Stahl ear (an extra fold giving a pointed upper ear)", "Folded or lidded ears (the top of the ear folded over)"],
        note: "Most ear deformities arise in the upper third of the ear during fetal development; some are due to position in the womb and others, such as Prominent Ears, run in families. Missing or very small ears (Microtia) are a different problem — see Ear Reconstruction.",
      },
      {
        heading: "Why the First 14 Days Matter",
        body: ["Correction rates of 93–95% are reported when EarWell is started within the first 14 days of birth. After that the cartilage stiffens week by week and moulding becomes progressively less effective. If your newborn's ear looks folded, cupped or very prominent, ask for an assessment in the first week rather than waiting to see whether it settles."],
      },
      {
        heading: "What Treatment Involves",
        bullets: [
          "The device is fitted at the clinic; no anaesthesia and no cuts — the baby may cry from the handling but the fitting is not painful",
          "Worn continuously for 4 to 6 weeks; it does not interfere with sleep or feeding",
          "2 to 3 short visits for cleaning and minor adjustments",
          "The clinician cleans and replaces the device if it becomes wet or soggy",
        ],
      },
      {
        heading: "Side Effects",
        body: ["Mild skin irritation, sweat rash and redness under the device are the usual issues and settle with cleaning and adjustment. There is no scarring."],
      },
      {
        heading: "If the Window Has Passed",
        body: ["Beyond the first few weeks, moulding no longer works and the ear shape is addressed surgically. Prominent Ears, Stahl ear and similar shape deformities are corrected by Otoplasty as a day-care procedure, usually from 5–6 years of age once the ear is close to adult size."],
      },
    ],
    faqs: [
      { q: "At what age should EarWell be applied?", a: "Within the first 14 days of birth — the earlier the better, while the ear cartilage is still soft enough to mould." },
      { q: "How long does EarWell take to correct the ear?", a: "4 to 6 weeks of continuous wear, with 2 to 3 visits for cleaning or minor adjustments." },
      { q: "Is EarWell painful for the baby?", a: "No. There are no cuts and no anaesthesia. The baby may cry during fitting from the handling, and the device does not interfere with sleep or feeding." },
      { q: "Which ear deformities can EarWell treat?", a: "Prominent (bat) ears, cup ear and cryptotia, Stahl ear and folded ears. It does not treat Microtia, where the ear is missing or very small — that needs Ear Reconstruction." },
      { q: "What are the side effects of EarWell?", a: "Mild skin irritation, sweat rash and redness under the device, which settle with cleaning and adjustment. There is no scarring." },
      { q: "My baby is older than two weeks — is it too late?", a: "Moulding becomes less effective week by week after birth; have the ear assessed promptly rather than waiting. If the window has passed, the deformity can be corrected later by Otoplasty, usually from about 5–6 years." },
      { q: "Where is EarWell available in Bangalore?", a: "Through The Head Shape Clinic, Dr Vybhav Deraje's clinic at Docube Clinic, Koramangala, Bangalore." },
    ],
    conditions: ["Prominent ears", "Cup ear", "Cryptotia", "Stahl ear", "Folded ear"],
    procedures: ["EarWell Infant Ear Moulding", "Non-surgical ear correction"],
    related: ["otoplasty-ear-correction-bangalore", "ear-reconstruction-surgery-bangalore", "helmet-therapy-flat-head-bangalore"],
  }),
];
