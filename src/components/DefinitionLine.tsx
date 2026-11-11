import { COPY } from "@/content/copy";
import { token } from "@/lib/snapshot";
import { DeckText } from "./DeckText";
import styles from "./DefinitionLine.module.css";

/**
 * The canonical definition, centred under the hero, then the trust line
 * (Copy deck, Home; Design system, Definition line). The definition renders
 * from the Snapshot, never typed here, and is marked so `check:copy` holds it
 * to the Snapshot's text.
 * @param seen the Concepts terms already mentioned earlier on the page
 */
export function DefinitionLine({
  seen = new Set<string>(),
}: {
  seen?: ReadonlySet<string>;
}) {
  return (
    <section className={styles.definition} aria-label="What Oxide is">
      <p className={styles.sentence} data-testid="definition">
        <DeckText source={token("definition")!} conceptLinks={seen} />
      </p>
      <p className={styles.trust}>{COPY.footer.trustLine}</p>
    </section>
  );
}
