'use client'

import { useEffect, useId, useSyncExternalStore } from 'react'
import { Switch } from '@/components/Switch'
import { useApp } from '@/lib/store'
import { isChapterId } from '@/content/chapters'
import styles from './styles.module.css'

export interface ModeSwitchesProps {
  layout?: 'row' | 'column'
}

type Mode = { still: boolean; overcast: boolean; system: boolean; device: boolean }

/** The mode as a stable string snapshot (useSyncExternalStore compares snapshots by value). */
function readModeKey(): string {
  const d = document.documentElement.dataset
  const q = new URLSearchParams(window.location.search)
  const still = d.motion === 'reduced'
  const overcast = d.webgl === 'off' || d.webgl === 'failed'
  // Still air requested by the OS, not by the URL: the switch cannot turn it off.
  const system = still && q.get('motion') !== 'reduced'
  // Overcast because the device cannot run the live light (no WebGL2, Save-Data, a failure),
  // not because the visitor asked for it: unchecking would change nothing.
  const device = overcast && q.get('webgl') !== '0'
  return [still, overcast, system, device].map((b) => (b ? '1' : '0')).join('')
}

// SSR and hydration agree on this; the real mode is read right after (7.2).
const SSR_KEY = '0000'

function parseMode(key: string): Mode {
  return { still: key[0] === '1', overcast: key[1] === '1', system: key[2] === '1', device: key[3] === '1' }
}

// setWebgl() is the single writer of html[data-webgl]; follow it (a late failure turns Overcast on).
function subscribe(onChange: () => void): () => void {
  return useApp.subscribe((s, p) => {
    if (s.webgl !== p.webgl) onChange()
  })
}

/** The hash to come back to after the reload: the chapter being read now. */
function currentHash(): string {
  const id = useApp.getState().activeChapter
  if (isChapterId(id) && id !== 'first-light') return `#${id}`
  const h = window.location.hash
  return /^#[a-z-]+$/.test(h) ? h : ''
}

/** sessionStorage key: the id of the switch that asked for the reload, refocused after it. */
const FOCUS_KEY = 'aslant:mode-switch-focus'

/** Switches are reloads (4.11): the same URL with the flag added or removed, at the current chapter. */
function reloadWith(key: 'motion' | 'webgl', value: string | null, switchId: string) {
  try {
    window.sessionStorage.setItem(FOCUS_KEY, switchId)
  } catch {
    // storage blocked: the reload still happens, focus simply starts at the top
  }
  const url = new URL(window.location.href)
  if (value === null) url.searchParams.delete(key)
  else url.searchParams.set(key, value)
  url.hash = currentHash()
  window.location.assign(url.toString())
}

/**
 * Still air and Overcast as content (4.11): two role="switch" buttons with plain helpers and
 * one live line that states the current mode. Every variant of the line is in the SSR HTML
 * and switched by CSS on html[data-motion] and html[data-webgl]. (Sound is cut tonight.)
 */
export function ModeSwitches({ layout = 'column' }: ModeSwitchesProps) {
  const mode = parseMode(useSyncExternalStore(subscribe, readModeKey, () => SSR_KEY))
  // The menu and the footer both render the switches: ids must stay unique on the page.
  const uid = useId()
  const stillId = `${uid}still`
  const overcastId = `${uid}overcast`

  // After a switch reload, keyboard focus returns to the switch that was pressed (not the page top).
  useEffect(() => {
    let stored: string | null = null
    try {
      stored = window.sessionStorage.getItem(FOCUS_KEY)
    } catch {
      return
    }
    if (stored !== stillId && stored !== overcastId) return
    try {
      window.sessionStorage.removeItem(FOCUS_KEY)
    } catch {
      // nothing to clear
    }
    const el = document.getElementById(stored)
    // Only a switch that is on screen can take focus (the menu copy is closed after a reload).
    if (el && el.getClientRects().length > 0) el.focus({ preventScroll: true })
  }, [stillId, overcastId])

  return (
    <div className={styles.root} data-layout={layout}>
      <div className={`${styles.switches} js-only`}>
        <Switch
          id={stillId}
          label="Still air"
          helper={mode.system ? 'Set by your system.' : 'Less motion.'}
          checked={mode.still}
          disabled={mode.system}
          onChange={(v) => reloadWith('motion', v ? 'reduced' : null, stillId)}
          className={styles.switch}
        />
        <Switch
          id={overcastId}
          label="Overcast"
          helper="No live rendering. Easier on battery."
          checked={mode.overcast}
          disabled={mode.device}
          onChange={(v) => reloadWith('webgl', v ? '0' : null, overcastId)}
          className={styles.switch}
        />
      </div>
      <p className={`${styles.line} t-caption`}>
        <span className="motion-full-only webgl-only">Now: full motion, live light.</span>
        <span className="motion-reduced-only webgl-only">Now: still air, live light.</span>
        <span className="motion-full-only overcast-only">Now: full motion, overcast.</span>
        <span className="motion-reduced-only overcast-only">Now: still air, overcast.</span>
      </p>
    </div>
  )
}

export default ModeSwitches
