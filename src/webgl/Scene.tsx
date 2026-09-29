'use client'
// The render graph (brief 4.2, 7.4): caustic pass -> compositor (wall | pane | bench) -> bench rays
// -> dust -> ray view, rendered inside the Stage's registered advance (One Clock). Owns the passes
// (plain classes held in a ref), the transport arbiter (morph, swap, loosen-swap-reform), the
// room calibration (uSky from light.shade), shimmer and wordVersion, and registers the stage-api
// implementation.
import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { ChapterId } from '@/content/chapters'
import { light, type WordId } from '@/lib/light-state'
import { stage } from '@/lib/stage'
import { scrimShade } from '@/lib/conductor'
import { boot } from '@/lib/boot'
import { useApp, type GpuTier } from '@/lib/store'
import { motion } from '@/lib/qa-flags'
import { srgbHexToLinear } from '@/lib/color'
import { loadBaked } from '@/lib/caustics/client'
import { shadeLinearAt, skewFromAltitude, sunLinearAt } from '@/lib/world-spec'
import { stageApi, type Relief, type StageApiImpl, type Transport } from './stage-api'
import type { Pass } from './pass'
import { CausticPass, TIER_SETTINGS, type CausticTier } from './passes/CausticPass'
import { Compositor } from './passes/Compositor'
import { DustPass } from './passes/DustPass'
import { BenchPass } from './passes/BenchPass'
import { RayViewPass } from './passes/RayViewPass'
import { paneChunk } from './shaders/pane.glsl'
import { benchChunk } from './shaders/bench.glsl'
import { generatePlaster, plasterTexture, type PlasterData } from './plaster'
import { calibrateSky, type RGB3 } from './calibrate'
import { beamDirection, beamEdges, beamHexagon, lowerOf, lowerSizePx, wordRectFor, type LowerRect, type WordRect } from './patch-math'

const OWNER_OF: Record<WordId, ChapterId> = { aslant: 'first-light', ingrid: 'appointment', visitor: 'write-yours', commission: 'commission' }
const ALBEDO: RGB3 = srgbHexToLinear('#D6CEBE').map((c) => c * 0.62) as RGB3
const SHADE_DEFAULT: RGB3 = srgbHexToLinear('#3A4142')
/** Air-light strength along the beam (tier 3): faint, it never lifts text above the +18% rule. */
const HAZE = 0.3
const LOOSEN_S = 0.25
const REFORM_S = 0.45
const MORPH_S = 0.12

type Patch = { x: number; y: number; w: number; h: number; skew: number; split: number; transom: number; mullion: number; on: number }

const easeDefocus = (t: number) => t * t * t
const easeFocus = (t: number) => 1 - Math.pow(1 - t, 4)

/** The hero rest patch when the conductor has not written one (5.0, 5.1). */
function heroPatch(w: number, h: number, out: Patch): Patch {
  const split = w >= 1024 && w / h >= 0.9
  if (split) Object.assign(out, { x: 0.455 * w, y: 0.155 * h, w: 0.53 * w, h: 0.645 * h, skew: 0.2, split: 0.22, transom: 0.035, mullion: 0.022, on: 1 })
  else if (w >= 768) Object.assign(out, { x: 0.06 * w, y: 0.1 * h, w: 0.88 * w, h: 0.4 * h, skew: 0.07, split: 0.16, transom: 0.03, mullion: 0, on: 1 })
  else Object.assign(out, { x: 0.05 * w, y: 0.09 * h, w: 0.89 * w, h: 0.39 * h, skew: 0.07, split: 0.16, transom: 0.03, mullion: 0, on: 1 })
  return out
}

export interface SceneStats {
  frames: number
  causticRenders: number
  lastFrameAt: number
}

export class SceneRuntime {
  readonly gl: THREE.WebGLRenderer
  readonly plaster: PlasterData
  readonly plasterTex: THREE.DataTexture
  readonly caustic = new CausticPass()
  readonly comp: Compositor
  readonly dust = new DustPass()
  readonly bench = new BenchPass()
  readonly rays: Pass = new RayViewPass()
  readonly stats: SceneStats = { frames: 0, causticRenders: 0, lastFrameAt: 0 }
  /** Harness overrides of the tier settings (the G1 debug panel). */
  overrides: Partial<CausticTier> = {}
  gpuTier: GpuTier = 3
  /** R3F's setDpr, for the harness DPR control. */
  setDpr: ((d: number) => void) | null = null
  compiled = false
  firstFrameDone = false
  /** The full compositor and the bench rays have been drawn once (4.2 warm-up). */
  private warmed = false

