'use client'
// The one fixed canvas (brief 4.1, 4.2). frameloop="never": R3F's own loop never runs; the
// advance is registered into the frame bus inside onCreated (after R3F has configured the root)
// and removed in the matching cleanup, so the SmoothScroll ticker is the only clock. Owns the
// redraw triggers on size and DPR changes, the shader-error hook (-> Overcast), context loss and
// the epoch remount on restore, the pause while hidden or off-screen, and frame timing.
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Canvas, advance, useThree, type RootState } from '@react-three/fiber'
import { setConsoleFunction } from 'three'
import { frame } from '@/lib/frame'
import { stage } from '@/lib/stage'
import { light } from '@/lib/light-state'
import { useApp, type GpuTier } from '@/lib/store'
import Scene, { sceneRuntime } from './Scene'
import { createGpuTimer } from './gpu-timer'

/** Writes light.viewport from R3F's canvas size and redraws on every size or DPR change (4.1). */
function Sizer() {
  const width = useThree((s) => s.size.width)
  const height = useThree((s) => s.size.height)
  const dpr = useThree((s) => s.viewport.dpr)
  useEffect(() => {
    light.viewport.w = width
    light.viewport.h = height
    light.viewport.dpr = dpr
    sceneRuntime()?.resize(width, height, dpr)
    stage.touch()
    stage.requestRender(2)
  }, [width, height, dpr])
  return null
}

let tierBeforeLoss: GpuTier | null = null

// R3F 9.8 creates a THREE.Clock for every root, which three r186 reports as deprecated on every
// load; that one line is not actionable from this code base. three's own console hook passes every
// other message (shader errors included) through unchanged.
let consoleRouted = false
function routeThreeConsole() {
  if (consoleRouted) return
  consoleRouted = true
  setConsoleFunction((type, message, ...params) => {
    if (type === 'warn' && message.startsWith('THREE.Clock: This module has been deprecated')) return
    console[type](message, ...params)
  })
}
routeThreeConsole()

export default function Stage({ children }: { children?: ReactNode }) {
  const [epoch, setEpoch] = useState(0)
  const [dpr, setDpr] = useState(() => stage.dpr)
  const cleanup = useRef<(() => void) | null>(null)

  useEffect(() => stage.onQuality((step) => setDpr(step.dpr)), [])
  useEffect(
    () => () => {
      cleanup.current?.()
      cleanup.current = null
    },
    [],
  )

  const onCreated = useCallback((state: RootState) => {
    cleanup.current?.()
    const gl = state.gl
    gl.autoClear = false
    // three r186 logs compile and link errors without throwing: a typo in any chunk goes to Overcast.
    gl.debug.onShaderError = () => {
      useApp.getState().setWebgl('failed')
    }
    const canvas = gl.domElement
    let inView = true
    const io = new IntersectionObserver(
      (entries) => {
        inView = entries[entries.length - 1]?.isIntersecting ?? true
        if (inView) stage.requestRender(2)
      },
      { threshold: 0 },
    )
    io.observe(canvas)
    const onLost = (e: Event) => {
      e.preventDefault()
      const rt = sceneRuntime()
      if (rt) rt.contextLost = true
      tierBeforeLoss = useApp.getState().gpuTier || tierBeforeLoss
      useApp.getState().setWebgl('failed')
    }
    const onRestored = () => {
      const app = useApp.getState()
      app.setWebgl('pending')
      if (tierBeforeLoss) app.setGpuTier(tierBeforeLoss)
      setEpoch((e) => e + 1)
    }
    canvas.addEventListener('webglcontextlost', onLost)
    canvas.addEventListener('webglcontextrestored', onRestored)

    // Frame time (4.1): WP1's timer reports through stage.recordFrame (GPU when the extension exists).
    const timer = createGpuTimer(gl.getContext())
    let timeNow = 0
    const step = () => advance(timeNow, true, state.get())
    const render = (t: number) => {
      if (typeof document !== 'undefined' && document.hidden) return
      if (!inView || !stage.shouldRender()) return
      timeNow = t
      timer.measure(step)
    }
    frame.renderers.add(render)
    stage.setRenderer(gl)
    stage.requestRender(2)
    cleanup.current = () => {
      frame.renderers.delete(render)
      timer.dispose()
      stage.setRenderer(null)
      io.disconnect()
      canvas.removeEventListener('webglcontextlost', onLost)
      canvas.removeEventListener('webglcontextrestored', onRestored)
    }
  }, [])

  return (
    <Canvas
      key={epoch}
      frameloop="never"
      flat
      linear
      orthographic
      dpr={dpr}
      gl={{ antialias: false, alpha: false, depth: false, stencil: false, powerPreference: 'high-performance' }}
      resize={{ scroll: false, debounce: { scroll: 0, resize: 100 } }}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      onCreated={onCreated}
    >
      <Sizer />
      <Scene />
      {children}
    </Canvas>
  )
}
