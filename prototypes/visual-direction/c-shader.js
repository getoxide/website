// Variant C: thin-film interference field, raw WebGL1 fragment shader, no libraries.
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

/** Mounts the shader on `canvas`. `host` is observed for visibility. Returns { destroy }. */
export function mountShader(canvas, host) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let gl = null;
  try { gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" }); } catch { /* fall back */ }
  if (!gl) return { destroy() {} };

  const sh = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  };
  const vs = sh(gl.VERTEX_SHADER, VERT), fs = sh(gl.FRAGMENT_SHADER, FRAG);
  const prog = gl.createProgram();
  if (!vs || !fs) return { destroy() {} };
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return { destroy() {} };
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "a");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const uRes = gl.getUniformLocation(prog, "u_res");
  const uTime = gl.getUniformLocation(prog, "u_time");

  let raf = 0, visible = true, destroyed = false, shown = false;
  const t0 = performance.now();
  const STILL_T = 6.0;
  // Performance: the field is soft, so render well below CSS resolution and let the browser upscale it,
  // and cap the frame rate (the cycle lasts 20 s, so 30 fps is indistinguishable from 60).
  const RENDER_SCALE = 0.5;        // internal pixels per CSS pixel, independent of devicePixelRatio
  const MAX_PIXELS = 360_000;      // hard cap on the drawing buffer (~800x450)
  const FRAME_MS = 1000 / 30;
  let last = -Infinity;

  function resize() {
    let k = RENDER_SCALE;
    const area = canvas.clientWidth * canvas.clientHeight * k * k;
    if (area > MAX_PIXELS) k *= Math.sqrt(MAX_PIXELS / area);
    const w = Math.max(1, Math.round(canvas.clientWidth * k)), h = Math.max(1, Math.round(canvas.clientHeight * k));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    gl.viewport(0, 0, w, h);
  }
  function draw(time) {
    resize();
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, time);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (!shown) { shown = true; canvas.classList.add("is-ready"); }
  }
  function frame(now) {
    raf = 0;
    if (destroyed || !visible || document.hidden) return;
    if (now - last >= FRAME_MS - 1) { last = now; draw((now - t0) / 1000); }
    raf = requestAnimationFrame(frame);
  }
  function update() {
    if (reduced) { draw(STILL_T); return; }
    if (visible && !document.hidden && !raf && !destroyed) raf = requestAnimationFrame(frame);
    else if ((!visible || document.hidden) && raf) { cancelAnimationFrame(raf); raf = 0; }
  }

  const io = new IntersectionObserver((e) => { visible = e[e.length - 1].isIntersecting; update(); });
  io.observe(host);
  const ro = new ResizeObserver(() => { if (reduced) draw(STILL_T); });
  ro.observe(canvas);
  document.addEventListener("visibilitychange", update);
  update();

  return {
    destroy() {
      destroyed = true;
      if (raf) cancelAnimationFrame(raf);
      io.disconnect(); ro.disconnect();
      document.removeEventListener("visibilitychange", update);
      canvas.classList.remove("is-ready");
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
