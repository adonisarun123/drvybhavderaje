/**
 * Public site copy.
 *
 * Source: the practice's live website https://drvybhavderaje.com/ (crawled 21 Oct 2026). Clinical
 * descriptions are the doctor's own and have been edited for clarity, consistency and plain
 * language only — no new clinical claims were added. FAQs restate what the page already says in the
 * way patients ask the question (answer-engine optimisation); they do not introduce new facts.
 *
 * Patient-information PDFs keep their legacy URLs under /images/pdf/… so existing links keep working.
 * They are rendered only when the file is present in /public (see components/site/info-sheet.tsx).
 * Image paths are relative to the ImageKit folder (see lib/images.ts), e.g. "/custom/gallery_1.png".
 */
import { FEATURED_COSMETIC, FEATURED_CRANIOFACIAL, OTHER_SERVICES_ORDER, ROUTES, SECTION, servicePath, type ServiceSlug } from "./routes";
import { PROCEDURE_PAGES } from "./procedures";

export const SITE = {
  name: "Dr Vybhav Deraje",
  legalName: "Dr Vybhav Deraje – Craniofacial & Plastic Surgeon",
  tagline: "Craniofacial & Plastic Surgeon",
  city: "Bangalore, India",
  phone: "+91 95355 81616",
  phoneTel: "+919535581616",
  /** WhatsApp on the same practice number; wa.me needs digits only. */
  whatsappNumber: "919535581616",
  whatsappUrl: "https://wa.me/919535581616?text=" + encodeURIComponent("Hello, I would like to enquire about a consultation with Dr Vybhav Deraje."),
  email: "connect@drvybhavderaje.com",
  utilityLine: "Reconstructing faces. Rebuilding lives.",
  /** <meta description> for the homepage (≤160 chars). */
  metaDescription: "Dr Vybhav Deraje, craniofacial & plastic surgeon in Bangalore: craniosynostosis, cleft, jaw and ear reconstruction; rhinoplasty, facelift, breast and body surgery.",
  /** Longer entity description used in structured data and llms.txt. */
  defaultDescription:
    "Dr Vybhav Deraje is a National Board certified plastic surgeon in Bangalore with fellowship training in craniofacial surgery (Australian Craniofacial Unit, Adelaide). Craniofacial surgery — craniosynostosis, cleft lip and palate, orthognathic (jaw) surgery and ear reconstruction — and cosmetic surgery: rhinoplasty, blepharoplasty, otoplasty, chin augmentation, facelift, tummy tuck, breast augmentation, breast reduction, gynaecomastia surgery and liposuction. He also treats facial injuries, head and neck cancer, facial palsy and hand conditions.",
  social: {
    facebook: "https://www.facebook.com/drvybhavderaje/",
    instagram: "https://www.instagram.com/drvybhavderaje/",
    linkedin: "https://www.linkedin.com/in/dr-vybhav-deraje-480729a1",
    youtube: "https://www.youtube.com/@drvybhavderaje",
  },
  /** ISO date the public copy was last reviewed; used for sitemap lastmod and schema dateModified. */
  contentUpdated: "2026-10-23",
};

export interface NavItem {
  href: string;
  label: string;
  /** Dropdown entries (service pages). */
  children?: { href: string; label: string }[];
  /** Target of the dropdown's trailing "All …" link (defaults to `href`). */
  allHref?: string;
}

/** Main navigation — defined after SERVICE_PAGES, at the end of the services section. */

/* ------------------------------------------------------------------------------------------------
 * Doctor profile
 * ---------------------------------------------------------------------------------------------- */

export const DOCTOR = {
  name: "Dr Vybhav Deraje",
  honorificSuffix: "MBBS, MS (General Surgery), DNB (Plastic Surgery)",
  fellowship: "Fellowship in Craniofacial Surgery (ACFU, Adelaide)",
  /** Karnataka Medical Council registration — shown in every byline and in the Physician schema. */
  kmcRegistration: "79493",
  summary:
    "Dr Vybhav Deraje is a National Board certified plastic surgeon with a special interest in craniofacial surgery. He has practised as a Consultant Craniofacial & Plastic Surgeon in Bangalore since returning from Adelaide, Australia in 2019. He is the founder of two practices in Bangalore: The Head Shape Clinic, for infant head-shape concerns and craniosynostosis, and Aesthetica Veda, a chain of cosmetic clinics where he consults at all three branches.",
  summary2: "Dr Vybhav is also the driving force behind the craniosynostosis multidisciplinary team at Aster Hospital, Whitefield, Bangalore.",
  values:
    "Dr Vybhav Deraje firmly believes in upholding the privacy, confidentiality and safety of all his patients. He also believes in collaboration and close coordination with other specialists and professionals in order to provide comprehensive, holistic healthcare.",
  bio: [
    "Born in Mangalore, a coastal town on the west coast of southern India, Dr Vybhav Deraje grew up and completed his schooling in Bangalore. He completed his medical degree at Kempegowda Institute of Medical Sciences, Bangalore (Rajiv Gandhi University of Health Sciences), training there from 2002 to 2008.",
    "His keen interest in surgery led him to complete his Master of Surgery degree and general surgical residency at Mysore Medical College and Research Institute, Mysore, from 2009 to 2012.",
    "During his surgical residency he was drawn to the art and craft of plastic surgery. He worked as a Registrar in Plastic Surgery at hospitals in Bangalore before entering formal training, and completed his plastic surgery training at Lok Nayak Hospital and the associated Maulana Azad Medical College, Delhi, from 2013 to 2015. While working in Delhi, treating many children with cleft lip and palate and other craniofacial anomalies, he developed his passion for craniofacial surgery.",
    "He then travelled to the United Kingdom for further training in plastic surgery at Queen Victoria Hospital, East Grinstead, sponsored by the Royal College of Surgeons of Edinburgh under the International Medical Graduate Sponsorship Scheme. Queen Victoria Hospital and the ‘Guinea Pig Club’ are well known in the plastic surgery community for the treatment and rehabilitation of airmen injured in World War II under Sir Archibald McIndoe. Here Dr Deraje trained extensively in breast cancer reconstruction and hand surgery, and also operated on many patients with skin cancer and burns.",
    "After a year in the UK he focused on his area of special interest, craniofacial surgery, completing the Fellowship in Craniomaxillofacial Surgery after a year and a half as Craniofacial Fellow at the world-renowned Australian Craniofacial Unit, Adelaide — one of only two stand-alone craniofacial units in the world. There he trained extensively in the management of craniosynostosis, cleft lip and palate, vascular anomalies, head and neck tumours, facial fractures and orthognathic surgery.",
    "Since returning from Adelaide in 2019 he has practised as a Consultant Craniofacial & Plastic Surgeon in Bangalore. He is the Founder & Director of Aesthetica Veda, a chain of cosmetic clinics in Bangalore where he primarily consults, and the founder of The Head Shape Clinic, Koramangala, which focuses on infant head-shape problems and craniosynostosis. He operates at Aster Whitefield Hospital, Gifted Hands Hospital, Aarogya Hastha Hospital, Medicover Hospital and Apollo Spectra Hospital.",
  ],
};

export const CREDENTIALS = [
  { title: "MBBS (2008)", detail: "Kempegowda Institute of Medical Sciences, Bangalore — Rajiv Gandhi University of Health Sciences" },
  { title: "MS — General Surgery (2012)", detail: "Mysore Medical College & Research Institute, Mysore" },
  { title: "DNB — Plastic Surgery (2015)", detail: "Lok Nayak Hospital & Maulana Azad Medical College, Delhi" },
  { title: "UK Fellowship in Plastic Surgery (2016–2017)", detail: "Queen Victoria Hospital, East Grinstead — Royal College of Surgeons of Edinburgh International Medical Graduate Sponsorship Scheme" },
  { title: "Australian Fellowship in Craniomaxillofacial Surgery (2018–2019)", detail: "Australian Craniofacial Unit, Adelaide, Australia" },
];

/**
 * Logos under /logos/ are served from /public (next/image); the rest are ImageKit paths.
 * logoWidth/logoHeight are the file's intrinsic size (only the aspect ratio matters; CSS sets the box).
 */
export const AFFILIATIONS: { org: string; detail: string; url: string; logo: string; logoWidth: number; logoHeight: number }[] = [
  { org: "Association of Plastic Surgeons of India", detail: "Life member (APSI ID 1799, Membership No. D089FL2019)", url: "https://www.apsi.in/", logo: "/custom/membership_1.png", logoWidth: 154, logoHeight: 155 },
  { org: "National Academy of Burns India", detail: "Life member", url: "https://www.nabi.org.in/", logo: "/custom/membership_2.png", logoWidth: 154, logoHeight: 155 },
  { org: "Karnataka Medical Council", detail: "Registered since 2008 (Reg. No. 79493)", url: "https://www.karnatakamedicalcouncil.com/", logo: "/custom/membership_3.png", logoWidth: 154, logoHeight: 155 },
  { org: "Indian Association of Aesthetic Plastic Surgeons (IAAPS)", detail: "Life member", url: "https://iaaps.net/", logo: "/logos/iaaps.png", logoWidth: 186, logoHeight: 101 },
  { org: "International Society of Craniofacial Surgery (ISCFS)", detail: "Member", url: "https://www.iscfs.org/", logo: "/logos/iscfs.png", logoWidth: 650, logoHeight: 201 },
];

export interface Hospital {
  name: string;
  /** ImageKit path; omitted when the practice has no photograph yet (a neutral tile is shown instead). */
  image?: string;
  address: string;
  phone: string;
  phoneDisplay: string;
}

