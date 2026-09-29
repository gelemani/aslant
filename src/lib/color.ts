// sRGB hex <-> linear-light RGB (brief 3.1.3). Shaders read token colours through
// these helpers, never through THREE.Color (the canvas runs `linear` and `flat`).
// Pure and dependency-free, so world-spec and node tests can import it.

export type RGB = [number, number, number]

/** sRGB transfer (0..1 encoded) to linear light. */
export function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

/** Linear light to sRGB transfer (0..1 encoded). */
export function linearToSrgb(c: number): number {
  const v = Math.min(1, Math.max(0, c))
  return v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055
}

/** "#FFE1A6" or "FFE1A6" (or 3-digit) to linear RGB, each 0..1. */
export function srgbHexToLinear(hex: string): RGB {
  let h = hex.trim().replace(/^#/, '')
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
  const n = parseInt(h.slice(0, 6), 16)
  if (Number.isNaN(n)) return [0, 0, 0]
  return [srgbToLinear(((n >> 16) & 255) / 255), srgbToLinear(((n >> 8) & 255) / 255), srgbToLinear((n & 255) / 255)]
}

/** Linear RGB to "#RRGGBB" (uppercase, clamped). */
export function linearToHex(rgb: Readonly<RGB> | ArrayLike<number>): string {
  let out = '#'
  for (let i = 0; i < 3; i++) {
    const v = Math.round(linearToSrgb(rgb[i]) * 255)
    out += v.toString(16).padStart(2, '0')
  }
  return out.toUpperCase()
}

/** Linear interpolation of two linear-light colours. */
export function mixLinear(a: Readonly<RGB> | ArrayLike<number>, b: Readonly<RGB> | ArrayLike<number>, t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

/** Mix two sRGB hex colours in linear light and return hex. */
export function mixHex(a: string, b: string, t: number): string {
  return linearToHex(mixLinear(srgbHexToLinear(a), srgbHexToLinear(b), t))
}

/** WCAG 2.x relative luminance of a linear RGB colour. */
export function relativeLuminance(rgb: Readonly<RGB> | ArrayLike<number>): number {
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]
}

/** WCAG 2.x contrast ratio of two sRGB hex colours. */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(srgbHexToLinear(a))
  const lb = relativeLuminance(srgbHexToLinear(b))
  const hi = Math.max(la, lb)
  const lo = Math.min(la, lb)
  return (hi + 0.05) / (lo + 0.05)
}
