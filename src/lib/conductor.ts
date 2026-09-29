// Conductor: scroll is the day (brief 4.3, 7.3, 7.4).
// Turns native scroll into chapter state. It never integrates wheel deltas: the same
// scroll position always yields the same state, forward, backward, after a jump and
// after reload. update(dt) runs once per tick from the One Clock (SmoothScroll), after
// readScroll and before the afterScroll listeners, and is the page's only DOM read
// phase: every rect it needs is read in one batch before anything writes.
import { CHAPTERS, type ChapterId } from '@/content/chapters'
import { frame, onAfterScroll } from '@/lib/frame'
import { light, type ViewMode, type WordId } from '@/lib/light-state'
import { stage } from '@/lib/stage'
import { flags, motion as motionOf } from '@/lib/qa-flags'
import { useApp } from '@/lib/store'
import { srgbHexToLinear, linearToHex, type RGB } from '@/lib/color'
import { ScrollTrigger } from '@/lib/gsap'
import { allAnchors, anchorOf, setAnchorListener, syncAnchorsFromDom, type AnchorEntry } from '@/lib/anchors'
import {
  ANCHOR_RECTS,
  APPOINTMENT_P_AT_1640,
  HOURS,
  appointmentHour,
  appointmentProgressAt,
  COMMISSION_SKEW,
  SKIRTING,
  composition,
  horizonFactor,
  restModeOf,
  shadeLinearAt,
  sunLinearAt,
  worldSpec,
  type ChapterState,
  type Composition,
  type Motion,
  type RestMode,
} from '@/lib/world-spec'
import { installLiveMark } from '@/components/NavMark/live'
import { beamHexagon, lowerSizePx, wordRectFor, type WordRect } from '@/webgl/patch-math'

// ── constants ──
const IDS: ReadonlyArray<ChapterId> = CHAPTERS.map((c) => c.id)
const COUNT = IDS.length
const IDX: Record<ChapterId, number> = Object.fromEntries(IDS.map((id, i) => [id, i])) as Record<ChapterId, number>
/** ySmooth = damp(ySmooth, y, 5.2, dt) (4.3). */
const SMOOTH_LAMBDA = 5.2
/** The visitor's hour and altitude settle over about 400 ms (5.5). */
const VISITOR_LAMBDA = 7.5
const MAX_SCRIMS = 8
/** Widest scrim feather (the compositor's 32 px at rest, 72 px mid-blend, 96 px while text crosses a
 *  holding light): culling and ranking margin. */
const SCRIM_FEATHER = 96
/** Text boxes closer than this merge into one rect, and a box this close to the viewport's side
 *  reaches it: a strip of full sun between two columns or in the margin reads as a stray sliver. */
const SCRIM_JOIN = 64
const SCRIM_EDGE = 96
/** The beam: the patch polygon swept 1.4 viewport heights toward the window (6.1.6). */
const BEAM_LENGTH_VH = 1.4
/** Commission lock (5.7): expanded by 10 px on a fine pointer with Lenis, inset by 12 px on native scroll. */
const PANEL_EXPAND = 10
const PANEL_INSET = 12

const clamp = (v: number, lo = 0, hi = 1) => (v < lo ? lo : v > hi ? hi : v)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0))
  return t * t * (3 - 2 * t)
}
const damp = (cur: number, target: number, lambda: number, dt: number) => lerp(cur, target, 1 - Math.exp(-lambda * Math.min(dt, 1 / 30)))

// ── public state ──
export interface ChapterPos {
  /** Chapter i: the one whose rest interval holds y, or the earlier chapter of the blend pair. */
  index: number
  id: ChapterId
  /** 0 to 1 across the rest interval (1 while blending out). */
  local: number
  /** 0 at rest; smoothstep(0.2, 0.8, raw) between b_i and a_{i+1}. */
  blend: number
}

const exact: ChapterPos = { index: 0, id: IDS[0], local: 0, blend: 0 }
const smooth: ChapterPos = { index: 0, id: IDS[0], local: 0, blend: 0 }
const weights = Object.fromEntries(IDS.map((id, i) => [id, i === 0 ? 1 : 0])) as Record<ChapterId, number>
const exactWeights = Object.fromEntries(IDS.map((id, i) => [id, i === 0 ? 1 : 0])) as Record<ChapterId, number>
const subscribers = new Set<(id: ChapterId) => void>()

// ── measurement ──
interface Geo {
  id: ChapterId
  index: number
  el: HTMLElement | null
  /** Document px. */
  top: number
  height: number
  frameEl: HTMLElement | null
  frameH: number
  mode: RestMode
  a: number
  b: number
  /** Live viewport rect of the sticky frame this frame (valid when frameOk). */
  fr: { x: number; y: number; w: number; h: number }
  frameOk: boolean
}

const geo: Geo[] = IDS.map((id, index) => ({
  id,
  index,
  el: null,
  top: 0,
  height: 0,
  frameEl: null,
  frameH: 0,
  mode: 'rest',
  a: 0,
  b: 0,
  fr: { x: 0, y: 0, w: 0, h: 0 },
  frameOk: false,
}))

interface Scrim {
  el: HTMLElement
  /** doc: document rect minus scroll; fixed: viewport rect; frame: offset inside a sticky frame; live: read every frame. */
  kind: 'doc' | 'fixed' | 'frame' | 'live'
  nav: boolean
  x: number
  y: number
  w: number
  h: number
  g: Geo | null
  /** Index of the chapter (section) holding the text box, -1 for the nav and anything outside. */
  ch: number
  /** Viewport rect this frame. */
  vx: number
  vy: number
  vw: number
  vh: number
}

let scrims: Scrim[] = []
let probe: HTMLDivElement | null = null
let vh = 800 // measured 100svh
let comp: Composition = 'split'
let motion: Motion = 'full'
let measured = false
let invalid = true
let lastMeasureW = 0
let lastMeasureH = 0

// ── per-frame state ──
let ySmooth = 0
let yPrev = Number.NaN
let lastReadY = Number.NaN
let exactChapter: ChapterId = IDS[0]
const visitorSm = { hour: light.visitor.hour, alt: light.visitor.alt, prism: light.visitor.prism, init: false }
let initialised = 0
let teardown: (() => void) | null = null

// ── helpers ──
const fin = (x: number, fallback = 0) => (Number.isFinite(x) ? x : fallback)

type Input = (typeof light.input)[ChapterId]
const inScratch: [Input, Input] = [
  { focus: 0, wave: 0, sunX: 0, sunY: 0, aberr: 0, pointScale: 0, driftX: 0 },
  { focus: 0, wave: 0, sunX: 0, sunY: 0, aberr: 0, pointScale: 0, driftX: 0 },
]