/** Hospitals where Dr Deraje operates — list confirmed by the doctor, 23 Oct 2026. */
export const HOSPITALS: Hospital[] = [
  { name: "Aster Whitefield Hospital", image: "/custom/aster1.webp", address: "Plot No. 2, 3 & 4, Survey No. 76, Sadaramangala Industrial Area, Opp. ITPL Main Road, Kadugodi, Bengaluru, Karnataka 560066", phone: "+918045108888", phoneDisplay: "+91 80 4510 8888" },
  { name: "Gifted Hands Hospital", address: "No. 5AC-908, Hennur Banasawadi Road Extension, HRBR Layout 1st Block, Bengaluru, Karnataka 560043", phone: "+919187207454", phoneDisplay: "+91 91872 07454" },
  { name: "Aarogya Hastha Hospital", address: "No. 2816/2, Kasavanahalli Main Road, near 1st Cross Road, opp. HM Symphony, Off Sarjapur Road, Bengaluru, Karnataka 560035", phone: "+918066668800", phoneDisplay: "+91 80 6666 8800" },
  { name: "Medicover Hospital", address: "351 ITPL Main Road, Hoodi Village, Whitefield, Bengaluru, Karnataka 560048", phone: "+914068334455", phoneDisplay: "+91 40 6833 4455" },
  { name: "Apollo Spectra Hospital", image: "/custom/appolo1.webp", address: "143, 1st Cross, Near Nagarjuna Hotel, 5th Block, Koramangala, Bengaluru, Karnataka 560034", phone: "+918448440991", phoneDisplay: "+91 84484 40991" },
];

/** Photographs from the practice's about page (ImageKit paths; legacy /images/… URLs redirect there). */
export const ABOUT_GALLERY: Photo[] = [
  { src: "/custom/gallery_1.png", caption: "Receiving the Craniofacial Fellowship certificate from Prof Peter Anderson, Australian Craniofacial Unit, Adelaide", width: 370, height: 260 },
  { src: "/custom/gallery_2.png", caption: "With Dr Derick Mendonca, former Head, Department of Plastic Surgery, Sakra World Hospital, Bangalore", width: 370, height: 260 },
  { src: "/custom/gallery_3.png", caption: "At the Australian Craniofacial Unit, Adelaide, Australia", width: 370, height: 260 },
  { src: "/custom/gallery_4.png", caption: "With Prof David David, former Head, Australian Craniofacial Unit, Adelaide", width: 370, height: 260 },
  { src: "/custom/gallery_5.png", caption: "With Dr Rajeev B Ahuja, former Head, Department of Burns & Plastic Surgery, Lok Nayak Hospital and MAMC, Delhi", width: 370, height: 260 },
  { src: "/custom/12.png", caption: "With Dr Mark Moore, Head, Australian Craniofacial Unit, Adelaide", width: 370, height: 260 },
  { src: "/custom/13.png", caption: "With Dr Chutima Jirapinyo, Consultant Craniofacial Surgeon, Bangkok", width: 370, height: 260 },
  { src: "/custom/14.png", caption: "With Dr Adam Blackburn, Consultant Plastic Surgeon, East Grinstead, UK", width: 370, height: 260 },
  { src: "/custom/15.png", caption: "At a fat grafting demonstration course, Bangalore", width: 370, height: 260 },
  { src: "/custom/16.png", caption: "Debating at APSICON 2019, Bhubaneswar", width: 370, height: 260 },
  { src: "/custom/17.png", caption: "Presenting at ISCFS 2019, Paris", width: 370, height: 260 },
  { src: "/custom/18.png", caption: "Presenting at APSICON 2018, Lucknow", width: 370, height: 260 },
];

export const PUBLICATIONS = [
  "Deraje V, Tandon AS. The significance or insignificance of prematurely fused bilateral squamous sutures. 2022;9(1):82-4.",
  "Deraje V, Gopal S, Mendonca DA, Gujjalanavar RS. Endoscope-assisted “extended” suturectomy for unicoronal craniosynostosis: a technical note. Plast Reconstr Surg. 2021 Dec 1;148(6):1079e-80e.",
  "Deraje V, Gujjalanavar RS, Das S, Janardhan R, Rao P. Acute extremity gangrene in COVID-19 patients. Indian J Plast Surg. 2021;54(2):237-9.",
  "Mbaidjol Z, Shaharan S, Christopoulos G, Deraje V, Kannan RY. Fibonacci sequence ‘snail’ flap versus skin grafts in scalp reconstruction: a comparative study. Eur J Plast Surg. 2021;44:587–92.",
  "Sharma S, Deraje V, Gujjalanavar RS. Movement restricting heterotopic ossification after free functioning gracilis muscle transfer to elbow: a case report. Acta Sci Orthop. 2021;4(2):64-67.",
  "Mendonca DA, Ramamurthy V, Gopal S, Kumar P, Gujjalanavar RS, Deraje V, Sundarakrishnan S. Endoscopic assisted craniosynostosis surgery experience from South-East Asia. J Plast Reconstr Aesthet Surg. 2021;74(2):407-447.",
  "Mendonca DA, Gopal S, Gujjalanavar RS, Deraje V, Sunil HR, Ramamurthy V. Endoscopic versus open cranial reconstruction surgery for anterior craniosynostosis: experience from South-East Asia. FACE. 2020;1(2):105-113.",
  "Jirapinyo C, Deraje V, Huang G, Gue S, Anderson PJ, Moore MH. Cleidocranial dysplasia: management of the multiple craniofacial and skeletal anomalies. J Craniofac Surg. 2020;31(4):908-911.",
  "Deraje V, Jirapinyo C, Taranath A, Anderson PJ, Moore MH. The effect of fronto-orbital advancement on frontal sinus development and function in non-syndromic and syndromic craniosynostosis. J Craniofac Surg. 2020;31(3):707-710.",
  "Christopoulos G, Deraje V, Mbaidjol Z, Kannan RY. The “snail flap”: a rotation flap in scalp reconstruction. Plast Reconstr Surg Glob Open. 2020;8(1):e2599.",
  "Deraje V, Ahuja RB. A rare combination of Tessier 2 cleft with Goldenhar syndrome. J Cleft Lip Palate Craniofac Anomal. 2016;3:100-2.",
  "Mendonca DA, Deraje V, Gujjalanavar RS, Gopal S. Case series of three-dimensional printing technology applied in complex craniofacial deformity surgery. J Cleft Lip Palate Craniofac Anomal. 2016;3:88-94.",
  "Ahuja RB, Chatterjee P, Deraje V. A critical appraisal of non-surgical modalities for managing hypertrophic scars and keloids. Formos J Surg. 2015;48:49-56.",
];

export const PUBLICATIONS_OTHER = ["Life is tougher for women after plastic surgery residency: myth or reality? PLASTICOS 2020;5:25-8."];

export const PRESENTATIONS = [
  "Faculty talk, ‘Craniofacial procedures for sleep apnoea’ — 3rd Annual Workshop on Sleep & OSA, Bangalore, 9 Feb 2020.",
  "Faculty debate, ‘Gender issues in plastic surgery training and practice’ — APSICON 2019, Bhubaneswar, 11–15 Dec 2019.",
  "Poster, ‘Effect of fronto-orbital advancement on frontal sinus development and function in non-syndromic and syndromic craniosynostosis’ — ISCFS 2019, Paris, 16–19 Sep 2019.",
  "Instructor — SET 2-5 Registrars’ Conference (ASPS-RACS), Adelaide, 23–27 Mar 2019.",
  "Free paper, ‘Cleidocranial dysostosis – 40-year experience of ACFU in managing 15 patients’ — APSICON 2018, Lucknow, 23–25 Nov 2018.",
  "Poster (award paper category), ‘Outcome evaluation in rhinoplasty – three birds with a single stone’ — APSICON 2015, Mumbai, 27–31 Dec 2015.",
];

/* ------------------------------------------------------------------------------------------------
 * Clinics (seeded into the database; the public site falls back to this list)
 * ---------------------------------------------------------------------------------------------- */

export const CLINICS_SEED = [
  {
    slug: "whitefield",
    photo: "/custom/whitefield.webp",
    name: "Whitefield",
    brand: "Aesthetica Veda",
    addressLines: "222/220/A, 2nd Floor, above BMW Deutsche Motoren showroom, opposite Sheraton Grand, Whitefield Main Road, Sadaramangala, KR Puram Hobli, Bengaluru, Karnataka 560048",
    postcode: "560048",
    phone: "+916366789520",
    sortOrder: 1,
  },
  {
    slug: "hrbr-layout",
    photo: "/custom/hrbr.webp",
    name: "HRBR Layout",
    brand: "Aesthetica Veda",
    addressLines: "4M 403, 2nd Floor, TRINE House, Kammanahalli Main Road, HRBR Layout 3rd Block, Kalyan Nagar, Bengaluru, Karnataka 560043",
    postcode: "560043",
    phone: "+916366789521",
    sortOrder: 2,
  },
  {
    slug: "koramangala",
    photo: "/custom/koramangala.webp",
    name: "Koramangala",
    brand: "Aesthetica Veda",
    addressLines: "Docube Clinic, Suite 6 & 7, Sulochana Building, 365, 1st Floor, 1st Cross Road, 3rd Block, Koramangala, Bengaluru, Karnataka 560034",
    postcode: "560034",
    phone: "+916366789522",
    sortOrder: 3,
  },
];

export function mapsUrl(brand: string, address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${brand} ${address}`)}`;
}

/* ------------------------------------------------------------------------------------------------
 * Practices founded by Dr Vybhav Deraje (each has its own website; both are linked from this site)
 * ---------------------------------------------------------------------------------------------- */

export interface Practice {
  slug: "head-shape-clinic" | "aesthetica-veda";
  name: string;
  url: string;
  tagline: string;
  /** One-paragraph description, drafted from the practice's own website (see docs/CONTENT-APPROVAL.md). */
  description: string;
  where: string;
  /** Service groups this practice is the natural home for (drives the "Practice" line on service pages). */
  groups: ServiceGroup[];
}

export const PRACTICES: Practice[] = [
  {
    slug: "head-shape-clinic",
    name: "The Head Shape Clinic",
    url: "https://theheadshapeclinic.com/",
    tagline: "Caring for Little Heads",
    description:
      "Dr Vybhav's dedicated clinic for infant head-shape concerns: flat head syndrome (positional plagiocephaly and brachycephaly) and craniosynostosis. Assessment, helmet therapy and, where surgery is needed, the craniofacial team at Aster Hospital, Whitefield.",
    where: "Docube Clinic, Koramangala, Bengaluru — with outreach clinics in other Indian cities",
    groups: ["craniofacial"],
  },
  {
    slug: "aesthetica-veda",
    name: "Aesthetica Veda",
    url: "https://aestheticaveda.com/",
    tagline: "Minimalistic & Natural",
    description:
      "Dr Vybhav's cosmetic clinics in Bangalore — plastic surgery, skin, hair and dental care under one roof. He consults at all three branches, and most consultations for the procedures on this site take place here.",
    where: "Whitefield · HRBR Layout · Koramangala, Bengaluru",
    groups: ["cosmetic", "reconstructive"],
  },
];

