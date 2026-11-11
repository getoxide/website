// `pnpm og:card`: the one site-wide share card (Social and share assets #23,
// resolution). Playwright renders a still of the site's own shader (t = 6 s,
// the reduced-motion frame), the shared Braces mark and the frozen hero lines
// in the real self-hosted fonts, then writes `public/og.png` (committed) and
// `assets/og-card.json` (its input hash and PNG hash). The staleness test
// recomputes the hash, so changing the hero, the shader, the mark or a font
// without regenerating the card fails `pnpm test`.
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { COPY } from "../src/content/copy.ts";
import { PAGES } from "../src/content/pages.ts";
import {
  SHADER_FRAGMENT,
  SHADER_VERTEX,
  STILL_T,
} from "../src/lib/hero-shader.ts";
import { MARK_BRACES, MARK_EYES, MARK_VIEWBOX } from "../src/lib/mark.ts";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
export const OG_CARD_WIDTH = 1200;
export const OG_CARD_HEIGHT = 630;
export const OG_IMAGE = join(ROOT, "public/og.png");
export const OG_MANIFEST = join(ROOT, "assets/og-card.json");

/** Every file whose bytes the card's look depends on. */
export const OG_CARD_INPUTS = [
  "src/lib/hero-shader.ts",
  "src/lib/mark.ts",
  "content/oxide/brand/oxide-tokens.css",
  "src/fonts/space-grotesk-latin-wght-normal.woff2",
  "src/fonts/inter-latin-wght-normal.woff2",
  "scripts/og-card.mjs",
];

const sha256 = (data) => createHash("sha256").update(data).digest("hex");

/** The hash a fresh card must carry: the two lines plus every input file. */
export function ogCardHash() {
  const hash = createHash("sha256");
  hash.update(`headline\0${PAGES.home.h1}\0`);
  hash.update(`subline\0${COPY.hero.subheadline}\0`);
  for (const input of OG_CARD_INPUTS) {
    hash.update(`input\0${input}\0`);
    hash.update(readFileSync(join(ROOT, input)));
    hash.update("\0");
  }
  return hash.digest("hex");
}

