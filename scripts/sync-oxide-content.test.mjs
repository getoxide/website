import { describe, expect, it } from "vitest";
import {
  extractConcepts,
  extractFeatures,
  extractSection,
  releaseData,
  rewriteLinks,
} from "./sync-oxide.mjs";

describe("extractFeatures", () => {
  it("keeps only the groups and the bold lead-ins, without their final period", () => {
    const features = [
      "### One app, every agent CLI",
      "",
      "- **Multiple Providers.** Use [Claude Code](https://x) side by side.",
      "- **Threads.** Each Thread is one conversation.",
      "",
      "### Review before you merge",
      "",
      "- **Diff by Turn, Uncommitted or Branch.** See exactly what changed.",
      "- **Verification Dossier.** An account of the change.",
    ].join("\n");
    expect(extractFeatures(features)).toEqual([
      {
        group: "One app, every agent CLI",
        leadIns: ["Multiple Providers", "Threads"],
      },
      {
        group: "Review before you merge",
        leadIns: [
          "Diff by Turn, Uncommitted or Branch",
          "Verification Dossier",
        ],
      },
    ]);
  });

  it("fails on a feature bullet with no bold lead-in", () => {
    expect(() =>
      extractFeatures("### Group\n\n- Plain bullet with no lead-in."),
    ).toThrow(/lead-in/);
  });

  it("fails on a group with no features, or features before any group", () => {
    expect(() => extractFeatures("### Empty\n\n### Full\n- **A.** a")).toThrow(
      /Empty/,
    );
    expect(() => extractFeatures("- **A.** a")).toThrow(/group/);
  });
});

describe("rewriteLinks", () => {
  const BLOB = "https://github.com/getoxide/oxide/blob/v1.2.3";

  it("makes relative repo links absolute GitHub URLs at the pinned ref", () => {
    expect(
      rewriteLinks(
        "Under the [MIT License](LICENSE), see [the ADR](docs/adr/0010-x.md) and [packaging](./docs/dictation.md#packaging).",
        "v1.2.3",
      ),
    ).toBe(
      `Under the [MIT License](${BLOB}/LICENSE), see [the ADR](${BLOB}/docs/adr/0010-x.md) and [packaging](${BLOB}/docs/dictation.md#packaging).`,
    );
  });

  it("links a directory as a tree and an image to its raw file", () => {
    expect(
      rewriteLinks("[ADRs](docs/adr/) ![Logo](assets/logo.svg)", "v1.2.3"),
    ).toBe(
      "[ADRs](https://github.com/getoxide/oxide/tree/v1.2.3/docs/adr/) ![Logo](https://raw.githubusercontent.com/getoxide/oxide/v1.2.3/assets/logo.svg)",
    );
  });

  it("maps README anchors the site hosts to site URLs, the rest to the README on GitHub", () => {
    expect(
      rewriteLinks(
        "[reqs](#requirements) [start](#quick-start) [faq](#faq) [build](#build-from-source)",
        "main",
      ),
    ).toBe(
      "[reqs](/docs/quick-start#requirements) [start](/docs/quick-start) [faq](/faq) [build](https://github.com/getoxide/oxide/blob/main/README.md#build-from-source)",
    );
  });

  it("leaves absolute URLs, mail links and inline code alone", () => {
    const md =
      '[Tauri](https://tauri.app) [mail](mailto:a@b.c) `[x](LICENSE)` [cli](https://cli.github.com "GitHub CLI")';
    expect(rewriteLinks(md, "main")).toBe(md);
  });

  it("rewrites HTML href and src attributes the same way", () => {
    expect(
      rewriteLinks(
        '<a href="CONTRIBUTING.md">C</a> <img src="assets/a.png">',
        "main",
      ),
    ).toBe(
      '<a href="https://github.com/getoxide/oxide/blob/main/CONTRIBUTING.md">C</a> <img src="https://raw.githubusercontent.com/getoxide/oxide/main/assets/a.png">',
    );
  });
});

const INSTALL = `| Platform | File | Notes |
| --- | --- | --- |
| macOS (Apple Silicon) | \`Oxide_<version>_aarch64.dmg\` | Drag \`Oxide.app\` into \`/Applications\`. |
| Windows 10/11 (x64) | \`Oxide_<version>_x64-setup.exe\` | Includes CPU and GPU dictation. |`;