function sanitize(src: Input | undefined, out: Input): Input {
  out.focus = fin(src?.focus ?? 0)
  out.wave = fin(src?.wave ?? 0)
  out.sunX = fin(src?.sunX ?? 0)
  out.sunY = fin(src?.sunY ?? 0)
  out.aberr = fin(src?.aberr ?? 0)
  out.pointScale = fin(src?.pointScale ?? 0)
  out.driftX = fin(src?.driftX ?? 0)
  return out
}

function settle(cur: number, target: number, dt: number, eps: number): number {
  if (!Number.isFinite(target)) return cur
  const v = damp(cur, target, VISITOR_LAMBDA, dt)
  return Math.abs(v - target) < eps ? target : v
}

function docRect(el: Element, scrollY: number, scrollX: number) {
  const r = el.getBoundingClientRect()
  return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height }
}

function isFixed(el: HTMLElement): boolean {
  let n: HTMLElement | null = el
  while (n && n !== document.body) {
    if (getComputedStyle(n).position === 'fixed') return true
    n = n.parentElement
  }
  return false
}

function findStickyFrame(section: HTMLElement): HTMLElement | null {
  const marked = section.querySelector<HTMLElement>('[data-sticky-frame]')
  if (marked) return getComputedStyle(marked).position === 'sticky' ? marked : null
  // Scan the first three levels for position: sticky (Still air sets them static).
  const queue: Array<[HTMLElement, number]> = [[section, 0]]
  let scanned = 0
  while (queue.length && scanned < 60) {
    const [n, d] = queue.shift() as [HTMLElement, number]
    for (const child of Array.from(n.children) as HTMLElement[]) {
      scanned++
      if (getComputedStyle(child).position === 'sticky') return child
      if (d < 2) queue.push([child, d + 1])
    }
  }
  return null
}

function maxScroll(): number {
  const m = frame.scroll.max
  if (m > 1) return m
  if (typeof document === 'undefined') return 1
  return Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
}

// ── measure (4.3) ──
function measure(): void {
  if (typeof document === 'undefined') return
  invalid = false
  const sx = window.scrollX
  const sy = window.scrollY
  if (!probe || !probe.isConnected) {
    probe = document.createElement('div')
    probe.setAttribute('aria-hidden', 'true')
    probe.dataset.svhProbe = ''
    probe.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:100svh;visibility:hidden;pointer-events:none;contain:strict;'
    document.body.appendChild(probe)
  }
  vh = probe.offsetHeight || window.innerHeight || 800
  lastMeasureW = window.innerWidth
  lastMeasureH = window.innerHeight
  comp = composition(window.innerWidth, window.innerHeight)
  motion = motionOf()
  const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)

  // sections and sticky frames
  let prevB = 0
  for (const g of geo) {
    const el = document.querySelector<HTMLElement>(`[data-chapter="${g.id}"]`)
    g.el = el
    g.frameEl = null
    g.frameH = 0
    if (el) {
      const r = docRect(el, sy, sx)
      g.top = r.y
      g.height = r.h
    } else {
      g.top = prevB
      g.height = vh
    }
    let mode = restModeOf(g.id, comp, motion)
    if (mode === 'sticky') {
      g.frameEl = el ? findStickyFrame(el) : null
      // A frame that is not sticky (Still air, or data-overflow at 200% zoom and on short
      // screens, 4.12) leaves the content in flow: the patch is DOM-locked to its anchor.
      if (g.frameEl) g.frameH = g.frameEl.offsetHeight
      else mode = 'live'
    }
    g.mode = mode
    let a: number
    let b: number
    switch (mode) {
      case 'sticky':
        a = g.top
        b = g.top + g.height - g.frameH
        break
      case 'end':
        a = b = g.top + g.height - vh
        break
      case 'live':
        a = g.top
        b = g.top + Math.max(0, g.height - vh)
        break
      case 'rest':
      default:
        a = b = g.top
    }
    if (g.index === COUNT - 1) a = b = max
    a = clamp(a, 0, max)
    b = clamp(b, 0, max)
    a = Math.max(a, prevB)
    b = Math.max(a, b)
    g.a = a
    g.b = b
    prevB = b
  }

  // anchors: document rect, sticky frame offset, rest rect
  syncAnchorsFromDom()
  for (const e of allAnchors()) measureAnchor(e, sx, sy)

  // scrims
  const found = Array.from(document.querySelectorAll<HTMLElement>('[data-scrim]'))
  const next: Scrim[] = []
  for (const el of found) {
    const r = el.getBoundingClientRect()
    if (r.width <= 0 || r.height <= 0) continue
    let nav = false
    let kind: Scrim['kind'] = 'doc'
    let g: Geo | null = null
    let x = r.left + sx
    let y = r.top + sy
    if (isFixed(el)) {
      kind = 'fixed'
      nav = true
      x = r.left
      y = r.top
    } else {
      g = geo.find((c) => c.frameEl && c.frameEl.contains(el)) ?? null
      if (g && g.frameEl) {
        const fr = g.frameEl.getBoundingClientRect()
        kind = 'frame'
        x = r.left - fr.left
        y = r.top - fr.top
      } else if (el.dataset.scrim === 'live') {
        kind = 'live'
      }
    }
    const owner = nav ? -1 : geo.findIndex((c) => !!c.el && c.el.contains(el))
    next.push({ el, kind, nav, x, y, w: r.width, h: r.height, g, ch: owner, vx: 0, vy: 0, vw: 0, vh: 0 })
  }
  scrims = next
  measured = true
  lastReadY = Number.NaN
  stage.requestRender(2)
}

function measureAnchor(e: AnchorEntry, sx: number, sy: number) {
  if (!e.el.isConnected) return
  const r = e.el.getBoundingClientRect()
  e.doc.x = r.left + sx
  e.doc.y = r.top + sy
  e.doc.w = r.width
  e.doc.h = r.height
  const g = geo[IDX[e.spec.chapter]]
  e.frameEl = null
  e.fixed = false
  if (g && g.frameEl && g.frameEl.contains(e.el)) {
    const fr = g.frameEl.getBoundingClientRect()
    e.frameEl = g.frameEl
    e.off.x = r.left - fr.left
    e.off.y = r.top - fr.top
    e.rest = new DOMRectReadOnly(e.off.x, e.off.y, r.width, r.height)
  } else if (g) {
    e.rest = new DOMRectReadOnly(e.doc.x - sx, e.doc.y - g.a, r.width, r.height)
  }
  e.live = new DOMRectReadOnly(r.left, r.top, r.width, r.height)
}

