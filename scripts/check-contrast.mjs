#!/usr/bin/env node
// Aslant · contrast from rendered pixels (brief 7.5, 2.4 un-ban 1, 4.3 scrims, 9.3 Accessibility).
//
// For each chapter still (?still=<id>: the canvas frozen at the chapter's rest, text visibility:hidden so its
// boxes keep their layout) and for points along every chapter-to-chapter blend (normal page, text made
// transparent), it screenshots the page, takes every visible text node's line boxes, reads the rendered
// pixels behind them and measures the WCAG 2.x contrast against the text's own computed colour.
// Worst case per text: the p98 brightest pixel for light text, the p2 darkest for dark text.
// Threshold: 3:1 for text ≥ 24 px, 4.5:1 otherwise. Text on an opaque DOM background (buttons, the
// menu panel) is measured against that background (the still hides it together with the text).
//
//   node scripts/check-contrast.mjs [--base http://localhost:3456] [--vp 1440x900,1280x800]
//        [--chapters first-light,clear-glass,...] [--no-transitions] [--ramp 0.25,0.5,0.75]
//        [--json out.json] [--keep DIR] [--timeout 45000] [--chrome PATH] [--port 9334]
// Exit 0 when nothing fails. Uses the Chrome DevTools Protocol directly (no dependencies besides sharp).
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import sharp from 'sharp'

