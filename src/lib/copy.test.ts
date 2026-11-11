import { describe, expect, it, vi } from "vitest";
import { COPY_SCRIPT } from "./copy";

/** Just enough DOM for the inline script: one code block with a `<pre>`. */
function fakeDocument(text: string) {
  const listeners: Record<string, () => void> = {};
  const buttons: FakeButton[] = [];
  const block = {
    attributes: {} as Record<string, string>,
    getAttribute(name: string) {
      return this.attributes[name] ?? null;
    },
    setAttribute(name: string, value: string) {
      this.attributes[name] = value;
    },
    querySelector: () => ({ textContent: text }),
    appendChild: (button: FakeButton) => buttons.push(button),
  };
  const document = {
    readyState: "complete",
    querySelectorAll: () => [block],
    createElement: () => {
      const button: FakeButton = {
        type: "",
        className: "",
        textContent: "",
        attributes: {},
        listeners: {},
        setAttribute(name: string, value: string) {
          this.attributes[name] = value;
        },
        addEventListener(name: string, fn: () => void) {
          this.listeners[name] = fn;
        },
      };
      return button;
    },
    addEventListener(name: string, fn: () => void) {
      listeners[name] = fn;
    },
  };
  return { document, block, buttons, listeners };
}

type FakeButton = {
  type: string;
  className: string;
  textContent: string;
  attributes: Record<string, string>;
  listeners: Record<string, () => void>;
  setAttribute(name: string, value: string): void;
  addEventListener(name: string, fn: () => void): void;
};

function install() {
  const { document, block, buttons } = fakeDocument("echo hi\n");
  block.attributes["data-copy-class"] = "copy-hash";
  const writeText = vi.fn().mockResolvedValue(undefined);
  const timeouts: Array<() => void> = [];
  new Function("document", "navigator", "setTimeout", COPY_SCRIPT)(
    document,
    { clipboard: { writeText } },
    (fn: () => void) => timeouts.push(fn),
  );
  return { block, buttons, writeText, timeouts };
}

describe("COPY_SCRIPT (Design system, Code block)", () => {
  it("adds the Copy button only when the script runs", () => {
    const { block, buttons } = install();
    expect(buttons).toHaveLength(1);
    expect(buttons[0].type).toBe("button");
    expect(buttons[0].className).toBe("copy-hash");
    expect(buttons[0].textContent).toBe("Copy");
    expect(block.getAttribute("data-copy-ready")).toBe("");
  });

  it("copies the code without the highlighter's trailing newline", () => {
    const { buttons, writeText } = install();
    buttons[0].listeners.click();
    expect(writeText).toHaveBeenCalledWith("echo hi");
  });

  it("confirms the copy, then restores the label", async () => {
    const { buttons, timeouts } = install();
    buttons[0].listeners.click();
    await Promise.resolve();
    expect(buttons[0].textContent).toBe("Copied");
    expect(timeouts).toHaveLength(1);
    timeouts[0]();
    expect(buttons[0].textContent).toBe("Copy");
  });

  it("does not add a dead button when the clipboard is unavailable", () => {
    const { document, block, buttons } = fakeDocument("echo hi");
    new Function("document", "navigator", "setTimeout", COPY_SCRIPT)(
      document,
      {},
      (fn: () => void) => fn(),
    );
    expect(buttons).toHaveLength(0);
    expect(block.getAttribute("data-copy-ready")).toBe("");
  });
});
