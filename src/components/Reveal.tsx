"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * A section reveal (ADR-0001, Rules that follow). The server HTML carries no
 * hidden state: once JavaScript runs, motion is allowed
 * (`prefers-reduced-motion` is not `reduce`) and the section starts below the
 * fold, it is marked `data-pending`, which the CSS reads as the hidden start
 * state. The first time it scrolls into view it is marked `data-in` and plays,
 * once per page view, never reversing. A section already on screen is never
 * hidden: no reveal above the fold.
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
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const belowTheFold = el.getBoundingClientRect().top >= innerHeight;
    if (
      reduced ||
      !belowTheFold ||
      typeof IntersectionObserver === "undefined"
    ) {
      return;
    }
    el.setAttribute("data-pending", "");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.removeAttribute("data-pending");
        el.setAttribute("data-in", "");
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
