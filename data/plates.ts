/**
 * Photography slots.
 *
 * Real photography from the BULLRUSH asset pack lives in /public/images.
 * Each slot also carries a CSS material-study fallback (the `background`
 * value) for any future key added before its file exists — <Plate> falls
 * back to it automatically on a 404, so a new slot never breaks layout.
 */

export interface PlateSpec {
  key: string;
  file: string;
  alt: string;
  background: string;
}

/** Keys with a real file in /public/images. */
export const availablePlates = new Set<string>([
  "hero",
  "macro-cap",
  "macro-emboss",
  "macro-label",
  "lying",
  "reflection",
  "three",
  "desk",
  "bag",
  "topdown",
  "ledge",
  "empty-ledge",
  "geometry",
  "planes",
]);

export const plates: Record<string, PlateSpec> = {
  hero: {
    key: "hero",
    file: "/images/hero.jpg",
    alt: "BULLRUSH DAILY, matte black, in low directional light",
    background:
      "radial-gradient(120% 140% at 72% 18%, #2b2b28 0%, #171715 42%, #0c0c0b 100%)",
  },
  "macro-cap": {
    key: "macro-cap",
    file: "/images/macro-cap.jpg",
    alt: "Macro detail of the knurled cap",
    background:
      "repeating-linear-gradient(115deg, #26261f 0px, #26261f 2px, #16160f 3px, #16160f 5px), radial-gradient(80% 80% at 30% 20%, #34342b 0%, #0d0d0a 70%)",
  },
  "macro-emboss": {
    key: "macro-emboss",
    file: "/images/macro-emboss.jpg",
    alt: "Macro detail of the embossed horn mark",
    background:
      "radial-gradient(60% 60% at 50% 45%, #2a2a26 0%, #131311 60%, #0a0a09 100%)",
  },
  "macro-label": {
    key: "macro-label",
    file: "/images/macro-label.jpg",
    alt: "Macro detail of the label typography",
    background: "linear-gradient(160deg, #171714 0%, #0e0e0c 60%, #050505 100%)",
  },
  lying: {
    key: "lying",
    file: "/images/lying.jpg",
    alt: "BULLRUSH DAILY resting on a stone surface",
    background:
      "linear-gradient(180deg, #c3bdb3 0%, #ada79c 55%, #8f897d 100%)",
  },
  reflection: {
    key: "reflection",
    file: "/images/reflection.jpg",
    alt: "BULLRUSH DAILY reflected on a dark polished surface",
    background:
      "linear-gradient(180deg, #1a1a17 0%, #0a0a09 48%, #121210 52%, #050504 100%)",
  },
  three: {
    key: "three",
    file: "/images/three.jpg",
    alt: "Three BULLRUSH DAILY bottles arranged in a row",
    background: "linear-gradient(100deg, #101010 0%, #1c1c19 50%, #0c0c0b 100%)",
  },
  desk: {
    key: "desk",
    file: "/images/desk.jpg",
    alt: "BULLRUSH DAILY on a minimal desk surface",
    background:
      "linear-gradient(170deg, #ece9e4 0%, #dcd8cf 55%, #c3bdb3 100%)",
  },
  bag: {
    key: "bag",
    file: "/images/bag.jpg",
    alt: "BULLRUSH DAILY packed inside a travel bag",
    background:
      "radial-gradient(100% 100% at 50% 0%, #23231f 0%, #131311 55%, #060605 100%)",
  },
  topdown: {
    key: "topdown",
    file: "/images/topdown.jpg",
    alt: "Top-down view of the BULLRUSH DAILY cap",
    background: "radial-gradient(60% 60% at 50% 50%, #2c2c27 0%, #0d0d0b 70%)",
  },
  ledge: {
    key: "ledge",
    file: "/images/ledge.jpg",
    alt: "BULLRUSH DAILY on an architectural concrete ledge",
    background: "linear-gradient(200deg, #605b53 0%, #3a3733 55%, #171615 100%)",
  },
  "empty-ledge": {
    key: "empty-ledge",
    file: "/images/empty-ledge.jpg",
    alt: "An empty architectural concrete ledge",
    background: "linear-gradient(200deg, #6e6a62 0%, #4a4742 55%, #232220 100%)",
  },
  geometry: {
    key: "geometry",
    file: "/images/geometry.jpg",
    alt: "Abstract architectural geometry study",
    background:
      "linear-gradient(115deg, #0c0c0b 0%, #171714 35%, #0c0c0b 55%, #1c1c18 78%, #0a0a09 100%)",
  },
  planes: {
    key: "planes",
    file: "/images/planes.jpg",
    alt: "Abstract intersecting material planes",
    background:
      "linear-gradient(70deg, #ece9e4 0%, #ece9e4 45%, #12120f 45%, #12120f 100%)",
  },
};
