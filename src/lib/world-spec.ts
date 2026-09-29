// World-spec: the room at every chapter's rest (brief 5.0 and the layout tables of
// section 5, per chapter, composition and motion mode), plus the light ramps of 3.1.1
// and 3.1.2. Pure and dependency-free (color.ts and math.ts only), so the conductor,
// WP4's stills and node tests can all evaluate it.
import type { ChapterId } from '@/content/chapters'
import type { light, ViewMode, WordId } from '@/lib/light-state'
import { linearToHex, mixLinear, srgbHexToLinear, type RGB } from '@/lib/color'

export type Composition = 'split' | 'stacked'
export type Motion = 'full' | 'reduced'
export type RestMode = 'rest' | 'sticky' | 'end' | 'live'

export interface ChapterState {
  mode: ViewMode
  hour: number
  restMode: RestMode
  /** Viewport fractions at rest (relative to the sticky frame for sticky chapters). */
  patch: { x: number; y: number; w: number; h: number; skew: number; split: number; transom: number; mullion: number; on: number }
  lower: { u0: number; v0: number; u1: number; v1: number }
  /** sunAt(hour), before the horizon factor. */
  sunHex: string
  e: number
  /** shadeAt(hour). */
  shadeHex: string
  word: { id: WordId | null; focus: number; wave: number; prism: number }
  /** Viewport fraction, -1 hidden. */
  skirtingY: number
  calUv: [number, number]
}

type VisitorInput = typeof light.visitor

// ── token hex twins (3.1, 3.1.3): every colour a shader reads has its twin here ──
export const HEX = {
  shade: '#3A4142',
  recess: '#30363A',
  line: '#5B6361',
  lime: '#ECE6D9',
  dust: '#BCC3BE',
  sun: '#FFE1A6',
  sunHi: '#FFE9BD',
  sunlit: '#E9DCBF',
  umber: '#1E2224',
  umberSoft: '#4E4A42',
  rust: '#8C3A14',
  rustLight: '#FFB08A',
  dusk: '#272C36',
  ember: '#FF9B54',
  predawn: '#2C3237',
  field: '#8C8C8C',
  fieldInk: '#16181A',
  /** Limewash albedo base (×0.62 in linear light, 2.3). */
  plaster: '#D6CEBE',
  /** The-bend haze base (3.1.1). */
  haze: '#2F3536',
  /** Clear-glass rim highlight and faint glass edge (5.2). */
  rim: '#FFE9C8',
  glassEdge: '#A8C4B4',
  /** Bench white rays (6.3). */
  benchRay: '#FFF5EA',
  /** Nav mark when the sun is off (4.5). */
  markOff: '#5B6361',
} as const

/** Limewash albedo scale (2.3): albedo = 0.62 × lin(#D6CEBE). */
export const ALBEDO_SCALE = 0.62

// ── 3.1.1 shade by hour (unlit wall targets) ──
const SHADE_TABLE: ReadonlyArray<readonly [number, string]> = [
  [6, '#343B42'],
  [8 + 10 / 60, '#3A4142'],
  [10.5, '#3B4242'],
  [12 + 50 / 60, '#3C4343'],
  [16 + 40 / 60, '#3D4241'],
  [17 + 20 / 60, '#3E423F'],
  [18 + 20 / 60, '#3F413C'],
  [19 + 10 / 60, '#3E3F3B'],
  [20 + 40 / 60, '#272C36'],
]

// ── 3.1.2 sunlight ramp ──
const SUN_TABLE: ReadonlyArray<readonly [number, string, number]> = [
  [6, '#FFD2A8', 0.7],
  [8 + 10 / 60, '#FFE3C4', 1.4],
  [10.5, '#FFF0DE', 2.5],
  [12 + 50 / 60, '#FFF5EA', 2.6],
  [16 + 40 / 60, '#FFE6BF', 2.4],
  [17 + 20 / 60, '#FFDFB2', 2.3],
  [18 + 20 / 60, '#FFD096', 2.2],
  [19 + 10 / 60, '#FFD9AD', 2.41],
  [20 + 40 / 60, '#FF9B54', 1.6],
]

