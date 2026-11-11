import { describe, expect, it } from "vitest";
import {
  CLICK_EVENTS,
  GOATCOUNTER_ENDPOINT,
  GOATCOUNTER_ORIGINS,
  GOATCOUNTER_SCRIPT,
} from "./measurement";

describe("measurement", () => {
  it("freezes the four click event names", () => {
    expect([...CLICK_EVENTS]).toEqual([
      "download-macos-arm",
      "download-windows",
      "download-linux",
      "github-cta",
    ]);
  });

  it("talks to GoatCounter origins only, over https", () => {
    for (const url of [GOATCOUNTER_SCRIPT, GOATCOUNTER_ENDPOINT]) {
      const { protocol, origin } = new URL(url);
      expect(protocol).toBe("https:");
      expect(GOATCOUNTER_ORIGINS).toContain(origin);
    }
  });
});
