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

describe("lintCopy: banned phrases", () => {
  // Copy #18 rule 2, plus the three superlatives of Copy deck rule 2, plus
  // anything saying Oxide writes the code (Copy deck rule 6).
  const BANNED = [
    ["Ship 10x faster", "10x"],
    ["Ship 10× faster", "10x"],
    ["It feels like magic", "magic"],
    ["Command an army of agents", "army of agents"],
    ["The only app you need", "the only"],
    ["Built for agentic engineering", "agentic engineering"],
    ["Like a senior engineer", "senior"],
    ["Write code with Oxide", "write code with Oxide"],
    ["Start to code with Oxide today", "code with Oxide"],
    ["Coding with Oxide is fast", "code with Oxide"],
    ["Oxide writes the code for you", "Oxide writes code"],
    ["The most complete desktop app", "the most complete"],
    ["The best way to review", "the best"],
    ["The main app for agents", "the main app"],
  ];

  for (const [sentence, phrase] of BANNED) {
    it(`fails "${sentence}" (${phrase})`, () => {
      expect(lint("/", html({ main: `<p>${sentence}</p>` }))).toEqual([
        `/: banned phrase "${phrase}" in "${sentence}"`,
      ]);
    });
  }

  it("matches across inline markup and line breaks in the source", () => {
    const main = `<p>The <em>best</em>\n way</p>`;
    expect(lint("/", html({ main }))).toEqual([
      `/: banned phrase "the best" in "The best way"`,
    ]);
  });

  it("allows the near misses the deck allows", () => {
    // "the main branch" (deck rule 2), "complete" in its absolute form, and
    // Oxide driving the agent that writes the code (deck rule 6).
    const main = `<p>Merge into the main branch.</p><p>The complete desktop app for agentic coding.</p><p>Oxide drives the agent; the agent writes the code.</p><p>Seniority is not a word we use, and neither is imagination.</p>`;
    expect(lint("/", html({ main }))).toEqual([]);
  });

  it("ignores scripts, hidden elements and link targets", () => {
    const main = `<a href="/the-best-magic">Docs</a><div hidden>the best</div>`;
    expect(lint("/", html({ main }))).toEqual([]);
  });
});

describe("lintCopy: GUI", () => {
  const gui = `<p>A desktop GUI for agents.</p>`;
  const ruleBroken = (path) =>
    `${path}: "GUI" outside /claude-code-gui, /codex-gui and /faq#what-is-oxide in "A desktop GUI for agents."`;

  it("fails GUI on any other page", () => {
    expect(lint("/changelog", html({ main: gui }))).toEqual([
      ruleBroken("/changelog"),
    ]);
  });

  it("allows GUI on /claude-code-gui and /codex-gui", () => {
    expect(lint("/claude-code-gui", html({ main: gui }))).toEqual([]);
    expect(lint("/codex-gui", html({ main: gui }))).toEqual([]);
  });

  it("allows GUI in the /faq answer to What is Oxide?, and only there", () => {
    const section = (id, body) =>
      `<section aria-labelledby="${id}"><h2 id="${id}">Q</h2>${body}</section>`;
    expect(lint("/faq", html({ main: section("what-is-oxide", gui) }))).toEqual(
      [],
    );
    expect(lint("/faq", html({ main: section("is-it-free", gui) }))).toEqual([
      ruleBroken("/faq"),
    ]);
    expect(
      lint("/changelog", html({ main: section("what-is-oxide", gui) })),
    ).toEqual([ruleBroken("/changelog")]);
  });

  it("fails GUIs and lowercase gui too, but not words that contain it", () => {
    const main = `<p>Two GUIs.</p><p>A gui.</p><p>Guide and guidance.</p>`;
    expect(lint("/", html({ main }))).toHaveLength(2);
  });
});
