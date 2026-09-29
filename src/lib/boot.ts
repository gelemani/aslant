// Real preloading progress for the dawn loader (brief 4.4, 7.3). No numbers are ever shown.
// Weights: fonts 0.2 (watched here: document.fonts.ready and WP3's rasterReady()), light 0.4 (WP3's loadBaked('aslant')),
// shaders 0.3 (WP4 after compileAsync of every pass), frame 0.1 (WP4 after the first frame).
// With WebGL off or failed, light, shaders and frame count as done immediately.
import { useApp } from '@/lib/store'
import { rasterReady } from '@/lib/caustics/raster'

export type BootKey = 'fonts' | 'light' | 'shaders' | 'frame'

export const BOOT_WEIGHTS: Readonly<Record<BootKey, number>> = { fonts: 0.2, light: 0.4, shaders: 0.3, frame: 0.1 }

type BootFn = (progress: number, parts: Readonly<Record<BootKey, number>>) => void

const parts: Record<BootKey, number> = { fonts: 0, light: 0, shaders: 0, frame: 0 }
const subs = new Set<BootFn>()
let progress = 0

function compute(): number {
  let p = 0
  for (const k of Object.keys(BOOT_WEIGHTS) as BootKey[]) p += BOOT_WEIGHTS[k] * parts[k]
  return Math.min(1, Math.round(p * 1e6) / 1e6)
}

function emit() {
  const snapshot = Object.freeze({ ...parts })
  for (const fn of subs) {
    try {
      fn(progress, snapshot)
    } catch (err) {
      console.error('[boot] subscriber threw', err)
    }
  }
}

function report(key: BootKey, value: number): void {
  const v = Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0))
  if (v <= parts[key]) return // monotonic
  parts[key] = v
  const next = compute()
  if (next === progress) return
  progress = next
  emit()
}

export const boot = {
  /** 0..1, monotonic per key. */
  report,
  /** Called immediately with the current state, then on every change. */
  subscribe(fn: BootFn): () => void {
    subs.add(fn)
    try {
      fn(progress, Object.freeze({ ...parts }))
    } catch (err) {
      console.error('[boot] subscriber threw', err)
    }
    return () => {
      subs.delete(fn)
    }
  },
  get progress(): number {
    return progress
  },
  get parts(): Readonly<Record<BootKey, number>> {
    return parts
  },
  /** Counts `p` toward the fonts part (e.g. WP3's rasterReady()); fonts completes when all resolve. */
  waitForFonts(p: Promise<unknown>): void {
    fontWaits.push(p.catch(() => undefined))
    watchFonts()
  },
}

// ── self-watching (client only, once) ──
const fontWaits: Promise<unknown>[] = []
let fontsGen = 0

function watchFonts() {
  if (typeof document === 'undefined') return
  const gen = ++fontsGen
  const all: Promise<unknown>[] = [
    document.fonts ? document.fonts.ready : Promise.resolve(),
    rasterReady().catch(() => undefined),
    ...fontWaits,
  ]
  report('fonts', 0.25)
  Promise.all(all).then(() => {
    if (gen === fontsGen) report('fonts', 1)
  })
  // Failsafe: never hold the loader on a font that never settles.
  setTimeout(() => {
    if (gen === fontsGen) report('fonts', 1)
  }, 4000)
}

function completeWithoutWebgl(status: string) {
  if (status === 'off' || status === 'failed') {
    report('light', 1)
    report('shaders', 1)
    report('frame', 1)
  }
}

if (typeof window !== 'undefined') {
  watchFonts()
  completeWithoutWebgl(useApp.getState().webgl)
  useApp.subscribe((s, prev) => {
    if (s.webgl !== prev.webgl) completeWithoutWebgl(s.webgl)
  })
}