const DL = "https://github.com/getoxide/oxide/releases/download";
const PAGE = "https://github.com/getoxide/oxide/releases/tag";

/** A GitHub Releases API entry, as `GET /repos/{repo}/releases` returns it. */
function release(tag, { prerelease = false, assets, body = "", date } = {}) {
  const version = tag.replace(/^v/, "");
  return {
    tag_name: tag,
    name: `Oxide ${version}`,
    draft: false,
    prerelease,
    published_at: date ?? "2026-12-01T09:30:00Z",
    html_url: `${PAGE}/${tag}`,
    body,
    assets: (
      assets ?? [
        [`Oxide_${version}_aarch64.dmg`, 101_234_567],
        [`Oxide_${version}_aarch64.app.tar.gz`, 99_000_000],
        [`Oxide_${version}_x64-setup.exe`, 88_765_432],
        ["latest.json", 1_234],
        ["SHA256SUMS.txt", 900],
      ]
    ).map(([name, size]) => ({
      name,
      size,
      browser_download_url: `${DL}/${tag}/${name}`,
    })),
  };
}

const NOTES = `### Breaking changes

- **core:** drop the old Transcript format ([#501](https://github.com/getoxide/oxide/pull/501))

### Features

- **diff:** Turn scope for worktrees ([#498](https://github.com/getoxide/oxide/pull/498))
- Line comments on deleted lines

### Fixes

- **terminal:** keep the cwd after a restart

### Dependencies

- bump tauri to 2.9

**Full changelog:** https://github.com/getoxide/oxide/compare/v1.0.0...v1.1.0

### Platform signing

- macOS: ad-hoc signed.
`;

