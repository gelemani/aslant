# 04 — Technique Catalogue (implementation-grade)

> Role: creative technologist (WebGL + motion). Written 2026-09-29 for the overnight build.
> Stack (fixed): Next.js 16.3 App Router + TS · React 19.3 · three 0.186 · @react-three/fiber 9.8 · @react-three/drei 10.7 · @react-three/postprocessing 3.1 / postprocessing 6.39 · GSAP 3.15 (all plugins) · @gsap/react 2.1 · Lenis 1.3 · CSS Modules + CSS custom-property tokens. No Tailwind.
>
> How to read this: Part 1 is the **verified API sheet**: each fact was checked against official docs or the installed type definitions. Part 2 is the **frame architecture** that every technique plugs into. Part 3 is the **catalogue**: 38 techniques, each covering the effect, when the story justifies it, an implementation sketch, cost, pitfalls, and fallbacks. Part 4 covers budgets, the combination plan and the QA checklist. Part 5 lists the sources.
>
> Cost scale (Apple Silicon M1–M3 laptop at DPR 2, rough numbers, **measure before trusting**): **L** under 0.5 ms/frame · **M** 0.5–2 ms · **H** 2–5 ms · **XH** over 5 ms, which needs a reduced-resolution buffer or a dedicated moment.

---

## Part 1 — Verified API sheet (what is true *today* for our versions)

### 1.0 Versions resolved from the npm registry (2026-09-29)

| package | latest | notes |
|---|---|---|
| next | **16.3.6** | docs pages we used are stamped `version: 16.3.6` |
| react / react-dom | **19.3.0** | |
| three | **0.186.1** | WebGL2-only renderer; `compileAsync`, `forceContextLoss/Restore`, `initRenderTarget` present |
| @react-three/fiber | **9.8.1** | peer React ^19 |
| @react-three/drei | **10.7.9** | peers: react ^19, three >=0.159, fiber ^9 |
| @react-three/postprocessing | **3.1.3** | peers: fiber >=9.7, postprocessing ^6.36 |
| postprocessing | **6.39.5** | |
| gsap | **3.15.0** | released ~2026-09-07; adds `easeReverse` (deprecates `yoyoEase`); fixes context association for snap callbacks inside `useGSAP` |
| @gsap/react | **2.1.2** | |
| lenis | **1.3.26** | ships `lenis/react`, `lenis/dist/lenis.css`, `lenis-snap` |

