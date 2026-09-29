// Caustic pass (brief 6.1.2): one THREE.Points geometry of up to 65,536 rays drawn once per
// wavelength band (K materials sharing one program, each with its own uDispersion and uBandRGB)
// into a half-float target covering lower-light space, additive ONE/ONE, cleared to 0, mipmapped
// after each render for defocus and halation. Re-renders only when an input changes.
import * as THREE from 'three'
import type { Pass } from '@/webgl/pass'
import type { Transport } from '@/webgl/stage-api'
import { bands, bandDispersion, type BandCount } from '@/lib/light/glass'
import { r2Origins } from '@/lib/caustics/r2'
import { CAUSTIC_FRAG, CAUSTIC_VERT } from '@/webgl/shaders/caustic.glsl'

export const MAX_RAYS = 65536

export interface CausticTier {
  K: 8 | 4
  maxRays: number       // rays drawn at most: 65,536 (tier 3) or 32,768 (tier 2); the first n of a bake are a uniform subsample
  rtLong: number        // 1024 (tier 3) or 768 (tier 2)
  pointMax: number      // 24 or 16 px
  looseOpt: boolean     // K = 3 and RT long side 768 while focus < 0.5
  rgba8: boolean        // fallback when half-float blending fails: RGBA8, gain x 0.25
}

export const TIER_SETTINGS: Record<2 | 3, CausticTier> = {
  3: { K: 8, maxRays: 65536, rtLong: 1024, pointMax: 24, looseOpt: true, rgba8: false },
  2: { K: 4, maxRays: 32768, rtLong: 768, pointMax: 16, looseOpt: true, rgba8: false },
}

/** Inputs the Scene writes before render(); the pass diffs them against the last render. */
export interface CausticInputs {
  focus: number
  wave: number
  time: number
  morph: number
  sunX: number
  sunY: number
  aberr: number
  pointScale: number
  prism: number
  wordRect: { x: number; y: number; w: number; h: number }
  lowerW: number        // lower light, un-sheared CSS px (the target's aspect)
  lowerH: number
}

type Band = { points: THREE.Points; mat: THREE.ShaderMaterial }

/**
 * MOT-1: the first streamed frames of a live word are a slab (the light gathered into the word's
 * box before it cracks along the letter gaps). Its radiance sits where the tone curve is steep, so
 * at full energy it reads far brighter than the formed letters and every keystroke flashed white.
 * Streamed frames carry less energy, back to 1 at the final live iteration (and for every baked word).
 */
/** client.ts LIVE_ITERS (not imported: this pass stays free of the worker client). */
const FINAL_LIVE_ITERS = 96

function formEnergy(iters: number): number {
  if (!(iters > 0)) return 1
  const k = Math.min(1, Math.max(0, (iters - 24) / (FINAL_LIVE_ITERS - 24)))
  return 1 - 0.45 * (1 - k * k * (3 - 2 * k))
}

export class CausticPass implements Pass {
  readonly geometry = new THREE.BufferGeometry()
  readonly scene = new THREE.Scene()
  readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  readonly inputs: CausticInputs = {
    focus: 0, wave: 1, time: 0, morph: 1, sunX: 0, sunY: 0, aberr: 0, pointScale: 1, prism: 0,
    wordRect: { x: 0.07, y: 0.2, w: 0.86, h: 0.6 }, lowerW: 640, lowerH: 430,
  }
  tier: CausticTier = TIER_SETTINGS[3]
  /** Rays in the current transport (0 = none yet: the lower light shows loose pool light). */
  n = 0
  /** Rays drawn (a morph between different counts runs over the smaller one). */
  drawn = MAX_RAYS
  /** Incremented on every transport upload. */
  version = 0
  /** Last rendered target (the compositor samples it). */
  texture: THREE.Texture | null = null
  rtSize = { w: 0, h: 0 }
  bandsDrawn = 0
  renders = 0

  /** Energy of the previous and current transport (formEnergy), mixed by the morph. */
  private energyPrev = 1
  private energyCur = 1

