// Sliced optimal transport from uniform sunlight to a word (brief 6.1.1), step for step the
// algorithm of scripts/bake-light.py:
//   density  red channel / 255 of the 1024 × 480 raster, separable Gaussian blur σ 0.8 px (radius 3)
//   targets  Hilbert-order inverse CDF, N quantiles (j + 0.5) / N, jittered in the pixel, mulberry32(7)
//   map      P = S (R2); per iteration a direction θ_k = fract(u0 + k · 0.618…) · π, where u0 is the
//            first draw of mulberry32(seed, 9 by default); project P and T on (cos θ, sin θ) in
//            isotropic coordinates (y · 480 / 1024); LSD radix sort both; move each ray by the
//            rank-matched difference (step 1.0)
//            (Craft note: the golden-angle schedule is the low-discrepancy form of the brief's
//            θ = rand() · π. Same seed, same determinism in Python and TypeScript, and it converges
//            faster: at 32,768 × 96 it puts 95.8% of rays on ink against 92.3%, at 65,536 × 256
//            98.2% against 96.9%; the first streamed frame is already the cracked slab.)
//   strays   rays the map leaves off the letters (density below 0.05 · mean: counters, gaps) move to
//            the nearest ink pixel (density ≥ 0.5) holding fewer than 2 rays, keeping their sub-pixel
//            offset (final map only; see snapStrays)
//   density  aDensity_i = max(density(P_i) / mean(density), 0.05)
// Pure module: runs in the transport worker (and in node for checks).

import { RadixSorter } from './radix'

export const RASTER_W = 1024
export const RASTER_H = 480
export const JITTER_SEED = 7
export const SOT_SEED = 9
export const BLUR_SIGMA = 0.8
export const BLUR_RADIUS = 3
export const DENSITY_FLOOR = 0.05
/** 1 / φ: the golden-angle step of the direction schedule. */
export const GOLDEN = 0.6180339887498949

