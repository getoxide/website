import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { PAGES, SITE_URL } from "./pages";

type WranglerConfig = {
  name?: string;
  compatibility_date?: string;
  assets?: {
    directory?: string;
    html_handling?: string;
    not_found_handling?: string;
  };
  previews?: Record<string, unknown>;
};

function parseJsonc(text: string): unknown {
  const withoutComments = text
    .replace(/^\s*\/\/.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");
  return JSON.parse(withoutComments.replace(/,\s*([}\]])/g, "$1"));
}

const wrangler = parseJsonc(
  readFileSync(new URL("../../wrangler.jsonc", import.meta.url), "utf8"),
) as WranglerConfig;

type RedirectRule = {
  source: string;
  destination: string;
  status: number;
};

function parseRedirects(text: string): RedirectRule[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"))
    .map((line) => {
      const [source, destination, status = "302"] = line.split(/\s+/);
      return { source, destination, status: Number(status) };
    });
}

const redirects = parseRedirects(
  readFileSync(new URL("../../public/_redirects", import.meta.url), "utf8"),
);

describe("Cloudflare Workers config", () => {
  it("serves the static export in out/ with clean URLs and a 404 page", () => {
    expect(wrangler.name).toBe("oxide-website");
    expect(wrangler.assets).toEqual({
      directory: "./out",
      html_handling: "drop-trailing-slash",
      not_found_handling: "404-page",
    });
  });

  it("declares an empty previews block for the per-PR wrangler preview builds", () => {
    expect(wrangler.previews).toEqual({});
  });

  it("targets getoxide.dev as the production SITE_URL", () => {
    expect(new URL(SITE_URL).host).toBe("getoxide.dev");
  });

  it("redirects /docs permanently to /docs/quick-start (ADR-0002)", () => {
    const docs = redirects.filter((r) => r.source === "/docs");
    expect(docs).toEqual([
      { source: "/docs", destination: "/docs/quick-start", status: 308 },
    ]);
  });

  it("every redirect lands on a page of the PAGES registry", () => {
    const paths = new Set<string>(Object.values(PAGES).map((p) => p.path));
    for (const r of redirects) {
      expect(paths.has(r.destination), r.destination).toBe(true);
    }
  });

  it("never shadows a published page with a redirect source", () => {
    const paths = new Set<string>(Object.values(PAGES).map((p) => p.path));
    for (const r of redirects) {
      // A redirect on a registered path would hide a page that exists.
      expect(paths.has(r.source), r.source).toBe(false);
    }
  });
});
