import type { ReactNode } from "react";
import styles from "./PageHeader.module.css";

/** H1 plus an optional lead, at the top of every page except the home. */
export function PageHeader({
  title,
  lead,
}: {
  title: string;
  lead?: ReactNode;
}) {
  return (
    <div className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      {lead ? <p className={styles.lead}>{lead}</p> : null}
    </div>
  );
}
