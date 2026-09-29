// The appointment's time and light (brief 5.4), shared by the SSR markup and the live controller.
// Every number here comes from sun.ts; the bullet-time map is world-spec's, so the clock and the
// conductor's light read the same minute.
import { appointmentMinutes } from '@/lib/world-spec'
import { INGRID, designWindow, seasonSpan, solarPosition, sunVector, angleBetween, zonedToUtc, type Vec3 } from '@/lib/light/sun'
import { weeksWord } from '@/lib/format'

/** The clock runs from 16:12 (minute 0) to 17:08 (minute 56). */
export const START_HOUR = 16 + 12 / 60
export const SPAN_MINUTES = 56
/** Line A appears at 16:34, Line B at 16:46 (5.4). */
export const LINE_A_MINUTE = 22
export const LINE_B_MINUTE = 34
/** 16:40 on the clock. */
export const DESIGN_MINUTE = Math.round((INGRID.hour - START_HOUR) * 60)

/** Minutes after 16:12 at clock progress p (bullet time: 16:33 to 16:47 takes 40% of the scroll). */
export function minuteAt(p: number): number {
  return appointmentMinutes(p)
}

/** The equinox the copy compares against (the same year as Ingrid's midsummer). */
export const EQUINOX = { y: 2026, m: 3, d: 20 } as const

/** Copy numbers, computed once (at SSR and on the client alike: nothing here depends on today's date). */
export function appointmentFacts() {
  const win = designWindow(INGRID.city, INGRID.date, INGRID.hour)
  const summer = seasonSpan(INGRID.city, INGRID.date, INGRID.hour)
  const equinox = seasonSpan(INGRID.city, EQUINOX, INGRID.hour)
  return {
    windowStart: win.start,
    windowEnd: win.end,
    altitude: win.altitude,
    azimuth: win.azimuth,
    summerWeeks: weeksWord(summer.days),
    equinoxWeeks: weeksWord(equinox.days),
  }
}

// ── the sun over the scrubbed minutes ──

let baseMs = NaN
let design: Vec3 = [0, 0, 1]
let designAlt = 0
let designAz = 0
function init() {
  if (!Number.isNaN(baseMs)) return
  const { city, date } = INGRID
  baseMs = zonedToUtc(date.y, date.m, date.d, START_HOUR, city.tz).getTime()
  const p = solarPosition(zonedToUtc(date.y, date.m, date.d, INGRID.hour, city.tz), city.lat, city.lon)
  designAlt = p.altitude
  designAz = p.azimuth
  design = sunVector(p.altitude, p.azimuth)
}

/** Altitude and azimuth (degrees) at `m` minutes after 16:12 on 21 June 2026 in Copenhagen. */
export function sunAtMinute(m: number): { altitude: number; azimuth: number } {
  init()
  return solarPosition(new Date(baseMs + m * 60_000), INGRID.city.lat, INGRID.city.lon)
}

const smoothstep = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)))
  return t * t * (3 - 2 * t)
}

/** Sun error to the pane's design direction; 2.5° is the edge of the window. */
const TOL = 2.5
/** 2.5° of error moves the caustic by 0.035 pane widths (5.4). */
const OFFSET_PER_DEG = 0.035 / TOL

export interface AppointmentLight {
  /** Angle between the sun and the design direction, degrees. */
  error: number
  focus: number
  wave: number
  sunX: number
  sunY: number
  aberr: number
}

/**
 * The light at minute m (5.4): focus = 1 − smoothstep(0.35°, 2.5°, e); wave = 0.04 + 0.9 (1 − focus);
 * the error projected onto the wall (the patch moves against the sun: a lower sun lifts it, a sun further
 * west moves it left), at most 0.035 pane widths; aberration 0.9 (e / 2.5°)², clamped to 1.
 */
export function lightAt(m: number, out: AppointmentLight): AppointmentLight {
  init()
  const p = solarPosition(new Date(baseMs + m * 60_000), INGRID.city.lat, INGRID.city.lon)
  const e = angleBetween(sunVector(p.altitude, p.azimuth), design)
  const focus = 1 - smoothstep(0.35, TOL, e)
  let dAz = p.azimuth - designAz
  if (dAz > 180) dAz -= 360
  if (dAz < -180) dAz += 360
  const across = dAz * Math.cos((designAlt * Math.PI) / 180)
  const up = p.altitude - designAlt
  out.error = e
  out.focus = focus
  out.wave = 0.04 + 0.9 * (1 - focus)
  // Beyond the window the word is loose anyway; the offset stops at the window's edge (0.035 pane widths),
  // so the pattern never slides out of the pane and leaves an unlit strip at its edge.
  const reach = Math.min(1, TOL / Math.max(1e-6, Math.hypot(across, up)))
  out.sunX = -across * OFFSET_PER_DEG * reach
  out.sunY = up * OFFSET_PER_DEG * reach
  out.aberr = Math.min(1, 0.9 * (e / TOL) ** 2)
  return out
}
