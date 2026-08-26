import { Marquee } from "@/components/Marquee/Marquee";
import styles from "./BrandMarquee.module.css";

const LINES = ["POWER UNDER CONTROL", "RULE YOURSELF", "DO THE WORK", "WIN QUIETLY", "PROOF OVER PROMISE"];

export function BrandMarquee() {
  return (
    <Marquee variant="bone" duration={38} ariaLabel="Brand principles">
      {LINES.map((line) => (
        <span key={line} className={styles.item}>
          {line}
          <span className={styles.dot} aria-hidden>
            &middot;
          </span>
        </span>
      ))}
    </Marquee>
  );
}
