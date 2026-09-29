# ASLANT · Build Brief

**Status:** DEFINITIVE. Single source of truth for the overnight build. Written 29 September 2026, 02:10 to 03:00 Moscow time, by the lead creative director and technical architect. Revised 03:20 to 04:00 after two independent reviews (art and copy, engineering): 52 issues, all applied or answered in place; the record is section 10.
**Supersedes:** `docs/process/concepts/concept-1-light.md` wherever the two disagree. The concept remains the background reading for physics, sources and prototype notes (`concept-1-light/proto/*.py`).
**Audience:** about ten engineering agents working in parallel, plus one QA agent.

## How to use this document

1. Read sections 0 to 4 in full, then your own work package in section 8, then every section your package touches.
2. **Copy is final.** Every visible string is written in this brief. Paste it exactly. If a string does not fit a layout, change the layout, not the copy. If you believe a string is wrong, raise it with the QA agent; do not edit it.
3. **Numbers in copy come from code.** Any number about light, sun or glass is rendered from `src/lib/light/glass.ts` or `src/lib/light/sun.ts`. The values printed in this brief are the expected outputs, used as test vectors.
4. **File ownership is strict** (section 8). You write only the files your package owns. To change a shared contract, ask its owner.
5. **Precedence when in doubt:** accessibility and honesty rules, then this brief, then `docs/process/06-anti-slop.md`, then `docs/process/05-skill-rulebook.md`, then the concept doc.
6. Next.js 16 has breaking changes. Before writing Next-specific code, read the relevant page in `node_modules/next/dist/docs/` (required by `AGENTS.md`).
7. Section 10 (decision log) explains why things are the way they are. It is context, not spec; where it and sections 0 to 9 differ, sections 0 to 9 win.

---

## 0. TL;DR

- **Brand:** **Aslant** (slug `aslant`). A small studio, proposed for Copenhagen, that computes, mills and fits clear window panes whose surface is shaped so that sunlight, at one chosen hour, writes a word on your wall.
- **Offer:** "Commission a pane." The visitor types a word, watches the glass being computed live until the word forms in sunlight, gets true timing for their city, saves the image, and requests a drawing.
- **Visual thesis:** One dim room across one day. A slant of window light crosses a limewashed wall from first light to dusk, and inside one pane of that light a word is made of the light itself, its edges split into a thin computed spectrum. Everything on the page is shade, sun and the colour glass separates from sunlight.

Page in one line: **8 beats, about 9 viewports, 2 sticky chapters, 0 ScrollTrigger pins, 1 fixed canvas, 1 clock.**

| # | id | Hour | Beat | Scroll length (desktop) |
|---|---|---|---|---|
| 1 | `first-light` | 08:10 | A word made of light (hero) | 100svh |
| 2 | `clear-glass` | 10:30 | The word is already in the glass (schlieren loupe) | 100svh |
| 3 | `the-bend` | 12:50 | How it works: an optical bench in 3 beats | 150svh, sticky frame |
| 4 | `appointment` | 16:12 to 17:08 | Scroll is time; the word arrives at 16:40 and leaves | 160svh, sticky frame |
| 5 | `write-yours` | your hour | Your word, computed while you watch | 100svh |
| 6 | `ledger` | 18:20 | 2,000 years of precedent plus how a pane is made | about 120svh |
| 7 | `commission` | 19:10 | The form stands in the last sun | about 105svh |
| 8 | `dusk` | 20:40 | Footer: the light collapses to an ember; the afterimage | about 70svh |

**Composition rhythm (split, binding; 5.0):** light right · light right · bench band under a full-width text band · full-width clock over light left · light left · full-width band · light left (the form) · ember. The light crosses the wall once, at noon, hidden inside the bench-to-appointment focus pull, so no moving patch ever sweeps across copy. Never more than two image-and-text splits in a row; five layout families.

---

## 1. Brand