export const HEAD_SHAPE_CLINIC = PRACTICES[0]!;
export const AESTHETICA_VEDA = PRACTICES[1]!;

/* ------------------------------------------------------------------------------------------------
 * Service pages
 * ---------------------------------------------------------------------------------------------- */

export interface ServiceItem {
  title: string;
  text: string;
  /** Legacy patient-information PDF path under /public, e.g. "/images/pdf/cleft/Patient-information-sheet-Cleft-lip.pdf". */
  sheet?: string;
}

export interface ServiceSection {
  heading: string;
  body?: string[];
  bullets?: string[];
  items?: ServiceItem[];
  note?: string;
}

export type ServiceGroup = "craniofacial" | "cosmetic" | "reconstructive";

export interface ServicePage {
  slug: ServiceSlug;
  path: string;
  /** Which of the two headline groups the page belongs to (hub pages for reconstructive work still sit under "cosmetic" for navigation). */
  group: ServiceGroup;
  /** Hub page this procedure page belongs to (e.g. rhinoplasty → facial plastic surgery). */
  parent?: ServiceSlug;
  /** Card / nav label. */
  shortTitle: string;
  /** H1. */
  title: string;
  metaTitle: string;
  description: string;
  eyebrow: string;
  lead: string;
  cardText: string;
  intro: string[];
  sections: ServiceSection[];
  faqs: { q: string; a: string }[];
  /** Schema.org MedicalCondition names covered by the page. */
  conditions: string[];
  /** Schema.org MedicalProcedure names covered by the page. */
  procedures: string[];
  related: ServiceSlug[];
  /** Optional photo gallery (ImageKit paths). */
  gallery?: Photo[];
  /** Page-level patient-information PDF (legacy path under /public/images/pdf). */
  infoSheet?: string;
}

export interface Photo {
  src: string;
  caption: string;
  width: number;
  height: number;
}

const PDF = "/images/pdf";

