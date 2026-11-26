import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Markdown } from "@/components/Markdown";
import { checkConceptLinks } from "../../scripts/concept-links.mjs";
import { seenBefore } from "./concept-links";
import { SNAPSHOT } from "./snapshot";

function page(sources: string[]) {
  const seen = seenBefore(sources);
  const body = sources
    .map((source, i) =>
      renderToStaticMarkup(
        createElement(Markdown, { source, conceptLinks: seen[i] }),
      ),
    )
    .join("");
  return `<html><body><main>${body}</main></body></html>`;
}

const gate = (html: string) =>
  checkConceptLinks({ path: "/faq", html, concepts: SNAPSHOT.concepts });

describe("Concept links in derived Markdown", () => {
  it("links the first mention of each term, and only the first", () => {
    const html = page([
      "Open a Project and start a Terminal, then another Terminal.",
      "Each **Project** holds **Terminals** and a Surface.",
    ]);
    expect(gate(html)).toEqual([]);
    expect(html.match(/<a /g)).toHaveLength(3);
    expect(html).toContain('<a href="/docs/concepts#project">Project</a>');
    expect(html).toContain('<a href="/docs/concepts#terminal">Terminal</a>');
    expect(html).toContain('<a href="/docs/concepts#surface">Surface</a>');
  });

  it("links plurals, compounds, table cells and multi-word terms", () => {
    const html = page([
      "| Project | Command |\n| --- | --- |\n| acme | `pnpm test` |",
      "A per-Terminal Command block, the Files view and Code workspace, with Session restore.",
    ]);
    expect(gate(html)).toEqual([]);
    expect(html).toContain('<th><a href="/docs/concepts#project">Project');
    expect(html).toContain(
      'per-<a href="/docs/concepts#terminal">Terminal</a>',
    );
  });

  it("leaves code, lowercase words and existing links alone", () => {
    const html = page([
      "Run `Terminal` and open a terminal; see [the Project docs](https://example.com).",
    ]);
    expect(html).not.toContain("/docs/concepts");
    expect(gate(html)).toEqual([
      expect.stringContaining('"Project" is not a link'),
    ]);
  });

  it("renders no links without the option", () => {
    const html = renderToStaticMarkup(
      createElement(Markdown, { source: "Open a Project." }),
    );
    expect(html).toBe("<p>Open a Project.</p>");
  });
});
