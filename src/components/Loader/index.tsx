'use client'

// Act zero, "dawn" (brief 4.4). Two predawn shutters cover the room; between them a
// vertical slit at the hero patch's centre widens from 2 to 14 px with the real boot
// progress (fonts, light data, shaders, first frame), never a number. Before the canvas
// has drawn, the slit is a warm CSS gradient; once it has, the slit is simply the gap
// through which the live pool light is seen. The markup is server-rendered and shown only
// by the CSS gate in globals.css (html[data-js][data-motion='full']:not([data-still])),
// so the first paint never shows the formed word before the intro. Once open, the root
// is display: none inline (the CSS failsafe fades it at 8 s if this script never runs).
//   open      progress 1 and 500 ms elapsed (0 ms on a repeat visit): 700 ms (450 ms repeat)
//   skip      a mid-page arrival (data-intro="skip"): 450 ms as soon as progress allows
//   input     any wheel, touch, key or click while loading: 300 ms, the intro is skipped
//   failsafe  6 s: a stage that has not drawn yet opens onto the poster (the Overcast look)
//             and keeps loading; its first frame fades the canvas in (data-webgl="ready").
//             Only a stage that still has not drawn after 9 more visible seconds is
//             committed to Overcast ('failed'). Real failures (no WebGL2, a shader error,
//             a lost context) commit at once from the stage itself.

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import { boot } from '@/lib/boot'
import { useApp } from '@/lib/store'
import { stage } from '@/lib/stage'
import { introPlan, shuttersOpened, type Arrival } from '@/lib/ready'
import styles from './styles.module.css'

const MIN_MS = 500
const FAILSAFE_MS = 6000
/** After the failsafe opened onto the poster: visible time a slow stage still gets to draw. */
const COMMIT_MS = 9000
const OPEN_S = 0.7
const OPEN_SHORT_S = 0.45
const OPEN_INPUT_S = 0.3

let installed = 0
let teardown: (() => void) | null = null

