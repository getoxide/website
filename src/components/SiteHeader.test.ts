import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import releases from "../../e2e/fixtures/releases.json";
import { OS_SCRIPT } from "@/lib/os";
import { SNAPSHOT, type Snapshot } from "@/lib/snapshot";
import { SiteHeader } from "./SiteHeader";

const render = (path: string, release?: keyof typeof releases) =>
  renderToStaticMarkup(
    createElement(SiteHeader, {
      path,
      snapshot: release
        ? { ...SNAPSHOT, release: releases[release] as Snapshot["release"] }
        : SNAPSHOT,
    }),
  );

const eventsOf = (html: string) =>
  [...html.matchAll(/data-goatcounter-click="([^"]+)"/g)].map(([, e]) => e);

const textOf = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

describe("SiteHeader measurement", () => {
  const html = renderToStaticMarkup(createElement(SiteHeader, { path: "/" }));

  it("counts the GitHub link as github-cta", () => {
    expect(html).toMatch(
      /<a [^>]*href="https:\/\/github.com\/getoxide\/oxide"[^>]*data-goatcounter-click="github-cta"/,
    );
  });

  it("carries no other click event", () => {
    expect(eventsOf(render("/", "prerelease-only"))).toEqual(["github-cta"]);
  });
});

describe("SiteHeader OS detection", () => {
  it("runs the inline script before any link, in every Release state", () => {
    for (const state of ["stable", "prerelease-only", "none"] as const) {
      const html = render("/privacy", state);
      const script = html.indexOf(`<script>${OS_SCRIPT}</script>`);
      expect(script, state).toBeGreaterThan(-1);
      expect(script, state).toBeLessThan(html.indexOf("<a "));
    }
  });
});

describe("SiteHeader Download button", () => {
  for (const state of ["prerelease-only", "none"] as const) {
    it(`${state}: links to /download, with no menu`, () => {
      const html = render("/privacy", state);
      expect(html).toMatch(/<a [^>]*href="\/download"[^>]*>Download<\/a>/);
      expect(html).not.toContain("releases/");
      expect(html.match(/<details/g)).toHaveLength(1);
    });
  }

  describe("stable: a <details> menu of direct downloads", () => {
    const html = render("/privacy", "stable");
    const menu = html.slice(
      html.indexOf("<details"),
      html.indexOf("</details>"),
    );

    it("opens from a Download summary, grouped with the small-screen menu", () => {
      expect(menu).toMatch(/^<details [^>]*name="site-header"/);
      expect(menu).toMatch(/<summary [^>]*>Download<svg/);
      expect(html.match(/name="site-header"/g)).toHaveLength(2);
    });

    it("lists macOS, Windows and Linux as direct downloads, then GitHub and /download", () => {
      const links = [...menu.matchAll(/<a [^>]*href="([^"]+)"/g)].map(
        ([, href]) => href,
      );
      expect(links).toEqual([
        "https://github.com/getoxide/oxide/releases/latest/download/Oxide.dmg",
        "https://github.com/getoxide/oxide/releases/latest/download/Oxide-x64.exe",
        "https://github.com/getoxide/oxide/releases/latest/download/Oxide-x64.AppImage",
        "https://github.com/getoxide/oxide",
        "/download",
      ]);
      const text = textOf(menu);
      for (const part of [
        "macOS Apple Silicon · .dmg · 101.2 MB",
        "Windows x64 · installer · 88.8 MB",
        "Linux x64 · AppImage · 94.3 MB",
        "GitHub",
        "All downloads",
      ]) {
        expect(text).toContain(part);
      }
    });

    it("counts each download with the Measurement plan's events", () => {
      expect(eventsOf(menu)).toEqual([
        "download-macos-arm",
        "download-windows",
        "download-linux",
        "github-cta",
      ]);
    });

    it("marks /download as the current page there", () => {
      const onDownload = render("/download", "stable");
      expect(onDownload).toMatch(
        /<a [^>]*href="\/download" aria-current="page"/,
      );
      expect(onDownload).toMatch(/<summary [^>]*data-current=""/);
    });
  });
});
