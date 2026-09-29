'use client'

import { useEffect, useRef, type CSSProperties } from 'react'
import { MARK_DEFAULT, markPoints, onMark } from './live'
import styles from './styles.module.css'

export interface NavMarkProps {
  size?: number
}

const SSR_POINTS = markPoints(MARK_DEFAULT)

/**
 * The live nav mark (brief 4.5): a 28 × 16 parallelogram whose skew, length and warmth
 * follow the page's light. `--mark-skew`, `--mark-len` and `--mark-color` are mirrored
 * on the element for anyone who needs them (the menu's slit starts at the mark).
 */
export function NavMark({ size = 28 }: NavMarkProps) {
  const svg = useRef<SVGSVGElement>(null)
  const poly = useRef<SVGPolygonElement>(null)

  useEffect(
    () =>
      onMark((m) => {
        const s = svg.current
        const p = poly.current
        if (!s || !p) return
        p.setAttribute('points', markPoints(m))
        s.style.setProperty('--mark-skew', m.skew.toFixed(3))
        s.style.setProperty('--mark-len', m.len.toFixed(3))
        s.style.setProperty('--mark-color', m.color)
      }),
    [],
  )

  const style = {
    '--mark-skew': String(MARK_DEFAULT.skew),
    '--mark-len': MARK_DEFAULT.len.toFixed(3),
    '--mark-color': MARK_DEFAULT.color,
  } as CSSProperties

  return (
    <svg
      ref={svg}
      className={styles.mark}
      width={size}
      height={(size * 16) / 28}
      viewBox="0 0 28 16"
      aria-hidden="true"
      focusable="false"
      style={style}
    >
      <polygon ref={poly} points={SSR_POINTS} />
    </svg>
  )
}

export default NavMark
