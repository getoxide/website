import { describe, expect, it } from "vitest";
import {
  CLICK_EVENTS,
  GOATCOUNTER_ENDPOINT,
  GOATCOUNTER_ORIGINS,
  GOATCOUNTER_PLACEHOLDER,
  GOATCOUNTER_SCRIPT,
  goatcounterConfig,
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

describe("goatcounterConfig (issue #29, item 7)", () => {
  it("uses the env-configured site code", () => {
    expect(goatcounterConfig("lorenzo-oxide", true)).toEqual({
      code: "lorenzo-oxide",
      placeholder: false,
      warning: null,
    });
    expect(goatcounterConfig("  lorenzo-oxide  ", false).code).toBe(
      "lorenzo-oxide",
    );
  });

  it("keeps the local fallback outside production, without a warning", () => {
    expect(goatcounterConfig(undefined, false)).toEqual({
      code: GOATCOUNTER_PLACEHOLDER,
      placeholder: true,
      warning: null,
    });
  });

  it("warns loudly when a production build leaves the code unset", () => {
    const config = goatcounterConfig(undefined, true);
    expect(config.placeholder).toBe(true);
    expect(config.warning).toMatch(/NEXT_PUBLIC_GOATCOUNTER_CODE/);
    expect(config.warning).toMatch(/placeholder/);
  });

  it("rejects the placeholder as an explicit production value", () => {
    expect(() => goatcounterConfig(GOATCOUNTER_PLACEHOLDER, true)).toThrow(
      /placeholder/,
    );
  });

  it("rejects a value that is not a site code", () => {
    expect(() => goatcounterConfig("has spaces", true)).toThrow(/site code/);
  });
});
