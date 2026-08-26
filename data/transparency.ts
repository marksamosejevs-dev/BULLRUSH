/**
 * Transparency grid — only real, verifiable facts belong here (sourcing,
 * manufacturing, testing, batch information, certifications). Populated
 * with the confirmed production claims from data/trust.ts; extend once
 * further documentation (batch records, sourcing detail) is available.
 */

import { trustClaims } from "./trust";

export interface TransparencyItem {
  label: string;
  detail: string;
}

export const transparencyItems: TransparencyItem[] = trustClaims.map((c) => ({
  label: c.label,
  detail: c.detail,
}));
