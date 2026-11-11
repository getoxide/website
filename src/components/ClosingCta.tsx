import { COPY, GITHUB_REPO_URL } from "@/content/copy";
import { SNAPSHOT, type Snapshot } from "@/lib/snapshot";
import { Button } from "./Button";
import styles from "./ClosingCta.module.css";

/**
 * The closing CTA block (Copy deck, Closing CTA block), the same on every
 * page except `/download` (Page inventory #9, internal linking rule 1). With
 * no release at all the primary reads "Get Oxide", so no button promises a
 * download that does not exist.
 */
export function ClosingCta({ snapshot = SNAPSHOT }: { snapshot?: Snapshot }) {
  const copy = COPY.closingCta;
  const none = snapshot.release.state === "none";
  return (
    <section className={styles.cta} aria-labelledby="closing-cta">
      <h2 id="closing-cta" className={styles.heading}>
        {copy.heading}
      </h2>
      <p className={styles.sentence}>{copy.sentence}</p>
      <div className={styles.buttons}>
        <Button href="/download" variant="primary" icon="download">
          {none ? copy.getOxide : copy.download}
        </Button>
        <Button
          href={GITHUB_REPO_URL}
          variant="ghost"
          icon="mark-github"
          event="github-cta"
        >
          {copy.github}
        </Button>
      </div>
    </section>
  );
}
