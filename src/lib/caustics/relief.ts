// The pane's surface from a transport (brief 6.4.3). Pure; runs in the transport worker.
//   1. Bin rays by origin into 256 × 128 cells; mean displacement (P_i − S_i) in millimetres on a
//      300 mm wide pane (height 300 · 480 / 1024 mm) thrown 1.5 m to the wall.
//   2. Slope α = atan(disp / throw) / (n − 1) per component (Clear); empty cells filled from
//      their neighbours; smoothed over σ 0.75 cells (the cutter; removes per-cell grain);
//      high-pass = slope minus a Gaussian blur of σ 3 cells (6.2).
//   3. Depth: least-squares Poisson integration of tan α on 128 × 64 by conjugate gradient
//      (≤ 200 iterations, Neumann boundaries: only interior edges enter the energy).
// Sliced OT maps carry a little curl, so the height is their curl-free part ("about").

export const RELIEF_W = 256
export const RELIEF_H = 128
export const HEIGHT_W = 128
export const HEIGHT_H = 64
const HP_SIGMA = 3
const SMOOTH_SIGMA = 0.75
const CG_MAX = 200

export interface ReliefOptions {
  /** Refractive index the slopes are computed for (Clear, n_d). */
  nd: number
  widthMm: number
  throwMm: number
  /** Raster height / width (480 / 1024): the pane's aspect. */
  aspect: number
}

export interface ReliefField {
  /** RGBA per cell, 256 × 128, rows top to bottom: slope x, slope y (radians), high-passed x, y. */
  slope: Float32Array
  width: 256
  height: 128
  maxSlopeDeg: number
  maxTurnDeg: number
  depthMm: number
  /** Surface height in mm above its lowest point, 128 × 64, rows top to bottom (contour map). */
  heightMm: Float32Array
  heightWidth: 128
  heightHeight: 64
  /** Pane size the field is computed for, mm. */
  paneMm: { w: number; h: number }
}

const DEG = 180 / Math.PI

function gaussKernel(sigma: number): Float32Array {
  const r = Math.ceil(3 * sigma)
  const k = new Float32Array(2 * r + 1)
  let s = 0
  for (let i = -r; i <= r; i++) {
    const v = Math.exp(-0.5 * (i / sigma) * (i / sigma))
    k[i + r] = v
    s += v
  }
  for (let i = 0; i < k.length; i++) k[i] /= s
  return k
}

/** Separable Gaussian blur with clamped edges. */
function blurField(src: Float32Array, w: number, h: number, sigma: number): Float32Array {
  const k = gaussKernel(sigma)
  const r = (k.length - 1) >> 1
  const tmp = new Float32Array(w * h)
  const out = new Float32Array(w * h)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let a = 0
      for (let i = -r; i <= r; i++) {
        const xx = x + i < 0 ? 0 : x + i >= w ? w - 1 : x + i
        a += k[i + r] * src[y * w + xx]
      }
      tmp[y * w + x] = a
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let a = 0
      for (let i = -r; i <= r; i++) {
        const yy = y + i < 0 ? 0 : y + i >= h ? h - 1 : y + i
        a += k[i + r] * tmp[yy * w + x]
      }
      out[y * w + x] = a
    }
  }
  return out
}

/** Fills cells with count 0 from the mean of their filled 8-neighbours, ring by ring. */
function fillEmpty(ax: Float32Array, ay: Float32Array, filled: Uint8Array, w: number, h: number): void {
  let pending = 0
  for (let i = 0; i < filled.length; i++) if (!filled[i]) pending++
  let guard = w + h
  const next = new Uint8Array(filled.length)
  while (pending > 0 && guard-- > 0) {
    next.set(filled)
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const c = y * w + x
        if (filled[c]) continue
        let sx = 0
        let sy = 0
        let m = 0
        for (let dy = -1; dy <= 1; dy++) {
          const yy = y + dy
          if (yy < 0 || yy >= h) continue
          for (let dx = -1; dx <= 1; dx++) {
            const xx = x + dx
            if (xx < 0 || xx >= w || (dx === 0 && dy === 0)) continue
            const q = yy * w + xx
            if (!filled[q]) continue
            sx += ax[q]
            sy += ay[q]
            m++
          }
        }
        if (m > 0) {
          ax[c] = sx / m
          ay[c] = sy / m
          next[c] = 1
          pending--
        }
      }
    }
    filled.set(next)
  }
}

