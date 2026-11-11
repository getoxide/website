import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { COPY } from "./copy";

// Locked strings are checked against the Copy deck itself, an independent
// source: each must appear in its deck section verbatim, notation included.
const DECK = readFileSync(
  new URL("../../docs/spec/copy.md", import.meta.url),
  "utf8",
);

/** A `## ` section of the deck, up to the next one. */
const section = (heading: string) =>
  DECK.split(`\n## ${heading}`)[1].split("\n## ")[0];

describe("Copy deck parity", () => {
  it("the closing CTA block is verbatim", () => {
    const deck = section("Closing CTA block");
    const { heading, sentence, download, getOxide, github } = COPY.closingCta;
    expect(deck).toContain(`**Heading**: ${heading}`);
    expect(deck).toContain(`**Sentence**: ${sentence}`);
    expect(deck).toContain(`**Primary button**: ${download} →`);
    expect(deck).toContain(`**${getOxide}** →`);
    expect(deck).toContain(`**Secondary button**: ${github} →`);
  });

  it("the /download reassurance lines are verbatim", () => {
    const deck = section("`/download`");
    const { byoa, buttons, lines, signing, unsupported } = COPY.download;
    expect(deck).toContain(`**Heading**: ${byoa.heading}`);
    expect(deck).toContain(`**Sentence**: ${byoa.sentence}`);
    for (const label of [
      buttons.macos,
      buttons.windows,
      buttons.followGithub,
      buttons.buildFromSource,
    ]) {
      expect(deck).toContain(label);
    }
    expect(deck).toContain(buttons.prerelease("`⟨version⟩`"));
    expect(deck).toContain(
      `macOS "${buttons.sublabel.macos} · \`⟨asset-size:macos⟩\`"`,
    );
    expect(deck).toContain(
      `Windows "${buttons.sublabel.windows} · \`⟨asset-size:windows⟩\`"`,
    );
    expect(deck).toContain(lines.stable("`⟨version⟩`", "`⟨release-date⟩`"));
    expect(deck).toContain(`| ${lines.prerelease} |`);
    expect(deck).toContain(`| ${lines.none} |`);
    expect(deck).toContain(`**macOS**: ${signing.macos}\n`);
    expect(deck).toContain(`**Windows**: ${signing.windows}\n`);
    expect(deck).toContain(`**Verify link**: ${signing.verify}\n`);
    expect(deck).toContain(`- ${unsupported}\n`);
  });

  it("the /download page FAQ is verbatim, four questions with their anchors", () => {
    const deck = section("`/download`").split("### Page FAQ")[1];
    expect(COPY.download.faq).toHaveLength(4);
    for (const { question, id, answer } of COPY.download.faq) {
      expect(deck).toContain(`**${question}** \`#${id}\`\n${answer}\n`);
    }
  });
});
