import type { ReactNode } from "react";
import styles from "./PageHeader.module.css";

/**
 * H1 plus an optional lead, at the top of every page except the home (Design
 * system, Page header). It sits on a full-bleed band: a neutral lift of the
 * surface with a hairline grid fading out from the top. Above the
 * H1, the page's path in mono, as a terminal prompt would show it; it is
 * decorative, the H1 names the page.
 */
export function PageHeader({
  title,
  lead,
  path,
  width = "prose",
  children,
}: {
  title: string;
  lead?: ReactNode;
  /** The page's URL path, shown as `oxide / docs / concepts`. */
  path?: string;
  /** The page's content width the header aligns with. */
  width?: "prose" | "wide";
  /** Anything that belongs to the header, under the lead. */
  children?: ReactNode;
}) {
  const segments = path ? path.split("/").filter(Boolean) : [];
  return (
    <div className={`${styles.header} ${styles[width]}`}>
      <div className={styles.backdrop} aria-hidden="true" />
      {path ? (
        <p className={styles.crumb} aria-hidden="true">
          <span className={styles.root}>oxide</span>
          {segments.map((segment, i) => (
            <span key={segment}>
              <span className={styles.slash}>/</span>
              <span className={i === segments.length - 1 ? styles.here : ""}>
                {segment}
              </span>
            </span>
          ))}
        </p>
      ) : null}
      <h1 className={styles.title}>{title}</h1>
      {lead ? <p className={styles.lead}>{lead}</p> : null}
      {children}
    </div>
  );
}
