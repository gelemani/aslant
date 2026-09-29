// Server-side relief of the baked `aslant` pane (brief 6.2, 6.4.3), for the numbers printed in
// the SSR HTML (no JS, Overcast, Still air, and the first paint before the worker answers).
// The same pure functions the transport worker runs, on the same file, so the numbers match
// the client's to the last digit. Computed once per server process (about 40 ms).
import { readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { decodeBin } from '@/lib/caustics/bin-format'
import { computeReliefField, type ReliefField } from '@/lib/caustics/relief'
import { r2Points } from '@/lib/caustics/r2'
import { GLASS, PANE } from '@/lib/light/glass'

let cached: ReliefField | null | undefined
let cachedStamp = -1

export function aslantRelief(): ReliefField | null {
  const file = join(process.cwd(), 'public', 'light', 'aslant.bin')
  let stamp = 0
  try {
    stamp = statSync(file).mtimeMs
  } catch {
    stamp = 0
  }
  if (cached !== undefined && stamp === cachedStamp) return cached
  cachedStamp = stamp
  try {
    const buf = readFileSync(file)
    const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer
    const d = decodeBin(ab)
    cached = computeReliefField(r2Points(d.n), d.targets, d.n, {
      nd: GLASS.clear.nd,
      widthMm: PANE.widthMm,
      throwMm: PANE.throwMm,
      aspect: d.height / d.width,
    })
  } catch {
    cached = null
  }
  return cached
}