function invalidate() {
  invalid = true
}

// ── locate: chapter, local and blend at a scroll y (4.3) ──
interface Loc {
  index: number
  local: number
  blend: number
}
const locE: Loc = { index: 0, local: 0, blend: 0 }
const locS: Loc = { index: 0, local: 0, blend: 0 }

function locate(y: number, out: Loc): void {
  const max = maxScroll()
  for (let i = 0; i < COUNT; i++) {
    const g = geo[i]
    const a = i === COUNT - 1 ? Math.min(g.a, max) : g.a
    const b = i === COUNT - 1 ? Math.min(g.b, max) : g.b
    if (y <= b || i === COUNT - 1) {
      out.index = i
      out.local = y <= a ? 0 : clamp((y - a) / Math.max(1, b - a))
      out.blend = 0
      return
    }
    const n = geo[i + 1]
    const na = i + 1 === COUNT - 1 ? Math.min(n.a, max) : n.a
    if (y < na) {
      const raw = (y - b) / Math.max(1, na - b)
      const blend = smoothstep(0.2, 0.8, raw)
      if (blend >= 1) {
        // the arrival plateau: the next chapter's light, at rest (one state, one spelling)
        out.index = i + 1
        out.local = 0
        out.blend = 0
        return
      }
      out.index = i
      out.local = 1
      out.blend = blend
      return
    }
  }
}

function writePos(dst: ChapterPos, l: Loc) {
  dst.index = l.index
  dst.id = IDS[l.index]
  dst.local = l.local
  dst.blend = l.blend
}

// ── sectionProgress (7.3): (y - top + lead·vh) / (height - (lead + trail)·vh), clamped ──
function progressAt(id: ChapterId, y: number, lead = 0.25, trail = lead): number {
  const g = geo[IDX[id]]
  if (!g) return 0
  const span = g.height - (lead + trail) * vh
  if (span <= 1) return y >= g.top ? 1 : 0
  return clamp((y - g.top + lead * vh) / span)
}

/** The appointment's clock progress at y; ?still=appointment holds 16:40 (or ?hour). */
function appointmentP(y: number): number {
  if (flags.still === 'appointment') return flags.hour != null ? appointmentProgressAt(flags.hour) : APPOINTMENT_P_AT_1640
  return progressAt('appointment', y)
}

// ── the fold ──
interface PatchPx {
  x: number
  y: number
  w: number
  h: number
  skew: number
}
const px: [PatchPx, PatchPx] = [
  { x: 0, y: 0, w: 0, h: 0, skew: 0 },
  { x: 0, y: 0, w: 0, h: 0, skew: 0 },
]
const calUv: [[number, number], [number, number]] = [
  [0, 0],
  [0, 0],
]
const sunLin: [RGB, RGB] = [
  [1, 1, 1],
  [1, 1, 1],
]
const shadeLin: [RGB, RGB] = [
  [0, 0, 0],
  [0, 0, 0],
]
const eSun: [number, number] = [1, 1]
const hourOf: [number, number] = [0, 0]
const states: [ChapterState | null, ChapterState | null] = [null, null]

function frameRectOf(g: Geo) {
  if (g.frameOk) return g.fr
  // Not read this frame: derive from the document position.
  const y = frame.scroll.y
  const natural = g.top - y
  const bottom = g.top + g.height - y
  g.fr.x = 0
  g.fr.w = frame.viewport.w
  g.fr.h = g.frameH || vh
  g.fr.y = Math.min(Math.max(natural, 0), bottom - g.fr.h)
  return g.fr
}

/** Resolves chapter j's patch in viewport CSS px for this frame. */
function resolvePatch(slot: 0 | 1, j: number, st: ChapterState): void {
  const g = geo[j]
  const id = g.id
  const out = px[slot]
  const vw = frame.viewport.w
  const vhv = vh
  const base = ANCHOR_RECTS[id][comp]
  // offset of the state's rect from the anchor rect (appointment drift), in viewport fractions
  const dx = (st.patch.x - base.x) * vw
  out.skew = st.patch.skew
  const cal = calUv[slot]
  cal[0] = st.calUv[0]
  cal[1] = st.calUv[1]

  if (id === 'clear-glass') {
    // the off-view wall patch equals first-light's rest patch
    const hero = anchorOf('first-light')
    const r = hero?.rest
    if (r) {
      out.x = r.x
      out.y = r.y
      out.w = r.width
      out.h = r.height
    } else {
      out.x = st.patch.x * vw
      out.y = st.patch.y * vhv
      out.w = st.patch.w * vw
      out.h = st.patch.h * vhv
    }
    return
  }

  if (g.mode === 'sticky' && g.frameEl) {
    const fr = frameRectOf(g)
    const a = id === 'the-bend' ? null : anchorOf(id)
    if (a && a.frameEl === g.frameEl && a.rest) {
      out.x = fr.x + a.rest.x + dx
      out.y = fr.y + a.rest.y
      out.w = a.rest.width
      out.h = a.rest.height
    } else {
      out.x = fr.x + st.patch.x * fr.w
      out.y = fr.y + st.patch.y * fr.h
      out.w = st.patch.w * fr.w
      out.h = st.patch.h * fr.h
    }
    cal[0] = (fr.x + st.calUv[0] * fr.w) / Math.max(1, vw)
    cal[1] = (fr.y + st.calUv[1] * fr.h) / Math.max(1, vhv)
    return
  }

  const a = id === 'the-bend' ? null : anchorOf(id)
  const live = g.mode === 'live' || id === 'dusk'
  if (a && live && a.live) {
    out.x = a.live.x + dx
    out.y = a.live.y
    out.w = a.live.width
    out.h = a.live.height
  } else if (a && !live && a.rest) {
    out.x = a.rest.x + dx
    out.y = a.rest.y
    out.w = a.rest.width
    out.h = a.rest.height
  } else {
    out.x = st.patch.x * vw
    out.y = st.patch.y * vhv
    out.w = st.patch.w * vw
    out.h = st.patch.h * vhv
    if (live && g.el) {
      // fall back to the section's live position
      const top = g.top - frame.scroll.y
      out.y = top + st.patch.y * vhv
    }
  }

  if (id === 'commission') {
    const nativeScroll = motion === 'reduced' || frame.pointer.coarse
    const d = nativeScroll ? -PANEL_INSET : PANEL_EXPAND
    const t = COMMISSION_SKEW[comp]
    const ph = out.h + 2 * d
    out.x = out.x - d - (t * ph) / 2
    out.y = out.y - d
    out.w = out.w + 2 * d + t * ph
    out.h = ph
    out.skew = t
  }
}