const LEGACY_SERVICE_PAGES: ServicePage[] = [
  {
    slug: "craniosynostosis-surgery-bangalore",
    path: servicePath("craniosynostosis-surgery-bangalore"),
    group: "craniofacial",
    shortTitle: "Craniosynostosis",
    title: "Craniosynostosis Surgery in Bangalore",
    metaTitle: "Craniosynostosis Surgery in Bangalore — Endoscopic & Open | Dr Vybhav Deraje",
    description: "Craniosynostosis surgery in Bangalore by Dr Vybhav Deraje: endoscopic keyhole surgery with 3D-printed helmet therapy under 6 months, and open cranial remodelling.",
    eyebrow: "Craniofacial Surgery · For Children & Families",
    lead: "Specialist assessment and surgery for babies whose skull sutures have closed too early — including minimally invasive endoscopic surgery with 3D-printed helmet therapy.",
    cardText: "Early-closing skull sutures in babies: endoscopic keyhole surgery, helmet therapy and open remodelling.",
    intro: [
      "Craniosynostosis is a birth defect in which one or more of the soft joints between the bones of a baby’s skull (the cranial sutures) close too early. Depending on the suture involved it changes the shape of the skull and, in some children, raises the pressure inside the skull and compresses the growing brain.",
      "Dr Vybhav Deraje has a special interest and expertise in managing craniosynostosis. He leads the craniosynostosis multidisciplinary team at Aster Hospital, Whitefield — the only hospital in India offering minimally invasive endoscope-assisted surgery together with 3D-printed helmet therapy for these children.",
    ],
    sections: [
      {
        heading: "Types of Craniosynostosis",
        bullets: [
          "Non-syndromic craniosynostosis — coronal, metopic, sagittal, lambdoid or multisuture.",
          "Syndromic craniosynostosis — Apert, Crouzon, Pfeiffer, Muenke and Saethre-Chotzen syndromes.",
        ],
      },
      {
        heading: "Signs and Symptoms",
        bullets: [
          "Distorted shape of the skull and face; a hard or raised ridge along the affected suture",
          "A soft spot (fontanelle) that disappears early or feels abnormal",
          "Slow or absent head growth as the baby grows; a flat-face appearance",
          "Raised pressure inside the skull — in some cases swelling of the optic disc and loss of vision",
          "Delayed developmental milestones, behavioural change or seizures",
          "Sleep apnoea and airway problems",
        ],
      },
      {
        heading: "Common Types Explained",
        items: [
          {
            title: "Unicoronal Synostosis",
            text: "One of the sutures running from the ear to the top of the head closes early. The forehead flattens on the affected side (anterior plagiocephaly), and the nose may deviate, the eye socket sit higher and the skull slant.",
            sheet: `${PDF}/Craniosynthosis/Patient-information-sheet-Unicoronal-craniosynostosis.pdf`,
          },
          {
            title: "Metopic Synostosis",
            text: "The suture down the middle of the forehead closes early, giving a triangular or boat-shaped forehead (trigonocephaly) with hollowing at both temples. Some children also have speech and learning difficulties.",
            sheet: `${PDF}/Craniosynthosis/Patient-information-sheet-Metopic-craniosynostosis.pdf`,
          },
          {
            title: "Sagittal Synostosis",
            text: "The suture running front to back along the top of the head closes early. The head becomes long and narrow (scaphocephaly).",
            sheet: `${PDF}/Craniosynthosis/Patient-information-sheet-Sagittal-craniosynostosis.pdf`,
          },
          {
            title: "Lambdoid Synostosis",
            text: "One or both sutures at the back of the head close early, flattening the back of the head (brachycephaly when both) or slanting it to one side (posterior plagiocephaly). The rarest form, sometimes confused with positional (deformational) plagiocephaly.",
            sheet: `${PDF}/Craniosynthosis/Patient-information-sheet-Lambdoid-craniosynostosis.pdf`,
          },
          {
            title: "Bicoronal Synostosis",
            text: "Both ear-to-crown sutures close early. The head becomes wide and flattened from front to back (brachycephaly).",
            sheet: `${PDF}/Craniosynthosis/Patient-information-sheet-Bicoronal-craniosynostosis.pdf`,
          },
          {
            title: "Multisuture Synostosis",
            text: "Many or all sutures close early, which can severely restrict brain growth through raised intracranial pressure; the head may be small (microcephaly). It may be non-syndromic or syndromic — syndromic cases are linked to gene changes (FGFR1, FGFR2, FGFR3, TWIST1, EFNB1 and others) and may involve hand or brain anomalies as well.",
            sheet: `${PDF}/Craniosynthosis/Patient-information-sheet-Multi-suture-craniosynostosis.pdf`,
          },
        ],
      },
      {
        heading: "How Craniosynostosis Is Treated",
        body: [
          "Treatment is surgical and needs a multidisciplinary team: craniofacial surgeon, neurosurgeon, paediatric anaesthetist and intensivist, ophthalmologist, ENT surgeon, speech therapist and orthodontist. The type of operation depends on the type of craniosynostosis and the age of the child. Dr Vybhav Deraje’s treatment protocol is based on strong scientific evidence and experience.",
        ],
        items: [
          {
            title: "Non-Syndromic Single-Suture Craniosynostosis — Under 6 Months",
            text: "Minimally invasive (keyhole) endoscope-assisted strip craniectomy followed by 3D-printed helmet therapy for 1–2 years. The fused suture is removed through a small incision using minimally invasive techniques: shorter hospital stay, minimal blood loss, usually no blood transfusion and a quick recovery. The helmet then moulds the skull and allows the brain to grow normally.",
          },
          {
            title: "Non-Syndromic Single-Suture Craniosynostosis — Over 6 Months",
            text: "Open surgery (fronto-orbital remodelling or cranial vault remodelling) to reshape the skull. The incision runs across the top of the head from ear to ear; the neurosurgeon removes the affected suture and the craniofacial plastic surgeon remoulds the skull bones into a normal shape.",
          },
          {
            title: "Syndromic Craniosynostosis",
            text: "Posterior vault expansion or fronto-orbital advancement — open procedures that enlarge the skull to give the brain room to grow, usually in the first year of life. Multiple operations are often needed and their timing depends on the child’s condition. A Le Fort III osteotomy and advancement after the age of 4 is sometimes required to improve obstructive sleep apnoea and airway problems. Some children also need physical therapy, occupational therapy, speech-language therapy or special education.",
          },
        ],
      },
    ],
    faqs: [
      { q: "What is craniosynostosis?", a: "Craniosynostosis is a birth defect in which one or more of the soft joints (sutures) between the bones of a baby’s skull close too early. It changes the shape of the skull and in some children raises the pressure inside the skull." },
      { q: "What are the signs of craniosynostosis in a baby?", a: "An unusual head shape, a hard ridge along a suture, a soft spot that disappears early, slow head growth or a flat face. Raised pressure can cause developmental delay, vision changes, seizures or sleep apnoea. A craniofacial specialist assessment, usually with imaging, confirms the diagnosis." },
      { q: "Is craniosynostosis surgery done through a keyhole?", a: "For non-syndromic single-suture craniosynostosis diagnosed before 6 months of age, Dr Vybhav Deraje performs minimally invasive endoscope-assisted strip craniectomy followed by 3D-printed helmet therapy. Older children usually need open fronto-orbital or cranial vault remodelling." },
      { q: "How long does the helmet have to be worn after endoscopic surgery?", a: "Helmet therapy after endoscope-assisted strip craniectomy usually continues for 1 to 2 years to mould the skull shape as the brain grows." },
      { q: "Where is craniosynostosis surgery performed in Bangalore?", a: "Dr Vybhav Deraje leads the craniosynostosis multidisciplinary team at Aster Hospital, Whitefield, Bangalore. Consultations are at Aesthetica Veda clinics in Whitefield, HRBR Layout and Koramangala, and through The Head Shape Clinic at Docube Clinic, Koramangala, which is dedicated to infant head-shape problems." },
      { q: "We live outside Bangalore. How should we plan?", a: "Call or email the clinic first, send any existing scan reports ahead, and confirm the appointment and clinic location before arranging travel. Many families travel to Bangalore for this care." },
    ],
    conditions: ["Craniosynostosis", "Unicoronal Synostosis", "Metopic Synostosis", "Sagittal Synostosis", "Lambdoid Synostosis", "Bicoronal Synostosis", "Multisuture Synostosis", "Apert syndrome", "Crouzon syndrome", "Pfeiffer syndrome"],
    procedures: ["Endoscope-assisted strip craniectomy", "3D-printed helmet therapy", "Fronto-orbital remodelling", "Cranial vault remodelling", "Posterior vault expansion", "Le Fort III osteotomy"],
    related: ["helmet-therapy-flat-head-bangalore", "cleft-lip-and-palate-treatment-bangalore", "other-craniofacial-conditions-treatments"],
    gallery: [
      { src: "/custom/cran_1.png", caption: "Sagittal craniosynostosis", width: 370, height: 260 },
      { src: "/custom/cran_2.png", caption: "Metopic craniosynostosis", width: 370, height: 260 },
      { src: "/custom/cran_3.png", caption: "Unicoronal craniosynostosis", width: 370, height: 260 },
      { src: "/custom/cran_4.png", caption: "Bicoronal craniosynostosis", width: 370, height: 260 },
      { src: "/custom/cran_5.png", caption: "3D-printed helmet", width: 370, height: 260 },
    ],
  },
  {
    slug: "cleft-lip-and-palate-treatment-bangalore",
    path: servicePath("cleft-lip-and-palate-treatment-bangalore"),
    group: "craniofacial",
    shortTitle: "Cleft Lip and Palate",
    title: "Cleft Lip and Palate Treatment in Bangalore",
    metaTitle: "Cleft Lip & Palate Treatment in Bangalore — Protocol-Based Care | Dr Vybhav Deraje",
    description: "Protocol-based cleft lip and palate treatment in Bangalore: lip repair at 3–6 months, palate repair at 9–12 months, speech surgery, bone grafting and jaw surgery.",
    eyebrow: "Craniofacial Surgery · Care Through Every Stage",
    lead: "Standardised, protocol-based care from the first lip repair in infancy to jaw surgery and rhinoplasty in adulthood — with ENT surgeons, dentists, orthodontists and speech therapists.",
    cardText: "Lip and palate repair in infancy through speech surgery, bone grafting, jaw surgery and rhinoplasty.",
    intro: [
      "Cleft lip and palate is one of the most common congenital facial anomalies. Left untreated it can affect a child’s self-esteem and has a significant effect on speech, swallowing and other oral and nasal functions.",
      "Dr Vybhav Deraje, together with a multidisciplinary team of ENT surgeons, dentists, orthodontists and speech therapists, provides protocol-based, standardised treatment. Common types include cleft lip only, cleft lip and alveolus, cleft palate only, cleft lip and palate, and submucous cleft palate.",
    ],
    sections: [
      {
        heading: "Treatment Protocol by Age",
        items: [
          { title: "3–6 Months — Lip Repair", text: "Needs only a one-day hospital stay. Babies can breastfeed immediately after surgery if there is no palatal problem.", sheet: `${PDF}/cleft/Patient-information-sheet-Cleft-lip.pdf` },
          {
            title: "9–12 Months — Palate Repair",
            text: "Needs 1–2 days in hospital. This operation is critical for the development of normal speech. Most babies also need ventilation tubes inserted in the ears by an ENT surgeon at the same time, because a cleft palate usually comes with a dysfunctional Eustachian tube and fluid in the ears.",
            sheet: `${PDF}/cleft/Patient-information-sheet-Cleft-palate.pdf`,
          },
          {
            title: "1–12 Years — Speech Therapy and Speech Surgery",
            text: "All children have speech therapy after the palate operation, with periodic speech assessment and nasendoscopy. Where needed, secondary speech surgery such as pharyngoplasty or Furlow’s Z-plasty improves speech.",
            sheet: `${PDF}/cleft/Patient-information-sheet-Speech-surgery.pdf`,
          },
          {
            title: "7–11 Years — Alveolar Bone Grafting with Orthodontics",
            text: "Bone from the hip is transferred to the upper jaw, timed to the eruption of the canine tooth. The orthodontist prepares the jaw before surgery and finishes alignment afterwards.",
            sheet: `${PDF}/cleft/Patient-information-sheet-Alveolar-bone-grafting.pdf`,
          },
          {
            title: "16–18 Years — Jaw Surgery with Orthodontics",
            text: "Orthognathic surgery corrects the ‘flat face’ (midface hypoplasia) with a Le Fort I maxillary advancement or sometimes double-jaw surgery. The upper jaw is brought forward for a proper bite and better facial balance; the lower jaw is moved when required. This is major surgery with a 3–4 day hospital stay including one day in ICU.",
            sheet: `${PDF}/cleft/Patient-information-sheet-Corrective-Jaw-surgery.pdf`,
          },
          {
            title: "Above 18 Years — Rhinoplasty, with Lip Revision If Needed",
            text: "Rhinoplasty corrects the nasal deformity associated with cleft lip and palate; any adjustments to the lip can be made at the same time.",
            sheet: `${PDF}/cleft/Patient-information-sheet-Cleft-Rhinoplasty.pdf`,
          },
        ],
        note: "Subsidised treatment is available for children with cleft lip and palate from economically disadvantaged families. Please ask the clinic.",
      },
    ],
    faqs: [
      { q: "At what age is cleft lip repaired?", a: "Lip repair is done at 3–6 months of age and needs only a one-day hospital stay. Babies can breastfeed immediately afterwards if there is no palatal problem." },
      { q: "When is a cleft palate repaired?", a: "Palate repair is done at 9–12 months of age with a 1–2 day hospital stay. It is critical for normal speech development, and ear ventilation tubes are usually inserted at the same time." },
      { q: "Will my child need speech therapy after cleft palate surgery?", a: "Yes. All children have speech therapy after palate repair, with periodic speech assessment and nasendoscopy. Some need secondary speech surgery (pharyngoplasty or Furlow’s Z-plasty) between 1 and 12 years." },
      { q: "What is alveolar bone grafting and when is it done?", a: "Between 7 and 11 years, bone from the hip is grafted into the gap in the upper jaw, timed to the eruption of the canine tooth, with orthodontic treatment before and after." },
      { q: "Is subsidised cleft treatment available in Bangalore?", a: "Yes. Subsidised treatment is available for children with cleft lip and palate from economically disadvantaged families. Contact the clinic for details." },
    ],
    conditions: ["Cleft lip", "Cleft palate", "Cleft Lip and Palate", "Submucous cleft palate", "Midface hypoplasia"],
    procedures: ["Cleft lip repair", "Cleft palate repair", "Pharyngoplasty", "Furlow Z-plasty", "Alveolar bone grafting", "Le Fort I maxillary advancement", "Cleft rhinoplasty"],
    related: ["corrective-jaw-surgery-bangalore", "craniosynostosis-surgery-bangalore", "face-plastic-surgery-bangalore"],
  },
  {
    slug: "corrective-jaw-surgery-bangalore",
    path: servicePath("corrective-jaw-surgery-bangalore"),
    group: "craniofacial",
    shortTitle: "Orthognathic (Jaw Correction) Surgery",
    title: "Orthognathic Surgery (Corrective Jaw Surgery) in Bangalore",
    metaTitle: "Orthognathic Surgery in Bangalore — Jaw Correction Surgery | Dr Vybhav Deraje",
    description: "Orthognathic (jaw correction) surgery in Bangalore by Dr Vybhav Deraje: Le Fort I, BSSO, double-jaw surgery and genioplasty for bite, face and sleep apnoea.",
    eyebrow: "Craniofacial Surgery · Function and Facial Balance",
    lead: "Repositioning the upper jaw, lower jaw or both to realign the teeth, balance the face and, in selected patients, relieve snoring and sleep apnoea.",
    cardText: "Le Fort I, BSSO, double-jaw surgery and genioplasty for bite problems and facial balance.",
    intro: [
      "Corrective jaw surgery, or orthognathic surgery, is the part of plastic and maxillofacial surgery in which the bones of the upper jaw, lower jaw or both are moved to realign the teeth or improve the appearance of the face.",
      "Dr Vybhav Deraje works with orthodontists, speech therapists and virtual surgical planning specialists to deliver this care.",
    ],
    sections: [
      {
        heading: "Reasons People Have Corrective Jaw Surgery",
        bullets: [
          "To correct malocclusion of the teeth — an ‘overbite’ (upper teeth far ahead of the lower), an ‘underbite’ (lower teeth ahead of the upper) or an ‘open bite’ (a gap between upper and lower teeth).",
          "To improve facial appearance — a ‘flat face’ where the upper jaw sits behind the lower, a ‘weak chin’ where the lower jaw is set back, or a ‘strong chin’ where the lower jaw is too far forward.",
          "To improve the smile — a ‘gummy smile’ or excessive tooth show.",
          "Cleft lip and palate — people with a cleft often have a ‘dish face’ deformity and benefit greatly from jaw surgery.",
          "Snoring and sleep apnoea — patients who have failed all other medical and surgical treatment can benefit from orthognathic surgery.",
        ],
      },
      {
        heading: "Two Approaches",
        items: [
          { title: "Orthodontics-first", text: "Braces and orthodontic treatment for 6 months to a year, followed by surgery. Some orthodontic treatment is sometimes needed after surgery as well." },
          { title: "Surgery-first", text: "The jaw surgery is done first and followed by 6 months to a year of orthodontic treatment." },
        ],
      },
      {
        heading: "Types of Corrective Jaw Surgery",
        items: [
          { title: "Le Fort I Maxillary Osteotomy", text: "Cuts are made in the upper jaw (maxilla) and the bone is moved forwards, backwards, up or down as the deformity requires, then fixed in its new position with titanium plates and screws." },
          { title: "Bilateral Sagittal Split Osteotomy (BSSO)", text: "Cuts are made in the lower jaw (mandible) and the bone is moved forwards, backwards, sideways or rotated, then fixed with titanium plates and screws." },
          { title: "Double-Jaw Surgery", text: "Le Fort I and BSSO combined — surgery on both the maxilla and the mandible." },
          { title: "Genioplasty", text: "Cuts are made in the chin and the bone is moved forwards, backwards, up or down to correct the deformity." },
        ],
        note: "All incisions are inside the mouth, so there are no external skin scars. These operations involve 3–4 days in hospital including one day in ICU; a blood transfusion is occasionally needed.",
      },
      {
        heading: "Patient Information",
        items: [{ title: "Patient Information Sheet", text: "Corrective jaw surgery — what to expect before and after the operation.", sheet: `${PDF}/Corrective-Jaw-Surgery/Patient-information-sheet-Jaw-surgery.pdf` }],
      },
    ],
    faqs: [
      { q: "What is orthognathic surgery?", a: "Orthognathic (corrective jaw) surgery moves the bones of the upper jaw, lower jaw or both to realign the teeth and improve the balance of the face. The main operations are Le Fort I osteotomy, bilateral sagittal split osteotomy (BSSO), double-jaw surgery and genioplasty." },
      { q: "Does jaw surgery leave visible scars?", a: "No. All incisions are made inside the mouth, so there are no external skin scars." },
      { q: "How long is the hospital stay after corrective jaw surgery?", a: "Usually 3–4 days, including one day in the intensive care unit. A blood transfusion is occasionally needed." },
      { q: "Do I need braces before jaw surgery?", a: "In the orthodontics-first approach, braces are worn for 6 months to a year before surgery. In the surgery-first approach the jaw is operated on first and orthodontic treatment follows for 6 months to a year. Your orthodontist and surgeon decide together which suits you." },
      { q: "Can jaw surgery help snoring and sleep apnoea?", a: "People with snoring and sleep apnoea who have not improved with other medical and surgical treatment can potentially benefit from orthognathic surgery." },
    ],
    conditions: ["Malocclusion", "Overbite", "Underbite", "Open bite", "Midface hypoplasia", "Retrogenia", "Gummy smile", "Obstructive sleep apnoea"],
    procedures: ["Orthognathic surgery", "Le Fort I osteotomy", "Bilateral sagittal split osteotomy", "Double jaw surgery", "Genioplasty"],
    related: ["cleft-lip-and-palate-treatment-bangalore", "face-plastic-surgery-bangalore", "facial-injuries-and-fracture-treatments"],
  },
  {
    slug: "facial-injuries-and-fracture-treatments",
    path: servicePath("facial-injuries-and-fracture-treatments"),
    group: "craniofacial",
    shortTitle: "Facial Injuries & Fractures",
    title: "Facial Injuries and Facial Fracture Treatment in Bangalore",
    metaTitle: "Facial Injury & Fracture Treatment in Bangalore | Dr Vybhav Deraje",
    description: "Facial injury and fracture treatment in Bangalore: plastic surgical wound repair and titanium-plate fixation of forehead, orbital, nasal, cheek and jaw fractures.",
    eyebrow: "Craniofacial Surgery · Trauma",
    lead: "Meticulous repair of facial wounds and fixation of facial fractures after road accidents, falls, assaults and sporting injuries.",
    cardText: "Repair of facial wounds and plate fixation of forehead, orbital, nasal, cheek and jaw fractures.",
    intro: ["Facial injuries and fractures are among the most common injuries after road traffic accidents, falls, assaults and sporting mishaps."],
    sections: [
      {
        heading: "Facial Abrasions and Lacerations",
        body: [
          "Abrasions (grazes or scratches) are a loss of the outer layer of skin, usually from friction. Lacerations are full-thickness skin injuries, sometimes with loss of tissue.",
          "A plastic surgeon is the best-placed professional to treat facial abrasions and lacerations: meticulous tissue handling, magnification and fine sutures, an eye for aesthetics and careful long-term scar management.",
        ],
      },
      {
        heading: "Facial Fractures",
        body: [
          "Displaced facial fractures that cause a functional or aesthetic problem usually need reduction and fixation. The common fractures are of the frontal bone (forehead), orbit (eye socket), nose, maxilla (upper jaw), zygoma (cheek) and mandible (lower jaw).",
          "A CT scan and X-rays may be needed for assessment. The bones are brought back into position and stabilised with titanium plates and screws. Dr Vybhav Deraje uses the Synthes plating system. Surgery usually needs a one-day admission and most patients are back to normal within about a week.",
        ],
        items: [{ title: "Patient Information Sheet", text: "Facial injuries and fractures — what to expect before and after surgery.", sheet: `${PDF}/Facial-Injuries-and-fracture/Patient-information-sheet-Facial-injuries-and-fractures.pdf` }],
      },
    ],
    faqs: [
      { q: "Should a facial cut be stitched by a plastic surgeon?", a: "Facial lacerations benefit from a plastic surgeon’s meticulous tissue handling, magnification, fine sutures and long-term scar management, which give the best chance of an inconspicuous scar." },
      { q: "How are facial fractures fixed?", a: "Displaced fractures of the forehead, eye socket, nose, upper jaw, cheek or lower jaw are brought back into position and stabilised with titanium plates and screws, after assessment with a CT scan and X-rays." },
      { q: "How long is the recovery after facial fracture surgery?", a: "Surgery usually needs a one-day hospital admission and most patients return to normal activities within about a week." },
      { q: "Is this an emergency service?", a: "No. This website and its enquiry form are not an emergency service. For an acute injury go to the nearest emergency department; the hospital team can involve Dr Vybhav Deraje where appropriate." },
    ],
    conditions: ["Facial laceration", "Facial abrasion", "Frontal bone fracture", "Orbital fracture", "Nasal fracture", "Maxillary fracture", "Zygomatic fracture", "Mandibular fracture"],
    procedures: ["Laceration repair", "Open reduction and internal fixation of facial fractures"],
    related: ["corrective-jaw-surgery-bangalore", "hand-plastic-surgeon-bangalore", "face-plastic-surgery-bangalore"],
  },
  {
    slug: "head-and-neck-cancer-treatment",
    path: servicePath("head-and-neck-cancer-treatment"),
    group: "craniofacial",
    shortTitle: "Head & Neck Cancer Reconstruction",
    title: "Head and Neck Cancer Reconstruction in Bangalore",
    metaTitle: "Head & Neck Cancer Reconstruction in Bangalore — Free Flap Surgery | Dr Vybhav Deraje",
    description: "Microsurgical reconstruction after head and neck cancer surgery in Bangalore by Dr Vybhav Deraje: ALT, radial forearm, fibula, DCIA, gracilis and LD free flaps.",
    eyebrow: "Reconstructive Surgery · Oncology",
    lead: "Rebuilding skin, bone and muscle after removal of oral, salivary, skin and jaw tumours — usually in the same operation as the cancer surgery.",
    cardText: "Microsurgical free-flap reconstruction after removal of oral, skin, salivary and jaw tumours.",
    intro: [
      "Head and neck cancers include oral cavity cancers (squamous cell carcinoma), salivary gland tumours, skin cancers (squamous cell carcinoma, basal cell carcinoma, melanoma), jaw tumours (ameloblastoma, angiofibroma, giant cell tumours) and tumours of the nasopharynx and oropharynx.",
      "They are treated by a multidisciplinary team of ENT and oncological surgeons, plastic surgeons, medical and radiation oncologists, speech therapists and dieticians. After the tumour is excised, a reconstructive procedure by a plastic surgeon — ideally at the same time as the cancer surgery — gives the best result.",
    ],
    sections: [
      {
        heading: "How the Reconstruction Is Done",
        items: [
          { title: "Loss of Skin", text: "Skin is borrowed locally or from a distant site. Most commonly skin from the thigh (anterolateral thigh, ALT flap) or the forearm (radial forearm flap) is transferred using microsurgical techniques." },
          { title: "Loss of Bone", text: "Bone is borrowed from the leg (fibula flap) or the hip (DCIA flap)." },
          { title: "When Muscle Is Needed", text: "Muscle is borrowed from the thigh (gracilis flap) or the back (latissimus dorsi flap)." },
        ],
        body: ["Dr Vybhav Deraje uses an advanced Leica operating microscope for these complex procedures and, for suitable patients, the GEM microvascular anastomotic coupler."],
      },
      {
        heading: "Patient Information",
        items: [{ title: "Patient Information Sheet", text: "Head and neck cancer reconstruction — what to expect.", sheet: `${PDF}/Head-and-Neck-Cancer/Patient-information-sheet-Head-and-Neck-Cancer.pdf` }],
      },
    ],
    faqs: [
      { q: "Is reconstruction done at the same time as cancer surgery?", a: "Usually yes. Reconstruction by a plastic surgeon in the same operation as the tumour removal gives the best functional and aesthetic result." },
      { q: "Where does the tissue for reconstruction come from?", a: "Skin is most often taken from the thigh (ALT flap) or forearm (radial forearm flap), bone from the leg (fibula) or hip (DCIA), and muscle from the thigh (gracilis) or back (latissimus dorsi), all transferred with microsurgery." },
      { q: "Which hospitals in Bangalore does Dr Vybhav Deraje operate at?", a: "Five hospitals: Aster Whitefield Hospital, Gifted Hands Hospital (HRBR Layout), Aarogya Hastha Hospital (Sarjapur Road), Medicover Hospital (Whitefield) and Apollo Spectra Hospital (Koramangala)." },
    ],
    conditions: ["Oral cavity cancer", "Salivary gland tumour", "Skin cancer", "Ameloblastoma", "Oropharyngeal cancer"],
    procedures: ["Free flap reconstruction", "Anterolateral thigh flap", "Radial forearm flap", "Fibula flap", "DCIA flap", "Gracilis flap", "Latissimus dorsi flap"],
    related: ["facial-injuries-and-fracture-treatments", "breast-plastic-surgeon-bangalore", "other-craniofacial-conditions-treatments"],
  },
  {
    slug: "other-craniofacial-conditions-treatments",
    path: servicePath("other-craniofacial-conditions-treatments"),
    group: "craniofacial",
    shortTitle: "Other Craniofacial Conditions",
    title: "Facial Palsy, Parry-Romberg Disease and Vascular Anomalies",
    metaTitle: "Facial Palsy, Parry-Romberg & Vascular Anomaly Treatment in Bangalore | Dr Vybhav Deraje",
    description: "Treatment in Bangalore for facial palsy (nerve transfer, gracilis smile surgery), Parry-Romberg disease (fat grafting) and vascular tumours in children.",
    eyebrow: "Craniofacial Surgery · Other Conditions",
    lead: "Specialist care for facial nerve palsy, facial volume loss and vascular tumours and malformations.",
    cardText: "Facial palsy reconstruction, fat grafting for Parry-Romberg disease, vascular tumours and malformations.",
    intro: ["Beyond craniosynostosis, clefts and trauma, craniofacial surgery covers a range of conditions that affect the function and appearance of the face."],
    sections: [
      {
        heading: "Facial Palsy",
        body: [
          "Facial palsy is loss of function of the muscles of facial expression due to injury to or compression of the facial nerve.",
          "It is best treated early — within one year — when nerve transfer procedures can be carried out using nerve grafts from the leg (sural nerve). If treatment is delayed by more than 1–2 years, a major procedure such as free functioning muscle transfer using thigh muscle (gracilis) is needed to reconstruct the smile, and gold weights are placed in the eyelid to help it close properly. Physiotherapy and Botox injections may be needed as supplementary treatment.",
        ],
      },
      {
        heading: "Parry-Romberg Disease",
        body: [
          "This condition causes contour deformities of the face: loss of volume under the skin produces depressions, and the skin itself may thin.",
          "Fat grafting is an excellent option. Fat is taken from the tummy or thighs and injected into the affected areas to restore a smooth surface — usually a day procedure.",
        ],
      },
      {
        heading: "Vascular Tumours and Malformations",
        body: [
          "Haemangioma, lymphangioma, arteriovenous malformations, venous malformations and capillary malformations are quite common in children. Some resolve on their own; some do not.",
          "Depending on the exact diagnosis your child may need medication (such as propranolol), injection therapy with sclerosants (such as bleomycin), an interventional radiology procedure (such as coiling) or surgery (complete excision or debulking). Your plastic surgeon, in consultation with the interventional radiologist, will help you choose the right treatment.",
        ],
      },
    ],
    faqs: [
      { q: "How soon should facial palsy be treated?", a: "Ideally within the first year, when nerve transfer using a sural nerve graft from the leg is possible. After 1–2 years, smile reconstruction needs free functioning gracilis muscle transfer, with eyelid gold weights to help eye closure." },
      { q: "What is the treatment for Parry-Romberg disease?", a: "Fat grafting — fat from the tummy or thighs is injected into the depressed areas of the face to restore a smooth contour. It is usually a day procedure." },
      { q: "Do haemangiomas in babies need surgery?", a: "Not always. Some vascular tumours resolve on their own. Others are treated with medication (propranolol), sclerosant injections (bleomycin), interventional radiology or surgery, depending on the exact diagnosis." },
    ],
    conditions: ["Facial Palsy", "Parry-Romberg syndrome", "Haemangioma", "Lymphangioma", "Arteriovenous malformation", "Venous malformation", "Capillary malformation"],
    procedures: ["Facial nerve transfer", "Free functioning gracilis muscle transfer", "Eyelid gold weight insertion", "Fat Grafting", "Sclerotherapy"],
    related: ["craniosynostosis-surgery-bangalore", "face-plastic-surgery-bangalore", "head-and-neck-cancer-treatment"],
  },
  {
    slug: "face-plastic-surgery-bangalore",
    path: servicePath("face-plastic-surgery-bangalore"),
    group: "cosmetic",
    shortTitle: "Facial Plastic Surgery — All Procedures",
    title: "Facial Plastic Surgery in Bangalore",
    metaTitle: "Facial Plastic Surgery in Bangalore — Rhinoplasty, Blepharoplasty, Facelift | Dr Vybhav Deraje",
    description: "Facial plastic surgery in Bangalore by Dr Vybhav Deraje: rhinoplasty, blepharoplasty, chin and ear correction, facelift, fat grafting, Botox and fillers.",
    eyebrow: "Cosmetic Surgery · Face · Overview",
    lead: "Surgical and non-surgical options for the nose, eyes, chin, ears, forehead and ageing face — explained plainly, with realistic recovery times.",
    cardText: "Rhinoplasty, eyelid surgery, chin and ear correction, facelift, fat grafting, Botox and fillers.",
    intro: ["An informed decision begins with an honest conversation about what you would like to change, what is achievable and what recovery involves. These are the facial procedures Dr Vybhav Deraje offers."],
    sections: [
      {
        heading: "Procedures",
        items: [
          { title: "Rhinoplasty (Nose Job)", text: "Surgery to correct the shape of the nose or enhance its appearance, sometimes combined with septoplasty for a deviated septum. Done under general anaesthesia with a one-day admission; back to normal activities in 2–3 days. You may have a nasal pack for one day and a nasal splint for a week.", sheet: `${PDF}/Plastic-Surgery-of-Face/Patient-information-sheet-Rhinoplasty.pdf` },
          { title: "Blepharoplasty (Eyelid Surgery)", text: "A day-care procedure under local anaesthesia that removes excess fat and skin from the upper and/or lower eyelids to correct puffy eye bags and a tired look.", sheet: `${PDF}/Plastic-Surgery-of-Face/Patient-information-sheet-Blepharoplasty.pdf` },
          { title: "Chin Augmentation", text: "Corrects a weak, strong or deviated chin. A day-care procedure under general anaesthesia using an implant (silicone or Medpor) or by repositioning your own bone (genioplasty).", sheet: `${PDF}/Plastic-Surgery-of-Face/Patient-information-sheet-Chin-Augmentation.pdf` },
          { title: "Otoplasty (Prominent Ear Correction)", text: "Corrects the shape of the external ear in bat ear, prominent ear and Stahl ear deformities. Split ear-lobe repair is also offered. All are day-care procedures.", sheet: `${PDF}/Plastic-Surgery-of-Face/Patient-information-sheet-Otoplasty.pdf` },
          { title: "Facelift and Necklift", text: "Reverses the skin signs of ageing on the face and neck — jowls, wrinkles, crow’s feet and loose skin. Incisions are placed at strategic points to hide the eventual scars. A day-care procedure under general anaesthesia.", sheet: `${PDF}/Plastic-Surgery-of-Face/Patient-information-sheet-Facelift-and-Necklift.pdf` },
          { title: "Fat Grafting", text: "Your own fat, as microfat or nanofat, is used to correct contour deformities and rejuvenate the skin. A day-care procedure that can be done under local anaesthesia. Nanofat and microfat are good alternatives to PRP and fillers for rejuvenation and volume restoration.", sheet: `${PDF}/Plastic-Surgery-of-Face/Patient-information-sheet-Fat-grafting.pdf` },
          { title: "Botox and Fillers", text: "Non-surgical treatments offered to selected individuals. Botox relaxes over-contracting muscles to reduce early wrinkles; hyaluronic acid fillers restore volume to areas such as the lips, around the eyes and the nasal tip. Both are out-patient clinic procedures." },
          { title: "Endoscopic Scarless Forehead Surgery", text: "Forehead lesions such as lipoma, osteoma and dermoid cyst are removed with an endoscope through an incision beyond the hairline, leaving no scar on the forehead.", sheet: `${PDF}/Plastic-Surgery-of-Face/Patient-information-sheet-Endoscopic-scarless-forehead-surgery.pdf` },
        ],
      },
    ],
    faqs: [
      { q: "How long is recovery after rhinoplasty?", a: "Rhinoplasty is done under general anaesthesia with a one-day admission. Most people return to normal activities in 2–3 days, with a nasal pack for one day and a splint for about a week." },
      { q: "Is blepharoplasty done under general anaesthesia?", a: "No. Eyelid surgery is a day-care procedure under local anaesthesia, on the upper eyelid, lower eyelid or both." },
      { q: "Can a forehead lipoma be removed without a scar on the forehead?", a: "Yes. Endoscopic scarless forehead surgery removes lipomas, osteomas and dermoid cysts through an incision hidden beyond the hairline." },
      { q: "Is a consultation a commitment to surgery?", a: "No. Use the consultation to understand your options, alternatives, limitations and recovery, then take the time you need to decide." },
      { q: "Can I get a cost estimate?", a: "Yes — after assessment the clinic gives an individual estimate. Ask what it includes: hospital charges, anaesthesia, implants and follow-up." },
    ],
    conditions: ["Nasal deformity", "Dermatochalasis", "Microgenia", "Prominent ears", "Facial ageing", "Forehead lipoma"],
    procedures: ["Rhinoplasty", "Blepharoplasty", "Chin Augmentation", "Otoplasty", "Facelift", "Necklift", "Fat Grafting", "Botulinum toxin injection", "Dermal fillers", "Endoscopic forehead surgery"],
    related: ["breast-plastic-surgeon-bangalore", "body-plastic-surgeon-bangalore", "corrective-jaw-surgery-bangalore"],
  },
  {
    slug: "breast-plastic-surgeon-bangalore",
    path: servicePath("breast-plastic-surgeon-bangalore"),
    group: "cosmetic",
    shortTitle: "Breast Surgery — All Procedures",
    title: "Breast Plastic Surgery in Bangalore",
    metaTitle: "Breast Surgery in Bangalore — Augmentation, Lift, Reduction, Reconstruction | Dr Vybhav Deraje",
    description: "Breast surgery in Bangalore by Dr Vybhav Deraje: augmentation with implants or fat, lift, reduction, DIEP flap reconstruction after cancer and gynaecomastia surgery.",
    eyebrow: "Cosmetic & Reconstructive Surgery · Breast · Overview",
    lead: "Augmentation, lift, reduction and reconstruction after breast cancer — plus male breast reduction — with a clear explanation of what each involves.",
    cardText: "Augmentation, lift, reduction, reconstruction after cancer and gynaecomastia surgery.",
    intro: ["Each of these procedures is discussed individually at consultation, including the options, scars, recovery and realistic outcomes."],
    sections: [
      {
        heading: "Procedures",
        items: [
          { title: "Breast Augmentation", text: "Increases the size, volume and projection of the breasts. A day-care procedure under general anaesthesia, using either a silicone implant or fat from your own body — your surgeon helps you choose.", sheet: `${PDF}/Plastic-surgery-of-Breast/Patient-information-sheet-Breast-augmentation.pdf` },
          { title: "Breast Lift (Mastopexy)", text: "Restores projection to deflated or sagging breasts for a perkier, more youthful shape. A day-care procedure under general anaesthesia; the scars fade over time.", sheet: `${PDF}/Plastic-surgery-of-Breast/Patient-information-sheet-Breast-lift.pdf` },
          { title: "Breast Reduction", text: "Reduces the size and volume of very large breasts (gigantomastia), relieving back pain, rashes and dermatitis. A day-care procedure under general anaesthesia with strategically placed scars that fade over time.", sheet: `${PDF}/Plastic-surgery-of-Breast/Patient-information-sheet-Breast-reduction.pdf` },
          {
            title: "Breast Reconstruction after Cancer",
            text: "Women who need a mastectomy need not be left without a breast. Dr Vybhav Deraje works with the breast surgeon to reconstruct the breast either during the cancer operation (immediate) or later (delayed). The most common operation uses abdominal tissue (DIEP / MS-TRAM flap), which also gives a tummy tuck; if the abdomen is unsuitable, thigh tissue (TUG flap) or back tissue with an implant (LD flap) can be used. These operations involve 4–5 days in hospital under general anaesthesia. The nipple and areola can later be reconstructed under local anaesthesia, and women having a lumpectomy or partial resection can benefit from oncoplastic techniques to keep the breasts harmonious.",
            sheet: `${PDF}/Plastic-surgery-of-Breast/Patient-information-sheet-Breast-cancer-reconstruction.pdf`,
          },
          { title: "Gynaecomastia Surgery (Male Breast Reduction)", text: "A day-care procedure for enlarged breasts in men, common in adolescence; a hormonal work-up is sometimes needed first. Treatment is liposuction, surgical excision or both, aiming for a natural masculine chest, usually with no visible scar.", sheet: `${PDF}/Plastic-surgery-of-Breast/Patient-information-sheet-Gynaecomastia-correction.pdf` },
        ],
      },
    ],
    faqs: [
      { q: "Can breast augmentation be done without implants?", a: "Yes. Augmentation can use a silicone implant or fat transferred from your own body. Both are day-care procedures under general anaesthesia; your surgeon helps you choose." },
      { q: "Can the breast be reconstructed at the same time as a mastectomy?", a: "Yes. Reconstruction can be immediate (during the cancer surgery) or delayed, using abdominal tissue (DIEP / MS-TRAM), thigh tissue (TUG) or back tissue with an implant (LD flap). Hospital stay is 4–5 days." },
      { q: "Does gynaecomastia surgery leave scars?", a: "Usually there is no visible scar on the chest. Treatment is liposuction, excision or both, done as a day-care procedure." },
      { q: "Does breast reduction help back pain?", a: "Breast reduction treats very large breasts (gigantomastia) and relieves symptoms such as back pain, rashes and dermatitis caused by their weight." },
    ],
    conditions: ["Breast hypoplasia", "Breast ptosis", "Gigantomastia", "Breast cancer", "Gynaecomastia"],
    procedures: ["Breast Augmentation", "Mastopexy", "Breast Reduction", "DIEP flap breast reconstruction", "TUG flap", "Latissimus dorsi flap", "Nipple reconstruction", "Oncoplastic breast surgery", "Gynaecomastia Surgery"],
    related: ["body-plastic-surgeon-bangalore", "face-plastic-surgery-bangalore", "head-and-neck-cancer-treatment"],
  },
  {
    slug: "body-plastic-surgeon-bangalore",
    path: servicePath("body-plastic-surgeon-bangalore"),
    group: "cosmetic",
    shortTitle: "Body Contouring — All Procedures",
    title: "Body Contouring Surgery in Bangalore",
    metaTitle: "Body Contouring in Bangalore — Tummy Tuck, Liposuction, Arm & Thigh Lift | Dr Vybhav Deraje",
    description: "Body contouring in Bangalore by Dr Vybhav Deraje: abdominoplasty (tummy tuck), power-assisted liposuction, arm lift and thigh lift, with recovery explained.",
    eyebrow: "Cosmetic Surgery · Body · Overview",
    lead: "Abdominoplasty, liposuction, arm lift and thigh lift — with honest guidance on scars, hospital stay and recovery.",
    cardText: "Tummy tuck, power-assisted liposuction, arm lift and thigh lift.",
    intro: ["Body contouring removes excess skin and fat and tightens tissue to restore a firmer shape. The right procedure depends on your anatomy and goals, which is what the consultation is for."],
    sections: [
      {
        heading: "Procedures",
        items: [
          { title: "Abdominoplasty (Tummy Tuck)", text: "Removes excess, sagging tissue from the abdomen for a flat, fit appearance. The abdominal muscles are tightened and any hernia repaired at the same time; the scar sits below the line of underwear. Often combined with liposuction or a breast lift as a ‘mummy makeover’ after a woman has completed her family. General anaesthesia with a 3–4 day hospital stay; normal activities in about a week and strenuous exercise after 6 weeks.", sheet: `${PDF}/Plastic-Surgery-of-Body/Patient-information-sheet-Abdominoplasty.pdf` },
          { title: "Liposuction", text: "A day-care procedure under general anaesthesia in which excess fat is removed from specific areas for a smoother contour. Dr Vybhav Deraje uses the MicroAire power-assisted liposuction system.", sheet: `${PDF}/Plastic-Surgery-of-Body/Patient-information-sheet-Liposuction.pdf` },
          { title: "Brachioplasty (Arm Lift)", text: "A day-care procedure under general anaesthesia removing excess skin and tissue from the arms for a slimmer look.", sheet: `${PDF}/Plastic-Surgery-of-Body/Patient-information-sheet-Brachiaplasty.pdf` },
          { title: "Thighplasty (Thigh Lift)", text: "A day-care procedure under general anaesthesia removing excess skin and tissue from the thighs for a slimmer look and to recreate the gap between the thighs.", sheet: `${PDF}/Plastic-Surgery-of-Body/Patient-information-sheet-Thighplasty.pdf` },
        ],
      },
    ],
    faqs: [
      { q: "How long is the hospital stay after a tummy tuck?", a: "Abdominoplasty is done under general anaesthesia with a 3–4 day hospital stay. Most people return to normal activities in about a week and strenuous exercise after 6 weeks." },
      { q: "Is liposuction a day-care procedure?", a: "Yes. Liposuction is done as a day-care procedure under general anaesthesia using the MicroAire power-assisted system." },
      { q: "Where is the scar after abdominoplasty?", a: "The scar is placed low on the abdomen so that it is hidden under the line of underwear." },
      { q: "Can a tummy tuck be combined with other procedures?", a: "Yes. It is often combined with liposuction, a breast lift or other procedures as a ‘mummy makeover’ once a woman has completed her family." },
    ],
    conditions: ["Abdominal skin laxity", "Diastasis recti", "Localised fat deposits", "Arm skin laxity", "Thigh skin laxity"],
    procedures: ["Abdominoplasty", "Liposuction", "Brachioplasty", "Thighplasty"],
    related: ["breast-plastic-surgeon-bangalore", "face-plastic-surgery-bangalore", "hand-plastic-surgeon-bangalore"],
  },
  {
    slug: "hand-plastic-surgeon-bangalore",
    path: servicePath("hand-plastic-surgeon-bangalore"),
    group: "reconstructive",
    shortTitle: "Hand Surgery",
    title: "Hand Surgery in Bangalore",
    metaTitle: "Hand Surgery in Bangalore — Carpal Tunnel, Trigger Finger, Syndactyly, Hand Trauma | Dr Vybhav Deraje",
    description: "Hand surgery in Bangalore by Dr Vybhav Deraje: wide-awake (WALANT) carpal tunnel and trigger finger release, syndactyly, burn contractures and hand trauma.",
    eyebrow: "Reconstructive Surgery · Hand",
    lead: "Wide-awake day-care surgery for carpal tunnel and trigger finger, congenital hand surgery for children, burn deformity release and emergency hand trauma care.",
    cardText: "WALANT carpal tunnel and trigger finger release, syndactyly, burn contractures and hand trauma.",
    intro: ["Hand surgery sits at the heart of plastic surgery. Dr Vybhav Deraje trained in hand surgery at Queen Victoria Hospital, East Grinstead, and offers the following procedures."],
    sections: [
      {
        heading: "Procedures",
        items: [
          { title: "Carpal Tunnel Release", text: "For carpal tunnel syndrome, where the median nerve is compressed in a canal at the wrist. Releasing the tunnel relieves numbness, tingling and weakness. Offered as a day-care WALANT procedure — Wide Awake, Local Anaesthesia, No Tourniquet — the most contemporary approach to elective hand surgery worldwide.", sheet: `${PDF}/Plastic-Surgery-of-Hand/Patient-information-sheet-Carpal-tunnel-release.pdf` },
          { title: "Trigger Finger Release", text: "Also a day-care WALANT procedure: the pulley that causes the finger to catch and lock is released, with immediate relief of symptoms.", sheet: `${PDF}/Plastic-Surgery-of-Hand/Patient-information-sheet-Trigger-finger-release.pdf` },
          { title: "Syndactyly Release", text: "Syndactyly is a common congenital deformity in which two or more adjacent fingers have not separated. The fingers are released and the wounds covered with skin grafts, usually before the age of one, as a day-care procedure under general anaesthesia.", sheet: `${PDF}/Plastic-Surgery-of-Hand/Patient-information-sheet-Syndactyly-release.pdf` },
          { title: "Burnt Hand Deformity Release", text: "Contractures caused by burns are released and the wounds covered with skin grafts or flaps from elsewhere on the body. Rigorous physiotherapy is needed before and after." },
          { title: "Hand Injuries", text: "A hand trauma service for nail-bed injuries, tendon injuries, finger and hand amputations, mangled hand, brachial plexus injuries, nerve and vascular injuries. Dr Vybhav Deraje works with the hospital’s hand therapy unit to provide complete hand care." },
        ],
      },
    ],
    faqs: [
      { q: "What is WALANT hand surgery?", a: "WALANT stands for Wide Awake, Local Anaesthesia, No Tourniquet. You stay awake, only local anaesthetic is used and no tourniquet is applied — the most contemporary method for elective hand surgery. Dr Vybhav Deraje uses it for carpal tunnel and trigger finger release as day-care procedures." },
      { q: "At what age is syndactyly surgery done?", a: "Usually before the age of one year, as a day-care procedure under general anaesthesia. The joined fingers are separated and the wounds covered with skin grafts." },
      { q: "Does Dr Vybhav Deraje treat hand injuries?", a: "Yes. The hand trauma service covers nail-bed, tendon, nerve and vascular injuries, amputations, mangled hand and brachial plexus injuries, with hand therapy support at the hospital." },
    ],
    conditions: ["Carpal tunnel syndrome", "Trigger finger", "Syndactyly", "Post-burn hand contracture", "Hand injury", "Brachial plexus injury"],
    procedures: ["Carpal Tunnel Release", "Trigger Finger Release", "Syndactyly Release", "Burn contracture release", "Hand trauma surgery"],
    related: ["facial-injuries-and-fracture-treatments", "body-plastic-surgeon-bangalore", "other-craniofacial-conditions-treatments"],
  },
];

