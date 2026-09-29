// The baked transport file (brief 6.1.1), little-endian:
//   0   4  magic "ASL1"
//   4   4  uint32 N
//   8   2  uint16 iterations
//   10  2  uint16 raster width (1024)
//   12  2  uint16 raster height (480)
//   14  2  uint16 flags (bit 0 = y down, always 1)
//   16  4  uint32 seed
//   20 12  reserved, zero
//   32 4N  uint16 x, uint16 y interleaved; value / 65535 = raster coordinate
//   32+4N N  uint8 density code; d = 2^(code / 25.5 − 5)
// Written by scripts/bake-light.py (code = round((log2(d) + 5) · 25.5), clamped); decoded here on the
// main thread (about 1 ms for 65,536 rays) and by WP5's server-side relief.

export const BIN_MAGIC = 'ASL1'
export const BIN_HEADER_BYTES = 32

export interface BinData {
  n: number
  iters: number
  width: number
  height: number
  flags: number
  seed: number
  /** Raster space [0, 1]², y down, x and y interleaved. */
  targets: Float32Array
  /** aDensity per ray. */
  density: Float32Array
}

export function densityFromCode(code: number): number {
  return Math.pow(2, code / 25.5 - 5)
}

/** 256-entry lookup of the density codes (the decode path never calls Math.pow per ray). */
let codeTable: Float32Array | null = null
function densityTable(): Float32Array {
  if (codeTable) return codeTable
  const t = new Float32Array(256)
  for (let c = 0; c < 256; c++) t[c] = densityFromCode(c)
  codeTable = t
  return t
}

export function decodeBin(buf: ArrayBuffer): BinData {
  if (buf.byteLength < BIN_HEADER_BYTES) throw new Error('light data: file too short')
  const dv = new DataView(buf)
  const magic = String.fromCharCode(dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3))
  if (magic !== BIN_MAGIC) throw new Error(`light data: bad magic ${JSON.stringify(magic)}`)
  const n = dv.getUint32(4, true)
  const iters = dv.getUint16(8, true)
  const width = dv.getUint16(10, true)
  const height = dv.getUint16(12, true)
  const flags = dv.getUint16(14, true)
  const seed = dv.getUint32(16, true)
  if (buf.byteLength < BIN_HEADER_BYTES + 5 * n) throw new Error('light data: truncated')
  const targets = new Float32Array(2 * n)
  const xy = new Uint16Array(buf, BIN_HEADER_BYTES, 2 * n)
  // Uint16Array reads platform endianness; every browser we ship to is little-endian, but check.
  const le = new Uint8Array(new Uint16Array([1]).buffer)[0] === 1
  const inv = 1 / 65535
  if (le) {
    for (let i = 0; i < 2 * n; i++) targets[i] = xy[i] * inv
  } else {
    for (let i = 0; i < 2 * n; i++) targets[i] = dv.getUint16(BIN_HEADER_BYTES + 2 * i, true) * inv
  }
  if ((flags & 1) === 0) {
    for (let i = 1; i < 2 * n; i += 2) targets[i] = 1 - targets[i]
  }
  const codes = new Uint8Array(buf, BIN_HEADER_BYTES + 4 * n, n)
  const table = densityTable()
  const density = new Float32Array(n)
  for (let i = 0; i < n; i++) density[i] = table[codes[i]]
  return { n, iters, width, height, flags: flags | 1, seed, targets, density }
}
