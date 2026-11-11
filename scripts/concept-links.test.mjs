import { describe, expect, it } from "vitest";
import { checkConceptLinks } from "./concept-links.mjs";

const CONCEPTS = [
  { term: "Turn", id: "turn" },
  { term: "Thread", id: "thread" },
  { term: "Blind review", id: "blind-review" },
];

function html(main) {
  return `<!DOCTYPE html><html><body>
<header><a href="/">Oxide</a><p>Every Turn, every Thread.</p></header>
<main id="main">${main}</main>
<footer><p>Review each Turn.</p></footer>
</body></html>`;
}

const check = (path, main) =>
  checkConceptLinks({ path, html: html(main), concepts: CONCEPTS });

describe("checkConceptLinks", () => {
  it("passes when the first mention of each term links to its Concept", () => {
    const main = `<p>Review each <a href="/docs/concepts#turn">Turn</a>, then the next Turn.</p>
<p>A <a href="/docs/concepts#thread">Thread</a> holds Turns; ask for a <a href="/docs/concepts#blind-review">Blind review</a>.</p>`;
    expect(check("/faq", main)).toEqual([]);
  });

  it("fails an unlinked first mention, even when a later one is linked", () => {
    const main = `<p>Review each Turn.</p><p>Then the next <a href="/docs/concepts#turn">Turn</a>.</p>`;
    expect(check("/faq", main)).toEqual([
      '/faq: the first mention of "Turn" is not a link to /docs/concepts#turn, in "Review each Turn."',
    ]);
  });

  it("fails a first mention that links somewhere else", () => {
    const main = `<p>Open a <a href="/docs/concepts#turn">Thread</a>.</p>`;
    expect(check("/faq", main)).toEqual([
      '/faq: the first mention of "Thread" is not a link to /docs/concepts#thread, in "Open a Thread."',
    ]);
  });

  it("counts plurals and compounds as mentions, and multi-word terms as written", () => {
    const main = `<p>A per-Turn Diff.</p><p>Ask for a Blind review.</p><p>Many Threads.</p>`;
    expect(check("/faq", main)).toEqual([
      expect.stringContaining(
        '"Turn" is not a link to /docs/concepts#turn, in "A per-Turn Diff."',
      ),
      expect.stringContaining(
        '"Thread" is not a link to /docs/concepts#thread, in "Many Threads."',
      ),
      expect.stringContaining('"Blind review"'),
    ]);
  });

  it("ignores lowercase words, other casings and longer words", () => {
    const main = `<p>Take a turn on the thread. A blind Review. Turnover and Threaded.</p>`;
    expect(check("/faq", main)).toEqual([]);
  });

  it("looks only at the main content, outside code", () => {
    const main = `<pre><code>git checkout Turn</code></pre><p>Use <code>Thread</code> here.</p>`;
    expect(check("/faq", main)).toEqual([]);
  });

  it("on /docs/concepts, accepts a term's own heading and in-page links", () => {
    const main = `<section><h2 id="turn">Turn</h2><p>One reply, inside a <a href="#thread">Thread</a>.</p></section>
<section><h2 id="thread">Thread</h2><p>A conversation of Turns.</p></section>`;
    expect(check("/docs/concepts", main)).toEqual([]);
    expect(check("/faq", main)).toEqual([
      '/faq: the first mention of "Turn" is not a link to /docs/concepts#turn, in "Turn"',
      '/faq: the first mention of "Thread" is not a link to /docs/concepts#thread, in "One reply, inside a Thread."',
    ]);
  });
});
