// Prototype wiring: variant switcher, reveal observer, variant A tabs, variant C shader lifecycle.
import { mountShader } from "./c-shader.js";

const ORDER = ["A", "B", "C"];
const NAMES = { A: "Window", B: "Ledger", C: "Passivation" };
const wraps = Object.fromEntries(ORDER.map((v) => [v, document.querySelector(`.variant[data-variant="${v}"]`)]));
const label = document.querySelector(".switcher output");
let current = null;
let shader = null;

function fromUrl() {
  const v = (new URLSearchParams(location.search).get("variant") || "A").toUpperCase();
  return ORDER.includes(v) ? v : "A";
}

function show(v, { push = true } = {}) {
  if (v === current) return;
  current = v;
  for (const k of ORDER) wraps[k].hidden = k !== v; // display:none -> block restarts the CSS entrance animations
  label.textContent = `${v} · ${NAMES[v]}`;
  document.documentElement.dataset.variant = v;
  if (push) {
    const u = new URL(location.href);
    u.searchParams.set("variant", v);
    history.replaceState(null, "", u);
  }
  if (shader) { shader.destroy(); shader = null; }
  if (v === "C") {
    const hero = wraps.C.querySelector(".c-hero");
    const old = wraps.C.querySelector(".c-canvas");
    const fresh = old.cloneNode(false); // a lost WebGL context cannot be reused on the same canvas
    old.replaceWith(fresh);
    shader = mountShader(fresh, hero);
  }
  window.scrollTo(0, 0);
}

function step(dir) {
  show(ORDER[(ORDER.indexOf(current) + dir + ORDER.length) % ORDER.length]);
}

document.querySelectorAll(".switcher button").forEach((b) => b.addEventListener("click", () => step(+b.dataset.dir)));
addEventListener("keydown", (e) => {
  if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
  if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
  const t = e.target;
  if (t instanceof HTMLElement && (t.closest("input,textarea,select,[role=tab]") || t.isContentEditable)) return;
  step(e.key === "ArrowRight" ? 1 : -1);
});

// Below-the-fold reveals: once, never reversed.
const reveals = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
  }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
  reveals.forEach((el) => io.observe(el));
} else reveals.forEach((el) => el.classList.add("in"));

// Variant A: proof tabs
(() => {
  const list = wraps.A.querySelector("[role=tablist]");
  const tabs = [...list.querySelectorAll("[role=tab]")];
  const panels = tabs.map((t) => document.getElementById(t.getAttribute("aria-controls")));
  function select(i, focus) {
    const apply = () => {
      tabs.forEach((t, k) => {
        const on = k === i;
        t.setAttribute("aria-selected", on);
        t.tabIndex = on ? 0 : -1;
        t.parentElement.classList.toggle("is-active", on);
        panels[k].hidden = !on;
      });
    };
    if (document.startViewTransition && !matchMedia("(prefers-reduced-motion: reduce)").matches) document.startViewTransition(apply);
    else apply();
    if (focus) tabs[i].focus();
  }
  tabs.forEach((t, i) => t.addEventListener("click", () => select(i)));
  list.addEventListener("keydown", (e) => {
    const i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    let n = null;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") n = (i + 1) % tabs.length;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") n = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") n = 0;
    else if (e.key === "End") n = tabs.length - 1;
    if (n !== null) { e.preventDefault(); select(n, true); }
  });
})();

addEventListener("popstate", () => show(fromUrl(), { push: false }));
show(fromUrl(), { push: false });
