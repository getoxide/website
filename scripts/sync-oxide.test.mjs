import { describe, expect, it } from "vitest";
import { buildIco, syncBrand } from "./sync-oxide.mjs";

/** A stand-in PNG: the signature and an IHDR chunk carrying the size. */
function fakePng(size, filler = 0) {
  const buf = Buffer.alloc(33 + filler, 0xab);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(buf, 0);
  buf.writeUInt32BE(13, 8);
  buf.write("IHDR", 12, "ascii");
  buf.writeUInt32BE(size, 16);
  buf.writeUInt32BE(size, 20);
  return buf;
}

describe("buildIco", () => {
  it("packs PNGs into an ICO directory with one entry per size", () => {
    const p16 = fakePng(16, 1);
    const p32 = fakePng(32, 2);
    const ico = buildIco([p16, p32]);

    // ICONDIR: reserved 0, type 1 (icon), 2 images.
    expect([...ico.subarray(0, 6)]).toEqual([0, 0, 1, 0, 2, 0]);
    // First ICONDIRENTRY: 16x16, no palette, 1 plane, 32 bpp, size, offset.
    const e1 = ico.subarray(6, 22);
    expect([e1[0], e1[1], e1[2], e1[3]]).toEqual([16, 16, 0, 0]);
    expect(e1.readUInt16LE(4)).toBe(1);
    expect(e1.readUInt16LE(6)).toBe(32);
    expect(e1.readUInt32LE(8)).toBe(34);
    expect(e1.readUInt32LE(12)).toBe(38); // 6 + 2 * 16
    const e2 = ico.subarray(22, 38);
    expect([e2[0], e2[1]]).toEqual([32, 32]);
    expect(e2.readUInt32LE(8)).toBe(35);
    expect(e2.readUInt32LE(12)).toBe(72); // 38 + 34
    // The PNG data follows verbatim.
    expect(ico.subarray(38, 72).equals(p16)).toBe(true);
    expect(ico.subarray(72).equals(p32)).toBe(true);
  });

  it("writes 0 for a 256 px side, as the format requires", () => {
    const ico = buildIco([fakePng(256)]);
    expect([ico[6], ico[7]]).toEqual([0, 0]);
  });

  it("rejects a file that is not a PNG", () => {
    expect(() => buildIco([Buffer.from("not a png")])).toThrow(/PNG/);
  });
});

const BRAND = "assets/brand/oxide";
const TOKENS = ":root { --ox-background: #1C1C1E; }\n";

function source() {
  return new Map([
    [`${BRAND}/palette/oxide-tokens.css`, Buffer.from(TOKENS)],
    [`${BRAND}/oxide-favicon.svg`, Buffer.from("<svg/>")],
    [`${BRAND}/png/favicon/16x16.png`, fakePng(16)],
    [`${BRAND}/png/favicon/32x32.png`, fakePng(32)],
    [`${BRAND}/png/favicon/48x48.png`, fakePng(48)],
    [`${BRAND}/png/favicon/64x64.png`, fakePng(64)],
    [`${BRAND}/png/avatar/180x180.png`, fakePng(180)],
  ]);
}

async function run(files, ref = "main") {
  const fetched = [];
  const written = new Map();
  await syncBrand({
    ref,
    fetchFile: async (r, path) => {
      fetched.push(`${r}:${path}`);
      const file = files.get(path);
      if (!file) throw new Error(`404 ${path}`);
      return file;
    },
    writeFile: async (path, data) => written.set(path, Buffer.from(data)),
  });
  return { fetched, written };
}

describe("syncBrand", () => {
  it("copies the tokens CSS verbatim and the icon set at the pinned ref", async () => {
    const { fetched, written } = await run(source(), "v1.2.3");

    expect(fetched.every((f) => f.startsWith("v1.2.3:"))).toBe(true);
    expect(
      written.get("content/oxide/brand/oxide-tokens.css")?.toString(),
    ).toBe(TOKENS);
    expect(written.get("src/app/icon.svg")?.toString()).toBe("<svg/>");
    expect(written.get("src/app/apple-icon.png")?.readUInt32BE(16)).toBe(180);

    const ico = written.get("src/app/favicon.ico");
    expect(ico?.readUInt16LE(4)).toBe(4);
    expect([0, 1, 2, 3].map((i) => ico?.[6 + i * 16])).toEqual([
      16, 32, 48, 64,
    ]);

    expect(
      JSON.parse(written.get("content/oxide/source.json").toString()),
    ).toEqual({ repo: "getoxide/oxide", ref: "v1.2.3" });
  });

  it("writes nothing when a file is missing", async () => {
    const files = source();
    files.delete(`${BRAND}/palette/oxide-tokens.css`);
    await expect(run(files)).rejects.toThrow(/oxide-tokens\.css/);

    const written = new Map();
    await syncBrand({
      ref: "main",
      fetchFile: async (_r, path) => {
        const file = files.get(path);
        if (!file) throw new Error(`404 ${path}`);
        return file;
      },
      writeFile: async (path, data) => written.set(path, data),
    }).catch(() => {});
    expect(written.size).toBe(0);
  });
});
