/**
 * The BULLRUSH product architecture. Only DAILY is currently purchasable —
 * everything else is disclosed as brand architecture, not a live SKU.
 * No launch dates are implied.
 */

export interface SystemCategory {
  key: string;
  name: string;
  description: string;
  status: "available" | "in-development";
}

export const systemCategories: SystemCategory[] = [
  {
    key: "daily",
    name: "DAILY",
    description: "Foundation · vitality · mineral stack",
    status: "available",
  },
  {
    key: "drive",
    name: "DRIVE",
    description: "Libido · confidence · hormonal support",
    status: "in-development",
  },
  {
    key: "recover",
    name: "RECOVER",
    description: "Sleep · stress · resilience",
    status: "in-development",
  },
  {
    key: "hydrate",
    name: "HYDRATE",
    description: "Electrolytes · endurance",
    status: "in-development",
  },
  {
    key: "protein",
    name: "PROTEIN",
    description: "Minimalist protein · strength",
    status: "in-development",
  },
  {
    key: "club",
    name: "CLUB",
    description: "Membership · events · retreats",
    status: "in-development",
  },
];
