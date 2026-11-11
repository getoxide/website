// Build-time syntax highlighting (Design system, Code block). Shiki runs only
// while the static export renders; the browser receives coloured spans and no
// highlighting JavaScript.
import {
  createHighlighter,
  type BundledLanguage,
  type Highlighter,
  type ThemeRegistration,
} from "shiki";

const v = (name: string) => `var(--ox-syntax-${name})`;

/**
 * The Shiki theme generated from the brand's `--ox-syntax-*` tokens: each
 * TextMate scope maps to one of the seven syntax roles, by custom property,
 * so the colours stay the synced brand values and no hex reaches the page.
 */
export const SYNTAX_THEME: ThemeRegistration = {
  name: "oxide-syntax",
  type: "dark",
  bg: "var(--ox-surface-background)",
  fg: v("identifier"),
  colors: {
    "editor.background": "var(--ox-surface-background)",
    "editor.foreground": v("identifier"),
  },
  settings: [
    { settings: { foreground: v("identifier") } },
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: v("comment") },
    },
    {
      scope: [
        "keyword",
        "storage",
        "storage.type",
        "storage.modifier",
        "keyword.control",
      ],
      settings: { foreground: v("keyword") },
    },
    {
      scope: [
        "string",
        "string.quoted",
        "punctuation.definition.string",
        "string.template",
      ],
      settings: { foreground: v("string") },
    },
    {
      scope: [
        "constant.numeric",
        "constant.language",
        "constant.character",
        "constant.other",
      ],
      settings: { foreground: v("number") },
    },
    {
      scope: [
        "entity.name.type",
        "entity.name.class",
        "entity.other.inherited-class",
        "support.type",
        "support.class",
        "entity.name.tag",
      ],
      settings: { foreground: v("type") },
    },
    {
      scope: [
        "variable",
        "entity.name.function",
        "support.function",
        "meta.definition.variable",
      ],
      settings: { foreground: v("identifier") },
    },
    {
      scope: ["keyword.operator", "punctuation", "meta.brace"],
      settings: { foreground: v("operator") },
    },
  ],
};

/** Languages the docs, guides and changelog may fence code in. */
const LANGUAGES: BundledLanguage[] = [
  "sh",
  "bash",
  "shellscript",
  "powershell",
  "ts",
  "tsx",
  "js",
  "json",
  "toml",
  "yaml",
  "rust",
  "diff",
  "markdown",
];

let highlighter: Promise<Highlighter> | undefined;

function getHighlighter() {
  highlighter ??= createHighlighter({
    themes: [SYNTAX_THEME],
    langs: LANGUAGES,
  });
  return highlighter;
}

/**
 * Highlights `code` into a `<pre>` of coloured spans. An unknown or missing
 * language renders as plain, escaped text.
 */
export async function highlight(code: string, lang?: string): Promise<string> {
  const shiki = await getHighlighter();
  const known = lang && shiki.getLoadedLanguages().includes(lang);
  return shiki.codeToHtml(code, {
    lang: known ? lang : "text",
    theme: SYNTAX_THEME.name!,
  });
}
