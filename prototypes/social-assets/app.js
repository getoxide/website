// PROTOTYPE wiring: variant switcher, controls, mocks, icon set, state panel.
import { VARIANTS, scaled } from "./cards.js";
import { HOST, SITE_NAME, HEADLINES, PAGES, ogTitle, slug } from "./data.js";

const ORDER = Object.keys(VARIANTS);
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const kb = (n) => `${Math.round(n / 1024)} KB`;

const ICONS = {
  I1: { name: "Brand favicon kit", svg: "assets/oxide-favicon.svg", svgLight: "assets/oxide-favicon.svg", png: "assets/icons/favicon-48.png",
        ico: "favicon.ico ← png/favicon 16, 32, 48", note: "icon.svg = oxide-favicon.svg (heavier glyph on its own dark plate); favicon.ico 16/32/48 for Google and old browsers; apple-icon.png = avatar 180." },
  I2: { name: "Bare mark", svg: "assets/oxide-mark.svg", svgLight: "assets/oxide-mark.svg", png: "assets/icons/mark-64.png",
        ico: "favicon.ico ← png/mark 16, 32, 64", note: "icon.svg = oxide-mark.svg, transparent. The brand README: below 24 px use oxide-favicon.svg, and a transparent Titanium mark disappears on white." },
  I3: { name: "Adaptive mark", svg: "assets/oxide-mark.svg", svgLight: "assets/oxide-mark-on-light.svg", png: "assets/icons/favicon-48.png",
        ico: "favicon.ico ← png/favicon 16, 32, 48", note: "icon.svg = transparent mark with a prefers-color-scheme rule swapping to mark-on-light. Thin strokes at 16 px; ignored by Google (no SVG)." },
};

let sizes = null;
const state = { variant: "B", copy: "7", sub: "1", page: "/", mode: "bare", theme: "dark", icons: "I1", guides: true };
const headline = () => HEADLINES.find((h) => h.id === state.copy);

function readUrl() {
  const q = new URLSearchParams(location.search);
  const v = (q.get("variant") || "B").toUpperCase();
  state.variant = ORDER.includes(v) ? v : "B";
  state.copy = HEADLINES.some((h) => h.id === q.get("copy")) ? q.get("copy") : HEADLINES[0].id;
  state.sub = q.get("sub") === "0" ? "0" : "1";
  state.page = PAGES.some((p) => p.path === q.get("page")) ? q.get("page") : "/";
  state.mode = ["bare", "full", "h1"].includes(q.get("mode")) ? q.get("mode") : "bare";
  state.theme = q.get("theme") === "light" ? "light" : "dark";
  state.icons = ICONS[q.get("icons")] ? q.get("icons") : "I1";
}
function writeUrl() {
  const u = new URL(location.href);
  u.search = "";
  for (const k of ["variant", "copy", "sub", "page", "mode", "theme", "icons"]) u.searchParams.set(k, state[k]);
  history.replaceState(null, "", u);
}

function imageUrl(page) {
  return state.variant === "C" ? `https://${HOST}/og/${slug(page.path)}.png` : `https://${HOST}/og.png`;
}
function imageAlt(page) {
  return state.variant === "C" && page.path !== "/" ? page.h1 : `Oxide: ${headline().text}`;
}

