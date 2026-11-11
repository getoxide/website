import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { highlight, SYNTAX_THEME } from "./highlight";
import { definedTokens } from "./tokens";

const BRAND = readFileSync(
  new URL("../../content/oxide/brand/oxide-tokens.css", import.meta.url),
  "utf8",
);

/** The colour a token span carries, by the text it wraps. */
function colourOf(html: string, text: string): string | undefined {
  const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return html.match(
    new RegExp(`<span style="color:([^";]+)[^"]*">\\s*${escaped}\\s*</span>`),
  )?.[1];
}

describe("highlight (Design system, Code block)", () => {
  it("colours tokens with the --ox-syntax-* custom properties", async () => {
    const html = await highlight(
      'const answer = 42; // why\nlet s = "x";',
      "ts",
    );
    expect(colourOf(html, "const")).toBe("var(--ox-syntax-keyword)");
    expect(colourOf(html, "42")).toBe("var(--ox-syntax-number)");
    expect(colourOf(html, "// why")).toBe("var(--ox-syntax-comment)");
    expect(html).toMatch(/var\(--ox-syntax-string\)/);
  });

  it("emits static markup only: no colour literal, no script", async () => {
    const html = await highlight("echo hi | grep h", "sh");
    expect(html).toMatch(/^<pre/);
    expect(html).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(html).not.toMatch(/<script/i);
  });

  it("renders an unknown language as escaped plain text", async () => {
    const html = await highlight("<b>&</b>", "klingon");
    expect(html).toContain("&#x3C;b>&#x26;&#x3C;/b>");
    expect(html).not.toContain("<b>");
  });

  it("uses only --ox-* names the synced brand tokens define", () => {
    const used = JSON.stringify(SYNTAX_THEME).match(/--ox-[\w-]+/g) ?? [];
    expect(used.length).toBeGreaterThan(7);
    const defined = definedTokens(BRAND);
    expect(used.filter((name) => !defined.has(name))).toEqual([]);
    for (const name of [...defined].filter((n) =>
      n.startsWith("--ox-syntax-"),
    )) {
      expect(used, name).toContain(name);
    }
  });
});
