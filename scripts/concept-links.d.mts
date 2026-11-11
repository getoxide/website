// Types for the TypeScript tests that check derived Markdown against the gate.
export function checkConceptLinks(page: {
  path: string;
  html: string;
  concepts: { term: string; id: string }[];
}): string[];
export function mentionOf(term: string): RegExp;
