import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildIco,
  checkSnapshot,
  fetchAllReleases,
  syncOxide,
  writeOutputsAtomically,
} from "./sync-oxide.mjs";

describe("the committed Snapshot", () => {
  it("has every expected key", () => {
    const committed = JSON.parse(
      readFileSync(
        new URL("../content/oxide/snapshot.json", import.meta.url),
        "utf8",
      ),
    );
    expect(() => checkSnapshot(committed)).not.toThrow();
  });
});

/** A stand-in PNG: the signature and an IHDR chunk carrying the size. */
function fakePng(size, filler = 0) {
  const buf = Buffer.alloc(33 + filler, 0xab);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(buf, 0);
  buf.writeUInt32BE(13, 8);
  buf.write("IHDR", 12, "ascii");
  buf.writeUInt32BE(size, 16);
  buf.writeUInt32BE(size, 20);
  return buf;
}

describe("buildIco", () => {
  it("packs PNGs into an ICO directory with one entry per size", () => {
    const p16 = fakePng(16, 1);
    const p32 = fakePng(32, 2);
    const ico = buildIco([p16, p32]);

    // ICONDIR: reserved 0, type 1 (icon), 2 images.
    expect([...ico.subarray(0, 6)]).toEqual([0, 0, 1, 0, 2, 0]);
    // First ICONDIRENTRY: 16x16, no palette, 1 plane, 32 bpp, size, offset.
    const e1 = ico.subarray(6, 22);
    expect([e1[0], e1[1], e1[2], e1[3]]).toEqual([16, 16, 0, 0]);
    expect(e1.readUInt16LE(4)).toBe(1);
    expect(e1.readUInt16LE(6)).toBe(32);
    expect(e1.readUInt32LE(8)).toBe(34);
    expect(e1.readUInt32LE(12)).toBe(38); // 6 + 2 * 16
    const e2 = ico.subarray(22, 38);
    expect([e2[0], e2[1]]).toEqual([32, 32]);
    expect(e2.readUInt32LE(8)).toBe(35);
    expect(e2.readUInt32LE(12)).toBe(72); // 38 + 34
    // The PNG data follows verbatim.
    expect(ico.subarray(38, 72).equals(p16)).toBe(true);
    expect(ico.subarray(72).equals(p32)).toBe(true);
  });

  it("writes 0 for a 256 px side, as the format requires", () => {
    const ico = buildIco([fakePng(256)]);
    expect([ico[6], ico[7]]).toEqual([0, 0]);
  });

  it("rejects a file that is not a PNG", () => {
    expect(() => buildIco([Buffer.from("not a png")])).toThrow(/PNG/);
  });
});

const TOKENS_JSON = JSON.stringify({
  name: "Oxide Titanium",
  color: {
    dark: {
      background: "#1C1C1E",
      "text.bright": "#FFFFFF",
      syntax: { comment: { color: "#9A9892" } },
    },
    light: {
      background: "#FBFBFA",
      "text.bright": "#1C1C1E",
      syntax: { comment: { color: "#62615C" } },
    },
  },
  typography: {
    software: { ui: { family: "Inter" }, code: { family: "JetBrains Mono" } },
    website: {
      heading: { family: "Space Grotesk" },
      body: { family: "Inter" },
    },
  },
});

/** A README with every site marker, shaped like the Oxide one. */
const README = `<!-- The site:* markers below feed the Oxide website. Do not remove them. -->

<h1 align="center">Oxide</h1>

## What is Oxide?

<!-- site:definition -->

Oxide is a free, open-source **desktop app**, built with [Tauri](https://tauri.app). See the [licence](LICENSE).

<!-- /site:definition -->

## Features

<!-- site:features -->

### One app, every agent CLI

- **Multiple Providers.** Use them side by side.

### Review before you merge

- **Blind review.** A second Provider reviews the diff.

<!-- /site:features -->

## Install

<!-- site:install -->

| Platform | File | Notes |
| --- | --- | --- |
| macOS (Apple Silicon) | \`Oxide_<version>_aarch64.dmg\` | Drag it. |
| Windows 10/11 (x64) | \`Oxide_<version>_x64-setup.exe\` | Run it. |

<!-- /site:install -->

### Requirements

<!-- site:requirements -->

| Provider | Command | Install |
| --- | --- | --- |
| Claude Code | \`claude\` | [docs.claude.com](https://docs.claude.com/en/docs/claude-code) |

\`git\` is required.

<!-- /site:requirements -->

## Quick start

<!-- site:quick-start -->

1. Install a Provider.
2. Launch Oxide. See [Requirements](#requirements).

<!-- /site:quick-start -->

## FAQ

<!-- site:faq -->

**Is Oxide an AI coding agent?**
No. [Build it yourself](#build-from-source).

<!-- /site:faq -->
`;

