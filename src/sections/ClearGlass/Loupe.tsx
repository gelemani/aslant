'use client'

// The loupe (brief 5.2, 6.2): a schlieren instrument over the pane. Two islands share this
// module: LoupeControls (toggle, caption, readouts, and the per-frame writer of light.pane
// and light.loupe) and LoupeDisc (the touch proxy disc over the glass). Continuous values
// never pass through React state; only the discrete "loupe active" and "relief shown" do.
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Readout } from '@/components/Readout'
import { liveRect } from '@/lib/anchors'
import { conductor } from '@/lib/conductor'
import { fmtDeg } from '@/lib/format'
import { frame, onAfterScroll } from '@/lib/frame'
import { light } from '@/lib/light-state'
import { GLASS } from '@/lib/light/glass'
import { flags, motion } from '@/lib/qa-flags'
import { stage, tweenLight } from '@/lib/stage'
import { useApp } from '@/lib/store'
import styles from './styles.module.css'

/** Loupe radius on a fine pointer, and the touch disc's radius (the disc is 160 px). */
const R_FINE = 110
const R_DISC = 80
const FIELD_W = 256
const FIELD_H = 128
const KNIFE_LAMBDA = 6
const DEG = 180 / Math.PI

type Tween = ReturnType<typeof tweenLight>

const shared = {
  /** CPU copy of the slope field (RGBA per cell: slope x, y, high-passed x, y), once computed. */
  field: null as Float32Array | null,
  maxSlopeDeg: NaN,
  maxTurnDeg: NaN,
  /** Touch disc centre, glass-relative (0..1). */
  disc: { u: 0.5, v: 0.5 },
  discMounted: false,
  reliefRequested: false,
}

/** Bilinear sample of the slope magnitude |α| (radians) at glass uv. */
function slopeAt(u: number, v: number): number {
  const f = shared.field
  if (!f) return 0
  const x = Math.min(FIELD_W - 1, Math.max(0, u * FIELD_W - 0.5))
  const y = Math.min(FIELD_H - 1, Math.max(0, v * FIELD_H - 0.5))
  const x0 = Math.floor(x)
  const y0 = Math.floor(y)
  const x1 = Math.min(FIELD_W - 1, x0 + 1)
  const y1 = Math.min(FIELD_H - 1, y0 + 1)
  const tx = x - x0
  const ty = y - y0
  const at = (cx: number, cy: number, ch: number) => f[4 * (cy * FIELD_W + cx) + ch]
  const lerp2 = (ch: number) =>
    (at(x0, y0, ch) * (1 - tx) + at(x1, y0, ch) * tx) * (1 - ty) + (at(x0, y1, ch) * (1 - tx) + at(x1, y1, ch) * tx) * ty
  return Math.hypot(lerp2(0), lerp2(1))
}

/** "Light turns": the deviation at the exit face, asin(n · sin α) − α (Clear). */
function turnOf(alpha: number): number {
  const s = GLASS.clear.nd * Math.sin(alpha)
  return Math.asin(Math.min(1, s)) - alpha
}

function liveMode(): boolean {
  const w = useApp.getState().webgl
  return motion() === 'full' && w !== 'off' && w !== 'failed'
}

/** Fetches the baked word, computes its relief in the worker, hands it to the stage (once). */
function requestRelief(): void {
  if (shared.reliefRequested) return
  shared.reliefRequested = true
  void (async () => {
    try {
      const [{ loadBaked, computeRelief }, { stageApi }] = await Promise.all([
        import('@/lib/caustics/client'),
        import('@/webgl/stage-api'),
      ])
      const relief = await computeRelief(await loadBaked('aslant'))
      shared.field = relief.slope
      shared.maxSlopeDeg = relief.maxSlopeDeg
      shared.maxTurnDeg = relief.maxTurnDeg
      stageApi.setSlopeField(relief)
      stage.requestRender(2)
    } catch {
      shared.reliefRequested = false
    }
  })()
}

