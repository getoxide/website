import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { CaptureManifest } from "@/lib/captures";
import { Capture } from "./Capture";

const manifest: CaptureManifest = {
  hero: {
    kind: "image",
    width: 2880,
    height: 1800,
    widths: [640, 960, 1280, 1920, 2560],
  },
  loop: {
    kind: "video",
    width: 1920,
    height: 1080,
    widths: [640, 960, 1280, 1920],
    sources: [
      {
        src: "/captures/loop.av1.mp4",
        type: 'video/mp4; codecs="av01.0.08M.08"',
      },
      { src: "/captures/loop.mp4", type: "video/mp4" },
    ],
  },
};
const alts = { hero: "Hero alt", loop: "Loop alt", missing: "Never shown" };

const render = (slot: string, props = {}) =>
  renderToStaticMarkup(
    createElement(Capture, { slot, manifest, alts, ...props }),
  );

// Budgets, Product captures; Design system, Capture frame.
describe("Capture", () => {
  it("renders nothing for a slot with no source: never a placeholder", () => {
    expect(render("missing")).toBe("");
  });

  it("serves a picture: AVIF first, WebP after, an accurate sizes", () => {
    const html = render("hero");
    const sources = [...html.matchAll(/<source [^>]*>/g)].map(([s]) => s);
    expect(sources).toHaveLength(2);
    expect(sources[0]).toContain('type="image/avif"');
    expect(sources[0]).toContain("/captures/hero-640.avif 640w");
    expect(sources[0]).toContain("/captures/hero-2560.avif 2560w");
    expect(sources[1]).toContain('type="image/webp"');
    for (const s of sources) {
      expect(s).toContain(
        'sizes="(min-width: 1260px) 1160px, (min-width: 500px) 92vw, calc(100vw - 40px)"',
      );
    }
  });

  it("reserves the box with the source's dimensions and never serves PNG", () => {
    const html = render("hero");
    const img = html.match(/<img [^>]*>/)![0];
    expect(img).toContain('width="2880"');
    expect(img).toContain('height="1800"');
    expect(img).toContain('alt="Hero alt"');
    expect(img).toContain('src="/captures/hero-1280.webp"');
    expect(html).not.toMatch(/\.png/);
  });

  it("lazy-loads unless it is above the fold", () => {
    expect(render("hero")).toContain('loading="lazy"');
    expect(render("hero", { priority: true })).not.toContain('loading="lazy"');
  });

  it("renders a video with two sources, no audio, a poster and no autoplay", () => {
    const html = render("loop");
    const video = html.match(/<video [^>]*>/)![0];
    expect(video).toContain("muted");
    expect(video).toContain("loop");
    expect(video.toLowerCase()).toContain("playsinline");
    expect(video).toContain('preload="none"');
    expect(video).not.toContain("autoPlay");
    expect(video).toContain('poster="/captures/loop-1280.avif"');
    expect(video).toContain('aria-label="Loop alt"');
    const sources = [...html.matchAll(/<source [^>]*>/g)].map(([s]) => s);
    expect(sources[0]).toContain("/captures/loop.av1.mp4");
    expect(sources[1]).toContain('src="/captures/loop.mp4"');
  });

  it("keeps the native controls until JavaScript replaces them with its own button", () => {
    expect(render("loop")).toContain("controls");
  });
});
