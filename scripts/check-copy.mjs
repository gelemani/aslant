#!/usr/bin/env node
// Aslant · copy check (brief 7.5, 1.3, 2.4, 9.3 "Copy and honesty").
//
// Fetches the server-rendered HTML (production: next start) and its CSS, then fails on:
//   · em or en dashes in visible text or text attributes
//   · banned words (06-anti-slop §4A and brief 1.3)
//   · more than one middle dot in a text node
//   · background-clip: text (and backdrop-filter) in any stylesheet
//   · rhetorical-question headings, more than one h1
//   · a missing or altered line of final copy (the verbatim strings of brief section 5)
//   · a sunset time, a city guess or a "Thank you" in the prerendered HTML
// and reports negation-then-affirmation candidates (exactly two licensed reveals, 2.4 un-ban 6).
//
//   node scripts/check-copy.mjs [--url http://localhost:3456/] [--mode preview|endpoint|mailto] [--src] [--json]
//   --src also scans app/ and src/ for background-clip: text, backdrop-filter and dashes inside string literals.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const argv = process.argv.slice(2)
const opt = {}
for (let i = 0; i < argv.length; i++) {
  const a = argv[i]
  if (!a.startsWith('--')) continue
  const v = argv[i + 1]
  if (v === undefined || v.startsWith('--')) opt[a.slice(2)] = true
  else { opt[a.slice(2)] = v; i++ }
}
const URL_ = String(opt.url || 'http://localhost:3456/')
const MODE = String(opt.mode || 'preview')

// ── banned vocabulary ──────────────────────────────────────────────────────────────────────────────
const BANNED = [
  'unleash', 'unlock', 'unlocks', 'elevate', 'elevates', 'empower', 'empowers', 'seamless', 'seamlessly', 'revolutionize', 'revolutionise',
  'revolutionary', 'transform', 'transforms', 'transformative', 'cutting-edge', 'next-gen', 'next-level', 'state-of-the-art',
  'game-changer', 'game-changing', 'innovative', 'innovation', 'groundbreaking', 'reimagine', 'reimagined', 'supercharge', 'turbocharge',
  'effortless', 'effortlessly', 'leverage', 'harness', 'harnesses', 'utilize', 'utilise', 'streamline', 'optimize', 'optimise',
  'synergy', 'holistic', 'robust', 'scalable', 'delve', 'tapestry', 'realm', 'landscape', 'testament', 'pivotal', 'multifaceted',
  'intricate', 'meticulous', 'meticulously', 'paramount', 'foster', 'navigate', 'showcase', 'beacon', 'cornerstone', 'embark',
  'journey', 'curated', 'crafted', 'bespoke', 'immersive', 'magic', 'magical', 'ai-powered', 'world-class', 'best-in-class',
  'blazing', 'blazingly', 'lightning-fast', 'powerful', 'stunning', 'beautiful', 'beautifully', 'sleek', 'dive in', 'deep dive',
]
const BANNED_PHRASES = [
  "whether you're", 'whether you are', 'ready to', 'get started', 'learn more', "let's dive", 'read on', "here's the thing",
  'trusted by', 'loved by', 'join thousands', 'oops', 'something went wrong', "in today's", 'all in one place', 'everything you need',
]
const BANNED_EXACT = ['submit', 'scroll', 'scroll down', 'scroll to explore'] // whole text node (CTA labels, scroll cues)