describe("releaseData", () => {
  it("no release: state none, platforms from the README Install table, no changelog", () => {
    const data = releaseData([], { install: INSTALL });
    expect(data.release).toEqual({
      state: "none",
      releasesUrl: "https://github.com/getoxide/oxide/releases",
      latest: null,
      platforms: ["macOS on Apple Silicon", "Windows x64"],
      platformsFrom: "readme",
    });
    expect(data.changelog).toEqual([]);
    expect(data.stableTag).toBeNull();
  });

  it("only a release candidate: state prerelease-only, the candidate as latest, no changelog", () => {
    const data = releaseData(
      [
        release("v1.0.0-rc.1", {
          prerelease: true,
          date: "2026-11-20T08:00:00Z",
        }),
      ],
      { install: INSTALL },
    );
    expect(data.release.state).toBe("prerelease-only");
    expect(data.release.latest).toEqual({
      version: "1.0.0-rc.1",
      tag: "v1.0.0-rc.1",
      date: "2026-11-20",
      url: `${PAGE}/v1.0.0-rc.1`,
      prerelease: true,
      assets: {
        macos: {
          name: "Oxide_1.0.0-rc.1_aarch64.dmg",
          url: `${DL}/v1.0.0-rc.1/Oxide_1.0.0-rc.1_aarch64.dmg`,
          size: 101_234_567,
        },
        windows: {
          name: "Oxide_1.0.0-rc.1_x64-setup.exe",
          url: `${DL}/v1.0.0-rc.1/Oxide_1.0.0-rc.1_x64-setup.exe`,
          size: 88_765_432,
        },
      },
    });
    expect(data.release.platforms).toEqual([
      "macOS on Apple Silicon",
      "Windows x64",
    ]);
    expect(data.release.platformsFrom).toBe("release");
    expect(data.changelog).toEqual([]);
    expect(data.stableTag).toBeNull();
  });

  it("stable: the newest stable release wins over a newer candidate and older stables", () => {
    const data = releaseData(
      [
        release("v1.2.0-rc.1", {
          prerelease: true,
          date: "2026-12-20T00:00:00Z",
        }),
        release("v1.1.0", { body: NOTES, date: "2026-12-10T00:00:00Z" }),
        release("v1.0.0", {
          body: "No changes since v1.0.0-rc.1.\n\n**Full changelog:** x\n",
          date: "2026-12-01T00:00:00Z",
        }),
        release("v1.0.0-rc.1", {
          prerelease: true,
          date: "2026-11-20T00:00:00Z",
        }),
      ],
      { install: INSTALL },
    );
    expect(data.release.state).toBe("stable");
    expect(data.stableTag).toBe("v1.1.0");
    expect(data.release.latest?.version).toBe("1.1.0");
    expect(data.release.latest?.date).toBe("2026-12-10");
    expect(data.release.latest?.prerelease).toBe(false);
    expect(data.release.latest?.assets.windows.size).toBe(88_765_432);
  });

  it("the changelog lists stable releases only, newest first, with Breaking, Features and Fixes", () => {
    const { changelog } = releaseData(
      [
        release("v1.2.0-rc.1", { prerelease: true }),
        release("v1.1.0", { body: NOTES, date: "2026-12-10T00:00:00Z" }),
        release("v1.0.0", {
          body: "No changes.\n\n**Full history:** x\n",
          date: "2026-12-01T00:00:00Z",
        }),
      ],
      { install: INSTALL },
    );
    expect(changelog).toEqual([
      {
        version: "1.1.0",
        tag: "v1.1.0",
        date: "2026-12-10",
        url: `${PAGE}/v1.1.0`,
        breaking:
          "- **core:** drop the old Transcript format ([#501](https://github.com/getoxide/oxide/pull/501))",
        features:
          "- **diff:** Turn scope for worktrees ([#498](https://github.com/getoxide/oxide/pull/498))\n- Line comments on deleted lines",
        fixes: "- **terminal:** keep the cwd after a restart",
      },
      {
        version: "1.0.0",
        tag: "v1.0.0",
        date: "2026-12-01",
        url: `${PAGE}/v1.0.0`,
        breaking: null,
        features: null,
        fixes: null,
      },
    ]);
  });

  it("ignores drafts and treats a -rc tag as a pre-release even if not flagged", () => {
    const draft = { ...release("v2.0.0"), draft: true };
    const data = releaseData([draft, release("v1.0.0-rc.2")], {
      install: INSTALL,
    });
    expect(data.release.state).toBe("prerelease-only");
    expect(data.release.latest?.tag).toBe("v1.0.0-rc.2");
  });

  it("an asset it cannot resolve falls back to the release page", () => {
    const data = releaseData(
      [
        release("v1.0.0", {
          assets: [
            ["Oxide_1.0.0_aarch64.dmg", 101],
            ["Oxide_0.9.0_x64-setup.exe", 88],
          ],
        }),
      ],
      { install: INSTALL },
    );
    expect(data.release.latest?.assets).toEqual({
      macos: {
        name: "Oxide_1.0.0_aarch64.dmg",
        url: `${DL}/v1.0.0/Oxide_1.0.0_aarch64.dmg`,
        size: 101,
      },
      windows: { name: null, url: `${PAGE}/v1.0.0`, size: null },
    });
    // Platforms follow the assets the release actually ships.
    expect(data.release.platforms).toEqual(["macOS on Apple Silicon"]);
    expect(data.release.platformsFrom).toBe("release");
  });

  it("a release with no installer at all keeps the README platforms", () => {
    const data = releaseData([release("v1.0.0", { assets: [] })], {
      install: INSTALL,
    });
    expect(data.release.platforms).toEqual([
      "macOS on Apple Silicon",
      "Windows x64",
    ]);
    expect(data.release.platformsFrom).toBe("readme");
  });

  it("fails when the README Install table names no known installer", () => {
    expect(() => releaseData([], { install: "| a | b |" })).toThrow(/platform/);
  });
});

const GLOSSARY = `# Oxide

A desktop app for agentic engineering.

## Language

## Projects

**Project**:
A folder holding a Git repository.
_Avoid_: Workspace, repo

**Open Project**:
A Project the user opened.
_Avoid_: Pinned

## Threads

**Thread**:
One conversation with a single Provider. \`/clear\` starts a new Thread. See ADR-0005.
_Avoid_: Agent, session

**Turn**:
One user prompt in a Thread
and everything the Provider does in response.
_Avoid_: Run

**Checkpoint**:
A snapshot of a Thread's files.

## Review

**Verification Dossier**:
The account of a change's intent, evidence and risk signals.
_Avoid_: Report

**Blind review**:
A review of a change by a Provider session that received only the diff.

## Providers

**Provider**:
An agent CLI that Oxide drives: Claude Code, Codex, or Antigravity CLI (\`agy\`).
_Avoid_: Agent

## Layout

**Surface**:
One of the five tools in the right dock.

**Restore**:
Putting the selected Thread's files back.
_Avoid_: Rewind
`;