/** mulberry32: the seeded PRNG shared with the bake (vectorised there, same sequence). */
export function mulberry32(seed: number): () => number {
  let a = seed | 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

let kernel: Float64Array | null = null
function blurKernel(): Float64Array {
  if (kernel) return kernel
  const k = new Float64Array(2 * BLUR_RADIUS + 1)
  let sum = 0
  for (let i = -BLUR_RADIUS; i <= BLUR_RADIUS; i++) {
    const v = Math.exp(-0.5 * (i / BLUR_SIGMA) * (i / BLUR_SIGMA))
    k[i + BLUR_RADIUS] = v
    sum += v
  }
  for (let i = 0; i < k.length; i++) k[i] /= sum
  kernel = k
  return k
}

/**
 * Density from the raster: the red channel / 255, blurred with σ 0.8 px (zero outside the raster;
 * never ctx.filter, which Safari lacks). Accepts RGBA (w·h·4) or one channel (w·h).
 */
export function rasterDensity(
  raster: Uint8ClampedArray | Uint8Array,
  w = RASTER_W,
  h = RASTER_H,
  into?: { tmp: Float64Array; out: Float64Array },
): Float64Array {
  const size = w * h
  const stride = raster.length >= 4 * size ? 4 : 1
  const k = blurKernel()
  const r = BLUR_RADIUS
  // Float64 throughout, like the bake: a float32 CDF moves a few quantiles into the next pixel.
  // `into` lets the worker reuse two 3.9 MB buffers across jobs (less GC under typing).
  const tmp = into && into.tmp.length === size ? into.tmp : new Float64Array(size)
  const inv = 1 / 255
  // Horizontal pass, reading the red channel directly.
  for (let y = 0; y < h; y++) {
    const row = y * w
    for (let x = 0; x < w; x++) {
      let acc = 0
      const x0 = x - r < 0 ? -(x - r) : 0
      const x1 = x + r >= w ? 2 * r - (x + r - (w - 1)) : 2 * r
      for (let i = x0; i <= x1; i++) acc += k[i] * (raster[(row + x - r + i) * stride] * inv)
      tmp[row + x] = acc
    }
  }
  const out = into && into.out.length === size ? into.out : new Float64Array(size)
  for (let y = 0; y < h; y++) {
    const y0 = y - r < 0 ? -(y - r) : 0
    const y1 = y + r >= h ? 2 * r - (y + r - (h - 1)) : 2 * r
    for (let x = 0; x < w; x++) {
      let acc = 0
      for (let i = y0; i <= y1; i++) acc += k[i] * tmp[(y - r + i) * w + x]
      out[y * w + x] = acc
    }
  }
  return out
}

/**
 * N target samples in raster space [0, 1]² (x, y interleaved): the density's inverse CDF along
 * the Hilbert order at the quantiles (j + 0.5) / N, jittered inside the pixel (mulberry32(7),
 * x then y per sample). Returns null when the raster is empty.
 */
export function sampleTargets(density: Float64Array, order: Int32Array, n: number, w = RASTER_W, h = RASTER_H): Float64Array | null {
  const m = order.length
  let total = 0
  for (let k = 0; k < m; k++) total += density[order[k]]
  if (!(total > 0)) return null
  const out = new Float64Array(2 * n)
  const rand = mulberry32(JITTER_SEED)
  // Walk the CDF and the sorted quantiles together (searchsorted, side 'left').
  let k = 0
  let cdf = density[order[0]]
  for (let j = 0; j < n; j++) {
    const q = ((j + 0.5) / n) * total
    while (cdf < q && k < m - 1) {
      k++
      cdf += density[order[k]]
    }
    const p = order[k]
    const py = (p / w) | 0
    const px = p - py * w
    out[2 * j] = (px + rand()) / w
    out[2 * j + 1] = (py + rand()) / h
  }
  return out
}

/** The iterative sliced transport. Sources and targets in raster space, x and y interleaved. */
export class SlicedOT {
  readonly n: number
  iter = 0
  private readonly px: Float64Array
  private readonly py: Float64Array
  private readonly tx: Float64Array
  private readonly ty: Float64Array
  private readonly sortP: RadixSorter
  private readonly sortT: RadixSorter
  private phase = 0
  private readonly iso: number

  constructor(sources: Float64Array, targets: Float64Array, seed = SOT_SEED, w = RASTER_W, h = RASTER_H) {
    const n = sources.length >> 1
    this.n = n
    this.iso = h / w
    this.px = new Float64Array(n)
    this.py = new Float64Array(n)
    this.tx = new Float64Array(n)
    this.ty = new Float64Array(n)
    this.sortP = new RadixSorter(n)
    this.sortT = new RadixSorter(n)
    this.reset(sources, targets, seed)
  }

  /** Restarts from new sources and targets of the same length, reusing every buffer. */
  reset(sources: Float64Array, targets: Float64Array, seed = SOT_SEED): void {
    if (sources.length >> 1 !== this.n || targets.length >> 1 !== this.n) throw new Error('SlicedOT.reset: length mismatch')
    for (let i = 0; i < this.n; i++) {
      this.px[i] = sources[2 * i]
      this.py[i] = sources[2 * i + 1] * this.iso
      this.tx[i] = targets[2 * i]
      this.ty[i] = targets[2 * i + 1] * this.iso
    }
    this.phase = mulberry32(seed)()
    this.iter = 0
  }

  /** Direction of iteration k (0-based), radians in [0, π). */
  direction(k: number): number {
    const u = this.phase + k * GOLDEN
    return (u - Math.floor(u)) * Math.PI
  }

  /** Runs `count` iterations. */
  step(count: number): void {
    const { n, px, py, tx, ty } = this
    const kp = this.sortP.keys
    const kt = this.sortT.keys
    for (let c = 0; c < count; c++) {
      const th = this.direction(this.iter)
      const cs = Math.cos(th)
      const sn = Math.sin(th)
      for (let i = 0; i < n; i++) {
        kp[i] = px[i] * cs + py[i] * sn
        kt[i] = tx[i] * cs + ty[i] * sn
      }
      const ip = this.sortP.sort()
      const it = this.sortT.sort()
      for (let r = 0; r < n; r++) {
        const i = ip[r]
        const j = it[r]
        const d = tx[j] * cs + ty[j] * sn - (px[i] * cs + py[i] * sn)
        px[i] += d * cs
        py[i] += d * sn
      }
      this.iter++
    }
  }

  /** Current map in raster space as float32, x and y interleaved (a fresh array: transferable). */
  targets(): Float32Array {
    const n = this.n
    const out = new Float32Array(2 * n)
    const inv = 1 / this.iso
    for (let i = 0; i < n; i++) {
      out[2 * i] = this.px[i]
      out[2 * i + 1] = this.py[i] * inv
    }
    return out
  }
}

// ── strays ───────────────────────────────────────────────────────────────────
export const SNAP_TAU = 0.5
export const SNAP_RADIUS = 64
export const SNAP_CAP = 2

let snapOffsets: Int32Array | null = null
/** (dx, dy) within SNAP_RADIUS, sorted by distance², then dy, then dx (as the bake). */
function snapOffsetList(): Int32Array {
  if (snapOffsets) return snapOffsets
  const R = SNAP_RADIUS
  const list: Array<[number, number, number]> = []
  for (let dy = -R; dy <= R; dy++) {
    for (let dx = -R; dx <= R; dx++) {
      const d2 = dx * dx + dy * dy
      if (d2 <= R * R) list.push([d2, dy, dx])
    }
  }
  list.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2])
  const out = new Int32Array(2 * list.length)
  for (let k = 0; k < list.length; k++) {
    out[2 * k] = list[k][2]
    out[2 * k + 1] = list[k][1]
  }
  snapOffsets = out
  return out
}

