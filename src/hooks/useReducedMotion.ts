'use client'

import { useApp } from '@/lib/store'
import { motion } from '@/lib/qa-flags'

/**
 * Still air (brief 4.7, 4.11): html[data-motion="reduced"], set once by the head script
 * from the OS preference or ?motion=reduced. Never a media query; it never changes at
 * runtime (an OS change reloads the page).
 */
export function useReducedMotion(): boolean {
  return useApp((s) => s.reducedMotion)
}

/** Synchronous read for code outside React (effects, tickers). Same source as motion(). */
export function prefersReducedMotion(): boolean {
  return motion() === 'reduced'
}
