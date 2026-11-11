import styles from "./OxideMark.module.css";

/**
 * The Oxide Braces mark, inline, 120px (Design system, Animated mark). The
 * geometry is the brand's (the mark inside `oxide-logo.svg`). It is static
 * here; the eyes (`.eyes`, `.eye`) are grouped so the hero's motion can blink
 * and glance them, on the home hero only. Decorative: the H1 below it names
 * the page.
 */
export function OxideMark() {
  return (
    <svg
      className={styles.mark}
      viewBox="232 232 560 560"
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
          <path d="M424 291H384A62 62 0 0 0 322 353V450A62 62 0 0 1 260 512A62 62 0 0 1 322 574V671A62 62 0 0 0 384 733H424" />
          <path d="M600 291H640A62 62 0 0 1 702 353V450A62 62 0 0 0 764 512A62 62 0 0 0 702 574V671A62 62 0 0 1 640 733H600" />
        </g>
        <g className={styles.eyes} stroke="currentColor" strokeWidth="48">
          <path className={styles.eye} d="M448 472V552" />
          <path className={styles.eye} d="M576 472V552" />
        </g>
      </g>
    </svg>
  );
}