/**
 * Sliced OT converges slowly on holes: its last rays stay in counters and letter gaps, where
 * aDensity hits the 0.05 floor and the caustic pass draws them as big soft blobs (haze inside the
 * 'o'). The true transport sends no light there, so each such ray (density below 0.05 · mean) moves
 * to the nearest ink pixel (density ≥ 0.5) that holds fewer than 2 rays, keeping its sub-pixel
 * offset. Rays are visited in index order; identical in scripts/bake-light.py. In place; returns
 * how many moved. Applied to final maps only (streamed frames show the unfinished computation).
 */
export function snapStrays(targets: Float32Array, density: Float64Array, mean: number, w = RASTER_W, h = RASTER_H): number {
  const n = targets.length >> 1
  const floorD = DENSITY_FLOOR * mean
  const occ = new Uint8Array(w * h)
  const strays: number[] = []
  for (let i = 0; i < n; i++) {
    let px = Math.floor(targets[2 * i] * w)
    let py = Math.floor(targets[2 * i + 1] * h)
    px = px < 0 ? 0 : px >= w ? w - 1 : px
    py = py < 0 ? 0 : py >= h ? h - 1 : py
    const p = py * w + px
    if (density[p] < floorD) strays.push(i)
    else if (occ[p] < 255) occ[p]++
  }
  const off = snapOffsetList()
  let moved = 0
  for (const i of strays) {
    const x = targets[2 * i] * w
    const y = targets[2 * i + 1] * h
    let px = Math.floor(x)
    let py = Math.floor(y)
    const fx = x - px
    const fy = y - py
    px = px < 0 ? 0 : px >= w ? w - 1 : px
    py = py < 0 ? 0 : py >= h ? h - 1 : py
    for (let k = 0; k < off.length; k += 2) {
      const qx = px + off[k]
      const qy = py + off[k + 1]
      if (qx < 0 || qx >= w || qy < 0 || qy >= h) continue
      const q = qy * w + qx
      if (density[q] >= SNAP_TAU && occ[q] < SNAP_CAP) {
        targets[2 * i] = (qx + (fx >= 0 && fx < 1 ? fx : 0.5)) / w
        targets[2 * i + 1] = (qy + (fy >= 0 && fy < 1 ? fy : 0.5)) / h
        occ[q]++
        moved++
        break
      }
    }
  }
  return moved
}

/** Mean of the density over the whole raster. */
export function meanDensity(density: Float64Array): number {
  let s = 0
  for (let i = 0; i < density.length; i++) s += density[i]
  return s / density.length
}

/** aDensity_i = max(density(P_i) / mean(density), 0.05), nearest pixel. */
export function rayDensity(density: Float64Array, targets: Float32Array, mean: number, w = RASTER_W, h = RASTER_H): Float32Array {
  const n = targets.length >> 1
  const out = new Float32Array(n)
  const inv = mean > 0 ? 1 / mean : 0
  for (let i = 0; i < n; i++) {
    let x = (targets[2 * i] * w) | 0
    let y = (targets[2 * i + 1] * h) | 0
    x = x < 0 ? 0 : x >= w ? w - 1 : x
    y = y < 0 ? 0 : y >= h ? h - 1 : y
    const d = density[y * w + x] * inv
    out[i] = d > DENSITY_FLOOR ? d : DENSITY_FLOOR
  }
  return out
}
