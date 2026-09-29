import { LightAnchor } from '@/components/LightAnchor'
import { LightSweep } from '@/components/LightSweep'
import { fmtDeg } from '@/lib/format'
import { LoupeControls, LoupeDisc } from './Loupe'
import { aslantRelief } from './relief.server'
import styles from './styles.module.css'

function Hint({ className }: { className: string }) {
  return (
    <p className={`t-caption ${styles.hint} ${className}`}>
      <span className="fine-only">Move the loupe over the glass.</span>
      <span className="coarse-only">Drag the loupe over the glass.</span>
    </p>
  )
}

/**
 * 10:30 · the loupe (brief 5.2, 6.2). The pane stands in the studio's test frame; the
 * compositor's pane mode draws it behind the glass anchor. Everything the loupe shows has
 * a DOM twin here: the relief toggle, its caption and the two readouts. Overcast, Still
 * air and no JS show the relief poster with the caption and no toggle.
 */
export default function ClearGlass() {
  const relief = aslantRelief()
  const maxSlope = relief ? fmtDeg(relief.maxSlopeDeg, 2) : ''
  const maxTurn = relief ? fmtDeg(relief.maxTurnDeg, 2) : ''

  return (
    <section id="clear-glass" data-chapter="clear-glass" aria-labelledby="clear-glass-title" className={styles.section}>
      <LightAnchor chapter="clear-glass" kind="pane" className={styles.glass} />
      <div className={styles.glass} data-glass-layer="">
        <picture>
          <img className={styles.poster} src="/posters/relief.webp" alt="" loading="lazy" decoding="async" />
        </picture>
        <LoupeDisc />
      </div>

      <div className={`grid ${styles.inner}`}>
        <div className={styles.column}>
          <div className={styles.block} data-scrim="">
            <LightSweep as="h2" angle={140} id="clear-glass-title" className="t-h2">
              The word is already in the glass.
            </LightSweep>
            <p className={`t-body ${styles.body}`}>
              Look through the pane and the room behind it barely wavers. The word is there, drawn as curvature
              across the whole sheet. You cannot read it in the glass. Only the light can.
            </p>
            <Hint className={`${styles.hintSplit} ${styles.liveOnly}`} />
            <LoupeControls maxSlope={maxSlope} maxTurn={maxTurn} hint={<Hint className={`${styles.hintStacked} ${styles.liveOnly}`} />} />
          </div>
          <p className={`t-caption ${styles.footnote}`} data-scrim="">
            Schlieren: August Toepler&rsquo;s 1864 method, first used to find hidden streaks in optical glass.
          </p>
        </div>
      </div>
    </section>
  )
}
