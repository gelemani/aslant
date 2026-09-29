// The bend: CPU tracer for the optical bench (brief 5.3, 6.3). Pure and dependency-free
// apart from glass.ts, so the server (no-JS readouts), the BenchFigure island (picking,
// readouts) and BenchPass (drawing) all share one trace.
//
// The slice: the pane's horizontal centre line of the `aslant` relief (x slope component),
// integrated into a height profile. Rays travel toward the pane at normal incidence (no bend
// at the flat entry face). At the exit face with local tilt α (true, unexaggerated):
//   θt = asin(n(λ) · sin α), deviation δ = θt − α,
// and the ray lands where it would at the true 1.5 m throw: offset = throw · tan δ, drawn at
// the pane's own scale. Only the drawing is exaggerated: the exit face is drawn 40 times
// deeper than it is (the scale note), and the spectrum fan is widened by FAN_GAIN so a
// 1.74% dispersion reads as a thin coloured edge. Readouts always use the true α.
import { GLASS, PANE, bands, fresnelTransmission, nAt } from '@/lib/light/glass'

/** "Relief drawn 40 times deeper than it is." */
export const RELIEF_EXAGGERATION = 40
/** True pane thickness (Clear), drawn at scale. */
export const PANE_THICKNESS_MM = 12
/** Widening of the band fan beyond true dispersion so the spectrum is visible at screen scale. */
export const FAN_GAIN = 6
/** Beat thresholds on p (5.3). */
export const BEAT_2_AT = 0.36
export const BEAT_3_AT = 0.68
/** Wavelengths of the beat 3 readouts. */
export const BLUE_NM = 486
export const RED_NM = 656
/** Samples of the slice and of the wall profile. */
export const SLICE_N = 256
export const PROFILE_N = 256
/** Floats per drawn segment: x0 y0 x1 y1 · r g b · alpha · core px · fade-in. */
export const SEG_STRIDE = 10

const DEG = 180 / Math.PI

export type BenchTier = 3 | 2

/** Rays × bands per GPU tier (6.3). */
export function benchCounts(tier: BenchTier): { rays: number; bands: 12 | 4 } {
  return tier === 3 ? { rays: 64, bands: 12 } : { rays: 32, bands: 4 }
}

// ── the slice ────────────────────────────────────────────────────────────────

export interface BenchSlice {
  /** True surface tilt along the pane, radians, SLICE_N samples (cell centres). */
  alpha: Float32Array
  /** Exit-face height above its lowest point, mm, SLICE_N samples. */
  heightMm: Float32Array
  /** Largest height, mm. */
  depthMm: number
}

/**
 * The slice from a relief slope field (RGBA per cell, 256 × 128, rows top to bottom):
 * the x slope along the horizontal centre line (mean of the two middle rows).
 */
export function sliceFromSlope(slope: ArrayLike<number>, width = 256, height = 128): BenchSlice {
  const alpha = new Float32Array(SLICE_N)
  const r0 = (height >> 1) - 1
  const r1 = height >> 1
  for (let i = 0; i < SLICE_N; i++) {
    const x = Math.min(width - 1, Math.floor(((i + 0.5) / SLICE_N) * width))
    alpha[i] = 0.5 * (slope[4 * (r0 * width + x)] + slope[4 * (r1 * width + x)])
  }
  const heightMm = new Float32Array(SLICE_N)
  const dx = PANE.widthMm / SLICE_N
  let h = 0
  let lo = Infinity
  let hi = -Infinity
  for (let i = 0; i < SLICE_N; i++) {
    h += Math.tan(alpha[i]) * dx
    heightMm[i] = h
    if (h < lo) lo = h
    if (h > hi) hi = h
  }
  for (let i = 0; i < SLICE_N; i++) heightMm[i] -= lo
  return { alpha, heightMm, depthMm: hi - lo }
}

/** Linear sample of a SLICE_N array at s in [0, 1]. */
function sampleAt(a: ArrayLike<number>, s: number): number {
  const f = Math.min(SLICE_N - 1, Math.max(0, s * SLICE_N - 0.5))
  const i = Math.floor(f)
  const j = Math.min(SLICE_N - 1, i + 1)
  const t = f - i
  return a[i] * (1 - t) + a[j] * t
}

// ── optics ───────────────────────────────────────────────────────────────────

/** Snell at the exit face (glass to air): the angle out, radians, for tilt α and index n. */
export function angleOut(alpha: number, n: number): number {
  const s = n * Math.sin(alpha)
  return Math.asin(s > 1 ? 1 : s < -1 ? -1 : s)
}