export const SERVICE_PAGES: ServicePage[] = [...LEGACY_SERVICE_PAGES, ...PROCEDURE_PAGES];

export function getService(slug: string): ServicePage | undefined {
  return SERVICE_PAGES.find((p) => p.slug === slug);
}

function bySlugs(order: readonly ServiceSlug[]): ServicePage[] {
  return order.map((slug) => {
    const page = getService(slug);
    if (!page) throw new Error(`No service page for slug "${slug}"`);
    return page;
  });
}

/** The 14 procedures the practice leads with, in the doctor's order. */
export const CRANIOFACIAL_SERVICES = bySlugs(FEATURED_CRANIOFACIAL);
export const COSMETIC_SERVICES = bySlugs(FEATURED_COSMETIC);
export const FEATURED_SERVICES = [...CRANIOFACIAL_SERVICES, ...COSMETIC_SERVICES];
/** Legacy pages kept live for the patients and backlinks that still use them; listed under "Also Treated". */
export const OTHER_SERVICES = bySlugs(OTHER_SERVICES_ORDER);

/** Procedure pages that belong to a hub page. */
export function childServices(parent: ServiceSlug): ServicePage[] {
  return FEATURED_SERVICES.filter((p) => p.parent === parent);
}

export const GROUP_LABEL: Record<ServiceGroup, string> = { craniofacial: "Craniofacial Surgery", cosmetic: "Cosmetic Surgery", reconstructive: "Reconstructive surgery" };
export const GROUP_HREF: Record<ServiceGroup, string> = { craniofacial: SECTION.craniofacial, cosmetic: SECTION.cosmetic, reconstructive: SECTION.other };

