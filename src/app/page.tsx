import { DefinitionLine } from "@/components/DefinitionLine";
import { Hero } from "@/components/Hero";
import { ProofPath } from "@/components/ProofPath";
import { SiteFrame } from "@/components/SiteFrame";
import { COPY } from "@/content/copy";
import { PAGES } from "@/content/pages";
import { seenBefore } from "@/lib/concept-links";
import { pageMetadata } from "@/lib/metadata";
import { MOTION_SCRIPT } from "@/lib/motion";
import { token } from "@/lib/snapshot";

export const metadata = pageMetadata(PAGES.home);

export default function HomePage() {
  // The Concepts terms mentioned so far, in reading order: the hero, then
  // the definition, then the proof path (Copy deck, rule 4).
  const [, definitionSeen, proofSeen] = seenBefore([
    COPY.hero.subheadline,
    token("definition")!,
    token("definition")!,
  ]);
  return (
    <SiteFrame page={PAGES.home}>
      {/* Hidden start states exist only once this runs and motion is allowed
          (ADR-0001); the server HTML never hides anything. */}
      <script dangerouslySetInnerHTML={{ __html: MOTION_SCRIPT }} />
      <Hero />
      <DefinitionLine seen={definitionSeen} />
      <ProofPath seen={proofSeen} />
    </SiteFrame>
  );
}
