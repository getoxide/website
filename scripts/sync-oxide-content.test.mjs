import { describe, expect, it } from "vitest";
import { extractConcepts, extractSection } from "./sync-oxide.mjs";

const GLOSSARY = `# Oxide

A desktop app for agentic engineering.

## Language

## Projects

**Project**:
A folder holding a Git repository.
_Avoid_: Workspace, repo

**Open Project**:
A Project the user opened.
_Avoid_: Pinned

## Threads

**Thread**:
One conversation with a single Provider. \`/clear\` starts a new Thread. See ADR-0005.
_Avoid_: Agent, session

**Turn**:
One user prompt in a Thread
and everything the Provider does in response.
_Avoid_: Run

**Checkpoint**:
A snapshot of a Thread's files.

## Review

**Verification Dossier**:
The account of a change's intent, evidence and risk signals.
_Avoid_: Report

**Blind review**:
A review of a change by a Provider session that received only the diff.

## Providers

**Provider**:
An agent CLI that Oxide drives: Claude Code, Codex, or Antigravity CLI (\`agy\`).
_Avoid_: Agent

## Layout

**Surface**:
One of the five tools in the right dock.

**Restore**:
Putting the selected Thread's files back.
_Avoid_: Rewind
`;

describe("extractConcepts", () => {
  it("takes the nine allowlisted terms in allowlist order, definitions verbatim, _Avoid_ lines stripped", () => {
    const { concepts } = extractConcepts(GLOSSARY);
    expect(concepts.map((c) => c.term)).toEqual([
      "Project",
      "Thread",
      "Turn",
      "Provider",
      "Surface",
      "Checkpoint",
      "Verification Dossier",
      "Blind review",
      "Restore",
    ]);
    expect(concepts.map((c) => c.id)).toEqual([
      "project",
      "thread",
      "turn",
      "provider",
      "surface",
      "checkpoint",
      "verification-dossier",
      "blind-review",
      "restore",
    ]);
    expect(concepts[1].definition).toBe(
      "One conversation with a single Provider. `/clear` starts a new Thread. See ADR-0005.",
    );
    expect(concepts[2].definition).toBe(
      "One user prompt in a Thread\nand everything the Provider does in response.",
    );
    expect(concepts.some((c) => c.definition.includes("_Avoid_"))).toBe(false);
  });

  it("lists the glossary terms that are not on the allowlist", () => {
    expect(extractConcepts(GLOSSARY).unlisted).toEqual(["Open Project"]);
  });

  it("fails loudly when an allowlisted term is missing", () => {
    const glossary = GLOSSARY.replace("**Turn**:", "**Round**:");
    expect(() => extractConcepts(glossary)).toThrow(/Turn/);
  });

  it("fails when an allowlisted term has no definition", () => {
    const glossary = GLOSSARY.replace(
      "**Surface**:\nOne of the five tools in the right dock.\n",
      "**Surface**:\n",
    );
    expect(() => extractConcepts(glossary)).toThrow(/Surface.*definition/);
  });
});

describe("extractSection", () => {
  it("returns the text between the exact site markers, trimmed", () => {
    const readme = [
      "## What is Oxide?",
      "",
      "<!-- site:definition -->",
      "",
      "Oxide is a desktop app.",
      "",
      "<!-- /site:definition -->",
      "",
      "Most agent tools…",
    ].join("\n");
    expect(extractSection(readme, "definition")).toBe(
      "Oxide is a desktop app.",
    );
  });

  it("ignores a bare `site:` mention, such as the README's top note", () => {
    const readme = [
      "<!-- The site:* markers below feed the Oxide website.",
      "     Do not remove site:definition or rename it. -->",
      "",
      "Intro site:definition text.",
      "<!-- site:definition -->",
      "The real definition.",
      "<!-- /site:definition -->",
    ].join("\n");
    expect(extractSection(readme, "definition")).toBe("The real definition.");
  });

  it("does not take a longer key for a shorter one", () => {
    const readme = [
      "<!-- site:quick-start-extra -->",
      "Wrong.",
      "<!-- /site:quick-start-extra -->",
      "<!-- site:quick-start -->",
      "Right.",
      "<!-- /site:quick-start -->",
    ].join("\n");
    expect(extractSection(readme, "quick-start")).toBe("Right.");
  });

  it("fails loudly when a marker is missing", () => {
    expect(() => extractSection("no markers", "faq")).toThrow(
      /site:faq.*missing/,
    );
    expect(() => extractSection("<!-- site:faq -->\nQ?\n", "faq")).toThrow(
      /\/site:faq.*missing/,
    );
  });

  it("fails when a marker appears twice", () => {
    const readme =
      "<!-- site:faq -->a<!-- /site:faq -->\n<!-- site:faq -->b<!-- /site:faq -->";
    expect(() => extractSection(readme, "faq")).toThrow(/more than once/);
  });

  it("fails when the marked section is empty", () => {
    expect(() =>
      extractSection("<!-- site:faq -->\n\n<!-- /site:faq -->", "faq"),
    ).toThrow(/empty/);
  });
});
