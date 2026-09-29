'use client'

import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react'
import { Switch } from '@/components/Switch'
import { Button } from '@/components/Button'
import { useApp } from '@/lib/store'
import { stage } from '@/lib/stage'
import { stageApi } from '@/webgl/stage-api'
import { fmtInt } from '@/lib/format'
import nightLog from '@/content/night-log.json'
import { setShortcuts, RAY_VIEW } from '@/components/KeyLayer/shortcuts'
import { lockScroll, unlockScroll } from './scroll-lock'
import styles from './styles.module.css'

// The colophon's design figures: the tier-3 renderer (65,536 rays at 8 bands). The live
// renderer's own numbers replace them when the dialog opens (stageApi.info()).
const DESIGN = { rays: 65536, bands: 8 }

type Log = { start: string; end: string; date: string; zone: string; overnight: boolean }

// "Overnight" is true only when the recorded work ended by 08:00 (a later end is the morning).
const NIGHT_ENDS = '08:00'

/** The making log, only when night-log.mjs recorded real times (7.5); otherwise nothing. */
function validLog(v: unknown): Log | null {
  if (!v || typeof v !== 'object') return null
  const o = v as Record<string, unknown>
  const hhmm = /^\d{2}:\d{2}$/
  if (typeof o.start !== 'string' || typeof o.end !== 'string' || typeof o.date !== 'string' || typeof o.zone !== 'string') return null
  if (!hhmm.test(o.start) || !hhmm.test(o.end) || !(o.start < o.end)) return null
  if (o.date !== '29 September 2026' || o.zone !== 'Moscow time') return null
  const overnight = typeof o.overnight === 'boolean' ? o.overnight && o.end <= NIGHT_ENDS : o.end <= NIGHT_ENDS
  return { start: o.start, end: o.end, date: o.date, zone: o.zone, overnight }
}
const LOG = validLog(nightLog)

let opener: (() => void) | null = null

/** Opens the colophon dialog (the footer link; anything else that needs it). No-op before mount. */
export function openColophon(): void {
  opener?.()
}

function subscribeShortcuts(cb: () => void) {
  return useApp.subscribe((s, p) => {
    if (s.shortcutsOn !== p.shortcutsOn) cb()
  })
}

/**
 * The colophon (5.8): a native modal <dialog>. Esc closes it and focus returns to the control
 * that opened it; data-lenis-prevent lets its own overflow scroll while the page holds the
 * 'colophon' scroll lock.
 */
