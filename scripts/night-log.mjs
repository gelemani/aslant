// Making log for the colophon (brief 7.5). Runs as `prebuild`.
// start = the earliest birth time among docs/process/** files
// end   = the latest modification time among app/, src/, public/ files (or the latest git commit, if later)
// Writes src/content/night-log.json. On any doubt it writes {} and exits 0: it never fails the build
// and never records a time that did not happen.
import { readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'src', 'content', 'night-log.json')
const OUT_REL = 'src/content/night-log.json'
const ZONE = 'Europe/Moscow'
const EXPECTED_DATE = '29 September 2026'
const SKIP = new Set(['node_modules', '.next', '.git', '.turbo', '.DS_Store'])

function walk(dir, visit, dirs = false) {
  let entries
  try { entries = readdirSync(dir, { withFileTypes: true }) } catch { return }
  for (const e of entries) {
    if (SKIP.has(e.name)) continue
    const p = join(dir, e.name)
    if (e.isDirectory()) {
      if (dirs) { try { visit(p, statSync(p)) } catch { /* ignore */ } }
      walk(p, visit, dirs)
    } else if (e.isFile()) {
      try { visit(p, statSync(p)) } catch { /* unreadable file: ignore it */ }
    }
  }
}

function isValidMs(ms) {
  return typeof ms === 'number' && Number.isFinite(ms) && ms > 0
}

function earliestBirth(dir) {
  let min = Infinity
  const visit = (_p, s) => {
    // birthtime is only meaningful where the file system records it (APFS does); otherwise it is skipped
    const b = s.birthtimeMs
    if (isValidMs(b) && b < min) min = b
  }
  try { visit(dir, statSync(dir)) } catch { return null }
  walk(dir, visit, true)
  return Number.isFinite(min) ? min : null
}

function latestModification(dirs) {
  let max = -Infinity
  for (const d of dirs) {
    walk(d, (p, s) => {
      if (p === OUT) return // the log itself is not part of the work
      if (isValidMs(s.mtimeMs) && s.mtimeMs > max) max = s.mtimeMs
    })
  }
  return Number.isFinite(max) ? max : null
}

function latestCommit() {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%ct'], { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'], timeout: 5000 })
      .toString().trim()
    const s = Number(out)
    return Number.isFinite(s) && s > 0 ? s * 1000 : null
  } catch {
    return null
  }
}

const clock = new Intl.DateTimeFormat('en-GB', { timeZone: ZONE, hour: '2-digit', minute: '2-digit' })
const day = new Intl.DateTimeFormat('en-GB', { timeZone: ZONE, day: 'numeric', month: 'long', year: 'numeric' })

function write(obj) {
  try { writeFileSync(OUT, JSON.stringify(obj, null, 2) + '\n') } catch { /* read-only tree: the colophon then omits the line */ }
}

function main() {
  const start = earliestBirth(join(ROOT, 'docs', 'process'))
  let end = latestModification(['app', 'src', 'public'].map((d) => join(ROOT, d)))
  const commit = latestCommit()
  if (commit !== null && (end === null || commit > end)) end = commit
  const now = Date.now()
  if (start === null || end === null) return null
  if (!(start < end)) return null
  if (end > now + 60_000) return null // a clock in the future is not a time that happened
  const startDay = day.format(start)
  const endDay = day.format(end)
  if (startDay !== EXPECTED_DATE || endDay !== EXPECTED_DATE) return null
  const s = clock.format(start)
  const e = clock.format(end)
  if (!/^\d{2}:\d{2}$/.test(s) || !/^\d{2}:\d{2}$/.test(e) || s >= e) return null
  // "overnight" only while the work ended by 08:00 Moscow time; the colophon drops the word after that.
  return { start: s, end: e, date: EXPECTED_DATE, zone: 'Moscow time', overnight: e <= '08:00' }
}

let result = null
try { result = main() } catch { result = null }
write(result ?? {})
if (result) console.log(`night-log: ${result.start} to ${result.end}, ${result.date}, ${result.zone} → ${OUT_REL}`)
else console.log(`night-log: no verifiable times; wrote {} → ${OUT_REL}`)
process.exit(0)
