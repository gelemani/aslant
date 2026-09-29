// Solar geometry for every number about the sun on the page (brief 7.3, WP8).
// Dependency-free, erasable TypeScript only: `node --test src/lib/light/sun.test.mjs` imports this file directly.
//
// Position: NOAA general solar position (fractional year, equation of time, declination), no refraction.
// Angles in degrees; azimuth from north, clockwise. Local times go through Intl offsets, computed once per
// call or once per day, never once per candidate minute.

export interface City {
  id: string
  name: string
  tz: string
  lat: number
  lon: number
}

export type Vec3 = [number, number, number]
export interface YMD {
  y: number
  m: number
  d: number
}

const RAD = Math.PI / 180
const MIN_MS = 60_000
const DAY_MS = 86_400_000
/** Sunset: the upper limb touches the horizon with standard refraction (degrees). */
const SUNSET_ALT = -0.833

// ── position ─────────────────────────────────────────────────────────────────

// The current year's bounds, cached: the position is evaluated thousands of times per seasonSpan call.
let yearStart = 0
let yearEnd = -1

/** Core NOAA evaluation on a UTC timestamp (ms). Writes altitude and azimuth into `out`. */
function positionMs(ms: number, lat: number, lon: number, out: { altitude: number; azimuth: number }) {
  if (ms < yearStart || ms >= yearEnd) {
    const y = new Date(ms).getUTCFullYear()
    yearStart = Date.UTC(y, 0, 1)
    yearEnd = Date.UTC(y + 1, 0, 1)
  }
  const daysInYear = Math.round((yearEnd - yearStart) / DAY_MS)
  const since = ms - yearStart
  const dayIndex = Math.floor(since / DAY_MS) // day of year − 1
  const hour = (since - dayIndex * DAY_MS) / 3_600_000
  const g = ((2 * Math.PI) / daysInYear) * (dayIndex + (hour - 12) / 24)
  const c1 = Math.cos(g)
  const s1 = Math.sin(g)
  const c2 = 2 * c1 * c1 - 1
  const s2 = 2 * s1 * c1
  const c3 = c1 * c2 - s1 * s2
  const s3 = s1 * c2 + c1 * s2
  const eqtime = 229.18 * (0.000075 + 0.001868 * c1 - 0.032077 * s1 - 0.014615 * c2 - 0.040849 * s2)
  const decl = 0.006918 - 0.399912 * c1 + 0.070257 * s1 - 0.006758 * c2 + 0.000907 * s2 - 0.002697 * c3 + 0.00148 * s3
  const trueSolarMin = hour * 60 + eqtime + 4 * lon
  const ha = (trueSolarMin / 4 - 180) * RAD
  const phi = lat * RAD
  const sinPhi = Math.sin(phi)
  const cosPhi = Math.cos(phi)
  const cosHa = Math.cos(ha)
  const cosZen = sinPhi * Math.sin(decl) + cosPhi * Math.cos(decl) * cosHa
  const zen = Math.acos(Math.min(1, Math.max(-1, cosZen)))
  const az = Math.atan2(Math.sin(ha), cosHa * sinPhi - Math.tan(decl) * cosPhi) / RAD + 180
  out.altitude = 90 - zen / RAD
  out.azimuth = ((az % 360) + 360) % 360
  return out
}

export function solarPosition(dateUtc: Date, lat: number, lon: number): { altitude: number; azimuth: number } {
  return positionMs(dateUtc.getTime(), lat, lon, { altitude: 0, azimuth: 0 })
}

/** Unit vector toward the sun: x east, y north, z up. */
export function sunVector(altitude: number, azimuth: number): Vec3 {
  const a = altitude * RAD
  const z = azimuth * RAD
  return [Math.cos(a) * Math.sin(z), Math.cos(a) * Math.cos(z), Math.sin(a)]
}

/** Angle between two vectors in degrees (atan2 form: exact near 0°, where acos loses precision). */
export function angleBetween(a: Vec3, b: Vec3): number {
  const cx = a[1] * b[2] - a[2] * b[1]
  const cy = a[2] * b[0] - a[0] * b[2]
  const cz = a[0] * b[1] - a[1] * b[0]
  const dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
  return Math.atan2(Math.hypot(cx, cy, cz), dot) / RAD
}

