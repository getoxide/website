import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SNAPSHOT } from "@/lib/snapshot";
import { DefinitionLine } from "./DefinitionLine";

const html = renderToStaticMarkup(createElement(DefinitionLine));
const text = (h: string) =>
  h
    .replace(/<[^>]+>/g, "")
    .replace(/&#x27;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

// Copy deck, Home → below the hero: the definition, then the trust line.
describe("DefinitionLine", () => {
  it("states the canonical definition from the Snapshot, marked as the definition", () => {
    const definition = html.match(
      /<p[^>]*data-testid="definition"[^>]*>(.*?)<\/p>/,
    )![1];
    const plain = SNAPSHOT.readme.definition
      .replace(/\*\*/g, "")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
    expect(text(definition)).toBe(plain);
  });

  it("follows it with the trust line", () => {
    expect(html.indexOf("Free and open source (MIT)")).toBeGreaterThan(
      html.indexOf('data-testid="definition"'),
    );
    expect(text(html)).toContain(
      "Free and open source (MIT) · Local · No account · No telemetry",
    );
  });
});
