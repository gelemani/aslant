'use client'

// The One Clock (brief 4.1, 4.7, 7.4). The only gsap.ticker listener and the only
// smooth-scroll engine. Every frame, in this fixed order:
//   [gsap updateRoot: every tween]  →  1. lenis.raf  →  2. readScroll
//   →  3. conductor.update(dt)  →  4. afterScroll(t, dt)  →  5. renderers(t, dt)
// dt is converted to seconds once and clamped to 1/30. Every listener call is isolated.
// Lenis is never created under Still air (motion() === 'reduced'): native scroll.

import { useEffect, type ReactNode } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { frame, runListeners, MAX_DT } from '@/lib/frame'
import { light } from '@/lib/light-state'
import { stage, installStage } from '@/lib/stage'
import { boot } from '@/lib/boot'
import { flags, motion } from '@/lib/qa-flags'
import { useApp } from '@/lib/store'
import * as conductorModule from '@/lib/conductor'
import type { ChapterId } from '@/content/chapters'
import { stageApi } from '@/webgl/stage-api'

// ── conductor bridge (WP2) ──
// conductor.update(dt) is the one DOM read phase (4.3). Guarded so the clock keeps
// running while the conductor is incomplete or throws.
type ConductorLike = { update?: (dt: number) => void; measure?: () => void }
const conductorRef: ConductorLike | null = (conductorModule as { conductor?: ConductorLike }).conductor ?? null
const initConductorRef = (conductorModule as { initConductor?: () => () => void }).initConductor ?? null
let conductorFailed = false

function updateConductor(dt: number) {
  const update = conductorRef?.update
  if (!update) return
  try {
    update.call(conductorRef, dt)
  } catch (err) {
    if (!conductorFailed) {
      conductorFailed = true
      console.error('[frame] conductor.update threw; the clock keeps running, logged once.', err)
    }
  }
}

// ── module singletons (StrictMode mounts effects twice; 4.1) ──
let lenis: Lenis | null = null
let mounts = 0
let teardown: (() => void) | null = null
const scrollLocks = new Set<string>()

function lightEase(): (t: number) => number {
  const e = gsap.parseEase('light')
  return typeof e === 'function' ? e : (t: number) => t
}

