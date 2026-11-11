// `pnpm sync:oxide [--ref <ref>]`: copies the Oxide brand kit into the site at
// a pinned ref of getoxide/oxide (Design system, Tokens). First version: the
// tokens CSS verbatim and the icon set. The content snapshot joins it later.
//
// Every file is fetched before anything is written, so a missing file fails
// the sync and leaves the last good copy in place.
import { mkdir, writeFile as fsWriteFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const OXIDE_REPO = "getoxide/oxide";
/** Pinned ref: `main` until Oxide has a stable release tag. */
export const OXIDE_REF = "main";

const BRAND = "assets/brand/oxide";
const FAVICON_SIZES = [16, 32, 48, 64];

const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

function pngSize(png) {
  if (
    png.length < 24 ||
    !png.subarray(0, 8).equals(PNG_SIGNATURE) ||
    png.toString("ascii", 12, 16) !== "IHDR"
  ) {
    throw new Error("buildIco: input is not a PNG");
  }
  return { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
}

/**
 * Assembles an `.ico` from PNG images, stored as PNG entries (supported by
 * every browser that reads `.ico`).
 * @param {Buffer[]} pngs
 * @returns {Buffer}
 */
export function buildIco(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);

  const entries = [];
  let offset = 6 + 16 * pngs.length;
  for (const png of pngs) {
    const { width, height } = pngSize(png);
    const entry = Buffer.alloc(16);
    entry.writeUInt8(width >= 256 ? 0 : width, 0);
    entry.writeUInt8(height >= 256 ? 0 : height, 1);
    entry.writeUInt8(0, 2); // no palette
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // colour planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += png.length;
  }
  return Buffer.concat([header, ...entries, ...pngs]);
}

/**
 * Fetches the brand files at `ref` and writes them into the site.
 * @param {{
 *   ref: string,
 *   fetchFile: (ref: string, path: string) => Promise<Buffer>,
 *   writeFile: (path: string, data: Buffer | string) => Promise<void>,
 * }} io
 */
export async function syncBrand({ ref, fetchFile, writeFile }) {
  const get = (path) => fetchFile(ref, `${BRAND}/${path}`);
  const [tokens, iconSvg, appleIcon, ...favicons] = await Promise.all([
    get("palette/oxide-tokens.css"),
    get("oxide-favicon.svg"),
    get("png/avatar/180x180.png"),
    ...FAVICON_SIZES.map((s) => get(`png/favicon/${s}x${s}.png`)),
  ]);
  const ico = buildIco(favicons);

  const outputs = [
    ["content/oxide/brand/oxide-tokens.css", tokens],
    ["src/app/icon.svg", iconSvg],
    ["src/app/favicon.ico", ico],
    ["src/app/apple-icon.png", appleIcon],
    [
      "content/oxide/source.json",
      JSON.stringify({ repo: OXIDE_REPO, ref }, null, 2) + "\n",
    ],
  ];
  for (const [path, data] of outputs) await writeFile(path, data);
  return outputs.map(([path]) => path);
}

async function fetchRaw(ref, path) {
  const url = `https://raw.githubusercontent.com/${OXIDE_REPO}/${encodeURIComponent(ref)}/${path}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${path} at ${ref}`);
  return Buffer.from(await res.arrayBuffer());
}

function parseRef(argv) {
  const i = argv.indexOf("--ref");
  if (i === -1) return OXIDE_REF;
  const ref = argv[i + 1];
  if (!ref) throw new Error("--ref needs a value");
  return ref;
}

async function main() {
  const root = fileURLToPath(new URL("..", import.meta.url));
  const ref = parseRef(process.argv.slice(2));
  const written = await syncBrand({
    ref,
    fetchFile: fetchRaw,
    writeFile: async (path, data) => {
      const target = join(root, path);
      await mkdir(dirname(target), { recursive: true });
      await fsWriteFile(target, data);
    },
  });
  console.log(`Synced ${OXIDE_REPO}@${ref}:`);
  for (const path of written) console.log(`  ${path}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(`sync:oxide failed, nothing written: ${err.message}`);
    process.exit(1);
  });
}
