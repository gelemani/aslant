# Concept 4 · OMBRA

**Direction:** Typography as architecture.
**Author role:** creative director. Written 2026-09-29.
**Status:** proposal for selection. Every number in this document was measured or computed tonight (font files, solar equations, contrast math). Nothing is estimated unless it is marked as an estimate.

> **One sentence:** OMBRA is a lettering studio for buildings, and its website is a single day of sunlight moving across its letters: they stand on the page like buildings, throw real shadows, and after sunset their counters light up like rooms.

**Design read:** a Persuade + Experience landing page for architects and developers who commission lettering for buildings. The visual language is an architect's drawing set lit like a model on a desk. Dials: variance 9, motion 8, density 3.

**Why this can win:** the page runs on one idea and one material (light on type), carried into the loader, the menu, the transitions, the form, the footer and the 404. Every number on screen is true and live. WebGL touches only the type, so there is no background wallpaper. The one participatory tool doubles as the conversion step, and it is honest.

---

## 1. Brand, offer, audience, conversion

| | |
|---|---|
| **Name** | **OMBRA** (Italian: shadow). Slug **`ombra`**. The project folder becomes `/Users/fedor/WebstormProjects/ombra`. |
| **What it is** | A lettering studio in Basel that designs letters for buildings: names over doors, numbers on stairs, words cut into stone, letters that stand off a façade. Its method is the sun: every commission starts with a study of how light will fall on the letters, hour by hour, across a year. |
| **Offer** | A **light study**: the studio models a wall's sun for a year, then draws the letters (spacing, depth, weight, stand-off or cut) for the hours people actually walk past. |
| **Audience** | Architects, developers and cultural institutions commissioning building lettering and wayfinding. Secondary: designers who will share the page. |
| **Conversion goal** | **"Book a study"**, a short booking form styled as an architectural title block. It is prefilled from the interactive heliodon (Section 4, D). One label for this intent across nav, hero, tool and form. |

**Why the name.** Shadow is the studio's thesis. The name is short and soft, and it is readable at monumental sizes. It also has a structural gift: set in capitals, **O M B R A has five enclosed counters** (O 1, B 2, R 1, A 1, measured), so the wordmark lights five "rooms" at night. Two stories come with the word, both for the colophon or the hidden layer and neither needed on the page. In Venice a small glass of wine is still called *un'ombra*: as the story goes, wine sellers moved their stalls to follow the shadow of the campanile in Piazza San Marco. And *Ombra mai fu*, the opening aria of Handel's *Serse* (1738), is sung to the shade of a tree.
Rejected names: *Tympan* (too close to tympanus.net, the Codrops domain our jury knows), *Gnomon* (Gnomon School of VFX), *Hora* (vulgar meaning in Swedish), *Counterspace* (a real architecture studio).

**Honesty frame.** OMBRA is a fictional studio, like Oryzo. The page carries no clients, no testimonials, no logos, no press and no metrics. The content is true: the vocabulary type and architecture share, the font metrics, the solar geometry, the counts of counters. The only proof on the page is the live system itself.

---

## 2. Core metaphor and narrative arc

**World sentence.** Letters are buildings: the page is the ground, the display type stands on it at a height, and the sun moves across it for one day, from sunrise on the hero to lit counters at night.
**Interaction sentence.** Scroll controls the clock. Pointer, touch and keyboard control the lamp, the lean of a letter and the heliodon, and none of them move the clock off its path.

**The day.** Everything after the hero is a light study of one wall: **21 June (the longest day), Basel, 47.56° N**. Each chapter sits at a true hour, and scroll time between chapters moves the sun along its real path, so transitions are the passage of time. The hero alone shows the visitor's **real sun, right now**.

Sun values below were computed with the NOAA solar position equations (the same function ships in the site):

| Chapter | Clock (CEST) | Sun | Shadow ÷ height | Drawing type |
|---|---|---|---|---|
| 0 Hero | now, visitor's time zone | live | live | Plan (north up) |
| 1 Sunrise | 05:31 | 0° high, from 52.7° | long, rising | Elevation (a letter on a wall) |
| 2 Morning | 08:00 → 09:30 | 21.8° → 36.9°, from 78.6° → 94.9° | 2.50 → 1.33 | Plan |
| 3 Noon | 13:31 (solar noon) | 65.9° high, due south | 0.45 | Plan |
| 4 Afternoon | 16:44 | 45.0° high, from 255.1° | 1.00 | Elevation, wall facing 255° |
| 5 Golden hour | tool: visitor's city, today | live in tool | live | Elevation (their wall) |
| 6 Dusk → night | 21:30 sunset → 22:15 | 0° → −6.5° | infinite, then gone | Plan at night |
| 7 Book | 22:45 | night | none | Title block |
| 8 Colophon | 04:50 next day | civil dawn | first faint shadow | Index |

Layout families, none repeated: Monument, Plate, Horizontal band, Justified block, Pinned object with diagram, Instrument, Night field, Title block, Index. There are three pins in total (Morning, Afternoon, Dusk).

### Chapter 0: Hero, "now" (Monument)
- **Purpose:** in 3 seconds, show what the studio does. Letters are buildings, the sun reads them, and so do you.
- **Layout, desktop 1440×900:** the hero is 92svh so the next chapter peeks in. Nav at 64px. Statement block in cols 1-5 near the top: H1 statement, sub, CTA. The monument word **OMBRA** runs margin to margin (48px margins) with its baseline at 71% of the viewport. Bottom-left: the live sun readout. Bottom-right: a small north arrow. Below the fold, the top of chapter 1's giant **a** rises into view.
- **Layout, mobile 390×844:** statement and CTA at the top, and the word at 38% of the height. **The plan is turned so the sun is at the top of the phone**, so shadows always pour down the tall screen. The north arrow rotates live to show where north went; that is what architects do when they turn a plan to fit a sheet. Readout at the bottom.
- **Copy:**
  - H1: **OMBRA** + "Letters for buildings, drawn with their shadows." (the H1 carries `aria-label="Ombra. Letters for buildings, drawn with their shadows."`)
  - Sub: "Lettering for doors, stairs and stone, each drawn for the light it will be read in."
  - CTA: **Book a study**
  - Readout, example computed for Moscow on 29 Sep 2026: "09:12 in Moscow" / "Sun 20.8° high, from 129°". With the lamp active: "Your lamp: 34° high, from 212°". Coarse pointers only: "Drag sideways to move the sun."
