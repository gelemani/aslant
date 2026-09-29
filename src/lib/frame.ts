// The frame bus (brief 4.1, 7.3). One clock: the SmoothScroll ticker is the only
// gsap.ticker listener and the only rAF loop. It converts GSAP's delta to seconds
// once, then runs, in this fixed order:
//   Lenis → readScroll → conductor.update(dt) → afterScroll(t, dt) → renderers(t, dt)
// Values here are mutated in place every frame. Never mirror them into React state.

/** t: ticker time in seconds; dt: seconds, clamped to 1/30. */
export type FrameFn = (t: number, dt: number) => void

export const frame = {
  scroll: {
    /** Current scroll offset in px (Lenis' animated value, or native scrollY). */
    y: 0,
    /** Max scrollable offset in px (≥ 1). */
    max: 1,
    /** 0..1 over the whole document. */
    progress: 0,
    /** px/s, signed. */
    velocity: 0,
    direction: 0 as -1 | 0 | 1,
  },
  pointer: {
    /** CSS px, client coordinates. */
    x: 0,
    y: 0,
    /** Normalised device coordinates, -1..1, y up. */
    nx: 0,
    ny: 0,
    /** CSS px/s, damped (λ 12). */
    vx: 0,
    vy: 0,
    /** False after the pointer leaves the window or the window blurs. */
    inside: false,
    /** Coarse (touch) primary pointer. */
    coarse: false,
    /** Ticker time (s) of the last pointer move. */
    lastMove: 0,
  },
  /** Layout viewport (innerWidth, innerHeight). The canvas size lives in light.viewport. */
  viewport: { w: 1, h: 1, dpr: 1 },
  /** DOM writes only (4.3): readouts, clock, nav mark, favicon, theme colour. */
  afterScroll: new Set<FrameFn>(),
  /** Stage advance (WP4). */
  renderers: new Set<FrameFn>(),
}

export type Frame = typeof frame

/** Maximum dt handed to any listener, seconds. */
export const MAX_DT = 1 / 30

const failed = new WeakSet<FrameFn>()

function nameOf(fn: FrameFn): string {
  return fn.name || '(anonymous listener)'
}

/**
 * Calls every listener in insertion order. Each call is isolated: a throwing listener
 * is logged once (with its name) and never stops the others, so one section's bug
 * cannot skip the render or freeze the canvas for the whole page.
 */
export function runListeners(set: ReadonlySet<FrameFn>, t: number, dt: number): void {
  for (const fn of set) {
    try {
      fn(t, dt)
    } catch (err) {
      if (!failed.has(fn)) {
        failed.add(fn)
        console.error(`[frame] listener ${nameOf(fn)} threw; it keeps running, logged once.`, err)
      }
    }
  }
}

/** Adds an afterScroll listener; returns its remover. */
export function onAfterScroll(fn: FrameFn): () => void {
  frame.afterScroll.add(fn)
  return () => {
    frame.afterScroll.delete(fn)
  }
}

/** Adds a renderer; returns its remover. */
export function onRender(fn: FrameFn): () => void {
  frame.renderers.add(fn)
  return () => {
    frame.renderers.delete(fn)
  }
}