function render() {
  const page = PAGES.find((p) => p.path === state.page);
  const v = state.variant, meta = VARIANTS[v], ic = ICONS[state.icons];
  const title = ogTitle(page, state.mode), desc = page.desc;
  const url = `${HOST}${page.path === "/" ? "" : page.path}`;
  document.body.classList.toggle("light", state.theme === "light");
  const hl = headline(), opts = { hero: hl.text, sub: state.sub === "1" ? hl.sub : "" };
  $(".switcher output").textContent = `Headline ${hl.id}/${HEADLINES.length} · ${hl.angle}`;
  $("#sub").checked = state.sub === "1";
  for (const [id, val] of [["card", state.variant], ["page", state.page], ["mode", state.mode], ["theme", state.theme], ["icons", state.icons]]) $(`#${id}`).value = val;

  // 1 · full card
  const full = $("#full");
  full.replaceChildren(scaled(v, page, Math.min(1200, innerWidth - 48), opts));
  full.insertAdjacentHTML("beforeend", `<div class="guide guide--sq" style="left:${(285 / 1200) * 100}%;right:${(285 / 1200) * 100}%"></div><div class="guide guide--x"></div>`);
  full.classList.toggle("show-guides", state.guides);
  const sz = sizes?.[v]?.[v === "C" ? slug(page.path) : "home"];
  $("#cardmeta").textContent = `${meta.scope} · ${meta.how} · shader still: ${meta.shader ? "yes" : "no"}${sz ? ` · PNG ${kb(sz.png)} / JPEG ${kb(sz.jpg)}` : ""}`;

  // 2 · feeds
  const fav = state.theme === "light" ? ic.svgLight : ic.svg;
  const feeds = $("#feeds");
  feeds.innerHTML = `
    <div class="feed"><h3>Slack</h3><div class="slack"><div class="site"><img src="${fav}" alt="">${SITE_NAME}</div><div class="t">${esc(title)}</div><div class="d">${esc(desc)}</div><div class="slot" data-w="360"></div></div></div>
    <div class="feed"><h3>X · summary_large_image</h3><div class="xcard"><div class="img"><div class="slot" data-w="506"></div><div class="ov">${esc(title)}</div></div><div class="from">From ${HOST}</div></div></div>
    <div class="feed"><h3>LinkedIn</h3><div class="li"><div class="slot" data-w="504"></div><div class="meta"><div class="t clamp2">${esc(title)}</div><div class="dom">${HOST}</div></div></div></div>
    <div class="feed"><h3>iMessage</h3><div class="imsg"><div class="slot" data-w="270"></div><div class="meta"><div class="t clamp2">${esc(title)}</div><div class="dom">${HOST}</div></div></div></div>
    <div class="feed"><h3>Discord</h3><div class="disc"><div class="site">${SITE_NAME}</div><div class="t">${esc(title)}</div><div class="d clamp3">${esc(desc)}</div><div class="slot" data-w="400"></div></div></div>
    <div class="feed"><h3>WhatsApp · small preview (centre crop)</h3><div class="wa"><div class="prev"><div class="slot" data-w="88" data-crop="square"></div><div class="txt"><div class="t clamp2">${esc(title)}</div><div class="d clamp2">${esc(desc)}</div><div class="dom">${HOST}</div></div></div><div class="link">https://${url}</div></div></div>
    <div class="feed"><h3>Google Search · uses &lt;title&gt;, favicon (no SVG), WebSite name</h3><div class="serp"><div class="row"><div class="fav"><img src="${ic.png}" alt=""></div><div><div class="name">${SITE_NAME}</div><div class="url">https://${HOST}${page.path === "/" ? "" : " › " + page.path.slice(1).split("/").join(" › ")}</div></div></div><div class="t">${esc(page.title)}</div><div class="d clamp2">${esc(desc)}</div></div></div>`;
  for (const slot of feeds.querySelectorAll(".slot")) slot.replaceWith(scaled(v, page, Number(slot.dataset.w), { crop: slot.dataset.crop, ...opts }));

  // 3 · icons
  $("#iconmeta").textContent = `${state.icons} · ${ic.name}`;
  const tabTitle = esc(page.title);
  $("#iconset").innerHTML = `
    <div><h3>Chrome, dark</h3><div class="tabs tabs--dark"><div class="tab on"><img src="${ic.svg}" alt="">${tabTitle}</div><div class="tab"><img src="assets/icons/mark-16.png" style="opacity:0" alt="">GitHub</div></div></div>
    <div><h3>Chrome, light</h3><div class="tabs tabs--light"><div class="tab on"><img src="${ic.svgLight}" alt="">${tabTitle}</div><div class="tab"><img src="assets/icons/mark-16.png" style="opacity:0" alt="">GitHub</div></div></div>
    <div><h3>iOS home screen · apple-icon.png = avatar 180</h3><div class="home"><figure><div class="ph"></div>Notes</figure><figure><img src="assets/icons/avatar-180.png" alt="">Oxide</figure><figure><div class="ph"></div>Maps</figure></div></div>
    <div><h3>Raw sizes · light / dark ground</h3><div style="display:grid;gap:8px">
      <div class="sizes">${[16, 32, 48].map((s) => `<figure><img src="${ic.svgLight}" width="${s}" height="${s}" alt="">${s}</figure>`).join("")}<figure><img src="assets/icons/avatar-180.png" width="60" height="60" alt="">180@60</figure></div>
      <div class="sizes dk">${[16, 32, 48].map((s) => `<figure><img src="${ic.svg}" width="${s}" height="${s}" alt="">${s}</figure>`).join("")}<figure><img src="assets/icons/avatar-180.png" width="60" height="60" alt="">180@60</figure></div>
    </div></div>
    <p style="grid-column:1/-1;color:#B3B1AB;margin:0">${esc(ic.note)}</p>`;

  // 4 · state
  const ogPath = v === "C" ? `og/${slug(page.path)}.png` : "og.png";
  $("#head").textContent = [
    `<title>${page.title}</title>`,
    `<meta name="description" content="${desc}">`,
    `<link rel="canonical" href="https://${url}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="${SITE_NAME}">`,
    `<meta property="og:url" content="https://${url}">`,
    `<meta property="og:title" content="${title}">`,
    `<meta property="og:description" content="${desc}">`,
    `<meta property="og:image" content="${imageUrl(page)}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:image:alt" content="${imageAlt(page)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:image" content="${imageUrl(page)}">`,
    ``,
    `<link rel="icon" href="/favicon.ico" sizes="48x48">`,
    `<link rel="icon" href="/icon.svg" type="image/svg+xml">`,
    `<link rel="apple-touch-icon" href="/apple-icon.png">`,
  ].join("\n");
  const rows = [[`public/${ogPath}`, sz ? `${kb(sz.png)} PNG` : "run render"]];
  if (v === "C") rows.push([`+ ${PAGES.length - 1} more under public/og/`, sizes ? `${kb(Object.values(sizes.C).reduce((a, s) => a + s.png, 0))} total` : ""]);
  rows.push(["app/favicon.ico", ic.ico.split("← ")[1]], ["app/icon.svg", ic.svg.split("/").pop()], ["app/apple-icon.png", "avatar 180×180"]);
  $("#files").innerHTML = rows.map(([a, b]) => `<tr><td>${esc(a)}</td><td>${esc(b)}</td></tr>`).join("");
}

