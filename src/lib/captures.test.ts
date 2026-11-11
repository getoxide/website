import { describe, expect, it } from "vitest";
import {
  CAPTURE_WIDTHS,
  captureFile,
  frameSizes,
  widthsFor,
  srcSetOf,
  type CaptureEntry,
} from "./captures";

const entry: CaptureEntry = {
  kind: "image",
  width: 2880,
  height: 1800,
  widths: [640, 960, 1280, 1920, 2560],
};

// Budgets, Product captures → Stills.
describe("captures", () => {
  it("serves five widths", () => {
    expect(CAPTURE_WIDTHS).toEqual([640, 960, 1280, 1920, 2560]);
  });

  it("never upscales a source", () => {
    expect(widthsFor(2880)).toEqual([640, 960, 1280, 1920, 2560]);
    expect(widthsFor(1440)).toEqual([640, 960, 1280]);
    expect(widthsFor(500)).toEqual([500]);
  });

  it("names variant files by slot, width and format", () => {
    expect(captureFile("hero", 960, "avif")).toBe("/captures/hero-960.avif");
    expect(captureFile("hero", 960, "webp")).toBe("/captures/hero-960.webp");
  });

  it("writes a srcset with every width", () => {
    expect(srcSetOf("hero", entry, "webp")).toBe(
      [
        "/captures/hero-640.webp 640w",
        "/captures/hero-960.webp 960w",
        "/captures/hero-1280.webp 1280w",
        "/captures/hero-1920.webp 1920w",
        "/captures/hero-2560.webp 2560w",
      ].join(", "),
    );
  });

  it("sizes the frame: 1160px wide, full width minus the gutter below", () => {
    expect(frameSizes).toBe(
      "(min-width: 1260px) 1160px, (min-width: 500px) 92vw, calc(100vw - 40px)",
    );
  });
});
