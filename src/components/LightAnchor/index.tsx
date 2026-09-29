'use client'

import { useEffect, useRef, type CSSProperties } from 'react'
import type { ChapterId } from '@/content/chapters'
import { registerAnchor, type AnchorSpec } from '@/lib/anchors'
import { SPRAT_CHARS } from '@/lib/caustics/sprat-charset'
import { onAfterScroll } from '@/lib/frame'
import { light } from '@/lib/light-state'
import { horizonFactor, skewFromAltitude } from '@/lib/world-spec'
import { useApp } from '@/lib/store'
import styles from './styles.module.css'

export interface LightAnchorProps {
  chapter: ChapterId
  kind?: AnchorSpec['kind']
  className?: string
  /** Word shown as DOM light in Overcast (word chapters only). */
  word?: string
}

/**
 * Chapters whose anchor draws the Overcast CSS light (4.11). The hero, the loupe and the
 * bench have posters; the commission panel and the dusk ember draw their own surfaces.
 */
const CSS_LIGHT: ReadonlySet<ChapterId> = new Set<ChapterId>(['appointment', 'write-yours', 'ledger'])
/** Chapters whose light is a formed word (5.0); the ledger's light is loose. */
const WORD_DEFAULT: Partial<Record<ChapterId, string>> = { appointment: 'Ingrid', 'write-yours': 'Ingrid' }

function inSprat(word: string): boolean {
  for (const ch of word) {
    const cp = ch.codePointAt(0)
    if (cp === undefined || !SPRAT_CHARS.has(cp)) return false
  }
  return true
}

/**
 * The light patch's bounding box at rest (brief 4.3, 7.3). Positioned by the section's
 * CSS through `className`; registered with the conductor on mount. In Overcast (and
 * without JS) it also draws the CSS light: the parallelogram, its blurred penumbra and,
 * for word chapters, the word as DOM light (4.11).
 */
export function LightAnchor({ chapter, kind = 'patch', className, word }: LightAnchorProps) {
  const ref = useRef<HTMLDivElement>(null)
  const lightRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    return registerAnchor(el, { chapter, kind })
  }, [chapter, kind])

  // Overcast: the visitor's hour still sets the slant and the horizon fade (5.5).
  const followsVisitor = chapter === 'write-yours' && kind === 'patch'
  useEffect(() => {
    const el = lightRef.current
    if (!followsVisitor || !el) return
    let skew = -1
    let on = -1
    return onAfterScroll(function overcastVisitorLight() {
      const w = document.documentElement.dataset.webgl
      if (w !== 'off' && w !== 'failed') return
      const s = skewFromAltitude(light.visitor.alt)
      const o = horizonFactor(light.visitor.alt)
      if (Math.abs(s - skew) > 0.004) {
        skew = s
        el.style.setProperty('--skew', s.toFixed(3))
      }
      if (Math.abs(o - on) > 0.01) {
        on = o
        el.style.setProperty('--on', o.toFixed(2))
      }
    })
  }, [followsVisitor])

  // The visitor's formed word (write-yours) follows the store; SSR and hydration see the default.
  const visitorWord = useApp((s) => (chapter === 'write-yours' ? s.word : null))
  const drawsLight = kind === 'patch' && CSS_LIGHT.has(chapter)
  const shown = drawsLight ? (visitorWord || word || WORD_DEFAULT[chapter] || '').trim() : ''
  const chars = Math.max(3, Array.from(shown).length)

  return (
    <div
      ref={ref}
      data-light-anchor={chapter}
      data-anchor-kind={kind}
      aria-hidden="true"
      className={className ? `${styles.anchor} ${className}` : styles.anchor}
    >
      {drawsLight && (
        <div ref={lightRef} className={styles.light} data-ch={chapter} data-word={shown ? '' : undefined} style={{ '--chars': chars } as CSSProperties}>
          <div className={styles.pen}>
            <div className={styles.shape} />
          </div>
          <div className={styles.fill}>
            <div className={styles.shape} />
          </div>
          {shown && (
            <span className={inSprat(shown) ? styles.word : `${styles.word} ${styles.wordText}`} translate="no">
              {shown}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default LightAnchor
