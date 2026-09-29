// The commission form's logic (brief 1.2, 5.7). Honest conversion: three modes decided at build time
// from env vars, and the form never shows a confirmation it has not earned.
//   1. NEXT_PUBLIC_COMMISSION_ENDPOINT → JSON POST; only a 2xx is a success.
//   2. NEXT_PUBLIC_COMMISSION_EMAIL    → a prefilled mailto: the visitor's own email app sends it.
//   3. neither (tonight's default)     → preview: no network at all; the word forms in the panel's light.
// Validation shares write-yours' charset rules (the word must be writable in light: wordFace, 3.2).
// Everything here is plain logic; the transport helpers run on the client only.

import type { ChapterId } from '@/content/chapters'
import { computeWord, LIVE_ITERS, LIVE_N, loadBaked, wordFace } from '@/lib/caustics/client'
import { fmtClock, fmtDayMonth } from '@/lib/format'
import { CITIES, cityById } from '@/lib/light/cities'
import { designWindow, localMidsummer, seasonSpan, solarPosition, zonedToUtc, type City } from '@/lib/light/sun'
import type { Facing, GlassChoice } from '@/lib/store'
import type { Transport } from '@/webgl/stage-api'

// ── mode ──────────────────────────────────────────────────────────────────────
export type CommissionMode = 'endpoint' | 'mailto' | 'preview'

/** Inlined at build time (NEXT_PUBLIC_*), so server and client always agree. */
export const COMMISSION_ENDPOINT: string = (process.env.NEXT_PUBLIC_COMMISSION_ENDPOINT ?? '').trim()
export const COMMISSION_EMAIL: string = (process.env.NEXT_PUBLIC_COMMISSION_EMAIL ?? '').trim()
export const COMMISSION_MODE: CommissionMode = COMMISSION_ENDPOINT ? 'endpoint' : COMMISSION_EMAIL ? 'mailto' : 'preview'

export const OWNER: ChapterId = 'commission'

// ── copy (final, brief 5.7) ───────────────────────────────────────────────────
export const COPY = {
  h2: 'We draw every pane before we cut it.',
  sub: 'We reply within a week with a drawing of your pane and the days it will write.',
  subPreview: 'From spring 2027 we reply within a week with a drawing of your pane and the days it will write.',
  note: 'Until then this form sends nothing. It shows your word in this light.',
  consent: 'We use your email only to reply about this pane.',
  submit: 'Request a drawing',
  submitPreview: 'See it written',
  labels: {
    word: 'Your word',
    hour: 'The hour',
    city: 'City',
    facing: 'The window faces',
    name: 'Your name',
    email: 'Email',
    notes: 'Anything we should know (optional)',
  },
  helpers: { word: 'Up to ten letters.', hour: 'Local time.' },
  elsewhere: 'Somewhere else',
  errors: {
    wordEmpty: 'We need a word.',
    wordLong: 'Ten letters at most.',
    wordChars: 'Letters, numbers and spaces only.',
    // write-yours' string for the same rule (5.5): a letter outside both Sprat and Geologica.
    wordAlphabet: 'Our letters do not cover this alphabet yet.',
    name: 'Tell us your name.',
    emailEmpty: 'We need an email to reply.',
    emailBad: 'That email looks unfinished.',
    network: 'That did not send. Try again in a moment.',
  },
  success: {
    endpoint: 'Thank you. We will write within a week.',
    mailto: 'Your email app should now show the request. Nothing leaves this page until you send it.',
    preview: 'Commissions open in spring 2027. Nothing was sent.',
  },
  save: 'Save the image',
  saveFailed: 'The image could not be made on this device.',
} as const

export function subCopy(mode: CommissionMode): string {
  return mode === 'preview' ? COPY.subPreview : COPY.sub
}

export function submitCopy(mode: CommissionMode): string {
  return mode === 'preview' ? COPY.submitPreview : COPY.submit
}

export function networkError(): string {
  return COMMISSION_EMAIL ? `${COPY.errors.network} Or write to ${COMMISSION_EMAIL}.` : COPY.errors.network
}

