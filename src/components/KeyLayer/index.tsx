'use client'

import { useEffect } from 'react'
import { useApp } from '@/lib/store'
import { stage } from '@/lib/stage'
import { stageApi } from '@/webgl/stage-api'
import { fmtInt } from '@/lib/format'
import { loadShortcuts, RAY_VIEW } from './shortcuts'

// Leave the room (4.13): nav, main text and footer fade out (700 ms, shutter) and go inert;
// only the wall and its light remain. Everything that is light (the canvas, the Overcast CSS
// light inside a LightAnchor, the hero poster) and every box that contains light stays.
// Written here, not in globals.css, so the behaviour ships with the component that owns it.
const LIGHT = '[data-light-anchor], canvas, picture'
const TEXT = `:is(header, main, footer) :not(:has(${LIGHT})):not(${LIGHT}):not(:is(${LIGHT}) *)`
const ROOM_CSS = `
html[data-room] ${TEXT} {
  transition: opacity var(--dur-close) var(--ease-focus);
}
html[data-room=left] ${TEXT} {
  opacity: 0 !important;
  pointer-events: none;
  transition: opacity var(--dur-shutter) var(--ease-shutter);
}
`
const REGIONS = 'body header, main, footer'
const RETURN_MS = 450

let installed = false
let signed = false

/** The console signature (4.13): once, after the first rendered frame, numbers from the running code. */
function signature() {
  if (signed) return
  signed = true
  const { rays, bands } = stageApi.info()
  const keys = RAY_VIEW ? 'Press R to see them, L to leave the room.' : 'Press L to leave the room.'
  const numbers = rays > 0 ? ` ${fmtInt(rays)} rays at ${bands} wavelengths per frame.` : ''
  console.log('%caslant', 'font: 300 20px serif; color: #FFE1A6', `\nClear glass that writes in sunlight.${numbers} ${keys}`)
}

function isTyping(t: EventTarget | null): boolean {
  if (!(t instanceof HTMLElement)) return false
  if (t.isContentEditable) return true
  const tag = t.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
}

/** Another layer owns the keyboard: the menu, the colophon, the epilogue. */
function busy(): boolean {
  const s = useApp.getState()
  return s.menuOpen || s.colophonOpen || document.documentElement.dataset.epilogue !== undefined
}

/**
 * Global keys (4.12): L leaves or re-enters the room; Esc returns to it. R would toggle the
 * ray view, which is cut tonight, so it does nothing. Letter keys are ignored while typing,
 * with modifiers, and when the "Keyboard shortcuts" switch in the colophon is off.
 * The menu, the colophon and the epilogue handle their own Esc.
 */
export function KeyLayer() {
  const roomLeft = useApp((s) => s.roomLeft)

  // keyboard listener (singleton: StrictMode mounts effects twice)
  useEffect(() => {
    if (installed) return
    installed = true
    loadShortcuts()
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return
      const s = useApp.getState()
      if (e.key === 'Escape') {
        if (s.roomLeft) {
          e.preventDefault()
          s.setRoomLeft(false)
        }
        return
      }
      if (e.repeat || isTyping(e.target) || !s.shortcutsOn) return
      if (e.code === 'KeyL' || e.key === 'l' || e.key === 'L') {
        if (!s.roomLeft && busy()) return
        e.preventDefault()
        s.setRoomLeft(!s.roomLeft)
      }
    }
    window.addEventListener('keydown', onKey)
    const offFrame = signed
      ? () => {}
      : stage.onFrame(() => {
          signature()
          offFrame()
        })
    return () => {
      window.removeEventListener('keydown', onKey)
      offFrame()
      installed = false
    }
  }, [])

  // leave and return
  useEffect(() => {
    const html = document.documentElement
    const regions = Array.from(document.querySelectorAll<HTMLElement>(REGIONS))
    if (roomLeft) {
      const focused = document.activeElement
      const restore = focused instanceof HTMLElement && regions.some((r) => r.contains(focused)) ? focused : null
      html.dataset.room = 'left'
      for (const r of regions) r.inert = true
      return () => {
        html.dataset.room = 'return'
        for (const r of regions) r.inert = false
        restore?.focus({ preventScroll: true })
      }
    }
    if (html.dataset.room !== 'return') return
    const t = window.setTimeout(() => {
      if (html.dataset.room === 'return') delete html.dataset.room
    }, RETURN_MS)
    return () => window.clearTimeout(t)
  }, [roomLeft])

  return (
    <>
      <style>{ROOM_CSS}</style>
      <div className="visually-hidden" aria-live="polite">
        {roomLeft ? 'The room is empty. Press L or Escape to return.' : ''}
      </div>
    </>
  )
}

export default KeyLayer
