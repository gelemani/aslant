# 05 · Skill Rulebook (distilled from the local knowledge base)

Purpose: one actionable rulebook for the overnight build of a single god-tier landing page
(Next.js 16.3 App Router + TS, React 19.3, three 0.186 / R3F 9.8 / drei 10.7 / postprocessing,
GSAP 3.15 with all plugins, @gsap/react useGSAP, Lenis 1.3 as the only smooth-scroll engine,
CSS Modules + CSS custom-property tokens, no Tailwind, English copy, no image generation).

Every rule carries a source tag. Where sources conflict, the resolution is stated in section 13.
Code in the sources was written for Tailwind / Motion / vanilla JS; it is translated here to our stack
and marked `[STACK]` when the adaptation is ours rather than the source's.

## Source key

| Tag | Source file |
|---|---|
| DT | `~/.claude/skills/design-taste-frontend/SKILL.md` |
| CGL | `~/.claude/skills/cinematic-gsap-lenis-motion-system/SKILL.md` |
| CSST | `~/.claude/skills/cinematic-scroll-storytelling/SKILL.md` |
| TW | `~/.claude/skills/build-threejs-scroll-worlds/SKILL.md` |
| TW/arch, TW/bible, TW/qa, TW/kage, TW/cond | its `references/realtime-architecture.md`, `world-bible.md`, `quality-and-qa.md`, `kage-anatomy.md`, `scroll-conductor.js` |
| AS | `~/.claude/skills/animation-systems/SKILL.md` |
| OWA | `~/.claude/skills/optimize-web-animations/SKILL.md` (+ `references/browser-profiling.md`) |
| MR | `~/.claude/skills/masked-reveal/SKILL.md` |
| PB | `~/.claude/skills/progressive-blur/SKILL.md` |
| SCR | `~/.claude/skills/shaders-cursor-ripples/SKILL.md` (+ assets) |
| BW | `~/.claude/skills/generate-reference-inspired-brand-worlds/` |
| IUV | `~/.claude/skills/iterate-until-verified/SKILL.md` |
| AQ | `~/.claude/skills/build-awwwards-quality-sites/SKILL.md` |
| FD | `~/.claude/plugins/cache/claude-plugins-official/frontend-design/fbe07fb6ce7d/skills/frontend-design/SKILL.md` (newest) |
| IMP | `~/.claude/plugins/cache/impeccable/impeccable/4.4.0/skills/impeccable/SKILL.md`; `IMP/<name>` = `reference/<name>.md` |
| STACK | Team adaptation to the fixed stack; not stated by any source. Verify API against installed version. |

---

## 1. Art direction process

### 1.1 Order of operations
1. **Ground in a subject.** If the brief names no subject, pick one concrete subject, audience and primary job yourself; distinctive choices come from the subject's industry, materials and vernacular. [FD]
2. **Declare the design read** in one line: "Reading this as: <page kind> for <audience>, with a <vibe> language, leaning toward <aesthetic family>." [DT §0.B]
3. **Set the dials.** Awwwards / experimental / agency landing = `DESIGN_VARIANCE 9-10 / MOTION_INTENSITY 8-10 / VISUAL_DENSITY 3-4`; agency-creative preset `9/8/3`. [DT §1] Motion claimed must be motion shown; if motion cannot ship working, drop the dial rather than half-build. [DT §5]
4. **Pick the visitor mode.** A landing page is *Persuade*; a showcase is *Experience* (artifact leads from the first viewport, interface recedes). Our page is Persuade+Experience: display type and motion may carry the voice. [IMP]
5. **Write the direction doc before code** (AQ §1): visual thesis, hero focal asset, type hierarchy, color system, section sequence, motion narrative, smooth-scroll engine (Lenis, fixed), Three.js decision, asset provenance plan.
6. **Token plan** (FD): color = 4-6 named hex values; type = faces + roles; layout = one-sentence concept + ASCII wireframes (compare 2+ alternatives), alignment rule; principles = what makes this page unique.
7. **Anti-default review of the plan** (FD): for each part ask "would I produce this for any similar prompt?" If yes, revise and write down what changed and why. Only then build.
8. **World sentence + interaction sentence** (TW/bible): one sentence joining subject, spatial journey and transformation (it must imply different compositions and a reason to move); a second: "Scroll controls the camera and global time; pointer, touch and keyboard reveal local evidence without breaking the route." Reject a world sentence that only describes a style.
9. **Visual bible with real constants** (TW/bible): scale/unit convention, silhouette language, palette *roles* (not color1), per-chapter accent progression, material families, light roles (key/fill/rim/practical/emissive), fog/particles/post, type + DOM composition, motion grammar table. Replace adjectives with measured values.
10. **Chapter ledger, 4-8 chapters** (TW): per chapter record `id, beat, landmark, change (beyond copy), scrollWeight, camera {position,target,fov,mobile override}, occlusion at seam, worldState, focus, copy, assets, fallback still`. Reject a chapter whose landmark, change and camera composition cannot be named; reject any chapter that differs only by copy. Six dolly-ins at the same center are not six scenes.
11. **Checkpoints** (TW/bible §11, adapted as internal gates since the client is asleep): (a) world sentence + story order; (b) graybox silhouettes + every camera endpoint; (c) one finished material/lighting slice proving the art direction; (d) first-to-second chapter transition incl. reverse scroll; (e) mobile composition + perf tier; (f) whole journey before final polish. Do not spend the polish budget before the graybox proves the route.

### 1.2 Using trend references without copying [BW, AQ]
- Extract two lists per reference: **reusable grammar** (density, depth layers, palette *relationships*, surface/print quality, lighting temperature, type scale/placement logic, organic vs architectural rhythm) and **protected signature elements** (exact layouts, motifs, wordmarks/letterforms, copy, poses, negative-space shapes). Reuse only the first list.
- When a reference has one famous feature, abstract the principle, never repeat the feature. Change at least 4 signature elements vs any reference. [BW]
- Never reuse/trace reference assets, screenshots, source, identity or copy. Never call the result award-winning or Awwwards-recognized. [AQ]
- Invented brand name: new, exact, legible, tied to a specific meaning; no startup-slop names (Acme, Nexus, SmartFlow, Cloudly). [BW, DT §9.D]

### 1.3 Restraint principle
- Spend boldness in one place: one memorable thing, everything around it quiet and disciplined. Before shipping, "look in the mirror and remove one accessory." [FD]
- Do not layer competing extraordinary moments; focus creates impact. [IMP/overdrive]
- Every visible detail must support the same world; random noise, unrelated textures, arbitrary particles = complexity without cohesion. [TW]
- The page must be complete: nav, coherent section progression, concrete content, final CTA, footer, focus states; not a hero-only concept. [AQ §6]

