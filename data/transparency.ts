/**
 * Transparency grid — only real, verifiable facts belong here
 * (sourcing, manufacturing, testing, batch information, certifications).
 * Empty by default; add entries once the underlying documentation exists.
 */

export interface TransparencyItem {
  label: string;
  detail: string;
}

export const transparencyItems: TransparencyItem[] = [];
