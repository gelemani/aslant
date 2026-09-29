#!/usr/bin/env node
// Aslant · poster and OG capture from the live renderer (brief 7.5, 4.14, section 8 QA).
//
// Drives headless Chrome over the Chrome DevTools Protocol from Node (Node 22+ has a global WebSocket;
// nothing to install). For each target it sets the device metrics, navigates to a ?still= route,
// waits for window.__aslantStillReady (set by the page after two rendered frames), optionally prepares
// the scene, screenshots, and encodes with sharp (bundled with Next) within the byte budget.
//
//   node scripts/capture.mjs                      all targets against http://localhost:3456 (next start)
//   node scripts/capture.mjs --base http://localhost:3000 --only hero-desktop,og
//   node scripts/capture.mjs --check              only verify the files already on disk (size, dimensions)
//   node scripts/capture.mjs --dry --keep /tmp/x  capture and keep PNGs, write nothing into the project
//
// Options: --base URL · --only a,b · --out-root DIR (default: project root) · --keep DIR (raw PNGs)
//          --chrome PATH · --port 9333 · --timeout 45000 (ms per target) · --dry · --check · --quiet
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const argv = process.argv.slice(2)
const opt = {}
for (let i = 0; i < argv.length; i++) {
  const a = argv[i]
  if (!a.startsWith('--')) continue
  const k = a.slice(2)
  const v = argv[i + 1]
  if (v === undefined || v.startsWith('--')) opt[k] = true
  else { opt[k] = v; i++ }
}
const BASE = String(opt.base || 'http://localhost:3456').replace(/\/$/, '')
const OUT_ROOT = path.resolve(opt['out-root'] || ROOT)
const KEEP = opt.keep ? path.resolve(String(opt.keep)) : null
const CHROME = String(opt.chrome || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
const PORT = Number(opt.port || 9333)
const TIMEOUT = Number(opt.timeout || 45000)
const log = (...a) => { if (!opt.quiet) console.error('[capture]', ...a) }

// ── targets ────────────────────────────────────────────────────────────────────────────────────────
// Posters are the light only: html[data-still] hides the UI (visibility: hidden), so the frame is the wall.
// hero-desktop: the 1440 × 900 split composition rendered at DPR 4/3 → 1920 × 1200.
// hero-mobile:  390 × 844 at DPR 2 → 780 × 1688 (stacked composition).
// relief:       clear-glass with the relief shown over the whole pane, cropped to the glass anchor.
// bench:        the-bend at beat 3 (fan open), cropped to the bench band anchor (its aspect).
// og:           1200 × 630 still=og composition (wordmark and H1 stay visible in og mode).
const TARGETS = [
  {
    name: 'hero-desktop', url: '/?still=first-light&tier=3', w: 1440, h: 900, dpr: 4 / 3,
    out: 'public/posters/hero-desktop.webp', fmt: 'webp', maxBytes: 120 * 1024, expect: [1920, 1200],
  },
  {
    name: 'hero-mobile', url: '/?still=first-light&tier=3', w: 390, h: 844, dpr: 2, mobile: true,
    out: 'public/posters/hero-mobile.webp', fmt: 'webp', maxBytes: 90 * 1024, expect: [780, 1688],
  },
  {
    name: 'relief', url: '/?still=clear-glass&tier=3', w: 1440, h: 900, dpr: 2,
    // In still mode the loupe island sets light.loupe.relief = 1 and requests the relief itself (WP5):
    // the whole pane renders in bicolour schlieren. Wait for the worker job and one upload.
    settle: 4000, crop: '[data-light-anchor="clear-glass"]', maxWidth: 1200,
    out: 'public/posters/relief.webp', fmt: 'webp', maxBytes: 80 * 1024,
  },
  {
    name: 'bench', url: '/?still=the-bend&tier=3', w: 1440, h: 900, dpr: 2,
    // In still mode BenchFigure forces p = 1 (beat 3: relief 1, fan 1) (WP5).
    settle: 4000, crop: '[data-light-anchor="the-bend"]', maxWidth: 1920,
    out: 'public/posters/bench.webp', fmt: 'webp', maxBytes: 80 * 1024,
  },
  {
    name: 'og', url: '/?still=og&tier=3', w: 1200, h: 630, dpr: 1,
    out: 'app/opengraph-image.png', fmt: 'png', maxBytes: 1024 * 1024, expect: [1200, 630],
    alt: { file: 'app/opengraph-image.alt.txt', text: 'A slant of sun on a grey wall with the word aslant made of light.' },
  },
]

// ── check mode ─────────────────────────────────────────────────────────────────────────────────────
async function checkFiles(list) {
  const rows = []
  for (const t of list) {
    const f = path.join(OUT_ROOT, t.out)
    if (!fs.existsSync(f)) { rows.push({ name: t.name, ok: false, why: 'missing' }); continue }
    const bytes = fs.statSync(f).size
    const m = await sharp(f).metadata()
    const dimOk = !t.expect || (m.width === t.expect[0] && m.height === t.expect[1])
    const flat = await isFlat(f)
    rows.push({ name: t.name, ok: bytes <= t.maxBytes && dimOk && !flat, bytes, kb: +(bytes / 1024).toFixed(1), budgetKb: t.maxBytes / 1024, w: m.width, h: m.height, format: m.format, placeholder: flat })
  }
  return rows
}
async function isFlat(f) {
  const s = await sharp(f).stats()
  return s.channels.slice(0, 3).every(c => c.stdev < 0.75)   // the flat #3A4142 placeholders
}

// ── tiny CDP client ────────────────────────────────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms))
async function launchChrome() {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'aslant-capture-'))
  const args = [
    '--headless=new', '--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--hide-scrollbars',
    '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--mute-audio',
    `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, 'about:blank',
  ]
  const proc = spawn(CHROME, args, { stdio: ['ignore', 'ignore', 'ignore'] })
  let version = null
  for (let i = 0; i < 100 && !version; i++) {
    await sleep(150)
    try { version = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json() } catch { /* not up yet */ }
  }
  if (!version) { proc.kill('SIGKILL'); throw new Error('Chrome did not open its DevTools port') }
  const close = () => { try { proc.kill('SIGTERM') } catch { /* gone */ } ; try { fs.rmSync(profile, { recursive: true, force: true }) } catch { /* ignore */ } }
  return { proc, close }
}
async function connectPage() {
  const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()
  const page = list.find(t => t.type === 'page')
  if (!page) throw new Error('no page target')
  const ws = new WebSocket(page.webSocketDebuggerUrl)
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej })
  let id = 0
  const pending = new Map()
  const listeners = new Map()
  ws.onmessage = ev => {
    const msg = JSON.parse(typeof ev.data === 'string' ? ev.data : ev.data.toString())
    if (msg.id && pending.has(msg.id)) {
      const { res, rej } = pending.get(msg.id); pending.delete(msg.id)
      if (msg.error) rej(new Error(msg.error.message)); else res(msg.result)
    } else if (msg.method) (listeners.get(msg.method) || []).forEach(fn => fn(msg.params))
  }
  const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })) })
  const on = (method, fn) => { if (!listeners.has(method)) listeners.set(method, []); listeners.get(method).push(fn) }
  const once = (method, ms) => new Promise((res, rej) => {
    const t = setTimeout(() => rej(new Error(`timeout waiting for ${method}`)), ms)
    on(method, p => { clearTimeout(t); res(p) })
  })
  const evaluate = async (expression, awaitPromise = true) => {
    const r = await send('Runtime.evaluate', { expression, awaitPromise, returnByValue: true })
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text)
    return r.result.value
  }
  return { ws, send, on, once, evaluate }
}

// ── encode within budget ───────────────────────────────────────────────────────────────────────────
async function encode(png, t) {
  let img = sharp(png)
  const meta = await img.metadata()
  if (t.maxWidth && meta.width > t.maxWidth) img = img.resize({ width: t.maxWidth })
  const raw = await img.toBuffer()
  if (t.fmt === 'png') {
    const buf = await sharp(raw).png({ compressionLevel: 9, effort: 10 }).toBuffer()
    return { buf, q: 'png' }
  }
  for (const q of [92, 88, 84, 80, 76, 72, 68, 64, 60, 56, 52, 48, 44, 40, 36]) {
    const buf = await sharp(raw).webp({ quality: q, effort: 6, smartSubsample: true }).toBuffer()
    if (buf.length <= t.maxBytes) return { buf, q }
  }
  const buf = await sharp(raw).webp({ quality: 30, effort: 6, smartSubsample: true }).toBuffer()
  return { buf, q: 30 }
}

async function captureOne(cdp, t) {
  const errors = []
  const onErr = p => errors.push((p.exceptionDetails?.exception?.description || p.exceptionDetails?.text || '').slice(0, 300))
  const onConsole = p => { if (p.type === 'error') errors.push(p.args.map(a => a.value ?? a.description ?? '').join(' ').slice(0, 300)) }
  cdp.on('Runtime.exceptionThrown', onErr)
  cdp.on('Runtime.consoleAPICalled', onConsole)
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: t.w, height: t.h, deviceScaleFactor: t.dpr, mobile: !!t.mobile, screenWidth: t.w, screenHeight: t.h })
  const loaded = cdp.once('Page.loadEventFired', TIMEOUT)
  await cdp.send('Page.navigate', { url: BASE + t.url })
  await loaded
  const t0 = Date.now()
  let ready = false
  while (Date.now() - t0 < TIMEOUT) {
    ready = await cdp.evaluate('window.__aslantStillReady === true').catch(() => false)
    if (ready) break
    await sleep(200)
  }
  if (!ready) throw new Error(`${t.name}: window.__aslantStillReady never became true within ${TIMEOUT} ms (errors: ${errors.slice(0, 3).join(' | ') || 'none'})`)
  const state = await cdp.evaluate(`({ still: document.documentElement.dataset.still || null, webgl: document.documentElement.dataset.webgl || null, tier: document.documentElement.dataset.tier || null, canvas: !!document.querySelector('canvas') })`)
  if (state.webgl !== 'ready' || !state.canvas) throw new Error(`${t.name}: not a live render (data-webgl=${state.webgl}, canvas=${state.canvas}); refusing to capture a fallback as a poster`)
  let prepared = null
  if (t.prepare) {
    prepared = await cdp.evaluate(t.prepare)
    // wait for two more rendered frames after the change
    await cdp.evaluate(`new Promise(r => { let n = 0; const f = () => (++n >= 3 ? r(true) : requestAnimationFrame(f)); requestAnimationFrame(f) })`)
  }
  await sleep(t.settle || 500)
  let clip
  if (t.crop) {
    const r = await cdp.evaluate(`(() => { const e = document.querySelector(${JSON.stringify(t.crop)}); if (!e) return null; const b = e.getBoundingClientRect(); return { x: b.left, y: b.top, width: b.width, height: b.height } })()`)
    if (!r || r.width < 4 || r.height < 4) throw new Error(`${t.name}: crop element ${t.crop} not found or empty`)
    const x = Math.max(0, r.x), y = Math.max(0, r.y)
    clip = { x, y, width: Math.min(t.w - x, r.width - (x - r.x)), height: Math.min(t.h - y, r.height - (y - r.y)), scale: 1 }
  }
  // Always grab the full frame and crop with sharp: a CDP clip makes Chrome composite a fresh frame,
  // and with frameloop 'never' the WebGL canvas is not redrawn for it, so the clip comes back flat.
  const shot = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false, fromSurface: true })
  let png = Buffer.from(shot.data, 'base64')
  if (KEEP && clip) fs.writeFileSync(path.join(KEEP, `${t.name}-full.png`), png)
  if (clip) {
    const m = await sharp(png).metadata()
    const k = m.width / t.w
    const left = Math.round(clip.x * k), top = Math.round(clip.y * k)
    const width = Math.min(m.width - left, Math.round(clip.width * k)), height = Math.min(m.height - top, Math.round(clip.height * k))
    png = await sharp(png).extract({ left, top, width, height }).png().toBuffer()
  }
  return { png, state, prepared, clip, errors }
}

async function main() {
  const only = opt.only ? String(opt.only).split(',').map(s => s.trim()) : null
  const list = TARGETS.filter(t => !only || only.includes(t.name))
  if (!list.length) { console.error('no targets match', opt.only); process.exit(2) }
  if (opt.check) {
    const rows = await checkFiles(list)
    console.log(JSON.stringify({ check: rows }, null, 2))
    process.exit(rows.every(r => r.ok) ? 0 : 1)
  }
  if (KEEP) fs.mkdirSync(KEEP, { recursive: true })
  const results = []
  // One browser per target, closed after each run (7.6: one browser at a time, closed after each check).
  for (const t of list) {
    let chrome
    const started = Date.now()
    try {
      chrome = await launchChrome()
      const cdp = await connectPage()
      await cdp.send('Page.enable'); await cdp.send('Runtime.enable')
      log(t.name, '→', BASE + t.url, `${t.w}×${t.h}@${+t.dpr.toFixed(3)}`)
      const { png, state, prepared, clip, errors } = await captureOne(cdp, t)
      if (KEEP) fs.writeFileSync(path.join(KEEP, `${t.name}.png`), png)
      // A flat frame means the relief or bench had not drawn yet: never write it over a poster.
      if (await isFlat(png)) throw new Error(`${t.name}: captured frame is flat (nothing drawn yet); not writing it`)
      const { buf, q } = await encode(png, t)
      const m = await sharp(buf).metadata()
      const within = buf.length <= t.maxBytes
      const dimOk = !t.expect || (m.width === t.expect[0] && m.height === t.expect[1])
      if (!opt.dry) {
        const f = path.join(OUT_ROOT, t.out)
        fs.mkdirSync(path.dirname(f), { recursive: true })
        fs.writeFileSync(f, buf)
        if (t.alt) fs.writeFileSync(path.join(OUT_ROOT, t.alt.file), t.alt.text)
      }
      results.push({ name: t.name, ok: within && dimOk, file: opt.dry ? null : t.out, kb: +(buf.length / 1024).toFixed(1), budgetKb: t.maxBytes / 1024, quality: q, w: m.width, h: m.height, state, prepared, clip, consoleErrors: errors.length, firstErrors: errors.slice(0, 3), ms: Date.now() - started })
      cdp.ws.close()
    } catch (e) {
      results.push({ name: t.name, ok: false, error: String(e && e.message || e), ms: Date.now() - started })
    } finally {
      if (chrome) chrome.close()
      await sleep(400)
    }
  }
  console.log(JSON.stringify({ base: BASE, results }, null, 2))
  process.exit(results.every(r => r.ok) ? 0 : 1)
}

main().catch(e => { console.error(e); process.exit(1) })
