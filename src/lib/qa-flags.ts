// Query flags (brief 4.14). Parsed once from location.search on first client import;
// the server sees the defaults. Never read flags with useSearchParams (7.2).
import { isChapterId, type ChapterId } from '@/content/chapters'
import type { GpuTier } from '@/lib/store'

export interface QaFlags {
  /** ?still=<chapterId>|og renders one chapter frozen. */
  still: ChapterId | 'og' | null
  /** ?hour=HH:MM (decimal hours), overrides the still chapter's hour. */
  hour: number | null
  /** ?tier=0|2|3; anything else ignored. */
  tier: GpuTier | null
  /** ?webgl=0 */
  webglOff: boolean
  /** Idle freeze enabled; false with ?idle=0. */
  idle: boolean
  /** ?word= pre-fills write-yours. */
  word: string | null
  /** ?qa, always true in development. */
  qa: boolean
}

export const DEFAULT_FLAGS: Readonly<QaFlags> = Object.freeze({
  still: null,
  hour: null,
  tier: null,
  webglOff: false,
  idle: true,
  word: null,
  qa: process.env.NODE_ENV === 'development',
})

function parseHour(v: string | null): number | null {
  if (!v) return null
  const m = /^(\d{1,2})(?::(\d{2}))?$/.exec(v.trim())
  if (!m) return null
  const h = Number(m[1])
  const min = m[2] ? Number(m[2]) : 0
  if (h > 23 || min > 59) return null
  return h + min / 60
}

export function parseFlags(search: string): QaFlags {
  const q = new URLSearchParams(search)
  const still = q.get('still')
  const tier = q.get('tier')
  const word = q.get('word')
  return {
    still: still === 'og' ? 'og' : isChapterId(still) ? still : null,
    hour: parseHour(q.get('hour')),
    tier: tier === '0' ? 0 : tier === '2' ? 2 : tier === '3' ? 3 : null,
    webglOff: q.get('webgl') === '0',
    idle: q.get('idle') !== '0',
    word: word && word.trim() ? word.trim().slice(0, 40) : null,
    qa: DEFAULT_FLAGS.qa || q.has('qa'),
  }
}

export const flags: QaFlags =
  typeof window === 'undefined' ? { ...DEFAULT_FLAGS } : parseFlags(window.location.search)

/**
 * The only motion source for JS: html[data-motion], set once by the head script
 * from the OS preference or ?motion=reduced. 'full' on the server.
 */
export function motion(): 'full' | 'reduced' {
  if (typeof document === 'undefined') return 'full'
  return document.documentElement.dataset.motion === 'reduced' ? 'reduced' : 'full'
}