---

## 2. Typography

### 2.1 Choice
- Typography carries the personality; use the type treatment itself as an active design element, not a neutral vehicle. One family or two; if two, clearly distinct. Choose deliberately, not your usual defaults. [FD]
- Banned as defaults: Inter; Fraunces and Instrument Serif. Serif display is "very discouraged" unless the aesthetic is genuinely editorial/luxury/heritage and you can say why *this* serif fits *this* brand. Sans display options named: Geist Display, ABC Diatype, Söhne Breit, Cabinet Grotesk Display, Migra Sans, GT Walsheim, PP Neue Montreal; serif pool if justified: PP Editorial New, GT Sectra, Reckless Neue, Tiempos Headline, Canela, Schnyder, Saol, Domaine, IvyPresto, etc. [DT §4.1]
- No system display face (Impact, Arial Black, platform sans) as the display voice; source and self-host a face whose character matches. [IMP/craft-floor]
- Monospace only for code/data/measurement, never as a "technical" costume. [IMP/craft-floor, FD]
- Fonts via `next/font` (self-hosted), `font-display: swap`; never a `<link>` to Google Fonts in production. Load only used weights/assets; metric-compatible fallbacks; no invisible text or disruptive reflow. [DT §3.A, IMP/typeset]

### 2.2 Scale, measure, leading
- Set a clear type scale following *The Elements of Typographic Style* with intentional weights, widths, spacing. [FD] Obvious scale and weight steps between roles; fewest roles and families that make hierarchy unmistakable; tokens named by purpose, not value. [IMP/craft-floor, IMP/typeset]
- Body floor 1rem/16px. Prose measure 45-75ch (craft-floor: 65-75ch; FD: < 80 characters; DT: `max-width: 65ch`). Serif body may run slightly longer and needs slightly more line-height than sans. Wider lines need more leading. [IMP/typeset, FD, DT]
- Display max 6rem and tracking floor -0.04em are the craft floor defaults; a committed world may override (see §13). [IMP/craft-floor]
- DT defaults translated: display `letter-spacing: tight`, `line-height: 1`; body `line-height: relaxed (~1.6)`, max 65ch. Hero: 3-5 word headline may go to the largest step; >6 words with a large asset must not. A 4-line hero headline is always a font-size error. [DT §4.7]
- Balanced headings (`text-wrap: balance`); run the real copy at every breakpoint and fix overflow. [IMP/craft-floor]
- Paragraph rhythm: paragraph spacing OR first-line indent, never both. [IMP/typeset]

### 2.3 Tracking, dark surfaces, optical details
- Light text on dark surfaces: compensate on three axes: slightly more line-height, a touch more tracking, one step more weight when the face needs it. [IMP/typeset]
- Italic display words containing descenders (y g j p q): line-height min 1.1 plus bottom padding reserve; audit every italic display word. [DT §4.1]
- Use numeric/tabular/code features where content benefits; theme tabular numerals. [IMP/typeset, IMP/craft-floor]
- Optical sizing: sources only require tuning variable-font settings to face, width and surface [IMP/typeset]. `[STACK]` If the chosen face has an `opsz` axis, keep `font-optical-sizing: auto` and verify display vs body cuts render differently at 16px and at display size.
- Display emphasis: FD bans accenting a single word (italic/bold/color) as a generated-page tell; DT allows same-family italic/bold only. Resolution in §13: do not use single-word accents by default.
- No all-caps labels as default chrome; no `<br>`-broken italic headline tricks; no vertical rotated text unless it serves a real composition purpose. [FD, DT §9.F]

---

## 3. Color

- 4-6 named hex values as the base palette. [FD] Build **roles**, not swatches: canvas, elevated surface, primary/secondary text, action/focus/selection, borders, semantic states. Name roles (e.g. `--world-dark`, `--readable-light`, `--warm-practical`, `--story-accent`), define how roles shift between chapters. [IMP/colorize, TW/bible]
- For a new web palette prefer OKLCH; vary lightness, reduce chroma near white and black; prefer explicit colors over chains of translucent overlays (alpha makes contrast context-dependent). [IMP/colorize]
- Max 1 accent, saturation < 80%; lock it across the whole page (no blue CTA in section 7 of a warm page). One neutral family (no warm/cool gray mixing). [DT §4.2] Let the strongest color own a region/role rather than scattering tiny accents; don't spend the action color on decoration. [IMP/colorize]
- No pure `#000000` / `#ffffff`. [DT §8.B, §9.A]
- On colored surfaces, tint secondary text from that hue or the foreground; never generic gray. [IMP/craft-floor, IMP/colorize]
- **Known AI palette clusters to avoid unless the brief demands them** [FD, DT]:
  1. warm cream (~`#F4F1EA`) + high-contrast serif + terracotta (~`#D97757`);
  2. near-black + single acid-green or vermilion accent;
  3. AI purple/blue glow gradients ("Lila rule");
  4. premium-consumer beige+brass+oxblood+espresso (`#f5f1ea`, `#b08947`, `#9a2436`, `#1a1714` families);
  5. tinted near-black `#0B0B0B`/`#111` "standing in for black" as a reflex.
  Pick theme (light/dark) from the use scene, not the category. [IMP/craft-floor]
- Page Theme Lock: one theme for the whole page; one deliberate theme switch allowed only as an authored device. [DT §4.11] (Dual-mode rule conflict: see §13.)
- Contrast (WCAG AA): body 4.5:1, large text 3:1, controls/icons/focus indicators 3:1; check hover/active/disabled, text over imagery/WebGL, both themes; simulate color-vision deficiencies; color never the only cue. [IMP/colorize]
- Shadows tinted to background hue; no pure-black drop shadows on light backgrounds; shadows carry offset + soft blur (zero-offset colored halo = decoration). [DT §4.4, IMP/craft-floor]
- Browser surfaces themed from the palette: `::selection`, caret, scrollbar, focus ring, underline offset. "Cheapest signal a page was built rather than assembled." [IMP/craft-floor]

---

## 4. Layout, grid and spacing