// ── fields ────────────────────────────────────────────────────────────────────
export const FACINGS: ReadonlyArray<{ value: Facing; label: string; az: number | null }> = [
  { value: 'N', label: 'North', az: 0 },
  { value: 'NE', label: 'North-east', az: 45 },
  { value: 'E', label: 'East', az: 90 },
  { value: 'SE', label: 'South-east', az: 135 },
  { value: 'S', label: 'South', az: 180 },
  { value: 'SW', label: 'South-west', az: 225 },
  { value: 'W', label: 'West', az: 270 },
  { value: 'NW', label: 'North-west', az: 315 },
  { value: 'unsure', label: 'Not sure', az: null },
]

export const ELSEWHERE = 'elsewhere'
export const DEFAULT_HOUR = '17:20'

export function facingLabel(f: Facing): string {
  return FACINGS.find((x) => x.value === f)?.label ?? 'Not sure'
}

export function isFacing(v: string): v is Facing {
  return FACINGS.some((f) => f.value === v)
}

export interface CommissionFields {
  word: string
  hour: string // "HH:MM" or ''
  cityId: string // a CITIES id or ELSEWHERE
  facing: Facing
  name: string
  email: string
  notes: string
  glass: GlassChoice
  website: string // honeypot
}

export type FieldName = 'word' | 'name' | 'email'
export type FieldErrors = Partial<Record<FieldName, string>>

/** The order in which fields are validated and focused (DOM order). */
export const VALIDATED: ReadonlyArray<FieldName> = ['word', 'name', 'email']

const LETTERS = /^[\p{L}\p{N} ]+$/u
const EMAIL = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[^\s@.]{2,}$/

/** The word as it is written in light: NFC, trimmed, inner runs of spaces collapsed. */
export function cleanWord(word: string): string {
  return word.normalize('NFC').trim().replace(/\s+/g, ' ')
}

/** Same charset rules as write-yours (5.5, 3.2). */
export function validateWord(raw: string): string | null {
  const w = cleanWord(raw)
  if (!w) return COPY.errors.wordEmpty
  if (!LETTERS.test(w)) return COPY.errors.wordChars
  if (Array.from(w).length > 10) return COPY.errors.wordLong
  if (wordFace(w) === null) return COPY.errors.wordAlphabet
  return null
}

export function validateField(name: FieldName, f: CommissionFields): string | null {
  if (name === 'word') return validateWord(f.word)
  if (name === 'name') return f.name.trim() ? null : COPY.errors.name
  const e = f.email.trim()
  if (!e) return COPY.errors.emailEmpty
  return EMAIL.test(e) ? null : COPY.errors.emailBad
}

export function validateAll(f: CommissionFields): FieldErrors {
  const out: FieldErrors = {}
  for (const n of VALIDATED) {
    const err = validateField(n, f)
    if (err) out[n] = err
  }
  return out
}

/** "17:20" → 17.333; '' or malformed → null. */
export function parseHour(v: string): number | null {
  const m = /^(\d{1,2}):(\d{2})/.exec(v.trim())
  if (!m) return null
  const h = Number(m[1])
  const min = Number(m[2])
  if (h > 23 || min > 59) return null
  return h + min / 60
}

export function cityName(cityId: string): string {
  if (cityId === ELSEWHERE) return COPY.elsewhere
  return CITIES.find((c) => c.id === cityId)?.name ?? COPY.elsewhere
}

// ── the computed window hint (must-fix, 5.7) ──────────────────────────────────
/**
 * "At {12:00} on {21 December} the sun does not reach a {south}-facing window in {Sydney}."
 * Shown when the chosen facing is more than 90° from the sun's azimuth at the chosen hour on the city's
 * local midsummer, or when the sun is below the horizon then. Never for "Not sure" or "Somewhere else".
 */
export function windowHint(f: Pick<CommissionFields, 'hour' | 'cityId' | 'facing'>, year?: number): string | null {
  if (f.facing === 'unsure' || f.cityId === ELSEWHERE) return null
  const hour = parseHour(f.hour)
  const face = FACINGS.find((x) => x.value === f.facing)
  const city = CITIES.find((c) => c.id === f.cityId)
  if (hour === null || !face || face.az === null || !city) return null
  const day = localMidsummer(city.lat, year)
  const when = zonedToUtc(day.y, day.m, day.d, hour, city.tz)
  const sun = solarPosition(when, city.lat, city.lon)
  const off = Math.abs(((sun.azimuth - face.az + 540) % 360) - 180)
  if (sun.altitude > 0 && off <= 90) return null
  return `At ${fmtClock(hour)} on ${fmtDayMonth(when, city.tz)} the sun does not reach a ${face.label.toLowerCase()}-facing window in ${city.name}.`
}