  private readonly transports = new Map<ChapterId, Transport>()
  private shownOwner: ChapterId | null = null
  private swapPhase: 'idle' | 'loosen' | 'reform' = 'idle'
  private swapT = 0
  private cap = 1
  private morphT = 1
  private readonly sky: RGB3 = [0.1, 0.1, 0.1]
  private skyKey: number[] = []
  private readonly patch: Patch = { x: 0, y: 0, w: 0, h: 0, skew: 0.2, split: 0.22, transom: 0.035, mullion: 0.022, on: 1 }
  private readonly lower: LowerRect = { u0: 0, v0: 0.255, u1: 1, v1: 1 }
  private readonly wordRect: WordRect = { x: 0.07, y: 0.2, w: 0.86, h: 0.6 }
  private readonly beam = new Float32Array(12)
  private readonly edges = new Float32Array(18)
  private readonly buf = new THREE.Vector2()
  private slopeTex: THREE.DataTexture | null = null
  private disposed = false
  private conductorSeen = false
  /** Set by the Stage on webglcontextlost: GL objects of a lost context are dropped, never deleted. */
  contextLost = false
  readonly impl: StageApiImpl

  constructor(gl: THREE.WebGLRenderer) {
    this.gl = gl
    this.plaster = generatePlaster()
    this.plasterTex = plasterTexture(this.plaster)
    this.comp = new Compositor(paneChunk, benchChunk, this.plasterTex)
    this.caustic.init(gl)
    this.dust.init()
    this.bench.init()
    this.rays.init(gl)
    this.setTier(useApp.getState().gpuTier)
    this.impl = {
      requestTransport: (owner, t) => this.requestTransport(owner, t),
      setSlopeField: (r) => this.setSlopeField(r),
      renderStill: (opts) => this.renderStill(opts),
      info: () => {
        // the tier's bands (the formed word); the K = 3 of the loose phase is an internal shortcut
        const K = this.causticTier().K
        return { rays: this.caustic.n > 0 ? this.caustic.drawn : this.gpuTier === 2 ? 32768 : 65536, bands: K, dpr: this.gl.getPixelRatio(), gpuTier: this.gpuTier }
      },
    }
  }

  causticTier(): CausticTier {
    const base = TIER_SETTINGS[this.gpuTier === 2 ? 2 : 3]
    return { ...base, ...this.overrides }
  }

  setTier(t: GpuTier) {
    this.gpuTier = t === 2 ? 2 : 3
    this.caustic.setTier(this.causticTier())
    this.dust.setCount(this.gpuTier === 3 ? 1200 : 400)
    stage.requestRender(2)
  }

  applyOverrides(o: Partial<CausticTier>) {
    this.overrides = { ...this.overrides, ...o }
    this.caustic.setTier(this.causticTier())
    stage.requestRender(2)
  }

  /** Compile every pass before ready (4.2): nothing compiles on first use mid-scroll. */
  async compile(): Promise<void> {
    const gl = this.gl
    const cam = this.caustic.camera
    await Promise.all([
      gl.compileAsync(this.caustic.scene, cam),
      gl.compileAsync(this.comp.scene, cam),
      gl.compileAsync(this.comp.sceneWall, cam),
      gl.compileAsync(this.dust.scene, cam),
    ])
    await this.bench.compile(gl)
    this.compiled = true
  }

  // ── transports (4.3) ──
  requestTransport(owner: ChapterId, t: Transport) {
    if (this.disposed) return
    this.transports.set(owner, t)
    if (owner === this.shownOwner && this.swapPhase === 'idle') {
      this.apply(t, motion() === 'reduced' ? 'swap' : 'morph')
    }
    stage.requestRender(2)
  }

  private apply(t: Transport, mode: 'swap' | 'morph') {
    this.caustic.setTransport(t, mode)
    light.wordVersion++
    if (mode === 'morph') {
      this.morphT = 0
      stage.hold('word-morph')
    } else {
      this.morphT = 1
      this.caustic.inputs.morph = 1
    }
  }

