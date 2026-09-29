// The city table of brief 7.3 (WP8). Coordinates to 0.01°; ids from the names.
// guessCity() reads only the time zone (no geolocation, ever). Unknown zone → Copenhagen, guessed false.
// Call it after mount only: the prerendered HTML never contains a guessed city (7.2).
import type { City } from '@/lib/light/sun'

type Row = [name: string, tzs: string[], lat: number, lon: number]

const ROWS: Row[] = [
  ['Copenhagen', ['Europe/Copenhagen'], 55.68, 12.57],
  ['Moscow', ['Europe/Moscow'], 55.76, 37.62],
  ['London', ['Europe/London'], 51.51, -0.13],
  ['Dublin', ['Europe/Dublin'], 53.35, -6.26],
  ['Lisbon', ['Europe/Lisbon'], 38.72, -9.14],
  ['Madrid', ['Europe/Madrid'], 40.42, -3.7],
  ['Paris', ['Europe/Paris'], 48.86, 2.35],
  ['Brussels', ['Europe/Brussels'], 50.85, 4.35],
  ['Amsterdam', ['Europe/Amsterdam'], 52.37, 4.9],
  ['Berlin', ['Europe/Berlin'], 52.52, 13.4],
  ['Zurich', ['Europe/Zurich'], 47.38, 8.54],
  ['Rome', ['Europe/Rome'], 41.9, 12.5],
  ['Vienna', ['Europe/Vienna'], 48.21, 16.37],
  ['Prague', ['Europe/Prague'], 50.08, 14.44],
  ['Warsaw', ['Europe/Warsaw'], 52.23, 21.01],
  ['Stockholm', ['Europe/Stockholm'], 59.33, 18.07],
  ['Oslo', ['Europe/Oslo'], 59.91, 10.75],
  ['Helsinki', ['Europe/Helsinki'], 60.17, 24.94],
  ['Reykjavík', ['Atlantic/Reykjavik'], 64.15, -21.94],
  ['Athens', ['Europe/Athens'], 37.98, 23.73],
  ['Istanbul', ['Europe/Istanbul'], 41.01, 28.98],
  ['Kyiv', ['Europe/Kyiv', 'Europe/Kiev'], 50.45, 30.52],
  ['Tel Aviv', ['Asia/Jerusalem'], 32.09, 34.78],
  ['Cairo', ['Africa/Cairo'], 30.04, 31.24],
  ['Johannesburg', ['Africa/Johannesburg'], -26.2, 28.05],
  ['Dubai', ['Asia/Dubai'], 25.2, 55.27],
  ['Delhi', ['Asia/Kolkata', 'Asia/Calcutta'], 28.61, 77.21],
  ['Singapore', ['Asia/Singapore'], 1.35, 103.82],
  ['Hong Kong', ['Asia/Hong_Kong'], 22.32, 114.17],
  ['Shanghai', ['Asia/Shanghai'], 31.23, 121.47],
  ['Seoul', ['Asia/Seoul'], 37.57, 126.98],
  ['Tokyo', ['Asia/Tokyo'], 35.68, 139.69],
  ['Sydney', ['Australia/Sydney'], -33.87, 151.21],
  ['Melbourne', ['Australia/Melbourne'], -37.81, 144.96],
  ['Auckland', ['Pacific/Auckland'], -36.85, 174.76],
  ['New York', ['America/New_York'], 40.71, -74.01],
  ['Toronto', ['America/Toronto'], 43.65, -79.38],
  ['Chicago', ['America/Chicago'], 41.88, -87.63],
  ['Denver', ['America/Denver'], 39.74, -104.99],
  ['Los Angeles', ['America/Los_Angeles'], 34.05, -118.24],
  ['Vancouver', ['America/Vancouver'], 49.28, -123.12],
  ['Mexico City', ['America/Mexico_City'], 19.43, -99.13],
  ['São Paulo', ['America/Sao_Paulo'], -23.55, -46.63],
  ['Buenos Aires', ['America/Argentina/Buenos_Aires'], -34.6, -58.38],
]

function slug(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export const CITIES: City[] = ROWS.map(([name, tzs, lat, lon]) => ({ id: slug(name), name, tz: tzs[0], lat, lon }))

const BY_TZ = new Map<string, City>()
ROWS.forEach(([, tzs], i) => tzs.forEach((tz) => BY_TZ.set(tz, CITIES[i])))

export function cityById(id: string): City {
  return CITIES.find((c) => c.id === id) ?? CITIES[0]
}

export function guessCity(): { city: City; guessed: boolean } {
  let tz = ''
  try {
    tz = Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    tz = ''
  }
  const hit = BY_TZ.get(tz)
  return hit ? { city: hit, guessed: true } : { city: CITIES[0], guessed: false }
}
