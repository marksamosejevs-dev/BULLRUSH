export interface TimelineStage {
  day: string;
  kicker: string;
  body: string;
  finish: "rough" | "cut" | "polished";
}

/** Day 7 → Day 30 → Day 90: rough stone → cut stone → polished marble. */
export const timelineStages: TimelineStage[] = [
  {
    day: "DAY 7",
    kicker: "ESTABLISH",
    body: "Make DAILY part of the routine. Remove friction. Build repetition.",
    finish: "rough",
  },
  {
    day: "DAY 30",
    kicker: "BUILD",
    body: "The routine becomes increasingly automatic. Consistency becomes measurable. The system begins to feel normal.",
    finish: "cut",
  },
  {
    day: "DAY 90",
    kicker: "THE STANDARD",
    body: "The routine is established. Training, nutrition and recovery operate as one system. Discipline replaces daily decision-making.",
    finish: "polished",
  },
];