const argv = process.argv.slice(2)
const opt = {}
for (let i = 0; i < argv.length; i++) {
  const a = argv[i]
  if (!a.startsWith('--')) continue
  const v = argv[i + 1]
  if (v === undefined || v.startsWith('--')) opt[a.slice(2)] = true
  else { opt[a.slice(2)] = v; i++ }
}
const BASE = String(opt.base || 'http://localhost:3456').replace(/\/$/, '')
const VPS = String(opt.vp || '1440x900,1280x800').split(',').map(s => s.split('x').map(Number))
const ALL = ['first-light', 'clear-glass', 'the-bend', 'appointment', 'write-yours', 'ledger', 'commission', 'dusk']
const CHAPTERS = opt.chapters ? String(opt.chapters).split(',') : ALL
const RAMP = String(opt.ramp || '0.25,0.5,0.75').split(',').map(Number)
const TIMEOUT = Number(opt.timeout || 45000)
const CHROME = String(opt.chrome || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
const PORT = Number(opt.port || 9334)
const KEEP = opt.keep ? path.resolve(String(opt.keep)) : null
if (KEEP) fs.mkdirSync(KEEP, { recursive: true })
const log = (...a) => console.error('[contrast]', ...a)
const sleep = ms => new Promise(r => setTimeout(r, ms))

// ── colour maths (WCAG 2.x) ────────────────────────────────────────────────────────────────────────
const lin = c => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 }
const LUT = Float64Array.from({ length: 256 }, (_, i) => lin(i))
const lum = (r, g, b) => 0.2126 * LUT[r] + 0.7152 * LUT[g] + 0.0722 * LUT[b]
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
const hex = rgb => '#' + rgb.map(v => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase()

// ── CDP ────────────────────────────────────────────────────────────────────────────────────────────
async function launch() {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'aslant-contrast-'))
  const proc = spawn(CHROME, ['--headless=new', '--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--hide-scrollbars',
    '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--mute-audio',
    `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' })
  let up = false
  for (let i = 0; i < 100 && !up; i++) { await sleep(150); try { await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json(); up = true } catch { /* wait */ } }
  if (!up) { proc.kill('SIGKILL'); throw new Error('Chrome did not open its DevTools port') }
  const page = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find(t => t.type === 'page')
  const ws = new WebSocket(page.webSocketDebuggerUrl)
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej })
  let id = 0
  const pending = new Map(), listeners = new Map()
  ws.onmessage = ev => {
    const msg = JSON.parse(String(ev.data))
    if (msg.id && pending.has(msg.id)) { const p = pending.get(msg.id); pending.delete(msg.id); msg.error ? p.rej(new Error(msg.error.message)) : p.res(msg.result) }
    else if (msg.method) (listeners.get(msg.method) || []).forEach(f => f(msg.params))
  }
  const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })) })
  const on = (m, f) => { if (!listeners.has(m)) listeners.set(m, []); listeners.get(m).push(f) }
  const evaluate = async expr => {
    const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text)
    return r.result.value
  }
  const close = () => { try { ws.close() } catch { /* */ } try { proc.kill('SIGTERM') } catch { /* */ } try { fs.rmSync(profile, { recursive: true, force: true }) } catch { /* */ } }
  await send('Page.enable'); await send('Runtime.enable')
  return { send, on, evaluate, close }
}
async function navigate(cdp, url) {
  let fired = false
  cdp.on('Page.loadEventFired', () => { fired = true })
  await cdp.send('Page.navigate', { url })
  const t0 = Date.now()
  while (!fired && Date.now() - t0 < TIMEOUT) await sleep(100)
}
const nextFrames = n => `new Promise(r => { let k = 0; const f = () => (++k >= ${n} ? r(true) : requestAnimationFrame(f)); requestAnimationFrame(f) })`

// Runs in the page: every visible text node's line boxes, colour, size, and opaque DOM background if any.
const COLLECT = `(() => {
  const vw = innerWidth, vh = innerHeight, items = [];
  const parse = c => { const m = c && c.match(/rgba?\\(([^)]+)\\)/); if (!m) return null; const p = m[1].split(/[\\s,\\/]+/).filter(Boolean).map(Number); return { rgb: p.slice(0, 3), a: p.length > 3 ? p[3] : 1 } };
  // mask-image on an ancestor (the commission form wiping into the nav's shade): the alpha of a vertical
  // linear-gradient mask at viewport y, or null when the mask is not one this check can evaluate.
  const splitTop = s => { const out = []; let d = 0, cur = ''; for (const ch of s) { if (ch === '(') d++; if (ch === ')') d--; if (ch === ',' && !d) { out.push(cur.trim()); cur = '' } else cur += ch } out.push(cur.trim()); return out };
  const maskAt = (a, cs, y) => {
    const m = cs.maskImage && cs.maskImage !== 'none' ? cs.maskImage : cs.webkitMaskImage;
    if (!m || m === 'none') return 1;
    if (!m.startsWith('linear-gradient(') || !m.endsWith(')')) return null;
    const size = (cs.maskSize || 'auto').trim(), pos = (cs.maskPosition || '0% 0%').trim();
    if (!/^auto( auto)?$/.test(size) || !/^0(%|px)? 0(%|px)?$/.test(pos)) return null;
    const parts = splitTop(m.slice(16, -1));
    let down = true;
    if (/^(to |-?[0-9.]+deg|-?[0-9.]+turn)/.test(parts[0])) {
      const d = parts.shift();
      if (d === 'to top' || d === '0deg') down = false; else if (d !== 'to bottom' && d !== '180deg') return null;
    }
    const box = a.getBoundingClientRect();
    if (box.height <= 0) return 1;
    const stops = [];
    for (const p of parts) {
      const c = parse(p) || (p.startsWith('transparent') ? { rgb: [0, 0, 0], a: 0 } : null);
      if (!c) return null;
      const tail = p.slice(p.startsWith('transparent') ? 11 : p.lastIndexOf(')') + 1).trim().split(/ +/).filter(Boolean);
      const at = tail.map(t => t.endsWith('px') ? parseFloat(t) : t.endsWith('%') ? parseFloat(t) / 100 * box.height : NaN);
      if (at.some(Number.isNaN)) return null;
      if (!at.length) stops.push({ a: c.a, at: null }); else for (const v of at) stops.push({ a: c.a, at: v });
    }
    if (!stops.length) return null;
    if (stops[0].at === null) stops[0].at = 0;
    if (stops[stops.length - 1].at === null) stops[stops.length - 1].at = box.height;
    for (let i = 1; i < stops.length; i++) { if (stops[i].at === null) { let j = i; while (stops[j].at === null) j++; for (let k = i; k < j; k++) stops[k].at = stops[i - 1].at + (stops[j].at - stops[i - 1].at) * (k - i + 1) / (j - i + 1) } stops[i].at = Math.max(stops[i].at, stops[i - 1].at) }
    const off = down ? y - box.top : box.bottom - y;
    if (off <= stops[0].at) return stops[0].a;
    for (let i = 1; i < stops.length; i++) if (off <= stops[i].at) { const s0 = stops[i - 1], s1 = stops[i], span = s1.at - s0.at; return span > 0 ? s0.a + (s1.a - s0.a) * (off - s0.at) / span : s1.a }
    return stops[stops.length - 1].a;
  };
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = w.nextNode())) {
    const text = n.nodeValue.replace(/\\s+/g, ' ').trim();
    if (!text) continue;
    const el = n.parentElement;
    if (!el || el.closest('script,style,noscript,template,title,canvas')) continue;
    let op = 1, bg = null, hidden = false, scrim = null, decorative = false;
    const masks = [];
    for (let a = el; a && a !== document.documentElement; a = a.parentElement) {
      const cs = getComputedStyle(a);
      op *= parseFloat(cs.opacity);
      if ((cs.maskImage && cs.maskImage !== 'none') || (cs.webkitMaskImage && cs.webkitMaskImage !== 'none')) masks.push([a, cs]);
      if (cs.display === 'none') hidden = true;
      if (cs.position === 'absolute' && parseFloat(cs.width) <= 1 && parseFloat(cs.height) <= 1) hidden = true;
      if (!scrim && a.hasAttribute('data-scrim')) scrim = (a.id || a.tagName.toLowerCase()) + (a.className && typeof a.className === 'string' ? '.' + a.className.split(' ')[0] : '');
      if (a.getAttribute('aria-hidden') === 'true') decorative = true;
      if (!bg && a !== document.body) { const c = parse(cs.backgroundColor); if (c && c.a >= 0.9) bg = c.rgb; }
    }
    if (hidden || op < 0.05) continue;
    const r = document.createRange(); r.selectNodeContents(n);
    const rects = [...r.getClientRects()].map(b => ({ x: Math.max(0, b.left), y: Math.max(0, b.top), x2: Math.min(vw, b.right), y2: Math.min(vh, b.bottom) }))
      .filter(b => b.x2 - b.x >= 2 && b.y2 - b.y >= 4)
      // masked out: a line box whose centre an ancestor's mask hides (alpha < 0.5) is not painted there
      .filter(b => masks.every(([a, cs]) => { const k = maskAt(a, cs, (b.y + b.y2) / 2); return k === null || k >= 0.5 }));
    if (!rects.length) continue;
    // occlusion: another element (the nav over scrolled text, a panel over a label) covers the line box centre
    const occluded = !document.documentElement.dataset.still && rects.every(b => { const t = document.elementFromPoint((b.x + b.x2) / 2, (b.y + b.y2) / 2); return t && t !== el && !el.contains(t) && !t.contains(el) });
    if (occluded) continue;
    const inHeader = !!el.closest('header');
    const hb = document.querySelector('header')?.getBoundingClientRect();
    if (!inHeader && hb && hb.height > 0 && rects.some(b => b.y < hb.bottom && b.y2 > hb.top && b.x < hb.right && b.x2 > hb.left)) continue; // scrolled under the nav
    const cs = getComputedStyle(el);
    if (!document.documentElement.dataset.still && cs.visibility !== 'visible') continue;
    const col = parse(cs.color);
    if (!col || col.a < 0.05) continue;
    const chapter = el.closest('[data-chapter]')?.getAttribute('data-chapter') || (el.closest('header,nav') ? 'nav' : null);
    const footmark = !!el.closest('footer') && decorative && text.toLowerCase() === 'aslant';
    items.push({ text: text.slice(0, 70), tag: el.tagName.toLowerCase(), cls: typeof el.className === 'string' ? el.className.split(' ')[0] : '', color: col.rgb, alpha: col.a, size: parseFloat(cs.fontSize), weight: cs.fontWeight, rects, bg, scrim, chapter, decorative, exempt: footmark, inHeader });
  }
  return items;
})()`

async function shoot(cdp) {
  const s = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false })
  const buf = Buffer.from(s.data, 'base64')
  const { data, info } = await sharp(buf).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  return { buf, data, w: info.width, h: info.height }
}

async function measure(img, items, label) {
  const results = []
  for (const it of items) {
    const tl = lum(...it.color.map(Math.round))
    const limit = it.size >= 24 ? 3 : 4.5
    if (it.bg) {
      const c = ratio(tl, lum(...it.bg.map(Math.round)))
      results.push({ ...it, rects: it.rects, source: 'dom-bg', bgHex: hex(it.bg), textHex: hex(it.color), ratio: +c.toFixed(2), limit, pass: c >= limit || it.exempt })
      continue
    }
    const ls = []
    for (const r of it.rects) {
      const x0 = Math.floor(r.x), y0 = Math.floor(r.y), x1 = Math.min(img.w, Math.ceil(r.x2)), y1 = Math.min(img.h, Math.ceil(r.y2))
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const i = (y * img.w + x) * 3; ls.push(lum(img.data[i], img.data[i + 1], img.data[i + 2])) }
    }
    if (!ls.length) continue
    ls.sort((a, b) => a - b)
    const med = ls[Math.floor(ls.length / 2)]
    const light = tl > med
    const worst = light ? ls[Math.min(ls.length - 1, Math.floor(ls.length * 0.98))] : ls[Math.floor(ls.length * 0.02)]
    const c = ratio(tl, worst)
    const cMed = ratio(tl, med)
    results.push({ ...it, rects: it.rects, source: 'pixels', textHex: hex(it.color), bgMedianLum: +med.toFixed(4), bgWorstLum: +worst.toFixed(4), ratio: +c.toFixed(2), ratioMedian: +cMed.toFixed(2), limit, pass: c >= limit || it.exempt, px: ls.length })
  }
  const navOver = results.filter(r => !r.pass && r.inHeader && r.source === 'pixels')
  for (const r of navOver) r.pass = true // nav text over content scrolling beneath it: transient, reported separately
  const fails = results.filter(r => !r.pass)
  if (KEEP && img.buf) await annotate(img, results, label).catch(() => {})
  const strip = r => ({ ...r, rects: undefined })
  return { label, n: results.length, fails: fails.length, worst: results.filter(r => !r.exempt).sort((a, b) => a.ratio / a.limit - b.ratio / b.limit).slice(0, 6).map(strip), failures: fails.map(strip), navOver: navOver.map(strip) }
}

async function annotate(img, results, label) {
  const boxes = results.flatMap(r => r.rects.map(b => `<rect x="${b.x}" y="${b.y}" width="${b.x2 - b.x}" height="${b.y2 - b.y}" fill="none" stroke="${r.pass ? '#3c3' : '#f33'}" stroke-width="1"/>`)).join('')
  const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${img.w}" height="${img.h}">${boxes}</svg>`)
  const f = path.join(KEEP, `annot-${label.replace(/[^a-z0-9@.-]/gi, '_')}-${img.w}.png`)
  await sharp(img.buf).composite([{ input: svg }]).png().toFile(f)
}