const scratch = { altitude: 0, azimuth: 0 }

/**
 * The sun's unit vector (x east, y north, z up) at a UTC timestamp, straight from the NOAA declination and
 * hour angle: the same geometry as positionMs without the acos/atan2 round trip. Used by the window and season
 * scans, which evaluate it thousands of times and compare directions by their dot product.
 */
function dirMs(ms: number, sinPhi: number, cosPhi: number, lon: number, out: Vec3): Vec3 {
  if (ms < yearStart || ms >= yearEnd) {
    const y = new Date(ms).getUTCFullYear()
    yearStart = Date.UTC(y, 0, 1)
    yearEnd = Date.UTC(y + 1, 0, 1)
  }
  const daysInYear = Math.round((yearEnd - yearStart) / DAY_MS)
  const since = ms - yearStart
  const dayIndex = Math.floor(since / DAY_MS)
  const hour = (since - dayIndex * DAY_MS) / 3_600_000
  const g = ((2 * Math.PI) / daysInYear) * (dayIndex + (hour - 12) / 24)
  const c1 = Math.cos(g)
  const s1 = Math.sin(g)
  const c2 = 2 * c1 * c1 - 1
  const s2 = 2 * s1 * c1
  const c3 = c1 * c2 - s1 * s2
  const s3 = s1 * c2 + c1 * s2
  const eqtime = 229.18 * (0.000075 + 0.001868 * c1 - 0.032077 * s1 - 0.014615 * c2 - 0.040849 * s2)
  const decl = 0.006918 - 0.399912 * c1 + 0.070257 * s1 - 0.006758 * c2 + 0.000907 * s2 - 0.002697 * c3 + 0.00148 * s3
  const ha = ((hour * 60 + eqtime + 4 * lon) / 4 - 180) * RAD
  const sd = Math.sin(decl)
  const cd = Math.cos(decl)
  const ch = Math.cos(ha)
  out[0] = -cd * Math.sin(ha)
  out[1] = sd * cosPhi - cd * sinPhi * ch
  out[2] = sd * sinPhi + cd * cosPhi * ch
  return out
}

const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]

// ── time zones ───────────────────────────────────────────────────────────────

