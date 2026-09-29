import { preload } from 'react-dom'
import { LightAnchor } from '@/components/LightAnchor'
import { FocusTitle } from '@/components/FocusTitle'
import { Button } from '@/components/Button'
import { HeroIntro } from './HeroIntro'
import { PointerSun } from './PointerSun'
import styles from './styles.module.css'

/** The split composition (5.0): at least 1024 px wide and aspect at least 0.9. Everything else is stacked. */
const SPLIT = '(min-width: 1024px) and (min-aspect-ratio: 9/10)'
const STACKED = `not all and ${SPLIT}`
const POSTER_ALT = 'A slant of morning sun on a grey wall. In its lower pane, the word aslant is made of light.'

/**
 * first-light (08:10), the hero (brief 5.1). Server-rendered lockup, poster and anchor;
 * two client islands: the intro (the loader hands it t = 0) and the pointer sun.
 */
export default function FirstLight() {
  // The hero poster is the only preloaded image (Overcast, no JS, and the frame before the canvas draws).
  preload('/posters/hero-desktop.webp', { as: 'image', media: SPLIT, fetchPriority: 'high' })
  preload('/posters/hero-mobile.webp', { as: 'image', media: STACKED, fetchPriority: 'high' })

  return (
    <section id="first-light" data-chapter="first-light" aria-labelledby="first-light-title" className={styles.section}>
      <picture className={styles.poster} data-hero-poster="">
        <source media={STACKED} srcSet="/posters/hero-mobile.webp" width={780} height={1688} />
        <img
          className={styles.posterImg}
          src="/posters/hero-desktop.webp"
          alt={POSTER_ALT}
          width={1920}
          height={1200}
          fetchPriority="high"
          decoding="async"
        />
      </picture>
      <LightAnchor chapter="first-light" word="aslant" className={styles.anchor} />
      <div className={`grid ${styles.inner}`}>
        <div className={styles.lockup} data-scrim="">
          <FocusTitle className={`${styles.title} t-hero`}>Clear glass that writes in sunlight.</FocusTitle>
          <p className={`${styles.sub} t-lead`} data-hero-sub="">
            We shape a window pane so that, at an hour you choose, the sun spells a word on your wall.
          </p>
          <div className={styles.ctas} data-hero-ctas="">
            <Button href="#commission" variant="primary">
              Commission a pane
            </Button>
            <Button href="#write-yours" variant="text">
              Write yours
            </Button>
          </div>
        </div>
      </div>
      <HeroIntro />
      <PointerSun />
    </section>
  )
}
