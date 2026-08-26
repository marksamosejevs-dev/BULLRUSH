/**
 * Formula / ingredient index.
 *
 * Intentionally empty — BULLRUSH DAILY's formulation has not been supplied
 * to this build. Do not populate this file with invented ingredients,
 * doses, or mechanisms. Once real formulation data exists, add entries
 * matching the `Ingredient` shape and the Formula section will render
 * automatically in place of its holding state.
 */

export interface Ingredient {
  index: string; // "01"
  name: string;
  dose: string;
  function: string;
  description: string;
  evidenceUrl?: string;
}

export const ingredients: Ingredient[] = [];
