/**
 * Week-by-week routine narrative — behavioral framing, not a clinical or
 * physiological claim. Paired with a conceptual adherence chart in
 * WeekProgression; see the disclaimer rendered alongside it.
 */
export interface WeekStage {
  range: string;
  kicker: string;
  body: string;
  chartWeek: number;
}

export const weekStages: WeekStage[] = [
  {
    range: "WEEK 1–2",
    kicker: "ESTABLISH THE ROUTINE",
    body: "The focus is simple: build repeatability.",
    chartWeek: 1,
  },
  {
    range: "WEEK 3–4",
    kicker: "REMOVE FRICTION",
    body: "The supplement becomes part of the normal daily system.",
    chartWeek: 3,
  },
  {
    range: "WEEK 5–8",
    kicker: "BUILD CONSISTENCY",
    body: "Training, recovery and daily habits become easier to track together.",
    chartWeek: 6,
  },
  {
    range: "WEEK 9–12",
    kicker: "MAINTAIN THE STANDARD",
    body: "The system matters more than motivation.",
    chartWeek: 10,
  },
  {
    range: "WEEK 13+",
    kicker: "KEEP THE STANDARD",
    body: "Consistency becomes the default.",
    chartWeek: 13,
  },
];

/**
 * Conceptual routine-adherence curve — illustrative only, not measured
 * data or a physiological outcome. Rendered with an explicit disclaimer.
 */
export interface RoutineChartPoint {
  week: number;
  value: number;
}

export const routineChartPoints: RoutineChartPoint[] = [
  { week: 1, value: 18 },
  { week: 3, value: 36 },
  { week: 5, value: 52 },
  { week: 7, value: 66 },
  { week: 9, value: 77 },
  { week: 11, value: 86 },
  { week: 13, value: 93 },
];
