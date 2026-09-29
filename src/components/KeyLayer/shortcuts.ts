// The "Keyboard shortcuts" preference (4.12, WCAG 2.1.4): on by default, remembered in
// localStorage (every access in try/catch: private windows and blocked storage throw).
import { useApp } from '@/lib/store'

const KEY = 'aslant:shortcuts'

/** The ray view (R, "Show the rays") is cut tonight; nothing may promise it while this is false. */
export const RAY_VIEW = false

export function loadShortcuts(): void {
  try {
    const v = window.localStorage.getItem(KEY)
    if (v === '0') useApp.getState().setShortcutsOn(false)
  } catch {
    /* storage unavailable: keep the default (on) */
  }
}

export function setShortcuts(on: boolean): void {
  useApp.getState().setShortcutsOn(on)
  try {
    window.localStorage.setItem(KEY, on ? '1' : '0')
  } catch {
    /* storage unavailable: the choice lasts for this page only */
  }
}
