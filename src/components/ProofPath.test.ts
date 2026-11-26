import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SNAPSHOT, type Snapshot } from "@/lib/snapshot";
import { ProofPath } from "./ProofPath";

const render = (snapshot: Snapshot = SNAPSHOT) =>
  renderToStaticMarkup(createElement(ProofPath, { snapshot }));
const text = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const headings = (html: string) =>
  [...html.matchAll(/<h3[^>]*>(.*?)<\/h3>/g)].map(([, h]) => text(h));
const links = (html: string) =>
  [...html.matchAll(/<a [^>]*href="(\/features[^"]*)"[^>]*>/g)].map(
    ([tag, href]) => ({
      href,
      name: tag.match(/aria-label="([^"]*)"/)?.[1],
    }),
  );

describe("ProofPath", () => {
  it("is headed From Project to pull request", () => {
    const html = render();
    expect(html).toMatch(
      /<h2[^>]*id="proof-path"[^>]*>From .*?Project.*? to pull request<\/h2>/,
    );
    expect(html).toContain('aria-labelledby="proof-path"');
  });

  it("renders all four steps, in order", () => {
    const html = render();
    expect(headings(html)).toEqual(["Projects", "Terminals", "Code", "GitHub"]);
    expect(html).toContain("<ol");
  });

  it("ends each step with a Learn more link whose name includes the heading", () => {
    expect(links(render())).toEqual([
      { href: "/features#open-projects", name: "Learn more about Projects" },
      { href: "/features#many-terminals", name: "Learn more about Terminals" },
      { href: "/features#files", name: "Learn more about Code" },
      { href: "/features#pull-requests", name: "Learn more about GitHub" },
    ]);
    expect(text(render())).toContain("Learn more");
  });

  it("links the first mention of each Concepts term, once", () => {
    const html = render();
    for (const term of [
      "Project",
      "Command block",
      "Session restore",
      "Files view",
      "Code workspace",
    ]) {
      const hits = [
        ...html.matchAll(
          new RegExp(`href="/docs/concepts#[^"]+"[^>]*>${term}s?</a>`, "g"),
        ),
      ];
      expect(hits, term).toHaveLength(1);
    }
  });

  it("skips terms the page already linked", () => {
    const html = renderToStaticMarkup(
      createElement(ProofPath, {
        snapshot: SNAPSHOT,
        seen: new Set(["Project"]),
      }),
    );
    expect(html).not.toMatch(/>Project<\/a>/);
  });

  it("never ships a hidden start state in the HTML", () => {
    const html = render();
    expect(html).not.toMatch(/opacity\s*:\s*0/);
    expect(html).not.toMatch(/\shidden[\s=>]/);
  });
});
