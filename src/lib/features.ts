// The feature-name contract between `/features` and the Oxide README (Copy
// deck, `/features` → The feature-name contract): one section per README
// Features lead-in in the Snapshot, no more, no fewer. A lead-in the contract
// lacks, or a contract entry the README no longer has, is a mismatch that
// `checkFeatureContract` reports and the tests turn into a failure; a contract
// entry whose lead-in is not in the Snapshot yet (`PENDING_UPSTREAM`) is not
// rendered, and is not a mismatch.
import {
  FEATURE_GROUPS,
  PENDING_UPSTREAM,
  type Feature,
  type FeatureGroup,
} from "@/content/features";
import { SNAPSHOT, type Snapshot } from "./snapshot";

export { PENDING_UPSTREAM };

/** The comparison key of a lead-in: the README's closing period is not part of it. */
export const leadInKey = (leadIn: string) => leadIn.trim().replace(/\.$/, "");

const snapshotLeadIns = (snapshot: Snapshot) =>
  snapshot.readme.features.flatMap((group) => group.leadIns);

/**
 * Where the contract and the Snapshot disagree.
 * @returns `unknown`: Snapshot lead-ins with no contract entry (new or
 *   renamed in the README); `missing`: contract entries, in the contract's
 *   spelling, that the README lacks and that are not pending upstream
 *   (removed or renamed in the README)
 */
export function checkFeatureContract(snapshot: Snapshot = SNAPSHOT) {
  const present = new Set(snapshotLeadIns(snapshot).map(leadInKey));
  const contract = FEATURE_GROUPS.flatMap((group) => group.features);
  const known = new Set(contract.map((f) => leadInKey(f.leadIn)));
  return {
    unknown: snapshotLeadIns(snapshot).filter((l) => !known.has(leadInKey(l))),
    missing: contract
      .filter(
        (f) =>
          !present.has(leadInKey(f.leadIn)) &&
          !PENDING_UPSTREAM.includes(f.leadIn),
      )
      .map((f) => f.leadIn),
  };
}

/** A section to render: the contract entry, its pointer resolved. */
export type FeatureSection = Omit<Feature, "see"> & {
  /** The pointer to another section, only while that section renders. */
  see: NonNullable<Feature["see"]> | null;
};

export type FeatureSectionGroup = Omit<FeatureGroup, "features"> & {
  features: FeatureSection[];
};

/**
 * The groups and sections `/features` renders for a Snapshot, in loop order:
 * one per README lead-in. A lead-in the contract lacks fails the build, so a
 * README feature never goes unlisted. Entries pending upstream stay out until
 * the Snapshot carries their lead-in.
 */
export function featureSections(
  snapshot: Snapshot = SNAPSHOT,
): FeatureSectionGroup[] {
  const { unknown } = checkFeatureContract(snapshot);
  if (unknown.length > 0) {
    throw new Error(
      `The README has Features lead-ins that /features lacks: ${unknown.join(", ")}. Add them to src/content/features.ts and the Copy deck.`,
    );
  }
  const present = new Set(snapshotLeadIns(snapshot).map(leadInKey));
  const rendered = (f: Feature) => present.has(leadInKey(f.leadIn));
  const anchors = new Set(
    FEATURE_GROUPS.flatMap((g) => g.features.filter(rendered)).map(
      (f) => f.anchor,
    ),
  );
  return FEATURE_GROUPS.map((group) => ({
    ...group,
    features: group.features.filter(rendered).map((feature) => ({
      ...feature,
      see: feature.see && anchors.has(feature.see.anchor) ? feature.see : null,
    })),
  })).filter((group) => group.features.length > 0);
}
