/**
 * The inline script that opts a page into hidden start states (ADR-0001, Rules
 * that follow: "their hidden start state applies only when JavaScript runs and
 * motion is allowed"). It sets `html[data-motion]`, which the reveal CSS keys
 * on; without JavaScript, or under `prefers-reduced-motion`, nothing is ever
 * hidden. Plain ES5, kept tiny; a page with reveals renders it before them.
 */
export const MOTION_SCRIPT = `try{if(!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.dataset.motion=""}catch(e){}`;
