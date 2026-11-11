import { FeatureSections } from "@/components/FeatureSections";
import { DeckText } from "@/components/DeckText";
import { PageHeader } from "@/components/PageHeader";
import { SiteFrame } from "@/components/SiteFrame";
import { FEATURES_INTRO } from "@/content/features";
import { PAGES } from "@/content/pages";
import { seenBefore } from "@/lib/concept-links";
import { pageMetadata } from "@/lib/metadata";
import styles from "./features.module.css";

export const metadata = pageMetadata(PAGES.features);

/**
 * `/features`: every Oxide feature, one anchored section each, grouped by the
 * loop (Copy deck, `/features`). The sections come from the feature-name
 * contract against the Snapshot's README lead-ins (`src/lib/features.ts`).
 */
export default function FeaturesPage() {
  const page = PAGES.features;
  const { keySentence, detail } = FEATURES_INTRO;
  // The Concepts terms mentioned in the intro; the third source is empty, so
  // its "seen before" is everything the intro said.
  const [introSeen, detailSeen, sectionsSeen] = seenBefore([
    keySentence,
    detail,
    "",
  ]);
  return (
    <SiteFrame page={page}>
      <PageHeader
        title={page.h1}
        lead={<DeckText source={keySentence} conceptLinks={introSeen} />}
      />
      <p className={styles.intro}>
        <DeckText source={detail} conceptLinks={detailSeen} />
      </p>
      <FeatureSections seen={sectionsSeen} />
    </SiteFrame>
  );
}