export interface LoupeControlsProps {
  /** Pane maxima computed on the server from the same relief (SSR, no JS, first paint). */
  maxSlope: string
  maxTurn: string
  /** The hint, placed after the toggle in the stacked layout. */
  hint: ReactNode
}

export function LoupeControls({ maxSlope, maxTurn, hint }: LoupeControlsProps) {
  const [active, setActive] = useState(false)
  const [relief, setRelief] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const aRef = useRef<HTMLSpanElement>(null)
  const bRef = useRef<HTMLSpanElement>(null)
  const reliefTween = useRef<Tween | null>(null)

  // Frame writer: light.pane, light.loupe and the readouts (afterScroll: writes only).
  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    let isActive = false
    let iris: Tween | null = null
    let lastA = ''
    let lastB = ''
    let lastX = NaN
    let lastY = NaN

    const setIris = (on: boolean, r: number) => {
      iris?.kill()
      iris = tweenLight(light.loupe, on ? { r, duration: 0.3, ease: 'focus' } : { r: 0, duration: 0.18, ease: 'defocus' })
    }

    const write = (a: string, b: string) => {
      if (a !== lastA && aRef.current) aRef.current.textContent = lastA = a
      if (b !== lastB && bRef.current) bRef.current.textContent = lastB = b
    }

    const off = onAfterScroll((_t, dt) => {
      const weight = conductor.weights['clear-glass'] ?? 0
      const r = liveRect('clear-glass')
      if (r && weight > 0) {
        const p = light.pane
        p.x = r.x
        p.y = r.y
        p.w = r.width
        p.h = r.height
      }
      if (!r || !liveMode()) {
        if (isActive) {
          isActive = false
          setActive(false)
          setIris(false, 0)
        }
        return
      }

      // where the loupe is, if anywhere
      let want = false
      let x = light.loupe.x
      let y = light.loupe.y
      let radius = R_FINE
      const inView = weight > 0.5 && conductor.exact.id === 'clear-glass'
      if (inView && fine.matches) {
        const pt = frame.pointer
        want = pt.inside && pt.x >= r.x && pt.x <= r.x + r.width && pt.y >= r.y && pt.y <= r.y + r.height
        if (want) {
          x = pt.x
          y = pt.y
        }
      } else if (inView && shared.discMounted) {
        want = true
        radius = R_DISC
        x = r.x + shared.disc.u * r.width
        y = r.y + shared.disc.v * r.height
      }
      if (want) {
        light.loupe.x = x
        light.loupe.y = y
        // knife-edge direction follows the pointer's velocity direction, damped (λ 6)
        const vx = frame.pointer.vx
        const vy = frame.pointer.vy
        const sp = Math.hypot(vx, vy)
        if (sp > 40 && fine.matches) {
          const k = 1 - Math.exp(-KNIFE_LAMBDA * dt)
          let kx = light.loupe.knifeX + (vx / sp - light.loupe.knifeX) * k
          let ky = light.loupe.knifeY + (vy / sp - light.loupe.knifeY) * k
          const n = Math.hypot(kx, ky)
          if (n > 1e-3) {
            kx /= n
            ky /= n
            light.loupe.knifeX = kx
            light.loupe.knifeY = ky
          }
        }
        if (x !== lastX || y !== lastY) {
          lastX = x
          lastY = y
          stage.requestRender(1)
        }
      }
      if (want !== isActive) {
        isActive = want
        setActive(want)
        setIris(want, radius)
      }

      if (isActive && shared.field) {
        const alpha = slopeAt((x - r.x) / r.width, (y - r.y) / r.height)
        write(fmtDeg(alpha * DEG, 2), fmtDeg(turnOf(alpha) * DEG, 2))
      } else if (!isActive) {
        write(
          Number.isFinite(shared.maxSlopeDeg) ? fmtDeg(shared.maxSlopeDeg, 2) : maxSlope,
          Number.isFinite(shared.maxTurnDeg) ? fmtDeg(shared.maxTurnDeg, 2) : maxTurn,
        )
      }
    })

    return () => {
      off()
      iris?.kill()
    }
  }, [maxSlope, maxTurn])

  // Compute the relief when the chapter comes near (live mode only). The relief still
  // (?still=clear-glass, the source of relief.webp) shows the whole pane in schlieren (6.2).
  useEffect(() => {
    if (flags.still === 'clear-glass') {
      light.loupe.relief = 1
      requestRelief()
      return
    }
    const section = rootRef.current?.closest('section')
    if (!section || shared.field) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && liveMode()) {
          requestRelief()
          io.disconnect()
        }
      },
      { rootMargin: '100% 0px' },
    )
    io.observe(section)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    return () => {
      reliefTween.current?.kill()
    }
  }, [])

  const toggle = () => {
    const next = !relief
    setRelief(next)
    reliefTween.current?.kill()
    reliefTween.current = tweenLight(light.loupe, { relief: next ? 1 : 0, duration: 0.4, ease: 'focus' })
  }

  return (
    <div ref={rootRef} className={styles.controls}>
      <button
        type="button"
        className={`t-ui ${styles.toggle} ${styles.liveOnly}`}
        aria-pressed={relief}
        aria-controls="clear-glass-caption"
        onClick={toggle}
      >
        {relief ? 'Hide the relief' : 'Show the relief'}
      </button>
      {hint}
      <p id="clear-glass-caption" className={`t-caption ${styles.caption} ${styles.liveOnly}`} aria-live="polite" data-shown={relief ? '' : undefined}>
        {relief ? 'One broad fold per letter. The letters themselves never appear.' : ''}
      </p>
      <p className={`t-caption ${styles.caption} ${styles.staticOnly}`} data-shown="">
        One broad fold per letter. The letters themselves never appear.
      </p>
      <div className={styles.readouts}>
        <Readout ref={aRef} label={active ? 'Surface slope' : 'Steepest slope'} value={maxSlope} minCh={6} />
        <Readout ref={bRef} label={active ? 'Light turns' : 'Largest turn'} value={maxTurn} minCh={6} />
      </div>
    </div>
  )
}