Verification method: `npm view` for the versions. The packages were then installed into a scratch dir so their `.d.ts` files and source could be read directly (paths quoted below). GSAP 3.15 notes: [dependabot PR quoting changelog](https://github.com/Gix13/sentinelscan/pull/4) and `gsap/types/gsap-core.d.ts` line 151 (`@deprecated since version 3.15.0. Use easeReverse instead`).

### 1.1 Lenis 1.3 (`lenis`, `lenis/react`)

Sources: [Lenis README](https://github.com/darkroomengineering/lenis/blob/main/README.md), [lenis/react README](https://github.com/darkroomengineering/lenis/blob/main/packages/react/README.md), `lenis/dist/lenis-react.d.ts`, `lenis/dist/lenis-react.mjs`.

- `import { ReactLenis, useLenis, type LenisRef } from 'lenis/react'` and `import 'lenis/dist/lenis.css'`.
- `ReactLenis` props: `root?: boolean | 'asChild'` (use `root` for window scroll), `options?: LenisOptions`, `autoRaf?` (**deprecated prop**, use `options.autoRaf`), `className`, `ref: LenisRef` → `{ wrapper, content, lenis? }`.
- **Source-verified gotcha:** `ReactLenis` constructs Lenis inside a `useEffect` and stores it with `setState`. As a result, `lenisRef.current.lenis` is **undefined during the parent's mount effect**. Access it lazily with `lenisRef.current?.lenis?.raf(...)`, the pattern the README uses, or subscribe via `useLenis()` in a child. The effect deps are `JSON.stringify(options)`, so a new options object with equal JSON does not recreate the instance. Functions inside options (`easing`, `prevent`) are ignored by that comparison.
- With `root` and **no children**, `ReactLenis` returns `null`. With children, it renders a context provider around them and adds no wrapper divs.
- Options (from `lenis.d.ts`): `lerp` (0.1), `duration` (1.2), `easing`, `orientation`, `gestureOrientation`, `smoothWheel` (true), `syncTouch` (false), `touchMultiplier`, `wheelMultiplier`, `autoResize` (true), `autoRaf` (false in core, **true in ReactLenis unless set**), `anchors`, `allowNestedScroll`, `prevent(node)`, `naiveDimensions`, `stopInertiaOnNavigate`, **`respectReducedMotion` (default true)**: with reduced motion, smoothing is disabled and programmatic scrolls become instant.
- Instance: `raf(timeMs)`, `scrollTo(target, { offset, lerp, duration, easing, immediate, lock, force, onComplete })`, `start()`, `stop()`, `resize()`, `destroy()`, `on('scroll', cb) → unsubscribe`, `off(...)`. Readable: `scroll`, `animatedScroll`, `targetScroll`, `actualScroll`, `velocity`, `lastVelocity`, `direction`, `progress`, `isScrolling`, `prefersReducedMotion`.
- Nested scroll areas: `data-lenis-prevent`, `data-lenis-prevent-wheel`, `-touch`, `-vertical`, `-horizontal`.
- Official GSAP integration (README):
  ```js
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => { lenis.raf(time * 1000) })
  gsap.ticker.lagSmoothing(0)
  ```
- Next 16 removed the automatic `scroll-behavior: smooth` handling ([Next 16 blog](https://nextjs.org/blog/next-16)). **Do not** set `scroll-behavior: smooth` on `html`, because it fights Lenis. `lenis.css` forces `scroll-behavior: auto` while smoothing.

### 1.2 GSAP 3.15 + @gsap/react 2.1

Sources: [useGSAP docs](https://gsap.com/resources/React/), [SplitText docs](https://gsap.com/docs/v3/Plugins/SplitText/), [ScrollTrigger docs](https://gsap.com/docs/v3/Plugins/ScrollTrigger/), `gsap/types/split-text.d.ts`, `gsap/SplitText.js`, `@gsap/react/types/index.d.ts`.

- All plugins ship in the public `gsap` package, including SplitText, ScrambleTextPlugin, MorphSVGPlugin, DrawSVGPlugin, InertiaPlugin, CustomEase, Flip and Observer. The `gsap/*.js` directory listing was checked.
- `useGSAP(fn | config, deps | config)` returns `{ context, contextSafe }`. Config: `{ scope, dependencies = [], revertOnUpdate = false }`. The callback receives `(context, contextSafe)`. It uses `useLayoutEffect` on the client and `useEffect` on the server, which makes it SSR-safe. Everything created during execution is reverted on unmount: tweens, ScrollTriggers, Draggables, **SplitText instances**, and `gsap.matchMedia()` created inside. Event handlers created *later* (clicks, pointermove) must be wrapped in `contextSafe(fn)`.
- **SplitText (rewritten in 3.13; 3.15 types):** `SplitText.create(target, vars)`. Vars: `type` ("chars,words,lines"), **`mask: 'lines' | 'words' | 'chars'`**, **`autoSplit`** (re-splits on `document.fonts` `loadingdone` and on width change via ResizeObserver, in source), **`onSplit(self)`** (return a tween/timeline and GSAP kills and time-syncs it on each re-split), `onRevert`, **`aria: 'auto' | 'hidden' | 'none'`**, `linesClass/wordsClass/charsClass` (support `"++"` auto-index), `propIndex` (adds `--line: n` style vars), `smartWrap`, `deepSlice`, `ignore`, `prepareText`, `wordDelimiter`, `specialChars`, `reduceWhiteSpace`, `tag`. Instance: `.lines/.words/.chars/.masks/.elements`, `.revert()`, `.split(vars)`, `.kill()` (stops autoSplit listeners), `.isSplit`.
  - Source-verified aria behaviour: with `aria:'auto'`, the element gets `aria-label = textContent.trim()` and every generated piece gets `aria-hidden="true"`. With `'hidden'`, the element itself gets `aria-hidden`. With `'none'`, nothing is added.
- ScrollTrigger essentials (docs): `pin`, `pinSpacing` (auto-false in flex parents; `"margin"` option), `pinReparent` (avoid), `anticipatePin: 1`, `scrub: true | seconds`, `snap`, **`containerAnimation`** (horizontal sections; container tween **must be `ease:'none'`**; pinning and snapping are *not available* on containerAnimation-based triggers), `fastScrollEnd`, `invalidateOnRefresh`, `refreshPriority`, `self.getVelocity()`, `ScrollTrigger.refresh()`, `ScrollTrigger.config({ ignoreMobileResize: true })`, `gsap.matchMedia()` (replaces the deprecated `ScrollTrigger.matchMedia`). Caveats: never animate the pinned element itself, create triggers top-to-bottom, avoid `content-visibility:auto`, and remember that transforms or `will-change` on ancestors break `position:fixed` pins.
- `gsap.ticker.add(cb, once?, prioritize?)`. The callback receives `(time /*s*/, deltaTime /*ms*/, frame)`.

### 1.3 @react-three/fiber 9 (React 19)

Sources: [Canvas API](https://r3f.docs.pmnd.rs/api/canvas), [v9 migration](https://r3f.docs.pmnd.rs/tutorials/v9-migration-guide), `fiber/dist/declarations/src/core/loop.d.ts`, `web/Canvas.d.ts`, `three-types.d.ts`.

- `<Canvas>` defaults: `dpr=[1,2]`, `frameloop='always'` (`'demand'|'never'`), `camera={fov:75,near:.1,far:1000,position:[0,0,5]}`, `eventSource=gl.domElement.parentNode`, `eventPrefix='offset'` (`'client'|'page'|'layer'|'screen'`), `flat`, `linear`, `shadows`, `resize={scroll:true,debounce:{scroll:50,resize:0}}`, `onCreated`, **`fallback`** (DOM children placed *inside the `<canvas>` tag*, rendered only by browsers that do not support canvas at all; this is **not** a WebGL-failure fallback).
- `gl` prop: object, **sync/async factory `(defaults) => renderer`** (v9 changed the arg from `canvas` to constructor props; async enables `WebGPURenderer`), or an instance.
- Types: custom elements are declared via module augmentation `declare module '@react-three/fiber' { interface ThreeElements { foo: ThreeElement<typeof Foo> } }` (the `ThreeElement` type is exported, verified).
- Loop exports (verified): `addEffect`, `addAfterEffect`, `addTail`, `invalidate(state?, frames?)`, **`advance(timestamp, runGlobalEffects = true, state?, frame?)`**.
  - **Source-verified gotcha:** in `frameloop="never"` mode, `update()` sets `clock.elapsedTime = timestamp` and `delta = timestamp − previous`. **Pass seconds, not ms**, e.g. GSAP's `time`. Otherwise every `useFrame` delta is 1000× too large.
  - `useFrame(cb, priority)`: any **priority > 0 takes over rendering**. Use negative priorities for simulations that must run *before* the default render.
- `useLoader(loaderInstance, url)` is accepted (loader pooling). StrictMode is inherited from the parent, so do not add another inside Canvas.

### 1.4 drei 10

Sources: [View](https://drei.docs.pmnd.rs/portals/view), [MeshTransmissionMaterial](https://drei.docs.pmnd.rs/shaders/mesh-transmission-material), [shaderMaterial](https://drei.docs.pmnd.rs/shaders/shader-material), [useFBO](https://drei.docs.pmnd.rs/misc/fbo-use-fbo), [PerformanceMonitor](https://drei.docs.pmnd.rs/performances/performance-monitor), installed `.d.ts`.

- **View**: `<View as? id? className? style? visible? index? frames? track?(deprecated)>` plus `<View.Port/>` inside the Canvas. Views use `gl.scissor`. Set `frames={1}` for static layout to skip per-frame `getBoundingClientRect`. `<Canvas eventSource={containerRef}>` is needed so DOM and views both get events.
- **MeshTransmissionMaterial** props/defaults: `transmission 1, thickness 0, backsideThickness 0, roughness 0, chromaticAberration 0.03, anisotropicBlur 0.1, distortion 0, distortionScale 0.5, temporalDistortion 0, samples 6, resolution (fullscreen if unset), backsideResolution, backside false, transmissionSampler false, buffer, background`. Each instance costs **an extra scene render**. Docs advise low `resolution` (e.g. 32) combined with roughness.
- **shaderMaterial(uniforms, vert, frag)** creates a class with uniform setters and getters and a static `.key` (use `key={Mat.key}` for HMR). Register with `extend({ Mat })`.
- **useFBO(width?|settings, height?, settings?)** returns `WebGLRenderTarget`. Settings = three `RenderTargetOptions` plus `depth?`. It is auto-disposed on unmount.
- **PerformanceMonitor**: `ms 250, iterations 10, threshold .75, bounds(refreshrate)=>[lo,hi], flipflops Infinity, factor .5, step .1, onIncline/onDecline/onChange/onFallback({fps,factor,refreshrate,frames,averages})`. `usePerformanceMonitor` is also available. **AdaptiveDpr** `({ pixelated })` lowers DPR while `performance.current` regresses. **Preload** `({ all, scene, camera })`. **useProgress** is a zustand store `{ active, progress, errors, item, loaded, total }` backed by `THREE.DefaultLoadingManager`.
- Also exported (verified): `Text` (troika), `ScreenQuad`, `Hud`, `RenderTexture`, `Fbo`, `Caustics`, `MeshRefractionMaterial`, `Bvh`, `ScrollControls`, `AdaptiveEvents`.
- troika-three-text 0.52.5 bundles a **WOFF(1)→OTF** converter; **WOFF2 is not supported** for `<Text font>`. Ship `.woff`/`.ttf`/`.otf` copies in `/public/fonts` for WebGL text.

### 1.5 @react-three/postprocessing 3.1 / postprocessing 6.39

Sources: [EffectComposer docs](https://react-postprocessing.docs.pmnd.rs/effect-composer), installed `dist/*.d.ts`, `postprocessing/build/types/index.d.ts`.

- `<EffectComposer>` props: `enabled, depthBuffer, enableNormalPass, stencilBuffer, autoClear (true), autoRenderToScreen (true), resolutionScale, multisampling (**default 8**), frameBufferType (**default HalfFloatType**), renderPriority (**default 1**), camera, scene, renderPass, mergeMode ('auto'|'all'|'none', default 'auto')`. In `auto`, the composer splits passes around convolution effects and effects that use `mainUv` (source-verified in `buildPasses`).
- Custom effect: `new Effect(name, fragmentShader, { attributes?: EffectAttribute.{NONE|CONVOLUTION|DEPTH}, blendFunction?, defines?: Map, uniforms?: Map<string, Uniform>, extensions?, vertexShader? })`. Fragment entry point: `void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor)`. Available built-ins: `inputBuffer`, `resolution`, `texelSize`, `time`, `aspect`. Override `update(renderer, inputBuffer, deltaTime)` for per-frame work.
- React wrapping: `wrapEffect(EffectClass, defaults?)` and **`createEffectComponent(EffectClass)`** (new in v3.1; only for effects constructible with zero args; props are applied live like r3f props). The simplest robust option is `<primitive object={effect} dispose={null} />`.
- Built-ins include Bloom (`mipmapBlur`, `luminanceThreshold`, `luminanceSmoothing`, `radius`, `levels`, `intensity`), ChromaticAberration (`offset`, `radialModulation`, `modulationOffset`), Noise (`premultiply`, `blendFunction`), Vignette, ToneMapping, SMAA, FXAA, DotScreen, Pixelation, ASCII, Glitch, LUT, TiltShift2, Water and N8AO.

### 1.6 Next.js 16.3 specifics

Sources: [Next 16 blog](https://nextjs.org/blog/next-16), [blog index (16.1–16.3)](https://nextjs.org/blog), [lazy loading](https://nextjs.org/docs/app/guides/lazy-loading), [fonts](https://nextjs.org/docs/app/api-reference/components/font), [opengraph-image](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image), [static exports](https://nextjs.org/docs/app/guides/static-exports), [view transitions guide](https://nextjs.org/docs/app/guides/view-transitions).

- Turbopack is the default for `dev` and `build` (opt out with `--webpack`). Top-level `turbopack` config replaces `experimental.turbopack`. Node **20.9+**, TS **5.1+**. **`next lint` removed**, so run ESLint/Biome directly. React Compiler is stable but opt-in (`reactCompiler: true`, Babel-based, slower builds). **Recommendation: leave it off tonight.** Browser floor: Chrome/Edge/Firefox 111+, Safari 16.4+.
- `next/dynamic(() => import(...), { ssr:false })` **is only allowed inside Client Components** (it errors in Server Components). Put it in a `'use client'` wrapper.
- `next/font/google`: options `weight, style, subsets, axes (extra variable axes, e.g. ['slnt'] or ['opsz']), display ('swap' default), preload, fallback, adjustFontFallback, variable ('--font-x')`. `next/font/local`: `src` (string or `[{path, weight, style}]`), `declarations`, `adjustFontFallback ('Arial'|'Times New Roman'|false)`. Fonts are self-hosted at build time, so the browser makes no Google requests.
- Metadata: `export const metadata: Metadata` / `export const viewport: Viewport` in `app/layout.tsx`. OG images: `app/opengraph-image.tsx` default-exports `ImageResponse` from `next/og` with `export const alt/size/contentType`, reads fonts with `readFile(join(process.cwd(), 'assets/…'))` at module scope, and is **statically generated at build** unless it uses request-time APIs. `params` is a Promise since v16. Satori CSS subset: flexbox layout, no grid.
- Static export: `output: 'export'` produces `out/`. Unsupported there: default `next/image` loader (use `images: { unoptimized: true }` or a custom loader), rewrites, redirects, headers, proxy, Server Actions, ISR. Route handlers must be GET plus `export const dynamic = 'force-static'`.
- View Transitions: the App Router ships React canary, so `import { ViewTransition } from 'react'` works with **no config**. Activation comes from Transitions, Suspense and `useDeferredValue` (not plain setState). The old `experimental.viewTransition` key is gone in 16. `<Link transitionTypes={['nav-forward']}>` is available. For a single-page landing, the **DOM API** `document.startViewTransition` is the tool (see T17).

---

## Part 2 — Frame architecture: “One Clock”

Every moving thing on the page reads the **same timestamp and the same scroll value in the same frame**. Without that, WebGL planes lag the DOM by a frame ("jelly"), scrubbed timelines stutter, and velocity effects jitter. That is the most common tell of a non-award-grade build. The same pattern is described in [JOYCO: WebGL scroll sync](https://hub.joyco.studio/logs/08-webgl-scroll-sync) and the [HAOQI.DESIGN case study (Codrops, 2026-08)](https://tympanus.net/codrops/2026/08/15/inside-haoqi-design-letting-dom-and-webgl-share-a-retro-futurist-stage/).

```
requestAnimationFrame (owned by gsap.ticker)
 ├─ 1. GSAP core renders tweens/timelines (incl. scrub catch-up tweens)
 ├─ 2. lenis.raf(time*1000)            → writes window scroll, emits 'scroll'
 │        └─ 'scroll' → ScrollTrigger.update()  → scrub targets / pins / callbacks
 │        └─ 'scroll' → scrollStore {y, velocity, direction, progress}
 ├─ 3. frameBus listeners (after scroll): velocity smoothing, marquee, cursor, audio params
 └─ 4. R3F advance(time /*seconds*/)   → useFrame(-2 sims) → useFrame(-1 dom-sync) → render / composer
```

`lib/frame.ts` has zero dependencies, so the main bundle never imports R3F:

```ts
// lib/frame.ts
export type FrameFn = (time: number, dtMs: number) => void
export const afterScroll = new Set<FrameFn>()          // DOM-side per-frame work
export const renderers = new Set<FrameFn>()            // WebGL: registered by the lazily-loaded canvas
export const scrollStore = { y: 0, velocity: 0, direction: 0 as -1 | 0 | 1, progress: 0, limit: 1 }
export const quality = { tier: 3 as 0 | 1 | 2 | 3, webglVisible: true, reducedMotion: false }
```

```tsx
// components/SmoothScroll.tsx
'use client'
import 'lenis/dist/lenis.css'
import { ReactLenis, useLenis, type LenisRef } from 'lenis/react'
import { useEffect, useRef, type ReactNode } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'           // registers plugins once
import { afterScroll, renderers, scrollStore } from '@/lib/frame'

function Bridge() {
  useLenis((l) => {
    scrollStore.y = l.scroll; scrollStore.velocity = l.velocity
    scrollStore.direction = l.direction; scrollStore.progress = l.progress; scrollStore.limit = l.limit
    ScrollTrigger.update()
  })
  return null
}

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const ref = useRef<LenisRef>(null)
  useEffect(() => {
    const tick = (time: number, dtMs: number) => {
      ref.current?.lenis?.raf(time * 1000)            // lazily resolved: see 1.1 gotcha
      afterScroll.forEach((f) => f(time, dtMs))
      renderers.forEach((f) => f(time, dtMs))         // canvas registers (t) => advance(t)
    }
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return () => gsap.ticker.remove(tick)
  }, [])
  return (
    <ReactLenis root options={{ autoRaf: false, lerp: 0.085, anchors: true }} ref={ref}>
      <Bridge />
      {children}
    </ReactLenis>
  )
}
```

```ts
// lib/gsap.ts
'use client'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { Flip } from 'gsap/Flip'
import { CustomEase } from 'gsap/CustomEase'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { useGSAP } from '@gsap/react'
gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, Flip, CustomEase, ScrambleTextPlugin)
CustomEase.create('reveal', 'M0,0 C0.19,1 0.22,1 1,1')      // expo-like; tune in 03-design docs
ScrollTrigger.config({ ignoreMobileResize: true })
export { gsap, ScrollTrigger, SplitText, Flip, CustomEase, useGSAP }
```

Inside the lazily loaded canvas module:

```ts
import { advance } from '@react-three/fiber'
import { renderers, quality } from '@/lib/frame'
useEffect(() => {
  const f = (t: number) => { if (quality.webglVisible && !document.hidden) advance(t) }  // seconds!
  renderers.add(f); return () => { renderers.delete(f) }
}, [])
// <Canvas frameloop="never" ...>
```

In every sim, clamp `delta` with `const dt = Math.min(delta, 1 / 30)`. The very first `advance` delta equals seconds-since-ticker-start.

**Do not** combine Lenis with `ScrollTrigger.normalizeScroll()`, because both hijack input. Do not use ScrollSmoother either, since Lenis is the only engine.

### 2.1 Capability tiers (decided once at boot, stored in `quality.tier`, mirrored as `html[data-tier]`)

| tier | who | what runs |
|---|---|---|
| **0 static** | no JS / no WebGL2 / WebGL error / `Save-Data` | Full content, CSS-only design, static poster images/gradients, CSS scroll-driven reveals if supported |
| **1 calm** | `prefers-reduced-motion: reduce` | Content + color + typography. No smooth-scroll smoothing (Lenis auto), no pins that scrub large transforms, no parallax, WebGL rendered **once** (`frameloop='demand'`) or as a poster, fades ≤200 ms only |
| **2 mobile/low** | coarse pointer, `deviceMemory ≤ 4`, `hardwareConcurrency ≤ 4`, or PerformanceMonitor decline | DPR ≤ 1.5, sim res halved, particles ÷4, no transmission/raymarch (swap to baked texture or cheaper shader), post = grain + vignette only, no cursor/magnetics |
| **3 full** | Apple Silicon desktop etc. | Everything, DPR ≤ 2 (cap at 1.75 when fullscreen sim + post both run) |

---

## Part 3 — Technique catalogue

Each entry is structured as **Effect / Narrative / Implementation / Cost / Pitfalls / Fallback (reduced motion · no-WebGL)**.

### A. Foundation

#### T01 — One-clock Lenis × ScrollTrigger × R3F loop
- **Effect:** smooth inertial scroll, with DOM, scrubbed timelines and WebGL moving on the same frame.
- **Narrative:** always. This is the craft floor, not a feature.
- **Implementation:** Part 2 above. Extra details: call `lenis.stop()` during the intro and `lenis.start()` after, and call `ScrollTrigger.refresh()` after fonts load (`document.fonts.ready`) and after the preloader removes itself. For anchor links use `lenis.scrollTo('#id', { offset: -navH })` or the `anchors` option. Put `data-lenis-prevent` on any internal scroll panels.
- **Cost:** L.
- **Pitfalls:** a second rAF loop (R3F `frameloop="always"` or `autoRaf: true`) desyncs by one frame. Wrong units: Lenis wants ms, `advance()` wants seconds. With `useLenis(cb)`, the callback runs only on scroll events, so per-frame work belongs in `afterScroll`. `position: sticky` works with Lenis (native scroll), which ScrollSmoother could not do.
- **Fallback:** reduced motion is handled by Lenis's `respectReducedMotion: true`, which turns off smoothing. With no JS you get native scroll and nothing breaks.

#### T02 — Adaptive quality: tiers, PerformanceMonitor, DPR, offscreen pause
- **Effect:** the art never drops frames. Quality degrades invisibly.
- **Narrative:** jurors test on laptops and phones. "60 fps on mid-range mobile" is an explicit juror criterion ([juror write-up](https://www.hontran.dev/blog/best-award-winning-websites-2026)).
- **Implementation:**
  ```tsx
  const [dpr, setDpr] = useState(tier === 3 ? 1.75 : 1.25)
  <Canvas dpr={dpr} frameloop="never" gl={{ antialias: false, powerPreference: 'high-performance', alpha: true }}>
    <PerformanceMonitor
      bounds={(hz) => (hz > 90 ? [50, 80] : [45, 58])}
      flipflops={3}
      onDecline={() => { setDpr((d) => Math.max(1, d - 0.25)); quality.tier = Math.min(quality.tier, 2) as any }}
      onIncline={() => setDpr((d) => Math.min(tierMaxDpr, d + 0.25))}
      onFallback={() => { quality.tier = 2 }}
    />
  ```
  Boot heuristics: `matchMedia('(pointer: coarse)')`, `navigator.hardwareConcurrency`, `(navigator as any).deviceMemory`, `navigator.connection?.saveData`, WebGL2 support, `gl.capabilities.maxTextureSize`. For offscreen pause, an `IntersectionObserver` on the canvas host sets `quality.webglVisible`, and `document.hidden` stops `advance` (Part 2).
- **Cost:** L.
- **Pitfalls:** `setDpr` re-allocates every render target sized to the canvas. Throttle with `flipflops` and step in 0.25s. Keep sim FBOs **fixed size** (not DPR-coupled). `WEBGL_debug_renderer_info` strings are unreliable, so do not ship GPU blocklists.
- **Fallback:** tier 0/1 as in Part 2.1.

#### T03 — Mounting WebGL in Next 16 (fixed canvas, event source, error boundary, no-WebGL detection)
- **Effect:** one fixed full-viewport canvas behind or over DOM, loaded after first paint, never breaking SSR or the LCP.
- **Narrative:** always (infrastructure).
- **Implementation:**
  ```tsx
  // components/StageLoader.tsx
  'use client'
  import dynamic from 'next/dynamic'
  const Stage = dynamic(() => import('./Stage'), { ssr: false, loading: () => null })
  export default function StageLoader() {
    const [ok, setOk] = useState<boolean | null>(null)
    useEffect(() => { setOk(hasWebGL2() && !matchMedia('(prefers-reduced-data: reduce)').matches) }, [])
    if (!ok) return <div className={s.poster} aria-hidden />          // CSS gradient/procedural poster
    return <WebGLErrorBoundary fallback={<div className={s.poster} aria-hidden />}><Stage /></WebGLErrorBoundary>
  }
  function hasWebGL2() {
    try { const c = document.createElement('canvas'); const gl = c.getContext('webgl2')
      gl?.getExtension('WEBGL_lose_context')?.loseContext(); return !!gl } catch { return false }
  }
  ```
  ```tsx
  // Stage.tsx: fixed canvas, pointer events come from the page, not the canvas
  <div className={s.stage} aria-hidden>  {/* position:fixed; inset:0; pointer-events:none; z-index:0 */}
    <Canvas eventSource={document.body} eventPrefix="client" frameloop="never" dpr={dpr}
            orthographic camera={{ position: [0, 0, 500], zoom: 1, near: 0.1, far: 2000 }}
            gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
            onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}>
  ```
  With `orthographic` and zoom 1, R3F sizes the frustum to the canvas, so **1 world unit = 1 CSS px**. That is what DOM-sync needs (T25).
- **Cost:** L.
- **Pitfalls:** `ssr:false` inside a Server Component is an error. Module-level `window` access in `Stage` is fine because it is never SSR'd, but not in shared modules. The `fallback` prop of `<Canvas>` does **not** catch WebGL failures, so use an ErrorBoundary. A probe context counts against the browser's live-context limit, so release it (`WEBGL_lose_context`). `eventSource={document.body}` plus `eventPrefix="client"` is correct for a fixed canvas. `offset` coordinates would be wrong.
- **Fallback:** the poster div (CSS gradients plus grain from T19), plus all DOM content.

#### T04 — Design tokens → shader uniforms (single source of truth)
- **Effect:** CSS palette changes (themes, sections, View Transitions) re-color shaders in sync.
- **Narrative:** section color chapters, day/night or "ink/paper" toggles.
- **Implementation:**
  ```ts
  const css = getComputedStyle(document.documentElement)
  const token = (n: string) => new THREE.Color(css.getPropertyValue(n).trim())
  uniforms.uInk.value.copy(token('--c-ink')); uniforms.uPaper.value.copy(token('--c-paper'))
  // on theme change: gsap.to(uniforms.uInk.value, { r, g, b, duration: .8 })  (Color has r/g/b props)
  ```
- **Cost:** L.
- **Pitfalls:** `THREE.Color.setStyle` parses hex/rgb/hsl/named colors but **not `oklch()` or `color-mix()`**. Keep a hex/rgb twin for any token a shader consumes. Color management: three treats CSS colors as sRGB and converts to linear. With postprocessing tone mapping, compare against the DOM color side by side.
- **Fallback:** N/A (DOM already uses the tokens).

#### T05 — Scroll-scrubbed shader state (GSAP → uniforms)
- **Effect:** the WebGL world changes "chapter" with scroll: color, distortion, camera, morph targets.
- **Narrative:** the backbone of scrollytelling. Every chapter change must mean something, such as "raw → refined" or "chaos → order".
- **Implementation:**
  ```ts
  useGSAP(() => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: '#chapter-2', start: 'top bottom', end: 'bottom top', scrub: 1 } })
    tl.to(mat.uniforms.uMorph, { value: 1, ease: 'none' })
      .to(mat.uniforms.uHue, { value: 0.35, ease: 'none' }, 0)
  }, { scope: root })
  ```
  WebGL components expose uniforms through a tiny module store (`stageUniforms`), so DOM sections do not import R3F.
- **Cost:** L.
- **Pitfalls:** scrub tweens update inside GSAP core and render the same frame via `advance`, which is good. Do not also lerp the same uniform in `useFrame`. Pick one owner per uniform.
- **Fallback:** reduced motion sets uniforms to per-chapter end states with `onEnter` (no scrub) and renders on demand.

### B. DOM motion & interaction

#### T06 — Scroll-velocity-driven effects
- **Effect:** content leans, stretches, splits or hums with scroll speed and settles when still. Examples: image skew, CA offset, wave amplitude, marquee speed, audio filter.
- **Narrative:** gives scroll a physical *material*, such as viscous ink or elastic paper. Use it on 1–2 systems, not everywhere.
- **Implementation (frame-rate-independent attack/release smoothing, constants from HAOQI: 0.025 s attack, 0.175 s release):**
  ```ts
  const vel = { v: 0 }
  afterScroll.add((_t, dtMs) => {
    const target = scrollStore.velocity                     // px/frame-ish from Lenis
    const tau = Math.abs(target) > Math.abs(vel.v) ? 0.025 : 0.175
    vel.v += (target - vel.v) * (1 - Math.exp(-(dtMs / 1000) / tau))
    setSkew(gsap.utils.clamp(-6, 6, vel.v * 0.35))          // gsap.quickSetter(els, 'skewY', 'deg')
    stageUniforms.uVelocity.value = vel.v
  })
  ```
- **Cost:** L (DOM transform on few elements), M if applied to many.
- **Pitfalls:** skew on text hurts legibility, so apply it to image frames only. Clamp everything. Lenis velocity is 0 under reduced motion (no smoothing), and native jumps (keyboard PageDown) produce spikes, which the clamp handles.
- **Fallback:** reduced motion disables the whole system (constant 0).

#### T07 — Pinned chapters with scrubbed timelines
- **Effect:** a section holds while its content transforms (build-up, reveal, sequence).
- **Narrative:** use it when the *time* spent is the message, as in a process, a transformation, or a statement delivered word by word. At most 2–3 pins per page. More than that feels like a trap.
- **Implementation:**
  ```tsx
  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: {
      trigger: root.current, start: 'top top', end: '+=220%', pin: true, scrub: 0.8,
      anticipatePin: 1, invalidateOnRefresh: true } })
    tl.from('[data-step]', { autoAlpha: 0, yPercent: 30, stagger: 0.5 })
      .to('[data-visual]', { clipPath: 'inset(0% 0% 0% 0%)' }, 0)
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: reduce)', () => { tl.scrollTrigger?.kill(); tl.progress(1) })
  }, { scope: root })
  ```
  CSS: pinned wrappers use `height: 100svh` (not `vh`) so the mobile URL bar does not jump.
- **Cost:** L–M.
- **Pitfalls:** never tween the pinned element itself. Create triggers in DOM order or set `refreshPriority`. Pin spacers change page offsets, so DOM-synced WebGL planes must re-measure on `ScrollTrigger` `refresh` (T25). A `transform` or `filter` on any ancestor breaks fixed pinning. Do not pin inside flex/grid without checking `pinSpacing`.
- **Fallback:** reduced motion gives no pin and the final state is laid out statically. No JS shows content stacked.

#### T08 — Pinned horizontal scroll (containerAnimation)
- **Effect:** vertical scroll drives a horizontal track, and inner elements animate against the horizontal position.
- **Narrative:** justified for a *sequence*: a timeline, a process, a filmstrip, "rooms". Not justified as decoration.
- **Implementation:**
  ```tsx
  useGSAP(() => {
    const track = trackRef.current!
    const dist = () => track.scrollWidth - window.innerWidth
    const h = gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: {
      trigger: root.current, pin: true, scrub: 1, start: 'top top', end: () => '+=' + dist(),
      invalidateOnRefresh: true, anticipatePin: 1 } })
    gsap.utils.toArray<HTMLElement>('[data-card]').forEach((card) => {
      gsap.from(card.querySelector('[data-media]'), { scale: 1.25, ease: 'none',
        scrollTrigger: { trigger: card, containerAnimation: h, start: 'left right', end: 'right left', scrub: true } })
    })
    // keyboard: bring focused card into view
    root.current!.addEventListener('focusin', contextSafe((e: FocusEvent) => {
      const card = (e.target as HTMLElement).closest('[data-card]') as HTMLElement | null
      if (!card) return
      const st = h.scrollTrigger!; const p = card.offsetLeft / dist()
      lenis?.scrollTo(st.start + (st.end - st.start) * gsap.utils.clamp(0, 1, p), { immediate: true })
    }))
  }, { scope: root })
  ```
- **Cost:** M (large transformed layer). Add `will-change: transform` on the track only while pinned.
- **Pitfalls:** the container tween **must be `ease:'none'`**, and nested triggers cannot pin or snap. Tab focus inside the offscreen track is otherwise invisible, so add the handler above. Horizontal wheel or trackpad gestures on the pinned section scroll the page vertically, which is expected.
- **Fallback:** under `(max-width: 768px)` or reduced motion there is no pin. Show a native `overflow-x: auto; scroll-snap-type: x mandatory` strip with `data-lenis-prevent-horizontal`, or a vertical stack.

#### T09 — Masked line reveals with SplitText 3.13+ API
- **Effect:** headlines rise line by line from behind invisible masks, which is editorial and confident.
- **Narrative:** section openers and the hero statement. Use it for *statements*, not every paragraph.
- **Implementation:**
  ```tsx
  'use client'
  export function Reveal({ as: Tag = 'h2', children, delay = 0 }: Props) {
    const ref = useRef<HTMLHeadingElement>(null)
    useGSAP(() => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        SplitText.create(ref.current!, {
          type: 'lines', mask: 'lines', linesClass: 'line', autoSplit: true, aria: 'auto',
          onSplit(self) {
            gsap.set(ref.current, { visibility: 'visible' })
            return gsap.from(self.lines, { yPercent: 115, rotate: 2, duration: 1.2, ease: 'reveal', stagger: 0.09, delay,
              scrollTrigger: { trigger: ref.current, start: 'top 85%', once: true } })
          },
        })
      })
    }, { scope: ref })
    return <Tag ref={ref} className={s.reveal}>{children}</Tag>
  }
  ```
  ```css
  /* hide only when JS will reveal it; html.js is added by a tiny inline <script> in layout <head> */
  :global(html.js) .reveal { visibility: hidden; }
  @media (prefers-reduced-motion: reduce) { :global(html.js) .reveal { visibility: visible; } }
  .reveal :global(.line) { padding-bottom: 0.08em; }  /* descenders inside masks */
  ```
- **Cost:** L (transforms), with a one-time split cost that grows with character count.
- **Pitfalls:** split only after fonts are ready. `autoSplit` handles the font `loadingdone` event and resize, but the animation **must** live in `onSplit` and be *returned*. Masks clip descenders and italic overhangs, so add bottom padding or a negative margin. `aria:'auto'` sets `aria-label` on the element, which is valid on headings. On generic `div/p/span` a name is not reliably announced, so for paragraphs use `type:'lines'` with `aria:'none'`: whole words stay intact and screen readers read them fine. Avoid `chars` on body copy because it breaks kerning and ligatures. Do not wrap interactive children, or use `ignore`.
- **Fallback:** reduced motion shows the text immediately (no split). With no JS the text is always visible because `html.js` is missing.

#### T10 — ScrambleText for labels, numerals, index counters
- **Effect:** mono labels decode into place, the "instrument panel" feel.
- **Narrative:** metadata, coordinates, section indices, real stats. Never body copy.
- **Implementation:** `gsap.to(el, { duration: 0.9, scrambleText: { text: el.dataset.text!, chars: 'upperAndLowerCase', revealDelay: 0.25, speed: 0.5 } })`. Trigger it on enter with `ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter })`. HAOQI runs its scramble at 40 ms ticks and subscribes only while in view.
- **Cost:** L.
- **Pitfalls:** width jitter, so use a monospace or `font-variant-numeric: tabular-nums` with fixed `ch` width. Screen readers may announce the garbage text: set `aria-label` to the final text and `aria-hidden` on the animated span.
- **Fallback:** reduced motion shows the final text instantly.

#### T11 — Variable-font axis animation
- **Effect:** type that breathes: weight/width/optical-size/grade shift with scroll, pointer proximity or state.
- **Narrative:** when the brand idea is about *transformation or tension* ("compress → expand", "soft ↔ sharp"). It is a big "wow" at low GPU cost and reads as craft.
- **Implementation:**
  ```ts
  // app/fonts.ts (server)
  import { Roboto_Flex, Fraunces } from 'next/font/google'
  export const flex = Roboto_Flex({ subsets: ['latin'], axes: ['wdth', 'opsz', 'GRAD'], variable: '--font-flex', display: 'swap' })
  // next/font validates axes at build and lists valid ones on error
  ```
  ```css
  @property --wdth { syntax: '<number>'; inherits: true; initial-value: 100; }
  @property --grad { syntax: '<number>'; inherits: true; initial-value: 0; }
  .display { font-family: var(--font-flex); font-stretch: calc(var(--wdth) * 1%);
             font-variation-settings: 'GRAD' var(--grad), 'opsz' 144; }
  ```
  ```ts
  gsap.to(heading, { '--wdth': 151, ease: 'none', scrollTrigger: { trigger: heading, start: 'top 80%', end: 'top 20%', scrub: true } })
  // pointer proximity per char (SplitText chars): animate GRAD, which keeps advance widths constant = no reflow
  ```
- **Cost:** L for GRAD/color. M–H for `wdth`/`wght` on long text, because every frame re-lays out the line.
- **Pitfalls:** `font-variation-settings` is all-or-nothing, since axes you omit reset. Use the high-level `font-weight`/`font-stretch` where an axis maps to them. Weight and width change advance widths, which causes layout thrash and text reflow, so restrict these to short display lines with fixed-width containers. **GRAD** (Roboto Flex) changes visual weight *without* reflow, which is the pro choice for proximity effects. Each extra axis increases the font file size.
- **Fallback:** reduced motion keeps a static axis value chosen for beauty. Fallback fonts use `adjustFontFallback`.

#### T12 — Flip layout transitions
- **Effect:** an element travels seamlessly between layouts or parents (grid ↔ list, card → fullscreen, hero object → next section slot).
- **Narrative:** continuity. It says "this is the same thing, seen closer".
- **Implementation (React):**
  ```tsx
  const stateRef = useRef<Flip.FlipState | null>(null)
  const toggle = contextSafe(() => { stateRef.current = Flip.getState('[data-flip-id]'); setMode((m) => (m === 'grid' ? 'list' : 'grid')) })
  useGSAP(() => {
    if (!stateRef.current) return
    Flip.from(stateRef.current, { duration: 0.9, ease: 'expo.inOut', absolute: true, nested: true, scale: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0 }, { opacity: 1 }), onLeave: (els) => gsap.to(els, { opacity: 0 }) })
  }, { dependencies: [mode], scope: root })
  ```
- **Cost:** L–M (measuring plus transforms).
- **Pitfalls:** React must keep the same DOM nodes (stable `key`s), or you must use `data-flip-id` to pair old and new nodes. Capture state *before* setState and animate *after* commit (the dependency-driven `useGSAP` above). `absolute:true` inside a Lenis page is fine, but avoid it inside transformed ancestors. Also refresh ScrollTrigger after layout changes.
- **Fallback:** reduced motion switches layout instantly (skip `Flip.from`) or crossfades at ≤200 ms.

#### T13 — Magnetic buttons
- **Effect:** the CTA leans toward the pointer and snaps back elastically. The label moves more than the frame, which reads as depth.
- **Narrative:** primary CTAs only (1–3 on the page). It makes the invitation tactile.
- **Implementation:**
  ```tsx
  export function Magnetic({ children, strength = 0.3 }: { children: ReactNode; strength?: number }) {
    const root = useRef<HTMLSpanElement>(null)
    useGSAP(() => {
      const mm = gsap.matchMedia()
      mm.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
        const el = root.current!, inner = el.firstElementChild as HTMLElement, label = inner.querySelector('[data-label]')
        const xTo = gsap.quickTo(inner, 'x', { duration: 0.6, ease: 'power3' }), yTo = gsap.quickTo(inner, 'y', { duration: 0.6, ease: 'power3' })
        const lx = label && gsap.quickTo(label, 'x', { duration: 0.6, ease: 'power3' }), ly = label && gsap.quickTo(label, 'y', { duration: 0.6, ease: 'power3' })
        const move = (e: PointerEvent) => { const r = el.getBoundingClientRect()
          const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2)
          xTo(dx * strength); yTo(dy * strength); lx?.(dx * strength * 0.5); ly?.(dy * strength * 0.5) }
        const leave = () => { xTo(0); yTo(0); lx?.(0); ly?.(0) }
        el.addEventListener('pointermove', move); el.addEventListener('pointerleave', leave)
        return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave) }
      })
    }, { scope: root })
    return <span ref={root} className={s.magnet}>{children}</span>   // padding = larger capture zone
  }
  ```
- **Cost:** L.
- **Pitfalls:** move an **inner visual layer**, never the hit-tested element, or the hover state flickers as the box escapes the pointer. Keep `:focus-visible` rings on the static outer element. Do not magnetize inline text links.
- **Fallback:** touch and reduced motion get a plain button with color and underline states.

#### T14 — Custom cursor (and when NOT to)
- **Effect:** a small follower that carries *information* ("drag", "play", "view"), or couples to the WebGL field by feeding pointer position to the fluid or ripples.
- **Narrative, use it when:** the pointer is an instrument in the concept (stirring a fluid, lighting a scene, revealing), or when the cursor labels an affordance that is not otherwise obvious (drag a horizontal gallery).
- **When NOT:** as decoration. Not on touch devices, over text inputs or selectable body text, when it lags the system cursor (it always will slightly, so **never hide the native cursor globally**), or under reduced motion. A blend-mode blob over everything is a 2019 cliché.
- **Implementation:**
  ```ts
  mm.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
    const xTo = gsap.quickTo(dot, 'x', { duration: 0.35, ease: 'power3' }), yTo = gsap.quickTo(dot, 'y', { duration: 0.35, ease: 'power3' })
    const onMove = (e: PointerEvent) => { xTo(e.clientX); yTo(e.clientY); stagePointer.set(e.clientX, e.clientY) }
    const onOver = (e: PointerEvent) => { const t = (e.target as Element).closest<HTMLElement>('[data-cursor]'); dot.dataset.state = t?.dataset.cursor ?? '' }
    addEventListener('pointermove', onMove, { passive: true }); addEventListener('pointerover', onOver)
    return () => { removeEventListener('pointermove', onMove); removeEventListener('pointerover', onOver) }
  })
  ```
  The element is `position: fixed; pointer-events: none; translate: -50% -50%`, with its label text also rendered as `title`/visible UI elsewhere for accessibility.
- **Cost:** L.
- **Pitfalls:** `mix-blend-mode: difference` on a *small* element is fine. On a large one it forces expensive compositing. Hide the follower on `pointerleave` of the document and on `blur`.
- **Fallback:** native cursor always visible. Affordance labels are visible in the UI for touch.

#### T15 — Infinite, velocity-reactive marquee
- **Effect:** a ticker of words or marks that speeds up with scroll and reverses with direction.
- **Narrative:** rhythm between chapters, or a manifesto line. Use one per page.
- **Implementation:** CSS baseline plus GSAP enhancement:
  ```tsx
  <div className={s.marquee} data-marquee>
    <div className={s.track}>{items}<span aria-hidden>{itemsClone /* links: tabIndex={-1} */}</span></div>
  </div>
  ```
  ```css
  .track { display: flex; width: max-content; animation: m 40s linear infinite; }
  @keyframes m { to { transform: translateX(-50%); } }
  :global(html.js) .track { animation: none; }       /* GSAP takes over */
  @media (prefers-reduced-motion: reduce) { .track { animation: none; } }
  ```
  ```ts
  const setX = gsap.quickSetter(track, 'xPercent'), wrap = gsap.utils.wrap(-50, 0)
  let x = 0, speed = 1, dir = -1, active = false, paused = false
  new IntersectionObserver(([e]) => (active = e.isIntersecting)).observe(root)
  afterScroll.add((_t, dt) => {
    if (!active || paused || quality.reducedMotion) return
    if (scrollStore.direction) dir = -scrollStore.direction as -1 | 1
    const target = 1 + Math.min(Math.abs(scrollStore.velocity) * 0.12, 5)
    speed += (target - speed) * 0.08
    x = wrap(x + dir * speed * dt * 0.0012); setX(x)
  })
  root.addEventListener('pointerenter', () => (paused = true)); root.addEventListener('focusin', () => (paused = true))
  ```
- **Cost:** L.
- **Pitfalls:** content must be at least viewport width ×2, so repeat items as needed. **WCAG 2.2.2 (Pause, Stop, Hide):** auto-moving content longer than 5 s needs a pause mechanism, provided here by hover/focus pause plus reduced-motion handling. The duplicate copy must be `aria-hidden`, with its links removed from tab order.
- **Fallback:** reduced motion shows a static, wrapped row.

#### T16 — Preloader / intro choreography with a *real* loading signal
- **Effect:** a short, authored overture (≤2.5 s typical) whose progress is **true**, then a handoff into the hero: masks open, the canvas "ignites", and the headline lines rise.
- **Narrative:** it sets the tone and hides shader compile hitches. Justified only because we genuinely warm GPU programs. Never fake a counter.
- **Implementation:**
  ```ts
  // lib/boot.ts: weighted real signals
  export const boot = { fonts: 0, assets: 0, shaders: 0, frame: 0 }
  const W = { fonts: 0.2, assets: 0.4, shaders: 0.3, frame: 0.1 }
  export const progress = () => Object.entries(W).reduce((s, [k, w]) => s + w * (boot as any)[k], 0)
  document.fonts.ready.then(() => (boot.fonts = 1))
  ```
  ```tsx
  // inside Canvas
  function Warmup() {
    const { gl, scene, camera } = useThree()
    const assets = useProgress((s) => s.progress)                      // drei, DefaultLoadingManager
    useEffect(() => { boot.assets = assets / 100 }, [assets])
    useEffect(() => { let live = true
      simWarmupStep()                                                  // run 1 fluid/GPGPU step: compiles off-scene programs
      gl.compileAsync(scene, camera).then(() => live && (boot.shaders = 1))
      return () => { live = false } }, [gl, scene, camera])
    const seen = useRef(false)
    useFrame(() => { if (!seen.current) { seen.current = true; requestAnimationFrame(() => (boot.frame = 1)) } })
    return null
  }
  ```
  ```ts
  // Loader component: displayed number chases the real value, never overtakes it
  const shown = { v: 0 }; const to = gsap.quickTo(shown, 'v', { duration: 0.6, ease: 'power2.out', onUpdate: () => (num.textContent = String(Math.round(shown.v * 100)).padStart(3, '0')) })
  afterScroll.add(() => to(progress()))
  // exit when progress()===1 && elapsed ≥ 900ms, or at 6000ms failsafe
  const exit = gsap.timeline({ onComplete: () => { loader.remove(); lenis.start(); ScrollTrigger.refresh() } })
    .to(numEl, { yPercent: -100, duration: 0.6, ease: 'expo.in' })
    .to(loader, { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.inOut' }, '<0.1')
    .to(stageUniforms.uIntro, { value: 1, duration: 1.6, ease: 'expo.out' }, '<0.3')
    .add(() => heroReveal.play(), '<0.2')
  ```
  Skip or shorten on repeat visits with `sessionStorage` (wrapped in try/catch).
- **Cost:** L (the warm-up *removes* later jank).
- **Pitfalls:** `useProgress` only counts loaders that use `DefaultLoadingManager` (drei/three loaders), not `fetch`. `compileAsync` only compiles objects in `scene`, so off-scene sim materials (FBO passes, GPUComputationRenderer) compile on first use; run one step during the loader. Keep the `<h1>` in SSR HTML underneath the loader for LCP and SEO, and do not `display:none` the page. Include the failsafe timeout, because a stuck loader is fatal.
- **Fallback:** reduced motion shows the loader only if it takes more than 400 ms, then a 200 ms fade. For no-WebGL the shader weight is marked as 1 immediately. With no JS there is no loader (it is rendered by JS only).

#### T17 — View Transitions API (same-document)
- **Effect:** native, snapshot-based morphs, e.g. a circular "ink flood" theme switch from the click point, or a crossfading state swap of a content panel.
- **Narrative:** state changes that deserve ceremony: palette/mode toggles ("day ↔ night", "ink ↔ paper") or switching a featured item.
- **Support:** same-document is **Baseline newly available since Firefox 144 (Oct 2025)**, alongside Chrome/Edge 111+ and Safari 18+ ([web.dev](https://web.dev/blog/same-document-view-transitions-are-now-baseline-newly-available)). Cross-document is Chromium-first and irrelevant for a single page.
- **Implementation:**
  ```ts
  import { flushSync } from 'react-dom'
  const toggleTheme = contextSafe(async (e: React.MouseEvent) => {
    const apply = () => flushSync(() => setTheme((t) => (t === 'ink' ? 'paper' : 'ink')))
    if (!document.startViewTransition || quality.reducedMotion) return apply()
    const { clientX: x, clientY: y } = e
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
    const vt = document.startViewTransition(apply)
    await vt.ready
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
      { duration: 800, easing: 'cubic-bezier(.7,0,.2,1)', pseudoElement: '::view-transition-new(root)' })
  })
  ```
  ```css
  ::view-transition-old(root), ::view-transition-new(root) { animation: none; mix-blend-mode: normal; }
  ::view-transition { pointer-events: none; }
  @media (prefers-reduced-motion: reduce) { ::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*) { animation-duration: 0s !important; } }
  ```
  The canvas must pick up the new theme synchronously in the same commit (T04) so the new snapshot shows it. The new state is live, so WebGL keeps animating inside the circle.
- **Cost:** L–M. It snapshots full-viewport bitmaps, so it is brief.
- **Pitfalls:** do not start a VT while another is running (guard with a flag). Named elements are not hit-testable during the transition. Keyboard trigger `clientX/Y` = 0, so fall back to the button center. React's `<ViewTransition>` component is for route/Transition-driven updates. For this toggle the raw API with `flushSync` is simpler and more predictable.
- **Fallback:** an instant swap, or no API at all, which is the same thing.

#### T18 — CSS scroll-driven animations (`animation-timeline`) as progressive enhancement
- **Effect:** scroll-linked reveals, parallax and progress bars that run **off the main thread** with zero JS.
- **Narrative:** the whole tier 0/2 experience (no WebGL, low-end), plus a reading-progress hairline everywhere.
- **Support:** Chrome/Edge 115+, **Safari 26+** (threaded since 26.4). Firefox is still behind a flag as of 152, with Interop 2026 as the focus ([MDN guide](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations), [status write-up](https://cssawwwards.com/blog/css-scroll-driven-animations-guide-2026)).
- **Implementation:**
  ```css
  @supports (animation-timeline: view()) {
    @media (prefers-reduced-motion: no-preference) {
      :global(html[data-tier='0']) .card, :global(html[data-tier='2']) .card {
        animation: rise linear both; animation-timeline: view(); animation-range: entry 5% cover 35%;
      }
      .progress { transform-origin: 0 50%; animation: grow linear both; animation-timeline: scroll(root); }
    }
  }
  @keyframes rise { from { opacity: 0; translate: 0 8vh; } }
  @keyframes grow { from { scale: 0 1; } }
  ```
- **Cost:** L (compositor-driven for transform and opacity).
- **Pitfalls:** it works with Lenis because Lenis moves the real scroll position every frame. **Never** let CSS and GSAP animate the same property on the same element; gate with `data-tier`. Animating non-compositable properties (width, filter on big layers) moves the work back to the main thread.
- **Fallback:** without support the content is simply static and fully visible (keyframes use `from` only).

#### T19 — Film grain overlay without killing performance
- **Effect:** analog tooth and cohesion that unifies DOM and WebGL and fights gradient banding.
- **Narrative:** almost always subtle (3–6% opacity). It ties shader art and typography into one surface.
- **Implementation, best option:** if an EffectComposer exists, grain lives **in the post chain**, where it is essentially free because it merges into an existing pass:
  `<Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.35} />`, or a custom animated grain inside the dither/halftone effect.
  **DOM option** (covers DOM-only tiers and areas above the canvas):
  ```ts
  function grainTile(n = 192) { const c = document.createElement('canvas'); c.width = c.height = n
    const ctx = c.getContext('2d')!, img = ctx.createImageData(n, n)
    for (let i = 0; i < img.data.length; i += 4) { const v = (Math.random() * 255) | 0; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255 }
    ctx.putImageData(img, 0, 0); return c.toDataURL('image/png') }
  document.documentElement.style.setProperty('--grain', `url(${grainTile()})`)
  ```
  ```css
  .grain { position: fixed; inset: -192px; pointer-events: none; z-index: 90; opacity: .05;
           background: var(--grain) repeat; animation: grain .8s steps(5) infinite; }
  @keyframes grain { 20% { translate: -96px 48px } 40% { translate: 64px -96px } 60% { translate: -32px 96px } 80% { translate: 96px 32px } }
  @media (prefers-reduced-motion: reduce) { .grain { animation: none; } }
  ```
- **Cost:** L. The layer is composited and only its transform animates. Memory is about (vw+384)×(vh+384)×dpr² bytes × 4.
- **Pitfalls:** do **not** use an animated SVG `feTurbulence` filter (CPU raster every frame). Avoid `mix-blend-mode` on a full-screen layer (Safari compositing cost). Avoid oversized `inset:-50%` layers (4× viewport textures on retina). Do not stack DOM grain *over* WebGL grain.
- **Fallback:** static grain (no animation) for reduced motion. With no JS there is no grain, or ship a tiny prebuilt PNG in `/public`.

#### T20 — Generative Web Audio ambient (opt-in, toggle)
- **Effect:** a slow, evolving drone and "air" whose filter opens with scroll velocity or chapter. The page becomes an instrument.
- **Narrative:** justified when the concept is sensory or environmental (depth, water, light, signal). **Always off by default**, with a clearly labeled toggle.
- **Implementation:**
  ```ts
  export function createAmbient() {                 // MUST be called inside the click handler
    const ctx = new AudioContext()
    const master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination)
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 600; lp.Q.value = 0.6; lp.connect(master)
    const voices = [55, 82.41, 110, 164.81].map((f, i) => {           // A1 E2 A2 E3: open fifths, no melody
      const o = ctx.createOscillator(); o.type = i % 2 ? 'triangle' : 'sine'
      o.frequency.value = f; o.detune.value = (Math.random() - 0.5) * 10
      const g = ctx.createGain(); g.gain.value = 0.14 / (i + 1); o.connect(g).connect(lp); o.start(); return o })
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.04
    const lfoAmt = ctx.createGain(); lfoAmt.gain.value = 220; lfo.connect(lfoAmt).connect(lp.frequency); lfo.start()
    const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), d = buf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
    const air = ctx.createBufferSource(); air.buffer = buf; air.loop = true
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1400; bp.Q.value = 0.5
    const airG = ctx.createGain(); airG.gain.value = 0.015; air.connect(bp).connect(airG).connect(master); air.start()
    const now = () => ctx.currentTime
    return {
      on: () => master.gain.setTargetAtTime(0.45, now(), 0.9),     // smooth, click-free ramps
      off: () => master.gain.setTargetAtTime(0, now(), 0.25),
      energy: (v: number) => lp.frequency.setTargetAtTime(420 + v * 1600, now(), 0.2),
      suspend: () => ctx.suspend(), resume: () => ctx.resume(),
      close: async () => { voices.forEach((o) => o.stop()); lfo.stop(); air.stop(); await ctx.close() },
    }
  }
  ```
  UI: `<button role="switch" aria-checked={on} aria-label="Ambient sound">` with visible text ("Sound on/off") and animated EQ bars as the state indicator. On `visibilitychange` hidden call `suspend()`. Map `afterScroll` velocity to `energy()` with a throttle of about 10 Hz (AudioParam automation, not per frame). Persist the preference in `localStorage` with try/catch, but still require a gesture to start.
- **Cost:** L (a handful of nodes).
- **Pitfalls:** autoplay policy ([MDN best practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices), [Chrome autoplay](https://developer.chrome.com/blog/autoplay)): create or resume only inside a user gesture. Setting `.value` while automation runs causes zipper noise, so use `setTargetAtTime`. iOS hardware silent mode may mute Web Audio. Keep levels low (−18 dBFS-ish), because full-scale sines are unpleasant on laptop speakers. Stereo detune should not phase-cancel on mono phone speakers.
- **Fallback:** it is off by default for everyone. Reduced-motion users can still opt in (sound is not motion). Hide the toggle when no `AudioContext` exists.

### C. WebGL / GLSL

> Licensing: write shaders ourselves or use MIT sources (e.g. [stegu/webgl-noise](https://github.com/stegu/webgl-noise) for simplex noise, [PavelDoGreat/WebGL-Fluid-Simulation](https://github.com/PavelDoGreat/WebGL-Fluid-Simulation) is MIT). **Do not paste Shadertoy code**: its default license is CC BY-NC-SA 3.0 ([terms](https://www.shadertoy.com/terms)). three's `ShaderMaterial` (not `RawShaderMaterial`) auto-defines `texture2D`→`texture` and `gl_FragColor`→`pc_fragColor`, so GLSL1-style code below compiles on WebGL2. Keep shaders as TS template strings (`/* glsl */\`...\``), which needs no Turbopack loader config.

#### T21 — Full-screen shader primitive (typed `shaderMaterial`)
- **Effect:** the base canvas for procedural backdrops (fields, gradients, caustics, raymarch).
- **Narrative:** any "living background". It must depict *the concept*, not a generic mesh gradient (an AI-slop tell).
- **Implementation:**
  ```tsx
  import { shaderMaterial } from '@react-three/drei'
  import { extend, useFrame, useThree, type ThreeElement } from '@react-three/fiber'
  const FieldMaterial = shaderMaterial(
    { uTime: 0, uRes: new THREE.Vector2(1, 1), uPointer: new THREE.Vector2(), uVelocity: 0, uIntro: 0,
      uInk: new THREE.Color('#0d0d0f'), uPaper: new THREE.Color('#efe9df') },
    /* glsl */`varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
    /* glsl */`uniform float uTime, uVelocity, uIntro; uniform vec2 uRes, uPointer; uniform vec3 uInk, uPaper; varying vec2 vUv;
      void main(){ vec2 p = (vUv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
        float f = 0.5 + 0.5 * sin(6.0 * length(p - uPointer * 0.3) - uTime * 0.6 + uVelocity * 0.02);
        gl_FragColor = vec4(mix(uPaper, uInk, f * uIntro), 1.0); }`)
  extend({ FieldMaterial })
  declare module '@react-three/fiber' { interface ThreeElements { fieldMaterial: ThreeElement<typeof FieldMaterial> } }

  export function Field() {
    const ref = useRef<InstanceType<typeof FieldMaterial>>(null!)
    const { size, viewport } = useThree()
    useFrame((s, dt) => { const m = ref.current; m.uTime += Math.min(dt, 1 / 30)
      m.uRes.set(size.width * viewport.dpr, size.height * viewport.dpr) }, -1)
    return <mesh frustumCulled={false} renderOrder={-10}><planeGeometry args={[2, 2]} />
      <fieldMaterial ref={ref} key={FieldMaterial.key} depthWrite={false} depthTest={false} /></mesh>
  }
  ```
- **Cost:** L–H depending on the fragment code (it runs for every pixel × DPR²).
- **Pitfalls:** use `gl_FragCoord`-based math with `uRes` in **device pixels** (size × dpr). Set `frustumCulled={false}` for clip-space quads. Full-screen shaders scale with DPR², so cap DPR or render into a half-res FBO and upsample.
- **Fallback:** a CSS gradient poster with the same palette. Reduced motion: time is frozen, rendered once.

#### T22 — GPU stable fluids (ping-pong FBO simulation)
- **Effect:** real ink/smoke dynamics stirred by pointer and scroll, with swirls from vorticity confinement.
- **Narrative:** strongest when the concept involves *flow, influence, signal, ink or water*. The user's gesture literally leaves a mark. It can double as the distortion field for DOM images and text (T23).
- **Algorithm** (Stam's stable fluids; implementation after [Pavel Dobryakov, MIT](https://github.com/PavelDoGreat/WebGL-Fluid-Simulation)): per frame the passes are curl → vorticity → divergence → clear pressure → **Jacobi pressure ×N** → gradient subtract → advect velocity → advect dye, plus splats on input.
- **Implementation (framework-agnostic class, driven from `useFrame(-2)`):**
  ```ts
  const RT: THREE.RenderTargetOptions = { type: THREE.HalfFloatType, format: THREE.RGBAFormat, depthBuffer: false,
    minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, wrapS: THREE.ClampToEdgeWrapping, wrapT: THREE.ClampToEdgeWrapping }
  class DoubleFBO { read: THREE.WebGLRenderTarget; write: THREE.WebGLRenderTarget
    constructor(w: number, h: number) { this.read = new THREE.WebGLRenderTarget(w, h, RT); this.write = new THREE.WebGLRenderTarget(w, h, RT) }
    swap() { const t = this.read; this.read = this.write; this.write = t } dispose() { this.read.dispose(); this.write.dispose() } }

  export class Fluid {
    scene = new THREE.Scene(); cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2)); vel: DoubleFBO; dye: DoubleFBO; prs: DoubleFBO
    div: THREE.WebGLRenderTarget; curl: THREE.WebGLRenderTarget; m: Record<string, THREE.ShaderMaterial>
    constructor(private gl: THREE.WebGLRenderer, sim = 128, dyeRes = 512, aspect = 1) {
      const sw = Math.round(sim * aspect), dw = Math.round(dyeRes * aspect)
      this.vel = new DoubleFBO(sw, sim); this.prs = new DoubleFBO(sw, sim); this.dye = new DoubleFBO(dw, dyeRes)
      this.div = new THREE.WebGLRenderTarget(sw, sim, RT); this.curl = new THREE.WebGLRenderTarget(sw, sim, RT)
      this.scene.add(this.quad); this.m = makePassMaterials(new THREE.Vector2(1 / sw, 1 / sim))   // GLSL below
    }
    private run(mat: THREE.ShaderMaterial, target: THREE.WebGLRenderTarget) {
      this.quad.material = mat; this.gl.setRenderTarget(target); this.gl.render(this.scene, this.cam) }
    splat(x: number, y: number, dx: number, dy: number, color: THREE.Color, aspect: number, radius = 0.0025) {
      const s = this.m.splat; s.uniforms.uPoint.value.set(x, y); s.uniforms.uAspect.value = aspect; s.uniforms.uRadius.value = radius
      s.uniforms.uTarget.value = this.vel.read.texture; s.uniforms.uColor.value.set(dx, dy, 0); this.run(s, this.vel.write); this.vel.swap()
      s.uniforms.uTarget.value = this.dye.read.texture; s.uniforms.uColor.value.set(color.r, color.g, color.b); this.run(s, this.dye.write); this.dye.swap() }
    step(dt: number, iters = 20) {
      const { m } = this, prev = this.gl.getRenderTarget()
      m.curl.uniforms.uVelocity.value = this.vel.read.texture; this.run(m.curl, this.curl)
      m.vort.uniforms.uVelocity.value = this.vel.read.texture; m.vort.uniforms.uCurl.value = this.curl.texture; m.vort.uniforms.uDt.value = dt
      this.run(m.vort, this.vel.write); this.vel.swap()
      m.div.uniforms.uVelocity.value = this.vel.read.texture; this.run(m.div, this.div)
      m.clear.uniforms.uTex.value = this.prs.read.texture; this.run(m.clear, this.prs.write); this.prs.swap()   // p *= 0.8
      m.prs.uniforms.uDivergence.value = this.div.texture
      for (let i = 0; i < iters; i++) { m.prs.uniforms.uPressure.value = this.prs.read.texture; this.run(m.prs, this.prs.write); this.prs.swap() }
      m.grad.uniforms.uPressure.value = this.prs.read.texture; m.grad.uniforms.uVelocity.value = this.vel.read.texture
      this.run(m.grad, this.vel.write); this.vel.swap()
      m.adv.uniforms.uVelocity.value = this.vel.read.texture; m.adv.uniforms.uSource.value = this.vel.read.texture
      m.adv.uniforms.uDt.value = dt; m.adv.uniforms.uDiss.value = 0.2; this.run(m.adv, this.vel.write); this.vel.swap()
      m.adv.uniforms.uVelocity.value = this.vel.read.texture; m.adv.uniforms.uSource.value = this.dye.read.texture
      m.adv.uniforms.uDiss.value = 1.0; this.run(m.adv, this.dye.write); this.dye.swap()
      this.gl.setRenderTarget(prev) }
    dispose() { [this.vel, this.dye, this.prs].forEach((d) => d.dispose()); this.div.dispose(); this.curl.dispose()
      Object.values(this.m).forEach((x) => x.dispose()); this.quad.geometry.dispose() }
  }
  ```
  Pass fragment shaders (each shares `varying vec2 vUv; uniform vec2 uTexel;`, and the vertex shader is the clip-space quad from T21):
  ```glsl
  // advect: semi-Lagrangian backtrace
  uniform sampler2D uVelocity, uSource; uniform float uDt, uDiss;
  void main(){ vec2 c = vUv - uDt * texture2D(uVelocity, vUv).xy * uTexel;
    gl_FragColor = texture2D(uSource, c) / (1.0 + uDiss * uDt); }
  // divergence
  uniform sampler2D uVelocity;
  void main(){ float L = texture2D(uVelocity, vUv - vec2(uTexel.x,0)).x, R = texture2D(uVelocity, vUv + vec2(uTexel.x,0)).x;
    float B = texture2D(uVelocity, vUv - vec2(0,uTexel.y)).y, T = texture2D(uVelocity, vUv + vec2(0,uTexel.y)).y;
    gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0); }
  // pressure (Jacobi)
  uniform sampler2D uPressure, uDivergence;
  void main(){ float L = texture2D(uPressure, vUv - vec2(uTexel.x,0)).x, R = texture2D(uPressure, vUv + vec2(uTexel.x,0)).x;
    float B = texture2D(uPressure, vUv - vec2(0,uTexel.y)).x, T = texture2D(uPressure, vUv + vec2(0,uTexel.y)).x;
    gl_FragColor = vec4((L + R + B + T - texture2D(uDivergence, vUv).x) * 0.25, 0.0, 0.0, 1.0); }
  // gradient subtract
  uniform sampler2D uPressure, uVelocity;
  void main(){ float L = texture2D(uPressure, vUv - vec2(uTexel.x,0)).x, R = texture2D(uPressure, vUv + vec2(uTexel.x,0)).x;
    float B = texture2D(uPressure, vUv - vec2(0,uTexel.y)).x, T = texture2D(uPressure, vUv + vec2(0,uTexel.y)).x;
    vec2 v = texture2D(uVelocity, vUv).xy - vec2(R - L, T - B); gl_FragColor = vec4(v, 0.0, 1.0); }
  // curl
  uniform sampler2D uVelocity;
  void main(){ float L = texture2D(uVelocity, vUv - vec2(uTexel.x,0)).y, R = texture2D(uVelocity, vUv + vec2(uTexel.x,0)).y;
    float B = texture2D(uVelocity, vUv - vec2(0,uTexel.y)).x, T = texture2D(uVelocity, vUv + vec2(0,uTexel.y)).x;
    gl_FragColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0); }
  // vorticity confinement
  uniform sampler2D uVelocity, uCurl; uniform float uCurlAmt, uDt;
  void main(){ float L = texture2D(uCurl, vUv - vec2(uTexel.x,0)).x, R = texture2D(uCurl, vUv + vec2(uTexel.x,0)).x;
    float B = texture2D(uCurl, vUv - vec2(0,uTexel.y)).x, T = texture2D(uCurl, vUv + vec2(0,uTexel.y)).x, C = texture2D(uCurl, vUv).x;
    vec2 f = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L)); f /= length(f) + 1e-4; f *= uCurlAmt * C; f.y *= -1.0;
    gl_FragColor = vec4(texture2D(uVelocity, vUv).xy + f * uDt, 0.0, 1.0); }
  // splat (gaussian)
  uniform sampler2D uTarget; uniform vec2 uPoint; uniform vec3 uColor; uniform float uAspect, uRadius;
  void main(){ vec2 p = vUv - uPoint; p.x *= uAspect; vec3 s = exp(-dot(p, p) / uRadius) * uColor;
    gl_FragColor = vec4(texture2D(uTarget, vUv).xyz + s, 1.0); }
  ```
  Input: pointer delta (px) × ~6 becomes the force. Scroll velocity injects a gentle vertical force along a line. The dye color comes from tokens (T04). Display the result through the composite shader (ink over paper) or use it as a displacement map (T23).
- **Cost:** M at sim 128 / dye 512 with 20 Jacobi iterations (about 30 tiny passes). Reduce to sim 64 / dye 256 / 12 iterations for tier 2. The dye display pass is the only full-res cost.
- **Pitfalls:** render-to-half-float needs `EXT_color_buffer_half_float` or `EXT_color_buffer_float`. Check `gl.extensions.has(...)` and on failure fall back to tier 2 (no sim, procedural field). Keep FBO size **independent of DPR**. Clamp dt to 1/30, because a tab-switch jump explodes the sim. Restore `setRenderTarget(prev)`. Context loss wipes all sim state (T35). Do not re-create FBOs on every resize, only when the aspect changes by more than 15%.
- **Fallback:** reduced motion: no sim, a static composed frame (seed a few splats, run 60 steps once, then render on demand). No-WebGL: CSS poster.

#### T23 — Fluid (or any field) as a distortion map for DOM-mirrored imagery and text
- **Effect:** images and headline textures ripple and smear where the pointer stirred the fluid, so the art and the content share physics.
- **Narrative:** "your touch disturbs the surface of the work". It is the coupling that makes the WebGL feel *part* of the page.
- **Implementation:** sample `fluid.vel.read.texture` in the DOM-plane fragment shader (T25), in screen space:
  ```glsl
  uniform sampler2D uMap, uFlow; uniform vec2 uViewport; varying vec2 vUv;
  void main(){ vec2 suv = gl_FragCoord.xy / uViewport;                  // screen uv, device px
    vec2 flow = texture2D(uFlow, suv).xy * 0.0008;
    float r = texture2D(uMap, vUv + flow * 1.00).r, g = texture2D(uMap, vUv + flow * 1.15).g, b = texture2D(uMap, vUv + flow * 1.3).b;
    gl_FragColor = vec4(r, g, b, 1.0); }
  ```
- **Cost:** L per plane (3 texture reads).
- **Pitfalls:** `gl_FragCoord` is in drawing-buffer pixels, so `uViewport` must be size × dpr. Keep the displacement amplitude small, because legibility wins.
- **Fallback:** DOM `<img>` / text only.

#### T24 — Caustics (procedural cheap; physically-based premium)
- **Effect:** dancing light networks cast through water or glass onto surfaces.
- **Narrative:** light passing *through* something: clarity, depth, water, lenses, "insight".
- **Implementation A, procedural (original code, L–M):**
  ```glsl
  vec2 h2(vec2 p){ p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3))); return fract(sin(p) * 43758.5453); }
  float cellEdge(vec2 x, float t){ vec2 n = floor(x), f = fract(x); float d1 = 8.0, d2 = 8.0;
    for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) { vec2 g = vec2(i, j), o = 0.5 + 0.5 * sin(t + 6.2831 * h2(n + g));
      float d = length(g + o - f); if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) d2 = d; }
    return d2 - d1; }                                                      // 0 on cell borders = bright filaments
  float caustic(vec2 uv, float t){ vec2 w = uv + 0.12 * vec2(sin(uv.y * 3.1 + t), cos(uv.x * 2.7 - t * 0.8));
    float a = 1.0 - smoothstep(0.0, 0.11, cellEdge(w * 4.0, t * 0.7));
    float b = 1.0 - smoothstep(0.0, 0.09, cellEdge(w * 6.5 + 3.7, -t * 0.55));
    return pow(a, 3.0) + 0.6 * pow(b, 3.0); }
  // dispersion: vec3 c = vec3(caustic(uv + d, t), caustic(uv, t), caustic(uv - d, t));
  ```
  **B, physically based (H–XH):** [Maxime Heckel's pipeline](https://blog.maximeheckel.com/posts/caustics-in-webgl/): render the refractive mesh's normals into an FBO from the light's view, then refract light rays and compute brightness as the ratio of areas before and after refraction via `dFdx/dFdy` (`lightArea / newLightArea`). Project onto a receiver plane with `CustomBlending` (One / SrcAlpha), adding a multi-sample CA blur. drei also exports a `<Caustics>` component (verified in 10.7.9, heavy).
- **Cost:** A = L–M full-screen. B = H.
- **Pitfalls:** caustics look fake if they do not *move with a cause* (surface motion, light, pointer). Tie `t` to the fluid or scroll. Add bloom sparingly.
- **Fallback:** a frozen frame (reduced motion) or a CSS poster.

#### T25 — DOM-synced WebGL planes (tracking DOM rects)
- **Effect:** images, videos and text blocks rendered as WebGL planes that sit **exactly** where their DOM twins are, so shaders can distort, reveal or refract them while layout stays DOM, accessible and responsive.
- **Narrative:** the gallery or case-study imagery and the hero statement. Wherever content itself should feel physical.
- **Implementation (single fixed canvas, ortho pixel camera from T03, one clock from Part 2):**
  ```tsx
  export function DomPlane({ el, texture }: { el: HTMLElement; texture: THREE.Texture }) {
    const mesh = useRef<THREE.Mesh>(null!), rect = useRef({ x: 0, y: 0, w: 1, h: 1 })
    const size = useThree((s) => s.size)
    useLayoutEffect(() => {
      const measure = () => { const r = el.getBoundingClientRect(); rect.current = { x: r.left, y: r.top + scrollStore.y, w: r.width, h: r.height } }
      measure(); const ro = new ResizeObserver(measure); ro.observe(el)
      ScrollTrigger.addEventListener('refresh', measure)                 // pin spacers move things
      return () => { ro.disconnect(); ScrollTrigger.removeEventListener('refresh', measure) }
    }, [el])
    useFrame(() => {
      const { x, y, w, h } = rect.current, top = y - scrollStore.y          // same scroll value Lenis just wrote
      const vis = top < size.height + 200 && top + h > -200; mesh.current.visible = vis; if (!vis) return
      mesh.current.scale.set(w, h, 1)
      mesh.current.position.set(x + w / 2 - size.width / 2, -(top + h / 2) + size.height / 2, 0)
    }, -1)
    return <mesh ref={mesh}><planeGeometry args={[1, 1, 32, 32]} /><imagePlaneMaterial uMap={texture} /></mesh>
  }
  ```
  The DOM `<img>` keeps `alt` and stays in flow. When `html.webgl-ready`, set its `opacity: 0` (not `visibility`, so it keeps layout and hit-testing). Elements inside **pinned** sections need a live `getBoundingClientRect()` each frame (≤ 20 elements is OK), or HAOQI's approach: correct cached rects by scroll delta and refresh near-viewport items every frame, far ones every 12 frames, staggered.
  Alternative: drei `<View>` (T34) when each DOM box should host its *own* 3D scene.
- **Cost:** L per plane for the draw. Measuring on resize only is L. Live measuring in pins is M.
- **Pitfalls:** use `scrollStore.y` (from Lenis this frame), never `window.scrollY` read at another time. Re-measure after fonts, images and preloader removal. `object-fit: cover` must be replicated in the shader (UV scale by the aspect ratios of image vs plane). Textures: `texture.colorSpace = THREE.SRGBColorSpace`, and `gl.initTexture(tex)` during the loader to avoid first-show upload hitches.
- **Fallback:** the DOM images are the fallback. They simply stay visible (`html:not(.webgl-ready)`).

#### T26 — Shader image hover / reveal (dot-matrix, displacement, "development")
- **Effect:** images resolve through a halftone dot grid, ink bleed, or a "photographic development" from negative to positive.
- **Narrative:** revealing work as *discovery*. Tie the reveal metaphor to the brand (printing, signal, exposure).
- **Implementation (dot-matrix reveal, in the DOM-plane material):**
  ```glsl
  uniform sampler2D uMap; uniform float uProgress, uCells; uniform vec2 uPlane; varying vec2 vUv;
  void main(){ vec2 grid = vec2(uCells, uCells * uPlane.y / uPlane.x);
    vec2 id = floor(vUv * grid), local = fract(vUv * grid) - 0.5;
    float d = distance((id + 0.5) / grid, vec2(0.5));                       // radial wave from center
    float grow = clamp(uProgress * 1.6 - d, 0.0, 1.0);
    float sq = step(max(abs(local.x), abs(local.y)), grow * 0.5);
    vec4 c = texture2D(uMap, vUv); gl_FragColor = vec4(c.rgb, c.a * sq); }
  ```
  Drive `uProgress` with a GSAP tween on hover or on enter (`contextSafe`). "Development": `mix(1.0 - c.rgb, c.rgb, smoothstep(0.,1.,uDev))` over 0.8 s (HAOQI).
- **Cost:** L.
- **Pitfalls:** transparency needs `transparent: true` and correct sort order. Keep the effect short (≤ 900 ms). Hover-only effects need an on-enter equivalent for touch.
- **Fallback:** CSS `clip-path` inset reveal (tier 0/2), or instant for reduced motion.

#### T27 — WebGL text distortion
- **Effect:** display type that liquefies, waves with scroll velocity, splits RGB, or refracts through glass, while the real text stays in the DOM for SEO and accessibility.
- **Narrative:** one hero line or one manifesto line. Never paragraphs.
- **Implementation, path 1 (recommended, exact DOM match with any CSS font including WOFF2):** rasterize the DOM text into a `CanvasTexture` and put it on a DOM-synced plane (T25):
  ```ts
  await document.fonts.ready
  const cs = getComputedStyle(el), r = el.getBoundingClientRect(), dpr = Math.min(devicePixelRatio, 2)
  const c = document.createElement('canvas'); c.width = r.width * dpr; c.height = r.height * dpr
  const ctx = c.getContext('2d')!; ctx.scale(dpr, dpr)
  ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`; ctx.fillStyle = cs.color; ctx.textBaseline = 'alphabetic'
  // draw each SplitText line at its offsetTop + ascent so wrapping matches the DOM exactly
  lines.forEach((ln) => ctx.fillText(ln.textContent!, ln.offsetLeft, ln.offsetTop + parseFloat(cs.fontSize) * 0.8))
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace
  ```
  Fragment: wave displacement `vUv.x += sin(vUv.y * 20. + uTime) * 0.003 * uVel`, plus RGB split proportional to `|uVel|`.
  **Path 2 (vector-sharp at any scale):** drei `<Text font="/fonts/display.woff">` (troika, SDF glyphs; **WOFF/TTF/OTF only, no WOFF2**). Sync `fontSize`/`letterSpacing`/`maxWidth` from computed styles, and with the pixel camera, `fontSize` in px maps 1:1 ([Codrops pattern](https://tympanus.net/codrops/2025/06/05/how-to-create-responsive-and-seo-friendly-webgl-text/)). Vertex effects go through `onBeforeCompile` on a MeshBasicMaterial passed as a child.
  Hide the DOM text with `color: transparent` (it stays selectable and readable by screen readers), only when `webgl-ready`.
- **Cost:** L–M.
- **Pitfalls:** re-rasterize on resize or font change (debounced). Canvas text differs subtly from DOM text (kerning, `font-feature-settings`), so test side by side. Troika loads fonts via fetch and workers, so add its fonts to the preloader with `preloadFont` from troika-three-text.
- **Fallback:** plain DOM text (with T09 reveal).

#### T28 — Refraction & chromatic dispersion
- **Effect:** a glass or liquid object that bends and splits the scene or typography behind it into spectral fringes.
- **Narrative:** lens, clarity, perspective shift, "seeing differently". Pair it with big typography behind the object so refraction has something to bend. Refracting a flat gradient is pointless.
- **Implementation A (custom, controllable; after [Maxime Heckel](https://blog.maximeheckel.com/posts/refraction-dispersion-and-other-shader-light-effects/)):**
  ```tsx
  const fbo = useFBO({ samples: 0 })                                   // fullscreen-sized
  useFrame(({ gl, scene, camera }) => {
    mesh.current.visible = false; gl.setRenderTarget(fbo); gl.render(scene, camera); gl.setRenderTarget(null)
    mesh.current.visible = true; mat.current.uniforms.uScene.value = fbo.texture }, -1)
  ```
  ```glsl
  // fragment (vNormal, vEye in view space; uv = screen uv)
  uniform sampler2D uScene; uniform vec2 uRes; uniform float uIorR, uIorG, uIorB, uRefract, uCA;
  #define LOOP 12
  void main(){ vec2 uv = gl_FragCoord.xy / uRes; vec3 n = normalize(vNormal), e = normalize(vEye); vec3 col = vec3(0.0);
    vec3 rR = refract(e, n, 1.0 / uIorR), rG = refract(e, n, 1.0 / uIorG), rB = refract(e, n, 1.0 / uIorB);
    for (int i = 0; i < LOOP; i++) { float s = float(i) / float(LOOP) * 0.1;
      col.r += texture2D(uScene, uv + rR.xy * (uRefract + s * 1.0) * uCA).r;
      col.g += texture2D(uScene, uv + rG.xy * (uRefract + s * 2.0) * uCA).g;
      col.b += texture2D(uScene, uv + rB.xy * (uRefract + s * 3.0) * uCA).b; }
    col /= float(LOOP);
    float fres = pow(1.0 + dot(e, n), 3.0); gl_FragColor = vec4(col + fres * 0.25, 1.0); }
  ```
  **B, drei `MeshTransmissionMaterial`** (fastest to art-direct): `<MeshTransmissionMaterial thickness={0.6} roughness={0.05} chromaticAberration={0.08} anisotropicBlur={0.1} distortion={0.2} distortionScale={0.4} temporalDistortion={0.05} samples={6} resolution={512} backside backsideThickness={0.3} ior={1.35} />`
- **Cost:** H (an extra scene render per frame). MTM with `backside` costs two extra renders.
- **Pitfalls:** anything the glass should refract must be *in the WebGL scene* (DOM text is not). Rasterize the background type to a texture (T27) or render it as troika Text. Use a lower FBO resolution (`resolution={512}`, or a half-size `useFBO`), which is barely visible. Transmission and bloom together can blow out, so clamp highlights. If two MTM objects overlap, they refract each other only if you orchestrate it.
- **Fallback:** tier 2 swaps in a matcap/fresnel "fake glass" shader (L). Reduced motion keeps a static object (demand render). No-WebGL shows the poster.

#### T29 — SDF raymarching in a fragment shader
- **Effect:** impossible, organic forms (metaballs, smooth-union sculptures, infinite repetition) with soft light, rendered by one quad.
- **Narrative:** the brand mark as a living sculpture, or "form emerging from equations". It is perfect for a hero object that morphs per chapter (uniform-driven smooth-min blends).
- **Implementation:**
  ```glsl
  uniform vec2 uRes, uPointer; uniform float uTime, uMorph;
  #ifndef MAX_STEPS
  #define MAX_STEPS 80
  #endif
  mat2 rot(float a){ float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
  float sdTorus(vec3 p, vec2 t){ vec2 q = vec2(length(p.xz) - t.x, p.y); return length(q) - t.y; }
  float sdBox(vec3 p, vec3 b){ vec3 q = abs(p) - b; return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0); }
  float smin(float a, float b, float k){ float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0); return mix(b, a, h) - k * h * (1.0 - h); }
  float map(vec3 p){ vec3 q = p; q.xz *= rot(uTime * 0.2); q.xy *= rot(uTime * 0.13);
    float a = sdTorus(q, vec2(0.9, 0.28)), b = sdBox(q, vec3(0.6)) - 0.08;
    float d = mix(a, b, uMorph);                                          // chapter morph via GSAP (T05)
    return smin(d, length(p - vec3(uPointer * 1.4, 0.4)) - 0.3, 0.45); }
  vec3 nrm(vec3 p){ const vec2 k = vec2(1, -1); const float h = 1e-3;
    return normalize(k.xyy * map(p + k.xyy * h) + k.yyx * map(p + k.yyx * h) + k.yxy * map(p + k.yxy * h) + k.xxx * map(p + k.xxx * h)); }
  void main(){ vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
    vec3 ro = vec3(0, 0, 3.2), rd = normalize(vec3(uv, -1.6)); float t = 0.0;
    for (int i = 0; i < MAX_STEPS; i++) { float d = map(ro + rd * t); if (d < 1e-3 || t > 8.0) break; t += d * 0.9; }
    vec3 col = vec3(0.0); float a = 0.0;
    if (t < 8.0) { vec3 p = ro + rd * t, n = nrm(p), l = normalize(vec3(0.6, 0.8, 0.4));
      float dif = max(dot(n, l), 0.0), fres = pow(1.0 - max(dot(n, -rd), 0.0), 3.0);
      col = mix(vec3(0.06), vec3(0.92, 0.88, 0.82), dif) + fres * vec3(0.55, 0.65, 1.0); a = 1.0; }
    gl_FragColor = vec4(col, a); }
  ```
  Render it into a **half-res** `useFBO(w/2, h/2)` and composite, or confine it to a `<View>` box.
- **Cost:** H–XH full-screen at DPR 2 (per-pixel loop). About M at half-res with 64 steps.
- **Pitfalls:** set `MAX_STEPS` via `defines` per tier. The `0.9` step factor prevents overshoot on non-exact SDFs. `uRes` must be in device pixels. Mobile GPUs choke, so tier 2 swaps to a baked mesh or procedural 2D.
- **Fallback:** a static frame (render once) or the poster.

#### T30 — GPGPU particles with curl noise (+ morph into the brand word)
- **Effect:** 65k–260k particles drifting on divergence-free curl-noise currents, gathering into letterforms or the logo, scattering with pointer and scroll.
- **Narrative:** "many → one", "noise → signal", community, data. The morph into the brand name is an earned climax *if* the copy sets it up.
- **Implementation:** three's `GPUComputationRenderer` (it auto-injects `#define resolution vec2(w,h)` into sim shaders, verified in source):
  ```tsx
  import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js'
  function useParticleSim(size: number, targets: THREE.DataTexture) {
    const gl = useThree((s) => s.gl)
    const sim = useMemo(() => {
      const g = new GPUComputationRenderer(size, size, gl)
      const seed = g.createTexture(), a = seed.image.data as Float32Array
      for (let i = 0; i < a.length; i += 4) { const u = Math.random() * 2 - 1, th = Math.random() * 6.2832, r = Math.sqrt(1 - u * u)
        a[i] = r * Math.cos(th) * 1.5; a[i + 1] = u * 1.5; a[i + 2] = r * Math.sin(th) * 1.5; a[i + 3] = Math.random() }
      const v = g.addVariable('uPositions', SIM_FRAG, seed); g.setVariableDependencies(v, [v])
      Object.assign(v.material.uniforms, { uTime: { value: 0 }, uDelta: { value: 0 }, uMorph: { value: 0 },
        uOrigin: { value: seed.clone() }, uTarget: { value: targets }, uPointer: { value: new THREE.Vector3(99, 99, 0) } })
      const err = g.init(); if (err) throw new Error(err)
      return { g, v }
    }, [gl, size, targets])
    useEffect(() => () => sim.g.dispose(), [sim])
    return sim
  }
  // useFrame(..., -2): u.uTime.value = t; u.uDelta.value = Math.min(dt, 1/30); g.compute();
  //   renderMat.uniforms.uPositions.value = g.getCurrentRenderTarget(v).texture
  ```
  ```glsl
  // SIM_FRAG (curl noise per Bridson; snoise from stegu/webgl-noise, MIT)
  uniform float uTime, uDelta, uMorph; uniform sampler2D uOrigin, uTarget; uniform vec3 uPointer;
  vec3 snoise3(vec3 x){ return vec3(snoise(x), snoise(vec3(x.y - 19.1, x.z + 33.4, x.x + 47.2)), snoise(vec3(x.z + 74.2, x.x - 124.5, x.y + 99.4))); }
  vec3 curl(vec3 p){ const float e = 0.1; vec3 dx = vec3(e, 0, 0), dy = vec3(0, e, 0), dz = vec3(0, 0, e);
    vec3 x0 = snoise3(p - dx), x1 = snoise3(p + dx), y0 = snoise3(p - dy), y1 = snoise3(p + dy), z0 = snoise3(p - dz), z1 = snoise3(p + dz);
    return normalize(vec3((y1.z - y0.z) - (z1.y - z0.y), (z1.x - z0.x) - (x1.z - x0.z), (x1.y - x0.y) - (y1.x - y0.x)) / (2.0 * e)); }
  void main(){ vec2 uv = gl_FragCoord.xy / resolution.xy; vec4 p = texture2D(uPositions, uv);
    vec3 home = mix(texture2D(uOrigin, uv).xyz, texture2D(uTarget, uv).xyz, uMorph);
    vec3 pos = p.xyz + curl(p.xyz * 0.55 + uTime * 0.04) * 0.35 * uDelta * (1.0 - 0.8 * uMorph);
    vec3 away = pos - uPointer; pos += normalize(away) * 0.6 * uDelta * smoothstep(0.6, 0.0, length(away));
    pos += (home - pos) * (1.0 - exp(-uDelta * mix(0.6, 3.0, uMorph)));
    gl_FragColor = vec4(pos, p.w); }
  ```
  Render: `<points>` with `aRef` (vec2 uv into the sim texture) and a dummy `position` attribute. The vertex shader reads `texture2D(uPositions, aRef).xyz` and sets `gl_PointSize = uSize * uDpr / -mv.z`. Use `AdditiveBlending` and `depthWrite={false}`. **Targets:** draw the brand word into a 2D canvas, collect lit pixels, and assign them randomly to particles. Map pixels to world space into a `DataTexture(Float32Array, size, size, RGBAFormat, FloatType)` with `needsUpdate = true`. This is an honest asset, since it is generated from our own type.
- **Cost:** M (sim 256² = 65k) to H (512² = 262k, plus overdraw from additive blending of big points).
- **Pitfalls:** float textures need `EXT_color_buffer_float` for render targets. GPUComputationRenderer uses FloatType by default; set `g.setDataType(THREE.HalfFloatType)` on iOS if needed (precision loss at large coordinates, so keep the world within ±10). Overdraw is the real cost: keep points small and particle count per tier. Warm the sim once during the loader (T16).
- **Fallback:** tier 2 uses 128² (16k) with the same look at fewer points. Reduced motion shows the morph end state, rendered once. No-WebGL shows the brand word as DOM type.

#### T31 — Ordered-Bayer dithering post effect
- **Effect:** 1-bit or limited-palette dithering over the whole scene or a region. The retro-print or e-ink aesthetic is a strong 2025–26 trend ([Codrops Bayer guide 2025-07](https://tympanus.net/codrops/2025/07/30/interactive-webgl-backgrounds-a-quick-guide-to-bayer-dithering/), [Codrops dithering shader 2025-06](https://tympanus.net/codrops/2025/06/04/building-a-real-time-dithering-shader/), [Efecto 2026-01](https://tympanus.net/codrops/2026/01/04/efecto-building-real-time-ascii-and-dithering-effects-with-webgl-shaders/)).
- **Narrative:** justified when the concept is about *print, signal, archive, reduction, or information*. It turns any 3D into a graphic language and hides the "default three.js look". Toggle or scroll-blend it as a chapter device ("from raw signal to full color").
- **Implementation (custom postprocessing Effect; Bayer recurrence from the Codrops guide):**
  ```ts
  import { Effect, EffectAttribute, BlendFunction } from 'postprocessing'
  const frag = /* glsl */`
  uniform float uPixel, uMix, uLevels; uniform vec3 uInk, uPaper;
  float bayer2(vec2 a){ a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }
  #define bayer4(a) (bayer2(0.5 * (a)) * 0.25 + bayer2(a))
  #define bayer8(a) (bayer4(0.5 * (a)) * 0.25 + bayer2(a))
  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor){
    vec2 cell = floor(uv * resolution / uPixel);
    vec3 src = texture2D(inputBuffer, (cell + 0.5) * uPixel / resolution).rgb;      // cell-centred resample
    float l = dot(src, vec3(0.2126, 0.7152, 0.0722));
    float q = floor(l * uLevels + bayer8(cell)) / uLevels;                           // ordered-dither quantize
    outputColor = vec4(mix(inputColor.rgb, mix(uInk, uPaper, q), uMix), inputColor.a); }`
  export class DitherEffect extends Effect {
    constructor({ pixel = 2, levels = 1, ink = '#0c0c0e', paper = '#eee8dc', mix = 1 } = {}) {
      super('DitherEffect', frag, { attributes: EffectAttribute.CONVOLUTION, blendFunction: BlendFunction.NORMAL,
        uniforms: new Map<string, THREE.Uniform>([['uPixel', new THREE.Uniform(pixel)], ['uLevels', new THREE.Uniform(levels)],
          ['uInk', new THREE.Uniform(new THREE.Color(ink))], ['uPaper', new THREE.Uniform(new THREE.Color(paper))], ['uMix', new THREE.Uniform(mix)]]) })
    }
  }
  // React: const effect = useMemo(() => new DitherEffect(), []); useEffect(() => () => effect.dispose(), [effect])
  // <EffectComposer multisampling={0}> ... <primitive object={effect} dispose={null} /> </EffectComposer>
  // animate: gsap.to(effect.uniforms.get('uMix')!, { value: 0, scrollTrigger: {...} })
  ```
- **Cost:** L (one texture read per pixel).
- **Pitfalls:** mark it `CONVOLUTION`, because it resamples `inputBuffer` at other UVs and must not merge with effects expecting the same UV. `mergeMode:'auto'` then splits the pass (source-verified). Put it **last**, after bloom/CA. Disable MSAA (`multisampling={0}`), which is wasted under dithering. The pixel grid must be in **device pixels** (`resolution` is buffer size), so at DPR 2 use `uPixel = 2` for a crisp 1-CSS-px dither. Do not dither UI text, because WebGL is behind the DOM.
- **Fallback:** without WebGL, a CSS approximation: a small Bayer PNG tile overlay with `mix-blend-mode: multiply` on hero imagery only (static). Reduced motion is unaffected (not motion).

#### T32 — Halftone post effect (rotated dot screen)
- **Effect:** newspaper or risograph dots whose size encodes luminance. Per-channel angles give a CMY-ish print feel.
- **Narrative:** same family as T31 (print, publishing, archive). Choose **one** of T31 or T32 as the page's graphic dialect.
- **Implementation:**
  ```glsl
  uniform float uCell, uAngle; uniform vec3 uInk, uPaper;
  mat2 rot(float a){ float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
  float dotScreen(vec2 px, float ang, float cell, out vec2 centerUv){
    vec2 p = rot(ang) * px; vec2 id = floor(p / cell); vec2 local = fract(p / cell) - 0.5;
    centerUv = (rot(-ang) * ((id + 0.5) * cell)) / resolution;           // sample value at the cell centre
    float l = dot(texture2D(inputBuffer, centerUv).rgb, vec3(0.2126, 0.7152, 0.0722));
    float r = sqrt(1.0 - l) * 0.62;                                        // area ∝ darkness
    float aa = fwidth(length(local)); return 1.0 - smoothstep(r - aa, r + aa, length(local)); }
  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor){
    vec2 c; float ink = dotScreen(uv * resolution, uAngle, uCell, c);
    outputColor = vec4(mix(uPaper, uInk, ink), 1.0); }
  ```
  For CMY: run `dotScreen` three times at 15°/75°/0° on the separated channels and combine subtractively.
- **Cost:** L–M (1–3 reads).
- **Pitfalls:** `fwidth` needs derivatives (fine in WebGL2). Moiré appears at small cells, so use a cell of at least 6 device px. It is also `CONVOLUTION`.
- **Fallback:** as T31.

#### T33 — The post stack (Bloom, ChromaticAberration, Noise, Vignette) tuned, with velocity-driven CA
- **Effect:** cinematic finish, glow on true highlights, lens fringe on motion, grain and focus.
- **Narrative:** finish, not effect. If you can *notice* the bloom, it is too much.
- **Implementation:**
  ```tsx
  const ca = useRef<ChromaticAberrationEffect>(null)
  useFrame(() => { const v = Math.min(Math.abs(stageUniforms.uVelocity.value) * 0.00004, 0.004); ca.current?.offset.set(v, v * 0.6) })
  <EffectComposer multisampling={0} frameBufferType={THREE.HalfFloatType} resolutionScale={1}>
    <Bloom mipmapBlur luminanceThreshold={0.85} luminanceSmoothing={0.1} intensity={0.6} radius={0.7} />
    <ChromaticAberration ref={ca} radialModulation modulationOffset={0.3} offset={[0, 0]} />
    <Vignette offset={0.3} darkness={0.55} />
    <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.35} />
    <primitive object={dither} dispose={null} />   {/* optional T31 */}
  </EffectComposer>
  ```
- **Cost:** Bloom (mipmap) M. CA, Vignette and Noise together L (merged into one pass).
- **Pitfalls:** the composer default is `multisampling={8}`, which is expensive; set 0 and rely on the art style or SMAA if needed. The composer `renderPriority=1` takes over rendering, which is correct with `advance`. **The composer applies to the whole canvas**, so it clashes with drei `<View>` scissoring (T34); pick one. Keep a single composer.
- **Fallback:** tier 2 keeps only Noise and Vignette. Reduced motion keeps CA offset constant at 0.

#### T34 — Multiple scenes on one canvas (drei `View`)
- **Effect:** several independent 3D "windows" embedded in the DOM layout (cards, figure boxes), all drawn by **one** WebGL context.
- **Narrative:** a series of objects or specimens, each in its own framed box, e.g. product variants or chapter emblems.
- **Implementation:**
  ```tsx
  <main ref={container}>
    <figure className={s.box}><View className={s.view}><Emblem kind="a" /><PerspectiveCamera makeDefault position={[0, 0, 4]} /></View></figure>
    ...
    <Canvas eventSource={container} eventPrefix="client" className={s.fixedCanvas}><View.Port /></Canvas>
  </main>
  ```
  Set `frames={1}` for static-layout views to skip per-frame rect reads. Each View has its own scene, so add lights per View.
- **Cost:** per View it is scene cost + scissor. There is CPU `getBoundingClientRect` per View per frame unless `frames={1}`.
- **Pitfalls:** it does not combine with a global EffectComposer (see T33). Per-View effects mean `RenderTexture`, which is heavier. Views outside the viewport still cost CPU for rect reads, so conditionally mount with IntersectionObserver. Views and our single-clock `advance` work together because View renders inside the root render.
- **Fallback:** a static image or CSS render of each emblem inside the same box.

### D. Robustness & shipping

#### T35 — WebGL context-loss handling
- **Effect:** none visible. The page survives GPU resets, too many tabs, and iOS memory pressure.
- **Facts (three 0.186 source):** `WebGLRenderer` listens for `webglcontextlost`, calls `event.preventDefault()` (allowing restore) and sets `_isContextLost`. On `webglcontextrestored` it re-initializes GL state. **Render-target contents are gone**, so fluid, GPGPU and FBO caches must be re-seeded. `renderer.forceContextLoss()` / `forceContextRestore()` exist for testing.
- **Implementation:**
  ```tsx
  function ContextGuard({ onLost, onRestored }: { onLost: () => void; onRestored: () => void }) {
    const gl = useThree((s) => s.gl)
    useEffect(() => { const c = gl.domElement
      const lost = () => { quality.webglVisible = false; onLost() }                // show poster over canvas
      const restored = () => { quality.webglVisible = true; onRestored() }         // bump a key → remount scene
      c.addEventListener('webglcontextlost', lost); c.addEventListener('webglcontextrestored', restored)
      return () => { c.removeEventListener('webglcontextlost', lost); c.removeEventListener('webglcontextrestored', restored) } }, [gl])
    return null
  }
  // Stage: const [epoch, setEpoch] = useState(0); <Scene key={epoch} />; onRestored={() => setEpoch((e) => e + 1)}
  // QA: window.__gl = gl; __gl.forceContextLoss(); setTimeout(() => __gl.forceContextRestore(), 1000)
  ```
  Bonus: after the first good frame, capture `gl.domElement.toBlob()` in an `addAfterEffect` once and use it as the "lost context" poster, which is honestly our own render.
- **Cost:** L.
- **Pitfalls:** remounting the scene re-runs `compileAsync`, so expect a hitch and fade the poster out after the first frame. If restoration never fires, keep the poster (tier 0). The capture must run right after render in the same task (the drawing buffer is not preserved).
- **Fallback:** the poster.

#### T36 — Disposal & memory hygiene
- **Rules:**
  - R3F auto-disposes **JSX-declared** objects with `dispose()` on unmount. It does **not** dispose `<primitive object>`, objects created in `useMemo`, or class instances like `Fluid` / `GPUComputationRenderer` / custom `Effect`s. Pair each with `useEffect(() => () => x.dispose(), [x])`. Use `dispose={null}` on primitives you manage yourself.
  - `useFBO` disposes itself. Raw `WebGLRenderTarget`s do not.
  - Textures: `texture.dispose()` when the owning component unmounts, unless it is loader-cached (`useTexture`), which is fine to keep for a single page.
  - GSAP: `useGSAP` reverts tweens, ScrollTriggers, SplitTexts and matchMedia created inside. Handlers created later must go through `contextSafe`. Global ticker listeners (`afterScroll`, `renderers`) must be removed in cleanup.
  - Lenis: `ReactLenis` destroys its instance on unmount (source-verified).
  - Audio: `ctx.close()` on unmount. Observers: `disconnect()`.
  - Dev StrictMode double-mounts effects, so every setup must be idempotent. This is how disposal bugs are caught early.
- **QA:** `gl.info.memory` (`geometries`, `textures`) and `gl.info.programs.length` should stay flat after navigating tiers or remounting 10×. The Chrome Performance Monitor "GPU memory" should stay flat too.

#### T37 — Next.js metadata + OG image under static export
- **Implementation:**
  ```tsx
  // app/layout.tsx
  export const metadata: Metadata = { metadataBase: new URL('https://<domain>'), title: { default: 'Brand', template: '%s · Brand' },
    description: '…', openGraph: { type: 'website', siteName: 'Brand' }, twitter: { card: 'summary_large_image' } }
  export const viewport: Viewport = { themeColor: [{ media: '(prefers-color-scheme: dark)', color: '#0c0c0e' }, { color: '#eee8dc' }] }
  ```
  ```tsx
  // app/opengraph-image.tsx: built statically at `next build` (no request-time APIs)
  import { ImageResponse } from 'next/og'; import { readFile } from 'node:fs/promises'; import { join } from 'node:path'
  export const alt = 'Brand: tagline'; export const size = { width: 1200, height: 630 }; export const contentType = 'image/png'
  const display = await readFile(join(process.cwd(), 'assets/Display.ttf'))       // TTF/OTF/WOFF for satori, not WOFF2
  export default async function Image() {
    return new ImageResponse(<div style={{ display: 'flex', width: '100%', height: '100%', background: '#0c0c0e', color: '#eee8dc',
      fontFamily: 'Display', fontSize: 140, alignItems: 'flex-end', padding: 64 }}>Brand</div>,
      { ...size, fonts: [{ name: 'Display', data: display, style: 'normal', weight: 400 }] })
  }
  ```
  `next.config.ts`: `{ output: 'export', images: { unoptimized: true }, trailingSlash: true }`.
- **Pitfalls:** satori needs flexbox (`display:flex` on every multi-child div) and does not support grid. Verify `out/opengraph-image.png` exists after build. If export ever balks, drop a static `app/opengraph-image.png` instead. Without `metadataBase`, OG URLs are relative and social crawlers fail.

#### T38 — Reduced-motion master policy (one switch, everywhere)
- **Implementation:**
  ```ts
  const mq = matchMedia('(prefers-reduced-motion: reduce)')
  const apply = () => { quality.reducedMotion = mq.matches; document.documentElement.dataset.motion = mq.matches ? 'reduce' : 'full' }
  apply(); mq.addEventListener('change', apply)
  ```
  GSAP uses `gsap.matchMedia()` blocks (auto-revert when the preference flips). Lenis relies on `respectReducedMotion`. WebGL uses `frameloop`-equivalent logic: when reduced, `renderers` calls `advance` only on `invalidate`-style requests (theme change, resize). CSS uses the `@media (prefers-reduced-motion: reduce)` blocks shown per technique.
- **What remains under reduced motion:** color, type, layout, opacity fades ≤ 200 ms, hover color states, sound (opt-in), static WebGL frames. **What goes:** smoothing, parallax, pins with big transforms, marquee motion, cursor followers, velocity effects, looping shader time.
- Also offer an **in-page "Motion: full / calm" toggle** (writes `data-motion` and persists). Jurors and users appreciate it, and it covers people who have not set the OS preference.

---

## Part 4 — Budgets, combinations, QA

### 4.1 Frame budget (target 16.6 ms @60 Hz; ProMotion laptops will try 120 Hz = 8.3 ms, so cap heavy scenes at 60 via `quality` if needed)

| Layer | Budget (tier 3) |
|---|---|
| JS main thread (GSAP + Lenis + React idle) | ≤ 3 ms |
| Sims (fluid 128 / GPGPU 256²) | ≤ 2.5 ms GPU |
| Main scene + DOM planes | ≤ 3 ms GPU |
| Heavy hero (refraction *or* raymarch, never both on screen) | ≤ 4 ms GPU (half-res) |
| Post (bloom mip + merged pass + dither) | ≤ 2 ms GPU |

**Rule of two:** at most **two heavy GPU systems visible at once** (e.g. fluid + DOM planes, or particles + post). Chapters hand off: when one heavy system scrolls out, `visible=false` stops its sim.

### 4.2 Recommended combination for a coherent "one idea" page (to be matched to the concept doc)
1. **Signature system (pick ONE):** fluid ink field (T22+T23) · particles morphing into the brand word (T30) · refractive lens over giant type (T28+T27) · raymarched emblem (T29).
2. **Graphic dialect (pick ONE):** Bayer dither (T31) or halftone (T32), used as a chapter device (mix 0→1), not a permanent filter.
3. **Typography engine:** SplitText masked reveals (T09) + variable-axis moment (T11) + ScrambleText meta (T10).
4. **Scroll architecture:** One Clock (T01) + 1–2 pins (T07) + optionally one horizontal sequence (T08) + velocity material (T06) + marquee (T15).
5. **Finish:** post stack (T33), grain (T19), preloader with real signal (T16), theme View Transition (T17), opt-in sound (T20).
6. **Safety net:** T02, T03, T18, T35, T36, T38.

### 4.3 QA checklist (run before morning)
- [ ] Chrome and Safari on Apple Silicon: 60 fps steady in Performance panel during the fastest scroll. No long tasks over 50 ms after load.
- [ ] Throttle 4× CPU: page is still usable, PerformanceMonitor degrades dpr/tier.
- [ ] iPhone/Android emulation + real device if available: tier 2 active, no context loss after 2 min, no horizontal overflow.
- [ ] `prefers-reduced-motion` on: no smoothing, no pins, no looping shader time, content complete.
- [ ] WebGL disabled (`--disable-webgl` / Safari Develop menu): posters shown, zero console errors.
- [ ] JS disabled: all copy readable, no invisible `.reveal` text.
- [ ] `forceContextLoss()` → poster → restore → scene back.
- [ ] Keyboard-only: tab through horizontal section (T08 focus handler), visible focus rings, sound toggle is `role=switch`.
- [ ] Screen reader spot check: headings read once (SplitText aria), duplicates `aria-hidden`.
- [ ] `gl.info.memory` flat after 10 remounts (StrictMode dev).
- [ ] Lighthouse: LCP element is the SSR `<h1>`. CLS ≈ 0 (fonts via next/font with fallback adjust).
- [ ] `out/` static export opens from a static server. OG image is present.

---

## Part 5 — Sources

**Official docs and repos (API verification)**
- Lenis README: https://github.com/darkroomengineering/lenis/blob/main/README.md
- Lenis React README: https://github.com/darkroomengineering/lenis/blob/main/packages/react/README.md
- GSAP useGSAP / React guide: https://gsap.com/resources/React/
- GSAP SplitText: https://gsap.com/docs/v3/Plugins/SplitText/
- GSAP ScrollTrigger: https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- GSAP 3.15.0 changelog excerpt (easeReverse): https://github.com/Gix13/sentinelscan/pull/4
- R3F Canvas: https://r3f.docs.pmnd.rs/api/canvas
- R3F v9 migration: https://r3f.docs.pmnd.rs/tutorials/v9-migration-guide
- drei View: https://drei.docs.pmnd.rs/portals/view
- drei MeshTransmissionMaterial: https://drei.docs.pmnd.rs/shaders/mesh-transmission-material
- drei shaderMaterial: https://drei.docs.pmnd.rs/shaders/shader-material
- drei useFBO: https://drei.docs.pmnd.rs/misc/fbo-use-fbo
- drei PerformanceMonitor: https://drei.docs.pmnd.rs/performances/performance-monitor
- react-postprocessing EffectComposer: https://react-postprocessing.docs.pmnd.rs/effect-composer
- Next.js 16: https://nextjs.org/blog/next-16 · blog index (16.1–16.3): https://nextjs.org/blog
- Next lazy loading / ssr:false: https://nextjs.org/docs/app/guides/lazy-loading
- Next fonts: https://nextjs.org/docs/app/api-reference/components/font
- Next OG image: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image
- Next static export: https://nextjs.org/docs/app/guides/static-exports
- Next view transitions guide: https://nextjs.org/docs/app/guides/view-transitions
- MDN View Transition API: https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API
- web.dev same-document VT Baseline: https://web.dev/blog/same-document-view-transitions-are-now-baseline-newly-available
- MDN scroll-driven animations: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations
- Scroll-driven support status 2026: https://cssawwwards.com/blog/css-scroll-driven-animations-guide-2026
- MDN Web Audio best practices: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices
- Chrome autoplay policy: https://developer.chrome.com/blog/autoplay
- Shadertoy terms (default CC BY-NC-SA): https://www.shadertoy.com/terms
- Installed package sources inspected: `lenis@1.3.26` (`dist/lenis-react.mjs`, `dist/lenis.d.ts`), `gsap@3.15.0` (`types/split-text.d.ts`, `SplitText.js`, `types/gsap-core.d.ts`), `@react-three/fiber@9.8.1` (`core/loop.d.ts`, `events-*.esm.js` update/advance), `@react-three/drei@10.7.9` (`core/Fbo.d.ts`, `web/View.d.ts`, `core/Progress.d.ts`, `core/AdaptiveDpr.d.ts`), `@react-three/postprocessing@3.1.3` (`EffectComposer.d.ts`, `createEffectComponent.d.ts`, `index.js buildPasses`), `postprocessing@6.39.5` (`build/types/index.d.ts` Effect), `three@0.186.1` (`three.module.js` context loss, compileAsync; `examples/jsm/misc/GPUComputationRenderer.js`), `troika-three-text@0.52.5`.

**Technique references (2024–2026)**
- Maxime Heckel, Refraction & dispersion: https://blog.maximeheckel.com/posts/refraction-dispersion-and-other-shader-light-effects/
- Maxime Heckel, Caustics in WebGL: https://blog.maximeheckel.com/posts/caustics-in-webgl/
- Maxime Heckel, FBO particles in R3F: https://blog.maximeheckel.com/posts/the-magical-world-of-particles-with-react-three-fiber-and-shaders/
- Maxime Heckel, Post-processing as a creative medium: https://blog.maximeheckel.com/posts/post-processing-as-a-creative-medium/
- Pavel Dobryakov, WebGL Fluid Simulation (MIT): https://github.com/PavelDoGreat/WebGL-Fluid-Simulation
- stegu/webgl-noise (MIT): https://github.com/stegu/webgl-noise
- Codrops, Bayer dithering backgrounds (2025-07): https://tympanus.net/codrops/2025/07/30/interactive-webgl-backgrounds-a-quick-guide-to-bayer-dithering/
- Codrops, Real-time dithering shader (2025-06): https://tympanus.net/codrops/2025/06/04/building-a-real-time-dithering-shader/
- Codrops, Efecto ASCII + dithering (2026-01): https://tympanus.net/codrops/2026/01/04/efecto-building-real-time-ascii-and-dithering-effects-with-webgl-shaders/
- Codrops, Responsive and SEO-friendly WebGL text (2025-06): https://tympanus.net/codrops/2025/06/05/how-to-create-responsive-and-seo-friendly-webgl-text/
- Codrops, Inside HAOQI.DESIGN, DOM and WebGL on one stage (2026-08): https://tympanus.net/codrops/2026/08/15/inside-haoqi-design-letting-dom-and-webgl-share-a-retro-futurist-stage/
- Codrops, Dreamy GPGPU particles: https://tympanus.net/codrops/2024/12/19/crafting-a-dreamy-particle-effect-with-three-js-and-gpgpu/
- JOYCO, WebGL scroll sync: https://hub.joyco.studio/logs/08-webgl-scroll-sync
- 14islands r3f-scroll-rig (DOM↔3D sync reference): https://github.com/14islands/r3f-scroll-rig
- Juror notes on 2025–26 award winners: https://www.hontran.dev/blog/best-award-winning-websites-2026
- Awwwards Sites of the Year: https://www.awwwards.com/websites/sites_of_the_year/

---

### Appendix — Snippet type-check log
Representative snippets were compiled with `tsc` (strict, `moduleResolution: Bundler`) against the exact installed versions, and all compiled with zero errors: SmoothScroll/Bridge (Lenis React + GSAP ticker + `advance`), typed `shaderMaterial` + `ThreeElements` augmentation, `useFBO({ samples: 0 })`, `useProgress` selector, `DitherEffect extends Effect` with a `Map<string, Uniform>`, the EffectComposer stack with `ChromaticAberrationEffect` ref, `GPUComputationRenderer` usage, `compileAsync` / `forceContextLoss`, `SplitText.create` with `mask`/`autoSplit`/`aria`/`onSplit` return, `Flip.getState/from`, `gsap.quickTo/quickSetter/utils.wrap`, `ScrambleTextPlugin`, `CustomEase`, drei `View frames`, `PerformanceMonitor bounds/flipflops`, and `<Canvas eventSource eventPrefix frameloop="never" orthographic>`. The only non-compiling line was the side-effect CSS import, which Next.js handles.
