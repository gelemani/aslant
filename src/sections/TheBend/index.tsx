import { LightAnchor } from '@/components/LightAnchor'
import { Readout } from '@/components/Readout'
import { fmtDeg } from '@/lib/format'
import { photonsPer100 } from '@/lib/light/glass'
import {
  BLUE_NM,
  LAYOUT_SPLIT,
  RED_NM,
  centralRay,
  clearIndexAt,
  rayAnglesDeg,
  sliceFromSlope,
  traceBench,
} from '@/lib/bench/trace'
import { aslantRelief } from '@/sections/ClearGlass/relief.server'
import { BenchFigure, BenchReadouts } from './BenchFigure'
import styles from './styles.module.css'

/** Beat 2 values for the central ray, computed on the server from the same relief (no JS, Still air, Overcast). */
function centralAngles(): { inDeg: number; outDeg: number } {
  const relief = aslantRelief()
  if (!relief) return { inDeg: 0, outDeg: 0 }
  const t = traceBench({
    slice: sliceFromSlope(relief.slope),
    layout: LAYOUT_SPLIT,
    w: 1440,
    h: 486,
    tier: 3,
    relief: 1,
    fan: 0,
    picked: -1,
  })
  return rayAnglesDeg(t.alpha[centralRay(t.rays)])
}

/**
 * 12:50 · the optical bench (brief 5.3, 6.3). A 150svh section with a sticky frame: the text
 * band on top, the bench band (drawn by the compositor's bench mode and BenchPass) below it.
 * Beats follow the exact scroll. Still air, Overcast and no JS lay the beats out as a list
 * above the bench poster, with the beat 2 and beat 3 readouts side by side.
 */
export default function TheBend() {
  const central = centralAngles()
  const blue = `n ${clearIndexAt(BLUE_NM).toFixed(4)}`
  const red = `n ${clearIndexAt(RED_NM).toFixed(4)}`
  const zero = fmtDeg(0, 2)

  return (
    <section id="the-bend" data-chapter="the-bend" aria-labelledby="the-bend-title" className={styles.section}>
      <div className={styles.frame} data-sticky-frame="" data-beat="1">
        <div className={`grid ${styles.band}`} data-bench-text="">
          <div className={styles.titleBox} data-scrim="live">
            <h2 id="the-bend-title" className={`t-h2 ${styles.title}`} tabIndex={-1}>
              Light bends where the surface tilts.
            </h2>
          </div>
          <div className={styles.beatBox} data-scrim="live">
            <ol className={styles.beats}>
              <li className={styles.beat} data-beat-item="1">
                <p className="t-body">Through flat glass, light keeps its course.</p>
              </li>
              <li className={styles.beat} data-beat-item="2">
                <p className="t-body">
                  Tilt the surface a few degrees and each ray leaves at a new angle. Where rays crowd, the wall is
                  bright. Where they part, it goes dark.
                </p>
                <p className={`t-caption ${styles.small}`}>
                  Glass makes no light of its own. Of every 100 photons, {photonsPer100('clear')} reach the wall; its
                  two faces reflect the rest.
                </p>
              </li>
              <li className={styles.beat} data-beat-item="3">
                <p className="t-body">
                  Sunlight is every colour at once. Glass bends blue a little more than red, so each bright edge
                  carries a thin spectrum.
                </p>
              </li>
            </ol>
          </div>
          <div className={styles.readBox} data-scrim="live">
            <BenchReadouts central={central} blue={blue} red={red} zero={zero} />
            <div className={`${styles.readouts} ${styles.staticOnly}`}>
              <Readout label="Angle in" value={fmtDeg(central.inDeg, 2)} minCh={7} />
              <Readout label="Angle out" value={fmtDeg(central.outDeg, 2)} minCh={7} />
              <Readout label={`Blue, ${BLUE_NM} nm`} value={blue} minCh={7} />
              <Readout label={`Red, ${RED_NM} nm`} value={red} minCh={7} />
            </div>
          </div>
        </div>

        <div className={styles.stage}>
          <LightAnchor chapter="the-bend" kind="bench" className={styles.anchor} />
          <BenchFigure />
          {/* A static poster (the beat 3 view) for Overcast, Still air and no JS. */}
          <picture>
            <img className={styles.poster} src="/posters/bench.webp" alt="" loading="lazy" decoding="async" />
          </picture>
          <p className={`t-caption ${styles.scaleNote}`} data-scrim="live">
            Relief drawn 40 times deeper than it is.
          </p>
          <p className={`t-caption ${styles.wallCaption}`} data-scrim="live">
            A slice through the pane you just looked at, along one line of the word.
          </p>
        </div>
      </div>
    </section>
  )
}
