import { describe, expect, it } from "vitest";
import { SEARCH_CONSOLE_PLACEHOLDER, verificationConfig } from "./verification";

// Issue #29, item 8: the token is env-driven, and a production build either
// has a real one or says loudly that the placeholder is still shipping.
describe("verificationConfig", () => {
  it("uses the env-configured token", () => {
    expect(verificationConfig("abc123", true)).toEqual({
      token: "abc123",
      placeholder: false,
      warning: null,
    });
  });

  it("keeps the local fallback outside production", () => {
    expect(verificationConfig(undefined, false)).toEqual({
      token: SEARCH_CONSOLE_PLACEHOLDER,
      placeholder: true,
      warning: null,
    });
  });

  it("warns loudly when a production build leaves the token unset", () => {
    const config = verificationConfig(undefined, true);
    expect(config.token).toBe(SEARCH_CONSOLE_PLACEHOLDER);
    expect(config.warning).toMatch(/NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION/);
  });

  it("rejects the placeholder as an explicit production value", () => {
    expect(() => verificationConfig(SEARCH_CONSOLE_PLACEHOLDER, true)).toThrow(
      /placeholder/,
    );
  });
});
