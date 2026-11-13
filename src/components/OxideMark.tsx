import { MARK_BRACES, MARK_EYES, MARK_VIEWBOX } from "@/lib/mark";
import styles from "./OxideMark.module.css";

/**
 * The Oxide Braces mark, inline, 120px (Design system, Animated mark). The
 * geometry is shared with the generated share card (`@/lib/mark`). It is
 * static unless `animated`, which only the home hero sets: the eyes (`.eyes`,
 * `.eye`) then blink and glance in CSS, still under reduced motion. Decorative: the H1 below it names the page.
 */
export function OxideMark({ animated = false }: { animated?: boolean }) {
  return (
    <svg
      className={`${styles.mark} ${animated ? styles.animated : ""}`}
      viewBox={MARK_VIEWBOX}
      width="120"
      height="120"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient
          id="oxide-mark-ink"
          gradientUnits="userSpaceOnUse"
          x1="512"
          y1="260"
          x2="512"
          y2="764"
        >
          <stop offset="0" style={{ stopColor: "var(--ox-text)" }} />
          <stop offset="1" style={{ stopColor: "var(--ox-text-disabled)" }} />
        </linearGradient>
      </defs>
      <g fill="none" strokeLinecap="round">
        <g stroke="url(#oxide-mark-ink)" strokeWidth="62">
          {MARK_BRACES.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
        <g className={styles.eyes} stroke="currentColor" strokeWidth="48">
          {MARK_EYES.map((d) => (
            <path key={d} className={styles.eye} d={d} />
          ))}
        </g>
      </g>
    </svg>
  );
}
