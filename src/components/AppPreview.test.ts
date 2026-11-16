import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  PREVIEW,
  PREVIEW_PROVIDERS,
  PREVIEW_THREADS,
} from "@/content/app-preview";
import { AppPreview } from "./AppPreview";

const render = (provider?: "claude" | "codex" | "antigravity") =>
  renderToStaticMarkup(createElement(AppPreview, { provider }));

const text = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

// Design system, App preview; ADR-0004.
describe("AppPreview", () => {
  it("is a named group of real controls", () => {
    const html = render();
    expect(html).toMatch(
      /<figure[^>]*role="group"[^>]*aria-label="Interactive preview of Oxide with Claude Code"/,
    );
    expect(html.match(/<button/g)!.length).toBeGreaterThan(10);
    expect(html).toContain("<input");
  });

  it("is marked as product UI, so the copy gates skip it", () => {
    expect(render()).toContain('data-capture=""');
  });

  it("starts on the hero Capture's Thread, finished and ready to push", () => {
    const t = text(render());
    const [first] = PREVIEW_THREADS;
    expect(t).toContain(first.prompt);
    expect(t).toContain(first.answer!.text);
    expect(t).toContain(PREVIEW.commit);
    expect(t).not.toContain(PREVIEW.merged);
  });

  it("lists every Thread as a button", () => {
    const html = render();
    for (const thread of PREVIEW_THREADS) {
      expect(html).toMatch(
        new RegExp(`<button[^>]*>.*?${thread.title}.*?</button>`),
      );
    }
  });

  it("says under the frame that it can be explored", () => {
    expect(render()).toMatch(/<figcaption[^>]*>Interactive preview:/);
  });

  it("runs the Provider it is given, and hides nothing inline", () => {
    const html = render("codex");
    expect(text(html)).toContain(PREVIEW_PROVIDERS.codex.model);
    expect(html).not.toMatch(/opacity:\s*0/);
  });
});
