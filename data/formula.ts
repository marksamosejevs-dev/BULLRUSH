/**
 * BULLRUSH DAILY — active formula.
 *
 * Confirmed by the brand as the marketed formula, ingredient by
 * ingredient with exact per-serving doses. Descriptions here are
 * deliberately restrained — what an ingredient is and its dose, not an
 * outcome claim. Do not add mechanism-of-action or clinical-outcome
 * language without a verified source.
 */

export interface Ingredient {
  name: string;
  dose: string;
  function: string;
  description: string;
  /** Which marble surface this ingredient's imagery sits on in the showcase grid. */
  surface: "ink" | "bone" | "graphite";
  finish: "rough" | "cut" | "polished";
  evidenceUrl?: string;
}

export const ingredients: Ingredient[] = [
  {
    name: "Tongkat Ali Root Extract",
    dose: "1,000 mg",
    function: "Male vitality",
    description: "A full-gram dose of traditional root extract, the largest single component of the formula.",
    surface: "graphite",
    finish: "rough",
  },
  {
    name: "Shilajit Mineral Extract",
    dose: "400 mg",
    function: "Mineral complex",
    description: "A mineral-rich resin extract, included at a measured 400 mg dose.",
    surface: "ink",
    finish: "cut",
  },
  {
    name: "L-Taurine",
    dose: "675 mg",
    function: "Amino acid",
    description: "A conditionally essential amino acid, included at a 675 mg dose.",
    surface: "bone",
    finish: "rough",
  },
  {
    name: "Fenugreek Seed Extract",
    dose: "675 mg",
    function: "Seed extract",
    description: "Seed extract, included at a 675 mg dose.",
    surface: "graphite",
    finish: "polished",
  },
  {
    name: "Zinc (as Zinc Citrate)",
    dose: "30 mg",
    function: "Essential mineral · 273% DV",
    description: "An essential trace mineral, included at 30 mg — 273% of the established Daily Value.",
    surface: "ink",
    finish: "polished",
  },
  {
    name: "Vitamin D3 (as Cholecalciferol)",
    dose: "100 mcg (4,000 IU)",
    function: "Vitamin D · 500% DV",
    description: "Cholecalciferol, dosed at 4,000 IU (100 mcg) per serving — 500% of the established Daily Value.",
    surface: "bone",
    finish: "cut",
  },
  {
    name: "Vitamin K1 (as Phytonadione)",
    dose: "100 mcg",
    function: "Vitamin K · 83% DV",
    description: "Phytonadione, one of two forms of vitamin K included in the formula — 83% of the established Daily Value.",
    surface: "graphite",
    finish: "cut",
  },
  {
    name: "Vitamin K2 (as MK-7)",
    dose: "100 mcg",
    function: "Vitamin K, menaquinone-7 form",
    description: "Menaquinone-7, included alongside K1 for full-spectrum vitamin K coverage.",
    surface: "ink",
    finish: "rough",
  },
  {
    name: "Boron (as Boron Citrate)",
    dose: "4 mg",
    function: "Trace mineral",
    description: "A trace mineral included at a measured 4 mg dose.",
    surface: "bone",
    finish: "polished",
  },
];
