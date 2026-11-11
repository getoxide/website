import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CodeBlock } from "./CodeBlock";

// The static export is what a visitor without JavaScript gets: the server
// HTML of the Code block (Design system, Code block).
async function staticHtml(code: string, lang?: string) {
  return renderToStaticMarkup(await CodeBlock({ code, lang }));
}

describe("CodeBlock", () => {
  it("ships highlighted markup in the static HTML, with no script", async () => {
    const html = await staticHtml("gh attestation verify file", "sh");
    expect(html).toMatch(/<pre class="shiki/);
    expect(html).toMatch(/var\(--ox-syntax-/);
    expect(html).not.toMatch(/<script/i);
  });

  it("has no Copy button without JavaScript", async () => {
    const html = await staticHtml("echo hi", "sh");
    expect(html).not.toMatch(/<button/);
    expect(html).not.toMatch(/Copy/);
  });
});