const SHADE_LIN: ReadonlyArray<RGB> = SHADE_TABLE.map(([, hex]) => srgbHexToLinear(hex))
const SUN_LIN: ReadonlyArray<RGB> = SUN_TABLE.map(([, hex]) => srgbHexToLinear(hex))

const clamp = (v: number, lo = 0, hi = 1) => (v < lo ? lo : v > hi ? hi : v)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0))
  return t * t * (3 - 2 * t)
}

/** Index i and fraction t so that hour lies between table rows i and i + 1 (clamped). */
function locateHour(hours: ReadonlyArray<number>, hour: number): [number, number] {
  const n = hours.length
  if (!(hour > hours[0])) return [0, 0]
  if (hour >= hours[n - 1]) return [n - 2, 1]
  let i = 0
  while (i < n - 2 && hour >= hours[i + 1]) i++
  return [i, (hour - hours[i]) / (hours[i + 1] - hours[i])]
}

const SHADE_HOURS = SHADE_TABLE.map((r) => r[0])
const SUN_HOURS = SUN_TABLE.map((r) => r[0])

/** Unlit wall target at an hour, linear RGB (3.1.1, linear-light interpolation). */
export function shadeLinearAt(hour: number): RGB {
  const [i, t] = locateHour(SHADE_HOURS, hour)
  return mixLinear(SHADE_LIN[i], SHADE_LIN[i + 1], t)
}

/** Sun colour (linear RGB) and E_sun at an hour (3.1.2, clamped to 06:00 and 20:40). */
export function sunLinearAt(hour: number): { rgb: RGB; e: number } {
  const [i, t] = locateHour(SUN_HOURS, hour)
  return { rgb: mixLinear(SUN_LIN[i], SUN_LIN[i + 1], t), e: lerp(SUN_TABLE[i][2], SUN_TABLE[i + 1][2], t) }
}

/** 3.1.2: sun colour hex and E_sun, linear-light interpolation, clamped to 06:00 and 20:40. */
export function sunAt(hour: number): { hex: string; e: number } {
  const s = sunLinearAt(hour)
  return { hex: linearToHex(s.rgb), e: s.e }
}

/** 3.1.1: the unlit wall target hex, linear-light interpolation. */
export function shadeAt(hour: number): string {
  return linearToHex(shadeLinearAt(hour))
}

/** 5.5: clamp(0.10 + 0.45 · (1 - alt / 60), 0.10, 0.60). */
export function skewFromAltitude(altDeg: number): number {
  return clamp(0.1 + 0.45 * (1 - altDeg / 60), 0.1, 0.6)
}

/** Split when the viewport is at least 1024 px wide and w / h ≥ 0.9 (5.0). */
export function composition(w: number, h: number): Composition {
  return w >= 1024 && w / Math.max(1, h) >= 0.9 ? 'split' : 'stacked'
}

// ── rest modes (5.0 table: split / stacked / Still air) ──
const REST: Readonly<Record<ChapterId, readonly [RestMode, RestMode, RestMode, RestMode]>> = {
  //                 split     stacked   reduced+split reduced+stacked
  'first-light': ['rest', 'rest', 'rest', 'rest'],
  'clear-glass': ['rest', 'rest', 'rest', 'rest'],
  'the-bend': ['sticky', 'sticky', 'rest', 'rest'],
  appointment: ['sticky', 'sticky', 'live', 'live'],
  'write-yours': ['rest', 'live', 'rest', 'live'],
  ledger: ['end', 'live', 'end', 'live'],
  commission: ['live', 'live', 'live', 'live'],
  dusk: ['end', 'end', 'end', 'end'],
}

export function restModeOf(id: ChapterId, comp: Composition, motion: Motion): RestMode {
  const row = REST[id]
  return row[(motion === 'reduced' ? 2 : 0) + (comp === 'stacked' ? 1 : 0)]
}

// ── chapter hours (section 0) ──
export const HOURS = {
  'first-light': 8 + 10 / 60,
  'clear-glass': 10.5,
  'the-bend': 12 + 50 / 60,
  /** The appointment's clock runs from 16:12 to 17:08 (5.4). */
  appointmentStart: 16 + 12 / 60,
  appointment: 16 + 40 / 60,
  'write-yours': 17 + 20 / 60,
  ledger: 18 + 20 / 60,
  commission: 19 + 10 / 60,
  dusk: 20 + 40 / 60,
  /** Loader dawn (4.4). */
  dawn: 6,
} as const

