// Limewash plaster (brief 2.3, 6.1.3): a 1024^2 tileable fbm texture generated once at boot.
// R = cloud (0.3 to 1 m blotches, sampled at fragCSS / 900), G = trowel marks (fragCSS / 140),
// B = drawn-glass cords (sampled in patch space, stretched into horizontal streaks).
// The CPU copy is kept so calibrate.ts can divide out the actual mottling at the calibration point.
import * as THREE from 'three'

export const PLASTER_SIZE = 1024

export interface PlasterData {
  size: number
  rgba: Uint8Array
}

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Periodic gradient noise octave (period F cells over the tile), added into out (res x res). */
function gradOctave(out: Float32Array, res: number, F: number, amp: number, rand: () => number, ridge = false) {
  const gx = new Float32Array(F * F)
  const gy = new Float32Array(F * F)
  for (let i = 0; i < F * F; i++) {
    const a = rand() * Math.PI * 2
    gx[i] = Math.cos(a)
    gy[i] = Math.sin(a)
  }
  const c0 = new Int32Array(res)
  const c1 = new Int32Array(res)
  const fr = new Float32Array(res)
  const fd = new Float32Array(res)
  for (let x = 0; x < res; x++) {
    const f = (x * F) / res
    const i = Math.floor(f)
    const t = f - i
    c0[x] = i % F
    c1[x] = (i + 1) % F
    fr[x] = t
    fd[x] = t * t * t * (t * (t * 6 - 15) + 10)
  }
  for (let y = 0; y < res; y++) {
    const r0 = c0[y] * F
    const r1 = c1[y] * F
    const ty = fr[y]
    const wy = fd[y]
    const row = y * res
    for (let x = 0; x < res; x++) {
      const tx = fr[x]
      const wx = fd[x]
      const a = r0 + c0[x], b = r0 + c1[x], c = r1 + c0[x], d = r1 + c1[x]
      const na = gx[a] * tx + gy[a] * ty
      const nb = gx[b] * (tx - 1) + gy[b] * ty
      const nc = gx[c] * tx + gy[c] * (ty - 1)
      const nd = gx[d] * (tx - 1) + gy[d] * (ty - 1)
      const top = na + (nb - na) * wx
      const bot = nc + (nd - nc) * wx
      let v = (top + (bot - top) * wy) * 1.4142
      if (ridge) {
        v = 1 - Math.abs(v)
        v = v * v * v * v * v * v
      }
      out[row + x] += amp * v
    }
  }
}

/** Normalise to [0, 1] between the 0.5th and 99.5th percentiles. */
function normalise(a: Float32Array) {
  const sample: number[] = []
  const step = Math.max(1, Math.floor(a.length / 20000))
  for (let i = 0; i < a.length; i += step) sample.push(a[i])
  sample.sort((x, y) => x - y)
  const lo = sample[Math.floor(sample.length * 0.005)]
  const hi = sample[Math.floor(sample.length * 0.995)]
  const k = 1 / Math.max(hi - lo, 1e-6)
  for (let i = 0; i < a.length; i++) a[i] = Math.min(1, Math.max(0, (a[i] - lo) * k))
}

function channel(res: number, octaves: Array<[F: number, amp: number, ridge?: boolean]>, seed: number) {
  const out = new Float32Array(res * res)
  const rand = mulberry32(seed)
  for (const [F, amp, ridge] of octaves) gradOctave(out, res, F, amp, rand, ridge)
  normalise(out)
  return out
}