/** Deviation δ = θt − α. */
export function deviation(alpha: number, n: number): number {
  return angleOut(alpha, n) - alpha
}

/** True angles in degrees for the readouts (Clear at n_d). */
export function rayAnglesDeg(alpha: number): { inDeg: number; outDeg: number } {
  return { inDeg: Math.abs(alpha) * DEG, outDeg: Math.abs(angleOut(alpha, GLASS.clear.nd)) * DEG }
}

/** Refractive index of Clear at a wavelength (beat 3 readouts). */
export function clearIndexAt(nm: number): number {
  return nAt('clear', nm)
}

// ── layout ───────────────────────────────────────────────────────────────────

/**
 * Bench geometry as fractions of the bench band (the-bend's anchor rect). `a` runs along the
 * beam (the light's direction), `c` across it. Split: a = x, c = y. Stacked (rotated): the
 * light falls from the top, a = y, c = x.
 */
export interface BenchLayout {
  rotated: boolean
  /** Where the incoming rays start (they fade in from here), along the beam. */
  start: number
  /** The pane's flat entry face, along the beam. */
  pane: number
  /** The wall line, along the beam. */
  wall: number
  /** The rays' span across the beam. */
  c0: number
  c1: number
}

/** Split: rays from the left edge, pane at x 38%, wall at x 94%, rays over y 46% to 90% of the viewport (band top 44%, height 54%). */
export const LAYOUT_SPLIT: BenchLayout = { rotated: false, start: 0, pane: 0.38, wall: 0.94, c0: (46 - 44) / 54, c1: (90 - 44) / 54 }
/**
 * Stacked: rays from y 8%, pane at y 26%, wall at y 51% of the viewport (band top 6%, height 50%),
 * across x 8% to 92%. The wall sits 7% above the text band (58%) so the scale note, which cannot
 * go under the pane on phones without crossing the rays, has air between the wall and the H2.
 */
export const LAYOUT_STACKED: BenchLayout = { rotated: true, start: (8 - 6) / 50, pane: (26 - 6) / 50, wall: (51 - 6) / 50, c0: 0.08, c1: 0.92 }

// ── the trace ────────────────────────────────────────────────────────────────

export interface TraceInput {
  slice: BenchSlice
  layout: BenchLayout
  /** Bench band size, CSS px. */
  w: number
  h: number
  tier: BenchTier
  /** 0 flat glass, 1 the full relief (beat 1 → 2). */
  relief: number
  /** 0 one white ray per position, 1 the band fan (beat 2 → 3). */
  fan: number
  /** Picked ray index, −1 none. */
  picked: number
}

export interface BenchTrace {
  rays: number
  bands: number
  /** Segments, SEG_STRIDE floats each, band-local CSS px (origin at the band's top left). */
  seg: Float32Array
  segCount: number
  /** Design-wavelength polyline per ray (start, entry, exit, wall): rays × 4 points × (x, y). */
  path: Float32Array
  /** Light on the wall across the beam, relative to flat glass (1 = plain sunlight), PROFILE_N bins over the band's across extent. */
  profile: Float32Array
  /** Exit-face depth beyond the flat thickness, CSS px, PROFILE_N bins over the same extent (0 outside the pane). */
  face: Float32Array
  /** Along-beam CSS px of the entry face, the flat exit face and the wall; across-beam px of the pane's ends. */
  entryA: number
  exitA: number
  wallA: number
  paneC0: number
  paneC1: number
  /** True tilt per ray (radians, scaled by relief). */
  alpha: Float32Array
  /** Positions along the pane, s in [0, 1], per ray. */
  s: Float32Array
}

/** Sun colour of the bench beam (#FFF5EA, linear) and the white-ray opacity. */
const BEAM_RGB: [number, number, number] = [1, 0.9131, 0.8228]
/** The picked ray carries the page's one accent, direct sun (#FFE1A6, linear). */
const PICKED_RGB: [number, number, number] = [1, 0.7529, 0.3813]
const WHITE_ALPHA = 0.55
const CORE_PX = 2
const PICKED_CORE_PX = 1.5
const PROFILE_SUB = 4
const T_PANE = fresnelTransmission(GLASS.clear.nd)

/** Band colours clamped to non-negative (additive blending cannot subtract), renormalised to sum to white. */
const bandCache = new Map<number, Array<[number, number, number]>>()
function positiveBands(K: 12 | 4): Array<[number, number, number]> {
  const hit = bandCache.get(K)
  if (hit) return hit
  const raw = bands(K).map((b) => [Math.max(0, b.rgb[0]), Math.max(0, b.rgb[1]), Math.max(0, b.rgb[2])] as [number, number, number])
  const sum = [0, 0, 0]
  for (const c of raw) for (let i = 0; i < 3; i++) sum[i] += c[i]
  const out = raw.map((c) => [c[0] / sum[0], c[1] / sum[1], c[2] / sum[2]] as [number, number, number])
  bandCache.set(K, out)
  return out
}