/** Least-squares height from a gradient field by conjugate gradient (graph Laplacian, Neumann). */
function integrate(gx: Float32Array, gy: Float32Array, w: number, h: number, hx: number, hy: number): Float64Array {
  const size = w * h
  // Edge targets: height differences in mm between neighbouring cells.
  const tx = new Float64Array((w - 1) * h)
  const ty = new Float64Array(w * (h - 1))
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w - 1; x++) tx[y * (w - 1) + x] = hx * 0.5 * (gx[y * w + x] + gx[y * w + x + 1])
  }
  for (let y = 0; y < h - 1; y++) {
    for (let x = 0; x < w; x++) ty[y * w + x] = hy * 0.5 * (gy[y * w + x] + gy[(y + 1) * w + x])
  }
  // b = Dᵀ t
  const b = new Float64Array(size)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w - 1; x++) {
      const t = tx[y * (w - 1) + x]
      b[y * w + x + 1] += t
      b[y * w + x] -= t
    }
  }
  for (let y = 0; y < h - 1; y++) {
    for (let x = 0; x < w; x++) {
      const t = ty[y * w + x]
      b[(y + 1) * w + x] += t
      b[y * w + x] -= t
    }
  }
  // A p = Dᵀ D p (the graph Laplacian with free, i.e. Neumann, boundaries).
  const apply = (p: Float64Array, out: Float64Array) => {
    out.fill(0)
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w - 1; x++) {
        const c = y * w + x
        const d = p[c + 1] - p[c]
        out[c + 1] += d
        out[c] -= d
      }
    }
    for (let y = 0; y < h - 1; y++) {
      for (let x = 0; x < w; x++) {
        const c = y * w + x
        const d = p[c + w] - p[c]
        out[c + w] += d
        out[c] -= d
      }
    }
  }
  const hgt = new Float64Array(size)
  const r = Float64Array.from(b)
  const p = Float64Array.from(b)
  const Ap = new Float64Array(size)
  let rr = 0
  let bb = 0
  for (let i = 0; i < size; i++) {
    rr += r[i] * r[i]
    bb += b[i] * b[i]
  }
  if (bb === 0) return hgt
  for (let k = 0; k < CG_MAX; k++) {
    apply(p, Ap)
    let pAp = 0
    for (let i = 0; i < size; i++) pAp += p[i] * Ap[i]
    if (!(pAp > 0)) break
    const a = rr / pAp
    let rn = 0
    for (let i = 0; i < size; i++) {
      hgt[i] += a * p[i]
      r[i] -= a * Ap[i]
      rn += r[i] * r[i]
    }
    if (rn < 1e-14 * bb) break
    const beta = rn / rr
    for (let i = 0; i < size; i++) p[i] = r[i] + beta * p[i]
    rr = rn
  }
  return hgt
}

/**
 * Relief of a transport. `origins` and `targets` are x, y interleaved: origins as R2 points
 * (lower-light space, the same unit square as the raster here), targets in raster space.
 */
