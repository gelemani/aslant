// The hero H1's optical focus-in (brief 4.8.1). Client only: imported by the hero intro.
// Each word arrives from a slight defocus with a warm and a cool copy of itself 4 px to
// either side (8 px of split at most), converging like the caustic edges of the word.
import { gsap, SplitText } from '@/lib/gsap'

const FROM = {
  opacity: 0,
  filter: 'blur(6px)',
  scale: 1.02,
  textShadow: '-4px 0 0 rgba(255,176,120,0.55), 4px 0 0 rgba(150,196,255,0.5)',
}

const TO = {
  opacity: 1,
  filter: 'blur(0px)',
  scale: 1,
  textShadow: '0px 0 0 rgba(255,176,120,0), 0px 0 0 rgba(150,196,255,0)',
}

export interface FocusIn {
  /** Adds the focus-in to `tl` at `at` seconds (900 ms per word, 60 ms stagger, `focus`). */
  addTo(tl: gsap.core.Timeline, at: number): void
  /** Restores the plain heading (idempotent). */
  revert(): void
}

/**
 * Splits the heading into words and puts every word in its defocused state, synchronously,
 * so the caller can lift the CSS pre-intro gate in the same frame without a flash.
 * Call only after document.fonts.ready (the split measures the laid-out words).
 */
export function prepareFocusIn(el: HTMLElement): FocusIn {
  const split = SplitText.create(el, { type: 'words', aria: 'auto' })
  const words = split.words as HTMLElement[]
  gsap.set(words, { ...FROM, willChange: 'filter, opacity, transform' })
  let reverted = false
  const revert = () => {
    if (reverted) return
    reverted = true
    split.revert()
  }
  return {
    addTo(tl, at) {
      tl.to(words, { ...TO, duration: 0.9, stagger: 0.06, ease: 'focus', onComplete: revert }, at)
    },
    revert,
  }
}
