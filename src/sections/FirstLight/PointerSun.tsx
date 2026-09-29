'use client'

// The pointer is the sun (brief 5.1, 4.6). Fine pointers: the pointer, measured from the
// patch centre in half-extents, sets a target sun offset that the word follows, damped
// (λ 3.2). Outside the patch the reach is capped (m ≤ 0.6) so reaching for the button or
// the nav never smears the word; the full range is for hovering the light itself. After
// 2.5 s of stillness, or when the pointer leaves the window, the word re-forms by itself.
// Coarse pointers: the word loosens as the visitor starts to scroll and re-forms by 35%
// of the first screen. Both write deltas into light.input['first-light'] only (4.3),
// from an afterScroll listener, for the conductor's next frame (7.4).

import { useEffect } from 'react'
import { frame, onAfterScroll } from '@/lib/frame'
import { light } from '@/lib/light-state'
import { stage } from '@/lib/stage'
import { conductor } from '@/lib/conductor'
import { useApp } from '@/lib/store'
import { motion } from '@/lib/qa-flags'

const REACH_X = 0.035 // lower-light units at |p.x| = 1
const REACH_Y = 0.025
const LAMBDA = 3.2
const STILL_AFTER_S = 2.5
const OUTSIDE_MAX_M = 0.6
const HOLD_KEY = 'pointer-sun'

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v)

let installed = 0
let teardown: (() => void) | null = null

function writeInput(x: number, y: number) {
  const m = Math.min(1, Math.hypot(x / REACH_X, y / REACH_Y) / Math.SQRT2)
  const inp = light.input['first-light']
  inp.sunX = x
  inp.sunY = y
  inp.wave = 0.25 * m
  inp.pointScale = 0.3 * m
  inp.aberr = 0.9 * m * m
}

/** True when (px, py) CSS px lies inside the patch parallelogram (6.1 patch-local space). */
function insidePatch(px: number, py: number): boolean {
  const P = light.patch
  if (P.w <= 0 || P.h <= 0) return false
  const v = (py - P.y) / P.h
  const k = P.skew * P.h
  const u = (px - P.x - v * k) / Math.max(1, P.w - k)
  return u >= 0 && u <= 1 && v >= 0 && v <= 1
}

function install(): () => void {
  if (motion() === 'reduced') return () => {}
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
  const off = { x: 0, y: 0 }
  let holding = false
  let engaged = useApp.getState().introDone
  const unsubApp = useApp.subscribe((s) => {
    engaged = s.introDone
  })

  const release = () => {
    if (holding) {
      holding = false
      stage.release(HOLD_KEY)
      stage.requestRender(1)
    }
  }

  const tick = function pointerSun(t: number, dt: number) {
    if (!engaged) return
    if ((conductor.weights['first-light'] ?? 0) <= 0) {
      // The hero's light has faded out: its input no longer counts (4.3). Park at rest.
      if (off.x !== 0 || off.y !== 0) {
        off.x = 0
        off.y = 0
        writeInput(0, 0)
      }
      release()
      return
    }

    if (!fine.matches) {
      // Touch: scroll drift, s = clamp(scrollY / (0.35 · vh), 0, 1).
      const s = clamp(frame.scroll.y / (0.35 * Math.max(1, conductor.vh)), 0, 1)
      const k = Math.sin(Math.PI * s)
      off.x = 0.03 * k
      off.y = 0.01 * k
      writeInput(off.x, off.y)
      return
    }

    let tx = 0
    let ty = 0
    const p = frame.pointer
    const active = light.chapter === 'first-light' && conductor.smooth.blend < 0.5
    if (active && p.inside && t - p.lastMove < STILL_AFTER_S) {
      const P = light.patch
      if (P.w > 0 && P.h > 0) {
        let px = clamp((p.x - (P.x + P.w / 2)) / (P.w / 2), -1, 1)
        let py = clamp((p.y - (P.y + P.h / 2)) / (P.h / 2), -1, 1)
        const m = Math.hypot(px, py) / Math.SQRT2
        if (m > OUTSIDE_MAX_M && !insidePatch(p.x, p.y)) {
          px *= OUTSIDE_MAX_M / m
          py *= OUTSIDE_MAX_M / m
        }
        tx = px * REACH_X
        ty = py * REACH_Y
      }
    }

    const a = 1 - Math.exp(-LAMBDA * dt)
    off.x += (tx - off.x) * a
    off.y += (ty - off.y) * a
    const moving = Math.abs(tx - off.x) > 1e-4 || Math.abs(ty - off.y) > 1e-4
    if (!moving) {
      off.x = tx
      off.y = ty
    }
    writeInput(off.x, off.y)
    if (moving && !holding) {
      holding = true
      stage.hold(HOLD_KEY)
    } else if (!moving) {
      release()
    }
  }

  const removeTick = onAfterScroll(tick)
  return () => {
    removeTick()
    unsubApp()
    release()
    writeInput(0, 0)
  }
}

/** Client island of the hero: one listener for the whole page (StrictMode-safe). */
export function PointerSun() {
  useEffect(() => {
    installed++
    if (installed === 1) teardown = install()
    return () => {
      installed--
      if (installed === 0) {
        teardown?.()
        teardown = null
      }
    }
  }, [])
  return null
}

export default PointerSun
