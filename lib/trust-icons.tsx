/**
 * Original line-icon set for the four verified production claims.
 * Hand-built shapes — not derived from any third-party icon set or
 * competitor SVG. Shared by every trust-claim surface on the site.
 */
export const TRUST_ICONS: Record<string, JSX.Element> = {
  cgmp: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M12 2 4 5.5V11c0 5.2 3.4 8.6 8 11 4.6-2.4 8-5.8 8-11V5.5L12 2Z" />
      <path d="M8 12h8M12 8v8" />
    </svg>
  ),
  "non-gmo": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M12 21c0-6 4-9.5 9-11-1 6-4 9.5-9 11Z" />
      <path d="M12 21c0-6-4-9.5-9-11 1 6 4 9.5 9 11Z" />
      <path d="M12 21V9" />
    </svg>
  ),
  "made-in-usa": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M12 2.5 14.5 9l6.7.3-5.3 4.3 1.9 6.4L12 16.5l-5.8 3.5 1.9-6.4L2.8 9.3 9.5 9 12 2.5Z" />
    </svg>
  ),
  "third-party-tested": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5 10.7 15 16 9" />
    </svg>
  ),
};
