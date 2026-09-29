// Patch-local geometry shared by WP4's Scene and WP2's ray view (brief 4.3, 6.0 conventions).
// Pure functions, no three at runtime (bundle boundary, 7.2).
//
// Parallelogram in CSS px: top-left (x, y), top-right (x + w - k, y), bottom-right (x + w, y + h),
// bottom-left (x + k, y + h), with k = skew * h.
// Patch-local: v = (py - y) / h (down), u = (px - x - v k) / (w - k).
// Lower-light space (s, t) = ((u, v) - (u0, v0)) / (u1 - u0, v1 - v0).

export interface PatchGeom { x: number; y: number; w: number; h: number; skew: number }
export interface LowerRect { u0: number; v0: number; u1: number; v1: number }
export interface WordRect { x: number; y: number; w: number; h: number }

/** The word raster's aspect (1024 x 480). */
export const RASTER_ASPECT = 1024 / 480

export function toPatchLocal(px: number, py: number, p: PatchGeom): { u: number; v: number } {
  const k = p.skew * p.h
  const v = (py - p.y) / Math.max(p.h, 1e-6)
  const u = (px - p.x - v * k) / Math.max(p.w - k, 1e-6)
  return { u, v }
}

export function fromPatchLocal(u: number, v: number, p: PatchGeom): { x: number; y: number } {
  const k = p.skew * p.h
  return { x: p.x + v * k + u * (p.w - k), y: p.y + v * p.h }
}

/** Lower-light (s, t) to CSS px. */
export function lowerToCss(s: number, t: number, p: PatchGeom, l: LowerRect): { x: number; y: number } {
  return fromPatchLocal(l.u0 + s * (l.u1 - l.u0), l.v0 + t * (l.v1 - l.v0), p)
}

/** The lower light's un-sheared size in CSS px (the caustic target's aspect). */
export function lowerSizePx(p: PatchGeom, l: LowerRect): { w: number; h: number } {
  const k = p.skew * p.h
  return { w: Math.max(1, (p.w - k) * (l.u1 - l.u0)), h: Math.max(1, p.h * (l.v1 - l.v0)) }
}

/** Places the raster inside lower-light space so the word keeps its true aspect (6.1.2). */
export function wordRectFor(lowerW: number, lowerH: number, composition: 'split' | 'stacked', out?: WordRect): WordRect {
  const cap = composition === 'split' ? 0.86 : 0.94
  const w = Math.min(cap, (lowerH * 0.72 * RASTER_ASPECT) / lowerW)
  const h = (w * lowerW) / (lowerH * RASTER_ASPECT)
  const r = out ?? { x: 0, y: 0, w: 0, h: 0 }
  r.x = (1 - w) / 2
  r.y = (1 - h) / 2
  r.w = w
  r.h = h
  return r
}

/** Lower light of a split window: below the split and the transom; the whole patch for a single light. */
export function lowerOf(split: number, transom: number, out?: LowerRect): LowerRect {
  const r = out ?? { u0: 0, v0: 0, u1: 1, v1: 1 }
  r.u0 = 0
  r.u1 = 1
  r.v0 = split > 0 ? Math.min(0.95, split + transom) : 0
  r.v1 = 1
  return r
}

/** Direction from the patch back toward the window (screen space, up and to the left). */
export function beamDirection(skew: number): [number, number] {
  const x = -(skew + 0.35)
  const y = -1
  const n = Math.hypot(x, y)
  return [x / n, y / n]
}

/**
 * The beam volume as seen on screen: the convex hull of the patch polygon and its copy moved
 * `len` CSS px toward the window (default 1.4 viewport heights). Six vertices, CSS px, into out
 * (Float32Array(12)); a degenerate hull repeats its last vertex.
 */
