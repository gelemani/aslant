import { Configurator } from './Configurator'
import styles from './styles.module.css'

/**
 * write-yours (your hour) · the participatory climax (brief 5.5). A mirrored split: the light on
 * the left, the controls in columns 8 to 12, the result under the patch. Every string is in the
 * SSR HTML; the configurator island computes the glass and the numbers after mount.
 */
export default function WriteYours() {
  return (
    <section id="write-yours" data-chapter="write-yours" aria-labelledby="write-yours-title" className={styles.section}>
      <Configurator />
    </section>
  )
}
