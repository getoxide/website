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

describe("DownloadBlock, only a test pre-release", () => {
  const html = render("prerelease-only");
  const MAC =
    "https://github.com/getoxide/oxide/releases/download/v1.2.0-rc.1/Oxide_1.2.0-rc.1_aarch64.dmg";
  const WIN =
    "https://github.com/getoxide/oxide/releases/download/v1.2.0-rc.1/Oxide_1.2.0-rc.1_x64-setup.exe";

  it("labels the primary button as the test pre-release, the other with its platform", () => {
    const [mac, win] = links(html);
    expect(mac.href).toBe(MAC);
    expect(win.href).toBe(WIN);
    // Each button carries both labels; CSS shows the one for its role
    // (primary or secondary) once the platform is known.
    for (const link of [mac, win]) {
      expect(link.text).toContain("Download test pre-release 1.2.0-rc.1");
    }
    expect(mac.text).toContain("Download for macOS");
    expect(win.text).toContain("Download for Windows");
    expect(textOf(html)).toContain("Apple Silicon · .dmg · 102.3 MB");
    expect(textOf(html)).toContain("x64 · installer · 89.9 MB");
  });

  it("warns that it never reaches the updater and links build from source", () => {
    expect(textOf(html)).toContain(
      "This is a test pre-release: it never reaches the in-app updater. Build from source for the latest code.",
    );
    expect(links(html)[3]).toEqual({
      href: readmeUrl("build-from-source"),
      text: "Build from source",
    });
    expect(textOf(html)).not.toMatch(/Version|Release notes/);
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
    expect(links(html)).toHaveLength(4);
  });

  it("carries the ghost GitHub button beside the installers", () => {
    expect(links(render("stable"))).toContainEqual({
      href: "https://github.com/getoxide/oxide",
      text: "View on GitHub",
    });
    expect(links(render("prerelease-only"))).toContainEqual({
      href: "https://github.com/getoxide/oxide",
      text: "View on GitHub",
    });
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

describe("DownloadBlock, an installer that could not be resolved", () => {
  it("links the GitHub release page instead, with no size", () => {
    const html = render("unresolved");
    const [mac, win] = links(html);
    expect(mac.href).toBe(
      "https://github.com/getoxide/oxide/releases/download/v1.1.0/Oxide_1.1.0_aarch64.dmg",
    );
    expect(win).toEqual({
      href: "https://github.com/getoxide/oxide/releases/tag/v1.1.0",
      text: "Download for Windows",
    });
    const text = textOf(html);
    expect(text).toContain("x64 · installer");
    expect(text).not.toContain("x64 · installer ·");
    expect(text).not.toMatch(/null|undefined/);
  });
});

describe("DownloadBlock, click events (Measurement plan #16)", () => {
  const eventsOf = (html: string) =>
    [...html.matchAll(/data-goatcounter-click="([^"]+)"/g)].map(([, e]) => e);

  it("names each download button's event, macOS first", () => {
    expect(eventsOf(render("stable"))).toEqual([
      "download-macos-arm",
      "download-windows",
      "github-cta",
    ]);
    expect(eventsOf(render("prerelease-only"))).toEqual([
      "download-macos-arm",
      "download-windows",
      "github-cta",
    ]);
  });

  it("counts Follow on GitHub as the GitHub CTA", () => {
    expect(eventsOf(render("none"))).toEqual(["github-cta"]);
  });
});