- Viewport stability: full-height sections use `min-height: 100dvh`, never `100vh`/`h-screen`. [DT §3.E] Container max ~1400px, centered. CSS Grid over flex percentage math. [DT]
- Spacing: documented scale on a 4-unit base (gives the middle steps an 8-only scale misses); `gap` for sibling rhythm; tight groups, generous separation; **more space above a heading than below it**; read computed values. [IMP/layout, IMP/craft-floor]
- Squint test: with detail blurred, primary, secondary and major groups remain identifiable in order. Skeleton test: strip copy; structure alone should still say what the section is. [IMP/layout, IMP/bolder]
- Anti-center bias: at VARIANCE > 4 avoid centered hero; use split, left-content/right-asset, asymmetric whitespace or pinned structures. Exception: manifesto/launch briefs where the message is the design. [DT §4.3] Variance 8-10 vocabulary: fractional grids (`2fr 1fr 1fr`), massive empty zones (`padding-left: 20vw`), overlaps. [DT §7]
- Hero discipline [DT §4.7]: fits the initial viewport; headline ≤ 2 lines desktop; subtext ≤ 20 words and ≤ 4 lines; CTA visible without scroll; top padding ≤ 6rem desktop; max 4 text elements (eyebrow/brand strip optional, headline, subtext, 1 primary + ≤1 secondary CTA). No tagline under CTAs, no trust strip, no pricing teaser in hero.
- Nav: single line at ≥1024px; height ≤ 80px (default 64-72). [DT]
- Section variety: a layout family appears at most once; 8 sections need ≥ 4 families; max 2 consecutive image+text splits; no split-header (big left headline + small right paragraph) unless the right column carries a visual/interactive; no 3 equal feature cards; cards only when elevation communicates hierarchy, nested cards always wrong. [DT §4.7, §9.C; IMP/craft-floor]
- Content shape per section: headline ≤ 8 words + sub ≤ 25 words + one visual or one CTA; >5 items needs a different component than a list. [DT §4.9]
- Mobile: every multi-column/asymmetric layout declares its < 768px collapse explicitly (single column, 16px gutters). Treat mobile as a second composition, not a crop. [DT §4.7, §7; TW/arch §11]
- z-index: systemic layers only (nav, overlays, grain, canvas), documented as tokens. [DT §6.F]
- One corner-radius system for the page (all-sharp, all-soft 12-16px, or documented mixed rule). [DT §4.4]
- DOM/focus order must match visual order at every breakpoint. [IMP/layout]
- Safe copy zones per viewport must avoid the focal 3D landmark; copy sits in deliberate negative space. [TW/bible, TW/qa]

---

## 5. Motion

### 5.1 Principles
- Every animation must answer "what does this communicate?": hierarchy, storytelling, feedback, state transition, continuity. "It looked cool" is invalid. [DT §5, AS]
- One authored focal moment beats scattered effects; identical fade-and-slide-up entrances on every section read as AI-generated. [FD, IMP/animate, IMP/craft-floor]
- Smooth, elegant, slightly delayed, intentional; no bounce/elastic/springy, no big scale jumps, no gaming flash. [CGL, CSST, AS]
- Exponential ease-out from an already-visible default (content visible if JS fails). [IMP/craft-floor, IMP/animate]
- Palette beyond transform/opacity is allowed when smooth and bounded: blur, backdrop-filter, clip-path, mask, shadow. [IMP/craft-floor, IMP/animate]
- Exit faster than entrance; enter ease-out, exit ease-in. [IMP/animate, AS]

### 5.2 Easing tokens
| Token | Value | Source |
|---|---|---|
| `--ease-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` | IMP/animate, DT §7 |
| GSAP defaults | `gsap.defaults({ ease: "power3.out", duration: 0.85 })` | CGL |
| GSAP enter set | `power3.out`, `power4.out`, `expo.out` | CGL, CSST, MR |
| Scrubbed timelines | `ease: "none"` (let scroll do the timing) | CGL, CSST, DT §5.B |
| Preloader exit | `power4.inOut` | CSST |
| Banned by default | bounce, elastic, linear on UI | CGL, AS, DT |

### 5.3 Duration tokens (reconciled)
| Token | Range | Use | Source |
|---|---|---|---|
| `--dur-feedback` | 100-150ms (AS: 120-200) | press/hover acknowledgement | IMP/animate, AS |
| `--dur-state` | 150-300ms (AS: 180-260) | toggle/select/state change | IMP/animate, AS |
| `--dur-overlay` | 300-500ms (AS small: 220-320) | overlay, popover, layout change | IMP/animate, AS |
| `--dur-hover-rich` | 350-600ms | magnetic/image hover | CGL |
| `--dur-reveal` | 750-1100ms (text 0.8-1.1s, cards 0.9-1.2s) | scroll reveals | CGL, CSST |
| `--dur-focal` | 500-800ms authored entrance; hero sequence 800-1600ms with internal beats | hero / focal | IMP/animate, AS |
| masked word reveal | 0.7-0.9s | headings | MR |
| cursor lag | 0.25-0.45s (`quickTo` 0.35) | follower | CGL |
| foreground retire | 650-950ms (Kage 820ms) | fixed near-plane cut-outs | TW/bible, TW/kage |
| shader ready handoff | 240ms opacity | canvas fade-in over fallback | SCR |

### 5.4 Stagger, offsets, triggers
- Word stagger 0.035-0.07s (MR tighter: 0.025-0.045s; TW/bible 40-90ms; Kage 72ms); line stagger 0.08-0.14s; card stagger 0.06-0.1s; AS generic 40-90ms, smaller on mobile. Cap total stagger delay. [CGL, CSST, MR, TW, AS, IMP/animate]
- Offsets: y 24-48px for section reveals (AS standard 8/16/24); masked text `yPercent: 110 → 0`; blur 4-10px → 0 only on text/small elements. [CSST, AS, MR, CGL]
- Trigger: `start: "top 82%"` (lines 84%), `once: true`; reveal once, never replay on tiny scrolls. [CGL, CSST, MR, AS]
- Scrub: `scrub: 0.8-1.4` cinematic lag; parallax `scrub: 1-1.2`; `anticipatePin: 1`; `invalidateOnRefresh: true` on anything measured. [CGL, CSST]
- Sticky stack depth: scale 1 → 0.92, autoAlpha → 0.55-0.72. [CSST, DT §5.A]
- Hover recipes: magnetic translate only, scale < 1.03 (`quickTo` x/y 0.45s power3.out, strength ~0.18); card tilt < 4deg; image zoom 1 → 1.06 over 0.7s; arrow x 0 → 6px; directional hover < 16px; `:active` scale 0.98 or translateY(1px). [CGL, DT §4.5]
- Mouse-reactive depth: one pointer listener per section, depth ~0.04, `quickTo` 0.8s. Barely visible. [CGL]
- 3D motion grammar: camera damping lambda 4.5-7.0 (default 5.2); pointer parallax 0.1-0.5° rotation / 0.02-0.12 world units, clamped, blended out near transitions; ambient dust 0.02-0.12 u/s seeded; sway 1-4° at 0.08-0.25Hz with spatial phase. [TW/bible, TW]

