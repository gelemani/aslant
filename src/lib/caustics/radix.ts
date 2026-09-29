// LSD radix sort for the sliced transport (brief 6.1.1): float keys → sortable uint32,
// 3 passes of 11 bits, stable, with an index payload. Never Array.sort.
// One sorter per array length; its buffers are reused across iterations.

const BITS = 11
const RADIX = 1 << BITS // 2048
const MASK = RADIX - 1

export class RadixSorter {
  readonly n: number
  private readonly f32: Float32Array
  private readonly u32: Uint32Array
  private readonly keysA: Uint32Array
  private readonly keysB: Uint32Array
  private readonly idxA: Uint32Array
  private readonly idxB: Uint32Array
  private readonly hist: Uint32Array

  constructor(n: number) {
    this.n = n
    this.f32 = new Float32Array(n)
    this.u32 = new Uint32Array(this.f32.buffer)
    this.keysA = new Uint32Array(n)
    this.keysB = new Uint32Array(n)
    this.idxA = new Uint32Array(n)
    this.idxB = new Uint32Array(n)
    this.hist = new Uint32Array(3 * RADIX)
  }

  /** Write keys here (as float32), then call sort(). */
  get keys(): Float32Array {
    return this.f32
  }

  /**
   * Returns the indices 0 … n − 1 ordered by ascending key (ties keep index order).
   * The returned array is internal and valid until the next call.
   */
  sort(): Uint32Array {
    const n = this.n
    const u = this.u32
    const hist = this.hist
    hist.fill(0)
    let ka = this.keysA
    let kb = this.keysB
    let ia = this.idxA
    let ib = this.idxB
    // Float bits → order-preserving unsigned keys; histogram all three digits in one pass.
    for (let i = 0; i < n; i++) {
      const b = u[i]
      const k = (b & 0x80000000 ? ~b : b | 0x80000000) >>> 0
      ka[i] = k
      ia[i] = i
      hist[k & MASK]++
      hist[RADIX + ((k >>> BITS) & MASK)]++
      hist[2 * RADIX + (k >>> (2 * BITS))]++
    }
    for (let pass = 0; pass < 3; pass++) {
      const base = pass * RADIX
      const shift = pass * BITS
      // Skip a digit every key shares (common for the top digit of keys in a narrow range).
      let only = -1
      for (let b = 0; b < RADIX; b++) {
        const c = hist[base + b]
        if (c === n) { only = b; break }
        if (c !== 0) break
      }
      if (only >= 0) continue
      let sum = 0
      for (let b = 0; b < RADIX; b++) {
        const c = hist[base + b]
        hist[base + b] = sum
        sum += c
      }
      for (let i = 0; i < n; i++) {
        const k = ka[i]
        const dst = hist[base + ((k >>> shift) & MASK)]++
        kb[dst] = k
        ib[dst] = ia[i]
      }
      const tk = ka; ka = kb; kb = tk
      const ti = ia; ia = ib; ib = ti
    }
    return ia
  }
}
