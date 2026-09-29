// The live mark (brief 4.5, 4.13): one afterScroll listener, installed by the conductor,
// derives the nav mark's skew, length and warmth from the page's light and mirrors them
// into every <NavMark>, the SVG favicon (at most once per second) and the theme colour
// (at most four times per second). Writes only; it never reads layout.
import { onAfterScroll } from '@/lib/frame'
import { light } from '@/lib/light-state'
import { linearToHex, srgbHexToLinear } from '@/lib/color'
import { HEX, markLength } from '@/lib/world-spec'

export interface MarkState {
  /** Patch skew, clamped 0.05 to 0.9. */
  skew: number
  /** 0.55 at noon to 1.0 at dusk. */
  len: number
  /** Sun colour as sRGB hex; #5B6361 when the sun is off. */
  color: string
}

const HERO_HOUR = 8 + 10 / 60
/** The first frame's values (08:10): also what SSR renders. */
export const MARK_DEFAULT: Readonly<MarkState> = Object.freeze({ skew: 0.2, len: markLength(HERO_HOUR), color: '#FFE3C4' })

export const mark: MarkState = { ...MARK_DEFAULT }
const listeners = new Set<(m: Readonly<MarkState>) => void>()

/** Subscribes a mark renderer; it is called at once and on every change. */
export function onMark(fn: (m: Readonly<MarkState>) => void): () => void {
  listeners.add(fn)
  fn(mark)
  return () => {
    listeners.delete(fn)
  }
}

/** Polygon points for a parallelogram in a W × H box with a margin. */
export function markPoints(m: Readonly<MarkState>, W = 28, H = 16, pad = 1.5): string {
  const h = H - 2 * pad
  const maxW = W - 2 * pad
  const w = Math.max(h * 0.4, maxW * m.len)
  const k = Math.min(w - 1, m.skew * h)
  const x0 = (W - w) / 2
  const f = (n: number) => n.toFixed(2)
  return `${f(x0)},${f(pad)} ${f(x0 + w - k)},${f(pad)} ${f(x0 + w)},${f(pad + h)} ${f(x0 + k)},${f(pad + h)}`
}

function faviconSvg(m: Readonly<MarkState>): string {
  // icon.svg geometry: a 32 × 32 shade square, the parallelogram 12 high between y 10 and 22.
  const h = 12
  const w = Math.max(10, 22 * m.len)
  const k = Math.min(w - 2, m.skew * h)
  const x0 = 16 - w / 2
  const f = (n: number) => n.toFixed(1)
  const pts = `${f(x0)},10 ${f(x0 + w - k)},10 ${f(x0 + w)},22 ${f(x0 + k)},22`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32"><rect width="32" height="32" fill="${HEX.shade}"/><polygon points="${pts}" fill="${m.color}"/></svg>`
}

let installed = 0
let uninstall: (() => void) | null = null

export function installLiveMark(): () => void {
  installed++
  if (installed === 1 && typeof document !== 'undefined') {
    let lastRgb: [number, number, number] = srgbHexToLinear(mark.color)
    let faviconDirty = false
    let faviconAt = -1
    let themeHex = ''
    let themeAt = -1
    let icon: HTMLLinkElement | null = null
    let meta: HTMLMetaElement | null = null

    const findIcon = () => {
      if (icon && icon.isConnected) return icon
      icon = document.querySelector<HTMLLinkElement>('link[rel="icon"][type="image/svg+xml"]')
      if (!icon) {
        icon = document.createElement('link')
        icon.rel = 'icon'
        icon.type = 'image/svg+xml'
        document.head.appendChild(icon)
      }
      return icon
    }
    const findMeta = () => {
      if (meta && meta.isConnected) return meta
      meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
      if (!meta) {
        meta = document.createElement('meta')
        meta.name = 'theme-color'
        document.head.appendChild(meta)
      }
      return meta
    }

    const off = onAfterScroll(function liveMark(t) {
      // ── the mark ──
      const sunOn = light.patch.on * light.sun.e > 0.05
      const skew = Math.min(0.9, Math.max(0.05, light.patch.skew))
      const len = markLength(light.hour)
      const rgb: [number, number, number] = sunOn ? [light.sun.r, light.sun.g, light.sun.b] : srgbHexToLinear(HEX.markOff)
      const rel = (a: number, b: number) => Math.abs(a - b) / Math.max(1e-3, Math.abs(b))
      const colourMoved = Math.abs(rgb[0] - lastRgb[0]) > 0.01 || Math.abs(rgb[1] - lastRgb[1]) > 0.01 || Math.abs(rgb[2] - lastRgb[2]) > 0.01
      if (rel(skew, mark.skew) > 0.01 || rel(len, mark.len) > 0.01 || colourMoved) {
        mark.skew = skew
        mark.len = len
        if (colourMoved) {
          lastRgb = rgb
          mark.color = sunOn ? linearToHex(rgb) : HEX.markOff
        }
        for (const fn of listeners) fn(mark)
        faviconDirty = true
      }
      // ── favicon: at most once per second, only when a value changed ──
      if (faviconDirty && (faviconAt < 0 || t - faviconAt >= 1.05)) {
        faviconDirty = false
        faviconAt = t
        findIcon().href = `data:image/svg+xml,${encodeURIComponent(faviconSvg(mark))}`
      }
      // ── theme colour: the unlit wall, at most four times per second ──
      if (themeAt < 0 || t - themeAt >= 0.26) {
        const hex = linearToHex([light.shade.r, light.shade.g, light.shade.b])
        if (hex !== themeHex && light.shade.r + light.shade.g + light.shade.b > 0) {
          themeHex = hex
          themeAt = t
          findMeta().content = hex
        }
      }
    })
    uninstall = () => {
      off()
    }
  }
  return () => {
    installed--
    if (installed === 0 && uninstall) {
      uninstall()
      uninstall = null
    }
  }
}