// ── submission ────────────────────────────────────────────────────────────────
export interface CommissionPayload {
  word: string
  hour: string
  city: string
  facing: string
  name: string
  email: string
  notes: string
  glass: GlassChoice
  website: string
}

export function payloadOf(f: CommissionFields): CommissionPayload {
  return {
    word: cleanWord(f.word),
    hour: f.hour.trim(),
    city: cityName(f.cityId),
    facing: facingLabel(f.facing),
    name: f.name.trim(),
    email: f.email.trim(),
    notes: f.notes.trim(),
    glass: f.glass,
    website: f.website,
  }
}

/** mailto:{email}?subject=A pane that says {word}&body={fields, one per line}, URI-encoded. */
export function mailtoHref(p: CommissionPayload, to: string = COMMISSION_EMAIL): string {
  const lines = [
    `${COPY.labels.word}: ${p.word}`,
    `${COPY.labels.hour}: ${p.hour || 'Not set'}`,
    `${COPY.labels.city}: ${p.city}`,
    `${COPY.labels.facing}: ${p.facing}`,
    `Glass: ${p.glass === 'clear' ? 'Clear' : 'Prismatic'}`,
    `${COPY.labels.name}: ${p.name}`,
    `${COPY.labels.email}: ${p.email}`,
  ]
  if (p.notes) lines.push(`Notes: ${p.notes}`)
  const subject = `A pane that says ${p.word}`
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\r\n'))}`
}

export type SubmitResult = { ok: true } | { ok: false; error: string } | { ok: 'dropped' }

/**
 * Sends the request in the configured mode. Endpoint: success only on a 2xx. Mailto: hands the request to
 * the visitor's email app. Preview: sends nothing. A filled honeypot is dropped silently (no network, no
 * confirmation).
 */
export async function submitCommission(f: CommissionFields, mode: CommissionMode = COMMISSION_MODE): Promise<SubmitResult> {
  const p = payloadOf(f)
  if (p.website.trim()) return { ok: 'dropped' }
  if (mode === 'preview') return { ok: true }
  if (mode === 'mailto') {
    window.location.href = mailtoHref(p)
    return { ok: true }
  }
  const ctrl = new AbortController()
  const timer = window.setTimeout(() => ctrl.abort(), 15000)
  try {
    const res = await fetch(COMMISSION_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(p),
      signal: ctrl.signal,
    })
    return res.ok ? { ok: true } : { ok: false, error: networkError() }
  } catch {
    return { ok: false, error: networkError() }
  } finally {
    window.clearTimeout(timer)
  }
}

// ── the success word (client only) ────────────────────────────────────────────
/**
 * The transport for the commission word: the baked files for `aslant` and `Ingrid`, otherwise computed
 * live in the worker at the live settings (about 0.1 to 0.3 s on M-series).
 */
export function commissionTransport(word: string): Promise<Transport> {
  const w = cleanWord(word)
  if (w === 'aslant') return loadBaked('aslant')
  if (w === 'Ingrid') return loadBaked('ingrid')
  return computeWord(w, { n: LIVE_N as 32768, iters: LIVE_ITERS })
}

/** Caption numbers for the saved image, from sun.ts (the pane tuned to the city's midsummer at that hour). */
export function captionNumbers(cityId: string, hourStr: string): {
  city: City
  hour: number
  arrives: string
  minutes: number
  from: string
  to: string
} {
  const city = cityId === ELSEWHERE ? cityById('copenhagen') : cityById(cityId)
  const hour = parseHour(hourStr) ?? 17 + 20 / 60
  const day = localMidsummer(city.lat)
  const win = designWindow(city, day, hour)
  const span = seasonSpan(city, day, hour)
  return {
    city,
    hour,
    arrives: fmtClock(hour),
    minutes: Math.round(win.minutes),
    from: fmtDayMonth(span.first, city.tz),
    to: fmtDayMonth(span.last, city.tz),
  }
}
