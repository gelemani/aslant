// The eight chapters of the day, in page order (brief 0 and 7.3).
// `hour` is decimal local time; write-yours uses the visitor's hour (null here).

export type ChapterId =
  | 'first-light'
  | 'clear-glass'
  | 'the-bend'
  | 'appointment'
  | 'write-yours'
  | 'ledger'
  | 'commission'
  | 'dusk'

export interface Chapter {
  id: ChapterId
  name: string
  hour: number | null
  hourLabel: string | null
}

export const CHAPTERS: ReadonlyArray<Chapter> = [
  { id: 'first-light', name: 'First light', hour: 8 + 10 / 60, hourLabel: '08:10' },
  { id: 'clear-glass', name: 'Clear glass', hour: 10.5, hourLabel: '10:30' },
  { id: 'the-bend', name: 'The bend', hour: 12 + 50 / 60, hourLabel: '12:50' },
  { id: 'appointment', name: 'The appointment', hour: 16 + 40 / 60, hourLabel: '16:40' },
  { id: 'write-yours', name: 'Your word', hour: null, hourLabel: null }, // the visitor's hour
  { id: 'ledger', name: 'Precedent', hour: 18 + 20 / 60, hourLabel: '18:20' }, // menu and nav label
  { id: 'commission', name: 'Commission', hour: 19 + 10 / 60, hourLabel: '19:10' },
  { id: 'dusk', name: 'Dusk', hour: 20 + 40 / 60, hourLabel: '20:40' },
]

/** Chapter ids in page order. */
export const CHAPTER_IDS: ReadonlyArray<ChapterId> = CHAPTERS.map((c) => c.id)

/** Index of a chapter in page order (0 to 7). */
export function chapterIndex(id: ChapterId): number {
  return CHAPTER_IDS.indexOf(id)
}

/** The chapter record for an id. */
export function chapterById(id: ChapterId): Chapter {
  return CHAPTERS[chapterIndex(id)]
}

/** Default visitor hour for write-yours (17:20), used where a chapter hour is needed. */
export const DEFAULT_VISITOR_HOUR = 17 + 20 / 60

export function isChapterId(v: unknown): v is ChapterId {
  return typeof v === 'string' && (CHAPTER_IDS as ReadonlyArray<string>).includes(v)
}
