'use client'

// Write yours (brief 5.5, 6.4): the visitor's word, hour, glass and city.
//   · typing loosens the word at once (450 ms defocus), a 180 ms debounce, then a worker job whose
//     frames stream into the stage every 8 iterations while the focus climbs (6.4.2)
//   · the numbers (sun.ts) recompute at most once per animation frame, from an afterScroll listener,
//     never per input event; readouts are written through refs (7.2)
//   · light.visitor {hour, alt, prism, valid} and light.input['write-yours'] {focus, wave} are the
//     only light fields this island writes (4.3)

import { useEffect, useEffectEvent, useId, useMemo, useRef, useState, type ChangeEvent, type FocusEvent, type FormEvent } from 'react'
import { Button } from '@/components/Button'
import { LightAnchor } from '@/components/LightAnchor'
import { jumpTo } from '@/components/providers/SmoothScroll'
import { computeRelief, computeWord, LIVE_ITERS, LIVE_N, loadBaked, warmTransport, type ReliefResult } from '@/lib/caustics/client'
import { GEOLOGICA_CHARS, SPRAT_CHARS } from '@/lib/caustics/sprat-charset'
import { fmtClock, fmtDayMonth, fmtDeg, fmtInt, fmtMm } from '@/lib/format'
import { frame } from '@/lib/frame'
import { gsap, useGSAP } from '@/lib/gsap'
import { light } from '@/lib/light-state'
import { CITIES, cityById, guessCity } from '@/lib/light/cities'
import { GLASS } from '@/lib/light/glass'
import { designWindow, localMidsummer, seasonSpan, solarPosition, zonedToUtc, type City } from '@/lib/light/sun'
import { flags, motion } from '@/lib/qa-flags'
import { saveImage } from '@/lib/save-image'
import { stage, tweenLight } from '@/lib/stage'
import { useApp, type Facing, type GlassChoice } from '@/lib/store'
import { composition } from '@/lib/world-spec'
import { stageApi, type Transport } from '@/webgl/stage-api'
import { ContourMap } from './ContourMap'
import styles from './styles.module.css'

// ── constants ───────────────────────────────────────────────────────────────
const DEFAULT_WORD = 'Ingrid'
const DEFAULT_MIN = 17 * 60 + 20
const MIN_MIN = 6 * 60
const MAX_MIN = 21 * 60
const STEP_MIN = 5
/** The pane is tuned to midsummer; the year is fixed so SSR and the client agree (7.2). */
const YEAR = 2026
const DEBOUNCE_MS = 180
/** Minimum spacing of streamed frames: the raw job takes ~0.1 s on an M2, too fast to watch. */
const PACE_MS = 40
const LOOSE_FOCUS = 0.15
const LOOSE_WAVE = 0.6
const REST_WAVE = 0.04
const STILL_TIMEOUT_MS = 10000

const ERRORS = {
  length: 'Ten letters at most.',
  chars: 'Letters, numbers and spaces only.',
  alphabet: 'Our letters do not cover this alphabet yet.',
} as const
type ErrorKey = keyof typeof ERRORS

const GLASS_HELP: Readonly<Record<GlassChoice, string>> = {
  clear: 'Optical acrylic. White letters, faint colour at the edges.',
  prismatic: 'Flint glass. Each letter arrives with a spectrum along its edges.',
}

const FACINGS: ReadonlyArray<Facing> = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']

const LETTER = /^[\p{L}\p{N} ]$/u

// ── validation (5.5, 3.2) ───────────────────────────────────────────────────
function validate(raw: string): { word: string; ok: boolean; error: ErrorKey | null } {
  const word = raw.normalize('NFC').trim()
  const chars = Array.from(word)
  if (chars.length === 0) return { word, ok: false, error: null }
  for (const ch of chars) if (!LETTER.test(ch)) return { word, ok: false, error: 'chars' }
  for (const ch of chars) {
    const cp = ch.codePointAt(0) as number
    if (!SPRAT_CHARS.has(cp) && !GEOLOGICA_CHARS.has(cp)) return { word, ok: false, error: 'alphabet' }
  }
  if (chars.length > 10) return { word, ok: false, error: 'length' }
  return { word, ok: true, error: null }
}

