// PROTOTYPE data. Strings are copied from docs/spec/copy.md (locked); the real build reads them from PAGES.
export const HOST = "oxide.cavallinilorenzo.com";
export const SITE_NAME = "Oxide";
export const HERO = "Agentic coding, from prompt to merge."; // rejected by Lorenzo, kept for /-page data only

// Round 2: headline candidates for the B card (and the hero). Proposals, not locked copy.
export const HEADLINES = [
  { id: "1", angle: "What the agent did", text: "See what your coding agents actually did." },
  { id: "2", angle: "What was checked", text: "Know what was checked before you merge." },
  { id: "3", angle: "Who decides", text: "Your agents write the code. You decide what merges." },
  { id: "4", angle: "Name the agents", text: "Claude Code and Codex, in one desktop app." },
  { id: "5", angle: "One window", text: "One window for every coding agent you use." },
  { id: "6", angle: "Review before it lands", text: "Review every agent change before it lands." },
];
export const PRODUCT_LINE = "Desktop app for Claude Code, Codex and Antigravity CLI";

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
