// The light: mutable state read every frame by the passes (brief 7.3).
// Every field has exactly one writer, named below. Every tweenable value is a plain
// number on a plain object; only the conductor-written `scrims` and `beam` are typed
// arrays, and nothing tweens them. Tweens never target a conductor-written field
// (4.1): GSAP's updateRoot runs before the conductor, which would overwrite them.
import type { ChapterId } from '@/content/chapters'

export type ViewMode = 'wall' | 'pane' | 'bench'
export type WordId = 'aslant' | 'ingrid' | 'visitor' | 'commission'

/** Deltas a section adds to its chapter state; all 0 by default. Folded in by the conductor (4.3). */
export interface SectionInput {
  focus: number
  wave: number
  sunX: number
  sunY: number
  aberr: number
  pointScale: number
  driftX: number
}

const ZERO: SectionInput = { focus: 0, wave: 0, sunX: 0, sunY: 0, aberr: 0, pointScale: 0, driftX: 0 }

/** A fresh zeroed SectionInput. */
export function zeroInput(): SectionInput {
  return { ...ZERO }
}

export const light = {
  // ── written only by the conductor (WP2), every frame; nothing tweens these ──
  chapter: 'first-light' as ChapterId,
  chapterFloat: 0,
  hour: 8 + 10 / 60,
  hourExact: 8 + 10 / 60,
  modeA: 'wall' as ViewMode,
  modeB: 'wall' as ViewMode,
  modeMix: 0,
  defocus: 0,
  /** rgb linear; e = E_sun; x, y offset in lower-light units. */
  sun: { r: 1, g: 0.77, b: 0.55, e: 1.4, x: 0, y: 0, aberr: 0 },
  /** sin(π·blend) during wall-to-wall blends, else 0 (4.3). */
  cloud: 0,
  /** Linear target (3.1.1) and calibration uv; WP4's Scene derives uSky from it (6.1.5). */
  shade: { r: 0, g: 0, b: 0, u: 0.25, v: 0.62 },
  patch: { x: 0, y: 0, w: 0, h: 0, skew: 0.2, split: 0.22, transom: 0.035, mullion: 0.022, on: 1 },
  /** Patch-local. */
  lower: { u0: 0, v0: 0.255, u1: 1, v1: 1 },
  wordRect: { x: 0.07, y: 0.2, w: 0.86, h: 0.6 },
  /** prism: 0 clear, 1 prismatic. */
  word: { id: 'aslant' as WordId | null, focus: 0, wave: 1, prism: 0, pointScale: 1 },
  skirtingY: -1,
  /** Damped scroll velocity for the dust swirl. */
  air: 0,
  scrims: new Float32Array(32),
  scrimCount: 0,
  /** Hexagon, CSS px. */
  beam: new Float32Array(12),

  // ── inputs: each written only by its section, folded in by the conductor (4.3) ──
  input: {
    'first-light': zeroInput(),
    'clear-glass': zeroInput(),
    'the-bend': zeroInput(),
    appointment: zeroInput(),
    'write-yours': zeroInput(),
    ledger: zeroInput(),
    commission: zeroInput(),
    dusk: zeroInput(),
  } as Record<ChapterId, SectionInput>,
  /** WP6. 0 at boot when the intro will play, tweened 0 → 1; 1 when skipped or settled. */
  intro: { dawn: 1, form: 1 },
  /** WP7 (the configurator). */
  visitor: { hour: 17 + 20 / 60, alt: 20, prism: 1, valid: 1 },

  // ── section state read directly by passes ──
  /** WP5, clear-glass glass rect, CSS px. */
  pane: { x: 0, y: 0, w: 0, h: 0 },
  /** WP5. */
  loupe: { x: 0, y: 0, r: 0, knifeX: 0.71, knifeY: 0.71, relief: 0 },
  /** WP5. */
  bench: { relief: 0, fan: 0, picked: -1, rotated: 0 },
  /** WP10. */
  ember: { on: 1 },
  /** WP2 (RayOverlay mirrors useApp.rayView). */
  rays: { on: 0 },

  // ── stage and scene ──
  /** WP1 (stage.ts): advance while not idle, freeze when idle; still mode fixes 0.7 s and 1. */
  time: 0,
  grainSeed: 0,
  /** WP4 (Scene): 0 when idle, under Still air or with no word in view. */
  shimmer: 1,
  /** WP4 (Stage), the canvas CSS size from R3F. */
  viewport: { w: 1, h: 1, dpr: 1 },
  /** WP4 (stage-api implementation), +1 per applied transport. */
  wordVersion: 0,
}

export type Light = typeof light
export type Visitor = typeof light.visitor
