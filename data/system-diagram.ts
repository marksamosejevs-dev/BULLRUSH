export interface SystemNode {
  key: string;
  label: string;
  copy: string;
}

/** Positions as {left%, top%} around the hub, clockwise from 12 o'clock. */
export const systemNodePositions = [
  { left: 50, top: 8 },
  { left: 85, top: 29 },
  { left: 85, top: 71 },
  { left: 50, top: 92 },
  { left: 15, top: 71 },
  { left: 15, top: 29 },
];

export const systemNodes: SystemNode[] = [
  { key: "sleep", label: "SLEEP", copy: "The routine starts the night before. Recovery is scheduled, not left over." },
  { key: "train", label: "TRAIN", copy: "Consistent load, tracked and repeated — not chased in bursts." },
  { key: "nutrition", label: "NUTRITION", copy: "Food as infrastructure. Simple, repeatable, unremarkable by design." },
  { key: "recover", label: "RECOVER", copy: "Built into the week, not bolted on after it breaks down." },
  { key: "focus", label: "FOCUS", copy: "One standard, held daily, instead of motivation renegotiated each morning." },
  { key: "repeat", label: "REPEAT", copy: "The system only works if it runs again tomorrow, unchanged." },
];
