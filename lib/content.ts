/**
 * Public site copy. Preserved from the supplied design package; items marked
 * `approvalRequired` in docs/CONTENT_APPROVAL.md need practice sign-off.
 */
export const SITE = {
  name: "Dr Vybhav Deraje",
  tagline: "Craniofacial & Plastic Surgeon",
  city: "Bengaluru, India",
  phone: "+91 95355 81616",
  phoneTel: "+919535581616",
  email: "connect@drvybhavderaje.com",
  utilityLine: "Thoughtful care. Informed choices.",
  defaultDescription:
    "Explore craniofacial and plastic surgery consultations with Dr Vybhav Deraje in Bengaluru. Find care information, clinic locations and consultation options.",
};

export const NAV = [
  { href: "/about", label: "Meet the doctor" },
  { href: "/#care", label: "Our expertise" },
  { href: "/patient-resources", label: "Patient resources" },
  { href: "/locations", label: "Locations" },
] as const;

export const CARE_PATHS = [
  { href: "/craniosynostosis", icon: "baby", title: "Craniosynostosis", text: "A clear starting point for parents concerned about their child’s head shape." },
  { href: "/cosmetic-surgery", icon: "sparkles", title: "Cosmetic surgery", text: "Thoughtful conversations about your goals, options and what to expect." },
  { href: "/cleft-care", icon: "heart-handshake", title: "Cleft & craniofacial care", text: "Specialist consultations for cleft lip, palate and other craniofacial concerns." },
  { href: "/reconstructive-surgery", icon: "hand", title: "Reconstructive surgery", text: "Explore care for facial injuries, hand concerns and reconstructive needs." },
] as const;

export const HOME_FAQS = [
  { q: "How do I arrange a consultation?", a: "Call the clinic or use the consultation request form. A request is not a confirmed appointment; the clinic will confirm the location, date and time." },
  { q: "Where does Dr Vybhav consult?", a: "The current practice website lists Aesthetica Veda clinics in Whitefield, HRBR Layout and Koramangala, Bengaluru. Please confirm the location and availability when booking." },
  { q: "I’m travelling from another city. Where should I start?", a: "Contact the clinic before making travel arrangements. Ask which records to bring and confirm your appointment and clinic location." },
  { q: "What should I bring to my first appointment?", a: "Bring relevant reports, referral letters, previous treatment records and a list of current medications. Writing down your questions can help you make the most of the visit." },
];

export interface ServicePage {
  slug: string;
  title: string;
  metaTitle: string;
  description: string;
  eyebrow: string;
  lead: string;
  intro: string;
  topics: string[];
  faqs: { q: string; a: string }[];
}

