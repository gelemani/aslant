// Room calibration (brief 3.1.1, 6.1.5): skylight per channel so that the tone-mapped unlit wall
// at the chapter's calibration point equals the shade table within 2 sRGB levels. Inverts ACES
// by bisection on the CPU and divides out albedo x the actual plaster mottling over the 64 x 64
// CSS px window x skylight falloff x vignette (and subtracts the beam's air-light if it reaches).
// Imported only by the lazily loaded Scene, so the plaster data stays out of the main bundle.
import { plasterMean, type PlasterData } from './plaster'
import { beamMaskAt } from './patch-math'

export type RGB3 = [number, number, number]

/** ACES (Narkowicz fit), the compositor's tone curve, on the CPU. */
export function aces(x: number): number {
  const y = (x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14)
  return Math.min(1, Math.max(0, y))
}

/** Radiance that tone-maps to y (0 <= y < 1), by bisection. */
export function acesInverse(y: number): number {
  if (y <= 0) return 0
  let lo = 0
  let hi = 64
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2
    if (aces(mid) < y) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

export function skyFall(qx: number, qy: number): number {
  const d = qx * 0.62 + qy * 0.78
  const t = Math.min(1, Math.max(0, d / 1.35))
  const s = t * t * (3 - 2 * t)
  return 1.12 + (0.88 - 1.12) * s
}

export function vignette(qx: number, qy: number): number {
  const dx = (qx - 0.6) * 1.2
  const dy = qy - 0.5
  return 1 - 0.18 * (dx * dx + dy * dy)
}

export interface CalibrationInput {
  shade: RGB3                  // linear target (light.shade)
  calUv: [number, number]      // viewport fractions
  viewport: { w: number; h: number }
  albedo: RGB3                 // 0.62 x lin(#D6CEBE)
  plaster: PlasterData
  exposure?: number
  /** Beam air-light at the point: hexagon (CSS px), haze strength and sun radiance. */
  beam?: { hex: Float32Array; haze: number; sun: RGB3 }
}

/** uSky such that the unlit wall at calUv renders the shade target (6.1.5). */
export function calibrateSky(input: CalibrationInput, out: RGB3 = [0, 0, 0]): RGB3 {
  const { shade, calUv, viewport, albedo, plaster } = input
  const exposure = input.exposure ?? 1
  const [qx, qy] = calUv
  const cx = qx * viewport.w
  const cy = qy * viewport.h
  const mottle = plasterMean(plaster, cx, cy, 64)
  const fall = skyFall(qx, qy)
  const vig = vignette(qx, qy)
  const beamM = input.beam ? beamMaskAt(cx, cy, input.beam.hex) * input.beam.haze * 0.01 : 0
  for (let c = 0; c < 3; c++) {
    let rad = acesInverse(shade[c]) / exposure / vig
    if (input.beam) rad = Math.max(0, rad - beamM * input.beam.sun[c])
    out[c] = rad / Math.max(1e-6, albedo[c] * mottle * fall)
  }
  return out
}

/** The rendered unlit-wall colour at a point for a given sky (for QA readouts and tests). */
export function renderedShade(sky: RGB3, input: Omit<CalibrationInput, 'shade'>): RGB3 {
  const [qx, qy] = input.calUv
  const mottle = plasterMean(input.plaster, qx * input.viewport.w, qy * input.viewport.h, 64)
  const k = mottle * skyFall(qx, qy) * vignette(qx, qy) * (input.exposure ?? 1)
  return [aces(input.albedo[0] * sky[0] * k), aces(input.albedo[1] * sky[1] * k), aces(input.albedo[2] * sky[2] * k)]
}
