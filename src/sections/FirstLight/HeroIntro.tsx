'use client'

// The hero intro (brief 5.1, t = 0 at the shutter open):
//     0 ms  light.intro.dawn 0 → 1 (700 ms, light): the room brightens from dawn to 08:10
//   200 ms  H1 optical focus-in (900 ms per word, 60 ms stagger)
//   500 ms  light.intro.form 0 → 1 (2.2 s, focus): pool light condenses into "aslant"
//  1100 ms  sub fades in (500 ms)
//  1400 ms  CTAs fade in (400 ms)
//  2700 ms  settled: markReady(), the pointer sun engages
// WP6 writes only light.intro; the conductor folds it into the first-light word (4.3).
// A scroll, a key or a click fast-forwards every intro tween to its end in 300 ms.

import { useEffect } from 'react'
import { gsap } from '@/lib/gsap'
import { light } from '@/lib/light-state'
import { stage, tweenLight } from '@/lib/stage'
import { useApp } from '@/lib/store'
import { introPlan, isReady, markReady, onShuttersOpen, type Arrival } from '@/lib/ready'
import { prepareFocusIn, type FocusIn } from '@/components/FocusTitle/focus-in'

/** If the loader never hands over (a dead chunk), land settled before the CSS failsafe (8 s). */
const HANDOFF_FAILSAFE_MS = 7200

let installed = 0
let teardown: (() => void) | null = null

function settleLight() {
  light.intro.dawn = 1
  light.intro.form = 1
  stage.requestRender(2)
}

function install(): () => void {
  const root = document.documentElement
  const title = document.querySelector<HTMLElement>('[data-hero-title]')
  const fades = [
    document.querySelector<HTMLElement>('[data-hero-sub]'),
    document.querySelector<HTMLElement>('[data-hero-ctas]'),
  ].filter((el): el is HTMLElement => el !== null)
  const poster = document.querySelector<HTMLElement>('[data-hero-poster]')
  const plan = introPlan()

  if (plan === 'none') {
    markReady()
    return () => {}
  }

  let cancelled = false
  let tl: gsap.core.Timeline | null = null
  let focus: FocusIn | null = null
  let ff: gsap.core.Tween | null = null
  const inputs: Array<() => void> = []

  const detachInputs = () => {
    while (inputs.length) inputs.pop()?.()
  }

  const land = () => {
    // Settled state: the light at 08:10 with the word formed, all copy visible.
    settleLight()
    if (root.dataset.intro !== 'skip') root.dataset.intro = 'done'
    markReady()
  }

  const play = async () => {
    const fonts = document.fonts?.ready.catch(() => undefined) ?? Promise.resolve()
    // The light begins at t = 0 with the shutters; the words wait for the fonts (they are
    // already loaded behind the loader, so this is a microtask in practice).
    tl = gsap.timeline({
      onComplete() {
        tl = null
        detachInputs()
        gsap.set(fades, { clearProps: 'opacity' })
        if (poster) gsap.set(poster, { clearProps: 'opacity,transition' })
        root.dataset.intro = 'done'
        markReady()
      },
    })
    tl.add(tweenLight(light.intro, { dawn: 1, duration: 0.7, ease: 'light' }), 0)
    tl.add(tweenLight(light.intro, { form: 1, duration: 2.2, ease: 'focus' }), 0.5)
    // Overcast: no live light to condense, so the captured frame arrives over the formation's span.
    const webgl = useApp.getState().webgl
    if (poster && (webgl === 'off' || webgl === 'failed')) {
      gsap.set(poster, { opacity: 0, transition: 'none' })
      tl.to(poster, { opacity: 1, duration: 2.2, ease: 'focus' }, 0.5)
    }

    await fonts
    if (cancelled || !tl) return
    const t0 = tl.time()
    gsap.set(fades, { opacity: 0 })
    if (title) {
      focus = prepareFocusIn(title)
      focus.addTo(tl, Math.max(0.2, t0))
    }
    // The split now carries the per-word states: lift the CSS pre-intro gate.
    root.dataset.intro = 'run'
    tl.to(fades[0] ?? {}, { opacity: 1, duration: 0.5, ease: 'focus' }, Math.max(1.1, t0))
    tl.to(fades[1] ?? {}, { opacity: 1, duration: 0.4, ease: 'focus' }, Math.max(1.4, t0))

    // Fast-forward on input; never blocks it (no preventDefault, passive listeners).
    const fastForward = () => {
      if (!tl || ff) return
      detachInputs()
      tl.pause()
      ff = gsap.to(tl, { progress: 1, duration: 0.3, ease: 'none' })
    }
    const opts: AddEventListenerOptions = { passive: true, capture: true }
    for (const type of ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const) {
      window.addEventListener(type, fastForward, opts)
      inputs.push(() => window.removeEventListener(type, fastForward, opts))
    }
    const onScroll = () => {
      if (window.scrollY > 4) fastForward()
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    inputs.push(() => window.removeEventListener('scroll', onScroll))
  }

  const failsafe = window.setTimeout(() => {
    useApp.getState().setIntroSkipped(true)
    land()
  }, Math.max(0, HANDOFF_FAILSAFE_MS - performance.now()))

  const off = onShuttersOpen((a: Arrival) => {
    window.clearTimeout(failsafe)
    if (a === 'play' && plan === 'play' && !isReady()) void play()
    else land()
  })

  return () => {
    cancelled = true
    window.clearTimeout(failsafe)
    off()
    detachInputs()
    ff?.kill()
    const running = tl
    tl = null
    if (running) {
      running.progress(1)
      running.kill()
    }
    focus?.revert()
  }
}

/** Client island of the hero: runs the intro once per page load (StrictMode-safe). */
export function HeroIntro() {
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

export default HeroIntro