export const SERVICE_PAGES: ServicePage[] = [
  {
    slug: "craniosynostosis",
    title: "Craniosynostosis",
    metaTitle: "Craniosynostosis consultations in Bengaluru",
    description: "A clear starting point for parents concerned about their child’s head shape. Craniosynostosis consultations with craniofacial surgeon Dr Vybhav Deraje in Bengaluru.",
    eyebrow: "For children & families",
    lead: "A clear starting point for parents concerned about their child’s head shape.",
    intro: "Understanding your child’s diagnosis can feel overwhelming. A consultation is a chance to ask questions, review existing reports and discuss the next steps with a craniofacial specialist. Families travel to Bengaluru from across India for this care; the clinic can help you plan your visit before you book travel.",
    topics: ["Understanding the diagnosis", "Discussing assessment and treatment options", "Planning care with the specialist team"],
    faqs: [
      { q: "What is craniosynostosis?", a: "Craniosynostosis occurs when one or more of the joints between the bones of a baby’s skull close earlier than expected. A specialist assessment is needed to understand the condition." },
      { q: "What determines the treatment plan?", a: "The affected sutures, the child’s age and the clinical assessment all influence the plan. The specialist team will explain suitable options and follow-up." },
      { q: "What should we bring?", a: "Bring any referral letter, previous consultations and existing scan reports. You do not need to arrange new scans simply to enquire." },
      { q: "We live outside Bengaluru. How should we plan?", a: "Contact the clinic first. Ask which records to send ahead, confirm the clinic location and appointment time, and only then arrange travel." },
    ],
  },
  {
    slug: "cosmetic-surgery",
    title: "Cosmetic surgery",
    metaTitle: "Cosmetic surgery consultations in Bengaluru",
    description: "Thoughtful conversations about your goals, options and what to expect. Cosmetic surgery consultations with plastic surgeon Dr Vybhav Deraje in Bengaluru.",
    eyebrow: "Personal goals. Informed choices.",
    lead: "Thoughtful conversations about your goals, options and what to expect.",
    intro: "An informed decision begins with an honest conversation. Discuss the change you are considering, ask about alternatives and understand the limitations, recovery and risks before deciding.",
    topics: ["Face and facial aesthetics", "Breast surgery consultations", "Body contouring consultations"],
    faqs: [
      { q: "How do I choose a procedure?", a: "Start with your concerns and goals rather than choosing a procedure yourself. Your consultation is an opportunity to discuss suitability, alternatives and realistic expectations." },
      { q: "Can I get a cost estimate?", a: "Ask the clinic for an individual estimate after assessment. Confirm what it includes, such as hospital charges, anaesthesia, follow-up and other costs." },
      { q: "Is a consultation a commitment to surgery?", a: "No. Use it to understand your options and take the time you need to make an informed decision." },
    ],
  },
  {
    slug: "cleft-care",
    title: "Cleft & craniofacial care",
    metaTitle: "Cleft lip, palate & craniofacial care in Bengaluru",
    description: "Specialist consultations for cleft lip, palate and other craniofacial concerns with Dr Vybhav Deraje in Bengaluru.",
    eyebrow: "Care through every stage",
    lead: "Specialist consultations for cleft lip, palate and other craniofacial concerns.",
    intro: "Families often have many questions about cleft and craniofacial care. Begin with a specialist consultation to discuss your child’s needs, previous treatment and the professionals who may be involved.",
    topics: ["Cleft lip and palate", "Corrective jaw surgery", "Other craniofacial conditions"],
    faqs: [
      { q: "Can we discuss previous treatment?", a: "Yes. Bring previous operation notes and reports, if available, so that the consultation can take your care history into account." },
      { q: "How is care coordinated?", a: "Ask the doctor which specialists may be involved and how appointments, treatment and follow-up will be planned for your individual needs." },
    ],
  },
  {
    slug: "reconstructive-surgery",
    title: "Reconstructive surgery",
    metaTitle: "Reconstructive surgery consultations in Bengaluru",
    description: "Explore care for facial injuries, hand concerns and reconstructive needs with plastic surgeon Dr Vybhav Deraje in Bengaluru.",
    eyebrow: "Function, comfort & confidence",
    lead: "Explore care for facial injuries, hand concerns and reconstructive needs.",
    intro: "Reconstructive consultations focus on understanding your concern and discussing the available options. Your medical history, previous treatment and priorities help shape that conversation.",
    topics: ["Facial injuries and fractures", "Hand surgery", "Reconstruction after cancer treatment"],
    faqs: [
      { q: "What records will be useful?", a: "Bring relevant medical reports, operation notes and a current medication list. The clinic can guide you on anything else needed." },
      { q: "Can this website help with an emergency?", a: "This website and its appointment requests are not an emergency service. Seek urgent in-person medical care for an emergency." },
    ],
  },
];

export const CREDENTIALS = [
  { title: "MBBS", detail: "Kempegowda Institute of Medical Sciences, Bengaluru" },
  { title: "MS — General Surgery", detail: "Mysore Medical College & Research Institute" },
  { title: "DNB — Plastic Surgery", detail: "Training at Lok Nayak Hospital & Maulana Azad Medical College, Delhi" },
  { title: "Further training in the United Kingdom", detail: "Queen Victoria Hospital, East Grinstead" },
  { title: "Fellowship — Craniofacial Surgery", detail: "Australian Craniofacial Unit, Adelaide" },
];

/** Clinic details as published on the existing practice website; also seeded into the database. */
export const CLINICS_SEED = [
  {
    slug: "whitefield",
    name: "Whitefield",
    brand: "Aesthetica Veda",
    addressLines: "222/220/A, 2nd Floor, above BMW Deutsche Motoren, opposite Sheraton Grand, Whitefield Main Road, Bengaluru 560048",
    postcode: "560048",
    phone: "+916366789520",
    sortOrder: 1,
  },
  {
    slug: "hrbr-layout",
    name: "HRBR Layout",
    brand: "Aesthetica Veda",
    addressLines: "4M 403, 2nd Floor, TRINE House, Kammanahalli Main Road, HRBR Layout 3rd Block, Bengaluru 560043",
    postcode: "560043",
    phone: "+916366789521",
    sortOrder: 2,
  },
  {
    slug: "koramangala",
    name: "Koramangala",
    brand: "Aesthetica Veda",
    addressLines: "Docube Clinic, Suite 6 & 7, Sulochana Building, 365, 1st Floor, 1st Cross Road, 3rd Block, Bengaluru 560034",
    postcode: "560034",
    phone: "+916366789522",
    sortOrder: 3,
  },
];

export function mapsUrl(brand: string, address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${brand} ${address}`)}`;
}

export const RESOURCES = [
  { title: "Before your visit", text: "Confirm the date, time and location. Make a short list of your main concerns and the questions you want to ask." },
  { title: "What to bring", text: "Bring relevant reports, referral letters, previous treatment records and a medication list. Check with the clinic if you are unsure which documents are needed." },
  { title: "Travelling to Bengaluru?", text: "Speak with the clinic before booking travel. Confirm your appointment and ask whether you should plan for any additional consultations." },
  { title: "Questions worth asking", text: "What are my options? What are the limitations and risks? What does recovery involve? What follow-up will I need? What is included in the estimated cost?" },
];
