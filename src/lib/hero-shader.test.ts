import { describe, expect, it } from "vitest";
import { FRAME_MS, MAX_PIXELS, RENDER_SCALE, bufferSize } from "./hero-shader";

// Budgets, Shader rules 1 and 2: buffer at 0.5 x CSS pixels, hard cap of
// 360,000 pixels, never from devicePixelRatio; 30 fps.
describe("bufferSize", () => {
  it("renders at half the CSS size", () => {
    expect(bufferSize(800, 400)).toEqual({ width: 400, height: 200 });
    expect(RENDER_SCALE).toBe(0.5);
  });

  it("never exceeds the hard cap, whatever the viewport", () => {
    for (const [w, h] of [
      [1440, 900],
      [2560, 1440],
      [5120, 2880],
      [7680, 4320],
      [1333, 977],
    ]) {
      const b = bufferSize(w, h);
      expect(b.width * b.height).toBeLessThanOrEqual(MAX_PIXELS);
    }
    expect(MAX_PIXELS).toBe(360_000);
  });

  it("keeps the aspect ratio when it scales down, and is never empty", () => {
    const b = bufferSize(4000, 2000);
    expect(b.width / b.height).toBeCloseTo(2, 1);
    expect(bufferSize(0, 0)).toEqual({ width: 1, height: 1 });
  });

  it("caps at 30 fps", () => {
    expect(FRAME_MS).toBeCloseTo(1000 / 30);
  });
});