  private readonly origins = r2Origins(MAX_RAYS)
  private readonly target = new Float32Array(2 * MAX_RAYS)
  private readonly prev = new Float32Array(2 * MAX_RAYS)
  private readonly density = new Float32Array(MAX_RAYS)
  private readonly aTarget: THREE.BufferAttribute
  private readonly aTargetPrev: THREE.BufferAttribute
  private readonly aDensity: THREE.BufferAttribute
  private readonly shared: Record<string, THREE.IUniform>
  private full: Band[] = []
  private loose: Band[] = []
  private rtFull: THREE.WebGLRenderTarget | null = null
  private rtLoose: THREE.WebGLRenderTarget | null = null
  private pointRange = 64
  private lastKey: number[] = []
  private frozenTime = 0
  private lastAspect = 0
  private clearColor = new THREE.Color()

  constructor() {
    this.geometry.setAttribute('aOrigin', new THREE.BufferAttribute(this.origins, 2))
    // Before any transport the targets equal the origins in raster space (identity pool light).
    this.aTarget = new THREE.BufferAttribute(this.target, 2).setUsage(THREE.DynamicDrawUsage)
    this.aTargetPrev = new THREE.BufferAttribute(this.prev, 2).setUsage(THREE.DynamicDrawUsage)
    this.density.fill(1)
    this.aDensity = new THREE.BufferAttribute(this.density, 1).setUsage(THREE.DynamicDrawUsage)
    this.geometry.setAttribute('aTarget', this.aTarget)
    this.geometry.setAttribute('aTargetPrev', this.aTargetPrev)
    this.geometry.setAttribute('aDensity', this.aDensity)
    this.geometry.setDrawRange(0, MAX_RAYS)
    this.shared = {
      uFocus: { value: 0 }, uWave: { value: 1 }, uTime: { value: 0 }, uMorph: { value: 1 },
      uSpacing: { value: 2 }, uPointMax: { value: 24 }, uAberr: { value: 0 }, uPointScale: { value: 1 },
      uSunOffset: { value: new THREE.Vector2() }, uWordRect: { value: new THREE.Vector4(0.07, 0.2, 0.86, 0.6) },
      uNorm: { value: 1 },
      uEnergy: { value: 1 },
      uTarget: { value: new THREE.Vector2(1024, 512) },
    }
    this.buildBands()
  }

  private makeBands(K: BandCount, visible: boolean): Band[] {
    return bands(K).map((b) => {
      const mat = new THREE.ShaderMaterial({
        vertexShader: CAUSTIC_VERT,
        fragmentShader: CAUSTIC_FRAG,
        uniforms: { ...this.shared, uDispersion: { value: 1 }, uBandRGB: { value: new THREE.Vector3(...b.rgb) } },
        blending: THREE.CustomBlending,
        blendEquation: THREE.AddEquation,
        blendSrc: THREE.OneFactor,
        blendDst: THREE.OneFactor,
        blendEquationAlpha: THREE.AddEquation,
        blendSrcAlpha: THREE.OneFactor,
        blendDstAlpha: THREE.OneFactor,
        depthTest: false,
        depthWrite: false,
        transparent: true,
      })
      const points = new THREE.Points(this.geometry, mat)
      points.frustumCulled = false
      points.visible = visible
      points.matrixAutoUpdate = false
      this.scene.add(points)
      return { points, mat }
    })
  }

  private buildBands() {
    for (const b of [...this.full, ...this.loose]) {
      this.scene.remove(b.points)
      b.mat.dispose()
    }
    this.full = this.makeBands(this.tier.K, true)
    this.loose = this.makeBands(3, false)
    this.lastKey = []
  }

  setTier(t: CausticTier) {
    const rebuild = t.K !== this.tier.K
    const realloc = t.rtLong !== this.tier.rtLong || t.rgba8 !== this.tier.rgba8
    this.tier = t
    if (this.n > 0) {
      this.n = Math.min(this.n, t.maxRays)
      this.drawn = Math.min(this.drawn, this.n)
    }
    if (rebuild) this.buildBands()
    if (realloc) this.disposeTargets()
    this.lastKey = []
  }

  init(gl: THREE.WebGLRenderer): void {
    const ctx = gl.getContext()
    const range = ctx.getParameter(ctx.ALIASED_POINT_SIZE_RANGE) as Float32Array | number[] | null
    this.pointRange = range && range.length > 1 ? Number(range[1]) : 64
  }

  /** Every material the pass can draw with (compileAsync before ready). */
  materials(): THREE.Material[] {
    return [...this.full, ...this.loose].map((b) => b.mat)
  }

