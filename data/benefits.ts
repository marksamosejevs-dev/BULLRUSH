export interface Benefit {
  key: string;
  name: string;
  copy: string;
}

export const benefits: Benefit[] = [
  { key: "energy", name: "SUPPORT DAILY ENERGY", copy: "Built for the whole day, not a pre-workout spike." },
  { key: "vitality", name: "SUPPORT MALE VITALITY", copy: "Foundational support for the system, taken daily." },
  { key: "focus", name: "STAY SHARP", copy: "One less variable competing for your attention." },
  { key: "strength", name: "SUPPORT STRENGTH", copy: "Formulated to sit underneath training, not replace it." },
  { key: "recovery", name: "SUPPORT RECOVERY", copy: "Support between sessions, not only during them." },
];
