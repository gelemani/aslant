'use client'

import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from 'react'
import { Button } from '@/components/Button'
import { LightAnchor } from '@/components/LightAnchor'
import { conductor } from '@/lib/conductor'
import {
  captionNumbers,
  cityName,
  commissionTransport,
  COMMISSION_EMAIL,
  COMMISSION_ENDPOINT,
  COPY,
  DEFAULT_HOUR,
  ELSEWHERE,
  FACINGS,
  isFacing,
  OWNER,
  submitCommission,
  submitCopy,
  subCopy,
  validateAll,
  validateField,
  VALIDATED,
  windowHint,
  cleanWord,
  type CommissionFields,
  type CommissionMode,
  type FieldErrors,
  type FieldName,
} from '@/lib/commission'
import { wordFace } from '@/lib/caustics/client'
import { liveRect } from '@/lib/anchors'
import { frame, onAfterScroll } from '@/lib/frame'
import { CITIES, guessCity } from '@/lib/light/cities'
import { light } from '@/lib/light-state'
import { motion } from '@/lib/qa-flags'
import { tweenLight } from '@/lib/stage'
import { useApp, type CommissionDraft, type Facing, type GlassChoice } from '@/lib/store'
import { stageApi, type Transport } from '@/webgl/stage-api'
import styles from './styles.module.css'

type Phase = 'idle' | 'sending' | 'success'

/** --dur-fade: the form's exit on success, which the word waits for. */
const FORM_FADE_S = 0.4

/** The editable state; cityId null means "not chosen yet": Copenhagen in SSR, the time-zone guess after mount. */
interface FormState {
  word: string
  hour: string
  cityId: string | null
  facing: Facing
  name: string
  email: string
  notes: string
  glass: GlassChoice | null
  website: string
}

const EMPTY: FormState = {
  word: '',
  hour: DEFAULT_HOUR,
  cityId: null,
  facing: 'unsure',
  name: '',
  email: '',
  notes: '',
  glass: null,
  website: '',
}

const ID = {
  form: 'commission-form',
  status: 'commission-status',
  hint: 'commission-hint',
  network: 'commission-network',
} as const

const fieldId = (n: string) => `commission-${n}`

/** The scrims' feather below a text box (4.3), in CSS px. */
const NAV_FEATHER = 32
/** The commission light's smooth weight over which the DOM card turns from absent to fully cream. */
const SUN_IN_0 = 0.65
const SUN_IN_1 = 0.97
/** Card opacity at which the umber form text starts to show (fully shown at a fully cream card). */
const SUN_TEXT_0 = 0.7

function smooth01(a: number, b: number, v: number): number {
  const x = Math.min(1, Math.max(0, (v - a) / (b - a)))
  return x * x * (3 - 2 * x)
}

// Hydration-safe "after mount" flag: false in SSR and while hydrating, true afterwards (7.2 rule 2).
const noopSubscribe = () => () => {}
function useMounted(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  )
}

let guessed: string | null = null
function guessedCityId(): string {
  if (guessed === null) guessed = guessCity().city.id
  return guessed
}

function applyDraft(s: FormState, d: CommissionDraft): FormState {
  return {
    ...s,
    word: d.word,
    hour: d.hour,
    cityId: d.cityId,
    facing: isFacing(d.facing) ? d.facing : 'unsure',
    glass: d.glass,
  }
}

/**
 * The commission (brief 5.7): the heading block and the sunlit panel with the form. Honest in every mode:
 * a confirmation appears only after a real 2xx (endpoint), a handed-off email (mailto), or, in preview,
 * says in so many words that nothing was sent. On success the panel's content fades, its lit surface opens
 * onto the canvas and the visitor's word forms in the last sun.
 */
