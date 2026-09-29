// Discrete app state (brief 7.3). Continuous values never live here: they are in
// `frame` (frame.ts) and `light` (light-state.ts) and are written through refs.
import { create, type StoreApi, type UseBoundStore } from 'zustand'
import type { ChapterId } from '@/content/chapters'
import { flags, motion } from '@/lib/qa-flags'

export type WebGLStatus = 'pending' | 'ready' | 'off' | 'failed'
/** GPU quality only; motion is a separate axis (4.11). */
export type GpuTier = 0 | 2 | 3
export type Facing = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW' | 'unsure'
export type GlassChoice = 'clear' | 'prismatic'

export interface CommissionDraft {
  word: string
  /** "17:20" */
  hour: string
  cityId: string
  facing: Facing
  glass: GlassChoice
}

export interface AppState {
  /** Initialised from motion() (qa-flags.ts); never from a media query. */
  reducedMotion: boolean
  /** Still air is set by the system (the OS preference), so the switch is locked on. */
  motionForced: boolean
  introDone: boolean
  introSkipped: boolean
  /** setWebgl() is the only writer of html[data-webgl] after the head script. */
  webgl: WebGLStatus
  /** setGpuTier() mirrors html[data-tier]. */
  gpuTier: GpuTier
  soundOn: boolean
  menuOpen: boolean
  colophonOpen: boolean
  rayView: boolean
  roomLeft: boolean
  shortcutsOn: boolean
  activeChapter: ChapterId
  word: string
  /** Decimal hours, default 17:20. */
  chosenHour: number
  cityId: string
  cityGuessed: boolean
  glass: GlassChoice
  commissionDraft: CommissionDraft | null

  setReducedMotion: (v: boolean) => void
  setMotionForced: (v: boolean) => void
  setIntroDone: (v: boolean) => void
  setIntroSkipped: (v: boolean) => void
  setWebgl: (v: WebGLStatus) => void
  setGpuTier: (v: GpuTier) => void
  setSoundOn: (v: boolean) => void
  setMenuOpen: (v: boolean) => void
  setColophonOpen: (v: boolean) => void
  setRayView: (v: boolean) => void
  setRoomLeft: (v: boolean) => void
  setShortcutsOn: (v: boolean) => void
  setActiveChapter: (v: ChapterId) => void
  setWord: (v: string) => void
  setChosenHour: (v: number) => void
  setCityId: (v: string) => void
  setCityGuessed: (v: boolean) => void
  setGlass: (v: GlassChoice) => void
  setCommissionDraft: (v: CommissionDraft | null) => void

}

const isClient = typeof document !== 'undefined'

function readWebgl(): WebGLStatus {
  if (!isClient) return 'pending'
  const v = document.documentElement.dataset.webgl
  return v === 'ready' || v === 'off' || v === 'failed' ? v : flags.webglOff ? 'off' : 'pending'
}

function readTier(webgl: WebGLStatus): GpuTier {
  if (webgl === 'off' || webgl === 'failed') return 0
  return flags.tier ?? 3
}

function readMotionForced(): boolean {
  if (!isClient || motion() !== 'reduced') return false
  return new URLSearchParams(window.location.search).get('motion') !== 'reduced'
}

function writeHtml(key: 'webgl' | 'tier', value: string) {
  if (isClient) document.documentElement.dataset[key] = value
}

export const useApp: UseBoundStore<StoreApi<AppState>> = create<AppState>()((set) => ({
  // SSR-identical defaults. These are also zustand's getInitialState(), which React uses as the
  // server snapshot while hydrating, so client-derived values never cause hydration mismatches.
  reducedMotion: false,
  motionForced: false,
  introDone: false,
  introSkipped: false,
  webgl: 'pending',
  gpuTier: 3,
  soundOn: false,
  menuOpen: false,
  colophonOpen: false,
  rayView: false,
  roomLeft: false,
  shortcutsOn: true,
  activeChapter: 'first-light',
  word: 'Ingrid',
  chosenHour: 17 + 20 / 60,
  cityId: 'copenhagen',
  cityGuessed: false,
  glass: 'prismatic',
  commissionDraft: null,

  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
  setMotionForced: (motionForced) => set({ motionForced }),
  setIntroDone: (introDone) => set({ introDone }),
  setIntroSkipped: (introSkipped) => set({ introSkipped }),
  setWebgl: (webgl) => {
    writeHtml('webgl', webgl)
    set(webgl === 'off' || webgl === 'failed' ? { webgl, gpuTier: 0 } : { webgl })
  },
  setGpuTier: (gpuTier) => {
    writeHtml('tier', String(gpuTier))
    set({ gpuTier })
  },
  setSoundOn: (soundOn) => set({ soundOn }),
  setMenuOpen: (menuOpen) => set({ menuOpen }),
  setColophonOpen: (colophonOpen) => set({ colophonOpen }),
  setRayView: (rayView) => set({ rayView }),
  setRoomLeft: (roomLeft) => set({ roomLeft }),
  setShortcutsOn: (shortcutsOn) => set({ shortcutsOn }),
  setActiveChapter: (activeChapter) => set({ activeChapter }),
  setWord: (word) => set({ word }),
  setChosenHour: (chosenHour) => set({ chosenHour }),
  setCityId: (cityId) => set({ cityId }),
  setCityGuessed: (cityGuessed) => set({ cityGuessed }),
  setGlass: (glass) => set({ glass }),
  setCommissionDraft: (commissionDraft) => set({ commissionDraft }),
}))

// Client values (head script attributes, flags) apply right after creation, before any
// component or module reads the store; getInitialState() keeps the SSR defaults above.
if (isClient) {
  const webgl = readWebgl()
  useApp.setState({
    reducedMotion: motion() === 'reduced',
    motionForced: readMotionForced(),
    webgl,
    gpuTier: readTier(webgl),
    word: flags.word ?? 'Ingrid',
  })
}