/** Bullet time (5.4): (p, minutes after 16:12) = (0, 0), (0.30, 21), (0.70, 35), (1.00, 56). */
export function appointmentMinutes(p: number): number {
  const q = clamp(p)
  if (q <= 0.3) return (q / 0.3) * 21
  if (q <= 0.7) return 21 + ((q - 0.3) / 0.4) * 14
  return 35 + ((q - 0.7) / 0.3) * 21
}

/** Decimal hour at clock progress p (5.4). */
export function appointmentHour(p: number): number {
  return HOURS.appointmentStart + appointmentMinutes(p) / 60
}

/** Clock progress at which the appointment reads 16:40 (bullet time: 28 minutes). */
export const APPOINTMENT_P_AT_1640 = 0.5

/** Inverse of the bullet-time map: the clock progress at a decimal hour (clamped to 16:12 to 17:08). */
export function appointmentProgressAt(hour: number): number {
  const m = clamp((hour - HOURS.appointmentStart) * 60, 0, 56)
  if (m <= 21) return (m / 21) * 0.3
  if (m <= 35) return 0.3 + ((m - 21) / 14) * 0.4
  return 0.7 + ((m - 35) / 21) * 0.3
}

// ── geometry (percent of the viewport at rest, 5.0 and section 5) ──
interface Rect4 {
  x: number
  y: number
  w: number
  h: number
}
interface Window4 {
  skew: number
  split: number
  transom: number
  mullion: number
}

const R = (x: number, y: number, w: number, h: number): Rect4 => ({ x: x / 100, y: y / 100, w: w / 100, h: h / 100 })

/** Anchor rects at rest (split / stacked). Sections position their anchors to exactly these. */
export const ANCHOR_RECTS: Readonly<Record<ChapterId, { split: Rect4; stacked: Rect4 }>> = {
  'first-light': { split: R(45.5, 15.5, 53, 64.5), stacked: R(5, 9, 89, 39) },
  // clear-glass: the glass area inside the test frame (the wall patch equals first-light's)
  'clear-glass': { split: R(44, 9, 52, 83), stacked: R(5, 8, 90, 42) },
  // the-bend: the bench band (the wall patch is the off-view noon patch below)
  'the-bend': { split: R(0, 44, 100, 54), stacked: R(0, 6, 100, 54) },
  // stacked: WP8's flex box between the clock and the arc (fits one 390 x 844 screen)
  appointment: { split: R(10, 34, 42, 54), stacked: R(9.6, 15.8, 80.8, 18) },
  'write-yours': { split: R(4, 14, 50, 54), stacked: R(4, 30, 92, 21) },
  // ledger band: full-bleed (8vw wider than the viewport), 77 to 97 from the top at rest
  ledger: { split: R(-4, 77, 108, 20), stacked: R(-4, 78, 108, 18) },
  // commission: the panel in columns 1 to 7, vertically centred (live rect in practice)
  commission: { split: R(5.5, 12, 51, 76), stacked: R(4, 30, 92, 62) },
  // dusk: ember 100 × 24 px at 58 / 16 of a 70svh footer (live rect in practice)
  dusk: { split: R(58, 41.2, 6.94, 2.67), stacked: R(45.4, 38.7, 18.5, 2.13) },
}

/** The noon patch the light passes through while the bench is in view (5.0). */
const NOON_PATCH: { split: Rect4; stacked: Rect4 } = { split: R(38, 8, 26, 30), stacked: R(30, 5, 40, 14) }

const HERO_WINDOW: { split: Window4; stacked: Window4 } = {
  split: { skew: 0.2, split: 0.22, transom: 0.035, mullion: 0.022 },
  stacked: { skew: 0.07, split: 0.16, transom: 0.03, mullion: 0 },
}
const NOON_WINDOW: { split: Window4; stacked: Window4 } = {
  split: { skew: 0.06, split: 0.22, transom: 0.035, mullion: 0.022 },
  stacked: { skew: 0.03, split: 0.16, transom: 0.03, mullion: 0 },
}
const single = (skew: number): Window4 => ({ skew, split: 0, transom: 0, mullion: 0 })

