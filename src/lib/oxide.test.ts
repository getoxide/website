import { describe, expect, it } from "vitest";
import source from "../../content/oxide/source.json";
import { LICENCE_URL, linkRefOf, OXIDE, readmeUrl } from "./oxide";

describe("Oxide GitHub links", () => {
  it("point at the synced ref, never a hardcoded branch", () => {
    const base = `https://github.com/${source.repo}/blob`;
    expect(readmeUrl("faq")).toBe(`${base}/${linkRefOf(source)}/README.md#faq`);
    expect(LICENCE_URL).toBe(`${base}/${linkRefOf(source)}/LICENSE`);
  });

  it("pin to the commit while no stable tag exists, to the tag once it does", () => {
    expect(linkRefOf({ ref: "main", commit: "b7339d7" })).toBe("b7339d7");
    expect(linkRefOf({ ref: "v1.2.3", commit: "b7339d7" })).toBe("v1.2.3");
  });

  it("has a commit for a branch ref, so the link cannot move", () => {
    if (source.ref === "main") {
      expect(source.commit).toMatch(/^[0-9a-f]{40}$/);
      expect(OXIDE.commit).toBe(source.commit);
    }
  });
});