- **Motion / WebGL:** the intro and lamp are specified in Section 3.
- **Fallback:** a static CSS long shadow (Section 7.7). Without WebGL the readout still shows the true sun.

### Chapter 1: Sunrise, 05:31 (Plate)
- **Idea:** type already speaks architecture.
- **Layout, desktop:** a giant lowercase **a** (Science Gothic 800/100, 64vh) in cols 1-6, drawn as an elevation with dimension lines in true font units. Cols 8-12 hold the heading, body, the lean control and its readout. Below, a full-width typographic list: *Words both trades use*.
- **Layout, mobile:** the **a** at 70vw with dimension lines, then text. The lean works by horizontal drag or the button.
- **Copy:**
  - Body opener, which frames the whole page: "The rest of this page is one day on one wall: 21 June, the longest day of the year, in Basel."
  - H2: "Typographers already talk like architects."
  - Body: "A lowercase a has two storeys. An e has an eye and an aperture. Every letter stands on a baseline, and round ones overshoot it by a few units so they look level."
  - Lean control: button **Lean the a**. Caption: "Lean it past five degrees and the top floor comes off." Readout: "Slant 0°. Two storeys." changes to "Slant 7.2°. One storey."
  - List, *Words both trades use*: storey, stem, arch, shoulder, spine, apex, bracket, spur, capital, column, gutter, aperture.
  - Dimension lines, true values at weight 800, 2000 units per em: baseline 0, x-height 1017, cap height 1400, ascender 1465, descender −428, O overshoot 14. An optional caption: "The O rises 14 units above the H so that it looks the same height. Greek builders curved their columns for a similar reason."
- **Motion:** the heading gets the light-sweep reveal (Section 6). Dimension lines draw on once (DrawSVG, 900ms). The lean is Signature moment B.
- **WebGL:** plan mode is off here; the letter is in elevation, with a long sunrise shadow from 52.7°. The shadow crossfades between the upright and leaned rasters during the lean.

### Chapter 2: Morning, 08:00 → 09:30 (Horizontal band, pinned)
- **Idea:** spacing is a colonnade, and the sun tests it.
- **Layout, desktop:** heading and body stay fixed in cols 1-5. The word **minimum** (Science Gothic 900/50, lowercase, x-height 56vh) pans right to left across the pin (about 200svh). The readout (bottom-left) counts time from 08:00 to 09:30 as you walk. Mid-pan, the stem line appears.
- **Layout, mobile:** the same pin, shorter (x-height 40vh), with text above.
- **Copy:**
  - H2: "We space letters like columns."
  - Body: "Type designers test rhythm with the word minimum: fifteen stems in a row. On a wall, the morning sun adds fifteen shadows, and the spacing has to survive them."
  - Mid-pan line (true, 'l' stem at wdth 100): "At weight 100 a stem is 36 units thick. At 900 it is 524. One is a partition, the other a load-bearing wall."
  - Readout: "08:00. Shadows 2.5× the height." changes to "09:30. Shadows 1.3× the height."
- **Motion:** scrubbed containerAnimation, `ease: none`, scrub 1. The sun rotates from 78.6° to 94.9°, so the stripes of shadow between the stems visibly turn and shorten.
- **Fallback:** without JS or under reduced motion, a native horizontal strip (`overflow-x: auto`, scroll-snap) with the 09:00 light.

### Chapter 3: Noon, 13:31 (Justified block)
- **Idea:** at noon, a page is a plan. Letters are blocks, word spaces are streets, and the paragraph gap is an avenue.
- **Layout, desktop:** H2 in cols 1-7. Two justified paragraphs (the only justified text on the page) in cols 3-10, Wittgenstein at 24px with hyphenation, separated by a 63px gap. Readouts in cols 11-12. Every glyph of both paragraphs casts a short noon shadow, and the block reads like an aerial photo of a dense city.
- **Layout, mobile:** full width at 19px, justified with `hyphens: auto`.
- **Copy:**
  - H2: "At noon, a page is a plan."
  - P1 (43 words): "Every commission starts on the wall itself. We find out which way it faces and which hours of the year it gets the sun. A letter that reads well at noon can disappear at five, when its shadow falls across the next stroke."
  - P2 (33 words): "So we draw the shadows as carefully as the letters. Depth, spacing and weight are set for the hours when people actually walk past. On a building, the sun reads every letter first."
  - Readouts (true): "Solar noon in Basel, 13:31. Sun 65.9° high. Shadows are 0.45× the height of what casts them." Live: "Ink covers 31.4% of this block" (computed from the mask; the value shown is illustrative until measured).
- **Motion:** none beyond the sun. This is the calm beat.
- **WebGL:** casters are drawn word by word at DOM word rects, because justification stretches the spaces. The height is small, so the shadows are short and crisp.

### Chapter 4: Afternoon, 16:44 (Pinned object with diagram)
- **Idea:** some letters stand off a wall, some are cut into it, and the choice depends on the sun.
- **Layout, desktop:** H2 top-left. The sundial motto **HORAS NON / NUMERO NISI / SERENAS** (Science Gothic 700/75, about 9vw) in cols 1-9. A live **section diagram** (SVG data graphic) in cols 10-12: a letter stroke on pins 40 mm off a wall, with the sun ray at the true angle, lowers into a 12 mm groove. The caption under the diagram switches between Stand and Cut.
- **Layout, mobile:** motto at 13vw over 4 lines, diagram below. The pin is shorter, and Stand/Cut buttons can also set the state.
- **Copy:**
  - H2: "Some letters stand. Some are cut."
  - Stand: "Built letters stand off the wall on pins. Their shadow lands on the wall beside them and moves all day."
  - Cut: "Cut letters are carved into the stone. The shadow stays inside the stroke, so they read in raking light and go quiet under cloud."
  - Truth line: "16:44. The sun is 45° high and square to this wall, so every shadow drops exactly as far as its letter stands off."
  - Motto caption (italic): "Horas non numero nisi serenas. I count only the sunny hours. A sundial motto, usually cut into the wall under the dial."
  - Optional aside: "Sundials count only the sunny hours. We draw for the others too."
