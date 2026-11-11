// PROTOTYPE: the four card designs, each a 1200×630 DOM node. render.py screenshots them to PNG.
import { HOST, HERO, PAGES } from "./data.js";

export const VARIANTS = {
  A: { name: "Plate", scope: "site-wide", how: "static file, committed", shader: false },
  B: { name: "Passivation", scope: "site-wide", how: "static file, committed", shader: true },
  C: { name: "Page title", scope: "per page", how: "generated at build from PAGES", shader: true },
  D: { name: "Capture", scope: "site-wide", how: "static file, rebuilt when the hero capture changes", shader: true },
};

const MARK = `<img class="k-mark" src="assets/oxide-mark.svg" alt="">`;
const LOGO = `<img class="k-logo" src="assets/oxide-logo.svg" alt="">`;
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

function sizeFor(text) {
  // Fixed steps, so the build can predict line counts without measuring.
  if (text.length <= 22) return 96;
  if (text.length <= 44) return 76;
  return 64;
}

const builders = {
  A: () => `
    <div class="k k-a">
      <div class="k-a__top">${LOGO}</div>
      <h1 class="k-a__h">${esc(HERO)}</h1>
      <p class="k-a__host">${HOST}</p>
    </div>`,

  B: () => `
    <div class="k k-b">
      <div class="k-shader"></div>
      <div class="k-b__in">
        ${MARK}
        <h1 class="k-b__h">${esc(HERO)}</h1>
      </div>
    </div>`,

  C: (page) => {
    const h = page.path === "/" ? HERO : page.h1;
    const path = page.path === "/" ? "" : page.path;
    return `
    <div class="k k-c">
      <div class="k-shader k-c__shader"></div>
      <div class="k-c__top">${LOGO}</div>
      <h1 class="k-c__h" style="font-size:${sizeFor(h)}px">${esc(h)}</h1>
      <p class="k-c__url"><span>${HOST}</span>${esc(path)}</p>
    </div>`;
  },

  D: () => `
    <div class="k k-d">
      <div class="k-shader"></div>
      <div class="k-d__head">${MARK}<h1 class="k-d__h">${esc(HERO)}</h1></div>
      <div class="k-d__frame"><img src="assets/oxide-capture@1x.png" alt=""></div>
    </div>`,
};

/** Returns a fresh 1200×630 card element. */
export function card(variant, page = PAGES[0]) {
  const t = document.createElement("template");
  t.innerHTML = builders[variant](page).trim();
  return t.content.firstElementChild;
}

/** Wraps a card scaled to `width` CSS px. `crop: "square"` centre-crops like WhatsApp/Telegram thumbnails. */
export function scaled(variant, page, width, { crop } = {}) {
  const box = document.createElement("div");
  box.className = "k-box";
  const el = card(variant, page);
  if (crop === "square") {
    const s = width / 630;
    box.style.cssText = `width:${width}px;height:${width}px`;
    el.style.transform = `translateX(${-(1200 - 630) / 2 * s}px) scale(${s})`;
  } else {
    const s = width / 1200;
    box.style.cssText = `width:${width}px;height:${Math.round(630 * s)}px`;
    el.style.transform = `scale(${s})`;
  }
  box.append(el);
  return box;
}
