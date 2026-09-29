'use client'

import { useEffect } from 'react'
import { onAfterScroll } from '@/lib/frame'
import { conductor } from '@/lib/conductor'
import { light } from '@/lib/light-state'
import { flags, motion } from '@/lib/qa-flags'
import { useApp } from '@/lib/store'
import { stageApi } from '@/webgl/stage-api'
import { loadBaked } from '@/lib/caustics/client'
import { fmtClock, fmtDeg } from '@/lib/format'
import {
  DESIGN_MINUTE,
  LINE_A_MINUTE,
  LINE_B_MINUTE,
  SPAN_MINUTES,
  START_HOUR,
  lightAt,
  minuteAt,
  sunAtMinute,
  type AppointmentLight,
} from './time'
import { ARC, arcX, arcY } from './arc-geometry'

let installed = 0
let uninstall: (() => void) | null = null
let transportRequested = false

/** Requests the baked `ingrid` transport once the hero's light has loaded (never ahead of it). */
function requestIngrid() {
  if (transportRequested) return
  const webgl = useApp.getState().webgl
  if (webgl === 'off' || webgl === 'failed') return
  transportRequested = true
  const go = () => {
    loadBaked('ingrid')
      .then((t) => stageApi.requestTransport('appointment', t))
      .catch(() => {
        transportRequested = false
      })
  }
  stageApi.whenReady().then(() => {
    const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback
    if (ric) ric(go, { timeout: 1500 })
    else window.setTimeout(go, 200)
  })
}

/**
 * Zoom 200% and short windows (4.12): when the frame's content no longer fits one sticky screen, the section
 * sets data-overflow and becomes a static stack (CSS). Decided in the normal layout every time, so a window
 * that grows again returns to the sticky frame.
 */
function watchOverflow(section: HTMLElement, frameEl: HTMLElement): () => void {
  const check = () => {
    const was = section.hasAttribute('data-overflow')
    if (was) section.removeAttribute('data-overflow')
    const over = frameEl.scrollHeight > frameEl.clientHeight + 1
    if (over) section.setAttribute('data-overflow', '')
  }
  const ro = new ResizeObserver(check)
  ro.observe(frameEl)
  for (const el of Array.from(frameEl.children)) ro.observe(el)
  return () => {
    ro.disconnect()
    section.removeAttribute('data-overflow')
  }
}

function install(): () => void {
  const section = document.getElementById('appointment')
  if (!section) return () => undefined
  const digits = Array.from(section.querySelectorAll<HTMLElement>('[data-clock-digit]'))
  const lineA = section.querySelector<HTMLElement>('[data-line="a"]')
  const lineB = section.querySelector<HTMLElement>('[data-line="b"]')
  const alt = section.querySelector<HTMLElement>('[data-readout="alt"]')
  const az = section.querySelector<HTMLElement>('[data-readout="az"]')
  const dot = section.querySelector<HTMLElement>('[data-arc-dot]')
  const reduced = motion() === 'reduced'
  const still = flags.still !== null
  const stillMinute =
    flags.still === 'appointment' && flags.hour !== null
      ? Math.min(SPAN_MINUTES, Math.max(0, (flags.hour - START_HOUR) * 60))
      : DESIGN_MINUTE

  let shownMinute = -1
  let shownDot = -1
  const lit: AppointmentLight = { error: 0, focus: 1, wave: 0.04, sunX: 0, sunY: 0, aberr: 0 }
  const input = light.input.appointment

  const writeMinute = (minute: number) => {
    if (minute === shownMinute) return
    shownMinute = minute
    const text = fmtClock(START_HOUR + minute / 60)
    const chars = [text[0], text[1], text[3], text[4]]
    for (let i = 0; i < digits.length; i++) if (digits[i].textContent !== chars[i]) digits[i].textContent = chars[i]
    const sun = sunAtMinute(minute)
    if (alt) alt.textContent = fmtDeg(sun.altitude, 1)
    if (az) az.textContent = fmtDeg(sun.azimuth, 0)
    // Scroll-mapped lines (5.4): Line A from 16:34, Line B from 16:46; both hide again in reverse.
    if (lineA) lineA.toggleAttribute('data-on', minute >= LINE_A_MINUTE)
    if (lineB) lineB.toggleAttribute('data-on', minute >= LINE_B_MINUTE)
  }

  const writeDot = (m: number) => {
    if (!dot || Math.abs(m - shownDot) < 0.02) return
    shownDot = m
    const sun = sunAtMinute(m)
    const x = (arcX(sun.azimuth) / ARC.w) * 100
    const y = (arcY(sun.altitude) / ARC.h) * 100
    dot.style.transform = `translate(${x.toFixed(2)}%, ${y.toFixed(2)}%)`
  }

  // Overcast (no canvas): the CSS light's DOM word follows the same focus, so the word still arrives and leaves.
  let shownFocus = -1
  const writeLight = (m: number) => {
    lightAt(m, lit)
    const webgl = document.documentElement.dataset.webgl
    if ((webgl === 'off' || webgl === 'failed') && Math.abs(lit.focus - shownFocus) > 0.01) {
      shownFocus = lit.focus
      section.style.setProperty('--appt-focus', lit.focus.toFixed(3))
    }
    input.focus = lit.focus - 1
    input.wave = lit.wave - 0.04
    input.sunX = lit.sunX
    input.sunY = lit.sunY
    input.aberr = lit.aberr
  }

  // Still air and still routes: the chapter is a fixed 16:40 (or the still's hour); nothing is scroll-mapped.
  if (reduced || still) {
    const m = still ? stillMinute : DESIGN_MINUTE
    writeMinute(Math.floor(m + 1e-6))
    writeDot(m)
    writeLight(m)
    for (const l of [lineA, lineB]) l?.setAttribute('data-on', '')
    return () => {
      input.focus = input.wave = input.sunX = input.sunY = input.aberr = 0
    }
  }

  const tick = () => {
    const pExact = conductor.sectionProgress('appointment')
    const mExact = minuteAt(pExact)
    writeMinute(Math.floor(mExact + 1e-6))
    writeDot(mExact)

    // The light follows the smooth progress, the same value the conductor's patch, skew and hour use.
    // Sections update their input only while their chapter has weight (4.3).
    if (conductor.weights.appointment > 0) writeLight(minuteAt(conductor.smoothProgress('appointment')))
  }

  const off = onAfterScroll(tick)
  const frameEl = section.querySelector<HTMLElement>('[data-sticky-frame]')
  const unwatch = frameEl ? watchOverflow(section, frameEl) : () => undefined
  return () => {
    off()
    unwatch()
    input.focus = input.wave = input.sunX = input.sunY = input.aberr = 0
  }
}

/** The appointment's live wiring: clock digits, lines, readout and arc dot (DOM writes only), the sun-error
 *  light as `light.input.appointment`, and the `ingrid` transport. One instance, guarded for StrictMode. */
export function Controller() {
  useEffect(() => {
    installed++
    if (installed === 1) {
      uninstall = install()
      requestIngrid()
    }
    return () => {
      installed--
      if (installed === 0) {
        uninstall?.()
        uninstall = null
      }
    }
  }, [])
  return null
}

export default Controller
