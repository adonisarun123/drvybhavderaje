/**
 * Holdout test for relationship structured data (`relatedLink`) — docs/INTERNAL-LINKING.md, "Measurement".
 *
 * Both groups keep identical visible links. Pages in the HOLDOUT group simply do not declare
 * `relatedLink` in their structured data; pages in the TEST group do. Comparing each group's change
 * in Search Console clicks and impressions from its own baseline shows whether the markup itself
 * moves anything.
 *
 * Assignment (12 Nov 2026): the 44 pages that declare `relatedLink` from their own content (home and
 * the procedures index are excluded as one-of-a-kind pages) were split within each page type. Within
 * a type, pages were ordered by sha256("{id}:{path}") and alternated test / holdout, so nobody
 * chose which page went where. The lists are frozen: pages added later are in neither group, keep
 * the markup, and are left out of the analysis.
 *
 * To end the test and restore the markup everywhere: set RELATIONSHIP_SCHEMA_HOLDOUT="false", or empty HOLDOUT.
 */
export const SCHEMA_EXPERIMENT = { id: "relatedlink-holdout-2026-11", assigned: "2026-11-12" } as const;

const TEST: readonly string[] = [
  // Featured craniofacial
  "/corrective-jaw-surgery-bangalore",
  "/cleft-lip-and-palate-treatment-bangalore",
  // Featured cosmetic
  "/liposuction-surgery-bangalore",
  "/facelift-surgery-bangalore",
  "/breast-reduction-surgery-bangalore",
  "/rhinoplasty-surgery-bangalore",
  "/breast-augmentation-surgery-bangalore",
  // Other services
  "/head-and-neck-cancer-treatment",
  "/breast-plastic-surgeon-bangalore",
  "/facial-injuries-and-fracture-treatments",
  "/hand-plastic-surgeon-bangalore",
  "/body-plastic-surgeon-bangalore",
  // Sub-procedure pages
  "/cleft-lip-and-palate-treatment-bangalore/cleft-lip-repair",
  "/breast-plastic-surgeon-bangalore/breast-reconstruction-after-cancer",
  "/face-plastic-surgery-bangalore/fat-grafting",
  "/cleft-lip-and-palate-treatment-bangalore/alveolar-bone-grafting",
  "/cleft-lip-and-palate-treatment-bangalore/cleft-palate-repair",
  "/breast-plastic-surgeon-bangalore/breast-lift-mastopexy",
  "/face-plastic-surgery-bangalore/endoscopic-scarless-forehead-surgery",
  "/cleft-lip-and-palate-treatment-bangalore/cleft-rhinoplasty",
  // Craniosynostosis type pages
  "/craniosynostosis-surgery-bangalore/bicoronal-synostosis",
  "/craniosynostosis-surgery-bangalore/unicoronal-synostosis",
  "/craniosynostosis-surgery-bangalore/lambdoid-synostosis",
];

const HOLDOUT: readonly string[] = [
  // Featured craniofacial
  "/ear-reconstruction-surgery-bangalore",
  "/craniosynostosis-surgery-bangalore",
  // Featured cosmetic
  "/otoplasty-ear-correction-bangalore",
  "/blepharoplasty-eyelid-surgery-bangalore",
  "/chin-augmentation-surgery-bangalore",
  "/gynecomastia-surgery-bangalore",
  "/tummy-tuck-abdominoplasty-bangalore",
  // Other services
  "/earwell-infant-ear-correction-bangalore",
  "/other-craniofacial-conditions-treatments",
  "/face-plastic-surgery-bangalore",
  "/helmet-therapy-flat-head-bangalore",
  // Sub-procedure pages
  "/body-plastic-surgeon-bangalore/arm-lift-brachioplasty",
  "/body-plastic-surgeon-bangalore/thigh-lift-thighplasty",
  "/hand-plastic-surgeon-bangalore/carpal-tunnel-release",
  "/hand-plastic-surgeon-bangalore/syndactyly-release",
  "/hand-plastic-surgeon-bangalore/trigger-finger-release",
  "/cleft-lip-and-palate-treatment-bangalore/speech-surgery",
  "/cleft-lip-and-palate-treatment-bangalore/cleft-jaw-surgery",
  // Craniosynostosis type pages
  "/craniosynostosis-surgery-bangalore/metopic-synostosis",
  "/craniosynostosis-surgery-bangalore/multisuture-syndromic-craniosynostosis",
  "/craniosynostosis-surgery-bangalore/sagittal-synostosis",
];

export const SCHEMA_TEST_PATHS: ReadonlySet<string> = new Set(TEST);
export const SCHEMA_HOLDOUT_PATHS: ReadonlySet<string> = new Set(HOLDOUT);

export type SchemaTestGroup = "test" | "holdout" | "not in test";

export function schemaTestGroup(path: string): SchemaTestGroup {
  return SCHEMA_HOLDOUT_PATHS.has(path) ? "holdout" : SCHEMA_TEST_PATHS.has(path) ? "test" : "not in test";
}

/** True while the holdout is running and this page is in it (its relationship markup is withheld). */
export function inSchemaHoldout(path: string): boolean {
  return process.env.RELATIONSHIP_SCHEMA_HOLDOUT !== "false" && SCHEMA_HOLDOUT_PATHS.has(path);
}
