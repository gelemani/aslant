// Word rasterisation on the main thread (brief 3.2, 6.1.1). Canvas cannot set variable axes
// reliably, so static font files are loaded as FontFaces and awaited before drawing.
//   face per word: 'aslant' → SpratWordmark (the one wordmark drawing); a word whose every
//   letter is in SPRAT_CHARS → SpratRaster (1 to 7 characters) or SpratRasterCondensed (8 to 10);
//   any letter outside Sprat but all in GEOLOGICA_CHARS → Geologica 600 (the page's own faces,
//   by the family names next/font generated); anything else is not writable (null).
//   size: floor(480 · 0.62) px, shrinking by 4 px until the INK width ≤ 0.86 · 1024; centred
//   on the ink box; white on black. The worker blurs (never ctx.filter, which Safari lacks).

import { GEOLOGICA_CHARS, SPRAT_CHARS } from './sprat-charset'

export const RASTER_W = 1024
export const RASTER_H = 480
export const MAX_CHARS = 10

export type WordFace = 'wordmark' | 'sprat' | 'sprat-condensed' | 'geologica'
export type RasterFamily = 'SpratWordmark' | 'SpratRaster' | 'SpratRasterCondensed' | 'SpratRasterExtended'

const FACE_URL: Readonly<Record<RasterFamily, string>> = {
  SpratWordmark: '/fonts/Sprat-Wordmark.ttf',
  SpratRaster: '/fonts/Sprat-RegularMedium.otf',
  SpratRasterCondensed: '/fonts/Sprat-CondensedMedium.otf',
  SpratRasterExtended: '/fonts/Sprat-ExtendedLight.otf',
}

const FAMILY_OF: Readonly<Record<Exclude<WordFace, 'geologica'>, RasterFamily>> = {
  wordmark: 'SpratWordmark',
  sprat: 'SpratRaster',
  'sprat-condensed': 'SpratRasterCondensed',
}

const LETTER = /^[\p{L}\p{N} ]$/u

/** Which face writes this word in light; null when the word cannot be written (5.5 validation). */
export function wordFace(word: string): WordFace | null {
  const w = word.normalize('NFC')
  if (w === 'aslant') return 'wordmark'
  if (w.trim().length === 0) return null
  const chars = Array.from(w)
  if (chars.length > MAX_CHARS) return null
  let allSprat = true
  for (const ch of chars) {
    if (!LETTER.test(ch)) return null
    const cp = ch.codePointAt(0) as number
    if (SPRAT_CHARS.has(cp)) continue
    allSprat = false
    if (!GEOLOGICA_CHARS.has(cp)) return null
  }
  if (!allSprat) return 'geologica'
  return chars.length <= 7 ? 'sprat' : 'sprat-condensed'
}

// ── FontFaces ─────────────────────────────────────────────────────────────────
const faceLoads = new Map<RasterFamily, Promise<void>>()

/** Loads one static raster face into document.fonts (once). SpratRasterExtended is for save-image. */
export function ensureFontFace(family: RasterFamily): Promise<void> {
  const hit = faceLoads.get(family)
  if (hit) return hit
  if (typeof document === 'undefined' || typeof FontFace === 'undefined') return Promise.resolve()
  const face = new FontFace(family, `url(${FACE_URL[family]})`, { display: 'block' })
  document.fonts.add(face)
  const p = face.load().then(
    () => undefined,
    (err: unknown) => {
      faceLoads.delete(family) // a later call may retry
      document.fonts.delete(face)
      throw err
    },
  )
  faceLoads.set(family, p)
  return p
}

let ready: Promise<void> | null = null

/** SpratRaster, SpratRasterCondensed and SpratWordmark loaded (boot.ts counts it toward fonts). */
export function rasterReady(): Promise<void> {
  if (ready) return ready
  if (typeof document === 'undefined') return Promise.resolve()
  ready = Promise.all([ensureFontFace('SpratRaster'), ensureFontFace('SpratRasterCondensed'), ensureFontFace('SpratWordmark')]).then(
    () => undefined,
    (err: unknown) => {
      ready = null
      throw err
    },
  )
  return ready
}

/** Geologica's generated family names, extended subset first (3.2), read from <body>. */
export function geologicaFamilies(): string {
  if (typeof document === 'undefined') return 'sans-serif'
  const cs = getComputedStyle(document.body)
  const ext = cs.getPropertyValue('--font-geologica-ext').trim()
  const lat = cs.getPropertyValue('--font-geologica').trim()
  const list = [ext, lat].filter(Boolean).join(', ')
  return list ? `${list}, sans-serif` : 'sans-serif'
}

/** The CSS font shorthand (minus the size) that draws this face in a canvas. */
export async function faceFont(face: WordFace, word: string): Promise<(px: number) => string> {
  if (face === 'geologica') {
    const fam = geologicaFamilies()
    await document.fonts.load(`600 200px ${fam}`, word)
    return (px) => `600 ${px}px ${fam}`
  }
  const fam = FAMILY_OF[face]
  await ensureFontFace(fam)
  return (px) => `${px}px ${fam}`
}

// ── the raster ────────────────────────────────────────────────────────────────
let ctx2d: CanvasRenderingContext2D | null = null

function context(): CanvasRenderingContext2D {
  if (ctx2d) return ctx2d
  const c = document.createElement('canvas')
  c.width = RASTER_W
  c.height = RASTER_H
  const ctx = c.getContext('2d', { willReadFrequently: true, alpha: false })
  if (!ctx) throw new Error('2D canvas unavailable')
  ctx2d = ctx
  return ctx
}

