import { LightAnchor } from '@/components/LightAnchor'
import { LightSweep } from '@/components/LightSweep'
import { fmtClock, fmtDeg } from '@/lib/format'
import { INGRID } from '@/lib/light/sun'
import { Clock } from './Clock'
import { SunArc } from './SunArc'
import { Controller } from './Controller'
import { appointmentFacts, START_HOUR, SPAN_MINUTES } from './time'
import styles from './styles.module.css'

/**
 * 16:12 to 17:08 · scroll is time (brief 5.4). A 160svh section with a 100svh sticky frame (no pin):
 * a full-width wall clock over a mirrored split, the light on the left, the text on the right.
 * Every number is computed by sun.ts at render time; the controller scrubs the minutes.
 */
export default function Appointment() {
  const facts = appointmentFacts()
  const at = fmtClock(INGRID.hour)
  const from = fmtClock(START_HOUR)
  const to = fmtClock(START_HOUR + SPAN_MINUTES / 60)

  return (
    <section id="appointment" data-chapter="appointment" aria-labelledby="appointment-title" className={styles.section}>
      <div className={styles.frame} data-sticky-frame="">
        <LightAnchor chapter="appointment" word="Ingrid" className={styles.anchor} />

        <div className={styles.clockBand} data-scrim="live">
          <Clock />
        </div>

        <div className={styles.instrument} data-scrim="live">
          <SunArc />
          <p className={`${styles.arcLabel} t-caption`}>
            In focus {fmtClock(facts.windowStart)} to {fmtClock(facts.windowEnd)}
          </p>
          <p className={`${styles.readout} t-value`}>
            <span className={styles.readoutWord}>Sun </span>
            <span className={styles.readoutNum} data-readout="alt">
              {fmtDeg(facts.altitude, 1)}
            </span>
            <span className={styles.readoutWord}> high, bearing </span>
            <span className={styles.readoutNum} data-readout="az">
              {fmtDeg(facts.azimuth, 0)}
            </span>
          </p>
        </div>

        <div className={styles.text} data-scrim="live">
          <LightSweep as="h2" angle={118} id="appointment-title" className={`t-h2 ${styles.title}`}>
            The word keeps one appointment a day.
          </LightSweep>
          <p className={`${styles.sub} t-lead`}>
            A pane is shaped for one direction of sunlight. Before its hour the light is loose. After, it moves on.
          </p>
          <p className="visually-hidden">
            The clock on the wall runs from {from} to {to} as you scroll.
          </p>
          <div className={styles.lines}>
            <p className={`${styles.line} t-body`} data-line="a">
              Every afternoon at {at}, the kitchen wall says her name.
            </p>
            <p className={`${styles.line} t-body`} data-line="b">
              Tuned to midsummer, the word returns every afternoon for about {facts.summerWeeks} weeks. Tuned to an
              equinox, for about {facts.equinoxWeeks}.
            </p>
          </div>
        </div>

        <p className={`${styles.caption} t-caption`} data-scrim="live">
          This pane says Ingrid at {at}, the minute she was born. Copenhagen, a window facing west-south-west.
        </p>
      </div>
      <Controller />
    </section>
  )
}
