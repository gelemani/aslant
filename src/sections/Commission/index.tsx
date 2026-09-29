import { COMMISSION_MODE } from '@/lib/commission'
import { CommissionForm } from './CommissionForm'
import styles from './styles.module.css'

/**
 * 19:10 · commission (brief 5.7). The form stands in the last sun: a sunlit panel on the wall,
 * DOM-locked to the canvas patch behind it. The mode (endpoint, mailto or preview) is decided at
 * build time from NEXT_PUBLIC_COMMISSION_ENDPOINT and NEXT_PUBLIC_COMMISSION_EMAIL.
 */
export default function Commission() {
  return (
    <section
      id="commission"
      data-chapter="commission"
      data-commission-mode={COMMISSION_MODE}
      aria-labelledby="commission-title"
      className={styles.section}
    >
      <CommissionForm mode={COMMISSION_MODE} />
    </section>
  )
}
