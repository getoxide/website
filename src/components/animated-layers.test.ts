import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Budgets, Shader rule 3: no `mix-blend-mode` or `backdrop-filter` on or over
// an animated layer. The animated layers of the home hero are the shader
// canvas, the mark and the headline words; over them sit the hero, the
// transparent header and the capture. ESLint enforces the same on the TSX
// (`no-restricted-syntax` in eslint.config.mjs); CSS is checked here.
const ANIMATED = [
  "src/components/HeroMotion.module.css",
  "src/components/Hero.module.css",
  "src/components/OxideMark.module.css",
  "src/components/SiteHeader.module.css",
  "src/components/Capture.module.css",
  "src/components/HeroMotion.tsx",
  "src/components/Hero.tsx",
  "src/components/OxideMark.tsx",
  "src/lib/hero-shader.ts",
];

const FORBIDDEN = /mix-blend-mode|backdrop-filter|mixBlendMode|backdropFilter/i;

const strip = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

describe("animated layers", () => {
  it.each(ANIMATED)("%s has no blend mode or backdrop filter", (file) => {
    expect(strip(readFileSync(file, "utf8"))).not.toMatch(FORBIDDEN);
  });

  it("covers the CSS of every component the hero renders", () => {
    const hero = readFileSync("src/components/Hero.tsx", "utf8");
    for (const [, name] of hero.matchAll(/from "\.\/(\w+)";/g)) {
      if (["Button", "Capture"].includes(name)) continue;
      expect(ANIMATED.join()).toContain(name);
    }
  });
});
