/**
 * Evidence / clinical-reference index — supports the "Proof Over Promise"
 * section. Left empty until verified sources are supplied; never fill
 * with generic "clinically proven" language without direct substantiation.
 */

export interface EvidenceReference {
  ingredient: string;
  claim: string;
  source: string;
  url: string;
}

export const clinicalReferences: EvidenceReference[] = [];