// ── scrims per frame ──
const scrimOrder: Scrim[] = []
/** Viewport rects (x0, y0, x1, y1, strength) of scrimOrder after joining; reused every frame. */
const joinRects: number[][] = []

/**
 * Per-rect scrim strength (0 to 1, parallel to light.scrims) and the text-over-light motion (0 at a
 * chapter's rest, 1 once the text has scrolled 160 px off it), read by the Scene each frame.
 * Strength fades a text box's shade with its own chapter's weight, but only for the chapter that is
 * leaving the blend pair: once its weight is below 0.25 its light has gone and the incoming light is
 * laid out around the incoming text, so the outgoing box stops cutting a notch into it. At 25%, 50%
 * and 75% of every blend both chapters hold at least 0.25, so the 0.015 floor is unchanged there.
 */
export const scrimShade = { strength: new Float32Array(MAX_SCRIMS), motion: 0 }

function scrimStrengthOf(s: Scrim): number {
  if (s.ch < 0 || locS.blend <= 0) return 1
  const i0 = locS.index
  const i1 = Math.min(COUNT - 1, i0 + 1)
  if (s.ch !== i0 && s.ch !== i1) return 1
  const id = IDS[s.ch]
  const w = Math.max(weights[id], exactWeights[id])
  return smoothstep(0, 0.25, w)
}

let scrimSum = 0

function placeScrims(yExact: number) {
  const vw = frame.viewport.w
  const vhv = frame.viewport.h
  scrimOrder.length = 0
  // "Leave the room" (L): the text is gone, so nothing may cast a text-shaped shadow (4.13)
  if (useApp.getState().roomLeft) {
    light.scrims.fill(0)
    light.scrimCount = 0
    scrimShade.strength.fill(0)
    if (scrimSum !== 0) {
      scrimSum = 0
      delta += 1
    }
    return
  }
  let navScrim: Scrim | null = null
  for (const s of scrims) {
    switch (s.kind) {
      case 'fixed':
        s.vx = s.x
        s.vy = s.y
        break
      case 'frame': {
        const g = s.g
        if (g) {
          const fr = frameRectOf(g)
          s.vx = fr.x + s.x
          s.vy = fr.y + s.y
        }
        break
      }
      case 'live':
        break // read in the read phase
      case 'doc':
      default:
        s.vx = s.x - window.scrollX
        s.vy = s.y - yExact
    }
    s.vw = s.w
    s.vh = s.h
    if (s.nav && !navScrim) {
      navScrim = s
      continue
    }
    // keep those intersecting the viewport (feather included)
    if (s.vy + s.vh < -SCRIM_FEATHER || s.vy > vhv + SCRIM_FEATHER || s.vx + s.vw < -SCRIM_FEATHER || s.vx > vw + SCRIM_FEATHER) continue
    scrimOrder.push(s)
  }
  // Nearest first, but text the light can actually reach comes before text it cannot:
  // boxes meeting the patch (with its penumbra, halation and the feather) lead.
  const P = light.patch
  const m = SCRIM_FEATHER + 48
  const px0 = P.x - m
  const px1 = P.x + P.w + m
  const py0 = P.y - m
  const py1 = P.y + P.h + m
  const cy = vhv / 2
  const rank = (s: Scrim) => {
    const hit = P.on > 0.001 && s.vx < px1 && s.vx + s.vw > px0 && s.vy < py1 && s.vy + s.vh > py0
    return (hit ? 0 : 1e6) + Math.abs(s.vy + s.vh / 2 - cy)
  }
  scrimOrder.sort((p, q) => rank(p) - rank(q))
  // Join neighbours and reach the sides (AD-02), but never so that a joined rect newly covers the
  // patch: a union may shade the light only where one of its parts already did.
  const on = P.on > 0.001
  const hitsPatch = (x: number, y: number, w: number, h: number) => on && x < P.x + P.w && x + w > P.x && y < P.y + P.h && y + h > P.y
  let m2 = 0
  for (const s of scrimOrder) {
    const st = scrimStrengthOf(s)
    if (st <= 0.001) continue // the leaving chapter's text: its light has gone (see scrimShade)
    const r = joinRects[m2] ?? (joinRects[m2] = [0, 0, 0, 0, 1])
    r[0] = s.vx
    r[1] = s.vy
    r[2] = s.vx + s.vw
    r[3] = s.vy + s.vh
    r[4] = st
    m2++
  }
  for (let changed = true; changed; ) {
    changed = false
    for (let i = 0; i < m2 && !changed; i++) {
      for (let j = i + 1; j < m2; j++) {
        const a = joinRects[i]
        const b = joinRects[j]
        const gx = Math.max(a[0], b[0]) - Math.min(a[2], b[2])
        const gy = Math.max(a[1], b[1]) - Math.min(a[3], b[3])
        if (gx >= SCRIM_JOIN || gy >= SCRIM_JOIN) continue
        const x0 = Math.min(a[0], b[0])
        const y0 = Math.min(a[1], b[1])
        const x1 = Math.max(a[2], b[2])
        const y1 = Math.max(a[3], b[3])
        // A union may never shade light that neither part covers: the empty corner beside a short
        // box (a figure caption beside a wide readout) would cut a hard rectangle through a word
        // that passes under it. Boxes over the patch stay separate; so do boxes of unequal strength.
        if (hitsPatch(x0, y0, x1 - x0, y1 - y0)) continue
        if (Math.abs(a[4] - b[4]) > 0.02) continue
        a[0] = x0
        a[1] = y0
        a[2] = x1
        a[3] = y1
        a[4] = Math.max(a[4], b[4])
        // keep the order (the lower index ranks first): drop j
        const t = joinRects[j]
        for (let k = j; k < m2 - 1; k++) joinRects[k] = joinRects[k + 1]
        joinRects[m2 - 1] = t
        m2--
        changed = true
        break
      }
    }
  }
  for (let i = 0; i < m2; i++) {
    const r = joinRects[i]
    const h = r[3] - r[1]
    if (r[0] > 0 && r[0] < SCRIM_EDGE && !hitsPatch(0, r[1], r[0], h)) r[0] = -SCRIM_FEATHER
    if (r[2] < vw && r[2] > vw - SCRIM_EDGE && !hitsPatch(r[2], r[1], vw - r[2], h)) r[2] = vw + SCRIM_FEATHER
  }
  let n = 0
  const arr = light.scrims
  const str = scrimShade.strength
  const put = (x: number, y: number, w: number, h: number, st: number) => {
    arr[n * 4] = x
    arr[n * 4 + 1] = y
    arr[n * 4 + 2] = w
    arr[n * 4 + 3] = h
    str[n] = st
    n++
  }
  if (navScrim) put(navScrim.vx, navScrim.vy, navScrim.vw, navScrim.vh, 1)
  for (let i = 0; i < m2; i++) {
    if (n >= MAX_SCRIMS) break
    const r = joinRects[i]
    put(r[0], r[1], r[2] - r[0], r[3] - r[1], r[4])
  }
  for (let k = n * 4; k < arr.length; k++) arr[k] = 0
  for (let k = n; k < str.length; k++) str[k] = 0
  light.scrimCount = n
  let sum = n
  for (let k = 0; k < n * 4; k++) sum += arr[k] * ((k % 4) + 1)
  for (let k = 0; k < n; k++) sum += str[k] * 7.0
  if (Math.abs(sum - scrimSum) > 0.01) {
    scrimSum = sum
    delta += 1
  }
}