// ── numbers (sun.ts; about 1 to 2 ms, at most once per frame) ───────────────
interface Numbers {
  hour: number
  city: City
  alt: number
  az: number
  below: boolean
  dateLabel: string
  minutes: number
  from: string
  to: string
}

function midsummerLabel(city: City): string {
  const d = localMidsummer(city.lat, YEAR)
  return fmtDayMonth(zonedToUtc(d.y, d.m, d.d, 12, city.tz), city.tz)
}

function computeNumbers(city: City, hour: number): Numbers {
  const date = localMidsummer(city.lat, YEAR)
  const pos = solarPosition(zonedToUtc(date.y, date.m, date.d, hour, city.tz), city.lat, city.lon)
  const base = { hour, city, alt: pos.altitude, az: pos.azimuth, dateLabel: midsummerLabel(city) }
  if (pos.altitude <= 0) return { ...base, below: true, minutes: 0, from: '', to: '' }
  const win = designWindow(city, date, hour)
  const span = seasonSpan(city, date, hour)
  return {
    ...base,
    below: false,
    minutes: Math.round(win.minutes),
    from: fmtDayMonth(span.first, city.tz),
    to: fmtDayMonth(span.last, city.tz),
  }
}

/** Keeps "26 May" and "20 minutes" on one line (no-break spaces; the copy is unchanged). */
const nb = (s: string) => s.replace(/ /g, '\u00A0')

function resultText(n: Numbers): string {
  return `Your word arrives at ${fmtClock(n.hour)} and holds for about ${nb(`${n.minutes} minutes`)}, from ${nb(n.from)} to ${nb(n.to)}.`
}

function hintText(n: Numbers): string {
  return `At ${fmtClock(n.hour)} on ${n.dateLabel} the sun is below the horizon in ${n.city.name}. Try an earlier hour.`
}

/** Slopes and depth scale by 0.4917 / (n_d − 1) relative to Clear, without a recompute (5.5). */
function reliefScale(glass: GlassChoice): number {
  return (GLASS.clear.nd - 1) / (GLASS[glass].nd - 1)
}

function facingOf(az: number): Facing {
  return FACINGS[((Math.round(az / 45) % 8) + 8) % 8]
}

interface InputVars {
  focus: number
  wave: number
  duration: number
  ease: string
  onComplete?: () => void
}

function isAbort(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { name?: unknown }).name === 'AbortError'
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const id = setTimeout(() => reject(new Error('timeout')), ms)
    p.then(
      (v) => {
        clearTimeout(id)
        resolve(v)
      },
      (e: unknown) => {
        clearTimeout(id)
        reject(e)
      },
    )
  })
}

