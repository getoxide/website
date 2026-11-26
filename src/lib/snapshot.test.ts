import { describe, expect, it } from "vitest";
import source from "../../content/oxide/source.json";
import { SNAPSHOT, tokensOf, type Snapshot } from "./snapshot";

const asset = (name: string, size: number) => ({
  name,
  url: `https://github.com/getoxide/oxide/releases/latest/download/${name}`,
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
      macos: asset("Oxide.dmg", 101_234_567),
      windows: asset("Oxide-x64.exe", 88_765_432),
      windowsArm64: asset("Oxide-arm64.exe", 86_543_210),
      linux: asset("Oxide-x64.AppImage", 94_263_800),
      linuxDeb: asset("Oxide-x64.deb", 16_894_530),
      linuxRpm: asset("Oxide-x64.rpm", 16_899_955),
      linuxArm64: asset("Oxide-arm64.AppImage", 92_580_360),
      linuxArm64Deb: asset("Oxide-arm64.deb", 17_240_882),
      linuxArm64Rpm: asset("Oxide-arm64.rpm", 17_245_847),
    },
  },
  platforms: [
    "macOS on Apple Silicon",
    "Windows (x64, arm64)",
    "Linux (x64, arm64)",
  ],
  platformsFrom: "release",
});

describe("tokens (Copy deck, Tokens)", () => {
  it("⟨definition⟩ and ⟨requirements⟩ are the README sections", () => {
    const token = tokensOf(SNAPSHOT);
    expect(token("definition")).toBe(SNAPSHOT.readme.definition);
    expect(token("requirements")).toBe(SNAPSHOT.readme.requirements);
  });

  it("⟨platforms⟩ joins the supported platforms in a sentence", () => {
    expect(tokensOf(STABLE)("platforms")).toBe(
      "macOS on Apple Silicon, Windows (x64, arm64) and Linux (x64, arm64)",
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
    expect(token("asset-size:linux")).toBe("94.3 MB");
  });

  it("before a stable release there is no version or date to show", () => {
    const none = withRelease({
      state: "none",
      releasesUrl: "https://github.com/getoxide/oxide/releases",
      latest: null,
      platforms: [
        "macOS on Apple Silicon",
        "Windows (x64, arm64)",
        "Linux (x64, arm64)",
      ],
      platformsFrom: "readme",
    });
    for (const name of [
      "version",
      "release-date",
      "asset-size:macos",
      "asset-size:windows",
      "asset-size:linux",
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
