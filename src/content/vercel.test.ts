import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { PAGES, SITE_URL } from "./pages";

type Condition = { type: string; key?: string; value?: string };
type HeaderRule = {
  source: string;
  has?: Condition[];
  missing?: Condition[];
  headers: { key: string; value: string }[];
};

const vercel = JSON.parse(
  readFileSync(new URL("../../vercel.json", import.meta.url), "utf8"),
) as { headers?: HeaderRule[]; redirects?: unknown[] };

describe("vercel.json", () => {
  it("answers X-Robots-Tag: noindex on every host but production", () => {
    const rules = (vercel.headers ?? []).filter((r) =>
      r.headers.some(
        (h) => h.key.toLowerCase() === "x-robots-tag" && h.value === "noindex",
      ),
    );
    expect(rules).toHaveLength(1);
    const [rule] = rules;
    // Every path, including the 404 and static assets.
    expect(rule.source).toBe("/(.*)");
    expect(rule.has ?? []).toEqual([]);
    expect(rule.missing).toEqual([
      { type: "host", value: "oxide.cavallinilorenzo.com" },
    ]);
    expect(new URL(SITE_URL).host).toBe("oxide.cavallinilorenzo.com");
  });

  it("redirects /docs permanently to /docs/quick-start (ADR-0002)", () => {
    const redirects = (vercel.redirects ?? []) as {
      source: string;
      destination: string;
      permanent?: boolean;
      statusCode?: number;
    }[];
    const docs = redirects.filter((r) => r.source === "/docs");
    expect(docs).toEqual([
      { source: "/docs", destination: "/docs/quick-start", permanent: true },
    ]);
  });

  it("every redirect lands on a page of the PAGES registry", () => {
    const paths = new Set<string>(Object.values(PAGES).map((p) => p.path));
    for (const r of (vercel.redirects ?? []) as { destination: string }[]) {
      expect(paths.has(r.destination), r.destination).toBe(true);
    }
  });

  it("sends no other X-Robots-Tag rule that could reach production", () => {
    const all = (vercel.headers ?? []).flatMap((r) => r.headers);
    expect(
      all.filter((h) => h.key.toLowerCase() === "x-robots-tag"),
    ).toHaveLength(1);
  });
});
