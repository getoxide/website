// The capture slots of the site (docs/spec/budgets.md, Product captures; Design
// system, Capture frame). A slot is where a real capture of the Oxide UI goes.
// Its source file sits in `assets/captures/` (`<slot>.png`; a video slot adds
// `<slot>.mp4` and optionally `<slot>.av1.mp4`, the PNG being its poster). A
// slot with no source file renders no frame, never a placeholder or a mock-up,
// and the build lists it as empty. Lorenzo records the captures himself
// (getoxide/website#15); the hero's still seeds from the visual-direction
// prototype.

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

export const CAPTURE_SLOTS = {
  hero: {
    kind: "image",
    alt: "Oxide: a Thread with Claude Code in the centre, the Project's Threads on the left and the Diff Surface on the right",
    quality: 60,
    // The 1160px frame at 2× is 2320px: the 2560px variant serves it.
    ceiling: { width: 2560, bytes: 200_000 },
  },
} as const satisfies Record<string, CaptureSlot>;

export type SlotId = keyof typeof CAPTURE_SLOTS;
