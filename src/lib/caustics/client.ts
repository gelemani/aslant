// The main-thread face of the light transport (brief 7.3, 6.1.1, 6.4).
//   loadBaked('aslant' | 'ingrid')  fetch + decode public/light/<id>.bin (reports boot 'light' for aslant)
//   computeWord(word, opts)         raster here, sliced OT in the worker, frames streamed every 8 iterations
//   computeRelief(t)                slope field, maxima and depth from a transport (worker)
//   origins(n)                      R2 ray origins, lower-light space, cached
//   rasterWord, wordFace, rasterReady (raster.ts)
// One worker per page (module-level guard; a dev hot reload terminates the previous one).
// A newer computeWord supersedes the running one: the older promise rejects with an AbortError.

import type { Relief, Transport } from '@/webgl/stage-api'
import { boot } from '@/lib/boot'
import { flags } from '@/lib/qa-flags'
import { light } from '@/lib/light-state'
import { stage } from '@/lib/stage'
import { useApp } from '@/lib/store'
import { decodeBin } from './bin-format'
import { r2Origins } from './r2'
import { lastRasterInfo, rasterReady, rasterWord, wordFace } from './raster'
import { SOT_SEED } from './sliced-ot'

export { rasterReady, rasterWord, wordFace }
export type { WordFace } from './raster'

/** Relief plus the height field (128 × 64 mm, rows top to bottom) for the contour map. */
export interface ReliefResult extends Relief {
  heightMm: Float32Array
  heightWidth: 128
  heightHeight: 64
  paneMm: { w: number; h: number }
}

export const STREAM_EVERY = 8
export const BAKED_N = 65536
export const LIVE_N = 32768
export const LIVE_ITERS = 96
const BAKED_WORD: Readonly<Record<'aslant' | 'ingrid', string>> = { aslant: 'aslant', ingrid: 'Ingrid' }

/** R2 origins 1 … n (x, y interleaved), lower-light space; shared, do not mutate. */
export function origins(n: number): Float32Array {
  return r2Origins(n)
}

function abortError(): DOMException {
  return new DOMException('The transport job was superseded or aborted.', 'AbortError')
}

// ── worker ────────────────────────────────────────────────────────────────────
interface FrameMsg { type: 'frame'; jobId: number; iter: number; targets: Float32Array; density: Float32Array }
interface DoneMsg { type: 'done'; jobId: number; targets: Float32Array; density: Float32Array; iters: number; ms: number }
interface ReliefMsg extends ReliefResult { type: 'relief'; jobId: number }
interface ErrorMsg { type: 'error'; jobId: number; message: string }
type OutMsg = FrameMsg | DoneMsg | ReliefMsg | ErrorMsg

interface Pending {
  onMessage(msg: OutMsg): void
  fail(err: unknown): void
}

const pending = new Map<number, Pending>()
let worker: Worker | null = null
let jobSeq = 0
const G = globalThis as { __aslantTransportWorker?: Worker }

function getWorker(): Worker {
  if (worker) return worker
  // A previous copy of this module (dev hot reload) may have left its worker running.
  G.__aslantTransportWorker?.terminate()
  const w = new Worker(new URL('./transport.worker.ts', import.meta.url), { type: 'module' })
  w.onmessage = (e: MessageEvent<OutMsg>) => {
    const msg = e.data
    pending.get(msg.jobId)?.onMessage(msg)
  }
  w.onerror = (e: ErrorEvent) => {
    const err = new Error(`transport worker: ${e.message || 'failed'}`)
    for (const p of Array.from(pending.values())) p.fail(err)
    pending.clear()
    w.terminate()
    if (worker === w) worker = null
  }
  worker = w
  G.__aslantTransportWorker = w
  return w
}

let warmed = false

/**
 * Starts the worker early (off the main thread it precomputes the Hilbert order and warms its JIT)
 * and, once the hero intro has finished and the page is idle, draws one throwaway raster: a face's
 * first canvas use costs 20 to 100 ms of main thread (glyph caches), which would otherwise land on
 * the visitor's first keystroke, or on the hero formation if it ran at load. Idempotent.
 */
export function warmTransport(): void {
  if (typeof window === 'undefined' || warmed) return
  warmed = true
  try {
    getWorker()
  } catch {
    // computeWord reports the failure when it is actually needed.
  }
  const idle: (cb: () => void) => void =
    typeof window.requestIdleCallback === 'function' ? (cb) => window.requestIdleCallback(cb, { timeout: 2000 }) : (cb) => setTimeout(cb, 300)
  let done = false
  const warmRaster = () => {
    if (done) return
    done = true
    unsubscribe()
    clearTimeout(failsafe)
    idle(() => {
      rasterWord('Ingrid').catch(() => undefined)
    })
  }
  const unsubscribe = useApp.subscribe((s) => {
    if (s.introDone) warmRaster()
  })
  const failsafe = setTimeout(warmRaster, 9000)
  if (useApp.getState().introDone) warmRaster()
}