const TERMS = [
  "Project",
  "Terminal",
  "Command block",
  "Surface",
  "Files view",
  "Code workspace",
  "Session restore",
  "In-app update",
  "Package install",
];
const GLOSSARY =
  "# Oxide\n\n## Language\n\n" +
  TERMS.map((t) => `**${t}**:\nThe ${t} definition.\n_Avoid_: x\n`).join("\n") +
  "\n**Open Project**:\nA Project in the sidebar.\n";

function source() {
  return new Map([
    ["assets/palette/oxide-tokens.json", Buffer.from(TOKENS_JSON)],
    ["README.md", Buffer.from(README)],
    ["GLOSSARY.md", Buffer.from(GLOSSARY)],
  ]);
}

const STABLE = {
  tag_name: "v1.1.0",
  draft: false,
  prerelease: false,
  published_at: "2026-12-10T10:00:00Z",
  html_url: "https://github.com/getoxide/oxide/releases/tag/v1.1.0",
  body: "### Fixes\n\n- a fix\n",
  assets: [
    {
      name: "Oxide.dmg",
      size: 100,
      browser_download_url: "https://example.test/mac.dmg",
    },
    {
      name: "Oxide-x64.exe",
      size: 90,
      browser_download_url: "https://example.test/win.exe",
    },
    {
      name: "Oxide-x64.AppImage",
      size: 95,
      browser_download_url: "https://example.test/linux.AppImage",
    },
  ],
};

async function run(
  files,
  { ref, releases = [], releasesError, local, logs = [] } = {},
) {
  const fetched = [];
  const written = new Map();
  const result = await syncOxide({
    ref,
    local,
    fetchFile: async (r, path) => {
      fetched.push(`${r}:${path}`);
      const file = files.get(path);
      if (!file) throw new Error(`404 ${path}`);
      return file;
    },
    fetchCommit: async (ref) => `commit-of-${ref}`,
    fetchReleases: async () => {
      if (releasesError) throw new Error(releasesError);
      return releases;
    },
    writeFile: async (path, data) => written.set(path, Buffer.from(data)),
    log: (line) => logs.push(line),
  });
  const snapshot = written.has("content/oxide/snapshot.json")
    ? JSON.parse(written.get("content/oxide/snapshot.json").toString())
    : null;
  return { fetched, written, snapshot, result, logs };
}

describe("syncOxide: brand kit", () => {
  it("generates oxide-tokens.css from oxide-tokens.json at the pinned ref", async () => {
    const { fetched, written } = await run(source(), { ref: "v1.2.3" });

    expect(fetched.every((f) => f.startsWith("commit-of-v1.2.3:"))).toBe(true);
    const css = written.get("content/oxide/brand/oxide-tokens.css")?.toString();
    expect(css).toContain("--ox-background: #1C1C1E;");
    expect(css).toContain("--ox-text-bright: #FFFFFF;");
    expect(css).toContain("--ox-syntax-comment: #9A9892;");

    expect(
      JSON.parse(written.get("content/oxide/source.json").toString()),
    ).toEqual({
      repo: "getoxide/oxide",
      ref: "v1.2.3",
      commit: "commit-of-v1.2.3",
    });
  });

  it("fails when oxide-tokens.json is missing", async () => {
    const files = source();
    files.delete("assets/palette/oxide-tokens.json");
    await expect(run(files)).rejects.toThrow(/oxide-tokens\.json/);
  });
});

describe("syncOxide: ref", () => {
  it("reads the latest stable tag when no ref is given", async () => {
    const { fetched, snapshot } = await run(source(), { releases: [STABLE] });
    expect(fetched.every((f) => f.startsWith("commit-of-v1.1.0:"))).toBe(true);
    expect(snapshot.source).toEqual({
      repo: "getoxide/oxide",
      ref: "v1.1.0",
      commit: "commit-of-v1.1.0",
    });
  });

  it("reads main while no stable tag exists", async () => {
    const { fetched } = await run(source(), {
      releases: [{ ...STABLE, tag_name: "v1.1.0-rc.1", prerelease: true }],
    });
    expect(fetched.every((f) => f.startsWith("commit-of-main:"))).toBe(true);
  });

  it("records a local source's ref and commit, while links use the pinned ref", async () => {
    const { snapshot } = await run(source(), {
      local: { ref: "docs/site-markers", commit: "3719414abc" },
    });
    expect(snapshot.source).toEqual({
      repo: "getoxide/oxide",
      ref: "main",
      commit: "3719414abc",
      local: { ref: "docs/site-markers", commit: "3719414abc" },
    });
    expect(snapshot.readme.definition).toContain(
      "(https://github.com/getoxide/oxide/blob/3719414abc/LICENSE)",
    );
  });
});

