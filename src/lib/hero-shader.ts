// The home hero's thin-film shader (ADR-0001 tier 2; Design system, Hero
// shader; Budgets, Shader). Raw WebGL1, no library. The fragment shader and
// its parameters are those of `c-shader.js` at the reference prototype commit
// 90559ae. No DOM is touched outside the canvas it is given.

/** Budgets, Shader rule 1: internal pixels per CSS pixel, never from the DPR. */
export const RENDER_SCALE = 0.5;
/** Budgets, Shader rule 1: hard cap on the drawing buffer (~800 x 450). */
export const MAX_PIXELS = 360_000;
/** Budgets, Shader rule 2: 30 fps (the field's cycle lasts 20 s). */
export const FRAME_MS = 1000 / 30;
/** The time of the one still frame under reduced motion. */
export const STILL_T = 6.0;
/** `localStorage` key of the "Pause animation" choice (value "1"). */
export const PAUSED_KEY = "oxide-hero-paused";

export function bufferSize(cssWidth: number, cssHeight: number) {
  let k = RENDER_SCALE;
  const area = cssWidth * cssHeight * k * k;
  if (area > MAX_PIXELS) k *= Math.sqrt(MAX_PIXELS / area);
  let width = Math.max(1, Math.round(cssWidth * k));
  let height = Math.max(1, Math.round(cssHeight * k));
  // Rounding up must never push the buffer over the cap.
  while (width * height > MAX_PIXELS) {
    if (width >= height) width -= 1;
    else height -= 1;
  }
  return { width, height };
}

type Store = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function heroPaused(store?: Store): boolean {
  try {
    return (store ?? localStorage).getItem(PAUSED_KEY) === "1";
  } catch {
    return false;
  }
}

export function setHeroPaused(paused: boolean, store?: Store) {
  try {
    const s = store ?? localStorage;
    if (paused) s.setItem(PAUSED_KEY, "1");
    else s.removeItem(PAUSED_KEY);
  } catch {
    // Storage blocked: the choice lasts for this page view only.
  }
}

