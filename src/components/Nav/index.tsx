'use client'

// The bar (brief 4.5): wordmark left; the menu button (the live mark, the hour and the
// chapter) centre-right; "Commission a pane" right, hidden while the exact chapter is
// first-light so the first frame holds a single sun-filled rectangle (the hero carries
// the action). Transparent over the canvas and registered as a scrim.
// Inside the appointment the hour is the scrubbed clock itself (the same bullet-time minute the
// section's digits show, from conductor.sectionProgress), so the two never disagree on the way
// in or out: an afterScroll listener writes the text and the label through refs, only when the
// minute changes. In the hero the shade band follows the first scroll (0 at the first frame).

import { Button } from '@/components/Button'
import { NavMark } from '@/components/NavMark'
import { chapterById } from '@/content/chapters'
import { useEffect, useRef } from 'react'
import { fmtClock } from '@/lib/format'
import { conductor } from '@/lib/conductor'
import { frame, onAfterScroll } from '@/lib/frame'
import { clamp } from '@/lib/math'
import { useApp } from '@/lib/store'
import { appointmentMinutes } from '@/lib/world-spec'
import styles from './styles.module.css'

/** The appointment clock starts at 16:12 (brief 5.4). */
const APPOINTMENT_START = 16 + 12 / 60

export function Nav() {
  const chapter = useApp((s) => s.activeChapter)
  const chosenHour = useApp((s) => s.chosenHour)
  const menuOpen = useApp((s) => s.menuOpen)
  const c = chapterById(chapter)
  const hour = c.hourLabel ?? fmtClock(chosenHour)
  const headerRef = useRef<HTMLElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const hourRef = useRef<HTMLSpanElement>(null)

  // Hero: the band arrives with the first scroll, before the H1 can reach the bar. At the first
  // frame it is 0, so the opening frame keeps its single sun-filled rectangle.
  useEffect(() => {
    const header = headerRef.current
    if (!header || chapter !== 'first-light') return
    let shown = -1
    const remove = onAfterScroll(() => {
      const t = Math.round(clamp((frame.scroll.y - 4) / 96) * 100) / 100
      if (t === shown) return
      shown = t
      header.style.setProperty('--band-first', String(t))
    })
    return () => {
      remove()
      header.style.removeProperty('--band-first')
    }
  }, [chapter])

  useEffect(() => {
    const btn = buttonRef.current
    const el = hourRef.current
    if (!btn || !el) return
    const write = (h: string) => {
      if (el.textContent !== h) el.textContent = h
      const l = `Chapters. Now: ${c.name}, ${h}`
      if (btn.getAttribute('aria-label') !== l) btn.setAttribute('aria-label', l)
    }
    // Restore the rendered values (React skips the write when its own props did not change).
    write(hour)
    if (chapter !== 'appointment') return
    let shown = -1
    return onAfterScroll(() => {
      // The clock's own minute (Appointment/Controller: minuteAt(sectionProgress)), floored like its digits.
      const minute = Math.floor(appointmentMinutes(conductor.sectionProgress('appointment')) + 1e-6)
      if (!Number.isFinite(minute) || minute === shown) return
      shown = minute
      write(fmtClock(APPOINTMENT_START + minute / 60))
    })
  }, [chapter, hour, c.name])

  return (
    <header
      ref={headerRef}
      className={styles.nav}
      data-scrim=""
      data-nav-chapter={chapter}
      data-first={chapter === 'first-light' ? '' : undefined}
    >
      <a
        href="#first-light"
        className={`${styles.wordmark} t-wordmark`}
        aria-label="Aslant, back to first light"
        data-og-keep=""
      >
        aslant
      </a>
      <div className={styles.end}>
        <button
          type="button"
          className={`${styles.menuButton} js-only`}
          ref={buttonRef}
          aria-label={`Chapters. Now: ${c.name}, ${hour}`}
          aria-expanded={menuOpen}
          aria-controls="menu"
          data-menu-button=""
          onClick={() => useApp.getState().setMenuOpen(true)}
        >
          <span className={styles.mark} data-menu-mark="">
            <NavMark />
          </span>
          <span ref={hourRef} className={`${styles.hour} t-value`}>
            {hour}
          </span>
          <span className={`${styles.name} t-ui`}>{c.name}</span>
        </button>
        <Button href="#commission" variant="primary" size="sm" className={styles.cta}>
          Commission a pane
        </Button>
      </div>
    </header>
  )
}

export default Nav
