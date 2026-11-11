// Colour rule of the Design system (Tokens): every colour is a synced `--ox-*`
// brand token used directly, and the names must exist in the synced file.

const COLOUR_LITERAL =
  /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/gi;

function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

/** Names of the custom properties a brand tokens file defines. */
export function definedTokens(brandCss: string): Set<string> {
  const names = stripComments(brandCss).matchAll(/(--ox-[\w-]+)\s*:/g);
  return new Set([...names].map((m) => m[1]));
}

/**
 * Checks the site's stylesheets against the synced brand tokens.
 * @param files path -> CSS source
 * @returns human-readable violations, empty when the CSS follows the rule
 */
export function findTokenViolations(
  files: Record<string, string>,
  brandCss: string,
): string[] {
  const defined = definedTokens(brandCss);
  const violations: string[] = [];
  for (const [path, source] of Object.entries(files)) {
    const css = stripComments(source);
    for (const [, name] of css.matchAll(/var\(\s*(--ox-[\w-]+)/g)) {
      if (!defined.has(name)) {
        violations.push(
          `${path}: var(${name}) is not defined by the synced brand tokens`,
        );
      }
    }
    for (const [, value] of css.matchAll(/[-\w]+\s*:\s*([^;{}]+)/g)) {
      for (const [literal] of value.matchAll(COLOUR_LITERAL)) {
        violations.push(`${path}: colour literal ${literal}`);
      }
    }
  }
  return violations;
}