async function scrollTo(cdp, y) {
  await cdp.evaluate(`(() => { const l = window.__lenis; if (l && l.scrollTo) l.scrollTo(${y}, { immediate: true, force: true }); else window.scrollTo(0, ${y}); window.dispatchEvent(new Event('scroll')); return true })()`)
}

async function runViewport(w, h) {
  const out = { viewport: `${w}x${h}`, stills: [], transitions: [], errors: [] }
  const cdp = await launch()
  cdp.on('Runtime.exceptionThrown', p => out.errors.push((p.exceptionDetails?.exception?.description || '').slice(0, 200)))
  try {
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: w < 768 })
    // 1. chapter stills
    for (const id of (opt['no-stills'] ? [] : CHAPTERS)) {
      await navigate(cdp, `${BASE}/?still=${id}&qa&hud=0&tier=3`)
      const t0 = Date.now(); let ready = false
      while (Date.now() - t0 < TIMEOUT) { ready = await cdp.evaluate('window.__aslantStillReady === true').catch(() => false); if (ready) break; await sleep(200) }
      const st = await cdp.evaluate(`({ still: document.documentElement.dataset.still || null, webgl: document.documentElement.dataset.webgl || null, y: scrollY })`)
      if (!ready) { out.stills.push({ label: `still:${id}`, error: 'window.__aslantStillReady never set', state: st }); continue }
      await sleep(300)
      const img = await shoot(cdp)
      if (KEEP) fs.writeFileSync(path.join(KEEP, `${w}x${h}-still-${id}.png`), img.buf)
      const items = (await cdp.evaluate(COLLECT)).filter(it => !it.chapter || it.chapter === id || it.chapter === 'nav')
      out.stills.push({ ...(await measure(img, items, `still:${id}`)), state: st })
    }
    // 2. transitions (normal page; text made transparent, backgrounds kept)
    if (!opt['no-transitions']) {
      await navigate(cdp, `${BASE}/?qa&hud=0&idle=0&tier=3`)
      const t0 = Date.now()
      while (Date.now() - t0 < TIMEOUT) { const s = await cdp.evaluate(`document.documentElement.dataset.webgl`).catch(() => null); if (s === 'ready' || s === 'off' || s === 'failed') break; await sleep(250) }
      await sleep(4000) // let the intro finish
      const hasConductor = await cdp.evaluate(`!!(window.__aslant && window.__aslant.conductor && window.__aslant.conductor.exact)`)
      if (!hasConductor) out.errors.push('window.__aslant.conductor missing: transitions not sampled (needs ?qa hooks, 4.14)')
      else {
        const max = await cdp.evaluate('document.documentElement.scrollHeight - innerHeight')
        const step = Math.max(8, Math.round(h * 0.02))
        const samples = []
        let reloads = 0
        for (let y = 0; y <= max; y += step) {
          await scrollTo(cdp, y); await cdp.evaluate(nextFrames(2))
          let e = null
          for (let k = 0; k < 60 && !e; k++) {
            e = await cdp.evaluate(`(() => { const A = window.__aslant; if (!A || !A.conductor || document.documentElement.dataset.webgl !== 'ready') return null; const c = A.conductor.exact; return { i: c.index, id: c.id, b: c.blend } })()`).catch(() => null)
            if (!e) { reloads++; await sleep(500); await scrollTo(cdp, y); await cdp.evaluate(nextFrames(2)).catch(() => {}) }
          }
          if (!e) throw new Error('page lost its ?qa hooks or WebGL during sampling (dev reload?)')
          samples.push({ y, ...e })
        }
        if (reloads) out.errors.push(`sampling waited ${reloads} times for hooks/WebGL (page reloaded or webgl not ready)`)
        // transitions: maximal runs of 0 < blend < 1 (plus index flips inside them)
        const runs = []
        let cur = null, prev = null
        for (const s of samples) {
          const moving = s.b > 0.001 && s.b < 0.999
          if (moving) { if (!cur) cur = { from: prev ? prev.id : s.id, pts: [] }; cur.pts.push(s) } else if (cur) { cur.to = s.id; runs.push(cur); cur = null }
          prev = s
        }
        for (const r of runs) {
          for (const target of RAMP) {
            // blend value is measured on the exact chapter's ramp; pick the sample nearest to the target
            const best = r.pts.reduce((a, s) => (Math.abs(s.b - target) < Math.abs(a.b - target) ? s : a), r.pts[0])
            await scrollTo(cdp, best.y)
            await sleep(1700) // the smooth state (λ 5.2) settles on the exact one
            // a dev reload mid-run leaves the canvas blank while WebGL comes back: wait, then settle again
            if ((await cdp.evaluate('document.documentElement.dataset.webgl').catch(() => null)) === 'pending') {
              const tw = Date.now()
              while (Date.now() - tw < TIMEOUT && (await cdp.evaluate('document.documentElement.dataset.webgl').catch(() => null)) !== 'ready') await sleep(250)
              await sleep(1500); await scrollTo(cdp, best.y); await sleep(1700)
            }
            await cdp.evaluate(`(() => { let s = document.getElementById('__qa_hide'); if (!s) { s = document.createElement('style'); s.id = '__qa_hide'; document.head.appendChild(s) } s.textContent = '*:not(canvas){transition:none!important;animation-play-state:paused!important;color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important;text-decoration-color:transparent!important;caret-color:transparent!important} ::placeholder{color:transparent!important}'; return true })()`)
            await cdp.evaluate(nextFrames(3))
            await sleep(120)
            const img = await shoot(cdp)
            await cdp.evaluate(`(() => { const s = document.getElementById('__qa_hide'); if (s) s.remove(); return true })()`)
            const items = await cdp.evaluate(COLLECT) // colours are read after the style is removed
            const label = `${r.from}→${r.to}@${target}`
            if (KEEP) fs.writeFileSync(path.join(KEEP, `${w}x${h}-blend-${r.from}-${r.to}-${target}.png`), img.buf)
            const webgl = await cdp.evaluate('document.documentElement.dataset.webgl')
            out.transitions.push({ ...(await measure(img, items.map(it => ({ ...it, bg: null })), label)), y: best.y, blend: best.b, webgl })
          }
        }
      }
    }
  } finally { cdp.close(); await sleep(300) }
  return out
}

