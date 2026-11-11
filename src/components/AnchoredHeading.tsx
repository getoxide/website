import type { ReactNode } from "react";
import { Icon } from "./Icon";
import styles from "./AnchoredHeading.module.css";

/**
 * A section heading with an `id` and a link to itself, revealed on hover and
 * focus (Design system: Prose, Concepts; FAQ; Changelog entry).
 * @param label the link's accessible name, e.g. "Link to Turn"
 */
export function AnchoredHeading({
  id,
  level = 2,
  label,
  children,
}: {
  id: string;
  level?: 2 | 3;
  label: string;
  children: ReactNode;
}) {
  const Heading = level === 2 ? "h2" : "h3";
  return (
    <div className={styles.heading}>
      <Heading id={id} className={styles.title}>
        {children}
      </Heading>
      <a className={styles.anchor} href={`#${id}`} aria-label={label}>
        <Icon name="link" />
      </a>
    </div>
  );
}
