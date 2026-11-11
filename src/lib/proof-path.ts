import { COPY } from "@/content/copy";
import { SNAPSHOT, type Snapshot } from "./snapshot";

const normalize = (text: string) =>
  text
    .trim()
    .replace(/[.:]\s*$/, "")
    .toLowerCase();

/**
 * Whether the Snapshot's Features carry the README lead-in "Pull requests,
 * from review to merge." (oxide#416). The Snapshot keeps lead-ins without
 * their closing period.
 */
export function hasPullRequestLeadIn(snapshot: Snapshot = SNAPSHOT): boolean {
  const wanted = normalize(COPY.proofPath.leadIn);
  return snapshot.readme.features.some((group) =>
    group.leadIns.some((leadIn) => normalize(leadIn) === wanted),
  );
}

/** Steps 1 and 2 always; steps 3 and 4 only once the README backs them. */
export function proofSteps(snapshot: Snapshot = SNAPSHOT) {
  const { steps } = COPY.proofPath;
  return hasPullRequestLeadIn(snapshot) ? steps : steps.slice(0, 2);
}
