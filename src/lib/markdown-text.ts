// The plain text of one line of Markdown: marks, link targets and backticks
// dropped, whitespace collapsed. Used where a schema.org text field must not
// carry Markdown (the SoftwareApplication description, FAQ answers).
export function markdownText(markdown: string): string {
  return markdown
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/(^|[^\w])[*_]([^*_]+)[*_](?=[^\w]|$)/g, "$1$2")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/[\s\u0000]+/g, " ")
    .trim();
}
