import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import releases from "../../e2e/fixtures/releases.json";
import type { CaptureManifest } from "@/lib/captures";
import { SNAPSHOT, type Snapshot } from "@/lib/snapshot";
import { Hero } from "./Hero";

const manifest: CaptureManifest = {
  hero: {
    kind: "image",
    width: 2880,
    height: 1800,
    widths: [640, 960, 1280, 1920, 2560],
  },
};

const render = (
  key: keyof typeof releases | null = "stable",
  m: CaptureManifest = manifest,
) =>
  renderToStaticMarkup(
    createElement(Hero, {
      manifest: m,
      snapshot: key
        ? {
            ...SNAPSHOT,
            release: releases[key] as Snapshot["release"],
          }
        : SNAPSHOT,
    }),
  );
const text = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// Copy deck, Home → Hero (frozen); Design system, Animated mark and Capture
// frame.
describe("Hero", () => {
  it("has the frozen H1 and subheadline, the H1 first", () => {
    const html = render();
    expect(html.match(/<h1[^>]*>(.*?)<\/h1>/)![1]).toBe(
      "The complete desktop app for agentic coding.",
    );
    expect(text(html)).toContain(
      "Prompt, review, pull request and merge, with Claude Code, Codex and Antigravity CLI.",
    );
    expect(html.indexOf("<h1")).toBeLessThan(html.indexOf("Prompt, review"));
  });

  it("shows the mark above the H1, decorative", () => {
    const html = render();
    const mark = html.indexOf("<svg");
    expect(mark).toBeGreaterThan(-1);
    expect(mark).toBeLessThan(html.indexOf("<h1"));
    expect(html).toContain('width="120"');
  });

  it("has the locked buttons", () => {
    const html = render();
    const buttons = [
      ...html.matchAll(/<a [^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/g),
    ]
      .map(([, href, inner]) => ({ href, text: text(inner) }))
      .filter((l) => !l.href.startsWith("/docs/concepts"));
    expect(buttons).toEqual([
      { href: "/download", text: "Download Oxide" },
      { href: "https://github.com/getoxide/oxide", text: "View on GitHub" },
    ]);
    expect(html).toContain('data-goatcounter-click="github-cta"');
  });

  it("reads Get Oxide while there is no release at all", () => {
    expect(text(render("none"))).toContain("Get Oxide");
    expect(text(render("none"))).not.toContain("Download Oxide");
  });

  it("states the platforms from the Snapshot, then Pre-release", () => {
    expect(text(render())).toContain(
      "macOS on Apple Silicon and Windows x64 · Pre-release",
    );
  });

  it("rises the hero capture over the hero, not lazy", () => {
    const html = render();
    expect(html).toContain("<picture>");
    expect(html).not.toContain('loading="lazy"');
  });

  it("renders no frame when the hero slot has no source", () => {
    const html = render("stable", {});
    expect(html).not.toContain("<picture");
    expect(html).not.toContain("<img");
  });
});
