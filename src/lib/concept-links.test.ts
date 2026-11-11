import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Markdown } from "@/components/Markdown";
// The gate this module exists to satisfy (Content #12 addendum, point 4).
import { checkConceptLinks } from "../../scripts/concept-links.mjs";
import { seenBefore } from "./concept-links";
import { SNAPSHOT } from "./snapshot";

/** Derived Markdown rendered as a page's main content, linking Concepts. */
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
      "Review each Turn of the Thread, then the next Turn.",
      "A Thread holds **Turns** and a Checkpoint per Turn.",
    ]);
    expect(gate(html)).toEqual([]);
    expect(html.match(/<a /g)).toHaveLength(3);
    expect(html).toContain('<a href="/docs/concepts#turn">Turn</a>');
    expect(html).toContain('<a href="/docs/concepts#thread">Thread</a>');
    expect(html).toContain(
      '<a href="/docs/concepts#checkpoint">Checkpoint</a>',
    );
  });

  it("links plurals, compounds, table cells and multi-word terms", () => {
    const html = page([
      "| Provider | Command |\n| --- | --- |\n| Claude Code | `claude` |",
      "A per-Turn Diff, the Verification Dossier and Blind review, then Restore.",
    ]);
    expect(gate(html)).toEqual([]);
    expect(html).toContain('<th><a href="/docs/concepts#provider">Provider');
    expect(html).toContain('per-<a href="/docs/concepts#turn">Turn</a> Diff');
  });

  it("leaves code, lowercase words and existing links alone", () => {
    const html = page([
      "Run `Turn` and take a turn; see [the Thread docs](https://example.com).",
    ]);
    expect(html).not.toContain("/docs/concepts");
    // A first mention inside someone else's link is the author's to fix.
    expect(gate(html)).toEqual([
      expect.stringContaining('"Thread" is not a link'),
    ]);
  });

  it("renders no links without the option", () => {
    const html = renderToStaticMarkup(
      createElement(Markdown, { source: "Review each Turn." }),
    );
    expect(html).toBe("<p>Review each Turn.</p>");
  });
});