export function isFeatured(page: ServicePage): boolean {
  return FEATURED_SERVICES.includes(page);
}

export const NAV: NavItem[] = [
  { href: ROUTES.about, label: "Meet the Doctor" },
  { href: SECTION.craniofacial, allHref: `${ROUTES.procedures}#craniofacial`, label: GROUP_LABEL.craniofacial, children: CRANIOFACIAL_SERVICES.map((s) => ({ href: s.path, label: s.shortTitle })) },
  { href: SECTION.cosmetic, allHref: `${ROUTES.procedures}#cosmetic`, label: GROUP_LABEL.cosmetic, children: COSMETIC_SERVICES.map((s) => ({ href: s.path, label: s.shortTitle })) },
  { href: ROUTES.locations, label: "Locations" },
  { href: ROUTES.testimonials, label: "Patient Stories" },
];

/* ------------------------------------------------------------------------------------------------
 * Testimonials and videos (as published on the practice's existing website)
 * ---------------------------------------------------------------------------------------------- */

export const TESTIMONIALS = [
  {
    name: "Praveen and Tarlika",
    topic: "Craniosynostosis",
    text: "Our first child was born on 8 July 2019 with a flat forehead on one side. After a CT scan he was diagnosed with craniosynostosis. Many doctors did not know the proper diagnosis and some suggested open skull surgery at 5 months. We found that Sakra World Hospital in Bengaluru had performed India’s first keyhole surgery on a 5-month-old baby, and the team’s confidence gave us the assurance to go ahead. After a successful surgery our son wore a 3D-printed helmet for 18 months. Today, at one year old, his forehead looks completely symmetrical. Special thanks to Dr Swaroop Gopal, Dr Rajendra S Gujjalanavar and Dr Vybhav Deraje for their moral support throughout the treatment.",
  },
  { name: "Venkatesh", topic: "Hand Surgery", text: "I met with an accident and had surgery on my fingertip. Dr Vybhav did very well — I didn’t expect my fingertip to survive. He is a very helpful person as well." },
  { name: "Anindya", topic: "Wound management", text: "I was exceedingly comfortable during the surgery and Dr Deraje is a wonderful surgeon. He also assisted me in getting a certificate promptly for my injury. My scars have healed perfectly too." },
  { name: "Anand", topic: "Facial injury", text: "Amazing doctor. Explained things thoroughly during treatment. Made the deep cut mark on my cheek fully disappear, which I never thought would happen." },
  { name: "Rainy", topic: "Family of a patient", text: "I highly recommend Dr Vybhav based on my experience as the patient’s immediate family and primary caretaker. He strikes a good balance between excellent professional skill and his approach to the patient and family. He was thoroughly patient with my queries and gave sound advice." },
  { name: "Manoj", topic: "Paediatric plastic surgery", text: "A mind-blowing plastic surgeon — very friendly and very caring. My six-year-old daughter had four stitches on her chin a month back; it was done so neatly that the mark has almost vanished in less than a month." },
  { name: "Amit", topic: "Flap surgery for diabetic foot ulcer", text: "Dr Vybhav is a competent professional and a gentleman. My experience with him handling a flap and skin graft for my foot was reassuring. He is also a great counsellor who puts one’s mind at ease. No hesitation in recommending him to anyone needing reconstructive or plastic surgery." },
  { name: "Debasish", topic: "Craniofacial trauma", text: "My daughter was seriously injured in a road accident and admitted to Sakra World Hospital under Dr Deraje, where she underwent surgery and recovered quickly. During the fifteen days I stayed there I received regular help, medical guidance and assistance from Dr Deraje whenever I needed it. I had never experienced this kind of care in the treatment of a patient." },
  { name: "Sandeep", topic: "Craniosynostosis", text: "Very comfortable to deal with. He clearly explains the condition and builds confidence, and clarifies all your questions with patience. Highly recommended." },
  { name: "Abhishek", topic: "Corrective jaw surgery", text: "Dr Deraje is very approachable, understanding and knowledgeable. He has a keen eye for aesthetics and his treatment plan has proven transformative and positive. Precise, patient and polite — well recommended." },
];

