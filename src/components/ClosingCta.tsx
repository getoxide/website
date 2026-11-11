import { COPY, GITHUB_REPO_URL } from "@/content/copy";
import { seenBefore } from "@/lib/concept-links";
import { SNAPSHOT, type Snapshot } from "@/lib/snapshot";
import { Button } from "./Button";
import { DeckText } from "./DeckText";
import styles from "./ClosingCta.module.css";

/**
 * The closing CTA block (Copy deck, Closing CTA block), the same on every
 * page except `/download` (Page inventory #9, internal linking rule 1). With
 * no release at all the primary reads "Get Oxide", so no button promises a
 * download that does not exist.
 * @param conceptsSeen the Concepts terms the page mentioned before the block;
 *   the block links the first mention of the others (Content #12 addendum,
 *   point 4)
 */
export function ClosingCta({
  snapshot = SNAPSHOT,
  conceptsSeen = new Set<string>(),
}: {
  snapshot?: Snapshot;
  conceptsSeen?: ReadonlySet<string>;
}) {
  const copy = COPY.closingCta;
  const none = snapshot.release.state === "none";
  const seen = seenBefore([copy.heading, copy.sentence], conceptsSeen);
  return (
    <section className={styles.cta} aria-labelledby="closing-cta">
      <h2 id="closing-cta" className={styles.heading}>
        <DeckText source={copy.heading} conceptLinks={seen[0]} />
      </h2>
      <p className={styles.sentence}>
        <DeckText source={copy.sentence} conceptLinks={seen[1]} />
      </p>
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