  private selectTransport(dt: number, wordVisible: boolean) {
    const id = light.word.id
    const want = id ? OWNER_OF[id] : null
    if (this.swapPhase === 'idle') {
      if (want && want !== this.shownOwner && this.transports.has(want)) {
        const instant = this.shownOwner === null || light.defocus > 0.9 || motion() === 'reduced' || !wordVisible
        if (instant) {
          this.shownOwner = want
          this.apply(this.transports.get(want) as Transport, 'swap')
        } else {
          this.swapPhase = 'loosen'
          this.swapT = 0
          stage.hold('word-swap')
        }
      }
    } else if (this.swapPhase === 'loosen') {
      this.swapT += dt
      const k = Math.min(1, this.swapT / LOOSEN_S)
      this.cap = 1 + (0.2 - 1) * easeDefocus(k)
      if (k >= 1) {
        const target = want && this.transports.has(want) ? want : this.shownOwner
        if (target && target !== this.shownOwner) {
          this.shownOwner = target
          this.apply(this.transports.get(target) as Transport, 'swap')
        }
        this.swapPhase = 'reform'
        this.swapT = 0
      }
    } else {
      this.swapT += dt
      const k = Math.min(1, this.swapT / REFORM_S)
      this.cap = 0.2 + (1 - 0.2) * easeFocus(k)
      if (k >= 1) {
        this.cap = 1
        this.swapPhase = 'idle'
        stage.release('word-swap')
      }
    }
    if (this.morphT < 1) {
      this.morphT = Math.min(1, this.morphT + dt / MORPH_S)
      this.caustic.inputs.morph = this.morphT
      if (this.morphT >= 1) stage.release('word-morph')
    }
  }

  setSlopeField(r: Relief) {
    if (this.disposed) return
    const half = new Uint16Array(r.slope.length)
    for (let i = 0; i < r.slope.length; i++) half[i] = THREE.DataUtils.toHalfFloat(r.slope[i])
    this.slopeTex?.dispose()
    const tex = new THREE.DataTexture(half, r.width, r.height, THREE.RGBAFormat, THREE.HalfFloatType)
    tex.magFilter = THREE.LinearFilter
    tex.minFilter = THREE.LinearFilter
    tex.colorSpace = THREE.NoColorSpace
    tex.needsUpdate = true
    this.slopeTex = tex
    // upload now, not in the first frame that shows the pane (4.2: no first use mid-scroll)
    if (!this.contextLost) this.gl.initTexture(tex)
    const u = paneChunk.uniforms.uSlope
    if (u) u.value = tex
    stage.requestRender(2)
  }

  private stillPass: CausticPass | null = null