/** Centre of the rays' span: the default picked ray. */
export function centralRay(rays: number): number {
  return rays >> 1
}

export function traceBench(inp: TraceInput): BenchTrace {
  const { slice, layout: L, w, h, tier, picked } = inp
  const relief = Math.min(1, Math.max(0, inp.relief))
  const fan = Math.min(1, Math.max(0, inp.fan))
  const { rays, bands: K } = benchCounts(tier)
  const cols = positiveBands(K)
  const bandNm = bands(K).map((b) => b.nm)
  const nd = GLASS.clear.nd

  // along (a) and across (c) extents in px
  const lenA = L.rotated ? h : w
  const lenC = L.rotated ? w : h
  const startA = L.start * lenA
  const entryA = L.pane * lenA
  const wallA = L.wall * lenA
  // The pane never spans more than 1.3 × the throw drawn: its relief, drawn 40 times deeper,
  // must stay well clear of the wall when the bench stands on end (portrait tablets).
  const mid = 0.5 * (L.c0 + L.c1) * lenC
  const half = 0.5 * Math.min((L.c1 - L.c0) * lenC, 1.3 * (wallA - entryA))
  const c0 = mid - half
  const c1 = mid + half
  const paneLenPx = c1 - c0
  const pxPerMm = paneLenPx / PANE.widthMm
  const exitA = entryA + PANE_THICKNESS_MM * pxPerMm
  const throwPx = PANE.throwMm * pxPerMm
  const depthScale = RELIEF_EXAGGERATION * pxPerMm * relief

  const xy = (a: number, c: number): [number, number] => (L.rotated ? [c, a] : [a, c])

  const segCount = rays * (2 + K)
  const seg = new Float32Array(segCount * SEG_STRIDE)
  const path = new Float32Array(rays * 8)
  const alphaOut = new Float32Array(rays)
  const sOut = new Float32Array(rays)
  let o = 0
  const put = (a0: number, cc0: number, a1: number, cc1: number, rgb: readonly number[], alpha: number, core: number, fade: number) => {
    const [x0, y0] = xy(a0, cc0)
    const [x1, y1] = xy(a1, cc1)
    seg[o] = x0
    seg[o + 1] = y0
    seg[o + 2] = x1
    seg[o + 3] = y1
    seg[o + 4] = rgb[0]
    seg[o + 5] = rgb[1]
    seg[o + 6] = rgb[2]
    seg[o + 7] = alpha
    seg[o + 8] = core
    seg[o + 9] = fade
    o += SEG_STRIDE
  }

  for (let i = 0; i < rays; i++) {
    const s = (i + 0.5) / rays
    const c = c0 + s * paneLenPx
    const alpha = sampleAt(slice.alpha, s) * relief
    const faceA = exitA + sampleAt(slice.heightMm, s) * depthScale
    const isPicked = i === picked
    const aW = isPicked ? 1 : WHITE_ALPHA
    const core = isPicked ? PICKED_CORE_PX : CORE_PX
    sOut[i] = s
    alphaOut[i] = alpha

    // incoming (fades in from the band edge) and inside the glass: one white ray
    const rayRgb = isPicked ? PICKED_RGB : BEAM_RGB
    // each face returns 3.9% of the light (fresnelTransmission): 100 in, about 96 inside, 92 out
    const T1 = Math.sqrt(T_PANE)
    put(startA, c, entryA, c, rayRgb, aW, core, 1)
    put(entryA, c, faceA, c, rayRgb, aW * T1, core, 0)

    // out of the exit face: K bands; at fan 0 they coincide and sum to the white ray
    const dD = deviation(alpha, nd)
    for (let k = 0; k < K; k++) {
      const dK = deviation(alpha, nAt('clear', bandNm[k]))
      const d = dD + (dK - dD) * FAN_GAIN * fan
      const landC = c + Math.tan(d) * throwPx
      const rgb = cols[k]
      put(faceA, c, wallA, landC, [rgb[0] * rayRgb[0], rgb[1] * rayRgb[1], rgb[2] * rayRgb[2]], aW * T_PANE, core, 0)
    }

    const landD = c + Math.tan(dD) * throwPx
    const p = i * 8
    const pts: Array<[number, number]> = [xy(startA, c), xy(entryA, c), xy(faceA, c), xy(wallA, landD)]
    for (let q = 0; q < 4; q++) {
      path[p + 2 * q] = pts[q][0]
      path[p + 2 * q + 1] = pts[q][1]
    }
  }

  // wall profile: PROFILE_SUB × SLICE_N sub-rays binned across the band, relative to flat glass
  const profile = new Float32Array(PROFILE_N)
  const binW = lenC / PROFILE_N
  const nSub = SLICE_N * PROFILE_SUB
  const perBinFlat = (nSub * binW) / paneLenPx
  const raw = new Float32Array(PROFILE_N)
  for (let j = 0; j < nSub; j++) {
    const s = (j + 0.5) / nSub
    const c = c0 + s * paneLenPx
    const d = deviation(sampleAt(slice.alpha, s) * relief, nd)
    const land = c + Math.tan(d) * throwPx
    const b = Math.floor(land / binW)
    if (b >= 0 && b < PROFILE_N) raw[b] += 1
  }
  for (let b = 0; b < PROFILE_N; b++) {
    const l = raw[Math.max(0, b - 1)]
    const r = raw[Math.min(PROFILE_N - 1, b + 1)]
    profile[b] = (0.25 * l + 0.5 * raw[b] + 0.25 * r) / perBinFlat
  }

  // exit-face depth over the same across extent
  const face = new Float32Array(PROFILE_N)
  for (let b = 0; b < PROFILE_N; b++) {
    const c = (b + 0.5) * binW
    const s = (c - c0) / paneLenPx
    face[b] = s < 0 || s > 1 ? 0 : sampleAt(slice.heightMm, s) * depthScale
  }

  return { rays, bands: K, seg, segCount, path, profile, face, entryA, exitA, wallA, paneC0: c0, paneC1: c1, alpha: alphaOut, s: sOut }
}