/** tan 8° and tan 3°: the commission panel's slant (5.7). */
export const COMMISSION_SKEW = { split: Math.tan((8 * Math.PI) / 180), stacked: Math.tan((3 * Math.PI) / 180) }
/** The appointment drift across the clock progress, viewport-width fraction (5.4). */
export const APPOINTMENT_DRIFT = { split: 0.06, stacked: 0.03 }
/** The ember's slant (5.0). */
export const EMBER_SKEW = 0.14

/** Calibration points (split / stacked, 5.0). */
export const CAL_UV: Readonly<Record<ChapterId, { split: [number, number]; stacked: [number, number] }>> = {
  'first-light': { split: [0.25, 0.62], stacked: [0.5, 0.72] },
  'clear-glass': { split: [0.2, 0.5], stacked: [0.5, 0.74] },
  'the-bend': { split: [0.31, 0.24], stacked: [0.5, 0.78] },
  appointment: { split: [0.77, 0.58], stacked: [0.5, 0.64] },
  'write-yours': { split: [0.77, 0.5], stacked: [0.5, 0.2] },
  ledger: { split: [0.35, 0.4], stacked: [0.5, 0.4] },
  commission: { split: [0.8, 0.27], stacked: [0.5, 0.2] },
  dusk: { split: [0.31, 0.8], stacked: [0.5, 0.75] },
}

/** Skirting (5.0): first-light 0.965 split, 0.975 stacked; dusk at 94% of the footer's visible area. */
export const SKIRTING = { heroSplit: 0.965, heroStacked: 0.975, duskOfFooter: 0.94 }
/** Dusk fallback when the footer has not been measured: a 70svh footer at rest. */
const DUSK_SKIRTING_FALLBACK = 0.3 + 0.94 * 0.7

/** Word rect rule (6.1.2): the maximum raster width in lower-light space. */
export const WORD_RECT_MAX_W = { split: 0.86, stacked: 0.94 }

const LOWER_SINGLE = { u0: 0, v0: 0, u1: 1, v1: 1 }
const lowerOf = (win: Window4) => (win.split > 0 ? { u0: 0, v0: win.split + win.transom, u1: 1, v1: 1 } : { ...LOWER_SINGLE })

function patchOf(r: Rect4, win: Window4, on = 1): ChapterState['patch'] {
  return { x: r.x, y: r.y, w: r.w, h: r.h, skew: win.skew, split: win.split, transom: win.transom, mullion: win.mullion, on }
}

function base(id: ChapterId, hour: number, comp: Composition, motion: Motion): Omit<ChapterState, 'patch' | 'lower' | 'word' | 'mode' | 'skirtingY'> {
  const s = sunAt(hour)
  return { hour, restMode: restModeOf(id, comp, motion), sunHex: s.hex, e: s.e, shadeHex: shadeAt(hour), calUv: [...CAL_UV[id][comp]] as [number, number] }
}

/**
 * The state of one chapter at `local` (0 to 1 across its rest interval).
 * For the appointment, `local` is the clock progress p of 5.4 (the conductor passes it),
 * so the patch, its skew and the sun follow the scrubbed minute.
 */
