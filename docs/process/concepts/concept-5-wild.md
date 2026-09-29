# Concept 5 (Wildcard): NIGHTNOON

> **One sentence:** a landing page that goes through a total solar eclipse. Scrolling moves the Moon. The light on the page is the light on the ground. Every second of darkness is a seat you can claim.
>
> **Design read:** a *scheduled-phenomenon page* (a new genre). It does not depict an event. It runs the event on the visitor's screen, to the second, and sells places inside it. The audience is design-literate adults who have never seen totality. The language is deadpan scientific: 80% daylight on a white sheet, 20% night. The aesthetic family is "precise dream": physically real surrealism under Swiss-grade instrumentation.
>
> Author: creative direction, concept 5 of 5. Date: 2026-09-29. Every number in this document is either computed from primary data (NASA Besselian elements, PyEphem) or cited. Section 12 lists sources and caveats. Everything else (dates of stay, inclusions, 383 seats) is product spec of the fictional offer, not a claim about the world.

---

## 0. Why this is the wildcard (and why a jury has not seen it)

1. **The page does not show an eclipse; it undergoes one.** Most eclipse microsites show photos, maps and countdowns. Ours treats the browser viewport as a patch of ground in Egypt's Eastern Desert at 25°29.6′N 33°13.2′E. Scroll position is the clock. The light that falls on the type, the UI and the cursor's world is computed from how much of the Sun is uncovered at that second. At 13:03:26 the page goes dark: the UI flips to night and the corona appears. At 13:09:49 daylight returns *from the other side*.
2. **The most surreal images are real physics:** hundreds of crescent-shaped suns on the ground, pale shadow bands rippling across a white sheet, Baily's beads, the diamond ring, sunset on every horizon at once, Venus three degrees from a black Sun. There is no image generation and no photography, so everything is a pinhole-optics or radiative shader. The honest-asset rule becomes the concept: *nothing here is a picture of the eclipse; everything is the eclipse computed.*
3. **The conversion is inside the art.** Totality at the camp lasts 6 min 22.6 s. The expedition has 383 seats, one per second, and seat 383 is six tenths of a second long. You choose your second on a ribbon that replays totality second by second, and the ticket you download is rendered at your exact second.
4. **It is not a "space site".** It has no starfield, no spinning planet and no galaxy particles. Four fifths of the page is warm daylight on a white cotton sheet, and the sky appears for one act. The one planet visible near the Sun (Venus) sits at its computed position.
5. **It has wit.** "We are a travel company with one destination. It is 258 km wide, it moves at 2,400 km/h, and it arrives at 13:03:26." The name, the palindrome in the wordmark, "plan accordingly" about 2114: the voice has dry humour, which juries remember (cf. Oryzo, 02-research §2.1).

**Trends used (01-research):** micrographics that are true and live (1.6), procedural shader art as brand material (1.2), living wordmark (1.10), surreal/liminal done procedurally (1.16), calm editorial pacing (1.15), sound as a layer (1.14), authorship colophon (1.18). **Trends refused:** dithering/ASCII, glass, bento, neon-on-black, generic blobs, particle galaxies.

---

## 1. Brand and offer

| | |
|---|---|
| **Name** | **Nightnoon** |
| **Slug** | `nightnoon` (free on npm; rename project folder, `package.json` name, metadata) |
| **Why the name** | Totality at the camp begins at 13:03:26 EEST, which is **exactly ten minutes after true solar noon** there (Sun transit 12:53:26 EEST, computed). So "night at noon" is literally true. The word also carries the wordmark mechanic: **"noon" contains two o's (Sun and Moon), and "noon" is a palindrome.** As the page scrolls, the Moon-o passes through the Sun-o and ends on the other side, yet the word still reads "noon". (Prior art check: a 1965 Jimmy Ernst painting, a song and a tiny TTRPG imprint use the word. There is no well-known brand.) |
| **What it is** | A fictional expedition house with one departure: a tented camp at the point of greatest eclipse of the **total solar eclipse of 2 August 2027**, in Egypt's Eastern Desert, about 60 km south-east of Luxor. There are 383 places. |
| **Audience** | Curious, design-literate adults (25-60) who have heard "eclipse of the century" and never stood in totality; the kind of person who books one extraordinary trip a decade. Secondary audience: the jury. |
| **Primary conversion** | **"Claim a second"**: pick one of the 383 seconds of totality on the ribbon, enter name and email, and join the allocation list. The expedition "writes once, in March 2027, with dates and the price". |
| **Micro-conversions** | (a) **Download your ticket** (PNG rendered from the canvas at your second, with your word written in crescent suns). (b) **Add to calendar** (.ics with the real contact times). Both are honest and useful whether or not the trip exists. |
| **Honesty mode** | The build reads `NEXT_PUBLIC_FORM_ENDPOINT`. If present, it POSTs JSON (Formspree-style). If absent, the site runs in **demo mode**: success copy says "marked as yours in this browser", a small line under the submit button says "Demo build: nothing leaves this browser.", and the colophon says the site is a design study. It has no scarcity counter, no "seats left" and no fake claimed seconds. |

**Tone of voice.** Deadpan, exact, and slightly amused by its own precision. It uses short declaratives and physical verbs (fall, cool, break, flip, return). Numbers are real, and they are the jokes. The spelling is British English throughout ("centre", "colour").

---

## 2. Core metaphor and world rules

**The page is a white sheet laid on the ground.** Eclipse watchers really do this: a white sheet catches shadow bands in the last minute before totality. Everything is projected onto our sheet: light through the leaves above (sunflecks), which become crescents as the Moon bites the Sun; the pale ripples of shadow bands; then nothing. At totality the camera **looks up** from the sheet, past the orange horizon, to the black Sun. After third contact it looks back down, and the crescents on the sheet face the other way.

**World rules (non-negotiable; they keep the piece coherent):**