// ── computeWord ───────────────────────────────────────────────────────────────
let active: { jobId: number; cancel: () => void } | null = null

/**
 * Computes a word live. Frames stream every 8 iterations through onFrame; the promise resolves with
 * the final transport. `pace` (ms, optional, additive to 7.3) spaces delivered frames at least that far
 * apart and resolves after the last one, so the convergence stays watchable on fast machines
 * (the raw job takes about 0.1 s at 32,768 × 96 on an M2); the first frame is never delayed.
 */
export function computeWord(
  word: string,
  opts: { n: 32768 | 65536; iters: number; onFrame?: (t: Transport, iter: number) => void; signal?: AbortSignal; pace?: number },
): Promise<Transport> {
  const text = word.normalize('NFC')
  const jobId = ++jobSeq
  // Supersede the running job: its promise rejects, the worker stops it within one chunk.
  active?.cancel()
  return new Promise<Transport>((resolve, reject) => {
    type Item = { t: Transport; iter: number; final: boolean }
    const pace = Math.max(0, opts.pace ?? 0)
    const queue: Item[] = []
    let timer: ReturnType<typeof setTimeout> | null = null
    let lastOut = -Infinity
    let frames = 0
    let settled = false

    const finish = () => {
      settled = true
      pending.delete(jobId)
      queue.length = 0
      if (timer) clearTimeout(timer)
      timer = null
      opts.signal?.removeEventListener('abort', cancel)
      if (active?.jobId === jobId) active = null
    }
    function cancel() {
      if (settled) return
      finish()
      try {
        worker?.postMessage({ type: 'cancel', jobId })
      } catch {
        // the worker is already gone
      }
      reject(abortError())
    }
    const fail = (err: unknown) => {
      if (settled) return
      finish()
      reject(err)
    }
    if (opts.signal?.aborted) {
      reject(abortError())
      return
    }
    opts.signal?.addEventListener('abort', cancel)
    active = { jobId, cancel }

    // Delivery, optionally paced: frames and then the final transport leave the queue in order.
    const deliver = (item: Item) => {
      lastOut = performance.now()
      stage.touch()
      if (item.final) {
        performance.mark('aslant:transport:done', { detail: { jobId } })
        finish()
        resolve(item.t)
        return
      }
      frames++
      if (frames === 1) performance.mark('aslant:transport:first-frame', { detail: { jobId, iter: item.iter } })
      try {
        opts.onFrame?.(item.t, item.iter)
      } catch (err) {
        console.error('[transport] onFrame threw', err)
      }
    }
    const pump = () => {
      timer = null
      while (!settled && queue.length) {
        const wait = pace - (performance.now() - lastOut)
        if (wait > 0) {
          timer = setTimeout(pump, wait)
          return
        }
        deliver(queue.shift() as Item)
      }
    }
    const enqueue = (item: Item) => {
      queue.push(item)
      if (!timer) pump()
    }

    pending.set(jobId, {
      onMessage(msg) {
        if (settled) return
        if (msg.type === 'frame') {
          enqueue({ t: { id: text, n: opts.n, targets: msg.targets, density: msg.density, iters: msg.iter }, iter: msg.iter, final: false })
        } else if (msg.type === 'done') {
          enqueue({ t: { id: text, n: opts.n, targets: msg.targets, density: msg.density, iters: msg.iters }, iter: msg.iters, final: true })
        } else if (msg.type === 'error') {
          fail(new Error(msg.message))
        }
      },
      fail,
    })

    rasterWord(text).then(
      (raster) => {
        if (settled) return
        let w: Worker
        try {
          w = getWorker()
        } catch (err) {
          fail(err)
          return
        }
        performance.mark('aslant:transport:post', { detail: { jobId, word: text, raster: lastRasterInfo() } })
        w.postMessage({ type: 'compute', jobId, raster, n: opts.n, iters: opts.iters, streamEvery: STREAM_EVERY, seed: SOT_SEED }, [raster.buffer])
      },
      (err: unknown) => fail(err),
    )
  })
}

// ── computeRelief ─────────────────────────────────────────────────────────────
const reliefCache = new WeakMap<Transport, Promise<ReliefResult>>()