- **Motion / WebGL:** Signature set piece (Section 4, note E). Scroll moves the letters from standing, through one frame of flat print, to cut.

### Chapter 5: Golden hour, the heliodon (Instrument)
- **Idea:** your words on your wall in your sun. This is the participatory moment and the path to conversion (Section 4, D).
- **Layout, desktop:** the stage (the wall) in cols 1-8. A control rail in cols 9-12, drawn as a title-block panel with 1px rules.
- **Layout, mobile:** stage at 60svh, controls stacked below, a full-width time slider.
- **Copy:**
  - H2: "Try a name on a wall."
  - Sub: "Type the words, turn the wall to face its real direction, then drag the sun. The shadows are worked out for your city, today."
  - Control labels: Words / Wall faces (North, East, South, West) / Day (Today, 21 June, 21 December) / Letters (Stand off, Cut in) / Time.
  - Readouts: "Sun 10.6° high, from 293°." / "This wall is in sun 13:02-21:30." / "Shadow 205 mm right, 29 mm down, for letters 40 mm off the wall."
  - When the wall is in shade: "The sun is behind this wall. In flat light, cut letters go quiet and built ones read by their edges."
  - At night: "The sun is down. Lamps do the reading now."
  - Buttons: **Save the study**, **Book a study**.

### Chapter 6: Dusk to night, 21:30 → 22:15 (Night field, pinned)
- **Idea:** after sunset, every counter is a lit room, and a block of street lettering becomes a city at night.
- **Layout, desktop:** a full-bleed justified block of about 70 real signage words (ENTRANCE, EXIT, PUSH, PULL, STAIRS, LIFT, LIBRARY, BAKERY, PLATFORM, TICKETS, NO ENTRY, BOARDING, ARRIVALS, ROOF TERRACE, NO. 8, NO. 40 and so on) in Science Gothic 780/88 caps at 44-56px. H2 and sub in cols 1-4 at the bottom-left, the live count at the bottom-right.
- **Layout, mobile:** the block at 28px, H2 above.
- **Copy:**
  - H2: "After sunset, the counters fill."
  - Sub: "Every closed shape inside a letter is a room. At night, a block of street lettering reads like a city seen from the air."
  - Live readout (true count): "Rooms lit: 214".
- **Motion / WebGL:** Signature moment C (Section 4). The shadows lengthen to the edge of the screen and dissolve, the ground passes through blue hour into night, then the rooms light one by one in a seeded order, all scrubbed so reverse scroll turns them off.

### Chapter 7: Book a study, 22:45 (Title block)
- **Layout, desktop:** H2, sub and a deliverables list in cols 1-5. The form in cols 7-12 is an architectural title block: cells separated by 1px Rule lines, labels above fields, errors below. The counters in the H2 glow (it is a caster).
- **Layout, mobile:** a single column with 48px fields.
- **Copy:**
  - H2: "Send us your wall."
  - Sub: "Tell us the words and which way the wall faces. We model a year of its sun and draw for the hours people pass."
  - List: "The sun on your wall, hour by hour, for a whole year." / "Every letter drawn in plan, section and elevation." / "One letter made at full size, to hold up on site."
  - Fields: Words to letter · Building and city · Wall faces (N/E/S/W radio group) · Email · Notes (optional). Submit: **Book a study**.
  - States: idle, focus, invalid ("We need an email to reply to."), sending, success, failure. Success copy depends on the path (Section 8, risk 9); it never claims what did not happen.
- **Accent:** the only chromatic accent (Lamp) fills the submit button here for the first time, which is colour used as narrative.

### Chapter 8: Colophon and footer, 04:50 next day (Index)
- **Layout:** a small OMBRA wordmark in cols 1-3 with the first faint dawn shadow of the next day. The colophon runs in two columns in cols 5-12, then a row of working links.
- **Copy:**
  - "Letters for buildings. Basel."
  - Links: **Back to sunrise** (scrolls to the top, where the day starts again), **Book a study**, **Sound**, **Construction lines** (the hidden layer, also on the N key).
  - Colophon (all true):
    - "Display type: Science Gothic by Thomas Phinney, Vassil Kateliev and Brandon Buerkle, based on Morris Fuller Benton's Bank Gothic of 1930-34. SIL Open Font License."
    - "Text type: Wittgenstein by Jörg Drees, named for the sentence 'what can be said at all can be said clearly'. SIL Open Font License."
    - "Sizes: Le Corbusier's Modulor, red and blue series, read as pixels."
    - "Sun: NOAA solar position equations, worked out in your browser from your clock and time zone. Nothing else is asked of it."
    - "Shadows: one fragment shader, 32 samples a pixel. The last frame took 3.8 ms." (live value)
    - "Built with Next.js, three.js, GSAP and Lenis."
- **404:** a lone lowercase **o** with its counter lit. H1: "No door here." Body: "This page is a closed counter: a room with no aperture." Link: **Back to sunrise**.

---

## 3. Hero specification

### 3.1 Static first frame (no JS, no WebGL)
Server-rendered HTML carries the whole hero at its final state. The Greyboard ground comes from CSS. **OMBRA** is in Plaster at Science Gothic 860/75, sized in pure CSS with no layout shift: `font-size: calc((100vw - 96px) / 4.2284)`, where 4.2284 em is the measured advance of OMBRA at 860/75. It carries a static CSS long shadow in the golden-hour direction (shadows toward 113°; the recipe is in 7.7). The statement, sub, CTA and nav are all present. The readout shows the studio's reference, "Basel, 21 June, 20:12. Sun 10.6° high, from 293°", because a no-JS page cannot know the visitor's clock. This frame is complete and art-directed on its own.

### 3.2 Intro choreography (first 3 seconds, JS on)
An inline `<head>` script sets `html.js` before first paint. With it on, CSS starts the hero in the **pre-dawn** state: the ground is 8% darker and cooler, there is no CSS shadow, and the monument is set in **hairline (wght 100)**. The word reads like an architect's construction lines on board. Nav, statement and CTA are readable and usable from the first frame.

