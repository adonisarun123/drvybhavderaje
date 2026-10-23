/**
 * The legacy patient-information PDFs were removed from the site on 23 Oct 2026. Every one now has an HTML page
 * with the same content, so each old PDF URL permanently redirects (308) to that page — existing backlinks and
 * search results keep their equity. Wired in next.config.ts. Keep in step with the `sheet` / `infoSheet` source
 * fields in lib/cranio-types.ts, lib/procedures.ts, lib/sub-procedures.ts and lib/content.ts.
 */
export const LEGACY_PDF_REDIRECTS: Readonly<Record<string, string>> = {
  "/images/pdf/Corrective-Jaw-Surgery/Patient-information-sheet-Jaw-surgery.pdf": "/corrective-jaw-surgery-bangalore",
  "/images/pdf/Craniosynthosis/Patient-information-sheet-Bicoronal-craniosynostosis.pdf": "/craniosynostosis-surgery-bangalore/bicoronal-synostosis",
  "/images/pdf/Craniosynthosis/Patient-information-sheet-Lambdoid-craniosynostosis.pdf": "/craniosynostosis-surgery-bangalore/lambdoid-synostosis",
  "/images/pdf/Craniosynthosis/Patient-information-sheet-Metopic-craniosynostosis.pdf": "/craniosynostosis-surgery-bangalore/metopic-synostosis",
  "/images/pdf/Craniosynthosis/Patient-information-sheet-Multi-suture-craniosynostosis.pdf": "/craniosynostosis-surgery-bangalore/multisuture-syndromic-craniosynostosis",
  "/images/pdf/Craniosynthosis/Patient-information-sheet-Sagittal-craniosynostosis.pdf": "/craniosynostosis-surgery-bangalore/sagittal-synostosis",
  "/images/pdf/Craniosynthosis/Patient-information-sheet-Unicoronal-craniosynostosis.pdf": "/craniosynostosis-surgery-bangalore/unicoronal-synostosis",
  "/images/pdf/Facial-Injuries-and-fracture/Patient-information-sheet-Facial-injuries-and-fractures.pdf": "/facial-injuries-and-fracture-treatments",
  "/images/pdf/Head-and-Neck-Cancer/Patient-information-sheet-Head-and-Neck-Cancer.pdf": "/head-and-neck-cancer-treatment",
  "/images/pdf/Plastic-Surgery-of-Body/Patient-information-sheet-Abdominoplasty.pdf": "/tummy-tuck-abdominoplasty-bangalore",
  "/images/pdf/Plastic-Surgery-of-Body/Patient-information-sheet-Brachiaplasty.pdf": "/body-plastic-surgeon-bangalore/arm-lift-brachioplasty",
  "/images/pdf/Plastic-Surgery-of-Body/Patient-information-sheet-Liposuction.pdf": "/liposuction-surgery-bangalore",
  "/images/pdf/Plastic-Surgery-of-Body/Patient-information-sheet-Thighplasty.pdf": "/body-plastic-surgeon-bangalore/thigh-lift-thighplasty",
  "/images/pdf/Plastic-Surgery-of-Face/Patient-information-sheet-Blepharoplasty.pdf": "/blepharoplasty-eyelid-surgery-bangalore",
  "/images/pdf/Plastic-Surgery-of-Face/Patient-information-sheet-Chin-Augmentation.pdf": "/chin-augmentation-surgery-bangalore",
  "/images/pdf/Plastic-Surgery-of-Face/Patient-information-sheet-Endoscopic-scarless-forehead-surgery.pdf": "/face-plastic-surgery-bangalore/endoscopic-scarless-forehead-surgery",
  "/images/pdf/Plastic-Surgery-of-Face/Patient-information-sheet-Facelift-and-Necklift.pdf": "/facelift-surgery-bangalore",
  "/images/pdf/Plastic-Surgery-of-Face/Patient-information-sheet-Fat-grafting.pdf": "/face-plastic-surgery-bangalore/fat-grafting",
  "/images/pdf/Plastic-Surgery-of-Face/Patient-information-sheet-Otoplasty.pdf": "/otoplasty-ear-correction-bangalore",
  "/images/pdf/Plastic-Surgery-of-Face/Patient-information-sheet-Rhinoplasty.pdf": "/rhinoplasty-surgery-bangalore",
  "/images/pdf/Plastic-Surgery-of-Hand/Patient-information-sheet-Carpal-tunnel-release.pdf": "/hand-plastic-surgeon-bangalore/carpal-tunnel-release",
  "/images/pdf/Plastic-Surgery-of-Hand/Patient-information-sheet-Syndactyly-release.pdf": "/hand-plastic-surgeon-bangalore/syndactyly-release",
  "/images/pdf/Plastic-Surgery-of-Hand/Patient-information-sheet-Trigger-finger-release.pdf": "/hand-plastic-surgeon-bangalore/trigger-finger-release",
  "/images/pdf/Plastic-surgery-of-Breast/Patient-information-sheet-Breast-augmentation.pdf": "/breast-augmentation-surgery-bangalore",
  "/images/pdf/Plastic-surgery-of-Breast/Patient-information-sheet-Breast-cancer-reconstruction.pdf": "/breast-plastic-surgeon-bangalore/breast-reconstruction-after-cancer",
  "/images/pdf/Plastic-surgery-of-Breast/Patient-information-sheet-Breast-lift.pdf": "/breast-plastic-surgeon-bangalore/breast-lift-mastopexy",
  "/images/pdf/Plastic-surgery-of-Breast/Patient-information-sheet-Breast-reduction.pdf": "/breast-reduction-surgery-bangalore",
  "/images/pdf/Plastic-surgery-of-Breast/Patient-information-sheet-Gynaecomastia-correction.pdf": "/gynecomastia-surgery-bangalore",
  "/images/pdf/cleft/Patient-information-sheet-Alveolar-bone-grafting.pdf": "/cleft-lip-and-palate-treatment-bangalore/alveolar-bone-grafting",
  "/images/pdf/cleft/Patient-information-sheet-Cleft-Rhinoplasty.pdf": "/cleft-lip-and-palate-treatment-bangalore/cleft-rhinoplasty",
  "/images/pdf/cleft/Patient-information-sheet-Cleft-lip.pdf": "/cleft-lip-and-palate-treatment-bangalore/cleft-lip-repair",
  "/images/pdf/cleft/Patient-information-sheet-Cleft-palate.pdf": "/cleft-lip-and-palate-treatment-bangalore/cleft-palate-repair",
  "/images/pdf/cleft/Patient-information-sheet-Corrective-Jaw-surgery.pdf": "/cleft-lip-and-palate-treatment-bangalore/cleft-jaw-surgery",
  "/images/pdf/cleft/Patient-information-sheet-Speech-surgery.pdf": "/cleft-lip-and-palate-treatment-bangalore/speech-surgery",
};