describe("syncOxide: snapshot", () => {
  it("writes the marked README sections, links rewritten", async () => {
    const { snapshot } = await run(source(), { ref: "v1.2.3" });
    expect(snapshot.readme.definition).toBe(
      "Oxide is a free, open-source **desktop app**, built with [Tauri](https://tauri.app). See the [licence](https://github.com/getoxide/oxide/blob/v1.2.3/LICENSE).",
    );
    expect(snapshot.readme.quickStart).toBe(
      "1. Install a Provider.\n2. Launch Oxide. See [Requirements](/docs/quick-start#requirements).",
    );
    expect(snapshot.readme.requirements).toContain(
      "| Claude Code | `claude` |",
    );
    expect(snapshot.readme.requirements).toContain("`git` is required.");
    expect(snapshot.readme.install).toContain("Oxide_<version>_aarch64.dmg");
    expect(snapshot.readme.faq).toBe(
      "**Is Oxide an AI coding agent?**\nNo. [Build it yourself](https://github.com/getoxide/oxide/blob/v1.2.3/README.md#build-from-source).",
    );
    expect(snapshot.readme.features).toEqual([
      { group: "One app, every agent CLI", leadIns: ["Multiple Providers"] },
      { group: "Review before you merge", leadIns: ["Blind review"] },
    ]);
  });

  it("writes the nine Concepts and lists the glossary terms left out", async () => {
    const logs = [];
    const { snapshot, result } = await run(source(), { logs });
    expect(snapshot.concepts).toHaveLength(9);
    expect(snapshot.concepts[2]).toEqual({
      term: "Command block",
      id: "command-block",
      definition: "The Command block definition.",
    });
    expect(result.unlisted).toEqual(["Open Project"]);
    expect(logs).toContain("Glossary terms not on the site: Open Project");
  });

  it("writes the release state and the changelog", async () => {
    const { snapshot } = await run(source(), { releases: [STABLE] });
    expect(snapshot.release.state).toBe("stable");
    // Stable: GitHub's `latest` redirect, not the tag's own URL.
    expect(snapshot.release.latest.assets.macos.url).toBe(
      "https://github.com/getoxide/oxide/releases/latest/download/Oxide.dmg",
    );
    expect(snapshot.changelog).toEqual([
      {
        version: "1.1.0",
        tag: "v1.1.0",
        date: "2026-12-10",
        url: STABLE.html_url,
        breaking: null,
        features: null,
        fixes: "- a fix",
      },
    ]);
  });

  it("writes byte-identical output for an unchanged source: no timestamps", async () => {
    const a = await run(source(), { releases: [STABLE] });
    await new Promise((r) => setTimeout(r, 5));
    const b = await run(source(), { releases: [STABLE] });
    expect(b.written).toEqual(a.written);
    expect(a.written.get("content/oxide/snapshot.json").toString()).not.toMatch(
      /T\d\d:\d\d/,
    );
  });

  it("passes its own schema check", async () => {
    const { snapshot } = await run(source());
    expect(() => checkSnapshot(snapshot)).not.toThrow();
  });
});

