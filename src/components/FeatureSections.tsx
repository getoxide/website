import { featureSlot } from "@/content/features";
import { COPY } from "@/content/copy";
import { loadCaptureManifest } from "@/lib/capture-manifest";
import type { CaptureManifest } from "@/lib/captures";
import { seenBefore } from "@/lib/concept-links";
import { featureSections, type FeatureSection } from "@/lib/features";
import { SNAPSHOT, type Snapshot } from "@/lib/snapshot";
import { AnchoredHeading } from "./AnchoredHeading";
import { Capture } from "./Capture";
import { DeckText } from "./DeckText";
import { Reveal } from "./Reveal";
import styles from "./FeatureSections.module.css";

/** The paragraphs of one section, in reading order, as Markdown sources. */
function paragraphs(feature: FeatureSection): string[] {
  const { keySentences, detail, see, guide } = feature;
  return [
    keySentences.join(" "),
    [detail, see?.sentence].filter(Boolean).join(" "),
    ...(guide ? [`${guide.lead} [${guide.label}](${guide.href}).`] : []),
  ];
}

/**
 * The groups and sections of `/features` (Copy deck, `/features`; Design
 * system, Feature section): one anchored section per README Features lead-in
 * in the Snapshot, grouped by the loop. Each has a capture slot, and an empty
 * slot renders no frame and no caption. Sections reveal as on the home; all
 * the text and every capture is in the HTML regardless.
 * @param seen the Concepts terms already mentioned earlier on the page
 */
export function FeatureSections({
  snapshot = SNAPSHOT,
  manifest = loadCaptureManifest(),
  seen = new Set<string>(),
}: {
  snapshot?: Snapshot;
  manifest?: CaptureManifest;
  seen?: ReadonlySet<string>;
}) {
  const groups = featureSections(snapshot);
  // Concept links go on the first mention of each term, in reading order.
  const sources = groups.flatMap((group) => [
    group.sentence,
    ...group.features.flatMap(paragraphs),
  ]);
  const before = seenBefore(sources, seen);
  let next = 0;
  const line = (source: string) => (
    <DeckText source={source} conceptLinks={before[next++]} />
  );

  return (
    <>
      {groups.map((group) => {
        const groupId = `group-${group.features[0].anchor}`;
        return (
          <section
            key={group.heading}
            className={styles.group}
            aria-labelledby={groupId}
          >
            <header className={styles.groupHeader}>
              <h2 id={groupId} className={styles.groupHeading}>
                {group.heading}
              </h2>
              <p className={styles.groupSentence}>{line(group.sentence)}</p>
            </header>
            {group.features.map((feature) => {
              const slot = featureSlot(feature.anchor);
              const [keySentences, detail, guide] = paragraphs(feature);
              return (
                <Reveal key={feature.anchor} className={styles.feature}>
                  <section
                    className={styles.text}
                    aria-labelledby={feature.anchor}
                  >
                    <AnchoredHeading
                      id={feature.anchor}
                      level={3}
                      label={COPY.anchorLabel(feature.heading)}
                    >
                      {feature.heading}
                    </AnchoredHeading>
                    <p className={styles.key}>{line(keySentences)}</p>
                    <p className={styles.detail}>{line(detail)}</p>
                    {guide ? (
                      <p className={styles.detail}>{line(guide)}</p>
                    ) : null}
                  </section>
                  {manifest[slot] ? (
                    <figure className={styles.figure}>
                      <Capture slot={slot} manifest={manifest} />
                      <figcaption className={styles.caption}>
                        {feature.caption}
                      </figcaption>
                    </figure>
                  ) : null}
                </Reveal>
              );
            })}
          </section>
        );
      })}
    </>
  );
}