/** The touch proxy disc (coarse pointers): the only element with touch-action: none. */
export function LoupeDisc() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const coarse = !window.matchMedia('(hover: hover) and (pointer: fine)').matches
    shared.discMounted = coarse
    let dragging = -1
    let startX = 0
    let startY = 0
    let startU = 0.5
    let startV = 0.5
    const place = () => {
      el.style.left = `${shared.disc.u * 100}%`
      el.style.top = `${shared.disc.v * 100}%`
    }
    place()
    const down = (e: PointerEvent) => {
      dragging = e.pointerId
      el.setPointerCapture(e.pointerId)
      startX = e.clientX
      startY = e.clientY
      startU = shared.disc.u
      startV = shared.disc.v
      el.dataset.dragging = ''
      stage.touch()
    }
    const move = (e: PointerEvent) => {
      if (e.pointerId !== dragging) return
      const r = liveRect('clear-glass')
      if (!r || r.width < 1 || r.height < 1) return
      const mu = Math.min(0.5, R_DISC / r.width)
      const mv = Math.min(0.5, R_DISC / r.height)
      shared.disc.u = Math.min(1 - mu, Math.max(mu, startU + (e.clientX - startX) / r.width))
      shared.disc.v = Math.min(1 - mv, Math.max(mv, startV + (e.clientY - startY) / r.height))
      place()
      stage.touch()
      stage.requestRender(1)
    }
    const up = (e: PointerEvent) => {
      if (e.pointerId !== dragging) return
      dragging = -1
      delete el.dataset.dragging
    }
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    return () => {
      shared.discMounted = false
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
    }
  }, [])

  return <div ref={ref} className={`${styles.disc} ${styles.liveOnly} coarse-only`} aria-hidden="true" />
}
