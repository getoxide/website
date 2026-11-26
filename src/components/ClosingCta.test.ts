import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import releases from "../../e2e/fixtures/releases.json";
import { SNAPSHOT, type Snapshot } from "@/lib/snapshot";
import { ClosingCta } from "./ClosingCta";

const render = (key: keyof typeof releases) =>
  renderToStaticMarkup(
    createElement(ClosingCta, {
      snapshot: {
        ...SNAPSHOT,
        release: releases[key] as Snapshot["release"],
      },
    }),
  );

const textOf = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const allLinks = (html: string) =>
  [...html.matchAll(/<a [^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/g)].map(
    ([, href, inner]) => ({ href, text: textOf(inner) }),
  );
const CONCEPT = "/docs/concepts#";
const links = (html: string) =>
  allLinks(html).filter((l) => !l.href.startsWith(CONCEPT));
const conceptLinks = (html: string) =>
  allLinks(html).filter((l) => l.href.startsWith(CONCEPT));

describe("ClosingCta", () => {
  it("states the heading and the sentence", () => {
    const html = render("stable");
    const heading = html.match(/<h2[^>]*>(.*?)<\/h2>/)![1];
    expect(textOf(heading)).toBe("Open a folder and start a clean shell.");
    const sentence = html.match(/<p[^>]*>(.*?)<\/p>/)![1];
    expect(sentence.replace(/<[^>]+>/g, "")).toBe(
      "Open a Project from the sidebar, run as many plain Terminals as you like, and keep your Files view, Issues and pull requests beside them.",
    );
  });

  it.each(["stable", "prerelease-only", "unresolved"] as const)(
    "reads Download Oxide when there is a release (%s)",
    (key) => {
      expect(links(render(key))).toEqual([
        { href: "/download", text: "Download Oxide" },
        { href: "https://github.com/getoxide/oxide", text: "View on GitHub" },
      ]);
    },
  );

  it("reads Get Oxide while there is no release at all", () => {
    expect(links(render("none"))).toEqual([
      { href: "/download", text: "Get Oxide" },
      { href: "https://github.com/getoxide/oxide", text: "View on GitHub" },
    ]);
  });

  it("links its first mention of Project, Terminal and Files view", () => {
    expect(conceptLinks(render("stable"))).toEqual([
      { href: "/docs/concepts#project", text: "Project" },
      { href: "/docs/concepts#terminal", text: "Terminals" },
      { href: "/docs/concepts#files-view", text: "Files view" },
    ]);
  });

  it("counts View on GitHub as the GitHub CTA", () => {
    expect(render("none")).toMatch(
      /<a [^>]*href="https:\/\/github.com\/getoxide\/oxide"[^>]*data-goatcounter-click="github-cta"/,
    );
  });
});
