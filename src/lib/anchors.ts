// Light anchors (brief 4.3, 7.3). Each chapter renders one <LightAnchor> (a
// div[data-light-anchor], aria-hidden, positioned by the section's CSS); its box is the
// light patch's bounding box at rest. The conductor measures every anchor in its one
// DOM read phase and caches two rects per chapter here:
//   restRect(id): viewport rect at the chapter's rest (sticky chapters: relative to the
//                 sticky frame, which equals the viewport while stuck)
//   liveRect(id): the rect this frame (read or derived during conductor.update)
// afterScroll listeners and passes read these caches and never touch layout themselves.
import type { ChapterId } from '@/content/chapters'

export interface AnchorSpec {
  chapter: ChapterId
  kind?: 'patch' | 'bench' | 'pane' | 'ember'
}

/** Internal record; the conductor fills the measured fields. */
export interface AnchorEntry {
  el: HTMLElement
  spec: AnchorSpec
  /** Document-space box at the last measure (CSS px). */
  doc: { x: number; y: number; w: number; h: number }
  /** Sticky frame that contains the anchor, and the anchor's offset inside it. */
  frameEl: HTMLElement | null
  off: { x: number; y: number }
  /** Inside a position: fixed subtree (never scrolls). */
  fixed: boolean
  rest: DOMRectReadOnly | null
  live: DOMRectReadOnly | null
}

const entries = new Map<HTMLElement, AnchorEntry>()
let onChange: (() => void) | null = null

function makeEntry(el: HTMLElement, spec: AnchorSpec): AnchorEntry {
  return {
    el,
    spec,
    doc: { x: 0, y: 0, w: 0, h: 0 },
    frameEl: null,
    off: { x: 0, y: 0 },
    fixed: false,
    rest: null,
    live: null,
  }
}

/** Registers an anchor element; returns its cleanup. Invalidates the conductor's measure. */
export function registerAnchor(el: HTMLElement, spec: AnchorSpec): () => void {
  const prev = entries.get(el)
  if (prev) prev.spec = spec
  else entries.set(el, makeEntry(el, spec))
  onChange?.()
  return () => {
    if (entries.get(el)?.spec === spec) entries.delete(el)
    onChange?.()
  }
}

/** The chapter's patch rect at rest, viewport CSS px (null before the first measure). */
export function restRect(id: ChapterId): DOMRectReadOnly | null {
  return anchorOf(id)?.rest ?? null
}

/** The chapter's anchor rect this frame, viewport CSS px (null when unknown). */
export function liveRect(id: ChapterId): DOMRectReadOnly | null {
  return anchorOf(id)?.live ?? null
}

// ── conductor-facing helpers (not part of the public contract) ──

/** Called by the conductor: fn runs whenever an anchor mounts, unmounts or changes spec. */
export function setAnchorListener(fn: (() => void) | null): void {
  onChange = fn
}

/**
 * Adopts [data-light-anchor] elements that were not registered through <LightAnchor>
 * (for example a section that puts the attribute on its own element) and drops entries
 * whose element left the document. Runs only inside conductor.measure().
 */
export function syncAnchorsFromDom(root: ParentNode = document): void {
  for (const el of Array.from(entries.keys())) {
    if (!el.isConnected) entries.delete(el)
  }
  const found = root.querySelectorAll<HTMLElement>('[data-light-anchor]')
  found.forEach((el) => {
    if (entries.has(el)) return
    const id = el.dataset.lightAnchor as ChapterId | undefined
    if (!id) return
    const kind = (el.dataset.anchorKind as AnchorSpec['kind']) || undefined
    entries.set(el, makeEntry(el, { chapter: id, kind }))
  })
}

/** Every known anchor entry. */
export function allAnchors(): IterableIterator<AnchorEntry> {
  return entries.values()
}

/** The primary anchor of a chapter (the first connected one). */
export function anchorOf(id: ChapterId): AnchorEntry | null {
  for (const e of entries.values()) {
    if (e.spec.chapter === id && e.el.isConnected) return e
  }
  return null
}
