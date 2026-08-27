/**
 * Supplement Facts panel data — confirmed by the brand: serving size,
 * servings per container, and the exact per-ingredient amount and
 * %Daily Value for the marketed BULLRUSH DAILY formula. Where no FDA
 * Daily Value is established for an ingredient, `dailyValue` is left
 * `null` and the panel renders the standard "†" convention rather than
 * a fabricated percentage.
 */

export interface SupplementFactsRow {
  name: string;
  amountPerServing: string;
  dailyValue: string | null; // null renders "†" (no established DV), matching real label convention
}

export interface SupplementFactsData {
  servingSize: string;
  servingsPerContainer: string;
  rows: SupplementFactsRow[];
  footnotes: string[];
}

export const supplementFacts: SupplementFactsData | null = {
  servingSize: "5 Capsules",
  servingsPerContainer: "30",
  rows: [
    { name: "Vitamin D3 (as Cholecalciferol)", amountPerServing: "100 mcg (4,000 IU)", dailyValue: "500%" },
    { name: "Vitamin K1 (as Phytonadione)", amountPerServing: "100 mcg", dailyValue: "83%" },
    { name: "Vitamin K2 (as MK-7)", amountPerServing: "100 mcg", dailyValue: null },
    { name: "Zinc (as Zinc Citrate)", amountPerServing: "30 mg", dailyValue: "273%" },
    { name: "Tongkat Ali Root Extract", amountPerServing: "1,000 mg", dailyValue: null },
    { name: "Fenugreek Seed Extract", amountPerServing: "675 mg", dailyValue: null },
    { name: "L-Taurine", amountPerServing: "675 mg", dailyValue: null },
    { name: "Shilajit Mineral Extract", amountPerServing: "400 mg", dailyValue: null },
    { name: "Boron (as Boron Citrate)", amountPerServing: "4 mg", dailyValue: null },
  ],
  footnotes: [
    "† Daily Value not established.",
    "Percent Daily Values are based on a 2,000 calorie diet.",
  ],
};
