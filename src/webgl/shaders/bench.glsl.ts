// Bench mode chunk (the-bend, brief 5.3, 6.3): a side view of an optical bench in haze. Haze
// (#2F3536 on screen) with low-frequency noise of ±4% and faint air-light along the beam; the
// pane's cross-section as two edge highlights (the flat entry face and the exit face, whose relief
// is drawn 40 times deeper than it is); the wall as a 1 px line with the luminous profile glowing
// out of it where the traced rays crowd. The rays themselves are BenchPass (instanced lines,
// drawn after the compositor). Geometry comes from the shared trace (src/lib/bench/trace.ts),
// placed from the-bend's live anchor rect so the diagram and its DOM labels stay registered.
//
// Returns linear radiance; WP4's compositor tail tone-maps it.
import * as THREE from 'three'
import type { ModeChunk } from '@/webgl/pass'
import { liveRect } from '@/lib/anchors'
import { srgbHexToLinear } from '@/lib/color'
import { LAYOUT_SPLIT, LAYOUT_STACKED, PROFILE_N, benchSlice, sharedTrace, type BenchTrace } from '@/lib/bench/trace'
import { useApp } from '@/lib/store'

/** Inverse of the compositor's ACES fit (bisection), so the haze base displays as #2F3536. */
function acesInverse(y: number): number {
  const f = (x: number) => (x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14)
  let lo = 0
  let hi = 4
  for (let i = 0; i < 40; i++) {
    const m = 0.5 * (lo + hi)
    if (f(m) < y) lo = m
    else hi = m
  }
  return 0.5 * (lo + hi)
}

const hazeLin = srgbHexToLinear('#2F3536')
const HAZE = new THREE.Vector3(acesInverse(hazeLin[0]), acesInverse(hazeLin[1]), acesInverse(hazeLin[2]))

const profileData = new Uint16Array(PROFILE_N * 4)
const profileTex = new THREE.DataTexture(profileData, PROFILE_N, 1, THREE.RGBAFormat, THREE.HalfFloatType)
profileTex.magFilter = THREE.LinearFilter
profileTex.minFilter = THREE.LinearFilter
profileTex.wrapS = THREE.ClampToEdgeWrapping
profileTex.wrapT = THREE.ClampToEdgeWrapping
profileTex.colorSpace = THREE.NoColorSpace
profileTex.needsUpdate = true

let uploaded: BenchTrace | null = null

function upload(t: BenchTrace): void {
  if (t === uploaded) return
  uploaded = t
  const h = THREE.DataUtils.toHalfFloat
  for (let i = 0; i < PROFILE_N; i++) {
    profileData[4 * i] = h(t.profile[i])
    profileData[4 * i + 1] = h(t.face[i])
    profileData[4 * i + 2] = 0
    profileData[4 * i + 3] = h(1)
  }
  profileTex.needsUpdate = true
}

