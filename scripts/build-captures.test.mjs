import { mkdtempSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { buildCaptures } from "./build-captures.mjs";

async function workspace(sources) {
  const dir = mkdtempSync(join(tmpdir(), "captures-"));
  const sourceDir = join(dir, "assets");
  const outDir = join(dir, "out");
  const { mkdirSync } = await import("node:fs");
  mkdirSync(sourceDir);
  for (const [name, width] of Object.entries(sources)) {
    const png = await sharp({
      create: {
        width,
        height: Math.round(width / 2),
        channels: 3,
        background: "#444",
      },
    })
      .png()
      .toBuffer();
    writeFileSync(join(sourceDir, name), png);
  }
  return { sourceDir, outDir };
}

const slots = {
  hero: { kind: "image", alt: "Hero" },
  later: { kind: "image", alt: "Later" },
};

describe("buildCaptures", () => {
  it("writes AVIF and WebP at every width the source can fill, and a manifest", async () => {
    const dir = await workspace({ "hero.png": 1500 });
    const result = await buildCaptures({ ...dir, slots });
    for (const w of [640, 960, 1280]) {
      for (const ext of ["avif", "webp"]) {
        expect(existsSync(join(dir.outDir, `hero-${w}.${ext}`))).toBe(true);
      }
    }
    expect(existsSync(join(dir.outDir, "hero-1920.avif"))).toBe(false);
    const manifest = JSON.parse(
      readFileSync(join(dir.outDir, "manifest.json"), "utf8"),
    );
    expect(manifest.hero).toEqual({
      kind: "image",
      width: 1500,
      height: 750,
      widths: [640, 960, 1280],
    });
    expect(result.violations).toEqual([]);
  });

  it("lists a slot with no source as empty and leaves it out of the manifest", async () => {
    const dir = await workspace({ "hero.png": 800 });
    const result = await buildCaptures({ ...dir, slots });
    expect(result.empty).toEqual(["later"]);
    const manifest = JSON.parse(
      readFileSync(join(dir.outDir, "manifest.json"), "utf8"),
    );
    expect(Object.keys(manifest)).toEqual(["hero"]);
  });

  it("reports a variant over its ceiling", async () => {
    const dir = await workspace({ "hero.png": 1500 });
    const result = await buildCaptures({
      ...dir,
      slots: {
        hero: {
          kind: "image",
          alt: "Hero",
          ceiling: { width: 1280, bytes: 1 },
        },
      },
    });
    expect(result.violations).toHaveLength(2);
    expect(result.violations[0]).toMatch(/hero-1280\.avif.*> /);
  });
});
