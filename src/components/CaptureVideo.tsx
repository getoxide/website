"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Capture.module.css";

const PAUSE = "M4 2h2v12H4zM10 2h2v12h-2z";
const PLAY = "M4 2.5v11l9-5.5z";

/**
 * The video variant of a capture (Motion approach, ADR-0001; Budgets, Video
 * loops): a muted loop with `preload="none"` and a poster, played while it is
 * on screen and paused when it is not, with a visible pause/play button
 * (WCAG 2.2.2). Reduced motion shows the poster and the play button instead
 * of autoplaying. Until JavaScript runs the native controls are there, so
 * the capture is usable without it.
 */
export function CaptureVideo({
  sources,
  poster,
  width,
  height,
  label,
}: {
  sources: { src: string; type: string }[];
  poster: string;
  width: number;
  height: number;
  label: string;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  // The visitor paused it: scrolling back into view must not restart it.
  const userPaused = useRef(false);

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    setReady(true);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    userPaused.current = reduced;
    const sync = () => setPlaying(!el.paused);
    el.addEventListener("play", sync);
    el.addEventListener("pause", sync);
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (!userPaused.current) void el.play().catch(() => {});
      } else {
        el.pause();
      }
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      el.removeEventListener("play", sync);
      el.removeEventListener("pause", sync);
    };
  }, []);

  function toggle() {
    const el = video.current;
    if (!el) return;
    if (el.paused) {
      userPaused.current = false;
      void el.play().catch(() => {});
    } else {
      userPaused.current = true;
      el.pause();
    }
  }

  return (
    <>
      <video
        ref={video}
        className={styles.media}
        width={width}
        height={height}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        controls={!ready}
        aria-label={label}
      >
        {sources.map((s) => (
          <source key={s.src} src={s.src} type={s.type} />
        ))}
      </video>
      {ready ? (
        <button
          type="button"
          className={styles.toggle}
          onClick={toggle}
          aria-label={playing ? "Pause video" : "Play video"}
        >
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
            <path d={playing ? PAUSE : PLAY} fill="currentColor" />
          </svg>
        </button>
      ) : null}
    </>
  );
}
