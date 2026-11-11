// `pnpm sync:oxide [--ref <ref>]`: copies the Oxide brand kit into the site at
// a pinned ref of getoxide/oxide (Design system, Tokens). First version: the
// tokens CSS verbatim, the logo and the icon set. The content snapshot joins it later.
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

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * The text of a README section between `<!-- site:<key> -->` and
 * `<!-- /site:<key> -->` (Content sourced from the Oxide repo #12). Only those
 * exact comment forms count: a bare `site:` elsewhere (the README's top note
 * says `site:*`) is ordinary text.
 * @param {string} readme
 * @param {string} key
 */
export function extractSection(readme, key) {
  const k = escapeRegExp(key);
  const open = new RegExp(`<!--\\s*site:${k}\\s*-->`, "g");
  const close = new RegExp(`<!--\\s*/site:${k}\\s*-->`, "g");
  const opens = [...readme.matchAll(open)];
  const closes = [...readme.matchAll(close)];
  if (opens.length === 0) throw new Error(`README marker site:${key} missing`);
  if (closes.length === 0) {
    throw new Error(`README marker /site:${key} missing`);
  }
  if (opens.length > 1 || closes.length > 1) {
    throw new Error(`README marker site:${key} appears more than once`);
  }
  const start = opens[0].index + opens[0][0].length;
  const end = closes[0].index;
  if (end < start)
    throw new Error(`README marker /site:${key} before site:${key}`);
  const text = readme.slice(start, end).trim();
  if (!text) throw new Error(`README section site:${key} is empty`);
  return text;
}

/**
 * The Concepts allowlist: the user-facing glossary terms `/docs/concepts`
 * renders, in page order (Content sourced from the Oxide repo #12, addendum
 * point 4). It lives in the website repo; extend it deliberately.
 */
export const CONCEPTS = [
  "Project",
  "Thread",
  "Turn",
  "Provider",
  "Surface",
  "Checkpoint",
  "Verification Dossier",
  "Blind review",
  "Restore",
];

const conceptId = (term) => term.toLowerCase().replace(/\s+/g, "-");

/**
 * The allowlisted terms of the Oxide GLOSSARY.md, definitions verbatim with
 * the `_Avoid_` lines stripped, plus the terms left off the allowlist.
 * An entry is a `**Term**:` line followed by its definition lines up to the
 * next blank line.
 * @param {string} glossary
 * @returns {{
 *   concepts: { term: string, id: string, definition: string }[],
 *   unlisted: string[],
 * }}
 */
export function extractConcepts(glossary) {
  const entries = new Map();
  const lines = glossary.replace(/\r\n/g, "\n").split("\n");
  for (let i = 0; i < lines.length; i++) {
    const head = lines[i].match(/^\*\*(.+?)\*\*:\s*$/);
    if (!head) continue;
    const body = [];
    for (let j = i + 1; j < lines.length && lines[j].trim() !== ""; j++) {
      if (!/^_Avoid_:/.test(lines[j])) body.push(lines[j]);
    }
    entries.set(head[1], body.join("\n").trim());
  }
  const concepts = CONCEPTS.map((term) => {
    if (!entries.has(term)) {
      throw new Error(`GLOSSARY term "${term}" missing (Concepts allowlist)`);
    }
    const definition = entries.get(term);
    if (!definition)
      throw new Error(`GLOSSARY term "${term}" has no definition`);
    return { term, id: conceptId(term), definition };
  });
  const unlisted = [...entries.keys()].filter((t) => !CONCEPTS.includes(t));
  return { concepts, unlisted };
}

/**
 * README anchors of sections the site hosts, and where they live on the site
 * (Content #12, Links). Any other anchor links to the README on GitHub.
 */
export const SITE_ANCHORS = {
  requirements: "/docs/quick-start#requirements",
  "quick-start": "/docs/quick-start",
  faq: "/faq",
};

/** Where a link target of the Oxide README points once on the site. */
function resolveTarget(target, ref, { image }) {
  if (/^([a-z][a-z\d+.-]*:|\/\/)/i.test(target)) return target;
  if (target.startsWith("#")) {
    const anchor = target.slice(1);
    return (
      SITE_ANCHORS[anchor] ??
      `https://github.com/${OXIDE_REPO}/blob/${ref}/README.md${target}`
    );
  }
  const path = target.replace(/^(\.\/|\/)+/, "");
  if (image)
    return `https://raw.githubusercontent.com/${OXIDE_REPO}/${ref}/${path}`;
  const kind = path.split("#")[0].endsWith("/") ? "tree" : "blob";
  return `https://github.com/${OXIDE_REPO}/${kind}/${ref}/${path}`;
}

/**
 * Rewrites the links of README Markdown for the site: relative repo links
 * become absolute GitHub URLs at `ref`, anchors the site hosts become site
 * URLs. Code spans and fenced code are left untouched.
 * @param {string} markdown
 * @param {string} ref
 */
export function rewriteLinks(markdown, ref) {
  return markdown
    .split(/(```[\s\S]*?```|`[^`\n]*`)/)
    .map((part, i) => {
      if (i % 2 === 1) return part;
      return part
        .replace(
          /(!?)\[([^\]]*)\]\(\s*([^)\s]+)((?:\s+"[^"]*")?)\s*\)/g,
          (_m, bang, text, target, title) =>
            `${bang}[${text}](${resolveTarget(target, ref, { image: !!bang })}${title})`,
        )
        .replace(
          /\b(href|src)="([^"]+)"/g,
          (_m, attr, target) =>
            `${attr}="${resolveTarget(target, ref, { image: attr === "src" })}"`,
        );
    })
    .join("");
}

/** GitHub's page listing every Oxide release. */
export const RELEASES_URL = `https://github.com/${OXIDE_REPO}/releases`;

/**
 * The two installers the site links to, and the platform each one means
 * (Copy deck, Tokens: `⟨platforms⟩`).
 */
const INSTALLERS = [
  { key: "macos", suffix: "_aarch64.dmg", platform: "macOS on Apple Silicon" },
  { key: "windows", suffix: "_x64-setup.exe", platform: "Windows x64" },
];

/** Release notes sections the changelog keeps (Content #12, Changelog). */
const NOTE_SECTIONS = [
  ["breaking", "Breaking changes"],
  ["features", "Features"],
  ["fixes", "Fixes"],
];

const STABLE_TAG = /^v\d+\.\d+\.\d+$/;

const isStable = (r) =>
  !r.draft && !r.prerelease && STABLE_TAG.test(r.tag_name);

/** One `### <name>` section of release notes, up to the next heading or the
 * "**Full changelog:**" line; `null` when the notes have none. */
function noteSection(body, name) {
  const lines = (body ?? "").replace(/\r\n/g, "\n").split("\n");
  const start = lines.findIndex((l) => l.trim() === `### ${name}`);
  if (start === -1) return null;
  const section = [];
  for (const line of lines.slice(start + 1)) {
    if (
      /^#{1,3} /.test(line) ||
      /^\*\*Full (changelog|history):\*\*/.test(line)
    ) {
      break;
    }
    section.push(line);
  }
  return section.join("\n").trim() || null;
}

/** The exact installer asset of a release, or the release page instead. */
function installer(release, version, { suffix }) {
  const name = `Oxide_${version}${suffix}`;
  const asset = release.assets?.find((a) => a.name === name);
  return asset
    ? { name, url: asset.browser_download_url, size: asset.size }
    : { name: null, url: release.html_url, size: null };
}

/** Platforms named by the README Install table (`site:install`). */
function readmePlatforms(install) {
  const platforms = INSTALLERS.filter((i) =>
    install.split("\n").some((row) => row.includes(i.suffix)),
  ).map((i) => i.platform);
  if (platforms.length === 0) {
    throw new Error("README Install table names no known platform installer");
  }
  return platforms;
}

/**
 * Release state, latest release, platforms and the stable-only changelog,
 * from the GitHub Releases API (`GET /repos/{repo}/releases`).
 * @param {any[]} releases
 * @param {{ install: string }} readme the `site:install` section
 */
export function releaseData(releases, { install }) {
  const published = releases
    .filter((r) => !r.draft)
    .sort((a, b) => b.published_at.localeCompare(a.published_at));
  const stable = published.filter(isStable);
  const newest = stable[0] ?? published[0] ?? null;
  const state = stable.length
    ? "stable"
    : published.length
      ? "prerelease-only"
      : "none";

  let latest = null;
  let platforms = readmePlatforms(install);
  let platformsFrom = "readme";
  if (newest) {
    const version = newest.tag_name.replace(/^v/, "");
    const assets = Object.fromEntries(
      INSTALLERS.map((i) => [i.key, installer(newest, version, i)]),
    );
    latest = {
      version,
      tag: newest.tag_name,
      date: newest.published_at.slice(0, 10),
      url: newest.html_url,
      prerelease: !isStable(newest),
      assets,
    };
    const shipped = INSTALLERS.filter((i) => assets[i.key].name !== null);
    if (shipped.length) {
      platforms = shipped.map((i) => i.platform);
      platformsFrom = "release";
    }
  }

  const changelog = stable.map((r) => ({
    version: r.tag_name.replace(/^v/, ""),
    tag: r.tag_name,
    date: r.published_at.slice(0, 10),
    url: r.html_url,
    ...Object.fromEntries(
      NOTE_SECTIONS.map(([key, name]) => [key, noteSection(r.body, name)]),
    ),
  }));

  return {
    stableTag: stable[0]?.tag_name ?? null,
    release: {
      state,
      releasesUrl: RELEASES_URL,
      latest,
      platforms,
      platformsFrom,
    },
    changelog,
  };
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
  const [tokens, logo, iconSvg, appleIcon, ...favicons] = await Promise.all([
    get("palette/oxide-tokens.css"),
    get("oxide-logo.svg"),
    get("oxide-favicon.svg"),
    get("png/avatar/180x180.png"),
    ...FAVICON_SIZES.map((s) => get(`png/favicon/${s}x${s}.png`)),
  ]);
  const ico = buildIco(favicons);

  const outputs = [
    ["content/oxide/brand/oxide-tokens.css", tokens],
    ["content/oxide/brand/oxide-logo.svg", logo],
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
