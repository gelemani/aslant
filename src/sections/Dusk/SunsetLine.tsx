'use client'

import { useSyncExternalStore } from 'react'
import { guessCity } from '@/lib/light/cities'
import { sunsetToday } from '@/lib/light/sun'

let cached: string | null = null

/** "Sunset in {city} today: {18:14}." from sun.ts, for the city of the visitor's time zone (5.8). */
function sentence(): string {
  if (cached !== null) return cached
  try {
    const { city } = guessCity()
    const s = sunsetToday(city)
    cached =
      s.kind === 'set'
        ? `Sunset in ${city.name} today: ${s.time}.`
        : s.kind === 'polar-day'
          ? `The sun does not set in ${city.name} today.`
          : `The sun does not rise in ${city.name} today.`
  } catch {
    cached = ''
  }
  return cached
}

const noop = () => () => {}

/**
 * Rendered only after mount into a fixed-width slot (7.2 rule 2): a prerendered page would
 * print the build day's sunset. SSR and hydration print nothing.
 */
export function SunsetLine({ className }: { className?: string }) {
  const text = useSyncExternalStore(noop, sentence, () => '')
  return (
    <p className={className} data-sunset="">
      {text}
    </p>
  )
}

export default SunsetLine