1. **Scroll is the clock.** Eclipse time is a pure, piecewise-linear function of scroll position (`worldSpec`, section 3). The same scroll position always produces the same state: forwards, backwards, after a jump or after a reload. Time is never eased; only the camera is.
2. **Light is computed, never chosen.** The sunlight on the sheet is the sum of pinhole images of the partially covered Sun. Sunflecks do not dim as the eclipse deepens; **they thin**, because each pinhole image keeps its surface brightness while its area shrinks. That is physically correct and it is the look. Eye adaptation (exposure) happens in the final pass.
3. **Copy only lives in stable light.** No paragraph is on screen while the light changes by more than about 10%. The two big transitions (C2, C3) are wordless. The sheet never renders darker than `--c-shade-deep` (#8F9BA3) while copy is on it, which keeps a 6.39:1 floor for ink text.
4. **One theme switch, earned.** The DOM is day-themed until the exact frame of second contact, flips to night, and flips back at third contact. This is the page's only theme switch, and the Sun authors it (rulebook 13, "Dual theme").
5. **The pointer is wind.** In daylight the pointer moves the leaves: the gaps move, the flecks swim, and **the crescents stay crescents**, because they are images of the Sun, not of the gaps. In totality the pointer does nothing except operate the ribbon. Stillness is rewarded (hidden dark adaptation, section 5).
6. **Only the corona is invented.** Times, positions and planets are computed. The corona's shape is procedural, seeded per visitor, and labelled as a guess, because no eclipse table contains it.

---

## 3. Narrative arc: four contacts, nine sections

The four eclipse contacts are a real sequence, so naming chapters by them is content, not decoration (rulebook 10 allows numbering real sequences).

### 3.1 worldSpec (single source of truth for time, pins, look and theme)

Times are local at the camp (EEST = UTC+3), computed from NASA Besselian elements (ΔT = 76.0 s). Obscuration is the share of the solar disk covered, from `obscuration()` (section 8.6).

| # | id | Eclipse time (start → end) | Covered | Scroll length | Pin | Camera | Theme |
|---|---|---|---|---|---|---|---|
| 0 | `intro` | 11:41:36 (C1) → 12:44:00 | 0 → 72% | time-lapse, 1.4-2.4 s | none | sheet | day |
| 1 | `hero` | 12:44:00 → 12:48:00 | 72 → 78% | 100svh | none | sheet | day |
| 2 | `camera` | 12:48:00 → 12:55:00 | 78 → 89% | 130vh | none | sheet | day |
| 3 | `timetable` | 12:55:00 → 13:00:00 | 89 → 96% | 110vh | none | sheet | day |
| 4 | `strange` | 13:00:00 → 13:03:10 | 96 → 99.9% | 120vh | none | sheet (dimming) | day |
| 5 | `totality` part 1: C2 | 13:03:10 → 13:03:40 (C2 13:03:26) | → 100% | pin A, 0 → 0.38 | **A** | sheet → **look up** | day → **night at C2** |
| 6 | `totality` part 2: 383 seconds | 13:03:40 → 13:09:10 | 100% | pin A, 0.38 → 1.0 (390vh total) | **A** | sky | night |
| 6b | `claim` (form, in flow) | 13:09:10 → 13:09:30 | 100% | 70vh | none | sky | night |
| 7 | `return` (C3) | 13:09:30 → 13:25:00 (C3 13:09:49) | 100 → 90% | pin B 110vh + 40vh | **B** | sky → **look down** | night → **day at C3** |
| 8 | `plainly` | 13:25:00 → 14:20:00 | 90 → 3% | 120vh | none | sheet | day |
| 9 | `fourth` (footer) | 14:20:00 → 14:27:42 (C4) | 3 → 0% | 100svh | none | sheet | day |

The total is about 1,290vh. Pins cover 500vh, and that is the heart of the piece. Exactly two pins (A, B), within the 2-3 maximum.

**Keyframes inside the pins.** Time stays a pure, piecewise-linear function of progress. Flat segments are allowed: time holds while the camera pans.
- **Pin A** (progress → EEST): 0.00 → 13:03:10 · 0.10 → 13:03:15 · 0.14 → 13:03:18 · 0.24 → 13:03:18 (held during the look-up pan) · 0.30 → 13:03:24 · **0.32 → 13:03:26 (C2)** · 0.38 → 13:03:40 · 1.00 → 13:09:10 (ribbon playback).
- **Pin B:** 0.00 → 13:09:30 · 0.15 → 13:09:47 (west-limb chromosphere, first bead) · **0.20 → 13:09:49 (C3)** · 0.45 → 13:10:05 (look-down pan ends) · 1.00 → 13:18:00. The unpinned tail runs 13:18:00 → 13:25:00.
- Everywhere else, one linear segment per section, as in the table.

Reference curve (computed): 12:36 59.2% · 12:48 77.6% · 12:55 88.6% · 13:00 96.1% · 13:02 98.75% · 13:03 99.76% · 13:15 93.5% · 13:30 69.7% · 14:00 25.4% · 14:15 8.2%.

### 3.2 Section by section

Layout families are all different (nine families, none repeated). They are marked **[F1..F9]**.

---

#### Section 1 · `hero`: "Six minutes of night at noon." [F1: full-bleed canvas + painted display type, asymmetric left]

- **Purpose:** in three seconds, say what, where and when, and show something only this site can show: a sheet covered in crescent suns, with the headline painted on it and the crescents crawling over the letters.
- **Layout, desktop (1440×900):** the canvas is full-bleed. A 12-column grid, 64px gutters. The H1 spans columns 1-10, three lines, left-aligned, starting 17vh from the top (below the 72px nav; this fits 900px height with sub-line and CTA). The sub-line and CTA sit in columns 1-5 under the H1. Columns 10-12 are empty sheet: the crescents are the content there. The nav has the wordmark top-left, the clock centre, and Sound plus CTA on the right.
- **Layout, mobile (390×844):** H1 in 4 lines at 72px ("Six / minutes / of night / at noon."), set in the top 45% of the screen. Sub-line under it. The CTA is a full-width 56px button pinned in the thumb zone (bottom 16px). The clock moves to a small bottom-left readout above the CTA. Canopy cells are 1.4× larger, so fewer, bigger crescents.
- **Copy:**
  - H1: **Six minutes of night at noon.**
  - Sub (17 words): **Egypt, 2 August 2027. An expedition into the Moon's shadow: 383 seats, one per second of darkness.**
  - Primary CTA: **Claim a second**. Secondary text link: **Add to calendar** (downloads .ics).
- **Motion:** intro choreography (section 4). After the intro, the only motion is the light: slow canopy sway (0.12 Hz, seeded) plus pointer gusts. Scrolling through the hero advances 12:44 → 12:48, and the bite visibly grows on every fleck.
- **WebGL:** sheet mode, painted type (H1 is mask 0), card off, bands off.

---

#### Section 2 · `camera`: "Every gap is a camera." [F2: interactive instrument split]

- **Purpose:** explain the crescents (pinhole optics) and hand the visitor the first participatory moment: **Write with the Sun** (signature moment 1).
- **Layout, desktop:** the H2 is painted on the sheet (mask 1) in columns 1-7, with the body under it in columns 1-5. Columns 7-12 hold **the card**: a DOM panel in sunlit card colour (`--c-sun`, 0px radius, 1px ink hairline) showing a 48×7 dot grid (8 characters × 6 columns). Above it sits the labelled text input. To the right and below the card, on the sheet, the **card's shadow** is rendered by the canvas: a darker rectangle of shade with a crescent Sun inside every punched hole. Your word is written in crescent suns.
- **Layout, mobile:** stacked in this order: H2, body, card (input + grid), then the projection full-width below (the `data-projection` rect).
- **Copy:**
  - H2: **Every gap is a camera.**
  - Body (35 words): **A small hole in any shade projects a picture of the Sun. During an eclipse, every gap between the leaves projects a crescent, upside down. A card with a few holes does the same.**
  - Input label: **Punch a word into the card**. Helper: **Up to 8 letters or numbers.**
  - Button: **Clear the card**. Aside, small: **On the day, a colander works too.**
  - Default word: **NOON** (a palindrome, which pays off later).
- **Motion:** the card enters like something being held up (y 24px → 0, rotate −1.5° → 0, 700ms `arrive`). Typing punches holes instantly (grid dot → shade dot, 120ms), and the matching crescent fades in on the sheet after 80ms. Scrolling through the section thins every crescent, including the ones spelling your word.
- **WebGL:** sheet mode plus `cardLight()` (bitmap lookup, section 8.4). The projection rect is synced from the DOM `[data-projection]` element in document space.

---

#### Section 3 · `timetable`: "Predicted to the second." [F3: full-width proportional data graphic + definition list]

- **Purpose:** credibility and specificity. The strangest afternoon of the decade is already scheduled, and the page proves it with real numbers computed live.
- **Layout, desktop:** the H2 and body sit top-left (columns 1-6). Across the full width (64px gutters) is a **proportional time axis** from C1 (left edge) to C4 (right edge), 2 h 46 min wide. Totality (6 min 22.6 s = 3.8% of the axis, about 50px at 1440) is a small solid ink block in the middle. This is the insight: *look how short it is.* Labels hang above and below in Datatype. A hairline "now" marker moves along the axis, synced to the page clock. Under the axis sits a 3-column definition list of place and facts (small type). It is a data table, not stat tiles.
- **Layout, mobile:** the axis becomes vertical along the left edge (C1 top, C4 bottom), with labels to the right. The definition list becomes one column.
- **Copy:**
  - H2: **Predicted to the second.**
  - Body (28 words): **This eclipse was already in a book of eclipse tables printed in 1887. Here is the timetable at our camp, computed in your browser from NASA's Besselian elements.**
  - Timetable (EEST, with UTC in a second column): First contact **11:41:36** (08:41:36 UTC) · Second contact **13:03:26** (10:03:26) · Maximum **13:06:38** (10:06:38) · Third contact **13:09:49** (10:09:49) · Fourth contact **14:27:42** (11:27:42).
  - Facts (definition list, `<dl>`):
    - Camp: **25°29.6′N 33°13.2′E. Eastern Desert, about 60 km south-east of Luxor.**
    - True noon: **12:53:26. Totality begins ten minutes later.**
    - Sun at mid-eclipse: **81.7° above the horizon.**
    - Totality: **6 min 22.6 s. The longest this century on easily reached land.**
    - Shadow: **258 km wide. It crosses the camp at about 2,400 km/h, nearly twice the speed of sound.**
    - Series: **Saros 136, eclipse 38 of 71.**
  - Footnote (small, muted): **Times computed for the camp with ΔT = 76 s. Real times can differ by a few seconds.**
- **Motion:** the axis draws on enter (scaleX 0 → 1 from the left, 900ms `arrive`). After that, the only motion is the "now" marker, which is live data. Rows highlight (weight 400 → 600, no colour) when the clock passes them.
- **WebGL:** sheet mode. Crescents are now thin; the light starts to cool (saturation 1 → 0.9).

---

#### Section 4 · `strange`: "Then the light goes strange." [F4: sparse narrow column in a large emptiness]

- **Purpose:** anticipation. The sensory minutes before totality, made physical on the page. A near-empty beat next to the dense timetable gives tempo contrast.
- **Layout, desktop:** the H2 sits at columns 6-11, top third. Under it is a single 36ch column of short lines at columns 7-11 (Pliant 26-30px, generous leading). The left half is empty sheet, where the crescents thin to hairlines.
- **Layout, mobile:** one column, lines at 22px, 48px between lines.
- **Copy:** H2 **Then the light goes strange.** Each line appears **at its own eclipse time**, when the page clock reaches it:
  - 13:00:00 **Colours thin out. The light turns silver.**
  - 13:01:00 **Shadows grow strangely sharp.**
  - 13:01:40 **The air cools.**
  - 13:02:15 **Birds fall quiet. Some go to roost.**
  - 13:02:45 **The sky darkens in the west first.**
  - 13:03:00 **Pale ripples may run across the sheet.**
  - 13:03:08 **The last crescents break into beads.**
- **Motion:** each line appears at its time with opacity 0 → 1 over 400ms and **no movement**, because things appear when they happen. Lines stay visible, and all are in the DOM from the start (reduced motion shows them all). The page's own light does the rest: exposure falls toward the floor, saturation 0.9 → 0.55, a cool steel tint rises, grain rises as light drops, and shadow bands fade in over the last 50 s (≤ 6% luminance modulation).
- **WebGL:** sheet mode with rising `uBands`. At 13:03:05-13:03:10 the flecks break into dotted arcs (pinhole images of Baily's beads, from the same limb-valley function as the sky).

---

#### Section 5 · `totality` part 1: second contact (wordless) [F5: pinned cinematic, canvas only]

- **Purpose:** signature moment 2. The page goes dark at 13:03:26.
- **Layout:** pin A begins. The canvas fills the screen. There is no copy: the clock alone reads the moment, plus a visually hidden description for screen readers.
- **Sequence (pin A progress 0 → 0.38; exact choreography in section 5):** the beads on the sheet go out, then the camera looks up (the sheet slides down, the horizon glows orange, the deepening sky slides in from the top), and the bright arc of Sun on the east limb breaks into Baily's beads. At 0.30 comes the diamond ring (the last bead flares). **At 0.32 = 13:03:26: C2.** The bead goes out and the whole UI flips to night in 180ms. A thin pink chromosphere flashes on the east limb, the wordmark's two o's lock into one ring, and the corona blooms outward. Venus appears up and to the right.
- **sr-only text:** "Second contact, 13:03:26. The last bead of sunlight goes out. The corona appears around the black Moon, and Venus is visible to the upper right."
- **Mobile:** same sequence; the Sun is placed at 34% screen height (portrait).

---

#### Section 6 · `totality` part 2: "One seat for every second of darkness." [F6: full-bleed sky + ribbon instrument]

- **Purpose:** the conversion core and signature moment 3 (**383 seconds**).
- **Layout, desktop:** the sky is full-bleed, with the black Sun and corona at the upper centre (Sun radius = 3.5% of viewport height; Venus at its true offset, about 11 solar radii up-right). The H2 and sub sit top-left in corona white. **The ribbon** spans the lower third, full width: 383 hairline ticks, each 1 second, with the last tick 60% width. It shows a "now" playhead (driven by scroll) and a "yours" marker (chromosphere pink). Above the ribbon's right end, a readout reads: "Second 187 · 13:06:32 at the camp".
- **Layout, mobile:** the ribbon becomes a **tuner dial**. The 383 ticks sit on a horizontally draggable strip (6px pitch, 2,298px long) under a fixed centre hairline. Drag to choose; the native range input stays underneath for keyboard and a11y.
- **Copy:**
  - H2: **One seat for every second of darkness.**
  - Sub (20 words): **Totality at the camp lasts 6 minutes 22.6 seconds. We rounded up, so seat 383 lasts six tenths of a second.**
  - Ribbon label: **Choose your second**. Honest note (small): **The corona is a guess. Its shape is not in any table.**
- **Behaviour:** scrolling plays totality forward (13:03:40 → 13:09:10), and the playhead walks the ribbon. Hovering or dragging a tick temporarily shows that second's sky: the Moon slides about 0.13 solar radii east-south-east across the Sun during totality. It covers the pink prominences on the east limb and uncovers new ones on the west, and the sky is darkest mid-totality. Click, tap or Enter selects **your second**. Default selection is a random second, seeded per visit, so the form is usable immediately.
- **WebGL:** sky mode; `uTotalityT` = hovered ?? selected ?? playhead.

#### Section 6b · `claim`: the form (in flow, still night) [part of F6]

- **Layout:** an inline row under the ribbon on desktop (Name, Email, Submit), stacked on mobile. The surfaces are opaque: umbra fields with a 1px corona hairline and no glass.
- **Copy:** labels **Name**, **Email**. Helper under email: **We write once, in March 2027, with dates and the price.** Submit: **Claim second 187** (dynamic, 3 words). Demo-mode line: **Demo build: nothing leaves this browser.**
- **States:** invalid email shows **That email looks unfinished.** Submitting: a pink hairline sweeps under the button left to right, like the shadow. Network error shows **Could not send. Try again in a moment.** Success shows **Second 187 is yours.** (demo: **Second 187 is marked as yours in this browser.**), a ticket preview, and the buttons **Download ticket** and **Add to calendar**.

---

#### Section 7 · `return`: "Daylight returns from the other side." [F7: painted statement, a long pause, one small line]

- **Purpose:** release, the exhale. The emotional closure of the phenomenon.
- **Sequence (pin B progress 0 → 1):** at 0.15 the chromosphere flashes on the **west** limb (right), a bead appears, and the second diamond ring flares. **At 0.2 = 13:09:49: C3.** The UI flips back to day in 180ms and the exposure overshoots (a brief 400ms over-bright, the eye still adapted to night). The camera looks down through the orange horizon to the sheet, where the crescents have come back **facing the other way**. Shadow bands ripple once more and fade.
- **Layout, desktop:** after the pin, the H2 is painted across columns 2-11 (mask 2), then a 40vh pause of empty sheet, then one small line alone at columns 8-12, right-aligned.
- **Copy:**
  - H2: **Daylight returns from the other side.**
  - Body (24 words): **At 13:09:49 a bead of sun appears on the west edge of the Moon, and the crescents on the ground face the other way.**
  - The pause line: **A longer one on easily reached land is due on 3 June 2114. Plan accordingly.**
- **Mobile:** H2 over 3 lines (the painted mask re-rasterizes per breakpoint); the pause line is left-aligned.
- **Motion:** the H2 lines rise from below a mask (the "horizon"), 1100ms `arrive`, stagger 0.12. The pause line has no animation.

---

#### Section 8 · `plainly`: "The expedition, plainly." [F8: static typographic definition list]

- **Purpose:** the practical offer, with no sky. Calm, readable, trustworthy. It is deliberately **static**: plain facts appear plainly, and that stillness is the design move.
- **Layout, desktop:** the H2 sits at columns 1-4 (sticky within the section). The definition list is in columns 6-12 as `<dl>` rows, each with a Pliant 15px term and an 18px/1.6 description, max 60ch, with 1px ink hairlines between rows at 12% opacity. The final CTA and calendar link close the list.
- **Layout, mobile:** single column; the H2 is not sticky.
- **Copy:**
  - H2: **The expedition, plainly.**
  - Where: **A tented camp at the point of greatest eclipse, 25°29.6′N 33°13.2′E, about 60 km south-east of Luxor.**
  - When: **Arrive 31 July 2027. Leave 3 August.**
  - Who: **383 guests, one per second of totality.**
  - Included: **Transfers from Luxor, three nights in the camp, meals, certified eclipse glasses, and a white sheet.**
  - Not included: **Flights. Clear skies are likely in August, but nobody can promise them.**
  - Heat: **August near Luxor is often above 40 °C. We plan the day around it.**
  - Eyes: **Watch the partial phases only through certified eclipse glasses (ISO 12312-2). Totality is the one time to look with bare eyes.**
  - Price: **In our letter of March 2027.**
  - CTA: **Claim a second** (scrolls back to the ribbon: the eclipse rewinds into night, which is the point). Link: **Add to calendar**.
- **WebGL:** sheet mode; the canopy sways again (the wind returns). The flecks fatten back toward round.

---

#### Section 9 · `fourth`: footer, "Fourth contact" [F9: full-width wordmark finale + link row]

- **Purpose:** closure. The Moon leaves the Sun, and the page ends as it began: with round sunflecks.
- **Layout, desktop:** first comes one line in Datatype + Pliant: **Fourth contact, 14:27:42. The Moon leaves the Sun.** Then the wordmark **nightnoon**, painted across the full width (mask 3, Strichpunkt Sans UltraExpanded ExtraBold, fit to width, about 210px at 1440), with sunflecks falling on it. The o-pair has separated again, in swapped order. Under it is the link row: **Colophon · Sound · Motion · Add to calendar · Claim a second**. A last small line: **Nightnoon is a design study. Eclipse data: NASA Besselian elements (F. Espenak, GSFC).**
- **Mobile:** the wordmark at 100vw minus 32px (about 60px), with links in a 2-column grid of 44px targets.
- **Motion:** pointer gusts over the wordmark make the flecks dance over the letters, echoing the hero. If sound is on, the cicadas return to full.

**Also designed:**
- **Colophon dialog** (focus-trapped, Esc closes): how the page works, data sources, fonts, frame budget, the corona disclaimer, demo notice. Full copy is in section 11.
- **Timetable menu:** the nav clock is a button that opens the chapter menu. The menu **is** the timetable: 11:41:36 First contact · 12:48 Every gap is a camera · 12:55 Predicted to the second · 13:00 The light goes strange · 13:03:26 Second contact · 13:03:40 Your second · 13:09:49 Third contact · 13:25 The expedition, plainly · 14:27:42 Fourth contact. Jumping uses `lenis.scrollTo` (1.4 s), so the eclipse fast-forwards or rewinds on the way. This is the Tracing Art principle (a progress indicator that expands into a chapter menu).
- **404 (`app/not-found.tsx`):** a still of the corona on umbra. **This page is in the umbra.** Link: **Back to daylight**.

---

## 4. Hero: first frame, first three seconds, pointer, the image

### 4.1 Static first frame (complete without JS or WebGL)
- SSR HTML: nav with the static wordmark (Sun-o and Moon-o overlapped at the 12:44 position), static clock **12:44:00**, the CTA, the H1 in ink, the sub-line, the CTA pair.
- The background is a **poster captured from our own shader** (`/public/posters/hero.webp`, ≤ 90 KB, 2560×1600, centre-cropped per breakpoint). Until capture exists, a CSS stand-in is used: `--c-shade` ground plus 24 sparse crescents built from paired `radial-gradient`s (sparse, so they never overlap).
- `html.js` is set by an inline head script. Only then are the H1 lines hidden for the reveal. Without JS, everything is visible. `prefers-reduced-motion` shows the final state immediately.

### 4.2 Intro choreography (first 3 seconds; the loader is first contact)

There is no separate loader screen and no percentage counter. **Loading progress drives the Moon's first bite.**

| t | What happens |
|---|---|
| 0.00 s | SSR poster and H1 are painted. The nav clock shows **11:41:36**, with "First contact" in 12px Pliant under it. |
| 0.00-0.25 s | JS boots. `boot.progress = 0.2·fonts + 0.5·shaders(compileAsync + one warm frame) + 0.3·firstFrame`. |
| ~0.25 s | The canvas fades in over the poster (240ms). Its first frame shows round sunflecks (pre-contact state), matching the poster. |
| 0.25-1.60 s | **Time-lapse:** eclipse time runs from 11:41:36 to 12:44:00. `shown = min(progress, elapsed/1.35s)`: the display chases the real progress and never overtakes it. Every fleck on the sheet is bitten at once, and the digits roll in tabular Datatype. |
| 1.30-2.30 s | H1 lines rise through line masks (SplitText `mask:'lines'`, `yPercent 110 → 0`, 900ms `arrive`, stagger 0.09). The sub-line fades (400ms). The CTA arrives last (opacity + y 8px, 500ms). |
| 2.30-2.60 s | **"The light lands on the words":** the DOM H1 crossfades to its painted twin (300ms), so crescents now fall across the letters. `lenis.start()`, `ScrollTrigger.refresh()`, `markReady()`. |
| failsafe | At 5 s, jump to the 12:44 state regardless. Repeat visits in the same session (sessionStorage, wrapped in try/catch) skip to the final state in 400ms. |

### 4.3 Pointer response
- **Desktop:** pointer velocity becomes a wind gust. `gust = damp(gust, clamp(pointerVelocity × 0.004, 1), λ=6)`, with direction equal to the pointer direction. The gust displaces the canopy sampling field, so flecks slide 4-20px, some blink out and new ones open. **Crescent orientation never changes.** It settles in about 1.2 s. The ambient sway is 0.12 Hz with an amplitude of 3px.
- **Touch:** drag is the gust. There is no gyroscope (it would need an iOS permission prompt).
- **Reduced motion:** no gusts, no sway.

### 4.4 The one image people will remember
**A pale sheet covered in hundreds of small crescent suns, "Six minutes of night at noon." painted across it in huge superextended letters, with the crescents crawling over the words.** The second image is the page going dark at 13:03:26: a pearly corona around a black Sun, and Venus beside it.

---

## 5. Signature moments

### SM1 · Write with the Sun (participatory)
- **Where:** section 2.
- **What:** type up to 8 characters, or click and tap dots on the card's 48×7 grid. The canvas projects the card's shadow onto the sheet with a crescent Sun in every hole. Your word appears **written in crescent suns**, and each one is upside down, as real pinhole images are. Scrolling ages them: the crescents thin with the eclipse.
- **Why it matters:** it is real optics, it is personal, it is shareable ("I wrote my name with the eclipse"), and it teaches people exactly what to do on the day (a card or a colander).
- **Build:** an original 5×7 dot-matrix glyph table (A-Z, 0-9, space, `. - ' !`, about 45 glyphs; our own data) produces a `Uint8Array(48×7)` and then a `DataTexture` (R8). The shader samples the bitmap only inside the card-shadow rect (section 8.4), at a cost of 9 texture reads.
- **A11y:** a native `<input type="text" maxlength="8">` with a visible label. The grid dots are `<button aria-pressed>` in a `role="grid"` for toggling. A polite, 500ms-debounced live region reads "The sheet shows NOON in 46 crescent suns."
- **Fallbacks:** without WebGL, a 2D canvas draws the same crescents (disk minus offset disk, `destination-out`). Under reduced motion it renders as a static result. The typed word also feeds the ticket.

### SM2 · 13:03:26: the page goes dark (scroll-scrubbed cinematic, pin A 0 → 0.38)
| pin A progress | Eclipse time | Picture |
|---|---|---|
| 0.00-0.10 | 13:03:10-13:03:15 | Sheet: fleck beads shrink to single points; shadow bands peak (6%). |
| 0.10-0.14 | 13:03:15-13:03:18 | The points go out. Overall exposure falls to the night floor. Cicadas stop (if sound is on). |
| 0.14-0.24 | 13:03:18 (held) | **Look up.** A vertical pan: the sheet slides down and out, and the horizon band passes through (orange glow on every side, a dark desert ridge silhouette). The sky slides in from the top: deep slate at first, darkening. |
| 0.24-0.30 | 13:03:18-13:03:24 | The Sun is a thin bright arc on the **east limb (left)**, breaking into **Baily's beads** through lunar valleys. The inner corona starts to show. |
| 0.30-0.32 | 13:03:24-13:03:26 | **Diamond ring:** a single bead with a bounded glare (≤ 25% of the viewport). |
| **0.32** | **13:03:26 C2** | The bead goes out. `html[data-light="night"]` is set: the nav, clock, CTA and focus colours flip in 180ms. The wordmark's o-pair locks into one ring. A **pink chromosphere** flashes along the east limb for about 1 s of eclipse time. |
| 0.32-0.38 | 13:03:26-13:03:40 | The corona blooms to full extent and the prominences glow. Venus fades in (magnitude −3.8, 2.84° from the Sun). Grain rises. The clock gains a second line: **Totality 00:00:14 of 06:22.6**. |

Reduced motion: no pin. Three stills (beads on sheet, diamond ring, corona) are rendered on demand and crossfaded in 200ms as each third of the section enters the viewport.

### SM3 · 383 seconds (participatory conversion)
- **What:** a ribbon of 383 ticks, one per second of totality. Scroll plays it; hover or drag scrubs it. For each second the sky is re-rendered: the Moon's true position slides across the Sun, prominences are covered on one limb and revealed on the other, and the sky's depth shifts. You pick **your second**, enter name and email, and "Claim second 187".
- **The ticket (the artifact):** 1080×1350 PNG. The sky is rendered offscreen at your second (WebGL render target, then `readRenderTargetPixels`), composited in 2D with your word in crescent suns (from SM1, or your name initial if SM1 was skipped), plus: **Seat 187 of 383 · 13:06:32 EEST · 2 August 2027 · 25°29.6′N 33°13.2′E · Corona: a guess (seed 4417)**. Downloadable, shareable, honest (our own render).
- **Keyboard and a11y:** the ribbon is a styled native `<input type="range" min="1" max="383" step="1">` with `aria-valuetext="Second 187 of 383, 13:06:32 at the camp"`. Arrows move ±1, PageUp/PageDown ±10, Home/End go to the ends. The ticks are a decorative 2D canvas (`aria-hidden`).
- **Sound:** a soft watch-escapement click per second crossed while scrubbing, if sound is on.

### SM4 (hidden) · Dark adaptation, and the palindrome
- In totality, if the pointer and scroll stay still for 6 s, the eye "adapts" over 20 s: fainter stars fade in at their computed positions (Pollux, Castor, Procyon, Regulus; Mercury and Jupiter when the framing allows, as in the look-up pan). There is no text; attentive visitors find it. This is true to life: dark adaptation keeps improving over minutes.
- **noon:** the Moon-o travels from the right of the Sun-o, through it, to the left, as the Moon really crosses from west to east. The word still reads "noon" (Sun-o filled ●, Moon-o outlined ○, so "n●○n" at the start, a ring at totality, "n○●n" at the end).
- **Console signature** for the developer jury: it prints the Besselian elements and "Computed on your machine: C2 13:03:26 EEST (ΔT 76.0 s)".

---

## 6. Typography, colour, materials

### 6.1 Fonts (all verified in Next 16.3's `next/font/google` data; all SIL OFL 1.1)

| Role | Family | Source / license | Axes used | Why this face (and no other) |
|---|---|---|---|---|
| **Display** | **Strichpunkt Sans** | Google Fonts (added 2026-05), OFL 1.1 | `wdth 100-200`, `wght 400-900` | Superextended letterforms echo the shape of the thing we sell: the path of totality is a band 258 km wide and thousands of km long, and totality is a horizon event. Wide, heavy letters give the light **surface area to fall on**. It has zero template association (GF popularity rank near 1889). |
| **Painted display** | Strichpunkt Sans **ExtraExpanded ExtraBold** and **UltraExpanded ExtraBold** static instances | Downloaded from the GF CSS2 API (`css2?family=Strichpunkt+Sans:wdth,wght@170,800` returns static TTFs snapped to named widths, 87 KB each, verified). Convert with `pyftsubset <ttf> --unicodes=U+0020-007E,U+00A0-00FF,U+2032,U+00B0 --flavor=woff2` (OFL permits subsetting and conversion). | none (static) | The DOM twin and the 2D-canvas rasterizer must use **identical metrics**. Canvas 2D cannot set `wdth`, so painted headings use a static instance via `@font-face 'Nightnoon Painted'`. Ship `OFL.txt`. |
| **Text / UI** | **Pliant** | Google Fonts (2026-06), OFL 1.1 | `wdth 100-125`, `wght 100-900`, italic | A soft-geometric sans that stays calm next to the superextended display. Its width axis lets labels sit at 112 wdth to rhyme with the display without shouting. It is fresh. |
| **Data** | **Datatype** | Google Fonts (2026-03), OFL 1.1 | `wdth 50-150`, `wght 100-900` | Only for real data: the clock, times, coordinates, seat numbers, the timetable. Tabular figures, so the rolling clock never jitters. Never used as costume. |

```ts
// app/fonts.ts
import { Strichpunkt_Sans, Pliant, Datatype } from 'next/font/google'
import localFont from 'next/font/local'
export const display = Strichpunkt_Sans({ subsets: ['latin'], axes: ['wdth'], variable: '--font-display', display: 'swap' })
export const text    = Pliant({ subsets: ['latin'], axes: ['wdth'], style: ['normal', 'italic'], variable: '--font-text', display: 'swap' })
export const data    = Datatype({ subsets: ['latin'], axes: ['wdth'], variable: '--font-data', display: 'swap' })
export const painted = localFont({ src: [
  { path: '../public/fonts/strichpunkt-150-800.woff2', weight: '800', style: 'normal' },   // ExtraExpanded (headings)
], variable: '--font-painted', display: 'block' })   // block: the painted twin must never swap mid-rasterize
// UltraExpanded (footer wordmark) loaded the same way as a second family if the budget allows; else ExtraExpanded at 239px
```
Measured widths (from the TTFs, `hmtx`): the H1 in three lines ("Six minutes / of night / at noon.") has a widest line of 6.27em at ExtraExpanded, so it fits **up to 209px** in 1312px. On mobile, four lines have a widest line of 4.41em, so it fits up to **81px** in 358px. "nightnoon" at UltraExpanded is 6.12em, which is **214px** full-width at 1440.

**Scale (desktop 1440 / mobile 390):**

| Token | Face | Size | Setting |
|---|---|---|---|
| `--t-hero` | Painted Strichpunkt 150/800 | clamp(64px, 11.5vw, 176px) / 72px | line-height 0.9, tracking −0.01em, 3 lines desktop, 4 mobile (type-as-image override, rulebook §13) |
| `--t-statement` | Painted Strichpunkt 150/800 | clamp(40px, 7vw, 112px) / 44px | line-height 0.94, `text-wrap: balance` |
| `--t-h2` | Strichpunkt wdth 125 / 700 | clamp(32px, 4vw, 56px) / 30px | line-height 1.0 |
| `--t-lede` | Pliant wdth 100 / 400 | 26px / 21px | line-height 1.4, max 36ch |
| `--t-body` | Pliant 400 | 18px / 17px | line-height 1.6, max 62ch; on night: 1.65 line-height, +0.005em tracking, 420 weight (dark-surface compensation) |
| `--t-ui` | Pliant wdth 112 / 500 | 15px | sentence case, tracking +0.01em |
| `--t-data` | Datatype wdth 90 / 400 | 15px | `font-variant-numeric: tabular-nums` |
| `--t-clock` | Datatype wdth 80 / 300 | 17px nav; 88px in totality readout | tabular |
| `--t-wordmark` | Painted Strichpunkt 200/800 | fit-to-width | footer only |

Hard rules: no all-caps labels (the one exception is user-typed dot-matrix content). No eyebrows. No single-word accents. Italic only in the colophon, for titles of works (e.g. *Canon der Finsternisse*).

### 6.2 Colour: every colour is a light condition on 2 August 2027

| Token | Hex | Role |
|---|---|---|
| `--c-shade` | **#B3BDC2** | The sheet in shade, lit by blue skylight. The day ground. |
| `--c-shade-deep` | **#8F9BA3** | Darkest the sheet may render while copy is visible (contrast floor). |
| `--c-sun` | **#FFF3DC** | Direct sunlight on the sheet (shader). Text on dark buttons by day. Card surface. |
| `--c-ink` = `--c-umbra` | **#0D1528** | Ink by day (text, CTA fill). The sky at mid-totality by night (ground). |
| `--c-ink-muted` | **#3A4659** | Secondary text by day. |
| `--c-corona` | **#E8EDF2** | Text by night; corona highlight; CTA fill by night. |
| `--c-corona-muted` | **#95A3B8** | Secondary text by night. |
| `--c-chromo` | **#F2476E** | The chromosphere and prominences. **The only saturated UI colour, used at night only:** C2/C3 flash, your selected second, the submitting hairline, the ticket accent, the night focus ring. |
| shader only | `#F2A35B` horizon glow · `#070B15` Moon disk · `#FFD9AE` limb-darkened last crescent · `#9FB3CC` skylight tint | Never used in UI. |

**Measured WCAG contrast:** ink on shade **9.50** · ink on sun **16.54** · ink on shade-deep **6.39** · ink-muted on shade **4.99** · corona on umbra **15.43** · corona-muted on umbra **7.11** · chromo on umbra **5.11** · umbra on chromo **5.11** · chromo on shade **1.86 (so it is never used by day)**.

**Painted type keeps contrast by physics.** Light multiplies both ink and sheet, so their ratio survives every fleck. Ink albedo is tuned so that ink in shade renders about #0D1528 and ink in sun about #2A3550. Lit letter against lit sheet is about 11:1.

**Browser surfaces:** `::selection` by day is umbra background with sun text; by night, chromo background with umbra text. Painted headings get `::selection { color: var(--c-ink) }`, so the transparent DOM twin becomes visible when selected (a nice reveal). `caret-color` is ink by day and chromo by night. Focus ring: 2px solid ink with a 3px offset by day; 2px corona by night. `scrollbar-color` follows the theme. `color-scheme` switches with `data-light`. `theme-color` is `#B3BDC2`. Favicon: the crescent mark (● with ○ overlapping), an SVG plus a 32px PNG.

**Clusters avoided:** there is no cream ground (the ground is cool skylit grey), no serif, no terracotta, no purple glow, no neon accent on a neutral black (the night is a clearly blue umbra, and pink appears for seconds, at night only), and no beige/brass.

### 6.3 Materials and texture (every texture has a cause)
- **Cotton sheet:** a procedural weave at 2.5 CSS px pitch with 1.2% amplitude, visible only inside sunlight (it is multiplied by the sun term). Very low-frequency folds add ±2% light, so the page feels like cloth lying on sand.
- **Canopy shadow:** there are no blobs. Large-scale structure is only a density variation of flecks (where the leaves are thicker, fewer gaps). The sheet is mostly in shade, and the flecks are the heroes.
- **Grain is caused by low light:** amplitude = 0.018 + 0.05 × (1 − displayed light), animated at 24 fps. It is barely there at noon and visible at totality, like the eye or film in the dark. It lives in the final pass (one layer; no DOM grain on top).
- **Anti-banding:** an 8×8 Bayer dither of ±0.5/255 in the final pass, essential for the deep-blue sky gradients.
- **Corona:** pearly, with fine radial striation. The inner corona is warm white, the outer cool, and the Moon is a true dark disk (#070B15). There is **no bloom pass**: the glare is authored and bounded.

---

## 7. Motion language

### 7.1 Easing family (CustomEase, registered once in `lib/gsap.ts`)
| Name | Curve | Use |
|---|---|---|
| `arrive` | `M0,0 C0.16,1 0.3,1 1,1` = cubic-bezier(0.16, 1, 0.3, 1) | All entrances, line reveals, the card, the axis draw |
| `leave` | cubic-bezier(0.7, 0, 0.84, 0) | Exits (always faster than entrances) |
| `contact` | cubic-bezier(0.83, 0, 0.17, 1) | The look-up and look-down pans, the timetable-menu jump, state switches |
| `none` | linear | **Eclipse time.** Time is never eased; scroll owns it. |
`gsap.defaults({ ease: 'arrive', duration: 0.9 })`. No bounce, elastic or back easing anywhere.

### 7.2 Duration tokens
`--dur-tick 120ms` (feedback) · `--dur-state 220ms` (toggles, hovers) · `--dur-switch 180ms` (**the C2/C3 light switch**) · `--dur-appear 400ms` (lines appearing at their time) · `--dur-card 700ms` · `--dur-reveal 900ms` (masked lines) · `--dur-pan` is scroll-scrubbed · `--dur-jump 1400ms` (menu jumps via Lenis) · intro ≤ 2.6 s total. Line stagger is 0.09 s; the ribbon wave is 1ms per tick (0.38 s total).

### 7.3 How scroll feels
- **Lenis is the only engine** (existing `SmoothScroll` provider, lerp 0.085, wheelMultiplier 0.95), driven by `gsap.ticker`, with ScrollTrigger synced. Reduced motion: no Lenis, native scroll, stills.
- The page reads like a film with three speeds. Partial phases are brisk (minutes per screen), the approach slows (seconds per screen), and C2 is bullet-time (a few seconds of eclipse over 1.5 screens), so **the clock visibly slows as you approach contact**. Totality has dwell (6 min over 2.4 screens). Then the release is brisk again.
- There are two pins only (A: C2 + ribbon, 390vh; B: C3, 110vh). `anticipatePin: 1`, `invalidateOnRefresh: true`, pinned wrappers `100svh`.
- Every entrance is different (no uniform fade-up): hero masked lines; card held up; axis draw; lines that appear at their eclipse time; wordless pan; ribbon wave from the centre; horizon-mask rise; the static facts; the footer o-pair separating.

### 7.4 Cursor decision
The **native cursor stays** everywhere. There is no follower and no blend-mode blob. The pointer's creative role is **wind** (invisible, felt in the light). Contextual native cursors: `crosshair` over the card grid, `ew-resize` over the ribbon, `pointer` on controls. Hover states: buttons shift the fill 4% toward sun or corona and nudge the label 2px (no scale jumps). Links get an underline offset of 0.18em that grows to 0.26em.

### 7.5 Transitions between chapters
All transitions are **light**: eclipse phase, exposure, saturation and grain. There are two **camera** moves (look up at C2, look down at C3). There are no generic crossfades, no page wipes, and no View Transitions (the theme switch is scroll-authored, not an event).

### 7.6 Sound (opt-in, synthesized; `lib/audio/ambient.ts`)
- **Off by default.** The nav switch is `role="switch"` with the label "Sound" and a 3-bar live meter. **The meter follows the world, so it goes flat at totality.**
- Day bed: wind (lowpass noise around 700 Hz, slow LFO) plus a cicada band (bandpass noise around 5.5 kHz, amplitude-modulated at 40-60 Hz, gated into chirps). Its gain is √(uncovered sunlight).
- The approach: cicadas thin out, the wind drops, and a very quiet low drone rises (55 + 82.4 Hz, detuned).
- C2 is **the hush**: everything ducks within 1.5 s, leaving near-silence with a faint high sine shimmer. That quiet is itself the sound design.
- Ribbon ticks are a 2ms filtered click per second crossed, pitched by position.
- At C3 the drone releases and cicadas restart (as insects do after totality).
- All levels are driven by the same eclipse state as the shader, so image and sound are one instrument. Levels are set with `setTargetAtTime` (no zipper noise). Audio suspends when the tab is hidden and is never autoplayed.

---

## 8. WebGL plan

### 8.1 Architecture: one persistent canvas, one scene, two passes
Use the existing `StageRoot` / `Stage` (fixed, full-viewport, poster underneath, context-loss handling, PerformanceMonitor). There is no camera work in three.js; everything is full-screen quads in clip space.

```
per frame (one clock: gsap.ticker → Lenis → ScrollTrigger → conductor → R3F)
 1. conductor (CPU, <0.2ms): scroll → eclipse t → moonOffset, obscuration, light, look, night, bands, beads, flash, glare
 2. PASS W  "world"  → FBO_W (drawing-buffer × 0.5 high / 0.5 medium / 0.4 low; fixed until resize)
      sheet(docPx) and/or sky(p) depending on uLook; writes rgb = incident light (sheet) or radiance (sky), a = sheetness
 3. PASS F  "final"  → screen (full res)
      bilinear upsample FBO_W; albedo = mix(sheetAlbedo, inkAlbedo, typeMask) where a > 0;
      painted type (4 masks, full-res, doc-space rects); glare; exposure/tonemap; saturation; grain; Bayer dither; vignette 6%
```
- Use `useFrame(render, 1)` to take over rendering (priority > 0). Prefer the one-clock `advance` pattern (04-techniques Part 2). The current scaffold runs R3F's own loop (`frameloop` always/demand), so agent B either switches to `advance` or verifies there is no one-frame lag between the DOM clock and the canvas. The lag is visible exactly at the C2 flip.
- **No EffectComposer:** grade, grain, glare and dither live in PASS F (one draw call). `@react-three/postprocessing` stays uninstalled from the bundle.
- **Painted type:** each painted heading (hero H1, section 2 H2, section 7 H2, footer wordmark) is rasterized once per resize or font load. Use `document.fonts.load('800 100px "Nightnoon Painted"')`, then per-line boxes from a `Range` over the DOM twin, then `ctx.fillText` into an alpha `CanvasTexture` at DPR ≤ 2, stored with its document-space rect. The DOM twin gets `color: transparent` only when `html[data-webgl="ready"]`.

### 8.2 Uniforms (one owner each)
| Uniform | Type | Owner | Meaning |
|---|---|---|---|
| `uTime` | float | frame | seconds, for sway, bands and grain |
| `uRes`, `uDpr` | vec2, float | Stage | drawing-buffer px, DPR |
| `uScrollY` | float | `frame.scroll.y` | document offset, so sheet patterns are anchored to the document |
| `uMoon` | vec2 | conductor | Moon centre relative to the Sun, solar radii, **screen frame** (north up, east left) |
| `uK` | float | const | Moon/Sun apparent radius ratio **1.0812** (17.04′ / 15.76′, topocentric at the camp) |
| `uLight` | float | conductor | displayed light after adaptation (0 night ... 1 noon) |
| `uSkyLevel` | float | conductor | skylight in shade (falls with obscuration, floors at twilight) |
| `uLook` | float | pin progress | 0 sheet → 1 sky (the pan) |
| `uNight` | float | conductor | 0/1 with a 180ms transition at C2/C3 (mirrors `data-light`) |
| `uBands` | float | conductor | shadow-band amplitude (bell curves: C2 −50 s … C2, C3 … C3 +40 s) |
| `uBeads` | float | conductor | limb-valley emphasis near contacts |
| `uFlash` | float | conductor | chromosphere flash (about 1 s after C2, 1 s before C3) |
| `uGlare`, `uGlarePos` | float, vec2 | conductor | diamond ring intensity and position (the last or first limb point, opposite the Moon offset) |
| `uTotalityT` | float | ribbon / pin | 0..1 inside totality (hover ?? selected ?? playhead) |
| `uWind` | vec2 | pointer | damped gust (px) |
| `uCard`, `uHoles` | vec4, sampler2D | section 2 | card-shadow rect (document px) and 48×7 R8 hole bitmap |
| `uType0..3`, `uTypeRect[4]` | sampler2D, vec4 | paintedType | painted heading masks and document rects |
| `uSeed` | float | boot | corona seed (shown on the ticket) |
| `uAdapt` | float | idle timer | dark adaptation 0..1 (hidden stars) |
| `uVenus` | vec2 | const | Venus offset in solar radii (screen frame): **(+8.7, +6.5)** |

### 8.3 Key GLSL (original code; hash functions after Dave Hoskins, MIT)
```glsl
// Pinhole image of the partly covered Sun. p in solar radii of this image. Images are point-reflected (inverted).
// valley > 0 near contacts: lunar valleys let light through, so the thin crescent breaks into beads.
float pinholeSun(vec2 p, vec2 moon, float k, float soft, float valley){
  vec2  q    = p + moon;                                             // inverted Moon sits at -moon
  float kr   = k - valley * limbValleys(atan(q.y, q.x));
  float sun  = 1.0 - smoothstep(1.0 - soft, 1.0 + soft, length(p));
  float lit  = smoothstep(kr - soft, kr + soft, length(q));
  float limb = 1.0 - 0.6 * (1.0 - sqrt(max(0.0, 1.0 - dot(p, p)))); // limb darkening, u = 0.6
  return sun * lit * limb;
}

// Sunflecks: jittered cells (uCell ≈ 64 css px desktop, 90 mobile), 3x3 neighbourhood.
vec3 flecks(vec2 docPx){
  vec2 id = floor(docPx / uCell); vec3 acc = vec3(0.0);
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
    vec2 c = id + vec2(i, j);
    if (hash12(c + 7.3) > canopyOpen(c)) continue;                 // canopyOpen: 3-octave fbm + wind, 0.25..0.75
    vec2 centre = (c + 0.5 + (hash22(c) - 0.5) * 0.7) * uCell + gapDrift(c);   // leaves move the gaps
    float r    = uCell * mix(0.22, 0.48, pow(hash12(c + 3.1), 1.6));            // higher gap: bigger, softer image
    float soft = mix(0.04, 0.16, hash12(c + 9.2));
    float b    = mix(0.55, 1.0, hash12(c + 5.7));
    acc += b * pinholeSun((docPx - centre) / r, uMoon, uK, soft, uBeads * 0.004);
  }
  return acc * uSunTint;       // surface brightness constant: flecks THIN, they do not dim
}

// Lunar limb valleys (Baily's beads). ang = angle around the Moon centre.
float limbValleys(float ang){
  return 0.9 * pow(max(0.0, sin(ang * 37.0 + 1.3)), 24.0)
       + 0.7 * pow(max(0.0, sin(ang * 61.0 + 4.1)), 30.0)
       + 0.5 * pow(max(0.0, sin(ang * 23.0 + 2.7)), 18.0);
}

// Shadow bands: low contrast, slow, never flashing (≤ 6% luminance).
float shadowBands(vec2 p){
  float w = dot(p, normalize(vec2(0.8, 0.6))) * 0.045 - uTime * 2.2;
  float warp = fbm3(p * 0.004 + uTime * 0.15) * 4.0;
  return 0.5 * sin(w + warp) + 0.5 * sin(w * 1.7 - warp * 0.8);
}

vec3 sheetLight(vec2 docPx){                                      // incident light; albedo is applied in PASS F
  vec3 sky = uSkylight * uSkyLevel;
  vec3 sun = flecks(docPx);
  vec3 card = cardLight(docPx);                                   // x < 0 → outside card shadow
  if (card.x >= 0.0) { sky *= 0.55; sun = card; }                 // under the card: only the holes let sun through
  float weave = 1.0 + 0.012 * sin(docPx.x * 2.5) * sin(docPx.y * 2.5);
  float folds = 1.0 + 0.02 * (fbm3(docPx * 0.0015) - 0.5);
  return (sky + sun * weave) * folds * (1.0 + uBands * 0.06 * shadowBands(docPx));
}

// Sky around the eclipsed Sun. p in solar radii (screen frame, y up), Sun at origin.
vec3 skyRadiance(vec2 p){
  float r = length(p), a = atan(p.y, p.x);
  vec3 col = mix(uSkyZenith, uSkyLow, smoothstep(0.0, 1.0, -p.y / uFrameR));   // deep slate → lighter low sky
  // corona: K-corona falloff × seeded helmet streamers (broad at base, tapering) × fine striations
  float streamers = 0.0;
  for (int s = 0; s < 5; s++) { float ai = uStreamerAng[s]; float wd = uStreamerW[s] / (1.0 + (r - 1.0) * 0.9);
    streamers += exp(-pow(angDiff(a, ai) / wd, 2.0)); }
  float fine = mix(0.9, 1.1, vnoise(vec2(a * 160.0, log(r) * 6.0)));
  float corona = pow(max(r, 1.0), -2.6) * (0.45 + 1.4 * streamers) * fine * smoothstep(0.998, 1.02, r);
  col += uCoronaCol * corona * uCoronaGain * mix(1.0, 0.7, uTotalityMid);
  // chromosphere + prominences (pink), photosphere (partial phases), Moon with valley profile
  vec2 q = p - uMoon; float mr = uK - uBeads * 0.004 * limbValleys(atan(q.y, q.x));
  float inMoon = 1.0 - smoothstep(mr - 0.002, mr + 0.002, length(q));
  float chromo = smoothstep(1.035, 1.0, r) * step(1.0, r) * uFlash;
  float prom = smoothstep(0.64, 0.8, fbm3(vec2(a * 9.0 + uSeed, r * 18.0))) * smoothstep(1.09, 1.0, r) * step(1.0, r);
  float photo = (1.0 - smoothstep(0.998, 1.0, r)) * (1.0 - 0.6 * (1.0 - sqrt(max(0.0, 1.0 - r * r))));
  col += (uSunTint * photo * uPhotoGain + uChromo * (chromo + prom * uPromGain)) * (1.0 - inMoon);
  col = mix(col, uMoonDark, inMoon);
  vec2 dv = p - uVenus; col += uVenusCol * exp(-dot(dv, dv) * 180.0) * uStarVis;   // Venus, true offset
  return col;
}
```
- **Card light** uses a bitmap lookup: `q = (docPx - uCard.xy)/uCard.zw`. Outside, return `vec3(-1)`. Inside, for the 3×3 grid cells around `floor(q*vec2(48,7))`, read `uHoles`; for each lit cell, add `pinholeSun((docPx-centre)/r, uMoon, uK, 0.06, uBeads * 0.004)` with `r = 0.46 * cellWidth`. (`limbValleys` must be declared above `pinholeSun`.)
- **Look-up pan:** a vertical stack of sky (top), horizon band (orange `#F2A35B` glow over 12vh, a 1D-noise desert ridge silhouette in umbra) and sheet (bottom). Screen y is offset by `uLook × stackHeight` with `contact` easing on pin progress, plus 5-tap vertical motion blur scaled by pan speed.
- **Glare:** in PASS F, `uGlare * 1.0 / (1.0 + pow(d / r0, 2.0))` around `uGlarePos` (r0 = 1.2 solar radii), additive, clamped. There are no lens ghosts and no hexagons. Area above 50% intensity must stay ≤ 25% of the viewport.

### 8.4 Numbers the shader and UI need (computed; do not re-derive)
- Contacts at the camp (EEST): **C1 11:41:36 · C2 13:03:26 · max 13:06:38 · C3 13:09:49 · C4 14:27:42**. Totality 382.5 s by our computation; **cite NASA: 6 min 22.6 s**.
- Moon offset (solar radii, screen frame) at C2 is (+0.067, +0.046) and at C3 (−0.066, −0.047). The Moon crosses from upper-right (WNW) to lower-left (ESE). Before max, the remaining sky crescent is on the **east (left)** side, so sheet crescents have their lit part on the **right**. After max it is the reverse (the flip).
- Planets at mid-totality (PyEphem, 10:06:38 UT, camp): **Venus** 2.84° from the Sun, mag −3.8, offset **8.7 R west, 6.5 R north**, so on screen (+8.7, +6.5) R. **Mercury** 10.0°, mag −1.5, (+35.9, +14.1) R. **Jupiter** 21.6°, mag −1.6, (−84.1, −19.5) R. Stars: Pollux (+54.4, +42.8) R, Castor (+62.5, +60.1) R, Procyon (+68.7, −47.8) R, Regulus (−78.2, −19.8) R. (R = solar radius = 0.2627°. Screen frame: x = −east.) In the default frame only Venus is in view; the others appear in the look-up pan and under dark adaptation.
- Sun altitude: 71.6° at C1, 81.7° at max, 66.8° at C4. It is nearly overhead, which is why the page is **the ground**, not a wall: sunflecks on a horizontal sheet are nearly circular.

### 8.5 Performance budget (Apple Silicon M1-M3, 1440×900 @ DPR 2)
| Item | Budget |
|---|---|
| PASS W at 0.5 scale (1440×900 px buffer) | ≤ 1.5 ms (flecks: 9 cells × ~40 ops; sky: 5 streamers + 2 fbm3) |
| PASS F full res | ≤ 1.0 ms (1 upsample + ≤ 4 mask reads + grade) |
| JS per frame | ≤ 1.5 ms (conductor math is trivial; no React state per frame) |
| Draw calls | 2 per frame (3 during a ticket render) |
| Transfer | JS (three + r3f + drei subset + gsap + lenis) ≈ 330 KB gz; fonts ≈ 190 KB (3 variable subsets + 1 painted WOFF2); posters ≈ 5 × 60 KB; total **< 1 MB** |
| LCP | the SSR `<h1>` over the poster, < 1.5 s |

**Tiers** (existing `quality` store + PerformanceMonitor):
- **high:** DPR 1.75, W-scale 0.5, fbm 5 octaves, bands on, look-pan motion blur on.
- **medium:** DPR 1.35, W 0.5, fbm 3, blur off.
- **low / mobile:** DPR 1.25, W 0.4, cell 1.4×, fbm 3, corona streamers 3, no dark-adaptation stars.
- **calm** (`prefers-reduced-motion` or the Motion toggle): no Lenis, no pins, render on demand. Each section renders its canonical still (hero 12:44, camera 12:52, timetable 12:58, strange 13:03:05, totality 13:06:38, return 13:12, plainly 13:45, fourth 14:27:42), crossfaded in 200ms when a section becomes active. The ribbon still works (re-render on change).
- **static** (no WebGL2, error boundary, context loss without restore): posters per section (`hero`, `strange`, `totality`, `return`, `fourth`) as CSS backgrounds. Night sections get an umbra background. SM1 uses the 2D-canvas fallback. The ribbon and form still work, and the ticket is 2D-only.
- Pause when `document.hidden`; pause PASS W when the canvas is not visible (never here, since it is fixed). Clamp `dt` to 1/30.

**Posters:** a `?still=<section>` route mode renders the canvas at the canonical time with UI hidden and time frozen. The QA agent captures 2560×1600 screenshots (headless Chrome), exports WebP and commits them to `/public/posters/`. That makes them honest renders of our own shader.

### 8.6 The eclipse module (TypeScript; ported from the verified Python, output matches to 0.01 s)
`src/lib/eclipse/besselian.ts`: paste as is. The self-test output was C1 11:41:36, C2 13:03:26, max 13:06:37.9, C3 13:09:48.9, C4 14:27:41.5, totality 382.48 s.
```ts
// NASA Besselian elements, total solar eclipse 2027-08-02 (eclipse.gsfc.nasa.gov/SEsearch/SEdata.php?Ecl=+20270802)
const E = { t0: 10, dT: 76.0, tanF1: 0.0046064, tanF2: 0.0045834,
  x:  [-0.0197720, 0.5447123, -0.0000446, -0.0000092], y: [0.1600610, -0.2111582, -0.0001217, 0.0000038],
  d:  [17.7624702, -0.0101810, -0.0000040, 0], l1: [0.5305960, 0.0000138, -0.0000128, 0],
  l2: [-0.0154640, 0.0000137, -0.0000128, 0], mu: [328.422546, 15.002100, 0, 0] }
const R = Math.PI / 180, poly = (c: number[], t: number) => c[0] + t * (c[1] + t * (c[2] + t * c[3]))
export const CAMP = { lat: 25 + 29.6 / 60, lonE: 33 + 13.2 / 60, h: 150 }
export const K = 17.04 / 15.76                                   // Moon/Sun apparent radius ratio at the camp
const u0 = Math.atan(0.99664719 * Math.tan(CAMP.lat * R))
const RS = 0.99664719 * Math.sin(u0) + (CAMP.h / 6378140) * Math.sin(CAMP.lat * R)
const RC = Math.cos(u0) + (CAMP.h / 6378140) * Math.cos(CAMP.lat * R)
/** t = hours from t0 (TDT). Shadow axis offset (u,v) from the observer, Earth radii; penumbral/umbral radii there. */
export function shadow(t: number) {
  const d = poly(E.d, t) * R, H = (poly(E.mu, t) + CAMP.lonE - 0.00417807 * E.dT) * R
  const xi = RC * Math.sin(H), eta = RS * Math.cos(d) - RC * Math.cos(H) * Math.sin(d)
  const zeta = RS * Math.sin(d) + RC * Math.cos(H) * Math.cos(d)
  const u = poly(E.x, t) - xi, v = poly(E.y, t) - eta
  return { u, v, m: Math.hypot(u, v), L1: poly(E.l1, t) - zeta * E.tanF1, L2: poly(E.l2, t) - zeta * E.tanF2 }
}
/** Moon centre relative to Sun centre in solar radii, screen frame (north up, east LEFT, y up). */
export function moonOffset(t: number) {
  const s = shadow(t), sep = (2 / (s.L1 - Math.abs(s.L2))) * (s.m - Math.abs(s.L2)) + (K - 1)
  return { x: (-s.u / s.m) * sep, y: (s.v / s.m) * sep, sep }
}
/** Share of the solar disk covered, 0..1 (circle-overlap area). */
export function obscuration(sep: number, k = K) {
  if (sep >= 1 + k) return 0; if (sep <= k - 1) return 1
  const a = Math.acos((sep * sep + 1 - k * k) / (2 * sep)), b = Math.acos((sep * sep + k * k - 1) / (2 * sep * k))
  return (a - Math.sin(2 * a) / 2 + k * k * (b - Math.sin(2 * b) / 2)) / Math.PI
}
export const tOf = (hms: string) => { const [H, M, S] = hms.split(':').map(Number); return (H * 3600 + M * 60 + S - 3 * 3600 + E.dT) / 3600 - E.t0 }
export const clock = (t: number) => { let s = Math.round((E.t0 + t) * 3600 - E.dT + 3 * 3600); s = ((s % 86400) + 86400) % 86400
  const p = (n: number) => String(Math.floor(n)).padStart(2, '0'); return `${p(s / 3600)}:${p((s % 3600) / 60)}:${p(s % 60)}` }
// The clock ROUNDS to the nearest second, so it always agrees with the timetable and the copy
// (true C3 is 13:09:48.95: a floored clock would read 13:09:48 at the exact frame the page flips back to day).
```
`src/lib/eclipse/conductor.ts` maps each section's ScrollTrigger progress to `t = lerp(tOf(start), tOf(end), progress)` (worldSpec, section 3.1). It writes `stageUniforms`, the nav clock `textContent` (no React state), `--moon-x` for the wordmark, and `html[data-light]` from `t` crossing C2 or C3. It is a pure function of scroll, so reverse and reload are free.

---

## 9. Accessibility and usability (where winners lose points; we take them)
- **Semantics:** `header > nav`, `main > section[aria-labelledby]` × 9, `footer`. One `h1`. `h2` per section; section 5 has a visually hidden `h2` ("Second contact"). The canvas and posters are `aria-hidden`. Every visual event has a DOM text twin.
- **Clock:** a `<button aria-haspopup="dialog">` labelled "Timetable, 12:44:00 at the camp". The label updates at most once per 5 s. It is never `aria-live`.
- **Theme flip:** focus rings, selection and caret switch with it. The contrast floor is enforced (world rule 3). Under `forced-colors: active`, hide the canvas and show the DOM text.
- **Photosensitivity:** there is no repeated flashing. The two diamond rings are single, bounded luminance events (≤ 25% of the viewport). Shadow bands are ≤ 6% contrast and under 3 Hz. Under reduced motion there is no glare animation.
- **Keyboard:** everything is reachable in visual order. The ribbon is a native range. The card grid uses `role="grid"` with arrow keys. The timetable dialog traps focus and Esc closes it. Skip link: "Skip to Claim a second".
- **Touch:** targets are at least 44px. The tuner dial on the ribbon uses `touch-action: pan-y` on the strip wrapper and clears state on `pointercancel`.
- **Motion toggle** ("Motion: full / calm") in the footer and colophon writes `data-motion` and persists in localStorage (try/catch).
- **The eclipse glasses safety line** appears in section 8 and in the colophon.

---

## 10. Feasibility: build plan for about 4 hours of parallel agents

### 10.1 Workstreams (can start immediately; interfaces are fixed above)
| # | Agent | Deliverables | Est. |
|---|---|---|---|
| A | **Foundation and DOM** | Rename project to `nightnoon`. Tokens (`styles/tokens.css`), fonts (incl. the painted WOFF2 + OFL.txt), `content/copy.ts` (section 11), all 9 sections with final copy and layout (desktop + mobile), nav (wordmark SVG o-pair, clock button, Sound switch, CTA), timetable dialog, colophon dialog, footer, 404, metadata, OG image (static PNG from the hero poster), favicon. | 2.5 h |
| B | **Eclipse model and conductor** | `besselian.ts` (paste), `worldSpec.ts`, `conductor.ts` (ScrollTrigger per section → t → uniforms, clock, `data-light`, `--moon-x`), pins A/B, `ics.ts`, console signature, unit check script (compare 5 contacts). | 1.5 h |
| C | **Sheet shader** | PASS W sheet: flecks, canopy + wind, weave/folds, bands, beads-on-sheet, card light + bitmap texture; PASS F: upsample, painted type (rasterizer + rects), grade, grain, dither; `?still=` mode. | 3 h |
| D | **Sky shader** | PASS W sky: gradient, corona (seeded streamers), chromosphere, prominences, photosphere + limb valleys, glare, Venus + hidden stars, the look-up/look-down pan with horizon band. | 3 h |
| E | **Instruments** | SM1 card (dot-matrix table, input, grid toggles, 2D fallback), SM3 ribbon (range + tick canvas + tuner dial + hover preview), claim form (states, endpoint/demo), ticket renderer (offscreen sky render + 2D composite + download). | 3 h |
| F | **Motion, sound, QA** | Intro choreography (boot progress, time-lapse, SplitText reveals, painted crossfade), section entrances, calm-tier stills, sound engine + switch, tiers, poster capture, QA matrix (section 10.4). | 3 h (QA runs to the end) |

### 10.2 MVP line (ship even if everything else fails)
Hero crescent sheet with DOM H1 (painted optional) · SM1 with typed word · timetable · strange lines + light change · C2 flip + corona + Venus · ribbon + form + 2D ticket · C3 return with flipped crescents · plain facts · footer · nav clock + wordmark · reduced-motion stills · no-WebGL posters.

**Stretch, in cut order** (cut from the top first): hidden dark adaptation → sound → WebGL-rendered ticket (keep 2D) → tuner dial (keep native range) → look-pan motion blur → painted type (fall back to DOM ink) → shadow bands. **Never cut:** the crescents, the C2 flip, the ribbon + form.

### 10.3 Risks and de-risking
| Risk | Mitigation (with time boxes) |
|---|---|
| The crescent sheet looks like polka dots or cheap bokeh | **45-minute spike first** (agent C) in `?still=hero`, compared side by side with real photos of eclipse crescents under trees (reference only). Tune for overlapping crescents of varied size, soft edges, clusters, and a mostly-shade ground. **Kill criterion at T+1h:** if still not beautiful, switch to the "specimen" variant: fewer, larger, crisp crescents on a regular woven-shade lattice (graphic and still unique). |
| The corona reads as a neon ring on black | A pearly palette, no bloom pass, falloff r^−2.6, helmet streamers that taper, fine striations, and a true-dark Moon. Spike at T+0:30 in `?still=totality`. Blind review against the anti-slop rubric (≥ 7 for the act). |
| Painted-type alignment drifts from the DOM | Use the static instance font for both twins, per-line Range rects, and re-rasterize on resize and fonts. If any line misaligns by more than 1px at QA, fall back to DOM ink text; the concept survives. |
| Time-mapping bugs (jumps, reverse differs) | Time is a pure function of section progress; a unit check runs forward/reverse/jump; there is a dev overlay (t, section, obscuration, look, night). |
| Pins, the form and the mobile keyboard | The form is **outside** the pin (section 6b in flow); `ScrollTrigger.config({ ignoreMobileResize: true })`. |
| Contrast during light changes | World rule 3 plus the automated check: sample canonical stills and compute ink contrast against the rendered sheet under text boxes. |
| Mobile GPU | Low tier (W 0.4, fbm 3, larger cells). The whole scene is 2 draw calls. Test on a real iPhone if available. |
| Data accuracy | All numbers are computed from NASA elements in-page, or cited. The footnote states ΔT and "a few seconds". Copy numbers trace to section 12. |
| Scope creep | The MVP line and cut order above. Agents do not add effects outside this doc. |

### 10.4 QA gates (acceptance matrix, pass/fail with evidence)
- 60 fps on M-series Chrome and Safari during pin A scrub (Performance panel), no long tasks over 50ms after load.
- Reverse and forward give identical states at 13:03:26 and 13:09:49; a jump via the timetable menu lands correctly both ways; reload mid-pin restores.
- Contrast: all copy regions pass (≥ 4.5 body, ≥ 3 large) at the canonical stills in both themes.
- Reduced motion: no Lenis, no pins, stills per section, content complete. With no WebGL: posters, SM1 2D fallback, ribbon, form and ticket all work. With JS off: all copy readable.
- Keyboard walk: nav → hero CTA → card → timetable dialog → ribbon → form → footer. Visible focus in day and night.
- Copy greps: zero `—`/`–` in rendered strings; zero banned words (06-anti-slop §4A); zero `TODO`; no uppercase-tracked label styles.
- Console clean; `next build` passes; lint and typecheck pass; posters and OG present.

---

## 11. Copy deck (single source for `src/content/copy.ts`)

```
meta.title        Nightnoon · Six minutes of night at noon
meta.description  An expedition to the point of greatest eclipse near Luxor on 2 August 2027. 383 seats, one for each second of totality.
nav.cta           Claim a second
nav.sound         Sound
nav.clockHint     at the camp
hero.h1           Six minutes of night at noon.
hero.sub          Egypt, 2 August 2027. An expedition into the Moon's shadow: 383 seats, one per second of darkness.
hero.secondary    Add to calendar
camera.h2         Every gap is a camera.
camera.body       A small hole in any shade projects a picture of the Sun. During an eclipse, every gap between the leaves projects a crescent, upside down. A card with a few holes does the same.
camera.label      Punch a word into the card
camera.helper     Up to 8 letters or numbers.
camera.clear      Clear the card
camera.aside      On the day, a colander works too.
camera.live       The sheet shows {WORD} in {N} crescent suns.
timetable.h2      Predicted to the second.
timetable.body    This eclipse was already in a book of eclipse tables printed in 1887. Here is the timetable at our camp, computed in your browser from NASA's Besselian elements.
timetable.rows    First contact 11:41:36 | Second contact 13:03:26 | Maximum 13:06:38 | Third contact 13:09:49 | Fourth contact 14:27:42   (EEST; UTC −3 h)
timetable.dl      Camp: 25°29.6′N 33°13.2′E. Eastern Desert, about 60 km south-east of Luxor.
                  True noon: 12:53:26. Totality begins ten minutes later.
                  Sun at mid-eclipse: 81.7° above the horizon.
                  Totality: 6 min 22.6 s. The longest this century on easily reached land.
                  Shadow: 258 km wide. It crosses the camp at about 2,400 km/h, nearly twice the speed of sound.
                  Series: Saros 136, eclipse 38 of 71.
timetable.note    Times computed for the camp with ΔT = 76 s. Real times can differ by a few seconds.
strange.h2        Then the light goes strange.
strange.lines     13:00:00 Colours thin out. The light turns silver.
                  13:01:00 Shadows grow strangely sharp.
                  13:01:40 The air cools.
                  13:02:15 Birds fall quiet. Some go to roost.
                  13:02:45 The sky darkens in the west first.
                  13:03:00 Pale ripples may run across the sheet.
                  13:03:08 The last crescents break into beads.
c2.srOnly         Second contact, 13:03:26. The last bead of sunlight goes out. The corona appears around the black Moon, and Venus is visible to the upper right.
seconds.h2        One seat for every second of darkness.
seconds.sub       Totality at the camp lasts 6 minutes 22.6 seconds. We rounded up, so seat 383 lasts six tenths of a second.
seconds.label     Choose your second
seconds.readout   Second {S} · {HH:MM:SS} at the camp
seconds.note      The corona is a guess. Its shape is not in any table.
claim.name        Name
claim.email       Email
claim.helper      We write once, in March 2027, with dates and the price.
claim.submit      Claim second {S}
claim.demo        Demo build: nothing leaves this browser.
claim.invalid     That email looks unfinished.
claim.error       Could not send. Try again in a moment.
claim.success     Second {S} is yours.
claim.successDemo Second {S} is marked as yours in this browser.
claim.download    Download ticket
claim.calendar    Add to calendar
ticket.lines      Seat {S} of 383 · {HH:MM:SS} EEST · 2 August 2027 · 25°29.6′N 33°13.2′E · Corona: a guess (seed {SEED})
return.h2         Daylight returns from the other side.
return.body       At 13:09:49 a bead of sun appears on the west edge of the Moon, and the crescents on the ground face the other way.
return.pause      A longer one on easily reached land is due on 3 June 2114. Plan accordingly.
plainly.h2        The expedition, plainly.
plainly.where     A tented camp at the point of greatest eclipse, 25°29.6′N 33°13.2′E, about 60 km south-east of Luxor.
plainly.when      Arrive 31 July 2027. Leave 3 August.
plainly.who       383 guests, one per second of totality.
plainly.included  Transfers from Luxor, three nights in the camp, meals, certified eclipse glasses, and a white sheet.
plainly.excluded  Flights. Clear skies are likely in August, but nobody can promise them.
plainly.heat      August near Luxor is often above 40 °C. We plan the day around it.
plainly.eyes      Watch the partial phases only through certified eclipse glasses (ISO 12312-2). Totality is the one time to look with bare eyes.
plainly.price     In our letter of March 2027.
fourth.line       Fourth contact, 14:27:42. The Moon leaves the Sun.
footer.links      Colophon | Sound | Motion | Add to calendar | Claim a second
footer.small      Nightnoon is a design study. Eclipse data: NASA Besselian elements (F. Espenak, GSFC).
colophon          The page is a white sheet on the ground at the camp. One canvas and one fragment shader draw it live on your GPU.
                  The light follows the eclipse: the share of the Sun left uncovered at each moment, computed in your browser from NASA's Besselian elements (ΔT 76.0 s).
                  The crescents are pinhole images: discs of the Sun with the Moon cut out, turned upside down.
                  Venus, Mercury and Jupiter are placed where they will be, computed with PyEphem.   (ship this line only if the pan/SM4 stars ship; otherwise: "Venus is placed where it will be, computed with PyEphem.")
                  The corona is invented. Its real shape is not in any table.
                  Type: Strichpunkt Sans, Pliant and Datatype, under the SIL Open Font License.
                  No photographs, no stock images, no generated images.
                  Sound is synthesized in your browser and stays off unless you turn it on.
                  Look at the partial phases only through certified eclipse glasses.
404.h1            This page is in the umbra.
404.link          Back to daylight
```

---

## 12. Data appendix (sources, computations, caveats)

| Fact | Value | Source |
|---|---|---|
| Date, type | Total solar eclipse, Monday 2 August 2027 | NASA / F. Espenak plot SE2027Aug02T; Wikipedia |
| Greatest eclipse | 10:06:28.6 UT (ΔT 84.8 s in the plot), 25°29.6′N 033°13.2′E, Sun alt 81.7°, az 202.0° | NASA plot `eclipse.gsfc.nasa.gov/SEplot/SEplot2001/SE2027Aug02T.GIF` |
| Duration at greatest eclipse | **6 min 22.6 s** | NASA plot |
| Path width | **257.7 km** | NASA plot |
| Magnitude, gamma | 1.0790, 0.1419 | NASA plot |
| Saros | **136, member 38 of 71** | NASA plot |
| Umbra on Earth | U1 08:23:16.1 UT → U4 11:49:44.4 UT (**3 h 26 min**) | NASA plot |
| Besselian elements | t0 = 10.000 TDT, ΔT = 76.0 s, coefficients as in section 8.6 | `eclipse.gsfc.nasa.gov/SEsearch/SEdata.php?Ecl=+20270802` |
| Camp contacts (EEST) | 11:41:36 · 13:03:26 · 13:06:38 · 13:09:49 · 14:27:42; totality 382.5 s | **Our computation** (Python + TS port, both verified). Luxor city computed the same way is 10-13 s earlier than Wikipedia's table (different ΔT and elements), hence the "few seconds" footnote. |
| True solar noon at camp | 12:53:26 EEST (so C2 is +10 min 00 s) | PyEphem transit |
| Shadow speed at camp | 2,401 km/h in the fundamental plane, about 2,426 km/h on the ground, 674 m/s (≈1.9× the speed of sound in hot air) | Our computation from the elements |
| Longest on land | "the longest total solar eclipse on easily accessible land in the 21st century; a longer one will not occur until June 3, 2114" | Wikipedia, *Solar eclipse of August 2, 2027* |
| Printed in 1887 | Oppolzer's *Canon der Finsternisse* (1887) lists all solar eclipses 1208 BC to AD 2161 | Wikipedia *Canon of Eclipses*; Space.com "The original Mr. Eclipse" |
| Planets at mid-totality | Venus 2.84° (−3.8), Mercury 10.0° (−1.5), Jupiter 21.6° (−1.6), Mars 60.8° (+1.2) | Our computation, PyEphem 4.x, camp, 10:06:38 UT |
| Moon/Sun apparent radii | 17.04′ / 15.76′ (k = 1.0812) | PyEphem, topocentric |
| Egypt summer time | UTC+3 in August (reinstated 2023) | Consistent with Wikipedia's Luxor local times |
| Luxor heat | August mean maxima around 40-41 °C ("often above 40 °C") | general climate data; phrased conservatively |
| Eye safety | ISO 12312-2 filters for partial phases; bare eyes only during totality | standard AAS/NASA guidance |

Scratch computations: `scratchpad/eclipse.py`, `eclipse.mjs`, `obsc.py` in this session's scratchpad (the TS in section 8.6 is the canonical port).

---

## 13. Anti-slop audit (06-anti-slop.md, every family)

- **Colour and surface (#1-13):** no purple, no gradient text, a committed palette from real light conditions, no neon on neutral black (the night is umbra blue and pink is rare, at night only), no cream + serif + terracotta, no glass (form fields are opaque), no meaningless blobs (the shader *is* the concept: pinhole optics and a radiative sky), grain caused by low light, no accent strips, browser surfaces themed.
- **Typography (#14-22):** no reflex fonts (Strichpunkt Sans, Pliant and Datatype all arrived on Google Fonts in 2026). Mono-like data only for real data. No single-word accents. No `<br>` tricks (lines set by measure). No dashes (checked in section 11). No middle-dot chains (max one per line, in data readouts only).
- **Layout (#23-39):** no centred pill hero, no eyebrows, no canonical SaaS skeleton, no three cards, no bento, radius 0 everywhere, no nested cards, nine distinct layout families, no split-header, numbers only for a real sequence (contacts, seats), no stat banner (facts sit in a `<dl>` table), no decorative grid lines, no hero-bottom strip, no scroll cue (the thinning crescents and the clock pull you down), a designed mobile composition.
- **3D (#40-51):** no chrome blob, no particle galaxy, no starfield (only computed bodies), 2 draw calls with no post stack, no default bloom, no stock 3D, the canvas *is* the page's content, a tiered fallback, the pointer changes the world (wind), no fake UI, no SVG illustrations (only the ●○ brand mark and data graphics), no emoji, no stock photography.
- **Motion (#52-60):** one authored focal moment per act and varied entrances, loops only in the world (sway, grain), a custom ease family, no char-by-char split, no parallax-on-everything, Lenis only, the loader is act zero and under 2.6 s, native cursor.
- **Content (#61-68):** no social proof, no testimonials, no invented metrics (every number is computed or cited), no pricing/FAQ filler, a name with a true meaning, no fake status, a footer with working links only, every state designed.
- **Copy (§4):** zero banned words. No "not X, it's Y". No rhetorical questions. Specific nouns (sheet, colander, bead, 1887, 2114). A single deadpan register throughout.

**Self-score (blind rubric target):** concept commitment 9, typography 8, colour/material 9, composition 8, motion direction 9, WebGL originality 9, copy voice 9, craft (planned) 8. The target is ≥ 8.5 overall with no act below 7. The weakest act to watch is section 8 (static by design): it must be typeset perfectly, or it drops the average.
