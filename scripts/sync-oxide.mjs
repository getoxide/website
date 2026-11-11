// `pnpm sync:oxide [--ref <ref>]`: copies the Oxide brand kit (Design system,
// Tokens) and writes the content Snapshot (ADR-0003; Content sourced from the
// Oxide repo #12) from getoxide/oxide at one ref: the latest stable tag, `main`
// while none exists, or `--ref`. The Snapshot holds the README sections inside
// the `site:*` markers, the Concepts terms of GLOSSARY.md and the release data
// of the GitHub Releases API, with no timestamps.
//
// Every file is fetched and checked before anything is written, so a missing
// file, marker or term, or an unreachable API, fails the sync and leaves the
// last good copy in place.
//
// DEV ONLY: `--local-source <git-dir>:<ref>` reads the Oxide files from a local
// clone (for a ref not pushed yet) and records that ref and commit in the
// Snapshot. Production runs never pass it.
import { execFileSync } from "node:child_process";
import { mkdir, rename, rm, writeFile as fsWriteFile } from "node:fs/promises";
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
 * The Features groups (`### …`) and each bullet's bold lead-in, the names the
 * `/features` contract checks (Copy #18, feature names). The narrative after
 * each lead-in stays in the README.
 * @param {string} features the `site:features` section
 * @returns {{ group: string, leadIns: string[] }[]}
 */
export function extractFeatures(features) {
  const groups = [];
  for (const line of features.split("\n")) {
    const heading = line.match(/^###\s+(.+?)\s*$/);
    if (heading) {
      groups.push({ group: heading[1], leadIns: [] });
      continue;
    }
    if (!/^[-*]\s/.test(line)) continue;
    const leadIn = line.match(/^[-*]\s+\*\*(.+?)\*\*/);
    if (!leadIn)
      throw new Error(`README feature without a bold lead-in: ${line}`);
    if (!groups.length)
      throw new Error(`README feature before any group: ${line}`);
    groups.at(-1).leadIns.push(leadIn[1].replace(/[.:]\s*$/, ""));
  }
  for (const { group, leadIns } of groups) {
    if (!leadIns.length)
      throw new Error(`README feature group "${group}" is empty`);
  }
  if (!groups.length) throw new Error("README Features has no group");
  return groups;
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

/** Where a link target of an Oxide root file points once on the site. */
function resolveTarget(target, ref, { image, file }) {
  if (/^([a-z][a-z\d+.-]*:|\/\/)/i.test(target)) return target;
  if (target.startsWith("#")) {
    const anchor = target.slice(1);
    const hosted = file === "README.md" ? SITE_ANCHORS[anchor] : undefined;
    return (
      hosted ?? `https://github.com/${OXIDE_REPO}/blob/${ref}/${file}${target}`
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
 * @param {string} [file] the root file the Markdown comes from; only README
 *   anchors can map to site URLs
 */
export function rewriteLinks(markdown, ref, file = "README.md") {
  return markdown
    .split(/(```[\s\S]*?```|`[^`\n]*`)/)
    .map((part, i) => {
      if (i % 2 === 1) return part;
      return part
        .replace(
          /(!?)\[([^\]]*)\]\(\s*([^)\s]+)((?:\s+"[^"]*")?)\s*\)/g,
          (_m, bang, text, target, title) =>
            `${bang}[${text}](${resolveTarget(target, ref, { image: !!bang, file })}${title})`,
        )
        .replace(
          /\b(href|src)="([^"]+)"/g,
          (_m, attr, target) =>
            `${attr}="${resolveTarget(target, ref, { image: attr === "src", file })}"`,
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

/** Tag of the newest stable release, `null` while there is none. */
export function latestStableTag(releases) {
  return (
    releases
      .filter((r) => isStable(r))
      .sort((a, b) => b.published_at.localeCompare(a.published_at))[0]
      ?.tag_name ?? null
  );
}

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
  let unresolved = [];
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
    unresolved = INSTALLERS.filter((i) => assets[i.key].name === null).map(
      (i) => ({ platform: i.platform, version, tag: newest.tag_name }),
    );
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
    unresolved,
  };
}

const STATES = ["stable", "prerelease-only", "none"];

/**
 * The Snapshot schema: throws naming every missing or malformed key, so a
 * sync never writes, and the site never builds from, a partial Snapshot.
 * @param {any} s
 */
export function checkSnapshot(s) {
  const problems = [];
  const at = (path) =>
    path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), s);
  const text = (path) => {
    const v = at(path);
    if (typeof v !== "string" || !v.trim()) problems.push(path);
  };
  const textOrNull = (path) => {
    const v = at(path);
    if (v !== null && (typeof v !== "string" || !v.trim())) problems.push(path);
  };
  const number = (path) => {
    if (typeof at(path) !== "number") problems.push(path);
  };

  text("source.repo");
  text("source.ref");
  text("source.commit");
  if (at("source.local") !== undefined) {
    text("source.local.ref");
    text("source.local.commit");
  }

  for (const key of [
    "definition",
    "install",
    "requirements",
    "quickStart",
    "faq",
  ]) {
    text(`readme.${key}`);
  }
  const features = at("readme.features");
  if (
    !Array.isArray(features) ||
    !features.length ||
    features.some(
      (g) =>
        typeof g?.group !== "string" ||
        !Array.isArray(g.leadIns) ||
        !g.leadIns.length ||
        g.leadIns.some((l) => typeof l !== "string" || !l),
    )
  ) {
    problems.push("readme.features");
  }

  const concepts = at("concepts");
  if (
    !Array.isArray(concepts) ||
    concepts.map((c) => c?.term).join("|") !== CONCEPTS.join("|") ||
    concepts.some(
      (c) =>
        c.id !== conceptId(c.term) ||
        typeof c.definition !== "string" ||
        !c.definition,
    )
  ) {
    problems.push("concepts");
  }

  if (!STATES.includes(at("release.state"))) problems.push("release.state");
  text("release.releasesUrl");
  const latest = at("release.latest");
  if (
    latest === undefined ||
    (latest === null) !== (at("release.state") === "none")
  ) {
    problems.push("release.latest");
  } else if (latest !== null) {
    for (const key of ["version", "tag", "date", "url"])
      text(`release.latest.${key}`);
    if (typeof latest.prerelease !== "boolean")
      problems.push("release.latest.prerelease");
    for (const { key } of INSTALLERS) {
      const asset = latest.assets?.[key];
      text(`release.latest.assets.${key}.url`);
      if (asset?.name === null) {
        if (asset.size !== null)
          problems.push(`release.latest.assets.${key}.size`);
      } else {
        text(`release.latest.assets.${key}.name`);
        number(`release.latest.assets.${key}.size`);
      }
    }
  }
  const platforms = at("release.platforms");
  if (
    !Array.isArray(platforms) ||
    !platforms.length ||
    platforms.some((p) => !INSTALLERS.some((i) => i.platform === p))
  ) {
    problems.push("release.platforms");
  }
  if (!["readme", "release"].includes(at("release.platformsFrom"))) {
    problems.push("release.platformsFrom");
  }

  const changelog = at("changelog");
  if (!Array.isArray(changelog)) {
    problems.push("changelog");
  } else {
    changelog.forEach((_, i) => {
      for (const key of ["version", "tag", "date", "url"])
        text(`changelog.${i}.${key}`);
      for (const [key] of NOTE_SECTIONS) textOrNull(`changelog.${i}.${key}`);
    });
  }

  if (problems.length) {
    throw new Error(
      `Snapshot is missing or has malformed keys: ${problems.join(", ")}`,
    );
  }
  return s;
}

/** The brand kit files at `ref`, as `[site path, contents]` pairs. */
async function brandOutputs(ref, fetchFile) {
  const get = (path) => fetchFile(ref, `${BRAND}/${path}`);
  const [tokens, logo, iconSvg, appleIcon, ...favicons] = await Promise.all([
    get("palette/oxide-tokens.css"),
    get("oxide-logo.svg"),
    get("oxide-favicon.svg"),
    get("png/avatar/180x180.png"),
    ...FAVICON_SIZES.map((s) => get(`png/favicon/${s}x${s}.png`)),
  ]);
  return [
    ["content/oxide/brand/oxide-tokens.css", tokens],
    ["content/oxide/brand/oxide-logo.svg", logo],
    ["src/app/icon.svg", iconSvg],
    ["src/app/favicon.ico", buildIco(favicons)],
    ["src/app/apple-icon.png", appleIcon],
  ];
}

/** README sections the Snapshot carries, by marker key. */
const SECTIONS = {
  definition: "definition",
  install: "install",
  requirements: "requirements",
  quickStart: "quick-start",
  faq: "faq",
};

/**
 * Builds the Snapshot from the Oxide README and glossary at `ref` and the
 * Releases API payload. Throws on a missing marker or allowlisted term.
 */
export function buildSnapshot({
  ref,
  commit,
  readme,
  glossary,
  releases,
  local,
}) {
  // A tag never moves; `main` does, so pin every rewritten link to the commit
  // that was actually read (issue #29, item 5).
  const linkRef = STABLE_TAG.test(ref) ? ref : commit;
  const readmeData = Object.fromEntries(
    Object.entries(SECTIONS).map(([key, marker]) => [
      key,
      rewriteLinks(extractSection(readme, marker), linkRef),
    ]),
  );
  readmeData.features = extractFeatures(extractSection(readme, "features"));
  const { concepts, unlisted } = extractConcepts(glossary);
  const { release, changelog, unresolved } = releaseData(releases, {
    install: readmeData.install,
  });
  const snapshot = {
    source: { repo: OXIDE_REPO, ref, commit, ...(local ? { local } : {}) },
    readme: {
      definition: readmeData.definition,
      features: readmeData.features,
      install: readmeData.install,
      requirements: readmeData.requirements,
      quickStart: readmeData.quickStart,
      faq: readmeData.faq,
    },
    concepts: concepts.map((c) => ({
      ...c,
      definition: rewriteLinks(c.definition, linkRef, "GLOSSARY.md"),
    })),
    release,
    changelog,
  };
  return { snapshot: checkSnapshot(snapshot), unlisted, unresolved };
}

/**
 * `pnpm sync:oxide`: the brand kit and the content Snapshot from
 * getoxide/oxide, at `ref` or, without one, at the latest stable tag (`main`
 * while none exists). `ref` is resolved to a commit first; every file is
 * fetched at that commit and the Snapshot records it, so a moving `main` is
 * pinned to what was actually read (ADR-0003). Everything is fetched and
 * checked before the first write, so any failure leaves the last good copy in
 * place.
 * @param {{
 *   ref?: string,
 *   local?: { ref: string, commit: string },
 *   fetchFile: (ref: string, path: string) => Promise<Buffer>,
 *   fetchCommit: (ref: string) => Promise<string>,
 *   fetchReleases: () => Promise<any[]>,
 *   writeFile?: (path: string, data: Buffer | string) => Promise<void>,
 *   writeFiles?: (outputs: [string, Buffer | string][]) => Promise<void>,
 *   log?: (line: string) => void,
 * }} io
 */
export async function syncOxide({
  ref: requested,
  local,
  fetchFile,
  fetchCommit,
  fetchReleases,
  writeFile,
  writeFiles,
  log = () => {},
}) {
  const releases = await fetchReleases();
  const ref = requested ?? latestStableTag(releases) ?? OXIDE_REF;
  const commit = local?.commit ?? (await fetchCommit(ref));
  const [brand, readme, glossary] = await Promise.all([
    brandOutputs(commit, fetchFile),
    fetchFile(commit, "README.md"),
    fetchFile(commit, "GLOSSARY.md"),
  ]);
  const { snapshot, unlisted, unresolved } = buildSnapshot({
    ref,
    commit,
    readme: readme.toString("utf8"),
    glossary: glossary.toString("utf8"),
    releases,
    local,
  });

  const outputs = [
    ...brand,
    ["content/oxide/snapshot.json", JSON.stringify(snapshot, null, 2) + "\n"],
    [
      "content/oxide/source.json",
      JSON.stringify({ repo: OXIDE_REPO, ref, commit }, null, 2) + "\n",
    ],
  ];
  if (writeFiles) await writeFiles(outputs);
  else for (const [path, data] of outputs) await writeFile(path, data);
  if (unlisted.length) {
    log(`Glossary terms not on the site: ${unlisted.join(", ")}`);
  }
  for (const { platform, version, tag } of unresolved) {
    log(
      `Warning: no ${platform} installer asset (Oxide_${version}) in ${tag}: the button falls back to the release page.`,
    );
  }
  return { ref, commit, written: outputs.map(([path]) => path), unlisted };
}

async function fetchRaw(ref, path) {
  const url = `https://raw.githubusercontent.com/${OXIDE_REPO}/${encodeURIComponent(ref)}/${path}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${path} at ${ref}`);
  return Buffer.from(await res.arrayBuffer());
}

/** GitHub API headers, with the token when the environment provides one. */
function apiHeaders() {
  const headers = {
    accept: "application/vnd.github+json",
    "user-agent": "oxide-website-sync",
    "x-github-api-version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

/** The commit a ref resolves to, so a moving `main` is recorded as a SHA. */
export async function fetchCommitOf(ref) {
  const res = await fetch(
    `https://api.github.com/repos/${OXIDE_REPO}/commits/${encodeURIComponent(ref)}`,
    { headers: apiHeaders() },
  );
  if (!res.ok) {
    throw new Error(`GitHub Commits API answered ${res.status} for ${ref}`);
  }
  const { sha } = await res.json();
  if (!/^[0-9a-f]{40}$/.test(sha ?? "")) {
    throw new Error(`GitHub Commits API returned no SHA for ${ref}`);
  }
  return sha;
}

/**
 * Every release, following GitHub's pagination (`per_page=100`). A full last
 * page is never taken as the end silently: if `MAX_PAGES` pages are all full,
 * the sync fails instead of truncating past 1000 releases.
 */
export const RELEASES_PER_PAGE = 100;

export async function fetchAllReleases(fetchPage, maxPages = 10) {
  const releases = [];
  for (let page = 1; page <= maxPages; page++) {
    const batch = await fetchPage(page);
    if (!Array.isArray(batch)) {
      throw new Error("GitHub Releases API did not return a list");
    }
    releases.push(...batch);
    if (batch.length < RELEASES_PER_PAGE) return releases;
  }
  throw new Error(
    `GitHub Releases API returned ${maxPages} full pages of ${RELEASES_PER_PAGE}: refusing to truncate the list`,
  );
}

/** Every release of the Oxide repo (public; `GITHUB_TOKEN` only lifts the
 * rate limit when the environment provides one). */
async function fetchReleases() {
  return fetchAllReleases(async (page) => {
    const res = await fetch(
      `https://api.github.com/repos/${OXIDE_REPO}/releases?per_page=${RELEASES_PER_PAGE}&page=${page}`,
      { headers: apiHeaders() },
    );
    if (!res.ok) throw new Error(`GitHub Releases API answered ${res.status}`);
    return res.json();
  });
}

/**
 * Writes every output to a temp file first, then renames them into place, so
 * a failure while fetching or staging leaves the committed files untouched.
 * All-or-nothing across files: the renames happen only after every temp file
 * is written.
 * @param {string} root
 * @param {[string, Buffer | string][]} outputs
 */
export async function writeOutputsAtomically(root, outputs) {
  const staged = [];
  try {
    for (const [path, data] of outputs) {
      const target = join(root, path);
      await mkdir(dirname(target), { recursive: true });
      const temp = `${target}.tmp-${process.pid}-${staged.length}`;
      await fsWriteFile(temp, data);
      staged.push([temp, target]);
    }
  } catch (error) {
    await Promise.all(
      staged.map(([temp]) => rm(temp, { force: true }).catch(() => {})),
    );
    throw error;
  }
  for (const [temp, target] of staged) await rename(temp, target);
}

/**
 * DEV ONLY: reads Oxide files from a local clone at `ref` instead of raw
 * GitHub, for a ref not pushed yet. The Snapshot records the local ref and
 * commit; release data still comes from the GitHub API.
 */
function localSource(spec) {
  const at = spec.lastIndexOf(":");
  if (at <= 0) throw new Error("--local-source needs <git-dir>:<ref>");
  const dir = spec.slice(0, at);
  const ref = spec.slice(at + 1);
  const git = (args, encoding) =>
    execFileSync("git", ["-C", dir, ...args], {
      encoding,
      maxBuffer: 64 * 1024 * 1024,
    });
  const commit = git(
    ["rev-parse", "--verify", `${ref}^{commit}`],
    "utf8",
  ).trim();
  return {
    local: { ref, commit },
    fetchFile: async (_ref, path) => {
      try {
        return git(["show", `${commit}:${path}`]);
      } catch {
        throw new Error(`${path} missing at ${ref} in ${dir}`);
      }
    },
  };
}

function option(argv, name) {
  const i = argv.indexOf(name);
  if (i === -1) return undefined;
  const value = argv[i + 1];
  if (!value || value.startsWith("--"))
    throw new Error(`${name} needs a value`);
  return value;
}

async function main() {
  const root = fileURLToPath(new URL("..", import.meta.url));
  const argv = process.argv.slice(2);
  const localSpec = option(argv, "--local-source");
  const local = localSpec ? localSource(localSpec) : null;
  const result = await syncOxide({
    ref: option(argv, "--ref"),
    local: local?.local,
    fetchFile: local?.fetchFile ?? fetchRaw,
    fetchCommit: fetchCommitOf,
    fetchReleases,
    writeFiles: (outputs) => writeOutputsAtomically(root, outputs),
    log: (line) => console.log(line),
  });
  const from = local
    ? ` (files from ${local.local.ref}@${local.local.commit.slice(0, 7)}, local)`
    : ` (commit ${result.commit.slice(0, 7)})`;
  console.log(`Synced ${OXIDE_REPO}@${result.ref}${from}:`);
  for (const path of result.written) console.log(`  ${path}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(`sync:oxide failed, no files were replaced: ${err.message}`);
    process.exit(1);
  });
}