  /**
   * Save-the-image render (6.4.4): the caustic pass and the compositor into an offscreen RGBA8
   * target, patch centred at 80% of the width, skew from the sun's altitude, word formed, grain
   * seed 1; read back asynchronously and flipped into an ImageData. The live frame is untouched
   * (every uniform is rewritten by the next frame).
   */
  async renderStill(opts: Parameters<StageApiImpl['renderStill']>[0]): Promise<ImageData> {
    if (this.disposed || this.contextLost || this.gl.getContext().isContextLost()) throw new Error('renderStill: the WebGL context is not available')
    const gl = this.gl
    const W = Math.max(16, Math.round(opts.width))
    const H = Math.max(16, Math.round(opts.height))
    // geometry: a single light (write-yours), centred, 80% of the width, the chapter's aspect
    const alt = light.visitor.alt
    const skew = skewFromAltitude(alt)
    const pw = 0.8 * W
    const ph = Math.min(0.62 * H, pw / 1.48)
    const P: Patch = { x: (W - pw) / 2, y: (H - ph) / 2, w: pw, h: ph, skew, split: 0, transom: 0, mullion: 0, on: 1 }
    const lower = lowerOf(0, 0)
    const lsz = lowerSizePx(P, lower)
    const wr = wordRectFor(lsz.w, lsz.h, 'stacked')
    // caustic: a dedicated pass so the live word is never disturbed
    if (!this.stillPass) {
      this.stillPass = new CausticPass()
      this.stillPass.init(gl)
    }
    const sp = this.stillPass
    sp.setTier({ ...this.causticTier(), looseOpt: false, rgba8: false })
    sp.setTransport(opts.transport, 'swap')
    Object.assign(sp.inputs, { focus: 1, wave: 0.04, time: 0.7, morph: 1, sunX: 0, sunY: 0, aberr: 0, pointScale: 1, prism: opts.glass === 'prismatic' ? 1 : 0, wordRect: wr, lowerW: lsz.w, lowerH: lsz.h })
    sp.invalidate()
    sp.render(gl)
    // light for the hour
    const sun = sunLinearAt(opts.hour)
    const horizon = Math.min(1, Math.max(0, alt / 6))
    const hz = horizon * horizon * (3 - 2 * horizon)
    const sunRad: RGB3 = [sun.rgb[0] * sun.e * hz, sun.rgb[1] * sun.e * hz, sun.rgb[2] * sun.e * hz]
    const sky = calibrateSky({ shade: shadeLinearAt(opts.hour) as RGB3, calUv: [0.5, 0.08], viewport: { w: W, h: H }, albedo: ALBEDO, plaster: this.plaster })
    const target = new THREE.WebGLRenderTarget(W, H, { type: THREE.UnsignedByteType, format: THREE.RGBAFormat, depthBuffer: false, stencilBuffer: false, generateMipmaps: false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter })
    target.texture.colorSpace = THREE.NoColorSpace
    const U = this.comp.uniforms
    ;(U.uViewport.value as THREE.Vector2).set(W, H)
    ;(U.uBuffer.value as THREE.Vector2).set(W, H)
    U.uDpr.value = 1
    U.uTime.value = 0.7
    ;(U.uSky.value as THREE.Vector3).set(sky[0], sky[1], sky[2])
    ;(U.uSun.value as THREE.Vector3).set(sunRad[0], sunRad[1], sunRad[2])
    ;(U.uPatch.value as THREE.Vector4).set(P.x, P.y, P.w, P.h)
    U.uSkew.value = P.skew
    U.uSplit.value = 0
    U.uTransom.value = 0
    U.uMullion.value = 0
    U.uPatchOn.value = 1
    ;(U.uLower.value as THREE.Vector4).set(0, 0, 1, 1)
    U.uCaustic.value = sp.texture
    U.uCausticOn.value = 1
    U.uCausticMix.value = 1
    U.uCausticGain.value = 1
    ;(U.uCausticSize.value as THREE.Vector2).set(sp.rtSize.w, sp.rtSize.h)
    U.uFill.value = 0.07
    U.uShimmer.value = 0
    U.uScrimCount.value = 0
    U.uScrimFeather.value = 32
    U.uWallCloud.value = 1
    U.uHaze.value = 0
    U.uHalation.value = 1
    U.uDefocus.value = 0
    U.uSkirting.value = -1
    this.comp.setModes('wall', 'wall', 0)
    U.uGrainSeed.value = 1
    const prev = gl.getRenderTarget()
    gl.setRenderTarget(target)
    this.comp.render(gl)
    gl.setRenderTarget(prev)
    const buf = new Uint8Array(W * H * 4)
    try {
      await gl.readRenderTargetPixelsAsync(target, 0, 0, W, H, buf)
    } finally {
      target.dispose()
      stage.requestRender(2)
    }
    const out = new Uint8ClampedArray(W * H * 4)
    const row = W * 4
    for (let y = 0; y < H; y++) out.set(buf.subarray((H - 1 - y) * row, (H - y) * row), y * row)
    return new ImageData(out, W, H)
  }

  /**
   * The hero's baked word when nobody requested it (the first frame must hold the word; WP3's
   * loadBaked streams boot 'light' and computes the word in the worker if the file fails). Ingrid is
   * requested by the Appointment controller alone, and loadBaked holds its fetch until the intro has
   * settled (9.1 initial transfer). Cached per id in client.ts.
   */
  async ensureBakedTransports() {
    try {
      if (!this.transports.has('first-light')) {
        const t = await loadBaked('aslant')
        if (this.disposed) return
        if (!this.transports.has('first-light')) stageApi.requestTransport('first-light', t)
      }
    } catch (err) {
      console.error('[scene] baked light data failed', err)
    }
  }