// ── final copy (brief section 5; SSR, mode-independent unless marked) ─────────────────────────────
const REQUIRED = [
  // metadata
  'Aslant · Clear glass that writes in sunlight',
  'A proposal for a studio that shapes window panes so the sun spells a word on your wall at the hour you choose.',
  // 4.12, 4.5
  'Skip to the form', 'Aslant, back to first light',
  // 5.1
  'Clear glass that writes in sunlight.',
  'We shape a window pane so that, at an hour you choose, the sun spells a word on your wall.',
  'Commission a pane', 'Write yours',
  'A slant of morning sun on a grey wall. In its lower pane, the word aslant is made of light.',
  // 5.2
  'The word is already in the glass.',
  'Look through the pane and the room behind it barely wavers. The word is there, drawn as curvature across the whole sheet. You cannot read it in the glass. Only the light can.',
  'Move the loupe over the glass.', 'Drag the loupe over the glass.', 'Show the relief',
  'One broad fold per letter. The letters themselves never appear.',
  "Schlieren: August Toepler's 1864 method, first used to find hidden streaks in optical glass.",
  // 5.3
  'Light bends where the surface tilts.',
  'Through flat glass, light keeps its course.',
  'Tilt the surface a few degrees and each ray leaves at a new angle. Where rays crowd, the wall is bright. Where they part, it goes dark.',
  'Glass makes no light of its own. Of every 100 photons, 92 reach the wall; its two faces reflect the rest.',
  'Sunlight is every colour at once. Glass bends blue a little more than red, so each bright edge carries a thin spectrum.',
  'Angle in', 'Angle out', 'Point at a ray.', 'Tap a ray.',
  'Relief drawn 40 times deeper than it is.',
  'A slice through the pane you just looked at, along one line of the word.',
  'Optical bench. Use the left and right arrow keys to choose a ray.',
  // 5.4
  'The word keeps one appointment a day.',
  'A pane is shaped for one direction of sunlight. Before its hour the light is loose. After, it moves on.',
  'Every afternoon at 16:40, the kitchen wall says her name.',
  'Tuned to midsummer, the word returns every afternoon for about eight weeks. Tuned to an equinox, for about two.',
  'This pane says Ingrid at 16:40, the minute she was born. Copenhagen, a window facing west-south-west.',
  'In focus 16:30 to 16:50',
  'The clock on the wall runs from 16:12 to 17:08 as you scroll.',
  "The sun's path over Copenhagen on 21 June. The word is in focus from 16:30 to 16:50.",
  // 5.5
  'Choose a word and an hour.',
  'A name on the nursery wall at nap time, or a date in the hall at the hour you met. We compute the glass while you watch.',
  'Your word', 'Up to ten letters. Names and dates work well.', 'The hour', 'Local time on 21 June.',
  'Prismatic', 'Flint glass. Each letter arrives with a spectrum along its edges.', 'Where',
  'Computed for a pane tuned to 21 June, facing the sun at that hour.',
  'Commission this pane', 'Save the image',
  "Your pane's surface. One line every 0.2 mm.",
  'The live preview needs WebGL. Your numbers are still exact.',
  // 5.6
  'The idea is two thousand years old.',
  'Han dynasty China, 202 BCE to 220 CE',
  'Bronze mirrors were polished until, in sunlight, they threw the pattern cast on their backs onto a wall. They were called light-penetrating mirrors.',
  'Bologna',
  'Giovanni Domenico Cassini had a hole made in the roof of San Petronio, 27 metres up. At noon an image of the sun still crosses his line on the floor.',
  'Cambridge',
  'George Biddell Airy published On the Intensity of Light in the Neighbourhood of a Caustic: the mathematics of the bright seams where rays crowd together.',
  'Lausanne',
  'Researchers at EPFL published a method for computing a transparent surface whose light draws a chosen image.',
  'Copenhagen, proposed',
  'We tune that arithmetic to the sun over your window. The first forty panes are planned for spring 2027.',
  'Ten weeks from your word to your wall.',
  'Each pane starts as a computed surface and ends as a sheet you can see straight through.',
  'Clear: optical acrylic, 12 mm. Prismatic: flint glass, 10 mm.',
  'From 20 × 20 cm to 60 × 90 cm. The word forms 1 to 3 metres from the glass.',
  'Fitting', 'We fit the pane inside your window and set it to the sun on the day we visit.',
  'About ten weeks. We quote after we see the window.',
  // 5.7
  'We draw every pane before we cut it.',
  'Up to ten letters.', 'Local time.', 'City', 'Somewhere else', 'The window faces',
  'North', 'North-east', 'East', 'South-east', 'South', 'South-west', 'West', 'North-west', 'Not sure',
  'Your name', 'Email', 'Anything we should know (optional)',
  'We use your email only to reply about this pane.',
  // 5.8
  'Watch the sunset', 'Eighteen seconds. Keep your eyes on the dot.',
  'Clear glass that writes in sunlight. Copenhagen.',
  'Aslant is a proposal for a studio. The light is real.',
  'Colophon',
  'Still air', 'Less motion.', 'Overcast', 'No live rendering. Easier on battery.',
]
const BY_MODE = {
  preview: [
    'From spring 2027 we reply within a week with a drawing of your pane and the days it will write.',
    'Until then this form sends nothing. It shows your word in this light.',
    'See it written',
  ],
  endpoint: ['We reply within a week with a drawing of your pane and the days it will write.', 'Request a drawing'],
  mailto: ['We reply within a week with a drawing of your pane and the days it will write.', 'Request a drawing'],
}
// Present only after interaction or client-only; reported as warnings when absent from the SSR HTML.
const OPTIONAL = [
  'Every spectrum on this page is computed.',
  "Sun positions come from NOAA's solar equations, worked out in your browser from your clock and time zone. We never ask where you are.",
  'The headings widen as the sun lowers. Each is set to the length of the light at its hour, and the name at dusk is the widest.',
  'Type: Sprat by Ethan Nakache (Collletttivo) and Geologica by Monokrom, both under the SIL Open Font License.',
  'Aslant is a proposal for a studio. The studio, its Copenhagen address, the first forty panes, the sizes, the lead time, the name Ingrid and her birth time are invented for this study. The physics, the history and every number about light are real.',
  'Keyboard shortcuts', 'Press L to leave the room.',
  'Optical acrylic. White letters, faint colour at the edges.',
  'Steepest slope', 'Largest turn',
  'That colour is not on your screen. Your eye made it.',
  'If you watched it to the end, you may see a pale blue shape on the wall. That colour is not on your screen. Your eye made it.',
  'Look at the dot until the light goes out.', 'Back to the evening',
  'First light', 'Clear glass', 'The bend', 'The appointment', 'Precedent', 'Dusk',
]
// Must never be in the prerendered HTML (7.2 rule 2; 5.7 honesty).
const FORBIDDEN_SSR = [
  { re: /Press R to see the rays|Show the rays/, why: 'ray view is cut (ORCH 05:50): no R promise, no "Show the rays"' },
  { re: /Hear the light/, why: 'sound is cut (ORCH): no "Hear the light" switch' },
  { re: /Sunset in [^.]{1,40} today/, why: 'sunset line prerendered (must render after mount, 7.2)' },
  { re: /The sun does not (set|rise) in/, why: 'sunset variant prerendered (7.2)' },
  { re: /We guessed from your time zone\./, why: 'city guess helper prerendered (7.2)' },
  { re: /Thank you\./, why: '"Thank you" in SSR: the form must never fake a confirmation (5.7)' },
  { re: /Commissions open in spring 2027\. Nothing was sent\./, why: 'preview success message visible before submit (5.7)', warnOnly: true },
]
const REVEALS = [
  'You cannot read it in the glass. Only the light can.',
  'That colour is not on your screen. Your eye made it.',
]