async function main() {
  const report = { base: BASE, when: new Date().toISOString(), viewports: [] }
  for (const [w, h] of VPS) { log(`viewport ${w}x${h}`); report.viewports.push(await runViewport(w, h)) }
  const all = report.viewports.flatMap(v => [...v.stills, ...v.transitions])
  const failures = all.reduce((s, r) => s + (r.fails || 0), 0)
  const errors = all.filter(r => r.error).length + report.viewports.reduce((s, v) => s + v.errors.length, 0)
  report.ok = failures === 0 && errors === 0
  if (opt.json) fs.writeFileSync(path.resolve(String(opt.json)), JSON.stringify(report, null, 2))
  for (const v of report.viewports) {
    console.log(`== ${v.viewport}`)
    for (const r of [...v.stills, ...v.transitions]) {
      if (r.error) { console.log(`  ${r.label}: ERROR ${r.error}`); continue }
      const worst = r.worst[0]
      console.log(`  ${r.label}${r.webgl && r.webgl !== 'ready' ? ' [webgl ' + r.webgl + ']' : ''}: ${r.fails ? 'FAIL' : 'pass'} (${r.n} texts${worst ? `, worst ${worst.ratio}:1 vs ${worst.limit} "${worst.text}"` : ''})`)
      for (const f of (r.navOver || [])) console.log(`     ~ nav over content ${f.ratio}:1 "${f.text}"`)
      for (const f of r.failures.slice(0, 8)) console.log(`     ✗ ${f.ratio}:1 < ${f.limit} [${f.source}] ${f.textHex} ${f.size}px "${f.text}"${f.scrim ? '' : ' (no data-scrim)'}`)
    }
    for (const e of v.errors) console.log('  error:', e)
  }
  console.log(report.ok ? 'check-contrast: PASS' : `check-contrast: FAIL (${failures} failing texts, ${errors} errors)`)
  process.exit(report.ok ? 0 : 1)
}
main().catch(e => { console.error(e); process.exit(2) })