const escapeHtml = (text) =>
  text.replace(
    /[&<>"]/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char],
  );

const fontFace = (family, file, weight) => {
  const data = readFileSync(join(ROOT, file)).toString("base64");
  return `@font-face{font-family:"${family}";src:url(data:font/woff2;base64,${data}) format("woff2");font-weight:${weight};font-display:block;}`;
};

const markSvg = () => `
<svg class="mark" viewBox="${MARK_VIEWBOX}" width="150" height="150" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="card-mark-ink" gradientUnits="userSpaceOnUse" x1="512" y1="260" x2="512" y2="764">
      <stop offset="0" stop-color="var(--ox-text)"/>
      <stop offset="1" stop-color="var(--ox-text-disabled)"/>
    </linearGradient>
  </defs>
  <g fill="none" stroke-linecap="round">
    <g stroke="url(#card-mark-ink)" stroke-width="62">${MARK_BRACES.map(
      (d) => `<path d="${d}"/>`,
    ).join("")}</g>
    <g stroke="currentColor" stroke-width="48">${MARK_EYES.map(
      (d) => `<path d="${d}"/>`,
    ).join("")}</g>
  </g>
</svg>`;

/** The full 1200×630 document the browser screenshots. */
export function cardHtml() {
  const tokens = readFileSync(
    join(ROOT, "content/oxide/brand/oxide-tokens.css"),
    "utf8",
  );
  const fonts = [
    fontFace(
      "Space Grotesk",
      "src/fonts/space-grotesk-latin-wght-normal.woff2",
      "300 700",
    ),
    fontFace("Inter", "src/fonts/inter-latin-wght-normal.woff2", "100 900"),
  ].join("\n");

  const shader = `
const VERT = ${JSON.stringify(SHADER_VERTEX)};
const FRAG = ${JSON.stringify(SHADER_FRAGMENT)};
const STILL_T = ${STILL_T};
const WIDTH = ${OG_CARD_WIDTH};
const HEIGHT = ${OG_CARD_HEIGHT};
(async () => {
  try {
    await Promise.all([
      document.fonts.load('500 78px "Space Grotesk"'),
      document.fonts.load('400 28px "Inter"'),
      document.fonts.ready,
    ]);
    if (!document.fonts.check('500 78px "Space Grotesk"') ||
        !document.fonts.check('400 28px "Inter"')) {
      throw new Error("the card fonts did not load");
    }
    const canvas = document.getElementById("shader");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    const gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: false,
      preserveDrawingBuffer: true,
      powerPreference: "low-power",
    });
    if (!gl) throw new Error("WebGL is unavailable");
    const compile = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader) || "shader compile failed");
      }
      return shader;
    };
    const program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) || "program link failed");
    }
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const a = gl.getAttribLocation(program, "a");
    gl.enableVertexAttribArray(a);
    gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
    gl.viewport(0, 0, WIDTH, HEIGHT);
    gl.uniform2f(gl.getUniformLocation(program, "u_res"), WIDTH, HEIGHT);
    gl.uniform1f(gl.getUniformLocation(program, "u_time"), STILL_T);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );
    window.__cardReady = true;
  } catch (error) {
    window.__cardError = String((error && error.stack) || error);
  }
})();`;

  return `<!doctype html>
<html><head><meta charset="utf-8"><style>
${tokens}
${fonts}
html,body{margin:0;padding:0;width:${OG_CARD_WIDTH}px;height:${OG_CARD_HEIGHT}px;overflow:hidden;background:var(--ox-background);}
.card{position:relative;width:${OG_CARD_WIDTH}px;height:${OG_CARD_HEIGHT}px;overflow:hidden;color:var(--ox-text);}
.shader{position:absolute;inset:0;width:${OG_CARD_WIDTH}px;height:${OG_CARD_HEIGHT}px;display:block;}
.inner{position:absolute;inset:0;display:grid;place-content:center;justify-items:center;gap:36px;text-align:center;}
.mark{display:block;color:var(--ox-text);}
h1{margin:0;font-family:var(--ox-font-web-heading);font-weight:500;font-size:78px;line-height:1.04;letter-spacing:-0.03em;color:var(--ox-text-bright);max-width:13em;text-wrap:balance;}
p{margin:-12px 0 0;font-family:var(--ox-font-web-body);font-weight:400;font-size:28px;line-height:1.35;color:var(--ox-text-muted);max-width:34em;text-wrap:balance;}
</style></head>
<body><div class="card">
<canvas class="shader" id="shader" aria-hidden="true"></canvas>
<div class="inner">
${markSvg()}
<h1>${escapeHtml(PAGES.home.h1)}</h1>
<p>${escapeHtml(COPY.hero.subheadline)}</p>
</div>
</div>
<script>${shader}</script>
</body></html>`;
}

async function renderCard() {
  const { chromium } = await import("@playwright/test");
  const browser = await chromium.launch({
    args: ["--enable-unsafe-swiftshader"],
  });
  try {
    const page = await browser.newPage({
      viewport: { width: OG_CARD_WIDTH, height: OG_CARD_HEIGHT },
      deviceScaleFactor: 1,
    });
    await page.setContent(cardHtml(), { waitUntil: "load" });
    await page.waitForFunction(
      () => window.__cardReady === true || Boolean(window.__cardError),
      undefined,
      { timeout: 30_000 },
    );
    const error = await page.evaluate(() => window.__cardError);
    if (error) throw new Error(error);
    return await page.screenshot({ type: "png" });
  } finally {
    await browser.close();
  }
}

async function main() {
  const png = await renderCard();
  mkdirSync(join(ROOT, "public"), { recursive: true });
  writeFileSync(OG_IMAGE, png);
  const manifest = {
    output: "public/og.png",
    width: OG_CARD_WIDTH,
    height: OG_CARD_HEIGHT,
    headline: PAGES.home.h1,
    subline: COPY.hero.subheadline,
    inputs: OG_CARD_INPUTS,
    hash: ogCardHash(),
    cardSha256: sha256(png),
    generatedBy: "pnpm og:card (scripts/og-card.mjs)",
  };
  writeFileSync(OG_MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(
    `Share card written: public/og.png (${png.length} bytes), assets/og-card.json`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