  // ── per frame ──
  frame(dt: number) {
    const gl = this.gl
    const L = light
    const vw = Math.max(1, L.viewport.w)
    const vh = Math.max(1, L.viewport.h)
    const dpr = gl.getPixelRatio()
    gl.getDrawingBufferSize(this.buf)
    const reduced = motion() === 'reduced'
    const U = this.comp.uniforms

    // geometry: the conductor's patch, or the hero rest patch until it has written one (after that
    // a zero-sized patch simply means no patch in view)
    const P = this.patch
    if (L.patch.w > 0) this.conductorSeen = true
    const own = this.conductorSeen
    if (own) {
      Object.assign(P, L.patch)
      if (P.w <= 0 || P.h <= 0) P.on = 0
    } else heroPatch(vw, vh, P)
    if (own) Object.assign(this.lower, L.lower)
    else lowerOf(P.split, P.transom, this.lower)
    const lsz = lowerSizePx(P, this.lower)
    if (own) Object.assign(this.wordRect, L.wordRect)
    else wordRectFor(lsz.w, lsz.h, vw >= 1024 && vw / vh >= 0.9 ? 'split' : 'stacked', this.wordRect)
    let skirt = L.skirtingY
    if (!own) skirt = vw >= 1024 && vw / vh >= 0.9 ? 0.965 : 0.975

    // beam: the conductor's hexagon or ours
    let beamSet = false
    for (let i = 0; i < 12; i++) if (L.beam[i] !== 0) { beamSet = true; break }
    const beam = beamSet ? L.beam : beamHexagon(P, vh, this.beam)

    // word and caustic inputs
    const wallWeight = (L.modeA === 'wall' ? 1 - L.modeMix : 0) + (L.modeB === 'wall' ? L.modeMix : 0)
    const onScreen = P.x < vw && P.x + P.w > 0 && P.y < vh && P.y + P.h > 0
    const wordOn = !!L.word.id && P.on > 0.001 && wallWeight > 0.001 && onScreen
    this.selectTransport(dt, wordOn)
    const hasWord = wordOn && this.caustic.n > 0
    const ci = this.caustic.inputs
    const effFocus = Math.min(L.word.focus, this.cap)
    ci.focus = effFocus
    ci.wave = L.word.wave
    ci.time = L.time
    ci.sunX = L.sun.x
    ci.sunY = L.sun.y
    ci.aberr = L.sun.aberr
    ci.pointScale = L.word.pointScale > 0 ? L.word.pointScale : 1
    ci.prism = L.word.prism
    ci.wordRect = this.wordRect
    ci.lowerW = lsz.w
    ci.lowerH = lsz.h
    if (this.caustic.drawn !== this.caustic.n && this.caustic.n > 0 && effFocus <= 0.2 && this.morphT >= 1) this.caustic.settleCount()

    // shimmer (WP4): 0 when idle, under Still air or with no word in view
    L.shimmer = stage.idle || reduced || !wordOn ? 0 : 1

    // room calibration (6.1.5): only when the target, the point or the canvas changes
    const shadeSet = L.shade.r + L.shade.g + L.shade.b > 0
    const target: RGB3 = shadeSet ? [L.shade.r, L.shade.g, L.shade.b] : SHADE_DEFAULT
    const calU = shadeSet ? L.shade.u : vw >= 1024 && vw / vh >= 0.9 ? 0.25 : 0.5
    const calV = shadeSet ? L.shade.v : vw >= 1024 && vw / vh >= 0.9 ? 0.62 : 0.72
    const cloud = 1 - 0.8 * L.cloud
    const sun: RGB3 = [L.sun.r * L.sun.e * cloud, L.sun.g * L.sun.e * cloud, L.sun.b * L.sun.e * cloud]
    const haze = this.gpuTier === 3 ? HAZE : 0
    const key = [target[0], target[1], target[2], calU, calV, vw, vh, haze, beam[0], beam[1], beam[4], beam[5], haze > 0 ? sun[0] + sun[1] + sun[2] : 0]
    if (this.skyChanged(key)) {
      calibrateSky({ shade: target, calUv: [calU, calV], viewport: { w: vw, h: vh }, albedo: ALBEDO, plaster: this.plaster, beam: haze > 0 ? { hex: beam, haze, sun } : undefined }, this.sky)
      this.skyKey = key
    }

    // caustic pass (only when a word pane is visible, not flat glass, and its inputs changed)
    const causticMix = Math.min(1, Math.max(0, Math.max(effFocus, L.word.wave) / 0.15))
    if (causticMix > 0 && (hasWord || (wordOn && this.caustic.n === 0))) {
      const before = this.caustic.renders
      this.caustic.render(gl)
      if (this.caustic.renders !== before) this.stats.causticRenders++
    }

    // compositor uniforms
    ;(U.uViewport.value as THREE.Vector2).set(vw, vh)
    ;(U.uBuffer.value as THREE.Vector2).copy(this.buf)
    U.uDpr.value = this.buf.y / vh
    U.uTime.value = L.time
    ;(U.uAlbedo.value as THREE.Vector3).set(ALBEDO[0], ALBEDO[1], ALBEDO[2])
    ;(U.uSky.value as THREE.Vector3).set(this.sky[0], this.sky[1], this.sky[2])
    ;(U.uSun.value as THREE.Vector3).set(sun[0], sun[1], sun[2])
    ;(U.uPatch.value as THREE.Vector4).set(P.x, P.y, P.w, P.h)
    U.uSkew.value = P.skew
    U.uSplit.value = P.split
    U.uTransom.value = P.transom
    U.uMullion.value = P.mullion
    U.uPatchOn.value = P.on * (L.ember.on > 0 ? 1 : 0)
    ;(U.uLower.value as THREE.Vector4).set(this.lower.u0, this.lower.v0, this.lower.u1, this.lower.v1)
    U.uCaustic.value = this.caustic.texture
    U.uCausticOn.value = wordOn && this.caustic.texture ? 1 : 0
    // Flat glass (focus and wave both near 0, e.g. commission at rest) is plain light: the discrete
    // splats would only add sampling noise, so the computed caustic fades in over the first 0.15.
    U.uCausticMix.value = causticMix
    U.uCausticGain.value = this.causticTier().rgba8 ? 4 : 1
    ;(U.uCausticSize.value as THREE.Vector2).set(this.caustic.rtSize.w || 1024, this.caustic.rtSize.h || 512)
    U.uFill.value = L.word.id ? 0.07 : 1
    U.uShimmer.value = L.shimmer
    U.uScrims.value = L.scrims
    U.uScrimCount.value = Math.min(8, L.scrimCount)
    U.uScrimW.value = scrimShade.strength
    // 4.3 passing cloud, extended to focus pulls (wall <-> pane or bench): defocus is sin^2(pi blend)
    // there and 0 elsewhere, so the wall's sun dips by 0.8 sin(pi blend) and a text box never cuts a
    // hard-edged hole into full sun while the light moves. The scrim feather widens from 32 px at
    // rest to 72 px at the peak of any blend, so a cut edge reads as a soft shadow.
    const pull = Math.sqrt(Math.max(0, Math.min(1, L.defocus)))
    U.uWallCloud.value = 1 - 0.8 * pull
    // ...and while the page carries text across a light that holds (scrimShade.motion: the exact
    // scroll off every weighted chapter's rest), so a box passing over a word shades it softly.
    // Up to 96 px then: wide enough that a caustic letter at several times the sun fades out under
    // it instead of stopping at the box's straight edge.
    U.uScrimFeather.value = 32 + Math.max(40 * Math.max(pull, Math.min(1, Math.max(0, L.cloud))), 64 * scrimShade.motion)
    U.uBeamEdges.value = beamEdges(beam, this.edges)
    U.uHaze.value = haze
    U.uHalation.value = this.gpuTier === 3 && !this.causticTier().rgba8 ? 1 : 0
    U.uDefocus.value = L.defocus
    U.uSkirting.value = skirt >= 0 ? skirt * vh : -1
    this.comp.setModes(L.modeA, L.modeB, L.modeMix)
    U.uGrainSeed.value = L.grainSeed
    this.comp.updateChunks(L, dt)

    gl.setRenderTarget(null)
    // Warm-up (4.2): compileAsync links the programs, but the GPU pipeline of a program and the
    // textures it samples are only built on its first draw. The full compositor (pane and bench
    // chunks; every mode combination is a uniform of this one program) and the bench rays are
    // otherwise first drawn mid-scroll, in clear-glass and the bend, so the first compiled frame
    // draws both once into the canvas (the rays at zero weight); the compositor draw below then
    // covers every pixel.
    if (!this.warmed && this.compiled) {
      this.warmed = true
      this.comp.renderFull(gl)
      this.bench.warm(gl)
    }
    this.comp.render(gl)
    if (this.bench.visible()) this.bench.render(gl)

    // dust: tier >= 2, full motion, a patch in view
    const dustOn = !reduced && P.on > 0.01 && onScreen && wallWeight > 0.5
    stage.ambient('dust', dustOn)
    if (dustOn && this.dust.visible()) {
      const D = this.dust.uniforms
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
      for (let i = 0; i < 6; i++) {
        minX = Math.min(minX, beam[i * 2]); maxX = Math.max(maxX, beam[i * 2])
        minY = Math.min(minY, beam[i * 2 + 1]); maxY = Math.max(maxY, beam[i * 2 + 1])
      }
      minX = Math.max(minX, 0); minY = Math.max(minY, 0); maxX = Math.min(maxX, vw); maxY = Math.min(maxY, vh)
      if (maxX > minX && maxY > minY) {
        ;(D.uBox.value as THREE.Vector4).set(minX, minY, maxX - minX, maxY - minY)
        ;(D.uBuffer.value as THREE.Vector2).copy(this.buf)
        D.uDpr.value = this.buf.y / vh
        D.uTime.value = L.time
        D.uAir.value = L.air
        D.uBeam.value = beam
        ;(D.uPatchC.value as THREE.Vector2).set(P.x + P.w / 2, P.y + P.h / 2)
        const [dx, dy] = beamDirection(P.skew)
        ;(D.uBeamDir.value as THREE.Vector2).set(dx, dy)
        D.uBeamLen.value = 1.4 * vh
        const e = 0.14 * P.on * cloud * Math.min(1, L.sun.e / 1.4)
        ;(D.uSunDisplay.value as THREE.Vector3).set(Math.sqrt(Math.min(1, L.sun.r)) * e, Math.sqrt(Math.min(1, L.sun.g)) * e, Math.sqrt(Math.min(1, L.sun.b)) * e)
        this.dust.render(gl)
      }
    }
    if (this.rays.visible()) this.rays.render(gl)

    this.stats.frames++
    this.stats.lastFrameAt = performance.now()
    if (!this.firstFrameDone && this.compiled) {
      this.firstFrameDone = true
      boot.report('frame', 1)
      if (useApp.getState().webgl === 'pending') useApp.getState().setWebgl('ready')
    }
    void dpr
  }

