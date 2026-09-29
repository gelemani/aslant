// Pane mode chunk (clear-glass, brief 5.2, 6.2): the pane standing in the studio's test frame in
// front of the far wall. Outside the glass: the room wall in 10:30 skylight (no patch in view).
// The frame: 10 px bars in shade tones with a 1 px lit inner edge. Through the glass: the far wall
// (plaster at a greater distance, a far, soft sun patch, 92% transmitted) sampled at an offset of
// slope × 0.004 × viewport height, so it barely wavers; a 1 px warm rim and a faint green edge.
// Inside the loupe disc, and over the whole pane while the relief is shown: bicolour schlieren in
// the page's own light. Deflection one way catches the sun (#FFE1A6 family), the other falls into
// skylight shade (#3A4142 family): dunes under raking light, no new saturated colour.
//
// Returns linear radiance; WP4's compositor tail tone-maps it. Helpers used (declared before the
// chunks by WP4): uViewport, uSky, uSun, uAlbedo, uPlaster, wallAlbedo(), skyFall(), plainWall().
import * as THREE from 'three'
import type { ModeChunk } from '@/webgl/pass'
import { srgbHexToLinear } from '@/lib/color'
import { GLASS, fresnelTransmission } from '@/lib/light/glass'

/**
 * Schlieren gain: the 95th percentile of |dot(high-passed slope, knife)| over the pane, along the
 * default diagonal knife, maps to ±0.8 (6.2). Measured from the uploaded field itself whenever a
 * new one arrives; this default is the value for the `aslant` pane.
 */
const SCHLIEREN_K = 0.8 / 0.00443

let measuredTex: unknown = null

function gainOf(tex: THREE.DataTexture): number {
  const data = tex.image?.data as Uint16Array | undefined
  if (!data || data.length < 4) return SCHLIEREN_K
  const n = data.length >> 2
  const proj = new Float32Array(n)
  const f = THREE.DataUtils.fromHalfFloat
  for (let i = 0; i < n; i++) proj[i] = Math.abs(0.7071 * (f(data[4 * i + 2]) + f(data[4 * i + 3])))
  proj.sort()
  const p95 = proj[Math.floor(n * 0.95)]
  return p95 > 1e-6 ? 0.8 / p95 : SCHLIEREN_K
}

const v3 = (hex: string) => new THREE.Vector3(...srgbHexToLinear(hex))