describe("syncOxide: failures write nothing", () => {
  async function expectNothingWritten(files, options, message) {
    const written = new Map();
    await expect(
      syncOxide({
        ...options,
        fetchFile: async (_r, path) => {
          const file = files.get(path);
          if (!file) throw new Error(`404 ${path}`);
          return file;
        },
        fetchCommit: async (ref) => `commit-of-${ref}`,
        fetchReleases:
          options.fetchReleases ??
          (async () => {
            return [];
          }),
        writeFile: async (path, data) => written.set(path, data),
        log: () => {},
      }),
    ).rejects.toThrow(message);
    expect(written.size).toBe(0);
  }

  it("a missing tokens file", async () => {
    const files = source();
    files.delete("assets/palette/oxide-tokens.json");
    await expectNothingWritten(files, {}, /oxide-tokens\.json/);
  });

  it("a missing marker", async () => {
    const files = source();
    files.set(
      "README.md",
      Buffer.from(
        README.replace("<!-- /site:faq -->", "").replace(
          "<!-- site:faq -->",
          "",
        ),
      ),
    );
    await expectNothingWritten(files, {}, /site:faq/);
  });

  it("a missing allowlisted term", async () => {
    const files = source();
    files.set(
      "GLOSSARY.md",
      Buffer.from(GLOSSARY.replace("**Surface**:", "**Pane**:")),
    );
    await expectNothingWritten(files, {}, /Surface/);
  });

  it("an unreachable Releases API", async () => {
    await expectNothingWritten(
      source(),
      {
        fetchReleases: async () => {
          throw new Error("GitHub Releases API: 503");
        },
      },
      /Releases API/,
    );
  });
});

describe("checkSnapshot", () => {
  it("names every missing key", async () => {
    const { snapshot } = await run(source());
    delete snapshot.readme.quickStart;
    delete snapshot.release.state;
    expect(() => checkSnapshot(snapshot)).toThrow(
      /readme\.quickStart.*release\.state/s,
    );
  });

  it("requires the commit the synced ref resolved to", async () => {
    const { snapshot } = await run(source());
    delete snapshot.source.commit;
    expect(() => checkSnapshot(snapshot)).toThrow(/source\.commit/);
  });

  it("rejects a release state outside stable, prerelease-only and none", async () => {
    const { snapshot } = await run(source());
    snapshot.release.state = "beta";
    expect(() => checkSnapshot(snapshot)).toThrow(/release\.state/);
  });

  it("rejects a Concepts list that is not the nine allowlisted terms", async () => {
    const { snapshot } = await run(source());
    snapshot.concepts.pop();
    expect(() => checkSnapshot(snapshot)).toThrow(/concepts/);
  });
});

describe("fetchAllReleases (issue #29, item 18)", () => {
  const batch = (n) =>
    Array.from({ length: n }, (_, i) => ({ tag_name: `v${i}.0.0` }));

  it("follows pagination until a short page", async () => {
    const pages = [batch(100), batch(3)];
    const seen = [];
    const releases = await fetchAllReleases(async (page) => {
      seen.push(page);
      return pages[page - 1] ?? [];
    });
    expect(seen).toEqual([1, 2]);
    expect(releases).toHaveLength(103);
  });

  it("stops on an empty page after a full one", async () => {
    const releases = await fetchAllReleases(async (page) =>
      page === 1 ? batch(100) : [],
    );
    expect(releases).toHaveLength(100);
  });

  it("fails instead of truncating when every page is full", async () => {
    await expect(fetchAllReleases(async () => batch(100), 3)).rejects.toThrow(
      /refusing to truncate/,
    );
  });
});

describe("writeOutputsAtomically (issue #29, item 17)", () => {
  it("writes every output once all of them are staged", async () => {
    const root = mkdtempSync(join(tmpdir(), "oxide-sync-"));
    await writeOutputsAtomically(root, [
      ["a.txt", "A"],
      ["nested/b.txt", "B"],
    ]);
    expect(readFileSync(join(root, "a.txt"), "utf8")).toBe("A");
    expect(readFileSync(join(root, "nested/b.txt"), "utf8")).toBe("B");
  });

  it("leaves the previous files in place when staging fails", async () => {
    const root = mkdtempSync(join(tmpdir(), "oxide-sync-"));
    await writeOutputsAtomically(root, [["a.txt", "old"]]);
    writeFileSync(join(root, "blocked"), "not a directory");
    await expect(
      writeOutputsAtomically(root, [
        ["a.txt", "new"],
        ["blocked/x.txt", "X"],
      ]),
    ).rejects.toThrow();
    expect(readFileSync(join(root, "a.txt"), "utf8")).toBe("old");
  });
});

describe("syncOxide: unresolved installers are reported (issue #29, item 15)", () => {
  it("warns instead of silently falling back to the release page", async () => {
    const logs = [];
    const { snapshot } = await run(source(), {
      releases: [
        {
          ...STABLE,
          assets: STABLE.assets.filter((a) => a.name === "Oxide.dmg"),
        },
      ],
      logs,
    });
    expect(snapshot.release.latest.assets.windows.name).toBeNull();
    expect(logs).toContain(
      "Warning: no Windows x64 installer asset (Oxide-x64.exe) in v1.1.0: the button falls back to the release page.",
    );
  });
});