export function CommissionForm({ mode }: { mode: CommissionMode }) {
  const mounted = useMounted()
  const draft = useApp((s) => s.commissionDraft)
  const storeGlass = useApp((s) => s.glass)
  const webgl = useApp((s) => s.webgl)

  const [state, setState] = useState<FormState>(EMPTY)
  const [seenDraft, setSeenDraft] = useState<CommissionDraft | null>(null)
  const [shown, setShown] = useState<ReadonlySet<FieldName>>(() => new Set())
  const [phase, setPhase] = useState<Phase>('idle')
  const [network, setNetwork] = useState<string | null>(null)
  const [status, setStatus] = useState('')
  const [formedWord, setFormedWord] = useState('')
  const [saveError, setSaveError] = useState(false)
  const [saving, setSaving] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  // A new draft from write-yours ("Commission this pane") overwrites the word, hour, city, facing and glass.
  // After a success, a new draft opens the form again for the new word.
  if (draft && draft !== seenDraft) {
    setSeenDraft(draft)
    setState((s) => applyDraft(s, draft))
    if (phase === 'success') {
      setCollapsed(false)
      setPhase('idle')
      setStatus('')
      setFormedWord('')
      setSaveError(false)
    }
  }

  const fields: CommissionFields = {
    word: state.word,
    hour: state.hour,
    cityId: state.cityId ?? (mounted ? guessedCityId() : 'copenhagen'),
    facing: state.facing,
    name: state.name,
    email: state.email,
    notes: state.notes,
    glass: state.glass ?? storeGlass,
    website: state.website,
  }

  const errors: FieldErrors = {}
  for (const n of VALIDATED) {
    if (!shown.has(n)) continue
    const e = validateField(n, fields)
    if (e) errors[n] = e
  }
  const hint = mounted ? windowHint(fields) : null
  const firstEmpty: FieldName | 'submit' = !fields.word.trim() ? 'word' : !fields.name.trim() ? 'name' : !fields.email.trim() ? 'email' : 'submit'

  const panelRef = useRef<HTMLDivElement>(null)
  const statusRef = useRef<HTMLParagraphElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const transportRef = useRef<Transport | null>(null)
  const inputs = useRef<Partial<Record<FieldName, HTMLInputElement | null>>>({})

  // ── the lit plaster, per frame (writes only; the rect is the conductor's read of this frame) ──
  //  1. ::before fades to 10% only while the patch is exactly locked (5.7).
  //  2. Under the transparent nav the sunlit surface falls into shade, with the scrims' 32 px feather below the
  //     nav (4.3), so the nav's lime text never sits on the sunlit panel while it scrolls past.
  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    const root = document.documentElement
    let locked = false
    let cut = Number.NaN
    let sun = Number.NaN
    const off = onAfterScroll(() => {
      const live = fine.matches && motion() === 'full' && root.dataset.webgl === 'ready'
      const next = live && conductor.atRest('commission')

      // 3. With live light the card is in register with the canvas patch: its cream, feather and umber
      //    text follow the same smooth weight that moves the commission light, so the card is fully
      //    cream only where the light has arrived and dissolves with it on entry and exit. The text
      //    fades later than the card, so umber never sits on a half-lit card over the dark wall.
      const s = live ? smooth01(SUN_IN_0, SUN_IN_1, conductor.weights.commission) : Number.NaN
      if (Number.isNaN(s)) {
        if (!Number.isNaN(sun)) {
          sun = Number.NaN
          delete panel.dataset.sun
          panel.style.removeProperty('--sun-card')
          panel.style.removeProperty('--sun-feather')
          panel.style.removeProperty('--sun-text')
        }
      } else if (!(Math.abs(s - sun) < 0.004) || (s !== sun && (s === 0 || s === 1))) {
        sun = s
        // the sharp card comes in late (s²); the blurred penumbra carries the soft edge before it
        const card = s * s
        panel.style.setProperty('--sun-card', card.toFixed(3))
        panel.style.setProperty('--sun-feather', (s * (1 - card)).toFixed(3))
        panel.style.setProperty('--sun-text', smooth01(SUN_TEXT_0, 1, card).toFixed(3))
        if (panel.dataset.sun === undefined) panel.dataset.sun = ''
      }

      if (next !== locked) {
        locked = next
        if (next) panel.dataset.locked = ''
        else delete panel.dataset.locked
      }

      const r = liveRect('commission')
      const navH = frame.viewport.w >= 768 ? 72 : 56
      const c = r && r.bottom > 0 && r.top < frame.viewport.h ? Math.min(r.height, navH - r.top) : -NAV_FEATHER
      if (c > -NAV_FEATHER) {
        if (!(Math.abs(c - cut) < 0.5)) {
          cut = c
          panel.style.setProperty('--nav-cut', `${c.toFixed(1)}px`)
          if (panel.dataset.underNav === undefined) panel.dataset.underNav = ''
        }
      } else if (panel.dataset.underNav !== undefined) {
        cut = Number.NaN
        delete panel.dataset.underNav
      }
    })
    return () => {
      off()
      delete panel.dataset.locked
      delete panel.dataset.underNav
      delete panel.dataset.sun
    }
  }, [])

  // ── H2 plain fade (4.8.3): opacity 0 → 1, 400 ms, once at top 80% ──
  useEffect(() => {
    const h = titleRef.current
    if (!h || motion() === 'reduced' || document.documentElement.dataset.still !== undefined) return
    if (h.getBoundingClientRect().top < window.innerHeight * 0.8) return
    h.dataset.fade = 'wait'
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return
        h.dataset.fade = 'in'
        io.disconnect()
      },
      { rootMargin: '0px 0px -20% 0px' },
    )
    io.observe(h)
    return () => {
      io.disconnect()
      delete h.dataset.fade
    }
  }, [])

  // Back to idle after a success (a new draft): the formed word loosens into plain last sun again.
  useEffect(() => {
    if (phase !== 'idle' || light.input.commission.focus === 0) return
    const tw = tweenLight(light.input.commission, {
      focus: 0,
      duration: motion() === 'reduced' ? 0 : 0.45,
      ease: 'defocus',
    })
    return () => {
      tw.kill()
    }
  }, [phase])

  useEffect(() => {
    return () => {
      light.input.commission.focus = 0
    }
  }, [])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setState((s) => ({ ...s, [key]: value }))
    if (network) setNetwork(null)
  }

  const reveal = (n: FieldName) => {
    if (shown.has(n)) return
    setShown((prev) => new Set(prev).add(n))
  }

  function formWordInLight(word: string) {
    const live = webgl !== 'off' && webgl !== 'failed'
    if (!live) return
    const t0 = performance.now()
    commissionTransport(word)
      .then((t) => {
        transportRef.current = t
        stageApi.requestTransport(OWNER, t)
        // 5.7: the content fades first (--dur-fade, 400 ms), then the word forms, so the brightening
        // caustic never sits behind labels that are still legible.
        const reduced = motion() === 'reduced'
        tweenLight(light.input.commission, {
          focus: 1,
          delay: reduced ? 0 : Math.max(0, FORM_FADE_S - (performance.now() - t0) / 1000),
          duration: reduced ? 0 : 1.6,
          ease: 'focus',
        })
      })
      .catch(() => {
        // Superseded or failed: the panel keeps its plain last sun; the message still stands.
      })
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (phase !== 'idle') return
    const all = validateAll(fields)
    setShown(new Set(VALIDATED))
    const first = VALIDATED.find((n) => all[n])
    if (first) {
      inputs.current[first]?.focus()
      return
    }
    setNetwork(null)
    if (mode === 'endpoint') setPhase('sending')
    const res = await submitCommission(fields, mode)
    if (res.ok === 'dropped') {
      setPhase('idle')
      return
    }
    if (res.ok === false) {
      setPhase('idle')
      setNetwork(res.error)
      return
    }
    const word = cleanWord(fields.word)
    setFormedWord(word)
    setStatus(COPY.success[mode])
    setPhase('success')
    formWordInLight(word)
    // Focus moves to the status message once it is in the DOM.
    window.requestAnimationFrame(() => statusRef.current?.focus({ preventScroll: true }))
    settleStacked()
  }

  /**
   * Stacked layouts (phones, portrait tablets): the status sits above a panel that is taller than the screen,
   * and the visitor is at its bottom. Once the form has faded, the panel folds to a small wall of light and the
   * status and the word are brought into view together.
   */
  function settleStacked() {
    if (conductor.composition === 'split') return
    const reduced = motion() === 'reduced'
    window.setTimeout(
      () => {
        setCollapsed(true)
        window.requestAnimationFrame(() => statusRef.current?.scrollIntoView({ block: 'center', behavior: 'instant' }))
      },
      reduced ? 0 : 420,
    )
  }

  async function onSave() {
    if (saving) return
    setSaving(true)
    setSaveError(false)
    try {
      const word = formedWord || cleanWord(fields.word)
      const t = transportRef.current ?? (await commissionTransport(word))
      transportRef.current = t
      const n = captionNumbers(fields.cityId, fields.hour)
      const still = await stageApi.renderStill({
        width: 1080,
        height: 1080,
        framing: 'square',
        transport: t,
        hour: n.hour,
        glass: fields.glass,
      })
      const { saveImage } = await import('@/lib/save-image')
      await saveImage({ still, word, city: n.city.name, arrives: n.arrives, minutes: n.minutes, from: n.from, to: n.to })
    } catch {
      setSaveError(true)
    } finally {
      setSaving(false)
    }
  }

  const describedBy = (n: FieldName | 'hour', helper: boolean) =>
    [helper ? `${fieldId(n)}-helper` : '', n !== 'hour' && errors[n] ? `${fieldId(n)}-error` : ''].filter(Boolean).join(' ') ||
    undefined

  const formAttrs =
    mode === 'endpoint'
      ? { action: COMMISSION_ENDPOINT, method: 'post' as const }
      : mode === 'mailto'
        ? { action: `mailto:${COMMISSION_EMAIL}`, method: 'post' as const, encType: 'text/plain' }
        : {}

  const done = phase === 'success'
  const formedFace = formedWord ? wordFace(formedWord) : null

  return (
    <div className={`grid ${styles.inner}`}>
      <div className={styles.head}>
        {/* live scrims, one per box: at split the block is sticky through the rest interval and the H2
            hangs a column left of the rest, so one box around both would cut into the lit panel's edge */}
        <h2 id="commission-title" ref={titleRef} className={`t-h2 ${styles.h2}`} tabIndex={-1} data-scrim="live">
          {COPY.h2}
        </h2>
        <div className={styles.headBody} data-scrim="live">
          <p className={`t-lead ${styles.sub}`}>{subCopy(mode)}</p>
          {mode === 'preview' ? <p className={`t-caption ${styles.note}`}>{COPY.note}</p> : null}
          <p
            id={ID.status}
            ref={statusRef}
            role="status"
            tabIndex={-1}
            className={`t-lead ${styles.status}`}
            data-filled={status ? '' : undefined}
          >
            {status}
          </p>
          {done && mode === 'preview' ? (
            <div className={`webgl-only ${styles.saveRow}`}>
              <Button variant="secondary" onClick={onSave} disabled={saving}>
                {COPY.save}
              </Button>
              {saveError ? <p className={`t-label ${styles.saveError}`}>{COPY.saveFailed}</p> : null}
            </div>
          ) : null}
        </div>
      </div>

      <div
        ref={panelRef}
        className={styles.panel}
        data-surface="sunlit"
        data-state={phase}
        data-collapsed={collapsed ? '' : undefined}
      >
        <LightAnchor chapter="commission" className={styles.anchor} />

        <form
          id={ID.form}
          className={styles.form}
          noValidate
          onSubmit={onSubmit}
          aria-labelledby="commission-title"
          inert={done}
          {...formAttrs}
        >
          <div className={styles.field}>
            <label className={`t-label ${styles.label}`} htmlFor={fieldId('word')}>
              {COPY.labels.word}
            </label>
            <input
              ref={(el) => {
                inputs.current.word = el
              }}
              id={fieldId('word')}
              name="word"
              type="text"
              className={`t-body ${styles.input}`}
              value={state.word}
              onChange={(e) => set('word', e.target.value)}
              onBlur={() => reveal('word')}
              autoComplete="off"
              autoCapitalize="words"
              spellCheck={false}
              aria-invalid={errors.word ? true : undefined}
              aria-describedby={describedBy('word', true)}
              data-first-empty={firstEmpty === 'word' ? '' : undefined}
            />
            <p id={`${fieldId('word')}-helper`} className={`t-label ${styles.helper}`}>
              {COPY.helpers.word}
            </p>
            {errors.word ? (
              <p id={`${fieldId('word')}-error`} className={`t-label ${styles.error}`}>
                {errors.word}
              </p>
            ) : null}
          </div>

          <div className={styles.field}>
            <label className={`t-label ${styles.label}`} htmlFor={fieldId('hour')}>
              {COPY.labels.hour}
            </label>
            <span className={styles.timeWrap}>
              <input
                id={fieldId('hour')}
                name="hour"
                type="time"
                step={300}
                className={`t-body ${styles.input} ${styles.time}`}
                value={state.hour}
                onChange={(e) => set('hour', e.target.value)}
                aria-describedby={describedBy('hour', true)}
              />
            </span>
            <p id={`${fieldId('hour')}-helper`} className={`t-label ${styles.helper}`}>
              {COPY.helpers.hour}
            </p>
          </div>

          <div className={styles.field}>
            <label className={`t-label ${styles.label}`} htmlFor={fieldId('city')}>
              {COPY.labels.city}
            </label>
            <select
              id={fieldId('city')}
              name="city"
              className={`t-body ${styles.input} ${styles.select}`}
              value={fields.cityId}
              onChange={(e) => set('cityId', e.target.value)}
              aria-describedby={hint ? ID.hint : undefined}
            >
              {CITIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
              <option value={ELSEWHERE}>{cityName(ELSEWHERE)}</option>
            </select>
          </div>

          <div className={styles.field}>
            <label className={`t-label ${styles.label}`} htmlFor={fieldId('facing')}>
              {COPY.labels.facing}
            </label>
            <select
              id={fieldId('facing')}
              name="facing"
              className={`t-body ${styles.input} ${styles.select}`}
              value={state.facing}
              onChange={(e) => set('facing', isFacing(e.target.value) ? e.target.value : 'unsure')}
              aria-describedby={hint ? ID.hint : undefined}
            >
              {FACINGS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          <p id={ID.hint} className={`t-caption ${styles.hint} ${styles.full}`} aria-live="polite">
            {hint ?? ''}
          </p>

          <div className={styles.field}>
            <label className={`t-label ${styles.label}`} htmlFor={fieldId('name')}>
              {COPY.labels.name}
            </label>
            <input
              ref={(el) => {
                inputs.current.name = el
              }}
              id={fieldId('name')}
              name="name"
              type="text"
              className={`t-body ${styles.input}`}
              value={state.name}
              onChange={(e) => set('name', e.target.value)}
              onBlur={() => reveal('name')}
              autoComplete="name"
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={describedBy('name', false)}
              data-first-empty={firstEmpty === 'name' ? '' : undefined}
            />
            {errors.name ? (
              <p id={`${fieldId('name')}-error`} className={`t-label ${styles.error}`}>
                {errors.name}
              </p>
            ) : null}
          </div>

          <div className={styles.field}>
            <label className={`t-label ${styles.label}`} htmlFor={fieldId('email')}>
              {COPY.labels.email}
            </label>
            <input
              ref={(el) => {
                inputs.current.email = el
              }}
              id={fieldId('email')}
              name="email"
              type="email"
              inputMode="email"
              className={`t-body ${styles.input}`}
              value={state.email}
              onChange={(e) => set('email', e.target.value)}
              onBlur={() => reveal('email')}
              autoComplete="email"
              autoCapitalize="off"
              spellCheck={false}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={describedBy('email', false)}
              data-first-empty={firstEmpty === 'email' ? '' : undefined}
            />
            {errors.email ? (
              <p id={`${fieldId('email')}-error`} className={`t-label ${styles.error}`}>
                {errors.email}
              </p>
            ) : null}
          </div>

          <div className={`${styles.field} ${styles.full}`}>
            <label className={`t-label ${styles.label}`} htmlFor={fieldId('notes')}>
              {COPY.labels.notes}
            </label>
            <textarea
              id={fieldId('notes')}
              name="notes"
              rows={2}
              className={`t-body ${styles.input} ${styles.textarea}`}
              value={state.notes}
              onChange={(e) => set('notes', e.target.value)}
            />
          </div>

          <input type="hidden" name="glass" value={fields.glass} />

          <div className="visually-hidden" aria-hidden="true">
            <label htmlFor={fieldId('website')}>Website</label>
            <input
              id={fieldId('website')}
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={state.website}
              onChange={(e) => set('website', e.target.value)}
            />
          </div>

          <p className={`t-caption ${styles.consent} ${styles.full}`}>{COPY.consent}</p>

          <div className={`${styles.submitRow} ${styles.full}`}>
            <span className={mode === 'preview' ? 'js-only' : undefined}>
              <span
                data-first-empty={firstEmpty === 'submit' ? '' : undefined}
                className={styles.submitWrap}
                onFocus={(e) => {
                  // jumpTo focuses [data-first-empty]; when every field is filled that is this wrapper,
                  // so hand the focus on to the submit button itself.
                  if (e.target === e.currentTarget) e.currentTarget.querySelector('button')?.focus({ preventScroll: true })
                }}
              >
                <Button
                  variant="primary"
                  surface="sunlit"
                  // Before hydration a preview-mode form must never submit natively (it would put the
                  // fields in a GET URL); the button becomes a submit button once React owns the form.
                  type={mode !== 'preview' || mounted ? 'submit' : 'button'}
                  busy={phase === 'sending'}
                >
                  {submitCopy(mode)}
                </Button>
              </span>
            </span>
            {mode === 'preview' ? <p className={`nojs-only t-caption ${styles.nojsNote}`}>{COPY.note}</p> : null}
            {network ? (
              <p id={ID.network} role="alert" className={`t-label ${styles.error}`}>
                {network}
              </p>
            ) : null}
          </div>
        </form>

        {done ? (
          <p className={styles.formed} data-face={formedFace === 'geologica' ? 'geologica' : 'sprat'} aria-hidden="true">
            <span className={formedFace === 'geologica' ? 't-ui' : 't-h2'}>{formedWord}</span>
          </p>
        ) : null}
      </div>
    </div>
  )
}

export default CommissionForm
