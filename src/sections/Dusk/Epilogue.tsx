'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { LightAnchor } from '@/components/LightAnchor'
import { Button } from '@/components/Button'
import { light } from '@/lib/light-state'
import { stage } from '@/lib/stage'
import { useApp } from '@/lib/store'
import { lockScroll, unlockScroll } from '@/components/Colophon/scroll-lock'
import styles from './styles.module.css'

const HOLD_MS = 18000
const TEXT_AFTER_MS = 1500
const FADE_OUT_MS = 1200
const REGIONS = 'body header, main, footer'
const SCROLL_KEYS = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '])

type Phase = 'idle' | 'hold' | 'field' | 'leaving'

const noop = () => () => {}

function setEmber(on: 0 | 1) {
  if (light.ember.on === on) return
  light.ember.on = on
  stage.requestRender(2)
}

function setRegionsInert(on: boolean) {
  for (const el of document.querySelectorAll<HTMLElement>(REGIONS)) el.inert = on
}

/**
 * The last light (6.5): an 18 s steady hold on the ember with a fixation dot, then one switch
 * to a neutral grey field (#8C8C8C) where the eye paints the afterimage, then the text.
 * Flash-safe (WCAG 2.3.1): exactly one abrupt change to grey and one slow fade back.
 * Scroll, Esc or a click elsewhere cancels the hold silently; the field holds the
 * 'epilogue' scroll lock until exit.
 */
