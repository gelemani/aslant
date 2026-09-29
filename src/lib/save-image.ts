// "Save the image" (brief 6.4.4): a designed 1080 × 1350 artifact. The square render comes
// from our own renderer (stageApi.renderStill); this module sets the caption bar under it
// and hands the PNG to the visitor as aslant-<word>.png.
//   bar: 270 px of #3A4142 (the wall in shade), 64 px left margin
//   the word: SpratRasterExtended 64 px #ECE6D9 (Geologica 600 for a word outside Sprat, 3.2)
//   two lines in Geologica 26 px #BCC3BE: "{City}. Arrives {16:40}, holds about {20} minutes."
//                                          "{26 May} to {19 July}."
//   bottom right: the wordmark `aslant`, SpratWordmark 30 px #ECE6D9 (the one wordmark drawing, 1.1)

import { ensureFontFace, geologicaFamilies, wordFace } from '@/lib/caustics/raster'

export const IMAGE_W = 1080
export const IMAGE_H = 1350
const RENDER_H = 1080
const MARGIN = 64
const SHADE = '#3A4142'
const LIME = '#ECE6D9'
const DUST = '#BCC3BE'

export interface SaveImageInput {
  /** The square render (any size; drawn to 1080 × 1080). */
  still: ImageData
  word: string
  city: string
  /** "16:40" */
  arrives: string
  minutes: number
  /** "26 May" */
  from: string
  /** "19 July" */
  to: string
}

/** aslant-<word>.png: the word lowercased, spaces to hyphens. */
export function imageFileName(word: string): string {
  const slug = word.normalize('NFC').trim().toLowerCase().replace(/\s+/g, '-')
  return `aslant-${slug || 'word'}.png`
}

async function stillToCanvas(still: ImageData): Promise<CanvasImageSource> {
  const c = document.createElement('canvas')
  c.width = still.width
  c.height = still.height
  const ctx = c.getContext('2d')
  if (!ctx) throw new Error('2D canvas unavailable')
  ctx.putImageData(still, 0, 0)
  return c
}

/** Composes the artifact and resolves with its PNG blob. */
export async function composeImage(input: SaveImageInput): Promise<Blob> {
  const word = input.word.normalize('NFC').trim()
  const geo = geologicaFamilies()
  const wordIsGeologica = wordFace(word) === 'geologica'
  const lines = [`${input.city}. Arrives ${input.arrives}, holds about ${input.minutes} minutes.`, `${input.from} to ${input.to}.`]

  await Promise.all([
    ensureFontFace('SpratWordmark'),
    wordIsGeologica ? document.fonts.load(`600 64px ${geo}`, word) : ensureFontFace('SpratRasterExtended'),
    document.fonts.load(`380 26px ${geo}`, lines.join(' ')),
  ])

  const canvas = document.createElement('canvas')
  canvas.width = IMAGE_W
  canvas.height = IMAGE_H
  const ctx = canvas.getContext('2d', { alpha: false })
  if (!ctx) throw new Error('2D canvas unavailable')

  // The render, then the caption bar: the same wall in shade.
  ctx.fillStyle = SHADE
  ctx.fillRect(0, 0, IMAGE_W, IMAGE_H)
  ctx.drawImage(await stillToCanvas(input.still), 0, 0, IMAGE_W, RENDER_H)
  ctx.fillStyle = SHADE
  ctx.fillRect(0, RENDER_H, IMAGE_W, IMAGE_H - RENDER_H)

  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'

  // The wordmark first, so the word knows how much room it has.
  ctx.font = '30px SpratWordmark'
  const markW = ctx.measureText('aslant').width
  const baseLast = 1276

  // The visitor's word, shrunk only if it would run into the mark.
  let size = 64
  const wordFont = (px: number) => (wordIsGeologica ? `600 ${px}px ${geo}` : `${px}px SpratRasterExtended`)
  const maxWordW = IMAGE_W - 2 * MARGIN - markW - 48
  ctx.font = wordFont(size)
  while (ctx.measureText(word).width > maxWordW && size > 32) {
    size -= 2
    ctx.font = wordFont(size)
  }
  ctx.fillStyle = LIME
  ctx.fillText(word, MARGIN, 1188)

  ctx.font = `380 26px ${geo}`
  ctx.fillStyle = DUST
  ctx.fillText(lines[0], MARGIN, 1238)
  ctx.fillText(lines[1], MARGIN, baseLast)

  ctx.font = '30px SpratWordmark'
  ctx.fillStyle = LIME
  ctx.textAlign = 'right'
  ctx.fillText('aslant', IMAGE_W - MARGIN, baseLast)

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob returned nothing'))), 'image/png')
  })
}

/** Downloads a blob under a file name (an object URL on a temporary link). */
export function downloadBlob(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.rel = 'noopener'
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
}

/** Composes the artifact and downloads it as aslant-<word>.png. */
export async function saveImage(input: SaveImageInput): Promise<void> {
  const blob = await composeImage(input)
  downloadBlob(blob, imageFileName(input.word))
}
