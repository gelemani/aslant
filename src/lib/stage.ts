// Render on dirty, idle, frame time and the quality governor (brief 4.1, 7.3).
// The SmoothScroll ticker brackets the renderers with stage.beginFrame / stage.endFrame;
// WP4's Stage advances only when stage.shouldRender() is true and reports each frame
// with stage.recordFrame(ms, source). Every GSAP tween that writes to `light` goes
// through tweenLight(), which holds the stage while it runs.
import { gsap } from '@/lib/gsap'
import { light } from '@/lib/light-state'
import { flags, motion } from '@/lib/qa-flags'
import { useApp, type GpuTier } from '@/lib/store'
import type { WebGLRenderer } from 'three'

export type FrameSource = 'gpu' | 'cpu'
export interface QualityStep {
  dpr: number
  gpuTier: GpuTier
}

/** Seconds without a touch before the stage goes idle. */
export const IDLE_AFTER_S = 10
/** DPR cap per GPU tier (4.11). */
export const DPR_CAP: Readonly<Record<GpuTier, number>> = { 0: 1, 2: 1.35, 3: 1.75 }

const now = () => (typeof performance === 'undefined' ? 0 : performance.now() / 1000)

// ── render-on-dirty state ──
let dirty = 0
const holds = new Set<string>()
const ambient = new Set<string>()
let lastTouch = now()
let idle = false

// ── per-tick state ──
let tickT = 0
let lastRenderT = -1
let wantThisTick = false
let recordedThisTick = false
let renderedLastTick = false
let framesRendered = 0

// ── frame time ──
let frameMs = 0
let frameSource: FrameSource = 'cpu'
/** The raw (not smoothed) time of the latest recorded frame; the governor samples it. */
let lastFrameMs = 0

// ── the live renderer, for ?qa (window.__aslant.gl, info()); set by WP4's Stage ──
let renderer: WebGLRenderer | null = null

// ── listeners ──
const frameCbs = new Set<(t: number) => void>()
const qualityCbs = new Set<(step: QualityStep) => void>()

// ── governor (4.1) ──
/** The governor's DPR ceiling (Infinity until its first decline). */
let govDpr = Number.POSITIVE_INFINITY
let declines = 0
const declineLog: Array<{ at: number; step: QualityStep; p90: number; metric: FrameSource | 'interval'; budget: number; samples: number }> = []
let firstTickT = -1
const warmIntervals: number[] = []
let refreshS = 0
let prevTickT = -1
let run: number[] = []
let runGpu: number[] = []
let runStart = -1
let readySince = -1
/** Seconds after the stage turns ready before the governor samples. */
const GOVERNOR_GRACE_S = 3
/**
 * Seconds after a decline during which the governor takes no samples, so the next window never
 * measures the decline's own resize and target reallocation (two declines 2.4 s apart, ad-final).
 * The run restarts afterwards: a second step needs a full clean window after the cooldown.
 */
const GOVERNOR_COOLDOWN_S = 3
let cooldownUntil = -1

function deviceDpr(): number {
  return typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1
}

/** min(tier cap, device DPR, governor ceiling), never below 1 unless the device is. */
function currentDpr(): number {
  const cap = DPR_CAP[useApp.getState().gpuTier] ?? 1
  return Math.min(cap, deviceDpr(), govDpr)
}

function median(a: number[]): number {
  const s = [...a].sort((x, y) => x - y)
  return s.length ? s[Math.floor(s.length / 2)] : 0
}

function p90(a: number[]): number {
  const s = [...a].sort((x, y) => x - y)
  return s.length ? s[Math.min(s.length - 1, Math.floor(s.length * 0.9))] : 0
}

function decline(p: number, metric: FrameSource | 'interval', budget: number, samples: number) {
  if (declines >= 2) return
  const tier = useApp.getState().gpuTier
  let step: QualityStep | null = null
  if (declines === 0) {
    const next = Math.max(1, currentDpr() - 0.25)
    if (next < currentDpr()) {
      govDpr = next
      step = { dpr: next, gpuTier: tier }
    }
  }
  if (!step && tier === 3) {
    useApp.getState().setGpuTier(2)
    step = { dpr: currentDpr(), gpuTier: 2 }
  }
  declines++
  if (!step) return
  declineLog.push({ at: tickT, step, p90: p, metric, budget, samples })
  if (flags.qa) console.info('[aslant] governor decline', { step, p90: p, metric, budget, samples })
  for (const cb of qualityCbs) {
    try {
      cb(step)
    } catch (err) {
      console.error('[stage] onQuality listener threw', err)
    }
  }
  requestRender(2)
}

