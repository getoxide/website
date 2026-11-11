import { describe, expect, it } from "vitest";
import { lintCopy } from "./copy-lint.mjs";

/** A definition in the Snapshot's shape: Markdown, one paragraph. */
const DEFINITION =
  "Oxide is a free, open-source **desktop app**, built with [Tauri](https://tauri.app). It drives the agent CLIs you already have.";
/** The same definition as the page renders it. */
const RENDERED = `Oxide is a free, open-source <strong>desktop app</strong>, built with <a href="https://tauri.app">Tauri</a>. It drives the agent CLIs you already have.`;

/** An exported page: main content, then the footer with the definition. */
function html({ main = "<h1>Title</h1>", definition = RENDERED } = {}) {
  return `<!DOCTYPE html><html lang="en"><head><title>T</title></head><body>
<header><a href="/">Oxide</a></header>
<main id="main">${main}</main>
<footer><p data-testid="definition">${definition}</p></footer>
<script>self.__next_f.push([1,"anything at all, GUI, the best"])</script>
</body></html>`;
}

const lint = (path, page, definition = DEFINITION) =>
  lintCopy({ path, html: page, definition });

describe("lintCopy: canonical definition", () => {
  it("passes a page that renders the Snapshot's definition verbatim", () => {
    expect(lint("/faq", html())).toEqual([]);
  });

  it("fails a page without the canonical definition", () => {
    const page = html().replace(/<footer>[\s\S]*<\/footer>/, "");
    expect(lint("/faq", page)).toEqual([
      "/faq: the canonical definition from the Snapshot is missing",
    ]);
  });

  it("fails a reworded definition, wherever it is marked", () => {
    const reworded = RENDERED.replace("free, open-source", "free and open");
    const violations = lint("/faq", html({ definition: reworded }));
    expect(violations).toContainEqual(
      expect.stringMatching(
        /^\/faq: a definition differs from the Snapshot's: "Oxide is a free and open/,
      ),
    );
  });

  it("compares with the Snapshot passed in, not a copy of its text", () => {
    const changed = DEFINITION.replace("desktop app", "desktop client");
    expect(lint("/faq", html(), changed)).toContainEqual(
      "/faq: the canonical definition from the Snapshot is missing",
    );
  });
});