### 5.5 Choreography rules
- Hero: background/media first → headline lines → supporting copy → CTA last. Nav, message and CTA must be readable and usable before the intro finishes. [CGL, AS, AQ §3]
- Sections: heading → media → details/cards (eyebrow-first order from CGL is void since eyebrows are banned, §10). Independent beats for heading, body, media, CTA. [CGL, TW]
- Pinned scenes: one idea per viewport; no stacked simultaneous transforms. Keep the reading block stable while the camera makes its largest move. [CGL, TW]
- Parallax: background slower, foreground slightly faster, text mostly stable; small distances (speed ~0.16-0.18 × viewport). [CGL, CSST]
- Hero timelines use labeled beats; lock camera/scene movement first, then layer text. [AS]
- Never let two systems animate the same property (CSS transition + GSAP, or GSAP + Motion). Don't install Motion/Framer at all: GSAP/Three and Motion "fight over the same frames." [AQ §4, DT §10]
- Marquee: max one per page. [DT §5]
- Continuous values (pointer, scroll progress) never go through React state; use refs, `gsap.quickTo`, `quickSetter`, uniforms. [DT §3.B, §5.D; STACK]

### 5.6 Split text [MR, CGL, CSST, AQ, TW/arch] + [STACK]
- Split only display headings and short intros; word split for calm editorial feel; never split text containing links/buttons/meaningful inline markup.
- Parent keeps the full phrase (`aria-label`), split wrappers `aria-hidden="true"`; unsplit text visible without JS (hide only under an `html.js`/`has-motion` class).
- Split after `document.fonts.ready` when wrapping matters; `ScrollTrigger.refresh()` after late images/fonts.
- `[STACK]` GSAP 3.15 ships SplitText free (MR's hand-rolled splitter predates that). Use `SplitText.create(el, { type: "words,lines", mask: "words" | "lines", aria: "auto", autoSplit: true, onSplit(self){ return gsap.from(...) } })` inside `useGSAP`; verify option names against the installed version and confirm the resulting aria output in the accessibility tree.

---

## 6. Scroll storytelling

### 6.1 Lenis + ScrollTrigger wiring (only engine: Lenis) [CGL, CSST, AQ]
```ts
'use client'; // [STACK] single provider mounted once in app/layout.tsx
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

useEffect(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;                       // no smooth-scroll layer under reduced motion
  const lenis = new Lenis({ lerp: 0.08, smoothWheel: true, wheelMultiplier: 0.9, anchors: true });
  lenis.on('scroll', ScrollTrigger.update);
  const tick = (t: number) => lenis.raf(t * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  const refresh = () => ScrollTrigger.refresh();
  window.addEventListener('load', refresh);
  document.fonts?.ready.then(refresh);
  return () => { window.removeEventListener('load', refresh); gsap.ticker.remove(tick); lenis.destroy(); };
}, []);
```
- Exactly one smooth-scroll engine installed and initialized; destroy on cleanup; refresh after media/font changes. [AQ §4]
- Never `window.addEventListener('scroll')` for animation logic or `scrollY` in React state. Use ScrollTrigger, `lenis.on('scroll')`, IntersectionObserver, or CSS scroll-driven animation. [DT §5.D] (The TW conductor's passive scroll listener is acceptable as a non-React read of native scroll; §13.)
- All GSAP in client leaves via `useGSAP(() => {...}, { scope: ref })` (auto-reverts; equals `gsap.context` + `ctx.revert()`). Kill/revert triggers before the next route. [CGL, MR, STACK]
- Do not trap the wheel or force a custom scrollbar; native reversible scroll remains the source of truth. [TW]

### 6.2 Page anatomy and build order [CSST]
Anatomy: preloader → hero (media parallax, masked headline) → intro kinetic type → story sections → sticky stack / pinned progression → gallery/proof → footer reveal.
Build order: static page first → preloader + hero entrance → split reveals → section reveals → sticky progression → parallax → scrubbed pins only where the story needs them → reduced-motion + touch fallbacks → browser QA.

### 6.3 Canonical patterns
- **Sticky stack**: `start: "top top"`, `pin: true`, every card but the last pinned, previous card's scale/opacity driven by the *next* card's trigger (`start: "top bottom"`, `end: "top top"`, `scrub: true`). CSS alternative: `position: sticky; top: 12vh; transform-origin: center top`, next card `start: "top 78%"`, `end: "top 24%"`. [DT §5.A, CSST]
- **Horizontal pan**: pin wrapper `start: "top top"`, `end: () => '+=' + (track.scrollWidth - innerWidth)`, `scrub: 1`, `invalidateOnRefresh: true`, animate track `x` with `ease: "none"`. Failure mode: starting before pin (use `top top`). [DT §5.B, CGL]
- **Pinned progression**: `end: "+=140%"`, `scrub: 1.1`, `pin: true`, `anticipatePin: 1`; media `scale 1.08 → 1`, copy `y 40 → 0` staggered 0.15, linear. [CSST]
- **Story panels**: `end: () => '+=' + panels.length * innerHeight`, `scrub: 1.1`, `yPercent: -100 * (n-1)`. [CGL]
- **Clip image reveal**: `clipPath: inset(0 0 100% 0) → inset(0 0 0% 0)` 1.1s power4.out + inner image scale 1.08 → 1 over 1.2s. [CGL]
- **Footer reveal**: `yPercent -12 → 0`, `start: "top bottom"`, `end: "top 45%"`, `scrub: 1`. [CSST]
- **Preloader**: bar `scaleX 0 → 1` then loader `yPercent -100`, 0.9s power4.inOut; must exit even if media is slow; skipped entirely under reduced motion; progress reflects real required asset groups, never a decorative timer. [CSST, TW]
- **Progressive blur edge** (optional, for a fixed top/bottom band over the canvas): 8 stacked `backdrop-filter` layers 0.5, 1, 2, 4, 8, 16, 32, 64px with 12.5%-step linear-gradient masks, `position: fixed; pointer-events: none`. Needs content behind it; GPU-heavy, reduce steps on low-end. [PB]

### 6.4 Scroll-world conductor (WebGL story state) [TW, TW/arch, TW/cond]
- Measure section anchors (section center minus half viewport; first = 0, last = max) after `document.fonts.ready` and critical images; re-measure via ResizeObserver; ignore height-only resizes on coarse pointers (URL bar).
- Keep two values: `exact` (fractional chapter from native scroll, e.g. 2.35) and `smooth = damp(smooth, exact, 5.2, dt)` with `damp = cur + (tgt-cur)*(1-exp(-λ·dt))`, `dt ≤ 1/30`. Under reduced motion `smooth = exact`.
- **Exact** drives nav/`aria-current`, URL hash, DOM ownership, interaction gating, analytics. **Smooth** drives camera, visual interpolation, scrims. UI reading damped progress = labels lag (failure signature).
- Same scroll position must recreate the same state forward, backward, after a jump and after reload. Never integrate wheel delta into story position.
- `scrollWeight` gives important chapters dwell; don't distort the camera path to slow a section.
- `[STACK]` Feed the conductor from Lenis's scroll value or ScrollTrigger progress; keep it outside React state (ref/store read in `useFrame`).
- No scroll cue labels (see §10).

---

## 7. WebGL / Three.js (R3F)

### 7.1 Purpose gate
- Use Three.js/shaders only when depth, texture transition, displacement or pointer response materially supports the art direction; never as ornamental background noise; generic gradient blobs are rejected. [AQ §5, §6]
- The canvas has one clear responsibility and stays subordinate to semantic content and controls; DOM carries meaning, the world creates place. Toggle DOM copy off in review: if the 3D frame means nothing, the world isn't pulling its weight. [AQ, TW, TW/qa]
- The "wow" for a marketing surface is sensory (scroll-driven reveal, shader, cinematic transition, cursor-responsive generative art). Removal test: take it away; if nobody notices, cut it. [IMP/overdrive]

### 7.2 Architecture
- One renderer, one persistent scene, one fixed canvas behind all sections; never a renderer per chapter or a rebuild at seams (causes boundary flashes). [TW, TW/kage]
- Named groups: `environment`, `landmarks`, `chapter-sets`, `interactives`, `atmosphere`; build registries at load; no scene traversal in the render loop; no per-frame allocation. [TW/arch, AQ]
- Chapter data lives in one config (`worldSpec`); camera, DOM, particles and interactions all read the same progress object; no subsystem invents its own thresholds. [TW/arch]
- Update order per frame: read exact scroll/input → damp → resolve camera + world state → mixers/particles → interaction proxies/DOM → post → perf sample. [TW/arch §7]
- Interpolate declared channel values between adjacent chapters (lerp/smoothstep scalars, slerp quaternions, color in working space with luminance check, visibility via opacity or occluded swap). [TW/arch]
- Camera: author endpoints per breakpoint first; `CatmullRomCurve3(points, false, "centripetal", 0.5)` for position and for target; `lookAt` instead of Euler lerp; rig hierarchy `pathRig > inputRig > camera` (never add pointer offsets to waypoint data); tall viewports get authored pullback + FOV override, not a crop; check curves for wall penetration, target flips, speed spikes. [TW, TW/arch]
- Hide discontinuities behind occlusion, darkness, dense atmosphere or thresholds; nothing teleports in open space. [TW]

### 7.3 Renderer, color, materials, light
- `outputColorSpace = SRGBColorSpace`, `toneMapping = ACESFilmicToneMapping`, exposure 1.0, `powerPreference: "high-performance"`, DPR capped. Color/emissive maps sRGB; normal/roughness/metal/AO/data linear (`NoColorSpace`). Material QA is meaningless until color space, tone mapping, exposure and post order are fixed. [TW/arch]
- `[STACK]` R3F: `<Canvas dpr={[1, 1.75]} gl={{ powerPreference: 'high-performance', antialias }} flat={false}>`; R3F defaults to sRGB + ACES; use drei `PerformanceMonitor`/`AdaptiveDpr` as the quality governor; load the canvas via `next/dynamic(..., { ssr: false })`.
- Silhouette first, then medium forms, then accents; believable thickness/bevels (0.5-2% of object width); instancing/merged meshes; raycast proxies simpler than render meshes. [TW, TW/bible]
- One key direction + restrained fill + practical emissives; shadowed lights 1-2 mobile / 2-4 desktop; fog separates depth planes; match emissive geometry, glow and bloom threshold so lamps glow without bleaching. Compose the unprocessed frame first; bloom/vignette/grain/CA/DoF must not hide weak framing. [TW]
- Toggle-test each system (fill, key, practicals, shadows, fog, bloom, particles, grade+grain); delete any effect without a named job (depth, focus, material readability, story). [TW/qa]
- Procedural surface ideas proven by the Kage reference: `CanvasTexture` sky/ridge plates, instanced seeded foliage, additive glow sprites coordinated with lights, heavy film grain, cold/warm contrast. [TW/kage]
- Warm shaders before reveal: `renderer.compileAsync(scene, camera)` or an occluded warm-up frame; no first-use compile at a visible seam. [TW/arch]

### 7.4 Interaction in 3D
- Scroll owns macro movement; pointer/touch/keyboard own local response; hover never moves the scroll camera off its path. [TW]
- States per interactive: `unavailable → idle ↔ hover/focus → active → idle`; one state setter for pointer and DOM focus; gate availability by exact progress. [TW/arch]
- Raycast once per frame max, against proxy layers; skip when pointer unchanged, tab hidden, reduced motion, or nothing available. [TW/arch]
- Every essential hotspot mirrored by a real DOM button/link with visible focus and ≥ 44px target. [TW]
- Cursor-reactive image distortion pattern [SCR]: keep a real `<img>` beneath as accessible/loading fallback (z 0), canvas above (z 1), `position:absolute; inset:0`, `pointer-events:none`, `aria-hidden="true"`; lazy-load shader code; fade canvas in from `onReady` (240ms); unmount under reduced motion or missing GPU support; same crop in fallback and texture; one canvas per media panel; remove any older spotlight/mask pointer system rather than keeping both. `[STACK]` We implement the ripple in our own R3F/GLSL pass (the SCR `shaders` WebGPU library is not in the stack).
- WebGPU if used must fall back to WebGL2, and CSS-only fallback must still look good. [IMP/overdrive]

### 7.5 Lifecycle and failure
- Pause on `document.hidden` and when offscreen; resume cleanly (reset `lastTime`). [TW/arch, OWA]
- `webglcontextlost`: `preventDefault()`, stop the loop, show fallback; rebuild on restore without reloading the page. [TW/arch]
- Dispose RAF/timers, observers, listeners, mixers, geometries, materials, textures, render targets, PMREM, renderer; guard async loaders with `isDisposed`; kill GSAP tweens on uniforms. [TW/arch, OWA, AQ]
- Static designed poster when WebGL is unavailable or under reduced motion; poster must match the live first frame closely enough to avoid a jump. [AQ, TW/qa]
- Dev-only debug overlay: exact/smooth progress, chapter, camera pose, draw calls/triangles/programs, tier, frame time, toggles for fog/post/shadows. Gate out of production. [TW/arch §14]

---

## 8. Performance budgets

| Budget | Mobile | Desktop | Source |
|---|---:|---:|---|
| DPR cap | 1.25-1.5 (tier "medium" 1.35) | 1.5-2 (tier "high" 1.75) | TW, TW/arch |
| Visible triangles | 150k-300k | 500k-1.2M | TW |
| Draw calls | 50-90 | 90-160 | TW |
| Shadowed lights | 1-2 | 2-4 | TW |
| Blended full-screen layers | 2 | 3 | TW |
| Critical initial transfer | 3-6 MB | 5-10 MB | TW |
| Frame time | ≤ 16.7ms ideal, ≤ 25ms fallback | ≤ 16.7ms | TW |
| FPS | target 60; simplify if < 50 | same | IMP/overdrive |
| LCP / INP / CLS | < 2.5s / < 200ms / < 0.1 | same | DT §6.D |

- Quality tiers: high `{dpr 1.75, shadows 2048, particles 1.0, post full}`, medium `{1.35, 1024, 0.55, lite}`, low `{1.0, 0, 0.2, grade}`. Downgrade only after sustained misses (e.g. 120 frames > 22ms after warm-up); never oscillate; upgrade only after reload/long stable interval. Cut order: DPR → full-res post → reflections/DoF → shadow res/frequency → transparent particles → LOD → non-focal geometry. Never delete authored landmarks, camera endpoints, copy or interaction meaning. [TW/arch, TW/bible]
- Animate `transform`/`opacity` (+ short-lived `clip-path`); `filter: blur()` only on text/small elements; never animate width/height/top/left/margins. `will-change` only on elements that will animate, only during animation. [CGL, DT §6.A, IMP/animate, IMP/audit]
- Grain/noise only on a fixed, `pointer-events:none` pseudo-element, never on scrolling containers. [DT §6.E]
- Offscreen work stops: IntersectionObserver (threshold ~0.01) toggles `.is-offscreen` → `animation-play-state: paused` (include `::before/::after`); canvas RAF is cancelled offscreen, not just CSS-paused; expose `data-animation-active` for verification. Target `offscreenRunningCount: 0`. [OWA]
- Lazy-init heavy resources (WebGL contexts, shader modules) near the viewport; lazy-load everything below the fold; texture decoded memory ≈ w × h × 4 × 1.33. [IMP/overdrive, DT §6.E, TW/bible]
- Throttle pointer input to one per frame; cap dt after pauses. [AQ, TW/arch, OWA]
- Hero LCP asset preloaded/prioritized; reserve space for fonts/images/canvas (no CLS). [DT §6.D, IMP/polish]

---

## 9. Accessibility

### 9.1 Reduced motion (`prefers-reduced-motion: reduce`)
- No Lenis, no scrubbed or pinned timelines; render final states immediately (not merely shorter animations). [AQ §4, CGL, CSST, AS]
- WebGL: snap camera/state to the nearest composed chapter or replace with poster; stop ambient loops, stagger and blur; keep the complete ordered DOM story. [TW, AQ]
- Cursor effects, magnetic hover, mouse parallax, custom cursor and shader ripples disabled. [CGL, SCR, DT §6.B]
- Keep meaningful feedback: opacity/color/state transitions that confirm an action remain (fewer and gentler, not a global `0.01ms` kill that destroys feedback). [IMP/animate, IMP/audit]
- Listen for changes to the media query at runtime (SCR pattern: `addEventListener('change', sync)`).

### 9.2 Split text and semantic DOM
- Full accessible text on the parent, decorative spans `aria-hidden`; never split links or inline markup; unsplit text visible without JS. [AQ §4, MR, CGL, TW/arch]
- Real heading hierarchy, landmarks, links, form controls; canvas and alpha foregrounds marked decorative; meaningful 3D content has text equivalents. [TW, TW/qa]
- Chapter nav: real links/buttons, `aria-current` from exact progress; accurate `aria-expanded`/`aria-pressed`. [TW/qa]

### 9.3 Focus, input, contrast
- Visible keyboard focus everywhere, themed from the palette; logical tab order = visual order; no keyboard traps; footer reachable (no scroll trapping). [AQ, IMP/craft-floor, TW]
- Touch targets ≥ 44 × 44px; hover/cursor/magnetic effects disabled on `(pointer: coarse)`; touch drag surfaces set `touch-action` and clear state on cancel/blur. [TW, CGL, IMP/audit]
- Contrast verified per chapter as the world changes behind copy; use authored local scrims, not an opaque blanket. Button labels readable on their fill; ghost buttons over imagery get a backdrop/stroke. [TW, TW/qa, DT §4.5]
- Zoom to 200% and text reflow work. [TW/qa]
- Sound only with explicit opt-in and a mute control; never autoplay audio. [IMP/overdrive, IMP/delight]
- Custom cursor: see §13 resolution.

---

## 10. Anti-slop checklist (ship blockers unless the committed world explicitly earns an item)

Copy and typography
- [ ] Zero em-dashes `—` and zero en-dash separators `–` in any visible string (use hyphen, period, comma, colon, parentheses). [DT §9.G]
- [ ] No filler verbs: Elevate, Seamless, Unleash, Next-Gen, Revolutionize; no "Quietly trusted by", "Field notes", "Currently on the bench"-style poetic labels; no micro-meta sentences under headings. [DT §9.D, §9.F]
- [ ] Copy self-audit: every string re-read; no grammatically broken, cute-but-wrong, mock-humble or "LLM trying to sound thoughtful" lines; one copy register per page; controls name their action; sentence case, active voice. [DT §4.9, FD]
- [ ] No fake-precise numbers or invented specs; no fake testimonials, invented partnerships, customer logos, press quotes, or "award-winning" claims. [DT §4.9, AQ §6]
- [ ] No single-word color/italic accent in headlines; no all-caps label chrome; no `→` appended to links/buttons; no "WORD - fragment" labels; middle dot max 1 per line (preferably none). [FD, DT §9.F]
- [ ] No eyebrow/kicker above headings; no section numbers (01/02/03) unless the content is a real sequence; no "Step 1 / Phase 01" labels; no `01 / 4` pagination. [IMP/craft-floor, FD, DT §9.F]
- [ ] No scroll cues ("Scroll", animated mouse); no version labels (BETA, v0.6); no locale/time/weather strips; no decoration text strip at hero bottom (`DESIGN · BUILD · SHIP`); no photo-credit-as-decoration captions; no pills overlaid on images; no version footers. [DT §9.F]
- [ ] CTA labels ≤ 3 words, never wrap at desktop; one label per intent across nav/hero/footer. [DT §4.5]

Visual system
- [ ] Not one of the five AI clusters (§3); no purple/blue glow; no neon outer glows; no gradient text; no glass/blur as decoration; no generic gradient blobs or mesh-blob hero. [FD, DT §9.A, IMP/craft-floor, AQ]
- [ ] No three equal feature cards; no icon+heading+text card grid as page structure; no hero-metric template (big number, small label, stat row); no nested cards; no ornamental bento. [DT, IMP/craft-floor, FD, AQ]
- [ ] No colored `border-left/right` > 1px accents; no hard offset shadows; no zero-offset colored halos; no decorative hairline/crosshair grids; no decorative status dots. [IMP/craft-floor, DT §9.F]
- [ ] No div-built fake screenshots/terminals/dashboards; no model-drawn SVG illustrations; no geometric masks faking organic contours; no emoji or unicode glyphs as icons; one icon library, one stroke weight. [DT §4.8, §9.E, AQ §2, IMP/craft-floor]
- [ ] One accent, one radius system, one theme, one neutral family, locked page-wide. [DT]
- [ ] Every section layout family used at most once; ≥ 4 families; ≤ 2 consecutive text/image splits; max one marquee. [DT]
- [ ] Motion: no identical fade-up on every section; every animation justified in one sentence; no infinite micro-loops on informational content. [FD, DT §5, IMP/animate]
- [ ] Nothing reads "category-interchangeable": could an unrelated product use this section unchanged? If yes, rewrite it. [IMP/critique Design Specificity]

---

## 11. Craft-floor / polish checklist

- [ ] Contrast: body/placeholder ≥ 4.5:1, large ≥ 3:1, UI/focus ≥ 3:1, computed, every chapter. [IMP/craft-floor, IMP/colorize]
- [ ] Depth: shadows have offset + soft blur, tinted to surface hue. [IMP/craft-floor, DT]
- [ ] Spacing: 4-based scale; more space above headings than below; no one-off values; optical alignment fixed after render. [IMP/layout, IMP/polish]
- [ ] Type: 65-75ch body, balanced headings, obvious steps, italic descender clearance, no overflow at any breakpoint with real copy. [IMP/craft-floor, DT]
- [ ] Browser surfaces: `::selection`, caret-color, scrollbar, focus-visible ring, `text-underline-offset`, tabular numerals, all from tokens. [IMP/craft-floor]
- [ ] States for every control: default, hover, focus-visible, active, disabled, loading, error, success; forms: label above, helper, error below, no placeholder-as-label. [IMP/craft-floor, IMP/polish, DT §4.5-4.6]
- [ ] Images: explicit aspect ratios, responsive sources, lazy below fold, alt text, missing-media fallback, no layout shift. [AQ §2, IMP/polish]
- [ ] Static first frame complete without JS, WebGL, media or motion. [AQ §3]
- [ ] Hero intro leaves nav/message/CTA usable immediately; pointer effects additive; window blur and visibility changes leave no half-finished state. [AQ §3]
- [ ] Mobile collapse explicit per section; no horizontal overflow at 390px. [DT, TW/qa]
- [ ] Cleanup: no debug output, dead code, unused imports, orphaned styles, `console` noise; source diff free of churn. [IMP/polish]
- [ ] Provenance recorded for any licensed media/fonts in source. [AQ §2]
- [ ] Removal test on each effect; "remove one accessory" pass. [IMP/overdrive, FD]
- [ ] The last 20% ("easing curve, stagger offset, secondary motion") tuned until the moment feels inevitable. [IMP/overdrive]

---

## 12. QA protocol

### 12.1 Gates and roles [IUV]
- Convert "god-tier" into observable pass/fail gates in an acceptance matrix: `| Gate | Verification method | Pass condition | Evidence |`. A "wow" reaction is a signal, never the only gate.
- Maker ≠ judge: the verifier gets the brief, the matrix, the candidate and references, but not the implementer's rationale; finds failures first; returns gate-by-gate verdicts with evidence. Blind comparisons only when identity cues are truly removed.
- Loop: produce → run gates → record pass/fail/blocked with evidence → route failures → smallest fix → re-run failed + affected regression gates. Change approach after repeated failure. Never invent a screenshot, benchmark or test result; never convert missing evidence into a pass; disclose unknowns.
- Bounded passes [IMP]: build fully, inspect once in a batched round (desktop + mobile together), fix everything found in one batch, confirm with at most one more round per gate set. Loops continue only on *failing gates*, not open-ended polishing.

### 12.2 Viewports and scroll paths [TW, TW/qa, OWA]
- Required: 1440×900, 768×1024, 390×844; plus one very wide desktop and one short landscape phone if time allows.
- For each chapter and viewport: screenshot of the live renderer. Evidence matrix row: `chapter | 1440 | 768 | 390 | reverse seam | interaction | fallback | perf (ms/calls/tris)`.
- Scroll exercises: slow forward, slow reverse, fast flick across ≥ 2 chapters, scrollbar drag to a non-adjacent chapter, each anchor link both directions, reload mid-segment, history restore, resize/rotate between endpoints, tab hidden ≥ 10s then return, scroll away during an active interaction and back.
- Look for: labels lagging (reading damped state), reverse landing differently, curve-join acceleration spikes, target flips, pop-in on reverse, shader-compile stalls at first reveal, stranded foregrounds, active interactions after their range.

### 12.3 Measurements
- Animation profiler at top / 42% / footer / mobile-top: count computed `animationName` + `animationPlayState` on elements and `::before/::after`; pass = `offscreenRunningCount: 0` and canvases report inactive offscreen. `document.getAnimations()` sampler for WAAPI. Idle sample after 12s for leak signals (elements, canvases, images, `performance.memory` if exposed; if null say so). [OWA]
- WebGL: median and p95 frame time after warm-up and during the heaviest transition; `renderer.info` calls/triangles/textures/programs; JS heap trend across a full forward/reverse journey; long tasks at load and chapter entry; transfer sizes. [TW/qa]
- Bottleneck toggles in order: DPR → post → shadows → transparent/particles → chapter groups → LOD → basic materials. DPR win = fill/post; basic-material win = shader cost; group win = draw calls; particle win = overdraw; no GPU win + high scripting = JS/layout. [TW/qa]
- Lighthouse / Web Vitals: LCP < 2.5s, INP < 200ms, CLS < 0.1. [DT §6.D]
- Use a loopback HTTP server (`next start` / `next dev`), never `file://`. [TW/qa]

### 12.4 Failure-mode checks [TW/qa, AQ §7, OWA]
- Reduced motion capture (emulated): static states, no Lenis, poster or snapped chapters, feedback still legible.
- WebGL forced off / context lost: full story usable, poster matches first frame.
- JS disabled: content readable (split text visible).
- Keyboard-only walk: every control reachable, visible focus, DOM proxies for 3D hotspots.
- Throttled network, cold cache: semantic content + poster before optional 3D; a 404 asset yields a recoverable chapter, not an endless loader.
- Console clean on a fresh tab; `next build` passes; lint + typecheck pass; `git diff --check`.
- Source greps: exactly one smooth-scroll engine (`lenis` only, no `locomotive`); no `motion/react`/`framer-motion`; no `addEventListener('scroll'` in React components; no `—`/`–` in rendered copy; eyebrow/uppercase-tracking count; placeholders/TODO; unsupported claims; uncredited media. [AQ §7, DT §14]
- Detector (optional, deterministic): `~/.claude/plugins/cache/impeccable/impeccable/4.4.0/skills/impeccable/scripts/impeccable detect --json <markup dir>` (exit 2 = findings; verify each in context, call out false positives). [IMP/audit, IMP/critique]

### 12.5 Scoring rubrics for the independent review
- **Critique** [IMP/critique]: Design Specificity verdict first; Nielsen 10 heuristics 0-4 with #7 and #10 allowed `n/a` on a landing page (score out of /32); bands by percentage: 90%+ Excellent, 70%+ Good, 50%+ Acceptable, 30%+ Poor. Personas for landing pages: Jordan (first-timer: is the first action clear in 5s?), Riley (stress tester: edges, refresh mid-flow), Casey (mobile, one thumb, slow network, 44pt targets). Cognitive load: ≤ 4 visible options per decision; nav ≤ 5 top-level items. Priority issues tagged P0-P3.
- **Audit** [IMP/audit]: Accessibility, Performance, Theming, Responsive, Implementation Integrity each 0-4 (/20; 18-20 Excellent, 14-17 Good, 10-13 Acceptable).
- **Overdrive tests** [IMP/overdrive]: wow test (someone who hasn't seen it), removal test, device test, context test.

### 12.6 Release evidence [TW/qa, AQ §7, OWA]
One screenshot per representative chapter × viewport; short forward/reverse capture if transitions are central; console + failed-request status; exact commit; perf table with hardware/browser; transfer/memory estimates; reduced-motion + WebGL-fallback captures; list of unverified devices/gaps. Report motion stack, Three.js decision, asset sources, validations run and limitations. Never claim a check that was not run.

---

## 13. Conflicts between sources and the resolution we use

| Topic | Conflict | Resolution |
|---|---|---|
| Eyebrows | DT allows ≤ 1 per 3 sections; IMP/craft-floor bans outright; FD calls them a tell | **Zero eyebrows.** Headings carry themselves. |
| Headline emphasis | DT: same-family italic/bold word is fine; FD: single-word accent is a tell | No single-word accents by default; emphasis via scale, weight, or the type treatment of the whole line. |
| Custom cursor | DT §9.A bans custom cursors; CGL provides a follower pattern | No replacement of the native cursor. A follower is allowed only if it is the concept's authored interaction, `pointer-events:none`, hidden on coarse pointers and reduced motion, native cursor stays visible. |
| Dual theme | DT §6.C/§8 requires light+dark by default; DT §4.11 theme lock; IMP picks theme from use scene | One committed theme for the art piece (brand-insists clause, DT §6.C), locked page-wide; tokens structured so a second theme is possible; document the decision. |
| Display size | IMP/craft-floor display max 6rem; Awwwards/kinetic-type heroes go bigger | Default ≤ 6rem for text headlines. Oversize type treated as image (a single authored hero element) is allowed because the committed world overrides the floor [IMP/craft-floor]; it must still keep a real accessible heading and not overflow at 390px. |
| Reveal blur | CGL/CSST add blur 8px to reveals; MR: no blur unless the style calls for it | Blur only on short headings/small elements, 4-10px, and not combined on every reveal. |
| Motion amount | CGL/CSST describe a full reveal system; FD/IMP want one focal moment | One focal sequence (hero + WebGL journey) plus a small reveal vocabulary that varies by section; no uniform section entrance. |
| Reduced motion | CGL/AQ: fully static final states; IMP: keep meaningful feedback, no global kill | Remove spatial/scroll motion, smooth scroll and loops; keep short opacity/color state feedback. |
| Scroll listener | DT bans `window.addEventListener('scroll')`; TW conductor uses a passive scroll listener | No scroll listeners in React components or for DOM animation; the WebGL conductor reads Lenis/ScrollTrigger progress (or a single passive non-React listener) and never sets React state. |
| Split text | MR/CGL hand-roll splitting "to avoid paid SplitText" | SplitText is free in GSAP 3.15: use it with aria handling and verify output (`[STACK]`). |
| Scroll cue | CSST anatomy lists "subtle scroll cue"; DT bans scroll cues | No scroll cue. |
| Motion library | DT defaults to Motion (`motion/react`) and Tailwind | Stack is fixed: GSAP only, CSS Modules; never mix Motion with GSAP/Three. |
| Icons | DT: Phosphor/HugeIcons/Radix/Tabler; AQ: Solar via Iconify | One family only; pick once and document (either source's options are valid). |
| Images | DT/AQ assume image generation or picsum placeholders | No image gen available; visual richness from procedural shaders, type and layout; licensed photography only if it serves the concept, with provenance; never picsum placeholders in the shipped page. |
| Verification depth | IUV: loop until every gate passes; IMP: bounded passes, stop polishing | Loop only on failing gates with evidence; no open-ended aesthetic re-polish once gates pass. |
