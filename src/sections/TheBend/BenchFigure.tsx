'use client'

// The bend (brief 5.3, 6.3): beats from the exact scroll, the bench uniforms, ray picking and
// the readouts. Two islands share this module: BenchFigure (the diagram's hit area and the
// per-frame writer of light.bench) and BenchReadouts (the two readout slots and the hint).
// Beat and readout strings are discrete (they change on thresholds and picks), so they go
// through a tiny external store; continuous values stay in light.bench.
import { useEffect, useRef, useSyncExternalStore } from 'react'
import { Readout } from '@/components/Readout'
import { liveRect } from '@/lib/anchors'
import {
  LAYOUT_SPLIT,
  LAYOUT_STACKED,
  beatAt,
  benchCounts,
  benchUniformsAt,
  centralRay,
  pickRay,
  rayAnglesDeg,
  setBenchSlice,
  sharedTrace,
  sliceFromSlope,
  type BenchSlice,
  type BenchTier,
  type BenchTrace,
} from '@/lib/bench/trace'
import { conductor } from '@/lib/conductor'
import { fmtDeg } from '@/lib/format'
import { onAfterScroll } from '@/lib/frame'
import { gsap } from '@/lib/gsap'
import { light } from '@/lib/light-state'
import { flags, motion } from '@/lib/qa-flags'
import { stage } from '@/lib/stage'
import { useApp } from '@/lib/store'
import styles from './styles.module.css'

interface Snapshot {
  beat: 1 | 2 | 3
  /** Beat 2 values of the picked ray (true angles). */
  inDeg: string
  outDeg: string
}

const listeners = new Set<() => void>()
let snap: Snapshot = { beat: 1, inDeg: '', outDeg: '' }

function publish(next: Partial<Snapshot>): void {
  const merged = { ...snap, ...next }
  if (merged.beat === snap.beat && merged.inDeg === snap.inDeg && merged.outDeg === snap.outDeg) return
  snap = merged
  for (const fn of listeners) fn()
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

const shared = {
  slice: null as BenchSlice | null,
  requested: false,
  /** Picked ray; −1 means the central ray. */
  picked: -1,
  trace: null as BenchTrace | null,
  /** Announce the picked ray to assistive technology (keyboard picks), at most every 500 ms. */
  announce: null as ((text: string) => void) | null,
}

function liveMode(): boolean {
  const w = useApp.getState().webgl
  return motion() === 'full' && w !== 'off' && w !== 'failed'
}

function tierOf(): BenchTier {
  return useApp.getState().gpuTier === 2 ? 2 : 3
}

function requestSlice(): void {
  if (shared.requested) return
  shared.requested = true
  void (async () => {
    try {
      const { loadBaked, computeRelief } = await import('@/lib/caustics/client')
      const relief = await computeRelief(await loadBaked('aslant'))
      shared.slice = sliceFromSlope(relief.slope, relief.width, relief.height)
      setBenchSlice(shared.slice)
      stage.requestRender(2)
    } catch {
      shared.requested = false
    }
  })()
}

export interface BenchReadoutsProps {
  /** Server-computed beat 2 angles of the central ray (first paint). */
  central: { inDeg: number; outDeg: number }
  blue: string
  red: string
  zero: string
}

/** The two live readout slots (content per beat) and the beat 2 hint. */
export function BenchReadouts({ central, blue, red, zero }: BenchReadoutsProps) {
  const s = useSyncExternalStore(subscribe, () => snap, () => snap)
  const liveRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    let last = 0
    let timer = 0
    let pending = ''
    const say = () => {
      last = performance.now()
      if (liveRef.current) liveRef.current.textContent = pending
    }
    shared.announce = (text: string) => {
      pending = text
      const wait = 500 - (performance.now() - last)
      window.clearTimeout(timer)
      if (wait <= 0) say()
      else timer = window.setTimeout(say, wait)
    }
    return () => {
      shared.announce = null
      window.clearTimeout(timer)
    }
  }, [])

  const inDeg = s.inDeg || fmtDeg(central.inDeg, 2)
  const outDeg = s.outDeg || fmtDeg(central.outDeg, 2)
  let a: [string, string]
  let b: [string, string]
  if (s.beat === 3) {
    a = ['Blue, 486 nm', blue]
    b = ['Red, 656 nm', red]
  } else if (s.beat === 2) {
    a = ['Angle in', inDeg]
    b = ['Angle out', outDeg]
  } else {
    a = ['Angle in', zero]
    b = ['Angle out', zero]
  }

  return (
    <div className={`${styles.liveReadouts} ${styles.liveOnly}`}>
      <div className={styles.readouts}>
        <Readout label={a[0]} value={a[1]} minCh={7} />
        <Readout label={b[0]} value={b[1]} minCh={7} />
      </div>
      <p className={`t-caption ${styles.hint}`}>
        <span className="fine-only">Point at a ray.</span>
        <span className="coarse-only">Tap a ray.</span>
      </p>
      <p ref={liveRef} className="visually-hidden" aria-live="polite" />
    </div>
  )
}