export const paneChunk: ModeChunk = {
  glsl: /* glsl */ `
uniform vec4 uPaneRect;        // glass rect, CSS px (light.pane)
uniform float uPaneBar;        // test-frame bar width, CSS px
uniform vec3 uPaneLoupe;       // x, y, r (CSS px)
uniform vec2 uPaneKnife;       // the filter's split direction (unit)
uniform float uPaneRelief;     // 0 loupe only, 1 the whole pane
uniform float uPaneK;          // schlieren gain
uniform float uPaneT;          // Fresnel transmission of the two faces
uniform float uPaneReady;      // 1 once the slope field is uploaded
uniform vec3 uPaneSunHue;      // lin(#FFE1A6)
uniform vec3 uPaneShadeHue;    // lin(#3A4142)
uniform vec3 uPaneRim;         // lin(#FFE9C8)
uniform vec3 uPaneGreen;       // lin(#A8C4B4)
uniform sampler2D uSlope;      // RGBA16F 256 x 128: slope xy, high-passed slope xy (rows top to bottom)

float paneLuma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }

// The far wall behind the test frame, seen through the glass: finer plaster (farther away), the
// same skylight, and the far 10:30 patch, defocused.
vec3 paneFarWall(vec2 p, vec2 uv) {
  vec3 alb = wallAlbedo(p * 1.7 + vec2(311.0, 187.0));
  vec2 q = p / uViewport;
  vec3 E = uSky * skyFall(q) * 0.94;
  // far patch: a soft slanted parallelogram, low and right of centre (the sun is upper left),
  // with the window's transom as a soft shadow across it, all out of focus behind the pane
  float v = (uv.y - 0.44) / 0.40;
  float u = (uv.x - 0.34 - v * 0.14) / 0.46;
  float soft = 0.2;
  float m = smoothstep(-soft, soft, u) * smoothstep(-soft, soft, 1.0 - u)
          * smoothstep(-soft, soft, v) * smoothstep(-soft, soft, 1.0 - v);
  m *= 1.0 - 0.55 * (1.0 - smoothstep(0.0, 0.16, abs(v - 0.24)));
  E += uSun * 0.15 * m;
  return alb * E;
}

vec3 shadePane(vec2 fragCSS) {
  vec4 R = uPaneRect;
  vec3 room = plainWall(fragCSS);
  if (R.z < 2.0 || R.w < 2.0) return room;

  vec2 lo = R.xy;
  vec2 hi = R.xy + R.zw;
  vec2 uv = (fragCSS - lo) / R.zw;

  // test frame: bars outside the glass rect
  vec2 dOut = max(lo - fragCSS, fragCSS - hi);            // > 0 outside the glass on that axis
  float outside = max(dOut.x, dOut.y);
  if (outside > 0.0) {
    if (outside > uPaneBar) {
      // the frame's soft shadow on the room wall just beyond the bars (skylight from upper left)
      float sh = 1.0 - 0.10 * (1.0 - smoothstep(0.0, 18.0, outside - uPaneBar));
      return room * sh;
    }
    vec3 bar = wallAlbedo(fragCSS * 0.5 + vec2(53.0, 29.0)) * 0.55 * uSky * skyFall(fragCSS / uViewport);
    // 1 px lit inner edge on the bars that face the window (top and left catch the skylight)
    float inner = 1.0 - smoothstep(0.0, 1.2, outside);
    float facing = step(dOut.x, dOut.y) * step(fragCSS.y, lo.y) + step(dOut.y, dOut.x) * step(fragCSS.x, lo.x);
    bar *= 1.0 + inner * (0.35 + 0.45 * facing);
    // a hairline of shade at the outer edge reads the bar as a solid
    bar *= 1.0 - 0.25 * smoothstep(uPaneBar - 1.2, uPaneBar, outside);
    return bar;
  }

  // through the glass
  vec4 s = uPaneReady > 0.5 ? texture(uSlope, uv) : vec4(0.0);
  vec2 off = s.xy * 0.004 * uViewport.y;                  // it barely wavers
  vec3 col = paneFarWall(fragCSS + off, uv) * uPaneT;

  // bicolour schlieren: inside the loupe disc, and everywhere as the relief sweeps in
  float d = length(fragCSS - uPaneLoupe.xy);
  float r = uPaneLoupe.z;
  float disc = r > 0.5 ? 1.0 - smoothstep(r - 1.0, r + 0.5, d) : 0.0;
  float sweep = dot(uv - 0.5, uPaneKnife) * 0.7 + 0.5;     // the relief arrives along the knife
  float reveal = smoothstep(sweep - 0.18, sweep + 0.02, uPaneRelief * 1.2 - 0.1);
  float lens = max(disc, reveal) * uPaneReady;
  if (lens > 0.0) {
    // four taps a texel apart: the folds keep their shape, the cell noise goes
    vec2 tx = vec2(0.75 / 256.0, 0.75 / 128.0);
    vec2 hp = 0.25 * (texture(uSlope, uv + vec2(tx.x, tx.y)).zw + texture(uSlope, uv + vec2(-tx.x, tx.y)).zw
                    + texture(uSlope, uv + vec2(tx.x, -tx.y)).zw + texture(uSlope, uv + vec2(-tx.x, -tx.y)).zw);
    float kd = uPaneK * dot(hp, uPaneKnife);
    float k = kd / (1.0 + 0.25 * abs(kd));                  // soft shoulder instead of a hard clip
    float room0 = paneLuma(col);
    vec3 shade = uPaneShadeHue * (room0 * 0.55 / max(paneLuma(uPaneShadeHue), 1e-4));
    float litLevel = paneLuma(wallAlbedo(fragCSS) * (uSky + uSun * 0.34));
    vec3 lit = uPaneSunHue * (litLevel / max(paneLuma(uPaneSunHue), 1e-4));
    float t = 0.5 + 0.5 * k;
    vec3 schl = mix(shade, lit, pow(clamp(t, 0.0, 1.0), 3.2));   // mean near the room, lit flanks near the far patch
    col = mix(col, schl, lens);
  }
  // 1 px lit rim of the loupe
  if (r > 0.5) {
    float rim = exp(-0.5 * (d - r) * (d - r) / 0.36);
    col += uPaneRim * uSun * 0.05 * rim * uPaneReady;
  }

  // the glass edge: a 1 px warm rim highlight and a faint green edge (the sheet seen edge-on)
  float e = min(min(fragCSS.x - lo.x, hi.x - fragCSS.x), min(fragCSS.y - lo.y, hi.y - fragCSS.y));
  float rimLine = 1.0 - smoothstep(0.0, 1.2, e);
  float green = (1.0 - smoothstep(1.0, 5.0, e)) * (1.0 - rimLine);
  vec3 rimRad = uPaneRim * max(paneLuma(room) * 6.0, 0.35);
  col = mix(col, rimRad, 0.25 * rimLine);
  col = mix(col, uPaneGreen * paneLuma(col) / max(paneLuma(uPaneGreen), 1e-4) * 1.3, 0.18 * green);
  return col;
}
`,
  uniforms: {
    uPaneRect: { value: new THREE.Vector4(0, 0, 0, 0) },
    uPaneBar: { value: 10 },
    uPaneLoupe: { value: new THREE.Vector3(0, 0, 0) },
    uPaneKnife: { value: new THREE.Vector2(0.71, 0.71) },
    uPaneRelief: { value: 0 },
    uPaneK: { value: SCHLIEREN_K },
    uPaneT: { value: fresnelTransmission(GLASS.clear.nd) },
    uPaneReady: { value: 0 },
    uPaneSunHue: { value: v3('#FFE1A6') },
    uPaneShadeHue: { value: v3('#3A4142') },
    uPaneRim: { value: v3('#FFE9C8') },
    uPaneGreen: { value: v3('#A8C4B4') },
    uSlope: { value: null },
  },
  update(l) {
    const u = paneChunk.uniforms
    ;(u.uPaneRect.value as THREE.Vector4).set(l.pane.x, l.pane.y, l.pane.w, l.pane.h)
    ;(u.uPaneLoupe.value as THREE.Vector3).set(l.loupe.x, l.loupe.y, l.loupe.r)
    const n = Math.hypot(l.loupe.knifeX, l.loupe.knifeY) || 1
    ;(u.uPaneKnife.value as THREE.Vector2).set(l.loupe.knifeX / n, l.loupe.knifeY / n)
    u.uPaneRelief.value = l.loupe.relief
    const tex = u.uSlope.value as THREE.DataTexture | null
    u.uPaneReady.value = tex ? 1 : 0
    if (tex && tex !== measuredTex) {
      measuredTex = tex
      u.uPaneK.value = gainOf(tex)
    }
  },
}

export default paneChunk