export function beamHexagon(p: PatchGeom, viewportH: number, out: Float32Array, len = 1.4 * viewportH): Float32Array {
  const k = p.skew * p.h
  const [dx, dy] = beamDirection(p.skew)
  const quad: Array<[number, number]> = [[p.x, p.y], [p.x + p.w - k, p.y], [p.x + p.w, p.y + p.h], [p.x + k, p.y + p.h]]
  const pts: Array<[number, number]> = []
  for (const [x, y] of quad) {
    pts.push([x, y])
    pts.push([x + dx * len, y + dy * len])
  }
  const hull = convexHull(pts)
  for (let i = 0; i < 6; i++) {
    const q = hull[Math.min(i, hull.length - 1)] ?? [0, 0]
    out[i * 2] = q[0]
    out[i * 2 + 1] = q[1]
  }
  return out
}

function convexHull(points: Array<[number, number]>): Array<[number, number]> {
  const pts = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1])
  if (pts.length < 3) return pts
  const cross = (o: [number, number], a: [number, number], b: [number, number]) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
  const lower: Array<[number, number]> = []
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 1e-6) lower.pop()
    lower.push(p)
  }
  const upper: Array<[number, number]> = []
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i]
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 1e-6) upper.pop()
    upper.push(p)
  }
  upper.pop()
  lower.pop()
  return lower.concat(upper)
}

/** Soft point-in-convex-polygon (1 inside, 0 outside, soft over `edge` px centred on the edge), matching wall.glsl beamMask. */
export function beamMaskAt(px: number, py: number, hex: Float32Array, edge = 160): number {
  let area = 0
  for (let i = 0; i < 6; i++) {
    const j = (i + 1) % 6
    area += hex[i * 2] * hex[j * 2 + 1] - hex[j * 2] * hex[i * 2 + 1]
  }
  if (Math.abs(area) < 1) return 0
  const sgn = area >= 0 ? 1 : -1
  let m = 1
  for (let i = 0; i < 6; i++) {
    const j = (i + 1) % 6
    const ax = hex[i * 2], ay = hex[i * 2 + 1]
    const ex = hex[j * 2] - ax, ey = hex[j * 2 + 1] - ay
    const len = Math.hypot(ex, ey)
    if (len < 0.5) continue
    const d = (sgn * (ex * (py - ay) - ey * (px - ax))) / len
    const t = Math.min(1, Math.max(0, d / edge + 0.5))
    m *= t * t * (3 - 2 * t)
  }
  return m
}

/**
 * The hexagon's six edge lines as (nx, ny, c) with unit normals pointing inside, so that
 * d = nx * x + ny * y + c is the signed distance (CSS px, > 0 inside). Degenerate edges and a
 * degenerate hexagon give lines that never clip. Into out (Float32Array(18)).
 */
export function beamEdges(hex: Float32Array, out: Float32Array): Float32Array {
  let area = 0
  for (let i = 0; i < 6; i++) {
    const j = (i + 1) % 6
    area += hex[i * 2] * hex[j * 2 + 1] - hex[j * 2] * hex[i * 2 + 1]
  }
  const sgn = area >= 0 ? 1 : -1
  for (let i = 0; i < 6; i++) {
    const j = (i + 1) % 6
    const ax = hex[i * 2], ay = hex[i * 2 + 1]
    const ex = hex[j * 2] - ax, ey = hex[j * 2 + 1] - ay
    const len = Math.hypot(ex, ey)
    if (len < 0.5 || Math.abs(area) < 1) {
      out[i * 3] = 0
      out[i * 3 + 1] = 0
      out[i * 3 + 2] = Math.abs(area) < 1 ? -1e4 : 1e4
      continue
    }
    // inside when sgn * (ex * (py - ay) - ey * (px - ax)) > 0
    const nx = (-sgn * ey) / len
    const ny = (sgn * ex) / len
    out[i * 3] = nx
    out[i * 3 + 1] = ny
    out[i * 3 + 2] = -(nx * ax + ny * ay)
  }
  return out
}
