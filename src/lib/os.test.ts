import { describe, expect, it } from "vitest";
import { OS_SCRIPT } from "./os";

/** Runs the inline script against a fake browser; returns `html[data-os]`. */
function detect(userAgent: string, maxTouchPoints = 0): string | undefined {
  const html = { dataset: {} as Record<string, string> };
  new Function("navigator", "document", OS_SCRIPT)(
    { userAgent, maxTouchPoints },
    { documentElement: html },
  );
  return html.dataset.os;
}

const UA = {
  mac: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
  windows:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
  windowsArm:
    "Mozilla/5.0 (Windows NT 10.0; ARM64; rv:140.0) Gecko/20100101 Firefox/140.0",
  linux:
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
  android:
    "Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36",
  iphone:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1",
};

// Download experience #13, decision 3: the detected platform only reorders
// the buttons; anything the site cannot package for keeps the no-JS order.
describe("OS_SCRIPT", () => {
  it("finds macOS and Windows x64", () => {
    expect(detect(UA.mac)).toBe("macos");
    expect(detect(UA.windows)).toBe("windows");
  });

  it("does not take an iPad, which reports itself as a Mac, for macOS", () => {
    expect(detect(UA.mac, 5)).toBe("other");
    expect(detect(UA.iphone)).toBe("other");
  });

  it("leaves Linux, Android and Windows on ARM as other", () => {
    expect(detect(UA.linux)).toBe("other");
    expect(detect(UA.android)).toBe("other");
    expect(detect(UA.windowsArm)).toBe("other");
  });
});
