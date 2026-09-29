// The transport worker (brief 6.4.1, 6.4.3). Protocol:
//   in   { type: 'compute', jobId, raster, n, iters, streamEvery, seed }
//        { type: 'cancel', jobId }
//        { type: 'relief', jobId, targets, n }
//   out  { type: 'frame', jobId, iter, targets, density }            every streamEvery iterations
//        { type: 'done', jobId, targets, density, iters, ms }
//        { type: 'relief', jobId, slope, width, height, maxSlopeDeg, maxTurnDeg, depthMm, heightMm, … }
//        { type: 'error', jobId, message }
// Iterations run in chunks of streamEvery and yield (setTimeout 0) between chunks, so a newer
// compute or a cancel stops a stale job within one chunk. Only the newest compute job runs.

import { GLASS, PANE } from '../light/glass'
import { hilbertOrder } from './hilbert'
import { r2Points } from './r2'
import { computeReliefField } from './relief'
import { meanDensity, RASTER_H, RASTER_W, rasterDensity, rayDensity, sampleTargets, SlicedOT, snapStrays } from './sliced-ot'

interface ComputeMsg { type: 'compute'; jobId: number; raster: Uint8ClampedArray; n: number; iters: number; streamEvery: number; seed: number }
interface CancelMsg { type: 'cancel'; jobId: number }
interface ReliefMsg { type: 'relief'; jobId: number; targets: Float32Array; n: number }
type InMsg = ComputeMsg | CancelMsg | ReliefMsg

interface Scope {
  onmessage: ((e: MessageEvent<InMsg>) => void) | null
  postMessage(msg: unknown, transfer?: Transferable[]): void
}
const scope = self as unknown as Scope

let newest = -1

const sources = new Map<number, Float64Array>()
function sourcesFor(n: number): Float64Array {
  let s = sources.get(n)
  if (!s) {
    s = r2Points(n)
    sources.set(n, s)
  }
  return s
}

// Precompute on start so the first job does not pay for it.
const order = hilbertOrder(RASTER_W, RASTER_H)
sourcesFor(32768)

const yieldNow = () => new Promise<void>((resolve) => setTimeout(resolve, 0))

// Reused across jobs (a stale job returns before touching them again: it checks `newest` first).
const densityBuffers = { tmp: new Float64Array(RASTER_W * RASTER_H), out: new Float64Array(RASTER_W * RASTER_H) }
const solvers = new Map<number, SlicedOT>()

// Warm-up on start (about 20 ms, before any job): JIT-compiles the hot loops and allocates the
// live-size solver, so the visitor's first word streams as fast as the tenth.
{
  const n = 32768
  const src = sourcesFor(n)
  const tg = new Float64Array(2 * n)
  for (let i = 0; i < 2 * n; i++) tg[i] = 0.25 + 0.5 * src[i]
  const warm = new SlicedOT(src, tg, 1)
  warm.step(16)
  solvers.set(n, warm)
  rasterDensity(new Uint8Array(RASTER_W * RASTER_H), RASTER_W, RASTER_H, densityBuffers)
}

async function compute(job: ComputeMsg): Promise<void> {
  const t0 = performance.now()
  const { jobId, n, iters } = job
  const every = Math.max(1, job.streamEvery | 0)
  const density = rasterDensity(job.raster, RASTER_W, RASTER_H, densityBuffers)
  const targets = sampleTargets(density, order, n)
  if (!targets) {
    scope.postMessage({ type: 'error', jobId, message: 'The word has no ink.' })
    return
  }
  const mean = meanDensity(density)
  let sot = solvers.get(n)
  if (sot) sot.reset(sourcesFor(n), targets, job.seed)
  else {
    sot = new SlicedOT(sourcesFor(n), targets, job.seed)
    solvers.set(n, sot)
  }
  while (sot.iter < iters) {
    if (jobId !== newest) return
    sot.step(Math.min(every, iters - sot.iter))
    if (sot.iter >= iters) break
    const t = sot.targets()
    const d = rayDensity(density, t, mean)
    scope.postMessage({ type: 'frame', jobId, iter: sot.iter, targets: t, density: d }, [t.buffer, d.buffer])
    await yieldNow()
  }
  if (jobId !== newest) return
  const t = sot.targets()
  snapStrays(t, density, mean)
  const d = rayDensity(density, t, mean)
  scope.postMessage({ type: 'done', jobId, targets: t, density: d, iters: sot.iter, ms: performance.now() - t0 }, [t.buffer, d.buffer])
}

function relief(msg: ReliefMsg): void {
  const { jobId, targets, n } = msg
  const f = computeReliefField(sourcesFor(n), targets, n, {
    nd: GLASS.clear.nd,
    widthMm: PANE.widthMm,
    throwMm: PANE.throwMm,
    aspect: RASTER_H / RASTER_W,
  })
  scope.postMessage({ type: 'relief', jobId, ...f }, [f.slope.buffer, f.heightMm.buffer])
}

scope.onmessage = (e) => {
  const msg = e.data
  try {
    if (msg.type === 'compute') {
      newest = msg.jobId
      compute(msg).catch((err: unknown) => {
        scope.postMessage({ type: 'error', jobId: msg.jobId, message: err instanceof Error ? err.message : String(err) })
      })
    } else if (msg.type === 'cancel') {
      if (msg.jobId === newest) newest = -1
    } else if (msg.type === 'relief') {
      relief(msg)
    }
  } catch (err) {
    scope.postMessage({ type: 'error', jobId: msg.jobId, message: err instanceof Error ? err.message : String(err) })
  }
}
