/**
 * FAQ content. Where a real, verified answer is not yet available
 * (manufacturing origin, testing regime, formal shipping/returns policy)
 * the copy says so plainly rather than inventing a claim.
 */

export interface FaqItem {
  question: string;
  answer: string;
}

export const faqItems: FaqItem[] = [
  {
    question: "What is BULLRUSH DAILY?",
    answer:
      "BULLRUSH DAILY is a daily performance capsule — the first product inside a men's performance system built around discipline, consistency and self-command, rather than a single dramatic promise.",
  },
  {
    question: "Who is it designed for?",
    answer:
      "Men who already train, work and hold a standard for themselves, and want a daily tool that supports that standard rather than replaces it.",
  },
  {
    question: "How should it be taken?",
    answer:
      "Directions are printed on the pack. Full usage guidance will also be published here once finalized.",
  },
  {
    question: "What is inside?",
    answer:
      "Full formulation detail — ingredient by ingredient, with dose and function — is being finalized for publication. We will not list a formula here until it can be shown in full and stand behind it.",
  },
  {
    question: "Is it suitable for daily use?",
    answer:
      "BULLRUSH DAILY is formulated as a daily product. As with any supplement, if you take medication or manage a health condition, check with a physician before starting.",
  },
  {
    question: "Where is it manufactured?",
    answer: "Manufacturing origin will be published here once confirmed.",
  },
  {
    question: "Is it independently tested?",
    answer: "Testing and certification details will be published here as they are confirmed.",
  },
  {
    question: "Can I cancel a subscription?",
    answer:
      "Subscription purchasing is not yet live. When it is, cancellation will be self-serve with no minimum commitment — full terms will be published alongside the launch.",
  },
  {
    question: "What is the shipping policy?",
    answer: "Shipping rates and timelines are confirmed at checkout and will be detailed here once finalized.",
  },
  {
    question: "What is the returns policy?",
    answer: "A formal returns policy will be published here before checkout goes live.",
  },
];