/** Samples only runs of rendered frames on consecutive ticks; a tick without a render ends the run. */
function governorSample(t: number, rendered: boolean) {
  const interval = prevTickT < 0 ? 0 : t - prevTickT
  prevTickT = t
  if (firstTickT < 0) firstTickT = t
  if (t - firstTickT < 1) {
    if (interval > 0 && interval < 0.25) warmIntervals.push(interval)
    return
  }
  if (!refreshS) refreshS = median(warmIntervals) || 1 / 60
  // Sample only a live, settled stage: never the boot (shader compile, bake decode, first uploads).
  if (useApp.getState().webgl !== 'ready') {
    readySince = -1
    run = []
    runGpu = []
    runStart = -1
    return
  }
  if (readySince < 0) readySince = t
  if (t - readySince < GOVERNOR_GRACE_S) return
  if (t < cooldownUntil) {
    run = []
    runGpu = []
    runStart = -1
    return
  }
  if (declines >= 2 || !rendered || !renderedLastTick || (typeof document !== 'undefined' && document.hidden)) {
    if (!rendered) {
      run = []
      runGpu = []
      runStart = -1
    }
    return
  }
  if (runStart < 0) runStart = t
  const gpu = frameSource === 'gpu'
  run.push(interval * 1000)
  if (gpu) runGpu.push(lastFrameMs)
  if (t - runStart >= 2) {
    // A decline needs frames that are really late: the tick-interval p90 must exceed its budget
    // (1.5 refresh periods; 1.25 when the GPU timer also reports over budget). The GPU timer alone
    // never declines: ANGLE-Metal's TIME_ELAPSED reads 1.5 to 2× high on the M2 (WP4, 06:22).
    const refreshMs = refreshS * 1000
    const pInt = p90(run)
    const gpuRun = runGpu.length >= run.length * 0.8
    const pGpu = gpuRun ? p90(runGpu) : 0
    const gpuBudget = refreshS < 0.012 ? 6.5 : 10
    const before = declines
    if (gpuRun && pGpu > gpuBudget && pInt > refreshMs * 1.25) decline(pGpu, 'gpu', gpuBudget, run.length)
    else if (pInt > refreshMs * 1.5) decline(pInt, 'interval', refreshMs * 1.5, run.length)
    if (declines > before) cooldownUntil = t + GOVERNOR_COOLDOWN_S
    run = []
    runGpu = []
    runStart = -1
  }
}

function frozen(): boolean {
  return flags.still !== null || motion() === 'reduced'
}

function requestRender(frames = 1): void {
  dirty = Math.max(dirty, Math.max(1, Math.floor(frames)))
}

function touch(): void {
  lastTouch = now()
  if (idle) {
    idle = false
    requestRender(1)
  }
}

function webglLive(): boolean {
  const w = useApp.getState().webgl
  return w === 'pending' || w === 'ready'
}

function shouldRender(): boolean {
  // Overcast (off, or failed while the Stage stays mounted for a context restore): nothing renders.
  if (!webglLive()) return false
  if (dirty > 0 || holds.size > 0) return true
  // Under Still air and in still mode every time-based term is frozen: nothing ambient to draw.
  if (idle || frozen()) return false
  const ambientOn = light.shimmer > 0 || ambient.size > 0
  if (!ambientOn) return false
  // Ambient cadence: at most 60 Hz when only ambient terms are dirty.
  return lastRenderT < 0 || tickT - lastRenderT >= 1 / 60 - 0.002
}

/** Called by the SmoothScroll ticker before the renderers. */
function beginFrame(t: number, dt: number): void {
  tickT = t
  recordedThisTick = false
  if (flags.idle && !idle && holds.size === 0 && now() - lastTouch >= IDLE_AFTER_S) idle = true
  wantThisTick = shouldRender()
  if (flags.still !== null) {
    light.time = 0.7
    light.grainSeed = 1
  } else if (!idle && !frozen()) {
    // The shimmer and dust clock follows real time while awake (ambient ticks may be skipped);
    // the grain seed advances once per rendered frame.
    light.time += dt
    if (wantThisTick) light.grainSeed = (light.grainSeed + 1) % 4096
  }
}

/** Called by the SmoothScroll ticker after the renderers; `renderers` is the number registered. */
function endFrame(t: number, renderers: number): void {
  const rendered = recordedThisTick || (wantThisTick && renderers > 0)
  if (rendered) {
    framesRendered++
    lastRenderT = t
    if (dirty > 0) dirty--
    for (const cb of frameCbs) {
      try {
        cb(t)
      } catch (err) {
        console.error('[stage] onFrame listener threw', err)
      }
    }
  }
  governorSample(t, rendered)
  renderedLastTick = rendered
}

