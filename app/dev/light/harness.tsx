'use client'
// G1 harness client (brief 6.1.7, WP4). Drives `light` directly (no conductor), runs its own
// ticker (this route has no SmoothScroll), measures frame time over 300 frames and exposes the
// debug controls: focus, wave, K, RT size, DPR, point max, loose-phase optimisation, RGBA8.
// Query flags: ?focus=0.35&wave=0.66&K=8&rt=1024&dpr=1.75&pm=24&loose=1&rgba8=0&run=loose|formation&still=first-light
import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { gsap } from '@/lib/gsap'
import { frame, runListeners } from '@/lib/frame'
import { stage, installStage } from '@/lib/stage'
import { light } from '@/lib/light-state'
import { srgbHexToLinear } from '@/lib/color'
import { sceneRuntime } from '@/webgl/Scene'
import { stageApi } from '@/webgl/stage-api'
import { loadBaked } from '@/lib/caustics/client'

const Stage = dynamic(() => import('@/webgl/Stage'), { ssr: false, loading: () => null })

type Params = { focus: number; wave: number; K: 8 | 4; rt: number; dpr: number; pm: number; loose: boolean; rgba8: boolean; run: string; prism: number }

function readParams(): Params {
  const q = new URLSearchParams(typeof window === 'undefined' ? '' : window.location.search)
  const num = (k: string, d: number) => (q.has(k) && Number.isFinite(Number(q.get(k))) ? Number(q.get(k)) : d)
  const still = q.get('still')
  const settled = !!still || q.get('run') === 'settled'
  return {
    focus: num('focus', settled ? 1 : 0),
    wave: num('wave', settled ? 0.04 : 1),
    K: num('K', 8) === 4 ? 4 : 8,
    rt: num('rt', 1024),
    dpr: num('dpr', 0),
    pm: num('pm', 24),
    loose: q.get('loose') !== '0',
    rgba8: q.get('rgba8') === '1',
    run: q.get('run') ?? (still ? 'still' : 'loose'),
    prism: num('prism', 0),
  }
}

const focusEase = (t: number) => {
  // cubic-bezier(0.16, 1, 0.3, 1), solved by bisection on x
  let lo = 0, hi = 1
  for (let i = 0; i < 24; i++) {
    const m = (lo + hi) / 2
    const x = 3 * (1 - m) * (1 - m) * m * 0.16 + 3 * (1 - m) * m * m * 0.3 + m * m * m
    if (x < t) lo = m
    else hi = m
  }
  const m = (lo + hi) / 2
  return 3 * (1 - m) * (1 - m) * m * 1 + 3 * (1 - m) * m * m * 1 + m * m * m
}

interface Stats { fps: number; p95: number; median: number; gpu: number; frames: number; causticPerS: number; line: string }

