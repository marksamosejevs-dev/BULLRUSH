export interface StoryPanel {
  key: string;
  word: string;
  phrase: string;
  tone: "bone" | "ink" | "graphite";
  finish: "rough" | "cut" | "polished";
}

export const storyPanels: StoryPanel[] = [
  { key: "raw", word: "RAW", phrase: "Where discipline starts.", tone: "graphite", finish: "rough" },
  { key: "discipline", word: "DISCIPLINE", phrase: "Consistency, not intensity.", tone: "graphite", finish: "cut" },
  { key: "control", word: "CONTROL", phrase: "The standard, held daily.", tone: "ink", finish: "cut" },
  { key: "daily", word: "DAILY", phrase: "BULLRUSH DAILY.", tone: "ink", finish: "polished" },
];
