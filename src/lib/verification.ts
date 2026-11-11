// Google Search Console, URL-prefix property on SITE_URL (Measurement plan
// #16; Machine-readable layer #14). The HTML verification token is public.
// Lorenzo creates the property at launch and supplies the token through
// NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION; until then the tag ships with a
// clearly marked value, so verification needs no code change.

/** The local fallback while Lorenzo has not supplied the real token. */
export const SEARCH_CONSOLE_PLACEHOLDER = "search-console-verification-pending";

/**
 * The token and its production guard, as a pure function so the build's
 * behaviour can be tested. A production build may not ship the placeholder:
 * setting the env var to it is rejected, leaving it unset warns loudly (a
 * launch blocker, but not a build failure before Lorenzo creates the
 * property). Issue #29, item 8.
 */
export function verificationConfig(
  configured: string | undefined,
  production: boolean,
): { token: string; placeholder: boolean; warning: string | null } {
  const token = configured?.trim();
  if (!token) {
    return {
      token: SEARCH_CONSOLE_PLACEHOLDER,
      placeholder: true,
      warning: production
        ? "NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION is unset: this production build ships the placeholder Search Console token, so the property cannot verify."
        : null,
    };
  }
  if (token === SEARCH_CONSOLE_PLACEHOLDER) {
    if (production) {
      throw new Error(
        `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION is still the placeholder "${SEARCH_CONSOLE_PLACEHOLDER}" in a production build.`,
      );
    }
    return { token, placeholder: true, warning: null };
  }
  return { token, placeholder: false, warning: null };
}

// Next inlines `NEXT_PUBLIC_*` at build time; keep the literal reference.
const CONFIG = verificationConfig(
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  process.env.NODE_ENV === "production",
);
if (CONFIG.warning) console.warn(`Search Console: ${CONFIG.warning}`);

/** The `google-site-verification` meta tag's content. */
export const GOOGLE_SITE_VERIFICATION = CONFIG.token;
