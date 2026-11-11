"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * A section reveal (ADR-0001, Rules that follow): plays once per page view,
 * never reverses, and is never used above the fold. It only marks the element
 * `data-in` the first time it scrolls into view; the CSS that hides the start
 * state applies only under `html[data-motion]`, which the inline motion
 * script sets when JavaScript runs and the visitor allows motion. The server
 * HTML therefore carries no hidden state.
 */
export function Reveal({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reveal = () => el.setAttribute("data-in", "");
    if (typeof IntersectionObserver === "undefined") {
      reveal();
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        reveal();
        observer.disconnect();
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
