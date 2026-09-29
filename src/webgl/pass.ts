// The render plug-in contracts (brief 4.2, 7.3). Types only: safe to import anywhere,
// including src/lib/** and section islands, without pulling three into a bundle.
import type { WebGLRenderer, IUniform } from 'three'
import type { light } from '@/lib/light-state'

/** A plain TypeScript class that owns its materials and uniforms; components hold it in useRef. */
export interface Pass {
  init(gl: WebGLRenderer): void
  visible(): boolean
  render(gl: WebGLRenderer): void
  resize(w: number, h: number, dpr: number): void
  dispose(): void
}

/** A compositor view mode (pane, bench), merged into WP4's Compositor. */
export interface ModeChunk {
  glsl: string /* defines vec3 shadePane(vec2 fragCSS) or vec3 shadeBench(vec2 fragCSS) */
  uniforms: Record<string, IUniform>
  update(l: typeof light, dt: number): void
}
