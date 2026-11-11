import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import releases from "../../e2e/fixtures/releases.json";
import { readmeUrl } from "@/lib/oxide";
import { SNAPSHOT, type Snapshot } from "@/lib/snapshot";
import { DownloadBlock } from "./DownloadBlock";

// Fixture Snapshots in each Release state (Copy deck, `/download` → Buttons).
const snapshotIn = (key: keyof typeof releases): Snapshot => ({
  ...SNAPSHOT,
  release: releases[key] as Snapshot["release"],
});

const render = (key: keyof typeof releases) =>
  renderToStaticMarkup(
    createElement(DownloadBlock, { snapshot: snapshotIn(key) }),
  );

/** Visible text, tags stripped and whitespace collapsed. */
const textOf = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

const links = (html: string) =>
  [...html.matchAll(/<a [^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/g)].map(
    ([, href, inner]) => ({ href, text: textOf(inner) }),
  );

describe("DownloadBlock, no release (`none`)", () => {
  it("offers Follow on GitHub and Build from source, and no download button", () => {
    const html = render("none");
    expect(links(html)).toEqual([
      { href: "https://github.com/getoxide/oxide", text: "Follow on GitHub" },
      {
        href: readmeUrl("build-from-source"),
        text: "Build from source",
      },
    ]);
    expect(textOf(html)).toContain(
      "No release yet. Oxide is pre-release software; follow the repository to hear about the first one.",
    );
    expect(textOf(html)).not.toMatch(/Download/);
  });
});

describe("DownloadBlock, stable release", () => {
  it("links both installers directly, macOS first, with their sublabels", () => {
    const html = render("stable");
    expect(links(html).slice(0, 2)).toEqual([
      {
        href: "https://github.com/getoxide/oxide/releases/download/v1.1.0/Oxide_1.1.0_aarch64.dmg",
        text: "Download for macOS",
      },
      {
        href: "https://github.com/getoxide/oxide/releases/download/v1.1.0/Oxide_1.1.0_x64-setup.exe",
        text: "Download for Windows",
      },
    ]);
    const text = textOf(html);
    expect(text).toContain("Apple Silicon · .dmg · 101.2 MB");
    expect(text).toContain("x64 · installer · 88.8 MB");
  });

  it("states the version and date and links the changelog", () => {
    const html = render("stable");
    expect(textOf(html)).toContain(
      "Version 1.1.0 · 10 December 2026 · Release notes",
    );
    expect(links(html)).toContainEqual({
      href: "/changelog",
      text: "Release notes",
    });
    expect(links(html)).toHaveLength(3);
  });

  it("ties each sublabel to its button", () => {
    const html = render("stable");
    const ids = [...html.matchAll(/aria-describedby="([^"]+)"/g)].map(
      ([, id]) => id,
    );
    expect(new Set(ids).size).toBe(2);
    for (const id of ids) expect(html).toContain(`id="${id}"`);
  });
});