  /** Synchronous GPU throughput probe for the G1 harness: ms per compositor and per caustic render. */
  benchmark(n = 40): { compositorMs: number; causticMs: number; causticLooseMs: number; frameLooseMs: number; frameFormingMs: number } {
    const gl = this.gl
    const ctx = gl.getContext()
    const px = new Uint8Array(4)
    const sync = () => {
      gl.setRenderTarget(null)
      ctx.readPixels(0, 0, 1, 1, ctx.RGBA, ctx.UNSIGNED_BYTE, px)
    }
    sync()
    const t0 = performance.now()
    for (let i = 0; i < n; i++) {
      gl.setRenderTarget(null)
      this.comp.render(gl)
    }
    sync()
    const compositorMs = (performance.now() - t0) / n
    const ci = this.caustic.inputs
    const saved = { focus: ci.focus, wave: ci.wave, time: ci.time }
    const run = (focus: number, wave: number) => {
      ci.focus = focus
      ci.wave = wave
      sync()
      const t = performance.now()
      for (let i = 0; i < n; i++) {
        ci.time += 0.016
        this.caustic.invalidate()
        this.caustic.render(gl)
      }
      sync()
      return (performance.now() - t) / n
    }
    const causticMs = run(0.7, 0.3)
    const causticLooseMs = run(0, 1)
    // Whole frames (caustic + mipmaps + compositor + dust), synchronised at the end.
    const wordSaved = { focus: light.word.focus, wave: light.word.wave, time: light.time }
    const whole = (focus: number, wave: number) => {
      light.word.focus = focus
      light.word.wave = wave
      sync()
      const t = performance.now()
      for (let i = 0; i < n; i++) {
        light.time += 0.016
        this.frame(1 / 60)
      }
      sync()
      return (performance.now() - t) / n
    }
    const frameLooseMs = whole(0, 1)
    const frameFormingMs = whole(0.7, 0.3)
    // CPU only (no sync): the JS cost of frame()
    light.word.focus = 0
    light.word.wave = 1
    sync()
    let tc = performance.now()
    for (let i = 0; i < n; i++) {
      light.time += 0.016
      this.frame(1 / 60)
    }
    const frameCpuMs = (performance.now() - tc) / n
    sync()
    tc = performance.now()
    for (let i = 0; i < n; i++) {
      light.time += 0.016
      this.caustic.inputs.time = light.time
      this.caustic.render(gl)
      gl.setRenderTarget(null)
      this.comp.render(gl)
    }
    sync()
    const pairMs = (performance.now() - tc) / n
    // Serialised pieces: sync after each (includes one round trip each)
    const piece = { caustic: 0, comp: 0, dust: 0, none: 0 }
    for (let i = 0; i < n; i++) {
      light.time += 0.016
      this.caustic.inputs.time = light.time
      this.caustic.invalidate()
      sync()
      let a = performance.now()
      sync()
      piece.none += performance.now() - a
      a = performance.now()
      this.caustic.render(gl)
      sync()
      piece.caustic += performance.now() - a
      a = performance.now()
      gl.setRenderTarget(null)
      this.comp.render(gl)
      sync()
      piece.comp += performance.now() - a
      a = performance.now()
      this.dust.render(gl)
      sync()
      piece.dust += performance.now() - a
    }
    for (const k of Object.keys(piece) as Array<keyof typeof piece>) piece[k] = +(piece[k] / n).toFixed(3)
    ;(this as unknown as { lastBench: unknown }).lastBench = { frameCpuMs, pairMs, piece, loose: this.caustic.looseActive }
    Object.assign(light.word, { focus: wordSaved.focus, wave: wordSaved.wave })
    light.time = wordSaved.time
    Object.assign(ci, saved)
    this.caustic.invalidate()
    stage.requestRender(2)
    return { compositorMs, causticMs, causticLooseMs, frameLooseMs, frameFormingMs, ...((this as unknown as { lastBench: object }).lastBench) } as ReturnType<SceneRuntime['benchmark']>
  }