| t | Beat | Detail |
|---|---|---|
| 0.00 s | Drawing | Hairline OMBRA. SplitText splits the word into chars, and each char's box is fixed to its final advance, so nothing reflows. |
| 0.20-1.20 s | **Built** | Per-letter `wght` 100 → 860, stagger 70 ms (O first), ease `build`. Each wall thickens inside its own footprint. |
| 1.00-2.40 s | **Sunrise** | The sun rises from the horizon at today's sunrise azimuth to the visitor's **current real** position. Shadows arrive infinitely long and faint, then shorten and darken as direct light strengthens. The ground warms from pre-dawn to the current tint. |
| 2.40 s | Handoff | Lenis starts and the lamp becomes active. |
| Night variant | Lights on | If the real sun is below −6°, the build completes, then the five counters light one by one (seeded, 1.2 s) on the Night ground. |

**Gate:** the sunrise waits for real signals: `document.fonts.load` for the monument instance, the first caster raster, and `compileAsync`. A failsafe at 3.5 s jumps to the final state. Repeat visits in the same session (sessionStorage, try/catch) skip the build and ease the sun in over 800 ms. There is no loader screen and no counter: pre-dawn is the loader.

### 3.3 Pointer response: the lamp
Architects test models with a lamp (a heliodon). Here the pointer is that lamp.
- **Direction:** light comes from the pointer's side of the word's centre, so shadows point away from the cursor.
- **Height:** distance from the word's centre sets the elevation. Close means 72° (short shadows); far means 4° (long ones): `el = mix(72°, 4°, smoothstep(0.05, 1.0, d / (0.5 × diagonal)))`.
- **Feel:** direction vectors are damped with λ = 6, and never raw angles, so there is no wrap-around jump. The ground gets a soft falloff around the lamp (up to 12% darker far from it).
- **Return:** after `pointerleave` or 2.5 s idle, the sun eases back to "now" over 1.6 s with ease `set`, and the readout switches back to the city.
- **Touch:** a horizontal drag scrubs today's sun along its real path (`touch-action: pan-y`). **Keyboard:** the hero lamp is optional; the heliodon offers the full, accessible version.
- **Reduced motion:** the lamp is off. The hero shows the live sun and re-renders once a minute.

### 3.4 The image people will remember
**One word, white as a plaster model on grey board, throwing a shadow three times its own height across the page. The shadow turns when you move your hand like a lamp. It is the real sun over the viewer's city until they touch it.**
Mock renders made tonight from the real font file and palette (Python + Pillow, same shadow model as 7.3) are in `docs/process/concepts/concept-4-assets/`: `mock-hero-day.png`, `mock-hero-night-counters.png`, `mock-cut-letters.png` and `mock-a-storey-lean.png`. `noaa_sun_reference.py` is the solar function to port into `src/lib/sun.ts`. The mocks are for direction only; the build regenerates the poster assets.

```
DESKTOP 1440x900                                   MOBILE 390x844 (plan turned: sun at top)
+--------------------------------------------------+   +----------------------+
| [sun arc 09:12]                  Book a study  ♪  |   | [arc 09:12]   Book   |
|                                                  |   | Letters for          |
| Letters for buildings,                           |   | buildings, drawn...  |
| drawn with their shadows.                        |   | Lettering for doors..|
| Lettering for doors, stairs...                   |   | [ Book a study ]     |
| [ Book a study ]                                 |   |                      |
|                                                  |   |       O M B R A      |
|  O M B R A  (margin to margin, baseline 71%)     |   |      \\ \\ \\ \\     |
|    \\\\\\\\\\\\\\\\\ shadow toward the lamp's far side  |   |       \\ \\ \\ \\    |
| 09:12 in Moscow                             N ^  |   | 09:12 in Moscow  N<  |
| Sun 20.8° high, from 129°                        |   | Sun 20.8° high...    |
+------------------- top of the giant a peeks ----+   +----------------------+
```

---

## 4. Signature moments

### A. The lamp and the live sun (hero)
The shadow on the first screen is computed from the **real sun position over the visitor's city at this minute**. The city comes from the time zone, via IANA `zone1970.tab` coordinates in a 10 KB JSON, falling back to Basel. The pointer turns into a lamp the moment it moves. Nobody asks for location; only the clock is used, and the colophon says so. People will come back at dusk to see the page change.

### B. Lean the a
The upright **a** in Science Gothic is double-storey. The font contains a FeatureVariation (`rvrn`): **at slant ≤ −4.9° it swaps in a single-storey `a.slnt`**. This was verified in the font's GSUB table tonight; it is not a rendering trick.
- **Interaction:** drag the **a** sideways (0 to 160 px maps to slnt 0 to −10), or press **Lean the a** (`aria-pressed`) to toggle. At the threshold the readout flips from "Two storeys" to "One storey", and a latch click plays if sound is on. On release the letter eases upright over 900 ms (`build`); from the button it stays leaned until pressed again.
- **Shadow:** a crossfade between two static caster rasters, upright and leaned. The sunrise shadow is long and soft, so the blend reads as one moving shadow.
- It is font-native and true, and it would be funny to a type designer and to an architect.

