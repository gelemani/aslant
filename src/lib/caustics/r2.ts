// Ray origins (brief 6.1.1): the R2 low-discrepancy sequence, identical to scripts/bake-light.py.
//   x_i = fract(0.5 + i · a1), y_i = fract(0.5 + i · a2), i = 1 … N, in double precision.
// Ray k (0-based) of every transport has R2 index k + 1, so the first n rays of a 65,536-ray
// bake are a valid uniform subsample. Origins live in lower-light space [0, 1]², y down.

export const R2_A1 = 0.7548776662466927
export const R2_A2 = 0.5698402909980532

/** R2 points 1 … n in double precision, x and y interleaved (the worker's sources). */
export function r2Points(n: number): Float64Array {
  const out = new Float64Array(2 * n)
  for (let k = 0; k < n; k++) {
    const i = k + 1
    const x = 0.5 + i * R2_A1
    const y = 0.5 + i * R2_A2
    out[2 * k] = x - Math.floor(x)
    out[2 * k + 1] = y - Math.floor(y)
  }
  return out
}

const cache = new Map<number, Float32Array>()

/** R2 origins 1 … n as float32, x and y interleaved; cached per n (callers must not mutate). */
export function r2Origins(n: number): Float32Array {
  const hit = cache.get(n)
  if (hit) return hit
  const d = r2Points(n)
  const out = new Float32Array(2 * n)
  for (let i = 0; i < 2 * n; i++) out[i] = d[i]
  cache.set(n, out)
  return out
}