  /** Upload a transport: 'swap' sets both attributes; 'morph' starts from the current effective targets. */
  setTransport(t: Transport, mode: 'swap' | 'morph') {
    const n = Math.min(MAX_RAYS, this.tier.maxRays, t.n, t.targets.length >> 1, t.density.length)
    const e = formEnergy(t.iters)
    if (mode === 'morph' && this.n > 0) {
      const m = this.inputs.morph
      this.energyPrev = this.energyPrev + (this.energyCur - this.energyPrev) * m
      this.energyCur = e
      const count = 2 * Math.max(this.n, n)
      for (let i = 0; i < count; i++) this.prev[i] = this.prev[i] + (this.target[i] - this.prev[i]) * m
      this.target.set(t.targets.subarray(0, 2 * n))
      this.inputs.morph = 0
      this.drawn = Math.min(this.n, n)
    } else {
      this.energyPrev = e
      this.energyCur = e
      this.target.set(t.targets.subarray(0, 2 * n))
      this.prev.set(t.targets.subarray(0, 2 * n))
      this.inputs.morph = 1
      this.drawn = n
    }
    this.density.set(t.density.subarray(0, n))
    this.n = n
    this.version++
    this.markRange(this.aTarget, 2 * n)
    this.markRange(this.aTargetPrev, 2 * n)
    this.markRange(this.aDensity, n)
    this.lastKey = []
  }

  /** Forces the next render() to draw (benchmarks, context restore). */
  invalidate() {
    this.lastKey = []
  }

  /** After a morph has finished, draw every ray of the current transport. */
  settleCount() {
    if (this.drawn !== this.n && this.n > 0) {
      this.drawn = this.n
      this.lastKey = []
    }
  }

  private markRange(attr: THREE.BufferAttribute, count: number) {
    attr.clearUpdateRanges()
    attr.addUpdateRange(0, count)
    attr.needsUpdate = true
  }

  visible(): boolean {
    return true
  }

  private ensureTarget(loose: boolean): THREE.WebGLRenderTarget {
    const a = this.inputs.lowerW / Math.max(1, this.inputs.lowerH)
    if (this.lastAspect > 0 && Math.abs(a / this.lastAspect - 1) > 0.15) this.disposeTargets()
    const long = loose ? Math.min(768, this.tier.rtLong) : this.tier.rtLong
    const existing = loose ? this.rtLoose : this.rtFull
    if (existing) return existing
    this.lastAspect = a
    let w: number, h: number
    if (a >= 1) { w = long; h = long / a } else { h = long; w = long * a }
    // Multiples of 32, so mips 1 to 5 are exact halvings: an odd level would shift the coarse mips
    // (halation, defocus) by up to half a texel and draw a ghost of the word down and to the right.
    w = Math.min(1024, Math.max(256, Math.round(w / 32) * 32))
    h = Math.min(1024, Math.max(256, Math.round(h / 32) * 32))
    const rt = new THREE.WebGLRenderTarget(w, h, {
      type: this.tier.rgba8 ? THREE.UnsignedByteType : THREE.HalfFloatType,
      format: THREE.RGBAFormat,
      minFilter: THREE.LinearMipmapLinearFilter,
      magFilter: THREE.LinearFilter,
      generateMipmaps: true,
      depthBuffer: false,
      stencilBuffer: false,
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
    })
    rt.texture.colorSpace = THREE.NoColorSpace
    if (loose) this.rtLoose = rt
    else this.rtFull = rt
    return rt
  }

  private disposeTargets() {
    this.rtFull?.dispose()
    this.rtLoose?.dispose()
    this.rtFull = null
    this.rtLoose = null
    this.texture = null
    this.lastKey = []
  }

  /** Current target size for the given phase (stats overlay). */
  get looseActive(): boolean {
    return this.tier.looseOpt && this.effectiveFocus() < 0.5
  }

  private effectiveFocus(): number {
    return this.n > 0 ? this.inputs.focus : 0
  }

  /** True when the inputs differ from the last render (or nothing was rendered yet). */
  needsRender(): boolean {
    return !this.texture || !this.sameKey(this.key())
  }

  private settled(): boolean {
    const i = this.inputs
    return this.effectiveFocus() >= 0.98 && i.wave <= 0.05
  }

