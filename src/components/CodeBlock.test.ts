import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { COPY_SCRIPT } from "@/lib/copy";
import { CodeBlock } from "./CodeBlock";

// The static export is what a visitor without JavaScript gets: the server
// HTML of the Code block (Design system, Code block).
async function staticHtml(code: string, lang?: string) {
  return renderToStaticMarkup(await CodeBlock({ code, lang }));
}

describe("CodeBlock", () => {
  it("ships highlighted markup in the static HTML, with no client runtime", async () => {
    const html = await staticHtml("gh attestation verify file", "sh");
    expect(html).toMatch(/<pre class="shiki/);
    expect(html).toMatch(/var\(--ox-syntax-/);
    expect(html).not.toMatch(/<script[^>]*src=/);
    expect(html).not.toMatch(/_next/);
  });

  it("has no Copy button without JavaScript", async () => {
    const html = await staticHtml("echo hi", "sh");
    expect(html).not.toMatch(/<button/);
    expect(html).not.toMatch(/>Copy</);
  });

  it("carries the inline script that adds Copy once JS runs", async () => {
    const html = await staticHtml("echo hi", "sh");
    expect(html).toContain(COPY_SCRIPT);
    expect(html).toContain("data-copy");
    expect(html).toMatch(/data-copy-class="[^"]*copy[^"]*"/);
    // Inline only: reading pages are stripped of every Next script.
    expect(html.match(/<script/g)).toHaveLength(1);
  });
});