// ── the beam hexagon (6.1.6): WP4's shared helper, so the Scene and the conductor agree ──
const beamGeom = { x: 0, y: 0, w: 0, h: 0, skew: 0 }

function writeBeam() {
  const p = light.patch
  beamGeom.x = p.x
  beamGeom.y = p.y
  beamGeom.w = p.w
  beamGeom.h = p.h
  beamGeom.skew = p.skew
  beamHexagon(beamGeom, vh, light.beam, BEAM_LENGTH_VH * vh)
}

// ── change tracking: requestRender only when an output moved ──
let delta = 0
function set<T extends object, K extends keyof T>(obj: T, key: K, v: number) {
  const old = obj[key] as unknown as number
  if (old !== v) {
    delta += Math.abs(old - v)
    ;(obj as Record<K, number>)[key] = v
  }
}

const wordRectTmp: WordRect = { x: 0, y: 0, w: 0, h: 0 }
const DAWN = { hour: 6, sun: sunLinearAt(6), shade: shadeLinearAt(6) }

// ── update: once per tick (4.1 step 3) ──
function update(dt: number): void {
  if (typeof window === 'undefined') return
  if (invalid || !measured) measure()
  const y = frame.scroll.y
  const reduced = motion === 'reduced'
  const still = !!flags.still

  // exact and smooth scroll positions
  if (Number.isNaN(yPrev) || reduced || still || Math.abs(y - yPrev) > vh) ySmooth = y
  else ySmooth = damp(ySmooth, y, SMOOTH_LAMBDA, dt)
  if (Math.abs(ySmooth - y) < 0.05) ySmooth = y
  yPrev = y

  locate(y, locE)
  locate(ySmooth, locS)
  writePos(exact, locE)
  writePos(smooth, locS)
  for (const id of IDS) {
    weights[id] = 0
    exactWeights[id] = 0
  }
  const i0 = locS.index
  const i1 = Math.min(COUNT - 1, i0 + 1)
  weights[IDS[i0]] = 1 - locS.blend
  if (locS.blend > 0) weights[IDS[i1]] += locS.blend
  exactWeights[IDS[locE.index]] = 1 - locE.blend
  if (locE.blend > 0) exactWeights[IDS[Math.min(COUNT - 1, locE.index + 1)]] += locE.blend

  // exact chapter (nav label, aria-current, readout ownership)
  const nowExact = IDS[locE.blend < 0.5 ? locE.index : Math.min(COUNT - 1, locE.index + 1)]
  if (nowExact !== exactChapter) {
    exactChapter = nowExact
    for (const fn of subscribers) {
      try {
        fn(nowExact)
      } catch (err) {
        console.error('[conductor] subscriber threw', err)
      }
    }
    useApp.getState().setActiveChapter(nowExact)
  }

  // ── DOM read phase (one batch, 4.3) ──
  let needLive = false
  for (let j = 0; j < COUNT; j++) {
    const g = geo[j]
    const w = weights[g.id] + exactWeights[g.id]
    if (w > 0 && (g.mode === 'live' || g.mode === 'sticky' || g.id === 'dusk')) needLive = true
  }
  const moved = Number.isNaN(lastReadY) || Math.abs(y - lastReadY) >= 0.5
  for (const g of geo) g.frameOk = false
  if (moved || needLive) {
    lastReadY = y
    const vhv = frame.viewport.h
    for (const g of geo) {
      const visible = g.top - y < vhv + 64 && g.top + g.height - y > -64
      if (g.frameEl && (visible || weights[g.id] > 0)) {
        const r = g.frameEl.getBoundingClientRect()
        g.fr.x = r.left
        g.fr.y = r.top
        g.fr.w = r.width
        g.fr.h = r.height
        g.frameOk = true
      }
      const live = g.mode === 'live' || g.id === 'dusk'
      if (live && (visible || weights[g.id] > 0)) {
        const a = anchorOf(g.id)
        if (a) {
          const r = a.el.getBoundingClientRect()
          a.live = new DOMRectReadOnly(r.left, r.top, r.width, r.height)
        }
      }
    }
    for (const s of scrims) {
      if (s.kind !== 'live') continue
      const r = s.el.getBoundingClientRect()
      s.vx = r.left
      s.vy = r.top
      s.w = r.width
      s.h = r.height
    }
  }
  // sticky anchors: live rect derived from the frame (no extra read)
  for (const g of geo) {
    if (!g.frameEl) continue
    const a = anchorOf(g.id)
    if (a && a.frameEl === g.frameEl && a.rest) {
      const fr = frameRectOf(g)
      a.live = new DOMRectReadOnly(fr.x + a.rest.x, fr.y + a.rest.y, a.rest.width, a.rest.height)
    }
  }
  // rest and end anchors: live rect from the document position (no read)
  for (const e of allAnchors()) {
    const g = geo[IDX[e.spec.chapter]]
    if (!g || g.frameEl || g.mode === 'live' || g.id === 'dusk') continue
    e.live = new DOMRectReadOnly(e.doc.x - window.scrollX, e.doc.y - y, e.doc.w, e.doc.h)
  }

  // ── visitor (write-yours), settled over about 400 ms ──
  const v = light.visitor
  if (!visitorSm.init || reduced || still) {
    visitorSm.hour = fin(v.hour, visitorSm.hour)
    visitorSm.alt = fin(v.alt, visitorSm.alt)
    visitorSm.prism = fin(v.prism, visitorSm.prism)
    visitorSm.init = true
  } else {
    visitorSm.hour = settle(visitorSm.hour, v.hour, dt, 1e-4)
    visitorSm.alt = settle(visitorSm.alt, v.alt, dt, 1e-3)
    visitorSm.prism = settle(visitorSm.prism, v.prism, dt, 1e-4)
  }
  const visitor = { hour: visitorSm.hour, alt: visitorSm.alt, prism: visitorSm.prism, valid: v.valid }

  // ── chapter states for the (at most two) chapters in the blend ──
  const pair: [number, number] = [i0, i1]
  const wts: [number, number] = [1 - locS.blend, locS.blend]
  const nSlots = locS.blend > 0 && i1 !== i0 ? 2 : 1
  for (let s = 0 as 0 | 1; s < nSlots; s = (s + 1) as 0 | 1) {
    const j = pair[s]
    const id = IDS[j]
    let local = s === 0 ? locS.local : 0
    if (id === 'appointment') local = appointmentP(ySmooth)
    const st = worldSpec(id, local, comp, motion, visitor)
    if (still && flags.still === id && flags.hour != null && id !== 'appointment') {
      const sl = sunLinearAt(flags.hour)
      sunLin[s] = sl.rgb
      eSun[s] = sl.e
      shadeLin[s] = shadeLinearAt(flags.hour)
      hourOf[s] = flags.hour
    } else if (id === 'first-light') {
      // ?still renders the settled frame: the dawn has broken and the word has formed (4.14)
      const dawn = still ? 1 : clamp(fin(light.intro.dawn, 1))
      const day = sunLinearAt(st.hour)
      sunLin[s] = [lerp(DAWN.sun.rgb[0], day.rgb[0], dawn), lerp(DAWN.sun.rgb[1], day.rgb[1], dawn), lerp(DAWN.sun.rgb[2], day.rgb[2], dawn)]
      eSun[s] = lerp(DAWN.sun.e, st.e, dawn)
      const sh = shadeLinearAt(st.hour)
      shadeLin[s] = [lerp(DAWN.shade[0], sh[0], dawn), lerp(DAWN.shade[1], sh[1], dawn), lerp(DAWN.shade[2], sh[2], dawn)]
      hourOf[s] = lerp(DAWN.hour, st.hour, dawn)
      const form = still ? 1 : clamp(fin(light.intro.form, 1))
      st.word.focus = st.word.focus * form
      st.word.wave = lerp(1, st.word.wave, form)
    } else {
      sunLin[s] = srgbHexToLinear(st.sunHex)
      eSun[s] = st.e
      shadeLin[s] = srgbHexToLinear(st.shadeHex)
      hourOf[s] = st.hour
    }
    if (id === 'write-yours') eSun[s] *= horizonFactor(visitor.alt)
    states[s] = st
    resolvePatch(s, j, st)
  }
  if (nSlots === 1) {
    wts[0] = 1
    wts[1] = 0
    states[1] = null
  }

  // ── fold (4.3): Σ weight_i × (state_i + input_i) ──
  delta = 0
  const A = states[0] as ChapterState
  const B = states[1]
  const wA = wts[0]
  const wB = wts[1]
  // section inputs, sanitised: one section writing NaN must never blank the whole wall
  const inA = sanitize(light.input[IDS[pair[0]]], inScratch[0])
  const inB = B ? sanitize(light.input[IDS[pair[1]]], inScratch[1]) : null
  const mix = (a: number, b: number) => (B ? a * wA + b * wB : a)
  // Geometry weight. Across a focus pull (a view-mode change) the patch finishes its move
  // before the wall is revealed (modeMix starts at 0.44), so the light crosses the wall
  // hidden inside the pull and arrives already registered with the incoming chapter (5.0).
  const pull = !!B && A.mode !== B.mode
  let gB = B ? (pull ? smoothstep(0.08, 0.42, locS.blend) : wB) : 0
  // A patch that is off (Still air behind the posters, the ember after the epilogue) has no
  // place to come from: the light fades in or out where it will be, instead of sliding
  // across the page from a position nobody sees.
  const emberOn = clamp(fin(light.ember.on, 1))
  const onOf = (st: ChapterState, id: ChapterId) => st.patch.on * (id === 'dusk' ? emberOn : 1)
  const onA = onOf(A, IDS[pair[0]])
  const onB = B ? onOf(B, IDS[pair[1]]) : 0
  if (B && onA <= 0.001 && onB > 0.001) gB = 1
  else if (B && onB <= 0.001 && onA > 0.001) gB = 0
  const gA = 1 - gB
  const gmix = (a: number, b: number) => (B ? a * gA + b * gB : a)

  light.chapter = IDS[pair[0]]
  set(light, 'chapterFloat', pair[0] + (B ? locS.blend : 0))
  set(light, 'hour', mix(hourOf[0], hourOf[1]))
  // hourExact: the same fold at the exact scroll position (no damping)
  {
    const ei0 = locE.index
    const ei1 = Math.min(COUNT - 1, ei0 + 1)
    const hourAt = (j: number) => {
      const id = IDS[j]
      if (still && flags.still === id && flags.hour != null) return flags.hour
      if (id === 'appointment') return reduced ? HOURS.appointment : appointmentHour(appointmentP(y))
      if (id === 'write-yours') return fin(v.hour, visitorSm.hour)
      if (id === 'first-light') return lerp(DAWN.hour, HOURS['first-light'], still ? 1 : clamp(fin(light.intro.dawn, 1)))
      return CHAPTERS[j].hour ?? visitorSm.hour
    }
    const h0 = hourAt(ei0)
    light.hourExact = locE.blend > 0 && ei1 !== ei0 ? lerp(h0, hourAt(ei1), locE.blend) : h0
  }

  // modes and the focus pull
  if (B && A.mode !== B.mode) {
    light.modeA = A.mode
    light.modeB = B.mode
    set(light, 'modeMix', smoothstep(0.44, 0.56, locS.blend))
    const sPi = Math.sin(Math.PI * locS.blend)
    set(light, 'defocus', sPi * sPi)
    set(light, 'cloud', 0)
  } else {
    const m: ViewMode = B && locS.blend >= 0.5 ? B.mode : A.mode
    light.modeA = m
    light.modeB = m
    set(light, 'modeMix', 0)
    set(light, 'defocus', 0)
    set(light, 'cloud', B && A.mode === 'wall' && B.mode === 'wall' ? Math.sin(Math.PI * locS.blend) : 0)
  }

  // sun and shade (linear light)
  const sun = light.sun
  set(sun, 'r', mix(sunLin[0][0], sunLin[1][0]))
  set(sun, 'g', mix(sunLin[0][1], sunLin[1][1]))
  set(sun, 'b', mix(sunLin[0][2], sunLin[1][2]))
  set(sun, 'e', mix(eSun[0], eSun[1]))
  set(sun, 'x', mix(inA.sunX, inB ? inB.sunX : 0))
  set(sun, 'y', mix(inA.sunY, inB ? inB.sunY : 0))
  // aberration bends rays into streaks; diffuse light under the passing cloud has none
  set(sun, 'aberr', mix(inA.aberr, inB ? inB.aberr : 0) * (1 - light.cloud))
  const shade = light.shade
  set(shade, 'r', mix(shadeLin[0][0], shadeLin[1][0]))
  set(shade, 'g', mix(shadeLin[0][1], shadeLin[1][1]))
  set(shade, 'b', mix(shadeLin[0][2], shadeLin[1][2]))
  set(shade, 'u', mix(calUv[0][0], calUv[1][0]))
  set(shade, 'v', mix(calUv[0][1], calUv[1][1]))

  // patch (CSS px) and window
  const P = light.patch
  const pA = px[0]
  const pB = px[1]
  set(P, 'x', gmix(pA.x + inA.driftX * frame.viewport.w, pB.x + (inB ? inB.driftX : 0) * frame.viewport.w))
  set(P, 'y', gmix(pA.y, pB.y))
  set(P, 'w', gmix(pA.w, pB.w))
  set(P, 'h', gmix(pA.h, pB.h))
  set(P, 'skew', gmix(pA.skew, pB.skew))
  set(P, 'split', gmix(A.patch.split, B ? B.patch.split : 0))
  set(P, 'transom', gmix(A.patch.transom, B ? B.patch.transom : 0))
  set(P, 'mullion', gmix(A.patch.mullion, B ? B.patch.mullion : 0))
  set(P, 'on', mix(onA, onB))
  const lw = light.lower
  set(lw, 'u0', gmix(A.lower.u0, B ? B.lower.u0 : 0))
  set(lw, 'v0', gmix(A.lower.v0, B ? B.lower.v0 : 0))
  set(lw, 'u1', gmix(A.lower.u1, B ? B.lower.u1 : 0))
  set(lw, 'v1', gmix(A.lower.v1, B ? B.lower.v1 : 0))

  // word. The passing cloud diffuses the sun, and diffuse light forms no caustic: under it
  // the word dissolves into even light and re-forms as the cloud passes. This is also what
  // keeps text legible when a formed word crosses a text box mid-blend: the 0.015 scrim
  // floor holds for plain sunlight, not for letters that concentrate it several times (9.3).
  const W = light.word
  const clear = 1 - light.cloud
  set(W, 'focus', clamp(mix(A.word.focus + inA.focus, B ? B.word.focus + (inB ? inB.focus : 0) : 0), 0, 1) * clear)
  set(W, 'wave', Math.max(0, mix(A.word.wave + inA.wave, B ? B.word.wave + (inB ? inB.wave : 0) : 0)) * clear)
  set(W, 'prism', clamp(mix(A.word.prism, B ? B.word.prism : 0)))
  set(W, 'pointScale', Math.max(0.1, 1 + mix(inA.pointScale, inB ? inB.pointScale : 0)))
  let wordId: WordId | null = A.word.id
  if (B) {
    // the heavier chapter's word; while it has none, the other one's (if it still has weight)
    const bHeavier = wB > wA
    const heavier = bHeavier ? B : A
    const other = bHeavier ? A : B
    const otherW = bHeavier ? wA : wB
    wordId = heavier.word.id ?? (otherW > 0 ? other.word.id : null)
  }
  if (W.id !== wordId) {
    W.id = wordId
    delta += 1
  }

  // word rect in lower-light space (6.1.2), with WP4's helper so both sides agree
  {
    const size = lowerSizePx(P, lw)
    const R = light.wordRect
    const r = wordRectFor(size.w, size.h, comp, wordRectTmp)
    set(R, 'w', r.w)
    set(R, 'h', r.h)
    set(R, 'x', r.x)
    set(R, 'y', r.y)
  }

  // skirting (6.1.4): hero at rest, and the dusk footer's visible area
  {
    const canvasH = light.viewport.h > 1 ? light.viewport.h : frame.viewport.h
    let sk = -1
    const dusk = geo[COUNT - 1]
    const footerTop = dusk.top - y
    const footerBottom = dusk.top + dusk.height - y
    const visTop = Math.max(0, footerTop)
    const visBottom = Math.min(frame.viewport.h, footerBottom)
    if (dusk.el && visBottom - visTop > 1) {
      sk = (visTop + SKIRTING.duskOfFooter * (visBottom - visTop)) / canvasH
    } else if (weights['first-light'] > 0) {
      sk = ((comp === 'split' ? SKIRTING.heroSplit : SKIRTING.heroStacked) * vh) / canvasH
    }
    set(light, 'skirtingY', sk)
  }

  // air: damped scroll velocity for the dust swirl (-1 to 1)
  set(light, 'air', reduced ? 0 : damp(light.air, clamp(frame.scroll.velocity / 2400, -1, 1), 3, dt))

  // text over light in motion: how far the exact scroll is from the rest interval of every chapter
  // with weight (the page moves the text while the light holds, 4.3)
  {
    let d = Infinity
    for (const g of geo) {
      if (weights[g.id] <= 0 && exactWeights[g.id] <= 0) continue
      d = Math.min(d, y < g.a ? g.a - y : y > g.b ? y - g.b : 0)
    }
    scrimShade.motion = reduced || still || !Number.isFinite(d) ? 0 : smoothstep(0, 160, d)
  }
  placeScrims(y)
  writeBeam()

  if (delta > 1e-6) stage.requestRender(1)
}

