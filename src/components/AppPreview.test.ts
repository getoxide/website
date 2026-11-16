import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  BEAT_MS,
  BEATS,
  FINAL_BEAT,
  PREVIEW,
  PREVIEW_PROVIDERS,
} from "@/content/app-preview";
import { AppPreview } from "./AppPreview";

const render = (provider?: "claude" | "codex" | "antigravity") =>
  renderToStaticMarkup(createElement(AppPreview, { provider }));

const text = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x27;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

// Design system, App preview.
describe("AppPreview", () => {
  it("is one image to assistive tech, named like a Capture's alt", () => {
    const html = render();
    expect(html).toMatch(
      /role="img" aria-label="Oxide running a Claude Code Thread[^"]*"/,
    );
    expect(html).toContain('aria-hidden="true"');
  });

  it("is marked as product UI, so the copy gates skip it", () => {
    expect(render()).toContain('data-capture=""');
  });

  it("renders the finished scene in the HTML, nothing hidden inline", () => {
    const html = render();
    expect(text(html)).toContain(PREVIEW.prompt);
    expect(text(html)).toContain(PREVIEW.answer);
    expect(text(html)).toContain(`${PREVIEW.pr.number} · ${PREVIEW.pr.merged}`);
    expect(html).not.toMatch(/opacity:\s*0/);
  });

  it("renders no pause button on the server: it comes with motion", () => {
    expect(render()).not.toContain("<button");
  });

  it("runs the Provider it is given", () => {
    expect(text(render("codex"))).toContain(PREVIEW_PROVIDERS.codex.model);
    expect(render("antigravity")).toContain(
      'aria-label="Oxide running a Antigravity CLI Thread',
    );
  });

  it("holds one duration per beat, the last beat being the finished scene", () => {
    expect(BEAT_MS).toHaveLength(Object.keys(BEATS).length);
    expect(FINAL_BEAT).toBe(Math.max(...Object.values(BEATS)));
  });
});
