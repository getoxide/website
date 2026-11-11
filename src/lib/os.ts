/**
 * The visitor's platform as the Download block sees it (Download experience
 * #13, decision 3): it changes only the order and the look of the platform
 * buttons, never a link, and never redirects. `other` keeps the no-JS order.
 */
export type Os = "macos" | "windows" | "other";