export default function Harness() {
  const [params, setParams] = useState<Params>(() => readParams())
  const [stats, setStats] = useState<Stats | null>(null)
  const [still, setStill] = useState(true)
  const paramsRef = useRef(params)
  const formStart = useRef(-1)

  useEffect(() => {
    paramsRef.current = params
  }, [params])

  // The panel stays hidden in still mode (captures); decided after mount so SSR and hydration agree.
  useEffect(() => {
    const id = requestAnimationFrame(() => setStill(new URLSearchParams(window.location.search).has('still')))
    return () => cancelAnimationFrame(id)
  }, [])

  // light setup: the hero at 08:10 (sun #FFE3C4 x 1.4, shade #3A4142 at calUv (0.25, 0.62))
  useEffect(() => {
    const sun = srgbHexToLinear('#FFE3C4')
    Object.assign(light.sun, { r: sun[0], g: sun[1], b: sun[2], e: 1.4, x: 0, y: 0, aberr: 0 })
    const shade = srgbHexToLinear('#3A4142')
    const split = window.innerWidth >= 1024 && window.innerWidth / window.innerHeight >= 0.9
    Object.assign(light.shade, { r: shade[0], g: shade[1], b: shade[2], u: split ? 0.25 : 0.5, v: split ? 0.62 : 0.72 })
    light.patch.w = 0 // the Scene's hero rest patch
    light.modeA = 'wall'
    light.modeB = 'wall'
    light.modeMix = 0
    light.defocus = 0
    light.cloud = 0
    Object.assign(light.word, { id: 'aslant', focus: paramsRef.current.focus, wave: paramsRef.current.wave, prism: paramsRef.current.prism, pointScale: 1 })
    document.documentElement.dataset.motion = document.documentElement.dataset.motion || 'full'
  }, [])

  // ?band=1: the ledger's full-bleed band (77 to 97% from the top, skew 0.9) with the visitor's word
  // (Ingrid, Prismatic, focus 0.15, wave 0.8) to judge the loose word band.
  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has('band')) return
    let alive = true
    loadBaked('ingrid').then((t) => {
      if (!alive) return
      stageApi.requestTransport('write-yours', t)
      light.word.id = 'visitor'
    })
    const place = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      Object.assign(light.patch, { x: -0.9 * 0.2 * h, y: 0.77 * h, w: w + 0.9 * 0.2 * h, h: 0.2 * h, skew: 0.9, split: 0, transom: 0, mullion: 0, on: 1 })
      Object.assign(light.lower, { u0: 0, v0: 0, u1: 1, v1: 1 })
      const lw = light.patch.w - 0.9 * light.patch.h
      const lh = light.patch.h
      const ww = Math.min(0.86, (lh * 0.72 * (1024 / 480)) / lw)
      const wh = (ww * lw) / (lh * (1024 / 480))
      Object.assign(light.wordRect, { x: (1 - ww) / 2, y: (1 - wh) / 2, w: ww, h: wh })
    }
    place()
    window.addEventListener('resize', place)
    return () => {
      alive = false
      window.removeEventListener('resize', place)
    }
  }, [])

  // this route's clock (the page's is SmoothScroll): beginFrame -> renderers -> endFrame
  useEffect(() => {
    const off = installStage()
    const intervals: number[] = []
    const gpuMs: number[] = []
    let last = -1
    let lastFrames = 0
    let lastCaustic = 0
    let lastReport = 0
    let readyFrames = 0
    let configured = false
    stage.hold('harness')
    const tick = (time: number, deltaMs: number) => {
      const p = paramsRef.current
      const dt = Math.min(deltaMs / 1000, 1 / 30)
      const rt = sceneRuntime()
      if (rt && !configured) {
        configured = true
        rt.applyOverrides({ K: p.K, rtLong: p.rt, pointMax: p.pm, looseOpt: p.loose, rgba8: p.rgba8 })
        if (p.dpr > 0) rt.setDpr?.(p.dpr)
      }
      // formation: focus = form, wave = mix(1, 0.04, form) over 2.2 s with the focus ease
      if (p.run === 'formation') {
        if (formStart.current < 0) formStart.current = time
        const k = Math.min(1, (time - formStart.current) / 2.2)
        const f = focusEase(k)
        light.word.focus = f
        light.word.wave = 1 + (0.04 - 1) * f
        if (k >= 1 && time - formStart.current > 3.5) formStart.current = time
      } else {
        light.word.focus = p.focus
        light.word.wave = p.wave
      }
      light.word.prism = p.prism
      stage.touch()
      stage.beginFrame(time, dt)
      runListeners(frame.renderers, time, dt)
      stage.endFrame(time, frame.renderers.size)
      // frame time as WP1's timer reports it (GPU when EXT_disjoint_timer_query_webgl2 exists)
      if (rt && rt.stats.frames > lastFrames) {
        gpuMs.push(stage.frameMs)
        if (gpuMs.length > 300) gpuMs.shift()
      }
      if (rt && rt.stats.frames > lastFrames) {
        if (last >= 0) intervals.push((time - last) * 1000)
        if (intervals.length > 300) intervals.shift()
        last = time
        lastFrames = rt.stats.frames
        if (rt.firstFrameDone && rt.caustic.n > 0) {
          readyFrames++
          if (readyFrames === 2) {
            ;(window as unknown as { __aslantStillReady?: boolean }).__aslantStillReady = true
            document.documentElement.dataset.state = 'ready'
          }
        }
      }
      if (rt && time - lastReport > 0.5) {
        const s = [...intervals].sort((a, b) => a - b)
        const med = s.length ? s[Math.floor(s.length / 2)] : 0
        const p95 = s.length ? s[Math.min(s.length - 1, Math.floor(s.length * 0.95))] : 0
        const g = [...gpuMs].sort((a, b) => a - b)
        const gpu = g.length ? g[Math.floor(g.length / 2)] : -1
        const c = rt.caustic
        setStats({
          fps: med > 0 ? 1000 / med : 0,
          median: med,
          p95,
          gpu,
          frames: s.length,
          causticPerS: (rt.stats.causticRenders - lastCaustic) / (time - lastReport),
          line: `frame ${stage.frameSource} · DPR ${rt.gl.getPixelRatio().toFixed(2)} · K ${c.bandsDrawn} · N ${c.drawn.toLocaleString('en-US')} · RT ${c.rtSize.w}×${c.rtSize.h}${c.looseActive ? ' (loose)' : ''} · pointMax ${c.tier.pointMax}`,
        })
        lastCaustic = rt.stats.causticRenders
        lastReport = time
      }
    }
    gsap.ticker.add(tick)
    ;(window as unknown as { __g1bench?: (n?: number) => unknown }).__g1bench = (n?: number) => sceneRuntime()?.benchmark(n)
    // Forced shader error: a compositor built with a broken pane chunk must send the page to Overcast.
    ;(window as unknown as { __g1shaderError?: () => Promise<string | undefined> }).__g1shaderError = async () => {
      const rt = sceneRuntime()
      if (!rt) return 'no scene'
      const [{ Compositor }, { benchChunk }] = await Promise.all([import('@/webgl/passes/Compositor'), import('@/webgl/shaders/bench.glsl')])
      const bad = { glsl: 'vec3 shadePane(vec2 fragCSS) { return plainWall(fragCSS) + ; }', uniforms: {}, update() {} }
      const c = new Compositor(bad, benchChunk, rt.plasterTex)
      rt.gl.render(c.scene, c.camera)
      c.dispose()
      return document.documentElement.dataset.webgl
    }
    // renderStill check: the save-image render as a PNG data URL
    ;(window as unknown as { __g1still?: (word?: 'aslant' | 'ingrid', glass?: 'clear' | 'prismatic', hour?: number) => Promise<string> }).__g1still = async (word = 'ingrid', glass = 'prismatic', hour = 17 + 20 / 60) => {
      const t = await loadBaked(word)
      const img = await stageApi.renderStill({ width: 1080, height: 1080, framing: 'square', transport: t, hour, glass })
      const c = document.createElement('canvas')
      c.width = img.width
      c.height = img.height
      c.getContext('2d')?.putImageData(img, 0, 0)
      return c.toDataURL('image/png')
    }
    return () => {
      gsap.ticker.remove(tick)
      stage.release('harness')
      off()
    }
  }, [])

  const set = (patch: Partial<Params>) => {
    const next = { ...params, ...patch }
    setParams(next)
    const rt = sceneRuntime()
    if (rt) {
      rt.applyOverrides({ K: next.K, rtLong: next.rt, pointMax: next.pm, looseOpt: next.loose, rgba8: next.rgba8 })
      if (patch.dpr) rt.setDpr?.(patch.dpr)
    }
    if (patch.run === 'formation') formStart.current = -1
  }


  return (
    <>
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100lvh', background: '#3A4142' }}>
        <Stage />
      </div>
      {!still && (
        <div
          style={{
            position: 'fixed', left: 12, bottom: 12, zIndex: 10, padding: '10px 12px', background: 'rgba(30,34,36,0.82)',
            color: '#ECE6D9', font: '12px/1.45 system-ui, sans-serif', fontVariantNumeric: 'tabular-nums', maxWidth: 520,
          }}
        >
          <div data-g1-stats="">
            {stats
              ? `median ${stats.fps.toFixed(1)} fps (${stats.median.toFixed(2)} ms) · p95 ${stats.p95.toFixed(2)} ms · GPU ${stats.gpu >= 0 ? stats.gpu.toFixed(2) + ' ms' : 'n/a'} · over ${stats.frames} frames · caustic ${stats.causticPerS.toFixed(0)}/s`
              : 'starting'}
          </div>
          <div data-g1-config="">{stats?.line ?? ''}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8, alignItems: 'center' }}>
            <button onClick={() => set({ run: 'loose', focus: 0, wave: 1 })}>loose</button>
            <button onClick={() => set({ run: 'formation' })}>formation</button>
            <button onClick={() => set({ run: 'settled', focus: 1, wave: 0.04 })}>settled</button>
            <label>
              focus <input type="range" min={0} max={1} step={0.01} value={params.focus} onChange={(e) => set({ run: 'manual', focus: Number(e.target.value) })} />
            </label>
            <label>
              wave <input type="range" min={0} max={1} step={0.01} value={params.wave} onChange={(e) => set({ run: 'manual', wave: Number(e.target.value) })} />
            </label>
            <label>
              K <select value={params.K} onChange={(e) => set({ K: Number(e.target.value) === 4 ? 4 : 8 })}><option value={8}>8</option><option value={4}>4</option></select>
            </label>
            <label>
              RT <select value={params.rt} onChange={(e) => set({ rt: Number(e.target.value) })}><option value={1024}>1024</option><option value={768}>768</option></select>
            </label>
            <label>
              DPR <select value={params.dpr} onChange={(e) => set({ dpr: Number(e.target.value) })}><option value={0}>tier</option><option value={1}>1</option><option value={1.35}>1.35</option><option value={1.5}>1.5</option><option value={1.75}>1.75</option><option value={2}>2</option></select>
            </label>
            <label>
              point max <select value={params.pm} onChange={(e) => set({ pm: Number(e.target.value) })}><option value={24}>24</option><option value={16}>16</option></select>
            </label>
            <label>
              <input type="checkbox" checked={params.loose} onChange={(e) => set({ loose: e.target.checked })} /> loose K3/768
            </label>
            <label>
              <input type="checkbox" checked={params.rgba8} onChange={(e) => set({ rgba8: e.target.checked })} /> RGBA8
            </label>
            <label>
              prism <input type="range" min={0} max={1} step={0.01} value={params.prism} onChange={(e) => set({ prism: Number(e.target.value) })} />
            </label>
          </div>
        </div>
      )}
    </>
  )
}
