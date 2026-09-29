import { forwardRef } from 'react'
import styles from './styles.module.css'

export interface ReadoutProps {
  label: string
  value: string
  minCh?: number
  id?: string
  className?: string
}

/**
 * A live readout (7.3): label in --t-label dust, value in --t-value lime with tabular
 * figures and a fixed min-width, so values never shift layout. The ref points at the
 * value span: owners write `ref.current.textContent` from a frame listener without
 * re-rendering (continuous values never pass through React state, 7.2).
 */
export const Readout = forwardRef<HTMLSpanElement, ReadoutProps>(function Readout(
  { label, value, minCh, id, className },
  ref,
) {
  return (
    <div className={[styles.readout, className].filter(Boolean).join(' ')} id={id}>
      <span className={`${styles.label} t-label`}>{label}</span>
      <span
        ref={ref}
        className={`${styles.value} t-value`}
        style={minCh ? { minWidth: `${minCh}ch` } : undefined}
      >
        {value}
      </span>
    </div>
  )
})

export default Readout
