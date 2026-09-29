'use client'

// The relief contour map (brief 5.5; a data graphic, 2.4): the visitor's pane seen from the
// front, one contour every 0.2 mm of surface height, drawn from the worker's height field
// (128 × 64 mm above the lowest point, rows top to bottom) with marching squares.
// Redrawn only when the field or the glass scale changes; never per frame.

import { useEffect, useRef } from 'react'

export interface ContourMapProps {
  /** Heights in mm (w × h, rows top to bottom), or null while the first relief computes. */
  height: Float32Array | null
  w: number
  h: number
  /** Pane aspect (width / height), 300 / 140.625 for the default pane. */
  aspect: number
  /** Relief scale for the chosen glass (Clear 1; Prismatic 0.4917 / (n_d − 1)). */
  scale: number
  className?: string
}

const CSS_W = 180
const CSS_H = 90
const STEP_MM = 0.2
const LINE = 'rgba(188, 195, 190, 0.55)' // --c-dust
const INDEX = 'rgba(236, 230, 217, 0.9)' // --c-lime, every 1 mm
const FRAME = '#5B6361' // --c-line

function draw(canvas: HTMLCanvasElement, props: ContourMapProps) {
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  const bw = Math.round(CSS_W * dpr)
  const bh = Math.round(CSS_H * dpr)
  if (canvas.width !== bw) canvas.width = bw
  if (canvas.height !== bh) canvas.height = bh
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, CSS_W, CSS_H)

  // The pane, width-limited, centred vertically.
  const pw = CSS_W - 1
  const ph = Math.min(CSS_H - 1, pw / props.aspect)
  const ox = 0.5
  const oy = 0.5 + (CSS_H - 1 - ph) / 2
  ctx.lineWidth = 1
  ctx.strokeStyle = FRAME
  ctx.strokeRect(ox, oy, pw, ph)

  const { height, w, h, scale } = props
  if (!height || w < 2 || h < 2) return
  let max = 0
  for (let i = 0; i < height.length; i++) if (height[i] > max) max = height[i]
  max *= scale
  const sx = pw / (w - 1)
  const sy = ph / (h - 1)
  ctx.lineWidth = 0.75
  ctx.lineJoin = 'round'

  const levels = Math.floor(max / STEP_MM)
  for (let k = 1; k <= levels; k++) {
    const L = (k * STEP_MM) / scale // compare in the field's own (Clear) units
    ctx.beginPath()
    for (let j = 0; j < h - 1; j++) {
      const r0 = j * w
      const r1 = r0 + w
      for (let i = 0; i < w - 1; i++) {
        const a = height[r0 + i]
        const b = height[r0 + i + 1]
        const c = height[r1 + i + 1]
        const d = height[r1 + i]
        const idx = (a > L ? 8 : 0) | (b > L ? 4 : 0) | (c > L ? 2 : 0) | (d > L ? 1 : 0)
        if (idx === 0 || idx === 15) continue
        // Edge crossings in cell units: top (a-b), right (b-c), bottom (d-c), left (a-d).
        const x = ox + i * sx
        const y = oy + j * sy
        const top = () => [x + ((L - a) / (b - a)) * sx, y] as const
        const right = () => [x + sx, y + ((L - b) / (c - b)) * sy] as const
        const bottom = () => [x + ((L - d) / (c - d)) * sx, y + sy] as const
        const left = () => [x, y + ((L - a) / (d - a)) * sy] as const
        const seg = (p: readonly [number, number], q: readonly [number, number]) => {
          ctx.moveTo(p[0], p[1])
          ctx.lineTo(q[0], q[1])
        }
        switch (idx) {
          case 1:
          case 14:
            seg(left(), bottom())
            break
          case 2:
          case 13:
            seg(bottom(), right())
            break
          case 3:
          case 12:
            seg(left(), right())
            break
          case 4:
          case 11:
            seg(top(), right())
            break
          case 6:
          case 9:
            seg(top(), bottom())
            break
          case 7:
          case 8:
            seg(left(), top())
            break
          case 5:
            seg(left(), top())
            seg(bottom(), right())
            break
          case 10:
            seg(top(), right())
            seg(left(), bottom())
            break
        }
      }
    }
    ctx.strokeStyle = k % 5 === 0 ? INDEX : LINE
    ctx.stroke()
  }
}

export function ContourMap(props: ContourMapProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const { height, w, h, aspect, scale } = props

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    draw(canvas, { height, w, h, aspect, scale })
  }, [height, w, h, aspect, scale])

  return <canvas ref={ref} className={props.className} width={CSS_W} height={CSS_H} aria-hidden="true" />
}

export default ContourMap
