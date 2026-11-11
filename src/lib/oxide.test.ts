import { describe, expect, it } from "vitest";
import { readmeUrl } from "./oxide";

describe("readmeUrl", () => {
  it("points at a README section on GitHub at the synced ref", () => {
    // content/oxide/source.json pins `main` until a stable tag exists.
    expect(readmeUrl("faq")).toBe(
      "https://github.com/getoxide/oxide/blob/main/README.md#faq",
    );
  });
});
