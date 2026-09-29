import { ModeSwitches } from '@/components/ModeSwitches'
import { Colophon } from '@/components/Colophon'
import { ColophonLink } from '@/components/Colophon/ColophonLink'
import { Epilogue } from './Epilogue'
import { SunsetLine } from './SunsetLine'
import styles from './styles.module.css'

// "Email us" exists only when the studio has an address to write to (5.8).
const EMAIL = process.env.NEXT_PUBLIC_COMMISSION_EMAIL?.trim() || null

/**
 * Dusk (20:40), the footer (5.8): the light collapses to an ember on the blue-hour wall,
 * the epilogue waits beside it, and the room ends on a skirting board.
 */
export default function Dusk() {
  return (
    <footer id="dusk" data-chapter="dusk" className={styles.dusk} tabIndex={-1}>
      <div className={`grid ${styles.top}`}>
        <Epilogue />
      </div>
      <div className={`grid ${styles.lower}`}>
        <div className={styles.name}>
          <p className={`t-footmark ${styles.footmark}`} aria-hidden="true">
            aslant
          </p>
          <div className={styles.lines} data-scrim="">
            <p className="t-lead">Clear glass that writes in sunlight. Copenhagen.</p>
            <p className="t-lead">Aslant is a proposal for a studio. The light is real.</p>
          </div>
        </div>
        <div className={styles.aside} data-scrim="">
          <ul className={`t-ui ${styles.links}`}>
            <li>
              <a href="#commission" className={styles.link}>
                Commission a pane
              </a>
            </li>
            <li>
              <a href="#write-yours" className={styles.link}>
                Write yours
              </a>
            </li>
            <li className="js-only">
              <ColophonLink className={styles.link} />
            </li>
            {EMAIL ? (
              <li>
                <a href={`mailto:${EMAIL}`} className={styles.link}>
                  Email us
                </a>
              </li>
            ) : null}
          </ul>
          <ModeSwitches layout="row" />
          <SunsetLine className={`t-caption ${styles.sunset}`} />
        </div>
      </div>
      <div className={`${styles.skirting} overcast-only`} aria-hidden="true" />
      <Colophon />
    </footer>
  )
}