// ── HTML helpers ───────────────────────────────────────────────────────────────────────────────────
const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', middot: '·', times: '×', mdash: '—', ndash: '–', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', deg: '°', hellip: '…', minus: '−', rarr: '→' }
const decode = s => s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
  if (e[0] === '#') return String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10))
  return ENT[e.toLowerCase()] ?? m
})
const norm = s => decode(s).replace(/[ \s]+/g, ' ').replace(/[’‘]/g, "'").replace(/[“”]/g, '"').trim()

function parse(html) {
  const body = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, m => { styles.push(m.replace(/<\/?style[^>]*>/gi, '')); return '' })
  const textNodes = []
  const attrs = []
  const tagRe = /<[^>]+>/g
  let last = 0, m
  while ((m = tagRe.exec(body))) {
    const t = body.slice(last, m.index)
    if (t.trim()) textNodes.push(norm(t))
    last = tagRe.lastIndex
    const tag = m[0]
    for (const am of tag.matchAll(/\s(alt|aria-label|title|placeholder|aria-valuetext|content)="([^"]*)"/gi)) {
      if (am[1].toLowerCase() === 'content' && !/name="(description|twitter:[a-z:]+)"|property="og:[a-z:]+"/i.test(tag)) continue
      if (am[2].trim()) attrs.push({ attr: am[1], text: norm(am[2]) })
    }
  }
  const title = (body.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1]
  // flat text for verbatim checks: inline tags removed without a space, block tags as a separator
  const flat = norm(body.replace(/<\/?(a|span|cite|q|em|strong|b|i|abbr|time|small|sup|sub|mark|bdi|bdo|data|var|kbd|s|u)\b[^>]*>/gi, '').replace(/<[^>]+>/g, '   '))
  const headings = [...body.matchAll(/<(h[1-3])\b[^>]*>([\s\S]*?)<\/\1>/gi)].map(h => ({ level: h[1].toLowerCase(), text: norm(h[2].replace(/<[^>]+>/g, '')) }))
  return { textNodes, attrs, title: title ? norm(title) : null, flat, headings, body }
}
const styles = []

