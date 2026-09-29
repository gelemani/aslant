// Bench rays (brief 4.2 step 3, 5.3, 6.3): instanced soft line quads, additive, drawn after the
// compositor while the bench mode is visible. One quad per traced segment: the incoming ray
// (fading in from the band's edge), its path through the glass, and K band segments from the exit
// face to the wall, which coincide into one white ray until the fan opens. 2 px core with a soft
// 6 px falloff; white rays #FFF5EA at 55%; the picked ray at 100% with a 1.5 px core.
// A plain class that owns its geometry and material (7.6); the Scene holds it.
import * as THREE from 'three'
import type { Pass } from '@/webgl/pass'
import { light } from '@/lib/light-state'
import { liveRect } from '@/lib/anchors'
import { useApp } from '@/lib/store'
import { LAYOUT_SPLIT, LAYOUT_STACKED, SEG_STRIDE, benchCounts, benchSlice, sharedTrace, type BenchTrace } from '@/lib/bench/trace'

const MAX_SEG = (() => {
  const c = benchCounts(3)
  return c.rays * (2 + c.bands)
})()

const VERT = /* glsl */ `
attribute vec4 aP;      // x0 y0 x1 y1, band-local CSS px
attribute vec4 aC;      // colour, opacity
attribute vec2 aS;      // core px, fade-in flag
uniform vec2 uOrigin;   // band origin, viewport CSS px
uniform vec2 uView;     // canvas CSS size
uniform float uFall;    // falloff half-width, px
varying vec4 vC;
varying float vD;
varying float vCore;
varying float vT;
varying float vFade;
void main() {
  vec2 p0 = aP.xy + uOrigin;
  vec2 p1 = aP.zw + uOrigin;
  vec2 d = p1 - p0;
  float len = max(length(d), 1e-3);
  vec2 dir = d / len;
  vec2 nrm = vec2(-dir.y, dir.x);
  float hw = aS.x * 0.5 + uFall;
  float t = position.x;
  float side = position.y;
  vec2 p = p0 + d * t + nrm * side * hw - dir * (1.0 - 2.0 * t) * 0.5;
  vD = side * hw;
  vCore = aS.x;
  vT = t;
  vFade = aS.y;
  vC = aC;
  gl_Position = vec4(p.x / uView.x * 2.0 - 1.0, 1.0 - p.y / uView.y * 2.0, 0.0, 1.0);
}
`

const FRAG = /* glsl */ `
uniform float uWeight;
uniform vec4 uScrims[8];   // text boxes, viewport CSS px (4.3): rays pass behind them in shade
uniform int uScrimCount;
uniform float uDprB;
uniform float uBufH;
varying vec4 vC;
varying float vD;
varying float vCore;
varying float vT;
varying float vFade;
void main() {
  float d = abs(vD);
  float core = 1.0 - smoothstep(vCore * 0.5 - 0.5, vCore * 0.5 + 0.5, d);
  float glow = exp(-0.5 * d * d / 9.0) * 0.09;
  float fade = mix(1.0, smoothstep(0.0, 0.5, vT), vFade);
  vec2 p = vec2(gl_FragCoord.x, uBufH - gl_FragCoord.y) / uDprB;
  float m = 0.0;
  for (int i = 0; i < 8; i++) {
    if (i >= uScrimCount) break;
    vec4 r = uScrims[i];
    vec2 q = max(max(r.xy - p, p - (r.xy + r.zw)), 0.0);
    m = max(m, 1.0 - smoothstep(0.0, 6.0, length(q)));      // a tight feather: labels beside the rays stay clear
  }
  float a = (core + glow) * vC.a * fade * uWeight * mix(1.0, 0.015, m);
  gl_FragColor = vec4(vC.rgb * a, 1.0);
}
`

export class BenchPass implements Pass {
  readonly scene = new THREE.Scene()
  readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  private readonly geometry = new THREE.InstancedBufferGeometry()
  private readonly material: THREE.ShaderMaterial
  private readonly mesh: THREE.Mesh
  private readonly aP = new Float32Array(MAX_SEG * 4)
  private readonly aC = new Float32Array(MAX_SEG * 4)
  private readonly aS = new Float32Array(MAX_SEG * 2)
  private readonly attrP: THREE.InstancedBufferAttribute
  private readonly attrC: THREE.InstancedBufferAttribute
  private readonly attrS: THREE.InstancedBufferAttribute
  private readonly uniforms: Record<string, THREE.IUniform>
  private filled: BenchTrace | null = null
  private readonly buf = new THREE.Vector2()
  private weight = 0

