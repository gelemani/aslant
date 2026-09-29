import { LightAnchor } from '@/components/LightAnchor'
import { LightSweep } from '@/components/LightSweep'
import styles from './styles.module.css'

/** Precedent rows (brief 5.6). Year, place and text are separate elements; no middle dots render. */
const PRECEDENT = [
  {
    year: 'Han',
    place: 'Han dynasty China, 202 BCE to 220 CE',
    text: (
      <>
        Bronze mirrors were polished until, in sunlight, they threw the pattern cast on their backs onto a wall. They
        were called light-penetrating mirrors.
      </>
    ),
  },
  {
    year: '1655',
    place: 'Bologna',
    text: (
      <>
        Giovanni Domenico Cassini had a hole made in the roof of San Petronio, 27 metres up. At noon an image of the sun
        still crosses his line on the floor.
      </>
    ),
  },
  {
    year: '1838',
    place: 'Cambridge',
    text: (
      <>
        George Biddell Airy published <cite>On the Intensity of Light in the Neighbourhood of a Caustic</cite>: the
        mathematics of the bright seams where rays crowd together.
      </>
    ),
  },
  {
    year: '2014',
    place: 'Lausanne',
    text: <>Researchers at EPFL published a method for computing a transparent surface whose light draws a chosen image.</>,
  },
  {
    year: '2027',
    place: 'Copenhagen, proposed',
    text: (
      <>
        We tune that arithmetic to the sun over your window. The first forty panes are planned for spring 2027.
      </>
    ),
  },
] as const

const SPEC = [
  { term: 'Glass', value: 'Clear: optical acrylic, 12 mm. Prismatic: flint glass, 10 mm.' },
  { term: 'Size', value: 'From 20 × 20 cm to 60 × 90 cm. The word forms 1 to 3 metres from the glass.' },
  { term: 'Fitting', value: 'We fit the pane inside your window and set it to the sun on the day we visit.' },
  { term: 'Time', value: 'About ten weeks. We quote after we see the window.' },
] as const

/**
 * 18:20 · the ledger (brief 5.6). A slow, readable chapter: two thousand years of precedent
 * beside how a pane is made, over a long low band of loose golden light. Server-rendered;
 * the only island is the heading's light sweep.
 */
export default function Ledger() {
  return (
    <section id="ledger" data-chapter="ledger" aria-labelledby="ledger-title" className={styles.section}>
      <div className={`grid ${styles.inner}`}>
        <div className={styles.title} data-scrim="">
          <LightSweep as="h2" angle={104} id="ledger-title" className="t-h2">
            The idea is two thousand years old.
          </LightSweep>
        </div>

        <ol className={styles.list} data-scrim="">
          {PRECEDENT.map((row) => (
            <li key={row.year} className={styles.row}>
              <div className={styles.when}>
                <span className={`t-year ${styles.year}`}>{row.year}</span>
                <span className={`t-caption ${styles.place}`}>{row.place}</span>
              </div>
              <p className={`t-body ${styles.text}`}>{row.text}</p>
            </li>
          ))}
        </ol>

        <div className={styles.spec} data-scrim="">
          <h3 id="ledger-spec-title" className="t-h3">
            Ten weeks from your word to your wall.
          </h3>
          <p className={`t-body ${styles.intro}`}>
            Each pane starts as a computed surface and ends as a sheet you can see straight through.
          </p>
          <dl className={styles.dl}>
            {SPEC.map((item) => (
              <div key={item.term} className={styles.item}>
                <dt className={`t-label ${styles.term}`}>{item.term}</dt>
                <dd className={`t-body ${styles.value}`}>{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <LightAnchor chapter="ledger" className={styles.anchor} />
      </div>
    </section>
  )
}