// ── public API ──
export const conductor = {
  exact,
  smooth,
  weights: weights as Readonly<Record<ChapterId, number>>,
  /** Remeasure sections, sticky frames, anchors and scrims; ends with stage.requestRender(2). */
  measure,
  /** One tick (4.1 step 3). Called only by the One Clock. */
  update,
  /** Exact chapter is id, inside its rest interval, blend 0 (commission panel, 5.7). */
  atRest(id: ChapterId): boolean {
    // the exact chapter holds all the weight (inside its rest interval or its plateaus)
    // and the smooth light has fully arrived, so a DOM-locked patch is exactly locked
    return exactWeights[id] >= 0.999 && weights[id] >= 0.999
  },
  /** (y - top + lead·vh) / (height - (lead + trail)·vh), clamped, at the exact scroll. */
  sectionProgress(id: ChapterId, lead = 0.25, trail?: number): number {
    return progressAt(id, frame.scroll.y, lead, trail ?? lead)
  },
  /** The same progress at the smooth scroll position the light uses (4.3 `smooth`). */
  smoothProgress(id: ChapterId, lead = 0.25, trail?: number): number {
    if (id === 'appointment' && flags.still === 'appointment') return appointmentP(ySmooth)
    return progressAt(id, ySmooth, lead, trail ?? lead)
  },
  /** Fires when the exact chapter (blend < 0.5 ? i : i + 1) changes. */
  subscribe(fn: (id: ChapterId) => void): () => void {
    subscribers.add(fn)
    return () => {
      subscribers.delete(fn)
    }
  },
  /** The exact chapter as the nav shows it (blend < 0.5 ? i : i + 1). */
  get current(): ChapterId {
    return exactChapter
  },
  /** Scroll y of a chapter's rest (a_i), for stills and jumps. */
  restY(id: ChapterId): number {
    if (invalid || !measured) measure()
    return geo[IDX[id]]?.a ?? 0
  },
  /** The damped scroll position the light follows (QA). */
  get ySmooth(): number {
    return ySmooth
  },
  /** Measured 100svh in CSS px. */
  get vh(): number {
    return vh
  },
  get composition(): Composition {
    return comp
  },
  /** Rest interval [a, b] and mode per chapter (QA). */
  intervals(): Array<{ id: ChapterId; mode: RestMode; a: number; b: number; top: number; height: number }> {
    return geo.map((g) => ({ id: g.id, mode: g.mode, a: g.a, b: g.b, top: g.top, height: g.height }))
  },
}

