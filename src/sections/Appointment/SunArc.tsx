import { INGRID, sunPath } from '@/lib/light/sun'
import { fmtClock } from '@/lib/format'
import { appointmentFacts, sunAtMinute, START_HOUR, DESIGN_MINUTE } from './time'
import { ARC, arcX, arcY } from './arc-geometry'
import styles from './styles.module.css'

const fmt = (n: number) => n.toFixed(1)

function polyline(pts: ReadonlyArray<readonly [number, number]>): string {
  return pts.map(([az, alt]) => `${fmt(arcX(az))},${fmt(arcY(alt))}`).join(' ')
}

/**
 * The sun's path over Copenhagen on 21 June 2026 (5.4), a data graphic rendered at SSR from sun.ts:
 * altitude against azimuth from sunrise to sunset, the horizon, the in-focus minutes as a 2 px sun stroke,
 * and a 6 px dot at the scrubbed minute (moved by the controller through a transform, no re-render).
 */
export function SunArc() {
  const facts = appointmentFacts()
  const path = sunPath(INGRID.city, INGRID.date, 4)
  const m0 = Math.round((facts.windowStart - START_HOUR) * 60)
  const m1 = Math.round((facts.windowEnd - START_HOUR) * 60)
  const focus: Array<[number, number]> = []
  for (let m = m0; m <= m1; m++) {
    const p = sunAtMinute(m)
    focus.push([p.azimuth, p.altitude])
  }
  const dot = sunAtMinute(DESIGN_MINUTE)
  const label = `The sun's path over Copenhagen on 21 June. The word is in focus from ${fmtClock(facts.windowStart)} to ${fmtClock(facts.windowEnd)}.`
  const axis: Array<[string, number]> = [
    ['East', 90],
    ['South', 180],
    ['West', 270],
  ]

  return (
    <figure className={styles.arc} role="img" aria-label={label}>
      <div className={styles.arcPlot}>
        <svg
          className={styles.arcSvg}
          viewBox={`0 0 ${ARC.w} ${ARC.h}`}
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <line className={styles.arcHorizon} x1={0} x2={ARC.w} y1={arcY(0)} y2={arcY(0)} />
          <polyline className={styles.arcPath} points={polyline(path)} />
          <polyline className={styles.arcFocus} points={polyline(focus)} />
        </svg>
        <div
          className={styles.arcDotTrack}
          data-arc-dot=""
          style={{ transform: `translate(${fmt((arcX(dot.azimuth) / ARC.w) * 100)}%, ${fmt((arcY(dot.altitude) / ARC.h) * 100)}%)` }}
          aria-hidden="true"
        >
          <span className={styles.arcDot} />
        </div>
      </div>
      <div className={styles.arcAxis} aria-hidden="true">
        {axis.map(([word, az]) => (
          <span key={word} className="t-caption" style={{ left: `${fmt((arcX(az) / ARC.w) * 100)}%` }}>
            {word}
          </span>
        ))}
      </div>
    </figure>
  )
}

export default SunArc
