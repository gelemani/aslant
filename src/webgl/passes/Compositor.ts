// Compositor (brief 6.1.3): one full-screen triangle, modes wall | pane | bench (WP5's ModeChunks
// merged in), shared tail (vignette, ACES, sRGB, photon grain, dither). Owns its material and
// uniforms; the Scene writes them from `light` every rendered frame.
import * as THREE from 'three'
import type { Pass, ModeChunk } from '@/webgl/pass'
import type { Light } from '@/lib/light-state'
import { COMPOSITOR_VERT, compositorFrag } from '@/webgl/shaders/compositor.glsl'

const MODE_INDEX = { wall: 0, pane: 1, bench: 2 } as const

export class Compositor implements Pass {
  /** Full program (wall, pane, bench, mode mixing). */
  readonly scene = new THREE.Scene()
  /** Lean program for the wall alone (no chunks). */
  readonly sceneWall = new THREE.Scene()
  readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  readonly material: THREE.ShaderMaterial
  readonly materialWall: THREE.ShaderMaterial
  readonly uniforms: Record<string, THREE.IUniform>
  private readonly mesh: THREE.Mesh
  private readonly meshWall: THREE.Mesh
  private readonly chunks: ModeChunk[]
  private wallOnly = true

  constructor(pane: ModeChunk, bench: ModeChunk, plaster: THREE.Texture) {
    this.chunks = [pane, bench]
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3))
    this.uniforms = {
      uViewport: { value: new THREE.Vector2(1, 1) },
      uBuffer: { value: new THREE.Vector2(1, 1) },
      uDpr: { value: 1 },
      uTime: { value: 0 },
      uPlaster: { value: plaster },
      uAlbedo: { value: new THREE.Vector3() },
      uSky: { value: new THREE.Vector3(0.1, 0.1, 0.1) },
      uSun: { value: new THREE.Vector3() },
      uPatch: { value: new THREE.Vector4() },
      uSkew: { value: 0.2 },
      uSplit: { value: 0.22 },
      uTransom: { value: 0.035 },
      uMullion: { value: 0.022 },
      uPatchOn: { value: 1 },
      uLower: { value: new THREE.Vector4(0, 0.255, 1, 1) },
      uCaustic: { value: null },
      uCausticOn: { value: 0 },
      uCausticGain: { value: 1 },
      uCausticSize: { value: new THREE.Vector2(1024, 512) },
      uCausticMix: { value: 1 },
      uFill: { value: 0.07 },
      uShimmer: { value: 0 },
      uScrims: { value: new Float32Array(32) },
      uScrimCount: { value: 0 },
      uScrimW: { value: new Float32Array(8) },
      uScrimFeather: { value: 32 },
      uWallCloud: { value: 1 },
      uBeamEdges: { value: new Float32Array(18) },
      uHaze: { value: 0 },
      uHalation: { value: 1 },
      uDefocus: { value: 0 },
      uSkirting: { value: -1 },
      uModeA: { value: 0 },
      uModeB: { value: 0 },
      uModeMix: { value: 0 },
      uExposure: { value: 1 },
      uGrainSeed: { value: 0 },
      ...pane.uniforms,
      ...bench.uniforms,
    }
    this.material = new THREE.ShaderMaterial({
      vertexShader: COMPOSITOR_VERT,
      fragmentShader: compositorFrag(pane.glsl, bench.glsl),
      uniforms: this.uniforms,
      depthTest: false,
      depthWrite: false,
    })
    this.mesh = new THREE.Mesh(geo, this.material)
    this.mesh.frustumCulled = false
    this.mesh.matrixAutoUpdate = false
    this.scene.add(this.mesh)
    this.materialWall = new THREE.ShaderMaterial({
      vertexShader: COMPOSITOR_VERT,
      fragmentShader: compositorFrag(pane.glsl, bench.glsl, true),
      uniforms: this.uniforms,
      depthTest: false,
      depthWrite: false,
    })
    this.meshWall = new THREE.Mesh(geo, this.materialWall)
    this.meshWall.frustumCulled = false
    this.meshWall.matrixAutoUpdate = false
    this.sceneWall.add(this.meshWall)
  }

  init(): void {}

  visible(): boolean {
    return true
  }

  setModes(a: keyof typeof MODE_INDEX, b: keyof typeof MODE_INDEX, mix: number) {
    this.uniforms.uModeA.value = MODE_INDEX[a]
    this.uniforms.uModeB.value = MODE_INDEX[b]
    this.uniforms.uModeMix.value = mix
    this.wallOnly = (a === 'wall' || mix >= 1) && (b === 'wall' || mix <= 0)
  }

  /** Every chunk's update runs every rendered frame (4.2). */
  updateChunks(l: Light, dt: number) {
    for (const c of this.chunks) c.update(l, dt)
  }

  render(gl: THREE.WebGLRenderer): void {
    gl.render(this.wallOnly ? this.sceneWall : this.scene, this.camera)
  }

  /** The full program whatever the modes (the Scene's boot warm-up: builds its GPU pipeline and binds every chunk texture). */
  renderFull(gl: THREE.WebGLRenderer): void {
    gl.render(this.scene, this.camera)
  }

  resize(w: number, h: number, dpr: number): void {
    ;(this.uniforms.uViewport.value as THREE.Vector2).set(w, h)
    this.uniforms.uDpr.value = dpr
  }

  dispose(): void {
    this.material.dispose()
    this.materialWall.dispose()
    this.mesh.geometry.dispose()
  }
}