function resolveTarget(target: string): HTMLElement | null {
  if (typeof document === 'undefined') return null
  try {
    return document.querySelector<HTMLElement>(target)
  } catch {
    return document.getElementById(target.replace(/^#/, ''))
  }
}

function focusOnArrival(el: HTMLElement, focus: boolean | string | undefined) {
  if (focus === false) return
  let f: HTMLElement | null = null
  if (typeof focus === 'string') f = el.querySelector<HTMLElement>(focus) ?? resolveTarget(focus)
  if (!f) f = el.querySelector<HTMLElement>('h2, h1') ?? el
  if (!f.hasAttribute('tabindex') && !f.matches('a[href], button, input, select, textarea')) {
    f.setAttribute('tabindex', '-1')
  }
  f.focus({ preventScroll: true })
}

/**
 * Scrolls to an in-page target (4.7). Reduced motion or no Lenis: instant jump.
 * timelapse: 1.4 s with the `light` ease, so the day visibly fast-forwards.
 * Replaces the hash and focuses the target's heading (or the `focus` selector) on arrival.
 */
export function jumpTo(target: string, opts: { timelapse?: boolean; focus?: boolean | string } = {}): void {
  const el = resolveTarget(target)
  if (!el) return
  const id = el.id || (target.startsWith('#') ? target.slice(1) : '')
  if (id) {
    try {
      history.replaceState(history.state, '', `#${id}`)
    } catch {
      /* sandboxed history */
    }
  }
  stage.touch()
  stage.requestRender(2)
  const arrive = () => focusOnArrival(el, opts.focus ?? true)
  if (lenis && motion() === 'full') {
    if (opts.timelapse) {
      lenis.scrollTo(el, { duration: 1.4, easing: lightEase(), force: true, onComplete: arrive })
    } else {
      lenis.scrollTo(el, { immediate: true, force: true })
      arrive()
    }
    return
  }
  const top = el.getBoundingClientRect().top + window.scrollY
  window.scrollTo({ top, behavior: 'instant' })
  arrive()
}

/** Holds a scroll lock (menu, colophon, epilogue). Lenis runs while no key is held. */
export function stopScroll(key: string): void {
  scrollLocks.add(key)
  applyLocks()
}

export function startScroll(key: string): void {
  scrollLocks.delete(key)
  applyLocks()
}

function applyLocks() {
  if (typeof document === 'undefined') return
  const locked = scrollLocks.size > 0
  const root = document.documentElement
  if (locked) root.dataset.scrollLock = ''
  else delete root.dataset.scrollLock
  if (lenis) {
    if (locked) lenis.stop()
    else lenis.start()
  } else {
    root.style.overflow = locked ? 'hidden' : ''
  }
}

// ── ?qa main-thread budget (9.1: GSAP + Lenis + conductor + readouts ≤ 3 ms per frame) ──
const TICK_RING = 240
const tickCost = { scroll: new Float32Array(TICK_RING), after: new Float32Array(TICK_RING), n: 0 }

function recordTick(scrollAndConductorMs: number, afterScrollMs: number) {
  const i = tickCost.n++ % TICK_RING
  tickCost.scroll[i] = scrollAndConductorMs
  tickCost.after[i] = afterScrollMs
}

function tickStats() {
  const n = Math.min(tickCost.n, TICK_RING)
  const pct = (a: Float32Array, q: number) => {
    const s = Array.from(a.subarray(0, n)).sort((x, y) => x - y)
    return n ? +s[Math.min(n - 1, Math.floor(n * q))].toFixed(3) : 0
  }
  return {
    ticks: n,
    conductorMedian: pct(tickCost.scroll, 0.5),
    conductorP95: pct(tickCost.scroll, 0.95),
    afterScrollMedian: pct(tickCost.after, 0.5),
    afterScrollP95: pct(tickCost.after, 0.95),
  }
}

// ── ?qa hooks (4.14): window.__aslant = { light, conductor, stage, gl, info() } ──
type TickerInternals = { _listeners?: unknown[] }

function tickerListeners(): number {
  return ((gsap.ticker as unknown as TickerInternals)._listeners ?? []).length
}

function installQaHooks(): () => void {
  const w = window as unknown as { __aslant?: Record<string, unknown> }
  const hooks: Record<string, unknown> = {
    light,
    frame,
    stage,
    boot,
    conductor: conductorRef,
    useApp,
    flags,
    jumpTo,
    stopScroll,
    startScroll,
    tickerListeners,
    /** Lenis + readScroll + conductor, and afterScroll listeners, in ms over the last 240 ticks. */
    tickStats,
    get lenis() {
      return lenis
    },
    get gl() {
      return stage.renderer
    },
    info() {
      const r = stage.renderer
      const s = stageApi.info()
      const app = useApp.getState()
      return {
        renderer: r ? { memory: { ...r.info.memory }, render: { ...r.info.render }, programs: r.info.programs?.length ?? 0 } : null,
        webgl: app.webgl,
        gpuTier: app.gpuTier,
        motion: motion(),
        dpr: stage.dpr,
        rays: s.rays,
        bands: s.bands,
        frameMs: stage.frameMs,
        frameSource: stage.frameSource,
        frames: stage.frames,
        idle: stage.idle,
        declines: stage.declines,
        tickerListeners: tickerListeners(),
        lenis: !!lenis,
      }
    },
  }
  // Keep the getters live (a spread would freeze gl and lenis at install time).
  for (const [k, v] of Object.entries(w.__aslant ?? {})) if (!(k in hooks)) hooks[k] = v
  w.__aslant = hooks
  return () => {
    if (w.__aslant === hooks) delete w.__aslant
  }
}

// ── ?still=<chapter>|og (4.14): jump to the chapter's rest, then signal after two rendered frames ──
function installStill(): () => void {
  const w = window as unknown as { __aslantStillReady?: boolean }
  w.__aslantStillReady = false
  const id: ChapterId = flags.still === 'og' || flags.still === null ? 'first-light' : flags.still
  let cancelled = false
  let off: (() => void) | null = null
  const settle = async () => {
    try {
      if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    } catch {
      /* sandboxed */
    }
    await (document.fonts?.ready ?? Promise.resolve())
    // Wait for the light: the stage's shaders, first frame and the baked word (or Overcast).
    await new Promise<void>((resolve) => {
      const stop = boot.subscribe((p) => {
        if (p >= 1) {
          queueMicrotask(() => stop())
          resolve()
        }
      })
      setTimeout(resolve, 10000)
    })
    if (cancelled) return
    conductorRef?.measure?.()
    const y = (conductorRef as { restY?: (id: ChapterId) => number } | null)?.restY?.(id) ?? 0
    window.scrollTo({ top: y, behavior: 'instant' })
    stage.touch()
    stage.requestRender(2)
    const live = () => {
      const s = useApp.getState().webgl
      return s === 'pending' || s === 'ready'
    }
    let frames = 0
    if (live()) {
      off = stage.onFrame(() => {
        if (++frames >= 2) {
          w.__aslantStillReady = true
          off?.()
          off = null
        }
      })
    } else {
      // Overcast: nothing renders; two ticks of layout are enough.
      requestAnimationFrame(() => requestAnimationFrame(() => (w.__aslantStillReady = true)))
    }
  }
  void settle()
  return () => {
    cancelled = true
    off?.()
  }
}

// ── dev assertion (4.1): exactly two ticker listeners (GSAP's updateRoot and the One Clock) ──
function assertOneClock(): () => void {
  const timer = window.setTimeout(() => {
    const n = tickerListeners()
    if (n !== 2) console.warn(`[frame] gsap.ticker has ${n} listeners; the One Clock expects exactly 2 (updateRoot and SmoothScroll).`)
  }, 3000)
  return () => window.clearTimeout(timer)
}

function install(): () => void {
  const root = document.documentElement
  const coarseQuery = window.matchMedia('(pointer: coarse)')
  const osMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  const cleanups: Array<() => void> = []
  const on = <K extends keyof WindowEventMap>(
    type: K,
    fn: (e: WindowEventMap[K]) => void,
    opts: AddEventListenerOptions = { passive: true },
  ) => {
    window.addEventListener(type, fn, opts)
    cleanups.push(() => window.removeEventListener(type, fn, opts))
  }

  // Lenis: full motion only (4.7); still routes are frozen frames with damping off (4.14).
  if (motion() === 'full' && flags.still === null) {
    lenis = new Lenis({
      autoRaf: false,
      lerp: 0.085,
      smoothWheel: true,
      wheelMultiplier: 0.95,
      syncTouch: false,
      stopInertiaOnNavigate: true,
      anchors: false,
    })
    lenis.on('scroll', ScrollTrigger.update)
    applyLocks()
  }

  // Viewport and pointer.
  const onResize = () => {
    frame.viewport.w = window.innerWidth
    frame.viewport.h = window.innerHeight
    frame.viewport.dpr = window.devicePixelRatio || 1
    frame.pointer.coarse = coarseQuery.matches
    stage.requestRender(2)
  }
  onResize()
  on('resize', onResize)
  const onCoarse = () => onResize()
  coarseQuery.addEventListener('change', onCoarse)
  cleanups.push(() => coarseQuery.removeEventListener('change', onCoarse))

  let rawVx = 0
  let rawVy = 0
  let lastEventT = 0
  let movedThisTick = false
  on('pointermove', (e) => {
    const p = frame.pointer
    const t = gsap.ticker.time
    const dtE = t - lastEventT
    if (p.inside && dtE > 0 && dtE < 0.1) {
      rawVx = (e.clientX - p.x) / dtE
      rawVy = (e.clientY - p.y) / dtE
    }
    lastEventT = t
    p.x = e.clientX
    p.y = e.clientY
    p.nx = (e.clientX / Math.max(1, frame.viewport.w)) * 2 - 1
    p.ny = -((e.clientY / Math.max(1, frame.viewport.h)) * 2 - 1)
    p.inside = true
    p.lastMove = t
    movedThisTick = true
    stage.touch()
  })
  const onLeave = () => {
    frame.pointer.inside = false
  }
  const onOut = (e: PointerEvent) => {
    if (!e.relatedTarget) onLeave()
  }
  document.documentElement.addEventListener('pointerleave', onLeave)
  on('pointerout', onOut)
  on('blur', onLeave)
  cleanups.push(() => document.documentElement.removeEventListener('pointerleave', onLeave))
  const touchOnly = () => stage.touch()
  on('keydown', touchOnly)
  on('touchstart', touchOnly)
  on('wheel', touchOnly)
  on('pointerdown', touchOnly)

  // Delegated same-page link handler (Lenis anchors are off; 4.7).
  const onClick = (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const a = (e.target as Element | null)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null
    if (!a) return
    const href = a.getAttribute('href') ?? ''
    if (href.length < 2 || a.hasAttribute('data-jump-native')) return
    if (!resolveTarget(href)) return
    e.preventDefault()
    const focusAttr = a.getAttribute('data-jump-focus')
    jumpTo(href, {
      timelapse: a.getAttribute('data-jump') !== 'instant',
      focus: focusAttr === 'false' ? false : focusAttr || true,
    })
  }
  document.addEventListener('click', onClick)
  cleanups.push(() => document.removeEventListener('click', onClick))

  // A runtime change of the OS motion preference reloads at the current chapter (4.7).
  const onOsMotion = () => {
    if (new URLSearchParams(location.search).get('motion') === 'reduced') return
    const url = new URL(location.href)
    url.hash = `#${useApp.getState().activeChapter}`
    location.replace(url.toString())
    if (url.pathname === location.pathname && url.search === location.search) location.reload()
  }
  osMotionQuery.addEventListener('change', onOsMotion)
  cleanups.push(() => osMotionQuery.removeEventListener('change', onOsMotion))

  // ScrollTrigger refresh after fonts and load (4.7).
  const refresh = () => ScrollTrigger.refresh()
  on('load', refresh)
  document.fonts?.ready.then(() => {
    if (mounts > 0) refresh()
  })

  // Scroll read (step 2).
  // The scroll the DOM will paint this frame: Lenis has just written it with scrollTo, so the
  // document's own value is the truth (sub-pixel snapping included), and DOM and canvas agree.
  let prevY = window.scrollY
  const readScroll = (dt: number) => {
    const s = frame.scroll
    const y = window.scrollY
    const max = lenis ? lenis.limit : root.scrollHeight - window.innerHeight
    const dy = y - prevY
    prevY = y
    s.velocity = dt > 0 ? dy / dt : 0
    s.direction = dy > 0.01 ? 1 : dy < -0.01 ? -1 : 0
    s.y = y
    s.max = Math.max(1, max)
    s.progress = Math.min(1, Math.max(0, y / s.max))
    if (Math.abs(dy) > 0.1) {
      stage.touch()
      stage.requestRender(1)
    }
  }

  // The One Clock.
  const tick = (time: number, deltaTime: number) => {
    const t0 = flags.qa ? performance.now() : 0
    const dt = Math.min(Math.max(deltaTime, 0) / 1000, MAX_DT)
    try {
      lenis?.raf(time * 1000)
    } catch (err) {
      console.error('[frame] lenis.raf threw', err)
    }
    readScroll(dt)
    // pointer velocity, damped λ 12 (4.1 frame contract)
    const p = frame.pointer
    if (!movedThisTick) {
      rawVx = 0
      rawVy = 0
    }
    movedThisTick = false
    const k = 1 - Math.exp(-12 * dt)
    p.vx += (rawVx - p.vx) * k
    p.vy += (rawVy - p.vy) * k
    updateConductor(dt)
    const t1 = flags.qa ? performance.now() : 0
    runListeners(frame.afterScroll, time, dt)
    if (flags.qa) recordTick(t1 - t0, performance.now() - t1)
    stage.beginFrame(time, dt)
    runListeners(frame.renderers, time, dt)
    stage.endFrame(time, frame.renderers.size)
  }
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)
  cleanups.push(() => gsap.ticker.remove(tick))

  cleanups.push(installStage())
  if (initConductorRef) {
    try {
      cleanups.push(initConductorRef())
    } catch (err) {
      console.error('[frame] initConductor threw', err)
    }
  }

  // QA handle (4.14).
  if (flags.qa) cleanups.push(installQaHooks())
  if (flags.still !== null) cleanups.push(installStill())
  if (process.env.NODE_ENV === 'development') cleanups.push(assertOneClock())

  stage.requestRender(2)

  return () => {
    for (let i = cleanups.length - 1; i >= 0; i--) {
      try {
        cleanups[i]()
      } catch (err) {
        console.error('[frame] cleanup threw', err)
      }
    }
    lenis?.destroy()
    lenis = null
    root.style.overflow = ''
  }
}

/** The one client provider that owns the ticker. Mounted once by Experience. */
export function SmoothScroll({ children }: { children?: ReactNode }) {
  useEffect(() => {
    mounts++
    if (mounts === 1) teardown = install()
    return () => {
      mounts--
      if (mounts === 0) {
        teardown?.()
        teardown = null
      }
    }
  }, [])

  return <>{children}</>
}

export default SmoothScroll
