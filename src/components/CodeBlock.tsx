import { COPY_SCRIPT } from "@/lib/copy";
import { highlight } from "@/lib/highlight";
import styles from "./CodeBlock.module.css";

/**
 * A code block (Design system, Code block), highlighted with Shiki while the
 * page renders at build time: the browser gets coloured spans only. The Copy
 * button is added by a tiny inline script, so it appears only when JS runs,
 * needs no hydration, and works on reading pages that ship no client runtime.
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
    <div className={styles.block} data-copy="" data-copy-class={styles.copy}>
      <div
        className={styles.code}
        // Shiki's output for build-time content from the Snapshot or the repo.
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <script dangerouslySetInnerHTML={{ __html: COPY_SCRIPT }} />
    </div>
  );
}
