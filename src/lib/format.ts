// Number formatting for every readout and every number in copy (brief 7.3).
// Deterministic (no locale surprises): the grouping separator is always a comma.

/** Decimal hours to "HH:MM" (rounded to the minute, wrapped to 0..24). 16.6667 → "16:40". */
export function fmtClock(hours: number): string {
  if (!Number.isFinite(hours)) return '--:--'
  let total = Math.round(hours * 60)
  total = ((total % 1440) + 1440) % 1440
  const h = Math.floor(total / 60)
  const m = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** Degrees with a fixed number of decimals and the degree sign. 40.2 → "40.2°". */
export function fmtDeg(x: number, digits = 1): string {
  const v = Number(x.toFixed(digits))
  return `${(Object.is(v, -0) ? 0 : v).toFixed(digits)}°`
}

/** Integer with comma grouping. 65536 → "65,536". */
export function fmtInt(n: number): string {
  const v = Math.round(n)
  const s = String(Math.abs(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return v < 0 ? `-${s}` : s
}

const dayMonthCache = new Map<string, Intl.DateTimeFormat>()

/** A date as "26 May" in the given IANA time zone (en-GB). */
export function fmtDayMonth(date: Date, tz: string): string {
  let f = dayMonthCache.get(tz)
  if (!f) {
    try {
      f = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', timeZone: tz })
    } catch {
      f = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', timeZone: 'UTC' })
    }
    dayMonthCache.set(tz, f)
  }
  return f.format(date)
}

const WEEK_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve']

/** Days to a number of weeks in words, round(days / 7). 55 → "eight". Beyond twelve, digits. */
export function weeksWord(days: number): string {
  const w = Math.round(days / 7)
  return w >= 0 && w < WEEK_WORDS.length ? WEEK_WORDS[w] : String(w)
}

/** Millimetres with one decimal. 1.94 → "1.9". */
export function fmtMm(x: number): string {
  const v = Number(x.toFixed(1))
  return (Object.is(v, -0) ? 0 : v).toFixed(1)
}
