// Dust motes (brief 6.1.6): tier 3 1,200 points, tier 2 400; drift on analytic curl noise in the
// vertex shader, visible only inside the beam, additive after the compositor. Frozen when idle
// (light.time freezes); absent under reduced motion.
import * as THREE from 'three'
import type { Pass } from '@/webgl/pass'
import { DUST_FRAG, DUST_VERT } from '@/webgl/shaders/dust.glsl'

const MAX_MOTES = 1200

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export class DustPass implements Pass {
  readonly scene = new THREE.Scene()
  readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  readonly material: THREE.ShaderMaterial
  readonly uniforms: Record<string, THREE.IUniform>
  enabled = true
  count = MAX_MOTES
  private readonly geometry = new THREE.BufferGeometry()
  private readonly points: THREE.Points

  constructor() {
    const rand = mulberry32(41)
    const seeds = new Float32Array(MAX_MOTES * 4)
    for (let i = 0; i < MAX_MOTES; i++) {
      seeds[i * 4] = rand()
      seeds[i * 4 + 1] = rand()
      seeds[i * 4 + 2] = Math.pow(rand(), 2.2)
      seeds[i * 4 + 3] = rand()
    }
    this.geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 4))
    this.geometry.setDrawRange(0, MAX_MOTES)
    this.uniforms = {
      uBox: { value: new THREE.Vector4(0, 0, 1, 1) },
      uBuffer: { value: new THREE.Vector2(1, 1) },
      uDpr: { value: 1 },
      uTime: { value: 0 },
      uAir: { value: 0 },
      uBeam: { value: new Float32Array(12) },
      uPatchC: { value: new THREE.Vector2() },
      uBeamDir: { value: new THREE.Vector2(0, -1) },
      uBeamLen: { value: 1 },
      uSunDisplay: { value: new THREE.Vector3(0.3, 0.28, 0.24) },
    }
    this.material = new THREE.ShaderMaterial({
      vertexShader: DUST_VERT,
      fragmentShader: DUST_FRAG,
      uniforms: this.uniforms,
      blending: THREE.CustomBlending,
      blendEquation: THREE.AddEquation,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneFactor,
      depthTest: false,
      depthWrite: false,
      transparent: true,
    })
    this.points = new THREE.Points(this.geometry, this.material)
    this.points.frustumCulled = false
    this.points.matrixAutoUpdate = false
    this.scene.add(this.points)
  }

  setCount(n: number) {
    this.count = Math.max(0, Math.min(MAX_MOTES, n))
    this.geometry.setDrawRange(0, this.count)
  }

  init(): void {}

  visible(): boolean {
    return this.enabled && this.count > 0
  }

  render(gl: THREE.WebGLRenderer): void {
    gl.render(this.scene, this.camera)
  }

  resize(): void {}

  dispose(): void {
    this.material.dispose()
    this.geometry.dispose()
  }
}
