// Measurement plan (#16), Budgets > Third parties: GoatCounter counts page
// views and four click events, without cookies. It is the only third-party
// origin the site may contact.

/** The local fallback while Lorenzo has not supplied the real site code. */
export const GOATCOUNTER_PLACEHOLDER = "oxide";

/** GoatCounter site codes are one DNS label; anything else is a mistake. */
const SITE_CODE = /^[a-z0-9](?:[a-z0-9-]{0,62})$/i;

/**
 * The site code and its production guard, as a pure function so the build's
 * behaviour can be tested. A production build may not ship the placeholder:
 * setting the env var to it is rejected, leaving it unset warns loudly. The
 * local fallback stays so dev, test builds and CI export work before Lorenzo
 * creates the site (issue #29, item 7).
 */
export function goatcounterConfig(
  configured: string | undefined,
  production: boolean,
): { code: string; placeholder: boolean; warning: string | null } {
  const code = configured?.trim();
  if (!code) {
    return {
      code: GOATCOUNTER_PLACEHOLDER,
      placeholder: true,
      warning: production
        ? `NEXT_PUBLIC_GOATCOUNTER_CODE is unset: this production build counts into the placeholder GoatCounter site "${GOATCOUNTER_PLACEHOLDER}".`
        : null,
    };
  }
  if (!SITE_CODE.test(code)) {
    throw new Error(
      `NEXT_PUBLIC_GOATCOUNTER_CODE is not a GoatCounter site code: ${code}`,
    );
  }
  if (code === GOATCOUNTER_PLACEHOLDER) {
    if (production) {
      throw new Error(
        `NEXT_PUBLIC_GOATCOUNTER_CODE is still the placeholder "${GOATCOUNTER_PLACEHOLDER}" in a production build.`,
      );
    }
    return { code, placeholder: true, warning: null };
  }
  return { code, placeholder: false, warning: null };
}

// Next inlines `NEXT_PUBLIC_*` at build time; keep the literal reference.
const CONFIG = goatcounterConfig(
  process.env.NEXT_PUBLIC_GOATCOUNTER_CODE,
  process.env.NODE_ENV === "production",
);
if (CONFIG.warning) console.warn(`Measurement: ${CONFIG.warning}`);

/** The site code of Lorenzo's GoatCounter site, or the local fallback. */
export const GOATCOUNTER_CODE = CONFIG.code;

/** GoatCounter's counter script, loaded async on every page. */
export const GOATCOUNTER_SCRIPT = "https://gc.zgo.at/count.js";

/** Where the script sends page views and events. */
export const GOATCOUNTER_ENDPOINT = `https://${GOATCOUNTER_CODE}.goatcounter.com/count`;

/** The origins the site may contact besides itself: the script and the counter. */
export const GOATCOUNTER_ORIGINS = [
  "https://gc.zgo.at",
  `https://${GOATCOUNTER_CODE}.goatcounter.com`,
] as const;

/** The click events the Measurement plan freezes. Names never change. */
export const CLICK_EVENTS = [
  "download-macos-arm",
  "download-windows",
  "download-linux",
  "github-cta",
] as const;

export type ClickEvent = (typeof CLICK_EVENTS)[number];