function install(root: HTMLElement): () => void {
  const html = document.documentElement
  const plan = introPlan()
  if (plan === 'none') return () => {}

  const left = root.querySelector<HTMLElement>('[data-shutter="left"]')
  const right = root.querySelector<HTMLElement>('[data-shutter="right"]')
  const slit = root.querySelector<HTMLElement>('[data-slit]')
  const seen = html.dataset.seen === '1'
  const minMs = plan === 'skip' || seen ? 0 : MIN_MS

  // ── geometry: the slit sits at the hero patch's centre, spanning its height ──
  const place = () => {
    const anchor = document.querySelector<HTMLElement>('[data-light-anchor="first-light"]')
    if (!anchor) return
    const r = anchor.getBoundingClientRect()
    if (r.width <= 0 || r.bottom <= 0 || r.top >= window.innerHeight) return // not in view (mid-page arrival)
    root.style.setProperty('--slit-x', `${(r.left + r.width / 2).toFixed(1)}px`)
    root.style.setProperty('--slit-top', `${r.top.toFixed(1)}px`)
    root.style.setProperty('--slit-h', `${r.height.toFixed(1)}px`)
  }
  place()
  window.addEventListener('resize', place, { passive: true })

  // ── progress drives the slit (quickTo 0.6 s: it trails the real value, never overtakes it) ──
  const shown = { p: 0 }
  const apply = () => {
    const p = shown.p
    root.style.setProperty('--slit-w', `${(2 + 12 * p).toFixed(2)}px`)
    root.style.setProperty('--slit-glow', (0.2 + 0.8 * p).toFixed(3))
  }
  apply()
  const toP = gsap.quickTo(shown, 'p', { duration: 0.6, ease: 'focus', onUpdate: apply })

  let opened = false
  let openTl: gsap.core.Timeline | null = null
  const timers: number[] = []
  const inputs: Array<() => void> = []
  const detachInputs = () => {
    while (inputs.length) inputs.pop()?.()
  }

  const open = (duration: number, arrival: Arrival) => {
    if (opened) return
    opened = true
    detachInputs()
    for (const t of timers) window.clearTimeout(t)
    unsubBoot()
    gsap.killTweensOf(shown)
    stage.touch()
    stage.requestRender(2)
    // t = 0 of the hero timeline is the first frame of the open (5.1).
    shuttersOpened(arrival)
    openTl = gsap.timeline({
      onComplete() {
        openTl = null
        // Gone for good. (Not html[data-loader]: the global [data-loader] rule would match <html> itself.)
        root.dataset.state = 'open'
        root.style.display = 'none'
      },
    })
    openTl.to(left, { xPercent: -100, duration, ease: 'shutter' }, 0)
    openTl.to(right, { xPercent: 100, duration, ease: 'shutter' }, 0)
    if (slit) openTl.to(slit, { opacity: 0, duration: Math.min(0.24, duration), ease: 'defocus' }, 0)
  }

  const normalArrival: Arrival = plan === 'play' ? 'play' : 'settled'
  const normalDuration = plan === 'skip' || seen ? OPEN_SHORT_S : OPEN_S

  const tryOpen = () => {
    if (opened || boot.progress < 1) return
    const wait = minMs - performance.now()
    if (wait > 0) {
      timers.push(window.setTimeout(tryOpen, wait))
      return
    }
    open(normalDuration, normalArrival)
  }

  let unsubBoot: () => void = () => {}
  unsubBoot = boot.subscribe((p) => {
    toP(p)
    if (p >= 1) tryOpen()
  })
  if (opened) unsubBoot()

  // Any input while loading opens at once and skips the intro (the hero lands settled).
  const onInput = () => {
    if (opened) return
    if (normalArrival === 'play') useApp.getState().setIntroSkipped(true)
    open(OPEN_INPUT_S, 'settled')
  }
  const opts: AddEventListenerOptions = { passive: true, capture: true }
  for (const type of ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const) {
    window.addEventListener(type, onInput, opts)
    inputs.push(() => window.removeEventListener(type, onInput, opts))
  }

  // Failsafe: never open onto an unlit wall. A stage that has not drawn by 6 s is slow, not
  // broken (a busy machine, a cold shader cache): the shutters open onto the hero poster,
  // which stays up until html[data-webgl="ready"], and the stage keeps loading. Committing
  // to 'failed' here would stop a capable GPU for the whole session (review A11Y-2).
  let commitTimer = 0
  let onVisible: (() => void) | null = null
  const stillLoading = () => {
    const w = useApp.getState().webgl
    return boot.parts.frame < 1 && w !== 'off' && w !== 'failed' && w !== 'ready'
  }
  const scheduleCommit = () => {
    commitTimer = window.setTimeout(() => {
      commitTimer = 0
      if (!stillLoading()) return
      if (document.visibilityState !== 'visible') {
        // A background tab draws nothing; give it the same time once it is seen.
        onVisible = () => {
          if (document.visibilityState !== 'visible') return
          document.removeEventListener('visibilitychange', onVisible!)
          onVisible = null
          scheduleCommit()
        }
        document.addEventListener('visibilitychange', onVisible)
        return
      }
      useApp.getState().setWebgl('failed')
    }, COMMIT_MS)
  }
  timers.push(
    window.setTimeout(
      () => {
        if (opened) return
        if (stillLoading()) scheduleCommit()
        open(normalDuration, normalArrival)
      },
      Math.max(0, FAILSAFE_MS - performance.now()),
    ),
  )

  return () => {
    if (commitTimer) window.clearTimeout(commitTimer)
    if (onVisible) document.removeEventListener('visibilitychange', onVisible)
    detachInputs()
    for (const t of timers) window.clearTimeout(t)
    window.removeEventListener('resize', place)
    unsubBoot()
    gsap.killTweensOf(shown)
    if (openTl) openTl.progress(1)
  }
}

/** The dawn loader. aria-hidden: the content underneath is present and readable from the first paint. */
export function Loader() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    installed++
    if (installed === 1) teardown = install(el)
    return () => {
      installed--
      if (installed === 0) {
        teardown?.()
        teardown = null
      }
    }
  }, [])

  return (
    <div ref={ref} className={styles.loader} data-loader="" aria-hidden="true">
      <div className={`${styles.shutter} ${styles.left}`} data-shutter="left" />
      <div className={`${styles.shutter} ${styles.right}`} data-shutter="right" />
      <div className={styles.slit} data-slit="">
        <div className={styles.glow} />
      </div>
    </div>
  )
}

export default Loader