/** The diagram: a focusable figure over the bench band, and the frame writer of light.bench. */
export function BenchFigure() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const fig = ref.current
    const section = fig?.closest('section')
    const frameEl = section?.querySelector<HTMLElement>('[data-sticky-frame]')
    if (!fig || !section || !frameEl) return

    // ── the trace for picking (shared with the bench chunk and BenchPass) ──
    const retrace = (w: number, h: number, rotated: boolean) => {
      if (!shared.slice) return null
      shared.trace = sharedTrace({
        slice: shared.slice,
        layout: rotated ? LAYOUT_STACKED : LAYOUT_SPLIT,
        w,
        h,
        tier: tierOf(),
        relief: light.bench.relief,
        fan: light.bench.fan,
        picked: light.bench.picked,
      })
      return shared.trace
    }

    const pickedIndex = () => {
      const n = benchCounts(tierOf()).rays
      return shared.picked >= 0 && shared.picked < n ? shared.picked : centralRay(n)
    }

    const readoutsFor = (i: number) => {
      const t = shared.trace
      if (!t) return null
      const r = rayAnglesDeg(t.alpha[i] ?? 0)
      return { inDeg: fmtDeg(r.inDeg, 2), outDeg: fmtDeg(r.outDeg, 2) }
    }

    // the slice is cheap (the relief job is shared with the loupe): ask for it soon after mount
    const early = window.setTimeout(() => {
      if (liveMode()) requestSlice()
    }, flags.still ? 0 : 1200)

    // ── per frame (afterScroll: writes only) ──
    let beat: 1 | 2 | 3 = 1
    const off = onAfterScroll(() => {
      const weight = conductor.weights['the-bend'] ?? 0
      // The scale note and the wall caption label the diagram, so they leave with it: once the
      // bench mode starts to hand over (weight < 0.9), they fade out (240 ms, opacity only)
      // instead of sitting over the next view or under the bright ray ends of a sliding bench.
      const labels = !liveMode() ? undefined : weight >= 0.9 ? 'on' : 'off'
      if (frameEl.dataset.labels !== labels) {
        if (labels) frameEl.dataset.labels = labels
        else delete frameEl.dataset.labels
      }
      const exact = conductor.exact.id === 'the-bend' || (conductor.exact.id === 'clear-glass' && conductor.exact.blend > 0)
      if (weight <= 0 && !exact) return
      if (!shared.slice && liveMode()) requestSlice()
      // the bench still (?still=the-bend) is the beat 3 view: full relief, the fan open (6.3)
      const p = flags.still === 'the-bend' ? 1 : conductor.sectionProgress('the-bend')
      const nb = beatAt(p)
      if (nb !== beat) {
        beat = nb
        frameEl.dataset.beat = String(nb)
        publish({ beat: nb })
      }
      const u = benchUniformsAt(p)
      const rotated = conductor.composition === 'stacked'
      const picked = pickedIndex()
      const b = light.bench
      if (b.relief !== u.relief || b.fan !== u.fan || b.picked !== picked || b.rotated !== (rotated ? 1 : 0)) {
        b.relief = u.relief
        b.fan = u.fan
        b.picked = picked
        b.rotated = rotated ? 1 : 0
        stage.requestRender(1)
      }
      const r = liveRect('the-bend')
      if (r && retrace(r.width, r.height, rotated)) {
        const v = readoutsFor(picked)
        if (v) publish(v)
      }
    })

    // ── picking: hover (fine), tap (coarse), arrows (keyboard) ──
    const pickAt = (clientX: number, clientY: number) => {
      const r = liveRect('the-bend')
      const t = shared.trace
      if (!r || !t) return
      const i = pickRay(t, clientX - r.x, clientY - r.y, 24)
      if (i >= 0 && i !== shared.picked) {
        shared.picked = i
        stage.touch()
        stage.requestRender(1)
      }
    }
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' || (e.pointerType === 'pen' && fine.matches)) pickAt(e.clientX, e.clientY)
    }
    const onClick = (e: MouseEvent) => pickAt(e.clientX, e.clientY)
    const onKey = (e: KeyboardEvent) => {
      const n = benchCounts(tierOf()).rays
      const cur = pickedIndex()
      let next = cur
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = Math.max(0, cur - 1)
      else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = Math.min(n - 1, cur + 1)
      else if (e.key === 'Home') next = 0
      else if (e.key === 'End') next = n - 1
      else return
      e.preventDefault()
      if (next === cur) return
      shared.picked = next
      stage.touch()
      stage.requestRender(1)
      const t = shared.trace
      if (t) {
        const r = rayAnglesDeg(t.alpha[next] ?? 0)
        shared.announce?.(`Angle in ${fmtDeg(r.inDeg, 2)}. Angle out ${fmtDeg(r.outDeg, 2)}.`)
      }
    }
    fig.addEventListener('pointermove', onMove)
    fig.addEventListener('click', onClick)
    fig.addEventListener('keydown', onKey)

    // ── zoom and small screens: fall back to the static stack when the text overflows its band ──
    // (measured only in the live layout; a window resize clears the fallback and measures again)
    const band = frameEl.querySelector<HTMLElement>('[data-bench-text]')
    // Measure only with the real fonts: fallback metrics during a slow font load can overshoot
    // the band's few px of slack, and the fallback would then stick until a window resize.
    let fontsReady = document.fonts?.status === 'loaded'
    const check = () => {
      if (!band || !fontsReady || !liveMode() || section.dataset.overflow !== undefined) return
      const split = window.matchMedia('(min-width: 1024px) and (min-aspect-ratio: 9 / 10)').matches
      const limit = split ? frameEl.clientHeight * 0.42 : frameEl.clientHeight - 8
      if (band.offsetTop + band.offsetHeight > limit) {
        section.dataset.overflow = ''
        conductor.measure()
      }
    }
    let alive = true
    if (!fontsReady) {
      void document.fonts.ready.then(() => {
        if (!alive) return
        fontsReady = true
        check()
      })
    }
    const ro = new ResizeObserver(check)
    if (band) ro.observe(band)
    ro.observe(frameEl)
    const onResize = () => {
      if (section.dataset.overflow === undefined) return
      delete section.dataset.overflow
      conductor.measure()
    }
    window.addEventListener('resize', onResize)

    // ── the heading's plain fade (4.8.3), once at top 80% ──
    const h2 = section.querySelector<HTMLElement>('h2')
    let ctx: gsap.Context | null = null
    if (h2 && motion() === 'full') {
      ctx = gsap.context(() => {
        gsap.fromTo(
          h2,
          { opacity: 0 },
          { opacity: 1, duration: 0.4, ease: 'focus', scrollTrigger: { trigger: h2, start: 'top 80%', once: true } },
        )
      })
    }

    return () => {
      alive = false
      off()
      window.clearTimeout(early)
      fig.removeEventListener('pointermove', onMove)
      fig.removeEventListener('click', onClick)
      fig.removeEventListener('keydown', onKey)
      ro.disconnect()
      window.removeEventListener('resize', onResize)
      ctx?.revert()
    }
  }, [])

  return (
    <figure
      ref={ref}
      className={`${styles.figure} ${styles.liveOnly}`}
      tabIndex={0}
      aria-label="Optical bench. Use the left and right arrow keys to choose a ray."
    />
  )
}