export function computeRelief(t: Transport): Promise<ReliefResult> {
  const hit = reliefCache.get(t)
  if (hit) return hit
  const jobId = ++jobSeq
  const p = new Promise<ReliefResult>((resolve, reject) => {
    pending.set(jobId, {
      onMessage(msg) {
        pending.delete(jobId)
        if (msg.type === 'relief') {
          const { slope, width, height, maxSlopeDeg, maxTurnDeg, depthMm, heightMm, heightWidth, heightHeight, paneMm } = msg
          resolve({ slope, width, height, maxSlopeDeg, maxTurnDeg, depthMm, heightMm, heightWidth, heightHeight, paneMm })
        } else if (msg.type === 'error') {
          reject(new Error(msg.message))
        }
      },
      fail(err) {
        pending.delete(jobId)
        reject(err)
      },
    })
    try {
      // Structured clone (a copy): the caller keeps using the transport's targets.
      getWorker().postMessage({ type: 'relief', jobId, targets: t.targets, n: t.n })
    } catch (err) {
      pending.delete(jobId)
      reject(err)
    }
  })
  reliefCache.set(t, p)
  p.catch(() => reliefCache.delete(t))
  return p
}

// ── loadBaked ─────────────────────────────────────────────────────────────────
const baked = new Map<'aslant' | 'ingrid', Promise<Transport>>()

type EarlyWindow = { __aslantBin?: Promise<Response> }

async function fetchBin(id: 'aslant' | 'ingrid', report: ((v: number) => void) | null): Promise<ArrayBuffer> {
  // The head script starts aslant.bin before first paint (window.__aslantBin, WP1; WebKit never hands a
  // <link rel=preload as=fetch> to a later fetch). A Response body reads once: take it and delete it.
  const w = typeof window === 'undefined' ? undefined : (window as unknown as EarlyWindow)
  const early = id === 'aslant' ? w?.__aslantBin : undefined
  if (early && w) delete w.__aslantBin
  let res: Response | null = early ? await early.catch(() => null) : null
  if (!res || !res.ok) res = await fetch(`/light/${id}.bin`)
  if (!res.ok) throw new Error(`light data: HTTP ${res.status}`)
  const total = Number(res.headers.get('content-length')) || 32 + 5 * BAKED_N
  if (!report || !res.body) return res.arrayBuffer()
  const reader = res.body.getReader()
  const chunks: Uint8Array[] = []
  let got = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    got += value.byteLength
    report(0.9 * Math.min(1, got / total))
  }
  const out = new Uint8Array(got)
  let at = 0
  for (const c of chunks) {
    out.set(c, at)
    at += c.byteLength
  }
  return out.buffer
}

/**
 * Ingrid is not part of the initial transfer (9.1: aslant only; 6.1.1: "after the first frame"). Its
 * fetch waits until the hero's intro has settled (3 s after navigation, then an idle slot) or the
 * visitor scrolls (the conductor leaves the hero), whichever comes first; ?still routes load it at
 * once. The arbiter's fallback covers a visitor who reaches the appointment before it arrives.
 */
function ingridGate(): Promise<void> {
  if (typeof window === 'undefined' || flags.still) return Promise.resolve()
  return new Promise((resolve) => {
    let done = false
    const finish = () => {
      if (done) return
      done = true
      window.clearInterval(poll)
      resolve()
    }
    const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback
    let idleAsked = false
    const check = () => {
      if (light.chapterFloat >= 0.6) return finish()
      if (!idleAsked && performance.now() >= 3000) {
        idleAsked = true
        if (ric) ric(finish, { timeout: 1200 })
        else window.setTimeout(finish, 300)
      }
    }
    const poll = window.setInterval(check, 250)
    check()
  })
}

export function loadBaked(id: 'aslant' | 'ingrid'): Promise<Transport> {
  const hit = baked.get(id)
  if (hit) return hit
  const report = id === 'aslant' ? (v: number) => boot.report('light', v) : null
  const p = (async (): Promise<Transport> => {
    if (id === 'ingrid') await ingridGate()
    try {
      const d = decodeBin(await fetchBin(id, report))
      report?.(1)
      return { id, n: d.n, targets: d.targets, density: d.density, iters: d.iters }
    } catch (err) {
      // 6.1.1: if the file fails, compute the word at 65,536 × 256 with the same face.
      console.warn(`[transport] ${id}.bin failed, computing it`, err)
      await rasterReady().catch(() => undefined)
      const t = await computeWord(BAKED_WORD[id], {
        n: BAKED_N,
        iters: 256,
        onFrame: report ? (_t, iter) => report(0.9 * (iter / 256)) : undefined,
      })
      report?.(1)
      return { ...t, id }
    }
  })()
  baked.set(id, p)
  p.catch(() => baked.delete(id))
  return p
}

// QA hook (?qa, always on in development): window.__aslantTransport for latency and face checks.
if (typeof window !== 'undefined' && flags.qa) {
  ;(window as unknown as { __aslantTransport?: object }).__aslantTransport = {
    loadBaked, computeWord, computeRelief, origins, rasterWord, wordFace, rasterReady, warmTransport, lastRasterInfo,
  }
}
