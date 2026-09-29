// The one bridge from sections to the WebGL layer (brief 7.3). This module never imports three:
// the real implementation lives in the lazily loaded Scene, which registers itself through
// __register. Until then calls are queued (latest transport per owner) and replayed in order.
import type { ChapterId } from '@/content/chapters'
import { useApp, type GpuTier } from '@/lib/store'

export interface Transport { id: string; n: number; targets: Float32Array; density: Float32Array; iters: number }
export interface Relief { slope: Float32Array /* RGBA: slope xy, high-pass xy */; width: 256; height: 128; maxSlopeDeg: number; maxTurnDeg: number; depthMm: number }
export interface StageApiImpl {
  requestTransport(owner: ChapterId, t: Transport): void        // the one transport arbiter (4.3)
  setSlopeField(r: Relief): void
  renderStill(opts: { width: number; height: number; framing?: 'square'; transport: Transport; hour: number; glass: 'clear' | 'prismatic' }): Promise<ImageData>
  info(): { rays: number; bands: number; dpr: number; gpuTier: GpuTier }
}

type StillOpts = Parameters<StageApiImpl['renderStill']>[0]
type Queued =
  | { kind: 'transport'; owner: ChapterId; t: Transport }
  | { kind: 'relief'; r: Relief }
  | { kind: 'still'; opts: StillOpts; resolve: (d: ImageData) => void; reject: (e: unknown) => void }

let impl: StageApiImpl | null = null
let queue: Queued[] = []
// The latest transport per owner and the latest relief survive registration, so a Scene that
// remounts after a context restore (epoch key) gets every cached transport back.
const latest = new Map<ChapterId, Transport>()
let latestRelief: Relief | null = null
let readyResolve: (() => void) | null = null
let readyPromise: Promise<void> = new Promise((r) => { readyResolve = r })

/** Tier defaults, used until the Scene registers (the hero's baked word at the tier's settings). */
function tierInfo(): { rays: number; bands: number; dpr: number; gpuTier: GpuTier } {
  const gpuTier = useApp.getState().gpuTier
  const device = typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1
  if (gpuTier === 3) return { rays: 65536, bands: 8, dpr: Math.min(1.75, device), gpuTier }
  if (gpuTier === 2) return { rays: 32768, bands: 4, dpr: Math.min(1.35, device), gpuTier }
  return { rays: 0, bands: 0, dpr: 1, gpuTier }
}

export const stageApi: StageApiImpl & {
  whenReady(): Promise<void>                     // resolves when the Scene registers
  __register(impl: StageApiImpl): void           // called once per Scene mount; queued calls replay in order
  __unregister(impl: StageApiImpl): void         // the Scene's symmetric cleanup (context loss, epoch remount)
} = {
  requestTransport(owner, t) {
    latest.set(owner, t)
    if (impl) { impl.requestTransport(owner, t); return }
    queue = queue.filter((q) => !(q.kind === 'transport' && q.owner === owner))
    queue.push({ kind: 'transport', owner, t })
  },
  setSlopeField(r) {
    latestRelief = r
    if (impl) { impl.setSlopeField(r); return }
    queue = queue.filter((q) => q.kind !== 'relief')
    queue.push({ kind: 'relief', r })
  },
  renderStill(opts) {
    // Overcast (no WebGL, or it failed): there is no renderer to wait for (the button is hidden there).
    const webgl = useApp.getState().webgl
    if (webgl === 'off' || webgl === 'failed') return Promise.reject(new Error('renderStill: no live rendering (Overcast)'))
    if (impl) return impl.renderStill(opts)
    return new Promise<ImageData>((resolve, reject) => { queue.push({ kind: 'still', opts, resolve, reject }) })
  },
  info() {
    return impl ? impl.info() : tierInfo()
  },
  whenReady() {
    return readyPromise
  },
  __register(next) {
    impl = next
    // Replay: every cached transport first (a remounted Scene starts empty), then the queue in order.
    const queuedOwners = new Set(queue.flatMap((q) => (q.kind === 'transport' ? [q.owner] : [])))
    for (const [owner, t] of latest) if (!queuedOwners.has(owner)) next.requestTransport(owner, t)
    if (latestRelief && !queue.some((q) => q.kind === 'relief')) next.setSlopeField(latestRelief)
    const pending = queue
    queue = []
    for (const q of pending) {
      if (q.kind === 'transport') next.requestTransport(q.owner, q.t)
      else if (q.kind === 'relief') next.setSlopeField(q.r)
      else next.renderStill(q.opts).then(q.resolve, q.reject)
    }
    readyResolve?.()
    readyResolve = null
  },
  __unregister(prev) {
    if (impl !== prev) return
    impl = null
    readyPromise = new Promise((r) => { readyResolve = r })
  },
}
