/**
 * Verified BULLRUSH production claims — confirmed for use on the live site.
 * Do not add further claims here without the same level of confirmation.
 */

export interface TrustClaim {
  key: string;
  label: string;
  detail: string;
}

export const trustClaims: TrustClaim[] = [
  {
    key: "cgmp",
    label: "CGMP FACILITY",
    detail: "Manufactured in a facility operating under current Good Manufacturing Practice.",
  },
  {
    key: "non-gmo",
    label: "NON-GMO",
    detail: "Formulated without genetically modified ingredients.",
  },
  {
    key: "made-in-usa",
    label: "MADE IN USA",
    detail: "Manufactured in the United States.",
  },
  {
    key: "third-party-tested",
    label: "THIRD-PARTY TESTED",
    detail: "Independently tested outside of BULLRUSH's own facility.",
  },
];
