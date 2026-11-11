"use client";

import { useEffect, useRef, useState } from "react";
import {
  heroPaused,
  mountShader,
  setHeroPaused,
  type ShaderHandle,
} from "@/lib/hero-shader";
import styles from "./HeroMotion.module.css";

/**
 * The home hero's motion (ADR-0001 tier 2; Design system, Hero shader;
 * Budgets, Shader and Accessibility). The canvas sits over the static
 * gradient and fades in once the first frame is drawn; it mounts after first
 * paint (on idle, or after `load`) and never blocks it. Without WebGL it is
 * never shown and the gradient stays. The "Pause animation" toggle freezes the
 * shader and the mark's eyes (WCAG 2.2.2): the choice persists in
 * `localStorage`, and the inline script in `Hero` applies it to the section
 * (`data-paused`) before first paint, so a paused visitor never sees a frame
 * of motion. Under reduced motion the shader shows one still frame and the
 * toggle has nothing to freeze.
 */
export function HeroMotion() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const shader = useRef<ShaderHandle | null>(null);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState<boolean | null>(null);

  useEffect(() => {
    const el = canvas.current;
    const section = el?.closest("[data-hero]");
    if (!el || !section) return;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const initial = heroPaused();
    setPaused(still ? null : initial);

    let cancelled = false;
    let handle: ShaderHandle | null = null;
    const start = () => {
      if (cancelled) return;
      handle = mountShader(el, section, {
        still,
        paused: initial,
        onReady: () => setReady(true),
      });
      shader.current = handle;
    };
    // After first paint: on idle, else after `load`.
    let idle = 0;
    let timer = 0;
    const onLoad = () => {
      if (typeof requestIdleCallback === "function") {
        idle = requestIdleCallback(start, { timeout: 2000 });
      } else timer = setTimeout(start, 200) as unknown as number;
    };
    if (document.readyState === "complete") onLoad();
    else addEventListener("load", onLoad, { once: true });

    return () => {
      cancelled = true;
      removeEventListener("load", onLoad);
      if (idle) cancelIdleCallback(idle);
      clearTimeout(timer);
      handle?.destroy();
      shader.current = null;
    };
  }, []);

  function toggle() {
    const next = !paused;
    setPaused(next);
    setHeroPaused(next);
    const section = canvas.current?.closest("[data-hero]");
    if (next) section?.setAttribute("data-paused", "");
    else section?.removeAttribute("data-paused");
    shader.current?.setPaused(next);
  }

  return (
    <>
      <canvas
        ref={canvas}
        className={`${styles.canvas} ${ready ? styles.ready : ""}`}
        aria-hidden="true"
      />
      {paused !== null && (
        <button
          type="button"
          className={styles.toggle}
          aria-pressed={paused}
          onClick={toggle}
        >
          {paused ? "Play animation" : "Pause animation"}
        </button>
      )}
    </>
  );
}