export type Conductor = typeof conductor

// ── lifecycle ──
export function initConductor(): () => void {
  initialised++
  if (initialised === 1 && typeof window !== 'undefined') {
    const cleanups: Array<() => void> = []
    invalid = true
    setAnchorListener(invalidate)
    cleanups.push(() => setAnchorListener(null))

    const coarse = window.matchMedia('(pointer: coarse)')
    const onResize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      if (coarse.matches && w === lastMeasureW) return // toolbar collapse: height-only (4.3)
      if (w !== lastMeasureW || h !== lastMeasureH) invalid = true
    }
    window.addEventListener('resize', onResize, { passive: true })
    cleanups.push(() => window.removeEventListener('resize', onResize))

    const fonts = document.fonts
    if (fonts) {
      fonts.ready.then(invalidate).catch(() => {})
      fonts.addEventListener?.('loadingdone', invalidate)
      cleanups.push(() => fonts.removeEventListener?.('loadingdone', invalidate))
    }
    const main = document.querySelector('main')
    if (main && 'ResizeObserver' in window) {
      const ro = new ResizeObserver(invalidate)
      ro.observe(main)
      const footer = document.querySelector('footer[data-chapter]')
      if (footer) ro.observe(footer)
      cleanups.push(() => ro.disconnect())
    }
    ScrollTrigger.addEventListener('refresh', invalidate)
    cleanups.push(() => ScrollTrigger.removeEventListener('refresh', invalidate))
    window.addEventListener('load', invalidate)
    cleanups.push(() => window.removeEventListener('load', invalidate))

    cleanups.push(installLiveMark())
    cleanups.push(installHud())

    teardown = () => {
      for (const c of cleanups.reverse()) c()
      probe?.remove()
      probe = null
      measured = false
      yPrev = Number.NaN
    }
  }
  return () => {
    initialised--
    if (initialised === 0 && teardown) {
      teardown()
      teardown = null
    }
  }
}

