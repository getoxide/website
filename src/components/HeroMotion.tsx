"use client";

import { useEffect, useRef, useState } from "react";
import { mountShader, type ShaderHandle } from "@/lib/hero-shader";
import styles from "./HeroMotion.module.css";

/**
 * The home hero's motion (ADR-0001 tier 2; Design system, Hero shader;
 * Budgets, Shader). The canvas sits over the static gradient and fades in once
 * the first frame is drawn; it mounts after first paint (on idle, or after
 * `load`) and never blocks it. Without WebGL it is never shown and the
 * gradient stays. Under reduced motion the shader shows one still frame.
 */
export function HeroMotion() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = canvas.current;
    const section = el?.closest("[data-hero]");
    if (!el || !section) return;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;

    let cancelled = false;
    let handle: ShaderHandle | null = null;
    const start = () => {
      if (cancelled) return;
      handle = mountShader(el, section, {
        still,
        onReady: () => setReady(true),
      });
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
    };
  }, []);

  return (
    <canvas
      ref={canvas}
      className={`${styles.canvas} ${ready ? styles.ready : ""}`}
      aria-hidden="true"
    />
  );
}
