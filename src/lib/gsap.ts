import { gsap } from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'

// Plugins, the four eases of brief 3.6 and the defaults register once on the client.
// Server renders never touch GSAP. "Nothing slides. Things come into focus."
//   focus    arrivals, word formation, H1 focus-in, light sweep
//   defocus  exits, word loosening on input
//   light    world changes, menu time-lapse scroll, patch travel
//   shutter  loader shutters, menu open
// Scroll-mapped values use ease: 'none'. Bounce, elastic, back and stock eases are banned.

let registered = false

function register() {
  if (registered || typeof window === 'undefined') return
  registered = true
  gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, CustomEase)
  CustomEase.create('focus', 'M0,0 C0.16,1 0.3,1 1,1')
  CustomEase.create('defocus', 'M0,0 C0.7,0 0.84,0 1,1')
  CustomEase.create('light', 'M0,0 C0.45,0 0.2,1 1,1')
  CustomEase.create('shutter', 'M0,0 C0.7,0 0.2,1 1,1')
  gsap.defaults({ ease: 'focus', duration: 0.9 })
  ScrollTrigger.config({ ignoreMobileResize: true })
}

register()

/** Ease names, for type-safe use in tweens. */
export const EASE = { focus: 'focus', defocus: 'defocus', light: 'light', shutter: 'shutter', scrub: 'none' } as const

/** Duration tokens in seconds (brief 3.6), mirroring tokens.css. */
export const DUR = {
  tick: 0.12,
  state: 0.24,
  fade: 0.4,
  copy: 0.5,
  close: 0.45,
  shutter: 0.7,
  sweep: 0.9,
  focus: 0.9,
  timelapse: 1.4,
  refocus: 1.6,
  form: 2.2,
} as const

export { gsap, CustomEase, ScrollTrigger, SplitText, useGSAP }
