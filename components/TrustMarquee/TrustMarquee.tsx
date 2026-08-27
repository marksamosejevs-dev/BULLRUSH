import { Marquee } from "@/components/Marquee/Marquee";
import { trustClaims } from "@/data/trust";
import { TRUST_ICONS } from "@/lib/trust-icons";
import styles from "./TrustMarquee.module.css";

interface TrustMarqueeProps {
  variant?: "ink" | "bone";
}

export function TrustMarquee({ variant = "ink" }: TrustMarqueeProps) {
  return (
    <Marquee variant={variant} duration={30} ariaLabel="Verified production standards" marble>
      {trustClaims.map((claim) => (
        <span key={claim.key} className={styles.item}>
          <span className={styles.icon} aria-hidden>
            {TRUST_ICONS[claim.key]}
          </span>
          <span className={styles.label}>{claim.label}</span>
          <span className={styles.dot} aria-hidden>
            &middot;
          </span>
        </span>
      ))}
    </Marquee>
  );
}
