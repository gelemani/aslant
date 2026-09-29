// Glass optics (brief 6.1.2, 7.3). Every number about glass printed on the page
// comes from here. Pure and dependency-free (node tests and workers can import it).

export type GlassId = 'clear' | 'prismatic'

export interface GlassSpec {
  id: GlassId
  /** Material, for captions. */
  material: string
  /** Refractive index at the helium d line (587.56 nm). */
  nd: number
  /** Abbe number. */
  vd: number
  /** Cauchy coefficients: n(λ) = A + B / λ², λ in µm. */
  A: number
  B: number
}

export const GLASS: Readonly<Record<GlassId, GlassSpec>> = {
  clear: { id: 'clear', material: 'PMMA', nd: 1.4917, vd: 57.4, A: 1.47871, B: 0.004484 },
  prismatic: { id: 'prismatic', material: 'flint (N-SF10-like)', nd: 1.72825, vd: 28.53, A: 1.68955, B: 0.013362 },
}

/** The pane the physics is sized for: width of the word pane and its throw to the wall. */
export const PANE = { widthMm: 300, throwMm: 1500 } as const

/** Refractive index at a wavelength in nm (Cauchy). */
export function nAt(glass: GlassId, nm: number): number {
  const g = GLASS[glass]
  const um = nm / 1000
  return g.A + g.B / (um * um)
}

/** (n(λ) − 1) / (n_d − 1): how much further (or less far) a band bends than the design wavelength. */
export function dispersionScale(glass: GlassId, nm: number): number {
  const g = GLASS[glass]
  return (nAt(glass, nm) - 1) / (g.nd - 1)
}

/** Normal-incidence transmission through two surfaces: (1 − ((n − 1)/(n + 1))²)². Clear → 0.92363. */
export function fresnelTransmission(n: number): number {
  const r = (n - 1) / (n + 1)
  const R = r * r
  return (1 - R) * (1 - R)
}

// ── spectral bands ────────────────────────────────────────────────────────────

/** Piecewise Gaussian of Wyman, Sloan and Shirley (2013). */
function g(x: number, mu: number, s1: number, s2: number): number {
  const s = x < mu ? s1 : s2
  const t = (x - mu) / s
  return Math.exp(-0.5 * t * t)
}

/** Multi-lobe fit of the CIE 1931 2° observer (Wyman, Sloan, Shirley 2013). */
export function cie1931(nm: number): [number, number, number] {
  const x = 1.056 * g(nm, 599.8, 37.9, 31.0) + 0.362 * g(nm, 442.0, 16.0, 26.7) - 0.065 * g(nm, 501.1, 20.4, 26.2)
  const y = 0.821 * g(nm, 568.8, 46.9, 40.5) + 0.286 * g(nm, 530.9, 16.3, 31.1)
  const z = 1.217 * g(nm, 437.0, 11.8, 36.0) + 0.681 * g(nm, 459.0, 26.0, 13.8)
  return [x, y, z]
}

/** XYZ → linear sRGB (D65). */
function xyzToLinearSrgb(x: number, y: number, z: number): [number, number, number] {
  return [
    3.2406 * x - 1.5372 * y - 0.4986 * z,
    -0.9689 * x + 1.8758 * y + 0.0415 * z,
    0.0557 * x - 0.204 * y + 1.057 * z,
  ]
}

export type BandCount = 3 | 4 | 8 | 12

export interface Band {
  /** Bin centre, nm. */
  nm: number
  /** Bin edges, nm. */
  lo: number
  hi: number
  /** Linear sRGB weight; the K bands sum to (1, 1, 1). Negative lobes are allowed. */
  rgb: [number, number, number]
}

export const SPECTRUM_NM = { lo: 400, hi: 700 } as const
const SUBSAMPLES = 12

const bandCache = new Map<number, ReadonlyArray<Band>>()

/**
 * K equal bins over 400 to 700 nm. Each bin's colour is the mean of the CIE fit over
 * 12 sub-samples spanning the bin edge to edge (inclusive), converted to linear sRGB, then white-balanced so the K colours sum
 * to (1, 1, 1). Test vector, K = 8: band 0 (418.75 nm) ≈ (0.0334, −0.0386, 0.3043),
 * band 4 (568.75 nm) ≈ (0.2806, 0.3817, −0.0566).
 */
export function bands(K: BandCount): ReadonlyArray<Band> {
  const hit = bandCache.get(K)
  if (hit) return hit
  const width = (SPECTRUM_NM.hi - SPECTRUM_NM.lo) / K
  const raw: Band[] = []
  const sum = [0, 0, 0]
  for (let k = 0; k < K; k++) {
    const lo = SPECTRUM_NM.lo + k * width
    const hi = lo + width
    let X = 0
    let Y = 0
    let Z = 0
    for (let s = 0; s < SUBSAMPLES; s++) {
      const nm = lo + (s / (SUBSAMPLES - 1)) * width // inclusive of both bin edges
      const [x, y, z] = cie1931(nm)
      X += x
      Y += y
      Z += z
    }
    const rgb = xyzToLinearSrgb(X / SUBSAMPLES, Y / SUBSAMPLES, Z / SUBSAMPLES)
    sum[0] += rgb[0]
    sum[1] += rgb[1]
    sum[2] += rgb[2]
    raw.push({ nm: (lo + hi) / 2, lo, hi, rgb })
  }
  for (const b of raw) {
    b.rgb = [b.rgb[0] / sum[0], b.rgb[1] / sum[1], b.rgb[2] / sum[2]]
  }
  const out = Object.freeze(raw)
  bandCache.set(K, out)
  return out
}

/** Per-band dispersion for a glass mix (0 clear, 1 prismatic), as uDispersion expects. */
export function bandDispersion(K: BandCount, prism: number): number[] {
  return bands(K).map((b) => {
    const c = dispersionScale('clear', b.nm)
    const p = dispersionScale('prismatic', b.nm)
    return c + (p - c) * prism
  })
}

/** Photons out of 100 that reach the wall through the glass (Fresnel only, normal incidence). */
export function photonsPer100(glass: GlassId): number {
  return Math.round(fresnelTransmission(GLASS[glass].nd) * 100)
}
