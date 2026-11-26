import { COPY } from "@/content/copy";
import type { Snapshot } from "./snapshot";

/** The four steps of "From Project to pull request" on the home page. */
export function proofSteps(_snapshot?: Snapshot) {
  void _snapshot;
  return COPY.proofPath.steps;
}
