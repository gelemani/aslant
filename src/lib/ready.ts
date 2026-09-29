// Arrival state (brief 4.4, 5.1). One module shared by the loader (WP6) and the hero intro:
// what the arrival will be, the moment the shutters open, and the moment the page settles.
//   play  full motion, no ?still, no mid-page arrival: the loader covers the first paint,
//         then the hero timeline runs from the shutter open (t = 0).
//   skip  the head script set data-intro="skip" (hash, reload, back/forward): the loader
//         still covers the first paint and opens in 450 ms; the hero is already settled.
//   none  Still air, ?still or no JS: no loader, no timeline, the settled frame.
import { light } from '@/lib/light-state'
import { useApp } from '@/lib/store'

export type IntroPlan = 'play' | 'skip' | 'none'
/** How the hero lands when the shutters open: the full timeline, or already settled. */
export type Arrival = 'play' | 'settled'

let plan: IntroPlan | null = null

/** Decided once from the attributes the head script wrote before first paint. */
export function introPlan(): IntroPlan {
  if (plan) return plan
  if (typeof document === 'undefined') return 'none'
  const d = document.documentElement.dataset
  if (d.js === undefined || d.motion !== 'full' || d.still !== undefined) plan = 'none'
  else if (d.intro === 'skip') plan = 'skip'
  else plan = 'play'
  return plan
}

// The light starts at dawn only when the intro will play (light-state contract, 7.3).
// Module scope, so it is set before the One Clock's first conductor update.
if (typeof window !== 'undefined' && introPlan() === 'play') {
  light.intro.dawn = 0
  light.intro.form = 0
}

// ── the shutters ──
let arrival: Arrival | null = null
const openSubs = new Set<(a: Arrival) => void>()

/** The loader calls this at the first frame of the shutter open (t = 0 of 5.1). */
export function shuttersOpened(a: Arrival): void {
  if (arrival) return
  arrival = a
  for (const fn of openSubs) {
    try {
      fn(a)
    } catch (err) {
      console.error('[ready] arrival listener threw', err)
    }
  }
}

/** Called at once when the shutters have already opened. */
export function onShuttersOpen(fn: (a: Arrival) => void): () => void {
  if (arrival) {
    fn(arrival)
    return () => {}
  }
  openSubs.add(fn)
  return () => {
    openSubs.delete(fn)
  }
}

let ready = false

/**
 * Called once when the intro has settled or was skipped: html[data-state="ready"]
 * (the QA hook), data-intro="done" after a played intro, useApp.introDone, and the
 * session flag that makes the next loader short (4.4).
 */
export function markReady(): void {
  if (typeof document === 'undefined' || ready) return
  ready = true
  const root = document.documentElement
  if (root.dataset.intro === 'run') root.dataset.intro = 'done'
  root.dataset.state = 'ready'
  useApp.getState().setIntroDone(true)
  try {
    sessionStorage.setItem('aslant:seen', '1')
  } catch {
    /* storage blocked: the next visit plays the full loader */
  }
}

export function isReady(): boolean {
  return ready
}