const VERT = `attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }`;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 u_res;
uniform float u_time;

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 4; i++){ v += a * noise(p); p = m * p; a *= 0.5; }
  return v;
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;

  // one full, seamless cycle every 20 s: the warp offsets travel on a circle
  float ph = u_time * 6.2831853 / 20.0;
  vec2 c = vec2(cos(ph), sin(ph));

  // domain-warped fbm = film thickness
  vec2 q = vec2(fbm(p * 1.6 + c * 0.6), fbm(p * 1.6 + vec2(5.2, 1.3) - c.yx * 0.6));
  vec2 r = vec2(fbm(p * 1.6 + 2.0 * q + vec2(1.7, 9.2) + c * 0.5),
                fbm(p * 1.6 + 2.0 * q + vec2(8.3, 2.8) - c * 0.5));
  float t = fbm(p * 1.2 + 2.0 * r);

  vec3 bg   = vec3(28.0, 28.0, 30.0) / 255.0;
  vec3 mid  = vec3(58.0, 58.0, 60.0) / 255.0;
  vec3 hi   = vec3(154.0, 152.0, 146.0) / 255.0;
  vec3 blue = vec3(31.0, 106.0, 213.0) / 255.0;
  vec3 sky  = vec3(88.0, 166.0, 255.0) / 255.0;

  // cosine palette over thickness, kept inside the titanium / cool range
  float film = 0.5 + 0.5 * cos(6.2831853 * (t * 2.2 + 0.1));
  vec3 col = mix(bg, mid, smoothstep(0.15, 0.85, film));
  col = mix(col, hi, 0.14 * smoothstep(0.80, 1.0, film));

  float band = 0.5 + 0.5 * cos(6.2831853 * (t * 2.2 + 0.45));
  col = mix(col, mix(blue, sky, 0.35) * 0.5, 0.2 * smoothstep(0.86, 1.0, band));

  // calm the centre (text sits there), vignette to bg, fade the bottom into the page
  float asp = u_res.x / u_res.y;
  col *= mix(0.62, 1.0, smoothstep(0.08, 0.55, length((uv - vec2(0.5, 0.55)) * vec2(asp, 1.0))));
  col = mix(col, bg, smoothstep(0.30, 0.85, length((uv - 0.5) * vec2(1.0, 0.95))));
  col = mix(col, bg, smoothstep(0.32, 0.0, uv.y));

  gl_FragColor = vec4(col, 1.0);
}`;

export type ShaderHandle = {
  /** Freeze on the current frame (true) or run again (false). */
  setPaused(paused: boolean): void;
  destroy(): void;
};

/**
 * Mounts the shader on `canvas`; `host` is observed for visibility. Calls
 * `onReady` after the first drawn frame (the canvas then fades in). Returns
 * null without WebGL: the static gradient stays. With `still` (reduced
 * motion) or while paused it draws one frame and nothing more.
 */
export function mountShader(
  canvas: HTMLCanvasElement,
  host: Element,
  opts: { still: boolean; paused: boolean; onReady: () => void },
): ShaderHandle | null {
  let gl: WebGLRenderingContext | null = null;
  try {
    gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: false,
      powerPreference: "low-power",
    });
  } catch {
    gl = null;
  }
  if (!gl) return null;
  const ctx = gl;

  const compile = (type: number, src: string) => {
    const s = ctx.createShader(type)!;
    ctx.shaderSource(s, src);
    ctx.compileShader(s);
    return ctx.getShaderParameter(s, ctx.COMPILE_STATUS) ? s : null;
  };
  const vs = compile(ctx.VERTEX_SHADER, VERT);
  const fs = compile(ctx.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const prog = ctx.createProgram()!;
  ctx.attachShader(prog, vs);
  ctx.attachShader(prog, fs);
  ctx.linkProgram(prog);
  if (!ctx.getProgramParameter(prog, ctx.LINK_STATUS)) return null;
  ctx.useProgram(prog);

  ctx.bindBuffer(ctx.ARRAY_BUFFER, ctx.createBuffer());
  ctx.bufferData(
    ctx.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    ctx.STATIC_DRAW,
  );
  const loc = ctx.getAttribLocation(prog, "a");
  ctx.enableVertexAttribArray(loc);
  ctx.vertexAttribPointer(loc, 2, ctx.FLOAT, false, 0, 0);
  const uRes = ctx.getUniformLocation(prog, "u_res");
  const uTime = ctx.getUniformLocation(prog, "u_time");

  let raf = 0;
  let visible = true;
  let destroyed = false;
  let shown = false;
  let paused = opts.paused;
  let last = -Infinity;
  // The shader clock only advances while it runs, so a resume continues from
  // the frozen frame instead of jumping.
  let clock = STILL_T;
  let lastNow = 0;

  function draw(time: number) {
    const { width, height } = bufferSize(
      canvas.clientWidth,
      canvas.clientHeight,
    );
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    ctx.viewport(0, 0, width, height);
    ctx.uniform2f(uRes, width, height);
    ctx.uniform1f(uTime, time);
    ctx.drawArrays(ctx.TRIANGLES, 0, 3);
    if (!shown) {
      shown = true;
      opts.onReady();
    }
  }
  function frame(now: number) {
    raf = 0;
    if (destroyed || paused || !visible || document.hidden) return;
    if (now - last >= FRAME_MS - 1) {
      clock += (now - lastNow) / 1000;
      lastNow = now;
      last = now;
      draw(clock);
    }
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }
  function update() {
    if (destroyed) return;
    if (opts.still || paused) {
      stop();
      draw(clock);
      return;
    }
    if (visible && !document.hidden) {
      if (!raf) {
        lastNow = performance.now();
        raf = requestAnimationFrame(frame);
      }
    } else stop();
  }

  const io = new IntersectionObserver((entries) => {
    visible = entries[entries.length - 1].isIntersecting;
    update();
  });
  io.observe(host);
  const ro = new ResizeObserver(() => {
    if (opts.still || paused) draw(clock);
  });
  ro.observe(canvas);
  document.addEventListener("visibilitychange", update);
  update();

  return {
    setPaused(next) {
      paused = next;
      update();
    },
    destroy() {
      destroyed = true;
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", update);
      ctx.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
