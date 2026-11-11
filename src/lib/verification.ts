// Google Search Console, URL-prefix property on SITE_URL (Measurement plan
// #16; Machine-readable layer #14). The HTML verification token is public.
// Lorenzo creates the property at launch; until its token is set in the
// deployment environment the tag still ships with a clearly marked value, so
// verification needs no code change, only an env var.
export const GOOGLE_SITE_VERIFICATION =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
  "search-console-verification-pending";
