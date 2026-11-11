"""PROTOTYPE: renders the shader still and every card to PNG + JPEG, and writes out/sizes.json.

Needs: Python Playwright with Google Chrome installed (channel="chrome"), Pillow.
Usage: python3 prototypes/social-assets/render.py   (starts its own server on :4313)
"""
import io, json, os, subprocess, time
from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).parent
OUT = ROOT / "out"
PORT = 4313
BASE = f"http://localhost:{PORT}"
PAGE_PATHS = ["/", "/features", "/claude-code-gui", "/codex-gui", "/guides/review-ai-generated-code",
              "/guides/claude-code-and-codex-together", "/docs/quick-start", "/faq", "/changelog", "/download"]
SITE_WIDE = ["A", "B", "D"]


def slug(p):
    return "home" if p == "/" else p[1:].replace("/", "--")


def encode(png_bytes, stem):
    """Writes PNG (optimised) and JPEG q82; returns their byte sizes."""
    img = Image.open(io.BytesIO(png_bytes)).convert("RGB")
    png, jpg = OUT / f"{stem}.png", OUT / f"{stem}.jpg"
    img.save(png, optimize=True)
    img.save(jpg, quality=82, optimize=True, progressive=True)
    return {"png": png.stat().st_size, "jpg": jpg.stat().st_size}


def main():
    OUT.mkdir(exist_ok=True)
    server = subprocess.Popen(["node", str(ROOT / "serve.mjs")], env=os.environ | {"PORT": str(PORT)}, stdout=subprocess.DEVNULL)
    time.sleep(0.8)
    sizes = {}
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch(channel="chrome", args=["--use-angle=metal", "--enable-gpu"])
            page = browser.new_page(viewport={"width": 1200, "height": 630}, device_scale_factor=1)

            page.goto(f"{BASE}/still.html")
            page.wait_for_selector("body[data-ready='1']")
            still = page.screenshot(clip={"x": 0, "y": 0, "width": 1200, "height": 630})
            Image.open(io.BytesIO(still)).convert("RGB").save(ROOT / "assets" / "shader-still.png", optimize=True)

            def shoot(v, p):
                page.goto(f"{BASE}/card.html?v={v}&p={p}")
                page.wait_for_selector("body[data-ready='1']")
                return page.screenshot(clip={"x": 0, "y": 0, "width": 1200, "height": 630})

            for v in SITE_WIDE:
                sizes[v] = {"home": encode(shoot(v, "/"), f"{v}-home")}
            sizes["C"] = {slug(p): encode(shoot("C", p), f"C-{slug(p)}") for p in PAGE_PATHS}
            browser.close()
    finally:
        server.terminate()
    (OUT / "sizes.json").write_text(json.dumps(sizes, indent=2))
    for v, files in sizes.items():
        for k, s in files.items():
            print(f"{v}-{k}: png {s['png'] / 1024:.0f} KB, jpg {s['jpg'] / 1024:.0f} KB")


if __name__ == "__main__":
    main()