function set(k, val) { state[k] = val; writeUrl(); render(); }
function step(dir) { const i = HEADLINES.findIndex((h) => h.id === state.copy); set("copy", HEADLINES[(i + dir + HEADLINES.length) % HEADLINES.length].id); }

$("#page").innerHTML = PAGES.map((p) => `<option value="${p.path}">${p.path}</option>`).join("");
for (const id of ["page", "mode", "theme", "icons"]) $(`#${id}`).addEventListener("change", (e) => set(id, e.target.value));
$("#card").addEventListener("change", (e) => set("variant", e.target.value));
$("#sub").addEventListener("change", (e) => set("sub", e.target.checked ? "1" : "0"));
$("#guides").addEventListener("change", (e) => { state.guides = e.target.checked; render(); });
document.querySelectorAll(".switcher button").forEach((b) => b.addEventListener("click", () => step(+b.dataset.dir)));
addEventListener("keydown", (e) => {
  if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
  if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
  const t = e.target;
  if (t instanceof HTMLElement && (t.closest("input,textarea,select") || t.isContentEditable)) return;
  step(e.key === "ArrowRight" ? 1 : -1);
});
addEventListener("resize", () => render());

readUrl();
sizes = await fetch("out/sizes.json").then((r) => (r.ok ? r.json() : null)).catch(() => null);
render();