// ── ?qa debug overlay (chapter, local, blend, hour, weights) ──
function installHud(): () => void {
  if (typeof window === 'undefined') return () => {}
  const q = new URLSearchParams(window.location.search)
  if (!q.has('qa') || q.get('hud') === '0') return () => {}
  const el = document.createElement('div')
  el.setAttribute('aria-hidden', 'true')
  el.dataset.conductorHud = ''
  el.style.cssText =
    'position:fixed;left:8px;bottom:8px;z-index:99;pointer-events:none;font:11px/1.35 ui-sans-serif,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:#ECE6D9;background:rgba(30,34,36,0.82);padding:6px 8px;white-space:pre;max-width:46ch;'
  document.body.appendChild(el)
  let last = ''
  let acc = 0
  const off = onAfterScroll(function conductorHud(_t, dt) {
    acc += dt
    if (acc < 0.1) return
    acc = 0
    const w = IDS.filter((id) => weights[id] > 0)
      .map((id) => `${id} ${weights[id].toFixed(2)}`)
      .join(' · ')
    const h = light.hour
    const hh = Math.floor(h)
    const mm = Math.round((h - hh) * 60)
    const text =
      `exact  ${exact.id} local ${exact.local.toFixed(3)} blend ${exact.blend.toFixed(3)} → ${exactChapter}\n` +
      `smooth ${smooth.id} local ${smooth.local.toFixed(3)} blend ${smooth.blend.toFixed(3)}\n` +
      `hour ${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')} (${light.hour.toFixed(3)}) modes ${light.modeA}/${light.modeB} mix ${light.modeMix.toFixed(2)} defocus ${light.defocus.toFixed(2)} cloud ${light.cloud.toFixed(2)}\n` +
      `weights ${w}\n` +
      `patch ${light.patch.x.toFixed(0)},${light.patch.y.toFixed(0)} ${light.patch.w.toFixed(0)}×${light.patch.h.toFixed(0)} skew ${light.patch.skew.toFixed(2)} on ${light.patch.on.toFixed(2)}\n` +
      `word ${light.word.id ?? 'none'} focus ${light.word.focus.toFixed(2)} wave ${light.word.wave.toFixed(2)} prism ${light.word.prism.toFixed(2)} · sun ${linearToHex([light.sun.r, light.sun.g, light.sun.b])} ×${light.sun.e.toFixed(2)} · shade ${linearToHex([light.shade.r, light.shade.g, light.shade.b])}\n` +
      `scrims ${light.scrimCount} · skirting ${light.skirtingY.toFixed(3)} · ${comp} ${motion}`
    if (text !== last) {
      last = text
      el.textContent = text
    }
  })
  return () => {
    off()
    el.remove()
  }
}
