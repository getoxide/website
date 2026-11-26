// The capture slots of the site (docs/spec/budgets.md, Product captures; Design
// system, Capture frame). A slot is where a real capture of the Oxide UI goes.
// Its source file sits in `assets/captures/` (`<slot>.png`). A slot with no
// source file renders no frame, never a placeholder or a mock-up.

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
    alt: "Oxide: Open Projects and Terminals in the sidebar, Command blocks in the centre Terminal and the Pull request Surface on the right",
    quality: 60,
    // The 1160px frame at 2× is 2320px: the 2560px variant serves it.
    ceiling: { width: 2560, bytes: 200_000 },
  },
} satisfies Record<string, CaptureSlot>;

export type SlotId = keyof typeof CAPTURE_SLOTS;