async function get(url) {
  const r = await fetch(url)
  return { status: r.status, text: await r.text() }
}

function scanText(list, where, out) {
  for (const t of list) {
    const text = typeof t === 'string' ? t : t.text
    const label = typeof t === 'string' ? where : `${where}[${t.attr}]`
    if (/[—–]/.test(text)) out.fail.push({ rule: 'dash', where: label, text })
    const low = text.toLowerCase()
    for (const w of BANNED) {
      const re = new RegExp(`(^|[^\\p{L}\\-])${w}($|[^\\p{L}\\-])`, 'iu')
      if (re.test(low)) out.fail.push({ rule: 'banned-word', word: w, where: label, text })
    }
    for (const p of BANNED_PHRASES) if (new RegExp(`(^|[^\\p{L}])${p}($|[^\\p{L}])`, 'iu').test(low)) out.fail.push({ rule: 'banned-phrase', phrase: p, where: label, text })
    if (BANNED_EXACT.includes(low.replace(/[.!]$/, ''))) out.fail.push({ rule: 'banned-label', where: label, text })
    const dots = (text.match(/·/g) || []).length
    if (dots > 1) out.fail.push({ rule: 'middle-dots', count: dots, where: label, text })
  }
}

function negationCandidates(flat) {
  const sentences = flat.split(' ').flatMap(b => b.split(/(?<=[.!?])\s+(?=[A-Z“"])/)).map(s => s.trim()).filter(Boolean)
  const hits = []
  for (let i = 0; i < sentences.length - 1; i++) {
    const a = sentences[i], b = sentences[i + 1]
    if (/\b(not|cannot|can't|isn't|never|no longer|nothing)\b/i.test(a) && a.split(' ').length <= 12 && b.split(' ').length <= 8 && /^(Only|Just|It|Your|This|That|But|The)\b/.test(b)) hits.push(`${a} ${b}`)
    if (/^(It's|It is) not\b|^Not\b/.test(a)) hits.push(a)
  }
  return hits
}

function scanSource() {
  const res = { fail: [], warn: [] }
  const exts = new Set(['.ts', '.tsx', '.css', '.mjs', '.js'])
  const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => {
    const p = path.join(d, e.name)
    if (e.isDirectory()) return e.name === 'node_modules' || e.name.startsWith('.') ? [] : walk(p)
    return exts.has(path.extname(e.name)) ? [p] : []
  })
  const files = ['app', 'src'].map(d => path.join(ROOT, d)).filter(fs.existsSync).flatMap(walk)
  for (const f of files) {
    const src = fs.readFileSync(f, 'utf8')
    const code = src.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' ')).replace(/(^|[^:'"`])\/\/.*$/gm, '$1')
    const lines = code.split('\n')
    lines.forEach((line, i) => {
      const at = `${path.relative(ROOT, f)}:${i + 1}`
      if (/background-clip\s*:\s*text|backgroundClip\s*:\s*['"]text/i.test(line)) res.fail.push({ rule: 'background-clip-text', at })
      if (/backdrop-filter|backdropFilter/i.test(line)) res.fail.push({ rule: 'backdrop-filter', at })
      if (/[—–]/.test(line) && /['"`>]/.test(line) && !/\.glsl\.ts$/.test(f)) res.warn.push({ rule: 'dash-in-source-string', at, line: line.trim().slice(0, 160) })
      if (/@media[^{]*prefers-reduced-motion|gsap\.matchMedia/.test(line)) res.fail.push({ rule: 'motion-gate (4.7: read html[data-motion])', at })
      if (/\b(bounce|elastic|back)\.(in|out|inOut)|['"](bounce|elastic|back)(\.|['"])/i.test(line)) res.fail.push({ rule: 'banned-ease', at })
    })
  }
  return res
}

async function main() {
  const out = { url: URL_, mode: MODE, fail: [], warn: [], info: {} }
  const page = await get(URL_)
  if (page.status !== 200) { out.fail.push({ rule: 'http', status: page.status }); return finish(out) }
  const p = parse(page.text)
  out.info.textNodes = p.textNodes.length
  out.info.title = p.title
  scanText(p.textNodes, 'text', out)
  scanText(p.attrs, 'attr', out)

  // headings
  const h1 = p.headings.filter(h => h.level === 'h1')
  if (h1.length !== 1) out.fail.push({ rule: 'h1-count', count: h1.length, h1: h1.map(h => h.text) })
  for (const h of p.headings) if (/\?\s*$/.test(h.text)) out.fail.push({ rule: 'question-heading', heading: h.text })
  out.info.headings = p.headings.map(h => `${h.level}: ${h.text}`)
  const sections = [...p.body.matchAll(/<(section|footer)\b[^>]*data-chapter="([^"]+)"/gi)].map(m => m[2])
  out.info.chapters = sections
  const expectOrder = ['first-light', 'clear-glass', 'the-bend', 'appointment', 'write-yours', 'ledger', 'commission', 'dusk']
  if (sections.join(',') !== expectOrder.join(',')) out.fail.push({ rule: 'chapter-order', got: sections })

  // verbatim copy
  const hay = [p.flat, ...p.attrs.map(a => a.text), p.title || ''].join('   ')
  const has = s => hay.includes(norm(s))
  for (const s of [...REQUIRED, ...(BY_MODE[MODE] || [])]) if (!has(s)) out.fail.push({ rule: 'copy-missing', text: s })
  for (const s of OPTIONAL) if (!has(s)) out.warn.push({ rule: 'copy-not-in-ssr', text: s })
  for (const [m, list] of Object.entries(BY_MODE)) if (m !== MODE) for (const s of list) if (!(BY_MODE[MODE] || []).includes(s) && has(s)) out.warn.push({ rule: 'other-mode-copy-present', mode: m, text: s })
  for (const f of FORBIDDEN_SSR) if (f.re.test(p.flat)) (f.warnOnly ? out.warn : out.fail).push({ rule: 'forbidden-in-ssr', why: f.why })

  // reveals (2.4 un-ban 6)
  const revealCount = REVEALS.map(r => (hay.split(norm(r)).length - 1))
  out.info.reveals = Object.fromEntries(REVEALS.map((r, i) => [r, revealCount[i]]))
  const cands = [...new Set(negationCandidates(p.flat))].filter(c => !REVEALS.some(r => c.includes(norm(r).split('. ')[0])))
  if (cands.length) out.warn.push({ rule: 'negation-affirmation-candidates (review; only the two reveals are licensed)', candidates: cands })

  // CSS
  const links = [...page.text.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"/gi)].map(m => new URL(m[1], URL_).href)
  const cssTexts = [...styles]
  for (const l of links) { try { cssTexts.push((await get(l)).text) } catch (e) { out.warn.push({ rule: 'css-fetch', url: l, error: String(e) }) } }
  out.info.stylesheets = links.length
  const css = cssTexts.join('\n')
  if (/background-clip\s*:\s*text/i.test(css)) out.fail.push({ rule: 'background-clip-text-in-css' })
  if (/backdrop-filter\s*:/i.test(css)) out.fail.push({ rule: 'backdrop-filter-in-css' })
  if (/content\s*:\s*["'][^"']*[—–]/.test(css)) out.fail.push({ rule: 'dash-in-css-content' })

  // 404 page copy
  try {
    const nf = await get(new URL('/__no-light-here', URL_).href)
    const q = parse(nf.text)
    scanText(q.textNodes, '404', out)
    for (const s of ['No light reaches this page.', 'Back to the window.']) if (!q.flat.includes(s)) out.fail.push({ rule: '404-copy-missing', text: s })
    if (/Skip to the form/.test(q.flat)) out.fail.push({ rule: '404-has-skip-link' })
    out.info.notFoundStatus = nf.status
  } catch (e) { out.warn.push({ rule: '404-fetch', error: String(e) }) }

  if (opt.src) { const s = scanSource(); out.fail.push(...s.fail); out.warn.push(...s.warn) }
  return finish(out)
}

function finish(out) {
  out.ok = out.fail.length === 0
  if (opt.json) console.log(JSON.stringify(out, null, 2))
  else {
    console.log(`check-copy ${out.url} (mode ${out.mode}): ${out.ok ? 'PASS' : 'FAIL'} · ${out.fail.length} failures, ${out.warn.length} warnings`)
    for (const f of out.fail) console.log('  FAIL', JSON.stringify(f))
    for (const w of out.warn) console.log('  warn', JSON.stringify(w))
    if (out.info.reveals) console.log('  reveals', JSON.stringify(out.info.reveals))
  }
  process.exit(out.ok ? 0 : 1)
}

main().catch(e => { console.error(e); process.exit(2) })
