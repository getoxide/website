// `pnpm build:captures`: the capture pipeline (docs/spec/budgets.md, Product
// captures). Reads the source PNGs of `assets/captures/`, writes AVIF and WebP
// at 640, 960, 1280, 1920 and 2560 px (never above the source) and a manifest
// with the dimensions into `public/captures/`. The output is not committed.
// A video slot also copies its MP4s (`<slot>.av1.mp4` first, then
// `<slot>.mp4`), the PNG being its poster. A slot with no source file is left
// out of the manifest, so it renders nothing, and is listed here.
import { copyFileSync, existsSync, mkdirSync, rmSync, statSync } from "node:fs";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import {
  CAPTURE_FORMATS,
  CAPTURES_URL,
  widthsFor,
} from "../src/lib/captures.ts";

const kb = (bytes) => `${(bytes / 1000).toFixed(1)} kB`;

/**
 * @param {{
 *   sourceDir: string,
 *   outDir: string,
 *   slots: Record<string, { kind: "image" | "video", quality?: number, ceiling?: { width: number, bytes: number } }>
 * }} options
 * @returns {Promise<{ manifest: object, empty: string[], violations: string[] }>}
 */
export async function buildCaptures({ sourceDir, outDir, slots }) {
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  const manifest = {};
  const empty = [];
  const violations = [];

  for (const [slot, config] of Object.entries(slots)) {
    const png = join(sourceDir, `${slot}.png`);
    const videos = [
      ["av1.mp4", 'video/mp4; codecs="av01.0.08M.08"'],
      ["mp4", "video/mp4"],
    ]
      .map(([ext, type]) => ({
        ext,
        type,
        file: join(sourceDir, `${slot}.${ext}`),
      }))
      .filter((v) => existsSync(v.file));
    if (!existsSync(png) || (config.kind === "video" && videos.length === 0)) {
      empty.push(slot);
      continue;
    }

    const { width, height } = await sharp(png).metadata();
    const widths = widthsFor(width);
    for (const w of widths) {
      const resized = () => sharp(png).resize({ width: w });
      await resized()
        .avif({ quality: config.quality ?? 60, effort: 6 })
        .toFile(join(outDir, `${slot}-${w}.avif`));
      await resized()
        .webp({ quality: 78 })
        .toFile(join(outDir, `${slot}-${w}.webp`));
    }
    const entry = { kind: config.kind, width, height, widths };
    if (config.kind === "video") {
      entry.sources = videos.map((v) => {
        const name = `${slot}.${v.ext}`;
        copyFileSync(v.file, join(outDir, name));
        return { src: `${CAPTURES_URL}/${name}`, type: v.type };
      });
    }
    manifest[slot] = entry;

    const { ceiling } = config;
    if (ceiling) {
      for (const format of CAPTURE_FORMATS) {
        const name = `${slot}-${ceiling.width}.${format}`;
        const file = join(outDir, name);
        if (!existsSync(file)) continue;
        const bytes = statSync(file).size;
        if (bytes > ceiling.bytes) {
          violations.push(
            `${name} ${kb(bytes)} > ${kb(ceiling.bytes)} (the variant served at 2×)`,
          );
        }
      }
    }
  }

  writeFileSync(
    join(outDir, "manifest.json"),
    JSON.stringify(manifest, null, 2),
  );
  return { manifest, empty, violations };
}

async function main() {
  const { CAPTURE_SLOTS } = await import("../src/content/captures.ts");
  const root = new URL("..", import.meta.url);
  const { manifest, empty, violations } = await buildCaptures({
    sourceDir: fileURLToPath(new URL("assets/captures", root)),
    outDir: fileURLToPath(new URL("public/captures", root)),
    slots: CAPTURE_SLOTS,
  });
  console.log(
    `Captures: ${Object.keys(manifest).length} slot(s) built (${Object.keys(manifest).join(", ") || "none"}).`,
  );
  if (empty.length > 0) {
    console.log(
      `Empty slots, rendered as nothing: ${empty.join(", ")}. Drop the source into assets/captures/ (getoxide/website#15).`,
    );
  }
  if (violations.length > 0) {
    console.error("Capture budgets failed (docs/spec/budgets.md):");
    for (const v of violations) console.error(`  - ${v}`);
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
