import type { CSSProperties } from "react";
import { COPY } from "@/content/copy";
import { seenBefore } from "@/lib/concept-links";
import { proofSteps } from "@/lib/proof-path";
import { SNAPSHOT, type Snapshot } from "@/lib/snapshot";
import { DeckText } from "./DeckText";
import { Icon } from "./Icon";
import { Reveal } from "./Reveal";
import styles from "./ProofPath.module.css";

/**
 * The four-step "From prompt to merge" path (Design system, Proof path; Copy
 * deck, Home → Proof points). Steps 3 and 4 claim the in-app merge and Fix,
 * so they render only once the Snapshot's Features carry the README lead-in
 * "Pull requests, from review to merge." (oxide#416). On reveal the line draws
 * and the nodes light one `--site-stagger` apart; all of the text is in the
 * HTML regardless.
 * @param seen the Concepts terms already mentioned earlier on the page
 */
export function ProofPath({
  snapshot = SNAPSHOT,
  seen = new Set<string>(),
}: {
  snapshot?: Snapshot;
  seen?: ReadonlySet<string>;
}) {
  const copy = COPY.proofPath;
  const steps = proofSteps(snapshot);
  const before = seenBefore(
    steps.map((s) => s.sentence),
    seen,
  );
  return (
    <section className={styles.path} aria-labelledby="proof-path">
      <h2 id="proof-path" className={styles.heading}>
        {copy.heading}
      </h2>
      <Reveal className={styles.wrap}>
        <span className={styles.line} aria-hidden="true" />
        <ol className={styles.steps}>
          {steps.map((step, i) => (
            <li
              key={step.heading}
              className={styles.step}
              style={{ "--n": i } as CSSProperties}
            >
              <span className={styles.node} aria-hidden="true" />
              <div className={styles.body}>
                <Icon name={step.icon} className={styles.icon} />
                <h3 className={styles.title}>{step.heading}</h3>
                <p className={styles.sentence}>
                  <DeckText source={step.sentence} conceptLinks={before[i]} />
                </p>
                <a
                  className={styles.more}
                  href={step.href}
                  aria-label={`${copy.learnMore} about ${step.heading}`}
                >
                  {copy.learnMore}
                </a>
              </div>
            </li>
          ))}
        </ol>
      </Reveal>
    </section>
  );
}