describe("extractConcepts", () => {
  it("takes the nine allowlisted terms in allowlist order, definitions verbatim, _Avoid_ lines stripped", () => {
    const { concepts } = extractConcepts(GLOSSARY);
    expect(concepts.map((c) => c.term)).toEqual([
      "Project",
      "Thread",
      "Turn",
      "Provider",
      "Surface",
      "Checkpoint",
      "Verification Dossier",
      "Blind review",
      "Restore",
    ]);
    expect(concepts.map((c) => c.id)).toEqual([
      "project",
      "thread",
      "turn",
      "provider",
      "surface",
      "checkpoint",
      "verification-dossier",
      "blind-review",
      "restore",
    ]);
    expect(concepts[1].definition).toBe(
      "One conversation with a single Provider. `/clear` starts a new Thread. See ADR-0005.",
    );
    expect(concepts[2].definition).toBe(
      "One user prompt in a Thread\nand everything the Provider does in response.",
    );
    expect(concepts.some((c) => c.definition.includes("_Avoid_"))).toBe(false);
  });

  it("lists the glossary terms that are not on the allowlist", () => {
    expect(extractConcepts(GLOSSARY).unlisted).toEqual(["Open Project"]);
  });

  it("fails loudly when an allowlisted term is missing", () => {
    const glossary = GLOSSARY.replace("**Turn**:", "**Round**:");
    expect(() => extractConcepts(glossary)).toThrow(/Turn/);
  });

  it("fails when an allowlisted term has no definition", () => {
    const glossary = GLOSSARY.replace(
      "**Surface**:\nOne of the five tools in the right dock.\n",
      "**Surface**:\n",
    );
    expect(() => extractConcepts(glossary)).toThrow(/Surface.*definition/);
  });
});

describe("extractSection", () => {
  it("returns the text between the exact site markers, trimmed", () => {
    const readme = [
      "## What is Oxide?",
      "",
      "<!-- site:definition -->",
      "",
      "Oxide is a desktop app.",
      "",
      "<!-- /site:definition -->",
      "",
      "Most agent tools…",
    ].join("\n");
    expect(extractSection(readme, "definition")).toBe(
      "Oxide is a desktop app.",
    );
  });

  it("ignores a bare `site:` mention, such as the README's top note", () => {
    const readme = [
      "<!-- The site:* markers below feed the Oxide website.",
      "     Do not remove site:definition or rename it. -->",
      "",
      "Intro site:definition text.",
      "<!-- site:definition -->",
      "The real definition.",
      "<!-- /site:definition -->",
    ].join("\n");
    expect(extractSection(readme, "definition")).toBe("The real definition.");
  });

  it("does not take a longer key for a shorter one", () => {
    const readme = [
      "<!-- site:quick-start-extra -->",
      "Wrong.",
      "<!-- /site:quick-start-extra -->",
      "<!-- site:quick-start -->",
      "Right.",
      "<!-- /site:quick-start -->",
    ].join("\n");
    expect(extractSection(readme, "quick-start")).toBe("Right.");
  });

  it("fails loudly when a marker is missing", () => {
    expect(() => extractSection("no markers", "faq")).toThrow(
      /site:faq.*missing/,
    );
    expect(() => extractSection("<!-- site:faq -->\nQ?\n", "faq")).toThrow(
      /\/site:faq.*missing/,
    );
  });

  it("fails when a marker appears twice", () => {
    const readme =
      "<!-- site:faq -->a<!-- /site:faq -->\n<!-- site:faq -->b<!-- /site:faq -->";
    expect(() => extractSection(readme, "faq")).toThrow(/more than once/);
  });

  it("fails when the marked section is empty", () => {
    expect(() =>
      extractSection("<!-- site:faq -->\n\n<!-- /site:faq -->", "faq"),
    ).toThrow(/empty/);
  });
});
