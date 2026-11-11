// The general FAQ on /faq (Content #12 addendum, point 3): the README's list
// only, in its order; the site adds no questions. #43 builds the `FAQPage`
// structured data from the same list.
import type { Snapshot } from "./snapshot";

export type FaqEntry = {
  /** The question, plain text. */
  question: string;
  /** Anchor of the question's heading, GitHub-style (`#what-is-oxide`). */
  id: string;
  /** The answer, Markdown. */
  answer: string;
};

/** A question line of the README FAQ: one bold paragraph on its own line. */
const QUESTION = /^\*\*(.+)\*\*$/;

/** GitHub's heading slug: lowercase, punctuation dropped, spaces to `-`. */
const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s/g, "-");

/** The README FAQ of a Snapshot as question/answer pairs. */
export function faqOf(snapshot: Snapshot): FaqEntry[] {
  const entries: { question: string; lines: string[] }[] = [];
  for (const line of snapshot.readme.faq.split("\n")) {
    const question = QUESTION.exec(line.trim())?.[1];
    if (question) {
      entries.push({ question: question.trim(), lines: [] });
    } else if (entries.length) {
      entries.at(-1)!.lines.push(line);
    } else if (line.trim()) {
      throw new Error(`README FAQ has text before its first question: ${line}`);
    }
  }
  const seen = new Map<string, number>();
  return entries.map(({ question, lines }) => {
    const base = slug(question);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return {
      question,
      id: count ? `${base}-${count}` : base,
      answer: lines.join("\n").trim(),
    };
  });
}