/** Bilinear, wrapping upsample of a res^2 channel into byte channel c of the RGBA tile. */
function upsampleInto(rgba: Uint8Array, size: number, src: Float32Array, res: number, c: number) {
  const s = res / size
  for (let y = 0; y < size; y++) {
    const fy = (y + 0.5) * s - 0.5
    const iy = Math.floor(fy)
    const ty = fy - iy
    const y0 = ((iy % res) + res) % res
    const y1 = (y0 + 1) % res
    for (let x = 0; x < size; x++) {
      const fx = (x + 0.5) * s - 0.5
      const ix = Math.floor(fx)
      const tx = fx - ix
      const x0 = ((ix % res) + res) % res
      const x1 = (x0 + 1) % res
      const a = src[y0 * res + x0], b = src[y0 * res + x1], cc = src[y1 * res + x0], d = src[y1 * res + x1]
      const v = (a + (b - a) * tx) * (1 - ty) + (cc + (d - cc) * tx) * ty
      rgba[(y * size + x) * 4 + c] = Math.round(v * 255)
    }
  }
}

let cached: PlasterData | null = null

export function generatePlaster(): PlasterData {
  if (cached) return cached
  const size = PLASTER_SIZE
  const rgba = new Uint8Array(size * size * 4)
  // Cloud: broad blotches (a 900 CSS px tile: 225 px cells and finer).
  const cloud = channel(256, [[4, 1], [8, 0.55], [16, 0.3], [32, 0.16], [64, 0.08]], 11)
  // Trowel: fine marks with a few ridged strokes (a 140 CSS px tile).
  const trowel = channel(512, [[12, 0.5], [24, 0.45, true], [48, 0.35], [96, 0.25], [192, 0.12]], 23)
  // Cords: isotropic here; patch-space sampling stretches it about 36:1 into horizontal streaks.
  const cords = channel(256, [[6, 0.6], [12, 0.7], [24, 0.45], [48, 0.2]], 37)
  upsampleInto(rgba, size, cloud, 256, 0)
  upsampleInto(rgba, size, trowel, 512, 1)
  upsampleInto(rgba, size, cords, 256, 2)
  for (let i = 3; i < rgba.length; i += 4) rgba[i] = 255
  cached = { size, rgba }
  return cached
}

export function plasterTexture(p: PlasterData): THREE.DataTexture {
  const tex = new THREE.DataTexture(p.rgba, p.size, p.size, THREE.RGBAFormat, THREE.UnsignedByteType)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.magFilter = THREE.LinearFilter
  tex.minFilter = THREE.LinearMipmapLinearFilter
  tex.generateMipmaps = true
  tex.colorSpace = THREE.NoColorSpace
  tex.needsUpdate = true
  return tex
}

function sampleChannel(p: PlasterData, u: number, v: number, c: number) {
  const n = p.size
  const fx = (u - Math.floor(u)) * n - 0.5
  const fy = (v - Math.floor(v)) * n - 0.5
  const ix = Math.floor(fx)
  const iy = Math.floor(fy)
  const tx = fx - ix
  const ty = fy - iy
  const x0 = ((ix % n) + n) % n, x1 = (x0 + 1) % n
  const y0 = ((iy % n) + n) % n, y1 = (y0 + 1) % n
  const at = (x: number, y: number) => p.rgba[(y * n + x) * 4 + c] / 255
  const a = at(x0, y0), b = at(x1, y0), cc = at(x0, y1), d = at(x1, y1)
  return (a + (b - a) * tx) * (1 - ty) + (cc + (d - cc) * tx) * ty
}

/**
 * Mean limewash mottling factor (0.91 + 0.18 cloud)(0.97 + 0.06 trowel) over a square window of
 * win CSS px centred on (cx, cy) CSS px, exactly as wall.glsl samples it.
 */
export function plasterMean(p: PlasterData, cx: number, cy: number, win = 64): number {
  const steps = 32
  let sum = 0
  for (let j = 0; j < steps; j++) {
    const y = cy - win / 2 + ((j + 0.5) / steps) * win
    for (let i = 0; i < steps; i++) {
      const x = cx - win / 2 + ((i + 0.5) / steps) * win
      const cloud = sampleChannel(p, x / 900, y / 900, 0)
      const trowel = sampleChannel(p, x / 140, y / 140, 1)
      sum += (0.91 + 0.18 * cloud) * (0.97 + 0.06 * trowel)
    }
  }
  return sum / (steps * steps)
}
