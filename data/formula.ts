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
  name: string;
  dose: string;
  function: string;
  description: string;
  /** Which marble surface this ingredient's imagery sits on in the showcase grid. */
  surface: "ink" | "bone" | "graphite";
  finish: "rough" | "cut" | "polished";
  evidenceUrl?: string;
}

export const ingredients: Ingredient[] = [];