// ── component ───────────────────────────────────────────────────────────────
export function Configurator() {
  const uid = useId()
  const ids = {
    word: `${uid}-word`,
    wordHelp: `${uid}-word-help`,
    wordErr: `${uid}-word-err`,
    hour: `${uid}-hour`,
    hourHelp: `${uid}-hour-help`,
    glassHelp: `${uid}-glass-help`,
    city: `${uid}-city`,
    cityHelp: `${uid}-city-help`,
  }

  const glass = useApp((s) => s.glass)
  const cityId = useApp((s) => s.cityId)
  const cityGuessed = useApp((s) => s.cityGuessed)
  const committedWord = useApp((s) => s.word)
  const city = cityById(cityId)
  const dateLabel = useMemo(() => midsummerLabel(cityById(cityId)), [cityId])

  // The first numbers are computed during render for the SSR default (Copenhagen, 17:20): the same
  // on the server and the client. After mount, refs carry every update (7.2).
  const [initial] = useState(() => computeNumbers(cityById('copenhagen'), DEFAULT_MIN / 60))
  const [error, setError] = useState<ErrorKey | null>(null)
  const [computing, setComputing] = useState(false)
  const [relief, setRelief] = useState<ReliefResult | null>(null)
  const [below, setBelow] = useState(initial.below)
  // Re-entry guard for "Save the image". The button is never natively disabled while saving: that would
  // blur it and drop keyboard focus to <body> (9.3 keyboard walk).
  const savingRef = useRef(false)
  const [saveFailed, setSaveFailed] = useState(false)

  const rootRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const hourValRef = useRef<HTMLSpanElement>(null)
  const resultRef = useRef<HTMLParagraphElement>(null)
  const hintRef = useRef<HTMLParagraphElement>(null)
  const liveRef = useRef<HTMLParagraphElement>(null)

  const hourRef = useRef(DEFAULT_MIN / 60)
  const dirtyRef = useRef(true)
  const numsRef = useRef<Numbers>(initial)
  const glassRef = useRef<GlassChoice>(glass)
  const cityRef = useRef<City>(city)
  const belowRef = useRef(initial.below)

  // Job lifecycle
  const seqRef = useRef(0)
  const jobRef = useRef<{ id: number; abort: AbortController } | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tweenRef = useRef<gsap.core.Tween | null>(null)
  /** The transport of the word that is formed on the wall. */
  const finalRef = useRef<Transport | null>(null)
  /** Frames of an unfinished job reached the stage (the formed word must be sent back on cancel). */
  const streamedRef = useRef(false)
  const committedRef = useRef(DEFAULT_WORD)

  // ── the light input: every change goes through one tween, one writer ──
  // The old word always lets go completely before the new one condenses: while the loosen runs,
  // streaming targets wait in pendingRef (the transports themselves reach the stage at once).
  const pendingRef = useRef<InputVars | null>(null)
  const loosenRef = useRef<gsap.core.Tween | null>(null)

  const tweenInput = (vars: InputVars) => {
    tweenRef.current?.kill()
    const inp = light.input['write-yours']
    if (motion() === 'reduced') {
      inp.focus = vars.focus
      inp.wave = vars.wave
      tweenRef.current = null
      stage.requestRender(2)
      vars.onComplete?.()
      return
    }
    tweenRef.current = tweenLight(inp, { ...vars, overwrite: true })
  }

  const isLoosening = () => {
    const l = loosenRef.current
    return !!l && l === tweenRef.current && l.isActive()
  }

  /** Streaming and settling targets: applied now, or as soon as the loosen completes. */
  const drive = (vars: InputVars) => {
    if (isLoosening()) {
      pendingRef.current = vars
      return
    }
    pendingRef.current = null
    tweenInput(vars)
  }

  const loosen = () => {
    if (motion() === 'reduced') return
    // Already loosening (fast typing): let the running tween finish; restarting it every keystroke
    // would restart the slow start of the defocus ease and the word would never let go.
    if (isLoosening()) return
    if (!tweenRef.current?.isActive() && light.input['write-yours'].focus <= LOOSE_FOCUS - 1 + 1e-3) return
    pendingRef.current = null
    tweenInput({
      focus: LOOSE_FOCUS - 1,
      wave: LOOSE_WAVE - REST_WAVE,
      duration: 0.45,
      ease: 'defocus',
      onComplete: () => {
        const next = pendingRef.current
        pendingRef.current = null
        if (next) tweenInput({ ...next, duration: Math.max(next.duration, 0.2) })
      },
    })
    loosenRef.current = tweenRef.current
  }

  /** Back to the formed word at once (cancel, invalid input). */
  const reform = (onComplete?: () => void) => {
    pendingRef.current = null
    tweenInput({ focus: 0, wave: 0, duration: 0.5, ease: 'focus', onComplete })
  }

  const cancelJob = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = null
    jobRef.current?.abort.abort()
    jobRef.current = null
    setComputing(false)
  }

  /** The last formed word stays on the wall: cancel, send it back if frames replaced it, re-form. */
  const restoreLast = () => {
    cancelJob()
    if (streamedRef.current && finalRef.current) stageApi.requestTransport('write-yours', finalRef.current)
    streamedRef.current = false
    reform()
  }

  const showRelief = (t: Transport) => {
    computeRelief(t).then(
      (r) => {
        if (finalRef.current === t) setRelief(r)
      },
      () => undefined,
    )
  }

  const startJob = (word: string) => {
    debounceRef.current = null
    jobRef.current?.abort.abort()
    const id = ++seqRef.current
    const abort = new AbortController()
    jobRef.current = { id, abort }
    setComputing(true)
    const reduced = motion() === 'reduced'
    let first = true
    computeWord(word, {
      n: LIVE_N,
      iters: LIVE_ITERS,
      pace: reduced ? 0 : PACE_MS,
      signal: abort.signal,
      onFrame: reduced
        ? undefined
        : (t, iter) => {
            if (jobRef.current?.id !== id) return
            streamedRef.current = true
            stageApi.requestTransport('write-yours', t)
            const k = Math.min(1, iter / LIVE_ITERS)
            const focus = LOOSE_FOCUS + 0.7 * k
            const wave = LOOSE_WAVE + (REST_WAVE - LOOSE_WAVE) * k
            drive({ focus: focus - 1, wave: wave - REST_WAVE, duration: 0.14, ease: 'light' })
            if (first) {
              first = false
              const off = stage.onFrame(() => {
                off()
                performance.mark('aslant:wy:first-drawn')
              })
            }
          },
    }).then(
      (t) => {
        if (jobRef.current?.id !== id) return
        jobRef.current = null
        finalRef.current = t
        streamedRef.current = false
        committedRef.current = word
        stageApi.requestTransport('write-yours', t)
        drive({ focus: 0, wave: 0, duration: 0.5, ease: 'focus', onComplete: () => {
          performance.mark('aslant:wy:settled')
          try {
            performance.measure('aslant:wy:to-first-frame', 'aslant:wy:key', 'aslant:wy:first-drawn')
            performance.measure('aslant:wy:to-settled', 'aslant:wy:key', 'aslant:wy:settled')
          } catch {
            // a mark is missing (reduced motion, or no key press): nothing to measure
          }
        } })
        useApp.getState().setWord(word)
        setComputing(false)
        showRelief(t)
      },
      (err: unknown) => {
        if (isAbort(err) || jobRef.current?.id !== id) return
        jobRef.current = null
        restoreLast()
      },
    )
  }

  // ── handlers ──
  const onWordInput = (e: ChangeEvent<HTMLInputElement>) => {
    performance.mark('aslant:wy:key')
    stage.touch()
    const v = validate(e.currentTarget.value)
    setError(v.error)
    light.visitor.valid = v.ok ? 1 : 0
    if (!v.ok || v.word === committedRef.current) {
      // Validation errors never start a job; the last valid word stays formed (6.4.2).
      restoreLast()
      return
    }
    cancelJob()
    loosen()
    debounceRef.current = setTimeout(() => startJob(v.word), DEBOUNCE_MS)
  }

  const onWordSubmit = (e: FormEvent) => {
    e.preventDefault()
    // Enter computes at once instead of waiting for the debounce.
    if (debounceRef.current && inputRef.current) {
      const v = validate(inputRef.current.value)
      clearTimeout(debounceRef.current)
      if (v.ok) startJob(v.word)
    }
  }

  const onWordFocus = (e: FocusEvent<HTMLInputElement>) => {
    const el = e.currentTarget
    el.select()
    // Coarse pointer, stacked: bring the preview 8 px under the nav so the preview, the result and
    // the field fit above the on-screen keyboard (5.5). Re-align once when the keyboard resizes.
    const coarse = frame.pointer.coarse || window.matchMedia('(pointer: coarse)').matches
    if (!coarse || composition(window.innerWidth, window.innerHeight) === 'split') return
    const align = () => {
      const anchor = rootRef.current?.querySelector<HTMLElement>('[data-light-anchor]')
      if (!anchor) return
      const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 56
      const top = anchor.getBoundingClientRect().top + window.scrollY - navH - 8
      window.scrollTo({ top: Math.max(0, top), behavior: 'instant' })
    }
    align()
    window.visualViewport?.addEventListener('resize', align, { once: true })
  }

  const onHourInput = (e: ChangeEvent<HTMLInputElement>) => {
    const min = Number(e.currentTarget.value)
    const label = fmtClock(min / 60)
    hourRef.current = min / 60
    if (hourValRef.current) hourValRef.current.textContent = label
    e.currentTarget.setAttribute('aria-valuetext', label)
    dirtyRef.current = true
    stage.touch()
  }

  const onGlass = (e: ChangeEvent<HTMLInputElement>) => {
    const g = e.currentTarget.value === 'clear' ? 'clear' : 'prismatic'
    useApp.getState().setGlass(g)
  }

  const onCity = (e: ChangeEvent<HTMLSelectElement>) => {
    const st = useApp.getState()
    st.setCityId(e.currentTarget.value)
    st.setCityGuessed(false)
  }

  const onCommission = () => {
    const n = numsRef.current
    useApp.getState().setCommissionDraft({
      word: committedRef.current,
      hour: fmtClock(hourRef.current),
      cityId: cityRef.current.id,
      facing: facingOf(n.az),
      glass: glassRef.current,
    })
    jumpTo('#commission', { timelapse: true, focus: '[data-first-empty]' })
  }

  const onSave = async () => {
    const t = finalRef.current
    const n = numsRef.current
    if (!t || n.below || savingRef.current) return
    savingRef.current = true
    setSaveFailed(false)
    try {
      const still = await withTimeout(
        stageApi.renderStill({ width: 1080, height: 1080, framing: 'square', transport: t, hour: hourRef.current, glass: glassRef.current }),
        STILL_TIMEOUT_MS,
      )
      await saveImage({ still, word: committedRef.current, city: n.city.name, arrives: fmtClock(n.hour), minutes: n.minutes, from: n.from, to: n.to })
    } catch {
      setSaveFailed(true)
    } finally {
      savingRef.current = false
    }
  }

  // ── discrete choices mark the numbers dirty ──
  useEffect(() => {
    glassRef.current = glass
    cityRef.current = cityById(cityId)
    dirtyRef.current = true
    stage.touch()
  }, [glass, cityId])

  // ── once per frame: numbers, readouts, light.visitor (5.5 "cost of the numbers") ──
  useEffect(() => {
    // The nav and menu labels follow the chosen hour through the store; their re-renders are
    // throttled to about 8 Hz so dragging the hour stays cheap (INP, 5.5).
    let storeAt = -1
    let announceTimer: ReturnType<typeof setTimeout> | null = null
    let clearTimer: ReturnType<typeof setTimeout> | null = null
    let announced = numsRef.current.below ? hintText(numsRef.current) : resultText(numsRef.current)
    const syncStore = (t: number) => {
      const st = useApp.getState()
      const h = numsRef.current.hour
      if (Math.abs(st.chosenHour - h) < 1e-6 || t - storeAt < 0.12) return
      storeAt = t
      st.setChosenHour(h)
    }
    const onFrame = (t: number) => {
      syncStore(t)
      if (!dirtyRef.current) return
      dirtyRef.current = false
      const n = computeNumbers(cityRef.current, hourRef.current)
      numsRef.current = n
      if (resultRef.current && !n.below) {
        const s = resultText(n)
        if (resultRef.current.textContent !== s) resultRef.current.textContent = s
      }
      if (hintRef.current && n.below) {
        const s = hintText(n)
        if (hintRef.current.textContent !== s) hintRef.current.textContent = s
      }
      if (resultRef.current) resultRef.current.hidden = n.below
      if (hintRef.current) hintRef.current.hidden = !n.below
      // The live region speaks once the hour settles, not at every 5-minute step of a drag, then empties
      // again so browse mode reads the sentence once (from the visible paragraph), not twice.
      if (announceTimer) clearTimeout(announceTimer)
      if (clearTimer) clearTimeout(clearTimer)
      announceTimer = setTimeout(() => {
        const live = liveRef.current
        const s = n.below ? hintText(n) : resultText(n)
        if (!live || s === announced) return
        announced = s
        live.textContent = s
        clearTimer = setTimeout(() => {
          live.textContent = ''
        }, 1500)
      }, 700)
      if (belowRef.current !== n.below) {
        belowRef.current = n.below
        setBelow(n.below)
      }
      const v = light.visitor
      v.hour = n.hour
      v.alt = n.alt
      v.prism = glassRef.current === 'prismatic' ? 1 : 0
      syncStore(t)
      stage.requestRender(2)
    }
    frame.afterScroll.add(onFrame)
    return () => {
      frame.afterScroll.delete(onFrame)
      if (announceTimer) clearTimeout(announceTimer)
      if (clearTimer) clearTimeout(clearTimer)
    }
  }, [])

  // Warm the worker, honour ?word=, and put the default word (baked Ingrid) on the wall with its relief.
  const beginLight = useEffectEvent((isCancelled: () => boolean) => {
    warmTransport()
    const flagged = flags.word ? validate(flags.word) : null
    if (flagged?.ok && flagged.word !== DEFAULT_WORD && inputRef.current) {
      inputRef.current.value = flagged.word
      startJob(flagged.word)
    }
    loadBaked('ingrid').then(
      (t) => {
        if (isCancelled()) return
        if (!finalRef.current) finalRef.current = t
        if (finalRef.current === t && !jobRef.current) {
          stageApi.requestTransport('write-yours', t)
          showRelief(t)
        }
      },
      () => undefined,
    )
  })

  // ── mount: the city guess, the ?word= flag, the default word's transport and relief ──
  useEffect(() => {
    const st = useApp.getState()
    if (!st.cityGuessed) {
      const g = guessCity()
      if (g.guessed) {
        st.setCityId(g.city.id)
        st.setCityGuessed(true)
      }
    }
    const root = rootRef.current
    let started = false
    let cancelled = false
    const start = () => {
      if (started || cancelled) return
      started = true
      io?.disconnect()
      clearTimeout(timer)
      beginLight(() => cancelled)
    }
    // ingrid.bin loads after the first frame, when the chapter comes near (or after 4 s).
    const io = root && 'IntersectionObserver' in window ? new IntersectionObserver((es) => es.some((e) => e.isIntersecting) && start(), { rootMargin: '200% 0px' }) : null
    if (io && root) io.observe(root)
    const timer = setTimeout(start, io ? 4000 : 0)
    return () => {
      cancelled = true
      io?.disconnect()
      clearTimeout(timer)
    }
  }, [])

  // ── unmount: stop the job, hand the input back ──
  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      jobRef.current?.abort.abort()
      jobRef.current = null
      tweenRef.current?.kill()
      const inp = light.input['write-yours']
      inp.focus = 0
      inp.wave = 0
    },
    [],
  )

  // ── H2: plain fade, once, at top 80% (4.8.3) ──
  useGSAP(
    () => {
      const h2 = titleRef.current
      if (!h2 || motion() !== 'full' || flags.still) return
      gsap.fromTo(h2, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'focus', scrollTrigger: { trigger: h2, start: 'top 80%', once: true } })
    },
    { scope: rootRef },
  )

  const scale = reliefScale(glass)
  const reliefLine = relief
    ? `Deepest relief about ${nb(`${fmtMm(relief.depthMm * scale)} mm`)} · steepest ${nb(`slope ${fmtDeg(relief.maxSlopeDeg * scale)}`)}`
    : ''
  const shownWord = committedWord || DEFAULT_WORD

  return (
    <div ref={rootRef} className={`grid ${styles.inner}`}>
      <div className={styles.head} data-scrim="">
        <h2 ref={titleRef} id="write-yours-title" className={`t-h2 ${styles.title}`} tabIndex={-1}>
          Choose a word and an hour.
        </h2>
        <p className={`t-lead ${styles.sub}`}>
          A name on the nursery wall at nap time, or a date in the hall at the hour you met. We compute the glass while you watch.
        </p>
      </div>

      <LightAnchor chapter="write-yours" word={shownWord} className={styles.anchor} />

      <div className={styles.readouts} data-scrim="">
        <p ref={liveRef} className="visually-hidden" aria-live="polite" aria-atomic="true" />
        <div>
          <p ref={resultRef} className={`t-body ${styles.result}`} hidden={initial.below}>
            {resultText(initial)}
          </p>
          <p ref={hintRef} className={`t-body ${styles.result}`} hidden={!initial.below}>
            {hintText(initial)}
          </p>
        </div>
        <div className={styles.reliefSlot}>
          <p className={`t-value ${styles.relief}`} data-show={!computing && relief ? '' : undefined}>
            {reliefLine}
          </p>
          <p className={`t-value ${styles.status}`} role="status" data-show={computing ? '' : undefined}>
            {computing ? `Computing the glass · ${fmtInt(LIVE_N)} rays` : ''}
          </p>
        </div>
      </div>

      <form className={styles.controls} onSubmit={onWordSubmit} noValidate data-scrim="">
        <div className={styles.field}>
          <label htmlFor={ids.word} className={`t-ui ${styles.label}`}>
            Your word
          </label>
          <input
            ref={inputRef}
            id={ids.word}
            name="word"
            type="text"
            className={`t-lead ${styles.input}`}
            defaultValue={DEFAULT_WORD}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="done"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${ids.wordHelp} ${ids.wordErr}` : ids.wordHelp}
            onChange={onWordInput}
            onFocus={onWordFocus}
          />
          <p id={ids.wordHelp} className={`t-caption ${styles.helper}`}>
            Up to ten letters. Names and dates work well.
          </p>
          {error ? (
            <p id={ids.wordErr} className={`t-caption ${styles.error}`}>
              {ERRORS[error]}
            </p>
          ) : null}
        </div>

        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label htmlFor={ids.hour} className={`t-ui ${styles.label}`}>
              The hour
            </label>
            <span ref={hourValRef} className={`t-value ${styles.hourValue}`} aria-hidden="true">
              {fmtClock(DEFAULT_MIN / 60)}
            </span>
          </div>
          <div className={styles.rangeWrap}>
            <input
              id={ids.hour}
              name="hour"
              type="range"
              className={styles.range}
              min={MIN_MIN}
              max={MAX_MIN}
              step={STEP_MIN}
              defaultValue={DEFAULT_MIN}
              aria-valuetext={fmtClock(DEFAULT_MIN / 60)}
              aria-describedby={ids.hourHelp}
              onChange={onHourInput}
            />
          </div>
          <p id={ids.hourHelp} className={`t-caption ${styles.helper}`}>
            Local time on {dateLabel}.
          </p>
        </div>

        <div className={styles.row}>
          <fieldset className={styles.glass} aria-describedby={ids.glassHelp}>
            <legend className={`t-ui ${styles.label}`}>Glass</legend>
            <div className={styles.segments}>
              {(['clear', 'prismatic'] as const).map((g) => (
                <label key={g} className={styles.segment} data-checked={glass === g ? '' : undefined}>
                  <input type="radio" name="glass" value={g} checked={glass === g} onChange={onGlass} className={styles.radio} />
                  <span className="t-ui">{g === 'clear' ? 'Clear' : 'Prismatic'}</span>
                </label>
              ))}
            </div>
            <p id={ids.glassHelp} className={`t-caption ${styles.helper}`}>
              {GLASS_HELP[glass]}
            </p>
          </fieldset>

          <div className={styles.field}>
            <label htmlFor={ids.city} className={`t-ui ${styles.label}`}>
              Where
            </label>
            <select
              id={ids.city}
              name="city"
              className={`t-ui ${styles.select}`}
              value={cityId}
              onChange={onCity}
              aria-describedby={cityGuessed ? ids.cityHelp : undefined}
            >
              {CITIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {cityGuessed ? (
              <p id={ids.cityHelp} className={`t-caption ${styles.helper}`}>
                We guessed from your time zone.
              </p>
            ) : null}
          </div>
        </div>

        <p className={`t-caption ${styles.note}`}>Computed for a pane tuned to {dateLabel}, facing the sun at that hour.</p>

        <div className={styles.buttons}>
          <span className={`js-only ${styles.saveWrap}`}>
            <Button variant="primary" onClick={onCommission}>
              Commission this pane
            </Button>
          </span>
          <span className={`webgl-only ${styles.saveWrap}`}>
            <Button variant="secondary" onClick={onSave} disabled={below}>
              Save the image
            </Button>
          </span>
        </div>
        {saveFailed ? (
          <p className={`t-caption ${styles.error}`} role="alert">
            The image could not be made on this device.
          </p>
        ) : null}
        <p className={`t-caption overcast-only ${styles.overcast}`}>The live preview needs WebGL. Your numbers are still exact.</p>
      </form>

      <figure className={`js-only ${styles.contour}`} data-scrim="">
        <ContourMap
          className={styles.contourCanvas}
          height={relief?.heightMm ?? null}
          w={relief?.heightWidth ?? 0}
          h={relief?.heightHeight ?? 0}
          aspect={relief ? relief.paneMm.w / relief.paneMm.h : 300 / 140.625}
          scale={scale}
        />
        <figcaption className={`t-caption ${styles.contourCaption}`}>{"Your pane's surface. One line every 0.2 mm."}</figcaption>
      </figure>
    </div>
  )
}

export default Configurator
