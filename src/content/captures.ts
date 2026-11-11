// The capture slots of the site (docs/spec/budgets.md, Product captures; Design
// system, Capture frame). A slot is where a real capture of the Oxide UI goes.
// Its source file sits in `assets/captures/` (`<slot>.png`; a video slot adds
// `<slot>.mp4` and optionally `<slot>.av1.mp4`, the PNG being its poster). A
// slot with no source file renders no frame, never a placeholder or a mock-up,
// and the build lists it as empty. Lorenzo records the captures himself
// (getoxide/website#15); the hero's still seeds from the visual-direction
// prototype.

import { FEATURE_GROUPS, featureSlot } from "./features.ts";

export type CaptureSlot = {
  kind: "image" | "video";
  /** Says what the app shows, never "screenshot" (Budgets, Accessibility). */
  alt: string;
  /** AVIF quality, picked by eye on the UI's small text (Budgets: ~60). */
  quality?: number;
  /**
   * The variant served at 2× the frame must weigh at most `bytes`: the build
   * fails when it does not (Budgets: the hero capture ≤ 200 kB).
   */
  ceiling?: { width: number; bytes: number };
};

/**
 * One slot per `/features` section, `feature-<anchor>` (Copy deck,
 * `/features`). The pending Pull requests section has its slot too: empty
 * slots render nothing, so a capture dropped in early waits for its section.
 */
const FEATURE_SLOTS: Record<string, CaptureSlot> = Object.fromEntries(
  FEATURE_GROUPS.flatMap((group) => group.features).map((feature) => [
    featureSlot(feature.anchor),
    { kind: "image", alt: feature.captureAlt, quality: 60 },
  ]),
);

export const CAPTURE_SLOTS = {
  ...FEATURE_SLOTS,
  hero: {
    kind: "image",
    alt: "Oxide: a Thread with Claude Code in the centre, the Project's Threads on the left and the Diff Surface on the right",
    quality: 60,
    // The 1160px frame at 2× is 2320px: the 2560px variant serves it.
    ceiling: { width: 2560, bytes: 200_000 },
  },
  // Provider landing pages: build-written draft alts, Lorenzo records the
  // captures (getoxide/website#15). No source file, no frame.
  "claude-code-turn": {
    kind: "image",
    alt: "Oxide's Diff Surface showing only the files one Turn changed, beside the Claude Code Thread that made them",
    quality: 60,
  },
  "codex-dossier": {
    kind: "image",
    alt: "Oxide's Verification Dossier for a Codex Turn: the closing message kept apart from the checks that actually ran",
    quality: 60,
  },
} satisfies Record<string, CaptureSlot>;

export type SlotId = keyof typeof CAPTURE_SLOTS;
