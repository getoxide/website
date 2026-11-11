import { highlight } from "@/lib/highlight";
import { CopyButton } from "./CopyButton";
import styles from "./CodeBlock.module.css";

/**
 * A code block (Design system, Code block), highlighted with Shiki while the
 * page renders at build time: the browser gets coloured spans only. The Copy
 * button is a small client component that appears only when JS runs.
 */
export async function CodeBlock({
  code,
  lang,
}: {
  code: string;
  lang?: string;
}) {
  const html = await highlight(code, lang);
  return (
    <div className={styles.block}>
      <div
        className={styles.code}
        // Shiki's output for build-time content from the Snapshot or the repo.
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <CopyButton code={code} className={styles.copy} />
    </div>
  );
}
