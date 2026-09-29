'use client'

import { useEffect, useRef, type CSSProperties } from 'react'
import { motion } from '@/lib/qa-flags'
import styles from './styles.module.css'

export interface LightSweepProps {
  as?: 'h2'
  /** The chapter's true light direction in degrees (clear-glass 140, appointment 118, ledger 104). */
  angle: number
  children: string
  id?: string
  className?: string
}

type SweepState = 'idle' | 'run' | 'done'

/** Longest the sweep may take before it is settled by force (900 ms plus slack; transitionend normally settles it). */
const SETTLE_MS = 2000

/**
 * Light sweep (brief 4.8.2). The heading holds a base copy (the visible, readable text)
 * and an aria-hidden lit copy laid exactly over it. With full motion the base waits in
 * shade (#9A9890) and, once the heading's top crosses 75% of the viewport, a slanted edge of
 * light crosses it at the chapter's own angle: the lit copy is revealed by moving its
 * mask from 100% to 0% over 900 ms (focus ease). When it lands the mask is removed and
 * the heading is plain lime text again, so no gradient ever remains. No JS, Still air
 * and still routes never mask anything. The text is never painted with a gradient fill.
 */
export function LightSweep({ children, id, className, angle }: LightSweepProps) {
  const ref = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const root = document.documentElement
    const set = (s: SweepState) => {
      el.dataset.sweep = s
    }

    if (motion() === 'reduced' || root.dataset.still !== undefined) {
      set('done')
      return
    }

    let timer = 0
    const lit = el.querySelector<HTMLElement>('[data-sweep-lit]')

    const settle = () => {
      window.clearTimeout(timer)
      set('done')
    }
    const onEnd = (e: TransitionEvent) => {
      if (e.target === lit && e.propertyName.includes('mask-position')) settle()
    }
    const play = () => {
      if (el.dataset.sweep !== 'idle') return
      // Commit the start frame (mask at 100%) before the transition target is set.
      void el.offsetWidth
      set('run')
      timer = window.setTimeout(settle, SETTLE_MS)
    }

    set('idle')
    lit?.addEventListener('transitionend', onEnd)

    // Once, when the heading's top crosses 75% of the viewport (the region above that line). An
    // IntersectionObserver reads live layout, so sticky chapters that settle their height after
    // hydration never leave a stale trigger position behind.
    let first = true
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1]
        if (entry.isIntersecting) {
          play()
          io.disconnect()
        } else if (first && entry.boundingClientRect.bottom <= 0) {
          // Already above the viewport at load (a reload lower down): it simply stands in light.
          settle()
          io.disconnect()
        }
        first = false
      },
      { rootMargin: '0px 0px -25% 0px', threshold: 0 },
    )
    io.observe(el)

    return () => {
      io.disconnect()
      window.clearTimeout(timer)
      lit?.removeEventListener('transitionend', onEnd)
    }
  }, [])

  const style = { '--sweep-angle': `${angle}deg` } as CSSProperties

  return (
    <h2 ref={ref} id={id} className={className ? `${styles.sweep} ${className}` : styles.sweep} style={style} tabIndex={-1}>
      <span className={styles.base}>{children}</span>
      <span className={styles.lit} aria-hidden="true" data-sweep-lit="">
        {children}
      </span>
    </h2>
  )
}

export default LightSweep