export const benchChunk: ModeChunk = {
  glsl: /* glsl */ `
uniform vec4 uBenchRect;       // bench band, viewport CSS px
uniform vec4 uBenchGeo;        // entry face, flat exit face, wall (px along the beam), rotated (0 | 1)
uniform vec3 uBenchSpan;       // pane ends across the beam (px), start of the rays along the beam (px)
uniform vec3 uBenchHaze;       // haze base radiance (displays as #2F3536)
uniform vec3 uBenchEdge;       // lin(#FFE9C8)
uniform float uBenchOn;        // 1 once the slice is traced
uniform sampler2D uBenchProfile;   // 256 x 1 RGBA16F: R wall light relative to flat glass, G exit-face depth (px)

float benchLine(float d, float w) { return exp(-0.5 * d * d / (w * w)); }

vec3 shadeBench(vec2 fragCSS) {
  float n = texture(uPlaster, fragCSS / 1500.0 + vec2(0.37, 0.11)).r;
  vec3 rad = uBenchHaze * (0.96 + 0.08 * n);                        // haze, low-frequency noise ±4%
  vec4 R = uBenchRect;
  if (uBenchOn < 0.5 || R.z < 2.0 || R.w < 2.0) return rad;

  bool rot = uBenchGeo.w > 0.5;
  vec2 b = fragCSS - R.xy;
  float a = rot ? b.y : b.x;                                          // along the beam
  float c = rot ? b.x : b.y;                                          // across it
  float lenA = rot ? R.w : R.z;
  float lenC = rot ? R.z : R.w;
  float entryA = uBenchGeo.x;
  float exitA = uBenchGeo.y;
  float wallA = uBenchGeo.z;
  float c0 = uBenchSpan.x;
  float c1 = uBenchSpan.y;
  float startA = uBenchSpan.z;
  float blur = 1.0 + 6.0 * uDefocus;

  float tc = clamp(c / lenC, 0.0, 1.0);
  vec4 pf = texture(uBenchProfile, vec2(tc, 0.5));
  float faceA = exitA + pf.g;
  float span = smoothstep(c0 - 14.0, c0 + 10.0, c) * smoothstep(c1 + 14.0, c1 - 10.0, c);

  // air-light along the beam: fades in from the start, a little less after the glass
  float fadeIn = smoothstep(startA, startA + 0.22 * lenA, a);
  float before = 1.0 - smoothstep(entryA - 2.0, entryA + 2.0, a);
  float after = smoothstep(faceA - 2.0, faceA + 2.0, a) * (1.0 - smoothstep(wallA - 1.0, wallA + 1.0, a));
  rad += uSun * 0.0065 * span * fadeIn * (before + 0.7 * after);

  // the glass: a faint body between the faces, and the two faces as edge highlights
  float inGlass = smoothstep(entryA - 0.5, entryA + 0.5, a) * (1.0 - smoothstep(faceA - 0.5, faceA + 0.5, a));
  float paneC = smoothstep(c0 - 3.0, c0, c) * smoothstep(c1 + 3.0, c1, c);
  rad += uSun * 0.006 * inGlass * paneC;
  float dFace = 2.0 * lenC / 256.0;
  float g0 = texture(uBenchProfile, vec2(clamp(tc - 1.0 / 256.0, 0.0, 1.0), 0.5)).g;
  float g1 = texture(uBenchProfile, vec2(clamp(tc + 1.0 / 256.0, 0.0, 1.0), 0.5)).g;
  float slope = (g1 - g0) / dFace;
  float dExit = abs(a - faceA) / sqrt(1.0 + slope * slope);          // distance to the curved exit face
  float edges = benchLine(a - entryA, 0.7 * blur) + benchLine(dExit, 0.7 * blur);
  float ends = benchLine(c - c0, 0.7 * blur) + benchLine(c - c1, 0.7 * blur);
  float glassBox = smoothstep(entryA - 1.0, entryA, a) * (1.0 - smoothstep(faceA, faceA + 1.0, a));
  rad += uBenchEdge * 0.16 * (edges * paneC + ends * glassBox);

  // the wall: a 1 px line, brighter where light lands, and the luminous profile out of it
  float amp = 0.06 * lenA;
  float P = max(pf.r, 0.0);
  float gP = clamp(P / 6.0, 0.0, 1.0);
  float curveA = wallA - amp * gP;
  float bandC = smoothstep(c0 - 16.0, c0 - 2.0, c) * smoothstep(c1 + 16.0, c1 + 2.0, c);   // the wall line spans the lit stretch
  float wallLine = benchLine(a - wallA, 0.6 * blur) * bandC;
  rad += uBenchEdge * wallLine * (0.05 + 0.4 * gP);
  // (every wall term stays inside the lit stretch, so the wall reads as a line in the letterbox,
  // never as a full-height rule: the fill's floor term used to run the whole frame)
  float fill = smoothstep(curveA - 1.0, curveA + 1.0, a) * (1.0 - smoothstep(wallA - 0.5, wallA + 0.5, a));
  rad += uSun * fill * bandC * (0.012 + 0.10 * gP * gP);
  rad += uSun * benchLine(a - curveA, 1.4 * blur) * 0.22 * gP * bandC;
  rad += uSun * benchLine(a - curveA, 7.0 * blur) * 0.05 * gP * bandC;
  return rad;
}
`,
  uniforms: {
    uBenchRect: { value: new THREE.Vector4(0, 0, 0, 0) },
    uBenchGeo: { value: new THREE.Vector4(0, 0, 0, 0) },
    uBenchSpan: { value: new THREE.Vector3(0, 0, 0) },
    uBenchHaze: { value: HAZE },
    uBenchEdge: { value: new THREE.Vector3(...srgbHexToLinear('#FFE9C8')) },
    uBenchOn: { value: 0 },
    uBenchProfile: { value: profileTex },
  },
  update(l) {
    const u = benchChunk.uniforms
    const benchWeight = (l.modeA === 'bench' ? 1 - l.modeMix : 0) + (l.modeB === 'bench' ? l.modeMix : 0)
    const r = liveRect('the-bend')
    const { slice } = benchSlice()
    if (!r || !slice || benchWeight <= 0) {
      u.uBenchOn.value = r && slice ? u.uBenchOn.value : 0
      if (r) (u.uBenchRect.value as THREE.Vector4).set(r.x, r.y, r.width, r.height)
      return
    }
    const rotated = l.bench.rotated > 0.5
    const t = sharedTrace({
      slice,
      layout: rotated ? LAYOUT_STACKED : LAYOUT_SPLIT,
      w: r.width,
      h: r.height,
      tier: useApp.getState().gpuTier === 2 ? 2 : 3,
      relief: l.bench.relief,
      fan: l.bench.fan,
      picked: l.bench.picked,
    })
    upload(t)
    ;(u.uBenchRect.value as THREE.Vector4).set(r.x, r.y, r.width, r.height)
    ;(u.uBenchGeo.value as THREE.Vector4).set(t.entryA, t.exitA, t.wallA, rotated ? 1 : 0)
    const L = rotated ? LAYOUT_STACKED : LAYOUT_SPLIT
    ;(u.uBenchSpan.value as THREE.Vector3).set(t.paneC0, t.paneC1, L.start * (rotated ? r.height : r.width))
    u.uBenchOn.value = 1
  },
}

export default benchChunk
