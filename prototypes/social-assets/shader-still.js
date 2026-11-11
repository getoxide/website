// PROTOTYPE: renders ONE frame of the direction-C thin-film shader at native resolution.
// FRAG is copied verbatim from prototype/visual-direction c-shader.js; the card uses it as a still.
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

/** Draws the shader once at time `t` into a new w×h canvas and returns it. */
export function renderStill(w, h, t = 6.0) {
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const gl = canvas.getContext("webgl", { antialias: false, alpha: false, preserveDrawingBuffer: true });
  if (!gl) throw new Error("no WebGL");
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog); gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "a");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  gl.viewport(0, 0, w, h);
  gl.uniform2f(gl.getUniformLocation(prog, "u_res"), w, h);
  gl.uniform1f(gl.getUniformLocation(prog, "u_time"), t);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  return canvas;
}
