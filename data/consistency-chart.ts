/**
 * Illustrative only — a conceptual habit-formation curve, not measured
 * data or a clinical outcome. Rendered with an explicit disclaimer in
 * the chart itself; do not repurpose these figures as a claim.
 */
export interface ChartPoint {
  day: number;
  value: number;
  tag: string;
}

export const consistencyPoints: ChartPoint[] = [
  { day: 1, value: 14, tag: "BASELINE" },
  { day: 7, value: 34, tag: "FORMING" },
  { day: 30, value: 68, tag: "HOLDING" },
  { day: 90, value: 93, tag: "DEFAULT" },
];