const formatters = new Map<string, Intl.DateTimeFormat | null>()
function formatterFor(tz: string): Intl.DateTimeFormat | null {
  let f = formatters.get(tz)
  if (f === undefined) {
    try {
      f = new Intl.DateTimeFormat('en-GB', {
        timeZone: tz,
        hourCycle: 'h23',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    } catch {
      f = null
    }
    formatters.set(tz, f)
  }
  return f
}

/** Wall-clock fields of a UTC instant in a zone (UTC when the zone is unknown). */
function zonedParts(utcMs: number, tz: string): { y: number; m: number; d: number; h: number; min: number; s: number } {
  const f = formatterFor(tz)
  if (!f) {
    const u = new Date(utcMs)
    return {
      y: u.getUTCFullYear(),
      m: u.getUTCMonth() + 1,
      d: u.getUTCDate(),
      h: u.getUTCHours(),
      min: u.getUTCMinutes(),
      s: u.getUTCSeconds(),
    }
  }
  const out = { y: 0, m: 0, d: 0, h: 0, min: 0, s: 0 }
  for (const p of f.formatToParts(new Date(utcMs))) {
    if (p.type === 'year') out.y = Number(p.value)
    else if (p.type === 'month') out.m = Number(p.value)
    else if (p.type === 'day') out.d = Number(p.value)
    else if (p.type === 'hour') out.h = Number(p.value) % 24
    else if (p.type === 'minute') out.min = Number(p.value)
    else if (p.type === 'second') out.s = Number(p.value)
  }
  return out
}

/** Offset of the zone from UTC at an instant, in minutes (CEST → 120). */
function offsetMinutes(utcMs: number, tz: string): number {
  const p = zonedParts(utcMs, tz)
  const asUtc = Date.UTC(p.y, p.m - 1, p.d, p.h, p.min, p.s)
  return Math.round((asUtc - Math.floor(utcMs / 1000) * 1000) / MIN_MS)
}

const utcCache = new Map<string, number>()

/** Local wall-clock time (decimal hour) in `tz` to the UTC instant, in ms (cached per zone and wall-clock time). */
function zonedToUtcMs(y: number, m: number, d: number, hour: number, tz: string): number {
  const naive = Date.UTC(y, m - 1, d) + hour * 3_600_000
  const key = `${tz}|${naive}`
  const hit = utcCache.get(key)
  if (hit !== undefined) return hit
  const off = offsetMinutes(naive, tz)
  let utc = naive - off * MIN_MS
  const off2 = offsetMinutes(utc, tz)
  if (off2 !== off) utc = naive - off2 * MIN_MS
  if (utcCache.size > 4096) utcCache.clear()
  utcCache.set(key, utc)
  return utc
}

/** Local wall-clock time (decimal hour) in `tz` to the UTC instant. */
export function zonedToUtc(y: number, m: number, d: number, hour: number, tz: string): Date {
  return new Date(zonedToUtcMs(y, m, d, hour, tz))
}

/** The calendar day `k` days after `date` (proleptic, no time zone involved). */
function addDays(date: YMD, k: number): YMD {
  const t = new Date(Date.UTC(date.y, date.m - 1, date.d + k))
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() }
}

/** 21 June, or 21 December south of the equator. */
export function localMidsummer(lat: number, year?: number): { y: number; m: number; d: number } {
  const y = year ?? new Date().getFullYear()
  return lat < 0 ? { y, m: 12, d: 21 } : { y, m: 6, d: 21 }
}

// ── the pane's window ────────────────────────────────────────────────────────

/**
 * The daily window around the design moment: every minute within ±120 min whose sun direction lies within
 * `tolDeg` of the design direction. `start` and `end` are local decimal hours of the first and last qualifying
 * minute; `minutes = end − start` (20 for Ingrid, although 21 one-minute samples qualify).
 */
export function designWindow(
  city: City,
  date: { y: number; m: number; d: number },
  hour: number,
  tolDeg = 2.5,
): { start: number; end: number; minutes: number; altitude: number; azimuth: number } {
  const base = zonedToUtcMs(date.y, date.m, date.d, hour, city.tz)
  const p = positionMs(base, city.lat, city.lon, { altitude: 0, azimuth: 0 })
  const sinPhi = Math.sin(city.lat * RAD)
  const cosPhi = Math.cos(city.lat * RAD)
  const design = dirMs(base, sinPhi, cosPhi, city.lon, [0, 0, 0])
  const cosTol = Math.cos(tolDeg * RAD)
  const v: Vec3 = [0, 0, 0]
  let first = 0
  let last = 0
  for (let k = -120; k <= 120; k++) {
    if (dot(dirMs(base + k * MIN_MS, sinPhi, cosPhi, city.lon, v), design) >= cosTol) {
      if (k < first) first = k
      if (k > last) last = k
    }
  }
  return {
    start: hour + first / 60,
    end: hour + last / 60,
    minutes: last - first,
    altitude: p.altitude,
    azimuth: p.azimuth,
  }
}

/** Largest cosine to `design` on one day (smallest angle), searched coarse (10 min over ±240) then fine (1 min over ±10). */
function bestCosOnDay(city: City, day: YMD, hour: number, design: Vec3, sinPhi: number, cosPhi: number, v: Vec3): number {
  const base = zonedToUtcMs(day.y, day.m, day.d, hour, city.tz) // the one offset for this day
  let bestK = 0
  let best = -2
  for (let k = -240; k <= 240; k += 10) {
    const c = dot(dirMs(base + k * MIN_MS, sinPhi, cosPhi, city.lon, v), design)
    if (c > best) {
      best = c
      bestK = k
    }
  }
  const centre = bestK
  for (let k = centre - 10; k <= centre + 10; k++) {
    const c = dot(dirMs(base + k * MIN_MS, sinPhi, cosPhi, city.lon, v), design)
    if (c > best) best = c
  }
  return best
}

/**
 * The run of days, around the design day, on which the word still forms at some minute of the afternoon.
 * Scans outward one day at a time and stops at the first failing day on each side (capped at ±90 days).
 * `first` and `last` are the design hour on those days (format them with fmtDayMonth in the city's zone).
 */
export function seasonSpan(
  city: City,
  date: { y: number; m: number; d: number },
  hour: number,
  tolDeg = 2.5,
): { first: Date; last: Date; days: number } {
  const sinPhi = Math.sin(city.lat * RAD)
  const cosPhi = Math.cos(city.lat * RAD)
  const design = dirMs(zonedToUtcMs(date.y, date.m, date.d, hour, city.tz), sinPhi, cosPhi, city.lon, [0, 0, 0])
  const cosTol = Math.cos(tolDeg * RAD)
  const v: Vec3 = [0, 0, 0]
  const holds = (k: number) => bestCosOnDay(city, addDays(date, k), hour, design, sinPhi, cosPhi, v) >= cosTol
  let lo = 0
  while (lo > -90 && holds(lo - 1)) lo--
  let hi = 0
  while (hi < 90 && holds(hi + 1)) hi++
  const f = addDays(date, lo)
  const l = addDays(date, hi)
  return {
    first: new Date(zonedToUtcMs(f.y, f.m, f.d, hour, city.tz)),
    last: new Date(zonedToUtcMs(l.y, l.m, l.d, hour, city.tz)),
    days: hi - lo + 1,
  }
}

// ── sunset ───────────────────────────────────────────────────────────────────

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n)
}

