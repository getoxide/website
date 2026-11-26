import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import releases from "../../e2e/fixtures/releases.json";
import { SNAPSHOT, type Snapshot } from "@/lib/snapshot";
import { Hero } from "./Hero";

const render = (key: keyof typeof releases | null = "stable") =>
  renderToStaticMarkup(
    createElement(Hero, {
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

describe("Hero", () => {
  it("has the frozen H1 and subheadline, the H1 first", () => {
    const html = render();
    expect(text(html.match(/<h1[^>]*>(.*?)<\/h1>/)![1])).toBe(
      "A terminal app that knows your GitHub projects.",
    );
    expect(text(html)).toContain(
      "Open a folder, run as many clean shells as you like, and keep code, issues and pull requests at hand.",
    );
    expect(html.indexOf("<h1")).toBeLessThan(html.indexOf("Open a folder"));
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
      "macOS on Apple Silicon, Windows (x64, arm64) and Linux (x64, arm64) · Pre-release",
    );
  });

  it("rises the interactive app preview over the hero, in place of the capture", () => {
    const html = render();
    expect(html).not.toContain("<picture");
    expect(html).toMatch(
      /<figure[^>]*role="group"[^>]*aria-label="Interactive preview of Oxide"/,
    );
    expect(html).toContain("data-capture");
    expect(html).toContain("Squash and merge");
  });

  it("paints the static gradient first, with the shader canvas over it", () => {
    const html = render();
    expect(html.indexOf("gradient")).toBeGreaterThan(-1);
    expect(html.indexOf("<canvas")).toBeGreaterThan(html.indexOf("gradient"));
    expect(html).toMatch(/<canvas[^>]*aria-hidden="true"/);
  });

  it("marks a full load before first paint, from an inline script", () => {
    const html = render();
    const script = html.match(/<script>(.*?)<\/script>/)![1];
    expect(script).toContain("data-reveal");
    expect(html.indexOf("<script")).toBeLessThan(html.indexOf("<svg"));
    expect(html.indexOf("<script")).toBeLessThan(html.indexOf("<canvas"));
  });

  it("splits the headline into words for the CSS reveal, text intact", () => {
    const html = render();
    expect(html.match(/<span class="[^"]*word[^"]*"/g)).toHaveLength(8);
    expect(html).not.toMatch(/opacity:\s*0/);
  });

  it("animates the mark's eyes on the hero only", () => {
    expect(render()).toContain("animated");
  });
});
