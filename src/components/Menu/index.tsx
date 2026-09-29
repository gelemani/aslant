'use client'

// The menu (brief 4.5): the chapters as hours of one day. It opens like the loader's
// shutters: a recess-coloured panel grows from a 2 px slit at the nav mark's x to the full
// viewport (700 ms, shutter), a 2 px line of sun riding each edge; it closes in reverse
// (450 ms, defocus). A modal dialog: focus moves to the first item, Tab is trapped, Esc
// and "Close" close it and return focus to the menu button; main, header and footer are
// inert and Lenis is held while it is open. An item is a time-lapse: the menu closes
// (300 ms) and the day fast-forwards or rewinds to the chapter over 1.4 s (jumpTo).

import { useEffect, useRef } from 'react'
import { Button } from '@/components/Button'
import { ModeSwitches } from '@/components/ModeSwitches'
import { jumpTo, startScroll, stopScroll } from '@/components/providers/SmoothScroll'
import { CHAPTERS } from '@/content/chapters'
import { gsap } from '@/lib/gsap'
import { fmtClock } from '@/lib/format'
import { motion } from '@/lib/qa-flags'
import { stage } from '@/lib/stage'
import { useApp } from '@/lib/store'
import styles from './styles.module.css'

const OPEN_S = 0.7
const CLOSE_S = 0.45
const CLOSE_FOR_JUMP_S = 0.3
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function setInert(on: boolean) {
  for (const el of document.querySelectorAll<HTMLElement>('body > header, main, footer, header[data-scrim], .skip-link')) {
    if (el.closest('#menu')) continue
    el.inert = on
  }
}

function markX(): number {
  const mark = document.querySelector<HTMLElement>('[data-menu-mark]')
  const r = mark?.getBoundingClientRect()
  if (r && r.width > 0) return r.left + r.width / 2
  return window.innerWidth - 40
}

export function Menu() {
  const panel = useRef<HTMLDivElement>(null)
  const chapter = useApp((s) => s.activeChapter)
  const chosenHour = useApp((s) => s.chosenHour)

  useEffect(() => {
    const el = panel.current
    if (!el) return
    let tl: gsap.core.Timeline | null = null
    let isOpen = false
    let returnFocus = true

    const finishClose = () => {
      el.hidden = true
      el.dataset.state = 'closed'
      if (returnFocus) document.querySelector<HTMLElement>('[data-menu-button]')?.focus({ preventScroll: true })
      returnFocus = true
    }

    const open = () => {
      if (isOpen) return
      isOpen = true
      tl?.kill()
      el.style.setProperty('--x', `${markX().toFixed(1)}px`)
      el.hidden = false
      el.dataset.state = 'open'
      setInert(true)
      stopScroll('menu')
      stage.touch()
      const first = el.querySelector<HTMLElement>('[data-menu-item]')
      first?.focus({ preventScroll: true })
      if (motion() === 'reduced') {
        gsap.set(el, { '--p': 1, '--edge': 0 })
        return
      }
      tl = gsap.timeline()
      tl.fromTo(el, { '--p': 0, '--edge': 1 }, { '--p': 1, duration: OPEN_S, ease: 'shutter' }, 0)
      tl.to(el, { '--edge': 0, duration: 0.2, ease: 'defocus' }, OPEN_S - 0.2)
    }

    const close = (duration = CLOSE_S) => {
      if (!isOpen) return
      isOpen = false
      tl?.kill()
      setInert(false)
      startScroll('menu')
      el.dataset.state = 'closing'
      if (motion() === 'reduced') {
        gsap.set(el, { '--p': 0 })
        finishClose()
        return
      }
      tl = gsap.timeline({ onComplete: finishClose })
      tl.to(el, { '--edge': 1, duration: 0.12, ease: 'focus' }, 0)
      tl.to(el, { '--p': 0, duration, ease: 'defocus' }, 0)
    }

    let closeDuration = CLOSE_S
    const unsub = useApp.subscribe((s, p) => {
      if (s.menuOpen === p.menuOpen) return
      if (s.menuOpen) open()
      else close(closeDuration)
      closeDuration = CLOSE_S
    })

    const requestClose = (focusBack: boolean, duration = CLOSE_S) => {
      returnFocus = focusBack
      closeDuration = duration
      useApp.getState().setMenuOpen(false)
    }

    const onKey = (e: KeyboardEvent) => {
      if (!isOpen) return
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        requestClose(true)
        return
      }
      if (e.key !== 'Tab') return
      const items = Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((n) => n.offsetParent !== null || n === document.activeElement)
      if (!items.length) return
      const firstEl = items[0]
      const lastEl = items[items.length - 1]
      const active = document.activeElement as HTMLElement | null
      if (e.shiftKey && (active === firstEl || !el.contains(active))) {
        e.preventDefault()
        lastEl.focus()
      } else if (!e.shiftKey && (active === lastEl || !el.contains(active))) {
        e.preventDefault()
        firstEl.focus()
      }
    }
    document.addEventListener('keydown', onKey, true)

    // Every in-page link inside the menu (the hours, the CTA) is a time-lapse.
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null
      if (target?.closest('[data-menu-close]')) {
        requestClose(true)
        return
      }
      const a = target?.closest?.('a[href^="#"]') as HTMLAnchorElement | null
      if (!a || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const href = a.getAttribute('href') ?? ''
      if (href.length < 2) return
      e.preventDefault()
      e.stopPropagation()
      requestClose(false, CLOSE_FOR_JUMP_S)
      jumpTo(href, { timelapse: true, focus: true })
    }
    el.addEventListener('click', onClick)

    return () => {
      unsub()
      document.removeEventListener('keydown', onKey, true)
      el.removeEventListener('click', onClick)
      tl?.kill()
      if (isOpen) {
        setInert(false)
        startScroll('menu')
      }
    }
  }, [])

  const yourHour = fmtClock(chosenHour)

  return (
    <div
      ref={panel}
      id="menu"
      role="dialog"
      aria-modal="true"
      aria-label="Chapters"
      className={styles.menu}
      data-state="closed"
      data-lenis-prevent=""
      hidden
    >
      <div className={styles.bar}>
        <a href="#first-light" className={`${styles.wordmark} t-wordmark`} aria-label="Aslant, back to first light">
          aslant
        </a>
        <button type="button" className={`${styles.close} t-ui`} data-menu-close="">
          Close
        </button>
      </div>
      <ol className={styles.items}>
        {CHAPTERS.map((c) => (
          <li key={c.id}>
            <a
              href={`#${c.id}`}
              className={styles.item}
              aria-current={c.id === chapter ? 'step' : undefined}
              data-menu-item=""
            >
              <span className={`${styles.hour} t-menu`}>{c.hourLabel ?? yourHour}</span>
              <span className={`${styles.name} t-lead`}>{c.name}</span>
            </a>
          </li>
        ))}
      </ol>
      <div className={styles.foot}>
        <div className={styles.modes}>
          <ModeSwitches layout="row" />
        </div>
        <Button href="#commission" variant="primary" className={styles.cta}>
          Commission a pane
        </Button>
      </div>
    </div>
  )
}

export default Menu