export const stage = {
  requestRender,
  hold(key: string): void {
    holds.add(key)
    touch()
  },
  release(key: string): void {
    if (holds.delete(key)) requestRender(1)
  },
  /** Input activity; resets the idle timer and wakes the stage. */
  touch,
  /** Marks an ambient term (dust, shimmer) visible or not; ambient renders at most 60 Hz and stop when idle. */
  ambient(key: string, on: boolean): void {
    if (on) ambient.add(key)
    else ambient.delete(key)
  },
  get idle(): boolean {
    return idle
  },
  get frameMs(): number {
    return frameMs
  },
  get frameSource(): FrameSource {
    return frameSource
  },
  /** Current DPR chosen by the tier cap and the governor. */
  get dpr(): number {
    return currentDpr()
  },
  /** The governor's declines this session (logged under ?qa). */
  get declines(): ReadonlyArray<(typeof declineLog)[number]> {
    return declineLog
  },
  /** WP4's Stage after each advance; feeds frameMs and the governor. */
  recordFrame(ms: number, source: FrameSource): void {
    frameMs = frameMs === 0 || source !== frameSource ? ms : frameMs + (ms - frameMs) * 0.1
    frameSource = source
    lastFrameMs = ms
    recordedThisTick = true
  },
  /** After each rendered frame. */
  onFrame(cb: (t: number) => void): () => void {
    frameCbs.add(cb)
    return () => {
      frameCbs.delete(cb)
    }
  },
  /** Governor declines (4.1). */
  onQuality(cb: (step: QualityStep) => void): () => void {
    qualityCbs.add(cb)
    return () => {
      qualityCbs.delete(cb)
    }
  },
  shouldRender,
  /** WP4's Stage: setRenderer(state.gl) in onCreated, setRenderer(null) in its cleanup. QA only. */
  setRenderer(r: WebGLRenderer | null): void {
    renderer = r
  },
  get renderer(): WebGLRenderer | null {
    return renderer
  },
  /** Rendered frames so far (QA frame counter). */
  get frames(): number {
    return framesRendered
  },
  beginFrame,
  endFrame,
}

export type Stage = typeof stage

// ── redraw triggers owned by the stage (4.1) ──
let installed = 0
let uninstall: (() => void) | null = null

/** Installs the page-level redraw triggers once (ref-counted for StrictMode). */
export function installStage(): () => void {
  installed++
  if (installed === 1 && typeof window !== 'undefined') {
    // Redraw triggers mark dirty frames (they render even while idle) but never wake the stage.
    const redraw = () => {
      requestRender(2)
    }
    const onVisible = () => {
      if (!document.hidden) redraw()
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('pageshow', redraw)
    document.fonts?.addEventListener?.('loadingdone', redraw)
    uninstall = () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('pageshow', redraw)
      document.fonts?.removeEventListener?.('loadingdone', redraw)
    }
  }
  return () => {
    installed--
    if (installed === 0) {
      uninstall?.()
      uninstall = null
    }
  }
}

let tweenId = 0
/** Conductor-written objects (7.3): never a tween target. */
const CONDUCTOR_OWNED: ReadonlySet<object> = new Set<object>([
  light.sun,
  light.shade,
  light.patch,
  light.lower,
  light.wordRect,
  light.word,
])

function isArrayLike(v: unknown): boolean {
  return (
    Array.isArray(v) ||
    ArrayBuffer.isView(v) ||
    (typeof v === 'object' && v !== null && typeof (v as { length?: unknown }).length === 'number')
  )
}

/**
 * A GSAP tween on a plain-number `light` object (light.input[chapter], light.intro, …).
 * Holds the stage while it runs and releases on complete, reverse-complete or kill.
 * Never target a conductor-written field (4.1).
 */
export function tweenLight(target: object, vars: gsap.TweenVars): gsap.core.Tween {
  if (process.env.NODE_ENV !== 'production') {
    if (isArrayLike(target)) {
      console.error('[stage] tweenLight target is array-like; GSAP would treat it as a list of targets.', target)
    }
    if (CONDUCTOR_OWNED.has(target)) {
      console.error('[stage] tweenLight targets a conductor-written field; the conductor overwrites it every frame (4.1).', target)
    }
  }
  const key = `tween:${++tweenId}`
  const { onStart, onUpdate, onComplete, onReverseComplete, onInterrupt } = vars
  const call = (fn: gsap.Callback | undefined, params: unknown[] | undefined) => {
    if (typeof fn === 'function') fn(...(params ?? []))
  }
  const tween: gsap.core.Tween = gsap.to(target, {
    ...vars,
    onStart() {
      stage.hold(key)
      call(onStart, vars.onStartParams)
    },
    onUpdate() {
      stage.touch()
      call(onUpdate, vars.onUpdateParams)
    },
    onComplete() {
      stage.release(key)
      call(onComplete, vars.onCompleteParams)
    },
    onReverseComplete() {
      stage.release(key)
      call(onReverseComplete, vars.onReverseCompleteParams)
    },
    onInterrupt() {
      stage.release(key)
      call(onInterrupt, vars.onInterruptParams)
    },
  })
  return tween
}
