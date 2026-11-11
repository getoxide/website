// Measurement plan (#16), Budgets > Third parties: GoatCounter counts page
// views and four click events, without cookies. It is the only third-party
// origin the site may contact.

/**
 * The site code of Lorenzo's GoatCounter site. A public identifier (it is in
 * every page's HTML), not a secret. TODO(#38): confirm it once the site exists.
 */
export const GOATCOUNTER_CODE = "oxide";

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