/** YouTube video IDs from the practice's video gallery. Titles are shown generically; embeds load on click. */
export const VIDEOS = ["WEoOOLJGKso", "wlmNfJnAsF0", "weHZrxjsNXQ", "-y8L5iJrYA4", "6f-w4romGgs", "hm0DH9Ma4k4", "5TqV-bJpf40", "ZLyT5Beiv1Y", "MMfW5z2tH-I", "L05As2ccV1c", "P3oxoHD6QL8"];

/* ------------------------------------------------------------------------------------------------
 * Home and resources
 * ---------------------------------------------------------------------------------------------- */

export const HOME_FAQS = [
  { q: "Who is Dr Vybhav Deraje?", a: "Dr Vybhav Deraje is a National Board certified plastic surgeon in Bangalore with a special interest in craniofacial surgery. He trained in India, at Queen Victoria Hospital in the UK and at the Australian Craniofacial Unit in Adelaide, and has practised in Bangalore since 2019. He is the founder of Aesthetica Veda and The Head Shape Clinic." },
  { q: "What does a craniofacial surgeon treat?", a: "Conditions of the skull and face: craniosynostosis, cleft lip and palate, jaw deformities (orthognathic surgery), facial fractures, head and neck tumour reconstruction, facial palsy and vascular anomalies." },
  { q: "Where does Dr Vybhav Deraje consult in Bangalore?", a: "At Aesthetica Veda clinics in Whitefield, HRBR Layout and Koramangala. Babies with head-shape concerns or craniosynostosis can also be seen through The Head Shape Clinic at Docube Clinic, Koramangala. Surgeries are performed at Aster Whitefield Hospital, Gifted Hands Hospital, Aarogya Hastha Hospital, Medicover Hospital and Apollo Spectra Hospital." },
  { q: "Do you see patients from outside India, and are video consultations available?", a: "Yes. Dr Deraje treats patients who travel to Bangalore from abroad and offers video consultations for an initial opinion or for follow-up after surgery. Use the enquiry form, choose “Video consultation”, and select the country of your phone number; the clinic will reply by email or phone to arrange a time. Surgery itself always requires an in-person assessment in Bangalore." },
  { q: "How do I book an appointment with Dr Vybhav Deraje?", a: "Call +91 95355 81616, email connect@drvybhavderaje.com or use the enquiry form on this website. The clinic confirms the location, date and time." },
  { q: "I’m travelling from another city. Where should I start?", a: "Contact the clinic before making travel arrangements, send relevant reports ahead and confirm your appointment and clinic location." },
  { q: "What should I bring to my first appointment?", a: "Relevant reports, scans, referral letters, previous treatment records and a list of current medications. Writing down your questions helps you make the most of the visit." },
];

export const RESOURCES = [
  { title: "Before Your Visit", text: "Confirm the date, time and location. Make a short list of your main concerns and the questions you want to ask." },
  { title: "What to Bring", text: "Relevant reports, scans, referral letters, previous treatment records and a medication list. Check with the clinic if you are unsure which documents are needed." },
  { title: "Travelling to Bangalore?", text: "Speak with the clinic before booking travel. Confirm your appointment and ask whether you should plan for any additional consultations." },
  { title: "Questions Worth Asking", text: "What are my options? What are the limitations and risks? What does recovery involve? What follow-up will I need? What is included in the estimated cost?" },
];

export const CONTENT_UPDATED = SITE.contentUpdated;
