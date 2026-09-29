import styles from './styles.module.css'

export interface SwitchProps {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  helper?: string
  disabled?: boolean
  meter?: 'bars'
  id?: string
  className?: string
}

/**
 * A labelled switch (7.3): <button role="switch" aria-checked>, label to the left in
 * --t-ui, a 28 × 16 track with a 10 px thumb (sun when on), or seven 2 × 10 px bars
 * with meter="bars" (flat when off; owners drive them through --e on each bar).
 * The whole row is the 44 px hit area. The helper is linked by aria-describedby.
 */
export function Switch({ checked, onChange, label, helper, disabled = false, meter, id, className }: SwitchProps) {
  const baseId = id ?? `switch-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  const helperId = helper ? `${baseId}-helper` : undefined
  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')}>
      <button
        id={baseId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={helperId}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={styles.switch}
        data-on={checked ? '' : undefined}
      >
        <span className={`${styles.label} t-ui`}>{label}</span>
        {meter === 'bars' ? (
          <span className={styles.bars} aria-hidden="true" data-switch-bars="">
            {Array.from({ length: 7 }, (_, i) => (
              <span key={i} className={styles.bar} />
            ))}
          </span>
        ) : (
          <span className={styles.track} aria-hidden="true">
            <span className={styles.thumb} />
          </span>
        )}
      </button>
      {helper ? (
        <p id={helperId} className={`${styles.helper} t-caption`}>
          {helper}
        </p>
      ) : null}
    </div>
  )
}

export default Switch
