import { describe, expect, it } from "vitest";
import source from "../../content/oxide/source.json";
import {
  providerInstalls,
  SNAPSHOT,
  tokensOf,
  type Snapshot,
} from "./snapshot";

const asset = (name: string, size: number) => ({
  name,
  url: `https://github.com/getoxide/oxide/releases/download/v1.1.0/${name}`,
  size,
});

function withRelease(release: Snapshot["release"]): Snapshot {
  return { ...SNAPSHOT, release };
}

const STABLE = withRelease({
  state: "stable",
  releasesUrl: "https://github.com/getoxide/oxide/releases",
  latest: {
    version: "1.1.0",
    tag: "v1.1.0",
    date: "2026-12-10",
    url: "https://github.com/getoxide/oxide/releases/tag/v1.1.0",
    prerelease: false,
    assets: {
      macos: asset("Oxide_1.1.0_aarch64.dmg", 101_234_567),
      windows: asset("Oxide_1.1.0_x64-setup.exe", 88_765_432),
    },
  },
  platforms: ["macOS on Apple Silicon", "Windows x64"],
  platformsFrom: "release",
});

describe("tokens (Copy deck, Tokens)", () => {
  it("⟨definition⟩ and ⟨requirements⟩ are the marked README sections", () => {
    const token = tokensOf(SNAPSHOT);
    expect(token("definition")).toBe(SNAPSHOT.readme.definition);
    expect(token("requirements")).toBe(SNAPSHOT.readme.requirements);
  });

  it("⟨platforms⟩ joins the supported platforms in a sentence", () => {
    expect(tokensOf(STABLE)("platforms")).toBe(
      "macOS on Apple Silicon and Windows x64",
    );
    const one = withRelease({
      ...STABLE.release,
      platforms: ["Windows x64"],
    });
    expect(tokensOf(one)("platforms")).toBe("Windows x64");
  });

  it("⟨version⟩, ⟨release-date⟩ and ⟨asset-size:*⟩ come from a stable release", () => {
    const token = tokensOf(STABLE);
    expect(token("version")).toBe("1.1.0");
    expect(token("release-date")).toBe("10 December 2026");
    expect(token("asset-size:macos")).toBe("101.2 MB");
    expect(token("asset-size:windows")).toBe("88.8 MB");
  });

  it("before a stable release there is no version or date to show", () => {
    const none = withRelease({
      state: "none",
      releasesUrl: "https://github.com/getoxide/oxide/releases",
      latest: null,
      platforms: ["macOS on Apple Silicon", "Windows x64"],
      platformsFrom: "readme",
    });
    for (const name of [
      "version",
      "release-date",
      "asset-size:macos",
      "asset-size:windows",
    ] as const) {
      expect(tokensOf(none)(name), name).toBeNull();
    }
    const rc = withRelease({
      ...STABLE.release,
      state: "prerelease-only",
      latest: { ...STABLE.release.latest!, prerelease: true },
    });
    expect(tokensOf(rc)("version")).toBeNull();
    expect(tokensOf(rc)("release-date")).toBeNull();
    // The test pre-release's installers are real files with real sizes.
    expect(tokensOf(rc)("asset-size:macos")).toBe("101.2 MB");
  });

  it("an installer that could not be resolved has no size", () => {
    const unresolved = withRelease({
      ...STABLE.release,
      latest: {
        ...STABLE.release.latest!,
        assets: {
          ...STABLE.release.latest!.assets,
          windows: { name: null, url: "https://x", size: null },
        },
      },
    });
    expect(tokensOf(unresolved)("asset-size:windows")).toBeNull();
  });
});

describe("the committed Snapshot", () => {
  it("renders the definition token today", () => {
    expect(tokensOf(SNAPSHOT)("definition")).toMatch(/^Oxide is /);
  });

  // ADR-0003: one source. The site's links read source.json while the page
  // content reads the Snapshot; a drift between them would split the facts.
  it("agrees with content/oxide/source.json", () => {
    expect(SNAPSHOT.source.repo).toBe(source.repo);
    expect(SNAPSHOT.source.ref).toBe(source.ref);
    expect(SNAPSHOT.source.commit).toBe(source.commit);
  });

  it("records the commit a branch ref resolved to", () => {
    if (!/^v\d+\.\d+\.\d+$/.test(source.ref)) {
      expect(source.commit).toMatch(/^[0-9a-f]{40}$/);
    }
  });
});

describe("providerInstalls (Copy deck, `/download` → Bring your own agent)", () => {
  const requirements = [
    "| Provider | Command | Install |",
    "| --- | --- | --- |",
    "| Claude Code | `claude` | [docs.claude.com](https://docs.claude.com/en/docs/claude-code) |",
    "| Codex | `codex` | [github.com/openai/codex](https://github.com/openai/codex) |",
    "| Antigravity CLI | `agy` | Google Antigravity |",
    "",
    "`git` is required.",
  ].join("\n");

  it("reads each Provider's install cell from the Requirements table", () => {
    expect(providerInstalls(requirements)).toEqual([
      {
        provider: "Claude Code",
        install:
          "[docs.claude.com](https://docs.claude.com/en/docs/claude-code)",
      },
      {
        provider: "Codex",
        install: "[github.com/openai/codex](https://github.com/openai/codex)",
      },
      { provider: "Antigravity CLI", install: "Google Antigravity" },
    ]);
  });
});
