/**
 * BULLRUSH DAILY — core product record.
 *
 * Facts not yet supplied (price, subscription savings, dosage, capsule
 * count basis, manufacturing origin, certifications) are left `null` /
 * empty rather than invented. The UI is built to render correctly in
 * both states — fill these in once the real figures are confirmed.
 */

export interface PriceInfo {
  amount: number;
  currency: string;
}

export interface ProductVariant {
  id: string;
  label: string;
  /** e.g. "one-time" | "subscription" */
  purchaseType: "one-time" | "subscription";
  /** Percentage saving vs one-time, only shown if subscriptions are actually configured. */
  savingPercent?: number;
}

export const product = {
  name: "BULLRUSH DAILY",
  descriptor: "DAILY · PERFORMANCE",
  packSize: "120 CAPSULES",
  tagline: "One tool inside the system.",
  /** Set once pricing is finalized. Left null so nothing fabricated reaches the customer. */
  price: null as PriceInfo | null,
  variants: [
    { id: "one-time", label: "One-time purchase", purchaseType: "one-time" },
    // Subscription variant is withheld until subscription economics are configured.
    // { id: "subscribe", label: "Subscribe & save", purchaseType: "subscription", savingPercent: 15 },
  ] as ProductVariant[],
  shippingNote: "Shipping details confirmed at checkout.",
  materials: [
    {
      key: "body",
      label: "MATTE SOFT-TOUCH BODY",
      copy: "A cylinder finished to reject light, built to sit in the open.",
    },
    {
      key: "cap",
      label: "KNURLED CAP",
      copy: "Machined grip. Closes with resistance, not a click.",
    },
    {
      key: "mark",
      label: "EMBOSSED MARK",
      copy: "The horn, set into the surface rather than printed on it.",
    },
    {
      key: "signal",
      label: "ONE SIGNAL",
      copy: "A single oxblood line. Nothing else asks for attention.",
    },
  ],
} as const;