export function Epilogue() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [seconds, setSeconds] = useState(18)
  const [emberOff, setEmberOff] = useState(false)
  const [watched, setWatched] = useState(false)
  const [textOn, setTextOn] = useState(false)
  const [dot, setDot] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const blockRef = useRef<HTMLDivElement>(null)
  const holdRef = useRef<HTMLDivElement>(null)
  const startRef = useRef<HTMLSpanElement>(null)
  const backRef = useRef<HTMLButtonElement>(null)
  const client = useSyncExternalStore(noop, () => true, () => false)

  const focusStart = useCallback(() => {
    requestAnimationFrame(() => startRef.current?.querySelector('button')?.focus({ preventScroll: true }))
  }, [])

  const start = useCallback(() => {
    setEmber(1)
    setEmberOff(false)
    setSeconds(18)
    setPhase('hold')
    document.documentElement.dataset.epilogue = 'hold'
  }, [])

  // ── hold: 18 s, cancelled by scroll, Esc, a click elsewhere or leaving the tab ──
  useEffect(() => {
    if (phase !== 'hold') return
    holdRef.current?.focus({ preventScroll: true })
    const t0 = performance.now()
    let done = false
    const cancel = (restoreFocus: boolean) => {
      if (done) return
      done = true
      delete document.documentElement.dataset.epilogue
      setPhase('idle')
      if (restoreFocus) focusStart()
    }
    const tick = window.setInterval(() => {
      const left = Math.ceil((HOLD_MS - (performance.now() - t0)) / 1000)
      setSeconds(Math.min(18, Math.max(1, left)))
    }, 200)
    const toField = window.setTimeout(() => {
      if (done) return
      done = true
      // one frame: the ember goes out and the grey field appears with the dot where the ember was
      const anchor = blockRef.current?.querySelector<HTMLElement>('[data-light-anchor]')
      const r = anchor?.getBoundingClientRect()
      setDot(r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : { x: window.innerWidth / 2, y: window.innerHeight / 2 })
      setEmber(0)
      setEmberOff(true)
      setTextOn(false)
      setPhase('field')
    }, HOLD_MS)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        cancel(true)
      } else if (SCROLL_KEYS.has(e.key)) cancel(false)
    }
    const onPointer = (e: PointerEvent) => {
      if (!blockRef.current?.contains(e.target as Node)) cancel(false)
    }
    // Scroll means the visitor's intent (wheel, touch, scroll keys), never a layout-driven scroll change.
    const onWheel = () => cancel(false)
    const onHidden = () => {
      if (document.hidden) cancel(false)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onPointer, true)
    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('touchmove', onWheel, { passive: true })
    document.addEventListener('visibilitychange', onHidden)
    return () => {
      done = true
      window.clearInterval(tick)
      window.clearTimeout(toField)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onPointer, true)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchmove', onWheel)
      document.removeEventListener('visibilitychange', onHidden)
    }
  }, [phase, focusStart])

  const exit = useCallback(() => {
    setPhase((p) => (p === 'field' ? 'leaving' : p))
  }, [])

  // ── field: scroll lock, inert page, text after 1.5 s; Esc, scroll or a click fades it out ──
  useEffect(() => {
    if (phase !== 'field') return
    document.documentElement.dataset.epilogue = 'field'
    lockScroll('epilogue')
    setRegionsInert(true)
    const t = window.setTimeout(() => setTextOn(true), TEXT_AFTER_MS)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        exit()
      }
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('wheel', exit, { passive: true })
    window.addEventListener('touchmove', exit, { passive: true })
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('wheel', exit)
      window.removeEventListener('touchmove', exit)
    }
  }, [phase, exit])

  // the button receives focus once the text is in
  useEffect(() => {
    if (phase === 'field' && textOn) backRef.current?.focus({ preventScroll: true })
  }, [phase, textOn])

  // ── leaving: 1.2 s fade back to the evening; the ember stays off ──
  useEffect(() => {
    if (phase !== 'leaving') return
    const t = window.setTimeout(() => {
      setRegionsInert(false)
      unlockScroll('epilogue')
      delete document.documentElement.dataset.epilogue
      setWatched(true)
      setPhase('idle')
      focusStart()
    }, FADE_OUT_MS)
    return () => window.clearTimeout(t)
  }, [phase, focusStart])

  // A new day: once the visitor leaves dusk, the ember is lit again for the next arrival.
  useEffect(() => {
    return useApp.subscribe((s, p) => {
      if (s.activeChapter !== p.activeChapter && s.activeChapter !== 'dusk' && light.ember.on === 0) {
        setEmber(1)
        setEmberOff(false)
      }
    })
  }, [])

  // unmount safety (HMR, route change): never leave the page locked or inert
  useEffect(() => {
    return () => {
      if (document.documentElement.dataset.epilogue === 'field') {
        setRegionsInert(false)
        unlockScroll('epilogue')
      }
      delete document.documentElement.dataset.epilogue
      setEmber(1)
    }
  }, [])

  const holding = phase === 'hold'

  return (
    <div ref={blockRef} className={styles.emberBlock} data-ember={emberOff ? 'off' : 'on'} data-phase={phase}>
      <LightAnchor chapter="dusk" kind="ember" className={styles.ember} />
      {holding ? <span className={styles.fixation} aria-hidden="true" /> : null}
      <div className={`${styles.epilogue} js-only`}>
        {holding ? (
          <div ref={holdRef} tabIndex={-1} className={styles.hold}>
            <span className={styles.timer} aria-hidden="true">
              <span className={styles.hairline}>
                <span className={styles.fill} />
              </span>
              <span className={`t-value ${styles.seconds}`}>{seconds}</span>
            </span>
          </div>
        ) : (
          <span ref={startRef} className={styles.start}>
            <Button variant="text" onClick={start}>
              {watched ? 'Watch the sunset again' : 'Watch the sunset'}
            </Button>
          </span>
        )}
        <p className={`t-caption ${styles.caption}`} aria-live="polite">
          {holding ? (
            <>
              Look at the dot until the light goes out.<span className="visually-hidden"> 18 seconds</span>
            </>
          ) : (
            'Eighteen seconds. Keep your eyes on the dot.'
          )}
        </p>
      </div>
      {client && (phase === 'field' || phase === 'leaving')
        ? createPortal(
            <div
              className={styles.field}
              data-leaving={phase === 'leaving' ? '' : undefined}
              data-epilogue-field=""
              role="dialog"
              aria-modal="true"
              aria-labelledby="epilogue-text"
              onPointerDown={(e) => {
                if (e.target === e.currentTarget) exit()
              }}
            >
              <span className={styles.fieldDot} style={{ left: dot.x, top: dot.y }} aria-hidden="true" />
              <div className={styles.fieldCopy} data-on={textOn ? '' : undefined}>
                <p id="epilogue-text" className={`t-lead ${styles.fieldText}`} aria-live="polite">
                  {textOn
                    ? 'If you watched it to the end, you may see a pale blue shape on the wall. That colour is not on your screen. Your eye made it.'
                    : ''}
                </p>
                <button ref={backRef} type="button" className={`t-ui ${styles.fieldButton}`} onClick={exit} tabIndex={textOn ? 0 : -1}>
                  Back to the evening
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}

export default Epilogue