export function worldSpec(id: ChapterId, local: number, comp: Composition, motion: Motion, visitor: VisitorInput): ChapterState {
  const reduced = motion === 'reduced'
  switch (id) {
    case 'first-light': {
      const win = HERO_WINDOW[comp]
      return {
        ...base(id, HOURS['first-light'], comp, motion),
        mode: 'wall',
        patch: patchOf(ANCHOR_RECTS['first-light'][comp], win),
        lower: lowerOf(win),
        word: { id: 'aslant', focus: 1, wave: 0.04, prism: 0 },
        skirtingY: comp === 'split' ? SKIRTING.heroSplit : SKIRTING.heroStacked,
      }
    }
    case 'clear-glass': {
      // The wall patch is off-view and equals first-light's. Still air shows the relief
      // poster over a plain wall: no pane mode and no patch.
      const win = HERO_WINDOW[comp]
      return {
        ...base(id, HOURS['clear-glass'], comp, motion),
        mode: reduced ? 'wall' : 'pane',
        patch: patchOf(ANCHOR_RECTS['first-light'][comp], win, reduced ? 0 : 1),
        lower: lowerOf(win),
        word: { id: null, focus: 1, wave: 0.04, prism: 0 },
        skirtingY: -1,
      }
    }
    case 'the-bend': {
      const win = NOON_WINDOW[comp]
      return {
        ...base(id, HOURS['the-bend'], comp, motion),
        mode: reduced ? 'wall' : 'bench',
        patch: patchOf(NOON_PATCH[comp], win, reduced ? 0 : 1),
        lower: lowerOf(win),
        word: { id: null, focus: 1, wave: 0.04, prism: 0 },
        skirtingY: -1,
      }
    }
    case 'appointment': {
      const p = reduced ? APPOINTMENT_P_AT_1640 : clamp(local)
      const hour = appointmentHour(p)
      const r = ANCHOR_RECTS.appointment[comp]
      const skew = comp === 'split' ? lerp(0.3, 0.4, p) : lerp(0.08, 0.14, p)
      const drift = reduced ? 0 : APPOINTMENT_DRIFT[comp] * p
      const sun = mixLinear(srgbHexToLinear('#FFE6BF'), srgbHexToLinear('#FFDFB2'), p)
      return {
        hour,
        restMode: restModeOf(id, comp, motion),
        sunHex: linearToHex(sun),
        e: lerp(2.4, 2.3, p),
        shadeHex: shadeAt(hour),
        calUv: [...CAL_UV.appointment[comp]] as [number, number],
        mode: 'wall',
        patch: patchOf({ x: r.x - drift, y: r.y, w: r.w, h: r.h }, single(skew)),
        lower: { ...LOWER_SINGLE },
        word: { id: 'ingrid', focus: 1, wave: 0.04, prism: 0 },
        skirtingY: -1,
      }
    }
    case 'write-yours': {
      const hour = Number.isFinite(visitor.hour) ? visitor.hour : HOURS['write-yours']
      return {
        ...base(id, hour, comp, motion),
        mode: 'wall',
        patch: patchOf(ANCHOR_RECTS['write-yours'][comp], single(skewFromAltitude(visitor.alt))),
        lower: { ...LOWER_SINGLE },
        word: { id: 'visitor', focus: 1, wave: 0.04, prism: clamp(visitor.prism) },
        skirtingY: -1,
      }
    }
    case 'ledger':
      return {
        ...base(id, HOURS.ledger, comp, motion),
        mode: 'wall',
        patch: patchOf(ANCHOR_RECTS.ledger[comp], single(0.9)),
        lower: { ...LOWER_SINGLE },
        word: { id: 'visitor', focus: 0.15, wave: 0.8, prism: clamp(visitor.prism) },
        skirtingY: -1,
      }
    case 'commission':
      return {
        ...base(id, HOURS.commission, comp, motion),
        mode: 'wall',
        patch: patchOf(ANCHOR_RECTS.commission[comp], single(COMMISSION_SKEW[comp])),
        lower: { ...LOWER_SINGLE },
        // Plain last sun on the panel (focus 0, wave 0: every ray lands at its origin);
        // WP9 raises the focus input to 1 on success and the word condenses out of it.
        word: { id: 'commission', focus: 0, wave: 0, prism: clamp(visitor.prism) },
        skirtingY: -1,
      }
    case 'dusk':
    default:
      return {
        ...base('dusk', HOURS.dusk, comp, motion),
        mode: 'wall',
        patch: patchOf(ANCHOR_RECTS.dusk[comp], single(EMBER_SKEW)),
        lower: { ...LOWER_SINGLE },
        // no word (uFill 1); focus and wave 0 so the commission's plain light stays plain
        word: { id: null, focus: 0, wave: 0, prism: clamp(visitor.prism) },
        skirtingY: DUSK_SKIRTING_FALLBACK,
      }
  }
}

/** The horizon factor for the visitor's hour (5.5): E_sun × smoothstep(0°, 6°, alt). */
export function horizonFactor(altDeg: number): number {
  return smoothstep(0, 6, altDeg)
}

/** The page hour's mark length (4.5): 0.55 at noon to 1.0 at dusk (and long in the morning). */
export function markLength(hour: number): number {
  const noon = HOURS['the-bend']
  const span = HOURS.dusk - noon
  return clamp(0.55 + 0.45 * (Math.abs(hour - noon) / span), 0.55, 1)
}
