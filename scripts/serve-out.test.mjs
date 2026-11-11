import { describe, expect, it } from "vitest";
import { decodePath } from "./serve-out.mjs";

// Issue #29, item 16: a malformed percent-escape used to throw out of the
// request handler. It must answer 404 like any other unknown path.
describe("decodePath", () => {
  it("decodes a normal path", () => {
    expect(decodePath("/docs/quick-start")).toBe("/docs/quick-start");
    expect(decodePath("/caf%C3%A9")).toBe("/café");
  });

  it("returns null for a malformed percent-escape instead of throwing", () => {
    for (const path of ["/%E0%A4%A", "/%ZZ", "/%", "/%C3"]) {
      expect(decodePath(path), path).toBeNull();
    }
  });
});