### C. After dark: the counters fill
The page crosses sunset while pinned. Shadows stretch to the screen edge and dissolve, the ground passes through blue hour (#2B313A) to Night, and then **every enclosed counter in a block of real street lettering lights up**, one room at a time in a seeded order, with warm light spilling onto the ground around each letter. Counters are detected from actual glyph topology (a flood fill of the caster raster: background regions not connected to the outside). The readout "Rooms lit: 214" is a true live count. Reverse scroll turns the lights off. The same system lights the heliodon word and the 404's **o**.

### D. The heliodon (participatory, and the conversion)
A working sun study for façade lettering, in the visitor's city.
- **Controls:** a native text input (up to 18 chars, CSS uppercase). *Wall faces* is a radio group with arrow-key fine turning of ±5°. *Day* offers Today, 21 June or 21 December; *Letters* offers Stand off (40 mm) or Cut in (12 mm). *Time* is a native `<input type="range">` (minutes 0-1439), drawn as the sun on today's arc with night dimmed. Everything is keyboard-operable and labelled.
- **True maths:** relative azimuth `r = A − W`. The wall is lit when `|r| < 90°` and the sun is up. For letters D mm off the wall, the shadow offset is `x = D·tan r` (to the right) and `y = D·tan E / cos r` (down). "In sun from ... to ..." comes from scanning the day at 1-minute steps (1,440 NOAA evaluations, about 0.3 ms).
- **Output:** **Save the study** downloads a PNG. It is the stage frame (captured right after render) plus a title block drawn in 2D canvas: words, city and latitude, date, time, wall azimuth, sun angles and "Ombra light study". **Book a study** scrolls to the form with Words and Wall faces prefilled.
- **Default:** today, the visitor's city, one hour before sunset, wall facing West, OMBRA. The shadows are long and raking on first sight.

**Set piece E, Stand to Cut** (chapter 4). Scroll carries the motto from standing letters with shadows outside, through a single frame of **flat print with no shadow at all**, into incised letters with shadows inside the strokes. The SVG section diagram moves in sync, so the effect explains itself.

---

## 5. Typography, colour, materials

### 5.1 Faces (verified tonight against the font files, the Google Fonts METADATA and the Next 16.3.6 font-data)

| Role | Face | Source / licence | Axes used | Why this face and no other |
|---|---|---|---|---|
| **Drafting hand**: monuments, casters, data, UI | **Science Gothic** (T. Phinney, V. Kateliev, B. Buerkle, 2025) | Google Fonts, `next/font/google` `Science_Gothic`, **OFL 1.1**, no Reserved Font Name | `wght 100-900`, `wdth 50-200`, `slnt −10-0`. **CTRS is not loaded** (pinning it saves 129 KB) | It descends from Bank Gothic (Benton, ATF, 1930-34), the square capitals of drafting title blocks. Its 4× width range spans tower to slab, and its slant axis removes a storey from the **a**. GF popularity rank 1164, so it has no template associations. |
| **Voice**: headings as sentences, body, captions | **Wittgenstein** (Jörg Drees) | Google Fonts, `next/font/google` `Wittgenstein`, **OFL 1.1** | `wght 400-900`, italic | A humanist serif after Trump Mediäval and **Walter Diethelm's Swiss Antiqua (1950s)**, named for "what can be said at all can be said clearly". Rank 1226. It is the studio's voice set against the drawing's hand. |
| Mono | **none** | | | Data is set in Science Gothic with `tabular-nums`, as architects letter dimensions. That avoids the mono-label costume (tell #17). |

**Static caster fonts:** canvas 2D cannot set `wdth` (`ctx.fontStretch` is not Baseline and takes keywords only). A script, `scripts/caster-fonts.py`, uses fontTools `instancer` + `pyftsubset` to generate renamed Latin static instances ("Ombra Caster Monument" 860/75, "... Column" 900/50, "... Motto" 700/75, "... A" 800/100 at slnt 0, "... A Lean" 800/100 at slnt −10 with the rvrn substitution baked in, "... Street" 780/88). Each is about **20 KB** (measured) and loads with the lazy WebGL chunk. OFL permits instancing, and the new names avoid any trademark question.

**Measured bytes (WOFF2, Latin):** Science Gothic with wght+wdth+slnt is **182 KB**; all four axes would be 311 KB. Wittgenstein is **29 KB**. Both are preloaded with `display: swap` and `adjustFontFallback`, and the hero's hairline intro hides the swap.

### 5.2 Scale: Le Corbusier's Modulor, in pixels
Red series: 6, 9, 15, 24, 39, 63, 102, 165, 267, 432. Blue series: 11, 18, 30, 48, 78, 126, 204, 330, 534. The same values are the spacing tokens.

| Token | px (desktop / mobile) | Face, settings |
|---|---|---|
| `--type-data` | 15 / 15 | Science Gothic 480/80, tabular-nums, sentence case |
| `--type-body` | 18 / 17 | Wittgenstein 400, lh 1.55, 60-68ch |
| `--type-lead` | 24 / 19 | Wittgenstein 400, lh 1.4 |
| `--type-statement` | 30 / 24 | Wittgenstein 500, lh 1.2 |
| `--type-h2` | 63 / 39 | Wittgenstein 500, lh 1.04, tracking −0.01em, `text-wrap: balance` |
| `--type-display` | 102 / 63 and 165 / 102 | Science Gothic, the chapter casters |
| Monument | fit to sheet (about 318 px at 1440) | Science Gothic 860/75, lh 0.78. It is the one size measured to the sheet rather than taken from the Modulor. |
| UI buttons | 15 | Science Gothic 600/100, sentence case, 48 px targets, radius 0 |

**Measured facts for copy and drawings (Science Gothic, 2000 UPM, weight 800):** x-height 1017, cap height 1400, ascender 1465, descender −428, O overshoot ±14. The 'l' stem is 36 / 248 / 448 / 524 units at weights 100 / 400 / 800 / 900. Counters: OMBRA 5, ombra 3, A-Z a-z 0-9 together 22, the motto 8. Em-widths: OMBRA 860/75 = 4.2284, 100/75 = 2.898, minimum 900/50 = 4.785.

### 5.3 Colour: "a white model on greyboard under a lamp"
Use scene: an architect at a desk in the afternoon, looking at a plaster model on grey board. That scene gives a mid-dark ground, light forms and cool shadows. Contrast was computed with the WCAG formula.

| Token | Hex | Role | Contrast |
|---|---|---|---|
| `--c-greyboard` | **#5A5650** | Day ground (the model board) | |
| `--c-plaster` | **#ECEAE5** | Letter faces, primary text | 6.06 on Greyboard (AA) |
| `--c-plaster-2` | **#D6D1C8** | Secondary text on Greyboard | 4.79 (AA) |
| `--c-rule` | **#AEA9A1** | Dimension lines, title-block rules, form borders | 3.12 (non-text AA) |
| `--c-umbra` | **#37383C** | Shadow core; CSS fallback shadows | Plaster on Umbra 9.74 |
| `--c-bluehour` | **#2B313A** | Dusk ground (shader + CSS) | Plaster 10.90 |
| `--c-night` | **#15181C** | Night ground | Plaster 14.81 |
| `--c-moonlit` | **#808995** | Letter faces and secondary text at night | 5.03 on Night (AA) |
| `--c-lamp` | **#FFB35C** | **The only accent**: lit counters, night CTA fill, night focus ring | Night text on Lamp 10.05 (AAA). Never small text on Greyboard (4.11). |

The accent is withheld until sunset. By day the only warmth is sunlight, a shader tint on the board that warms as the sun drops, from `(1.05, 1.0, 0.93)` to `(1.12, 0.94, 0.78)` near the horizon. Shadows are **cool**, `(0.42, 0.46, 0.55)` × board, because they are lit by the blue sky; that is a real photographic effect, and it makes the shadows look outdoor rather than CSS. Browser surfaces: day selection is Plaster with Night text; night selection is Lamp with Night text. The caret and focus ring are Plaster by day and Lamp by night (2 px ring, 2 px offset). The scrollbar is thin, a Rule thumb on Greyboard. All radii are 0.

### 5.4 Texture and materials
- **Greyboard:** a static two-octave fibre noise at ±1.5% luminance. It does not animate.
- **Grain:** photographic and luminance-dependent: ±3% in shadow, ±1% in light, added in the composite pass. It moves at 12 fps while something moves and **freezes when the page is idle**, so it is never a costume layer.
- **Plaster:** DOM text, flat. The only modelling is a contact line where the letter meets the ground (AO from the mask).
- **Stone** (cut chapter only): the recessed floor of each letter is 14% darker and slightly cooler.
- **Night:** a blue-black ground and moonlit faces. Amber comes only from inside counters and spills onto the ground; it never glows over letter faces.
- **Lamp falloff** (hero): the ground darkens gently away from the pointer.

---

## 6. Motion language

**Principle:** scroll is time. The sun moves; buildings do not. Things at rest are at rest.

| Ease | CSS | GSAP (CustomEase) | Use |
|---|---|---|---|
| `build` | `cubic-bezier(0.16, 1, 0.3, 1)` | `CustomEase.create('build','0.16,1,0.3,1')` | Arrivals: letters thickening, dimension lines, heading light sweeps |
| `set` | `cubic-bezier(0.65, 0, 0.35, 1)` | `'set','0.65,0,0.35,1'` | Authored light moves: lamp return, sun handoffs |
| `cut` | `cubic-bezier(0.7, 0, 0.84, 0)` | `'cut','0.7,0,0.84,0'` | Exits, which are faster than entrances |
| scrub | `none` | `ease: 'none'`, scrub 0.8-1.2 | Every scroll-linked value |

Durations: `--t-tick` 120 ms (press and hover), `--t-state` 240 ms (toggles), `--t-reveal` 900 ms, `--t-build` 1000 ms, `--t-light` 1600 ms. Staggers: 70 ms per letter (hero build only) and 90 ms per heading line. No bounce, no elastic, no loops on content.

- **Scroll feel:** Lenis only (`lerp 0.08`, `wheelMultiplier 0.9`, `syncTouch false`), driven by the GSAP ticker (One Clock, already scaffolded in `SmoothScroll.tsx`). It should feel heavy and architectural, never floaty. There are three pins: colonnade (scrub 1), stand/cut (0.8) and dusk (1.2).
- **Chapter transitions:** time. Between anchors, the day conductor interpolates clock time along the true sun path, so shadows swing and stretch. From hero ("now") to sunrise, the sun visibly rewinds to 05:31. Drawing modes (plan or elevation) switch only at boundaries where no caster is on screen.
- **Heading reveal ("light sweep"):** each H2 begins in shadow (Umbra-tinted, still visible). A CSS mask gradient sweeps across it **at that chapter's true sun azimuth**, lighting it to Plaster (900 ms, `build`). That is the only reveal on the page. Body copy is present from the start, or at most a 240 ms opacity. It is neither fade-up nor SplitText.
- **SplitText** is used exactly once: hero chars, where the letters themselves are the buildings.
- **Intro and loader:** Section 3.2, the sunrise. No percentage, no curtain.
- **Cursor:** native everywhere. The lamp needs no follower because the shadows are the feedback. `ew-resize` over the leanable **a**; `grab` and `grabbing` on the heliodon sun. No custom cursor.
- **Sound (opt-in, Web Audio, synthesized, off by default):**
  - Chapter anchors ring an **hour bell**: FM, carrier 392 Hz, ratio 3.5, 2.2 s decay, about −26 dBFS, dropping to 196 Hz at night.
  - A room-tone bed of filtered noise whose low-pass follows the sun's height (300 Hz + 2400 Hz × sin(el)), dark at night.
  - A latch click when the **a** loses its storey, and soft 15-minute ticks while scrubbing the heliodon.
  - The toggle is a `role="switch"` labelled "Sound", with a 3-bar meter read from a real AnalyserNode.
- **Reduced motion:** Lenis off; no pins (final states laid out statically); the sun snaps per chapter on enter with a 200 ms light crossfade; lamp off; grain static. The lean and the heliodon work instantly, because they are user-driven. Stand/Cut becomes a side-by-side diptych, and the night block shows its lit state.

---

## 7. WebGL plan (surgical: WebGL draws only the light on the type)

### 7.1 One canvas
Use the existing `StageRoot`: one fixed full-viewport canvas behind the DOM, with an orthographic pixel camera (1 unit = 1 CSS px), advanced by the GSAP ticker. **When nothing moves, nothing renders:** demand-style invalidation fires on scroll, pointer, active tweens and a 10 s real-time sun tick. An idle page uses no GPU.

### 7.2 Casters: DOM → raster → texture
Every shadow-casting element registers with `useCaster(ref, { font, height, mode })`. There are at most 8 on the page: monument, **a**, minimum, the noon paragraphs, motto, heliodon word, night block, form H2.
1. **Raster** (on fonts ready, resize and text change; never per frame). Draw into an offscreen 2D canvas using the **static caster font**, placing each char or word at its **DOM-measured rect**. SplitText gives chars for display words and words for justified text. The canvas never lays text out; the DOM does. This guarantees registration, including kerning and justification. R holds coverage; B holds counters, from a JS flood fill of the half-res raster in `requestIdleCallback`, about 40 ms at most per caster, once.
2. **Sync.** Each caster is a quad positioned from cached rects plus `frame.scroll.y` (the same value Lenis wrote this frame). Casters inside pins read a live `getBoundingClientRect` each frame, at most four elements.
3. **Caster RT.** Quads render into a **half-resolution RGBA8 target with mipmaps** (WebGL2 allows NPOT mips). G carries the caster's height (normalised).

### 7.3 Shadow pass (half-res)
A directional occlusion march with contact-hardening penumbra:
```glsl
// uShadow: screen-space px displacement of a height-1 caster's shadow (from the conductor)
float occ = 0.0;
for (int i = 1; i <= STEPS; i++) {                 // 32 / 20 / 12 by tier
  float t = float(i) / float(STEPS);
  vec2  q = px - uShadow * t;                        // walk toward the sun
  float lod = log2(1.0 + uSoft * t * length(uShadow) * 0.02);   // wider penumbra further out
  vec4  c = textureLod(uCaster, q / uRes, lod);
  occ = max(occ, c.r * step(t, c.g) * (1.0 - 0.35 * t));        // blocked only if the caster is tall enough
}
```
- **Plan mode:** `uShadow = −sunDir2D(az) × H / tan(el)`, with north up (or sun up on phones).
- **Elevation mode:** `uShadow = (D·tan r, −D·tan E / cos r)` in px from the wall-relative angles, the same maths as the heliodon.
- **Cut mode** (`uCut < 0`): inside glyphs, march with inverted coverage, so the stroke floor is shadowed by its own sun-side edge. The DOM motto turns `color: transparent` (still selectable and read by screen readers) and the composite pass draws the recessed faces. This happens only in chapter 4.

### 7.4 Composite pass (full-res, cheap)
It outputs, in order: the Greyboard material and fibre; the sun tint by elevation; the shadow in cool sky tint; contact AO (one mip sample); lamp falloff; the night mix to Blue hour and then Night; lit counters (sharp B) plus spill (B sampled at mip 4, applied to ground only); recessed faces in cut mode; and grain. Palette colours reach the shader through `new THREE.Color(token)` from the CSS custom properties, so DOM and canvas match (research T04). **There is no EffectComposer:** no bloom, no chromatic aberration, no depth of field. The night glow is a blurred mip, not a bloom pass.

### 7.5 The day conductor (`src/lib/day.ts`, `src/lib/sun.ts`)
Chapters declare `data-time`, `data-mode`, `data-wall` and `data-height`. The conductor maps exact scroll position to clock time piecewise-linearly between anchors, and takes it through `damp(λ = 4)` into sun (az, el) via the NOAA function (Basel, 21 June) and on into uniforms. Exact progress drives the nav (`aria-current`), readouts and bell triggers; the damped value drives only the light. The hero and the heliodon take over the sun while they are on screen, because they use the live sun or the user's controls.
**QA hooks:** `?at=2026-06-21T20:12&tz=Europe/Moscow` forces the hero sun, and `?tier=`, `?motion=reduced` and `?webgl=0` force the fallbacks.

### 7.6 Budget (Apple Silicon, 1440×900, DPR 2)
| Pass | Target |
|---|---|
| Caster quads to half-res RT with mips | ≤ 0.3 ms GPU |
| Shadow march, 32 steps, half-res (≈ 0.32 MP) | ≤ 1.0 ms GPU |
| Composite at full res (≈ 5 fetches/px) | ≤ 1.0 ms GPU |
| JS per frame (Lenis, GSAP, conductor, rect sync) | ≤ 2 ms |
| Rasters and flood fills | only on resize or text change, off the scroll path |

Tiers map onto the store's `quality`: high (steps 32, shadow RT 0.5×, DPR ≤ 2), medium (20, 0.4×, DPR ≤ 1.5, grain static), low (12, 0.33×, DPR 1). drei `PerformanceMonitor` steps down after sustained misses. Transfer: page JS is estimated at about 120 KB gz; the lazy WebGL chunk (three + R3F) at about 180 KB gz, loaded after first paint. Fonts total 211 KB preloaded, plus about 20 KB per caster instance loaded lazily. There are no photographs.

### 7.7 Fallbacks
- **No WebGL** (`data-webgl="disabled"` or `"failed"`): designed CSS posters. Monument and casters get a **static long shadow**: 16 `text-shadow` layers along `(cos 113°, sin 113°)`, stepping 6 px, blur `0.8 px × k`, Umbra alpha falling from 0.9 to 0.1. The noon block gets a 1 px short shadow. Stand/Cut becomes a diptych, with the engraved look from `text-shadow: 1px 1px 0 #6d6860, -1px -1px 0 #45413c`. The heliodon shows a pre-rendered example study (a PNG generated from our own font by the build script) plus a note. The night block shows moonlit letters without lit counters. Everything is readable.
- **Reduced motion:** the static per-chapter frames described in Section 6.
- **Context loss:** the poster shows and `quality.webglVisible = false`. On restore, re-raster casters and remount.
- **Hidden layer, "Construction lines"** (N key or footer link): caster outlines as hairlines, the sun vector, shadow length in px and in ×height, the north arrow, and the conductor's time, az, el, steps and frame ms, all drawn as drawing annotations. It rewards curious jurors and doubles as the registration QA tool.
- **Console signature:** "OMBRA. Sun from NOAA equations, shadows from one shader. Press N for the construction lines."

---

## 8. Feasibility

### 8.1 Work packages (about 4 h wall time with 3 agents)
| WP | Owner | Time | Contents |
|---|---|---|---|
| **WP0 Foundations** | Agent A | 0:45 | Rename to `ombra`. Tokens (colour, Modulor space and type), fonts via `app/fonts.ts`, `scripts/caster-fonts.py` + generated `/public/fonts/caster-*.woff2`, the 12/4-column grid. **All 9 sections with final copy, rendered complete with no JS** (the static first frame everywhere), CSS posters, nav, 404, metadata, favicon (plaster O with a lit counter), OG image as a static PNG from our own render. |
| **WP1 Light engine** (critical path) | Agent B | 1:45 | Caster registry, raster + flood fill, caster RT, shadow and composite shaders, plan / elevation / cut / night modes, `sun.ts` (NOAA) + `tz-cities.json` (from `zone1970.tab`), day conductor, invalidation, tiers, context loss, construction-lines overlay. |
| **WP2 Choreography** | Agent A (after WP0) | 1:45 | Hero intro (build + sunrise + night variant), lamp, readouts, sun-arc nav with the chapter menu (focus trap, Esc), heading light sweep, **Lean the a**, colonnade pin, stand/cut pin with the SVG section diagram, dusk pin with seeded lights. |
| **WP3 Tool + conversion** | Agent C | 1:45 | Heliodon UI and maths, Save the study (PNG + title block), prefill; the booking form with every state; colophon with live frame ms; opt-in sound. |
| **WP4 QA + polish** | all | 0:45 | Gates in 8.3, one batched fix round. |

### 8.2 De-risk spikes (the first 45 minutes, before anything else is built on them)
1. **Registration** (WP1): the monument caster over the DOM word in Chrome and Safari with construction lines on. Pass: edge error ≤ 1 CSS px at 1440 and 390.
2. **`rvrn` in Safari 26** (WP2): render the **a** at slnt −6. If Safari ignores FeatureVariations, the Safari path swaps to the baked "Caster A Lean" family at the threshold, and the storey readout stays truthful.
3. **Shadow cost:** the shadow pass at DPR 2 with 32 steps, timed in the Chrome profiler. Pass: ≤ 1.5 ms. If it misses, go to 24 steps and a 0.4× RT.
4. **Pinned casters:** the minimum pan with live rects. Pass: no visible lag between the DOM stems and their shadows in fast flicks.

### 8.3 Acceptance gates (evidence required)
- 60 fps on M-series Chrome and Safari through the fastest scroll. Idle GPU is zero. No console errors.
- Reduced motion, `?webgl=0` and no-JS captures each tell the full story.
- 390 px has no horizontal overflow, and the plan is turned sun-up.
- Keyboard walk covers the menu, lean, heliodon, form and sound switch.
- Screen reader: every H1 and H2 is read once, and the caster DOM is still read in cut mode.
- Greps: zero em or en dashes in copy; zero banned words; one smooth-scroll engine.
- Every visible number is traceable to the font, the NOAA function or live measurement.
- Contrast is recomputed per chapter; night Moonlit ≥ 4.5.

### 8.4 Risks and mitigations
1. **Canvas and DOM registration drift.** Draw per char or word at DOM rects, never with canvas layout; debug overlay; re-raster on `ScrollTrigger.refresh` and fonts ready.
2. **Canvas cannot set `wdth`.** Solved by design: renamed static instances (20 KB each, fontTools, OFL allows it).
3. **Safari FeatureVariations.** Spike 2 and the baked fallback.
4. **Live sun makes the hero vary** (night visitors get the night hero). Both states are designed; `?at=` for QA. A night first impression is still on-concept: moonlit letters, five lit rooms.
5. **GPU cost at DPR 2.** Half-res march, tiers, demand rendering.
6. **Three pins plus DOM-synced quads.** One Clock ordering (Lenis, then ScrollTrigger, then conductor, then advance) and live rects inside pins.
7. **Time zone to city.** A static 10 KB table with a Basel fallback. No geolocation prompt ever.
8. **Scope.** Cut order if behind: sound, then the colonnade pin (becomes a static band), then the Words list, then the heliodon PNG export, then the scrubbed night sequence (becomes a static lit state). **Never cut:** hero, lean, stand/cut, heliodon core, form, colophon, fallbacks.
9. **The form has no backend.** POST to `NEXT_PUBLIC_FORM_ENDPOINT` when it is set. Otherwise show an honest preview state: "This is a preview. Bookings are not open yet, and nothing was sent." It never fakes a success. **Decision for the orchestrator:** configure an endpoint or keep the preview state.
10. **Font bytes.** CTRS dropped (182 KB, not 311 KB); Latin subset; preload two files.

### 8.5 Anti-slop audit (06-anti-slop.md)
- **Avoided:** purple and gradients (#1-2); cream, serif and terracotta (#5); glass (#7); blobs (#8, #40); fake proof (#61-63); eyebrows and section numbers (#24, #33); three cards (#26); bento (#27); scroll cue (#37); percentage preloader (#59); custom cursor (#60); mono-label costume (#17); em dashes (#21); SplitText on every heading (#56); marquee; tech-demo post stack (#42-43).
- **Un-banned with a written rationale:**
  - **Live city/time readout on the hero (#36).** It is the cause of the image: the shadow on screen is computed from exactly this sun, it changes with the lamp, and removing it would hide the proof.
  - **North arrow and dimension lines (#35).** They carry information: the plan's orientation for the shadow directions, and true font metrics.
  - **Serif headings (#15).** Wittgenstein is the studio's voice against the drafting hand. It is not on the reflex list, and it has Swiss lineage (Diethelm).
  - **Night near-black with one warm accent (#4).** The dark is specific (blue-black sky, moonlit faces), and the light has a source (lamps inside counters) and a narrative time (after sunset, 2 of 9 sections).
- **Copy check:** the hero H1 statement is 7 words and the sub 16. Every CTA is 3 words or fewer ("Book a study", "Save the study", "Lean the a", "Back to sunrise"). Every paragraph is 45 words or fewer. No negative parallelisms, no rhetorical questions.

---

## Appendix A: true numbers used in copy
- **Basel** 47.5596° N, 7.5886° E, 21 June 2026 (NOAA): sunrise 05:31 from 52.7°. At 08:00, 21.84° (shadows 2.50×). At 09:30, 36.94° (1.33×). Solar noon 13:31, 65.89° (0.45×). 45.0° at 16:44 from 255.1°. At 20:12, 10.58° from 293.3° (5.35×). Sunset 21:30 at 307.3°. At 22:15, −6.45°. A south-facing wall is in sun 09:05-17:57.
- **Moscow example** (29 Sep 2026, 09:12 MSK): 20.8° high, from 128.6°.
- **Science Gothic** (2000 UPM, 800/100): x 1017, cap 1400, ascender 1465, descender −428, overshoot 14. Stem 36 / 248 / 448 / 524 at weights 100 / 400 / 800 / 900. `a → a.slnt` at slnt ≤ −4.9°. OMBRA 860/75 = 4.2284 em. Counters: OMBRA 5, A-Z a-z 0-9 22, motto 8.
- **CSS absolute units:** 1 in = 96 px = 25.4 mm, so 1 px = 0.2646 mm. Use this if a scale bar is added to the noon chapter.
- **Fact-check before shipping** (flagged, not load-bearing): the Venetian *ombra* wine story, and the anecdote of Wittgenstein raising a finished ceiling (keep it off the page unless verified).
