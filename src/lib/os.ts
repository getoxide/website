/**
 * The visitor's platform as the Download block sees it (Download experience
 * #13, decision 3): it changes only the order and the look of the platform
 * buttons, never a link, and never redirects. `other` keeps the no-JS order.
 */
export type Os = "macos" | "windows" | "other";

/**
 * The inline script the Download block puts before its buttons: it sets
 * `html[data-os]` while the page is parsed, so CSS orders and styles the
 * buttons before first paint and nothing shifts. It never redirects or
 * downloads. iPads report a Mac user agent, so a touch screen rules macOS
 * out; Windows on ARM and every other platform stay `other`. Plain ES5, kept
 * tiny: it ships in the HTML of every page with a Download block.
 */
export const OS_SCRIPT = `try{var u=navigator.userAgent,o="other";if(/Windows NT/.test(u)&&!/ARM|aarch64/i.test(u))o="windows";else if(/Macintosh/.test(u)&&!(navigator.maxTouchPoints>1))o="macos";document.documentElement.dataset.os=o}catch(e){}`;
