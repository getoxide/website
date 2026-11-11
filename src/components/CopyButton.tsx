"use client";

import { useState, useSyncExternalStore } from "react";

const noop = () => () => {};

/**
 * The Code block's Copy button. It renders only once JavaScript runs (the
 * server snapshot is `false`), so without JS there is no dead control.
 */
export function CopyButton({
  code,
  className,
}: {
  code: string;
  className?: string;
}) {
  const hydrated = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
  const [copied, setCopied] = useState(false);
  if (!hydrated) return null;
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}