  constructor() {
    // quad: t along the segment (0..1), side across it (-1..1)
    this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, -1, 0, 1, -1, 0, 1, 1, 0, 0, 1, 0]), 3))
    this.geometry.setIndex([0, 1, 2, 0, 2, 3])
    this.attrP = new THREE.InstancedBufferAttribute(this.aP, 4)
    this.attrC = new THREE.InstancedBufferAttribute(this.aC, 4)
    this.attrS = new THREE.InstancedBufferAttribute(this.aS, 2)
    this.attrP.setUsage(THREE.DynamicDrawUsage)
    this.attrC.setUsage(THREE.DynamicDrawUsage)
    this.attrS.setUsage(THREE.DynamicDrawUsage)
    this.geometry.setAttribute('aP', this.attrP)
    this.geometry.setAttribute('aC', this.attrC)
    this.geometry.setAttribute('aS', this.attrS)
    this.geometry.instanceCount = 0
    this.uniforms = {
      uOrigin: { value: new THREE.Vector2() },
      uView: { value: new THREE.Vector2(1, 1) },
      uFall: { value: 6 },
      uWeight: { value: 0 },
      uScrims: { value: light.scrims },
      uScrimCount: { value: 0 },
      uDprB: { value: 1 },
      uBufH: { value: 1 },
    }
    this.material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: this.uniforms,
      blending: THREE.CustomBlending,
      blendEquation: THREE.AddEquation,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneFactor,
      depthTest: false,
      depthWrite: false,
      transparent: true,
      side: THREE.DoubleSide, // quads flip winding with the segment's direction
    })
    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.mesh.frustumCulled = false
    this.mesh.matrixAutoUpdate = false
    this.scene.add(this.mesh)
  }

  init(): void {}

  /** Compiled with every other pass before the stage reports ready (4.2). */
  async compile(gl: THREE.WebGLRenderer): Promise<void> {
    await gl.compileAsync(this.scene, this.camera)
  }

  /**
   * One zero-weight instance into the current target (the Scene's boot warm-up): builds the GPU
   * pipeline and the instance buffers now instead of on the first bench frame mid-scroll. The rays
   * add nothing at zero weight, and the next render rewrites every uniform.
   */
  warm(gl: THREE.WebGLRenderer): void {
    const n = this.geometry.instanceCount
    this.geometry.instanceCount = Math.max(1, n)
    this.uniforms.uWeight.value = 0
    this.uniforms.uScrimCount.value = 0
    gl.render(this.scene, this.camera)
    this.geometry.instanceCount = n
  }

  visible(): boolean {
    const l = light
    this.weight = (l.modeA === 'bench' ? 1 - l.modeMix : 0) + (l.modeB === 'bench' ? l.modeMix : 0)
    return this.weight > 0.001 && benchSlice().slice !== null && liveRect('the-bend') !== null
  }

  private fill(t: BenchTrace): void {
    if (t === this.filled) return
    this.filled = t
    const n = Math.min(MAX_SEG, t.segCount)
    const s = t.seg
    for (let i = 0; i < n; i++) {
      const o = i * SEG_STRIDE
      this.aP[4 * i] = s[o]
      this.aP[4 * i + 1] = s[o + 1]
      this.aP[4 * i + 2] = s[o + 2]
      this.aP[4 * i + 3] = s[o + 3]
      this.aC[4 * i] = s[o + 4]
      this.aC[4 * i + 1] = s[o + 5]
      this.aC[4 * i + 2] = s[o + 6]
      this.aC[4 * i + 3] = s[o + 7]
      this.aS[2 * i] = s[o + 8]
      this.aS[2 * i + 1] = s[o + 9]
    }
    this.attrP.needsUpdate = true
    this.attrC.needsUpdate = true
    this.attrS.needsUpdate = true
    this.geometry.instanceCount = n
  }

  render(gl: THREE.WebGLRenderer): void {
    const r = liveRect('the-bend')
    const { slice } = benchSlice()
    if (!r || !slice) return
    const rotated = light.bench.rotated > 0.5
    const t = sharedTrace({
      slice,
      layout: rotated ? LAYOUT_STACKED : LAYOUT_SPLIT,
      w: r.width,
      h: r.height,
      tier: useApp.getState().gpuTier === 2 ? 2 : 3,
      relief: light.bench.relief,
      fan: light.bench.fan,
      picked: light.bench.picked,
    })
    this.fill(t)
    ;(this.uniforms.uOrigin.value as THREE.Vector2).set(r.x, r.y)
    ;(this.uniforms.uView.value as THREE.Vector2).set(light.viewport.w, light.viewport.h)
    this.uniforms.uWeight.value = this.weight
    this.uniforms.uScrims.value = light.scrims
    this.uniforms.uScrimCount.value = Math.min(8, light.scrimCount)
    gl.getDrawingBufferSize(this.buf)
    this.uniforms.uBufH.value = this.buf.y
    this.uniforms.uDprB.value = this.buf.y / Math.max(1, light.viewport.h)
    gl.render(this.scene, this.camera)
  }

  resize(): void {}

  dispose(): void {
    this.material.dispose()
    this.geometry.dispose()
  }
}

export default BenchPass