export function Colophon() {
  const ref = useRef<HTMLDialogElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const leadRef = useRef<HTMLSpanElement>(null)
  const raysRef = useRef<HTMLSpanElement>(null)
  const bandsRef = useRef<HTMLSpanElement>(null)
  const liveRef = useRef<HTMLParagraphElement>(null)
  const msRef = useRef<HTMLSpanElement>(null)
  const srcRef = useRef<HTMLSpanElement>(null)
  const tierRef = useRef<HTMLSpanElement>(null)
  const returnTo = useRef<HTMLElement | null>(null)
  const shortcutsOn = useSyncExternalStore(
    subscribeShortcuts,
    () => useApp.getState().shortcutsOn,
    () => true,
  )

  /** Numbers from the running code, written through refs (no re-render). */
  const writeNumbers = useCallback(() => {
    const info = stageApi.info()
    const rays = info.rays > 0 ? info.rays : DESIGN.rays
    const bands = info.bands > 0 ? info.bands : DESIGN.bands
    if (raysRef.current) raysRef.current.textContent = fmtInt(rays)
    if (bandsRef.current) bandsRef.current.textContent = String(bands)
    const { webgl, gpuTier } = useApp.getState()
    // Overcast traces nothing on this visit: the figures are the live renderer's, so say so.
    if (leadRef.current) {
      leadRef.current.textContent =
        webgl === 'off' || webgl === 'failed' ? 'With live light, each ray is traced' : 'Each ray is traced'
    }
    const live = liveRef.current
    if (!live) return
    const ms = stage.frameMs
    const show = webgl === 'ready' && ms > 0
    live.hidden = !show
    if (!show) return
    if (msRef.current) msRef.current.textContent = ms.toFixed(1)
    if (srcRef.current) srcRef.current.textContent = stage.frameSource === 'gpu' ? 'GPU' : 'main-thread'
    if (tierRef.current) tierRef.current.textContent = String(gpuTier)
  }, [])

  const close = useCallback(() => {
    ref.current?.close()
  }, [])

  const open = useCallback(() => {
    const d = ref.current
    if (!d || d.open) return
    const active = document.activeElement
    returnTo.current = active instanceof HTMLElement ? active : null
    writeNumbers()
    d.showModal()
    titleRef.current?.focus({ preventScroll: true })
    useApp.getState().setColophonOpen(true)
    lockScroll('colophon')
  }, [writeNumbers])

  useEffect(() => {
    opener = open
    return () => {
      if (opener === open) opener = null
    }
  }, [open])

  useEffect(() => {
    const d = ref.current
    if (!d) return
    const onClose = () => {
      useApp.getState().setColophonOpen(false)
      unlockScroll('colophon')
      const back = returnTo.current
      returnTo.current = null
      if (back && back.isConnected) back.focus({ preventScroll: true })
    }
    // A click on the backdrop (outside the panel) closes, like Esc.
    const onClick = (e: MouseEvent) => {
      if (e.target === d) d.close()
    }
    d.addEventListener('close', onClose)
    d.addEventListener('click', onClick)
    // The live line follows the renderer while the dialog is open.
    const offFrame = stage.onFrame(() => {
      if (d.open) writeNumbers()
    })
    return () => {
      d.removeEventListener('close', onClose)
      d.removeEventListener('click', onClick)
      offFrame()
      if (d.open) d.close()
      unlockScroll('colophon')
    }
  }, [writeNumbers])

  return (
    <dialog
      ref={ref}
      id="colophon"
      className={styles.dialog}
      aria-labelledby="colophon-title"
      data-lenis-prevent=""
    >
      <div className={styles.panel}>
        <h3 id="colophon-title" ref={titleRef} tabIndex={-1} className={`t-h3 ${styles.title}`}>
          Colophon
        </h3>
        <div className={`t-caption ${styles.body}`}>
          <p>
            Every spectrum on this page is computed. <span ref={leadRef}>Each ray is traced</span> at{' '}
            <span ref={bandsRef}>{DESIGN.bands}</span>{' '}
            wavelengths between 400 and 700 nm and converted with the CIE 1931 observer:{' '}
            <span ref={raysRef}>{fmtInt(DESIGN.rays)}</span> rays per frame.
          </p>
          <p>
            Sun positions come from NOAA’s solar equations, worked out in your browser from your clock and time zone. We
            never ask where you are.
          </p>
          <p>
            The headings widen as the sun lowers. Each is set to the length of the light at its hour, and the name at
            dusk is the widest.
          </p>
          <p>
            Type: Sprat by Ethan Nakache (Collletttivo) and Geologica by Monokrom, both under the SIL Open Font License.
          </p>
          <p>
            Our name is the angle of the light. Emily Dickinson got there first:{' '}
            <cite>
              <q>There’s a certain Slant of light.</q>
            </cite>
          </p>
          <p>
            Aslant is a proposal for a studio. The studio, its Copenhagen address, the first forty panes, the sizes, the
            lead time, the name Ingrid and her birth time are invented for this study. The physics, the history and
            every number about light are real.
          </p>
          {LOG ? (
            <p className={styles.meta}>
              {LOG.overnight ? 'Designed and built overnight, between' : 'Designed and built between'} {LOG.start} and{' '}
              {LOG.end} on {LOG.date}, {LOG.zone}. Built with Next.js, three.js, GSAP and Lenis.
            </p>
          ) : null}
          <p ref={liveRef} className={`${styles.meta} ${styles.live}`} hidden>
            The last frame took <span ref={msRef} className={styles.num} /> ms of <span ref={srcRef} /> time at tier{' '}
            <span ref={tierRef} className={styles.num} />.
          </p>
        </div>
        <div className={styles.keys}>
          <p className={`t-caption ${styles.hint}`}>
            {RAY_VIEW ? 'Press R to see the rays. Press L to leave the room.' : 'Press L to leave the room.'}
          </p>
          <Switch
            id="colophon-shortcuts"
            label="Keyboard shortcuts"
            checked={shortcutsOn}
            onChange={setShortcuts}
          />
        </div>
        <div className={styles.actions}>
          <Button variant="secondary" size="sm" onClick={close}>
            Close
          </Button>
        </div>
      </div>
    </dialog>
  )
}

export default Colophon
