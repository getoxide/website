import type { ReactNode } from "react";
import styles from "./Prose.module.css";

/**
 * Reading styles for derived Markdown and MDX (Design system, Prose): docs,
 * guides, changelog and FAQ, at the prose width.
 */
export function Prose({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <div id={id} className={styles.prose}>
      {children}
    </div>
  );
}
