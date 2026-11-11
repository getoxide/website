// PROTOTYPE data. Strings are copied from docs/spec/copy.md (locked); the real build reads them from PAGES.
export const HOST = "oxide.cavallinilorenzo.com";
export const SITE_NAME = "Oxide";
export const HERO = "Agentic coding, from prompt to merge."; // rejected by Lorenzo, kept for /-page data only

// Round 2 (rejected by Lorenzo: too narrow, review-only or generic):
// 1 See what your coding agents actually did. · 2 Know what was checked before you merge.
// 3 Your agents write the code. You decide what merges. · 4 Claude Code and Codex, in one desktop app.
// 5 One window for every coding agent you use. · 6 Review every agent change before it lands.

// Round 3: Lorenzo's brief: the main, most complete app for agentic coding; professional, not vibe coding;
// see what is really happening, open pull requests, a 360° view from prompt to merge, agents talking to GitHub.
// Headline + subline pairs. Proposals, not locked copy.
export const HEADLINES = [
  { id: "7", angle: "Complete", text: "The complete desktop app for agentic coding.",
    sub: "Prompt, review, pull request and merge, with Claude Code, Codex and Antigravity CLI." },
  { id: "8", angle: "Everything in one app", text: "Everything agentic coding needs, in one app.",
    sub: "Claude Code, Codex and Antigravity CLI with the editor, terminal, Git and GitHub around them." },
  { id: "9", angle: "Professional", text: "Agentic coding, done professionally.",
    sub: "See every change, every check and every pull request, from the first prompt to the merge." },
  { id: "10", angle: "Beyond the prompt", text: "Agentic coding beyond the prompt.",
    sub: "See what the agent changed and what actually ran, then take it to a reviewed pull request." },
  { id: "11", angle: "Agents meet GitHub", text: "Where your agents and GitHub work together.",
    sub: "Drive Claude Code, Codex and Antigravity CLI, review each change, open the pull request and merge." },
  { id: "12", angle: "The whole loop", text: "From the first prompt to the merged pull request.",
    sub: "One desktop app for Claude Code, Codex and Antigravity CLI, with every change in view." },
];

export const PAGES = [
  { path: "/", h1: HERO, title: "Oxide: the desktop app for Claude Code and Codex",
    desc: "Oxide drives Claude Code, Codex and Antigravity CLI from one desktop app and shows what each change touched and what was actually checked before you merge." },
  { path: "/features", h1: "Everything between the prompt and the merge", title: "Features: review, diff and restore agent changes · Oxide",
    desc: "See what each agent Turn changed, which checks actually ran and what stayed unverified, then comment, revert or restore before you merge. Every Oxide feature." },
  { path: "/claude-code-gui", h1: "A Claude Code GUI for reviewing what the agent changed", title: "Claude Code GUI: an open-source desktop app · Oxide",
    desc: "Oxide is an open-source desktop GUI for Claude Code: keep your claude login and sessions, and see each Turn's diff and what was actually checked." },
  { path: "/codex-gui", h1: "A Codex GUI that shows what actually ran", title: "Codex GUI: a desktop app for the Codex CLI · Oxide",
    desc: "Is there a GUI for Codex? Oxide is an open-source desktop app that drives the codex CLI you already use and shows which checks ran before you merge." },
  { path: "/guides/review-ai-generated-code", h1: "How to review AI-generated code before you merge", title: "How to review AI-generated code · Oxide",
    desc: "A four-step method to review AI-generated code: read one Turn at a time, check what actually ran, send feedback where it belongs, undo what you don't want." },
  { path: "/guides/claude-code-and-codex-together", h1: "Claude Code and Codex together: one writes, the other reviews", title: "Claude Code and Codex together, with Blind review · Oxide",
    desc: "Use Claude Code and Codex together: let one agent write the change and have the other review only the diff and the issue, never the original conversation." },
  { path: "/docs/quick-start", h1: "Quick start", title: "Quick start · Oxide",
    desc: "Install a Provider, open a Project, start a Thread, review the Turn in the Diff Surface, then commit, push and open the pull request. Oxide in five steps." },
  { path: "/faq", h1: "Frequently asked questions", title: "FAQ · Oxide",
    desc: "Answers about Oxide, the open-source desktop app for Claude Code and Codex: what it is, what it is not, where your code goes and how it differs." },
  { path: "/changelog", h1: "Changelog", title: "Changelog · Oxide",
    desc: "Every stable Oxide release, newest first: breaking changes, new features and fixes, with a link to the full release notes on GitHub for each version." },
  { path: "/download", h1: "Download Oxide", title: "Download · Oxide",
    desc: "Download the Oxide desktop app from GitHub Releases, verify the file, and connect the Claude Code, Codex or Antigravity CLI you already have installed." },
];

/** og:title per mode. */
export function ogTitle(page, mode) {
  if (mode === "full") return page.title;
  if (mode === "h1") return page.h1;
  // "bare": <title> without the " · Oxide" suffix; the home title is already brand-first
  return page.title.replace(/ · Oxide$/, "");
}

export const slug = (path) => (path === "/" ? "home" : path.slice(1).replaceAll("/", "--"));
