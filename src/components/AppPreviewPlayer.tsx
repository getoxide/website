"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { BEAT_MS, BEATS, FINAL_BEAT } from "@/content/app-preview";

const PAUSE = "M4 2h2v12H4zM10 2h2v12h-2z";
const PLAY = "M4 2.5v11l9-5.5z";

/** How long the finished scene holds when it is already on screen. */
const FIRST_HOLD = 2500;

/**
 * Plays the app preview (Design system, App preview). The scene is server
 * HTML in its finished state; this only drives two custom properties on the
 * root, `--beat` and `--typed`, which the CSS turns into what each element
 * shows. Nothing changes layout, so playing never shifts the page.
 *
 * It plays while the preview is on screen and the tab is visible, loops, and
 * has a visible pause/play button (WCAG 2.2.2). Under reduced motion it never
 * starts: the finished scene stays and no button is shown.
 */
export function AppPreviewPlayer({
  className,
  stageClassName,
  toggleClassName,
  label,
  pauseLabel,
  playLabel,
  words,
  children,
}: {
  className: string;
  stageClassName: string;
  toggleClassName: string;
  label: string;
  pauseLabel: string;
  playLabel: string;
  /** Words in the prompt the composer types, one per `--typed` step. */
  words: number;
  children: ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [motion, setMotion] = useState(false);
  const [paused, setPaused] = useState(false);
  const control = useRef<{ toggle: () => void } | null>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      typeof IntersectionObserver === "undefined"
    ) {
      return;
    }
    let beat: number = FINAL_BEAT;
    let typed = words;
    let timer = 0;
    let typing = 0;
    let onScreen = false;
    let userPaused = false;
    let started = false;

    const paint = () => {
      el.style.setProperty("--beat", String(beat));
      el.style.setProperty("--typed", String(typed));
    };
    const stop = () => {
      clearTimeout(timer);
      clearInterval(typing);
    };
    const enter = (next: number) => {
      beat = next;
      if (beat === BEATS.empty) typed = 0;
      paint();
      if (beat === BEATS.typing) {
        const step = (BEAT_MS[BEATS.typing] - 400) / words;
        typing = window.setInterval(() => {
          typed = Math.min(words, typed + 1);
          paint();
          if (typed >= words) clearInterval(typing);
        }, step);
      }
      schedule(BEAT_MS[beat]);
    };
    const schedule = (ms: number) => {
      timer = window.setTimeout(() => {
        clearInterval(typing);
        typed = beat >= BEATS.typing ? words : typed;
        enter(beat >= FINAL_BEAT ? BEATS.empty : beat + 1);
      }, ms);
    };
    const run = () => {
      stop();
      if (userPaused || !onScreen || document.hidden) return;
      // A scene already on screen holds its finished state first; otherwise
      // it starts from the empty Thread.
      if (!started) {
        started = true;
        if (el.getBoundingClientRect().top < innerHeight * 0.6) {
          schedule(FIRST_HOLD);
          return;
        }
        enter(BEATS.empty);
        return;
      }
      schedule(Math.min(BEAT_MS[beat], 1200));
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        // The first callback: motion is allowed, so the button appears.
        setMotion(true);
        onScreen = entry.isIntersecting;
        run();
      },
      { threshold: 0.25 },
    );
    observer.observe(el);
    const onVisibility = () => run();
    document.addEventListener("visibilitychange", onVisibility);
    control.current = {
      toggle: () => {
        userPaused = !userPaused;
        setPaused(userPaused);
        run();
      },
    };
    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      control.current = null;
    };
  }, [words]);

  return (
    <div className={className}>
      <div
        ref={root}
        className={stageClassName}
        role="img"
        aria-label={label}
        data-capture=""
      >
        {children}
      </div>
      {motion ? (
        <button
          type="button"
          className={toggleClassName}
          onClick={() => control.current?.toggle()}
          aria-label={paused ? playLabel : pauseLabel}
        >
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
            <path d={paused ? PLAY : PAUSE} fill="currentColor" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}