  private skyChanged(key: number[]): boolean {
    const a = this.skyKey
    if (a.length !== key.length) return true
    for (let i = 0; i < 3; i++) if (Math.abs(a[i] - key[i]) > 0.0025 * Math.max(key[i], 1e-4)) return true
    for (let i = 3; i < key.length; i++) if (Math.abs(a[i] - key[i]) > 1e-3) return true
    return false
  }

  resize(w: number, h: number, dpr: number) {
    this.comp.resize(w, h, dpr)
    this.dust.resize()
    this.bench.resize()
    this.rays.resize(w, h, dpr)
  }

  dispose() {
    this.disposed = true
    stage.ambient('dust', false)
    stage.release('word-swap')
    stage.release('word-morph')
    if (this.contextLost || this.gl.getContext().isContextLost()) return
    this.caustic.dispose()
    this.comp.dispose()
    this.dust.dispose()
    this.bench.dispose()
    this.rays.dispose()
    this.plasterTex.dispose()
    this.slopeTex?.dispose()
    this.stillPass?.dispose()
  }
}

let current: SceneRuntime | null = null
/** The mounted runtime (G1 harness, ?qa hooks). */
export function sceneRuntime(): SceneRuntime | null {
  return current
}

export default function Scene() {
  const gl = useThree((s) => s.gl)
  const setDpr = useThree((s) => s.setDpr)
  const runtime = useRef<SceneRuntime | null>(null)

  useEffect(() => {
    const rt = new SceneRuntime(gl)
    rt.setDpr = setDpr
    runtime.current = rt
    current = rt
    stageApi.__register(rt.impl)
    const offQuality = stage.onQuality((step) => rt.setTier(step.gpuTier))
    let alive = true
    rt.compile()
      .then(() => {
        if (!alive) return
        boot.report('shaders', 1)
        stage.requestRender(2)
      })
      .catch((err) => {
        console.error('[scene] shader compile failed', err)
        useApp.getState().setWebgl('failed')
      })
    void rt.ensureBakedTransports()
    stage.requestRender(2)
    return () => {
      alive = false
      offQuality()
      stageApi.__unregister(rt.impl)
      rt.dispose()
      if (current === rt) current = null
      runtime.current = null
    }
  }, [gl, setDpr])

  useFrame((_, delta) => {
    const rt = runtime.current
    if (!rt) return
    rt.frame(Math.min(Math.max(delta, 0), 1 / 30))
  }, 1)

  return null
}
