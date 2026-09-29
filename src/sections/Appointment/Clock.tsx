import { fmtClock } from '@/lib/format'
import { INGRID } from '@/lib/light/sun'
import styles from './styles.module.css'

/**
 * The appointment's wall clock (5.4, 2 of 2 live readouts): Sprat has no tabular figures, so each digit sits
 * in a fixed slot and the clock never jitters sideways. Server-rendered at 16:40 (the no-JS and Still air
 * state); the controller rewrites the four digit slots in place as the scroll scrubs the minutes.
 * The digits are aria-hidden; the section states in words what the clock does.
 */
export function Clock({ className }: { className?: string }) {
  const [h1, h2, , m1, m2] = fmtClock(INGRID.hour).split('')
  return (
    <p className={[styles.clock, 't-clock', className].filter(Boolean).join(' ')} aria-hidden="true" data-clock="">
      <span className={styles.slot} data-clock-digit="0">
        {h1}
      </span>
      <span className={styles.slot} data-clock-digit="1">
        {h2}
      </span>
      <span className={styles.colon}>:</span>
      <span className={styles.slot} data-clock-digit="2">
        {m1}
      </span>
      <span className={styles.slot} data-clock-digit="3">
        {m2}
      </span>
    </p>
  )
}

export default Clock
