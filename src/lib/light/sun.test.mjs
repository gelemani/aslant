// Test vectors for sun.ts (brief 7.3). Run: `node --test src/lib/light/sun.test.mjs` (Node 24 strips the types).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  solarPosition,
  sunVector,
  angleBetween,
  zonedToUtc,
  localMidsummer,
  designWindow,
  seasonSpan,
  sunsetToday,
  COPENHAGEN,
  INGRID,
} from './sun.ts'

const near = (actual, expected, tol, label) =>
  assert.ok(Math.abs(actual - expected) <= tol, `${label}: ${actual.toFixed(4)} is not within ${tol} of ${expected}`)

const clock = (h) => {
  const t = Math.round(h * 60)
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`
}
const dayMonth = (d) =>
  new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', timeZone: 'Europe/Copenhagen' }).format(d)

const H = 16 + 40 / 60
const CASES = [
  {
    label: 'Copenhagen 2026-06-21 16:40 CEST',
    date: { y: 2026, m: 6, d: 21 },
    alt: 40.2,
    az: 251.71,
    window: { start: '16:30', end: '16:50', minutes: 20 },
    span: { first: '26 May', last: '19 July', days: 55 },
  },
  {
    label: 'Copenhagen 2026-03-20 16:40 CET',
    date: { y: 2026, m: 3, d: 20 },
    alt: 13.16,
    az: 249.19,
    window: { minutes: 18 },
    span: { first: '14 March', last: '26 March', days: 13 },
  },
  {
    label: 'Copenhagen 2026-09-29 16:40 CEST',
    date: { y: 2026, m: 9, d: 29 },
    alt: 16.99,
    az: 238.9,
    window: { minutes: 20 },
    span: { first: '23 September', last: '5 October', days: 13 },
  },
]

for (const c of CASES) {
  test(`${c.label}: position`, () => {
    const p = solarPosition(zonedToUtc(c.date.y, c.date.m, c.date.d, H, COPENHAGEN.tz), COPENHAGEN.lat, COPENHAGEN.lon)
    near(p.altitude, c.alt, 0.1, 'altitude')
    near(p.azimuth, c.az, 0.1, 'azimuth')
  })

  test(`${c.label}: designWindow`, () => {
    const w = designWindow(COPENHAGEN, c.date, H)
    assert.equal(w.minutes, c.window.minutes)
    if (c.window.start) assert.equal(clock(w.start), c.window.start)
    if (c.window.end) assert.equal(clock(w.end), c.window.end)
    near(w.altitude, c.alt, 0.1, 'window altitude')
    near(w.azimuth, c.az, 0.1, 'window azimuth')
  })

  test(`${c.label}: seasonSpan`, () => {
    const s = seasonSpan(COPENHAGEN, c.date, H)
    assert.equal(s.days, c.span.days)
    assert.equal(dayMonth(s.first), c.span.first)
    assert.equal(dayMonth(s.last), c.span.last)
  })
}

test('Ingrid prints the copy numbers', () => {
  const p = solarPosition(zonedToUtc(INGRID.date.y, INGRID.date.m, INGRID.date.d, INGRID.hour, INGRID.city.tz), INGRID.city.lat, INGRID.city.lon)
  assert.equal(p.altitude.toFixed(1), '40.2')
  assert.equal(Math.round(p.azimuth), 252)
  const w = designWindow(INGRID.city, INGRID.date, INGRID.hour)
  assert.equal(w.minutes, 20)
  const weeks = (days) => ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'][Math.round(days / 7)]
  assert.equal(weeks(seasonSpan(INGRID.city, INGRID.date, INGRID.hour).days), 'eight')
  assert.equal(weeks(seasonSpan(INGRID.city, { y: 2026, m: 3, d: 20 }, INGRID.hour).days), 'two')
})

test('seasonSpan costs under 2 ms per call', () => {
  // Cold-cache calls (fresh wall-clock times, so every day pays its one Intl offset); the best of five batches,
  // so a busy machine does not fail the budget.
  const at = (i) => H + (i % 50) / 3600
  seasonSpan(COPENHAGEN, INGRID.date, at(0))
  let best = Infinity
  for (let b = 0; b < 5; b++) {
    const n = 10
    const t0 = performance.now()
    for (let i = 0; i < n; i++) seasonSpan(COPENHAGEN, INGRID.date, at(1 + b * n + i))
    best = Math.min(best, (performance.now() - t0) / n)
  }
  assert.ok(best < 2, `seasonSpan took ${best.toFixed(2)} ms`)
})

test('sunset on 2026-09-29', () => {
  const now = new Date(Date.UTC(2026, 8, 29, 9, 0))
  const cities = [
    [{ id: 'moscow', name: 'Moscow', tz: 'Europe/Moscow', lat: 55.76, lon: 37.62 }, '18:14'],
    [COPENHAGEN, '18:54'],
    [{ id: 'berlin', name: 'Berlin', tz: 'Europe/Berlin', lat: 52.52, lon: 13.4 }, '18:51'],
  ]
  for (const [city, time] of cities) assert.deepEqual(sunsetToday(city, now), { kind: 'set', time }, city.name)
})

test('polar day and polar night', () => {
  const svalbard = { id: 'longyearbyen', name: 'Longyearbyen', tz: 'Arctic/Longyearbyen', lat: 78.22, lon: 15.65 }
  assert.deepEqual(sunsetToday(svalbard, new Date(Date.UTC(2026, 5, 21, 10))), { kind: 'polar-day' })
  assert.deepEqual(sunsetToday(svalbard, new Date(Date.UTC(2026, 11, 21, 10))), { kind: 'polar-night' })
})

test('vectors, angles and midsummer', () => {
  near(angleBetween(sunVector(0, 0), sunVector(0, 90)), 90, 1e-9, 'right angle')
  near(angleBetween(sunVector(40, 250), sunVector(40, 250)), 0, 1e-9, 'zero angle')
  assert.deepEqual(localMidsummer(55.7, 2026), { y: 2026, m: 6, d: 21 })
  assert.deepEqual(localMidsummer(-33.9, 2026), { y: 2026, m: 12, d: 21 })
  assert.equal(zonedToUtc(2026, 6, 21, H, 'Europe/Copenhagen').toISOString(), '2026-06-21T14:40:00.000Z')
  assert.equal(zonedToUtc(2026, 3, 20, H, 'Europe/Copenhagen').toISOString(), '2026-03-20T15:40:00.000Z')
})
