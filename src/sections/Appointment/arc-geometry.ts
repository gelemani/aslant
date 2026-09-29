// Plot geometry of the sun-path arc (5.4), shared by the SSR figure and the live dot.
// x: azimuth 40° to 320°; y: altitude 0° to 58°. The SVG is stretched to its box (non-scaling strokes),
// so the dot is placed in percent of the plot and stays round.
export const ARC = { w: 360, h: 110, az0: 40, az1: 320, alt1: 58, padTop: 3, padBottom: 1 } as const

export function arcX(azimuth: number): number {
  return ((azimuth - ARC.az0) / (ARC.az1 - ARC.az0)) * ARC.w
}

export function arcY(altitude: number): number {
  const inner = ARC.h - ARC.padTop - ARC.padBottom
  return ARC.h - ARC.padBottom - (altitude / ARC.alt1) * inner
}