### 1.1 Name, slug, tagline, mark
- **Name:** Aslant. Always lowercase in the wordmark (`aslant`), sentence case in running text ("Aslant").
- **Slug:** `aslant`. The project folder becomes `/Users/fedor/WebstormProjects/aslant` at the very end of the night (section 8, final step). `package.json` `name` is `aslant` from WP0 onward.
- **Tagline (also the H1):** "Clear glass that writes in sunlight."
- **Etymology (one sentence, used in the colophon):** Aslant means at a slant; the pane only writes when the light comes in aslant, at its hour. Emily Dickinson: "There's a certain Slant of light" (first published 1890, public domain).
- **Wordmark (one drawing, must-fix):** `aslant` set in Sprat at `wdth 135`, `wght 110`, heavy enough to survive caustic rendering. In the nav it is DOM text in `--c-lime` (`font-stretch: 135%; font-weight: 110` on the variable font). In the hero it is the word formed by light, rasterised from `public/fonts/Sprat-Wordmark.ttf`, a static instance generated from the variable font at exactly those values (3.2), so the nav mark and the light draw the same letters. The same file sets the OG fallback and the mark on the saved image. The only other drawing is the dusk footer's `wdth 200 wght 40`, a deliberate dusk variant that the colophon explains (5.8). Visitor words use the raster faces of 3.2, never the wordmark file.
- **Brand mark:** a single parallelogram of warm light (a window's light falling aslant). It is the favicon, the OG corner and the live nav mark (section 4.5). It is the only shape we draw. No illustration anywhere.

### 1.2 Offer, audience, conversion
- **Product (fictional studio, real physics):** caustic window panes in clear optical acrylic ("Clear") or flint glass ("Prismatic"). Each pane is tuned to an hour and a season. The word holds for about 20 minutes a day (the sun's direction within 2.5° of the design direction). Tuned to midsummer it returns every afternoon for about eight weeks; tuned to an equinox, for about two. These durations are computed by `sun.ts` (section 7.3 test vectors), never typed by hand.
- **Audience:** (1) design-literate private clients marking a person or a date (a name for a child's room, an anniversary, a memorial); (2) architects and interior designers specifying one feature pane; (3) tonight, the design jury. The site is its own proof of craft.
- **Primary CTA, identical label everywhere:** "Commission a pane" (nav, hero, menu, footer). Scrolls to `#commission`.
- **Micro-conversion:** "Write yours" (hero text link) leads to the live configurator. Its contextual button "Commission this pane" pre-fills the form.
- **Share loop:** "Save the image" downloads `aslant-<word>.png`, a designed 1080 × 1350 artifact rendered by our own renderer (section 6.4).
- **Honest conversion (must-fix):** the form never fakes a confirmation. Three modes decided at build time from env vars (section 5.7): endpoint POST, prefilled `mailto:`, or explicit preview ("Commissions open in spring 2027. Nothing was sent.").

### 1.3 Voice
Calm, exact, domestic. A craftsperson who is also a physicist, speaking to one person. Short declaratives next to one longer sentence. Physical verbs (bend, crowd, part, fall, hold, cut, fit). True numbers with units. Dry wit is allowed; hype is not. Sentence case everywhere. No em dashes, no en dashes (use a hyphen only inside words, "to" for ranges). At most one middle dot per line, only as a separator in data captions.

| Do | Don't |
|---|---|
| "Every afternoon at 16:40, the kitchen wall says her name." | "Transform your space with stunning light art." |
| "Tilt the surface a few degrees and each ray leaves at a new angle." | "Our innovative technology harnesses the power of light." |
| "Of every 100 photons, 92 reach the wall." | "99.9% light efficiency." |
| "We quote after we see the window." | "Get your custom quote today!" |
| "The live preview needs WebGL. Your numbers are still exact." | "Oops! Something went wrong." |
| "No light reaches this page." | "404: Page not found :(" |
| Name the literal action: "Request a drawing" | "Get started", "Learn more", "Submit" |

Banned outright in visible copy: every word in `06-anti-slop.md` §4A (including magic, stunning, seamless, immersive, crafted, bespoke, elevate, unlock, journey, powerful, beautiful), negative parallelism ("It's not X, it's Y", "Not X. Y.") except the two reveals licensed in 2.4 (un-ban 6), rhetorical-question headings, "Whether you're", "Ready to", eyebrows, section numbers, scroll cues.

### 1.4 The story (the paragraph every agent should be able to recite)
A sheet of glass that looks perfectly clear can carry a hidden picture, and only sunlight at the right angle can read it. Han-dynasty bronze mirrors did it two thousand years ago; Cassini let the noon sun draw a line on a church floor in 1655; Airy wrote the mathematics of bright caustic seams in 1838; EPFL published how to compute such a surface in 2014. Aslant tunes that arithmetic to the sun over one window. The pane keeps one appointment a day: before its hour the light on the wall is loose, at its hour it condenses into a word, then it moves on. The website is that room over one day. Scroll is the sun. The page ends at dusk with a colour that is not on the screen at all: the afterimage your own eye makes.

### 1.5 Honesty ledger (flagged for the client; also stated in the colophon)
- **Invented for this study:** the studio, its Copenhagen home, the first run ("forty panes, planned for spring 2027"), sizes (20 × 20 cm to 60 × 90 cm), thicknesses (12 mm, 10 mm), lead time (about ten weeks), the fitting service, the example name "Ingrid" and her birth time (16:40).
- **Real and computed live:** every number about light (Snell, Fresnel, Cauchy dispersion, solar position, daily window, season span, relief depth, rays traced, frame time, sunset time for the visitor's city).
- **Real history:** the five ledger entries (sources in concept doc §10).
- **Never:** testimonials, client logos, press, awards, "trusted by", invented metrics, prices.
- **Footer and colophon sentence (verbatim):** "Aslant is a proposal for a studio. The light is real."
- **Making log (verbatim template, generated at build, section 5.8):** "Designed and built overnight, between {00:40} and {07:52} on 29 September 2026, Moscow time."

---

## 2. Art direction

### 2.1 Visual thesis
**A slanted patch of morning sun on a grey limewashed wall, and in the lower pane of that light a word made of the light itself, its edges faintly split into colour.** That frame is the screenshot a juror remembers. Every chapter is the same wall at a later hour, so the light changes angle, length, warmth and state (loose or formed), and the typography widens as the sun gets lower. Glass is never shown as a glossy object; it is known only by what it does to light.

Dials: DESIGN_VARIANCE 8 · MOTION_INTENSITY 7 · VISUAL_DENSITY 3.

### 2.2 References as principles (never copies)
| Source | Principle we take | What we do not take |
|---|---|---|
| Vilhelm Hammershøi's interiors | A room that is mostly shade; one light source with a visible cause; grey that has a hue; empty space as the subject | His rooms, doors, figures, palette values |
| Dickinson, "There's a certain Slant of light" | Light at an angle carries meaning; winter-afternoon melancholy in the dusk chapter | Quoting beyond the one line in the colophon |
| Optical-instrument engraving (theodolites, bench scales) | Numbers are real readouts, set in the text face with tabular figures; hairlines only where they measure | Mono "technical costume", crosshairs, registration marks |
| Schwartzburg et al., EPFL 2014; Ferraro 2021 | The physics of computed caustics: light moves, it is not added | Their images, their renders, their layouts |
| Awwwards SOTY pattern (one committed world, metaphor carried into loader, menu, 404, footer) | The loader is dawn, the menu opens like shutters, the nav mark is a patch of light, the 404 has no light | Any layout, motif or interaction from a specific site |

### 2.3 Materials and texture (all caused, none pasted)
- **Limewash plaster.** Pale material (albedo 0.62 × `#D6CEBE`, linear) that only reads dark because it is in shade. Radiance = albedo × (skylight + sunlight × mask × caustic). Lighting is multiplicative; the patch is light on a surface, never a beige card laid on top.
- **The room reads as a room (must-fix).** Skylight is raised so the limewash mottling (±9%, two scales: cloudy 0.3 to 1 m blotches and fine trowel marks) is visible everywhere, not just inside the sun. Skylight falls off about 20% from the window side (upper left) to the far side (lower right). One architectural cue: the **skirting board** at the foot of the wall, visible in the hero and dusk views only (section 6.1.4).
- **Old window glass.** The plain upper light carries horizontal drawn-glass cords at ±12% (old cylinder glass is drawn in one direction, so its faint caustics are streaks, never isotropic ripple). The plain pane reads as sun through old glass; our pane makes a word.
- **Penumbra.** Every patch edge softens over 1.2% of the patch width (the sun's 0.53° disc at about 2 m).
- **Window bars.** Transom shadow between upper and lower light; one mullion shadow dividing the upper light. Soft-edged like the patch.
- **Dust motes (Tyndall).** Only inside the beam (the volume between window and patch), never on the shade.
- **Grain is photon noise.** Amplitude ∝ 1/√luminance: present in shade, nearly gone in sun. Lives in the compositor. There is no DOM grain layer.
- **Spectrum is computed.** The only saturated colour anywhere is the spectrum at caustic edges, computed per wavelength band with the CIE 1931 observer. No colour token exists for it and nothing in the UI is rainbow.

### 2.4 What we will NOT do
All 68 tells in `06-anti-slop.md` are banned. The ones most likely to creep in on this concept:
- No prism, no rainbow on black, no glass blob, no iridescent object, no `MeshTransmissionMaterial`, no drei `<Caustics>`.
- No gradient text (`background-clip: text` must not appear in the codebase), no neon glows, no colored `box-shadow` halos, no glassmorphism and no `backdrop-filter` anywhere.
- No eyebrows, no section numbers, no "Scroll" cue, no bento, no three cards, no stat banner, no logo wall, no testimonial, no FAQ, no pricing.
- No Inter, no reflex fonts, no monospace anywhere (live data is Geologica with tabular figures).
- No SplitText except the hero H1. No blur on body copy. No fade-up-20px on every block. No bounce, elastic or back easing. No magnetic buttons. No custom cursor replacing the native one. No infinite UI loops.
- No percentage preloader. No pins (sticky frames instead). No second smooth-scroll engine. No `@react-three/postprocessing` in this build (the compositor does tone mapping, halation and grain in one pass).
- No stock photography, no model-drawn SVG illustration. Allowed drawings: the brand parallelogram, the sun-path arc (data graphic), the relief contour map (data graphic), the bench (rendered by WebGL from traced rays).

**Conditional un-bans, each with its rationale (keep these exact scopes):**
1. Dim ground (#4, #10): the scene is a room in shade lit by one sun; the shade has a hue (`#3A4142`), the light has a source, glow exists only where rays concentrate. The brightest wall pixel behind any text stays within +18% of the calibrated shade (verified on rendered pixels by `check:contrast`).
2. Blur on one heading: the hero H1's optical focus-in is the concept's physics; max 8 px; once on the page.
3. Cursor companion: the loupe is an optical instrument, chapter 2 only, additive, native cursor stays visible.
4. Oversized numerals: the appointment clock is a true readout of the scrubbed time; ledger years are real dates.
5. Hairlines in the ledger: they organise a real list.
6. Negation followed by affirmation, exactly twice, at the two reveals: "You cannot read it in the glass. Only the light can." (loupe) and "That colour is not on your screen. Your eye made it." (afterimage). The concept is a hidden image revealed by light, and these are the two moments the reveal happens. No other instance anywhere; QA flags any third.

---

## 3. Design tokens (exact values)

### 3.1 Colour

**Strategy:** Restrained plus one physical event. The page is grey plaster in shade and warm sunlight. The accent (`--c-sun`) is literally direct sunlight and stays under 3% of DOM pixels. The only saturated colour is the computed spectrum inside the canvas.

**Recalibration (must-fix).** The concept's `#252B2C` read as a black UI void. The unlit wall is raised to **`#3A4142`**, the lightest grey that still keeps lime at 7:1 and dust at 4.5:1 on the brightest mottled, window-side wall pixel (+18% linear irradiance). Every pair below was recomputed with the WCAG 2.x formula. **Revision:** `--c-dust` is lightened from `#B4BCB7` to `#BCC3BE`. The worst-case column now applies +18% to linear irradiance and pushes it through the ACES curve (the old column added 18% to displayed luminance, which flattered the result); the old dust fell to 4.68:1 there and 4.54:1 once photon grain adds 2 levels, one mottling pocket from failing on every 13 to 14 px label.

| Token | Hex | Role |
|---|---|---|
| `--c-shade` | `#3A4142` | Limewash in shade. `body` background, canvas calibration target at 08:10, `theme-color` at load |
| `--c-recess` | `#30363A` | Inputs on shade, menu panel (a recess in the plaster, darker than the wall) |
| `--c-line` | `#5B6361` | Decorative hairlines that organise a real list (ledger rows). Never for UI boundaries |
| `--c-lime` | `#ECE6D9` | Primary text |
| `--c-dust` | `#BCC3BE` | Secondary text, labels, input underlines on shade |
| `--c-sun` | `#FFE1A6` | The one accent: primary button fill, focus ring, `::selection`, caret, nav mark at midday |
| `--c-sun-hi` | `#FFE9BD` | Primary button hover |
| `--c-sunlit` | `#E9DCBF` | The commission panel: wall in the last sun (matched to the canvas, section 3.1.3) |
| `--c-umber` | `#1E2224` | Text, focus ring and primary buttons on sun or sunlit surfaces |
| `--c-umber-soft` | `#4E4A42` | Secondary text and field underlines on sunlit |
| `--c-rust` | `#8C3A14` | Error text on sunlit |
| `--c-rust-light` | `#FFB08A` | Error text on shade |
| `--c-dusk` | `#272C36` | Blue-hour wall (dusk chapter; no-WebGL footer ground) |
| `--c-ember` | `#FF9B54` | Sunset light (canvas, epilogue, no-WebGL ember) |
| `--c-predawn` | `#2C3237` | Loader shutters |
| `--c-field` | `#8C8C8C` | Neutral afterimage field (R = G = B on purpose: the blue must come from the eye) |
| `--c-field-ink` | `#16181A` | Text on the field |

**Checked text pairs (WCAG ratio; target body 4.5, large 3, UI 3):**

| Foreground on background | Ratio | Worst case on canvas (+18% linear irradiance through ACES; with +2 levels of grain) |
|---|---|---|
| lime on shade | 8.38 | 7.31 (7.08) |
| dust on shade | 5.80 | 5.06 (4.90) |
| sun on shade | 8.23 | 7.17 (6.95) |
| rust-light on shade | 5.87 | n/a |
| lime on recess | 9.85 | n/a |
| dust on recess | 6.82 | n/a |
| lime on dusk | 11.26 | 10.24 (9.94) |
| dust on dusk | 7.79 | 7.09 (6.88) |
| lime on predawn | 10.43 | n/a |
| umber on sun (primary button) | 12.66 | n/a |
| umber on sun-hi (hover) | 13.47 | n/a |
| umber on sunlit | 11.80 | n/a |
| umber-soft on sunlit | 6.49 | n/a |
| rust on sunlit | 5.66 | n/a |
| field-ink on field | 5.29 | n/a |
| ember on shade (canvas only) | 5.00 | n/a |

#### 3.1.1 Shade by hour (canvas calibration targets)
The compositor computes skylight per channel so that the tone-mapped unlit wall at the **calibration point** (the chapter's text zone centre, 64 × 64 px mean; the actual plaster value over that window is divided out, 6.1.5) equals these values within 2 sRGB levels. At +18% linear irradiance every row still passes lime ≥ 7.0 and dust ≥ 4.85 (worst: 12:50, lime 7.07, dust 4.89).

| Hour | Chapter | Unlit wall target |
|---|---|---|
| 06:00 | loader (dawn) | `#343B42` |
| 08:10 | first-light | `#3A4142` (= `--c-shade`) |
| 10:30 | clear-glass (room behind the pane) | `#3B4242` |
| 12:50 | the-bend (haze base is separate: `#2F3536`) | `#3C4343` |
| 16:40 | appointment | `#3D4241` |
| 17:20 | write-yours default | `#3E423F` |
| 18:20 | ledger | `#3F413C` |
| 19:10 | commission | `#3E3F3B` |
| 20:40 | dusk | `#272C36` |

Hours in between interpolate linearly in linear-light RGB.

#### 3.1.2 Sunlight ramp (canvas only)
Sun colour (sRGB hex, converted to linear) × intensity `E_sun`, in the compositor's units (exposure 1.0, ACES Narkowicz fit, albedo 0.62 × `#D6CEBE`). Skylight `E_sky` is derived from 3.1.1 by inverting the tone curve on the CPU, so it is not listed.

| Hour | Sun colour | E_sun | Note |
|---|---|---|---|
| 06:00 | `#FFD2A8` | 0.7 | loader slit only; start of the dawn ramp |
| 08:10 | `#FFE3C4` | 1.4 | hero (morning sun is physically weaker); plain upper light mean about sRGB (216, 203, 178), p99 luminance about 214, so the word (about 250 with halation) is the brightest thing on screen |
| 10:30 | `#FFF0DE` | 2.5 | far patch seen through the pane |
| 12:50 | `#FFF5EA` | 2.6 | bench beam colour |
| 16:40 | `#FFE6BF` | 2.4 | appointment (warms toward 17:08) |
| 17:20 | `#FFDFB2` | 2.3 | write-yours default |
| 18:20 | `#FFD096` | 2.2 | ledger band |
| 19:10 | `#FFD9AD` | 2.41 | commission; calibrated so the lit wall renders `#E9DCBF` ± 3 levels |
| 20:40 | `#FF9B54` | 1.6 | ember patch |

Rule (must-fix, hierarchy): the word is the brightest thing on screen. The plain upper light's 99th-percentile luminance (Rec. 709 weights on the displayed sRGB values) stays ≤ 215, and no channel's p99 exceeds 235, so it never reads as a flat beige card and never competes with the letters or shares a value range with the `--c-sun` buttons. Only caustic letters exceed 1.0 and bloom (halation above 0.9). Verified tonight with the compositor maths of 6.1.3: at `E_sun` 2.4 the upper light's p99 luminance was about 231; at 1.4 it is about 214.

#### 3.1.3 Calibration rules
- Shader colours come from these tokens through `srgbHexToLinear()` in `src/lib/color.ts` (not `THREE.Color`, because the canvas runs with `linear` and `flat`, section 4.2). Every token a shader reads has a hex twin in `src/lib/world-spec.ts`.
- `--c-sunlit` equals the canvas lit wall at 19:10 within 3 levels, so the DOM panel and the canvas penumbra around it read as one surface.
- The hero poster WebP (section 4.11) is captured from the live renderer after G1 and therefore matches `--c-shade` by construction.

#### 3.1.4 Browser surfaces
- `::selection { background: var(--c-sun); color: var(--c-umber); }`
- `caret-color: var(--c-sun)` on shade; `var(--c-umber)` inside the sunlit panel.
- Focus: `outline: 2px solid var(--c-sun); outline-offset: 3px;` inside the sunlit panel `outline-color: var(--c-umber)`.
- Links: `text-decoration-thickness: 1px; text-underline-offset: 0.22em; text-decoration-color: var(--c-dust)`; hover: decoration `var(--c-sun)`.
- Scrollbar: `scrollbar-width: thin; scrollbar-color: var(--c-line) transparent;`
- `<meta name="theme-color">` starts at `#3A4142` and follows the hour (section 4.13).
- `color-scheme: dark` on `:root` (form controls and scrollbars render dark).

### 3.2 Typography

Two families. No monospace anywhere.

| Role | Family | Source and licence | Axes (verified tonight with fontTools / Next font data) |
|---|---|---|---|
| Display, wordmark, clock, years, H1, H2, H3 | **Sprat** by Ethan Nakache (Collletttivo), v2.000 | GitHub `EthanNakache/Sprat-type`, branch **`master`**, SIL OFL 1.1 | `wdth` **100 to 200** (default 100), `wght` **10 to 200** (default 10). Named instances: wght 10 Thin, 40 Light, 100 Regular, 120 Medium, 175 Bold, 200 Black; wdth 100 Condensed, 122 Regular, 200 Extended. 230 glyphs, extended Latin, `liga` only (no `tnum`, no Greek). Has ° × → − · ’ “ ”. |
| Text, UI, live data | **Geologica** by Monokrom (Sindre Bremnes, Frode Helland) | The Google Fonts repository file `Geologica[CRSV,SHRP,slnt,wght].ttf`, SIL OFL 1.1, **self-hosted through `next/font/local`** from two subsets (no network at build or runtime) | `wght` 100 to 900, `SHRP` 0 to 100, `CRSV` 0 to 1, `slnt` -12 to 0, kept in both subsets. Latin subset (47 KB WOFF2, preloaded, has `tnum`); extended subset (Latin Extended, Greek, Cyrillic: 77 KB, fetched only when such a letter appears, through `unicode-range`). 836 code points in all, 182 Cyrillic. |

**Download URLs (all verified HTTP 200 tonight):**
- `https://raw.githubusercontent.com/EthanNakache/Sprat-type/master/Sprat_Variable.ttf` (116,492 bytes) → convert to `src/fonts/Sprat_Variable.woff2` with `python3 -c "from fontTools.ttLib import TTFont; f=TTFont('Sprat_Variable.ttf'); f.flavor='woff2'; f.save('Sprat_Variable.woff2')"` (fontTools 4.59 and brotli are installed; OFL permits conversion).
- `https://raw.githubusercontent.com/EthanNakache/Sprat-type/master/Sprat-RegularMedium.otf` → `public/fonts/Sprat-RegularMedium.otf` (canvas raster face for words of 1 to 7 characters; wdth 122, wght 120).
- `https://raw.githubusercontent.com/EthanNakache/Sprat-type/master/Sprat-CondensedMedium.otf` → `public/fonts/Sprat-CondensedMedium.otf` (raster face for 8 to 10 characters).
- `https://raw.githubusercontent.com/EthanNakache/Sprat-type/master/Sprat-ExtendedLight.otf` → `public/fonts/Sprat-ExtendedLight.otf` (the visitor's word in the save-image caption; the OG fallback uses the wordmark instance).
- `https://raw.githubusercontent.com/EthanNakache/Sprat-type/master/Licence_OFL.txt` → `public/fonts/Sprat-OFL.txt`.
- **Wordmark instance (1.1), at T+0:** `fonttools varLib.instancer Sprat_Variable.ttf wdth=135 wght=110 -o public/fonts/Sprat-Wordmark.ttf` (the installed fontTools; verified tonight: a 29,920-byte static TTF with the full 225-code-point map). It is the raster face for `aslant` (bake, live fallback, save-image mark) and the Satori OG fallback face.
- `https://raw.githubusercontent.com/google/fonts/main/ofl/geologica/Geologica%5BCRSV%2CSHRP%2Cslnt%2Cwght%5D.ttf` (348,640 bytes; a copy is already in the session scratchpad at `fonts/Geologica.ttf`) → two WOFF2 subsets with `pyftsubset` (fontTools; both commands verified tonight):
  - `pyftsubset Geologica.ttf --unicodes="U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2190-2195,U+2212,U+2215,U+FEFF,U+FFFD" --layout-features='*' --flavor=woff2 --output-file=src/fonts/Geologica-Latin.woff2`
  - `pyftsubset Geologica.ttf --unicodes="U+0100-024F,U+0370-03FF,U+0400-052F,U+1E00-1EFF" --layout-features='*' --flavor=woff2 --output-file=src/fonts/Geologica-Ext.woff2`
  - Licence: `https://raw.githubusercontent.com/google/fonts/main/ofl/geologica/OFL.txt` → `public/fonts/Geologica-OFL.txt`.
- **Charset table (WP0, generated, must-fix):** `src/lib/caustics/sprat-charset.ts` exports `SPRAT_CHARS: ReadonlySet<number>` (the code points of `Sprat-RegularMedium.otf`: 225, ASCII without `^` and `~`, Latin-1, Œ œ and a few Welsh letters; no Cyrillic and none of ł ő č š ž ř ş ğ İ) and `GEOLOGICA_CHARS` (the union of the two subsets), both extracted with fontTools from the files above and written as literal arrays. Never typed by hand.

**Loading (`app/fonts.ts`):**
```ts
import localFont from 'next/font/local'

export const sprat = localFont({
  src: '../src/fonts/Sprat_Variable.woff2',
  variable: '--font-sprat',
  display: 'block',            // about 50 KB and preloaded: the invisible period is negligible
  weight: '10 200',
  declarations: [{ prop: 'font-stretch', value: '100% 200%' }],
  adjustFontFallback: false,   // next/font would size the fallback from the default instance (wdth 100, wght 10: Condensed Thin), so wide headings would re-wrap on swap
  preload: true,
})

export const geologica = localFont({
  src: '../src/fonts/Geologica-Latin.woff2',
  variable: '--font-geologica',
  display: 'swap',
  weight: '100 900',
  preload: true,
})

export const geologicaExt = localFont({
  src: '../src/fonts/Geologica-Ext.woff2',
  variable: '--font-geologica-ext',
  display: 'swap',
  weight: '100 900',
  preload: false,
  adjustFontFallback: false,   // the variable must hold the family name only (see the stack below)
  declarations: [{ prop: 'unicode-range', value: 'U+0100-024F, U+0370-03FF, U+0400-052F, U+1E00-1EFF' }],
})
```
- The text stack puts the extended face first: `--f-text: var(--font-geologica-ext), var(--font-geologica), system-ui, sans-serif`. Its `unicode-range` excludes Basic Latin and Latin-1, so those letters fall through to the Latin face; a Cyrillic or Central European letter (a visitor typing "Фёдор" or "Łucja") renders in Geologica, not in the Latin face's Arial-sized fallback. WP0 checks the built CSS: if `next/font/local` drops the `unicode-range` descriptor, move the extended face to a plain `@font-face` in `globals.css` (file copied to `public/fonts/`) with the same range.
- The three font variable classes go on `<body>`, never on `<html>` (the head script writes `html` attributes; a client re-render of the root must not wipe them, 7.2).
- Sprat axes are driven with standard properties: `font-stretch: 185%` sets `wdth 185`; `font-weight: 30` sets `wght 30` (the face declares weight 10 to 200, so CSS weights below 100 are valid). Never use `font-variation-settings` for Sprat.
- Geologica sharpness: `font-variation-settings: 'SHRP' 100` only on UI and readout styles (listed below). Body uses SHRP 0 (default, omit the property).
- Canvas rasterisation of words uses `new FontFace('SpratRaster', 'url(/fonts/Sprat-RegularMedium.otf)')` (and `SpratRasterCondensed`, and `SpratWordmark` from `/fonts/Sprat-Wordmark.ttf` for the brand word), added to `document.fonts` and awaited with `document.fonts.load('200px SpratRaster')` before drawing. Canvas cannot set variable axes reliably, so static files are required.
- **Face per word (must-fix, 5.5):** `aslant` → `SpratWordmark`; a visitor word whose every letter is in `SPRAT_CHARS` → `SpratRaster` (1 to 7 characters) or `SpratRasterCondensed` (8 to 10); a word with any letter outside Sprat but all letters in `GEOLOGICA_CHARS` → Geologica at weight 600, by the family names read from `--font-geologica-ext` and `--font-geologica`, after `await document.fonts.load('600 200px <families>', word)` (this fetches the extended subset). Anything else never reaches the raster (validation, 5.5). Canvas silently substitutes a default font for missing glyphs, so this check is the only guard. Test words: "Фёдор", "Łucja", "Zoë" (Zoë is in Sprat).
- The canvas caption in the save-image artifact uses `SpratRasterExtended` (`Sprat-ExtendedLight.otf`) for the visitor's word (Geologica 600 when the word is outside Sprat), `SpratWordmark` for the mark, and Geologica through its generated family names read from `getComputedStyle(document.body)`.

**Legibility rules (must-fix):**
- No Sprat below `wght 40` at any size under 48 px. Hairline weights (below 40) are allowed only for the appointment clock and the ledger years, and only at 48 px or more.
- The type follows the light: each H2's width axis comes from the sun's height at its chapter hour (low sun, long light, wide letters). Values are static per section (no reflow on scroll).
- Sprat has no tabular figures. The clock is set digit by digit in fixed slots (`display: inline-block; width: 1.08em; text-align: center` at `wdth 185`; `0.88em` at `wdth 150`; engineers measure the widest digit in-browser once and set the slot to it). The colon slot is `0.34em`.
- Readouts use Geologica with `font-variant-numeric: tabular-nums` and a `min-width` in `ch` so values never shift layout.
- `text-wrap: balance` on H1, H2, H3; `text-wrap: pretty` on body.
- **Type engineering (must-fix).** The reset sets `:root { font-synthesis: none }` (Sprat's weight axis stops at 200, so a forgotten heading weight must never become synthetic bold) and `h1, h2, h3 { font-weight: inherit }`. Type tokens are applied as classes (`.t-hero`, `.t-h2`, `.t-label`, …) in `globals.css`: each sets the `font` shorthand (which resets weight, stretch, style and line-height), then `font-stretch` for Sprat (the shorthand accepts only width keywords, not percentages) and `font-variation-settings` explicitly (`'SHRP' 100` or `normal`, since that property inherits). Components never set `font-weight`, `font-stretch` or `font-variation-settings` outside these classes, so a Geologica span inside a Sprat heading never inherits a hairline weight (Geologica clamps anything under 100).

**Fluid type scale (named steps):**

| Token | Face and axes | Size | Line-height · tracking | Where |
|---|---|---|---|---|
| `--t-clock` | Sprat `wdth 185` `wght 14` (below 768 px: `wdth 150` `wght 20`) | `clamp(4rem, 13vw, 13rem)` (a full-width clock, 5.4); below 768 px `clamp(4rem, 21vw, 5.5rem)` | 0.9 · 0 | appointment clock |
| `--t-hero` | Sprat, by breakpoint: ≥1091 `wdth 180 wght 30`; 1024 to 1090 `wdth 180 wght 40` (the size there is 44 to 48 px, and the legibility rule forbids wght under 40 below 48 px); 768 to 1023 `wdth 160 wght 40`; <768 `wdth 150 wght 44` | ≥1024 `clamp(2.75rem, 4.4vw, 4.75rem)`; 768 to 1023 `5.2vw`; <768 `clamp(2.25rem, 10.4vw, 2.75rem)` | 1.02 · 0 | hero H1 |
| `--t-h2` | Sprat `wght 40`, `wdth` from the chapter table below | `clamp(2rem, 3.4vw, 3.5rem)` | 1.06 · 0 | chapter H2 |
| `--t-year` | Sprat `wdth 170 wght 22` (below 768 px `wdth 140 wght 26`) | `clamp(3rem, 4.2vw, 4rem)` | 1 · 0 | ledger years |
| `--t-h3` | Sprat `wdth 150 wght 60` | `clamp(1.5rem, 2vw, 1.875rem)` | 1.12 · 0 | ledger spec heading, colophon heading |
| `--t-menu` | Sprat `wdth 170 wght 40` | `clamp(2.25rem, 4.6vw, 3.75rem)` | 1 · 0 | menu hours |
| `--t-wordmark` | Sprat `wdth 135 wght 110` (the one wordmark drawing, 1.1) | 34 px (below 768 px: 28 px) | 1 · 0 | nav wordmark, 404 wordmark |
| `--t-footmark` | Sprat `wdth 200 wght 40` | `clamp(5rem, 16vw, 15rem)` | 0.9 · 0 | dusk wordmark (decorative, `aria-hidden`) |
| `--t-lead` | Geologica 340 | `1.25rem` (below 768 px `1.125rem`) | 1.5 · 0.003em | hero sub, chapter subs |
| `--t-body` | Geologica 360 | `1.0625rem` | 1.6 · 0.005em, max `64ch` | paragraphs |
| `--t-ui` | Geologica 520, SHRP 100 | `0.9375rem` | 1.2 · 0.01em | buttons, labels, nav, switches |
| `--t-label` | Geologica 420, SHRP 100 | `0.8125rem` | 1.4 · 0.01em | readout labels, field helpers |
| `--t-value` | Geologica 460, SHRP 100, `tabular-nums` | `0.9375rem` | 1.4 · 0 | readout values |
| `--t-caption` | Geologica 380 | `0.875rem` | 1.5 · 0.005em | captions, footnotes, colophon |

**H2 width by chapter (the type follows the light):**

| Chapter | Hour | H2 `wdth` desktop | H2 `wdth` below 768 px |
|---|---|---|---|
| clear-glass | 10:30 | 150 | 115 |
| the-bend | 12:50 | 110 | 103 |
| appointment | 16:40 | 150 | 115 |
| write-yours | your hour, default 17:20 | 160 | 118 |
| ledger | 18:20 | 180 | 124 |
| commission | 19:10 | 190 | 127 |

### 3.3 Spacing (4-based)
`--sp-1 4px` · `--sp-2 8px` · `--sp-3 12px` · `--sp-4 16px` · `--sp-5 24px` · `--sp-6 32px` · `--sp-7 48px` · `--sp-8 64px` · `--sp-9 96px` · `--sp-10 128px` · `--sp-11 192px`.
Rules: more space above a heading than below it (H2 margin-bottom `--sp-5`; blocks above an H2 at least `--sp-8`). Section inner top padding clears the nav: `calc(var(--nav-h) + var(--sp-7))`.

### 3.4 Grid and breakpoints
| Name | Range | Columns | Gutter | Margin |
|---|---|---|---|---|
| xs | < 480 px | 4 | 16 px | 16 px |
| sm | 480 to 767 px | 4 | 16 px | 24 px |
| md | 768 to 1023 px | 8 | 20 px | 40 px |
| lg | 1024 to 1439 px | 12 | 24 px | 5.5vw |
| xl | ≥ 1440 px | 12 | 28 px | `clamp(79px, 5.5vw, 120px)` |

- Grid spans the viewport minus margins; `--grid-max: 1800px` (centred above that). The canvas is always full-bleed.
- Media queries use literal values: `(min-width: 480px)`, `(min-width: 768px)`, `(min-width: 1024px)`, `(min-width: 1440px)`. Pointer queries: `(hover: hover) and (pointer: fine)` for desktop behaviours.
- Nav height `--nav-h`: 72 px (≥ 768), 56 px (< 768).
- Full-height sections use `svh` (never `vh`): `min-height: 100svh`.
- Viewport meta (Next `viewport` export): `width=device-width, initial-scale=1, viewport-fit=cover`. No `interactive-widget` (the default `resizes-visual` keeps the 100svh, 150svh and 160svh sections from reflowing while a visitor types in write-yours on Chrome Android; the keyboard alignment of 5.5 uses scroll plus `visualViewport`).
- Horizontal overflow is impossible by construction (must-fix): `globals.css` sets `html, body { overflow-x: clip; overscroll-behavior-x: none }` (`clip`, never `hidden`, so sticky keeps working) and `html { overscroll-behavior-y: none }` (no rubber-band frames where the canvas trails the DOM, 5.7).

### 3.5 Radii, borders, layers
- Radius: `--radius: 0` everywhere (cut glass). The only curve is the loupe (`50%`) because lenses are round.
- Borders: 1 px only. Input underline 1 px `--c-dust` (on sunlit `--c-umber-soft`); ledger separators 1 px `--c-line`.
- Shadows: none in the DOM, except the commission panel penumbra in the no-WebGL mode (section 5.7).
- z-index tokens: `--z-canvas 0` · `--z-poster 1` · `--z-content 10` · `--z-overlay 20` (loupe proxy, ray overlay) · `--z-loader 40` · `--z-nav 50` · `--z-menu 60` · `--z-dialog 70` · `--z-epilogue 80` · `--z-skip 100`.

### 3.6 Motion tokens
**Language: "Nothing slides. Things come into focus."** Arrivals are focus (fast start, long settle), exits are defocus (faster than arrivals), world changes are light.

| Token | CSS | GSAP (`CustomEase.create`) | Use |
|---|---|---|---|
| `--ease-focus` | `cubic-bezier(0.16, 1, 0.3, 1)` | `CustomEase.create('focus', 'M0,0 C0.16,1 0.3,1 1,1')` | arrivals, word formation, H1 focus-in, light sweep |
| `--ease-defocus` | `cubic-bezier(0.7, 0, 0.84, 0)` | `CustomEase.create('defocus', 'M0,0 C0.7,0 0.84,0 1,1')` | exits, word loosening on input |
| `--ease-light` | `cubic-bezier(0.45, 0, 0.2, 1)` | `CustomEase.create('light', 'M0,0 C0.45,0 0.2,1 1,1')` | world changes, menu time-lapse scroll, patch travel |
| `--ease-shutter` | `cubic-bezier(0.7, 0, 0.2, 1)` | `CustomEase.create('shutter', 'M0,0 C0.7,0 0.2,1 1,1')` | loader shutters, menu open |
| scrub | n/a | `ease: 'none'` | every scroll-mapped value |

Banned: bounce, elastic, back, default `ease-in-out`, `power2` stock eases.
`gsap.defaults({ ease: 'focus', duration: 0.9 })`.

| Duration token | Value | Use |
|---|---|---|
| `--dur-tick` | 120 ms | hover and press |
| `--dur-state` | 240 ms | toggles, bench beat caption crossfade, appointment line fade-in, nav CTA fade-in |
| `--dur-fade` | 400 ms | plain heading fade |
| `--dur-copy` | 500 ms | hero sub fade |
| `--dur-close` | 450 ms | menu close, dialog close |
| `--dur-shutter` | 700 ms | loader open, menu open, leave the room |
| `--dur-sweep` | 900 ms | light-sweep heading |
| `--dur-focus` | 900 ms | H1 focus-in (per word) |
| `--dur-timelapse` | 1400 ms | menu and CTA jumps (`lenis.scrollTo`) |
| `--dur-refocus` | 1600 ms | word settling after the last streamed frame (maximum) |
| `--dur-form` | 2200 ms | hero formation |

### 3.7 `src/styles/tokens.css` (literal; WP0 writes this file exactly)
```css
:root {
  color-scheme: dark;

  /* colour */
  --c-shade: #3A4142;
  --c-recess: #30363A;
  --c-line: #5B6361;
  --c-lime: #ECE6D9;
  --c-dust: #BCC3BE;
  --c-sun: #FFE1A6;
  --c-sun-hi: #FFE9BD;
  --c-sunlit: #E9DCBF;
  --c-umber: #1E2224;
  --c-umber-soft: #4E4A42;
  --c-rust: #8C3A14;
  --c-rust-light: #FFB08A;
  --c-dusk: #272C36;
  --c-ember: #FF9B54;
  --c-predawn: #2C3237;
  --c-field: #8C8C8C;
  --c-field-ink: #16181A;

  /* families (variables come from next/font) */
  --f-display: var(--font-sprat), 'Times New Roman', serif;
  --f-text: var(--font-geologica-ext), var(--font-geologica), system-ui, sans-serif;

  /* type sizes */
  --t-clock: clamp(4rem, 13vw, 13rem);
  --t-hero: clamp(2.25rem, 10.4vw, 2.75rem);
  --t-h2: clamp(2rem, 3.4vw, 3.5rem);
  --t-year: clamp(3rem, 4.2vw, 4rem);
  --t-h3: clamp(1.5rem, 2vw, 1.875rem);
  --t-menu: clamp(2.25rem, 4.6vw, 3.75rem);
  --t-wordmark: 28px;
  --t-footmark: clamp(5rem, 16vw, 15rem);
  --t-lead: 1.125rem;
  --t-body: 1.0625rem;
  --t-ui: 0.9375rem;
  --t-label: 0.8125rem;
  --t-value: 0.9375rem;
  --t-caption: 0.875rem;

  /* spacing */
  --sp-1: 4px; --sp-2: 8px; --sp-3: 12px; --sp-4: 16px; --sp-5: 24px; --sp-6: 32px;
  --sp-7: 48px; --sp-8: 64px; --sp-9: 96px; --sp-10: 128px; --sp-11: 192px;

  /* grid */
  --cols: 4; --gutter: 16px; --margin: 16px; --grid-max: 1800px;
  --nav-h: 56px;

  /* shape */
  --radius: 0; --hairline: 1px;

  /* layers */
  --z-canvas: 0; --z-poster: 1; --z-content: 10; --z-overlay: 20; --z-loader: 40;
  --z-nav: 50; --z-menu: 60; --z-dialog: 70; --z-epilogue: 80; --z-skip: 100;

  /* motion */
  --ease-focus: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-defocus: cubic-bezier(0.7, 0, 0.84, 0);
  --ease-light: cubic-bezier(0.45, 0, 0.2, 1);
  --ease-shutter: cubic-bezier(0.7, 0, 0.2, 1);
  --dur-tick: 120ms; --dur-state: 240ms; --dur-fade: 400ms; --dur-copy: 500ms;
  --dur-close: 450ms; --dur-shutter: 700ms; --dur-sweep: 900ms; --dur-focus: 900ms;
  --dur-timelapse: 1400ms; --dur-refocus: 1600ms; --dur-form: 2200ms;
}

@media (min-width: 480px) { :root { --margin: 24px; } }
@media (min-width: 768px) {
  :root {
    --cols: 8; --gutter: 20px; --margin: 40px; --nav-h: 72px;
    --t-hero: 5.2vw; --t-lead: 1.25rem; --t-wordmark: 34px;
  }
}
@media (min-width: 1024px) {
  :root { --cols: 12; --gutter: 24px; --margin: 5.5vw; --t-hero: clamp(2.75rem, 4.4vw, 4.75rem); }
}
@media (min-width: 1440px) {
  :root { --gutter: 28px; --margin: clamp(79px, 5.5vw, 120px); }
}
```
The clock's mobile size and all axis values live in the component styles, per the table in 3.2.

---

## 4. Global systems

### 4.1 One Clock, render on dirty, idle (non-negotiable)
Every moving thing reads the same timestamp and the same scroll value in the same frame. One `gsap.ticker` callback, owned by `SmoothScroll` (WP1), runs this fixed order:

```
[gsap core: Timeline.updateRoot]    → every GSAP tween updates FIRST (gsap-core registers it before anything else)
gsap.ticker (time s, deltaTime ms)  → the bus converts once: dt = Math.min(deltaTime / 1000, 1 / 30)   // seconds
 1. lenis.raf(time * 1000)          → native scroll moves; 'scroll' event → ScrollTrigger.update()
 2. readScroll()                     → frame.scroll.{y, max, progress, velocity, direction}
 3. conductor.update(dt)             → the only DOM read phase (4.3); exact + smooth chapter state, hour, blends; folds section inputs; writes light-state; marks stage dirty on change
 4. afterScroll listeners (t, dt)    → writes only: DOM readouts, nav mark and favicon, theme-color (≤ 4 Hz), sound params (≤ 10 Hz)
 5. renderers (t, dt)                → Stage: if (visible && !document.hidden && stage.shouldRender()) advance(t, true, rootState)   // seconds
```
- **Frame bus (WP0 by T+20, then WP1).** `frame.ts` exports `afterScroll: Set<FrameFn>` and `renderers: Set<FrameFn>` with `type FrameFn = (t: number /* s */, dt: number /* s, clamped to 1/30 */) => void` (7.3). Nothing else adds its own `gsap.ticker` listener or `requestAnimationFrame` loop. Order is therefore deterministic regardless of React effect order. The bus wraps every listener call in `try/catch` and logs each failing listener once (with its name), so one section's bug never skips the render or freezes the canvas for the whole page. `math.ts` `damp()` takes seconds; nothing ever passes GSAP's millisecond delta onward (at 120 Hz that would make every damping four times too fast).
- **Tweens run before the One Clock (must-fix rule).** Because `updateRoot` runs first, a tween on a field the conductor writes is overwritten in the same frame and never shows. So: **tweens never target a conductor-written field** (list in 7.3). Sections tween their own plain-number input objects (`light.intro`, `light.input[chapter]`, `light.loupe`, …), which the conductor folds in during `update()` (4.3). Every tweenable value is a plain number on a plain object; in development `tweenLight` asserts that its target is not array-like (GSAP treats an array-like target as a list of targets and silently does nothing).
- **Stage registration (WP4).** `Stage.tsx` switches to `frameloop="never"` and registers `(t) => advance(t, true, rootState)` into `renderers` **inside `onCreated`**, unregistering in the matching cleanup (R3F 9.8's `advance()` renders every root without checking that it is configured, so registering at mount throws every frame until configuration finishes). R3F's own loop never runs; `invalidate()` is a no-op under `frameloop="never"`, so every redraw goes through `stage.requestRender()`. The existing `Lifecycle` frameloop switching is deleted.
- **Singletons (must-fix).** Dev StrictMode mounts effects twice. Lenis, the ticker listener, the worker, the `AudioContext` and the stage-api registration each have a module-level guard and a symmetric cleanup, so nothing doubles. QA's dev assertion: after mount `gsap.ticker` has exactly two listeners (`updateRoot` and the One Clock).
- **Render on dirty.** `src/lib/stage.ts` exposes `requestRender(frames = 1)`, `hold(key)`, `release(key)`, `touch()`, `idle`, `frameMs`, `frameSource`. `shouldRender()` is true when dirty frames remain, any hold is active, or (not idle and something ambient is visible: shimmer, dust). Every GSAP tween that writes to `light` goes through `tweenLight(target, vars)` in `stage.ts`, which holds on start and releases on complete or kill.
- **Redraw triggers (must-fix; a resize clears the drawing buffer and, with `alpha: false`, shows black).** `stage.requestRender(2)` runs on: R3F size changes and `viewport.dpr` changes (effects on `useThree(s => s.size)` and `s.viewport.dpr` in `Stage`, WP4); `visibilitychange` to visible; `pageshow` (bfcache restore); context restore and every epoch remount; the `document.fonts` `loadingdone` event; the end of every `conductor.measure()`; and every governor step (below). G2 check: leave the page idle for 10 s, resize the window, the frame redraws.
- **Ambient cadence.** When only ambient terms are dirty (no hold, no pending dirty frames), render at most 60 Hz (every other tick on a 120 Hz display). Scroll, pointer, tweens and holds keep the full rate. A settled shimmer is at most 0.8 px of warp; 1,200 full-screen frames per interaction on a 120 Hz panel buy nothing.
- **Idle (must-fix).** `stage.touch()` is called on scroll delta, pointer move, key, touch, tween activity and worker frames. After **10 s** without a touch: `idle = true`, `light.time` (shimmer and dust clock) and `light.grainSeed` freeze, and nothing renders until the next dirty mark. Any input resumes within one frame. Idle GPU cost: zero frames.
- **Pause.** No `advance` while `document.hidden` or the canvas host is outside the viewport (IntersectionObserver, threshold 0). The canvas is fixed, so it is always in the viewport in practice; the check protects embedded or print contexts.
- **Frame time (must stay true).** `stage.frameMs` is measured with `EXT_disjoint_timer_query_webgl2` when the extension exists (`frameSource = 'gpu'`), otherwise as the CPU time of `advance()` (`frameSource = 'cpu'`). WP1 owns the timer (`src/webgl/gpu-timer.ts`); WP4's `Stage` wraps `advance` with it and reports through `stage.recordFrame(ms, source)`. Every on-page frame-time line prints the source.
- **Quality governor (must-fix; replaces drei's `PerformanceMonitor`, which counts `useFrame` calls per wall-clock window and would read every render-on-dirty pause, the idle freeze and the loader as low fps, then downgrade the jury's Mac for the session).** Lives in `stage.ts` (WP1). It samples only runs of rendered frames on consecutive ticker ticks (a tick without a render ends the run, so pauses never enter a sample; this replaces the review's "discard gaps over 1.5× the refresh period", which would also discard genuinely dropped frames). Metric: `stage.frameMs` when `frameSource = 'gpu'`, otherwise the tick-to-tick interval. Decline only when the p90 over at least 2 s of continuous rendering exceeds the budget: GPU time 10 ms at 60 Hz or 6.5 ms at 120 Hz; interval 1.5 refresh periods. The refresh period is the median tick interval of the first second. At most two declines per session, never back up: first DPR − 0.25 (not below 1.0), then GPU tier 3 → 2. Each decline is logged under `?qa` with its samples.
- **Delta clamp.** Every simulation uses `dt` in seconds, already clamped to 1/30 by the bus.

### 4.2 Canvas architecture (decision)
**One fixed, full-viewport R3F canvas behind all content** (the existing `StageRoot` + `Stage`, modified), not drei `<View>`.
Why: (1) the page is one continuous wall under one sun; the patch must travel, lengthen and warm between chapters, which View's per-box scissoring cannot do; (2) the look is one full-screen compositor pass plus one point-splat pass into a render target, so boxes would multiply passes; (3) the only DOM-locked light (commission panel, dusk ember, and the write-yours preview and ledger band on phones) needs one or two rect reads per frame, which we do ourselves (technique T25) more cheaply than View's per-frame reads for every box; (4) focus-pull transitions need a single compositor that can cross-fade modes; (5) one clock, one render function, one context.

Canvas settings: `frameloop="never"`, `flat` (no tone mapping by three), `linear` (no sRGB conversion by three; the compositor encodes sRGB itself), `dpr` from the GPU tier (section 4.11), `gl={{ antialias: false, alpha: false, depth: false, stencil: false, powerPreference: 'high-performance' }}`, `resize={{ scroll: false, debounce: { scroll: 0, resize: 100 } }}` (R3F's default adds a rect read on every scroll), default orthographic camera unused by passes (all passes draw in clip space), `style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}`, `aria-hidden` on the host. Pointer input comes from `frame.pointer` (written by `SmoothScroll`), never from R3F events.

**Canvas host (must-fix for phones).** `position: fixed; top: 0; left: 0; width: 100%; height: 100lvh` (never `inset: 0`, whose height changes every time mobile toolbars collapse or expand; each change would reallocate and clear the buffer and jump `uViewport`, shifting the falloff and vignette). Height-only resizes are ignored on coarse pointers. `light.viewport` is the canvas's CSS size as reported by R3F (WP4 writes it), never `innerWidth` and `innerHeight`.

**Failure paths (must-fix).** In `onCreated`: `gl.debug.onShaderError = () => useApp.getState().setWebgl('failed')` (three r186 logs compile and link errors but does not throw; without this hook one typo in a late chunk gives a black page that still reports ready). The stage reports ready (`boot.report('shaders', 1)`, then `'frame'`) only after `renderer.compileAsync()` has resolved for a scene containing **every** pass (caustic, compositor with all three mode chunks, bench, dust, ray view) and one full frame has rendered; nothing compiles on first use mid-scroll. If `next/dynamic` fails to load the Stage chunk or the Scene never registers, the loader failsafe (4.4) sets `'failed'` (Overcast) instead of opening onto an unlit wall.

**Plug-ins (7.3 `src/webgl/pass.ts`).** Every pass implements `Pass { init(gl); visible(): boolean; render(gl); resize(w, h, dpr); dispose() }` and is a plain TypeScript class that owns its materials and uniforms (components hold passes in `useRef`, never `useMemo`; 7.6 lint). The pane and bench modes are `ModeChunk`s (`{ glsl, uniforms, update(light, dt) }`) exported by `shaders/pane.glsl.ts` and `shaders/bench.glsl.ts` (WP5) and merged by WP4's `Compositor`, which calls each chunk's `update` every rendered frame; WP5 never edits WP4's files and WP4 never writes WP5's code.

Render graph per frame, in this order (details in section 6):
1. **Caustic pass** into `rtCaustic` (half float), only when a word pane is visible **and** its inputs changed (focus, wave, sun offset, targets, glass, bands, pane aspect). Otherwise the cached texture is reused.
2. **Compositor** (one full-screen triangle, modes `wall | pane | bench`) to the screen.
3. **Bench rays** (`BenchPass`, WP5; instanced soft lines, additive) when the bench mode is visible.
4. **Dust motes** (`DustPass`, WP4; points, additive, masked to the beam) when a patch is visible, GPU tier ≥ 2 and motion is full.
5. **Ray view** hairlines (`RayViewPass`, WP2; hidden layer R) when enabled.

### 4.3 Conductor: scroll is the day
`src/lib/conductor.ts` (WP2) turns native scroll into chapter state. It never integrates wheel deltas; the same scroll position always yields the same state, forward, backward, after a jump and after reload.

**Measurement.** On mount, `document.fonts.ready` and `loadingdone`, window resize (width changes only on coarse pointers), a `ResizeObserver` on `<main>`, and `ScrollTrigger` refresh: read every `section[data-chapter]` (document `offsetTop`, `offsetHeight`), every sticky frame (`offsetHeight`) and every `[data-light-anchor]` element. Non-live scrim rects are measured here too. `vh` in the formulas below is the measured height of a `100svh` probe element, never `innerHeight`. Every `measure()` ends with `stage.requestRender(2)`.

**Rest intervals** `[a_i, b_i]` in scroll-y, per chapter, composition and motion mode (`restModeOf()` in `world-spec.ts`):
- `rest`: `a = b = clamp(top, 0, maxScroll)` (section top at viewport top).
- `sticky`: `a = top`, `b = top + section.offsetHeight - frame.offsetHeight` (the sticky frame's own height, never `innerHeight`: on iOS with collapsed toolbars the difference ends the interval 80 to 100 px early).
- `end`: `a = b = clamp(top + height - vh, 0, maxScroll)` (section bottom at viewport bottom).
- `live`: `a = top`, `b = top + max(0, height - vh)`; within it the patch is DOM-locked to the anchor's live rect.
- The last chapter (`dusk`) is always `a = b = maxScroll`.

**Sticky geometry (must-fix).** For `sticky` chapters, rest geometry (patch, bench diagram, calibration point) is stored relative to the sticky frame, and each frame the conductor reads the frame element's live rect (one `getBoundingClientRect` per sticky chapter with weight > 0) and places the geometry from it. Outside the stuck range the diagram and its DOM labels (the bench scale note, the wall caption, the `BenchFigure` hit area, the appointment caption) travel together; inside it they coincide. Without this, the 20% blend plateaus (which run while the frame is not yet stuck) would show a fixed diagram with its labels sliding across it. G2 screenshot: the-bend's section top at 10vh.

**DOM read phase (must-fix, 3 ms budget).** `conductor.update()` is the only place that reads layout during a frame, and it reads everything it needs in one batch (live anchors, live scrims, sticky frames) before anything writes. `afterScroll` listeners only write, using rects cached by `anchors.ts` or the conductor. Reads are skipped entirely when the scroll moved less than 0.5 px, no live anchor or sticky frame has weight, and nothing was invalidated. (GSAP's root timeline has already written styles this frame, so every read forces one style and layout pass; there must never be a second.)

**State at scroll y:**
- Inside `[a_i, b_i]`: chapter `i`, `local = (y - a_i) / max(1, b_i - a_i)`, `blend = 0`.
- Between `b_i` and `a_{i+1}`: `raw = (y - b_i) / (a_{i+1} - b_i)`, `blend = smoothstep(0.2, 0.8, raw)`. The 20% plateaus at both ends mean copy at its reading position always sits in stable light.
- `exact` (from `frame.scroll.y`) drives UI: nav label, `aria-current`, readout ownership, interaction gating, DOM-locked rects.
- `smooth` (from `ySmooth = damp(ySmooth, y, 5.2, dt)`) drives hour, colours, defocus and `rest` geometry. Under reduced motion `smooth = exact`.

**Blending chapter states.** `worldSpec(id, local, comp, motion, visitor)` returns a `ChapterState` (7.3) for a chapter, including its word defaults (`id`, `focus`, `wave`, `prism`). Between chapters the conductor lerps every numeric field in linear light (colours) or linearly (everything else), lerps patch rects and skews, and handles view-mode changes with a focus pull: `defocus = sin(π · blend)²`, `modeMix = smoothstep(0.44, 0.56, blend)`. Word focus and wave are blended like every other number, so nothing pops when ownership of the exact chapter flips at blend 0.5.

**Section inputs (must-fix: one writer per field, no frame-order fights).** Sections never write conductor fields. Each section writes deltas into its own plain object `light.input[chapter]` (`focus`, `wave`, `sunX`, `sunY`, `aberr`, `pointScale`, `driftX`; all 0 by default) and may tween it. The hero intro writes `light.intro.dawn` and `light.intro.form` (0 to 1). The visitor's configurator writes `light.visitor` (`hour`, `alt`, `prism`, `valid`). During `update()` the conductor folds them in: final value = Σ over the (at most two) chapters in the blend of `weight_i × (state_i + input_i)`. A far chapter has weight 0, so a section's influence fades with its light and ownership needs no hand-off. Sections update their input only while their chapter has weight > 0.

**Transports (must-fix).** One arbiter: `stageApi.requestTransport(owner: ChapterId, t: Transport)` stores the latest transport per owner (hero `aslant`, appointment `ingrid`, write-yours the visitor's word and its streamed frames, commission the success word). `light.word.id` (from the heavier chapter's `ChapterState`; `'visitor'` resolves to write-yours' transport) selects which one the Scene shows, so the chapter with the larger blend weight always wins. Changing the shown transport:
- at a focus-pull peak (`defocus > 0.9`): swap, no morph;
- wall to wall (appointment to write-yours, write-yours to ledger): the Scene runs loosen (effective focus to 0.2 over 250 ms, `defocus`), swaps, then re-forms (450 ms, `focus`); instant under reduced motion;
- the same owner streaming: 120 ms morph (6.1.2).
All transports index the same R2 origins (6.1.1): a transport of `n` rays covers origins 1 to `n`, and the first `n` rays of a 65,536-ray bake are a valid uniform subsample. The ray count drawn (and `uSpacing`, `uNorm`) changes only while effective focus ≤ 0.2, where the loose pattern hides it; morphs between different counts run over the smaller count.

**Anchors.** Each chapter renders one `<LightAnchor chapter="…" />` (a `div[data-light-anchor]`, `aria-hidden`, positioned by the section's CSS). Its bounding box is the light patch's bounding box at rest. The parallelogram inside the box has vertices top-left `(x, y)`, top-right `(x + w - k, y)`, bottom-right `(x + w, y + h)`, bottom-left `(x + k, y + h)` with `k = skew · h`. For `rest` chapters the conductor stores the rect relative to the viewport at rest; for `sticky` chapters, relative to the sticky frame, placed from the frame's live rect each frame (above). For `live` chapters, and always for the dusk ember, it reads `getBoundingClientRect()` every frame (at most two elements at a time).

**Scrims (graft; must-fix for legibility).** Any element with `data-scrim` is a text box the light must respect. Each frame the conductor passes up to 8 viewport rects (nearest first; the nav is always one) to `light.scrims`. The compositor multiplies the **sun and caustic term only** (never skylight) by `mix(1.0, 0.015, scrimMask)`, with the 32 px feather placed **outside** the text rect: inside every text box the wall is in full shade and the feather reads as a soft shadow edge. (Revision: the old floor of 0.3 left 30% of the sun behind text, which renders a scrimmed sunlit wall at about rgb(186, 169, 143) and lime at 1.8:1; the "+18% of shade" rule allows only 1.1% to 1.7% of the sun, depending on the hour. At 0.015 lime stays at 6.7:1 or more and dust at 4.66:1 or more in every chapter.) **Passing cloud:** during wall-to-wall blends the sun dims to `E_sun × (1 − 0.8 · sin(π · blend))` (`light.cloud`, conductor), so text-shaped shadows never read as cut-outs in motion and the loosen-swap-reform of a word change happens under a cloud. On by default; WP4 may switch it off at G2 only if QA's capture shows the shadows already read as soft. Elements inside sticky frames use `data-scrim="live"` (live rect). Layout keeps text off the patch at every chapter's rest; scrims only protect the transitions.

**Hour.** `light.hour` (smooth) and `light.hourExact` are decimal hours: chapter hours from section 5, the appointment's scrubbed minutes inside its sticky range, the visitor's chosen hour inside write-yours.

### 4.4 Preloader: act zero, "dawn"
- **Purpose:** real preloading (fonts, light data, shader compile, first frame) staged as the shutters of the room opening at dawn. No numbers, no percentage.
- **DOM (WP6, `components/Loader`):** two full-height shutter panels (`--c-predawn`) covering the viewport under the nav (`z-index: var(--z-loader)`; the nav stays visible and usable above it). Between them a vertical slit, 2 px wide at progress 0 and 14 px at progress 1, positioned at the hero patch's horizontal centre (desktop x = 0.70 vw; below 768 px x = 0.5 vw), spanning the patch's height. Before the canvas has rendered, the slit shows a CSS warm gradient (`#FFD2A8` at 20% to 100% opacity with progress); once `data-webgl="ready"`, the slit is simply the gap through which the live canvas (pool light, focus 0) is seen.
- **Rendered in SSR, shown only by CSS (must-fix).** The shutters are server-rendered markup, `display: none` by default and shown only by `html[data-js][data-motion='full']:not([data-still]) .loader { display: block }`, attributes the head script sets before first paint (4.11). If they mounted after hydration, first paint would show the formed-word poster and a visible H1, then snap shut and replay: the ending before the beginning. The H1's pre-intro state (`opacity: 0`) is set in CSS on `html[data-js][data-motion='full']:not([data-still]):not([data-intro]) .heroTitle`: the head script sets `data-intro="skip"` for mid-page arrivals (below), and WP6 sets `data-intro="run"` the moment the intro starts (the split then carries the per-word states) and `"done"` at the end. CSS failsafes cover a dead script: the pre-intro H1 has `animation: aslant-reveal 0.4s 8s forwards` and the loader `animation: aslant-open 0.45s 8s forwards` (later than the 6 s JS failsafe plus the open), so nothing stays hidden if JS never runs the intro.
- **Mid-page arrivals (must-fix).** The head script sets `data-intro="skip"` when `location.hash` is present, or when `performance.getEntriesByType('navigation')[0].type` is `'reload'` or `'back_forward'` (a mode-switch reload to `/?webgl=0#write-yours`, a hash link, a reload with scroll restoration). Skip means: the loader still covers the first paint, opens in 450 ms as soon as progress allows, and the hero is already settled (no timeline, no SplitText).
- **Signals (`src/lib/boot.ts`; WP0 writes it by T+20, WP1 owns it after):** `boot.report(key, value)` and `boot.subscribe(fn)` (7.3). Weights: fonts 0.2 (boot.ts itself watches `document.fonts.ready` and `rasterReady()` from WP3's `raster.ts`), light data 0.4 (reported by WP3's `loadBaked('aslant')`, fetched and decoded), shaders 0.3 (reported by WP4 when `compileAsync` has resolved for every pass, 4.2), first frame 0.1 (WP4, after the first full frame). With `data-webgl="off"` the last three are 1 immediately. The loader (WP6) subscribes; progress drives the slit width and brightness through `gsap.quickTo` (0.6 s), never overtaking the real value.
- **Handoff:** when progress is 1 and at least 500 ms have elapsed, the shutters slide apart (`translateX(∓50vw)`, 700 ms, `shutter` ease) and the hero timeline (section 5.1) starts. **Failsafe at 6 s:** if the stage is still not ready, the loader sets `webgl` to `'failed'` (Overcast: posters and CSS light) and opens; it never opens onto an unlit wall. Any wheel, touch, key or click during loading opens the shutters immediately (300 ms) and marks the intro as skipped (hero lands in its settled state as soon as the canvas can draw). Lenis is never stopped by the loader.
- **Repeat visit** in the same session (`sessionStorage['aslant:seen']`, try/catch): the minimum is 0 ms and the open takes 450 ms.
- **Reduced motion:** no loader at all (the CSS gate). **No JS:** never shown (no `data-js`; SSR shows the hero). `?still=`: no loader.
- The loader is `aria-hidden`. A visually hidden live region is not needed because the content underneath is present and readable by assistive technology from the first paint.

### 4.5 Navigation
**Bar** (WP6, `components/Nav`), fixed, height `--nav-h`, padding-inline `--margin`, transparent over the canvas, registered as a scrim.
- Left: wordmark link `aslant` (Sprat `wdth 135 wght 110`, `--t-wordmark`, `--c-lime`), `href="#first-light"`, `aria-label="Aslant, back to first light"`.
- Centre-right (≥ 768 px): the **menu button**: the live mark + the hour label, e.g. `08:10  First light` (hour in `--t-value` tabular, name in `--t-ui`, `--c-dust`). `aria-label="Chapters. Now: First light, 08:10"`, `aria-expanded`, `aria-controls="menu"`.
- Right (≥ 768 px): primary button "Commission a pane" (compact, 40 px high), `href="#commission"`. **Hidden while the exact chapter is `first-light`** (`visibility: hidden; opacity: 0`, so it is neither seen nor focusable; the hero's own button carries the action), fading in over 240 ms once the exact chapter changes (instant under reduced motion). The first frame then holds a single sun-filled rectangle. With no JS it is always visible (the rule is keyed on `html[data-js]`).
- Below 768 px: wordmark left; menu button right showing the mark and the hour only (`08:10`); the chapter name stays in the `aria-label`. The CTA lives in the hero, the menu and the footer.
- The label shows the exact chapter (`blend < 0.5 ? i : i + 1`) and its authored hour; inside write-yours it shows the visitor's chosen hour and "Your word".

**Live nav mark (graft).** A 28 × 16 px inline SVG parallelogram (`<polygon>`), `aria-hidden`, whose skew, length and warmth follow the page hour: `--mark-skew` (the current patch skew, clamped 0.05 to 0.9), `--mark-len` (0.55 at noon to 1.0 at dusk; scaleX), `--mark-color` (the current sun colour as sRGB hex; ember at dusk; `#5B6361` when the sun is off). Updated from an `afterScroll` listener only when a value changes by more than 1%. Under `data-webgl="off"` it still follows the exact hour (it is DOM).

**Live favicon (jury-delight edge).** The same listener (WP2) mirrors the mark's three values into the page's `<link rel="icon" type="image/svg+xml">` as an SVG data URL (the `icon.svg` square in `--c-shade` with the live parallelogram), at most once per second and only when a value changed. The tab holds the page's hour of light and turns ember at dusk. Browsers that ignore SVG icons keep the static `icon.svg` and `apple-icon.png`.

**Menu** (WP6, `components/Menu`), `role="dialog"`, `aria-modal="true"`, `aria-label="Chapters"`, id `menu`.
- **Opens like the shutters:** a full-viewport `--c-recess` panel whose `clip-path` goes from `inset(0 calc(100% - var(--x) - 1px) 0 calc(var(--x) - 1px))` (a 2 px slit at the mark's x) to `inset(0)` in 700 ms `shutter`; during the open, a 2 px `--c-sun` edge rides each shutter edge (pseudo-elements). Close: reverse in 450 ms `defocus`. Focus moves to the first item; Tab is trapped; Esc and the "Close" button close it and return focus to the menu button. `inert` on `<main>` and the footer while open. Lenis is stopped while open (`stopScroll('menu')`) and started on close (`startScroll('menu')`), 4.7.
- **Items** (links; hour in `--t-menu` Sprat, name in `--t-lead` Geologica), current item `aria-current="step"`:
  - `08:10` First light → `#first-light`
  - `10:30` Clear glass → `#clear-glass`
  - `12:50` The bend → `#the-bend`
  - `16:40` The appointment → `#appointment`
  - `{your hour}` Your word → `#write-yours` (default `17:20`)
  - `18:20` Precedent → `#ledger`
  - `19:10` Commission → `#commission`
  - `20:40` Dusk → `#dusk`
- Below the items: `<ModeSwitches />` (Sound, Still air, Overcast, with the live mode line; section 4.11) and the primary button "Commission a pane".
- **Menu jumps are time-lapses (graft):** an item's click handler calls `e.preventDefault()` and `jumpTo('#id', { timelapse: true, focus: true })` (4.7), which closes the menu (300 ms), restarts Lenis, scrolls over 1.4 s with the `light` ease, replaces the hash, and focuses the chapter's H2 on arrival, so the light visibly fast-forwards or rewinds the day on the way. Reduced motion: instant jump, same focus. (Without `preventDefault` the browser performs an instant fragment jump behind the open menu and the time-lapse starts at its destination.)
- Layout: desktop items in one column at x = `--margin`, vertically centred, mode switches bottom-left, CTA bottom-right. Mobile: items stacked from `--nav-h + 24px`, switches and CTA at the bottom, scrollable inside (`data-lenis-prevent`).

### 4.6 Cursor decision
The native cursor is always visible. There is no cursor follower. Three pointer behaviours exist, each with a concept job and a touch or keyboard equivalent:
1. **Hero and write-yours: the pointer is the sun** (fine pointers only, section 5.1).
2. **Clear-glass: the loupe** (fine pointer follows; touch drags a DOM proxy disc; keyboard uses the "Show the relief" toggle).
3. **The bend: pick a ray** (hover picks the nearest ray; tap on touch; keyboard steps rays with the arrow keys when the bench figure has focus).
No magnetic buttons, no hover lifts, no blend-mode blobs.

### 4.7 Lenis and GSAP setup
- **Lenis** (only engine; existing `components/providers/SmoothScroll.tsx`): `autoRaf: false`, `lerp: 0.085`, `smoothWheel: true`, `wheelMultiplier: 0.95`, `syncTouch: false` (native touch scrolling), `stopInertiaOnNavigate: true`, **`anchors: false`**. Never created under reduced motion (native scroll). Never combined with `ScrollTrigger.normalizeScroll`. `lenis.css` imported once. Do not set `scroll-behavior: smooth` anywhere.
- **In-page links (must-fix).** Lenis 1.3.26's anchor handler calls `scrollTo` without `preventDefault`, and `scrollTo` is ignored while Lenis is stopped, so its anchors option is off. `SmoothScroll` exports one helper, `jumpTo(target: string, opts?: { timelapse?: boolean; focus?: boolean | string })`, and installs one delegated click listener for same-page `a[href^="#"]` links that calls `e.preventDefault()` and `jumpTo`. The helper handles reduced motion (instant jump), the `light` ease over 1.4 s (`timelapse`), `history.replaceState` for the hash (ModeSwitches reads it), and, when the scroll completes, focuses the target (its heading with `tabindex="-1"`, or the selector given in `focus`) with `preventScroll: true`. Every custom-handled link (menu items, CTAs, "Commission this pane", footer links, the skip link) goes through it.
- **Scroll locks.** `SmoothScroll` also exports `stopScroll(key)` and `startScroll(key)`; Lenis runs while no key is held. The menu, the colophon `<dialog>` (which also carries `data-lenis-prevent`, so its own overflow scrolls) and the epilogue field hold keys while open. Wheel input over a modal never scrolls the page behind it.
- **GSAP** (`src/lib/gsap.ts`): register `useGSAP`, `ScrollTrigger`, `SplitText`, `CustomEase`; create the four eases of section 3.6; `ScrollTrigger.config({ ignoreMobileResize: true })`; `gsap.defaults({ ease: 'focus', duration: 0.9 })`. All component animation lives in `useGSAP(() => …, { scope })`; handlers created later use `contextSafe`.
- **Motion gating (must-fix: one source of truth).** Still air is `html[data-motion="reduced"]`, set once by the head script from the OS preference or `?motion=reduced` (4.11). Every JS gate reads `motion()` from `qa-flags.ts` (or `useApp.reducedMotion`, initialised from it); CSS uses `html[data-motion='reduced']`, never `@media (prefers-reduced-motion)`. `gsap.matchMedia()` is banned for motion gating (it cannot see the URL flag). The existing `SmoothScroll.tsx` (which overwrites `dataset.motion` from the media query and creates Lenis whenever the OS allows motion) and `useReducedMotion.ts` (media query only) are rewritten to read `motion()`. When the OS preference changes at runtime, the page reloads at the current chapter hash, the same path the Still air switch takes; nothing is hot-swapped.
- **ScrollTrigger usage is minimal:** `once: true` reveal triggers (light sweep, heading fades) and `refresh()` after fonts and layout changes. **There are no pins and no scrubbed ScrollTrigger timelines** (graft: sticky frames). Section progress comes from the conductor.

### 4.8 Heading and copy motion (must-fix)
1. **Hero H1 only: optical focus-in** (WP6, `components/FocusTitle`). The split is created only when the intro starts, after `document.fonts.ready`, never on mount (the H1 waits in its CSS pre-intro state, 4.4; under `data-intro="skip"` no split is ever made). `SplitText.create(h1, { type: 'words', aria: 'auto' })`. Each word animates from `{ opacity: 0, filter: 'blur(6px)', scale: 1.02, textShadow: '-4px 0 0 rgba(255,176,120,0.55), 4px 0 0 rgba(150,196,255,0.5)' }` to `{ opacity: 1, filter: 'blur(0px)', scale: 1, textShadow: '0px 0 0 rgba(255,176,120,0), 0px 0 0 rgba(150,196,255,0)' }`, 900 ms, stagger 60 ms, `focus` ease: a warm and a cool copy of each word converge like the caustic edges (total split 8 px at most). On complete: `split.revert()` and `clearProps`. Used nowhere else.
2. **Light sweep** (graft; WP9, `components/LightSweep`) for three H2s: clear-glass, appointment, ledger. Markup: the H2 contains a base span (visible text for everyone) and an `aria-hidden` lit copy absolutely positioned over it. With motion, the base is "lime in shade" `#9A9890` (3.57:1, large text) and the lit copy is revealed by animating `mask-position` from `100% 0` to `0% 0` on `mask-image: linear-gradient(var(--sweep-angle), #000 0 40%, transparent 60% 100%)`, `mask-size: 300% 100%`, 900 ms `focus`, triggered once at `top 75%`. The angle is the chapter's true light direction: clear-glass `140deg`, appointment `118deg`, ledger `104deg`. At rest the text is solid `--c-lime` (no gradient remains). No JS or reduced motion: plain lime text, no mask. `background-clip: text` is never used.
3. **Plain fade** for the-bend, write-yours and commission H2s: opacity 0 → 1, 400 ms, once at `top 80%`.
4. **Body copy never blurs and never translates.** It is present from first paint. Exceptions (opacity only): hero sub (500 ms), hero CTAs (400 ms), bench beat captions (240 ms crossfade), appointment beat line (240 ms), write-yours status and result (240 ms).
5. Readouts update as plain numbers, never scrambled.

### 4.9 Grain, noise, dither
- Photon grain in the compositor: `grain = (hash(fragCoord, grainSeed) - 0.5) * 0.010 / sqrt(0.12 + lum) * 0.35` in display space. That is about ±2 levels in shade and under ±0.5 in sun (must-fix: the wall is not noise).
- Final ±0.5/255 ordered or hash dither after tone mapping to kill banding in the long shade gradients (graft).
- Grain seed advances per rendered frame while not idle and freezes when idle.
- No DOM grain overlay. Posters carry grain baked in.

### 4.10 Sound (opt-in, default off, first to cut)
- One state (`useApp.soundOn`), three controls bound to it: "Sound" switch in the menu and footer (`components/ModeSwitches`), and "Hear the light" switch in write-yours. `role="switch"`, `aria-checked`. Visible label always. Seven 2 × 10 px bars beside the label: flat when off, live band energies when on (from an `AnalyserNode`, updated ≤ 20 Hz).
- `src/lib/audio/ambient.ts` (WP7): `AudioContext` created inside the first click handler. Master gain ≤ 0.125 (about −18 dBFS peak). Suspend on `visibilitychange` hidden; resume on visible if on. All parameter changes via `setTargetAtTime` at ≤ 10 Hz.
  - **Room:** looped noise buffer → lowpass 900 Hz, gain 0.02; scroll velocity opens it to 1.8 kHz and gain 0.05 ("the air moves").
  - **Spectrum chord:** seven sine voices in D Dorian (Newton matched his seven colours to it in *Opticks*, 1704): D3 146.83, E3 164.81, F3 174.61, G3 196.00, A3 220.00, B3 246.94, C4 261.63 Hz (voices 4 to 7 may be raised an octave for spread). Each voice gain = 0.018 × band energy × (0.4 + 0.6 × focus). Loose light detunes each voice by up to ±12 cents with a 0.3 Hz tremolo; a formed word is a still, consonant chord. In write-yours the chord drifts out of tune while the glass computes and resolves as the word forms (graft "Hear the light").
- Sound is not motion: it stays available under reduced motion. Hidden when `AudioContext` is missing.

### 4.11 Modes, tiers and fallbacks
**Head script** (inline in `app/layout.tsx` `<head>`, runs before first paint; `<html suppressHydrationWarning>`):
```js
(function(){var d=document.documentElement,q=new URLSearchParams(location.search);d.dataset.js='';
var rm=q.get('motion')==='reduced'||matchMedia('(prefers-reduced-motion: reduce)').matches;d.dataset.motion=rm?'reduced':'full';
var w='pending';if(q.get('webgl')==='0'||!('WebGL2RenderingContext'in window)||(navigator.connection&&navigator.connection.saveData))w='off';d.dataset.webgl=w;
var t=q.get('tier');if(t==='0'||t==='2'||t==='3')d.dataset.tierForced=t;if(q.get('still'))d.dataset.still=q.get('still');
try{var n=performance.getEntriesByType('navigation')[0];if(location.hash||(n&&(n.type==='reload'||n.type==='back_forward')))d.dataset.intro='skip'}catch(e){}
try{if(sessionStorage.getItem('aslant:seen'))d.dataset.seen='1'}catch(e){}})();
```
The script sets the `data-js` **attribute**, never a class: the font variable classes live on `<body>` and nothing else writes `html`'s `class`, so a client re-render of the root (dev HMR of `layout.tsx`) cannot wipe it (7.2). `StageRoot` then confirms WebGL2 with a real context probe (released with `WEBGL_lose_context`) and a renderable half-float target (`EXT_color_buffer_float` **or** `EXT_color_buffer_half_float`; three's half-float targets work with either, so devices with only the latter are not sent to Overcast needlessly); failure sets `webgl` to `'off'`. **Single writer:** after the head script's initial value, `useApp.setWebgl()` is the only writer of `html[data-webgl]` (StageRoot, the loader failsafe, the shader-error hook and context loss all call it).

**GPU tiers** (must-fix: GPU quality and motion are separate axes). `useApp.gpuTier: 0 | 2 | 3` mirrored to `html[data-tier]`, decided once at boot (`?tier=0|2|3` overrides; any other value is ignored); motion is `useApp.reducedMotion` / `html[data-motion]` and never changes the tier. Code that picks K, N, RT size, dust or DPR reads `gpuTier` only.

| GPU tier | Who | Rays × bands | `rtCaustic` long side | DPR cap | Extras | GPU target |
|---|---|---|---|---|---|---|
| 3 | fine pointer, `hardwareConcurrency ≥ 8`, WebGL2 + a renderable half-float target | 65,536 × 8 (live words 32,768 × 8) | 1024 | 1.75 | dust 1,200, haze, halation | ≤ 6 ms |
| 2 | every other WebGL2 device with a renderable half-float target (coarse pointer, fewer than 8 cores), or tier 3 after the governor's second decline (4.1) | 32,768 × 4 | 768 | 1.35 | dust 400, no haze, no halation | ≤ 8 ms |
| 0 | no WebGL2, no renderable half-float target, context lost without restore, shader error, stage not ready at the loader failsafe, Save-Data, `?webgl=0` | posters + CSS light | n/a | n/a | n/a | 0 |

A reduced-motion visitor gets tier 3 or 2 quality with every time-based term frozen (below). The governor of 4.1 replaces drei's `PerformanceMonitor`; drei is not imported anywhere.

**Still air (calm motion)** = `data-motion="reduced"`, set once by the head script from the OS preference or `?motion=reduced` (a runtime OS change reloads, 4.7):
- No Lenis, no loader, no hero formation (settled frame), no pointer sun, no dust, no shimmer, no grain animation, no sweeps, no H1 focus-in, no time-lapse jumps, no loosen-swap-reform (words swap instantly).
- Sticky chapters become static stacks: their sections switch to `height: auto`, sticky frames to `position: static`, and all beats are laid out in order (appointment: the clock fixed at 16:40 with the word formed and both lines visible; its patch becomes `live`, DOM-locked to its anchor in flow).
- Clear-glass and the-bend show their posters exactly as in Overcast: `relief.webp` with the caption (toggle hidden) and `bench.webp` with the three beat texts as a list; the canvas shows only the plain wall behind them (no pane or bench mode).
- WebGL renders on scroll change as well as on state change: light that moves with its content is not animation. Every time-based term is frozen (`light.time`, grain seed, shimmer, dust, intro).
- Where scroll is native (here and on every coarse pointer), DOM-locked registration is owned by the DOM (5.7).
- The configurator still works (the word appears when computed, no streaming animation). The epilogue still works.

**Overcast (no WebGL)** = `data-webgl="off"` or `"failed"`:
- `StageRoot` renders no canvas. Body background `--c-shade`.
- Hero: `<picture>` poster (captured from our renderer) inside the hero section (`position: absolute`, behind the lockup, scrolls with the hero). When the canvas draws, the poster is hidden with `opacity: 0` only (never `display: none` or `visibility: hidden`, which would drop its alt text from the accessibility tree).
- Every other `LightAnchor` renders a **CSS light**: a child element carries the parallelogram (`clip-path: polygon(...)` from the same skew) filled with a vertical gradient from the chapter's lit-wall colour at 92% to 80%; a **sibling** element with the same polygon carries the 14 px blur for the penumbra (a `clip-path` clips its own pseudo-elements, so a blurred `::after` on the clipped element would never show). Word chapters show the word as DOM Sprat in `--c-sun` inside it (Geologica 600 for a word outside Sprat's letters).
- **CSS scroll-driven light (graft):** under `@supports (animation-timeline: view())`, each CSS patch animates `transform: skewX(...) scaleX(...)` across its pass through the viewport (`animation-timeline: view(); animation-range: cover 10% cover 90%`), so the patches still slide, lengthen and warm through the day. Without support they are static.
- Clear-glass shows `public/posters/relief.webp`; the bend shows `public/posters/bench.webp` with all three captions listed; write-yours shows readouts only with the note "The live preview needs WebGL. Your numbers are still exact."; save-image is hidden.
- Context loss: poster and CSS light fade in over 240 ms; on restore the scene remounts (epoch key), re-uploads cached transports and fades the canvas back after its first frame.

**No JS:** complete SSR content in order, native scroll, `html` has no `data-js` attribute so nothing is hidden, CSS light visible, hero poster, the form works as a plain HTML form in the configured mode (section 5.7).

**Switches as content (graft; implemented as reloads for robustness).** `components/ModeSwitches` (WP10) renders three `role="switch"` buttons with visible labels and plain helpers (the `Switch` `helper` prop), so a visitor who needs less motion or is on battery can tell what each does:
- "Sound", helper "Off until you turn it on."
- "Still air", helper "Less motion."
- "Overcast", helper "No live rendering. Easier on battery."
and one live line that truthfully states the current mode:
- "Now: full motion, live light." · "Now: still air, live light." · "Now: full motion, overcast." · "Now: still air, overcast."
"Still air" and "Overcast" navigate to the same URL with `?motion=reduced` or `?webgl=0` added or removed, preserving the current chapter hash (for example `/?webgl=0#write-yours`; the head script then skips the intro, 4.4). When the OS already requests reduced motion, "Still air" is checked and disabled and its helper reads "Set by your system." instead.

### 4.12 Focus, keyboard, accessibility globals
- Skip link, first in `page.tsx` (not `layout.tsx`, so the 404 page, which has no form, never renders it), visible on focus: "Skip to the form" → `#commission`, through `jumpTo` (instant, focuses the form's heading).
- Landmarks: `header` (nav), `main` (sections), `footer` (dusk). One `h1`. Each chapter has one `h2` (the ledger adds one `h3`).
- Focus ring: 2 px `--c-sun`, offset 3 px; `--c-umber` inside the sunlit panel. Never removed. Hit areas ≥ 44 × 44 px.
- DOM order equals visual order at every breakpoint.
- Keyboard map: Tab / Shift+Tab; Enter / Space; Esc closes the menu, the colophon, the ray view, "leave the room" and the epilogue field; **R** toggles the ray view; **L** leaves or re-enters the room. Letter keys are ignored while focus is in an input, textarea, select or contenteditable, and a "Keyboard shortcuts" switch in the colophon (on by default, remembered in `localStorage` with try/catch) turns R and L off (WCAG 2.1.4).
- The canvas is `aria-hidden`. Everything it shows has a DOM equivalent (headings, readouts, captions, results).
- Live regions: write-yours result (`aria-live="polite"`), form status (`role="status"`), epilogue text (`aria-live="polite"`).
- Zoom 200%: no clipped text; sticky frames fall back to `position: static` when `min-height` of their content exceeds `100svh` (a `ResizeObserver` sets `data-overflow` on the section).

### 4.13 Hidden layers, theme colour, console
- **Ray view (graft; key R, or "Show the rays" in the colophon).** Draws a 1-in-512 sample of the current word's rays (128 rays at 65,536) as sun-tinted hairlines from the pane (off-screen, back along the sun direction) to their landing points on the wall, over the live caustic. A DOM overlay under the nav (top-left, `--t-label`, `data-scrim`) lists five lines, one item per line, values live from the running code: "Rays 65,536", "Bands 8", "Sun 40.2° high, bearing 252°", "Frame 4.1 ms (GPU)", "Tier 3" (the GPU tier). It doubles as the alignment and performance QA overlay. It is exempt from the two-readout rule because it is opt-in. Esc or R closes it.
- **Leave the room (graft; key L).** Nav, `main` text and footer fade out over 700 ms (`shutter`), get `inert`, and only the wall and its light remain. A visually hidden live region says: "The room is empty. Press L or Escape to return." L or Esc restores (450 ms). Jurors will use it as screenshot mode.
- **Theme colour follows the light (graft).** An `afterScroll` listener sets `<meta name="theme-color">` to the current unlit-wall hex (section 3.1.1 interpolation) at most 4 times per second, so Safari's bar moves from dawn grey to blue hour with the page.
- **Console signature** (once, after the first frame): `console.log('%caslant', 'font: 300 20px serif; color: #FFE1A6', '\nClear glass that writes in sunlight. {65,536} rays at {8} wavelengths per frame. Press R to see them, L to leave the room.')` with the numbers read from the running code.

### 4.14 QA and capture routes (graft)
Query flags parsed once by `src/lib/qa-flags.ts` (WP1):
- `?still=<chapterId>|og&hour=HH:MM` renders one chapter frozen: UI hidden (`html[data-still]` hides nav and text with `visibility: hidden`, never `display: none`, so the `[data-scrim]` rects keep their layout for `check:contrast`; the loader never shows), scroll jumped to the chapter's rest, damping off, `light.time` fixed at 0.7 s, grain seed fixed at 1, word fully formed unless the chapter defines otherwise, `hour` overrides the chapter hour. Sets `window.__aslantStillReady = true` after two rendered frames. `still=og` renders a 1200 × 630 composition: the hero patch with the word, plus the DOM wordmark and H1 (these stay visible in `og` mode).
- `?tier=0|2|3` (GPU tier), `?motion=reduced`, `?webgl=0`, `?idle=0` (disables the idle freeze for performance tests), `?word=<word>` (pre-fills write-yours). Flags are read only by `qa-flags.ts` from `location.search`, never with `useSearchParams` (7.2).
- `?qa` (always on in development) exposes `window.__aslant = { light, conductor, stage, gl, info() }` where `info()` returns `renderer.info`, `gpuTier`, motion, DPR, rays, bands, `frameMs`, `frameSource`, and the governor's decline log.

---

## 5. Sections, in order

Common rules for every section:
- `<section id="{id}" data-chapter="{id}" aria-labelledby="{id}-title">`, heading id `{id}-title`.
- Every text block that can share the screen with light carries `data-scrim` (`data-scrim="live"` inside sticky frames).
- Each section renders exactly one `<LightAnchor chapter="{id}" />` positioned by its own CSS module, except `the-bend` (the bench has no patch; it renders `<LightAnchor chapter="the-bend" kind="bench" />` covering the diagram area).
- Composition names: **split** = viewport width ≥ 1024 px and aspect ≥ 0.9; **stacked** = everything else (phones and portrait tablets). Percentages below are of the viewport at the chapter's rest unless stated.
- Maximum two live readouts per chapter (the ray view is exempt).
- Rest modes and world data come from `src/lib/world-spec.ts` (WP2), which transcribes the tables in this section (5.0 first, then each chapter's layout).

### 5.0 World-spec at rest and the composition rhythm (must-fix, binding)
The rulebook allows at most two image-and-text splits in a row and asks for at least four layout families (`05-skill-rulebook.md` §section variety, `06-anti-slop.md` #30). The first draft ran five text-left, light-right splits in a row, and its patch stayed on the right all day, so "the light crosses the wall" never happened on screen. Now the light is on the right in the morning, crosses at noon inside the bench-to-appointment focus pull (the view is already changing there, so the moving patch sweeps over no text), and sits on the left in the afternoon. Only the split layouts changed; the stacked layouts are as before.

| # | Chapter | Family (split) | Light |
|---|---|---|---|
| 1 | first-light | split: lockup left, light right | right |
| 2 | clear-glass | split: text left, glass right | right |
| 3 | the-bend | stacked: full-width text band over a full-width bench band | band |
| 4 | appointment | full-width clock over a mirrored split: light left, text right | left |
| 5 | write-yours | mirrored split: light left, controls right | left |
| 6 | ledger | text grid over a full-width band | band |
| 7 | commission | mirrored split: the form in the light, left; heading right | left |
| 8 | dusk | footer with the ember | ember |

**World-spec table** (WP2 transcribes it; percentages of the viewport at the chapter's rest at the split composition; anchors are positioned by each section's CSS to exactly these values):

| Chapter | View | Rest mode: split / stacked / Still air | Light at rest, split | Skew · split · transom · mullion | Word default: id, focus, wave; glass | Calibration point `calUv`: split / stacked |
|---|---|---|---|---|---|---|
| first-light | wall | rest / rest / rest | patch left 45.5, top 15.5, width 53, height 64.5 | 0.20 · 0.22 · 0.035 · one at u 0.5, width 0.022 | `aslant`, 1, 0.04 (the intro scales them through `light.intro.form`); clear | (0.25, 0.62) / (0.50, 0.72) |
| clear-glass | pane | rest / rest / rest | glass left 44, top 9, width 52, height 83; the wall patch is off-view and equals first-light's | n/a | none | (0.20, 0.50) / (0.50, 0.74) |
| the-bend | bench | sticky / sticky / rest | bench band left 0, top 44, width 100, height 54; the wall patch is off-view and is the noon patch: left 38, top 8, width 26, height 30, skew 0.06 (short and high) | n/a | none; the bench shows Clear's dispersion | (0.31, 0.24) / (0.50, 0.78) |
| appointment | wall | sticky / sticky / live | patch left 10, top 34, width 42, height 54, drifting 6 to the **left** across the clock progress | 0.30 → 0.40 · 0 · 0 · none | `ingrid`, 1, 0.04, plus WP8's sun-error inputs (5.4); clear | (0.77, 0.58) / (0.50, 0.64) |
| write-yours | wall | rest / live / rest (stacked: live) | patch left 4, top 14, width 50, height 54 | `skewFromAltitude(alt)` · 0 · 0 · none | `visitor`, 1, 0.04, plus WP7's streaming inputs; the visitor's glass (default Prismatic) | (0.77, 0.50) / (0.50, 0.20) |
| ledger | wall | end / live / end (stacked: live) | band: full-bleed, 77 to 97 from the top | 0.9 · 0 · 0 · none | `visitor`, 0.15, 0.8; the visitor's glass | (0.35, 0.40) / (0.50, 0.40) |
| commission | wall | live / live / live | the panel's live rect in columns 1 to 7, expanded by 10 px (fine pointer with Lenis) or inset by 12 px (coarse pointer or Still air, 5.7) | `tan 8°` (3° stacked) · 0 · 0 · none | `commission`, 0 (WP9 raises its input to 1 on success); the visitor's glass | (0.80, 0.27) / (0.50, 0.20) |
| dusk | wall | end / end / end | ember 100 × 24 px at left 58, top 16 of the footer (72 × 18 px, centred at 14%, stacked) | 0.14 (the panel's slant, so the collapse keeps its angle) · 0 · 0 · none | none (`uFill` 1) | (0.31, 0.80) / (0.50, 0.75) |

- Hours, shade targets and sun colour and intensity per chapter come from section 0 and 3.1.1 to 3.1.2 through `shadeAt(hour)` and `sunAt(hour)`; write-yours uses the visitor's hour (`light.visitor`), with `E_sun × smoothstep(0°, 6°, alt)`.
- Skirting (`skirtingY`): first-light 0.965 split, 0.975 stacked; dusk at 94% of the footer's visible area; −1 elsewhere.
- Calibration points follow the text columns (6.1.5): each is the centre of the chapter's main text block at rest, off every patch. They were computed on the 12-column grid and hold within 0.003 from 1024 to 1920 px wide.
- QA screenshot evidence for this table: at 1440 × 900 and 1280 × 800, every chapter at rest, plus a 10 s scroll capture (9.3).

### 5.1 `first-light` (08:10) · the hero
**Purpose.** In three seconds, show what only this site can do (a word condensing out of pool light on a grey wall), state the offer, give one action.

**Copy (final).**
- H1: "Clear glass that writes in sunlight."
- Sub: "We shape a window pane so that, at an hour you choose, the sun spells a word on your wall."
- Primary button: "Commission a pane" → `#commission`
- Text link: "Write yours" → `#write-yours`
- Poster `alt` (kept in the DOM and the accessibility tree in every tier; once the canvas draws, the poster is hidden with `opacity: 0` only): "A slant of morning sun on a grey wall. In its lower pane, the word aslant is made of light."

**Layout, split.** Section `min-height: 100svh`, 12-column grid. Lockup in columns 1 to 6, bottom-aligned (`align-content: end`, `padding-bottom: clamp(40px, 8svh, 88px)`): H1 (3 lines as the measure falls: "Clear glass / that writes / in sunlight."), 24 px, sub (`--t-lead`, `--c-dust`, max-width 34ch), 32 px, CTA row (button 48 px high, then the text link, gap 28 px). Anchor: `left 45.5%; top 15.5%; width 53%; height 64.5%`. Patch: skew 0.20, split 0.22 (upper light = top 22% of the height; revision: smaller and dimmer so the empty upper light is no longer the largest bright shape in the first frame), transom 0.035, one mullion at u = 0.5 of the upper light (width 0.022). The lower light holds the word; its on-screen word size is unchanged (the word rect is width-limited at this aspect). At 1440 × 900 the H1's longest line ends at about x = 44% and the patch's left edge at the H1's height is at 50% or more: at least 6% of clear shade, penumbra included.

**Layout, stacked.** Anchor `left 5%; top 9%; width 89%; height 39%` (below a 56 px nav), skew 0.07, split 0.16 (the upper light is a thin band), transom 0.03, no mullion. Lockup from 55% down with `padding-bottom: 32px`: H1 at `--t-hero` stacked values (fits 358 px at 390 wide: longest line measured 323 px at 44 px, `wdth 150`), sub, then the CTA row (button and link on one row at ≥ 360 px; the link wraps under the button below 360 px). Portrait tablets use the same composition with the anchor `left 6%; top 10%; width 88%; height 40%`.

**Motion (t = 0 at shutter open).**
| t | Event | Owner |
|---|---|---|
| 0 ms | Shutters open (700 ms). WP6 tweens `light.intro.dawn` 0 → 1 (700 ms, `light`); the conductor maps it to the sky ramp `#343B42` → `#3A4142` and `E_sun` 0.7 → 1.4. Dust appears inside the beam. | WP6 (timeline), WP2 (fold), WP4 (uniforms) |
| 200 ms | Lower light shows pool-light caustics (`focus 0`, `wave 1`), moving. | WP4 |
| 200 ms | H1 optical focus-in starts (section 4.8), ends about 1.4 s. | WP6 |
| 500 to 2700 ms | **Formation:** WP6 tweens `light.intro.form` 0 → 1 over 2.2 s (`focus` ease); the conductor maps it to the first-light word: `focus = form`, `wave = mix(1, 0.04, form)`. The light condenses into a slab, cracks along the letter gaps and sharpens into *aslant* (compare `concept-1-light/ref-formation.jpg`). WP6 never writes `light.word` directly (4.1, frame order). | WP6 drives `light.intro`, WP2 folds, WP4 renders |
| 1100 ms | Sub fades in (500 ms). | WP6 |
| 1400 ms | CTAs fade in (400 ms). The nav is usable from 0 ms. | WP6 |
| 2700 ms | Settled: residual shimmer (compositor-side warp) until idle; pointer sun engages. | WP4 / WP6 |

Scrolling, a key or a click during the intro fast-forwards every intro tween to its end in 300 ms and never blocks input. Reduced motion: settled frame, all text visible, no timeline. Repeat visits play the same timeline after the short loader.

**Interactions.**
- **Pointer is the sun** (fine pointer, hero only, while `light.chapter === 'first-light'` and `blend < 0.5`). `p` is the pointer's position measured from the **patch centre**, normalised by the patch's half-width and half-height (clamped to [-1, 1] per axis). It sets a target `sunOffset = (p.x · 0.035, p.y · 0.025)` in lower-light units (fractions of the pane's width and height), damped with λ = 3.2. With `m = |sunOffset / (0.035, 0.025)| / √2` in [0, 1]: `wave = 0.04 + 0.25·m`, splat size × `(1 + 0.3·m)`, `aberr = 0.9·m²`. **While the pointer is outside the patch, the target is scaled so that m ≤ 0.6**; the full range exists only while the visitor hovers the light itself. (Revision: measured from the viewport centre, a visitor reaching for the hero button or the nav at about NDC (−0.8, 0.8) got m ≈ 0.8, wave 0.24 and aberration 0.58, so the word smeared exactly when they reached for the action.) The deltas go into `light.input['first-light']` (4.3). After 2.5 s of pointer stillness, or when the pointer leaves the window (`frame.pointer.inside` false), the target eases to 0 and the word re-forms by itself. QA check: the word stays readable with the pointer anywhere outside the patch and at |p| ≤ 0.6 inside it. The pointer sun holds `stage.hold('pointer-sun')` while the damped value differs from the target by more than 1e-4.
- **Touch: scroll drift (must-fix).** Coarse pointers: `sunOffset.x = 0.03 · sin(π · s)`, `sunOffset.y = 0.01 · sin(π · s)` with `s = clamp(scrollY / (0.35 · vh), 0, 1)`, written as inputs like the pointer sun; the word loosens as the visitor starts to scroll and re-forms by 35% of the first screen.
- Buttons and link: states from the component spec (section 7.3).

**WebGL.** Mode `wall`; transport `aslant` (baked). Uniforms written: patch rect (CSS px), skew, split, transom, mullion, word rect, `uFocus`, `uWave`, `uSunOffset`, `uAberr`, `uPointScale`, sun colour and `E_sun`, sky, `uTime`, `uGrainSeed`, skirting visible (section 6.1.4).

**Accessibility.** H1 is real text (SplitText `aria: 'auto'`, reverted after the intro). The poster `<img>` carries the alt text above. CTAs are links with visible focus. Reading order: H1, sub, button, link.

**Acceptance.**
1. G1 passes (section 8, gates): live render matches `ref-hero-desktop.jpg` and `ref-formation.jpg` in character in Chrome and WebKit (7.6), with the recalibrated room, the dimmer 08:10 sun (the upper light deliberately darker than in the reference) and the word as the brightest thing on screen.
2. The lockup never overlaps the patch or its penumbra at 1440 × 900, 1280 × 800, 1024 × 768 (the wght 40 hero), 834 × 1194, 390 × 844 and 360 × 740 (screenshot evidence). In the first frame the nav's "Commission a pane" is hidden, so a single sun-filled rectangle holds the frame.
3. Formation plays once and is skippable by scrolling; the loose phase holds ≥ 55 fps at DPR 1.75 in Chrome and WebKit on Apple Silicon.
4. LCP ≤ 1.5 s on a warm load and ≤ 2.0 s cold (local production build); CLS ≤ 0.01.
5. Reduced motion: no loader, settled frame, full content.

### 5.2 `clear-glass` (10:30) · the loupe
**Purpose.** The physics of seeing: the pane looks clear, yet the word is in its surface as curvature. Only schlieren (a special way of looking) or the sun can reveal it. **Where we are:** still inside the room. The pane stands in the studio's test frame in front of the far wall, and we look through it at that wall (plaster and a far, soft sun patch at 10:30); we never look out of a window.

**Copy (final).**
- H2 (light sweep, `140deg`): "The word is already in the glass."
- Body: "Look through the pane and the room behind it barely wavers. The word is there, drawn as curvature across the whole sheet. You cannot read it in the glass. Only the light can."
- Hint, fine pointer: "Move the loupe over the glass." Hint, coarse pointer: "Drag the loupe over the glass."
- Toggle button (`aria-pressed`): "Show the relief" / "Hide the relief".
- Caption shown while the relief is visible (`aria-live="polite"`): "One broad fold per letter. The letters themselves never appear."
- Readouts (2). Loupe active: "Surface slope" `{2.41}°` and "Light turns" `{1.18}°` (values at the loupe centre). Loupe inactive: "Steepest slope" `{5.74}°` and "Largest turn" `{2.84}°` (pane maxima from the relief data). Values in braces are examples; the code computes them.
- Footnote (`--t-caption`, `--c-dust`): "Schlieren: August Toepler's 1864 method, first used to find hidden streaks in optical glass."

**Layout, split.** Text column in columns 1 to 4, vertically centred: H2, 24 px, body, 32 px, hint (caption), 16 px, toggle (text button with underline, 44 px hit area), 24 px, readouts (two rows: label `--t-label` `--c-dust`, value `--t-value` `--c-lime`), footnote pinned to the column bottom (`margin-top: auto`). Anchor (the glass area inside the frame): `left 44%; top 9%; width 52%; height 83%`. The studio's test frame (10 px bars in shade tones) is drawn by the compositor around the anchor.

**Layout, stacked.** Anchor `left 5%; top 8%; width 90%; height 42%`. Text below from 54%: H2, body, the toggle as a full-width 48 px button (primary control on touch), hint, readouts, footnote.

**Motion.** Focus pull from the hero (wall → pane) is driven by the conductor. H2 light sweep. Loupe iris opens (radius 0 → R, 300 ms `focus`) when the pointer enters the glass and closes (180 ms `defocus`) when it leaves. The knife-edge direction follows the pointer's velocity direction (damped, λ 6), so moving diagonally re-lights the relief like raking light. The relief toggle cross-fades (400 ms) with a sweep along the knife direction.

**Interactions and states.**
- **Loupe (fine pointer):** follows the pointer inside the glass only, radius 110 px (desktop). Native cursor stays visible.
- **Loupe (coarse pointer, must-fix):** a DOM proxy disc (`div`, 160 px, `aria-hidden`, `touch-action: none` on the disc **only**) sits at the pane centre; dragging the disc moves the loupe; everywhere else the page scrolls normally. The toggle is the primary control on touch.
- **Toggle (keyboard, reduced motion, touch alternative):** shows the schlieren over the whole pane (`uRelief = 1`) and the caption.
- Readouts switch between loupe values and pane maxima as described; they never exceed two.

**WebGL.** Compositor `pane` mode (WP5 chunk): background = the far wall behind the test frame (plaster and a far, defocused sun patch at 10:30), sampled with an offset of `slope × 0.004` (uv units) so it barely wavers; the test frame's bars; 1 px warm rim highlight (`#FFE9C8` at 25%) and a faint green glass edge (`#A8C4B4` at 18%). Inside the loupe: **bicolour schlieren** (the real variant that replaces the knife edge with a two-colour filter), rendered in the page's own light: deflection one way is lit in sun (the `#FFE1A6` family), the other way falls into skylight shade (the `#3A4142` family), so the folds read as dunes under raking sun and no new saturated colour enters the page (6.2). 1 px lit rim. Uniforms: `uPaneRect`, `uFrameBar` (10 px), `uLoupe` (x, y, r), `uKnife` (vec2, the filter's split direction), `uRelief`, `uSlopeTex` (RGBA16F 256 × 128 from the relief worker for `aslant`: RG slope, BA high-passed slope; uploaded as `HalfFloatType`, 6.2).

**Accessibility.** The loupe is pointer decoration; the toggle carries the same information for everyone. The caption describes what the relief shows. No-WebGL and Still air: `public/posters/relief.webp` with the caption always visible and the toggle hidden.

**Acceptance.** Loupe tracks the pointer with zero frame lag (One Clock); the schlieren shows dune-like folds, one per letter, warm on one flank and cool on the other, never readable letters (compare `concept-1-light/ref-schlieren.jpg` for the fold structure; its grey tint is superseded); on a phone the page scrolls when dragging anywhere except the disc; readouts ≤ 2; toggle reachable and operable by keyboard.

### 5.3 `the-bend` (12:50) · the optical bench
**Purpose.** How it works, shown as light: a side view of an optical bench in haze. Parallel sunlight passes through a slice of the same pane and lands on the wall as a luminous intensity profile.

**Copy (final).**
- H2 (plain fade): "Light bends where the surface tilts." (Revision: three headings in a row said "glass"; it is also the exit surface that tilts.)
- Beat 1 text: "Through flat glass, light keeps its course."
- Beat 2 text: "Tilt the surface a few degrees and each ray leaves at a new angle. Where rays crowd, the wall is bright. Where they part, it goes dark."
- Beat 2 small line (`--t-caption`): "Glass makes no light of its own. Of every {100} photons, {92} reach the wall; its two faces reflect the rest." (Fresnel at normal incidence for n = 1.4917: 3.89% per face, 92.4% transmitted.)
- Beat 3 text: "Sunlight is every colour at once. Glass bends blue a little more than red, so each bright edge carries a thin spectrum."
- Readouts (two slots, content per beat):
  - Beat 1: "Angle in" `0.00°` · "Angle out" `0.00°`
  - Beat 2: "Angle in" `{3.10}°` · "Angle out" `{4.63}°` (the picked ray; default the central ray; live, true angles)
  - Beat 3: "Blue, 486 nm" `n {1.4977}` · "Red, 656 nm" `n {1.4891}`
- Hint beside the readouts (under them when stacked) in beat 2 only: fine pointer "Point at a ray." / coarse pointer "Tap a ray." (both rendered in SSR, one shown by the pointer media query, 7.2).
- Scale note under the pane (`--t-caption`): "Relief drawn 40 times deeper than it is."
- Caption under the wall profile (`--t-caption`): "A slice through the pane you just looked at, along one line of the word."

**Structure.** Section height 150svh (desktop and mobile). A sticky frame (`position: sticky; top: 0; height: 100svh`) holds the text; the canvas is fixed, so no pin is needed (graft: sticky over pinning). Beat progress (exact scroll): `p = clamp((y - top + 0.25·vh) / (height - 0.5·vh), 0, 1)`: beat 1 for p < 0.36, beat 2 for 0.36 ≤ p < 0.68, beat 3 for p ≥ 0.68. The conductor's rest interval is `[top, top + section.offsetHeight - frame.offsetHeight]` (4.3); the focus pull from clear-glass peaks exactly where p reaches 0 and the pull to the appointment peaks where p reaches 1. The bench diagram is placed from the sticky frame's live rect every frame, so the diagram and its DOM labels travel together before and after the stuck range (4.3).

**Layout, split viewports (revision: bands stacked top to bottom, no longer side by side).** This is the chapter that breaks the run of splits (5.0). Top band, columns 1 to 7, inside the top 40%: H2 at 11%; the beat text below it from 19% (captions cross-fade in place; fixed height reserved for the longest beat so nothing shifts); the two readouts in one row at 31% to 37%; the beat 2 hint beside the readouts. The bench is a **full-width letterbox band** below: incoming parallel rays enter at the left edge (they fade in from x = 0, reading as arriving from off-screen), the pane cross-section stands vertically at x = 38% (entry face flat; exit face = the relief slice exaggerated 40×), the wall is a vertical line at x = 94% with the luminous profile drawn leftward from it (amplitude up to 6% of the width). Rays span y 46% to 90%. The scale note sits under the pane (x ≈ 32 to 46%, y 92%); the wall caption right-aligned under the wall (x 70 to 96%, y 93%). Anchor `left 0; top 44%; width 100%; height 54%` (`kind="bench"`, used to register the diagram area as the no-WebGL and Still air still box; `bench.webp` is captured at this aspect).

**Layout, stacked (the bench rotates 90°).** Light falls from the top: rays fade in from y = 8%, the pane lies horizontal at y = 26%, the wall is a horizontal line at y = 58% with the profile drawn upward. Text below from 62%: H2, beat text, readouts (in one row), hint. Scale note right-aligned under the pane (y 30%). Wall caption hidden below 480 px wide (it returns in the reduced-motion list).

**Motion.** Beats change on thresholds with 240 ms caption cross-fades (opacity only). Bench uniforms follow p continuously: the relief morphs in between p 0.30 and 0.42 (`uRelief` 0 → 1), the dispersion fans open between p 0.62 and 0.74 (`uFan` 0 → 1). Rays re-trace on the CPU only when these values or the picked ray change.

**Interactions.** Fine pointer: hovering the diagram picks the nearest ray (distance to its polyline, 24 px radius), which brightens; readouts show its true angles. Touch: tap picks. Keyboard: the diagram is a focusable figure (`tabindex="0"`, `aria-label="Optical bench. Use the left and right arrow keys to choose a ray."`); arrows step the picked ray; readouts update (the readout block is `aria-live="polite"`, throttled to one announcement per 500 ms).

**WebGL.** Compositor `bench` mode (WP5 chunk): haze (base `#2F3536`, low-frequency noise ±4%, brighter along the beam), the glass cross-section as two edge highlights, the wall line and the luminous profile (a glow around `wallX - profile(y) · amp`, profile from a 256-texel `uProfile` texture). `BenchPass` (WP5): instanced soft line quads, additive, drawn after the compositor. CPU tracer `src/lib/bench/trace.ts` (section 6.3): 64 rays × 12 bands (tier 3), 32 × 6 (tier 2).

**Accessibility.** Reduced motion: section height auto, the three beat texts shown as an ordered list above `public/posters/bench.webp` (the beat 3 view), readouts show beat 2 values for the central ray and the beat 3 values in two extra rows (the two-readout rule is relaxed here because nothing is live). No-WebGL: the same poster and list.

**Acceptance.** Beats follow scroll exactly in both directions and after anchor jumps; readout angles satisfy Snell (α = 3.10° gives 4.63° at n = 1.4917); the photon line comes from `fresnelTransmission()`; no text ever overlaps a ray (the text band ends above 40%, the rays start at 46%); the diagram and its labels stay registered with the section's top at 10vh (G2 screenshot); the mobile rotation composes at 390 × 844.

### 5.4 `appointment` (16:12 to 17:08) · scroll is time
**Purpose.** The product's soul: the word exists only near its hour, and only in its season. Example pane "Ingrid", Copenhagen (55.6761 N, 12.5683 E), 21 June 2026, window facing west-south-west, design moment 16:40 CEST (sun 40.20° high, bearing 251.71°).

**Copy (final).**
- H2 (light sweep, `118deg`): "The word keeps one appointment a day." (Revision: "It" had no antecedent for someone navigating by headings.)
- Sub: "A pane is shaped for one direction of sunlight. Before its hour the light is loose. After, it moves on."
- Line A (shown from the moment the clock reads 16:34, and it stays): "Every afternoon at 16:40, the kitchen wall says her name."
- Line B (shown from 16:46, beneath Line A, which remains): "Tuned to midsummer, the word returns every afternoon for about {eight} weeks. Tuned to an equinox, for about {two}." (weeks = `round(seasonSpan.days / 7)` written as a word; test vectors 55 days → eight, 13 days → two). Both lines are scroll-mapped, so scrolling back above 16:46 and 16:34 hides them again in reverse.
- Caption under the patch: "This pane says Ingrid at 16:40, the minute she was born. Copenhagen, a window facing west-south-west." (The birth time is part of the fiction and is listed in the colophon.)
- Arc label: "In focus {16:30} to {16:50}" (from `designWindow()`).
- Readout (1 of 2 live): "Sun {40.2}° high, bearing {252}°" at the scrubbed minute.
- The giant clock (2 of 2 live): `16:40` style, `aria-hidden`, with a visually hidden sentence: "The clock on the wall runs from 16:12 to 17:08 as you scroll."

**Structure and time mapping.** Section height 160svh, sticky frame 100svh (no pin). Clock progress (exact scroll): `p = clamp((y - top + 0.25·vh) / (height - 0.5·vh), 0, 1)`. **Bullet time (graft):** minutes after 16:12 follow the monotone piecewise-linear map `(p, min) = (0, 0), (0.30, 21), (0.70, 35), (1.00, 56)`, so 16:33 to 16:47 takes 40% of the scroll and the word holds sharp for a beat. The clock shows whole minutes from exact p; the light uses the smooth value.

**Light at minute m.** `e(m)` = angle between the sun vector at m and the design vector (sun.ts). `focus = 1 - smoothstep(0.35°, 2.5°, e)`; `wave = 0.04 + 0.9 · (1 - focus)`; `sunOffset` = the error projected onto the wall plane, scaled so 2.5° = 0.035 pane widths; `aberr = 0.9 · (e / 2.5°)²` clamped to 1. WP8 writes these as deltas from the chapter default (focus 1, wave 0.04) into `light.input.appointment` (4.3). The patch drifts **left** by 6% of the viewport width across p (`driftX`), its skew goes 0.30 → 0.40 (the sun lowers), and the sun warms from `#FFE6BF` (E 2.4) to `#FFDFB2` (E 2.3). Single-light window: split 0, no transom, no mullion; the whole patch is the word pane (transport `ingrid`, baked, requested by WP8 and swapped in at the bench → wall focus-pull peak, where the noon patch also slides across to this rest: the light crosses the wall there, 5.0).

**Layout, split (inside the sticky frame; revision: a full-width clock over a mirrored split).** Clock across columns 1 to 12 at 8% to 26% (`--t-clock` `clamp(4rem, 13vw, 13rem)`, digit slots; left-aligned on column 1). Anchor `left 10%; top 34%; width 42%; height 54%` (drifts left as above), so the light sits on the left under the clock. H2, sub, the Line A/B slot (fixed height for five lines of body; each line fades in over 240 ms), the sun-path arc (inline SVG, about 360 × 110 px) with its label, and the sun readout all sit in columns 8 to 12 from 34%. Caption left-aligned under the patch at 91%.

**Layout, stacked.** Clock at 8% to 17% (`wdth 150`). Anchor `left 6%; top 20%; width 88%; height 25%`, skew 0.08 → 0.14. Caption at 46%. H2 and sub from 50%, line slot, arc (height 64 px), readout. Below 360 px wide the arc hides (the label and readout remain).

**Sun-path arc (data graphic, WP8).** Rendered at SSR from `sun.ts`: the sun's altitude against azimuth over Copenhagen on 21 June 2026 from sunrise to sunset (x: azimuth 40° to 320°; y: altitude 0° to 58°), 1 px `--c-dust` polyline, a 1 px horizon line in `--c-line`, the in-focus segment (16:30 to 16:50) as a 2 px `--c-sun` stroke, and a 6 px `--c-sun` dot at the scrubbed minute (moved via a ref transform). Axis words in `--t-caption`: "East", "South", "West" at 90°, 180°, 270°. `role="img"`, `aria-label="The sun's path over Copenhagen on 21 June. The word is in focus from 16:30 to 16:50."`

**Motion.** H2 light sweep; the clock digits change instantly (no roll); lines fade in; patch and word driven by the conductor. The transition to write-yours is wall → wall (no focus pull): under a passing cloud (4.3) the patch slides to its next rest while `ingrid` loosens, swaps for the visitor's word (or stays `Ingrid` until they type) and re-forms at 17:20 in Prismatic glass, so the back half never repeats itself.

**Accessibility.** Reduced motion: section height auto; clock fixed at 16:40, word formed, both lines visible, arc dot at 16:40; the patch is `live` (DOM-locked to its anchor in flow). All numbers are also in text.

**Acceptance.** Clock, readout, patch and word agree at every scroll position in both directions; bullet time is visible; focus peaks at 16:40; Line A stays when Line B appears; Line B shows "eight" and "two" computed from `seasonSpan()`; the readout at 16:40 prints "Sun 40.2° high, bearing 252°"; no text over the patch at the rest hour; the caption stays registered under the patch with the section top at 10vh (sticky geometry, 4.3). Screenshots at 1440 × 900 and 1280 × 800 at 16:12, 16:40 and 17:08 show the light left and every line of text in columns 8 to 12.

### 5.5 `write-yours` (your hour) · the participatory climax
**Purpose.** Put the visitor's own word in the light, with true numbers for their city. This is the conversion engine and the share loop. The pane is tuned to midsummer (21 June north of the equator, 21 December south of it) at the chosen hour, facing the sun at that hour.

**Copy (final).**
- H2 (plain fade): "Choose a word and an hour."
- Sub: "A name on the nursery wall at nap time, or a date in the hall at the hour you met. We compute the glass while you watch." (Revision: the human reason to want a pane is now visible copy; the ten-letter limit lives in the helper and the error.)
- Field "Your word": default value `Ingrid` (select-all on focus). Helper: "Up to ten letters. Names and dates work well." Errors: "Ten letters at most." / "Letters, numbers and spaces only." / "Our letters do not cover this alphabet yet." (a letter outside both `SPRAT_CHARS` and `GEOLOGICA_CHARS`, 3.2). Validation accepts `\p{L}`, `\p{N}` and spaces; a word outside Sprat but inside Geologica (Cyrillic, Central European, Greek: "Фёдор", "Łucja", "Tomáš") is valid and is rasterised in Geologica 600 (3.2).
- Field "The hour": range 06:00 to 21:00, step 5 minutes, **default 17:20** (a different hour, sun colour and angle from the appointment above; "Copenhagen at 16:40" remains a test vector reached by setting the field), value shown in tabular figures. Helper: "Local time on {21 June}."
- Field "Glass" (radio group, legend "Glass"): "Clear", helper "Optical acrylic. White letters, faint colour at the edges." / "Prismatic", helper "Flint glass. Each letter arrives with a spectrum along its edges." (Only the selected option's helper shows.) **Default: Prismatic** in this chapter, so the page's only saturated colour, the computed spectrum, is strongest at the participatory climax. The hero stays Clear.
- Field "Where" (select, about 44 cities, section 7.3 `cities.ts`): helper "We guessed from your time zone." (only when the default came from the time zone; the guess and the helper appear after mount, 7.2, and SSR renders Copenhagen selected).
- Status while computing (`role="status"`): "Computing the glass · {32,768} rays" (the count read from the running job).
- Result (`aria-live="polite"`, live readout 1): "Your word arrives at {16:40} and holds for about {20} minutes, from {26 May} to {19 July}." (example values: Copenhagen with the hour set to 16:40)
- Relief line (live readout 2): "Deepest relief about {1.9} mm · steepest slope {5.7}°" (for the selected glass: slopes and depth scale by 0.4917 / (n_d − 1) relative to Clear, without a recompute)
- Note (`--t-caption`): "Computed for a pane tuned to {21 June}, facing the sun at that hour."
- Below-horizon hint (replaces the result): "At {21:00} on {21 June} the sun is below the horizon in {Singapore}. Try an earlier hour."
- Primary button: "Commission this pane". Secondary button: "Save the image". Switch: "Hear the light".
- Contour-map caption (`--t-caption`): "Your pane's surface. One line every 0.2 mm."
- No-WebGL note: "The live preview needs WebGL. Your numbers are still exact."
- Save failure: "The image could not be made on this device."

**Layout, split (revision: mirrored, the light on the left).** Anchor `left 4%; top 14%; width 50%; height 54%`, single light, skew from the chosen hour (below). Controls column in columns 8 to 12: H2, sub, "Your word" (full width), "The hour" (full width range with the value at the right end of the label row), a row with "Glass" (segmented radios, left half) and "Where" (select, right half), the button row (primary then secondary, gap 16 px; it wraps, secondary under primary, when the column is narrower than both, as at 1024 px), the "Hear the light" switch. Under the patch, columns 1 to 6 at 72% to 80%: the result sentence, then the relief line (`data-scrim`). Contour map (2D canvas, 180 × 90 CSS px) at the bottom left (x 5.5% to 18%, y 84% to 94%) with its caption beside it on the right.

**Layout, stacked (patch is DOM-locked, `restMode: live`).** Order: H2, sub, **preview box** (the anchor, in flow, `aspect-ratio: 2.1 / 1`, full grid width), result, relief line, "Your word", "The hour", "Glass", "Where", buttons (full width, stacked), switch, contour map with caption (hidden below 480 px). **Keyboard (must-fix):** on focus of "Your word" with a coarse pointer, scroll so the preview's top sits 8 px under the nav (`lenis?.scrollTo(target, { immediate: true })` or `window.scrollTo`); the preview, result and field then fit above a 336 px on-screen keyboard at 390 × 844. Re-align once on `visualViewport` `resize`.

**Light from the chosen hour.** From `sun.ts` for the city on its local midsummer date: altitude `alt`, azimuth `az`. WP7 writes `light.visitor = { hour, alt, prism, valid }` and the conductor derives the chapter state through `worldSpec` (4.3): skew `= skewFromAltitude(alt) = clamp(0.10 + 0.45 · (1 - alt / 60), 0.10, 0.60)`; sun colour and `E_sun` from `sunAt(hour)` (3.1.2), times `smoothstep(0°, 6°, alt)`; shade from `shadeAt(hour)`. If `alt ≤ 0`, the light fades out over 400 ms and the below-horizon hint replaces the result; the last formed word stays in the transport so it returns when the hour changes back. Changing the hour re-colours and re-angles the light and updates the numbers; the word stays formed (the pane is tuned to that hour). Changing the glass re-weights dispersion live (`prism` 0 to 1 lerps the per-band dispersion scales) with no recompute. Changing the city recomputes numbers and light only.

**Cost of the numbers (must-fix, INP).** `seasonSpan`, `designWindow` and the result line recompute at most once per animation frame (a dirty flag set on input, consumed in an `afterScroll` listener), never per input event; with the algorithms of 7.3 each recompute costs about 1 to 2 ms.

**Signature behaviour** (full spec 6.4): typing (180 ms debounce) loosens the current word (WP7's input: focus delta to 0.15, 450 ms `defocus`) and starts a worker job; intermediate transports stream every 8 iterations through `stageApi.requestTransport('write-yours', t)` and the visitor watches the optimisation converge into their word; the final focus eases to 1 (≤ 600 ms, `focus`). Latency targets: visible re-forming within 300 ms of the last keystroke; settled within about 1.2 s on M-series Macs. A new keystroke cancels the running job. If the worker is late or fails, the last formed word stays on the wall. The pane is never blank.

**Buttons.**
- "Commission this pane": writes `{ word, hour, cityId, facing, glass }` to `useApp.commissionDraft` (facing = the 8-point direction nearest to `az`), then `jumpTo('#commission', { timelapse: true, focus: '[data-first-empty]' })` (4.7), which on arrival focuses the first empty field of the form (`preventScroll: true`).
- "Save the image": the designed artifact (6.4).

**Accessibility.** Labels above fields, helpers below (`aria-describedby`), errors below (`aria-invalid`), range with `aria-valuetext="17:20"` (the current value), radios in a `fieldset` with `legend`, status and result in live regions. Reduced motion: no streaming animation (the word appears formed when the job ends), everything else identical.

**Acceptance.** Latency measured with `performance.mark` (keystroke → first streamed frame drawn → settled) in Chrome and WebKit; rapid typing never queues jobs; dragging the hour slider never drops a frame (INP < 200 ms); with the hour set to 16:40, Copenhagen prints "arrives at 16:40 and holds for about 20 minutes, from 26 May to 19 July"; it opens at 17:20 in Prismatic, visibly different from the appointment above; "Фёдор", "Łucja" and "Zoë" each form in light and save correctly, and a word in an unsupported alphabet shows the new error; saved PNG is 1080 × 1350 with the caption bar; the form is pre-filled; the 390 × 844 keyboard screenshot shows preview and input together; the no-WebGL note appears with exact numbers; split screenshots at 1440 × 900 and 1280 × 800 show the light left, controls in columns 8 to 12 and the result lines under the patch.

### 5.6 `ledger` (18:20) · two thousand years, and how a pane is made
**Purpose.** Depth, honesty, culture: a slow, readable chapter (tempo contrast), merging the precedent ledger and the spec sheet. The light is a **long low band across the full width** with a loose golden shimmer: the hour has passed.

**Copy (final).**
- H2 (light sweep, `104deg`): "The idea is two thousand years old."
- Precedent list (`<ol>`), each row: year (Sprat), place (caption), text:
  1. "Han" · "Han dynasty China, 202 BCE to 220 CE": "Bronze mirrors were polished until, in sunlight, they threw the pattern cast on their backs onto a wall. They were called light-penetrating mirrors." (Revision: at display size "202 BCE" read as the date of the mirrors; it is the founding year of the dynasty.)
  2. "1655" · "Bologna": "Giovanni Domenico Cassini had a hole made in the roof of San Petronio, 27 metres up. At noon an image of the sun still crosses his line on the floor."
  3. "1838" · "Cambridge": "George Biddell Airy published *On the Intensity of Light in the Neighbourhood of a Caustic* (in `<cite>`): the mathematics of the bright seams where rays crowd together."
  4. "2014" · "Lausanne": "Researchers at EPFL published a method for computing a transparent surface whose light draws a chosen image."
  5. "2027" · "Copenhagen, proposed": "We tune that arithmetic to the sun over your window. The first forty panes are planned for spring 2027." (Revision: the fictional row now says what it is, and a proposal is no longer stated as a scheduled fact.)
- H3: "Ten weeks from your word to your wall." (Revision: replaces "Milled by machine, polished by hand.", the stock artisan couplet of watches, knives and furniture.)
- Intro: "Each pane starts as a computed surface and ends as a sheet you can see straight through."
- Spec list (`<dl>`):
  - "Glass": "Clear: optical acrylic, 12 mm. Prismatic: flint glass, 10 mm."
  - "Size": "From 20 × 20 cm to 60 × 90 cm. The word forms 1 to 3 metres from the glass."
  - "Fitting": "We fit the pane inside your window and set it to the sun on the day we visit."
  - "Time": "About ten weeks. We quote after we see the window." (shortened so it does not echo the new H3)

(The middle dots above separate brief fields; on the page, year, place and text are separate elements. No middle dots render in this section.)

**Layout, split.** H2 in columns 1 to 7. Precedent rows in columns 1 to 8, each a subgrid: year block columns 1 to 3 (year `--t-year`, place `--t-caption` `--c-dust` under it), text columns 4 to 8 (`--t-body`). Rows separated by a 1 px `--c-line` top border, padding 20 px 0. Spec block in columns 9 to 12, top-aligned with the first row: H3, intro, then the `dl` (term `--t-label` `--c-dust`, value `--t-body`), rows separated by `--c-line`. The band anchor is the section's last child: in flow, full-bleed (`margin-inline: calc(-1 * var(--margin) - 4vw)`, 8vw wider than the viewport; the global `overflow-x: clip` on `html, body` of 3.4 contains it, and the section also sets `overflow-x: clip`), height 20svh, `margin-top: var(--sp-8)`, `margin-bottom: 3svh`. `restMode: end`, so at rest the band lies at about 77% to 97% of the viewport with all rows above it. Patch: skew 0.9 (a long slanted parallelogram), single light, transport = the visitor's current word (default `ingrid`), `focus 0.15`, `wave 0.8`, sun `#FFD096`, E 2.2.

**Layout, stacked (`restMode: live`, band follows the section).** H2; rows stacked (year `--t-year` stacked values, place, text); H3, intro, `dl`; the band anchor (18svh, full-bleed) at the end.

**Motion.** H2 light sweep. Nothing else moves. The band's loose shimmer is ambient and stops when idle.

**Accessibility.** `<ol>` (chronological), `<cite>`, `<dl>`. Years are plain text.

**Acceptance.** At rest at 1440 × 900 and 1280 × 800 no text overlaps the band (penumbra included); the band spans the full width and reads golden and loose; rows keep a 64ch maximum measure; stacked band travels with the section; no horizontal overflow at any viewport, in Overcast too (`scrollWidth === clientWidth`, and a sideways trackpad swipe never pans the page).

### 5.7 `commission` (19:10) · the form stands in the last sun
**Purpose.** Conversion. The form literally stands in the last sun: a sunlit parallelogram panel on the wall, DOM-locked to the canvas patch behind it.

**Copy (final).**
- H2 (plain fade): "We draw every pane before we cut it." (Revision: the old H2 echoed write-yours two chapters earlier, and a visitor arriving through "Commission this pane" has just done exactly that; this one sets up "Request a drawing".)
- Sub, endpoint and mailto modes: "We reply within a week with a drawing of your pane and the days it will write."
- Sub, preview mode (tonight's default): "From spring 2027 we reply within a week with a drawing of your pane and the days it will write."
- Mode note (preview mode only, under the sub, `--t-caption`): "Until then this form sends nothing. It shows your word in this light."
- Fields (labels): "Your word" (helper "Up to ten letters."), "The hour" (`input type="time"`, step 300, helper "Local time."), "City" (select: the city list plus "Somewhere else"), "The window faces" (select: "North", "North-east", "East", "South-east", "South", "South-west", "West", "North-west", "Not sure"), "Your name", "Email", "Anything we should know (optional)" (textarea).
- Consent line: "We use your email only to reply about this pane."
- Submit: endpoint or mailto mode "Request a drawing"; preview mode "See it written" (literal: on submit the word forms in the panel's light; the old "Preview the drawing" promised a drawing that never appeared).
- Sending state (endpoint mode): label "Sending", with a 1 px line of `--c-umber` light travelling along the button's bottom edge (the only loop on the page; it stops on completion).
- Errors: "We need a word." · "Ten letters at most." · "Letters, numbers and spaces only." · "Tell us your name." · "We need an email to reply." · "That email looks unfinished." · Network (endpoint): "That did not send. Try again in a moment." plus, when an email is configured, " Or write to {email}."
- Hint (computed with `sun.ts`, must-fix): shown when the chosen facing is more than 90° from the sun's azimuth at the chosen hour on the city's local midsummer (or the sun is below the horizon then): "At {12:00} on {21 December} the sun does not reach a {south}-facing window in {Sydney}." (facing written in lowercase, e.g. "south-west"; never shown for "Not sure" or "Somewhere else"). The old fixed north-facing line was false south of the equator, where north is the sunny side (Sydney, Melbourne, Auckland, Johannesburg, São Paulo, Buenos Aires are all in the city list). "Does not reach" replaces the review's "never reaches": the sentence describes one moment.
- Success, endpoint: "Thank you. We will write within a week."
- Success, mailto: "Your email app should now show the request. Nothing leaves this page until you send it."
- Success, preview: "Commissions open in spring 2027. Nothing was sent." plus the secondary button "Save the image".

**Modes (decided at build time; `src/lib/commission.ts`, WP9).**
1. `NEXT_PUBLIC_COMMISSION_ENDPOINT` set: `fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body })` with `{ word, hour, city, facing, name, email, notes, glass, website }` (`website` is the honeypot; if filled, drop silently). 2xx → success. No-JS: `<form method="post" action={endpoint}>`.
2. Else `NEXT_PUBLIC_COMMISSION_EMAIL` set: build `mailto:{email}?subject=A pane that says {word}&body={fields, one per line}` (URI-encoded) and assign `location.href`. No-JS: `<form action="mailto:{email}" method="post" enctype="text/plain">`.
3. Else **preview mode (tonight's default):** no network at all; success shows the preview message and the word forming ("See it written"). No-JS: fields render, the submit button is replaced by the mode note.
The form never shows "Thank you" unless a server returned 2xx.

**Prefill.** From `useApp.commissionDraft` (written by write-yours): word, hour, city, facing, glass (hidden input). Without a draft: empty word, hour `17:20`, city from the time zone (after mount, 7.2), facing "Not sure".

**Layout, split (revision: mirrored, the form in the light on the left).** The panel (the anchor itself, `data-light-anchor="commission"`, `restMode: live`) in columns 1 to 7, vertically centred in 100svh (its `skewX(8deg)` surface still clears the viewport edge: the top corner moves left by `tan 8° × h / 2`, about 49 px on a 700 px panel against a 79 px margin at 1440, and stays inside at 1024); padding 40 px 48 px; inside, a 2-column field grid: word | hour; city | facing; name | email; notes (full); consent (full); submit (left). H2, sub and mode note in columns 9 to 12 at the top (from 14%). The sunlit surface is the panel's `::before` with `background: var(--c-sunlit); transform: skewX(8deg)` (origin centre; lower edge shifted right like every patch). Focus rings and caret switch to umber inside the panel.

**Layout, stacked.** H2, sub, note, then the panel full grid width with `skewX(3deg)`, fields in one column. The section has `overflow-x: clip` so the skewed surface never causes horizontal scroll.

**Light (DOM-locked, must hold within 1 px).** Fine pointer with Lenis (desktop): the canvas patch = the panel's live `getBoundingClientRect()` expanded by 10 px on each side, skew `k = tan(8°) · h` centred to match the CSS transform, read every frame after Lenis (One Clock). **Where scroll is native** (coarse pointers, Still air: touch, keyboard, scrollbar drags and rubber-banding run on the compositor thread, so the canvas presents one frame behind the DOM), the visible registration is DOM-owned: the panel shows its blurred `::after` penumbra exactly as in Overcast (below), the canvas patch is inset by 12 px so it stays hidden behind the opaque `::before`, and a one-frame lag is invisible. Sun `#FFD9AD`, `E_sun` 2.41, calibrated so the lit wall matches `--c-sunlit` within 3 levels.
**The panel is lit plaster, not a card (must-fix).** When WebGL is ready, on a fine pointer with Lenis, the `::before` fades to 10% opacity over 240 ms **only while the conductor reports the commission patch fully locked** (exact chapter `commission`, inside its rest interval, blend 0); everywhere else, and in Overcast and on native scroll, it stays opaque. At rest the form then sits on real, textured lit plaster (mottling and trowel marks under the sun); during the arrival the opaque fill keeps umber at 11.8:1. No word until success. On success: the panel's content fades (400 ms), its `::before` fades to transparent, the commission word (the worker computes it if it differs from the current transport; WP9 calls `stageApi.requestTransport('commission', t)`) forms in the patch (WP9 raises its focus input 0 → 1, 1.6 s, `focus`), and focus moves to the status message.

**Motion.** H2 fade. The patch travels from the ledger band into the panel lock through the conductor blend. Field feedback 240 ms.

**Accessibility.** `novalidate` with inline validation on blur and on submit; focus moves to the first invalid field; errors linked by `aria-describedby`; status `role="status"`; honeypot visually hidden with `tabindex="-1"` and `autocomplete="off"`; all fields reachable in DOM order.

**No-WebGL (and native scroll, above).** The panel gets a soft penumbra instead: `::after` with `background: var(--c-sunlit); filter: blur(18px); opacity: 0.35`, behind the panel, same skew.

**Acceptance.** Panel and patch stay locked (≤ 1 px) during a fast trackpad flick in Chrome and WebKit; at rest on desktop the form visibly sits on textured lit plaster, and umber text measures ≥ 7:1 on the rendered pixels there; on a phone (touch scroll) no canvas edge swims around the panel; no fake confirmation in any mode; the preview-mode sub, note and "See it written" read as written; mailto body correct; preview message exact; prefill works; the south-facing Sydney hint appears at 12:00 and no north-facing hint appears for Sydney; keyboard-only completion works; no horizontal overflow at 390 px; split screenshots at 1440 × 900 and 1024 × 768 show the panel left, clear of the viewport edge, and the heading block right.

### 5.8 `dusk` (20:40) · footer, ember, afterimage
**Purpose.** Resolution. The light collapses to an ember, the wall goes to blue hour, and an optional last experiment shows a colour that is not on the screen.

**Copy (final).**
- Epilogue button: "Watch the sunset" (after one run: "Watch the sunset again").
- Visible caption under the button (`--t-caption`, `--c-dust`): "Eighteen seconds. Keep your eyes on the dot." (Revision: the label suggests an animation and the duration was hidden, so most visitors would leave before the switch and the closing moment would rarely happen.)
- During the hold (`aria-live="polite"`): "Look at the dot until the light goes out." Visually hidden timer text: "18 seconds". Beside the hairline, the whole seconds remaining (`18` down to `1`) in `--t-value` tabular figures, `aria-hidden` (the live region is not re-announced every second).
- On the field (`aria-live="polite"`): "If you watched it to the end, you may see a pale blue shape on the wall. That colour is not on your screen. Your eye made it."
- Field button: "Back to the evening".
- Footer line: "Clear glass that writes in sunlight. Copenhagen."
- Honesty line: "Aslant is a proposal for a studio. The light is real."
- Links: "Commission a pane" (`#commission`), "Write yours" (`#write-yours`), "Colophon" (opens the dialog), "Email us" (`mailto:`, rendered only when `NEXT_PUBLIC_COMMISSION_EMAIL` is set).
- `<ModeSwitches />` (section 4.11).
- Sunset line: "Sunset in {Moscow} today: {18:14}." Variants: "The sun does not set in {city} today." / "The sun does not rise in {city} today." City from the time-zone table; unknown time zone falls back to Copenhagen. Rendered only after mount into a fixed-width slot (nothing is printed in SSR: a prerendered page would print the build date's sunset, 7.2).
- Decorative wordmark `aslant` (`aria-hidden`).

**Layout, split.** `<footer id="dusk" data-chapter="dusk">`, `min-height: 70svh`, `restMode: end` (page bottom). Ember anchor (fixed 100 × 24 px, `restMode: live`) at `left 58%; top 16%` of the footer; the epilogue button 20 px under it. Lower block on the grid: columns 1 to 7 hold the decorative wordmark (`--t-footmark`, colour `#505859`, a logotype exempt from contrast rules) with the footer line and the honesty line under it (`--t-lead`); columns 8 to 12 hold the links (vertical list), the mode switches and the sunset line.

**Layout, stacked.** Ember (72 × 18 px) centred at 14%; button under it; then wordmark, lines, links, switches, sunset line.

**Light.** Through the transition from commission, the patch collapses from the panel rect to the ember rect; the sun goes to `#FF9B54` at `E_sun` 1.6; the wall goes to `#272C36`. At rest the ember is steady (no animation; idle-friendly).

**Epilogue** (full spec 6.5): an 18 s steady hold on a small ember patch with a fixation dot, a hairline timer and the seconds remaining, then one switch to a neutral mid-grey field (`--c-field`), then the text. Esc, scroll or the button returns to the evening (1.2 s fade). Works under reduced motion (the hairline stays still; the seconds still count down).

**Colophon** (native `<dialog>`, WP10; opened from the footer link; Esc closes; focus returns to the link; `data-lenis-prevent` on the dialog and `stopScroll('colophon')` while open, `startScroll('colophon')` on close, 4.7):
- H3 (id `colophon-title`): "Colophon"
- "Every spectrum on this page is computed. Each ray is traced at {8} wavelengths between 400 and 700 nm and converted with the CIE 1931 observer: {65,536} rays per frame."
- "Sun positions come from NOAA's solar equations, worked out in your browser from your clock and time zone. We never ask where you are."
- "The headings widen as the sun lowers. Each is set to the length of the light at its hour, and the name at dusk is the widest." (Revision: the H2 width that follows the sun's height is the page's best hidden typographic idea, and without this line the dim dusk wordmark reads as the stock huge footer logo.)
- "Type: Sprat by Ethan Nakache (Collletttivo) and Geologica by Monokrom, both under the SIL Open Font License."
- "Our name is the angle of the light. Emily Dickinson got there first: “There’s a certain Slant of light.”" Markup: the quoted line is a `<q>` inside a `<cite>` (it is also the poem's title); `q { quotes: '“' '”' '‘' '’' }` supplies the curly quotes, so they are not typed into the text.
- "Aslant is a proposal for a studio. The studio, its Copenhagen address, the first forty panes, the sizes, the lead time, the name Ingrid and her birth time are invented for this study. The physics, the history and every number about light are real."
- Making log (omitted entirely if `src/content/night-log.json` has no valid times): "Designed and built overnight, between {00:40} and {07:52} on 29 September 2026, Moscow time. Built with Next.js, three.js, GSAP and Lenis."
- Live line: "The last frame took {4.1} ms of {GPU|main-thread} time at tier {3}." (`main-thread` when `frameSource === 'cpu'`; the tier is the GPU tier; hidden in Overcast.)
- Hint: "Press R to see the rays. Press L to leave the room."
- Switch: "Keyboard shortcuts" (on by default; off disables R and L, 4.12).
- Buttons: "Show the rays" (closes the dialog and enables the ray view), "Close".

**404** (`app/not-found.tsx`, WP10; standalone, no canvas, no loader, no skip link): no light at all, which is the joke (and two soft radial blobs on a dark ground would be anti-slop tell #8). The `--c-shade` wall; a CSS skirting board (below y = 96.5%, `#383E3F`, the wall at 92% in linear light, with a 1 px `#3D4445` highlight on its top edge, as in 6.1.4); the wordmark top left (`--t-wordmark`); H1 "No light reaches this page."; link "Back to the window." → `/`.

**Acceptance.** Ember and patch collapse cleanly in both scroll directions; the epilogue is a single on and a single off change (flash-safe, WCAG 2.3.1); the field is neutral (`#8C8C8C`); the sunset line matches `sun.ts` (Moscow on 29 September 2026: 18:14; Copenhagen: 18:54); the colophon never prints a time that did not happen.

---

## 6. Signature moments: behaviour, shaders, fallbacks

Coordinate conventions used everywhere below:
- **CSS px** (`fragCSS = gl_FragCoord.xy / uDpr`, with y flipped to point down) for anything that must register with the DOM.
- **Patch-local** `(u, v)`: `v = (y - patch.y) / patch.h` (down), `u = (x - patch.x - v·k) / (patch.w - k)` with `k = skew · patch.h`. Inside the patch both are in [0, 1].
- **Lower-light space** `(s, t)`: the word pane's rectangle in patch-local space, `uLower = (u0, v0, u1, v1)`; `(s, t) = ((u, v) - (u0, v0)) / (u1 - u0, v1 - v0)`. With a split window, `v0 = split + transom`; with a single light, `uLower = (0, 0, 1, 1)`.
- **Raster space**: the word raster, 1024 × 480, normalised to [0, 1]², y down. Mapped into lower-light space by `uWordRect = (x0, y0, w, h)`.
- The caustic render target covers lower-light space. Clip y = `1.0 - 2.0 * t`.

### 6.1 First light: a word condensing out of pool light
Real transport physics, not a particle morph: every frame of the formation is the displacement interpolation of a computed optimal transport map, the same states a real pane would show at intermediate wall distances.

#### 6.1.1 Transport data (WP3)
- **Sources (ray origins):** the R2 low-discrepancy sequence, `x_i = fract(0.5 + i · 0.7548776662466927)`, `y_i = fract(0.5 + i · 0.5698402909980532)`, `i = 1 … N`, in double precision, identical in Python and TypeScript. Origins are in lower-light space.
- **Word raster:** canvas 1024 × 480, black; font per 3.2 (`SpratWordmark` for `aslant`; `SpratRaster` for 1 to 7 characters or `SpratRasterCondensed` for 8 to 10; Geologica 600 for a word outside Sprat's letters); size starts at `floor(480 · 0.62)` px and shrinks by 4 px until the measured width is ≤ 0.86 · 1024; centred using `actualBoundingBox*` metrics; white fill. The red channel / 255 is the density (floor 0: rays go only to letters). A Gaussian blur of σ = 0.8 px is applied in the worker (never with `ctx.filter`, which Safari lacks).
- **Target samples:** Hilbert-order inverse CDF. Precompute once per worker the Hilbert traversal (order 10) of the 1024 × 480 grid; cumulative density along it; take the N quantiles `(j + 0.5) / N`; jitter within the pixel with a seeded PRNG (mulberry32, seed 7).
- **Sliced optimal transport:** `P = S`; each iteration picks `θ = rand() · π` (mulberry32, seed 9), projects `P` and `T` on `d = (cos θ, sin θ)` in isotropic coordinates (y scaled by 480 / 1024), sorts both with an **LSD radix sort** (float → sortable uint32 keys, 3 passes of 11 bits, with an index payload; never `Array.sort`), and moves each ray by the rank-matched difference (step 1.0). **256 iterations** for baked words, **96** for live words. The result `P_i` is ray i's target in raster space. Do not use the Hilbert assignment as the final map (it moves light in rectangular blocks).
- **Density per ray:** `aDensity_i = max(density(P_i) / mean(density), 0.05)`.
- **Baked words:** `aslant` (hero, loupe, OG) and `Ingrid` (appointment, write-yours default, ledger default), 65,536 rays, 256 iterations, written by `scripts/bake-light.py` (numpy + Pillow, same algorithm) to `public/light/aslant.bin` and `public/light/ingrid.bin`. `aslant` is rasterised with `public/fonts/Sprat-Wordmark.ttf` (the one wordmark drawing, 1.1); `Ingrid` with `public/fonts/Sprat-RegularMedium.otf`. This is the fast path to the G1 gate; the JS worker implements the same algorithm for live words. If a `.bin` fails to load, the worker computes the word at 65,536 × 256 during the loader, with the same face.
- **Measured width = ink width, in both places (must-fix).** TypeScript: `actualBoundingBoxLeft + actualBoundingBoxRight`; Python: Pillow `ImageDraw.textbbox` right minus left. (If one side measured the advance, a retyped "Ingrid" would change size against the baked one.) Vertical centring uses the ink box in both.
- **`.bin` format (little-endian):**

| Offset | Size | Field |
|---|---|---|
| 0 | 4 | magic `ASL1` |
| 4 | 4 | uint32 N |
| 8 | 2 | uint16 iterations |
| 10 | 2 | uint16 raster width (1024) |
| 12 | 2 | uint16 raster height (480) |
| 14 | 2 | uint16 flags (bit 0 = y down, always 1) |
| 16 | 4 | uint32 seed |
| 20 | 12 | reserved, zero |
| 32 | 4N | uint16 x, uint16 y interleaved; value / 65535 = raster coordinate |
| 32 + 4N | N | uint8 density code; `d = 2^(code / 25.5 - 5)`, `code = round((log2(d) + 5) · 25.5)` clamped to 0 … 255 |

About 328 KB per word, and 328 KB on the wire: `next start` does not compress `application/octet-stream` (9.1 budgets it that way). `aslant.bin` is preloaded by `layout.tsx` (WP0) with `ReactDOM.preload('/light/aslant.bin', { as: 'fetch', crossOrigin: 'anonymous' })`, matching the `fetch()` in `loadBaked` so the preload is reused; `ingrid.bin` is fetched after the first frame.

#### 6.1.2 Caustic pass (WP4)
One `THREE.Points` geometry (attributes `aOrigin` vec2, `aTarget` vec2, `aTargetPrev` vec2, `aDensity` float), drawn **K times** (one draw per wavelength band, each a `ShaderMaterial` with the same program and its own `uDispersion` and `uBandRGB`) into `rtCaustic` (`HalfFloatType`, RGBA, linear filtering, mipmaps generated after each render for halation and defocus, no depth), blending `ONE, ONE`, cleared to 0. Output is relative irradiance: 1.0 means plain sunlight through plain glass.

```glsl
// caustic.vert
attribute vec2 aOrigin; attribute vec2 aTarget; attribute vec2 aTargetPrev; attribute float aDensity;
uniform float uFocus, uWave, uTime, uMorph, uDispersion, uSpacing, uPointMax, uAberr, uPointScale;
uniform vec2 uSunOffset;           // lower-light units
uniform vec4 uWordRect;            // raster → lower-light: xy offset, zw size
varying float vSigma; varying float vSize;
void waves(vec2 p, float t, out vec2 g, out vec3 h);   // 7 directional sinusoids, constants below
vec2 aberrField(vec2 p);                               // 3 fixed low-frequency sinusoids (static)
void main() {
  vec2 target = uWordRect.xy + mix(aTargetPrev, aTarget, uMorph) * uWordRect.zw;
  vec2 g; vec3 h; waves(aOrigin, uTime, g, h);
  float D = uWave * 0.018;
  vec2 disp = uFocus * (target - aOrigin) + (1.0 - uFocus) * D * g;           // displacement interpolation
  vec2 p = aOrigin + uDispersion * disp + uSunOffset + uAberr * aberrField(aOrigin);
  float detJ = abs((1.0 + D * h.x) * (1.0 + D * h.y) - D * h.z * D * h.z);  // ray differential of the wave map
  float foot = ((1.0 - uFocus) + uFocus / max(aDensity, 1e-3)) * max(detJ, 0.02);
  float s = clamp(0.55 * uSpacing * sqrt(foot) * uPointScale, 0.45, 14.0);
  vSize = min(6.0 * s, uPointMax);
  vSigma = vSize / 6.0;                                   // truncate by shrinking: energy is conserved
  gl_PointSize = vSize;
  gl_Position = vec4(p.x * 2.0 - 1.0, 1.0 - p.y * 2.0, 0.0, 1.0);
}
// caustic.frag
uniform vec3 uBandRGB; uniform float uNorm;                // uNorm = rtW * rtH / N
varying float vSigma; varying float vSize;
void main() {
  vec2 r = (gl_PointCoord - 0.5) * vSize;
  float w = exp(-0.5 * dot(r, r) / (vSigma * vSigma)) / (6.2831853 * vSigma * vSigma);
  gl_FragColor = vec4(uBandRGB * w * uNorm, 1.0);
}
```
- **Wave constants** (the prototype's field, `proto/v2.py`, rng seed 21), each `(kx, ky, phase, omega, a)` with `arg = 2π(kx·x + ky·y) + phase + omega·t`, gradient `a·2π·(kx, ky)·cos(arg)`, Hessian `-a·(2π)²·(kx², ky², kx·ky)·sin(arg)`:
  `(0.66280, -3.34669, 4.45981, 0.55346, 0.085913)`, `(-2.83518, -3.04645, 2.66033, 0.56744, 0.057740)`, `(3.43055, -0.92076, 1.23900, 0.90324, 0.079262)`, `(2.61625, -0.11940, 5.36496, 0.91935, 0.145794)`, `(0.45489, 2.52896, 5.99515, 0.70426, 0.151457)`, `(-6.82201, 2.63212, 2.76650, 0.50016, 0.006546)`, `(-0.44719, 6.93006, 4.78319, 0.86383, 0.007258)`.
- **Footprint-scaled splats are non-negotiable.** Fixed splats turn sparse regions into TV static; ray-differential sizing gives thin cusped filaments and smooth cells.
- **Bands** (`glass.ts`, WP0): K equal bins over 400 to 700 nm, each bin's colour = the mean of the Wyman, Sloan and Shirley (2013) multi-lobe CIE 1931 fit over 12 sub-samples, XYZ → linear sRGB (`[3.2406,-1.5372,-0.4986; -0.9689,1.8758,0.0415; 0.0557,-0.2040,1.0570]`), then white-balanced so the K colours sum to (1, 1, 1). Negative lobes are allowed in half float and clamped in the compositor. Test vector, K = 8, first band (418.75 nm): (0.0334, -0.0386, 0.3043); fifth band (568.75 nm): (0.2806, 0.3817, -0.0566). `uDispersion = (n(λ) - 1) / (n_d - 1)`: for Clear at the K = 8 centres `1.02559, 1.01739, 1.01099, 1.00589, 1.00177, 0.99839, 0.99559, 0.99323`.
- **Glass constants:** Clear (PMMA) n_d 1.4917, V_d 57.4, Cauchy A 1.47871, B 0.004484 µm². Prismatic (flint, N-SF10-like) n_d 1.72825, V_d 28.53, A 1.68955, B 0.013362 µm². Per band, `uDispersion = mix(dispersionScale('clear', λ), dispersionScale('prismatic', λ), light.word.prism)`, so a glass change or a blend between a Clear and a Prismatic chapter needs no recompute.
- **Tier settings:** tier 3: K = 8, N = 65,536 (baked) or 32,768 (live), `uPointMax` 24 px, RT long side 1024. Tier 2: K = 4, N = 32,768, `uPointMax` 16, RT long side 768. **Loose-phase optimisation (allowed, and required if G1 fps fails):** while `uFocus < 0.5`, use K = 3 (bins centred 450 / 550 / 650 nm; dispersion is invisible when displacements are small) and RT long side 768. The RT short side follows the lower light's on-screen aspect (clamped 256 to 1024); reallocate only when that aspect changes by more than 15%, and only at a focus-pull peak or during a wall → wall blend.
- **Caching (idle-friendly):** the pass re-renders only when an input changes. When settled (`focus ≥ 0.98`, `wave ≤ 0.05`, sun offset and morph unchanged) the pass freezes its own `uTime`, and the residual "breathing" is done in the compositor as a UV warp of the cached texture (≤ 0.8 CSS px, plus ±2% intensity) until idle.
- **Word rect:** `uWordRect` places the raster (aspect 2.133) inside lower-light space so the word keeps its true aspect on screen: `w = min(0.86 (split) or 0.94 (stacked), (lowerH_px · 0.72 · 2.133) / lowerW_px)`, `h = w · lowerW_px / (lowerH_px · 2.133)`, centred.
- **Streaming morph:** when a new transport arrives for the owner being shown, copy the current effective targets into `aTargetPrev`, upload the new ones to `aTarget` (ranged `needsUpdate`), and tween `uMorph` 0 → 1 over 120 ms (a Scene-internal tween; `uMorph` is not a `light` field). Swaps at focus-pull peaks set both attributes to the new transport. Wall-to-wall changes of the shown transport run loosen, swap, re-form (4.3).
- **Ray counts:** the attribute buffers are allocated for 65,536 rays once; a transport of `n` rays fills origins 1 to `n` and the draw range is set to `n`. `uSpacing` and `uNorm` follow the drawn count. The drawn count changes only while the effective focus is ≤ 0.2 (4.3); a morph between different counts runs over the smaller one.

#### 6.1.3 Compositor, wall mode (WP4)
One full-screen triangle; outputs display-ready sRGB; all modes return **linear radiance** and share one tone-mapping tail. Pseudo-GLSL:

```glsl
vec3 shadeWall(vec2 fragCSS) {
  // plaster: world-anchored to CSS px; uPlaster = 1024² RGB8 tileable fbm (R cloud, G trowel, B cords) generated once at boot
  float cloud  = texture(uPlaster, fragCSS / 900.0).r;          // 0.3 to 1 m blotches
  float trowel = texture(uPlaster, fragCSS / 140.0).g;          // fine marks
  vec3 albedo  = uAlbedo * (0.91 + 0.18 * cloud) * (0.97 + 0.06 * trowel);   // ±9% limewash mottling
  vec2 q = fragCSS / uViewport;                                  // 0..1, y down
  float fall = mix(1.12, 0.88, smoothstep(0.0, 1.35, dot(q, vec2(0.62, 0.78))));  // window side = upper left
  vec3 E = uSky * fall;                                          // derived in WP4's Scene from light.shade and calUv (6.1.5)

  // the sun patch
  PatchLocal pl = toPatch(fragCSS);                              // u, v, inside mask with 1.2% penumbra (×(1 + 40·uDefocus))
  float upper = pl.mask * soft(uSplit - pl.v);                   // plain upper light
  float lower = pl.mask * soft(pl.v - (uSplit + uTransom));      // word pane (or the whole patch if uSplit = 0)
  upper *= 1.0 - bar(pl.u, 0.5, uMullion);                       // mullion shadow, soft
  float cords = 0.88 + 0.24 * texture(uPlaster, vec2(pl.u * 0.06, pl.v * 2.2)).b;  // drawn-glass cords: horizontal streaks, ±12%, in patch space
  vec3 sunUpper = uSun * cords * (1.0 - 0.08 * pl.v / max(uSplit, 1e-3)) * upper;
  vec2 st = lowerSpace(pl) + shimmerWarp(pl, uTime) * uShimmer;
  vec3 C = max(textureLod(uCaustic, st, uDefocus * 5.0).rgb, 0.0);
  vec3 sunLower = uSun * (uFill + (1.0 - uFill) * C) * lower;    // uFill = 0.07: energy-matched
  float scrim = mix(1.0, 0.015, scrimMask(fragCSS));             // text boxes in full shade; 32 px feather outside the rect (4.3)
  E += (sunUpper + sunLower) * uPatchOn * scrim;                 // uSun already carries E_sun × the passing-cloud dip (4.3)

  vec3 rad = albedo * E;
  rad += beamMask(fragCSS) * uHaze * uSun * 0.010;               // faint air-light along the beam (tier 3)
  vec3 hal = max(textureLod(uCaustic, st, 3.0).rgb - 0.9, 0.0) * 0.10
          + max(textureLod(uCaustic, st, 5.0).rgb - 0.9, 0.0) * 0.05;       // spill from light above 0.9 only
  rad += albedo * uSun * hal * lowerDilated(pl, 0.04) * uHalation;             // mask dilated 4% so the spill reaches past the letters
  rad = skirting(rad, fragCSS);                                  // 6.1.4
  return rad;
}
// shared tail (compositor main): mode mix, vignette, tone map, grain, dither
vec3 rad = mix(shadeMode(uModeA, fragCSS), shadeMode(uModeB, fragCSS), uModeMix);  // both only while 0 < uModeMix < 1
rad *= 1.0 - 0.18 * dot((q - vec2(0.6, 0.5)) * vec2(1.2, 1.0), (q - vec2(0.6, 0.5)) * vec2(1.2, 1.0));
vec3 col = acesNarkowicz(rad * uExposure);                      // (x(2.51x+0.03))/(x(2.43x+0.59)+0.14), uExposure = 1.0
float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
vec3 outc = linearToSrgb(col) + (hash(gl_FragCoord.xy, uGrainSeed) - 0.5) * 0.010 / sqrt(0.12 + lum) * 0.35;
outc += (hash2(gl_FragCoord.xy) - 0.5) / 255.0;                 // dither
gl_FragColor = vec4(outc, 1.0);
```
- Uniform list (wall): `uViewport`, `uDpr`, `uPlaster`, `uAlbedo` (0.62 × lin(`#D6CEBE`)), `uSky` (WP4's Scene, from `light.shade`), `uSun` (`light.sun` rgb × `e` × `(1 − 0.8 · light.cloud)`), `uPatch` (x, y, w, h CSS px), `uSkew`, `uSplit`, `uTransom`, `uMullion`, `uPatchOn`, `uLower`, `uCaustic`, `uFill`, `uShimmer`, `uTime`, `uScrims[8]` (vec4 CSS px), `uScrimCount`, `uBeam[6]` (hexagon: the patch polygon swept toward the window), `uHaze`, `uHalation`, `uDefocus`, `uSkirting` (y CSS px, −1 when hidden), `uModeA`, `uModeB`, `uModeMix`, `uExposure`, `uGrainSeed`.
- **Ember** (dusk) is the same patch at a small size with the ember sun colour and no word (`uLower` unused, `uFill` = 1).
- Multiplicative lighting only. The first prototype added light on top of the wall and looked like beige paper; do not repeat that.

#### 6.1.4 The room cues (must-fix)
- **Skylight falloff** as coded above (about ±12% around the mean, window side upper left).
- **Skirting board** (hero and dusk views only; `uSkirting` from `world-spec`; hidden elsewhere): the wall ends at the board's top edge at y = 96.5% of the viewport (hero, split), 97.5% (hero, stacked), 94% of the footer's visible area at dusk. Below it: board albedo × 0.92 with no mottling, a 1 CSS px highlight on its top edge (+18%, the skylight catching the bevel), and a 6 px soft contact shadow above the edge (−10%). It sits under the hero's bottom padding; nothing overlaps it.

#### 6.1.5 Calibration (WP4, `src/webgl/calibrate.ts`, called from WP4's Scene)
`calibrateSky(shadeLinear, calUv)` inverts ACES per channel by bisection on the CPU and divides by `albedo × plasterMean(calUv) × fall(calUv) × vignette(calUv)`, so the unlit wall at the calibration point renders the table value of section 3.1.1 exactly. `plasterMean` is the **actual** mottling factor averaged over the 64 × 64 CSS px calibration window, read from the CPU copy of the plaster texture that `plaster.ts` generates anyway (revision: the cloud term samples the plaster at `fragCSS / 900`, so over 64 px it is nearly constant at some value between 0.91 and 1.09; assuming a mean of 1.0 could miss the target by up to 9% in linear light, 2 to 3 levels, against G1's 2-level criterion). The conductor writes only the target (`light.shade`, linear, lerped between chapters) and `calUv`; the Scene derives `uSky` when either changes (more than 0.25% in any channel, or a new `calUv`), so `calibrate.ts` and its data stay out of the main bundle. Calibration points are listed per chapter and composition in 5.0; they follow the text columns.

#### 6.1.6 Dust motes (WP4)
Tier 3: 1,200 points; tier 2: 400. Positions drift on analytic curl noise in the vertex shader (0.02 to 0.12 CSS px per frame), sink slowly and swirl with `light.air`. Visible only inside the beam: point-in-hexagon test against `uBeam` (the patch polygon extruded 1.4 viewport heights toward the window), brightness `sun × 0.35 × smoothstep` along the beam, sizes 1.5 to 3.5 CSS px, additive after the compositor. Frozen when idle; absent under reduced motion.

#### 6.1.7 Gate G1 procedure (critical path; nothing else in WebGL starts before it passes)
1. `app/dev/light/page.tsx` (WP4; `notFound()` in production) renders the hero with the baked `aslant.bin`, the real compositor and a debug panel (focus, wave, K, RT size, DPR, point max).
2. Capture at 1440 × 900, DPR 2: `?still=first-light` settled, and three formation frames (focus 0, 0.35, 0.85). Place them side by side with `concept-1-light/ref-hero-desktop.jpg` and `ref-formation.jpg`.
3. **Pass (character match):** filaments and cells in the loose state; a slab that cracks along letter gaps; crisp letters with thin spectral edges; the word the brightest thing in the frame and the plain upper light with horizontal cords at p99 luminance ≤ 215 (3.1.2); the room reads as a room (mottling visible across the shade, falloff, skirting); the unlit wall at the calibration point within 2 levels of `#3A4142`; the nav wordmark and the formed word are the same drawing.
4. **Pass (performance):** ≥ 55 fps sustained through the loose pool-caustic phase (the overdraw worst case) at DPR 1.75 in Chrome **and** WebKit on an M-series Mac (`stage.frameMs` over 300 frames, median and p95 reported).
5. **Pass (WebKit specifics, run headed in Playwright's WebKit, 7.6):** half-float additive blending works, the point-size clamp respects `gl.getParameter(ALIASED_POINT_SIZE_RANGE)`, the `SpratRaster` and `SpratWordmark` FontFaces draw into the canvas. Real Safari is recorded as "not run" unless it can be automated; no gate waits on it.
6. **Fallback ladder if it fails at T+75:** (a) loose-phase K = 3 and RT 768; (b) `uPointMax` 16; (c) tier-3 DPR 1.5; (d) N = 32,768 for the hero; (e) if WebKit half-float blending fails: RGBA8 target with gain × 0.25 and halation off. Hard stop at T+90: take the best passing configuration and move on.

### 6.2 The loupe: seeing what clear glass does to light (WP5)
- **Slope field:** from the relief job (6.4.3) for `aslant`: an RGBA16F texture 256 × 128, RG = surface slope vector (radians), BA = the high-passed slope (slope minus a Gaussian blur of σ = 3 cells), uploaded once as `THREE.HalfFloatType` RGBA, converted on the CPU with `THREE.DataUtils.toHalfFloat` into a `Uint16Array`, linear filtering (must-fix: a `FloatType` upload with linear filtering needs `OES_texture_float_linear`, which Apple mobile GPUs lack; three r186 only warns, and the loupe would sample black on iPhones).
- **Pane mode chunk** `vec3 shadePane(vec2 fragCSS)` (a `ModeChunk`, 7.3): outside the glass rect, the room wall as in `shadeWall` with the 10:30 light and no patch in view; the studio's test frame: 10 px bars (albedo × 0.55, a 1 px lit inner edge); inside the glass: the far wall behind the frame (plaster plus a far, soft sun patch, defocused) sampled at `fragCSS + slope · 0.004 · uViewport.y` (it barely wavers); rim highlight 1 px `#FFE9C8` at 25%; faint green edge `#A8C4B4` at 18%.
- **Bicolour schlieren inside the loupe disc (and everywhere when `uRelief = 1`):** `s = clamp(k · dot(slopeHP, knifeDir), -1, 1)`, `k` chosen so the 95th percentile maps to ±0.8; colour `mix(cShade, cSun, 0.5 + 0.5 · s)` with `cShade = lin(#3A4142) · a` (skylight shade) and `cSun = lin(#FFE1A6) · b` (sun), `a` and `b` set so the mean sits at the room's brightness and the lit flank peaks near the far patch's level. Deflection one way catches the sun, the other falls into shade: dunes under raking light, with no new saturated colour (revision: the grey `#2E2B27` to `#D8CFC0` ramp was physically right but the weakest interaction on the page, straight after the strongest hero). 1 px lit rim at the disc edge. Iris radius animates 0 → R (300 ms `focus`) on enter, R → 0 (180 ms `defocus`) on leave. `knifeDir` (the filter's split direction) = damped pointer velocity direction (λ 6), default (0.71, 0.71).
- **Readouts:** the CPU copy of the slope field is sampled at the loupe centre: "Surface slope" = |α| in degrees; "Light turns" = `asin(n · sin α) - α`. Pane maxima when the loupe is inactive.
- **Fallbacks:** keyboard uses the toggle; touch drags the proxy disc; Still air and no-WebGL show `public/posters/relief.webp` (captured from `?still=clear-glass` with `uRelief = 1`).

### 6.3 The bend: an optical bench in haze (WP5)
- **Tracer** (`src/lib/bench/trace.ts`, CPU): the relief slice = the integrated slope along the pane's horizontal centre line (x slope component), exaggerated 40× for drawing. Rays travel toward the pane at normal incidence (no bend at the flat entry face). At the exit face with local tilt α: `θt = asin(n(λ) · sin α)`, deviation `δ = θt - α`, the ray lands on the wall at `y + L · tan δ` (drawn geometry; readouts always use the true, unexaggerated α). 64 rays × 12 bands (tier 3) or 32 × 6 (tier 2); 3 segments per ray; recomputed only when `uRelief`, `uFan`, the picked ray or the viewport change (about 0.2 ms).
- **Profile:** histogram of landing positions (256 bins, 3-bin smooth) → `uProfile` (a 256 × 1 RGBA16F texture, value in R, uploaded as `HalfFloatType` exactly like the slope field) for the wall glow.
- **Beats** (section 5.3): `uRelief` 0 → 1 (flat to relief), `uFan` 0 → 1 (one white ray per position to a 12-band fan at true relative dispersion, 1.74% for acrylic, with the geometry exaggerated and labelled by the scale note).
- **BenchPass:** instanced soft line quads (2 px core, 6 px falloff), additive; white rays `#FFF5EA` at 55%; band rays with the `glass.bands(12)` colours; the picked ray at 100% and 1.5 px core.
- **Bench mode chunk** `vec3 shadeBench(vec2 fragCSS)` (a `ModeChunk`, 7.3): haze `#2F3536` (as radiance) with low-frequency noise ±4% and a brighter band along the beam; the pane cross-section as two edge highlights; the wall line (1 px) and the luminous profile glow. Geometry comes from the bench band of 5.3 (split: rays from the left edge, pane at x 38%, wall at x 94%, y 46% to 90%), placed from the sticky frame's live rect.
- **Stacked:** the whole diagram rotated 90° (light from the top), coordinates swapped in the tracer output.
- **Fallback:** `public/posters/bench.webp` (beat 3, captured at the band's aspect) plus the beat list, in Overcast and Still air.

### 6.4 Write yours: watch your glass being computed (WP3 worker, WP7 section)
#### 6.4.1 Live transport
- Main thread rasterises the word (≤ 3 ms) and transfers the pixel buffer to the worker (`src/lib/caustics/transport.worker.ts`, created with `new Worker(new URL('./transport.worker.ts', import.meta.url), { type: 'module' })`; if Turbopack rejects it, WP3 ships `public/workers/transport.js` as a plain module worker with the same protocol).
- Protocol: `{ type: 'compute', jobId, raster, n, iters, streamEvery: 8, seed }` → `{ type: 'frame', jobId, iter, targets }` (every 8 iterations, transferable `Float32Array(2n)`) → `{ type: 'done', jobId, targets, density, iters, ms }`; `{ type: 'cancel', jobId }`; `{ type: 'relief', jobId, targets, n }` → `{ type: 'relief', jobId, slope, width: 256, height: 128, maxSlopeDeg, maxTurnDeg, depthMm }`.
- Cancellation: the worker runs iterations in chunks of 8 and yields (`setTimeout(0)`) between chunks, so a newer `compute` or a `cancel` stops a stale job within one chunk. Only the newest job's frames are applied.
- Live settings: N = 32,768 (tier 3 and 2), 96 iterations, stream every 8. Expected 0.3 to 0.6 s in a worker on M-series.

#### 6.4.2 Choreography (must-fix latency)
| Time after last keystroke | Event |
|---|---|
| 0 ms | Debounce starts (180 ms). The current word loosens at once: WP7 tweens its input so the effective `focus → 0.15`, `wave → 0.6` (450 ms `defocus`). |
| 180 ms | Raster + post to worker; status "Computing the glass · 32,768 rays". |
| ≤ 300 ms | First streamed frame (iteration 8) applied with a 120 ms morph: the light visibly begins to re-form. |
| every 8 iterations | New targets; `focus = 0.15 + 0.70 · (iter / 96)`, `wave` eases toward 0.04. |
| ≤ 1.2 s | Done: `focus → 1` (≤ 600 ms, `focus`), density uploaded, result and relief line update (240 ms fade). |
Validation errors never start a job; the last valid word stays formed.

#### 6.4.3 Relief (worker)
Bin rays by origin into a 256 × 128 grid; displacement `(P_i - S_i)` converted to millimetres on a 300 mm wide pane (height 300 · 480/1024 mm) and a 1.5 m throw; slope `α = atan(disp / throw) / (n - 1)` per component; fill empty cells from neighbours; high-pass as in 6.2. Depth: least-squares Poisson integration on 128 × 64 with **conjugate gradient** (≤ 200 iterations, Neumann boundaries; plain Jacobi converges too slowly); `depthMm = max(h) - min(h)`, printed as "about x.x mm". Sliced OT maps carry a little curl, so the relief is their curl-free part; that is why the copy says "about".

#### 6.4.4 Save the image (graft: a designed artifact)
- `stageApi.renderStill({ width: 1080, height: 1080, framing: 'square', transport, hour, glass })` renders the caustic pass and the compositor into an offscreen RGBA8 target (patch centred, 80% of the width, skew from the hour, word formed, grain seed 1), reads it back (`readRenderTargetPixels`, flip Y) and resolves an `ImageData`.
- `src/lib/save-image.ts` (WP7) composes a 1080 × 1350 2D canvas: the render on top; a 270 px caption bar in `#3A4142` with, at 64 px left margin: the word in `SpratRasterExtended` 64 px `#ECE6D9` (Geologica 600 when the word is outside Sprat's letters, 3.2); under it in Geologica 26 px `#BCC3BE`: "{City}. Arrives {16:40}, holds about {20} minutes." and "{26 May} to {19 July}."; bottom right the wordmark `aslant` in `SpratWordmark` 30 px `#ECE6D9` (the one wordmark drawing, 1.1). Export `toBlob('image/png')`, download as `aslant-{word}.png` (word lowercased, spaces to hyphens).
- One middle dot rule applies here too; the caption uses sentences.
- No-WebGL: the button is hidden.

### 6.5 The last light: the colour your eye makes (WP10)
- **Idle:** the ember patch (100 × 24 px split, 72 × 18 stacked; about 2° wide at laptop distance) glows steadily on the blue-hour wall.
- **Hold (18 s):** "Watch the sunset" (captioned "Eighteen seconds. Keep your eyes on the dot.") → a 3 px `--c-umber` fixation dot appears at the ember centre (DOM, above the canvas); a 1 px, 120 px hairline under the ember fills left to right (`transform: scaleX`, 18 s linear; static under reduced motion) with the whole seconds remaining beside it in `--t-value` tabular figures (`aria-hidden`); the live text reads "Look at the dot until the light goes out." Scroll, Esc or a click elsewhere cancels silently and restores the button. The field holds `stopScroll('epilogue')` from the switch until exit.
- **Switch:** at 18 s, in one frame: the ember turns off (`light.ember.on = 0`, one render) and a full-viewport DOM field (`--c-field`, `z-index: var(--z-epilogue)`, opacity 1 with no transition) appears with a 3 px `--c-field-ink` dot at the same screen position. After 1.5 s the text fades in (400 ms) with the button "Back to the evening", which then receives focus.
- **Exit:** the button, Esc, scroll or a click fades the field out over 1.2 s. The ember stays off; the button now reads "Watch the sunset again" and relights the ember instantly when pressed.
- **Safety:** exactly one abrupt luminance change (to grey) and one slow fade back; the lit area before the switch is tiny; nothing flickers (WCAG 2.3.1). The copy is hedged ("you may see").

### 6.6 Ray view: the hidden layer (WP2)
- `RayViewPass`: a `LineSegments` of 128 segments (1 in 512 rays at N = 65,536; 1 in 256 at 32,768). Start = the ray's origin mapped to the patch, then pushed back along `-uBeamDir` by 1.4 viewport heights (the window is off-screen); end = its current landing point (the same displacement as the caustic shader, evaluated on the CPU for these few rays). Colour `#FFE9C8` at 35%, 1 device px. Recomputed when the transport, focus or patch change.
- DOM overlay (`components/RayOverlay`): five lines, "Rays 65,536", "Bands 8", "Sun 40.2° high, bearing 252°", "Frame 4.1 ms (GPU)", "Tier 3", all live from the running code. `RayOverlay` mirrors `useApp.rayView` (set by KeyLayer and the colophon button) into `light.rays.on`; it is that field's only writer.
- Toggle: R key, or "Show the rays" in the colophon. Esc or R closes it.

---

## 7. Tech architecture

### 7.1 File tree and owners
Existing scaffold files are reused where marked (existing). "stub by WP0" means WP0 creates the file with the exact exports and prop types from 7.3 so every package compiles from T+20; ownership then passes to the listed owner. `@/` resolves to `src/`.

```
app/
  layout.tsx                  WP0   <html lang="en" suppressHydrationWarning>, font variable classes on <body>, metadata, viewport, head script, ReactDOM.preload of aslant.bin
  page.tsx                    WP0   Server Component: skip link, <Experience> + sections in order
  globals.css                 WP0   reset (font-synthesis, heading weights), base, tokens import, type classes, browser surfaces, overflow clip, .visually-hidden, html[data-js] gating helpers, loader and pre-intro gates with CSS failsafes
  fonts.ts                    WP0
  not-found.tsx               WP10   (+ not-found.module.css)
  icon.svg                    WP10   the parallelogram mark (the live favicon starts from it, 4.5)
  apple-icon.png              WP10   180 × 180, rendered from icon.svg with sharp
  opengraph-image.png         QA  captured from ?still=og (+ opengraph-image.alt.txt)
  dev/light/page.tsx          WP4   G1 harness; notFound() in production
public/
  fonts/Sprat-RegularMedium.otf, Sprat-CondensedMedium.otf, Sprat-ExtendedLight.otf, Sprat-Wordmark.ttf, Sprat-OFL.txt, Geologica-OFL.txt    WP0
  light/aslant.bin, light/ingrid.bin                                                                WP3
  posters/hero-desktop.webp, hero-mobile.webp, relief.webp, bench.webp                              QA (flat #3A4142 placeholders written by WP0 with sharp by T+20, so no dev page 404s before the captures)
  workers/transport.js        WP3   only if Turbopack cannot bundle the module worker
scripts/
  bake-light.py               WP3
  night-log.mjs               WP10   (stub by WP0)
  capture.mjs                 QA
  check-copy.mjs              QA
  check-contrast.mjs          QA
src/
  fonts/Sprat_Variable.woff2, Geologica-Latin.woff2, Geologica-Ext.woff2   WP0
  styles/tokens.css           WP0   (literal file, section 3.7)
  content/chapters.ts         WP0
  content/night-log.json      WP10   (WP0 creates {})
  lib/
    frame.ts                  WP1   (existing; WP0 writes the complete frame bus by T+20: Sets, FrameFn in seconds, try/catch per listener)
    store.ts                  WP1   (existing; full contract written by WP0)
    light-state.ts            WP1   (full contract written by WP0)
    gsap.ts                   WP0   (existing; add the four eases and defaults)
    math.ts                   WP0   (existing, unchanged; damp() takes seconds)
    color.ts                  WP0
    format.ts                 WP0
    ready.ts                  WP6   (existing)
    stage.ts                  WP1   (WP0 writes a minimal working version by T+20: requestRender, hold, release, touch, shouldRender, recordFrame; WP1 adds idle, the governor, tweenLight)
    conductor.ts              WP2
    world-spec.ts             WP2   (stub by WP0 with the 7.3 signatures and the 5.0 table)
    anchors.ts                WP2
    boot.ts                   WP1   (WP0 writes the working module by T+20)
    qa-flags.ts               WP1   (stub by WP0 with the parsed shape and motion())
    light/glass.ts            WP0
    light/sun.ts              WP8   (stub by WP0)
    light/sun.test.mjs        WP8
    light/cities.ts           WP8   (stub by WP0)
    caustics/sprat-charset.ts WP0   (generated from the font files, 3.2)
    caustics/r2.ts, bin-format.ts, raster.ts, hilbert.ts, radix.ts, sliced-ot.ts, relief.ts, transport.worker.ts, client.ts   WP3
    bench/trace.ts            WP5
    audio/ambient.ts          WP7
    save-image.ts             WP7
    commission.ts             WP9
  hooks/useReducedMotion.ts   WP1   (existing; rewritten to read motion())
  components/
    Experience/index.tsx      WP1   (stub by WP0 with every import wired)
    providers/SmoothScroll.tsx WP1  (existing; WP0 writes the fixed ticker order by T+20; WP1 adds Lenis options, jumpTo, scroll locks, the motion gate)
    LightAnchor/              WP2   (stub by WP0)
    Nav/, Menu/, Loader/, FocusTitle/                            WP6   (stubs by WP0)
    NavMark/                                                     WP2   (stub by WP0)
    LightSweep/                                                  WP9   (stub by WP0)
    Button/, Switch/, Readout/                                   WP0
    ModeSwitches/, Colophon/, KeyLayer/                          WP10  (stubs by WP0)
    RayOverlay/                                                  WP2   (stub by WP0)
  sections/                   each folder: index.tsx + styles.module.css (+ listed islands)
    FirstLight/ (+ HeroIntro.tsx, PointerSun.tsx)                WP6   (stub by WP0)
    ClearGlass/ (+ Loupe.tsx)                                    WP5   (stub by WP0)
    TheBend/ (+ BenchFigure.tsx)                                 WP5   (stub by WP0)
    Appointment/ (+ Clock.tsx, SunArc.tsx)                       WP8   (stub by WP0)
    WriteYours/ (+ Configurator.tsx, ContourMap.tsx)             WP7   (stub by WP0)
    Ledger/                                                      WP9   (stub by WP0)
    Commission/ (+ CommissionForm.tsx)                           WP9   (stub by WP0)
    Dusk/ (+ Epilogue.tsx)                                       WP10   (stub by WP0)
  webgl/
    StageRoot.tsx, stage.module.css                              WP1   (existing; probe, GPU tier, Overcast status, 100lvh canvas host, canvas fade-in)
    Stage.tsx                 WP4   (existing; revision: Stage integration moves to WP4: frameloop never, advance registration in onCreated, redraw triggers, onShaderError, context loss and epoch remount)
    gpu-timer.ts              WP1   (EXT_disjoint_timer_query_webgl2 wrapper used by WP4's Stage)
    pass.ts                   WP0   (the Pass and ModeChunk interfaces, 7.3; types only)
    stage-api.ts              WP4   (stub by WP0: a call queue with __register, replayed in order when the Scene registers)
    Scene.tsx, calibrate.ts, patch-math.ts, plaster.ts           WP4
    passes/CausticPass.ts, passes/Compositor.ts, passes/DustPass.ts   WP4
    passes/BenchPass.ts       WP5   (stub by WP0)
    passes/RayViewPass.ts     WP2   (stub by WP0)
    shaders/common.glsl.ts, caustic.glsl.ts, compositor.glsl.ts, wall.glsl.ts, dust.glsl.ts   WP4
    shaders/pane.glsl.ts, shaders/bench.glsl.ts                  WP5   (stubs by WP0: valid GLSL with the final signatures vec3 shadePane(vec2 fragCSS) and vec3 shadeBench(vec2 fragCSS), returning the plain wall)
  dev/Smoke.tsx               deleted by WP0
package.json, next.config.ts, tsconfig.json, eslint.config.mjs   WP0
```

### 7.2 Server and client boundaries
- `app/layout.tsx` and `app/page.tsx` are Server Components. Sections are Server Components by default; interactivity lives in client islands inside the section folder (`'use client'`). Section copy is SSR HTML in every case.
- `components/Experience` is the one client shell: it mounts `SmoothScroll` (which owns the ticker), `StageRoot`, `Loader`, `Nav`, `Menu`, `KeyLayer`, `RayOverlay`, then renders `children`.
- `StageRoot` loads `Stage` with `next/dynamic(() => import('./Stage'), { ssr: false })` (allowed only inside a Client Component). three and R3F never enter the initial bundle; they load after first paint.
- **Nothing is imported from drei** (its only use, `PerformanceMonitor`, is replaced by the governor of 4.1). `@react-three/postprocessing` and `postprocessing` are not imported anywhere. The packages stay installed; nothing is uninstalled tonight.
- Sections never import R3F or three. They talk to the WebGL layer through plain modules: `light-state.ts` (continuous values), `stage.ts` (render requests), `stage-api.ts` (transport upload, stills), `conductor.ts` (progress).
- **Bundle boundary (must-fix).** `src/lib/**`, `src/webgl/stage-api.ts`, `src/webgl/patch-math.ts` and `src/webgl/pass.ts` import from `three` with `import type` only (no `THREE.DataTexture`, no `THREE.Color` at module level). The real stage-api implementation registers itself from the lazily loaded Scene (`stageApi.__register`). After every build QA reads the first-load JS from the build output and greps the initial chunks for `WebGLRenderer`; a hit is a G2 failure routed to whoever imported three.
- **Hydration rules (must-fix; `page.tsx` is prerendered once at build time):**
  1. SSR renders only mode-independent markup. Every variant (fine and coarse pointer copy such as "Move the loupe" / "Drag the loupe" and "Point at a ray." / "Tap a ray."; tier, motion and Overcast variants) is present in the HTML and switched by CSS on `html[data-*]` or on `(hover: hover) and (pointer: fine)`.
  2. Client-derived values (the guessed city, the sunset line, anything using `Date` or `Intl` time zones) render after mount into a fixed-width slot, with nothing printed before. A prerendered "Sunset in {city} today" would print the build date's sunset and be wrong tomorrow.
  3. Flags come only from `qa-flags.ts` reading `location.search`, never `useSearchParams()` (which would also fail `next build` without a Suspense boundary).
  4. The font variable classes go on `<body>`; the head script sets `data-*` attributes on `html` and never a class, so a client re-render of the root cannot drop them.
- Continuous values never pass through React state. Readouts are written through refs in `afterScroll` listeners or `stage.onFrame` callbacks.
- Workers: `new Worker(new URL('./transport.worker.ts', import.meta.url), { type: 'module' })`, verified in both `next dev` and `next build` by WP3 before T+45 (fallback `public/workers/transport.js`).
- `next.config.ts` keeps `devIndicators: false` and adds `experimental: { turbopackFileSystemCacheForBuild: false }` (new in 16.3 the build cache is on by default and writes `.next/cache/turbopack`; there will be three builds tonight on a full disk, so it is dead weight; key verified in `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/turbopackFileSystemCache.md`). No `output: 'export'` tonight (the form is endpoint-agnostic and works statically anyway). No rewrites, no headers needed.

### 7.3 Contracts (exact exports; WP0 writes these signatures first)

**`src/content/chapters.ts`**
```ts
export type ChapterId = 'first-light' | 'clear-glass' | 'the-bend' | 'appointment' | 'write-yours' | 'ledger' | 'commission' | 'dusk'
export const CHAPTERS: ReadonlyArray<{ id: ChapterId; name: string; hour: number | null; hourLabel: string | null }> = [
  { id: 'first-light', name: 'First light', hour: 8 + 10 / 60, hourLabel: '08:10' },
  { id: 'clear-glass', name: 'Clear glass', hour: 10.5, hourLabel: '10:30' },
  { id: 'the-bend', name: 'The bend', hour: 12 + 50 / 60, hourLabel: '12:50' },
  { id: 'appointment', name: 'The appointment', hour: 16 + 40 / 60, hourLabel: '16:40' },
  { id: 'write-yours', name: 'Your word', hour: null, hourLabel: null },   // the visitor's hour
  { id: 'ledger', name: 'Precedent', hour: 18 + 20 / 60, hourLabel: '18:20' },   // menu and nav label; "The ledger" was internal jargon
  { id: 'commission', name: 'Commission', hour: 19 + 10 / 60, hourLabel: '19:10' },
  { id: 'dusk', name: 'Dusk', hour: 20 + 40 / 60, hourLabel: '20:40' },
]
```

**`src/lib/store.ts`** (zustand, discrete state only)
```ts
export type WebGLStatus = 'pending' | 'ready' | 'off' | 'failed'
export type GpuTier = 0 | 2 | 3                       // GPU quality only; motion is separate (4.11)
export type Facing = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW' | 'unsure'
export interface CommissionDraft { word: string; hour: string /* "17:20" */; cityId: string; facing: Facing; glass: 'clear' | 'prismatic' }
interface AppState {
  reducedMotion: boolean; motionForced: boolean       // initialised from motion() (qa-flags.ts); never from a media query
  introDone: boolean; introSkipped: boolean
  webgl: WebGLStatus; gpuTier: GpuTier                // setWebgl() is the only writer of html[data-webgl] after the head script; setGpuTier() mirrors html[data-tier]
  soundOn: boolean; menuOpen: boolean; colophonOpen: boolean; rayView: boolean; roomLeft: boolean; shortcutsOn: boolean
  activeChapter: ChapterId
  word: string; chosenHour: number /* default 17 + 20/60 */; cityId: string; cityGuessed: boolean; glass: 'clear' | 'prismatic' /* default 'prismatic' */
  commissionDraft: CommissionDraft | null
  // one setter per field: setReducedMotion, setIntroDone, ... setCommissionDraft
}
export const useApp: UseBoundStore<StoreApi<AppState>>
```

**`src/lib/frame.ts`** (the frame bus; WP0 writes it complete by T+20, WP1 owns it after)
```ts
export type FrameFn = (t: number /* s, ticker time */, dt: number /* s, clamped to 1/30 */) => void
export const frame: {
  scroll: { y: number; max: number; progress: number; velocity: number /* px/s */; direction: -1 | 0 | 1 }
  pointer: { x: number; y: number /* CSS px */; nx: number; ny: number /* NDC, y up */; vx: number; vy: number /* CSS px/s, damped λ 12 */; inside: boolean /* false after the pointer leaves the window or it blurs */; coarse: boolean; lastMove: number /* s */ }
  viewport: { w: number; h: number; dpr: number }     // layout viewport; the canvas size lives in light.viewport
  afterScroll: Set<FrameFn>                           // DOM writes only (4.3)
  renderers: Set<FrameFn>
}
// The SmoothScroll ticker converts GSAP's ms delta once; every listener call is wrapped in try/catch, each failing listener logged once.
```

**`src/lib/light-state.ts`** (mutable, read every frame by passes). Every field has exactly one writer, named here. Every tweenable value is a plain number on a plain object; only the conductor-written `scrims` and `beam` are typed arrays, and nothing tweens them.
```ts
export type ViewMode = 'wall' | 'pane' | 'bench'
export type WordId = 'aslant' | 'ingrid' | 'visitor' | 'commission'
export interface SectionInput { focus: number; wave: number; sunX: number; sunY: number; aberr: number; pointScale: number; driftX: number }  // deltas, all 0 by default
const ZERO: SectionInput = { focus: 0, wave: 0, sunX: 0, sunY: 0, aberr: 0, pointScale: 0, driftX: 0 }
export const light = {
  // ── written only by the conductor (WP2), every frame; nothing tweens these ──
  chapter: 'first-light' as ChapterId, chapterFloat: 0,
  hour: 8 + 10 / 60, hourExact: 8 + 10 / 60,
  modeA: 'wall' as ViewMode, modeB: 'wall' as ViewMode, modeMix: 0, defocus: 0,
  sun: { r: 1, g: 0.77, b: 0.55 /* linear */, e: 1.4, x: 0, y: 0 /* offset, lower-light units */, aberr: 0 },
  cloud: 0,                                  // sin(π·blend) during wall-to-wall blends, else 0 (4.3)
  shade: { r: 0, g: 0, b: 0 /* linear target, 3.1.1 */, u: 0.25, v: 0.62 /* calUv */ },   // WP4's Scene derives uSky from it (6.1.5)
  patch: { x: 0, y: 0, w: 0, h: 0, skew: 0.2, split: 0.22, transom: 0.035, mullion: 0.022, on: 1 },
  lower: { u0: 0, v0: 0.255, u1: 1, v1: 1 },  // patch-local
  wordRect: { x: 0.07, y: 0.2, w: 0.86, h: 0.6 },
  word: { id: 'aslant' as WordId | null, focus: 0, wave: 1, prism: 0 /* 0 clear, 1 prismatic */, pointScale: 1 },
  skirtingY: -1,
  air: 0,                                    // damped scroll velocity for the dust swirl
  scrims: new Float32Array(32), scrimCount: 0,
  beam: new Float32Array(12),                // hexagon, CSS px
  // ── inputs: each written only by its section, folded in by the conductor (4.3) ──
  input: { 'first-light': { ...ZERO }, 'clear-glass': { ...ZERO }, 'the-bend': { ...ZERO }, appointment: { ...ZERO }, 'write-yours': { ...ZERO }, ledger: { ...ZERO }, commission: { ...ZERO }, dusk: { ...ZERO } } as Record<ChapterId, SectionInput>,
  intro: { dawn: 1, form: 1 },               // WP6; set to 0 at boot when the intro will play (full motion, no data-intro="skip", no still), tweened 0 → 1; 1 when skipped or settled
  visitor: { hour: 17 + 20 / 60, alt: 20, prism: 1, valid: 1 },   // WP7 (the configurator)
  // ── section state read directly by passes ──
  pane: { x: 0, y: 0, w: 0, h: 0 },          // WP5 (clear-glass glass rect, CSS px)
  loupe: { x: 0, y: 0, r: 0, knifeX: 0.71, knifeY: 0.71, relief: 0 },   // WP5
  bench: { relief: 0, fan: 0, picked: -1, rotated: 0 },                  // WP5
  ember: { on: 1 },                          // WP10
  rays: { on: 0 },                           // WP2 (RayOverlay mirrors useApp.rayView)
  // ── stage and scene ──
  time: 0, grainSeed: 0,                     // WP1 (stage.ts): advance while not idle, freeze when idle; still mode fixes 0.7 s and 1
  shimmer: 1,                                // WP4 (Scene): 0 when idle, under Still air or with no word in view
  viewport: { w: 1, h: 1, dpr: 1 },          // WP4 (Stage), the canvas CSS size from R3F
  wordVersion: 0,                            // WP4 (stage-api implementation), +1 per applied transport
}
```
Conductor-written fields (never a tween target): `chapter`, `chapterFloat`, `hour`, `hourExact`, `modeA`, `modeB`, `modeMix`, `defocus`, `sun.*`, `cloud`, `shade.*`, `patch.*`, `lower.*`, `wordRect.*`, `word.*`, `skirtingY`, `air`, `scrims`, `scrimCount`, `beam`.

**`src/lib/world-spec.ts`** (WP2; pure, dependency-free except `sun.ts`, `color.ts` and the 5.0 table)
```ts
export type Composition = 'split' | 'stacked'
export type Motion = 'full' | 'reduced'
export type RestMode = 'rest' | 'sticky' | 'end' | 'live'
export interface ChapterState {
  mode: ViewMode; hour: number; restMode: RestMode
  patch: { x: number; y: number; w: number; h: number /* viewport fractions at rest, relative to the sticky frame for sticky chapters */; skew: number; split: number; transom: number; mullion: number; on: number }
  lower: { u0: number; v0: number; u1: number; v1: number }
  sunHex: string; e: number                  // sunAt(hour), before the horizon factor
  shadeHex: string                           // shadeAt(hour)
  word: { id: WordId | null; focus: number; wave: number; prism: number }
  skirtingY: number                          // viewport fraction, -1 hidden
  calUv: [number, number]
}
export function worldSpec(id: ChapterId, local: number, comp: Composition, motion: Motion, visitor: typeof light.visitor): ChapterState
export function sunAt(hour: number): { hex: string; e: number }         // 3.1.2, linear-light interpolation, clamped to 06:00 and 20:40
export function shadeAt(hour: number): string                            // 3.1.1, linear-light interpolation
export function skewFromAltitude(altDeg: number): number                 // clamp(0.10 + 0.45 · (1 - alt / 60), 0.10, 0.60)
export function composition(w: number, h: number): Composition           // split when w ≥ 1024 and w / h ≥ 0.9
export function restModeOf(id: ChapterId, comp: Composition, motion: Motion): RestMode   // the 5.0 table
```

**`src/lib/stage.ts`** (WP0 writes a minimal working version by T+20; WP1 completes it)
```ts
export const stage: {
  requestRender(frames?: number): void
  hold(key: string): void; release(key: string): void
  touch(): void                         // input activity; resets the idle timer
  readonly idle: boolean
  readonly frameMs: number; readonly frameSource: 'gpu' | 'cpu'
  recordFrame(ms: number, source: 'gpu' | 'cpu'): void   // WP4's Stage after each advance; feeds frameMs and the governor
  onFrame(cb: (t: number) => void): () => void    // after each rendered frame
  onQuality(cb: (step: { dpr: number; gpuTier: GpuTier }) => void): () => void   // governor declines (4.1)
  shouldRender(): boolean
}
export function tweenLight(target: object, vars: gsap.TweenVars): gsap.core.Tween   // holds while running; dev-asserts the target is not array-like
```

**`src/lib/boot.ts`** (WP0 writes the working module by T+20; WP1 owns it after)
```ts
export type BootKey = 'fonts' | 'light' | 'shaders' | 'frame'      // weights 0.2, 0.4, 0.3, 0.1
export const boot: {
  report(key: BootKey, value: number /* 0..1, monotonic */): void  // WP3 reports 'light'; WP4 'shaders' and 'frame'; boot.ts watches the fonts itself
  subscribe(fn: (progress: number, parts: Readonly<Record<BootKey, number>>) => void): () => void   // WP6's loader
  readonly progress: number
}
```

**`src/lib/qa-flags.ts`** (WP0 stub by T+20; WP1)
```ts
export interface QaFlags {
  still: ChapterId | 'og' | null; hour: number | null
  tier: GpuTier | null                  // ?tier=0|2|3; anything else ignored
  webglOff: boolean                     // ?webgl=0
  idle: boolean                         // false with ?idle=0
  word: string | null                   // ?word=
  qa: boolean                           // ?qa, always true in development
}
export const flags: QaFlags             // parsed once from location.search on first client import; SSR sees the defaults
export function motion(): 'full' | 'reduced'   // reads html.dataset.motion, set once by the head script; the only motion source for JS
```

**`src/webgl/pass.ts`** (WP0; types only, so it may be imported anywhere)
```ts
import type { WebGLRenderer, IUniform } from 'three'
export interface Pass { init(gl: WebGLRenderer): void; visible(): boolean; render(gl: WebGLRenderer): void; resize(w: number, h: number, dpr: number): void; dispose(): void }
export interface ModeChunk { glsl: string /* defines vec3 shadePane(vec2 fragCSS) or vec3 shadeBench(vec2 fragCSS) */; uniforms: Record<string, IUniform>; update(l: typeof light, dt: number): void }
```
`BenchPass` (WP5), `RayViewPass` (WP2) and `DustPass` (WP4) implement `Pass`; `pane.glsl.ts` and `bench.glsl.ts` (WP5) export a `ModeChunk` each; WP4's `Scene` owns the pass list and order (4.2) and its `Compositor` merges the chunks.

**`src/lib/conductor.ts`**
```ts
export const conductor: {
  exact: { index: number; id: ChapterId; local: number; blend: number }
  smooth: { index: number; id: ChapterId; local: number; blend: number }
  weights: Readonly<Record<ChapterId, number>>          // smooth blend weights (at most two non-zero)
  measure(): void                                         // ends with stage.requestRender(2)
  atRest(id: ChapterId): boolean                          // exact chapter is id, inside its rest interval, blend 0 (commission panel, 5.7)
  sectionProgress(id: ChapterId, lead?: number /* vh, default 0.25 */, trail?: number): number  // (y - top + lead·vh) / (height - (lead + trail)·vh), clamped
  subscribe(fn: (id: ChapterId) => void): () => void    // fires when the exact chapter changes
}
export function initConductor(): () => void
```

**`src/components/providers/SmoothScroll.tsx`** exports, besides the component: `jumpTo(target: string, opts?: { timelapse?: boolean; focus?: boolean | string }): void`, `stopScroll(key: string): void`, `startScroll(key: string): void` (4.7).

**`src/lib/anchors.ts`**
```ts
export interface AnchorSpec { chapter: ChapterId; kind?: 'patch' | 'bench' | 'pane' | 'ember' }
export function registerAnchor(el: HTMLElement, spec: AnchorSpec): () => void
export function restRect(id: ChapterId): DOMRectReadOnly | null
export function liveRect(id: ChapterId): DOMRectReadOnly | null
```

**`src/components/LightAnchor`**: `<LightAnchor chapter={ChapterId} kind?={'patch' | 'bench' | 'pane' | 'ember'} className?={string} word?={string} />`. Renders `<div data-light-anchor={chapter} aria-hidden="true">` plus, in Overcast, the CSS light (and the DOM word when `word` is given).

**`src/webgl/stage-api.ts`**
```ts
export interface Transport { id: string; n: number; targets: Float32Array; density: Float32Array; iters: number }
export interface Relief { slope: Float32Array /* RGBA: slope xy, high-pass xy */; width: 256; height: 128; maxSlopeDeg: number; maxTurnDeg: number; depthMm: number }
export interface StageApiImpl {
  requestTransport(owner: ChapterId, t: Transport): void        // the one transport arbiter (4.3)
  setSlopeField(r: Relief): void
  renderStill(opts: { width: number; height: number; framing?: 'square'; transport: Transport; hour: number; glass: 'clear' | 'prismatic' }): Promise<ImageData>
  info(): { rays: number; bands: number; dpr: number; gpuTier: GpuTier }
}
export const stageApi: StageApiImpl & {
  whenReady(): Promise<void>                     // resolves when the Scene registers
  __register(impl: StageApiImpl): void           // called once by the lazily loaded Scene; queued calls replay in order
}
```
Until the Scene registers, the stub queues `requestTransport`, `setSlopeField` and `renderStill` calls (only the latest transport per owner is kept) and `info()` returns the tier defaults. `setTransport` no longer exists: the Scene decides morph, swap or loosen-swap-reform (4.3).

**`src/lib/caustics/client.ts`** (WP3)
```ts
export function loadBaked(id: 'aslant' | 'ingrid'): Promise<Transport>
export function computeWord(word: string, opts: { n: 32768 | 65536; iters: number; onFrame?: (t: Transport, iter: number) => void; signal?: AbortSignal }): Promise<Transport>
export function computeRelief(t: Transport): Promise<Relief>
export function origins(n: number): Float32Array                  // R2, cached
export function rasterWord(word: string): Promise<Uint8ClampedArray>   // main thread; picks the face per 3.2 and awaits it
export function wordFace(word: string): 'wordmark' | 'sprat' | 'sprat-condensed' | 'geologica' | null   // null = not writable (validation error)
export function rasterReady(): Promise<void>                     // SpratRaster, SpratRasterCondensed and SpratWordmark loaded (boot.ts watches it)
```

**`src/lib/light/sun.ts`** (WP8; dependency-free, erasable TypeScript only, so `node --test` can import it)
```ts
export interface City { id: string; name: string; tz: string; lat: number; lon: number }
export function solarPosition(dateUtc: Date, lat: number, lon: number): { altitude: number; azimuth: number }   // degrees; azimuth from north, clockwise; NOAA general solar position (fractional year); no refraction
export function sunVector(altitude: number, azimuth: number): [number, number, number]
export function angleBetween(a: [number, number, number], b: [number, number, number]): number   // degrees
export function zonedToUtc(y: number, m: number, d: number, hour: number, tz: string): Date     // hour decimal, via Intl offsets
export function localMidsummer(lat: number, year?: number): { y: number; m: number; d: number } // 21 June, or 21 December when lat < 0
export function designWindow(city: City, date: { y: number; m: number; d: number }, hour: number, tolDeg?: number): { start: number; end: number; minutes: number; altitude: number; azimuth: number }
export function seasonSpan(city: City, date: { y: number; m: number; d: number }, hour: number, tolDeg?: number): { first: Date; last: Date; days: number }
export function sunsetToday(city: City, now?: Date): { kind: 'set'; time: string } | { kind: 'polar-day' | 'polar-night' }
export const COPENHAGEN: City     // { id: 'copenhagen', name: 'Copenhagen', tz: 'Europe/Copenhagen', lat: 55.6761, lon: 12.5683 }
export const INGRID: { city: City; date: { y: 2026; m: 6; d: 21 }; hour: number }   // 16 + 40/60
```
Algorithms: `designWindow` scans ±120 minutes at 1-minute steps and keeps minutes where `angleBetween(sun(t), design) ≤ tolDeg` (default 2.5); `minutes = end − start` (20 for the Copenhagen vector; the inclusive count of qualifying 1-minute samples is 21, so an implementation that counts samples fails the vector). `seasonSpan` (must-fix, cost): the UTC offset is computed **once per day** (never once per candidate minute: that would be about 87,000 Intl round-trips per call); starting from the design day it scans outward one day at a time and stops at the first failing day on each side (capped at ±90 days; the span is contiguous in all three vectors); each day's best minute is found coarse to fine, 10-minute steps over ±240 minutes, then ±10 minutes at 1-minute steps around the best; a day counts when its best angle is ≤ tolDeg. A few thousand solar positions per call, about 1 to 2 ms. `sunsetToday` finds the first minute after local noon when altitude < -0.833°. Callers recompute at most once per animation frame (5.5).

**Test vectors (`sun.test.mjs`, must pass to ±0.1° and exact minutes/days):**
| Case | Altitude | Azimuth | designWindow | seasonSpan |
|---|---|---|---|---|
| Copenhagen 2026-06-21 16:40 CEST | 40.20 | 251.71 | 16:30 to 16:50, 20 min | 26 May to 19 July, 55 days |
| Copenhagen 2026-03-20 16:40 CET | 13.16 | 249.19 | 18 min | 14 to 26 March, 13 days |
| Copenhagen 2026-09-29 16:40 CEST | 16.99 | 238.90 | 20 min | 23 September to 5 October, 13 days |
| Sunset 2026-09-29 | Moscow 18:14 · Copenhagen 18:54 · Berlin 18:51 | | | |
(The concept doc's "51 days, 28 May to 17 July" came from a narrower search; this table supersedes it. The copy prints whatever the code computes: 55 days → "eight weeks".)

**`src/lib/light/cities.ts`** (WP8): `CITIES: City[]` and `guessCity(): { city: City; guessed: boolean }` from `Intl.DateTimeFormat().resolvedOptions().timeZone` (no geolocation, ever). Table (id from the name, coordinates to 0.01°):
Copenhagen (Europe/Copenhagen 55.68, 12.57) · Moscow (Europe/Moscow 55.76, 37.62) · London (Europe/London 51.51, -0.13) · Dublin (Europe/Dublin 53.35, -6.26) · Lisbon (Europe/Lisbon 38.72, -9.14) · Madrid (Europe/Madrid 40.42, -3.70) · Paris (Europe/Paris 48.86, 2.35) · Brussels (Europe/Brussels 50.85, 4.35) · Amsterdam (Europe/Amsterdam 52.37, 4.90) · Berlin (Europe/Berlin 52.52, 13.40) · Zurich (Europe/Zurich 47.38, 8.54) · Rome (Europe/Rome 41.90, 12.50) · Vienna (Europe/Vienna 48.21, 16.37) · Prague (Europe/Prague 50.08, 14.44) · Warsaw (Europe/Warsaw 52.23, 21.01) · Stockholm (Europe/Stockholm 59.33, 18.07) · Oslo (Europe/Oslo 59.91, 10.75) · Helsinki (Europe/Helsinki 60.17, 24.94) · Reykjavík (Atlantic/Reykjavik 64.15, -21.94) · Athens (Europe/Athens 37.98, 23.73) · Istanbul (Europe/Istanbul 41.01, 28.98) · Kyiv (Europe/Kyiv and Europe/Kiev 50.45, 30.52) · Tel Aviv (Asia/Jerusalem 32.09, 34.78) · Cairo (Africa/Cairo 30.04, 31.24) · Johannesburg (Africa/Johannesburg -26.20, 28.05) · Dubai (Asia/Dubai 25.20, 55.27) · Delhi (Asia/Kolkata and Asia/Calcutta 28.61, 77.21) · Singapore (Asia/Singapore 1.35, 103.82) · Hong Kong (Asia/Hong_Kong 22.32, 114.17) · Shanghai (Asia/Shanghai 31.23, 121.47) · Seoul (Asia/Seoul 37.57, 126.98) · Tokyo (Asia/Tokyo 35.68, 139.69) · Sydney (Australia/Sydney -33.87, 151.21) · Melbourne (Australia/Melbourne -37.81, 144.96) · Auckland (Pacific/Auckland -36.85, 174.76) · New York (America/New_York 40.71, -74.01) · Toronto (America/Toronto 43.65, -79.38) · Chicago (America/Chicago 41.88, -87.63) · Denver (America/Denver 39.74, -104.99) · Los Angeles (America/Los_Angeles 34.05, -118.24) · Vancouver (America/Vancouver 49.28, -123.12) · Mexico City (America/Mexico_City 19.43, -99.13) · São Paulo (America/Sao_Paulo -23.55, -46.63) · Buenos Aires (America/Argentina/Buenos_Aires -34.60, -58.38).
Unknown time zone → Copenhagen with `guessed: false`.

**`src/lib/light/glass.ts`** (WP0): `GLASS` (constants in 6.1.2), `nAt(glass, nm)`, `dispersionScale(glass, nm)`, `fresnelTransmission(n) = (1 - ((n-1)/(n+1))²)²` (Clear → 0.92363, so "92 of every 100"), `bands(K: 3 | 4 | 8 | 12)` (6.1.2), `PANE = { widthMm: 300, throwMm: 1500 }`.

**`src/lib/format.ts`** (WP0): `fmtClock(hours) → "16:40"`, `fmtDeg(x, digits = 1) → "40.2°"`, `fmtInt(n) → "65,536"`, `fmtDayMonth(date, tz) → "26 May"` (`en-GB`), `weeksWord(days) → "eight"` (`round(days / 7)`, words one to twelve), `fmtMm(x) → "1.9"`.

**`src/lib/color.ts`** (WP0): `srgbHexToLinear(hex): [number, number, number]`, `linearToHex(rgb)`, `mixLinear(a, b, t)`.

**Components owned by WP0 (complete, not stubs):**
- `Button`: `{ href?: string; onClick?: () => void; variant: 'primary' | 'secondary' | 'text'; size?: 'md' | 'sm'; surface?: 'shade' | 'sunlit'; type?: 'button' | 'submit'; disabled?: boolean; busy?: boolean; children }`. Primary on shade: `--c-sun` fill, `--c-umber` label, 48 px high (sm 40), padding 0 22 px, radius 0, `--t-ui`; hover `--c-sun-hi` plus `box-shadow: inset 0 1px 0 #FFF7E6` (light catching the edge), 120 ms; active `translateY(1px)`; focus ring. Primary on sunlit: `--c-umber` fill, `--c-sunlit` label, hover `#2A2F31`. Secondary: 1 px `--c-dust` border, `--c-lime` label, hover border `--c-sun`. Text: `--c-lime` with the link underline (3.1.4). Disabled: 45% opacity. `busy`: label "Sending" and a 1 px bottom light line travelling (commission only).
- `Switch`: `{ checked: boolean; onChange: (v: boolean) => void; label: string; helper?: string; disabled?: boolean; meter?: 'bars' }`. `<button role="switch" aria-checked>`; a 28 × 16 track with a 1 px `--c-dust` border and a 10 px thumb (`--c-sun` when on); with `meter="bars"`, seven 2 × 10 px bars replace the track. 44 px hit area. Label to the left in `--t-ui`.
- `Readout`: `{ label: string; value: string; minCh?: number; id?: string }` with `forwardRef` to the value span, so owners write `ref.current.textContent` without re-rendering. Label `--t-label` `--c-dust`, value `--t-value` `--c-lime`, `tabular-nums`, `min-width: {minCh}ch`.

**Stubs by WP0 (props fixed now):** `Nav {}`, `NavMark { size?: number }`, `Menu {}`, `Loader {}`, `FocusTitle { as?: 'h1'; children: string; className?: string }`, `LightSweep { as?: 'h2'; angle: number; children: string; id?: string; className?: string }`, `ModeSwitches { layout?: 'row' | 'column' }`, `Colophon {}` (exports `openColophon()`), `RayOverlay {}`, `KeyLayer {}`, `Experience { children }`, `LightAnchor` (above), sections without props.

### 7.4 Per-frame wiring (who writes what, in order)
0. Before the ticker callback, GSAP's `updateRoot` has already advanced every tween. Tweens only ever touch section-owned objects (`light.input[*]`, `light.intro`, `light.loupe`, `light.bench`, `light.ember`, DOM styles), never a conductor field (4.1).
1. `SmoothScroll` ticker: Lenis → `readScroll` → `conductor.update(dt)` (the one DOM read phase; reads `light.input`, `light.intro`, `light.visitor`; writes every conductor field listed in 7.3) → `afterScroll(t, dt)` (writes only: readouts, the clock, arc dot, nav mark, favicon, theme colour, audio params; sections that compute inputs from their own state, such as the loupe and the bench, write `light.loupe`, `light.bench` and their `light.input` here, for the conductor's next frame) → `renderers(t, dt)` (Stage `advance`).
2. Section-owned `light` fields, one writer each: hero (`input['first-light']`: pointer sun and touch drift; `intro`), clear-glass (`loupe`, `pane`), the-bend (`bench`), appointment (`input.appointment`: sun-error focus, wave, offset, aberration, drift), write-yours (`input['write-yours']`: loosen and streaming focus; `visitor`), commission (`input.commission`: focus on success), dusk (`ember.on`), ray overlay (`rays.on`). Stage and Scene fields: `time`, `grainSeed` (WP1), `shimmer`, `viewport`, `wordVersion` (WP4). Because the conductor weights each input by its chapter's blend weight, no section needs to hand a field back on exit (4.3).
3. Transports reach the Scene only through `stageApi.requestTransport(owner, t)`; the Scene shows the one `light.word.id` selects (4.3).
4. `Scene` renders the graph (section 4.2) inside WP4's registered `advance`, then calls `stage.onFrame` callbacks.

### 7.5 Scripts and data
- `scripts/bake-light.py` (WP3): `python3 scripts/bake-light.py` writes both `.bin` files in about 5 to 10 s. Reuses the algorithms of `docs/process/concepts/concept-1-light/proto/v2.py` and `v3.py`, with R2 sources and the seeds of 6.1.1.
- `scripts/night-log.mjs` (WP10): runs as `prebuild`; start = the earliest birth time among `docs/process/**` files (00:40:08 tonight); end = the latest modification time among `app/`, `src/`, `public/` files at build time (or the latest git commit time if commits exist and are later); formats both with `Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Moscow', hour: '2-digit', minute: '2-digit' })`; writes `src/content/night-log.json` `{ "start": "00:40", "end": "07:52", "date": "29 September 2026", "zone": "Moscow time" }`. On any error, or if start is not before end, or the dates differ from 29 September 2026, it writes `{}` and exits 0. It never fails the build and never prints a time that did not happen.
- `scripts/capture.mjs` (QA; must-fix: Chrome's `--screenshot` with `--virtual-time-budget` cannot wait for `window.__aslantStillReady`, and virtual time interacts badly with a requestAnimationFrame-driven WebGL page, so posters, the LCP poster, the stills and the OG could be captured before the first frame): launches Chrome (`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome --headless=new --use-angle=metal --enable-gpu --hide-scrollbars --remote-debugging-port=9333 --user-data-dir=<scratchpad>/chrome-profile`) and drives it over the **Chrome DevTools Protocol from Node** (Node 24.3 has a global `WebSocket`; nothing to install): `Emulation.setDeviceMetricsOverride` (W, H, DPR 2), `Page.navigate`, poll `window.__aslantStillReady` with `Runtime.evaluate`, then `Page.captureScreenshot`. Runs against `next start`; converts with sharp (installed with Next) to WebP (quality tuned so each poster is within budget). One browser at a time, closed after each run (7.6).
- **WebKit** (G1 and G2 Safari items): Playwright's builds are already on disk (`~/Library/Caches/ms-playwright/webkit-2359` and `chromium-1243`, matching `playwright-core@1.63.0`, which is in the npm cache index). Before the npm cache is cleaned (7.6) the orchestrator installs it into the scratchpad, never the project: `npm i --prefix <scratchpad>/pw playwright-core@1.63.0 --prefer-offline`. QA runs the WebKit items headed (half-float blending, `ALIASED_POINT_SIZE_RANGE`, SpratRaster drawing, the flick lock) with `webkit.launch({ headless: false })`. Real Safari is recorded as "not run" unless it can be automated (Safari Remote Automation needs sudo and `screencapture` needs Screen Recording permission, and nobody is awake to grant either); no gate waits on it.
- `scripts/check-copy.mjs` (QA): fetches the production HTML and fails on `—`, `–`, banned words (06-anti-slop §4A), more than one `·` per text node, and `background-clip: text` in CSS.
- `scripts/check-contrast.mjs` (QA): for each chapter still, and at 25%, 50% and 75% of every transition, reads the rendered pixels behind every `[data-scrim]` rect (from a JSON the page prints in `?qa` mode; in still mode the text is `visibility: hidden`, so the rects keep their layout) and asserts ≥ 4.5:1 for body text and ≥ 3:1 for headings ≥ 24 px, against the text's own colour token.
- `package.json` scripts (WP0): `dev`, `build`, `start`, `lint`, `typecheck`, `prebuild: node scripts/night-log.mjs`, `test: node --test src/lib/light/sun.test.mjs`, `bake: python3 scripts/bake-light.py`, `capture: node scripts/capture.mjs`, `check:copy: node scripts/check-copy.mjs`, `check:contrast: node scripts/check-contrast.mjs`.

### 7.6 Operational constraints (read before touching anything)
- **The machine (must-fix; measured 03:10 and again 03:45).** An 8 GB M2 with 5.5 of 6.1 GB swap in use, and swap needs free disk. `/System/Volumes/Data` is at 100% with 1 to 4 GB free. `~/.npm/_cacache` holds 6.9 GB of regenerable cache. Next 16.3 writes Turbopack's filesystem cache for dev (`.next/dev/cache/turbopack`; the smoke page alone wrote 58 MB) and, new in 16.3, for build. One ENOSPC or memory-pressure kill would take down the dev server, the builds and the captures together. So:
  1. **Before T+0 the orchestrator** installs Playwright into the scratchpad (7.5; it needs the npm cache), then runs `npm cache clean --force`, which frees about 7 GB and gives swap room.
  2. `next.config.ts` sets `experimental: { turbopackFileSystemCacheForBuild: false }` (7.2).
  3. QA runs `df -g /System/Volumes/Data` and `memory_pressure` every 15 minutes and pauses captures below 1.5 GB free or at a critical pressure level.
  4. Production builds run only at G2, G4 and G5, never while the dev server is compiling.
  5. One browser instance at a time, closed after each check.
  6. Do not install packages into the project; everything needed is already in `node_modules` (three, R3F, GSAP, Lenis, zustand, sharp via Next) or on the machine (Python 3.10 with numpy, Pillow with raqm, fontTools with brotli; Chrome; Playwright's WebKit). Write screenshots to the session scratchpad as JPEG or WebP and delete them after use. If a build still fails with ENOSPC, remove `.next` and retry.
- **Servers:** one shared `next dev` on port 3000 (started by WP0 at T+45 and left running); QA runs production checks with `next build && next start -p 3100` at G2, G4 and G5 only. Nobody else starts servers.
- **Next.js 16:** read `node_modules/next/dist/docs/` for any API you use (fonts, metadata, dynamic, route files). Turbopack is the default bundler; do not add a webpack config.
- **TypeScript strict**, ESLint via `npm run lint`. No `any` in contracts.
- **Lint and R3F idioms (decided now, must-fix).** `eslint-config-next` 16.3 ships `eslint-plugin-react-hooks` 7.1.1 with the React Compiler rules as errors; the scaffold already fails `react-hooks/immutability` (uniforms from `useMemo` mutated in `useFrame`) and `react-hooks/set-state-in-effect`. The pattern is fixed for everyone: passes are plain TypeScript classes that own their materials and uniforms (`Pass`, 7.3) and components hold them in `useRef`, never `useMemo`. In addition, `eslint.config.mjs` sets `react-hooks/immutability`, `react-hooks/refs` and `react-hooks/set-state-in-effect` to `warn` for `src/webgl/**` only. "Lint-clean" at handoff means zero errors; nobody adds disable comments.
- **Git (rollback points).** The orchestrator makes local commits at G0, G1, G2, G3 and G4 (source files only, so they stay small on a full disk; never pushed). Agents never commit. A bad late edit to a shared file is reverted from the last gate commit.
- **Safari checks** (G1, G2): run in Playwright's WebKit, headed (7.5). Frame rate comes from `stage.frameMs` over 300 frames, not from reading an overlay by eye. `open -a Safari` plus `screencapture -x` is not used (no automation or Screen Recording permission tonight).
- **Never** write to another package's files; ask the owner.

---

## 8. Build partition

**Clock:** T = the moment the build agents start (after this revision, about 04:00 Moscow time). The client wakes at about 08:00. Everything below is scheduled against T; the hard end is T+4:45 or 07:45 Moscow time, whichever comes first. If T is late, the orchestrator keeps every gate and starts the cut order earlier (sound first); it never skips a gate.

**Before T+0 (orchestrator):** install `playwright-core@1.63.0` into the scratchpad, then `npm cache clean --force` (7.5, 7.6); confirm at least 5 GB free.

**Agents and packages.** One foundation package, ten parallel build packages with strict file ownership, and one independent QA agent (maker is never judge). File lists are in 7.1; this section states scope, inputs, outputs and acceptance.

| Package | Agent | Window | Depends on |
|---|---|---|---|
| WP0 Foundation | A | T+0 to T+45 (stubs by T+20, including the working frame bus, ticker order, minimal `stage.ts` and `boot.ts`) | nothing |
| WP1 Clock and stage | A (continues after WP0) | T+45 to T+3:00 | WP0 |
| WP2 Conductor and world | B | T+20 to T+3:20 | WP0 stubs |
| WP3 Light transport | C | T+0 to T+2:30 | fonts from WP0 (first 5 min) |
| WP4 Light render (critical path) | D | T+0 to T+3:20 | WP3 bake (T+35) |
| WP5 Optics chapters | E | T+20 to T+3:30 | WP0 stubs; G1 before any GL |
| WP6 Arrival and orientation | F | T+20 to T+3:30 | WP0 stubs |
| WP7 Write yours and sound | G | T+20 to T+3:30 | WP3 worker (T+2:00), WP8 sun (T+1:00) |
| WP8 Time and numbers | H | T+20 to T+3:00 | WP0 stubs |
| WP9 Ledger, commission, light sweep | I | T+20 to T+3:30 | WP0 stubs |
| WP10 Edges | J | T+20 to T+3:30 | WP0 stubs |
| QA and capture | K | T+0 to T+4:45 | everything |

**Rules for everyone.**
1. Build against the stub contracts from T+20; never edit a file you do not own. Need a contract change? Message its owner and the QA agent; the owner decides within 10 minutes.
2. **No shader, pass or compositor work by anyone except WP4 until G1 passes.** Before G1, WP5 builds DOM, layouts, the CPU tracer and fallbacks; WP2 builds the conductor against a mock `light` consumer; WP7 builds the configurator UI and number wiring.
3. Every package ships its own reduced-motion, Overcast and no-JS behaviour and its 390 px layout. QA does not "add fallbacks later".
4. Copy is pasted from this brief verbatim. Numbers come from `glass.ts`, `sun.ts`, the transport client or `stage.info()`.
5. Before handing off: `npm run typecheck` and `npm run lint` clean for your files (zero errors; the R3F pattern and the `src/webgl/**` warnings of 7.6); no `console.log` except the WP10 signature and the `?qa` governor log; no TODOs in shipped code.
6. Every singleton you create (listeners, workers, contexts, registrations) has a module-level guard and a symmetric cleanup (4.1); dev StrictMode mounts effects twice.
7. Copy that depends on the pointer, the tier, motion or Overcast is rendered for every variant in SSR and switched by CSS; values from `Date`, `Intl` time zones or the city guess render after mount (7.2).

### WP0 · Foundation (agent A, first)
- **Scope:** rename `package.json` `name` to `aslant` and add the scripts of 7.5; delete `src/dev/Smoke.tsx`; download fonts, convert Sprat to WOFF2, **generate `Sprat-Wordmark.ttf` at T+0** (WP3 needs it for the bake), subset Geologica and generate `sprat-charset.ts` (3.2); write `tokens.css` (literal 3.7), `globals.css` (reset incl. `font-synthesis: none` and heading weights, type classes, overflow clip, loader and pre-intro CSS gates with failsafes), `fonts.ts`, `layout.tsx` (metadata: title "Aslant · Clear glass that writes in sunlight", description "A proposal for a studio that shapes window panes so the sun spells a word on your wall at the hour you choose.", `metadataBase` from `NEXT_PUBLIC_SITE_URL` or `http://localhost:3000`; `viewport` with `themeColor: '#3A4142'` and no `interactive-widget`; the head script of 4.11; font variable classes on `<body>`; `ReactDOM.preload` of `aslant.bin`), `page.tsx` (the skip link, then the section order of 0.), `next.config.ts` (7.2), `eslint.config.mjs` (7.6), `chapters.ts`, `format.ts`, `color.ts`, `glass.ts`, `gsap.ts` eases; **every contract and stub in 7.3**, of which three are working code by T+20 (revision: the integration core used to start at T+45 on the busiest agent, after the packages that needed it): the frame bus with the fixed ticker order in `SmoothScroll` (about 60 lines), a minimal `stage.ts` (`requestRender`, `hold`, `release`, `touch`, `shouldRender`, `recordFrame`; no GPU timing yet) and `boot.ts`; `pass.ts`; the pane and bench chunk stubs as valid GLSL with the final signatures; the stage-api queue with `__register`; complete `Button`, `Switch`, `Readout`; section stubs that already render their `section` element, id, `data-chapter` and final H2 text; flat `#3A4142` placeholder posters (sharp); `content/night-log.json` = `{}` and a `scripts/night-log.mjs` stub that writes `{}` and exits 0.
- **Outputs:** by **T+20** all stubs compile (`npm run typecheck`), announced to all agents. By **T+45** `npm run build` passes and the shared dev server runs on port 3000 showing every chapter's SSR skeleton on `--c-shade` with the right fonts.
- **Acceptance:** Sprat axes respond (`font-stretch: 185%; font-weight: 30` visibly differs from defaults); the nav wordmark at `font-stretch: 135%; font-weight: 110` matches `Sprat-Wordmark.ttf` rendered in a canvas; Geologica loads with SHRP; the built CSS's extended Geologica face carries its `unicode-range`; no font requests to any third party at build or runtime; no reflex fonts; `html[data-js]` set before paint; `suppressHydrationWarning` on `<html>`; no hydration warnings.

### WP1 · Clock and stage (agent A, after WP0)
- **Scope (revision: Stage integration moved to WP4):** owns the frame bus, `SmoothScroll` (Lenis options, `anchors: false`, the delegated link handler, `jumpTo`, `stopScroll` and `startScroll`, the `motion()` gate; rewrite of the media-query logic, 4.7) and `useReducedMotion.ts`; completes `stage.ts` (idle after 10 s, ambient cadence, `tweenLight` with the array-like assertion, the quality governor of 4.1); `gpu-timer.ts`; `StageRoot.tsx` (WebGL2 plus half-float probe, GPU tier detection, Overcast status through `setWebgl`, the 100lvh host, canvas fade-in after first frame); `boot.ts`; `qa-flags.ts` (4.14, `motion()`) and `window.__aslant`; `Experience` shell; the dev assertion on the ticker listener count.
- **Outputs:** by T+1:15 `jumpTo`, scroll locks, `motion()` and GPU tiers work; by T+2:00 idle, ambient cadence and the governor work; by T+3:00 all flags and QA hooks work.
- **Acceptance (G2 items):** DOM text and canvas never disagree by a frame during a fast trackpad flick (commission lock test) in Chrome and WebKit; idle stops rendering after 10 s (verified: `stage.frameMs` stops updating and the Performance panel shows no GPU work); `?webgl=0`, `?motion=reduced`, `?tier=2`, `?still=first-light` all work; the Still air switch really removes Lenis and every animation; menu jumps play the time-lapse and land focused; wheel over the open colophon never scrolls the page; the governor never declines during a normal read-through with pauses (checked with `?qa`); no second RAF loop anywhere (grep) and exactly two ticker listeners.

### WP2 · Conductor and world (agent B)
- **Scope:** `conductor.ts` (4.3: measurement with the svh probe, rest intervals, sticky geometry from the frame's live rect, the single DOM read phase, exact and smooth state, blends with plateaus, focus pulls, the folding of `light.input`, `light.intro` and `light.visitor`, the passing cloud, scrims with the 0.015 floor, `atRest`, section progress helper, subscribe); `world-spec.ts` (the 5.0 table and every layout table of section 5, per chapter, composition and motion mode, plus `sunAt`, `shadeAt`, `skewFromAltitude`, `composition`, `restModeOf`, 7.3); `anchors.ts` and scrim collection (up to 8 rects, nav always included); `LightAnchor` including the Overcast CSS light (clip-path child, blurred sibling) and its scroll-driven animation (4.11); theme colour follower (4.13); `NavMark` and the live favicon (4.5); ray view: `RayViewPass` and `RayOverlay` (6.6), after G1.
- **Outputs:** by T+1:00 the conductor drives a debug overlay (chapter, local, blend, hour, weights) in the dev server; by T+1:45 the patch travels through all eight chapters with the real renderer, crossing the wall inside the bench-to-appointment pull; by T+3:00 Overcast CSS light complete; ray view last.
- **Acceptance:** the same scroll position gives the same state forward, backward, after an anchor jump and after reload; copy at every chapter's rest sits in stable light (plateaus); the rest geometry matches the 5.0 table at 1440 × 900 and 1280 × 800; no word focus pops at a blend's ownership flip; DOM-locked patches (write-yours stacked, commission, ember) hold within 1 px during flicks on a fine pointer; sticky diagrams and their labels stay registered with the section top at 10vh; the nav mark and the favicon follow the hour; theme colour changes at most 4 times per second.

### WP3 · Light transport (agent C, starts at T+0)
- **Scope:** `scripts/bake-light.py` and the two `.bin` files (6.1.1; `aslant` from `Sprat-Wordmark.ttf`, ink-width sizing); the TypeScript pipeline: `r2.ts`, `bin-format.ts`, `raster.ts` (SpratRaster, SpratRasterCondensed and SpratWordmark FontFaces, the Geologica path, `wordFace`, `rasterReady`, ink-width sizing), `hilbert.ts`, `radix.ts`, `sliced-ot.ts`, `relief.ts` (CG Poisson), `transport.worker.ts` (streaming, chunked yields, cancellation), `client.ts` (7.3; `loadBaked` reports `boot.report('light', …)`); worker bundling check in dev and build.
- **Outputs:** **`aslant.bin` and `ingrid.bin` by T+35** (announce to WP4); `loadBaked` by T+50; `computeWord` streaming and `computeRelief` by T+2:00.
- **Acceptance:** baked and live-computed `aslant` and `Ingrid` look the same in the harness, at the same size (ink width in both); "Фёдор", "Łucja" and "Zoë" rasterise in the right face; live latency on M-series: first streamed frame ≤ 120 ms after the post (so ≤ 300 ms after the last keystroke including debounce), done ≤ 700 ms for 32,768 × 96; a new job cancels the old one within one 8-iteration chunk; relief for `aslant`: steepest slope within 5.7° ± 0.8°, depth as computed (about 4 to 7 mm for a 300 mm pane at a 1.5 m throw; ORCH ruling 05:55, see 10.4 note: the earlier "1 to 3 mm" scaled Ferraro's 100 mm pane and was wrong for ours); the worker never blocks the main thread for more than 4 ms.

### WP4 · Light render (agent D, critical path, starts at T+0)
- **Scope:** `app/dev/light/page.tsx` harness with a stats overlay (median fps over 300 frames, p95 ms, DPR, K, N, RT size); `plaster.ts` (1024² RGB8 tileable fbm: R cloud, G trowel, B cords; generated once at boot, CPU copy kept for calibration); `CausticPass` (6.1.2, bands, caching, tier settings, point-size clamp from `ALIASED_POINT_SIZE_RANGE`, fixed 65,536-ray buffers with draw ranges); `Compositor` + `compositor.glsl.ts` + `wall.glsl.ts` + `common.glsl.ts` (6.1.3: drawn-glass cords, scrims at 0.015 with the feather outside, the cloud dip, skirting, halation, grain, dither, tone mapping, mode mixing with WP5's `ModeChunk`s); `calibrate.ts` (6.1.5, called from the Scene with the actual plaster mean); `patch-math.ts` (patch-local transforms shared with WP2's ray view; type-only three imports); `DustPass` (6.1.6); `Scene.tsx` (render graph and pass order, `stage.onFrame`, `uSky` from `light.shade`, the transport arbiter with morph, swap and loosen-swap-reform, `shimmer`, `wordVersion`); `stage-api.ts` implementation including `renderStill`, registered through `__register`. **Revision: Stage integration moves here from WP1:** `Stage.tsx` (`frameloop="never"`, `flat`, `linear`, DPR by GPU tier and governor steps, `advance` registered in `onCreated` and removed in its cleanup, the redraw triggers of 4.1, `gl.debug.onShaderError`, `compileAsync` of every pass before ready, `stage.recordFrame` with WP1's `gpu-timer.ts`, `light.viewport` from R3F size, context loss and epoch remount, pause when hidden).
- **Outputs:** **G1 at T+1:00, hard stop T+1:30** (6.1.7); the Scene renders inside the real Stage with One Clock by T+1:30; pane/bench chunks from WP5 compiled into the compositor as soon as they land (reload the harness after every drop); `renderStill` by T+2:30; context loss and restore by T+3:00.
- **Acceptance:** G1; the unlit wall within 2 levels of the shade table at each chapter's calibration point; tier-3 GPU ≤ 6 ms per frame through the hero loose phase at DPR 1.75; settled hero re-renders the caustic RT zero times per second (compositor only) and nothing once idle; after 10 s idle a window resize redraws; a deliberate GLSL typo in a chunk sends the page to Overcast instead of black; no pass compiles mid-scroll; `forceContextLoss()` then restore brings the scene back with flat memory; RGBA8 fallback verified by forcing it.

### WP5 · Optics chapters (agent E)
- **Scope:** sections `ClearGlass` and `TheBend` (5.2, 5.3; the-bend's split composition is now the stacked text band over the full-width bench band) with layouts, copy, islands, reduced-motion lists and Overcast and Still air stills; `Loupe.tsx` (pointer, iris, filter direction, touch proxy disc, toggle, readouts); `BenchFigure.tsx` (beats from `sectionProgress`, captions, picking, keyboard, registered to the sticky frame); `bench/trace.ts`; `pane.glsl.ts` and `bench.glsl.ts` `ModeChunk`s (after G1; bicolour schlieren; `HalfFloatType` uploads of the slope field and `uProfile`); `BenchPass` (implements `Pass`).
- **Outputs:** DOM, tracer and fallbacks by T+1:30; GL by T+3:00.
- **Acceptance:** 5.2 and 5.3 acceptance lists; the loupe tracks without lag; the folds read warm on one flank and cool on the other; touch scrolling is never trapped outside the disc; beats exact both directions; WP5 never edits a WP4 file.

### WP6 · Arrival and orientation (agent F)
- **Scope:** `FirstLight` (5.1: lockup, poster `<picture>` with preload of the hero poster only and `opacity: 0` hiding, intro timeline driving `light.intro`, fast-forward on input, pointer sun measured from the patch centre, touch scroll drift, both as `light.input['first-light']`); `Loader` (4.4: SSR markup shown only by the CSS gate, boot subscription, the 6 s failsafe to Overcast, the skip path); `Nav` (the CTA hidden during first-light) and `Menu` (4.5: shutters, focus trap, time-lapse jumps through `jumpTo`, scroll lock, `ModeSwitches` slot); `FocusTitle` (4.8.1, split created only when the intro starts); `ready.ts`.
- **Outputs:** hero, nav and menu complete by T+2:30 against the real renderer; loader by T+3:00.
- **Acceptance:** 5.1 acceptance list; menu fully keyboard operable with focus trap and Esc; the first paint never shows the formed word before the intro; a reload at `/?webgl=0#write-yours` lands at write-yours with no intro and a 450 ms open; the loader never shows a number, opens on input, falls back to Overcast at 6 s if the stage is not ready, and never runs under reduced motion or `?still`.

### WP7 · Write yours and sound (agent G)
- **Scope:** `WriteYours` (5.5): `Configurator.tsx` (fields with the 17:20 and Prismatic defaults, validation against `SPRAT_CHARS` and `GEOLOGICA_CHARS`, debounce, job lifecycle through `client.ts`, `stageApi.requestTransport('write-yours', t)` streaming, `light.visitor` and `light.input['write-yours']`, numbers from `sun.ts` recomputed at most once per frame, result and relief lines, below-horizon hint, mobile keyboard alignment, commission draft and `jumpTo`), `ContourMap.tsx` (2D canvas contours every 0.2 mm from the relief height field), `save-image.ts` (6.4.4, wordmark from `SpratWordmark`); `audio/ambient.ts` (4.10) and the "Hear the light" switch.
- **Outputs:** UI and numbers by T+1:30 (with a mocked transport); live transport by T+2:30; save image by T+3:00; sound last.
- **Acceptance:** 5.5 acceptance list; latency table 6.4.2 measured with `performance.mark` in Chrome and WebKit; INP < 200 ms while dragging the hour; audio never starts without a click and stays under −18 dBFS.

### WP8 · Time and numbers (agent H)
- **Scope:** `sun.ts` and `sun.test.mjs` (7.3 test vectors and the per-day offset, outward scan and coarse-to-fine algorithm) by **T+1:00**; `cities.ts`; section `Appointment` (5.4): the full-width clock over the mirrored split, `Clock.tsx` (digit slots), `SunArc.tsx` (SSR path + live dot), bullet-time mapping, focus from true sun error written as `light.input.appointment`, `stageApi.requestTransport('appointment', ingrid)`, Line A that stays and Line B beneath it, readout, stacked layout, reduced-motion static state.
- **Acceptance:** `npm test` passes all vectors, including `designWindow().minutes === 20`; one `seasonSpan` call takes under 2 ms; 5.4 acceptance list; the clock never jitters horizontally (slots).

### WP9 · Ledger, commission, light sweep (agent I)
- **Scope:** `LightSweep` (4.8.2) by T+1:00 (used by WP5, WP8 and itself); sections `Ledger` (5.6, revised copy) and `Commission` (5.7: the mirrored split, mode-dependent sub, note and submit copy, the `::before` fade to 10% while `conductor.atRest('commission')` on a fine pointer, the DOM-owned penumbra on native scroll, the computed window hint) with `CommissionForm.tsx` and `commission.ts` (three modes, validation with the same charset rules as write-yours, honeypot, prefill, success word request via `client.ts` and `stageApi.requestTransport('commission', t)`).
- **Acceptance:** 5.6 and 5.7 acceptance lists; the form never fakes a confirmation; `background-clip: text` appears nowhere.

### WP10 · Edges (agent J)
- **Scope:** `Dusk` footer and `Epilogue.tsx` (5.8, 6.5: the visible caption, the seconds countdown, the scroll lock); `Colophon` dialog (the new lines, `<q>` in `<cite>`, the tier in the live line, the "Keyboard shortcuts" switch, `data-lenis-prevent` and the scroll lock); `ModeSwitches` (4.11, reload implementation, the three helpers); `KeyLayer` (R, L, Esc routing, gated by the shortcuts switch, leave-the-room, console signature); `app/not-found.tsx` (no light, CSS skirting); `app/icon.svg` (32 × 32 viewBox: a `--c-shade` square with a `--c-sun` parallelogram, lower edge shifted right) and `apple-icon.png`; `scripts/night-log.mjs` (7.5).
- **Acceptance:** 5.8 acceptance list; night-log exits 0 in every failure case and prints only real times; switches state the current mode truthfully and say what they do; L and R never fire while typing or with shortcuts off.

### QA and capture (agent K; owns only `scripts/capture.mjs`, `scripts/check-copy.mjs`, `scripts/check-contrast.mjs`, `public/posters/*`, `app/opengraph-image.png`, `app/opengraph-image.alt.txt`)
- **T+0 to T+1:00:** write the three scripts (capture over CDP, 7.5); prepare the evidence folder in the scratchpad; verify disk space and memory pressure (then every 15 minutes, 7.6).
- **Gates:** run and record G1 to G5 (below) with evidence (screenshots, numbers, browser, DPR). Route failures to owners with the smallest reproducible description. Reload the G1 harness after every WP5 chunk drop.
- **Captures (after G2, again after G4):** `hero-desktop.webp` (1920 × 1200, ≤ 120 KB), `hero-mobile.webp` (780 × 1688, ≤ 90 KB), `relief.webp` (≤ 80 KB), `bench.webp` (the band's aspect, ≤ 80 KB), `opengraph-image.png` (1200 × 630 from `?still=og`; alt text: "A slant of sun on a grey wall with the word aslant made of light."). If the OG capture fails by T+4:15, render it with `app/opengraph-image.tsx` (Satori: the hero poster JPEG as background and `aslant` in `Sprat-Wordmark.ttf`, the one wordmark drawing), and tell the owner of `app/`.
- **Final report:** the checklist of section 9, each row marked pass, fail or not run, with evidence. Never mark a check that was not run.

### Gates
| Gate | When | Pass condition | Verified by |
|---|---|---|---|
| G0 | T+20 | All stubs compile; contracts published; the frame bus, minimal stage and boot run; orchestrator commit | WP0, QA |
| G1 | T+1:00 (hard stop T+1:30) | 6.1.7: look parity in Chrome and WebKit; ≥ 55 fps loose phase at DPR 1.75; WebKit half-float, point clamp and canvas fonts verified; orchestrator commit | WP4, QA |
| G2 | T+2:00 | Whole page scrolls through all 8 chapters with final copy and the 5.0 composition rhythm; One Clock zero-lag flick test (commission lock, Chrome and WebKit); reverse scroll and reload mid-page recreate state; idle 10 s then resize redraws; the-bend at 10vh stays registered; no horizontal overflow; first-load JS grep clean; `next build` passes; orchestrator commit | WP1, WP2, WP4, QA |
| G3 | T+3:00 | Signature moments work: formation, loupe, bench beats, appointment bullet time, write-yours live streaming and save image (Latin, Cyrillic and Central European words), commission modes and lock, epilogue; orchestrator commit | all, QA |
| G4 | T+3:30 | Feature freeze: Still air, Overcast, no-JS and 390 px complete; keyboard walk passes; `next build` passes; orchestrator commit | all, QA |
| G5 | T+4:30 | Release candidate: section 9 checklist green or explicitly waived; posters and OG in place; production build clean | QA |

**Cut order if behind** (from the top; never cut the core): 1. sound (all of it) → 2. ray view → 3. dust motes → 4. contour map → 5. bench ray picking (keep the central ray) → 6. save-image caption bar (keep a plain render) → 7. the afterimage epilogue (keep the ember) → 8. bullet time (linear clock) → 9. light sweep (plain fades) → 10. the loupe (keep the relief toggle and still).
**Never cut:** One Clock; the hero formation; the room calibration; write-yours live transport; the commission form and its honest modes; reduced-motion, Overcast and no-JS designs; the 390 px compositions.

**Final steps (orchestrator, after G5; must-fix order).** Renaming the folder that every session is rooted in breaks each agent's working directory (it is reset to `untitled11` between calls), and `.next` holds absolute paths, so everything happens **before** the rename and the rename is the last command of the night:
1. Stop the dev server.
2. Write `docs/MORNING.md`: one paragraph for the client (what was built, how to run it with `npm run dev` or `npm run build && npm run start`, the fiction flags, the env vars that switch the form mode), plus one line: "If `.next` is missing, run `npm run build` once."
3. Run the last full build and checks in place (`npm run build`, `npm run typecheck`, `npm run lint`, `npm test`), and make the final local commit.
4. Rename `.idea/untitled11.iml` → `.idea/aslant.iml` and update `.idea/modules.xml` (still inside the old path).
5. The single final command, absolute paths, nothing after it: `mv /Users/fedor/WebstormProjects/untitled11 /Users/fedor/WebstormProjects/aslant && rm -rf /Users/fedor/WebstormProjects/aslant/.next && cd /Users/fedor/WebstormProjects/aslant && npm run build`. With Geologica self-hosted (3.2) this build needs no network. If it fails, the handoff is still complete: `MORNING.md` already tells the client how to build.

---

## 9. Performance budget and QA checklist

### 9.1 Budgets
| Metric | Target | How measured |
|---|---|---|
| Hero loose phase (worst overdraw) | ≥ 55 fps sustained, Chrome and WebKit, M-series, DPR 1.75 | `stage.frameMs` in the harness, 300 frames, median and p95 |
| Scrolling anywhere | median frame ≤ 16.7 ms, p95 ≤ 22 ms, no long task > 50 ms after load | Chrome Performance panel, 10 s trackpad scroll through the page |
| GPU per frame, tier 3 | caustic ≤ 1.5 ms settled-change / ≤ 3 ms loose, compositor ≤ 2.5 ms, dust ≤ 0.2 ms, bench ≤ 0.3 ms; total ≤ 6 ms | `EXT_disjoint_timer_query_webgl2` where available |
| GPU per frame, tier 2 | ≤ 8 ms at DPR 1.35 | same, on a throttled profile or phone |
| JS main thread per frame | ≤ 3 ms (GSAP + Lenis + conductor + readouts); one layout pass per frame at most (4.3) | Performance panel |
| Idle (10 s without input) | 0 rendered frames; CPU near 0 | `stage.frameMs` frozen; Performance panel |
| Ambient-only frames | ≤ 60 per second on a 120 Hz display (4.1) | `?qa` frame counter |
| LCP | ≤ 1.5 s warm, ≤ 2.0 s cold (desktop, production build, local) | Lighthouse / web-vitals |
| CLS | ≤ 0.01 (fixed aspect boxes, Sprat `display: block` with no fallback reflow, Geologica's adjusted fallback) | Lighthouse |
| INP | < 200 ms (typing and dragging the hour in write-yours included) | web-vitals |
| First-load JS | ≤ 350 KB gzip (three and R3F load after first paint and are excluded from the initial route chunk; drei is not imported) | `next build` output; grep of the initial chunks for `WebGLRenderer` finds nothing (7.2) |
| Initial transfer | ≤ 1.2 MB (fonts about 100 KB: Sprat about 50 KB plus the 47 KB Geologica Latin subset; hero poster ≤ 120 KB; `aslant.bin` 328 KB, uncompressed on the wire because `next start` does not compress `application/octet-stream`; JS) | network panel, cold |
| Worker | first streamed frame ≤ 300 ms after the last keystroke; settled ≤ 1.2 s | `performance.mark` |
| Memory | `renderer.info.memory` flat after 10 context remounts and a full forward and back scroll | `window.__aslant.info()` |
| Posters | ≤ 120 KB each (hero), ≤ 90 KB (mobile), ≤ 80 KB (stills) | file sizes |

### 9.2 Viewports (every check at each)
Desktop 1440 × 900 · laptop 1280 × 800 · tablet 834 × 1194 (portrait, stacked composition) · mobile 390 × 844 · small mobile 360 × 740 (overflow and hero fit only).

### 9.3 QA checklist (QA marks each row pass, fail or not run, with evidence)
**Look and concept**
- [ ] G1 passed in Chrome and WebKit (side-by-side with the reference images); real Safari marked "not run" unless automated.
- [ ] The room reads as a room at every chapter: limewash mottling visible across the shade, window-side falloff, skirting in hero and dusk.
- [ ] The word is the brightest thing in the hero frame: the plain upper light's p99 luminance ≤ 215 and no channel's p99 above 235, with horizontal cords visible; the word pane is visibly darker than the plain pane around the letters; the nav's "Commission a pane" is hidden in the first frame; the nav wordmark and the formed word are one drawing.
- [ ] Composition rhythm (5.0): a 10 s scroll capture at 1440 × 900 shows light right, right, bench band, full-width clock with light left, left, full-width band, left, ember; never more than two splits in a row; the patch crosses the wall only inside the bench-to-appointment pull.
- [ ] Each back-half chapter visibly changes the light and the composition (appointment drift and focus, write-yours at 17:20 in Prismatic, ledger band, commission lock on textured lit plaster, dusk ember).
- [ ] Blind distinctiveness score (06-anti-slop §3) ≥ 8.5 overall, no act below 7, no automatic cap triggered.

**Motion and sync**
- [ ] One ticker only (grep: no other `requestAnimationFrame` loop, no `frameloop="always"` or `"demand"`, no second smooth-scroll engine, no `normalizeScroll`); dev assertion: exactly two ticker listeners.
- [ ] Zero-lag flick: commission panel and patch locked within 1 px in Chrome and WebKit.
- [ ] Reverse scroll, anchor jumps, menu jumps and reload mid-page recreate identical states; a reload at a hash skips the intro.
- [ ] Tweens never target conductor fields (grep `tweenLight` targets; the dawn ramp is visible in the first 700 ms).
- [ ] No word focus pops when the exact chapter flips mid-blend; the appointment-to-write-yours word change loosens, swaps and re-forms under the passing cloud.
- [ ] H1 focus-in used once; blur on nothing else; body copy never translates or blurs.
- [ ] No bounce, elastic or back easing (grep); the four named eases only.
- [ ] Idle after 10 s stops rendering; resumes on input within one frame; after 10 s idle a window resize redraws the frame (no black canvas).
- [ ] The quality governor does not decline during a 2-minute read-through with pauses on the M2 (`?qa` log).

**Accessibility**
- [ ] Keyboard walk: skip link, nav, menu (trap, Esc, jumps land focused on the chapter heading), hero CTAs, loupe toggle, bench figure (arrows), write-yours controls, save, commission form, footer links, switches, colophon (Esc, the shortcuts switch), epilogue, R and L keys; visible focus everywhere.
- [ ] Screen reader spot check (VoiceOver, WebKit or Safari if available): one H1, H2 per chapter and each H2 makes sense alone, the H1 read once, live regions announce the result and form status, the hero poster's alt is in the tree, canvas silent.
- [ ] Contrast from rendered pixels (`check:contrast`) at every chapter's set hour: body ≥ 4.5:1, headings ≥ 3:1, no failures during transitions sampled at 25%, 50%, 75% (scrim floor 0.015, 4.3).
- [ ] Reduced motion (OS setting and `?motion=reduced`, both): no loader, no Lenis, no formation, no shimmer or dust, sticky chapters stacked, relief and bench posters shown, the light still follows the scroll, all content present, epilogue works; no `gsap.matchMedia` or `prefers-reduced-motion` media query in the code (grep).
- [ ] Zoom 200%: no clipped text, sticky frames fall back to static.
- [ ] Touch targets ≥ 44 px; no hover-only information.

**Fallbacks**
- [ ] Overcast (`?webgl=0` and WebKit with WebGL disabled): posters, CSS light (with its penumbra) with scroll-driven motion where supported, relief and bench stills, write-yours note, zero console errors.
- [ ] A forced shader error and a Stage chunk that never loads both end in Overcast, never a black or unlit page.
- [ ] `forceContextLoss()` → poster and CSS light → restore → scene back, no memory growth.
- [ ] No JS: all copy readable in order, nothing hidden (no loader, no hidden H1), the form renders in its configured mode, the nav CTA is visible.
- [ ] `?still=` routes render every chapter and `og`; stills are captured over CDP after `__aslantStillReady`.

**Mobile (390 × 844)**
- [ ] No horizontal overflow on any section, at every viewport and in Overcast: `document.documentElement.scrollWidth === document.documentElement.clientWidth` (the ledger band and the skewed commission panel included).
- [ ] Hero composition as specified; word re-forms with the scroll drift.
- [ ] Clear-glass: page scrolls everywhere except the loupe disc; toggle is primary; the loupe does not sample black (half-float upload).
- [ ] The bend rotated; appointment stacked fits one screen; write-yours keeps preview and input above the keyboard and the sections do not reflow when it opens.
- [ ] The canvas does not flash or jump when the toolbars collapse (100lvh host); the commission panel shows no swimming canvas edge under touch scroll.
- [ ] GPU tier 2 active on touch devices; DPR ≤ 1.35.

**Copy and honesty**
- [ ] `check:copy`: no em or en dashes, no banned words, at most one middle dot per line, no `background-clip: text`; negation-then-affirmation appears exactly twice (2.4, un-ban 6).
- [ ] Every number rendered from code (spot-check: 92 of 100, 16:30 to 16:50, eight weeks, 40.2° and 252°, 65,536 or 32,768 rays, sunset time, the window hint for Sydney at 12:00).
- [ ] No testimonials, logos, press, prices, fake metrics; the honesty sentence in footer and colophon; the colophon fiction list (with Ingrid's birth time); the making log shows real times or nothing; the 2027 ledger row says "proposed".
- [ ] The form never says "Thank you" without a 2xx response; preview mode says "Nothing was sent."; the preview-mode sub and note do not contradict each other.
- [ ] No sunset time or city guess in the prerendered HTML (they appear after mount).

**Build and hygiene**
- [ ] `npm run build`, `npm run typecheck`, `npm run lint` (zero errors), `npm test` pass; no hydration warnings.
- [ ] Console clean on a fresh tab in Chrome and WebKit (the console signature is the only log).
- [ ] Favicon (live, follows the hour), apple icon, OG image with alt, theme colour, `::selection`, caret, scrollbar, focus ring themed.
- [ ] The 404 page renders in the concept's language: no light, the skirting board, no skip link.
- [ ] No unused imports, no dead files (`src/dev/` gone), no TODOs; nothing imports drei.
- [ ] `package.json` name `aslant`; `MORNING.md` written and the final build run before the rename; the rename is the last command.
- [ ] Disk and memory log (every 15 minutes) attached to the final report.

---

## Appendix A · Must-fix traceability

| Must-fix (source) | Where it is fixed |
|---|---|
| Length and scope: 7 beats in ≤ 9 viewports; bend ≤ 150%, appointment ≤ 160%, merged ledger, dusk as footer (jury) | 0 (table), 5.3, 5.4, 5.6, 5.8 |
| The room reads as a room: raise skylight, mottling everywhere, falloff, one architectural cue, recalibrate shade, recompute pairs (jury) | 2.3, 3.1 (new `#3A4142`, all pairs), 3.1.1, 6.1.3, 6.1.4, 6.1.5 |
| Plain upper pane physics: ripple, penumbra, mullion and transom shadows, falloff, dust only in the beam, below clipping (jury) | 3.1.2, 5.1, 6.1.3, 6.1.6 |
| Critical-path gate measured by T+60 in Chrome and Safari, ≥ 55 fps loose phase, point cap and 768 RT allowed; no other WebGL before it (jury, techdir) | 6.1.7, 8 (rule 2, G1) |
| Live transport latency ≤ 300 ms start, ~1.2 s settle, radix sort, 32k rays, stream every 8, cancel stale, never blank (jury) | 5.5, 6.4.1, 6.4.2, WP3 acceptance |
| Focus-in blur used once, optical, ≤ 8 px; others light sweep or 400 ms fade; body never blurs (jury) | 4.8 |
| Honest conversion: endpoint, mailto or explicit preview; fiction flagged in the colophon (jury, techdir, heart) | 1.2, 1.5, 5.7, 5.8 colophon |
| Mobile: only the loupe disc captures touch; toggle primary on touch; touch hero scroll drift; write-yours above the keyboard (jury) | 5.1, 5.2, 5.5 |
| Legibility: Sprat wght ≥ 40 under 48 px; hairlines only clock and years; ≤ 2 live readouts; text never over the moving patch, verified by screenshots (jury) | 3.2, 4.3 (scrims, plateaus), each chapter's readouts, 9.3 contrast row |
| Back-half monotony: each late chapter changes light and composition (jury) | 5.0 (composition rhythm), 5.4 to 5.8, 9.3 look rows |
| Idle cost: on-demand after 10 s, frozen grain, pause hidden, true frame-time line (jury, techdir) | 4.1, 5.8 colophon line |
| Afterimage must actually happen: small ember patch ~2°, fixation mark, 15 to 20 s hold, mid-grey field, one flash-safe switch (jury) | 5.8, 6.5 (18 s, neutral `#8C8C8C`) |
| One Clock first: `frameloop="never"`, `advance()` after Lenis and ScrollTrigger, dirty flag, zero-lag flick gate (techdir, heart) | 4.1, WP1, G2 |
| Posters from the live shader, AVIF/WebP ≤ 120 KB, preload only the hero; H1 LCP ≤ 1.5 s; CLS ≈ 0 (techdir) | 4.11, 5.1, 8 QA captures, 9.1 |
| Making log true, derived from real file times, never fails the build (techdir, heart) | 1.5, 5.8, 7.5 night-log |
| Switches reliable: reload with query flags instead of hot-patching (techdir) | 4.11 |
| No monospace; live data in the text face with tabular figures (techdir graft from aslant) | 3.2 |
| Calibrate the tone-mapped shade to the token within 2 levels; multiplicative lighting (heart) | 3.1.3, 6.1.3, 6.1.5, G1 |
| Rename the project and every surface: folder, package name, metadata, OG from our shader, favicon mark, console line (heart) | 1.1, 8 (WP0, WP10, final steps), 4.13 |

Note (revision): no verdict from the Awwwards-jury judge was recorded (10.1), so the "(jury)" tags above cannot be traced to a third judge; read them as must-fixes the synthesis wrote under the jury's lens. The review round changed how several rows are met (Safari checks now run in Playwright's WebKit; the upper light is capped at p99 luminance 215; scrims now floor at 0.015); section 10.4 lists those changes.

## Appendix B · Grafts

**Adopted:** Ray view on R (5.8, 6.6) · light-sweep headings (4.8) · sticky frames instead of pins (5.3, 5.4) · copy only in stable light with compositor scrims (4.3) · save-the-image as a designed artifact (6.4.4) · bullet time in the appointment (5.4) · `?still`, `?tier`, `?motion`, `?webgl` routes (4.14) · live nav mark (4.5) · theme colour follows the light (4.13) · Overcast and Still air switches with a truthful mode line (4.11) · true making log (7.5) · render only when something changes (4.1) · honesty sentence (1.5) · CSS scroll-driven fallback light (4.11) · "Hear the light" sound in write-yours (4.10, 5.5) · leave the room on L (4.13) · menu jumps as time-lapses (4.5) · ±0.5/255 dither against banding (4.9) · the visitor's own sky in one true line, no permission prompt (5.8 sunset line) · no-monospace rule (3.2).
**Declined:** OG rendered by Satori as the primary path (we capture our own renderer; Satori is only the fallback) · in-place remounting for mode switches (reload is safer tonight) · a separate "fallbacks" chapter (the switches live in the menu and footer instead, keeping the page at eight beats).
Sources of each graft are in 10.3.

---

## 10. Decision log

### 10.1 The tournament
Six research dossiers (`docs/process/01` to `06`: trends, award winners, type and colour, techniques, the skill rulebook, anti-slop) fed six concepts, one per direction. Three judges were briefed to score every concept from 0 to 100 through different lenses: an Awwwards jury member (Design 40%, Usability 30%, Creativity 20%, Content 10%); a technical director who must ship tonight with parallel agents (feasibility at elite polish, performance risk, robustness, scope control; reward the best ambition-to-risk ratio); and a creative director judging emotional impact and originality ("heart": the first five seconds, memorability, freshness against 2026 trends, coherence, whether the sleeping client would be moved). The ranking is the sum of the scores.

**What the record holds.** The workflow journal has verdicts from two judges. The Awwwards-jury judge's run ended without returning scores, so the aggregate is the technical director plus heart, and Appendix A's "(jury)" tags cannot be traced to a recorded jury verdict.

| Rank | Concept (slug) | Direction | Techdir | Heart | Total | First choice of |
|---|---|---|---|---|---|---|
| 1 | Aslant (`aslant`) | Light and optics | 80 | 89 | **169** | nobody; second for both judges |
| 2 | Intempesta (`intempesta`) | The night itself | 85 | 79 | 164 | techdir |
| 3 | Nightnoon (`nightnoon`) | Wildcard: a total solar eclipse | 60 | 92 | 152 | heart |
| 4 | Overtide (`overtide`) | Time and sound | 68 | 82 | 150 | |
| 5 | OMBRA (`ombra`) | Typography as architecture | 59 | 70 | 129 | |
| 6 | Ardora (`ardora`) | Living matter | 55 | 73 | 128 | |

### 10.2 Why Aslant won
It is the only concept both judges put in their top two, and the only one whose hardest part was already proven:
- **Proof of look from the production pipeline.** The hero and formation references are the output of a numpy prototype of the exact sliced-optimal-transport caustic pipeline, not mocks. Techdir: "highest visual ceiling of the six"; heart: "the best-proven look".
- **A participatory moment that is new, and is also the conversion and the share loop:** watching the glass compute your own word until it forms in sunlight, with true timing for your city.
- **A specific, tender human core** ("Every afternoon at 16:40, the kitchen wall says her name.") and a closing beat heart called the most beautiful of the six: the afterimage your own eye makes.
- **Coherence:** one room over one day; the type widens as the sun lowers; focus and defocus are the whole motion language.

Why not the others. Intempesta was the most feasible and speaks directly to the sleeping client, but its skin (hairline Didone, mono labels, one ember accent on near-black, star trails) sits on the 2026 escape-hatch aesthetic and the starfield tell. Nightnoon had the highest ceiling for heart, but neither of its two shader systems had any proof of look, and at about 1,290vh with long pins it was the heaviest build (techdir: "the most likely to ship half-broken"). Overtide's true idea is brilliant, but its payoff sits behind opt-in audio. OMBRA's hero read as the 2013 long-shadow effect. Ardora's fluid sparks are the most-forked WebGL demo on the web (anti-slop #4 and #47).

The judges' risks for Aslant, and where the brief answers them: the widest bespoke surface and an optimistic critical path (G1 at T+1:00 on a Python bake, the fallback ladder, the cut order); the live transport in a worker (radix sort, streaming, cancellation, latency gates in WP3); a thin back half (5.0 and 5.4 to 5.8); nine chapters (eight beats in about nine viewports); a static hero that could screenshot like a luxury dark template (the recalibrated room, the word as the brightest thing, one sun-filled rectangle in the first frame); shimmer and dust that never idle (render on dirty, the 10 s idle).

### 10.3 Grafts adopted, with their sources

| Graft | From | Where |
|---|---|---|
| Render only when something changes; zero GPU when idle | intempesta, ombra | 4.1 |
| A true making log derived from file times | intempesta | 1.5, 5.8, 7.5 |
| Theme colour follows the light | intempesta | 4.13 |
| A live nav mark (now also the live favicon) | intempesta | 4.5 |
| Mode switches as content, with a truthful mode line, implemented as reloads | intempesta ("Before light"; reloads per techdir) | 4.11 |
| The menu opens from a slit at the mark (aperture grammar) | intempesta | 4.5 |
| Save the image as a designed artifact with a caption bar | intempesta ("Keep this exposure"), nightnoon (the ticket) | 6.4.4 |
| Bullet time in the appointment | nightnoon (time dilation at the climax) | 5.4 |
| Menu jumps as time-lapses | nightnoon | 4.5 |
| ±0.5/255 dither against banding | nightnoon | 4.9 |
| `?still` capture routes and query hooks | nightnoon, ombra | 4.14 |
| The honesty sentence | nightnoon, intempesta ("a design study") | 1.5 |
| Light-sweep headings at the chapter's true light angle | ombra | 4.8 |
| A hidden layer that doubles as the QA overlay (the ray view on R) | ombra (construction lines, exposure data) | 4.13, 6.6 |
| The visitor's own sky in one true line, no permission prompt | ombra (proposed by both judges) | 5.8 |
| Sticky frames instead of pins | overtide | 5.3, 5.4 |
| CSS scroll-driven light for the no-WebGL tier | overtide | 4.11 |
| One contextual sound opt-in inside the participatory chapter ("Hear the light") | overtide (heart's "Hear the hush") | 4.10, 5.5 |
| Text scrims: the light respects text boxes (floor now 0.015) | ardora (obstacle scrim) | 4.3 |
| Leave the room on L | ardora ("put the page to bed") | 4.13 |

Kept from Aslant itself (the judges wanted the other concepts to borrow these): the proof-first G1 gate, calibration discipline (a hex twin for every shader token, the shade within 2 levels), no monospace, multiplicative lighting.
Not adopted: overtide's "stillness develops the image" (it conflicts with the 10 s idle freeze and zero idle cost); ardora's "the page remembers you" (the nav mark carrying the visitor's exposure); ardora's primary-source quote (the ledger already carries primary history); Satori as the primary OG path; in-place remounting for mode switches; a separate fallbacks chapter.

### 10.4 Review round (this revision)
Two reviewers read the first brief blind: art and copy, and engineering. They raised 52 issues: 4 critical, 24 major, 24 minor. All 52 are applied. The art reviewer scored the first brief about 8 (concept 9.5, composition 6.5, copy 8.5, type 8.5), and about 9 with the fixes. The engineering reviewer confirmed the maths and library APIs and put the risk in the machine, the integration seams and runtime orchestration.
- **Composition:** the light crosses the wall at noon inside the bench-to-appointment pull; the-bend became a stacked band; appointment, write-yours and commission are mirrored (5.0).
- **Legibility:** scrim floor 0.3 → 0.015 with the feather outside the text, plus a passing cloud during wall-to-wall blends; `--c-dust` `#BCC3BE`; contrast recomputed in linear irradiance through ACES.
- **Hero:** the 08:10 sun at 1.4, upper light p99 luminance ≤ 215, drawn-glass cords, split 0.22, the nav CTA hidden in the first frame; one wordmark drawing (`Sprat-Wordmark.ttf`, wdth 135, wght 110).
- **Copy:** the human reason in visible copy (Line A stays, Ingrid's birth minute, the nursery and the hall); commission copy that holds together in preview mode; the epilogue caption and countdown; colophon lines; ledger honesty; clearer headings, menu label and switch helpers; the two licensed reveals.
- **Engineering:** contracts for the frame bus, `ChapterState` and the world-spec helpers, boot, qa-flags, `Pass` and `ModeChunk`, stage-api registration and the transport arbiter; section inputs, so tweens never fight the conductor; the integration core in WP0 and Stage integration in WP4; a quality governor instead of drei's monitor; redraw triggers; an SSR-first loader and the intro skip; one motion source; Cyrillic and Central European words through Geologica; failure paths to Overcast; hydration rules; the bundle boundary; half-float uploads; DOM-owned registration on native scroll; the machine (npm cache, Turbopack build cache, monitoring, builds at G2, G4 and G5), CDP captures and Playwright's WebKit, a commit at every gate, and the rename as the last command.

Where the brief refined a reviewer's fix (nothing was rejected):
- Governor: it samples runs of consecutive rendered ticks instead of discarding gaps over 1.5 refresh periods, which would also discard genuinely dropped frames.
- Loader under `data-intro="skip"`: still shown, opening in 450 ms; the suggested selector would have hidden it, contradicting the same fix's "450 ms open".
- Passing cloud: on by default rather than conditional.
- The upper-light rule is written as p99 luminance ≤ 215 (the reviewer's pixel samples were luminance; per channel, red sits near 224).
- Window hint: "does not reach" rather than "never reaches" (the sentence describes one moment); the ledger's "Time" row is shortened so it does not echo the new H3.
- Words outside Sprat are rasterised in Geologica rather than rejected (the client may type his own name in Cyrillic), and Geologica is self-hosted from two subsets, which also removes the build's network dependency.
- The overflow check compares with `clientWidth`, not `innerWidth` (which includes a classic scrollbar).

Verified during the revision, with tools, tonight: the contrast pairs and the 0.015 floor, using the compositor maths of 6.1.3; the upper light at `E_sun` 1.4 (p99 luminance about 214); the wordmark instance (29,920 bytes); the Geologica subsets (47 KB and 77 KB WOFF2, all four axes, `tnum` in the Latin one); Sprat's 225 code points with no Cyrillic; the Turbopack cache key in the Next 16.3.6 docs; the 6.9 GB npm cache with `playwright-core@1.63.0` in its index. Not verified: the governor thresholds and the passing-cloud look, which G2 decides on real frames.