  private key(): number[] {
    const i = this.inputs
    const w = i.wordRect
    if (!this.settled()) this.frozenTime = i.time
    return [
      this.effectiveFocus(), i.wave, this.frozenTime, i.morph, i.sunX, i.sunY, i.aberr, i.pointScale, i.prism,
      w.x, w.y, w.w, w.h, this.drawn, this.version, this.looseActive ? 1 : 0, this.tier.K, this.tier.rtLong,
      this.tier.pointMax, this.tier.rgba8 ? 1 : 0, Math.round((i.lowerW / Math.max(1, i.lowerH)) * 1000),
    ]
  }

  private sameKey(k: number[]): boolean {
    const a = this.lastKey
    if (a.length !== k.length) return false
    for (let j = 0; j < k.length; j++) if (Math.abs(a[j] - k[j]) > 1e-6) return false
    return true
  }

  render(gl: THREE.WebGLRenderer): void {
    const key = this.key()
    if (this.texture && this.sameKey(key)) return
    this.lastKey = key
    const i = this.inputs
    const loose = this.looseActive
    const rt = this.ensureTarget(loose)
    const set = loose ? this.loose : this.full
    const other = loose ? this.full : this.loose
    for (const b of other) b.points.visible = false
    const K = (loose ? 3 : this.tier.K) as BandCount
    const disp = bandDispersion(K, i.prism)
    set.forEach((b, j) => {
      b.points.visible = true
      b.mat.uniforms.uDispersion.value = disp[j]
    })
    const n = Math.max(1, this.n > 0 ? this.drawn : MAX_RAYS)
    const s = this.shared
    s.uFocus.value = this.effectiveFocus()
    s.uWave.value = this.n > 0 ? i.wave : Math.max(i.wave, 0.6)
    s.uTime.value = this.frozenTime
    s.uMorph.value = i.morph
    s.uEnergy.value = this.n > 0 ? this.energyPrev + (this.energyCur - this.energyPrev) * i.morph : 1
    s.uAberr.value = i.aberr
    s.uPointScale.value = i.pointScale
    ;(s.uSunOffset.value as THREE.Vector2).set(i.sunX, i.sunY)
    ;(s.uWordRect.value as THREE.Vector4).set(i.wordRect.x, i.wordRect.y, i.wordRect.w, i.wordRect.h)
    const area = rt.width * rt.height
    ;(s.uTarget.value as THREE.Vector2).set(rt.width, rt.height)
    s.uSpacing.value = Math.sqrt(area / n)
    s.uNorm.value = (area / n) * (this.tier.rgba8 ? 0.25 : 1)
    // The loose target keeps the tier's full clamp: spread cells need wide splats or the R2 lattice shows.
    s.uPointMax.value = Math.min(loose ? this.tier.pointMax : this.tier.pointMax * (Math.max(rt.width, rt.height) / Math.max(this.tier.rtLong, 1)), this.pointRange)
    this.geometry.setDrawRange(0, n)

    const prevTarget = gl.getRenderTarget()
    const prevAuto = gl.autoClear
    gl.getClearColor(this.clearColor)
    const prevAlpha = gl.getClearAlpha()
    gl.autoClear = false
    gl.setRenderTarget(rt)
    gl.setClearColor(0x000000, 0)
    gl.clear(true, false, false)
    gl.render(this.scene, this.camera)
    gl.setRenderTarget(prevTarget)
    gl.setClearColor(this.clearColor, prevAlpha)
    gl.autoClear = prevAuto
    this.texture = rt.texture
    this.rtSize.w = rt.width
    this.rtSize.h = rt.height
    this.bandsDrawn = K
    this.renders++
  }

  /** Render into a caller-owned target with the current inputs (renderStill). */
  renderInto(gl: THREE.WebGLRenderer, rt: THREE.WebGLRenderTarget) {
    const saved = { texture: this.texture, rtFull: this.rtFull, rtLoose: this.rtLoose, loose: this.tier.looseOpt, aspect: this.lastAspect }
    this.rtFull = rt
    this.rtLoose = rt
    this.tier = { ...this.tier, looseOpt: false }
    this.texture = null
    this.lastAspect = 0
    this.render(gl)
    this.rtFull = saved.rtFull
    this.rtLoose = saved.rtLoose
    this.tier = { ...this.tier, looseOpt: saved.loose }
    this.texture = saved.texture
    this.lastKey = []
    this.lastAspect = saved.aspect
  }

  resize(): void {}

  dispose(): void {
    this.disposeTargets()
    for (const b of [...this.full, ...this.loose]) b.mat.dispose()
    this.geometry.dispose()
  }
}