export function computeReliefField(origins: ArrayLike<number>, targets: ArrayLike<number>, n: number, o: ReliefOptions): ReliefField {
  const W = RELIEF_W
  const H = RELIEF_H
  const paneW = o.widthMm
  const paneH = o.widthMm * o.aspect
  const cells = W * H
  const sumX = new Float64Array(cells)
  const sumY = new Float64Array(cells)
  const count = new Uint32Array(cells)
  for (let i = 0; i < n; i++) {
    const sx = origins[2 * i]
    const sy = origins[2 * i + 1]
    let cx = (sx * W) | 0
    let cy = (sy * H) | 0
    cx = cx < 0 ? 0 : cx >= W ? W - 1 : cx
    cy = cy < 0 ? 0 : cy >= H ? H - 1 : cy
    const c = cy * W + cx
    sumX[c] += (targets[2 * i] - sx) * paneW
    sumY[c] += (targets[2 * i + 1] - sy) * paneH
    count[c]++
  }
  const inv = 1 / (o.nd - 1)
  const ax = new Float32Array(cells)
  const ay = new Float32Array(cells)
  const filled = new Uint8Array(cells)
  for (let c = 0; c < cells; c++) {
    if (count[c] === 0) continue
    ax[c] = Math.atan(sumX[c] / count[c] / o.throwMm) * inv
    ay[c] = Math.atan(sumY[c] / count[c] / o.throwMm) * inv
    filled[c] = 1
  }
  fillEmpty(ax, ay, filled, W, H)
  // About two rays per cell: the per-cell means carry the map's sub-pixel jitter as grain, which the
  // loupe would magnify. A milled surface is smooth at a millimetre anyway (the cutter's radius), so
  // the field is smoothed over about 0.9 mm (sigma 0.75 cells) before anything is derived from it.
  const sx = blurField(ax, W, H, SMOOTH_SIGMA)
  const sy = blurField(ay, W, H, SMOOTH_SIGMA)
  ax.set(sx)
  ay.set(sy)

  const bx = blurField(ax, W, H, HP_SIGMA)
  const by = blurField(ay, W, H, HP_SIGMA)
  const slope = new Float32Array(cells * 4)
  let maxA = 0
  for (let c = 0; c < cells; c++) {
    slope[4 * c] = ax[c]
    slope[4 * c + 1] = ay[c]
    slope[4 * c + 2] = ax[c] - bx[c]
    slope[4 * c + 3] = ay[c] - by[c]
    const m = Math.hypot(ax[c], ay[c])
    if (m > maxA) maxA = m
  }
  const turn = Math.asin(Math.min(1, o.nd * Math.sin(maxA))) - maxA

  // Depth on 128 × 64 (2 × 2 means of the slope field), gradient = tan α.
  const gw = HEIGHT_W
  const gh = HEIGHT_H
  const gx = new Float32Array(gw * gh)
  const gy = new Float32Array(gw * gh)
  for (let y = 0; y < gh; y++) {
    for (let x = 0; x < gw; x++) {
      const c0 = 2 * y * W + 2 * x
      const mx = 0.25 * (ax[c0] + ax[c0 + 1] + ax[c0 + W] + ax[c0 + W + 1])
      const my = 0.25 * (ay[c0] + ay[c0 + 1] + ay[c0 + W] + ay[c0 + W + 1])
      gx[y * gw + x] = Math.tan(mx)
      gy[y * gw + x] = Math.tan(my)
    }
  }
  const hgt = integrate(gx, gy, gw, gh, paneW / gw, paneH / gh)
  let lo = Infinity
  let hi = -Infinity
  for (let i = 0; i < hgt.length; i++) {
    if (hgt[i] < lo) lo = hgt[i]
    if (hgt[i] > hi) hi = hgt[i]
  }
  const heightMm = new Float32Array(gw * gh)
  for (let i = 0; i < hgt.length; i++) heightMm[i] = hgt[i] - lo

  return {
    slope,
    width: 256,
    height: 128,
    maxSlopeDeg: maxA * DEG,
    maxTurnDeg: turn * DEG,
    depthMm: hi - lo,
    heightMm,
    heightWidth: 128,
    heightHeight: 64,
    paneMm: { w: paneW, h: paneH },
  }
}
