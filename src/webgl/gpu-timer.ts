// Frame time that must stay true (brief 4.1). Wraps one rendered frame with
// EXT_disjoint_timer_query_webgl2 when the extension exists (frameSource 'gpu'),
// otherwise measures the CPU time of the call (frameSource 'cpu'), and reports
// through stage.recordFrame(ms, source) in the same tick, so the governor and every
// on-page frame-time line read one value.
//
// GPU results arrive one to three frames late; each tick reports the latest resolved
// GPU time. Until the first result resolves (and after a disjoint event) it reports CPU.
//
// Usage (WP4's Stage renderer):
//   const timer = createGpuTimer(gl.getContext())
//   ...inside the registered renderer: timer.measure(() => advance(t, true, state))
//   ...cleanup: timer.dispose()
import { stage } from '@/lib/stage'

type TimerExt = { TIME_ELAPSED_EXT: number; GPU_DISJOINT_EXT: number }

export interface GpuTimer {
  /** True when EXT_disjoint_timer_query_webgl2 is available on this context. */
  readonly supported: boolean
  /** Runs `fn`, times it, and reports the frame through stage.recordFrame. Returns fn's result. */
  measure<T>(fn: () => T): T
  /** Latest reported frame time (ms) and its source. */
  readonly last: { ms: number; source: 'gpu' | 'cpu' }
  /** Deletes pending queries. Safe to call twice. */
  dispose(): void
}

const MAX_PENDING = 4

export function createGpuTimer(ctx: WebGL2RenderingContext | WebGLRenderingContext | null | undefined): GpuTimer {
  const gl2 =
    ctx && typeof WebGL2RenderingContext !== 'undefined' && ctx instanceof WebGL2RenderingContext ? ctx : null
  let ext: TimerExt | null = null
  try {
    ext = gl2 ? (gl2.getExtension('EXT_disjoint_timer_query_webgl2') as TimerExt | null) : null
  } catch {
    ext = null
  }
  const pending: WebGLQuery[] = []
  let gpuMs = -1
  let gpuAt = 0
  let disposed = false
  const last = { ms: 0, source: 'cpu' as 'gpu' | 'cpu' }

  function drain() {
    if (!gl2 || !ext) return
    // A disjoint event invalidates every query in flight.
    if (gl2.getParameter(ext.GPU_DISJOINT_EXT)) {
      for (const q of pending) gl2.deleteQuery(q)
      pending.length = 0
      gpuMs = -1
      return
    }
    while (pending.length) {
      const q = pending[0]
      if (!gl2.getQueryParameter(q, gl2.QUERY_RESULT_AVAILABLE)) break
      const ns = gl2.getQueryParameter(q, gl2.QUERY_RESULT) as number
      gl2.deleteQuery(q)
      pending.shift()
      if (Number.isFinite(ns) && ns > 0) {
        gpuMs = ns / 1e6
        gpuAt = performance.now()
      }
    }
  }

  function measure<T>(fn: () => T): T {
    const t0 = performance.now()
    let query: WebGLQuery | null = null
    if (gl2 && ext && !disposed) {
      try {
        drain()
      } catch {
        /* context lost */
      }
    }
    if (gl2 && ext && !disposed && pending.length < MAX_PENDING) {
      try {
        query = gl2.createQuery()
        if (query) gl2.beginQuery(ext.TIME_ELAPSED_EXT, query)
      } catch {
        query = null
      }
    }
    let result: T
    try {
      result = fn()
    } finally {
      if (query && gl2 && ext) {
        try {
          gl2.endQuery(ext.TIME_ELAPSED_EXT)
          pending.push(query)
        } catch {
          gl2.deleteQuery(query)
        }
      }
      const cpuMs = performance.now() - t0
      // A GPU result older than 250 ms is stale (queries starved): fall back to CPU time.
      if (gpuMs >= 0 && performance.now() - gpuAt < 250) {
        last.ms = gpuMs
        last.source = 'gpu'
      } else {
        last.ms = cpuMs
        last.source = 'cpu'
      }
      stage.recordFrame(last.ms, last.source)
    }
    return result
  }

  return {
    get supported() {
      return !!ext
    },
    measure,
    get last() {
      return last
    },
    dispose() {
      if (disposed) return
      disposed = true
      if (gl2) {
        for (const q of pending) {
          try {
            gl2.deleteQuery(q)
          } catch {
            /* context lost */
          }
        }
      }
      pending.length = 0
    },
  }
}
