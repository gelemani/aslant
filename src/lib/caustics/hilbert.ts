// Hilbert traversal of the word raster (brief 6.1.1): the target samples are the density's
// inverse CDF taken along this curve, which stratifies them in 2D. Identical to
// scripts/bake-light.py (the classic xy → d mapping on a 2^order square, pixels of the
// 1024 × 480 raster addressed by their integer coordinates).

/** Position of cell (x, y) along the Hilbert curve of a 2^order square. */
export function hilbertD(x: number, y: number, order = 10): number {
  const n = 1 << order
  let d = 0
  for (let s = n >> 1; s > 0; s >>= 1) {
    const rx = (x & s) > 0 ? 1 : 0
    const ry = (y & s) > 0 ? 1 : 0
    d += s * s * ((3 * rx) ^ ry)
    if (ry === 0) {
      if (rx === 1) {
        x = n - 1 - x
        y = n - 1 - y
      }
      const t = x
      x = y
      y = t
    }
  }
  return d
}

const cache = new Map<string, Int32Array>()

/**
 * Pixel indices (y · w + x) of a w × h grid in Hilbert order (order 10 covers 1024 × 1024).
 * Built once per worker by direct placement (every d is unique), about 20 ms for 1024 × 480.
 */
export function hilbertOrder(w: number, h: number, order = 10): Int32Array {
  const key = `${w}x${h}@${order}`
  const hit = cache.get(key)
  if (hit) return hit
  const side = 1 << order
  if (w > side || h > side) throw new Error('hilbertOrder: grid larger than the curve')
  const slot = new Int32Array(side * side).fill(-1)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) slot[hilbertD(x, y, order)] = y * w + x
  }
  const out = new Int32Array(w * h)
  let k = 0
  for (let d = 0; d < slot.length; d++) {
    const p = slot[d]
    if (p >= 0) out[k++] = p
  }
  cache.set(key, out)
  return out
}