/**
 * Today's sunset in the city: the first whole minute after local noon at which the altitude is below −0.833°
 * (having been above it). Polar day and polar night are reported as such.
 */
export function sunsetToday(
  city: City,
  now: Date = new Date(),
): { kind: 'set'; time: string } | { kind: 'polar-day' | 'polar-night' } {
  const today = zonedParts(now.getTime(), city.tz)
  const noon = zonedToUtc(today.y, today.m, today.d, 12, city.tz).getTime() // one offset for the day
  const alt = (k: number) => positionMs(noon + k * MIN_MS, city.lat, city.lon, scratch).altitude
  let prevAbove = alt(0) >= SUNSET_ALT
  let anyAbove = prevAbove
  let crossing = -1
  for (let k = 10; k <= 1440; k += 10) {
    const above = alt(k) >= SUNSET_ALT
    if (above) anyAbove = true
    if (prevAbove && !above) {
      crossing = k
      break
    }
    prevAbove = above
  }
  if (crossing < 0) return anyAbove ? { kind: 'polar-day' } : { kind: 'polar-night' }
  let k = crossing - 9
  while (k < crossing && alt(k) >= SUNSET_ALT) k++
  const total = 12 * 60 + k
  return { kind: 'set', time: `${pad2(Math.floor(total / 60) % 24)}:${pad2(total % 60)}` }
}

// ── data-graphic helpers (extras beyond 7.3, used by the appointment's sun-path arc) ─────────────────────────

/**
 * The sun's path from sunrise to sunset on one local day, sampled every `stepMin` minutes: [azimuth, altitude]
 * pairs, with the first and last point interpolated onto the horizon (altitude 0).
 */
export function sunPath(city: City, date: YMD, stepMin = 5): Array<[number, number]> {
  const midnight = zonedToUtc(date.y, date.m, date.d, 0, city.tz).getTime()
  const pts: Array<[number, number]> = []
  let prev: [number, number] | null = null
  const p = { altitude: 0, azimuth: 0 }
  for (let k = 0; k <= 1440; k += stepMin) {
    positionMs(midnight + k * MIN_MS, city.lat, city.lon, p)
    const cur: [number, number] = [p.azimuth, p.altitude]
    if (prev) {
      const crosses = (prev[1] < 0) !== (cur[1] < 0)
      if (crosses) {
        const t = prev[1] / (prev[1] - cur[1])
        pts.push([prev[0] + (cur[0] - prev[0]) * t, 0])
      }
    }
    if (cur[1] >= 0) pts.push(cur)
    prev = cur
  }
  return pts
}

// ── the example pane (fiction: the name and the minute; real: the sun) ──────────────────────────────────────

export const COPENHAGEN: City = { id: 'copenhagen', name: 'Copenhagen', tz: 'Europe/Copenhagen', lat: 55.6761, lon: 12.5683 }

export const INGRID: { city: City; date: { y: 2026; m: 6; d: 21 }; hour: number } = {
  city: COPENHAGEN,
  date: { y: 2026, m: 6, d: 21 },
  hour: 16 + 40 / 60,
}
