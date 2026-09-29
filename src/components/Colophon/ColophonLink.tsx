'use client'

import { openColophon } from './index'

/** The footer's "Colophon" item: a button (it opens a dialog), dressed as the other footer links. */
export function ColophonLink({ className }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      aria-haspopup="dialog"
      aria-controls="colophon"
      onClick={() => openColophon()}
    >
      Colophon
    </button>
  )
}

export default ColophonLink
