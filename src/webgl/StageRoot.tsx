'use client'

// The fixed canvas host (brief 4.2, 4.11). Decides, once at boot:
//   1. WebGL2 with a renderable half-float target (EXT_color_buffer_float or
//      EXT_color_buffer_half_float, verified by a complete framebuffer), probed on a
//      throwaway context released with WEBGL_lose_context. Failure → setWebgl('off').
//   2. The GPU tier (?tier overrides): 3 on a fine pointer with ≥ 8 cores, else 2; 0 = Overcast.
// Only then does it mount WP4's <Stage> (loaded after first paint with next/dynamic), so the
// Stage reads the right DPR cap. The host is fixed at 100lvh, never inset: 0, so mobile
// toolbar collapses do not resize (and clear) the drawing buffer. The canvas fades in once
// html[data-webgl="ready"] (set by the Scene after its first full frame). On 'failed'
// (shader error, context loss, loader failsafe) the Stage stays mounted but hidden and
// stage.shouldRender() is false, so a context restore can still bring it back.
import dynamic from 'next/dynamic'
import { useEffect, useSyncExternalStore } from 'react'
import { useApp, type GpuTier } from '@/lib/store'
import { flags } from '@/lib/qa-flags'
import styles from './stage.module.css'

const Stage = dynamic(
  () =>
    import('./Stage').catch((err: unknown) => {
      // The chunk never loaded: Overcast, never an unlit wall (4.2).
      console.error('[stage] the Stage chunk failed to load', err)
      useApp.getState().setWebgl('failed')
      return { default: function NoStage() { return null } }
    }),
  { ssr: false, loading: () => null },
)

type Probe = { ok: boolean; reason: string }

function probeWebgl(): Probe {
  let gl: WebGL2RenderingContext | null = null
  try {
    const c = document.createElement('canvas')
    c.width = 4
    c.height = 4
    gl = c.getContext('webgl2', { antialias: false, depth: false, stencil: false, failIfMajorPerformanceCaveat: false })
    if (!gl) return { ok: false, reason: 'no webgl2' }
    const full = gl.getExtension('EXT_color_buffer_float')
    const half = gl.getExtension('EXT_color_buffer_half_float')
    if (!full && !half) return { ok: false, reason: 'no renderable float target' }
    // A real RGBA16F target must be framebuffer-complete.
    const tex = gl.createTexture()
    const fb = gl.createFramebuffer()
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, 4, 4, 0, gl.RGBA, gl.HALF_FLOAT, null)
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0)
    const complete = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.deleteFramebuffer(fb)
    gl.deleteTexture(tex)
    return complete ? { ok: true, reason: 'ok' } : { ok: false, reason: 'half-float target incomplete' }
  } catch (err) {
    return { ok: false, reason: String(err) }
  } finally {
    try {
      gl?.getExtension('WEBGL_lose_context')?.loseContext()
    } catch {
      /* already gone */
    }
  }
}

function detectTier(): GpuTier {
  if (flags.tier !== null) return flags.tier
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  const cores = navigator.hardwareConcurrency || 4
  return fine && cores >= 8 ? 3 : 2
}

// ── boot decision, once per page (module singleton; StrictMode-safe) ──
let decided = false
let mountStage = false
const subs = new Set<() => void>()

function decide() {
  if (decided) return
  decided = true
  const app = useApp.getState()
  if (app.webgl !== 'off') {
    const tier = detectTier()
    const probe = tier === 0 ? { ok: false, reason: '?tier=0' } : probeWebgl()
    if (probe.ok) {
      app.setGpuTier(tier)
      mountStage = true
      // The hero's light data (0.4 of the boot) starts now, in parallel with the Stage chunk, so the
      // document's preload of aslant.bin is consumed at once (WebKit warns when it sits unused).
      import('@/lib/caustics/client')
        .then((m) => m.loadBaked('aslant'))
        .catch((err: unknown) => console.error('[stage] light data failed to load', err))
    } else {
      if (flags.qa) console.info('[aslant] webgl off:', probe.reason)
      app.setWebgl('off')
      app.setGpuTier(0)
    }
  } else {
    app.setGpuTier(0)
  }
  for (const fn of subs) fn()
}

function subscribe(fn: () => void) {
  subs.add(fn)
  return () => {
    subs.delete(fn)
  }
}
const getSnapshot = () => mountStage
const getServerSnapshot = () => false

export function StageRoot() {
  const ready = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const webgl = useApp((s) => s.webgl)

  useEffect(() => {
    decide()
  }, [])

  return (
    <div className={styles.root} aria-hidden="true">
      {ready && webgl !== 'off' && (
        <div className={styles.canvas}>
          <Stage />
        </div>
      )}
    </div>
  )
}

export default StageRoot