// ── picking ──────────────────────────────────────────────────────────────────

function distToSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const vx = bx - ax
  const vy = by - ay
  const len2 = vx * vx + vy * vy
  const t = len2 > 0 ? Math.min(1, Math.max(0, ((px - ax) * vx + (py - ay) * vy) / len2)) : 0
  const dx = px - (ax + t * vx)
  const dy = py - (ay + t * vy)
  return Math.hypot(dx, dy)
}

/** Nearest ray to a band-local point within `radius` CSS px (distance to its polyline), or −1. */
export function pickRay(t: BenchTrace, x: number, y: number, radius = 24): number {
  let best = -1
  let bestD = radius
  for (let i = 0; i < t.rays; i++) {
    const p = i * 8
    for (let q = 0; q < 3; q++) {
      const d = distToSegment(x, y, t.path[p + 2 * q], t.path[p + 2 * q + 1], t.path[p + 2 * q + 2], t.path[p + 2 * q + 3])
      if (d < bestD) {
        bestD = d
        best = i
      }
    }
  }
  return best
}

/** Beat from the section progress p (5.3): 1 below 0.36, 2 below 0.68, else 3. */
export function beatAt(p: number): 1 | 2 | 3 {
  return p < BEAT_2_AT ? 1 : p < BEAT_3_AT ? 2 : 3
}

/** Relief morph (p 0.30 to 0.42) and fan (p 0.62 to 0.74), linear in p (5.3). */
export function benchUniformsAt(p: number): { relief: number; fan: number } {
  const ramp = (a: number, b: number) => Math.min(1, Math.max(0, (p - a) / (b - a)))
  return { relief: ramp(0.3, 0.42), fan: ramp(0.62, 0.74) }
}

// ── the shared slice (BenchFigure computes it once; BenchPass and the bench chunk read it) ──

let sharedSlice: BenchSlice | null = null
let sliceVersion = 0

export function setBenchSlice(s: BenchSlice): void {
  sharedSlice = s
  sliceVersion++
}

export function benchSlice(): { slice: BenchSlice | null; version: number } {
  return { slice: sharedSlice, version: sliceVersion }
}

// ── one trace per input set, shared by BenchFigure (picking), the bench chunk and BenchPass ──

let lastKey = ''
let lastTrace: BenchTrace | null = null

/** traceBench, memoised on its inputs (one recompute when relief, fan, pick, size or tier change). */
export function sharedTrace(inp: TraceInput): BenchTrace {
  const key = `${inp.w | 0}:${inp.h | 0}:${inp.layout.rotated ? 1 : 0}:${inp.relief.toFixed(4)}:${inp.fan.toFixed(4)}:${inp.picked}:${inp.tier}:${sliceVersion}`
  if (key !== lastKey || !lastTrace) {
    lastKey = key
    lastTrace = traceBench(inp)
  }
  return lastTrace
}
