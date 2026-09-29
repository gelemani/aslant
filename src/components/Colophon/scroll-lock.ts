// Scroll locks for WP10's modal layers (the colophon, the epilogue field): SmoothScroll's
// keyed stopScroll/startScroll (4.7), made idempotent per key so a double close or an unmount
// after close never releases a lock twice.
import { startScroll, stopScroll } from '@/components/providers/SmoothScroll'

const held = new Set<string>()

export function lockScroll(key: string): void {
  if (held.has(key)) return
  held.add(key)
  stopScroll(key)
}

export function unlockScroll(key: string): void {
  if (!held.delete(key)) return
  startScroll(key)
}