export interface RasterInfo {
  face: WordFace
  size: number
  inkW: number
  inkH: number
  ms: number
}

let lastInfo: RasterInfo | null = null
/** Size and timing of the last raster (QA). */
export function lastRasterInfo(): RasterInfo | null {
  return lastInfo
}

const START_PX = Math.floor(RASTER_H * 0.62)
const MAX_INK = 0.86 * RASTER_W

/** Largest size in floor(480 · 0.62), − 4, − 8, … whose ink (inkPerPx · size) fits 0.86 · 1024. */
function fitSize(inkPerPx: number): number {
  let s = START_PX
  while (s > 8 && inkPerPx * s > MAX_INK) s -= 4
  return s
}

interface PixelBox { x0: number; x1: number; y0: number; y1: number }

/** Bounds of the lit pixels (red > 0), x1 and y1 exclusive; null when nothing is lit. */
function litBounds(d: Uint8ClampedArray): PixelBox | null {
  const W = RASTER_W
  const H = RASTER_H
  let y0 = -1
  for (let y = 0; y < H && y0 < 0; y++) {
    const row = y * W * 4
    for (let x = 0; x < W; x++) if (d[row + 4 * x] > 0) { y0 = y; break }
  }
  if (y0 < 0) return null
  let y1 = y0 + 1
  for (let y = H - 1; y > y0; y--) {
    const row = y * W * 4
    let lit = false
    for (let x = 0; x < W; x++) if (d[row + 4 * x] > 0) { lit = true; break }
    if (lit) { y1 = y + 1; break }
  }
  let x0 = 0
  for (let x = 0; x < W; x++) {
    let lit = false
    for (let y = y0; y < y1; y++) if (d[(y * W + x) * 4] > 0) { lit = true; break }
    if (lit) { x0 = x; break }
  }
  let x1 = x0 + 1
  for (let x = W - 1; x > x0; x--) {
    let lit = false
    for (let y = y0; y < y1; y++) if (d[(y * W + x) * 4] > 0) { lit = true; break }
    if (lit) { x1 = x + 1; break }
  }
  return { x0, x1, y0, y1 }
}

/**
 * Draws the word into the 1024 × 480 raster and returns its RGBA pixels (red = density).
 * Size and centring follow the INK box (6.1.1). The browser's actualBoundingBox* gives it in
 * Chrome; WebKit reports the advance box there, so the drawn pixels are checked and, when they
 * disagree by more than antialiasing, the word is redrawn at the size and position its real ink
 * asks for (ink scales linearly with size). The buffer is fresh on every call (transferable).
 */
export async function rasterWord(word: string): Promise<Uint8ClampedArray> {
  const w = word.normalize('NFC')
  const face = wordFace(w)
  if (!face) throw new Error('This word cannot be written in light.')
  const fontAt = await faceFont(face, w)
  const t0 = performance.now()
  const ctx = context()
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.globalAlpha = 1
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  const draw = (px: number, x: number, y: number): Uint8ClampedArray => {
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, RASTER_W, RASTER_H)
    ctx.font = fontAt(px)
    ctx.fillStyle = '#fff'
    ctx.fillText(w, x, y)
    return ctx.getImageData(0, 0, RASTER_W, RASTER_H).data
  }

  // 1. The browser's ink metrics.
  let size = START_PX
  let m: TextMetrics
  for (;;) {
    ctx.font = fontAt(size)
    m = ctx.measureText(w)
    if (m.actualBoundingBoxLeft + m.actualBoundingBoxRight <= MAX_INK || size <= 8) break
    size -= 4
  }
  let inkW = m.actualBoundingBoxLeft + m.actualBoundingBoxRight
  let inkH = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent
  let x = (RASTER_W - inkW) / 2 + m.actualBoundingBoxLeft
  let y = (RASTER_H - inkH) / 2 + m.actualBoundingBoxAscent
  let data = draw(size, x, y)

  // 2. Check against the lit pixels (about half a pixel of antialiased fringe on each side).
  for (let attempt = 0; attempt < 3; attempt++) {
    const b = litBounds(data)
    if (!b) break
    if (b.x0 === 0 || b.x1 === RASTER_W || b.y0 === 0 || b.y1 === RASTER_H) {
      // Clipped: the metrics were far off. Shrink and look again.
      size = Math.max(8, Math.round(size * 0.8))
      x = RASTER_W * 0.07
      y = RASTER_H * 0.7
      data = draw(size, x, y)
      continue
    }
    const pw = Math.max(1, b.x1 - b.x0 - 1)
    const ph = Math.max(1, b.y1 - b.y0 - 1)
    const s2 = fitSize(pw / size)
    const k = s2 / size
    const left = (b.x0 + 0.5 - x) * k
    const top = (b.y0 + 0.5 - y) * k
    const x2 = (RASTER_W - pw * k) / 2 - left
    const y2 = (RASTER_H - ph * k) / 2 - top
    if (s2 === size && Math.abs(x2 - x) <= 0.75 && Math.abs(y2 - y) <= 0.75) break
    size = s2
    x = x2
    y = y2
    inkW = pw * k
    inkH = ph * k
    data = draw(size, x, y)
  }
  lastInfo = { face, size, inkW, inkH, ms: performance.now() - t0 }
  return data
}
